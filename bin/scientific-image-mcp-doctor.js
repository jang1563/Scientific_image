#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`scientific-image-mcp-doctor ${packageJson.version}

Verify that the Scientific Image MCP stdio server can start and answer the first calls a Claude/Codex client needs.

Usage:
  scientific-image-mcp-doctor [--server <path>] [--timeout-ms <ms>]

Options:
  --server <path>      MCP server script to verify. Defaults to this package's bin/scientific-image-mcp.js.
  --timeout-ms <ms>    Per-process timeout. Defaults to 5000.
  --help, -h           Show this help.

Examples:
  scientific-image-mcp-doctor
  node bin/scientific-image-mcp-doctor.js
  node bin/scientific-image-mcp-doctor.js --server bin/scientific-image-mcp.js
`);
  process.exit(0);
}

const timeoutMs = numberArg("--timeout-ms", 5000);
const serverPath = resolve(packageRoot, valueArg("--server") ?? "bin/scientific-image-mcp.js");
const failures = [];

const version = runServer(["--version"]);
const help = runServer(["--help"]);
const rpc = runServer([], [
  request(1, "initialize"),
  request(2, "resources/list"),
  request(3, "tools/list"),
  request(4, "resources/read", { uri: "scientific-image://agent/manifest" })
].join(""));

const rpcResponses = parseFramedResponses(rpc.stdout);
const initialize = responseById(rpcResponses, 1);
const resources = responseById(rpcResponses, 2);
const tools = responseById(rpcResponses, 3);
const manifestResponse = responseById(rpcResponses, 4);
const manifestText = manifestResponse?.result?.contents?.[0]?.text;
const manifest = manifestText ? safeJson(manifestText) : undefined;
const resourceUris = resources?.result?.resources?.map((resource) => resource.uri) ?? [];
const toolNames = tools?.result?.tools?.map((tool) => tool.name) ?? [];

check(version.status === 0, "version command exits successfully");
check(version.stdout.trim() === packageJson.version, "version output matches package.json");
check(help.status === 0, "help command exits successfully");
check(help.stdout.includes("scientific-image-mcp"), "help mentions scientific-image-mcp");
check(rpc.status === 0, "stdio MCP process exits successfully after framed requests");
check(initialize?.result?.serverInfo?.name === "scientific-image-mcp", "initialize returns scientific-image-mcp serverInfo");
check(resourceUris.includes("scientific-image://agent/manifest"), "resources/list includes agent manifest");
check(resourceUris.includes("scientific-image://agent/asset-index-compact"), "resources/list includes compact asset index");
check(resourceUris.includes("scientific-image://agent/agent-cookbook"), "resources/list includes agent cookbook");
check(toolNames.includes("get_asset_index"), "tools/list includes get_asset_index");
check(toolNames.includes("recommend_asset_set"), "tools/list includes recommend_asset_set");
check(toolNames.includes("create_workflow_figure"), "tools/list includes create_workflow_figure");
check(toolNames.includes("export_deck"), "tools/list includes export_deck");
check(manifest?.server?.mcpName === "scientific-image-mcp", "manifest names the MCP server");
check(Boolean(manifest?.recommendedFirstCalls?.some((call) => call.uri === "scientific-image://agent/manifest")), "manifest exposes recommended first calls");
check(Boolean(manifest?.toolGroups?.premiumAssets?.includes("get_asset_index")), "manifest groups premium asset tools");

const report = {
  ok: failures.length === 0,
  package: {
    name: packageJson.name,
    version: packageJson.version
  },
  server: {
    command: process.execPath,
    args: [serverPath],
    timeoutMs
  },
  checks: {
    version: {
      ok: version.status === 0 && version.stdout.trim() === packageJson.version,
      output: version.stdout.trim()
    },
    help: {
      ok: help.status === 0 && help.stdout.includes("scientific-image-mcp")
    },
    initialize: {
      ok: initialize?.result?.serverInfo?.name === "scientific-image-mcp",
      serverInfo: initialize?.result?.serverInfo
    },
    resources: {
      ok: resourceUris.includes("scientific-image://agent/manifest") && resourceUris.includes("scientific-image://agent/asset-index-compact"),
      count: resourceUris.length,
      required: [
        "scientific-image://agent/manifest",
        "scientific-image://agent/asset-index-compact",
        "scientific-image://agent/agent-cookbook"
      ]
    },
    tools: {
      ok: ["get_asset_index", "recommend_asset_set", "create_workflow_figure", "export_deck"].every((tool) => toolNames.includes(tool)),
      count: toolNames.length,
      required: ["get_asset_index", "recommend_asset_set", "create_workflow_figure", "export_deck"]
    },
    manifest: {
      ok: manifest?.server?.mcpName === "scientific-image-mcp",
      workflowPackCount: manifest?.workflowPacks?.length,
      defaultStyleProfile: manifest?.defaultVisualContract?.styleProfile
    }
  },
  nextCalls: [
    "resources/read scientific-image://agent/manifest",
    "resources/read scientific-image://agent/agent-cookbook",
    "tools/call get_asset_index",
    "tools/call recommend_asset_set",
    "tools/call create_workflow_figure",
    "tools/call validate_deck",
    "tools/call export_deck"
  ],
  failures
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;

function runServer(extraArgs, input) {
  const result = spawnSync(process.execPath, [serverPath, ...extraArgs], {
    input,
    encoding: "utf8",
    timeout: timeoutMs,
    env: {
      ...process.env,
      NO_COLOR: "1"
    }
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error?.message
  };
}

function request(id, method, params = undefined) {
  const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function parseFramedResponses(output) {
  const responses = [];
  let offset = 0;
  while (offset < output.length) {
    const headerEnd = output.indexOf("\r\n\r\n", offset);
    if (headerEnd === -1) break;
    const header = output.slice(offset, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) break;
    const length = Number(match[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (bodyEnd > output.length) break;
    responses.push(JSON.parse(output.slice(bodyStart, bodyEnd)));
    offset = bodyEnd;
  }
  return responses;
}

function responseById(responses, id) {
  return responses.find((response) => response.id === id);
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function valueArg(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function numberArg(flag, fallback) {
  const value = Number(valueArg(flag));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
