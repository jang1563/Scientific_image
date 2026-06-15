import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { getAssetQualityReport, getCommercialVisualAudit, listWorkflowPacks, listWorkflowTemplates } from "../packages/assets/src/index.ts";

type Finding = {
  level: "error" | "warning";
  message: string;
};

const findings: Finding[] = [];

function add(level: Finding["level"], message: string): void {
  findings.push({ level, message });
}

function assertGate(condition: boolean, message: string): void {
  if (!condition) add("error", message);
}

function warnGate(condition: boolean, message: string): void {
  if (!condition) add("warning", message);
}

function trackedFiles(): string[] {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const requiredFiles = [
  "README.md",
  "docs/REPOSITORY_INDEX.md",
  "docs/PORTFOLIO_SCORECARD.md",
  "docs/PUBLIC_RELEASE_CHECKLIST.md",
  "package.json",
  "apps/web/index.html",
  "apps/api/src/server.ts",
  "packages/mcp/src/server.ts",
  "packages/assets/src/index.ts",
  "packages/scene/src/index.ts",
  "packages/export/src/index.ts",
  "tests/assets.test.ts",
  "tests/api-mcp.test.ts",
  "tests/export.test.ts"
];

for (const file of requiredFiles) {
  assertGate(existsSync(file), `Required public-facing file is missing: ${file}`);
}

const quality = getAssetQualityReport();
const packs = listWorkflowPacks();
const templates = listWorkflowTemplates();
const audit = getCommercialVisualAudit({ limit: 20 });
const signatureHeroAssets = quality.summary.signatureAssets + quality.summary.heroAssets;
const styleProfileCount = quality.summary.styleProfiles.length;

assertGate(quality.summary.totalAssets >= 450, `Expected at least 450 assets, found ${quality.summary.totalAssets}.`);
assertGate(quality.summary.workflowPacks >= 18, `Expected at least 18 workflow packs, found ${quality.summary.workflowPacks}.`);
assertGate(templates.length >= 70, `Expected at least 70 templates, found ${templates.length}.`);
assertGate(signatureHeroAssets >= 380, "Expected at least 380 signature/hero assets.");
assertGate(audit.summary.factoryTemplateRisks <= 7, `Factory template risk budget exceeded: ${audit.summary.factoryTemplateRisks}.`);
warnGate(audit.summary.highRiskPremiumAssets <= 20, `High-risk premium asset count is above current budget: ${audit.summary.highRiskPremiumAssets}.`);

const readme = readFileSync("README.md", "utf8");
const scorecard = readFileSync("docs/PORTFOLIO_SCORECARD.md", "utf8");

function assertTextIncludes(text: string, token: string, label: string): void {
  assertGate(text.includes(token), `${label} is missing current computed signal: ${token}`);
}

for (const token of [
  "Portfolio Snapshot",
  "Repository Index",
  "Portfolio Scorecard",
  "public-readiness-audit",
  "MCP",
  "Local-first"
]) {
  assertGate(readme.includes(token), `README is missing reviewer signal: ${token}`);
}

const currentMetricTokens = [
  `\`${quality.summary.totalAssets}\` curated visual assets: \`${quality.summary.biologyAssets}\` biology and \`${quality.summary.aiAssets}\` AI assets.`,
  `\`${signatureHeroAssets}\` signature/hero assets across \`${quality.summary.workflowPacks}\` workflow packs and \`${templates.length}\` templates.`,
  `The curated registry contains \`${quality.summary.totalAssets}\` structured visual assets:`
];

for (const token of currentMetricTokens) {
  assertTextIncludes(readme, token, "README");
}

for (const token of [
  `\`${quality.summary.totalAssets}\` total: \`${quality.summary.biologyAssets}\` biology, \`${quality.summary.aiAssets}\` AI`,
  `\`${signatureHeroAssets}\` signature/hero assets`,
  `\`${quality.summary.workflowPacks}\` workflow packs`,
  `\`${templates.length}\` workflow templates`,
  `\`${styleProfileCount}\`: consulting, publication-line, minimal-flat, dark-talk, risk-warning, realism`,
  "Generated local artifacts are not tracked.",
  "obvious credentials, local paths, private notes, or planning transcripts"
]) {
  assertTextIncludes(scorecard, token, "Portfolio scorecard");
}

for (const pack of [
  "perturb-seq-crispr",
  "spatial-transcriptomics",
  "ai-biosecurity-eval",
  "drug-discovery",
  "protein-engineering",
  "microscopy-image-analysis"
]) {
  assertGate(packs.some((entry) => entry.id === pack), `Expected workflow pack is missing: ${pack}`);
}

const secretPatterns: Array<[RegExp, string]> = [
  [/\b(?:OPENAI|ANTHROPIC|GOOGLE|AWS|GITHUB|GH)_[A-Z0-9_]*(?:KEY|TOKEN|SECRET)\s*[:=]/i, "environment credential assignment"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key block"],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/, "API key-like token"],
  [/\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^"'\s]{6,}/i, "password-like assignment"],
  [/\bBearer\s+[A-Za-z0-9._-]{20,}\b/i, "bearer token"]
];

const privateContextPatterns: Array<[RegExp, string]> = [
  [/\/Users\/[^"'\s)]+/, "absolute user path"],
  [/\bDropbox\/Bioinformatics\/Claude\b/, "local workspace path"],
  [/\b(?:Jihoon|Weill Cornell|Mason Lab)\b/i, "personal or institution-specific context"],
  [/\b(?:overnight loop|heartbeat|chat transcript|internal deliberation)\b/i, "internal workflow context"]
];

for (const file of trackedFiles()) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(text)) add("error", `Tracked file may contain ${label}: ${file}`);
  }
  if (file === "scripts/public-readiness-audit.ts") continue;
  for (const [pattern, label] of privateContextPatterns) {
    if (pattern.test(text)) add("warning", `Tracked file may contain ${label}: ${file}`);
  }
}

const trackedGenerated = trackedFiles().filter((file) => /^(output|\.playwright-cli)\//.test(file));
assertGate(trackedGenerated.length === 0, `Generated local artifacts are tracked: ${trackedGenerated.join(", ")}`);

const cwd = process.cwd();
const summary = {
  repo: relative(cwd, cwd) || ".",
  totalAssets: quality.summary.totalAssets,
  signatureHeroAssets,
  workflowPacks: quality.summary.workflowPacks,
  templates: templates.length,
  styleProfiles: styleProfileCount,
  factoryTemplateRisks: audit.summary.factoryTemplateRisks,
  highRiskPremiumAssets: audit.summary.highRiskPremiumAssets,
  findings
};

console.log(JSON.stringify(summary, null, 2));

if (findings.some((finding) => finding.level === "error")) {
  process.exitCode = 1;
}
