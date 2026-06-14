import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startServer } from "../apps/api/src/server.ts";
import { handleJsonRpc } from "../packages/mcp/src/server.ts";

test("local API creates, validates, and exports a project", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "scientific-image-api-"));
  const server = await startServer(0, { dataDir });
  const address = server.address();
  assert.equal(typeof address, "object");
  const port = typeof address === "object" && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const created = await fetch(`${base}/projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "API fixture", kind: "slide" })
    }).then((response) => response.json());
    const projectId = created.project.id;

    const templated = await fetch(`${base}/projects/${projectId}/templates/perturb-seq-workflow`, { method: "POST" }).then((response) => response.json());
    assert.ok(templated.project.pages[0].nodes.length >= 5);

    const validation = await fetch(`${base}/projects/${projectId}/validate`, { method: "POST" }).then((response) => response.json());
    assert.equal(validation.validation.ok, true);

    const svg = await fetch(`${base}/projects/${projectId}/export/svg`).then((response) => response.text());
    assert.match(svg, /Perturbation effects/);

    const transientPptxResponse = await fetch(`${base}/exports/pptx`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project: templated.project })
    });
    assert.equal(transientPptxResponse.headers.get("content-type"), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    const transientWarningHeader = transientPptxResponse.headers.get("x-scientific-image-warnings");
    assert.ok(transientWarningHeader);
    assert.ok(Array.isArray(JSON.parse(decodeURIComponent(transientWarningHeader))));
    const transientPptx = await transientPptxResponse.arrayBuffer();
    assert.equal(Buffer.from(transientPptx).subarray(0, 2).toString(), "PK");

    const transientPdf = await fetch(`${base}/exports/pdf`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project: templated.project })
    }).then((response) => response.arrayBuffer());
    assert.equal(Buffer.from(transientPdf).subarray(0, 4).toString(), "%PDF");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("local API runs outline-first premium deck workflow", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "scientific-image-deck-api-"));
  const server = await startServer(0, { dataDir });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const created = await fetch(`${base}/projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Premium API deck", kind: "slide" })
    }).then((response) => response.json());
    const projectId = created.project.id;

    const source = await fetch(`${base}/projects/${projectId}/sources`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "markdown",
        name: "notes.md",
        text: "# Premium Bio AI Deck\n\n## Motivation\nAI evaluation needs provenance and review.\n\n## Results\nStructured slides keep claims visible."
      })
    }).then((response) => response.json());
    assert.equal(source.source.kind, "markdown");

    const outline = await fetch(`${base}/projects/${projectId}/deck/outline`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slideCount: 5 })
    }).then((response) => response.json());
    assert.equal(outline.outline.slides.length, 5);

    const approved = await fetch(`${base}/projects/${projectId}/deck/outline/approve`, { method: "POST" }).then((response) => response.json());
    assert.equal(approved.outline.status, "approved");

    const generated = await fetch(`${base}/projects/${projectId}/deck/generate`, { method: "POST" }).then((response) => response.json());
    assert.equal(generated.project.pages.length, 5);

    const validation = await fetch(`${base}/projects/${projectId}/deck/validate`, { method: "POST" }).then((response) => response.json());
    assert.equal(validation.validation.ok, true);

    const pptx = await fetch(`${base}/projects/${projectId}/export/pptx`).then((response) => response.arrayBuffer());
    assert.equal(Buffer.from(pptx).subarray(0, 2).toString(), "PK");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("local API exposes premium asset search, render, and recommendations", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "scientific-image-asset-api-"));
  const server = await startServer(0, { dataDir });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const packs = await fetch(`${base}/assets/workflow-packs`).then((response) => response.json());
    assert.equal(packs.workflowPacks.length, 13);
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "drug-discovery" && pack.flagshipTemplateId === "drug-discovery-funnel"));
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "protein-engineering" && pack.flagshipTemplateId === "protein-engineering-platform"));
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "synthetic-biology" && pack.flagshipTemplateId === "synthetic-biology-platform"));
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "microbiome-infectious-disease" && pack.flagshipTemplateId === "microbiome-infectious-disease-platform"));
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "cell-therapy" && pack.flagshipTemplateId === "cell-therapy-manufacturing-platform"));
    assert.ok(packs.workflowPacks.some((pack: { id: string; flagshipTemplateId?: string }) => pack.id === "microscopy-image-analysis" && pack.flagshipTemplateId === "microscopy-image-analysis-pipeline"));

    const gallery = await fetch(`${base}/assets/workflow-packs/ai-biosecurity-eval/gallery?styleProfile=risk-warning`).then((response) => response.json());
    assert.equal(gallery.gallery.pack.id, "ai-biosecurity-eval");
    assert.equal(gallery.gallery.quality.missingAssetIds.length, 0);
    assert.equal(gallery.gallery.quality.missingTemplateIds.length, 0);
    assert.match(gallery.gallery.compactGallery.svg, /workflow-pack-gallery/);
    assert.equal(gallery.gallery.flagshipDemo.templateId, "ai-biosecurity-pipeline");
    assert.equal(gallery.gallery.templateQa.length, gallery.gallery.templates.length);
    assert.ok(gallery.gallery.flagshipDemo.score >= 0);
    assert.equal(gallery.gallery.exportSnapshot.packId, "ai-biosecurity-eval");
    assert.equal(gallery.gallery.exportSnapshot.exportFormats.pptx.status, "editable-with-fallbacks");
    assert.ok(gallery.gallery.exportSnapshot.uniqueFallbackAssetIds.includes("risk-gate"));

    const exportSnapshot = await fetch(`${base}/assets/workflow-packs/ai-biosecurity-eval/export-snapshot?styleProfile=risk-warning`).then((response) => response.json());
    assert.equal(exportSnapshot.snapshot.packId, "ai-biosecurity-eval");
    assert.equal(exportSnapshot.snapshot.blockedTemplateCount, 0);
    assert.ok(exportSnapshot.snapshot.templates.some((template: { templateId: string }) => template.templateId === "benchmark-dashboard"));
    assert.ok(exportSnapshot.snapshot.warnings.some((warning: string) => warning.includes("PPTX")));

    const templates = await fetch(`${base}/assets/workflow-templates?workflowPack=publication-results-panels`).then((response) => response.json());
    assert.ok(templates.templates.some((template: { id: string }) => template.id === "manuscript-results-figure"));
    assert.ok(templates.templates.every((template: { workflowPack: string }) => template.workflowPack === "publication-results-panels"));

    const templateQa = await fetch(`${base}/assets/workflow-templates/ai-biosecurity-pipeline/qa?styleProfile=consulting-2p5d`).then((response) => response.json());
    assert.equal(templateQa.qa.templateId, "ai-biosecurity-pipeline");
    assert.equal(templateQa.qa.outOfBoundsCount, 0);
    assert.ok(templateQa.qa.premiumFallbackAssetIds.includes("risk-gate"));
    assert.equal(templateQa.qa.exportReadiness.pptx.status, "editable-with-fallbacks");
    assert.equal(templateQa.qa.exportReadiness.pptx.premiumAssetFallbackCount, templateQa.qa.premiumFallbackAssetIds.length);
    assert.ok(templateQa.qa.exportReadiness.pptx.fallbackAssets.some((asset: { assetId: string; assetRecipe: string }) => asset.assetId === "risk-gate" && asset.assetRecipe === "hero-risk-gate"));
    assert.ok(templateQa.qa.actionItems.some((item: { title: string }) => item.title === "Resolve claim citations"));

    const report = await fetch(`${base}/assets/quality-report`).then((response) => response.json());
    assert.equal(report.report.summary.totalAssets, 304);
    assert.ok(report.report.benchmarks.some((benchmark: { id: string }) => benchmark.id === "biorender"));
    assert.ok(report.report.priorityGaps.some((gap: string) => gap.includes("Office editability")));

    const coverage = await fetch(`${base}/assets/coverage-gap-report`).then((response) => response.json());
    assert.equal(coverage.report.baseline.totalAssets, 304);
    assert.equal(coverage.report.productWedge, "asset-breadth-library");
    assert.deepEqual(coverage.report.broadMarketPackOrder.slice(0, 3), ["drug-discovery", "protein-engineering", "synthetic-biology"]);
    assert.ok(coverage.report.milestones.some((milestone: { targetAssets: number }) => milestone.targetAssets === 1200));
    assert.ok(coverage.report.plannedWorkflowPacks.some((pack: { id: string }) => pack.id === "bio-llm-benchmarks"));

    const ontology = await fetch(`${base}/assets/ontology?workflowPack=ai-biosecurity-eval&qualityTier=signature&limit=8`).then((response) => response.json());
    assert.equal(ontology.ontology.schemaVersion, "0.5.0-asset-ontology");
    assert.ok(ontology.ontology.assets.length > 0);
    assert.ok(ontology.ontology.assets.every((asset: { qualityTier: string; workflowPacks: string[] }) => asset.qualityTier === "signature" && asset.workflowPacks.includes("ai-biosecurity-eval")));

    const visualQaGallery = await fetch(`${base}/assets/workflow-packs/ai-biosecurity-eval/visual-qa-gallery?styleProfile=risk-warning&limit=4`).then((response) => response.json());
    assert.equal(visualQaGallery.gallery.packId, "ai-biosecurity-eval");
    assert.deepEqual(visualQaGallery.gallery.previewSizes.map((size: { id: string }) => size.id), ["icon", "preview", "slide"]);
    assert.match(visualQaGallery.gallery.svg, /workflow-pack-visual-qa-gallery/);

    const realisticGallery = await fetch(`${base}/assets/realistic/gallery?workflowPack=realistic-spatial-microscopy&styleProfile=scientific-editorial-realism&limit=4`).then((response) => response.json());
    assert.equal(realisticGallery.gallery.assetCount, 4);
    assert.match(realisticGallery.gallery.svg, /realistic-asset-gallery/);
    assert.ok(realisticGallery.gallery.renderedAssetIds.includes("realistic-he-tissue-section"));

    const realisticSearch = await fetch(`${base}/assets?assetKind=realistic&query=microscopy%20segmentation%20evidence&styleProfile=scientific-editorial-realism&limit=5`).then((response) => response.json());
    assert.ok(realisticSearch.assets.every((asset: { kind: string }) => asset.kind === "image"));
    assert.ok(realisticSearch.assets.some((asset: { id: string }) => asset.id === "realistic-segmentation-overlay"));

    const realisticAsset = await fetch(`${base}/assets/realistic-he-tissue-section`).then((response) => response.json());
    assert.equal(realisticAsset.asset.mediaType, "svg-fixture");
    const realisticSvg = await fetch(`${base}/assets/realistic-he-tissue-section/render?styleProfile=scientific-editorial-realism&width=240&height=160`).then((response) => response.text());
    assert.match(realisticSvg, /scientific-realistic-asset/);
    assert.match(realisticSvg, /data-media-type="svg-fixture"/);
    assert.match(realisticSvg, /<svg x=/);
    assert.doesNotMatch(realisticSvg, /NaN/);

    const packRecommendation = await fetch(`${base}/assets/recommend-workflow-pack`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "DURC permissioning benchmark dashboard", narrative: "risk gate human review audit", limit: 2 })
    }).then((response) => response.json());
    assert.equal(packRecommendation.recommendations[0].pack.id, "ai-biosecurity-eval");

    const drugPackRecommendation = await fetch(`${base}/assets/recommend-workflow-pack`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Drug discovery lead optimization summary", narrative: "target validation compound hit triage toxicity and candidate nomination", limit: 2 })
    }).then((response) => response.json());
    assert.equal(drugPackRecommendation.recommendations[0].pack.id, "drug-discovery");
    assert.equal(drugPackRecommendation.recommendations[0].recommendedTemplateId, "drug-discovery-funnel");

    const assetSet = await fetch(`${base}/assets/recommend-asset-set`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "AI biosecurity evaluation pipeline", workflowPack: "ai-biosecurity-eval", semanticSlots: ["risk-decision"], style: "risk-warning", responseShape: "compact" })
    }).then((response) => response.json());
    assert.equal(assetSet.recommendation.workflowPack, "ai-biosecurity-eval");
    assert.ok(assetSet.recommendation.groups.some((group: { semanticSlot: string }) => group.semanticSlot === "risk-decision"));
    assert.ok(assetSet.recommendation.insertPlan.some((action: { tool: string; args: { styleProfile: string } }) => action.tool === "insert_premium_asset" && action.args.styleProfile === "risk-warning"));

    const assetBrief = await fetch(`${base}/assets/brief`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "risk-gate", workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning" })
    }).then((response) => response.json());
    assert.equal(assetBrief.brief.status, "existing-asset");
    assert.equal(assetBrief.brief.assetId, "risk-gate");

    const templateSpec = await fetch(`${base}/assets/workflow-template-spec`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workflowPack: "ai-biosecurity-eval", intent: "benchmark dashboard with calibration and review escalation" })
    }).then((response) => response.json());
    assert.equal(templateSpec.templateSpec.workflowPack, "ai-biosecurity-eval");
    assert.ok(templateSpec.templateSpec.previewAssetIds.length >= 4);

    const searched = await fetch(`${base}/assets?query=spatial%20transcriptomics&workflowPack=spatial-transcriptomics&styleProfile=consulting-2p5d&limit=5`).then((response) => response.json());
    assert.ok(searched.assets.some((asset: { id: string }) => asset.id === "spatial-grid" || asset.id === "visium-spot-array"));
    assert.ok(searched.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("spatial-transcriptomics")));
    assert.equal(searched.count, 334);

    const drugDiscoverySearch = await fetch(`${base}/assets?query=lead%20toxicity%20dose%20selectivity%20pk%20sar&workflowPack=drug-discovery&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const drugDiscoveryIds = drugDiscoverySearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(drugDiscoveryIds.includes("lead-series"));
    assert.ok(drugDiscoveryIds.includes("toxicity-screen"));
    assert.ok(drugDiscoveryIds.includes("dose-response-curve"));
    assert.ok(drugDiscoveryIds.includes("selectivity-panel"));
    assert.ok(drugDiscoveryIds.includes("pk-profile"));
    assert.ok(drugDiscoveryIds.includes("sar-table"));

    const proteinEngineeringSearch = await fetch(`${base}/assets?query=protein%20design%20directed%20evolution%20affinity%20developability&workflowPack=protein-engineering&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const proteinEngineeringIds = proteinEngineeringSearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(proteinEngineeringSearch.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("protein-engineering")));
    assert.ok(proteinEngineeringIds.includes("protein-design-model"));
    assert.ok(proteinEngineeringIds.includes("protein-variant-library"));
    assert.ok(proteinEngineeringIds.includes("binding-affinity-assay"));
    assert.ok(proteinEngineeringIds.includes("developability-profile"));

    const syntheticBiologySearch = await fetch(`${base}/assets?query=genetic%20circuit%20dbtl%20biosensor%20kill%20switch%20metabolic%20flux&workflowPack=synthetic-biology&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const syntheticBiologyIds = syntheticBiologySearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(syntheticBiologySearch.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("synthetic-biology")));
    assert.ok(syntheticBiologyIds.includes("genetic-circuit"));
    assert.ok(syntheticBiologyIds.includes("biosensor-circuit"));
    assert.ok(syntheticBiologyIds.includes("kill-switch"));

    const microbiomeSearch = await fetch(`${base}/assets?query=microbiome%20metagenomic%20amr%20outbreak%20diversity&workflowPack=microbiome-infectious-disease&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const microbiomeIds = microbiomeSearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(microbiomeSearch.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("microbiome-infectious-disease")));
    assert.ok(microbiomeIds.includes("amr-gene"));
    assert.ok(microbiomeIds.includes("outbreak-cluster"));
    assert.ok(microbiomeIds.includes("metagenomic-read"));

    const cellTherapySearch = await fetch(`${base}/assets?query=car-t%20leukapheresis%20viral%20vector%20release%20testing%20infusion%20cytokine&workflowPack=cell-therapy&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const cellTherapyIds = cellTherapySearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(cellTherapySearch.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("cell-therapy")));
    assert.ok(cellTherapyIds.includes("car-t-cell"));
    assert.ok(cellTherapyIds.includes("leukapheresis"));
    assert.ok(cellTherapyIds.includes("release-testing"));

    const microscopySearch = await fetch(`${base}/assets?query=microscopy%20image%20analysis%20field%20channel%20segmentation%20tracking%20morphology%20embedding%20qc&workflowPack=microscopy-image-analysis&styleProfile=consulting-2p5d&limit=12`).then((response) => response.json());
    const microscopyIds = microscopySearch.assets.map((asset: { id: string }) => asset.id);
    assert.ok(microscopySearch.results.every((result: { asset: { workflowPacks: string[] } }) => result.asset.workflowPacks.includes("microscopy-image-analysis")));
    assert.ok(microscopyIds.includes("nuclei-segmentation"));
    assert.ok(microscopyIds.includes("microscope-field"));
    assert.ok(microscopyIds.includes("image-qc-dashboard"));

    const asset = await fetch(`${base}/assets/risk-gate`).then((response) => response.json());
    assert.equal(asset.asset.family, "riskGate");

    const svg = await fetch(`${base}/assets/risk-gate/render?styleProfile=risk-warning`).then((response) => response.text());
    assert.match(svg, /premium-asset/);
    assert.match(svg, /data-style-profile="risk-warning"/);
    const lineAliasSvg = await fetch(`${base}/assets/receptor/render?style=publication-line`).then((response) => response.text());
    assert.match(lineAliasSvg, /data-style-profile="publication-line"/);
    assert.match(lineAliasSvg, /data-accent="#111827"/);
    assert.doesNotMatch(lineAliasSvg, /filter="url\(#asset-/);
    assert.doesNotMatch(lineAliasSvg, /fill="url\(#asset-glass-highlight\)"/);
    const styledSvg = await fetch(`${base}/assets/risk-gate/render?variant=outline&accent=%23ef4444&stroke=%23991b1b&strokeWidth=4`).then((response) => response.text());
    assert.match(styledSvg, /data-accent="#ef4444"/);
    assert.match(styledSvg, /data-stroke-width="4"/);

    const recommendations = await fetch(`${base}/assets/recommend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Biosecurity risk evaluation", narrative: "risk gate human review audit log", workflowPack: "ai-biosecurity-eval", limit: 5 })
    }).then((response) => response.json());
    assert.ok(recommendations.recommendations.some((result: { asset: { id: string } }) => result.asset.id === "risk-gate"));

    const realisticRecommendations = await fetch(`${base}/assets/recommend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Spatial microscopy evidence image panel", narrative: "histology segmentation overlay and tissue context", layoutIntent: "context panel with evidence image", limit: 5 })
    }).then((response) => response.json());
    assert.ok(realisticRecommendations.recommendations.some((result: { asset: { id: string } }) => result.asset.id.startsWith("realistic-")));

    const created = await fetch(`${base}/projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Workflow figure API", kind: "slide" })
    }).then((response) => response.json());
    const workflowFigure = await fetch(`${base}/projects/${created.project.id}/workflow-figures`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d", stepCount: 4 })
    }).then((response) => response.json());
    assert.ok(workflowFigure.nodes.length >= 5);
    const workflowPageId = workflowFigure.project.pages[0].id;
    assert.equal(workflowFigure.project.deck.slideMeta[workflowPageId].title, "AI biosecurity pipeline");
    assert.match(workflowFigure.project.deck.slideMeta[workflowPageId].speakerNotes, /Export note/);
    assert.ok(workflowFigure.nodes.some((node: { kind: string; payload?: { styleProfile?: string } }) => node.kind === "symbol" && node.payload?.styleProfile === "consulting-2p5d"));
    assert.ok(workflowFigure.nodes.some((node: { kind: string; payload?: { assetId?: string; layoutHint?: string } }) => node.kind === "symbol" && node.payload?.assetId === "risk-gate" && node.payload?.layoutHint?.startsWith("ai-biosecurity-pipeline:")));
    assert.equal(workflowFigure.agentRun.trace.templateId, "ai-biosecurity-pipeline");
    assert.equal(workflowFigure.agentRun.trace.workflowPack, "ai-biosecurity-eval");
    assert.equal(workflowFigure.agentRun.trace.generatedNodeIds.length, workflowFigure.nodes.length);
    const apiExportReview = workflowFigure.reviewItems.find((item: { kind: string; message: string }) => item.kind === "export" && item.message.includes("premium SVG fallback"));
    assert.ok(apiExportReview);
    assert.equal(apiExportReview.templateId, "ai-biosecurity-pipeline");
    assert.equal(apiExportReview.exportFormat, "pptx");
    assert.ok(apiExportReview.fallbackAssets.some((asset: { assetId: string; assetRecipe: string }) => asset.assetId === "risk-gate" && asset.assetRecipe === "hero-risk-gate"));

    const reviewSummary = await fetch(`${base}/projects/${created.project.id}/deck/review-summary`).then((response) => response.json());
    assert.equal(reviewSummary.summary.deliveryReadiness, "needs-science-review");
    assert.ok(reviewSummary.summary.claimReview.openCount > 0);
    assert.ok(reviewSummary.summary.exportFallbacks.assetIds.includes("risk-gate"));
    const apiExportAction = reviewSummary.summary.actionItems.find((item: { id: string }) => item.id === "review-office-export-fallbacks");
    assert.ok(apiExportAction);

    const realisticNode = await fetch(`${base}/projects/${created.project.id}/realistic-images`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId: "realistic-he-tissue-section", x: 80, y: 120, width: 280, height: 180, styleProfile: "scientific-editorial-realism" })
    }).then((response) => response.json());
    assert.equal(realisticNode.node.kind, "image");
    assert.equal(realisticNode.node.payload.assetId, "realistic-he-tissue-section");
    assert.equal(realisticNode.agentRun.trace.insertPlan[0].tool, "insert_realistic_asset");
    assert.ok(realisticNode.agentRun.trace.resourceUris.includes("scientific-image://agent/asset-index-compact"));
    const realisticProjectSvg = await fetch(`${base}/projects/${created.project.id}/export/svg`).then((response) => response.text());
    assert.match(realisticProjectSvg, /scientific-realistic-asset/);

    const resolvedExport = await fetch(`${base}/projects/${created.project.id}/deck/review/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reviewItemIds: apiExportAction.reviewItemIds, status: "accepted-risk" })
    }).then((response) => response.json());
    assert.equal(resolvedExport.summary.exportFallbacks.openCount, 0);
    assert.ok(resolvedExport.summary.actionItems.some((item: { id: string }) => item.id === "confirm-or-cite-scientific-claims"));

    const resultsFigure = await fetch(`${base}/projects/${created.project.id}/workflow-figures`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workflowPack: "publication-results-panels", styleProfile: "consulting-2p5d" })
    }).then((response) => response.json());
    assert.ok(resultsFigure.nodes.some((node: { kind: string; payload?: { spec?: { plotType?: string } } }) => node.kind === "plot" && node.payload?.spec?.plotType === "volcano"));
    assert.ok(resultsFigure.nodes.some((node: { kind: string; payload?: { assetId?: string } }) => node.kind === "symbol" && node.payload?.assetId === "metric-card"));
    assert.equal(resultsFigure.agentRun.trace.workflowPack, "publication-results-panels");

    const flagshipDemo = await fetch(`${base}/projects/${created.project.id}/workflow-packs/ai-biosecurity-eval/flagship-demo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ styleProfile: "consulting-2p5d", stepCount: 4 })
    }).then((response) => response.json());
    assert.ok(flagshipDemo.nodes.some((node: { kind: string; payload?: { assetId?: string } }) => node.kind === "symbol" && node.payload?.assetId === "risk-gate"));
    assert.equal(flagshipDemo.agentRun.trace.workflowPack, "ai-biosecurity-eval");
    assert.ok(flagshipDemo.agentRun.trace.toolSequence.includes("create_flagship_workflow_demo"));

    const traceReport = await fetch(`${base}/projects/${created.project.id}/deck/agent-trace`).then((response) => response.json());
    assert.equal(traceReport.report.schemaVersion, "0.1.0-agent-trace-report");
    assert.ok(traceReport.report.tracedRunCount >= 4);
    assert.ok(traceReport.report.toolUsage.create_workflow_figure >= 2);
    assert.ok(traceReport.report.toolUsage.create_flagship_workflow_demo >= 1);
    assert.ok(traceReport.report.assetIds.includes("risk-gate"));
    assert.ok(traceReport.report.resourceUris.includes("scientific-image://agent/agent-cookbook"));

    const docx = await fetch(`${base}/projects/${created.project.id}/export/docx`).then((response) => response.arrayBuffer());
    assert.equal(Buffer.from(docx).subarray(0, 2).toString(), "PK");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("local API exposes agent manifest and onboarding resources", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "scientific-image-agent-api-"));
  const server = await startServer(0, { dataDir });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const manifest = await fetch(`${base}/agent/manifest`).then((response) => response.json());
    assert.equal(manifest.manifest.server.mcpName, "scientific-image-mcp");
    assert.ok(manifest.manifest.recommendedFirstCalls.some((call: { tool?: string }) => call.tool === "get_asset_index"));
    assert.ok(manifest.manifest.recommendedFirstCalls.some((call: { uri?: string }) => call.uri === "scientific-image://agent/agent-cookbook"));
    assert.ok(manifest.manifest.recommendedFirstCalls.some((call: { uri?: string }) => call.uri === "scientific-image://agent/demo-perturb-seq-crispr"));
    assert.ok(manifest.manifest.agentFacets.workflowPacks.includes("ai-biosecurity-eval"));
    assert.ok(manifest.manifest.workflowRecipes.some((recipe: { id: string }) => recipe.id === "workflow-pack-figure"));
    assert.ok(manifest.manifest.workflowPacks.some((pack: { id: string; templateCount: number }) => pack.id === "ai-biosecurity-eval" && pack.templateCount >= 4));
    assert.ok(manifest.manifest.guardrails.some((guardrail: string) => guardrail.includes("workflow pack templates")));

    const resources = await fetch(`${base}/agent/resources`).then((response) => response.json());
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/quickstart"));
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/agent-cookbook"));
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/demo-perturb-seq-crispr"));
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/asset-ontology"));
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/asset-index-compact"));
    assert.ok(resources.resources.some((resource: { uri: string }) => resource.uri === "scientific-image://agent/coverage-roadmap"));

    const quickstart = await fetch(`${base}/agent/resources/quickstart`).then((response) => response.text());
    assert.match(quickstart, /Default agent loop/);
    assert.match(quickstart, /create_deck_outline/);

    const cookbook = await fetch(`${base}/agent/resources/agent-cookbook`).then((response) => response.text());
    assert.match(cookbook, /Scientific Image Agent Cookbook/);
    assert.match(cookbook, /get_asset_index/);
    assert.match(cookbook, /recommend_asset_set/);
    assert.match(cookbook, /insertPlan\[\]\.args/);
    assert.match(cookbook, /Canonical Perturb-seq CRISPR Happy Path/);
    assert.match(cookbook, /agentRun\.trace/);
    assert.match(cookbook, /export_pack_qa_report/);

    const perturbDemo = await fetch(`${base}/agent/resources/demo-perturb-seq-crispr`).then((response) => response.text());
    assert.match(perturbDemo, /Perturb-seq CRISPR Agent Demo/);
    assert.match(perturbDemo, /recommend_workflow_pack/);
    assert.match(perturbDemo, /perturb-seq-workflow/);

    const ontology = await fetch(`${base}/agent/resources/asset-ontology`).then((response) => response.json());
    assert.equal(ontology.schemaVersion, "0.5.0-asset-ontology");
    assert.ok(ontology.assets.length >= 100);

    const compactIndex = await fetch(`${base}/agent/resources/asset-index-compact`).then((response) => response.json());
    assert.equal(compactIndex.schemaVersion, "0.6.0-agent-asset-index");
    assert.ok(JSON.stringify(compactIndex).length <= compactIndex.sizeBudget.currentTargetBytes);
    assert.ok(compactIndex.assets.every((asset: { insertDefaults: { tool: string } }) => asset.insertDefaults.tool === "insert_premium_asset"));

    const roadmap = await fetch(`${base}/agent/resources/coverage-roadmap`).then((response) => response.json());
    assert.ok(roadmap.milestones.some((milestone: { targetAssets: number }) => milestone.targetAssets === 1200));

    const configs = await fetch(`${base}/agent/resources/client-configs`).then((response) => response.text());
    assert.match(configs, /Claude Code project/);
    assert.match(configs, /mcp_servers\.scientific-image/);
    assert.match(configs, /agent-cookbook/);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("MCP tools create a project and expose deterministic edits", async () => {
  const init = await handleJsonRpc({ jsonrpc: "2.0", id: 1, method: "initialize" });
  assert.equal((init.result as { serverInfo: { name: string } }).serverInfo.name, "scientific-image-mcp");
  assert.deepEqual((init.result as { capabilities: { resources: Record<string, unknown> } }).capabilities.resources, {});

  const created = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "create_project", arguments: { title: "MCP fixture" } }
  });
  const createPayload = JSON.parse((created.result as { content: { text: string }[] }).content[0].text);
  const projectId = createPayload.project.id;

  const added = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "add_curated_symbol",
      arguments: { projectId, assetId: "risk-gate", label: "Risk gate", x: 120, y: 140 }
    }
  });
  const addPayload = JSON.parse((added.result as { content: { text: string }[] }).content[0].text);
  assert.equal(addPayload.node.kind, "symbol");

  const exported = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "export_project", arguments: { projectId, format: "svg" } }
  });
  const exportPayload = JSON.parse((exported.result as { content: { text: string }[] }).content[0].text);
  assert.match(exportPayload.data, /Risk gate/);
});

test("MCP exposes agent resources and manifest fallback tool", async () => {
  const resources = await handleJsonRpc({ jsonrpc: "2.0", id: 30, method: "resources/list" });
  const resourcePayload = resources.result as { resources: { uri: string; mimeType: string }[] };
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/manifest" && resource.mimeType === "application/json"));
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/agent-cookbook" && resource.mimeType === "text/markdown"));
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/demo-perturb-seq-crispr" && resource.mimeType === "text/markdown"));
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/asset-ontology" && resource.mimeType === "application/json"));
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/asset-index-compact" && resource.mimeType === "application/json"));
  assert.ok(resourcePayload.resources.some((resource) => resource.uri === "scientific-image://agent/coverage-roadmap" && resource.mimeType === "application/json"));

  const quickstart = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 31,
    method: "resources/read",
    params: { uri: "scientific-image://agent/quickstart" }
  });
  const quickstartPayload = quickstart.result as { contents: { uri: string; text: string }[] };
  assert.equal(quickstartPayload.contents[0].uri, "scientific-image://agent/quickstart");
  assert.match(quickstartPayload.contents[0].text, /workflow-pack figure/);
  assert.match(quickstartPayload.contents[0].text, /get_asset_index/);

  const cookbook = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 3100,
    method: "resources/read",
    params: { uri: "scientific-image://agent/agent-cookbook" }
  });
  const cookbookPayload = cookbook.result as { contents: { uri: string; text: string }[] };
  assert.equal(cookbookPayload.contents[0].uri, "scientific-image://agent/agent-cookbook");
  assert.match(cookbookPayload.contents[0].text, /JSON-RPC/);
  assert.match(cookbookPayload.contents[0].text, /responseShape":"compact/);
  assert.match(cookbookPayload.contents[0].text, /insert_premium_asset/);
  assert.match(cookbookPayload.contents[0].text, /perturb-seq-crispr/);
  assert.match(cookbookPayload.contents[0].text, /agentRun\.trace/);
  assert.match(cookbookPayload.contents[0].text, /validate_deck/);

  const perturbDemo = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 3102,
    method: "resources/read",
    params: { uri: "scientific-image://agent/demo-perturb-seq-crispr" }
  });
  const perturbDemoPayload = perturbDemo.result as { contents: { uri: string; text: string }[] };
  assert.equal(perturbDemoPayload.contents[0].uri, "scientific-image://agent/demo-perturb-seq-crispr");
  assert.match(perturbDemoPayload.contents[0].text, /source-notes-to-editable-slide/);
  assert.match(perturbDemoPayload.contents[0].text, /create_workflow_figure/);

  const compactIndexResource = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 3101,
    method: "resources/read",
    params: { uri: "scientific-image://agent/asset-index-compact" }
  });
  const compactIndexResourcePayload = compactIndexResource.result as { contents: { text: string }[] };
  const compactIndex = JSON.parse(compactIndexResourcePayload.contents[0].text);
  assert.equal(compactIndex.schemaVersion, "0.6.0-agent-asset-index");
  assert.ok(JSON.stringify(compactIndex).length <= compactIndex.sizeBudget.currentTargetBytes);
  assert.ok(compactIndex.assets.every((asset: { assetId: string; insertDefaults: { tool: string } }) => asset.assetId && asset.insertDefaults.tool === "insert_premium_asset"));

  const manifest = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 32,
    method: "tools/call",
    params: { name: "get_agent_manifest", arguments: {} }
  });
  const manifestPayload = JSON.parse((manifest.result as { content: { text: string }[] }).content[0].text);
  assert.equal(manifestPayload.manifest.defaultVisualContract.styleProfile, "consulting-2p5d");
  assert.ok(manifestPayload.manifest.toolGroups.workflowPacks.includes("create_flagship_workflow_demo"));
  assert.ok(manifestPayload.manifest.toolGroups.premiumAssets.includes("get_asset_index"));
  assert.ok(manifestPayload.manifest.toolGroups.premiumAssets.includes("get_asset_ontology"));
  assert.ok(manifestPayload.manifest.recommendedFirstCalls.some((call: { tool?: string }) => call.tool === "get_asset_index"));
  assert.ok(manifestPayload.manifest.recommendedFirstCalls.some((call: { uri?: string }) => call.uri === "scientific-image://agent/agent-cookbook"));
  assert.ok(manifestPayload.manifest.recommendedFirstCalls.some((call: { uri?: string }) => call.uri === "scientific-image://agent/demo-perturb-seq-crispr"));
  assert.equal(manifestPayload.manifest.qualitySummary.targetAssets12Months, 1200);

  const configs = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 33,
    method: "tools/call",
    params: { name: "read_agent_resource", arguments: { uri: "client-configs" } }
  });
  const configsPayload = JSON.parse((configs.result as { content: { text: string }[] }).content[0].text);
  assert.match(configsPayload.resource.text, /Codex `config.toml`/);
  assert.match(configsPayload.resource.text, /agent-cookbook/);
});

test("MCP tools run premium deck workflow", async () => {
  const created = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: { name: "create_project", arguments: { title: "MCP premium deck" } }
  });
  const createPayload = JSON.parse((created.result as { content: { text: string }[] }).content[0].text);
  const projectId = createPayload.project.id;

  const templates = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 100,
    method: "tools/call",
    params: { name: "list_workflow_templates", arguments: { workflowPack: "ai-biosecurity-eval" } }
  });
  const templatePayload = JSON.parse((templates.result as { content: { text: string }[] }).content[0].text);
  assert.ok(templatePayload.templates.some((template: { id: string }) => template.id === "ai-biosecurity-pipeline"));

  await handleJsonRpc({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "import_source",
      arguments: {
        projectId,
        kind: "markdown",
        name: "notes.md",
        text: "# MCP Premium Deck\n\n## Approach\nCreate outline-first slides with review queue."
      }
    }
  });

  const outline = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: { name: "create_deck_outline", arguments: { projectId, slideCount: 4 } }
  });
  const outlinePayload = JSON.parse((outline.result as { content: { text: string }[] }).content[0].text);
  assert.equal(outlinePayload.outline.slides.length, 4);

  const generated = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: { name: "generate_deck_from_outline", arguments: { projectId } }
  });
  const generatedPayload = JSON.parse((generated.result as { content: { text: string }[] }).content[0].text);
  assert.equal(generatedPayload.project.pages.length, 4);

  const review = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 14,
    method: "tools/call",
    params: { name: "list_review_items", arguments: { projectId } }
  });
  const reviewPayload = JSON.parse((review.result as { content: { text: string }[] }).content[0].text);
  assert.ok(Array.isArray(reviewPayload.reviewItems));
});

test("MCP tools expose premium asset search, preview, recommendation, and insert", async () => {
  const indexed = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 1901,
    method: "tools/call",
    params: { name: "get_asset_index", arguments: { workflowPack: "ai-biosecurity-eval", qualityTier: "signature", semanticSlot: "risk-decision", style: "risk-warning", limit: 6 } }
  });
  const indexPayload = JSON.parse((indexed.result as { content: { text: string }[] }).content[0].text);
  assert.equal(indexPayload.index.schemaVersion, "0.6.0-agent-asset-index");
  assert.ok(indexPayload.index.assets.length > 0);
  assert.ok(indexPayload.index.assets.every((asset: { qualityTier: string; workflowPacks: string[]; insertDefaults: { args: { styleProfile: string } } }) =>
    asset.qualityTier === "signature" &&
    asset.workflowPacks.includes("ai-biosecurity-eval") &&
    asset.insertDefaults.args.styleProfile === "risk-warning"
  ));

  const searched = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 20,
    method: "tools/call",
    params: { name: "search_assets", arguments: { query: "spatial transcriptomics", workflowPack: "spatial-transcriptomics", limit: 5 } }
  });
  const searchPayload = JSON.parse((searched.result as { content: { text: string }[] }).content[0].text);
  assert.ok(searchPayload.results.some((result: { asset: { id: string } }) => result.asset.id === "spatial-grid" || result.asset.id === "visium-spot-array"));

  const compactSearched = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2000,
    method: "tools/call",
    params: { name: "search_assets", arguments: { query: "spatial transcriptomics", workflowPack: "spatial-transcriptomics", responseShape: "compact", limit: 3 } }
  });
  const compactSearchPayload = JSON.parse((compactSearched.result as { content: { text: string }[] }).content[0].text);
  assert.ok(compactSearchPayload.results.every((result: { asset: { assetId: string; insertDefaults: { tool: string } } }) => result.asset.assetId && result.asset.insertDefaults.tool === "insert_premium_asset"));
  assert.ok(compactSearchPayload.results.every((result: { asset: Record<string, unknown> }) => !("renderSpec" in result.asset) && !("provenance" in result.asset)));

  const realisticSearch = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2001,
    method: "tools/call",
    params: { name: "search_assets", arguments: { assetKind: "realistic", query: "microscopy segmentation evidence", styleProfile: "scientific-editorial-realism", limit: 5 } }
  });
  const realisticSearchPayload = JSON.parse((realisticSearch.result as { content: { text: string }[] }).content[0].text);
  assert.ok(realisticSearchPayload.results.some((result: { asset: { id: string } }) => result.asset.id === "realistic-segmentation-overlay"));

  const realisticGallery = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2002,
    method: "tools/call",
    params: { name: "get_realistic_asset_gallery", arguments: { workflowPack: "realistic-spatial-microscopy", limit: 4 } }
  });
  const realisticGalleryPayload = JSON.parse((realisticGallery.result as { content: { text: string }[] }).content[0].text);
  assert.match(realisticGalleryPayload.gallery.svg, /realistic-asset-gallery/);
  assert.ok(realisticGalleryPayload.gallery.renderedAssetIds.includes("realistic-he-tissue-section"));

  const realisticPreview = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2003,
    method: "tools/call",
    params: { name: "render_asset_preview", arguments: { assetId: "realistic-he-tissue-section", styleProfile: "scientific-editorial-realism", width: 240, height: 160 } }
  });
  const realisticPreviewPayload = JSON.parse((realisticPreview.result as { content: { text: string }[] }).content[0].text);
  assert.match(realisticPreviewPayload.svg, /scientific-realistic-asset/);

  const quality = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 25,
    method: "tools/call",
    params: { name: "get_asset_quality_report", arguments: {} }
  });
  const qualityPayload = JSON.parse((quality.result as { content: { text: string }[] }).content[0].text);
  assert.equal(qualityPayload.report.summary.totalAssets, 304);
  assert.ok(qualityPayload.report.benchmarks.some((benchmark: { id: string }) => benchmark.id === "figma-components"));
  assert.ok(qualityPayload.report.workflowCoverage.some((pack: { id: string }) => pack.id === "publication-results-panels"));

  const coverage = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2501,
    method: "tools/call",
    params: { name: "get_coverage_gap_report", arguments: {} }
  });
  const coveragePayload = JSON.parse((coverage.result as { content: { text: string }[] }).content[0].text);
  assert.ok(coveragePayload.report.milestones.some((milestone: { targetAssets: number }) => milestone.targetAssets === 1200));
  assert.ok(coveragePayload.report.plannedWorkflowPacks.some((pack: { id: string }) => pack.id === "bio-llm-benchmarks"));

  const ontology = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2502,
    method: "tools/call",
    params: { name: "get_asset_ontology", arguments: { workflowPack: "ai-biosecurity-eval", qualityTier: "signature", limit: 6 } }
  });
  const ontologyPayload = JSON.parse((ontology.result as { content: { text: string }[] }).content[0].text);
  assert.equal(ontologyPayload.ontology.schemaVersion, "0.5.0-asset-ontology");
  assert.ok(ontologyPayload.ontology.assets.every((asset: { qualityTier: string; workflowPacks: string[] }) => asset.qualityTier === "signature" && asset.workflowPacks.includes("ai-biosecurity-eval")));

  const gallery = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 27,
    method: "tools/call",
    params: { name: "get_workflow_pack_gallery", arguments: { workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning" } }
  });
  const galleryPayload = JSON.parse((gallery.result as { content: { text: string }[] }).content[0].text);
  assert.equal(galleryPayload.gallery.flagshipDemo.templateId, "ai-biosecurity-pipeline");
  assert.equal(galleryPayload.gallery.templateQa.length, galleryPayload.gallery.templates.length);
  assert.match(galleryPayload.gallery.compactGallery.svg, /workflow-pack-gallery/);
  assert.equal(galleryPayload.gallery.exportSnapshot.exportFormats.pptx.status, "editable-with-fallbacks");

  const exportSnapshot = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 28,
    method: "tools/call",
    params: { name: "get_workflow_pack_export_snapshot", arguments: { workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning" } }
  });
  const exportSnapshotPayload = JSON.parse((exportSnapshot.result as { content: { text: string }[] }).content[0].text);
  assert.equal(exportSnapshotPayload.snapshot.packId, "ai-biosecurity-eval");
  assert.equal(exportSnapshotPayload.snapshot.blockedTemplateCount, 0);
  assert.ok(exportSnapshotPayload.snapshot.uniqueFallbackAssetIds.includes("risk-gate"));
  assert.ok(exportSnapshotPayload.snapshot.nextAction.includes("visual QA"));

  const visualQa = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2801,
    method: "tools/call",
    params: { name: "validate_asset_pack", arguments: { workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning", limit: 4 } }
  });
  const visualQaPayload = JSON.parse((visualQa.result as { content: { text: string }[] }).content[0].text);
  assert.equal(visualQaPayload.quality.packId, "ai-biosecurity-eval");
  assert.match(visualQaPayload.visualQa.svg, /workflow-pack-visual-qa-gallery/);

  const exportQa = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2802,
    method: "tools/call",
    params: { name: "export_pack_qa_report", arguments: { workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning", limit: 4 } }
  });
  const exportQaPayload = JSON.parse((exportQa.result as { content: { text: string }[] }).content[0].text);
  assert.equal(exportQaPayload.snapshot.packId, "ai-biosecurity-eval");
  assert.ok(exportQaPayload.visualQa.qaChecks.some((check: string) => check.includes("48px")));

  const templateQa = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 29,
    method: "tools/call",
    params: { name: "get_workflow_template_qa", arguments: { templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" } }
  });
  const templateQaPayload = JSON.parse((templateQa.result as { content: { text: string }[] }).content[0].text);
  assert.equal(templateQaPayload.qa.templateId, "ai-biosecurity-pipeline");
  assert.ok(templateQaPayload.qa.premiumFallbackAssetIds.includes("risk-gate"));
  assert.equal(templateQaPayload.qa.exportReadiness.pptx.status, "editable-with-fallbacks");
  assert.equal(templateQaPayload.qa.exportReadiness.pptx.premiumAssetFallbackCount, templateQaPayload.qa.premiumFallbackAssetIds.length);
  assert.ok(templateQaPayload.qa.exportReadiness.pptx.fallbackAssets.some((asset: { assetId: string; exportBehavior: string }) => asset.assetId === "risk-gate" && asset.exportBehavior === "embed-svg-fallback"));
  assert.ok(templateQaPayload.qa.actionItems.some((item: { title: string }) => item.title === "Resolve claim citations"));

  const packRecommendation = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2901,
    method: "tools/call",
    params: { name: "recommend_workflow_pack", arguments: { title: "DURC benchmark dashboard with review escalation", narrative: "risk gate permission tier audit log", limit: 2 } }
  });
  const packRecommendationPayload = JSON.parse((packRecommendation.result as { content: { text: string }[] }).content[0].text);
  assert.equal(packRecommendationPayload.recommendations[0].pack.id, "ai-biosecurity-eval");

  const assetSet = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2902,
    method: "tools/call",
    params: { name: "recommend_asset_set", arguments: { title: "AI biosecurity benchmark dashboard", workflowPack: "ai-biosecurity-eval", semanticSlots: ["risk-decision"], style: "risk-warning", responseShape: "compact" } }
  });
  const assetSetPayload = JSON.parse((assetSet.result as { content: { text: string }[] }).content[0].text);
  assert.equal(assetSetPayload.recommendation.workflowPack, "ai-biosecurity-eval");
  assert.ok(assetSetPayload.recommendation.groups.some((group: { semanticSlot: string }) => group.semanticSlot === "risk-decision"));
  assert.ok(assetSetPayload.recommendation.insertPlan.length > 0);
  assert.ok(assetSetPayload.recommendation.insertPlan.every((action: { tool: string; args: { assetId: string; styleProfile: string } }) =>
    action.tool === "insert_premium_asset" &&
    action.args.assetId &&
    action.args.styleProfile === "risk-warning"
  ));

  const perturbAssetSet = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 29021,
    method: "tools/call",
    params: {
      name: "recommend_asset_set",
      arguments: {
        title: "Perturb-seq CRISPR screen with guide RNA single-cell sequencing and expression matrix",
        sourceText: "pooled guide RNA screen, Perturb-seq, single-cell RNA-seq, expression matrix, volcano plot, hit validation",
        workflowPack: "perturb-seq-crispr",
        styleProfile: "consulting-2p5d",
        responseShape: "compact",
        limit: 10
      }
    }
  });
  const perturbAssetSetPayload = JSON.parse((perturbAssetSet.result as { content: { text: string }[] }).content[0].text);
  const perturbInsertIds = perturbAssetSetPayload.recommendation.insertPlan.map((action: { args: { assetId: string } }) => action.args.assetId);
  assert.equal(perturbAssetSetPayload.recommendation.workflowPack, "perturb-seq-crispr");
  assert.equal(perturbAssetSetPayload.recommendation.templateId, "perturb-seq-workflow");
  assert.ok(perturbInsertIds.includes("crispr-cas9"));
  assert.ok(perturbInsertIds.includes("guide-rna"));
  assert.ok(perturbInsertIds.includes("pooled-screen"));
  assert.ok(perturbInsertIds.includes("sequencer"));
  assert.ok(perturbInsertIds.includes("expression-matrix"));

  const brief = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2903,
    method: "tools/call",
    params: { name: "create_asset_brief", arguments: { assetId: "risk-gate", workflowPack: "ai-biosecurity-eval", styleProfile: "risk-warning" } }
  });
  const briefPayload = JSON.parse((brief.result as { content: { text: string }[] }).content[0].text);
  assert.equal(briefPayload.brief.status, "existing-asset");
  assert.equal(briefPayload.brief.assetId, "risk-gate");

  const templateSpec = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2904,
    method: "tools/call",
    params: { name: "create_workflow_template", arguments: { workflowPack: "ai-biosecurity-eval", intent: "benchmark dashboard with calibration and review escalation" } }
  });
  const templateSpecPayload = JSON.parse((templateSpec.result as { content: { text: string }[] }).content[0].text);
  assert.equal(templateSpecPayload.templateSpec.workflowPack, "ai-biosecurity-eval");
  assert.ok(templateSpecPayload.templateSpec.previewAssetIds.length >= 4);

  const rendered = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 21,
    method: "tools/call",
    params: { name: "render_asset_preview", arguments: { assetId: "risk-gate", style: "risk-warning", accent: "#ef4444", strokeWidth: 4 } }
  });
  const renderPayload = JSON.parse((rendered.result as { content: { text: string }[] }).content[0].text);
  assert.match(renderPayload.svg, /premium-asset/);
  assert.match(renderPayload.svg, /data-style-profile="risk-warning"/);
  assert.match(renderPayload.svg, /data-accent="#ef4444"/);
  assert.match(renderPayload.svg, /data-stroke-width="4"/);

  const created = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 22,
    method: "tools/call",
    params: { name: "create_project", arguments: { title: "Asset insert fixture" } }
  });
  const projectId = JSON.parse((created.result as { content: { text: string }[] }).content[0].text).project.id;
  const inserted = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 23,
    method: "tools/call",
    params: { name: "insert_premium_asset", arguments: { projectId, assetId: "risk-gate", x: 100, y: 120, variant: "selected", style: "consulting-2p5d", accent: "#ef4444", strokeWidth: 4 } }
  });
  const insertPayload = JSON.parse((inserted.result as { content: { text: string }[] }).content[0].text);
  assert.equal(insertPayload.node.payload.variant, "selected");
  assert.equal(insertPayload.node.payload.styleProfile, "consulting-2p5d");
  assert.equal(insertPayload.node.payload.appearance.accent, "#ef4444");
  assert.equal(insertPayload.node.payload.appearance.strokeWidth, 4);
  assert.equal(insertPayload.agentRun.trace.insertPlan[0].assetId, "risk-gate");
  assert.equal(insertPayload.agentRun.trace.insertPlan[0].nodeId, insertPayload.node.id);
  assert.ok(insertPayload.agentRun.trace.toolSequence.includes("insert_premium_asset"));
  assert.ok(insertPayload.project.deck.agentRuns.some((run: { id: string }) => run.id === insertPayload.agentRun.id));

  const realisticInserted = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2301,
    method: "tools/call",
    params: { name: "insert_realistic_asset", arguments: { projectId, assetId: "realistic-he-tissue-section", x: 80, y: 260, width: 280, height: 180, styleProfile: "scientific-editorial-realism", mask: { shape: "round-rect" } } }
  });
  const realisticInsertPayload = JSON.parse((realisticInserted.result as { content: { text: string }[] }).content[0].text);
  assert.equal(realisticInsertPayload.node.kind, "image");
  assert.equal(realisticInsertPayload.node.payload.assetId, "realistic-he-tissue-section");
  assert.equal(realisticInsertPayload.agentRun.trace.insertPlan[0].tool, "insert_realistic_asset");
  assert.ok(realisticInsertPayload.agentRun.trace.resourceUris.includes("scientific-image://agent/asset-index-compact"));
  const realisticExport = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2302,
    method: "tools/call",
    params: { name: "export_project", arguments: { projectId, format: "svg" } }
  });
  const realisticExportPayload = JSON.parse((realisticExport.result as { content: { text: string }[] }).content[0].text);
  assert.match(realisticExportPayload.data, /scientific-realistic-asset/);

  const figure = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 24,
    method: "tools/call",
    params: { name: "create_workflow_figure", arguments: { projectId, templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d", stepCount: 4 } }
  });
  const figurePayload = JSON.parse((figure.result as { content: { text: string }[] }).content[0].text);
  assert.ok(figurePayload.nodes.length >= 5);
  const figurePageId = figurePayload.project.pages[0].id;
  assert.equal(figurePayload.project.deck.slideMeta[figurePageId].title, "AI biosecurity pipeline");
  assert.match(figurePayload.project.deck.slideMeta[figurePageId].speakerNotes, /Export note/);
  assert.ok(figurePayload.nodes.some((node: { kind: string; payload?: { assetId?: string; layoutHint?: string } }) => node.kind === "symbol" && node.payload?.assetId === "risk-gate" && node.payload?.layoutHint?.startsWith("ai-biosecurity-pipeline:")));
  assert.equal(figurePayload.agentRun.trace.templateId, "ai-biosecurity-pipeline");
  assert.equal(figurePayload.agentRun.trace.workflowPack, "ai-biosecurity-eval");
  assert.equal(figurePayload.agentRun.trace.generatedNodeIds.length, figurePayload.nodes.length);
  assert.ok(figurePayload.agentRun.trace.references.some((reference: { kind: string; tool?: string }) => reference.kind === "template" && reference.tool === "create_workflow_figure"));
  const mcpExportReview = figurePayload.reviewItems.find((item: { kind: string; message: string }) => item.kind === "export" && item.message.includes("premium SVG fallback"));
  assert.ok(mcpExportReview);
  assert.equal(mcpExportReview.templateId, "ai-biosecurity-pipeline");
  assert.equal(mcpExportReview.exportFormat, "pptx");
  assert.ok(mcpExportReview.fallbackAssets.some((asset: { assetId: string; assetRecipe: string }) => asset.assetId === "risk-gate" && asset.assetRecipe === "hero-risk-gate"));

  const summary = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2401,
    method: "tools/call",
    params: { name: "summarize_review_queue", arguments: { projectId } }
  });
  const summaryPayload = JSON.parse((summary.result as { content: { text: string }[] }).content[0].text);
  assert.equal(summaryPayload.summary.deliveryReadiness, "needs-science-review");
  assert.ok(summaryPayload.summary.exportFallbacks.assetIds.includes("risk-gate"));
  const mcpExportAction = summaryPayload.summary.actionItems.find((item: { id: string }) => item.id === "review-office-export-fallbacks");
  assert.ok(mcpExportAction);

  const resolved = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 2402,
    method: "tools/call",
    params: { name: "resolve_review_items", arguments: { projectId, reviewItemIds: mcpExportAction.reviewItemIds, status: "accepted-risk" } }
  });
  const resolvedPayload = JSON.parse((resolved.result as { content: { text: string }[] }).content[0].text);
  assert.equal(resolvedPayload.summary.exportFallbacks.openCount, 0);

  const resultsFigure = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 26,
    method: "tools/call",
    params: { name: "create_workflow_figure", arguments: { projectId, workflowPack: "publication-results-panels", styleProfile: "consulting-2p5d" } }
  });
  const resultsFigurePayload = JSON.parse((resultsFigure.result as { content: { text: string }[] }).content[0].text);
  assert.ok(resultsFigurePayload.nodes.some((node: { kind: string; payload?: { spec?: { plotType?: string } } }) => node.kind === "plot" && node.payload?.spec?.plotType === "heatmap"));
  assert.equal(resultsFigurePayload.agentRun.trace.workflowPack, "publication-results-panels");
  assert.ok(resultsFigurePayload.agentRun.trace.generatedNodeIds.length >= resultsFigurePayload.nodes.length);

  const flagship = await handleJsonRpc({
    jsonrpc: "2.0",
    id: 28,
    method: "tools/call",
    params: { name: "create_flagship_workflow_demo", arguments: { projectId, workflowPack: "ai-biosecurity-eval", styleProfile: "consulting-2p5d", stepCount: 4 } }
  });
  const flagshipPayload = JSON.parse((flagship.result as { content: { text: string }[] }).content[0].text);
  assert.ok(flagshipPayload.nodes.some((node: { kind: string; payload?: { assetId?: string } }) => node.kind === "symbol" && node.payload?.assetId === "risk-gate"));
  assert.equal(flagshipPayload.agentRun.trace.workflowPack, "ai-biosecurity-eval");
  assert.ok(flagshipPayload.agentRun.trace.toolSequence.includes("create_flagship_workflow_demo"));
});
