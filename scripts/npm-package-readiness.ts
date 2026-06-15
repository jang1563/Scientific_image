import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type PackageJson = {
  name?: string;
  version?: string;
  private?: boolean;
  license?: string;
  bin?: Record<string, string>;
  files?: string[];
  publishConfig?: Record<string, string>;
};

type PackFile = { path: string; size: number; mode?: number };
type PackOutput = Array<{ id?: string; name?: string; version?: string; files?: PackFile[] }>;

const failures: string[] = [];

function assertGate(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const pkg = readJson<PackageJson>("package.json");
const npmEnv = {
  ...process.env,
  npm_config_cache: process.env.npm_config_cache ?? join(tmpdir(), "scientific-image-npm-cache"),
  npm_config_loglevel: process.env.npm_config_loglevel ?? "error"
};

assertGate(pkg.name === "@jang1563/scientific-image", "package name should be the public scoped registry name.");
assertGate(Boolean(pkg.version), "package version is required.");
assertGate(pkg.private === false, "package must set private:false before npm publish.");
assertGate(pkg.license === "SEE LICENSE IN LICENSE", "package must declare the source-available LICENSE file.");
assertGate(pkg.bin?.["scientific-image-mcp"] === "bin/scientific-image-mcp.js", "scientific-image-mcp bin is missing.");
assertGate(pkg.publishConfig?.access === "public", "publishConfig.access must be public.");
assertGate(pkg.publishConfig?.registry === "https://registry.npmjs.org/", "publishConfig.registry must target the public npm registry.");

for (const file of [
  "README.md",
  "LICENSE",
  "bin/scientific-image-mcp.js",
  "packages/mcp/src/server.ts",
  "packages/agent/src/index.ts",
  "packages/assets/src/index.ts",
  "packages/scene/src/index.ts",
  "docs/MCP_CLIENT_SETUP.md",
  "docs/NPM_PACKAGE_RELEASE.md",
  ".mcp.npm.example.json",
  "codex.npm.example.toml"
]) {
  assertGate(existsSync(file), `required publish file is missing: ${file}`);
}

const binMode = existsSync("bin/scientific-image-mcp.js") ? statSync("bin/scientific-image-mcp.js").mode : 0;
assertGate((binMode & 0o111) !== 0, "bin/scientific-image-mcp.js should be executable.");

const versionOutput = execFileSync("node", ["bin/scientific-image-mcp.js", "--version"], { encoding: "utf8" }).trim();
assertGate(versionOutput === pkg.version, "scientific-image-mcp --version should match package.json version.");

const helpOutput = execFileSync("node", ["bin/scientific-image-mcp.js", "--help"], { encoding: "utf8" });
for (const token of ["scientific-image-mcp", "Run the Scientific Image local stdio MCP server", "scientific-image://agent/manifest"]) {
  assertGate(helpOutput.includes(token), `MCP bin help is missing: ${token}`);
}

const packOutput = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8", env: npmEnv })) as PackOutput;
const packed = packOutput[0];
const packedFiles = new Set((packed.files ?? []).map((file) => file.path));

for (const file of [
  "package.json",
  "README.md",
  "LICENSE",
  "bin/scientific-image-mcp.js",
  "packages/mcp/src/server.ts",
  "packages/agent/src/index.ts",
  "packages/assets/src/index.ts",
  "packages/assets/src/renderer.js",
  "packages/scene/src/index.ts",
  "packages/export/src/index.ts",
  "docs/MCP_CLIENT_SETUP.md",
  "docs/AGENT_QUICKSTART.md",
  "docs/NPM_PACKAGE_RELEASE.md",
  ".mcp.npm.example.json",
  "codex.npm.example.toml"
]) {
  assertGate(packedFiles.has(file), `npm tarball is missing expected file: ${file}`);
}

for (const forbidden of ["output/", ".playwright-cli/", ".git/", "node_modules/", ".env"]) {
  assertGate(![...packedFiles].some((file) => file.startsWith(forbidden)), `npm tarball includes forbidden local artifact: ${forbidden}`);
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  name: pkg.name,
  version: pkg.version,
  bin: pkg.bin,
  packedFileCount: packed.files?.length ?? 0,
  packedSizeBytes: packed.files?.reduce((sum, file) => sum + file.size, 0) ?? 0,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
