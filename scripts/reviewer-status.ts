import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { getAssetQualityReport, getCommercialVisualAudit, listAssets, listRealisticAssets, listWorkflowPacks, listWorkflowTemplates } from "../packages/assets/src/index.ts";

type CommandStatus = {
  ok: boolean;
  status: "passed" | "failed" | "skipped";
  command: string;
  exitCode?: number | null;
  summary?: Record<string, unknown>;
  message?: string;
};

const args = new Set(process.argv.slice(2));
const includePackageCheck = args.has("--include-package-check");

const quality = getAssetQualityReport();
const audit = getCommercialVisualAudit({ limit: 20 });
const assets = listAssets();
const realisticAssets = listRealisticAssets();
const packs = listWorkflowPacks();
const templates = listWorkflowTemplates();
const exampleManifest = readJson<{ examples?: Array<{ templateId?: string }> }>("docs/examples/manifest.json", { examples: [] });
const workflow = existsSync(".github/workflows/ci.yml") ? readFileSync(".github/workflows/ci.yml", "utf8") : "";
const readme = existsSync("README.md") ? readFileSync("README.md", "utf8") : "";

const tests = skipped("node --test tests/*.test.ts", "Reviewer status does not nest the full test runner; run this command separately for the authoritative test result.");
const publicAudit = runPublicReadinessAudit();
const packageTooling = packageToolingStatus();
const packageReadiness = includePackageCheck ? runPackageReadiness(packageTooling) : {
  ok: packageTooling.available,
  status: packageTooling.available ? "available-not-run" : "tooling-missing",
  command: "node scripts/npm-package-readiness.ts",
  missing: packageTooling.missing,
  message: packageTooling.available
    ? "Package tooling is available; rerun with --include-package-check to execute the strict npm publish gate."
    : "Strict npm publish gate not run because package tooling is missing. The no-install reviewer path is still available."
};

const status = {
  schemaVersion: "0.1.0-reviewer-status",
  generatedBy: "scripts/reviewer-status.ts",
  portfolio: {
    browseableAssets: assets.length,
    curatedStructuredAssets: quality.summary.totalAssets,
    realisticFixtures: realisticAssets.length,
    biologyAssets: quality.summary.biologyAssets,
    aiAssets: quality.summary.aiAssets,
    signatureHeroAssets: assets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length,
    workflowPacks: packs.length,
    templates: templates.length,
    styleProfiles: quality.summary.styleProfiles,
    publicExamples: exampleManifest.examples?.length ?? 0,
    publicExampleTemplateIds: exampleManifest.examples?.map((example) => example.templateId).filter(Boolean) ?? []
  },
  ci: {
    workflowPresent: Boolean(workflow),
    nodeVersionPinnedTo24: /node-version:\s*["']?24["']?/.test(workflow),
    node24ActionRuntimeForced: workflow.includes("FORCE_JAVASCRIPT_ACTIONS_TO_NODE24"),
    badgePresentInReadme: /actions\/workflows\/ci\.yml\/badge\.svg/.test(readme)
  },
  checks: {
    tests,
    publicReadinessAudit: publicAudit,
    packageReadiness
  },
  commercialQuality: {
    factoryTemplateRisks: audit.summary.factoryTemplateRisks,
    highRiskPremiumAssets: audit.summary.highRiskPremiumAssets,
    premiumLabelFreeze: audit.policy.premiumLabelFreeze
  },
  noInstallReviewerPath: [
    "node scripts/reviewer-status.ts",
    "node --test tests/*.test.ts",
    "node scripts/public-readiness-audit.ts",
    "node scripts/agent-acceptance-smoke.ts"
  ],
  nextActions: nextActions(tests, publicAudit, packageReadiness)
};

console.log(`${JSON.stringify(status, null, 2)}\n`);

if (!tests.ok || !publicAudit.ok || (includePackageCheck && !packageReadiness.ok)) {
  process.exitCode = 1;
}

function runPublicReadinessAudit(): CommandStatus {
  const result = spawnSync(process.execPath, ["scripts/public-readiness-audit.ts"], { encoding: "utf8" });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  let parsed: { findings?: unknown[] } | undefined;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = undefined;
  }
  return {
    ok: result.status === 0,
    status: result.status === 0 ? "passed" : "failed",
    command: "node scripts/public-readiness-audit.ts",
    exitCode: result.status,
    summary: {
      findings: Array.isArray(parsed?.findings) ? parsed.findings.length : null
    },
    message: result.status === 0 ? "Public readiness audit passed." : trimOutput(output)
  };
}

function runPackageReadiness(tooling: ReturnType<typeof packageToolingStatus>) {
  if (!tooling.available) {
    return {
      ok: false,
      status: "tooling-missing",
      command: "node scripts/npm-package-readiness.ts",
      missing: tooling.missing,
      message: "Strict npm publish gate requires npm and tsc on PATH."
    };
  }
  const result = spawnSync(process.execPath, ["scripts/npm-package-readiness.ts"], { encoding: "utf8" });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  return {
    ok: result.status === 0,
    status: result.status === 0 ? "passed" : "failed",
    command: "node scripts/npm-package-readiness.ts",
    exitCode: result.status,
    message: result.status === 0 ? "Strict npm package readiness passed." : trimOutput(output)
  };
}

function packageToolingStatus() {
  const required = ["npm", "tsc"];
  const missing = required.filter((command) => !commandExists(command));
  return {
    available: missing.length === 0,
    required,
    missing
  };
}

function commandExists(command: string): boolean {
  const probe = spawnSync(command, ["--version"], { encoding: "utf8" });
  return !probe.error && probe.status === 0;
}

function skipped(command: string, message: string): CommandStatus {
  return {
    ok: true,
    status: "skipped",
    command,
    summary: {
      testFiles: readdirSync("tests").filter((file) => file.endsWith(".test.ts")).sort()
    },
    message
  };
}

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function trimOutput(output: string): string {
  return output.trim().split("\n").slice(-12).join("\n");
}

function nextActions(...checks: Array<{ ok: boolean; status?: string; missing?: string[] }>): string[] {
  const actions: string[] = [];
  if (checks.some((check) => !check.ok && check.status !== "tooling-missing")) {
    actions.push("Fix failing reviewer checks before sharing the repository.");
  }
  const packageCheck = checks.find((check) => check.status === "tooling-missing");
  if (packageCheck?.missing?.length) {
    actions.push(`Install missing package tooling for npm publish checks: ${packageCheck.missing.join(", ")}.`);
  }
  if (!actions.length) actions.push("Proceed to web gallery registry alignment and flagship visual QA polish.");
  return actions;
}
