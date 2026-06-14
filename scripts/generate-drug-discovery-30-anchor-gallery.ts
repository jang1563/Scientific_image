import { mkdirSync, writeFileSync } from "node:fs";
import { getAsset, recommendAssetSet, renderPremiumAssetDefs, renderPremiumAssetGlyph } from "../packages/assets/src/index.ts";

const OUT_DIR = "output/drug-discovery-asset-polish";
const OUT_FILE = `${OUT_DIR}/drug-discovery-30-anchor-core.svg`;

const recommendation = recommendAssetSet({
  title: "Drug discovery 30-anchor commercial core",
  sourceText: [
    "Target validation and target engagement.",
    "384-well compound library screen, hit triage, potency, dose response, selectivity, SAR, medicinal chemistry, ADMET, toxicity, PK, efficacy, biomarker response.",
    "Candidate nomination, IND package, receptor ligand biology, protein complex, human cohort, and blood sample context."
  ].join(" "),
  workflowPack: "drug-discovery",
  styleProfile: "consulting-2p5d",
  limit: 30
});

const assetIds = [
  "target-validation",
  "target-engagement",
  "compound-library",
  "hit-triage",
  "dose-response-curve",
  "selectivity-panel",
  "sar-table",
  "medicinal-chemistry-cycle",
  "admet-panel",
  "toxicity-screen",
  "pk-profile",
  "efficacy-model",
  "biomarker-response",
  "lead-series",
  "candidate-nomination",
  "ind-enabling-package",
  "receptor",
  "ligand",
  "drug-perturbation",
  "plate-384",
  "metric-card",
  "metabolite",
  "calibration",
  "error-analysis",
  "human-cohort",
  "protein",
  "pathway-node",
  "signaling-cascade",
  "protein-complex",
  "blood-sample"
];

const missingInsertReadyAssets = assetIds.filter((assetId) => !recommendation.insertPlan.some((action) => action.args.assetId === assetId));
if (missingInsertReadyAssets.length) {
  throw new Error(`Drug-discovery recommendation is missing core anchors: ${missingInsertReadyAssets.join(", ")}`);
}
const cellWidth = 178;
const cellHeight = 158;
const columns = 5;
const rows = Math.ceil(assetIds.length / columns);
const width = columns * cellWidth + 48;
const height = rows * cellHeight + 118;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

function trimLabel(value: string): string {
  return value.length > 24 ? `${value.slice(0, 21)}...` : value;
}

const cards = assetIds.map((assetId, index) => {
  const asset = getAsset(assetId);
  const x = 24 + (index % columns) * cellWidth;
  const y = 82 + Math.floor(index / columns) * cellHeight;
  const badge = asset.qualityTier === "signature" ? "SIGNATURE" : asset.qualityTier === "hero" ? "HERO" : asset.qualityTier.toUpperCase();
  const stroke = asset.qualityTier === "signature" ? "#22c55e" : asset.qualityTier === "hero" ? "#3b82f6" : "#cbd5e1";
  return `<g class="drug-discovery-30-anchor-card" data-asset-id="${escapeXml(assetId)}" transform="translate(${x} ${y})">
    <rect x="4" y="4" width="${cellWidth - 16}" height="${cellHeight - 16}" rx="14" fill="#ffffff" stroke="${stroke}" stroke-width="1.2"/>
    <g transform="translate(23 14)">${renderPremiumAssetGlyph(asset, 120, 92, { styleProfile: "consulting-2p5d", showLabel: false })}</g>
    <text x="${cellWidth / 2 - 4}" y="124" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="10.5" font-weight="850">${escapeXml(trimLabel(asset.name))}</text>
    <text x="${cellWidth / 2 - 4}" y="141" text-anchor="middle" fill="${stroke}" font-family="Inter, Arial, sans-serif" font-size="8.5" font-weight="900">${escapeXml(badge)}</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="drug-discovery-30-anchor-gallery" role="img" aria-label="Drug discovery 30 anchor commercial core gallery">
  <defs>${renderPremiumAssetDefs()}</defs>
  <rect width="${width}" height="${height}" rx="24" fill="#eef4fb"/>
  <rect x="20" y="18" width="${width - 40}" height="46" rx="16" fill="#ffffff" stroke="#dbeafe"/>
  <text x="42" y="47" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="950">Drug discovery 30-anchor commercial core</text>
  <text x="${width - 42}" y="47" text-anchor="end" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="750">insert-ready MCP assets / consulting-2p5d</text>
  ${cards}
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, svg);

console.log(`wrote ${OUT_FILE} (${assetIds.length} assets, ${svg.length} bytes)`);
