import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { getAssetQualityReport, getCommercialVisualAudit, listAssets, listRealisticAssets, listWorkflowPacks, listWorkflowTemplates } from "../packages/assets/src/index.ts";

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
  "LICENSE",
  ".github/workflows/ci.yml",
  "docs/examples/manifest.json",
  "docs/examples/perturb-seq-workflow.svg",
  "docs/examples/spatial-results-panel.svg",
  "docs/examples/ai-biosecurity-pipeline.svg",
  "docs/AGENT_QUICKSTART.md",
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
  "scripts/generate-public-examples.ts",
  "tests/assets.test.ts",
  "tests/api-mcp.test.ts",
  "tests/export.test.ts"
];

for (const file of requiredFiles) {
  assertGate(existsSync(file), `Required public-facing file is missing: ${file}`);
}

const quality = getAssetQualityReport();
const browseableAssets = listAssets();
const realisticAssets = listRealisticAssets();
const packs = listWorkflowPacks();
const templates = listWorkflowTemplates();
const audit = getCommercialVisualAudit({ limit: 20 });
const signatureHeroAssets = quality.summary.signatureAssets + quality.summary.heroAssets;
const browseableSignatureHeroAssets = browseableAssets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length;
const styleProfileCount = quality.summary.styleProfiles.length;

assertGate(quality.summary.totalAssets >= 450, `Expected at least 450 assets, found ${quality.summary.totalAssets}.`);
assertGate(browseableAssets.length >= quality.summary.totalAssets, "Browseable asset index is smaller than the curated registry.");
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
  "30-Second Reviewer Path",
  "Why This Is Technically Interesting",
  "One canonical scene graph drives the web workspace, API, MCP tools, visual examples, and SVG/PDF/PPTX/DOCX exports.",
  "docs/AGENT_QUICKSTART.md",
  "Portfolio Snapshot",
  "Repository Index",
  "Portfolio Scorecard",
  "Visual Examples",
  "Public demos",
  "?demo=perturb-seq-workflow",
  "?demo=ai-biosecurity-pipeline",
  "scripts/generate-public-examples.ts",
  "public-readiness-audit",
  "actions/workflows/ci.yml",
  "License And Reuse",
  "MCP",
  "Local-first"
]) {
  assertGate(readme.includes(token), `README is missing reviewer signal: ${token}`);
}

const repositoryIndex = readFileSync("docs/REPOSITORY_INDEX.md", "utf8");
for (const token of [
  "Reviewer Fast Path",
  "What To Judge",
  "public demo launching",
  "Can a human edit the same objects that an agent creates through MCP/API tools?",
  "Do exports report exact PPTX/DOCX fidelity fallbacks"
]) {
  assertTextIncludes(repositoryIndex, token, "Repository index");
}

const webIndex = readFileSync("apps/web/index.html", "utf8");
const webApp = readFileSync("apps/web/src/app.js", "utf8");
for (const token of [
  "publicDemoLauncher",
  "Public demos",
  "initialPublicDemoId",
  "resolvePublicDemoId",
  "searchParams.set(\"demo\"",
  "launchPublicDemo",
  "perturb-seq-workflow",
  "spatial-results-panel",
  "ai-biosecurity-pipeline"
]) {
  assertGate(webIndex.includes(token) || webApp.includes(token), `Web workspace is missing public demo launcher signal: ${token}`);
}

const agentQuickstart = readFileSync("docs/AGENT_QUICKSTART.md", "utf8");
for (const token of [
  "Agent Quickstart",
  "node packages/mcp/src/server.ts",
  "get_asset_index",
  "recommend_asset_set",
  "create_workflow_figure",
  "validate_deck",
  "summarize_review_queue",
  "export_deck",
  "POST /projects/:id/workflow-figures",
  "Do not use raw SVG as the editable source."
]) {
  assertTextIncludes(agentQuickstart, token, "Agent quickstart");
}

const currentMetricTokens = [
  `\`${browseableAssets.length}\` browseable assets in the local gallery: \`${quality.summary.totalAssets}\` curated structured assets plus \`${realisticAssets.length}\` realistic fixtures.`,
  `\`${browseableSignatureHeroAssets}\` signature/hero assets across \`${quality.summary.workflowPacks}\` workflow packs and \`${templates.length}\` templates.`,
  `The local gallery contains \`${browseableAssets.length}\` browseable assets: \`${quality.summary.totalAssets}\` curated structured visual assets plus \`${realisticAssets.length}\` realistic editorial fixtures.`
];

for (const token of currentMetricTokens) {
  assertTextIncludes(readme, token, "README");
}

for (const token of [
  `\`${browseableAssets.length}\` total: \`${quality.summary.totalAssets}\` curated structured assets, \`${realisticAssets.length}\` realistic fixtures`,
  `\`${quality.summary.totalAssets}\` total: \`${quality.summary.biologyAssets}\` biology, \`${quality.summary.aiAssets}\` AI`,
  `\`${browseableSignatureHeroAssets}\` signature/hero assets`,
  `\`${quality.summary.workflowPacks}\` workflow packs`,
  `\`${templates.length}\` workflow templates`,
  `\`${styleProfileCount}\`: consulting, publication-line, minimal-flat, dark-talk, risk-warning, realism`,
  "Copy-paste MCP/API path in `docs/AGENT_QUICKSTART.md`",
  "Copy-pasteable agent quickstart that demonstrates compact indexing",
  "`3` generated SVG examples under `docs/examples/`",
  "Generated local artifacts are not tracked.",
  "Public SVG examples are generated from structured scene nodes",
  "obvious credentials, local paths, private notes, or planning transcripts"
]) {
  assertTextIncludes(scorecard, token, "Portfolio scorecard");
}

const license = readFileSync("LICENSE", "utf8");
for (const token of [
  "Source-available portfolio license",
  "No permission is granted",
  "written permission"
]) {
  assertTextIncludes(license, token, "LICENSE");
}

const ciWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
for (const token of [
  "node-version: \"24\"",
  "node --check apps/web/src/app.js",
  "node scripts/public-readiness-audit.ts",
  "node scripts/generate-public-examples.ts",
  "git diff --exit-code docs/examples",
  "node --test tests/*.test.ts"
]) {
  assertTextIncludes(ciWorkflow, token, "GitHub Actions workflow");
}

const exampleManifest = JSON.parse(readFileSync("docs/examples/manifest.json", "utf8")) as {
  generatedBy?: string;
  examples?: Array<{ filename?: string; templateId?: string; styleProfile?: string }>;
};
assertGate(exampleManifest.generatedBy === "scripts/generate-public-examples.ts", "Public example manifest has an unexpected generator.");
for (const filename of ["perturb-seq-workflow.svg", "spatial-results-panel.svg", "ai-biosecurity-pipeline.svg"]) {
  assertGate(exampleManifest.examples?.some((example) => example.filename === filename) ?? false, `Public example manifest is missing ${filename}.`);
  const svg = readFileSync(`docs/examples/${filename}`, "utf8");
  assertGate(svg.includes("<svg") && svg.includes("node_public_001"), `Public SVG example is not normalized or renderable: ${filename}`);
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
  browseableAssets: browseableAssets.length,
  totalAssets: quality.summary.totalAssets,
  realisticAssets: realisticAssets.length,
  signatureHeroAssets: browseableSignatureHeroAssets,
  curatedSignatureHeroAssets: signatureHeroAssets,
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
