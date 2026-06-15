#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`scientific-image-mcp ${packageJson.version}

Run the Scientific Image local stdio MCP server.

Usage:
  scientific-image-mcp
  scientific-image-mcp --version

MCP clients should launch this command over stdio, then read:
  scientific-image://agent/manifest
  scientific-image://agent/agent-cookbook
  scientific-image://agent/demo-perturb-seq-crispr
`);
  process.exit(0);
}

if (args.has("--version") || args.has("-v")) {
  console.log(packageJson.version);
  process.exit(0);
}

const { startStdioServer } = await import("../packages/mcp/src/server.ts");
startStdioServer();
