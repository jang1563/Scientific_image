import test from "node:test";
import assert from "node:assert/strict";
import {
  CURATED_ASSETS,
  HERO_ASSET_IDS,
  REALISTIC_ASSETS,
  createRealisticImageNode,
  createWorkflowFigureNodes,
  createFlagshipWorkflowDemoNodes,
  getAsset,
  getAssetIndex,
  getRealisticAssetGallery,
  getAssetCoverageGapReport,
  getAssetOntology,
  getAssetQualityReport,
  getCommercialVisualAudit,
  getJournalFigureQa,
  getWorkflowPackExportSnapshot,
  getWorkflowPackGallery,
  getWorkflowPackVisualQaGallery,
  getWorkflowTemplate,
  getWorkflowTemplateQa,
  listWorkflowPacks,
  listWorkflowTemplates,
  createAssetBrief,
  createWorkflowTemplateSpec,
  recommendAssetSet,
  recommendAssetsForSlide,
  recommendWorkflowPack,
  renderWorkflowPackVisualQaGallerySvg,
  renderWorkflowPackGallerySvg,
  renderPremiumAssetSvg,
  renderRealisticAssetGallerySvg,
  renderRealisticAssetSvg,
  searchAssets,
  validatePremiumAssetRegistry,
  validateRealisticAssetRegistry
} from "../packages/assets/src/index.ts";
import { addNode, createProject } from "../packages/scene/src/index.ts";
import { createCuratedSymbolNode } from "../packages/assets/src/index.ts";
import { exportProject } from "../packages/export/src/index.ts";

test("premium asset registry has growing complete curated assets", () => {
  const validation = validatePremiumAssetRegistry();
  assert.equal(CURATED_ASSETS.length, 466);
  assert.deepEqual(validation.issues, []);

  const ids = new Set(CURATED_ASSETS.map((asset) => asset.id));
  assert.equal(ids.size, 466);
  assert.equal(CURATED_ASSETS.filter((asset) => asset.category.startsWith("Biology /")).length, 386);
  assert.equal(CURATED_ASSETS.filter((asset) => asset.category.startsWith("AI /")).length, 80);
});

test("scientific editorial realistic assets are searchable renderable and export aware", () => {
  const validation = validateRealisticAssetRegistry();
  assert.equal(REALISTIC_ASSETS.length, 30);
  assert.deepEqual(validation.issues, []);

  const ids = new Set(REALISTIC_ASSETS.map((asset) => asset.id));
  assert.equal(ids.size, 30);
  assert.equal(REALISTIC_ASSETS.filter((asset) => asset.workflowPacks.includes("realistic-spatial-microscopy")).length, 12);
  assert.equal(REALISTIC_ASSETS.filter((asset) => asset.workflowPacks.includes("realistic-wetlab-context")).length, 8);
  assert.equal(REALISTIC_ASSETS.filter((asset) => asset.workflowPacks.includes("realistic-cellular-textures")).length, 6);
  assert.equal(REALISTIC_ASSETS.filter((asset) => asset.workflowPacks.includes("realistic-space-biology")).length, 4);
  assert.ok(REALISTIC_ASSETS.every((asset) => asset.styleProfiles.includes("scientific-editorial-realism")));
  assert.ok(REALISTIC_ASSETS.every((asset) => asset.rightsStatus === "curated-fixture" && asset.sourceAssetType === "generated-fixture"));

  const spatial = searchAssets({
    assetKind: "realistic",
    workflowPack: "realistic-spatial-microscopy",
    styleProfile: "scientific-editorial-realism",
    query: "segmentation microscopy evidence",
    limit: 6
  });
  assert.ok(spatial.length >= 4);
  assert.ok(spatial.every((result) => result.asset.kind === "image"));
  assert.ok(spatial.some((result) => result.asset.id === "realistic-segmentation-overlay"));

  const svg = renderRealisticAssetSvg("realistic-he-tissue-section", { styleProfile: "scientific-editorial-realism" });
  assert.match(svg, /scientific-realistic-asset/);
  assert.match(svg, /data-media-type="svg-fixture"/);
  assert.match(svg, /<svg x=/);
  assert.doesNotMatch(svg, /<image/);
  assert.doesNotMatch(svg, /NaN/);
  assert.match(svg, /realistic-editorial-shadow/);
  const croppedSpaceSvg = renderRealisticAssetSvg("realistic-spacecraft-context", {
    styleProfile: "scientific-editorial-realism",
    crop: { x: -0.02, y: 0.02, zoom: 1.08, fit: "cover" } as never
  });
  assert.match(croppedSpaceSvg, /fixture-spacecraft/);
  assert.doesNotMatch(croppedSpaceSvg, /NaN/);
  const fixturePayload = (assetId: string) => decodeURIComponent(String(REALISTIC_ASSETS.find((asset) => asset.id === assetId)?.dataUri ?? "").split(",")[1] ?? "");
  const hePayload = fixturePayload("realistic-he-tissue-section");
  const segmentationPayload = fixturePayload("realistic-segmentation-overlay");
  const spatialMapPayload = fixturePayload("realistic-spatial-map");
  const pipetteBenchPayload = fixturePayload("realistic-pipette-bench");
  const platePayload = fixturePayload("realistic-plate-96-photo");
  const microscopePayload = fixturePayload("realistic-microscope-bench");
  const sequencerPayload = fixturePayload("realistic-sequencer-bay");
  const bscPayload = fixturePayload("realistic-biosafety-cabinet");
  const sampleTubesPayload = fixturePayload("realistic-sample-tubes");
  const centrifugePayload = fixturePayload("realistic-centrifuge-bench");
  const flowCytometerPayload = fixturePayload("realistic-flow-cytometer");
  const cellClusterPayload = fixturePayload("realistic-cell-cluster");
  const organoidPayload = fixturePayload("realistic-organoid-texture");
  const tumorPayload = fixturePayload("realistic-tumor-microenvironment");
  const immunePayload = fixturePayload("realistic-immune-infiltrate");
  const pathogenPayload = fixturePayload("realistic-pathogen-particles");
  const proteinGelPayload = fixturePayload("realistic-protein-gel");
  const spacePayload = fixturePayload("realistic-spacecraft-context");
  const astronautSamplePayload = fixturePayload("realistic-astronaut-sample");
  const spaceflightAssayPayload = fixturePayload("realistic-spaceflight-assay");
  const genelabPayload = fixturePayload("realistic-genelab-data-context");
  assert.ok((hePayload.match(/<path/g) ?? []).length >= 40, "H&E fixture should include layered tissue contours and stromal detail");
  assert.ok((segmentationPayload.match(/<path/g) ?? []).length >= 80, "Segmentation fixture should include microscopy texture plus mask boundaries");
  assert.ok((spatialMapPayload.match(/<circle/g) ?? []).length >= 170, "Spatial map fixture should include dense spot-level signal");
  assert.match(pipetteBenchPayload, /fixture-pipette/);
  assert.match(pipetteBenchPayload, /fixture-pipette-tip/);
  assert.match(pipetteBenchPayload, /fixture-bench-surface/);
  assert.match(pipetteBenchPayload, /fixture-tube-rack/);
  assert.match(pipetteBenchPayload, /fixture-assay-plate/);
  assert.match(platePayload, /fixture-well-grid/);
  assert.match(platePayload, /fixture-control-well/);
  assert.match(microscopePayload, /fixture-microscope/);
  assert.match(microscopePayload, /fixture-objective/);
  assert.match(microscopePayload, /fixture-microscope-slide/);
  assert.match(sequencerPayload, /fixture-sequencer/);
  assert.match(sequencerPayload, /fixture-flow-cell/);
  assert.match(sequencerPayload, /fixture-run-lane/);
  assert.match(bscPayload, /fixture-biosafety-cabinet/);
  assert.match(bscPayload, /fixture-airflow-curtain/);
  assert.match(bscPayload, /fixture-sash/);
  assert.match(sampleTubesPayload, /fixture-sample-rack/);
  assert.match(sampleTubesPayload, /fixture-sample-tube/);
  assert.match(centrifugePayload, /fixture-centrifuge/);
  assert.match(centrifugePayload, /fixture-centrifuge-rotor/);
  assert.match(flowCytometerPayload, /fixture-flow-cytometer/);
  assert.match(flowCytometerPayload, /fixture-scatter-screen/);
  assert.match(flowCytometerPayload, /fixture-fluidics/);
  assert.match(cellClusterPayload, /fixture-cell-cluster/);
  assert.match(cellClusterPayload, /fixture-cell-density/);
  assert.match(cellClusterPayload, /fixture-matrix-fiber/);
  assert.match(organoidPayload, /fixture-organoid/);
  assert.match(tumorPayload, /fixture-tumor-microenvironment/);
  assert.match(tumorPayload, /fixture-tumor-island/);
  assert.match(tumorPayload, /fixture-immune-edge/);
  assert.match(immunePayload, /fixture-immune-infiltrate/);
  assert.match(immunePayload, /fixture-t-cell/);
  assert.match(immunePayload, /fixture-myeloid-cell/);
  assert.match(immunePayload, /fixture-chemokine-field/);
  assert.match(pathogenPayload, /fixture-pathogen/);
  assert.match(proteinGelPayload, /fixture-protein-gel/);
  assert.match(proteinGelPayload, /fixture-gel-lane/);
  assert.match(proteinGelPayload, /fixture-protein-band/);
  assert.match(spacePayload, /fixture-spacecraft/);
  assert.match(spacePayload, /fixture-solar-panel/);
  assert.match(astronautSamplePayload, /fixture-astronaut/);
  assert.match(astronautSamplePayload, /fixture-crew-sample/);
  assert.match(spaceflightAssayPayload, /fixture-flight-assay/);
  assert.match(spaceflightAssayPayload, /fixture-assay-rack|fixture-sample-tube/);
  assert.match(genelabPayload, /fixture-genelab/);
  assert.match(genelabPayload, /fixture-omics-heatmap/);

  const gallery = getRealisticAssetGallery({ workflowPack: "realistic-spatial-microscopy", limit: 5 });
  assert.equal(gallery.assetCount, 5);
  assert.match(gallery.svg, /realistic-asset-gallery/);
  assert.match(renderRealisticAssetGallerySvg({ workflowPack: "realistic-wetlab-context", limit: 4 }), /realistic-wetlab-context/);
  const wetlabGallery = getRealisticAssetGallery({ workflowPack: "realistic-wetlab-context", styleProfile: "scientific-editorial-realism", limit: 8 });
  assert.equal(wetlabGallery.quality?.qaStatus, "premium");
  assert.equal(wetlabGallery.quality?.assetCount, 8);
  assert.equal(wetlabGallery.quality?.templateCount, 1);
  assert.equal(wetlabGallery.flagshipDemo?.templateId, "wetlab-realistic-context-panel");
  assert.equal(wetlabGallery.exportSnapshot?.packId, "realistic-wetlab-context");
  assert.ok(wetlabGallery.visualQa?.renderedAssetIds.includes("realistic-biosafety-cabinet"));
  assert.ok(wetlabGallery.templateQa?.some((qa) => qa.templateId === "wetlab-realistic-context-panel" && qa.qaStatus === "premium"));
  const cellularGallery = getRealisticAssetGallery({ workflowPack: "realistic-cellular-textures", styleProfile: "scientific-editorial-realism", limit: 6 });
  assert.equal(cellularGallery.quality?.qaStatus, "premium");
  assert.equal(cellularGallery.quality?.assetCount, 6);
  assert.equal(cellularGallery.quality?.templateCount, 1);
  assert.equal(cellularGallery.flagshipDemo?.templateId, "cellular-realistic-evidence-panel");
  assert.equal(cellularGallery.exportSnapshot?.packId, "realistic-cellular-textures");
  assert.ok(cellularGallery.visualQa?.renderedAssetIds.includes("realistic-tumor-microenvironment"));
  assert.ok(cellularGallery.templateQa?.some((qa) => qa.templateId === "cellular-realistic-evidence-panel" && qa.qaStatus === "premium"));
  const spaceGallery = getRealisticAssetGallery({ workflowPack: "realistic-space-biology", styleProfile: "scientific-editorial-realism", limit: 4 });
  assert.equal(spaceGallery.quality?.qaStatus, "premium");
  assert.equal(spaceGallery.quality?.assetCount, 4);
  assert.equal(spaceGallery.quality?.templateCount, 1);
  assert.equal(spaceGallery.flagshipDemo?.templateId, "space-realistic-context-panel");
  assert.equal(spaceGallery.exportSnapshot?.packId, "realistic-space-biology");
  assert.ok(spaceGallery.visualQa?.renderedAssetIds.includes("realistic-spacecraft-context"));
  assert.ok(spaceGallery.templateQa?.some((qa) => qa.templateId === "space-realistic-context-panel" && qa.qaStatus === "premium"));

  const recommendations = recommendAssetsForSlide({
    title: "Spatial microscopy evidence image panel",
    narrative: "histology segmentation overlay and tissue context",
    layoutIntent: "context panel with evidence image",
    limit: 5
  });
  assert.ok(recommendations.some((result) => result.asset.id.startsWith("realistic-")));

  const project = createProject("Realistic image export", "slide");
  const node = createRealisticImageNode({
    assetId: "realistic-he-tissue-section",
    x: 80,
    y: 120,
    width: 320,
    height: 210,
    styleProfile: "scientific-editorial-realism",
    crop: { x: 80, y: 60, width: 760, height: 480 },
    mask: { shape: "round-rect" }
  });
  const withNode = addNode(project, node);
  const exported = exportProject(withNode, { format: "svg" });
  assert.match(String(exported.data), /scientific-realistic-asset/);
  const pptx = exportProject(withNode, { format: "pptx" });
  assert.ok(pptx.warnings.some((warning) => warning.includes("realistic-he-tissue-section")));
});

test("commercial signature and hero assets have v2 recipes and quality metadata", () => {
  const premiumAssets = CURATED_ASSETS.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero");
  const premiumIds = new Set(premiumAssets.map((asset) => asset.id));
  const recipes = new Set(premiumAssets.map((asset) => asset.renderSpec.assetRecipe));

  assert.equal(HERO_ASSET_IDS.length, 401);
  assert.equal(premiumAssets.length, 401);
  assert.equal(recipes.size, 401);
  assert.ok(CURATED_ASSETS.filter((asset) => asset.qualityTier === "signature").length >= 20);
  for (const assetId of HERO_ASSET_IDS) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.version, 2);
    assert.equal(asset.renderSpec.assetRecipe, `hero-${asset.id}`);
    assert.ok(premiumIds.has(assetId));
    assert.ok(asset.styleProfiles.includes("consulting-2p5d"));
    assert.ok(asset.semanticSlots.length);
    assert.ok(asset.editablePartDefinitions.length);
  }
  const aiBiosecurityMarkers: Record<string, RegExp[]> = {
    benchmark: [/asset-benchmark-suite/, /asset-benchmark-matrix-cell/, /asset-benchmark-pass-badge/],
    "bio-classifier": [/asset-bio-classifier-dna-query/, /asset-bio-classifier-chip-body/, /asset-bio-classifier-safety-shield/],
    "pathogen-intent-classifier": [/asset-bio-classifier-dna-query/, /asset-bio-classifier-model-core/, /asset-bio-classifier-approval-check/],
    "protocol-risk-screen": [/asset-protocol-risk-document/, /asset-protocol-risk-shield/, /asset-protocol-risk-decision-check/],
    "dual-use-triage": [/asset-dual-use-source-document/, /asset-dual-use-triage-wedge/, /asset-dual-use-escalation-arrow/],
    "gene-synthesis-screen": [/asset-gene-synthesis-screen-frame/, /asset-gene-synthesis-dna-query/, /asset-gene-synthesis-clearance-check/],
    "escalation-path": [/asset-escalation-path-curve/, /asset-escalation-step-node/, /asset-escalation-review-box/],
    "durc-flag": [/asset-durc-flag-pole/, /asset-durc-flag-banner/, /asset-durc-warning-triangle/],
    "bio-protocol-benchmark": [/asset-bio-protocol-benchmark-sheet/, /asset-bio-protocol-task-row/, /asset-bio-protocol-score-bar/],
    "safety-classifier": [/asset-safety-classifier-system/, /asset-safety-classifier-model-layer/, /asset-safety-classifier-shield/],
    "permission-tier": [/asset-permission-tier-frame/, /asset-permission-tier-rung/, /asset-permission-tier-handle/],
    "biosafety-tier": [/asset-permission-tier-frame/, /asset-permission-tier-ladder/, /asset-permission-tier-review/],
    "red-team": [/asset-red-team-target-ring/, /asset-red-team-crosshair/, /asset-red-team-attack-vector/],
    "policy-stack": [/asset-policy-stack/, /asset-policy-stack-layer/, /asset-policy-stack-approval-check/],
    "review-queue": [/asset-review-triage-funnel/, /asset-reviewer-checkpoint/, /asset-review-audit-trail/, /asset-review-decision-check/],
    "approval-stamp": [/asset-approval-stamp-seal/, /asset-approval-stamp-handle/, /asset-approval-check-mark/],
    "blocked-output": [/asset-blocked-output-sheet/, /asset-blocked-output-stop-badge/, /asset-blocked-output-gate-bar/]
  };
  for (const [assetId, markers] of Object.entries(aiBiosecurityMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "risk-warning" });
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("ai-biosecurity-eval"));
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(svg, /data-recipe="standard-/);
    for (const marker of markers) assert.match(svg, marker);
    assert.doesNotMatch(svg, /asset-review-card|asset-blocked-output-card/);
  }
  for (const assetId of ["prime-editor", "plate-384"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("perturb-seq-crispr"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["compound-library", "target-validation", "target-engagement", "toxicity-screen", "medicinal-chemistry-cycle", "efficacy-model", "candidate-nomination", "ind-enabling-package"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("drug-discovery"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["hit-triage", "dose-response-curve", "selectivity-panel", "pk-profile", "sar-table", "admet-panel", "biomarker-response", "lead-series"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("drug-discovery"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
  }
  const agenticAssetMarkers = {
    "audit-log": ["asset-audit-log-ledger", "asset-audit-log-event-line", "asset-audit-log-trace-line", "asset-audit-log-event-dot", "asset-audit-log-event-3"],
    classifier: ["asset-classifier-decision-lane", "asset-classifier-output-score", "asset-classifier-threshold-node", "asset-classifier-positive-call", "asset-classifier-check-mark"],
    dataset: ["asset-dataset-stack", "asset-dataset-layer", "asset-dataset-record-line", "asset-dataset-ingest-arc", "asset-dataset-chip"],
    "foundation-model": ["asset-foundation-model-frame", "asset-foundation-model-layer", "asset-foundation-model-scale-band", "asset-model-block-input-port", "asset-model-block-output-port"],
    "human-review": ["asset-human-review-workspace", "asset-human-review-head", "asset-human-review-queue-row", "asset-human-review-approval-badge", "asset-human-review-approval-check"],
    "model-block": ["asset-model-block-frame", "asset-model-block-layer", "asset-model-block-layer-1", "asset-model-block-input-port", "asset-model-block-output-port"],
    "context-window": ["asset-context-window-shell", "asset-context-token", "asset-context-window-bracket", "asset-context-window-budget", "asset-context-window-utilization"],
    prompt: ["asset-prompt-bubble", "asset-prompt-tail", "asset-prompt-instruction-line", "asset-prompt-context-line", "asset-prompt-system-line"],
    retrieval: ["asset-retrieval-document-stack", "asset-retrieval-match-line", "asset-retrieval-query-lens", "asset-retrieval-result-beam", "asset-retrieval-search-handle"],
    "vector-store": ["asset-vector-store-cylinder-top", "asset-vector-store-cylinder-wall", "asset-vector-store-embedding-space", "asset-vector-store-neighbor-edge", "asset-vector-store-point"],
    memory: ["asset-memory-stack", "asset-memory-layer", "asset-memory-recall-line", "asset-memory-recall-arrow", "asset-memory-persist-node"],
    planner: ["asset-planner-canvas", "asset-planner-route", "asset-planner-milestone", "asset-planner-goal-node", "asset-planner-checkmark"],
    executor: ["asset-executor-console", "asset-executor-run-slot", "asset-executor-run-button", "asset-executor-task-slot", "asset-executor-complete-check"],
    router: ["asset-router-hub-shell", "asset-router-decision-core", "asset-router-input-node", "asset-router-route-line", "asset-router-arrow-head"],
    "multi-agent": ["asset-multi-agent-node", "asset-multi-agent-coordinator", "asset-multi-agent-message-link", "asset-multi-agent-orchestration-ring", "asset-multi-agent-coordinator-plus"],
    scratchpad: ["asset-scratchpad-sheet", "asset-scratchpad-folded-corner", "asset-scratchpad-thought-line", "asset-scratchpad-ink-stroke", "asset-scratchpad-token-strip"],
    "function-schema": ["asset-function-schema-root", "asset-function-schema-field", "asset-function-schema-link", "asset-function-schema-io-port", "asset-function-schema-validation-dot"],
    "tool-call": ["asset-tool-call-envelope", "asset-tool-call-code-bracket", "asset-tool-call-execution-dot", "asset-tool-call-return-port", "asset-tool-call-status-light"],
    "mcp-server": ["asset-mcp-server-rack", "asset-mcp-server-endpoint", "asset-mcp-server-tool-port", "asset-mcp-server-status-led", "asset-mcp-server-export-port"],
    "agent-loop": ["asset-agent-loop-planner-node", "asset-agent-loop-executor-node", "asset-agent-loop-memory-node", "asset-agent-loop-cycle-arrow", "asset-agent-loop-handoff"],
    "risk-gate": ["asset-risk-gate-shield", "asset-risk-gate-boundary", "asset-risk-gate-decision-check", "asset-risk-gate-clearance-bar", "asset-risk-gate-status-node"]
  };
  for (const [assetId, markers] of Object.entries(agenticAssetMarkers)) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("agentic-ai-mcp-rag"));
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" });
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(svg, /data-recipe="standard-/);
    for (const marker of markers) assert.match(svg, new RegExp(`\\b${marker}\\b`), `${assetId} should expose ${marker}`);
  }
  for (const assetId of ["microbiome-community", "gut-microbiome", "pathogen-host-interaction", "mucosal-barrier", "microbiome-profile", "metagenomic-read", "taxonomic-abundance", "antimicrobial-resistance", "microbiome-dysbiosis", "outbreak-cluster", "infection-model", "amr-gene"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("microbiome-infectious-disease"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["car-t-cell", "engineered-t-cell", "tcr-therapy", "nk-cell-therapy", "tumor-antigen", "antigen-presentation", "viral-vector-transduction", "leukapheresis", "cell-expansion", "potency-assay", "infusion-bag", "release-testing"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("cell-therapy"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["image-analysis-pipeline", "microscope-field", "fluorescence-channel", "z-stack", "tile-stitching", "nuclei-segmentation", "membrane-segmentation", "instance-mask", "cell-tracking", "phenotype-feature-vector", "morphology-embedding", "segmentation-model"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("microscopy-image-analysis"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["liquid-handler", "lab-automation-platform", "robotic-arm", "automated-liquid-handler", "plate-handler", "plate-stack", "barcode-scanner", "plate-reader", "reagent-reservoir", "tip-rack", "lims-dashboard", "assay-scheduler", "sample-tracker", "qc-gate-automation", "incubator-stack", "automated-microscope", "automation-orchestrator"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("lab-automation"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["anatomy-overview", "organ-axis-brain-lung-gut", "brain", "lung", "gut", "liver", "heart", "immune-system", "blood-brain-barrier", "kidney", "spleen", "pancreas", "skin", "bone-marrow", "lymph-node", "vasculature", "intestinal-villus", "renal-nephron", "hepatic-lobule", "organ-sample-flow", "tissue-biomarker-panel", "clinical-endpoint-card", "organ-system-network"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "signature");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("anatomy-organ-systems"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["grant-summary-board", "problem-statement-card", "scientific-opportunity-map", "hypothesis-aims", "specific-aim-1", "specific-aim-2", "specific-aim-3", "milestone-roadmap", "budget-envelope", "resource-allocation", "team-capability-map", "stakeholder-map", "decision-brief", "impact-metric-card", "outcome-kpi", "evidence-snapshot", "risk-matrix", "risk-mitigation-plan", "go-no-go-gate", "recommendation-card", "executive-takeaway", "priority-scorecard"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("grant-and-consulting-summary"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["clinical-study-overview", "patient-journey-map", "consent-enrollment", "eligibility-criteria", "cohort-stratification", "trial-design-schema", "clinical-sample-flow", "biospecimen-collection", "clinical-omics-bridge", "biomarker-discovery", "biomarker-validation", "assay-validation", "validation-cohort", "endpoint-hierarchy", "clinical-response-card", "survival-curve", "adverse-event-panel", "safety-monitoring", "clinical-risk-benefit", "regulatory-evidence-brief", "evidence-grade", "clinician-review", "clinical-decision-support"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("clinical-translational"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["microgravity", "spacecraft", "astronaut-sample", "spaceflight-assay", "human-cohort", "cell-muscle", "cell-hepatocyte", "organoid-model", "mouse-model", "blood-sample"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("space-biology-genelab"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["image-registration", "morphology-feature", "confocal-microscope"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("spatial-transcriptomics"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["receptor", "ligand", "cytokine", "metabolite", "enzyme", "transcription-factor", "protein-complex", "pathway-node", "signaling-cascade"]) {
    const asset = getAsset(assetId);
    assert.equal(asset.qualityTier, "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.styleProfiles.includes("publication-line"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
  for (const assetId of ["umi-tag", "read-pair", "peak-call", "genome-browser-track", "variant-snp", "copy-number", "cell-neighborhood", "cell-stem", "cell-dividing", "nucleosome"]) {
    const asset = getAsset(assetId);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.equal(asset.renderSpec.assetRecipe, `hero-${assetId}`);
    assert.ok(asset.workflowPacks.includes("single-cell-multiomics"));
    assert.match(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), new RegExp(`data-recipe="hero-${assetId}"`));
    assert.doesNotMatch(renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" }), /data-recipe="standard-/);
  }
});

test("single-cell multiomics assets expose editable biological and omics markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "cell-b": [/asset-cell-b/, /asset-bcell-bcr-receptor/, /asset-bcell-nucleus/, /asset-bcell-lineage-badge/],
    "cell-dividing": [/asset-cell-dividing/, /asset-dividing-cell-chromosome/, /asset-dividing-cell-spindle/, /asset-dividing-cell-cleavage-furrow/],
    "cell-neighborhood": [/asset-cell-neighborhood/, /asset-neighborhood-adjacency-edge/, /asset-neighborhood-cell-nucleus/, /asset-neighborhood-boundary-ring/],
    "cell-stem": [/asset-cell-stem/, /asset-stem-cell-potency-crown/, /asset-stem-cell-fate-arrow/, /asset-stem-cell-fate-branches/],
    "chromatin": [/asset-chromatin/, /asset-chromatin-nucleosome/, /asset-chromatin-accessibility-track/, /asset-chromatin-epigenetic-mark/],
    "nucleosome": [/asset-nucleosome/, /asset-nucleosome-histone-octamer/, /asset-nucleosome-dna-rung/, /asset-nucleosome-histone-tail/],
    "embedding-space": [/asset-embedding-space/, /asset-single-cell-embedding/, /asset-embedding-point/, /asset-embedding-cluster-hull/],
    "read-pair": [/asset-read-pair/, /asset-read-pair-forward-read/, /asset-read-pair-reverse-read/, /asset-read-pair-insert-arc/],
    "peak-call": [/asset-peak-call/, /asset-peak-call-signal-track/, /asset-peak-call-axis/, /asset-peak-call-boundary/],
    "genome-browser-track": [/asset-genome-browser-track/, /asset-genome-browser-track-lane/, /asset-genome-browser-coordinate-ticks/, /asset-genome-browser-locus-bracket/],
    "variant-snp": [/asset-variant-snp/, /asset-snp-variant-base/, /asset-snp-dna-backbone/, /asset-snp-callout-bubble/],
    "copy-number": [/asset-copy-number/, /asset-copy-number-segment/, /asset-copy-number-gain-segment/, /asset-copy-number-breakpoint-marker/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.ok(asset.workflowPacks.includes("single-cell-multiomics"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, /filter="url\(#asset-soft-shadow\)"/);
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium single-cell asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("commercial visual audit tracks premium-label inflation after high-risk cleanup", () => {
  const audit = getCommercialVisualAudit({ limit: 80 });

  assert.equal(audit.policy.premiumLabelFreeze, true);
  assert.equal(audit.status, "commercial-baseline");
  assert.equal(audit.summary.claimedPremiumAssets, 401);
  assert.equal(audit.summary.highRiskPremiumAssets, 0);
  assert.ok(audit.summary.mediumRiskPremiumAssets > 0);
  assert.equal(audit.summary.factoryTemplateRisks, 0);
  assert.ok(audit.assetRisks.some((risk) => risk.riskReasons.some((reason) => reason.includes("premium-status-is-derived-from-tier"))));
  assert.ok(!audit.templateRisks.some((risk) => risk.skeletonSignature === "five-stage-decision-spine"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "drug-discovery-funnel"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "lab-automation-platform"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "synthetic-biology-platform"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "anatomy-organ-system-overview"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "cell-therapy-manufacturing-platform"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "methods-protocol-overview"));
  assert.ok(!audit.templateRisks.some((risk) => risk.templateId === "microbiome-infectious-disease-platform"));
  assert.ok(!audit.packRisks.some((risk) => risk.riskReasons.some((reason) => reason.includes("flagship-template-uses"))));
  assert.ok(audit.nextActions.some((action) => action.includes("hand-draw")));
});

test("premium assets render non-empty SVG variants", () => {
  for (const asset of CURATED_ASSETS) {
    for (const variant of ["filled", "outline", "soft-3d-vector", "dark", "warning", "selected", "disabled"] as const) {
      const svg = renderPremiumAssetSvg(asset.id, { variant });
      assert.match(svg, /<svg/);
      assert.match(svg, /premium-asset/);
      assert.match(svg, /commercial-premium-asset/);
      assert.match(svg, /asset-contact-shadow/);
      assert.ok(svg.length > 400, `${asset.id} ${variant} render is too small`);
      if (asset.qualityTier === "signature" || asset.qualityTier === "hero") {
        assert.match(svg, new RegExp(`data-quality-tier="${asset.qualityTier}"`));
        assert.match(svg, new RegExp(`data-recipe="hero-${asset.id}"`));
        assert.doesNotMatch(svg, /data-recipe="standard-/);
      }
    }
  }
});

test("molecule and pathway hero assets have distinct premium mechanism markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    protein: [/asset-protein-helix/, /asset-binding-pocket/],
    antibody: [/asset-antibody-fab/, /asset-antibody-epitope/],
    receptor: [/asset-receptor-body/, /asset-receptor-bound-ligand/, /asset-receptor-tail/],
    ligand: [/asset-ligand-ring/, /asset-ligand-second-ring/, /asset-ligand-atom/],
    cytokine: [/asset-cytokine-body/, /asset-cytokine-lobe/, /asset-cytokine-secretion/],
    metabolite: [/asset-metabolite-backbone/, /asset-metabolite-atom/, /asset-metabolite-badge/],
    enzyme: [/asset-enzyme/, /asset-enzyme-cleft/, /asset-enzyme-reaction-arrow/],
    "transcription-factor": [/asset-tf-domain/, /asset-tf-dna/, /asset-tf-binding-site/],
    "protein-complex": [/asset-protein-complex/, /asset-complex-subunit/, /asset-complex-interface/],
    "pathway-node": [/asset-pathway-node/, /asset-pathway-edge/, /asset-phospho-badge/],
    "signaling-cascade": [/asset-signaling-cascade/, /asset-cascade-node/, /asset-cascade-edge/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" });
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("cell and tissue hero assets expose morphology-specific premium markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "cell-t": [
      /asset-tcell-body/,
      /asset-tcell-nucleus/,
      /asset-tcell-uropod/,
      /asset-tcell-immunological-synapse/,
      /asset-tcell-polarization-axis/,
      /asset-tcell-tcr-cluster/,
      /asset-tcell-cytotoxic-granule/
    ],
    "cell-b": [
      /asset-bcell-body/,
      /asset-bcell-nucleus/,
      /asset-bcell-bcr-receptor/,
      /asset-bcell-secreted-antibody/,
      /asset-bcell-bcr-crown/,
      /asset-bcell-lineage-badge/
    ],
    "cell-immune": [
      /asset-cell-immune/,
      /asset-immune-cell-body/,
      /asset-immune-lobed-nucleus/,
      /asset-immune-membrane-ruffle/,
      /asset-immune-membrane-receptor/,
      /asset-immune-granule-field/,
      /asset-immune-cd-badge/
    ],
    "tissue-section": [
      /asset-tissue-slide/,
      /asset-tissue-specimen/,
      /asset-tissue-layer/,
      /asset-tissue-region-boundary/,
      /asset-tissue-capillary/,
      /asset-tissue-nucleus/
    ]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(svg.length > 2400, `${assetId} render is too small to carry premium morphology`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("cell and tissue publication-line style stays clean after morphology upgrade", () => {
  for (const assetId of ["cell-t", "cell-immune", "tissue-section"]) {
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line", width: 180, height: 140 });
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("pathogen and biosafety assets have distinct premium vector markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "virus-particle": [/asset-virus-capsid/, /asset-virus-spike/, /asset-virus-genome/, /asset-virus-risk-halo/],
    bacteria: [/asset-bacteria-body/, /asset-bacteria-flagellum/, /asset-bacteria-nucleoid/, /asset-bacteria-pili/],
    plasmid: [/asset-plasmid-ring/, /asset-plasmid-origin/, /asset-plasmid-cargo/, /asset-plasmid-cut-site/],
    "pathogen-sample": [/asset-pathogen-sample-tube/, /asset-pathogen-sample-particles/, /asset-pathogen-sample-warning/],
    "biohazard-label": [/asset-biohazard-label/, /asset-biohazard-mark/, /asset-biohazard-ring/],
    "biosafety-cabinet": [/asset-bsc-shell/, /asset-bsc-side-post/, /asset-bsc-sash/, /asset-bsc-glass-sash/, /asset-bsc-angled-glass-sash/, /asset-bsc-sash-handle/, /asset-bsc-airflow/, /asset-bsc-airflow-curtain/, /asset-bsc-airflow-arrow/, /asset-bsc-work-zone/, /asset-bsc-work-surface/, /asset-bsc-intake-grille/, /asset-bsc-hepa-filter-grille/, /asset-bsc-hepa-slat/, /asset-bsc-sample-tray/, /asset-bsc-pipette/, /asset-bsc-sample-vial/, /asset-bsc-contained-sample/, /asset-bsc-control-panel/, /asset-bsc-status-light/, /asset-bsc-warning-badge/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "risk-warning", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, /data-style-profile="risk-warning"/);
    assert.ok(svg.length > 1400, `${assetId} render is too small to be premium`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("pathogen publication-line style remains export-clean line art", () => {
  for (const assetId of ["virus-particle", "bacteria", "plasmid", "pathogen-sample", "biohazard-label", "biosafety-cabinet"]) {
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line" });
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("wetlab instrument assets expose distinct premium editable part markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    microscope: [/asset-microscope-head/, /asset-microscope-head-body/, /asset-microscope-ocular/, /asset-microscope-eyepiece-rim/, /asset-microscope-arm/, /asset-microscope-arm-inner-highlight/, /asset-microscope-focus-knob/, /asset-microscope-fine-focus/, /asset-microscope-turret/, /asset-microscope-nosepiece/, /asset-microscope-objective/, /asset-microscope-objective-10x/, /asset-microscope-objective-40x/, /asset-microscope-objective-100x/, /asset-microscope-stage/, /asset-microscope-mechanical-stage/, /asset-microscope-stage-clip/, /asset-microscope-slide/, /asset-microscope-cover-slip/, /asset-microscope-specimen-cell/, /asset-microscope-illuminator/, /asset-microscope-light-cone/, /asset-microscope-base/, /asset-microscope-column/, /asset-instrument-material-highlight/],
    sequencer: [/asset-sequencer-body/, /asset-sequencer-top-lid/, /asset-sequencer-screen/, /asset-sequencer-readout-stack/, /asset-sequencer-run-lane/, /asset-sequencer-flowcell-bay/, /asset-sequencer-optics-window/, /asset-sequencer-cartridge/, /asset-sequencer-door/, /asset-sequencer-reagent-drawer/, /asset-sequencer-sample-tray/, /asset-sequencer-side-panel/, /asset-sequencer-status-light/, /asset-sequencer-led-band/, /asset-sequencer-touch-start/, /asset-sequencer-vent-array/, /asset-instrument-material-highlight/, /asset-instrument-side-rim/, /asset-instrument-foot/, /asset-instrument-fastener/],
    nanopore: [/asset-nanopore-flowcell/, /asset-nanopore-device-shell/, /asset-nanopore-cartridge-rim/, /asset-nanopore-membrane/, /asset-nanopore-pore/, /asset-nanopore-pore-channel/, /asset-nanopore-strand/, /asset-nanopore-threaded-strand/, /asset-nanopore-signal/, /asset-nanopore-signal-panel/, /asset-nanopore-signal-trace/, /asset-nanopore-port/, /asset-nanopore-sample-port/, /asset-nanopore-reagent-port/, /asset-nanopore-array/, /asset-nanopore-electrode-array/, /asset-nanopore-base-ticks/, /asset-nanopore-waste-channel/, /asset-nanopore-channel-track/, /asset-nanopore-black-clip/, /asset-nanopore-sensor-cartridge/, /asset-nanopore-gold-array/, /asset-nanopore-sensor-window/, /asset-nanopore-flowcell-screw/, /asset-nanopore-transparent-cover/, /asset-instrument-material-highlight/],
    "flow-cytometry": [/asset-flow-body/, /asset-flow-fluidics/, /asset-flow-fluidics-tower/, /asset-flow-laser/, /asset-flow-laser-aperture/, /asset-flow-forward-scatter/, /asset-flow-scatter-screen/, /asset-flow-cell-event/, /asset-flow-sample-tube/, /asset-flow-detector/, /asset-flow-detector-stack/, /asset-flow-optics-chamber/, /asset-flow-sheath-core/, /asset-flow-dark-bay/, /asset-flow-led/, /asset-flow-spectral-detector/, /asset-instrument-material-highlight/, /asset-instrument-side-rim/, /asset-instrument-foot/, /asset-instrument-fastener/],
    "cell-sorter": [/asset-sorter-body/, /asset-sorter-droplet-stream/, /asset-sorter-breakoff-droplet/, /asset-sorter-charge-droplet/, /asset-sorter-gate/, /asset-sorter-collection-bin/, /asset-sorter-collection-lane/, /asset-sorter-gating-plot/, /asset-sorter-gating-region/, /asset-sorter-deflection-plates/, /asset-sorter-deflection-left/, /asset-sorter-deflection-right/, /asset-sorter-tube/, /asset-sorter-collection-tube/, /asset-sorter-nozzle/, /asset-sorter-cabinet/, /asset-sorter-monitor/, /asset-sorter-monitor-screen/, /asset-sorter-emergency-stop/, /asset-instrument-material-highlight/, /asset-instrument-side-rim/, /asset-instrument-foot/, /asset-instrument-fastener/],
    "plate-96": [/asset-plate-frame/, /asset-plate-well/, /asset-plate-hit-well/],
    "plate-384": [/asset-plate384-frame/, /asset-plate384-well/, /asset-plate384-hit-well/],
    pipette: [/asset-pipette-body/, /asset-pipette-slim-barrel/, /asset-pipette-plunger/, /asset-pipette-volume-window/, /asset-pipette-tip/, /asset-pipette-fine-tip/, /asset-pipette-droplet/, /asset-pipette-thumb-button/, /asset-pipette-finger-hook/, /asset-pipette-target-well/, /asset-pipette-grip-ridges/, /asset-pipette-ejector-collar/, /asset-pipette-barrel-highlight/, /asset-instrument-material-highlight/],
    centrifuge: [/asset-centrifuge-body/, /asset-centrifuge-lid/, /asset-centrifuge-lid-seam/, /asset-centrifuge-hinge/, /asset-centrifuge-rotor/, /asset-centrifuge-rotor-bowl/, /asset-centrifuge-rotor-hub/, /asset-centrifuge-rotor-arm/, /asset-centrifuge-swing-bucket/, /asset-centrifuge-tube-slot/, /asset-centrifuge-balance-tube/, /asset-centrifuge-spin-arrow/, /asset-centrifuge-control-panel/, /asset-centrifuge-display/, /asset-centrifuge-status-light/, /asset-centrifuge-lid-lock/, /asset-instrument-material-highlight/],
    incubator: [/asset-incubator-body/, /asset-incubator-door-gasket/, /asset-incubator-shelf/, /asset-incubator-shelf-rail/, /asset-incubator-culture-vessel/, /asset-incubator-t-flask/, /asset-incubator-erlenmeyer/, /asset-incubator-culture-plate/, /asset-incubator-media-line/, /asset-incubator-control-panel/, /asset-incubator-door-handle/, /asset-incubator-temperature-display/, /asset-incubator-temperature-glyph/, /asset-incubator-co2-curve/, /asset-incubator-status-light/, /asset-incubator-environment/, /asset-incubator-humidity-droplet/, /asset-incubator-airflow/, /asset-instrument-material-highlight/],
    "microfluidic-chip": [/asset-microfluidic-chip-body/, /asset-microfluidic-glass-substrate/, /asset-microfluidic-channel-network/, /asset-microfluidic-channel-lumen/, /asset-microfluidic-inlet-channel/, /asset-microfluidic-outlet-channel/, /asset-microfluidic-mixing-chamber/, /asset-microfluidic-droplet-junction/, /asset-microfluidic-inlet-port/, /asset-microfluidic-outlet-port/, /asset-microfluidic-reagent-port/, /asset-microfluidic-valve/, /asset-microfluidic-sample-valve/, /asset-microfluidic-sort-valve/, /asset-microfluidic-droplet/, /asset-microfluidic-sorted-droplet/, /asset-microfluidic-flow-arrow/, /asset-microfluidic-scale-ticks/, /asset-microfluidic-label-strip/, /asset-instrument-material-highlight/],
    "gel-electrophoresis": [/asset-gel-electrophoresis-cassette/, /asset-gel-electrophoresis-tray/, /asset-gel-electrophoresis-gel-slab/, /asset-gel-electrophoresis-well-comb/, /asset-gel-electrophoresis-sample-well/, /asset-gel-electrophoresis-ladder-well/, /asset-gel-electrophoresis-lane-map/, /asset-gel-electrophoresis-ladder-band/, /asset-gel-electrophoresis-sample-band/, /asset-gel-electrophoresis-target-band/, /asset-gel-electrophoresis-dye-front/, /asset-gel-electrophoresis-size-ruler/, /asset-gel-electrophoresis-electrode-rails/, /asset-gel-electrophoresis-negative-electrode/, /asset-gel-electrophoresis-positive-electrode/, /asset-gel-electrophoresis-migration-arrow/, /asset-instrument-material-highlight/],
    "western-blot": [/asset-western-blot-cassette/, /asset-western-blot-frame/, /asset-western-blot-membrane/, /asset-western-blot-lane-map/, /asset-western-blot-lane-guide/, /asset-western-blot-ladder-band/, /asset-western-blot-band/, /asset-western-blot-target-band/, /asset-western-blot-control-band/, /asset-western-blot-molecular-weight-axis/, /asset-western-blot-exposure-strip/, /asset-western-blot-antibody-probe/, /asset-western-blot-probe-stem/, /asset-western-blot-antibody-y/, /asset-western-blot-probe-label/, /asset-western-blot-detection-signal/, /asset-instrument-material-highlight/],
    "qpcr-machine": [/asset-qpcr-machine-body/, /asset-qpcr-instrument-shell/, /asset-qpcr-heated-lid/, /asset-qpcr-lid-window/, /asset-qpcr-lid-hinge/, /asset-qpcr-heater-line/, /asset-qpcr-thermal-block/, /asset-qpcr-thermal-block-well/, /asset-qpcr-active-well/, /asset-qpcr-reference-well/, /asset-qpcr-optical-head/, /asset-qpcr-optical-arm/, /asset-qpcr-fluorescence-optics/, /asset-qpcr-fluorescence-beam/, /asset-qpcr-amplification-readout/, /asset-qpcr-ct-display/, /asset-qpcr-ct-label/, /asset-qpcr-curve-axis/, /asset-qpcr-amplification-curve/, /asset-qpcr-threshold-line/, /asset-qpcr-ct-crossing/, /asset-instrument-material-highlight/],
    "mass-spectrometer": [/asset-mass-spec-body/, /asset-mass-spec-instrument-shell/, /asset-mass-spec-ion-source/, /asset-mass-spec-source-bay/, /asset-mass-spec-spray-needle/, /asset-mass-spec-sample-ion/, /asset-mass-spec-ion-droplet/, /asset-mass-spec-analyzer/, /asset-mass-spec-flight-tube/, /asset-mass-spec-quadrupole-rods/, /asset-mass-spec-fragment-ion/, /asset-mass-spec-detector/, /asset-mass-spec-detector-panel/, /asset-mass-spec-spectrum-readout/, /asset-mass-spec-spectrum-panel/, /asset-mass-spec-spectrum-axis/, /asset-mass-spec-peak/, /asset-mass-spec-base-peak/, /asset-mass-spec-vacuum-stage/, /asset-mass-spec-status-light/, /asset-instrument-material-highlight/],
    "liquid-handler": [/asset-liquid-handler-body/, /asset-liquid-handler-instrument-shell/, /asset-liquid-handler-deck/, /asset-liquid-handler-deck-rail/, /asset-liquid-handler-deck-position/, /asset-liquid-handler-source-plate/, /asset-liquid-handler-destination-plate/, /asset-liquid-handler-well/, /asset-liquid-handler-hit-well/, /asset-liquid-handler-reagent-reservoir/, /asset-liquid-handler-tip-rack/, /asset-liquid-handler-tip-slot/, /asset-liquid-handler-waste-chute/, /asset-liquid-handler-gantry/, /asset-liquid-handler-gantry-rail/, /asset-liquid-handler-z-head/, /asset-liquid-handler-pipetting-head/, /asset-liquid-handler-ejector-bar/, /asset-liquid-handler-tip-comb/, /asset-liquid-handler-tip/, /asset-liquid-handler-active-tip/, /asset-liquid-handler-transfer-route/, /asset-liquid-handler-droplet/, /asset-liquid-handler-status-light/, /asset-instrument-material-highlight/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, /data-family="instrument"/);
    assert.ok(svg.length > 2800, `${assetId} render is too small to be a premium instrument`);
    for (const marker of markers) assert.match(svg, marker);
  }

  const plate96Svg = renderPremiumAssetSvg("plate-96", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  const plate384Svg = renderPremiumAssetSvg("plate-384", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  assert.equal((plate96Svg.match(/asset-plate-well/g) ?? []).length, 96);
  assert.equal((plate384Svg.match(/asset-plate384-well/g) ?? []).length, 384);
  assert.match(plate384Svg, /data-row="15"/);
  assert.match(plate384Svg, /data-col="23"/);
});

test("wetlab instrument publication-line style remains export-clean line art", () => {
  for (const assetId of ["microscope", "sequencer", "nanopore", "flow-cytometry", "cell-sorter", "plate-96", "plate-384", "pipette", "centrifuge", "incubator", "microfluidic-chip", "gel-electrophoresis", "western-blot", "qpcr-machine", "mass-spectrometer", "liquid-handler"]) {
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line" });
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("molecule and pathway hero assets use varied palettes and clean publication line art", () => {
  const mechanismIds = [
    "protein",
    "antibody",
    "receptor",
    "ligand",
    "cytokine",
    "metabolite",
    "enzyme",
    "transcription-factor",
    "protein-complex",
    "pathway-node",
    "signaling-cascade"
  ];
  const accents = new Set(mechanismIds.map((assetId) => getAsset(assetId).renderSpec.accent));

  assert.ok(accents.size >= 9, `expected varied accents, got ${Array.from(accents).join(", ")}`);
  assert.notEqual(getAsset("receptor").renderSpec.accent, getAsset("ligand").renderSpec.accent);
  assert.notEqual(getAsset("cytokine").renderSpec.accent, getAsset("metabolite").renderSpec.accent);
  assert.notEqual(getAsset("antibody").renderSpec.secondary, "#e0f2fe");

  for (const assetId of mechanismIds) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d" });
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line" });
    assert.match(svg, new RegExp(`data-accent="${getAsset(assetId).renderSpec.accent}"`));
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("perturb-seq core assets expose distinct premium editable part markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "scrna-droplet": [/asset-scrna-droplet-shell/, /asset-scrna-cell/, /asset-scrna-barcode-bead/, /asset-scrna-umi-tag/, /asset-scrna-oil-rim/],
    "guide-rna": [/asset-grna-backbone/, /asset-grna-spacer/, /asset-grna-scaffold-loop/, /asset-grna-pam-badge/, /asset-grna-target-window/],
    "lentiviral-library": [/asset-lentiviral-particle/, /asset-lentiviral-capsid/, /asset-lentiviral-vector-card/, /asset-lentiviral-barcode/, /asset-lentiviral-payload/],
    "expression-matrix": [/asset-expression-matrix-frame/, /asset-expression-matrix-cell/, /asset-expression-matrix-hit/, /asset-expression-matrix-dendrogram/, /asset-expression-matrix-axis/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, /filter="url\(#asset-soft-shadow\)"/);
    assert.ok(svg.length > 6200, `${assetId} render is too small to be a premium Perturb-seq asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("perturb-seq editing and readout assets expose agent-addressable part markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "crispr-cas9": [/asset-crispr-cas9/, /asset-crispr-target-dna/, /asset-crispr-cas9-body/, /asset-crispr-guide-rna/, /asset-crispr-cut-site/],
    "cell-barcode": [/asset-cell-barcode/, /asset-cell-barcode-frame/, /asset-cell-barcode-bar/, /asset-cell-barcode-read-window/, /asset-cell-barcode-anchor-dot/],
    "sequencing-read": [/asset-sequencing-read/, /asset-sequencing-read-frame/, /asset-sequencing-read-base/, /asset-sequencing-quality-track/, /asset-sequencing-quality-sparkline/],
    "umi-tag": [/asset-umi-tag/, /asset-umi-barcode-bead/, /asset-umi-capture-window/, /asset-umi-capture-hairpin/, /asset-umi-status-dot/],
    "knockdown": [/asset-gene-edit-state/, /asset-gene-edit-knockdown-arrow/, /asset-gene-edit-target-exon/, /asset-gene-edit-editor-block/],
    "activation": [/asset-gene-edit-state/, /asset-gene-edit-activation-arrow/, /asset-gene-edit-target-exon/, /asset-gene-edit-editor-block/],
    "inhibition": [/asset-gene-edit-state/, /asset-gene-edit-inhibition-block/, /asset-gene-edit-target-exon/, /asset-gene-edit-editor-block/],
    "base-editor": [/asset-gene-edit-base-editor/, /asset-base-editor-edit-mark/, /asset-gene-edit-target-exon/, /asset-gene-edit-editor-block/],
    "prime-editor": [/asset-prime-editor/, /asset-prime-editor-body/, /asset-prime-editor-peg-rna/, /asset-prime-editor-rt-badge/, /asset-prime-editor-nick-site/],
    "cell-macrophage": [/asset-cell-macrophage/, /asset-macrophage-pseudopod/, /asset-macrophage-bean-nucleus/, /asset-macrophage-phagosome/, /asset-macrophage-vacuole/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.ok(asset.workflowPacks.includes("perturb-seq-crispr"), `${assetId} should belong to perturb-seq-crispr`);
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, /filter="url\(#asset-soft-shadow\)"/);
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium Perturb-seq editing/readout asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("perturb-seq core publication-line assets remain export-clean line art", () => {
  for (const assetId of ["scrna-droplet", "guide-rna", "lentiviral-library", "expression-matrix"]) {
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line", width: 180, height: 140 });
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("drug discovery broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "compound-library": [/asset-compound-library-tray/, /asset-compound-library-vial/, /asset-compound-library-hit/, /asset-compound-library-molecule/, /asset-compound-library-hit-ring/, /asset-compound-library-tray-depth/],
    "target-validation": [/asset-target-validation-evidence-dossier/, /asset-target-validation-receptor/, /asset-target-validation-assay/, /asset-target-validation-check/, /asset-target-validation-evidence-link/, /asset-target-validation-ligand-lock/, /asset-target-validation-confidence-meter/, /asset-target-validation-orthogonal-evidence/],
    "hit-triage": [/asset-hit-triage-funnel/, /asset-hit-triage-funnel-glass/, /asset-hit-triage-input-dot/, /asset-hit-triage-rank/, /asset-hit-triage-evidence-path/, /asset-hit-triage-badge/],
    "dose-response-curve": [/asset-dose-response-panel/, /asset-dose-response-axis/, /asset-dose-response-curve/, /asset-dose-response-point/, /asset-dose-response-ic50/, /asset-dose-response-confidence-band/, /asset-dose-response-threshold/],
    "admet-panel": [/asset-admet-panel/, /asset-admet-organ/, /asset-admet-meter/, /asset-admet-review-shield/, /asset-admet-risk-band/, /asset-admet-clearance-flow/],
    "toxicity-screen": [/asset-toxicity-screen-plate/, /asset-toxicity-dose-gradient/, /asset-toxicity-cell/, /asset-toxicity-stressed-cell/, /asset-toxicity-apoptosis-markers/, /asset-toxicity-screen-warning/, /asset-toxicity-viability-curve/, /asset-toxicity-dose-readout/],
    "lead-series": [/asset-lead-series-molecule/, /asset-lead-series-rank/, /asset-lead-series-scaffold-link/, /asset-lead-series-optimization-arrow/, /asset-lead-series-anchor-scaffold/],
    "candidate-nomination": [/asset-candidate-nomination-card/, /asset-candidate-nomination-molecule/, /asset-candidate-nomination-stamp/, /asset-candidate-nomination-flag/, /asset-candidate-nomination-package-tab/, /asset-candidate-nomination-readiness-gate/],
    "target-engagement": [/asset-target-engagement-membrane/, /asset-target-engagement-membrane-lipid/, /asset-target-engagement-receptor/, /asset-target-engagement-ligand/, /asset-target-engagement-bound-complex/, /asset-target-engagement-occupancy/, /asset-target-engagement-phospho-signal/, /asset-target-engagement-assay-arc/],
    "selectivity-panel": [/asset-selectivity-landscape/, /asset-selectivity-landscape-cell/, /asset-selectivity-target-cell/, /asset-selectivity-ratio/, /asset-selectivity-target-beam/, /asset-selectivity-offtarget-warning/],
    "pk-profile": [/asset-pk-profile-panel/, /asset-pk-profile-axis/, /asset-pk-profile-curve/, /asset-pk-profile-timepoint/, /asset-pk-profile-plasma-tube/, /asset-pk-profile-half-life-band/, /asset-pk-profile-clearance-arrow/],
    "sar-table": [/asset-sar-optimization-map/, /asset-sar-optimization-scaffold/, /asset-sar-optimization-sidechain/, /asset-sar-optimization-series/, /asset-sar-optimization-molecule/, /asset-sar-optimization-potency-path/, /asset-sar-optimization-delta/, /asset-sar-optimization-rgroup-track/, /asset-sar-optimization-best-series/],
    "medicinal-chemistry-cycle": [/asset-medchem-cycle-orbit/, /asset-medchem-cycle-arrow/, /asset-medchem-cycle-molecule/, /asset-medchem-cycle-step/, /asset-medchem-cycle-central-card/, /asset-medchem-cycle-decision-gate/],
    "drug-perturbation": [/asset-drug-perturbation-pill/, /asset-drug-perturbation-pill-band/, /asset-drug-perturbation-cell/, /asset-drug-perturbation-exposure-path/, /asset-drug-perturbation-response/, /asset-drug-perturbation-response-arrow/],
    "efficacy-model": [/asset-efficacy-model-subject/, /asset-efficacy-model-tumor/, /asset-efficacy-model-response/, /asset-efficacy-model-dose/, /asset-efficacy-model-tumor-volume-axis/, /asset-efficacy-model-treatment-arm/, /asset-efficacy-model-response-badge/],
    "biomarker-response": [/asset-biomarker-response-panel/, /asset-biomarker-response-stratum/, /asset-biomarker-response-chart/, /asset-biomarker-response-badge/, /asset-biomarker-response-cutpoint/, /asset-biomarker-response-responder-band/, /asset-biomarker-response-sample-dots/],
    "ind-enabling-package": [/asset-ind-package-dossier/, /asset-ind-package-checklist/, /asset-ind-package-regulatory-stamp/, /asset-ind-package-readiness-gate/, /asset-ind-package-readiness-ribbon/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("drug-discovery"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 1900, `${assetId} render is too small to be a premium drug discovery asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("drug discovery supporting anchors keep distinct visual silhouettes", () => {
  const markerGroups: Record<string, RegExp[]> = {
    "metric-card": [/asset-metric-evidence-slate/, /asset-metric-evidence-score-dial/, /asset-metric-evidence-ranked-rows/, /asset-metric-evidence-decision-mark/, /asset-metric-evidence-trend/],
    "calibration": [/asset-calibration-curve-frame/, /asset-calibration-curve-axes/, /asset-calibration-curve-ideal-line/, /asset-calibration-curve-observed-line/, /asset-calibration-curve-bin/, /asset-calibration-curve-ruler/],
    "protein": [/asset-protein-surface/, /asset-protein-domain-patch/, /asset-protein-helix/, /asset-protein-beta/, /asset-binding-pocket/, /asset-protein-pocket-ligand/],
    "receptor": [/asset-receptor-membrane/, /asset-receptor-lipid-core/, /asset-receptor-body/, /asset-receptor-transmembrane-domain/, /asset-receptor-bound-ligand/],
    "ligand": [/asset-ligand-ring/, /asset-ligand-second-ring/, /asset-ligand-atom/],
    "pathway-node": [/asset-pathway-node/, /asset-pathway-core-node/, /asset-pathway-node-inner-ring/, /asset-pathway-edge/, /asset-phospho-badge/, /asset-pathway-node-label-p/],
    "signaling-cascade": [/asset-signaling-cascade/, /asset-cascade-node/, /asset-cascade-node-body/, /asset-cascade-phospho-dot/, /asset-cascade-edge/, /asset-cascade-output-label/],
    "protein-complex": [/asset-protein-complex/, /asset-complex-subunit/, /asset-complex-subunit-highlight/, /asset-complex-active-site/, /asset-complex-interface/, /asset-complex-assembly-arc/],
    "metabolite": [/asset-metabolite/, /asset-metabolite-backbone/, /asset-metabolite-accent-bond/, /asset-metabolite-atom/, /asset-metabolite-spectrum-label/],
    "error-analysis": [/asset-error-analysis/, /asset-error-analysis-frame/, /asset-error-analysis-grid-cell/, /asset-error-analysis-lens/, /asset-error-analysis-check/],
    "arrayed-screen": [/asset-arrayed-screen/, /asset-arrayed-screen-well/, /asset-arrayed-screen-hit-well/, /asset-arrayed-screen-check/, /asset-screening-hit-call/],
    "pooled-screen": [/asset-pooled-screen/, /asset-pooled-screen-well/, /asset-pooled-screen-hit-well/, /asset-pooled-screen-pool-lens/, /asset-screening-readout/],
    "plate-96": [/asset-plate96/, /asset-plate-frame/, /asset-plate96-well-map/, /asset-plate-hit-well/, /asset-plate96-hit-check/],
    "plate-384": [/asset-plate384/, /asset-plate384-density-grid/, /asset-plate384-well/, /asset-plate384-format-badge/, /asset-plate384-rim-highlight/],
    "cell-tumor": [/asset-cell-tumor/, /asset-tumor-cell-body/, /asset-tumor-cell-membrane/, /asset-tumor-cell-nucleus/, /asset-tumor-cell-stress-fiber/],
    "gene-locus": [/asset-gene-locus/, /asset-gene-track-ruler/, /asset-gene-exon/, /asset-gene-direction-arrow/, /asset-gene-locus-signal/]
  };

  for (const [assetId, markers] of Object.entries(markerGroups)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.ok(asset.workflowPacks.includes("drug-discovery"), `${assetId} should stay available to drug-discovery agents`);
    assert.match(svg, /commercial-premium-asset/);
    for (const marker of markers) assert.match(svg, marker);
  }
  assert.doesNotMatch(renderPremiumAssetSvg("calibration", { styleProfile: "consulting-2p5d" }), /asset-metric-evidence-score-dial/);
});

test("protein engineering broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "protein-domain": [/asset-protein-engineering-domain/, /asset-protein-domain-lobe/, /asset-protein-domain-linker/],
    "binding-pocket": [/asset-protein-engineering-pocket/, /asset-binding-pocket-cavity/, /asset-binding-pocket-ligand/],
    "directed-evolution": [/asset-protein-engineering-evolution/, /asset-directed-evolution-cycle/, /asset-directed-evolution-selection-gate/],
    "affinity-maturation": [/asset-protein-engineering-affinity/, /asset-affinity-maturation-antibody/, /asset-affinity-maturation-gauge/],
    "protein-design-model": [/asset-protein-engineering-design-model/, /asset-protein-design-model-ribbon/, /asset-protein-design-model-graph/, /asset-protein-design-model-latent-field/],
    "purification-column": [/asset-protein-engineering-purification/, /asset-purification-column/, /asset-purification-fractions/],
    "developability-profile": [/asset-protein-engineering-developability/, /asset-developability-profile-radar/, /asset-developability-risk-chip/],
    "sequence-logo": [/asset-protein-engineering-sequence-logo/, /asset-sequence-logo-lattice/, /asset-sequence-logo-column/, /asset-sequence-logo-conservation-arc/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("protein-engineering"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium protein-engineering asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("synthetic biology broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "genetic-circuit": [/asset-synbio-genetic-circuit/, /asset-genetic-circuit-feedback/, /asset-genetic-circuit-node/],
    "promoter-library": [/asset-synbio-promoter-library/, /asset-promoter-library-variant/, /asset-promoter-library-dna-track/, /asset-promoter-library-strength-bead/],
    "plasmid-vector": [/asset-synbio-plasmid-vector/, /asset-plasmid-vector-ring/, /asset-plasmid-vector-cargo/],
    "dna-assembly": [/asset-synbio-dna-assembly/, /asset-dna-assembly-fragment/, /asset-dna-assembly-assembly-arrow/],
    "design-build-test-learn-cycle": [/asset-synbio-dbtl/, /asset-dbtl-cycle-arrow/, /asset-dbtl-stage/],
    "chassis-cell": [/asset-synbio-chassis/, /asset-synbio-chassis-cell/, /asset-chassis-expression-output/],
    "biosensor-circuit": [/asset-synbio-biosensor/, /asset-biosensor-signal/, /asset-biosensor-readout-card/],
    "metabolic-pathway-engineering": [/asset-synbio-metabolic-pathway/, /asset-metabolic-pathway-node/, /asset-metabolic-pathway-flux-edge/],
    "pathway-flux-map": [/asset-synbio-flux-map/, /asset-flux-map-node/, /asset-flux-map-flux-edge/, /asset-flux-map-trajectory/],
    "kill-switch": [/asset-synbio-kill-switch/, /asset-kill-switch-shield/, /asset-kill-switch-toggle/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("synthetic-biology"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium synthetic-biology asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
  const promoterLibrarySvg = renderPremiumAssetSvg("promoter-library", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  assert.doesNotMatch(promoterLibrarySvg, /asset-promoter-library-card|asset-synbio-panel/);
  const dbtlSvg = renderPremiumAssetSvg("design-build-test-learn-cycle", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  assert.doesNotMatch(dbtlSvg, /asset-synbio-panel/);
  const fluxMapSvg = renderPremiumAssetSvg("pathway-flux-map", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  assert.doesNotMatch(fluxMapSvg, /asset-synbio-panel|asset-flux-map-cell/);
});

test("microbiome infectious disease broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "microbiome-community": [/asset-microbiome-community/, /asset-microbiome-community-cell/, /asset-microbiome-community-ring/],
    "gut-microbiome": [/asset-microbiome-gut/, /asset-gut-microbiome-tract/, /asset-gut-microbiome-microbe/],
    "pathogen-host-interaction": [/asset-microbiome-host-interaction/, /asset-pathogen-host-barrier/, /asset-pathogen-host-microbe/],
    "mucosal-barrier": [/asset-microbiome-mucosal-barrier/, /asset-mucosal-barrier-layer/, /asset-mucosal-barrier-mucus/],
    "metagenomic-read": [/asset-microbiome-metagenomic-read/, /asset-metagenomic-read-stack/, /asset-metagenomic-kmer/],
    "taxonomic-abundance": [/asset-microbiome-taxonomic-abundance/, /asset-taxonomic-abundance-bar/, /asset-taxonomic-abundance-legend/],
    "antimicrobial-resistance": [/asset-microbiome-amr/, /asset-antimicrobial-resistance-shield/, /asset-antimicrobial-resistance-zone/],
    "outbreak-cluster": [/asset-microbiome-outbreak-cluster/, /asset-outbreak-cluster-node/, /asset-outbreak-cluster-edge/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("microbiome-infectious-disease"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium microbiome asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("cell therapy broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "car-t-cell": [/asset-cell-therapy-car-t/, /asset-car-t-receptor/, /asset-car-t-tumor-target/],
    "engineered-t-cell": [/asset-cell-therapy-engineered-t/, /asset-engineered-t-gene-insert/, /asset-engineered-t-edit-arrow/],
    "tcr-therapy": [/asset-cell-therapy-tcr/, /asset-tcr-peptide-mhc/, /asset-tcr-recognition-bridge/],
    "nk-cell-therapy": [/asset-cell-therapy-nk/, /asset-nk-granule-burst/, /asset-nk-target-cell/],
    "viral-vector-transduction": [/asset-cell-therapy-viral-vector/, /asset-viral-vector-particle/, /asset-viral-vector-transduction-arrow/],
    leukapheresis: [/asset-cell-therapy-leukapheresis/, /asset-leukapheresis-loop/, /asset-leukapheresis-blood-bag/],
    "cell-expansion": [/asset-cell-therapy-cell-expansion/, /asset-cell-expansion-flask/, /asset-cell-expansion-clone/],
    "release-testing": [/asset-cell-therapy-release-testing/, /asset-release-testing-checklist/, /asset-release-testing-coa-badge/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("cell-therapy"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium cell-therapy asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("microscopy image analysis broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "image-analysis-pipeline": [/asset-microscopy-analysis-pipeline/, /asset-image-analysis-raw-tile/, /asset-image-analysis-pipeline-arrow/],
    "microscope-field": [/asset-microscopy-analysis-field/, /asset-microscope-field-fov/, /asset-microscope-field-scale-bar/],
    "fluorescence-channel": [/asset-microscopy-analysis-channel/, /asset-fluorescence-channel-stack/, /asset-fluorescence-channel-merge/],
    "z-stack": [/asset-microscopy-analysis-z-stack/, /asset-z-stack-slice-volume/, /asset-z-stack-optical-slice/, /asset-z-stack-depth-arrow/],
    "tile-stitching": [/asset-microscopy-analysis-tile-stitching/, /asset-tile-stitching-mosaic/, /asset-microscopy-mosaic-tile/, /asset-tile-stitching-registration-seam/],
    "nuclei-segmentation": [/asset-microscopy-analysis-nuclei-segmentation/, /asset-nuclei-segmentation-mask/, /asset-nuclei-segmentation-contour/],
    "membrane-segmentation": [/asset-microscopy-analysis-membrane-segmentation/, /asset-membrane-segmentation-tile/, /asset-membrane-segmentation-contour/],
    "instance-mask": [/asset-microscopy-analysis-instance-mask/, /asset-instance-mask-region/, /asset-instance-mask-id-badges/],
    "cell-tracking": [/asset-microscopy-analysis-cell-tracking/, /asset-cell-tracking-trajectory/, /asset-cell-tracking-timepoint/],
    "segmentation-model": [/asset-microscopy-analysis-segmentation-model/, /asset-segmentation-model-network/, /asset-segmentation-model-output-mask/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("microscopy-image-analysis"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium microscopy image-analysis asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("lab automation broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "lab-automation-platform": [/asset-lab-automation-workcell/, /asset-lab-automation-run-trace/, /asset-lab-automation-run-route/, /asset-lab-automation-deck-map/],
    "robotic-arm": [/asset-lab-automation-robotic-arm/, /asset-robotic-arm-joint/, /asset-robotic-arm-gripper/],
    "automated-liquid-handler": [/asset-lab-automation-automated-liquid-handler/, /asset-automated-liquid-handler-gantry/, /asset-automated-liquid-handler-gantry-rail/, /asset-liquid-handler-head/, /asset-automated-liquid-handler-z-head/, /asset-automated-liquid-handler-pipetting-head/, /asset-automated-liquid-handler-tip-comb/, /asset-automated-liquid-handler-active-tip/, /asset-liquid-handler-deck/, /asset-automated-liquid-handler-deck/, /asset-automated-liquid-handler-deck-rail/, /asset-automated-liquid-handler-source-plate/, /asset-automated-liquid-handler-destination-plate/, /asset-automated-liquid-handler-well/, /asset-automated-liquid-handler-active-well/, /asset-automated-liquid-handler-reagent-reservoir/, /asset-automated-liquid-handler-tip-rack/, /asset-automated-liquid-handler-tip-slot/, /asset-automated-liquid-handler-waste-chute/, /asset-automated-liquid-handler-transfer-route/, /asset-automated-liquid-handler-droplet/],
    "plate-handler": [/asset-lab-automation-plate-handler/, /asset-plate-handler-shuttle/, /asset-plate-handler-plate/],
    "plate-stack": [/asset-lab-automation-plate-stack/, /asset-plate-stack-layer/, /asset-plate-stack-loader/],
    "barcode-scanner": [/asset-lab-automation-barcode-scanner/, /asset-barcode-scanner-beam/, /asset-barcode-label/],
    "plate-reader": [/asset-lab-automation-plate-reader/, /asset-plate-reader-optics/, /asset-plate-reader-signal/],
    "lims-dashboard": [/asset-lab-automation-lims-run-monitor/, /asset-lims-sample-ledger/, /asset-lims-sample-ledger-route/, /asset-lims-run-state/],
    "assay-scheduler": [/asset-lab-automation-assay-scheduler/, /asset-assay-scheduler-timeline/, /asset-assay-scheduler-lane/],
    "qc-gate-automation": [/asset-lab-automation-qc-gate/, /asset-automation-qc-gate/, /asset-automation-qc-threshold/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("lab-automation"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 2500, `${assetId} render is too small to be a premium lab automation asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("premium asset preview labels wrap long names inside compact viewBox", () => {
  const svg = renderPremiumAssetSvg("automated-liquid-handler", {
    styleProfile: "consulting-2p5d",
    width: 120,
    height: 96
  });

  assert.match(svg, /class="asset-label asset-label-fit"/);
  assert.match(svg, /class="asset-label-pill"/);
  assert.match(svg, /data-label-lines="2"/);
  assert.match(svg, /<tspan x="60" y="[0-9.]+">Automated liquid<\/tspan>/);
  assert.match(svg, /<tspan x="60" dy="[0-9.]+">handler<\/tspan>/);
  assert.doesNotMatch(svg, />Automated liquid handler<\/text>/);
});

test("anatomy organ systems broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "anatomy-overview": [/asset-anatomy-overview/, /asset-anatomy-organ-card/, /asset-anatomy-axis-link/],
    "organ-axis-brain-lung-gut": [/asset-organ-axis-brain-lung-gut/, /asset-organ-axis-node/, /asset-organ-axis-connector/],
    brain: [/asset-anatomy-brain/, /asset-brain-cortical-folds/, /asset-brain-stem/],
    lung: [/asset-anatomy-lung/, /asset-lung-bronchial-tree/, /asset-lung-alveoli-cluster/],
    gut: [/asset-anatomy-gut/, /asset-gut-colon/, /asset-gut-microbiome/],
    liver: [/asset-anatomy-liver/, /asset-liver-portal/, /asset-liver-gallbladder/],
    heart: [/asset-anatomy-heart/, /asset-heart-aorta/, /asset-heart-chamber-septa/],
    "immune-system": [/asset-anatomy-immune-system/, /asset-immune-system-node/, /asset-immune-lineage-map/],
    "blood-brain-barrier": [/asset-blood-brain-barrier/, /asset-bbb-junction/, /asset-bbb-astrocyte-foot/],
    kidney: [/asset-anatomy-kidney/, /asset-kidney-cortex/, /asset-kidney-vessel/],
    spleen: [/asset-anatomy-spleen/, /asset-spleen-white-pulp/],
    pancreas: [/asset-anatomy-pancreas/, /asset-pancreas-duct/],
    skin: [/asset-anatomy-skin/, /asset-skin-layer/],
    "bone-marrow": [/asset-anatomy-bone-marrow/, /asset-bone-marrow-cell/],
    "lymph-node": [/asset-anatomy-lymph-node/, /asset-lymph-node-follicle/],
    vasculature: [/asset-anatomy-vasculature/, /asset-vasculature-branch/],
    "renal-nephron": [/asset-anatomy-renal-nephron/, /asset-nephron-loop/],
    "hepatic-lobule": [/asset-anatomy-hepatic-lobule/, /asset-hepatic-lobule-sinusoid/],
    "cardiac-muscle": [/asset-anatomy-heart-muscle/, /asset-heart-muscle-fiber/, /asset-heart-intercalated-disc/],
    "human-cohort": [/asset-human-cohort/, /asset-human-cohort-people/, /asset-human-cohort-consent-card/],
    "organoid-model": [/asset-organoid-model/, /asset-organoid-lobular-body/, /asset-organoid-lobe/],
    "mouse-model": [/asset-mouse-model/, /asset-mouse-body/, /asset-mouse-tail/],
    "cell-epithelial": [/asset-cell-epithelial/, /asset-epithelial-cell-column/, /asset-epithelial-basement-membrane/],
    "cell-neuron": [/asset-cell-neuron/, /asset-neuron-soma/, /asset-neuron-axon-dendrite-tree/],
    "cell-hepatocyte": [/asset-cell-hepatocyte/, /asset-hepatocyte-cell-plate/, /asset-hepatocyte-sinusoid/],
    "cell-muscle": [/asset-cell-muscle/, /asset-muscle-fiber/, /asset-muscle-striation/],
    "blood-sample": [/asset-blood-sample/, /asset-blood-sample-tube/, /asset-red-blood-cell/],
    "histology-section": [/asset-histology-section/, /asset-histology-gland/, /asset-histology-nucleus-speckle/],
    "spatial-grid": [/asset-spatial-grid/, /asset-spatial-grid-spot/, /asset-spatial-grid-axis/],
    "tissue-biomarker-panel": [/asset-anatomy-biomarker-matrix/, /asset-biomarker-row/],
    "clinical-endpoint-card": [/asset-anatomy-clinical-endpoint-card/, /asset-clinical-endpoint-row/],
    "organ-system-network": [/asset-anatomy-organ-system-network/, /asset-organ-system-network-node/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("anatomy-organ-systems"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium anatomy asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("methods and protocols broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "protocol-overview": [/asset-methods-protocol-overview/, /asset-methods-step-node/, /asset-methods-review-gate/],
    "sample-prep-workflow": [/asset-methods-sample-prep-workflow/, /asset-sample-prep-input-tube/, /asset-methods-tube-liquid/, /asset-sample-prep-cleanup/],
    "reagent-mastermix": [/asset-methods-reagent-mastermix/, /asset-reagent-mastermix-bottle/, /asset-reagent-mastermix-droplet/],
    "serial-dilution": [/asset-methods-serial-dilution/, /asset-serial-dilution-tube-row/, /asset-serial-dilution-gradient/],
    "wash-step": [/asset-methods-wash-step/, /asset-wash-buffer-stream/, /asset-wash-step-plate/, /asset-methods-plate-well-map/],
    "pcr-amplification": [/asset-methods-pcr-amplification/, /asset-pcr-thermocycler/, /asset-pcr-helix/],
    "qpcr-assay": [/asset-methods-qpcr-assay/, /asset-qpcr-instrument/, /asset-qpcr-amplification-curve/, /asset-methods-curve-axis/, /asset-methods-curve-endpoint/],
    "elisa-assay": [/asset-methods-elisa-assay/, /asset-elisa-plate/, /asset-methods-plate-hit-well/, /asset-elisa-antibody-bridge/],
    "western-blot-workflow": [/asset-methods-western-blot-workflow/, /asset-western-blot-gel/, /asset-western-blot-bands/],
    "gel-imaging": [/asset-methods-gel-imaging/, /asset-gel-imaging-box/, /asset-gel-imaging-bands/],
    "immunostaining": [/asset-methods-immunostaining/, /asset-immunostaining-cells/, /asset-immunostaining-antibody/],
    "fixation-permeabilization": [/asset-methods-fixation-permeabilization/, /asset-fixperm-cell/, /asset-fixperm-permeabilization-drops/],
    "cell-culture-passaging": [/asset-methods-cell-culture-passaging/, /asset-cell-culture-flask/, /asset-cell-culture-cells/],
    "transfection-step": [/asset-methods-transfection-step/, /asset-transfection-cell/, /asset-transfection-vector/],
    "assay-timeline": [/asset-methods-assay-timeline/, /asset-assay-timeline-lanes/, /asset-assay-timeline-step/],
    "protocol-checklist": [/asset-methods-protocol-checklist/, /asset-protocol-checklist-rows/, /asset-methods-checkmark/],
    "protocol-qc-gate": [/asset-methods-protocol-qc-gate/, /asset-protocol-qc-gate-shield/, /asset-protocol-qc-check/],
    "replicate-layout": [/asset-methods-replicate-layout/, /asset-replicate-layout-plate/, /asset-replicate-layout-grouping/],
    "standard-curve": [/asset-methods-standard-curve/, /asset-standard-curve-fit/, /asset-standard-curve-points/],
    "reagent-compatibility": [/asset-methods-reagent-compatibility/, /asset-reagent-compatibility-matrix/],
    "temperature-profile": [/asset-methods-temperature-profile/, /asset-temperature-profile-curve/, /asset-temperature-profile-hold/],
    "sample-normalization": [/asset-methods-sample-normalization/, /asset-sample-normalization-bars/, /asset-sample-normalization-target/],
    "protocol-deviation": [/asset-methods-protocol-deviation/, /asset-protocol-deviation-warning/, /asset-protocol-deviation-log-line/],
    "method-safety-note": [/asset-methods-method-safety-note/, /asset-method-safety-note-card/, /asset-method-safety-note-badge/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("methods-and-protocols"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium methods/protocols asset`);
    assert.match(svg, /asset-methods-frame/);
    assert.match(svg, /asset-methods-rim-highlight/);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("grant and consulting summary broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "grant-summary-board": [/asset-grant-executive-brief/, /asset-grant-impact-lens/, /asset-grant-recommendation-ribbon/, /asset-grant-thesis-arc/],
    "problem-statement-card": [/asset-grant-problem-statement-card/, /asset-problem-gap-marker/, /asset-problem-statement-lines/],
    "scientific-opportunity-map": [/asset-grant-scientific-opportunity-map/, /asset-opportunity-map-axes/, /asset-opportunity-zone/, /asset-opportunity-position/],
    "hypothesis-aims": [/asset-grant-hypothesis-aims/, /asset-hypothesis-aims/, /asset-aim-node/, /asset-hypothesis-arrow/],
    "specific-aim-1": [/asset-grant-specific-aim-1/, /asset-specific-aim-card/, /asset-specific-aim-1/, /asset-specific-aim-number/],
    "milestone-roadmap": [/asset-grant-milestone-roadmap/, /asset-milestone-roadmap/, /asset-roadmap-milestone/, /asset-roadmap-swimlane/],
    "budget-envelope": [/asset-grant-budget-envelope/, /asset-budget-envelope/, /asset-budget-envelope-card/, /asset-budget-stack/],
    "team-capability-map": [/asset-grant-team-capability-map/, /asset-stakeholder-map/, /asset-stakeholder-node/, /asset-team-node/],
    "impact-metric-card": [/asset-grant-impact-metric-card/, /asset-impact-metric-card/, /asset-impact-sparkline/, /asset-priority-score-dots/],
    "evidence-snapshot": [/asset-evidence-dossier/, /asset-evidence-primary-sheet/, /asset-evidence-figure-window/, /asset-evidence-source-seal/],
    "risk-matrix": [/asset-grant-risk-matrix/, /asset-risk-matrix-grid/, /asset-risk-cell/],
    "risk-mitigation-plan": [/asset-grant-risk-mitigation-plan/, /asset-go-no-go-gate/, /asset-risk-mitigation-arrow/],
    "recommendation-card": [/asset-grant-recommendation-card/, /asset-recommendation-card/, /asset-recommendation-check/, /asset-takeaway-headline/],
    "executive-takeaway": [/asset-grant-executive-takeaway/, /asset-recommendation-card/, /asset-takeaway-headline/],
    "priority-scorecard": [/asset-grant-priority-scorecard/, /asset-impact-metric-card/, /asset-priority-score-dots/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("grant-and-consulting-summary"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium grant/consulting asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("clinical translational broad pack assets expose dedicated premium recipe markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "clinical-study-overview": [/asset-clinical-clinical-study-overview/, /asset-clinical-study-flow/, /asset-clinical-study-patient-node/],
    "patient-journey-map": [/asset-clinical-patient-journey-map/, /asset-patient-journey-map/, /asset-visit-timepoint/, /asset-patient-journey-path/],
    "consent-enrollment": [/asset-clinical-consent-enrollment/, /asset-clinical-review-card/, /asset-clinical-consent-check/],
    "eligibility-criteria": [/asset-clinical-eligibility-criteria/, /asset-clinical-criteria-funnel/, /asset-clinical-criteria-checklist/],
    "cohort-stratification": [/asset-clinical-cohort-stratification/, /asset-clinical-cohort-patient/, /asset-clinical-cohort-table/],
    "randomization-schema": [/asset-clinical-randomization-schema/, /asset-randomization-branch/, /asset-treatment-arm/],
    "clinical-sample-flow": [/asset-clinical-clinical-sample-flow/, /asset-clinical-sample-flow/, /asset-clinical-biospecimen-tube/, /asset-clinical-sample-arrow/],
    "clinical-omics-bridge": [/asset-clinical-clinical-omics-bridge/, /asset-clinical-omics-bridge-link/, /asset-translational-readout-card/],
    "biomarker-validation": [/asset-clinical-biomarker-validation/, /asset-biomarker-panel-card/, /asset-biomarker-marker/, /asset-assay-validation-check/],
    "endpoint-hierarchy": [/asset-clinical-endpoint-hierarchy/, /asset-endpoint-card/, /asset-primary-endpoint/, /asset-secondary-endpoint/],
    "survival-curve": [/asset-clinical-survival-curve/, /asset-survival-curve-axes/, /asset-survival-step-curve/],
    "adverse-event-panel": [/asset-clinical-adverse-event-signal/, /asset-adverse-event-signal-field/, /asset-adverse-event-severity-dot/, /asset-clinical-safety-shield/, /asset-safety-monitoring-pulse/],
    "regulatory-evidence-brief": [/asset-clinical-regulatory-evidence-brief/, /asset-regulatory-evidence-dossier/, /asset-regulatory-evidence-seal/, /asset-regulatory-evidence-ribbon/],
    "ecrf-data-capture": [/asset-clinical-ecrf-data-capture/, /asset-ecrf-data-capture-card/, /asset-clinical-data-lock/],
    "site-activation": [/asset-clinical-site-activation/, /asset-site-activation-map/, /asset-site-pin/],
    "clinical-decision-support": [/asset-clinical-clinical-decision-support/, /asset-pro-speech-bubble/, /asset-clinical-decision-support-arrow/]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const asset = getAsset(assetId);
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.ok(asset.workflowPacks.includes("clinical-translational"));
    assert.ok(asset.qualityTier === "signature" || asset.qualityTier === "hero");
    assert.ok(svg.length > 1800, `${assetId} render is too small to be a premium clinical translational asset`);
    for (const marker of markers) assert.match(svg, marker);
  }
});

test("spatial transcriptomics assets expose premium map and image-analysis markers", () => {
  const expectedMarkers: Record<string, RegExp[]> = {
    "visium-spot-array": [
      /asset-visium-slide/,
      /asset-visium-capture-area/,
      /asset-visium-tissue-contour/,
      /asset-visium-spot-lattice/,
      /asset-visium-active-spot/,
      /asset-visium-fiducial/,
      /asset-visium-barcode/
    ],
    "segmentation-mask": [
      /asset-segmentation-tile/,
      /asset-segmentation-mask-cell/,
      /asset-segmentation-confidence-ring/,
      /asset-segmentation-nucleus/,
      /asset-segmentation-uncertainty-contour/,
      /asset-segmentation-confidence-legend/
    ],
    "cell-boundary": [
      /asset-cell-boundary-tile/,
      /asset-cell-boundary-contour/,
      /asset-cell-boundary-selected-contour/,
      /asset-cell-boundary-nucleus/,
      /asset-cell-boundary-edit-handles/,
      /asset-cell-boundary-edge-badge/
    ],
    "neighborhood-graph": [
      /asset-neighborhood-community-hull/,
      /asset-neighborhood-community-patch/,
      /asset-neighborhood-edge/,
      /asset-neighborhood-strong-edge/,
      /asset-neighborhood-hub-node/,
      /asset-neighborhood-centroid/,
      /asset-neighborhood-knn-badge/
    ]
  };

  for (const [assetId, markers] of Object.entries(expectedMarkers)) {
    const svg = renderPremiumAssetSvg(assetId, { styleProfile: "consulting-2p5d", width: 180, height: 140 });
    assert.match(svg, /commercial-premium-asset/);
    assert.match(svg, new RegExp(`data-recipe="hero-${assetId}"`));
    assert.match(svg, /data-family="spatial"/);
    assert.ok(svg.length > 3600, `${assetId} render is too small to carry premium spatial detail`);
    for (const marker of markers) assert.match(svg, marker);
  }

  const visiumSvg = renderPremiumAssetSvg("visium-spot-array", { styleProfile: "consulting-2p5d", width: 180, height: 140 });
  assert.ok((visiumSvg.match(/asset-visium-spot /g) ?? []).length >= 40);
});

test("spatial transcriptomics publication-line assets remain export-clean", () => {
  for (const assetId of ["visium-spot-array", "segmentation-mask", "cell-boundary", "neighborhood-graph"]) {
    const lineSvg = renderPremiumAssetSvg(assetId, { styleProfile: "publication-line", width: 180, height: 140 });
    assert.match(lineSvg, /data-style-profile="publication-line"/);
    assert.match(lineSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineSvg, /class="asset-(?:contact-shadow|soft-body-gradient|body-depth-overlay|inner-highlight|warning-glow|rim-highlight)"/);
    assert.doesNotMatch(lineSvg, /fill="url\(#asset-glass-highlight\)"/);
  }
});

test("spatial transcriptomics assets use differentiated premium palettes", () => {
  const ids = [
    "spatial-grid",
    "visium-spot-array",
    "histology-section",
    "segmentation-mask",
    "cell-boundary",
    "neighborhood-graph",
    "image-registration",
    "morphology-feature"
  ];
  const accents = ids.map((id) => getAsset(id).renderSpec.accent);
  assert.ok(new Set(accents).size >= 7);
  assert.notEqual(getAsset("visium-spot-array").renderSpec.accent, getAsset("segmentation-mask").renderSpec.accent);
  assert.notEqual(getAsset("segmentation-mask").renderSpec.accent, getAsset("cell-boundary").renderSpec.accent);
  assert.notEqual(getAsset("cell-boundary").renderSpec.accent, getAsset("neighborhood-graph").renderSpec.accent);
});

test("spatial results template uses compact copy and roomier heatmap", () => {
  const nodes = createWorkflowFigureNodes({ templateId: "spatial-results-panel", styleProfile: "consulting-2p5d" });
  const subtitle = nodes.find((node) => node.kind === "text" && String((node.payload as Record<string, unknown>).text).includes("Tissue -> spots"));
  assert.ok(subtitle);
  const subtitleText = String((subtitle.payload as Record<string, unknown>).text);
  assert.ok(subtitleText.length <= 72);
  assert.ok(subtitle.transform.width >= 500);

  const heatmap = nodes.find((node) => node.kind === "plot" && (node.payload as { spec?: { title?: string } }).spec?.title === "Spatial expression");
  assert.ok(heatmap);
  assert.equal(heatmap.transform.height, 144);
  const table = (heatmap.payload as { spec?: { table?: { rows?: Array<{ region?: string }> } } }).spec?.table;
  assert.ok(table?.rows?.length);
  assert.ok(table.rows.every((row) => String(row.region).length <= 7));
});

test("premium style profiles and workflow packs are queryable", () => {
  const packs = listWorkflowPacks();
  assert.equal(packs.length, 18);
  assert.ok(packs.every((pack) => pack.assetIds.length >= 20));
  assert.ok(packs.every((pack) => pack.templates.length >= 4));
  assert.ok(packs.every((pack) => pack.flagshipTemplateId));
  assert.ok(packs.some((pack) => pack.id === "drug-discovery" && pack.templates.includes("drug-discovery-funnel")));
  assert.ok(packs.some((pack) => pack.id === "protein-engineering" && pack.templates.includes("protein-engineering-platform")));
  assert.ok(packs.some((pack) => pack.id === "synthetic-biology" && pack.templates.includes("synthetic-biology-platform")));
  assert.ok(packs.some((pack) => pack.id === "microbiome-infectious-disease" && pack.templates.includes("microbiome-infectious-disease-platform")));
  assert.ok(packs.some((pack) => pack.id === "cell-therapy" && pack.templates.includes("cell-therapy-manufacturing-platform")));
  assert.ok(packs.some((pack) => pack.id === "microscopy-image-analysis" && pack.templates.includes("microscopy-image-analysis-pipeline")));
  assert.ok(packs.some((pack) => pack.id === "lab-automation" && pack.templates.includes("lab-automation-platform")));
  assert.ok(packs.some((pack) => pack.id === "anatomy-organ-systems" && pack.templates.includes("anatomy-organ-system-overview")));
  assert.ok(packs.some((pack) => pack.id === "grant-and-consulting-summary" && pack.templates.includes("grant-consulting-one-slide")));
  assert.ok(packs.some((pack) => pack.id === "clinical-translational" && pack.templates.includes("clinical-translational-study-overview")));

  const templates = listWorkflowTemplates();
  assert.ok(templates.length >= 25);
  assert.ok(templates.every((template) => template.previewAssetIds.length >= 4));
  assert.ok(templates.every((template) => template.agentUseHints.length && template.qaChecklist.length));
  assert.ok(templates.some((template) => template.id === "manuscript-results-figure" && template.layout === "multi-panel"));
  const spatialTemplates = listWorkflowTemplates({ workflowPack: "spatial-transcriptomics" });
  assert.ok(spatialTemplates.every((template) => template.workflowPack === "spatial-transcriptomics"));
  assert.equal(getWorkflowTemplate("ai-biosecurity-pipeline").workflowPack, "ai-biosecurity-eval");
  const drugTemplates = listWorkflowTemplates({ workflowPack: "drug-discovery" });
  assert.equal(drugTemplates.length, 4);
  assert.ok(drugTemplates.some((template) => template.id === "lead-optimization-summary" && template.layout === "results"));
  const proteinTemplates = listWorkflowTemplates({ workflowPack: "protein-engineering" });
  assert.equal(proteinTemplates.length, 4);
  assert.ok(proteinTemplates.some((template) => template.id === "developability-summary" && template.layout === "results"));
  const syntheticTemplates = listWorkflowTemplates({ workflowPack: "synthetic-biology" });
  assert.equal(syntheticTemplates.length, 4);
  assert.ok(syntheticTemplates.some((template) => template.id === "biosensor-kill-switch-summary" && template.layout === "results"));
  const microbiomeTemplates = listWorkflowTemplates({ workflowPack: "microbiome-infectious-disease" });
  assert.equal(microbiomeTemplates.length, 4);
  assert.ok(microbiomeTemplates.some((template) => template.id === "microbiome-infectious-disease-platform" && template.layout === "workflow"));
  const cellTherapyTemplates = listWorkflowTemplates({ workflowPack: "cell-therapy" });
  assert.equal(cellTherapyTemplates.length, 4);
  assert.ok(cellTherapyTemplates.some((template) => template.id === "cell-therapy-manufacturing-platform" && template.layout === "workflow"));
  const microscopyTemplates = listWorkflowTemplates({ workflowPack: "microscopy-image-analysis" });
  assert.equal(microscopyTemplates.length, 4);
  assert.ok(microscopyTemplates.some((template) => template.id === "microscopy-image-analysis-pipeline" && template.layout === "workflow"));
  const labAutomationTemplates = listWorkflowTemplates({ workflowPack: "lab-automation" });
  assert.equal(labAutomationTemplates.length, 4);
  assert.ok(labAutomationTemplates.some((template) => template.id === "lab-automation-platform" && template.layout === "workflow"));
  const anatomyTemplates = listWorkflowTemplates({ workflowPack: "anatomy-organ-systems" });
  assert.equal(anatomyTemplates.length, 4);
  assert.ok(anatomyTemplates.some((template) => template.id === "anatomy-organ-system-overview" && template.layout === "workflow"));
  const grantTemplates = listWorkflowTemplates({ workflowPack: "grant-and-consulting-summary" });
  assert.equal(grantTemplates.length, 4);
  assert.ok(grantTemplates.some((template) => template.id === "grant-consulting-one-slide" && template.layout === "multi-panel"));
  const clinicalTemplates = listWorkflowTemplates({ workflowPack: "clinical-translational" });
  assert.equal(clinicalTemplates.length, 4);
  assert.ok(clinicalTemplates.some((template) => template.id === "clinical-translational-study-overview" && template.layout === "workflow"));

  const perturb = searchAssets({ workflowPack: "perturb-seq-crispr", styleProfile: "consulting-2p5d", limit: 10 });
  assert.ok(perturb.length >= 5);
  assert.ok(perturb.every((result) => result.asset.workflowPacks.includes("perturb-seq-crispr")));
  assert.ok(perturb.some((result) => result.asset.id === "crispr-cas9" || result.asset.id === "perturb-seq"));

  const discovery = searchAssets({ workflowPack: "drug-discovery", query: "target validation compound hit lead toxicity", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(discovery.length >= 8);
  assert.ok(discovery.every((result) => result.asset.workflowPacks.includes("drug-discovery")));
  assert.ok(discovery.some((result) => result.asset.id === "receptor" || result.asset.id === "plate-384"));

  const protein = searchAssets({ workflowPack: "protein-engineering", query: "protein design directed evolution affinity developability", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(protein.length >= 8);
  assert.ok(protein.every((result) => result.asset.workflowPacks.includes("protein-engineering")));
  assert.ok(protein.some((result) => result.asset.id === "protein-design-model" || result.asset.id === "binding-pocket"));

  const synthetic = searchAssets({ workflowPack: "synthetic-biology", query: "genetic circuit dbtl biosensor kill switch metabolic flux", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(synthetic.length >= 8);
  assert.ok(synthetic.every((result) => result.asset.workflowPacks.includes("synthetic-biology")));
  assert.ok(synthetic.some((result) => result.asset.id === "genetic-circuit" || result.asset.id === "biosensor-circuit"));

  const microbiome = searchAssets({ workflowPack: "microbiome-infectious-disease", query: "microbiome metagenomic amr outbreak diversity", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(microbiome.length >= 8);
  assert.ok(microbiome.every((result) => result.asset.workflowPacks.includes("microbiome-infectious-disease")));
  assert.ok(microbiome.some((result) => result.asset.id === "microbiome-community" || result.asset.id === "amr-gene"));

  const cellTherapy = searchAssets({ workflowPack: "cell-therapy", query: "car-t leukapheresis viral vector expansion release testing infusion cytokine", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(cellTherapy.length >= 8);
  assert.ok(cellTherapy.every((result) => result.asset.workflowPacks.includes("cell-therapy")));
  assert.ok(cellTherapy.some((result) => result.asset.id === "car-t-cell" || result.asset.id === "leukapheresis"));

  const microscopy = searchAssets({ workflowPack: "microscopy-image-analysis", query: "microscopy image analysis segmentation tracking morphology embedding qc", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(microscopy.length >= 8);
  assert.ok(microscopy.every((result) => result.asset.workflowPacks.includes("microscopy-image-analysis")));
  assert.ok(microscopy.some((result) => result.asset.id === "nuclei-segmentation" || result.asset.id === "microscope-field"));

  const labAutomation = searchAssets({ workflowPack: "lab-automation", query: "lab automation liquid handler robotic arm plate reader barcode lims qc", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(labAutomation.length >= 8);
  assert.ok(labAutomation.every((result) => result.asset.workflowPacks.includes("lab-automation")));
  assert.ok(labAutomation.some((result) => result.asset.id === "automated-liquid-handler" || result.asset.id === "robotic-arm"));

  const anatomy = searchAssets({ workflowPack: "anatomy-organ-systems", query: "anatomy organ system brain lung gut liver kidney tissue biomarker clinical endpoint", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(anatomy.length >= 8);
  assert.ok(anatomy.every((result) => result.asset.workflowPacks.includes("anatomy-organ-systems")));
  assert.ok(anatomy.some((result) => result.asset.id === "anatomy-overview" || result.asset.id === "kidney"));

  const grant = searchAssets({ workflowPack: "grant-and-consulting-summary", query: "grant specific aims executive summary roadmap risk recommendation", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(grant.length >= 8);
  assert.ok(grant.every((result) => result.asset.workflowPacks.includes("grant-and-consulting-summary")));
  assert.ok(grant.some((result) => result.asset.id === "grant-summary-board" || result.asset.id === "recommendation-card"));

  const clinical = searchAssets({ workflowPack: "clinical-translational", query: "clinical translational cohort biomarker endpoint validation safety review", styleProfile: "consulting-2p5d", limit: 12 });
  assert.ok(clinical.length >= 8);
  assert.ok(clinical.every((result) => result.asset.workflowPacks.includes("clinical-translational")));
  assert.ok(clinical.some((result) => result.asset.id === "clinical-study-overview" || result.asset.id === "biomarker-validation"));

  const lineSvg = renderPremiumAssetSvg("crispr-cas9", { styleProfile: "publication-line" });
  assert.match(lineSvg, /data-style-profile="publication-line"/);
  assert.match(lineSvg, /data-detail-level="medium"/);
  assert.doesNotMatch(lineSvg, /filter="url\(#asset-soft-shadow\)"/);
  assert.doesNotMatch(lineSvg, /class="asset-contact-shadow"/);

  const riskSvg = renderPremiumAssetSvg("risk-gate", { styleProfile: "risk-warning" });
  assert.match(riskSvg, /data-style-profile="risk-warning"/);
  assert.match(riskSvg, /data-accent="#dc2626"/);
});

test("workflow pack galleries expose assets templates flagship demos and QA status", () => {
  for (const pack of listWorkflowPacks()) {
    const gallery = getWorkflowPackGallery(pack.id, { styleProfile: "consulting-2p5d" });
    assert.equal(gallery.pack.id, pack.id);
    assert.equal(gallery.assets.length, pack.assetIds.length);
    assert.equal(gallery.templates.length, pack.templates.length);
    assert.equal(gallery.quality.missingAssetIds.length, 0);
    assert.equal(gallery.quality.missingTemplateIds.length, 0);
    assert.ok(["premium", "needs-polish"].includes(gallery.quality.qaStatus));
    assert.ok(gallery.flagshipDemo.templateId);
    assert.equal(gallery.templateQa.length, gallery.templates.length);
    assert.ok(["premium", "needs-polish", "incomplete"].includes(gallery.flagshipDemo.qaStatus));
    assert.ok(gallery.flagshipDemo.score >= 0);
    assert.ok(gallery.templateQa.every((qa) => qa.actionItems.length >= 1));
    assert.equal(gallery.exportSnapshot.packId, pack.id);
    assert.equal(gallery.exportSnapshot.templateCount, pack.templates.length);
    assert.equal(gallery.exportSnapshot.blockedTemplateCount, 0);
    assert.ok(gallery.exportSnapshot.totalNodeCount >= gallery.templateQa.reduce((sum, qa) => sum + qa.nodeCount, 0));
    assert.ok(["editable", "editable-with-fallbacks"].includes(gallery.exportSnapshot.exportFormats.pptx.status));
    assert.match(gallery.exportSnapshot.snapshotKey, new RegExp(`^${pack.id}\\|consulting-2p5d\\|`));
    assert.match(gallery.compactGallery.svg, /workflow-pack-gallery/);
    assert.match(gallery.compactGallery.svg, new RegExp(`data-workflow-pack="${pack.id}"`));
  }

  const svg = renderWorkflowPackGallerySvg("ai-biosecurity-eval", { styleProfile: "risk-warning", columns: 5, limit: 10 });
  assert.match(svg, /workflow-pack-gallery/);
  assert.match(svg, /risk-gate/);
  assert.match(svg, /data-style-profile="risk-warning"/);
});

test("workflow pack export snapshots summarize fallbacks and next actions", () => {
  const aiSnapshot = getWorkflowPackExportSnapshot("ai-biosecurity-eval", { styleProfile: "risk-warning" });
  assert.equal(aiSnapshot.packId, "ai-biosecurity-eval");
  assert.equal(aiSnapshot.templateCount, 4);
  assert.equal(aiSnapshot.blockedTemplateCount, 0);
  assert.equal(aiSnapshot.exportFormats.svg.status, "full-vector");
  assert.equal(aiSnapshot.exportFormats.pdf.status, "full-vector");
  assert.equal(aiSnapshot.exportFormats.docx.status, "figure-panel");
  assert.equal(aiSnapshot.exportFormats.pptx.status, "editable-with-fallbacks");
  assert.ok(aiSnapshot.totalPremiumAssetFallbackCount >= aiSnapshot.uniqueFallbackAssetIds.length);
  assert.ok(aiSnapshot.uniqueFallbackAssetIds.includes("risk-gate"));
  assert.ok(aiSnapshot.uniqueFallbackAssetIds.includes("human-review"));
  assert.ok(aiSnapshot.templates.some((template) => template.templateId === "benchmark-dashboard" && template.fallbackAssetIds.includes("bio-classifier")));
  assert.ok(aiSnapshot.warnings.some((warning) => warning.includes("PPTX")));
  assert.ok(aiSnapshot.nextAction.includes("visual QA"));
  assert.match(aiSnapshot.snapshotKey, /^ai-biosecurity-eval\|risk-warning\|/);
});

test("premium coverage roadmap exposes 12 month targets and ontology contracts", () => {
  const coverage = getAssetCoverageGapReport();
  assert.equal(coverage.baseline.totalAssets, 466);
  assert.equal(coverage.baseline.signatureHeroAssets, 401);
  assert.equal(coverage.baseline.workflowPacks, 18);
  assert.equal(coverage.baseline.templates, 79);
  assert.equal(coverage.productWedge, "asset-breadth-library");
  assert.equal(coverage.firstWave, "broad-biology-market");
  assert.equal(coverage.qualityGate, "pack-complete-premium");
  assert.equal(coverage.commercialVisualAudit.premiumLabelFreeze, true);
  assert.equal(coverage.commercialVisualAudit.highRiskPremiumAssets, 0);
  assert.deepEqual(coverage.broadMarketPackOrder.slice(0, 5), ["drug-discovery", "protein-engineering", "synthetic-biology", "microbiome-infectious-disease", "cell-therapy"]);
  assert.equal(coverage.packMinimumContract.minSignatureHeroAssets, 12);
  assert.equal(coverage.packMinimumContract.requiresAgentPath, true);
  assert.ok(coverage.milestones.some((milestone) => milestone.targetAssets === 1200 && milestone.remainingAssets === 734));
  assert.ok(coverage.milestones.some((milestone) => milestone.targetWorkflowPacks === 24 && milestone.remainingWorkflowPacks === 6));
  assert.ok(coverage.plannedWorkflowPacks.some((pack) => pack.id === "bio-llm-benchmarks" && pack.wave === "jk-aligned"));
  assert.ok(coverage.plannedWorkflowPacks.some((pack) => pack.id === "drug-discovery" && pack.wave === "commercial-broad"));
  assert.equal(coverage.plannedWorkflowPacks.filter((pack) => pack.wave === "commercial-broad")[0].id, "drug-discovery");
  assert.ok(coverage.acceptanceGates.some((gate) => gate.includes("48px")));
  assert.deepEqual(coverage.productionPipeline, ["asset_brief", "semantic_contract", "recipe_design", "render_qa", "template_integration", "agent_contract", "export_qa"]);
  assert.ok(coverage.categoryGaps.some((gap) => gap.category === "AI / Deployment/governance/monitoring" && gap.status === "coverage-only"));

  const ontology = getAssetOntology({ workflowPack: "ai-biosecurity-eval", qualityTier: "signature", limit: 12 });
  assert.equal(ontology.schemaVersion, "0.5.0-asset-ontology");
  assert.ok(ontology.styleProfiles.includes("consulting-2p5d"));
  assert.ok(ontology.qualityTiers.includes("signature"));
  assert.ok(ontology.semanticSlots.includes("risk-decision"));
  assert.ok(ontology.workflowPacks.some((pack) => pack.id === "ai-biosecurity-eval" && pack.assetCount >= 20));
  assert.ok(ontology.assets.length > 0);
  assert.ok(ontology.assets.every((asset) => asset.qualityTier === "signature"));
  assert.ok(ontology.assets.every((asset) => asset.workflowPacks.includes("ai-biosecurity-eval")));
  assert.ok(ontology.agentContract.normalReferenceFields.includes("editablePartOverrides"));
});

test("agent-facing pack and asset-set recommendations are workflow aware", () => {
  const compactIndex = getAssetIndex();
  const compactBytes = JSON.stringify(compactIndex).length;
  assert.equal(compactIndex.schemaVersion, "0.6.0-agent-asset-index");
  assert.equal(compactIndex.responseShape, "compact");
  assert.ok(compactBytes <= compactIndex.sizeBudget.currentTargetBytes, `compact index is ${compactBytes} bytes`);
  assert.ok(compactIndex.assets.length > 0);
  assert.ok(compactIndex.assets.every((asset) => asset.assetId && asset.insertDefaults.tool === "insert_premium_asset"));
  assert.ok(compactIndex.assets.every((asset) => !("renderSpec" in asset) && !("provenance" in asset) && !("tags" in asset)));
  assert.ok(compactIndex.facets.workflowPacks.includes("ai-biosecurity-eval"));
  assert.ok(compactIndex.facets.styleProfiles.includes("publication-line"));

  const filteredIndex = getAssetIndex({
    workflowPack: "ai-biosecurity-eval",
    qualityTier: "signature",
    semanticSlot: "risk-decision",
    styleProfile: "risk-warning",
    limit: 8
  });
  assert.ok(filteredIndex.assets.length > 0);
  assert.ok(filteredIndex.assets.every((asset) => asset.qualityTier === "signature"));
  assert.ok(filteredIndex.assets.every((asset) => asset.workflowPacks.includes("ai-biosecurity-eval")));
  assert.ok(filteredIndex.assets.every((asset) => asset.semanticSlots.includes("risk-decision")));
  assert.ok(filteredIndex.assets.every((asset) => asset.insertDefaults.args.styleProfile === "risk-warning"));

  const packRecommendations = recommendWorkflowPack({
    title: "BioLLM benchmark calibration and DURC review dashboard",
    narrative: "Compare classifiers, benchmark failures, permission tiers, and human review load.",
    limit: 3
  });
  assert.ok(packRecommendations.length >= 1);
  assert.equal(packRecommendations[0].pack.id, "ai-biosecurity-eval");
  assert.ok(packRecommendations[0].recommendedTemplateId);
  assert.ok(packRecommendations[0].exportQaAction.includes("export_pack_qa_report"));

  const assetSet = recommendAssetSet({
    title: "AI biosecurity benchmark dashboard",
    layoutIntent: "results dashboard with risk review",
    workflowPack: "ai-biosecurity-eval",
    semanticSlots: ["evaluation-evidence", "risk-decision"],
    styleProfile: "risk-warning"
  });
  assert.equal(assetSet.workflowPack, "ai-biosecurity-eval");
  assert.equal(assetSet.styleProfile, "risk-warning");
  assert.ok(assetSet.groups.length >= 2);
  assert.ok(assetSet.groups.some((group) => group.semanticSlot === "risk-decision" && group.assets.some((result) => result.asset.id === "risk-gate" || result.asset.id === "human-review")));
  assert.ok(assetSet.insertPlan.length >= 2);
  assert.ok(assetSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.assetId && action.args.styleProfile === "risk-warning"));
  assert.ok(assetSet.insertPlan.some((action) => action.args.semanticRole === "risk-decision"));
  assert.ok(assetSet.agentInstructions.some((instruction) => instruction.includes("structured symbol nodes")));

  const perturbSet = recommendAssetSet({
    title: "Perturb-seq CRISPR screen with guide RNA, single-cell RNA-seq, expression matrix, and volcano result",
    sourceText: "Input cells receive guide RNAs from a pooled CRISPR library. Perturb-seq links guide identity with single-cell readouts, sequencing, expression matrix construction, and hit validation.",
    workflowPack: "perturb-seq-crispr",
    styleProfile: "consulting-2p5d",
    limit: 10
  });
  const perturbInsertIds = perturbSet.insertPlan.map((action) => action.args.assetId);
  assert.equal(perturbSet.workflowPack, "perturb-seq-crispr");
  assert.equal(perturbSet.templateId, "perturb-seq-workflow");
  assert.ok(perturbInsertIds.includes("cell-immune"));
  assert.ok(perturbInsertIds.includes("crispr-cas9"));
  assert.ok(perturbInsertIds.includes("guide-rna"));
  assert.ok(perturbInsertIds.includes("pooled-screen"));
  assert.ok(perturbInsertIds.includes("sequencer"));
  assert.ok(perturbInsertIds.includes("expression-matrix"));
  assert.ok(perturbSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const proteinPackRecommendations = recommendWorkflowPack({
    title: "Protein engineering binder optimization platform",
    narrative: "Protein design model, directed evolution, variant library, affinity maturation, stability assay, purification, and developability review.",
    limit: 3
  });
  assert.equal(proteinPackRecommendations[0].pack.id, "protein-engineering");
  assert.equal(proteinPackRecommendations[0].recommendedTemplateId, "protein-engineering-platform");

  const proteinSet = recommendAssetSet({
    title: "Protein engineering developability slide",
    sourceText: "A protein design model proposes variants. Directed evolution and affinity maturation prioritize binders. The slide should show binding pocket, variant library, KD assay, enzyme kinetics, stability, purification, and developability profile.",
    styleProfile: "consulting-2p5d",
    limit: 18
  });
  const proteinInsertIds = proteinSet.insertPlan.map((action) => action.args.assetId);
  const expectedProteinCore = [
    "protein-design-model",
    "protein-domain",
    "binding-pocket",
    "protein-variant-library",
    "directed-evolution",
    "affinity-maturation",
    "binding-affinity-assay",
    "structure-prediction",
    "stability-assay",
    "enzyme-kinetics",
    "purification-column",
    "developability-profile"
  ];
  assert.equal(proteinSet.workflowPack, "protein-engineering");
  assert.equal(proteinSet.templateId, "protein-engineering-platform");
  for (const assetId of expectedProteinCore) assert.ok(proteinInsertIds.includes(assetId), `${assetId} should be an insert-ready protein-engineering core anchor`);
  assert.ok(proteinSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const syntheticPackRecommendations = recommendWorkflowPack({
    title: "Synthetic biology DBTL biosensor platform",
    narrative: "Genetic circuit design, Golden Gate DNA assembly, chassis engineering, biosensor reporter response, metabolic pathway flux, and kill switch containment review.",
    limit: 3
  });
  assert.equal(syntheticPackRecommendations[0].pack.id, "synthetic-biology");
  assert.equal(syntheticPackRecommendations[0].recommendedTemplateId, "synthetic-biology-platform");

  const syntheticSet = recommendAssetSet({
    title: "Synthetic biology biosensor DBTL slide",
    sourceText: "Design a genetic circuit, assemble DNA with Golden Gate, transform chassis cells, test biosensor response, optimize metabolic pathway flux, and review kill switch containment.",
    styleProfile: "consulting-2p5d",
    limit: 20
  });
  const syntheticInsertIds = syntheticSet.insertPlan.map((action) => action.args.assetId);
  const expectedSyntheticCore = [
    "genetic-circuit",
    "promoter-library",
    "ribosome-binding-site",
    "terminator",
    "plasmid-vector",
    "synthetic-operon",
    "dna-assembly",
    "golden-gate-assembly",
    "design-build-test-learn-cycle",
    "chassis-cell",
    "biosensor-circuit",
    "metabolic-pathway-engineering",
    "pathway-flux-map",
    "kill-switch"
  ];
  assert.equal(syntheticSet.workflowPack, "synthetic-biology");
  assert.equal(syntheticSet.templateId, "synthetic-biology-platform");
  for (const assetId of expectedSyntheticCore) assert.ok(syntheticInsertIds.includes(assetId), `${assetId} should be an insert-ready synthetic-biology core anchor`);
  assert.ok(syntheticSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const microbiomePackRecommendations = recommendWorkflowPack({
    title: "Microbiome infectious disease AMR surveillance slide",
    narrative: "Metagenomic reads, taxonomic abundance, host pathogen interaction, dysbiosis, antibiotic pressure, outbreak cluster, and antimicrobial resistance review.",
    limit: 3
  });
  assert.equal(microbiomePackRecommendations[0].pack.id, "microbiome-infectious-disease");
  assert.equal(microbiomePackRecommendations[0].recommendedTemplateId, "microbiome-infectious-disease-platform");

  const microbiomeSet = recommendAssetSet({
    title: "Microbiome infectious disease dashboard",
    sourceText: "Profile gut microbiome communities, compare alpha and beta diversity, map host-pathogen interactions, sequence metagenomic reads, detect AMR genes, show antimicrobial resistance and outbreak clusters, and route results to source and containment review.",
    styleProfile: "consulting-2p5d",
    limit: 24
  });
  const microbiomeInsertIds = microbiomeSet.insertPlan.map((action) => action.args.assetId);
  const expectedMicrobiomeCore = [
    "microbiome-community",
    "gut-microbiome",
    "mucosal-barrier",
    "pathogen-host-interaction",
    "metagenomic-read",
    "microbiome-profile",
    "taxonomic-abundance",
    "alpha-diversity",
    "beta-diversity",
    "amr-gene",
    "antimicrobial-resistance",
    "antibiotic-treatment",
    "microbiome-dysbiosis",
    "outbreak-cluster",
    "infection-model"
  ];
  assert.equal(microbiomeSet.workflowPack, "microbiome-infectious-disease");
  assert.equal(microbiomeSet.templateId, "microbiome-infectious-disease-platform");
  for (const assetId of expectedMicrobiomeCore) assert.ok(microbiomeInsertIds.includes(assetId), `${assetId} should be an insert-ready microbiome infectious disease core anchor`);
  assert.ok(microbiomeSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const cellTherapyPackRecommendations = recommendWorkflowPack({
    title: "CAR-T cell therapy manufacturing and release QC slide",
    narrative: "Leukapheresis, viral vector transduction, engineered T cell expansion, potency assay, release testing, infusion, cytokine release monitoring, and patient follow-up.",
    limit: 3
  });
  assert.equal(cellTherapyPackRecommendations[0].pack.id, "cell-therapy");
  assert.equal(cellTherapyPackRecommendations[0].recommendedTemplateId, "cell-therapy-manufacturing-platform");

  const cellTherapySet = recommendAssetSet({
    title: "CAR-T manufacturing release QC slide",
    sourceText: "Collect patient material by leukapheresis, engineer cells with viral vector transduction, compare CAR-T and TCR therapy, expand cells with activation beads, run potency assay and release testing, cryopreserve the batch, then infuse and monitor cytokine release.",
    styleProfile: "consulting-2p5d",
    limit: 24
  });
  const cellTherapyInsertIds = cellTherapySet.insertPlan.map((action) => action.args.assetId);
  const expectedCellTherapyCore = [
    "leukapheresis",
    "viral-vector-transduction",
    "engineered-t-cell",
    "car-t-cell",
    "tcr-therapy",
    "nk-cell-therapy",
    "tumor-antigen",
    "antigen-presentation",
    "activation-beads",
    "gene-edited-cell",
    "cell-expansion",
    "manufacturing-batch",
    "potency-assay",
    "release-testing",
    "cryopreservation",
    "infusion-bag",
    "patient-infusion",
    "cytokine-release"
  ];
  assert.equal(cellTherapySet.workflowPack, "cell-therapy");
  assert.equal(cellTherapySet.templateId, "cell-therapy-manufacturing-platform");
  for (const assetId of expectedCellTherapyCore) assert.ok(cellTherapyInsertIds.includes(assetId), `${assetId} should be an insert-ready cell-therapy core anchor`);
  assert.ok(cellTherapySet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const microscopyPackRecommendations = recommendWorkflowPack({
    title: "Microscopy image analysis segmentation and phenotyping slide",
    narrative: "Fluorescence channels, z-stack acquisition, tile stitching, illumination correction, nuclei and membrane segmentation, cell tracking, morphology embedding, classifier heatmap, image QC, and annotation review.",
    limit: 3
  });
  assert.equal(microscopyPackRecommendations[0].pack.id, "microscopy-image-analysis");
  assert.equal(microscopyPackRecommendations[0].recommendedTemplateId, "microscopy-image-analysis-pipeline");

  const microscopySet = recommendAssetSet({
    title: "Microscopy image analysis pipeline slide",
    sourceText: "Acquire fluorescence microscopy fields and z-stacks, stitch tiles, correct illumination, run nuclei and membrane segmentation, generate instance masks, track cells, extract morphology features, embed phenotypes, classify heatmaps, and route image QC to annotation review.",
    styleProfile: "consulting-2p5d",
    limit: 24
  });
  const microscopyInsertIds = microscopySet.insertPlan.map((action) => action.args.assetId);
  const expectedMicroscopyCore = [
    "microscope-field",
    "fluorescence-channel",
    "z-stack",
    "tile-stitching",
    "illumination-correction",
    "focus-quality",
    "nuclei-segmentation",
    "membrane-segmentation",
    "organelle-segmentation",
    "instance-mask",
    "segmentation-model",
    "cell-tracking",
    "phenotype-feature-vector",
    "morphology-embedding",
    "classifier-heatmap",
    "image-qc-dashboard",
    "annotation-brush"
  ];
  assert.equal(microscopySet.workflowPack, "microscopy-image-analysis");
  assert.equal(microscopySet.templateId, "microscopy-image-analysis-pipeline");
  for (const assetId of expectedMicroscopyCore) assert.ok(microscopyInsertIds.includes(assetId), `${assetId} should be an insert-ready microscopy image-analysis core anchor`);
  assert.ok(microscopySet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const labAutomationPackRecommendations = recommendWorkflowPack({
    title: "Lab automation liquid handling and LIMS QC slide",
    narrative: "Assay scheduler, deck layout, tip rack, reagent reservoir, automated liquid handler, robotic arm, plate handler, barcode scanner, plate reader, LIMS dashboard, sample tracker, QC gate, and automation orchestrator review.",
    limit: 3
  });
  assert.equal(labAutomationPackRecommendations[0].pack.id, "lab-automation");
  assert.equal(labAutomationPackRecommendations[0].recommendedTemplateId, "lab-automation-platform");

  const labAutomationSet = recommendAssetSet({
    title: "Lab automation platform slide",
    sourceText: "Schedule an automated assay run, configure deck layout with tip rack and reagent reservoir, use automated liquid handler, robotic arm, plate handler, plate stack, barcode scanner, plate reader, incubator stack, LIMS dashboard, sample tracker, automation QC gate, and orchestrator review.",
    styleProfile: "consulting-2p5d",
    limit: 30
  });
  const labAutomationInsertIds = labAutomationSet.insertPlan.map((action) => action.args.assetId);
  const expectedLabAutomationCore = [
    "lab-automation-platform",
    "liquid-handler",
    "automated-liquid-handler",
    "robotic-arm",
    "robotic-gripper",
    "plate-handler",
    "plate-stack",
    "plate-384",
    "barcode-scanner",
    "sample-tracker",
    "assay-scheduler",
    "deck-layout",
    "tip-rack",
    "reagent-reservoir",
    "plate-reader",
    "incubator-stack",
    "automated-microscope",
    "lims-dashboard",
    "qc-gate-automation",
    "automation-orchestrator"
  ];
  assert.equal(labAutomationSet.workflowPack, "lab-automation");
  assert.equal(labAutomationSet.templateId, "lab-automation-platform");
  for (const assetId of expectedLabAutomationCore) assert.ok(labAutomationInsertIds.includes(assetId), `${assetId} should be an insert-ready lab automation core anchor`);
  assert.ok(labAutomationSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const anatomyPackRecommendations = recommendWorkflowPack({
    title: "Anatomy organ systems context and clinical endpoint slide",
    narrative: "Brain, lung, gut, liver, kidney, tissue biomarker panel, organ sample flow, cohort evidence, and clinical endpoint review.",
    limit: 3
  });
  assert.equal(anatomyPackRecommendations[0].pack.id, "anatomy-organ-systems");
  assert.equal(anatomyPackRecommendations[0].recommendedTemplateId, "anatomy-organ-system-overview");

  const anatomySet = recommendAssetSet({
    title: "Anatomy organ system context slide",
    sourceText: "Build an anatomy organ systems figure with brain lung gut liver kidney tissue biomarker clinical endpoint organ sample cohort evidence and cross-organ comparison.",
    styleProfile: "consulting-2p5d",
    limit: 30
  });
  const anatomyInsertIds = anatomySet.insertPlan.map((action) => action.args.assetId);
  const expectedAnatomyCore = [
    "anatomy-overview",
    "organ-axis-brain-lung-gut",
    "brain",
    "lung",
    "gut",
    "immune-system",
    "organ-sample-flow",
    "tissue-biomarker-panel",
    "organ-system-network",
    "liver",
    "kidney",
    "heart",
    "intestinal-villus",
    "renal-nephron",
    "hepatic-lobule",
    "clinical-endpoint-card"
  ];
  assert.equal(anatomySet.workflowPack, "anatomy-organ-systems");
  assert.equal(anatomySet.templateId, "anatomy-organ-system-overview");
  for (const assetId of expectedAnatomyCore) assert.ok(anatomyInsertIds.includes(assetId), `${assetId} should be an insert-ready anatomy organ systems core anchor`);
  assert.ok(anatomySet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const methodsPackRecommendations = recommendWorkflowPack({
    title: "Methods protocol overview with qPCR ELISA controls and QC",
    narrative: "Sample preparation, reagent mastermix, serial dilution, incubation, wash step, PCR amplification, qPCR assay, ELISA, standard curve, replicate layout, controls, protocol QC gate, and method safety caveat.",
    limit: 3
  });
  assert.equal(methodsPackRecommendations[0].pack.id, "methods-and-protocols");
  assert.equal(methodsPackRecommendations[0].recommendedTemplateId, "methods-protocol-overview");

  const methodsSet = recommendAssetSet({
    title: "Methods and protocols overview slide",
    sourceText: "Build a high-level method figure from sample prep to reagent mastermix, serial dilution, incubation, wash, magnetic bead cleanup, PCR amplification, qPCR assay, ELISA assay, western blot workflow, replicate layout, control sample set, standard curve, sample normalization, protocol QC gate, and method safety note.",
    styleProfile: "consulting-2p5d",
    limit: 35
  });
  const methodsInsertIds = methodsSet.insertPlan.map((action) => action.args.assetId);
  const expectedMethodsCore = [
    "protocol-overview",
    "sample-prep-workflow",
    "reagent-mastermix",
    "serial-dilution",
    "incubation-step",
    "wash-step",
    "centrifugation-step",
    "magnetic-bead-cleanup",
    "pcr-amplification",
    "qpcr-assay",
    "rt-qpcr-assay",
    "elisa-assay",
    "western-blot-workflow",
    "gel-imaging",
    "immunostaining",
    "protocol-checklist",
    "protocol-qc-gate",
    "replicate-layout",
    "control-sample-set",
    "standard-curve"
  ];
  assert.equal(methodsSet.workflowPack, "methods-and-protocols");
  assert.equal(methodsSet.templateId, "methods-protocol-overview");
  for (const assetId of expectedMethodsCore) assert.ok(methodsInsertIds.includes(assetId), `${assetId} should be an insert-ready methods and protocols core anchor`);
  assert.ok(methodsSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const grantPackRecommendations = recommendWorkflowPack({
    title: "Grant consulting one-pager specific aims roadmap risk recommendation",
    narrative: "Problem statement, scientific opportunity, hypothesis aims, specific aims, milestone roadmap, budget envelope, evidence snapshot, risk matrix, go/no-go gate, executive takeaway, and recommendation card.",
    limit: 3
  });
  assert.equal(grantPackRecommendations[0].pack.id, "grant-and-consulting-summary");
  assert.equal(grantPackRecommendations[0].recommendedTemplateId, "grant-consulting-one-slide");

  const grantSet = recommendAssetSet({
    title: "Grant and consulting executive summary slide",
    sourceText: "Build an executive grant and consulting one-pager with problem statement, scientific opportunity, hypothesis aims, specific aim 1, specific aim 2, specific aim 3, milestone roadmap, budget envelope, resource allocation, impact metric, evidence snapshot, risk matrix, risk mitigation, go/no-go gate, recommendation card, executive takeaway, and priority scorecard.",
    styleProfile: "consulting-2p5d",
    limit: 35
  });
  const grantInsertIds = grantSet.insertPlan.map((action) => action.args.assetId);
  const expectedGrantCore = [
    "grant-summary-board",
    "problem-statement-card",
    "scientific-opportunity-map",
    "hypothesis-aims",
    "specific-aim-1",
    "specific-aim-2",
    "specific-aim-3",
    "milestone-roadmap",
    "budget-envelope",
    "resource-allocation",
    "team-capability-map",
    "stakeholder-map",
    "evidence-snapshot",
    "impact-metric-card",
    "outcome-kpi",
    "risk-matrix",
    "risk-mitigation-plan",
    "go-no-go-gate",
    "recommendation-card",
    "executive-takeaway",
    "priority-scorecard"
  ];
  assert.equal(grantSet.workflowPack, "grant-and-consulting-summary");
  assert.equal(grantSet.templateId, "grant-consulting-one-slide");
  for (const assetId of expectedGrantCore) assert.ok(grantInsertIds.includes(assetId), `${assetId} should be an insert-ready grant and consulting core anchor`);
  assert.ok(grantSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const clinicalPackRecommendations = recommendWorkflowPack({
    title: "Clinical translational cohort biomarker endpoint validation safety review",
    narrative: "Patient cohort enrollment, eligibility, biospecimen flow, clinical omics bridge, biomarker validation, endpoint hierarchy, survival response, adverse events, safety monitoring, and clinician review.",
    limit: 3
  });
  assert.equal(clinicalPackRecommendations[0].pack.id, "clinical-translational");
  assert.equal(clinicalPackRecommendations[0].recommendedTemplateId, "clinical-translational-study-overview");

  const clinicalSet = recommendAssetSet({
    title: "Clinical translational evidence bridge",
    sourceText: "Enroll a patient cohort with consent and eligibility criteria, collect biospecimens, run clinical omics bridge, discover and validate biomarkers, compare validation cohort endpoint hierarchy survival response and adverse event safety monitoring with clinician review.",
    styleProfile: "consulting-2p5d",
    limit: 40
  });
  const clinicalInsertIds = clinicalSet.insertPlan.map((action) => action.args.assetId);
  const expectedClinicalCore = [
    "clinical-study-overview",
    "cohort-stratification",
    "cohort-table",
    "clinical-sample-flow",
    "patient-journey-map",
    "consent-enrollment",
    "eligibility-criteria",
    "clinical-omics-bridge",
    "translational-readout",
    "adverse-event-panel",
    "safety-monitoring",
    "clinical-risk-benefit",
    "clinician-review",
    "human-cohort",
    "clinical-endpoint-card",
    "trial-design-schema",
    "randomization-schema",
    "treatment-arm-comparison",
    "biospecimen-collection",
    "longitudinal-visit-schedule",
    "biomarker-discovery",
    "biomarker-validation",
    "assay-validation",
    "validation-cohort",
    "endpoint-hierarchy",
    "primary-endpoint",
    "clinical-response-card",
    "survival-curve"
  ];
  assert.equal(clinicalSet.workflowPack, "clinical-translational");
  assert.equal(clinicalSet.templateId, "clinical-translational-study-overview");
  for (const assetId of expectedClinicalCore) assert.ok(clinicalInsertIds.includes(assetId), `${assetId} should be an insert-ready clinical translational core anchor`);
  assert.ok(clinicalSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const drugPackRecommendations = recommendWorkflowPack({
    title: "Drug discovery hit validation and lead optimization slide",
    narrative: "Target validation, compound library screen, hit triage, toxicity review, and candidate nomination.",
    limit: 3
  });
  assert.equal(drugPackRecommendations[0].pack.id, "drug-discovery");
  assert.equal(drugPackRecommendations[0].recommendedTemplateId, "drug-discovery-funnel");

  const drugSet = recommendAssetSet({
    title: "Drug discovery hit validation slide",
    sourceText: "A target validation and target engagement assay nominates hits from a 384-well compound screen. The slide should summarize potency, selectivity, SAR, PK profile, toxicity review, biomarker response, efficacy evidence, and IND-enabling lead candidate readiness.",
    styleProfile: "consulting-2p5d",
    limit: 30
  });
  const drugInsertIds = drugSet.insertPlan.map((action) => action.args.assetId);
  const expectedDrugCore30 = [
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
  assert.equal(drugSet.workflowPack, "drug-discovery");
  assert.equal(drugSet.templateId, "drug-discovery-funnel");
  assert.ok(new Set(drugInsertIds).size >= 30);
  for (const assetId of expectedDrugCore30) assert.ok(drugInsertIds.includes(assetId), `${assetId} should be an insert-ready drug-discovery core anchor`);
  assert.ok(drugSet.insertPlan.every((action) => action.tool === "insert_premium_asset" && action.args.styleProfile === "consulting-2p5d"));

  const existingBrief = createAssetBrief({ assetId: "risk-gate", workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning" });
  assert.equal(existingBrief.status, "existing-asset");
  assert.equal(existingBrief.assetId, "risk-gate");
  assert.ok(existingBrief.semanticContract.semanticSlots.includes("risk-decision"));
  assert.ok(existingBrief.recipeDesign.editableParts.length >= 3);
  assert.ok(existingBrief.exportQa.some((item) => item.includes("PPTX")));

  const candidateBrief = createAssetBrief({ concept: "BioLLM peer review benchmark scorecard", workflowPack: "bio-llm-benchmarks" });
  assert.equal(candidateBrief.status, "new-asset-candidate");
  assert.equal(candidateBrief.workflowPack, "bio-llm-benchmarks");
  assert.ok(candidateBrief.candidateId.includes("biollm") || candidateBrief.candidateId.includes("bio"));

  const templateSpec = createWorkflowTemplateSpec({
    workflowPack: "ai-biosecurity-eval",
    intent: "benchmark dashboard with calibration plot and review escalation"
  });
  assert.equal(templateSpec.workflowPack, "ai-biosecurity-eval");
  assert.ok(["results", "pipeline"].includes(templateSpec.layout));
  assert.ok(templateSpec.previewAssetIds.length >= 4);
  assert.ok(templateSpec.qaChecklist.some((item) => item.includes("PPTX")));
});

test("workflow pack visual QA gallery renders 48px 120px and slide-size previews", () => {
  const gallery = getWorkflowPackVisualQaGallery("perturb-seq-crispr", { styleProfile: "consulting-2p5d", limit: 5 });
  assert.equal(gallery.packId, "perturb-seq-crispr");
  assert.equal(gallery.renderedAssetIds.length, 5);
  assert.deepEqual(gallery.previewSizes.map((size) => size.id), ["icon", "preview", "slide"]);
  assert.ok(gallery.qaChecks.some((check) => check.includes("48px")));
  assert.match(gallery.snapshotKey, /^perturb-seq-crispr\|consulting-2p5d\|/);
  assert.match(gallery.svg, /workflow-pack-visual-qa-gallery/);
  assert.match(gallery.svg, /48px/);
  assert.match(gallery.svg, /120px/);
  assert.match(gallery.svg, /slide-size/);

  const svg = renderWorkflowPackVisualQaGallerySvg("ai-biosecurity-eval", { styleProfile: "risk-warning", limit: 4 });
  assert.match(svg, /data-style-profile="risk-warning"/);
  assert.match(svg, /risk-gate|dataset|benchmark|metric-card/);
});

test("workflow template QA reports bounds provenance claims and export fallback", () => {
  const qa = getWorkflowTemplateQa("ai-biosecurity-pipeline", { styleProfile: "consulting-2p5d" });

  assert.equal(qa.templateId, "ai-biosecurity-pipeline");
  assert.equal(qa.workflowPack, "ai-biosecurity-eval");
  assert.equal(qa.outOfBoundsCount, 0);
  assert.equal(qa.missingProvenanceCount, 0);
  assert.ok(qa.score >= 70);
  assert.ok(["premium", "needs-polish"].includes(qa.qaStatus));
  assert.ok(qa.premiumFallbackAssetIds.includes("risk-gate"));
  assert.ok(qa.exportWarnings.some((warning) => warning.includes("PPTX premium fallback assets")));
  assert.equal(qa.exportReadiness.svg.status, "full-vector");
  assert.equal(qa.exportReadiness.pdf.status, "full-vector");
  assert.equal(qa.exportReadiness.pptx.status, "editable-with-fallbacks");
  assert.equal(qa.exportReadiness.pptx.plotFallbackCount, 1);
  assert.equal(qa.exportReadiness.pptx.premiumAssetFallbackCount, qa.premiumFallbackAssetIds.length);
  assert.ok(qa.exportReadiness.pptx.fallbackAssets.some((asset) => asset.assetId === "risk-gate" && asset.assetRecipe === "hero-risk-gate"));
  assert.ok(qa.exportReadiness.pptx.nextAction.includes("scene JSON/SVG"));
  assert.equal(qa.exportReadiness.docx.status, "figure-panel");
  assert.ok(qa.actionItems.some((item) => item.kind === "claim" && item.title === "Resolve claim citations"));
  assert.ok(qa.actionItems.some((item) => item.kind === "export" && item.title === "Confirm premium asset fallback"));
});

test("journal figure QA separates manuscript readiness from deck polish", () => {
  const base = getWorkflowTemplateQa("perturb-seq-workflow", { styleProfile: "publication-line" });
  const journal = getJournalFigureQa("perturb-seq-workflow", { styleProfile: "publication-line" });

  assert.equal(journal.templateId, "perturb-seq-workflow");
  assert.equal(journal.figureIntent, "journal-figure");
  assert.equal(journal.styleProfile, "publication-line");
  assert.equal(journal.status, "journal-draft");
  assert.ok(journal.score < base.score);
  assert.ok(journal.counts.uiCardShapeCount > 4);
  assert.ok(journal.counts.plotMetadataReviewCount >= 1);
  assert.ok(journal.visualIssues.some((issue) => issue.kind === "layout" && issue.message.includes("product slide")));
  assert.ok(journal.plotIssues.some((issue) => issue.kind === "plot" && issue.message.includes("axis")));
  assert.ok(journal.exportWarnings.some((warning) => warning.includes("journal axis/legend")));
  assert.ok(journal.actionItems.some((item) => item.title === "Reduce UI-card framing"));
  assert.ok(journal.actionItems.some((item) => item.title === "Add journal plot metadata"));

  const deckOnly = getJournalFigureQa("perturb-seq-workflow", { styleProfile: "consulting-2p5d" });
  assert.equal(deckOnly.status, "deck-only");
  assert.ok(deckOnly.visualIssues.some((issue) => issue.kind === "style" && issue.message.includes("publication-line")));
  assert.ok(deckOnly.nextAction.includes("talks/decks"));
});

test("perturb-seq journal template passes manuscript-safe QA gate", () => {
  const template = getWorkflowTemplate("perturb-seq-workflow-journal");
  const pack = listWorkflowPacks().find((candidate) => candidate.id === "perturb-seq-crispr");
  assert.equal(template.recommendedStyleProfile, "publication-line");
  assert.ok(pack?.templates.includes("perturb-seq-workflow-journal"));

  const nodes = createWorkflowFigureNodes({ templateId: "perturb-seq-workflow-journal", styleProfile: "publication-line" });
  assert.ok(nodes.length >= 40);
  assert.ok(nodes.some((node) => node.kind === "plot" && node.payload.spec.plotType === "volcano"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "guide-rna"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "expression-matrix"));
  assert.equal(nodes.filter((node) => ["raised", "floating", "hero"].includes(String(node.style.depth))).length, 0);
  assert.equal(nodes.filter((node) => node.kind === "shape" && node.payload.shape === "round-rect").length, 0);

  const qa = getWorkflowTemplateQa("perturb-seq-workflow-journal", { styleProfile: "publication-line" });
  assert.equal(qa.qaStatus, "premium");
  assert.equal(qa.outOfBoundsCount, 0);
  assert.equal(qa.textOverflowCount, 0);
  assert.equal(qa.needsCitationCount, 0);

  const journal = getJournalFigureQa("perturb-seq-workflow-journal", { styleProfile: "publication-line" });
  assert.equal(journal.status, "journal-ready");
  assert.equal(journal.counts.decorativeDepthNodeCount, 0);
  assert.equal(journal.counts.uiCardShapeCount, 0);
  assert.equal(journal.counts.plotMetadataReviewCount, 0);
  assert.deepEqual(journal.visualIssues, []);
  assert.deepEqual(journal.plotIssues, []);
});

test("spatial transcriptomics journal template passes manuscript-safe QA gate", () => {
  const template = getWorkflowTemplate("spatial-results-panel-journal");
  const pack = listWorkflowPacks().find((candidate) => candidate.id === "spatial-transcriptomics");
  assert.equal(template.recommendedStyleProfile, "publication-line");
  assert.ok(pack?.templates.includes("spatial-results-panel-journal"));

  const nodes = createWorkflowFigureNodes({ templateId: "spatial-results-panel-journal", styleProfile: "publication-line" });
  assert.ok(nodes.length >= 40);
  assert.ok(nodes.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "histology-section"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "visium-spot-array"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "segmentation-mask"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "neighborhood-graph"));
  assert.equal(nodes.filter((node) => ["raised", "floating", "hero"].includes(String(node.style.depth))).length, 0);
  assert.equal(nodes.filter((node) => node.kind === "shape" && node.payload.shape === "round-rect").length, 0);

  const qa = getWorkflowTemplateQa("spatial-results-panel-journal", { styleProfile: "publication-line" });
  assert.equal(qa.qaStatus, "premium");
  assert.equal(qa.outOfBoundsCount, 0);
  assert.equal(qa.textOverflowCount, 0);
  assert.equal(qa.needsCitationCount, 0);

  const journal = getJournalFigureQa("spatial-results-panel-journal", { styleProfile: "publication-line" });
  assert.equal(journal.status, "journal-ready");
  assert.equal(journal.counts.decorativeDepthNodeCount, 0);
  assert.equal(journal.counts.uiCardShapeCount, 0);
  assert.equal(journal.counts.plotMetadataReviewCount, 0);
  assert.deepEqual(journal.visualIssues, []);
  assert.deepEqual(journal.plotIssues, []);
});

test("publication results workflow pack creates editable multi-panel figure nodes", () => {
  const pack = listWorkflowPacks().find((candidate) => candidate.id === "publication-results-panels");
  assert.ok(pack);
  assert.ok(pack.templates.includes("manuscript-results-figure"));

  const nodes = createWorkflowFigureNodes({
    workflowPack: "publication-results-panels",
    styleProfile: "consulting-2p5d"
  });
  assert.ok(nodes.length >= 18);
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "cell-tumor"));
  assert.ok(nodes.some((node) => node.kind === "symbol" && node.payload.assetId === "metric-card"));
  const plots = nodes.filter((node) => node.kind === "plot");
  assert.equal(plots.length, 3);
  assert.ok(plots.some((node) => node.payload.spec.plotType === "volcano"));
  assert.ok(plots.some((node) => node.payload.spec.plotType === "embedding-scatter"));
  assert.ok(plots.some((node) => node.payload.spec.plotType === "heatmap"));
  const embeddingPlot = plots.find((node) => node.payload.spec.plotType === "embedding-scatter");
  assert.ok(embeddingPlot);
  assert.ok(embeddingPlot.payload.spec.table.rows.length >= 16);
  assert.ok(embeddingPlot.payload.spec.table.rows.some((row) => row.cluster === "IFN-high"));
  assert.ok(nodes.some((node) => node.kind === "text" && node.name.includes("Claim")));
  assert.ok(nodes.some((node) => node.kind === "text" && String(node.payload.text).includes("co-profiled sample")));
  assert.ok(nodes.some((node) => node.kind === "text" && String(node.payload.text).includes("Source table + PPTX fallback review")));
  assert.ok(nodes.some((node) => node.kind === "text" && String(node.payload.text).includes("Claim, evidence, and export QA")));
  const claimText = nodes.find((node) => node.kind === "text" && String(node.payload.text).startsWith("Claim: IFN-high"));
  assert.ok(claimText);
  assert.ok(String(claimText.payload.text).length <= 86);
  assert.ok(claimText.transform.height >= 34);
  const panelASequencer = nodes.find((node) => node.kind === "symbol" && node.payload.assetId === "sequencer");
  assert.ok(panelASequencer);
  assert.ok(panelASequencer.transform.x + panelASequencer.transform.width <= 74 + Math.round(1060 * 0.36));

  const templateNodes = createWorkflowFigureNodes({
    templateId: "ai-biosecurity-pipeline",
    styleProfile: "consulting-2p5d"
  });
  assert.ok(templateNodes.some((node) => node.kind === "text" && node.payload.text?.includes("AI biosecurity evaluation pipeline")));
  assert.ok(templateNodes.some((node) => node.kind === "symbol" && node.payload.assetId === "risk-gate"));
  assert.ok(templateNodes.some((node) => node.kind === "symbol" && node.payload.layoutHint?.startsWith("ai-biosecurity-pipeline:")));

  const flagshipNodes = createFlagshipWorkflowDemoNodes({
    workflowPack: "spatial-transcriptomics",
    styleProfile: "consulting-2p5d"
  });
  assert.ok(flagshipNodes.length >= 10);
  assert.ok(flagshipNodes.some((node) => node.kind === "symbol" && node.payload.assetId === "visium-spot-array"));
});

test("priority flagship templates generate commercial editable figure structures", () => {
  const perturb = createWorkflowFigureNodes({ templateId: "perturb-seq-workflow", styleProfile: "consulting-2p5d" });
  assert.ok(perturb.length >= 28);
  assert.ok(perturb.some((node) => node.kind === "plot" && node.payload.spec.plotType === "volcano"));
  assert.ok(perturb.some((node) => node.kind === "symbol" && node.payload.assetId === "guide-rna"));
  assert.ok(perturb.some((node) => node.kind === "symbol" && node.payload.layoutHint?.startsWith("perturb-seq-workflow:step-")));
  const perturbReviewTitle = perturb.find((node) => node.kind === "text" && node.payload.text === "Review before export");
  const perturbReviewCard = perturb.find((node) =>
    node.kind === "shape" &&
    perturbReviewTitle &&
    node.transform.x === perturbReviewTitle.transform.x - 16 &&
    node.transform.y <= perturbReviewTitle.transform.y &&
    node.transform.width === 190
  );
  assert.ok(perturbReviewTitle);
  assert.ok(perturbReviewCard);
  for (const label of ["SVG exact", "PPTX fallback"]) {
    const badge = perturb.find((node) => node.kind === "text" && node.payload.text === label);
    assert.ok(badge, `${label} badge should be present`);
    assert.ok(badge.transform.x >= perturbReviewCard.transform.x, `${label} badge should stay inside review card`);
    assert.ok(badge.transform.x + badge.transform.width <= perturbReviewCard.transform.x + perturbReviewCard.transform.width, `${label} badge should stay inside review card`);
    assert.ok(badge.transform.y + badge.transform.height <= perturbReviewCard.transform.y + perturbReviewCard.transform.height, `${label} badge should not hang below review card`);
  }

  const spatial = createWorkflowFigureNodes({ templateId: "spatial-results-panel", styleProfile: "consulting-2p5d" });
  assert.ok(spatial.length >= 24);
  assert.ok(spatial.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap"));
  assert.ok(spatial.some((node) => node.kind === "symbol" && node.payload.assetId === "cell-boundary"));
  assert.ok(spatial.some((node) => node.kind === "symbol" && node.payload.assetId === "neighborhood-graph"));

  const singleCell = createWorkflowFigureNodes({ templateId: "single-cell-workflow", styleProfile: "consulting-2p5d" });
  assert.ok(singleCell.length >= 58);
  assert.ok(singleCell.some((node) => node.kind === "text" && node.payload.text?.includes("Single-cell multiomics capture-to-state figure")));
  assert.ok(singleCell.some((node) => node.kind === "text" && node.payload.text?.includes("RNA/ATAC readout")));
  assert.ok(singleCell.some((node) => node.kind === "plot" && node.payload.spec.plotType === "embedding-scatter"));
  assert.ok(singleCell.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Evidence layers"));
  for (const assetId of ["scrna-droplet", "cell-barcode", "umi-tag", "read-pair", "sequencing-read", "expression-matrix", "chromatin", "peak-call", "genome-browser-track", "embedding-space", "cell-neighborhood", "variant-snp", "copy-number"]) {
    assert.ok(singleCell.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in single-cell multiomics flagship`);
  }
  assert.ok(singleCell.some((node) => node.kind === "symbol" && node.payload.layoutHint === "single-cell-workflow:capture-droplet"));
  assert.ok(singleCell.some((node) => node.kind === "symbol" && node.payload.layoutHint === "single-cell-workflow:genome-browser-track"));
  assert.ok(singleCell.some((node) => node.kind === "text" && node.payload.text === "Review queue"));
  assert.ok(singleCell.every((node) => node.payload.workflowPack === "single-cell-multiomics" && node.payload.templateId === "single-cell-workflow"));

  const embeddingResults = createWorkflowFigureNodes({ templateId: "embedding-results", styleProfile: "consulting-2p5d" });
  assert.ok(embeddingResults.length >= 58);
  assert.ok(embeddingResults.some((node) => node.kind === "text" && node.payload.text?.includes("Single-cell embedding and marker evidence")));
  assert.ok(embeddingResults.some((node) => node.kind === "text" && node.payload.text === "Marker heatmap and lineage anchors"));
  assert.ok(embeddingResults.some((node) => node.kind === "text" && node.payload.text === "Cell-state callouts"));
  assert.ok(embeddingResults.some((node) => node.kind === "text" && node.payload.text === "Review before export"));
  assert.ok(embeddingResults.some((node) => node.kind === "plot" && node.payload.spec.plotType === "embedding-scatter" && node.payload.spec.title === "Cell-state embedding"));
  assert.ok(embeddingResults.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap" && node.payload.spec.title === "Marker program"));
  for (const assetId of ["embedding-space", "cell-neighborhood", "gene-locus", "expression-matrix", "cell-t", "cell-b", "cell-macrophage", "cell-stem", "cell-dividing", "cell-immune"]) {
    assert.ok(embeddingResults.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in embedding-results template`);
  }
  assert.ok(embeddingResults.some((node) => node.kind === "symbol" && node.payload.layoutHint === "embedding-results:embedding-space"));
  assert.ok(embeddingResults.some((node) => node.kind === "symbol" && node.payload.layoutHint === "embedding-results:myeloid-anchor"));
  assert.ok(embeddingResults.every((node) => !String(node.payload.text ?? "").includes("Agent template: embedding-results")));
  assert.ok(embeddingResults.every((node) => node.payload.workflowPack === "single-cell-multiomics" && node.payload.templateId === "embedding-results"));

  const cellState = createWorkflowFigureNodes({ templateId: "cell-state-summary", styleProfile: "consulting-2p5d" });
  assert.ok(cellState.length >= 62);
  assert.ok(cellState.some((node) => node.kind === "text" && node.payload.text?.includes("Single-cell cell-state summary")));
  assert.ok(cellState.some((node) => node.kind === "text" && node.payload.text === "State trajectory hypothesis"));
  assert.ok(cellState.some((node) => node.kind === "text" && node.payload.text === "Composition and marker support"));
  assert.ok(cellState.some((node) => node.kind === "text" && node.payload.text === "Editable state evidence chain"));
  assert.ok(cellState.some((node) => node.kind === "text" && node.payload.text === "Review before export"));
  assert.ok(cellState.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "State composition"));
  assert.ok(cellState.some((node) => node.kind === "connector" && node.style.lineStyle === "dashed"));
  for (const assetId of ["cell-stem", "cell-dividing", "cell-immune", "cell-macrophage", "cell-neighborhood", "embedding-space", "expression-matrix", "gene-locus"]) {
    assert.ok(cellState.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in cell-state-summary template`);
  }
  assert.ok(cellState.some((node) => node.kind === "symbol" && node.payload.layoutHint === "cell-state-summary:state-cycling"));
  assert.ok(cellState.some((node) => node.kind === "symbol" && node.payload.layoutHint === "cell-state-summary:marker-support-locus"));
  assert.ok(cellState.every((node) => !String(node.payload.text ?? "").includes("Agent template: cell-state-summary")));
  assert.ok(cellState.every((node) => node.payload.workflowPack === "single-cell-multiomics" && node.payload.templateId === "cell-state-summary"));

  const multiome = createWorkflowFigureNodes({ templateId: "multiome-assay-summary", styleProfile: "consulting-2p5d" });
  assert.ok(multiome.length >= 50);
  assert.ok(multiome.some((node) => node.kind === "text" && node.payload.text?.includes("Single-cell multiome RNA + ATAC summary")));
  assert.ok(multiome.some((node) => node.kind === "text" && node.payload.text === "Joint capture to paired modalities"));
  assert.ok(multiome.some((node) => node.kind === "text" && node.payload.text === "RNA expression evidence"));
  assert.ok(multiome.some((node) => node.kind === "text" && node.payload.text === "ATAC accessibility evidence"));
  assert.ok(multiome.some((node) => node.kind === "text" && node.payload.text === "Concordance and review"));
  assert.ok(multiome.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "RNA expression"));
  assert.ok(multiome.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Peak signal"));
  assert.ok(multiome.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap" && node.payload.spec.title === "RNA/ATAC concordance"));
  for (const assetId of ["scrna-droplet", "cell-barcode", "read-pair", "expression-matrix", "chromatin", "peak-call", "genome-browser-track", "nucleosome"]) {
    assert.ok(multiome.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in multiome-assay-summary template`);
  }
  assert.ok(multiome.some((node) => node.kind === "symbol" && node.payload.layoutHint === "multiome-assay-summary:rna-expression-matrix"));
  assert.ok(multiome.some((node) => node.kind === "symbol" && node.payload.layoutHint === "multiome-assay-summary:genome-track"));
  assert.ok(multiome.every((node) => !String(node.payload.text ?? "").includes("Agent template: multiome-assay-summary")));
  assert.ok(multiome.every((node) => node.payload.workflowPack === "single-cell-multiomics" && node.payload.templateId === "multiome-assay-summary"));

  const drug = createWorkflowFigureNodes({ templateId: "drug-discovery-funnel", styleProfile: "consulting-2p5d" });
  assert.ok(drug.length >= 58);
  assert.ok(drug.some((node) => node.kind === "text" && node.payload.text?.includes("Drug discovery target-to-candidate funnel")));
  assert.ok(drug.some((node) => node.kind === "text" && node.payload.text?.includes("Target-to-hit evidence board")));
  assert.ok(drug.some((node) => node.kind === "text" && node.payload.text?.includes("DMPK, safety, and nomination gate")));
  assert.ok(drug.some((node) => node.kind === "text" && node.payload.text === "Candidate evidence path"));
  assert.ok(drug.every((node) => !String(node.payload.text ?? "").includes("Decision spine: validate biology")));
  for (const status of ["source-linked", "editable SAR", "QA gate"]) {
    assert.ok(drug.some((node) => node.kind === "text" && node.payload.text === status), `${status} status chip should appear in drug-discovery flagship`);
  }
  assert.ok(drug.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Dose response"));
  assert.ok(drug.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Selectivity"));
  for (const assetId of ["target-validation", "compound-library", "medicinal-chemistry-cycle", "target-engagement", "sar-table", "pk-profile", "ind-enabling-package"]) {
    assert.ok(drug.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in drug-discovery flagship`);
  }
  assert.ok(drug.some((node) => node.kind === "symbol" && node.payload.layoutHint === "drug-discovery-funnel:evidence-target-validation"));
  assert.ok(drug.some((node) => node.kind === "symbol" && node.payload.layoutHint === "drug-discovery-funnel:gate-candidate-nomination"));
  assert.ok(drug.every((node) => node.payload.workflowPack === "drug-discovery" && node.payload.templateId === "drug-discovery-funnel"));

  const protein = createWorkflowFigureNodes({ templateId: "protein-engineering-platform", styleProfile: "consulting-2p5d" });
  assert.ok(protein.length >= 60);
  assert.ok(protein.some((node) => node.kind === "text" && node.payload.text?.includes("Protein engineering design-to-developability platform")));
  assert.ok(protein.some((node) => node.kind === "text" && node.payload.text?.includes("Mutation space, sequence constraints")));
  assert.ok(protein.some((node) => node.kind === "text" && node.payload.text === "review-before-export"));
  assert.ok(protein.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Affinity gain"));
  assert.ok(protein.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Developability"));
  for (const assetId of ["protein-design-model", "protein-variant-library", "sequence-logo", "directed-evolution", "binding-affinity-assay", "affinity-maturation", "developability-profile", "protein-domain", "binding-pocket", "structure-prediction", "enzyme-kinetics", "purification-column", "stability-assay", "expression-host", "protein-complex"]) {
    assert.ok(protein.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in protein-engineering flagship`);
  }
  assert.ok(protein.some((node) => node.kind === "symbol" && node.payload.layoutHint === "protein-engineering-platform:variant-library"));
  assert.ok(protein.every((node) => !String(node.payload.text ?? "").includes("Decision spine: design hypothesis")));
  assert.ok(protein.every((node) => node.payload.workflowPack === "protein-engineering" && node.payload.templateId === "protein-engineering-platform"));

  const synthetic = createWorkflowFigureNodes({ templateId: "synthetic-biology-platform", styleProfile: "consulting-2p5d" });
  assert.ok(synthetic.length >= 58);
  assert.ok(synthetic.some((node) => node.kind === "text" && node.payload.text?.includes("Synthetic biology design-build-test-learn platform")));
  assert.ok(synthetic.some((node) => node.kind === "text" && node.payload.text?.includes("Genetic circuit design canvas")));
  assert.ok(synthetic.some((node) => node.kind === "text" && node.payload.text === "DBTL trace"));
  assert.ok(synthetic.every((node) => !String(node.payload.text ?? "").includes("Decision spine: design circuit")));
  assert.ok(synthetic.some((node) => node.kind === "text" && node.payload.text === "containment-review"));
  assert.ok(synthetic.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Sensor response"));
  assert.ok(synthetic.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Pathway output"));
  for (const assetId of ["genetic-circuit", "dna-assembly", "chassis-cell", "biosensor-circuit", "kill-switch", "promoter-library", "synthetic-operon", "metabolic-pathway-engineering"]) {
    assert.ok(synthetic.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in synthetic-biology flagship`);
  }
  assert.ok(synthetic.some((node) => node.kind === "symbol" && node.payload.layoutHint === "synthetic-biology-platform:circuit-map"));
  assert.ok(synthetic.some((node) => node.kind === "symbol" && node.payload.layoutHint === "synthetic-biology-platform:containment-gate"));
  assert.ok(synthetic.every((node) => node.payload.workflowPack === "synthetic-biology" && node.payload.templateId === "synthetic-biology-platform"));

  const microbiome = createWorkflowFigureNodes({ templateId: "microbiome-infectious-disease-platform", styleProfile: "consulting-2p5d" });
  assert.ok(microbiome.length >= 70);
  assert.ok(microbiome.some((node) => node.kind === "text" && node.payload.text?.includes("Microbiome and infectious disease evidence workflow")));
  assert.ok(microbiome.some((node) => node.kind === "text" && node.payload.text?.includes("Host-microbe interface map")));
  assert.ok(microbiome.some((node) => node.kind === "text" && node.payload.text?.includes("AMR and outbreak review")));
  assert.ok(microbiome.some((node) => node.kind === "text" && node.payload.text === "Evidence path"));
  assert.ok(microbiome.every((node) => !String(node.payload.text ?? "").includes("Decision spine: community context")));
  assert.ok(microbiome.some((node) => node.kind === "text" && node.payload.text === "source-and-containment-review"));
  assert.ok(microbiome.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Infection load"));
  assert.ok(microbiome.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "AMR signals"));
  for (const assetId of ["microbiome-community", "mucosal-barrier", "pathogen-host-interaction", "metagenomic-read", "antimicrobial-resistance", "gut-microbiome", "amr-gene", "outbreak-cluster"]) {
    assert.ok(microbiome.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in microbiome infectious disease flagship`);
  }
  assert.ok(microbiome.some((node) => node.kind === "symbol" && node.payload.layoutHint === "microbiome-infectious-disease-platform:interface-community"));
  assert.ok(microbiome.some((node) => node.kind === "symbol" && node.payload.layoutHint === "microbiome-infectious-disease-platform:review-outbreak"));
  assert.ok(microbiome.every((node) => node.payload.workflowPack === "microbiome-infectious-disease" && node.payload.templateId === "microbiome-infectious-disease-platform"));

  const cellTherapy = createWorkflowFigureNodes({ templateId: "cell-therapy-manufacturing-platform", styleProfile: "consulting-2p5d" });
  assert.ok(cellTherapy.length >= 70);
  assert.ok(cellTherapy.some((node) => node.kind === "text" && node.payload.text?.includes("Cell therapy vein-to-vein manufacturing workflow")));
  assert.ok(cellTherapy.some((node) => node.kind === "text" && node.payload.text?.includes("Vein-to-vein manufacturing map")));
  assert.ok(cellTherapy.some((node) => node.kind === "text" && node.payload.text?.includes("Vein-to-vein path")));
  assert.ok(cellTherapy.every((node) => !String(node.payload.text ?? "").includes("Decision spine: patient material")));
  assert.ok(cellTherapy.some((node) => node.kind === "text" && node.payload.text === "toxicity-and-followup-review"));
  assert.ok(cellTherapy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Potency"));
  assert.ok(cellTherapy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Release QC"));
  assert.ok(cellTherapy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Cytokine trend"));
  for (const assetId of ["leukapheresis", "viral-vector-transduction", "cell-expansion", "release-testing", "patient-infusion", "car-t-cell", "tumor-antigen", "potency-assay", "infusion-bag", "cytokine-release"]) {
    assert.ok(cellTherapy.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in cell-therapy flagship`);
  }
  assert.ok(cellTherapy.some((node) => node.kind === "symbol" && node.payload.layoutHint === "cell-therapy-manufacturing-platform:vein-leukapheresis"));
  assert.ok(cellTherapy.some((node) => node.kind === "symbol" && node.payload.layoutHint === "cell-therapy-manufacturing-platform:safety-cytokine"));
  assert.ok(cellTherapy.every((node) => node.payload.workflowPack === "cell-therapy" && node.payload.templateId === "cell-therapy-manufacturing-platform"));

  const microscopy = createWorkflowFigureNodes({ templateId: "microscopy-image-analysis-pipeline", styleProfile: "consulting-2p5d" });
  assert.ok(microscopy.length >= 60);
  assert.ok(microscopy.some((node) => node.kind === "text" && node.payload.text?.includes("Microscopy image analysis to phenotype workflow")));
  assert.ok(microscopy.some((node) => node.kind === "text" && node.payload.text?.includes("Raw image evidence, focus score")));
  assert.ok(microscopy.some((node) => node.kind === "text" && node.payload.text === "model-and-annotation-review"));
  assert.ok(microscopy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Focus QC"));
  assert.ok(microscopy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Mask QC"));
  for (const assetId of ["microscope-field", "tile-stitching", "nuclei-segmentation", "phenotype-feature-vector", "image-qc-dashboard", "fluorescence-channel", "z-stack", "illumination-correction", "membrane-segmentation", "instance-mask", "segmentation-model", "morphology-embedding", "classifier-heatmap", "cell-tracking", "annotation-brush", "cell-neighborhood", "error-analysis"]) {
    assert.ok(microscopy.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in microscopy image-analysis flagship`);
  }
  assert.ok(microscopy.some((node) => node.kind === "symbol" && node.payload.layoutHint === "microscopy-image-analysis-pipeline:microscope-field"));
  assert.ok(microscopy.every((node) => !String(node.payload.text ?? "").includes("Decision spine: image evidence")));
  assert.ok(microscopy.every((node) => node.payload.workflowPack === "microscopy-image-analysis" && node.payload.templateId === "microscopy-image-analysis-pipeline"));

  const labAutomation = createWorkflowFigureNodes({ templateId: "lab-automation-platform", styleProfile: "consulting-2p5d" });
  assert.ok(labAutomation.length >= 80);
  assert.ok(labAutomation.some((node) => node.kind === "text" && node.payload.text?.includes("Lab automation assay execution platform")));
  assert.ok(labAutomation.some((node) => node.kind === "text" && node.payload.text?.includes("Robotic workcell deck map")));
  assert.ok(labAutomation.every((node) => !String(node.payload.text ?? "").includes("Decision spine: deck setup")));
  assert.ok(labAutomation.some((node) => node.kind === "text" && node.payload.text === "operator-review-and-qc-signoff"));
  assert.ok(labAutomation.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Run QC"));
  for (const assetId of ["assay-scheduler", "automated-liquid-handler", "robotic-arm", "plate-reader", "lims-dashboard", "deck-layout", "tip-rack", "reagent-reservoir", "plate-384", "plate-stack", "plate-handler", "barcode-scanner", "incubator-stack", "sample-tracker", "automation-orchestrator", "qc-gate-automation", "lab-sensor"]) {
    assert.ok(labAutomation.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in lab automation flagship`);
  }
  assert.ok(labAutomation.some((node) => node.kind === "symbol" && node.payload.layoutHint?.startsWith("lab-automation-platform:workcell-")));
  assert.ok(labAutomation.some((node) => node.kind === "text" && node.payload.text === "Sample identity ribbon"));
  assert.ok(labAutomation.every((node) => node.payload.workflowPack === "lab-automation" && node.payload.templateId === "lab-automation-platform"));

  const anatomy = createWorkflowFigureNodes({ templateId: "anatomy-organ-system-overview", styleProfile: "consulting-2p5d" });
  assert.ok(anatomy.length >= 80);
  assert.ok(anatomy.some((node) => node.kind === "text" && node.payload.text?.includes("Anatomy organ system context map")));
  assert.ok(anatomy.some((node) => node.kind === "text" && node.payload.text?.includes("Cross-organ atlas map")));
  assert.ok(anatomy.some((node) => node.kind === "text" && node.payload.text === "Organ evidence path"));
  assert.ok(anatomy.every((node) => !String(node.payload.text ?? "").includes("Decision spine: organ context")));
  assert.ok(anatomy.some((node) => node.kind === "text" && node.payload.text === "clinical-context-review"));
  assert.ok(anatomy.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Endpoint trend"));
  for (const assetId of ["anatomy-overview", "organ-axis-brain-lung-gut", "organ-sample-flow", "tissue-biomarker-panel", "clinical-endpoint-card", "brain", "lung", "gut", "kidney", "heart", "intestinal-villus", "renal-nephron", "hepatic-lobule", "blood-vessel", "human-cohort", "patient-organ-cohort"]) {
    assert.ok(anatomy.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in anatomy organ systems flagship`);
  }
  assert.ok(anatomy.some((node) => node.kind === "symbol" && node.payload.layoutHint === "anatomy-organ-system-overview:atlas-overview"));
  assert.ok(anatomy.some((node) => node.kind === "symbol" && node.payload.layoutHint === "anatomy-organ-system-overview:clinical-endpoint"));
  assert.ok(anatomy.every((node) => node.payload.workflowPack === "anatomy-organ-systems" && node.payload.templateId === "anatomy-organ-system-overview"));

  const methods = createWorkflowFigureNodes({ templateId: "methods-protocol-overview", styleProfile: "consulting-2p5d" });
  assert.ok(methods.length >= 80);
  assert.ok(methods.some((node) => node.kind === "text" && node.payload.text?.includes("Methods and protocol overview")));
  assert.ok(methods.some((node) => node.kind === "text" && node.payload.text?.includes("Protocol bench board")));
  assert.ok(methods.some((node) => node.kind === "text" && node.payload.text?.includes("Controls + caveat review")));
  assert.ok(methods.some((node) => node.kind === "text" && node.payload.text === "Method evidence path"));
  assert.ok(methods.every((node) => !String(node.payload.text ?? "").includes("Decision spine: sample preparation")));
  assert.ok(methods.some((node) => node.kind === "text" && node.payload.text === "method-caveat-review"));
  assert.ok(methods.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "QC signal"));
  for (const assetId of ["sample-prep-workflow", "reagent-mastermix", "pcr-amplification", "qpcr-assay", "protocol-qc-gate", "serial-dilution", "plate-96", "replicate-layout", "control-sample-set", "incubation-step", "wash-step", "magnetic-bead-cleanup", "western-blot-workflow", "elisa-assay", "standard-curve", "protocol-checklist", "method-safety-note"]) {
    assert.ok(methods.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in methods and protocols flagship`);
  }
  assert.ok(methods.some((node) => node.kind === "symbol" && node.payload.layoutHint === "methods-protocol-overview:bench-sample-prep"));
  assert.ok(methods.some((node) => node.kind === "symbol" && node.payload.layoutHint === "methods-protocol-overview:review-qc-gate"));
  assert.ok(methods.every((node) => node.payload.workflowPack === "methods-and-protocols" && node.payload.templateId === "methods-protocol-overview"));

  const grant = createWorkflowFigureNodes({ templateId: "grant-consulting-one-slide", styleProfile: "consulting-2p5d" });
  assert.ok(grant.length >= 60);
  assert.ok(grant.some((node) => node.kind === "text" && node.payload.text?.includes("Grant and consulting executive summary")));
  assert.ok(grant.some((node) => node.kind === "text" && node.payload.text?.includes("Recommended ask")));
  assert.ok(grant.some((node) => node.kind === "text" && node.payload.text === "executive-recommendation-review"));
  assert.ok(grant.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Impact"));
  assert.ok(grant.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Risk"));
  for (const assetId of ["recommendation-card", "problem-statement-card", "scientific-opportunity-map", "evidence-snapshot", "budget-envelope", "resource-allocation", "go-no-go-gate", "specific-aim-1", "specific-aim-2", "specific-aim-3", "milestone-roadmap", "team-capability-map", "deliverable-package", "risk-matrix", "risk-mitigation-plan"]) {
    assert.ok(grant.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in grant and consulting flagship`);
  }
  assert.ok(grant.some((node) => node.kind === "symbol" && node.payload.layoutHint === "grant-consulting-one-slide:recommendation"));
  assert.ok(grant.every((node) => !String(node.payload.text ?? "").includes("Decision spine: define need")));
  assert.ok(grant.every((node) => node.payload.workflowPack === "grant-and-consulting-summary" && node.payload.templateId === "grant-consulting-one-slide"));

  const clinical = createWorkflowFigureNodes({ templateId: "clinical-translational-study-overview", styleProfile: "consulting-2p5d" });
  assert.ok(clinical.length >= 65);
  assert.ok(clinical.some((node) => node.kind === "text" && node.payload.text?.includes("Clinical translational evidence bridge")));
  assert.ok(clinical.some((node) => node.kind === "text" && node.payload.text?.includes("Cohort source, eligibility, and trial schema")));
  assert.ok(clinical.some((node) => node.kind === "text" && node.payload.text === "clinical-claims-review"));
  assert.ok(clinical.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Enrollment"));
  assert.ok(clinical.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Safety"));
  for (const assetId of ["patient-journey-map", "consent-enrollment", "eligibility-criteria", "randomization-schema", "clinical-sample-flow", "biomarker-validation", "endpoint-hierarchy", "clinician-review", "clinical-decision-support", "cohort-stratification", "cohort-table", "biospecimen-collection", "clinical-omics-bridge", "biomarker-discovery", "assay-validation", "validation-cohort", "clinical-response-card", "survival-curve", "adverse-event-panel", "clinical-risk-benefit", "regulatory-evidence-brief"]) {
    assert.ok(clinical.some((node) => node.kind === "symbol" && node.payload.assetId === assetId), `${assetId} should appear in clinical translational flagship`);
  }
  assert.ok(clinical.some((node) => node.kind === "symbol" && node.payload.layoutHint === "clinical-translational-study-overview:cohort-schema"));
  assert.ok(clinical.every((node) => !String(node.payload.text ?? "").includes("Decision spine: enroll cohort")));
  assert.ok(clinical.every((node) => node.payload.workflowPack === "clinical-translational" && node.payload.templateId === "clinical-translational-study-overview"));

  const hybridTemplate = getWorkflowTemplate("spatial-realistic-hybrid-panel");
  assert.equal(hybridTemplate.recommendedStyleProfile, "scientific-editorial-realism");
  assert.ok(hybridTemplate.previewAssetIds.includes("realistic-he-tissue-section"));
  const hybrid = createWorkflowFigureNodes({ templateId: "spatial-realistic-hybrid-panel", styleProfile: "scientific-editorial-realism" });
  assert.ok(hybrid.length >= 22);
  assert.ok(hybrid.some((node) => node.kind === "image" && node.payload.assetId === "realistic-he-tissue-section"));
  assert.ok(hybrid.some((node) => node.kind === "image" && node.payload.crop?.zoom > 1));
  assert.ok(hybrid.some((node) => node.kind === "image" && node.payload.mask?.shape === "tissue-contour"));
  assert.ok(hybrid.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap"));
  assert.ok(hybrid.every((node) => node.payload.workflowPack === "spatial-transcriptomics" && node.payload.templateId === "spatial-realistic-hybrid-panel"));
  const hybridQa = getWorkflowTemplateQa("spatial-realistic-hybrid-panel", { styleProfile: "scientific-editorial-realism" });
  assert.ok(hybridQa.exportReadiness.pptx.fallbackAssets.some((asset) => asset.assetId === "realistic-he-tissue-section" && asset.exportBehavior === "embed-image-fallback"));
  assert.ok(hybridQa.exportWarnings.some((warning) => warning.includes("realistic-he-tissue-section")));

  const wetlabTemplate = getWorkflowTemplate("wetlab-realistic-context-panel");
  assert.equal(wetlabTemplate.recommendedStyleProfile, "scientific-editorial-realism");
  assert.ok(wetlabTemplate.previewAssetIds.includes("realistic-pipette-bench"));
  const wetlab = createWorkflowFigureNodes({ templateId: "wetlab-realistic-context-panel", styleProfile: "scientific-editorial-realism" });
  assert.ok(wetlab.length >= 22);
  assert.ok(wetlab.some((node) => node.kind === "image" && node.payload.assetId === "realistic-pipette-bench"));
  assert.ok(wetlab.some((node) => node.kind === "image" && node.payload.assetId === "realistic-biosafety-cabinet"));
  assert.ok(wetlab.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar"));
  assert.ok(wetlab.every((node) => node.payload.workflowPack === "publication-results-panels" && node.payload.templateId === "wetlab-realistic-context-panel"));
  const wetlabQa = getWorkflowTemplateQa("wetlab-realistic-context-panel", { styleProfile: "scientific-editorial-realism" });
  assert.ok(wetlabQa.exportReadiness.pptx.fallbackAssets.some((asset) => asset.assetId === "realistic-pipette-bench" && asset.exportBehavior === "embed-image-fallback"));
  assert.ok(wetlabQa.exportWarnings.some((warning) => warning.includes("realistic-biosafety-cabinet")));

  const cellularTemplate = getWorkflowTemplate("cellular-realistic-evidence-panel");
  assert.equal(cellularTemplate.recommendedStyleProfile, "scientific-editorial-realism");
  assert.ok(cellularTemplate.previewAssetIds.includes("realistic-organoid-texture"));
  const cellular = createWorkflowFigureNodes({ templateId: "cellular-realistic-evidence-panel", styleProfile: "scientific-editorial-realism" });
  assert.ok(cellular.length >= 24);
  assert.ok(cellular.some((node) => node.kind === "image" && node.payload.assetId === "realistic-organoid-texture"));
  assert.ok(cellular.some((node) => node.kind === "image" && node.payload.assetId === "realistic-pathogen-particles"));
  assert.ok(cellular.some((node) => node.kind === "symbol" && node.payload.assetId === "cell-tumor"));
  assert.ok(cellular.some((node) => node.kind === "plot" && node.payload.spec.plotType === "heatmap"));
  assert.ok(cellular.every((node) => node.payload.workflowPack === "publication-results-panels" && node.payload.templateId === "cellular-realistic-evidence-panel"));
  const cellularQa = getWorkflowTemplateQa("cellular-realistic-evidence-panel", { styleProfile: "scientific-editorial-realism" });
  assert.ok(cellularQa.exportReadiness.pptx.fallbackAssets.some((asset) => asset.assetId === "realistic-tumor-microenvironment" && asset.exportBehavior === "embed-image-fallback"));
  assert.ok(cellularQa.exportWarnings.some((warning) => warning.includes("realistic-pathogen-particles")));

  const spaceRealisticTemplate = getWorkflowTemplate("space-realistic-context-panel");
  assert.equal(spaceRealisticTemplate.recommendedStyleProfile, "scientific-editorial-realism");
  assert.ok(spaceRealisticTemplate.previewAssetIds.includes("realistic-spacecraft-context"));
  const spaceRealistic = createWorkflowFigureNodes({ templateId: "space-realistic-context-panel", styleProfile: "scientific-editorial-realism" });
  assert.ok(spaceRealistic.length >= 24);
  assert.ok(spaceRealistic.some((node) => node.kind === "image" && node.payload.assetId === "realistic-spacecraft-context"));
  assert.ok(spaceRealistic.some((node) => node.kind === "image" && node.payload.assetId === "realistic-genelab-data-context"));
  assert.ok(spaceRealistic.some((node) => node.kind === "symbol" && node.payload.assetId === "microgravity"));
  assert.ok(spaceRealistic.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar"));
  assert.ok(spaceRealistic.every((node) => node.payload.workflowPack === "space-biology-genelab" && node.payload.templateId === "space-realistic-context-panel"));
  const spaceRealisticQa = getWorkflowTemplateQa("space-realistic-context-panel", { styleProfile: "scientific-editorial-realism" });
  assert.ok(spaceRealisticQa.exportReadiness.pptx.fallbackAssets.some((asset) => asset.assetId === "realistic-spacecraft-context" && asset.exportBehavior === "embed-image-fallback"));
  assert.ok(spaceRealisticQa.exportWarnings.some((warning) => warning.includes("realistic-genelab-data-context")));

  const ai = createWorkflowFigureNodes({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" });
  assert.ok(ai.length >= 28);
  assert.ok(ai.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar"));
  assert.ok(ai.some((node) => node.kind === "symbol" && node.payload.assetId === "domain-expert-review"));
  assert.ok(ai.some((node) => node.kind === "symbol" && node.payload.styleProfile === "risk-warning"));

  const permissioning = createWorkflowFigureNodes({ templateId: "permissioning-ladder", styleProfile: "consulting-2p5d" });
  assert.ok(permissioning.length >= 32);
  assert.ok(permissioning.some((node) => node.kind === "text" && node.payload.text === "Tier 0"));
  assert.ok(permissioning.some((node) => node.kind === "text" && node.payload.text === "Tier 3"));
  assert.ok(permissioning.some((node) => node.kind === "symbol" && node.payload.assetId === "permission-tier"));
  assert.ok(permissioning.some((node) => node.kind === "symbol" && node.payload.assetId === "escalation-path"));
  assert.ok(permissioning.some((node) => node.kind === "symbol" && node.payload.assetId === "approval-stamp"));
  assert.ok(permissioning.some((node) => node.kind === "symbol" && node.payload.assetId === "blocked-output"));
  assert.ok(permissioning.some((node) => node.kind === "symbol" && node.payload.layoutHint === "permissioning-ladder:blocked-outcome"));
  assert.ok(permissioning.some((node) => node.kind === "connector" && node.style.lineStyle === "dashed"));
  assert.ok(permissioning.every((node) => node.payload.workflowPack === "ai-biosecurity-eval" && node.payload.templateId === "permissioning-ladder"));

  const benchmarkDashboard = createWorkflowFigureNodes({ templateId: "benchmark-dashboard", styleProfile: "consulting-2p5d" });
  assert.ok(benchmarkDashboard.length >= 34);
  assert.ok(benchmarkDashboard.some((node) => node.kind === "text" && node.payload.text === "AUROC"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "text" && node.payload.text === "Review load"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "symbol" && node.payload.assetId === "bio-classifier"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "symbol" && node.payload.assetId === "error-analysis"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "symbol" && node.payload.assetId === "human-review" && node.payload.styleProfile === "risk-warning"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "plot" && node.payload.spec.plotType === "line" && node.payload.spec.title === "Calibration curve"));
  assert.ok(benchmarkDashboard.some((node) => node.kind === "plot" && node.payload.spec.plotType === "bar" && node.payload.spec.title === "Failure modes"));
  assert.ok(benchmarkDashboard.every((node) => node.payload.workflowPack === "ai-biosecurity-eval" && node.payload.templateId === "benchmark-dashboard"));

  const reviewAudit = createWorkflowFigureNodes({ templateId: "review-audit-flow", styleProfile: "consulting-2p5d" });
  assert.ok(reviewAudit.length >= 30);
  assert.ok(reviewAudit.some((node) => node.kind === "symbol" && node.payload.assetId === "approval-stamp"));
  assert.ok(reviewAudit.some((node) => node.kind === "symbol" && node.payload.assetId === "blocked-output"));
  assert.ok(reviewAudit.some((node) => node.kind === "symbol" && node.payload.layoutHint === "review-audit-flow:blocked-outcome"));
  assert.ok(reviewAudit.some((node) => node.kind === "connector" && node.style.lineStyle === "dashed"));
  assert.ok(reviewAudit.every((node) => node.payload.workflowPack === "ai-biosecurity-eval" && node.payload.templateId === "review-audit-flow"));
});

test("asset quality report captures benchmark-driven coverage gaps", () => {
  const report = getAssetQualityReport();
  assert.equal(report.summary.totalAssets, 466);
  assert.equal(report.summary.biologyAssets, 386);
  assert.equal(report.summary.aiAssets, 80);
  assert.equal(report.tierCounts.signature + report.tierCounts.hero, 401);
  assert.equal(report.workflowCoverage.length, 18);
  assert.ok(report.workflowCoverage.every((pack) => pack.missingAssetIds.length === 0));
  assert.ok(report.workflowCoverage.every((pack) => pack.missingTemplateIds.length === 0));
  assert.ok(report.workflowCoverage.every((pack) => pack.templateCount >= 4));
  assert.ok(report.workflowCoverage.every((pack) => pack.flagshipTemplateId));
  assert.ok(report.styleCoverage.every((style) => style.count === 466));
  assert.ok(report.benchmarks.some((benchmark) => benchmark.id === "biorender"));
  assert.ok(report.benchmarks.some((benchmark) => benchmark.id === "figma-components"));
  assert.ok(report.qualityRubric.some((item) => item.includes("Recognizable at 48px")));
  assert.ok(report.priorityGaps.some((gap) => gap.includes("Coverage gap")));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "publication-results-panels" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "drug-discovery" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "protein-engineering" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "synthetic-biology" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "microbiome-infectious-disease" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "cell-therapy" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "microscopy-image-analysis" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "lab-automation" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "anatomy-organ-systems" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "methods-and-protocols" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "grant-and-consulting-summary" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.ok(report.workflowCoverage.some((pack) => pack.id === "clinical-translational" && pack.signatureOrHeroCount >= 12 && pack.qaStatus === "premium"));
  assert.deepEqual(report.recommendedNextPacks.slice(0, 3), ["immunology-oncology", "bio-llm-benchmarks", "biosafety-permissioning"]);
});

test("premium asset appearance overrides survive rendering and export", () => {
  const svg = renderPremiumAssetSvg("risk-gate", {
    variant: "outline",
    appearance: {
      accent: "#ef4444",
      secondary: "#fee2e2",
      fill: "#fff7ed",
      stroke: "#991b1b",
      strokeWidth: 4,
      labelColor: "#7f1d1d"
    }
  });
  assert.match(svg, /data-accent="#ef4444"/);
  assert.match(svg, /data-stroke-width="4"/);
  assert.match(svg, /#991b1b/);

  const project = createProject("Appearance export");
  const node = createCuratedSymbolNode({
    assetId: "risk-gate",
    x: 120,
    y: 120,
    variant: "outline",
    accent: "#ef4444",
    stroke: "#991b1b",
    strokeWidth: 4,
    labelColor: "#7f1d1d"
  });
  const next = addNode(project, node);
  const exported = exportProject(next, { format: "svg" });
  assert.match(String(exported.data), /data-accent="#ef4444"/);
  assert.match(String(exported.data), /data-stroke-width="4"/);
});

test("semantic asset search covers biology and AI safety use cases", () => {
  const spatial = searchAssets({ query: "spatial transcriptomics tissue spot", limit: 5 }).map((result) => result.asset.id);
  const safety = searchAssets({ query: "biosecurity risk permission human review", limit: 8 }).map((result) => result.asset.id);

  assert.ok(spatial.includes("spatial-grid") || spatial.includes("visium-spot-array"));
  assert.ok(safety.includes("risk-gate"));
  assert.ok(safety.includes("permission-tier") || safety.includes("human-review"));
});

test("slide recommendations return ranked assets with placement hints", () => {
  const recommendations = recommendAssetsForSlide({
    title: "AI biosecurity evaluation pipeline",
    narrative: "Classifier, benchmark, risk gate, human review, and audit log.",
    layoutIntent: "workflow",
    styleProfile: "consulting-2p5d",
    limit: 6
  });

  assert.equal(recommendations.length, 6);
  assert.ok(recommendations.some((result) => result.asset.id === "risk-gate"));
  assert.ok(recommendations.some((result) => result.workflowPack === "ai-biosecurity-eval"));
  assert.ok(recommendations.every((result) => result.suggestedPlacement));
});

test("premium assets survive SVG export through scene graph", () => {
  let project = createProject("Premium asset export");
  project = addNode(project, createCuratedSymbolNode({ assetId: "risk-gate", x: 100, y: 120, label: "Risk gate" }));
  const svg = exportProject(project, { format: "svg" });
  assert.match(String(svg.data), /premium-asset/);
  assert.match(String(svg.data), /data-asset-id="risk-gate"/);
  assert.equal(getAsset("risk-gate").family, "riskGate");
});
