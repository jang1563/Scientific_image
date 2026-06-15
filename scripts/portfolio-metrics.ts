import { readFileSync } from "node:fs";
import { getAssetQualityReport, getCommercialVisualAudit, listAssets, listRealisticAssets, listWorkflowPacks, listWorkflowTemplates } from "../packages/assets/src/index.ts";

const quality = getAssetQualityReport();
const browseableAssets = listAssets();
const realisticAssets = listRealisticAssets();
const packs = listWorkflowPacks();
const templates = listWorkflowTemplates();
const audit = getCommercialVisualAudit({ limit: 20 });
const exampleManifest = JSON.parse(readFileSync("docs/examples/manifest.json", "utf8")) as {
  examples?: Array<{ filename?: string; templateId?: string; styleProfile?: string }>;
};

const browseableSignatureHeroAssets = browseableAssets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length;
const curatedSignatureHeroAssets = quality.summary.signatureAssets + quality.summary.heroAssets;

const metrics = {
  generatedBy: "scripts/portfolio-metrics.ts",
  canonicalSource: "packages/assets/src/index.ts",
  browseableAssets: browseableAssets.length,
  curatedStructuredAssets: quality.summary.totalAssets,
  realisticFixtures: realisticAssets.length,
  biologyAssets: quality.summary.biologyAssets,
  aiAssets: quality.summary.aiAssets,
  browseableSignatureHeroAssets,
  curatedSignatureHeroAssets,
  workflowPacks: quality.summary.workflowPacks,
  listedWorkflowPacks: packs.length,
  workflowTemplates: templates.length,
  styleProfiles: quality.summary.styleProfiles,
  styleProfileCount: quality.summary.styleProfiles.length,
  publicExamples: exampleManifest.examples?.length ?? 0,
  publicExampleTemplateIds: exampleManifest.examples?.map((example) => example.templateId).filter(Boolean) ?? [],
  exportSurfaces: ["SVG", "PDF", "PPTX", "DOCX"],
  qualityBudgets: {
    factoryTemplateRisks: audit.summary.factoryTemplateRisks,
    highRiskPremiumAssets: audit.summary.highRiskPremiumAssets,
    factoryTemplateRiskBudget: 7,
    highRiskPremiumAssetWarningBudget: 20
  }
};

console.log(`${JSON.stringify(metrics, null, 2)}\n`);
