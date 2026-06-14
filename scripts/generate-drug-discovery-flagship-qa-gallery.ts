import { mkdirSync, writeFileSync } from "node:fs";
import { getAsset, renderPremiumAssetDefs, renderPremiumAssetGlyph } from "../packages/assets/src/index.ts";

const OUT_DIR = "output/drug-discovery-asset-polish";
const styleProfile = process.argv.includes("--publication-line") ? "publication-line" : process.argv.includes("--dark-talk") ? "dark-talk" : "consulting-2p5d";
const suffix = styleProfile === "consulting-2p5d" ? "consulting" : styleProfile;
const OUT_FILE = `${OUT_DIR}/drug-discovery-flagship-qa-gallery-${suffix}.svg`;

const assetIds = [
  "target-validation",
  "target-engagement",
  "compound-library",
  "hit-triage",
  "dose-response-curve",
  "lead-series",
  "sar-table",
  "pk-profile",
  "toxicity-screen",
  "candidate-nomination",
  "ind-enabling-package"
];

const width = 1040;
const headerH = 86;
const rowH = 158;
const height = headerH + assetIds.length * rowH + 32;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

function trimLabel(value: string, max = 30): string {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

const rows = assetIds.map((assetId, index) => {
  const asset = getAsset(assetId);
  const y = headerH + index * rowH;
  const qualityStroke = asset.qualityTier === "signature" ? "#22c55e" : asset.qualityTier === "hero" ? "#3b82f6" : "#cbd5e1";
  const role = asset.semanticSlots.slice(0, 2).join(" / ");
  return `<g class="drug-flagship-qa-row" data-asset-id="${escapeXml(asset.id)}" transform="translate(0 ${y})">
    <rect x="22" y="8" width="${width - 44}" height="${rowH - 16}" rx="16" fill="#ffffff" stroke="${qualityStroke}" stroke-width="1.15"/>
    <text x="42" y="35" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="15.5" font-weight="900">${escapeXml(trimLabel(asset.name))}</text>
    <text x="42" y="56" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10.5" font-weight="700">${escapeXml(asset.id)} / ${escapeXml(asset.renderSpec.assetRecipe)}</text>
    <text x="42" y="78" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="700">${escapeXml(role)}</text>
    <rect x="42" y="94" width="92" height="22" rx="11" fill="${asset.qualityTier === "signature" ? "#dcfce7" : "#dbeafe"}"/>
    <text x="88" y="109" text-anchor="middle" fill="${asset.qualityTier === "signature" ? "#166534" : "#1d4ed8"}" font-family="Inter, Arial, sans-serif" font-size="9.4" font-weight="900">${escapeXml(asset.qualityTier.toUpperCase())}</text>
    <g transform="translate(232 50)">${renderPremiumAssetGlyph(asset, 48, 48, { showLabel: false, styleProfile })}</g>
    <text x="256" y="118" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="800">48px</text>
    <g transform="translate(382 30)">${renderPremiumAssetGlyph(asset, 120, 90, { showLabel: false, styleProfile })}</g>
    <text x="442" y="132" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="800">120px card</text>
    <g transform="translate(628 16)">${renderPremiumAssetGlyph(asset, 250, 118, { showLabel: false, styleProfile })}</g>
    <text x="753" y="139" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="800">slide-size</text>
    <text x="946" y="60" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="800">fidelity</text>
    <text x="946" y="88" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="950">${Math.round(asset.fidelityScore * 100)}</text>
    <text x="946" y="113" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="9.5" font-weight="700">${escapeXml(asset.panelRole)}</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="drug-discovery-flagship-qa-gallery" data-style-profile="${escapeXml(styleProfile)}" role="img" aria-label="Drug discovery flagship asset QA gallery">
  <defs>${renderPremiumAssetDefs()}</defs>
  <rect width="${width}" height="${height}" rx="24" fill="#eef4fb"/>
  <rect x="22" y="20" width="${width - 44}" height="48" rx="16" fill="#ffffff" stroke="#dbeafe"/>
  <text x="44" y="51" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="950">Drug discovery flagship asset QA</text>
  <text x="${width - 44}" y="51" text-anchor="end" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="750">${escapeXml(styleProfile)} / 48px, 120px, slide-size</text>
  ${rows}
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, svg);

console.log(`wrote ${OUT_FILE} (${assetIds.length} assets, ${svg.length} bytes)`);
