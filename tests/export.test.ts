import test from "node:test";
import assert from "node:assert/strict";
import { addNode, createProject, createShapeNode, createTransform } from "../packages/scene/src/index.ts";
import { createCuratedSymbolNode, createFlagshipWorkflowDemoNodes, createWorkflowFigureNodes, getWorkflowPackExportSnapshot, listWorkflowPacks } from "../packages/assets/src/index.ts";
import { createPlotNode, createPlotSpec, parseDelimited } from "../packages/plotting/src/index.ts";
import { exportProject } from "../packages/export/src/index.ts";

const tableText = `gene,log2fc,padj,group
TP53,1.8,0.00008,DNA damage
MYC,-1.2,0.00004,Oncogene
CDKN1A,2.4,0.00002,Cell cycle`;

test("exports SVG, PDF, PPTX, and DOCX from the same scene graph", () => {
  let project = createProject("Export fixture");
  project = addNode(project, createCuratedSymbolNode({ assetId: "model-block", x: 80, y: 80, label: "AI model", styleProfile: "consulting-2p5d" }));
  const table = parseDelimited(tableText);
  const spec = createPlotSpec({ plotType: "volcano", table, encodings: { x: "log2fc", y: "padj", color: "group", label: "gene" }, title: "Volcano" });
  project = addNode(project, createPlotNode({ spec, x: 360, y: 160, width: 560, height: 280 }));

  const svg = exportProject(project, { format: "svg" });
  const pdf = exportProject(project, { format: "pdf" });
  const pptx = exportProject(project, { format: "pptx" });
  const docx = exportProject(project, { format: "docx" });

  assert.equal(svg.mime, "image/svg+xml");
  assert.match(String(svg.data), /<svg/);
  assert.match(String(svg.data), /data-style-profile="consulting-2p5d"/);
  assert.match(String(svg.data), /plot-volcano-layer/);
  assert.match(String(svg.data), /plot-volcano-significance-zone/);
  assert.match(String(svg.data), /plot-volcano-threshold-line/);
  assert.match(String(svg.data), /plot-volcano-legend/);
  assert.match(String(svg.data), /plot-volcano-label/);
  assert.match(String(svg.data), /plot-volcano-grid/);
  assert.match(String(svg.data), /plot-volcano-axis-tick/);
  assert.match(String(svg.data), /plot-volcano-direction-label/);
  assert.equal(pdf.mime, "application/pdf");
  assert.equal(Buffer.from(pdf.data as Uint8Array).subarray(0, 4).toString(), "%PDF");
  assert.equal(pptx.mime, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  assert.equal(Buffer.from(pptx.data as Uint8Array).subarray(0, 2).toString(), "PK");
  assert.ok(pptx.warnings.some((warning) => warning.includes("PPTX maps")));
  assert.ok(pptx.warnings.some((warning) => warning.includes("premium styled symbol")));
  assert.ok(pptx.warnings.some((warning) => warning.includes("Assets: model-block")));
  assert.equal(docx.mime, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(Buffer.from(docx.data as Uint8Array).subarray(0, 2).toString(), "PK");
  assert.ok(docx.warnings.some((warning) => warning.includes("DOCX embeds")));
});

test("SVG export preserves Figma-like depth filters and legacy shadow mapping", () => {
  let project = createProject("Depth fixture");
  project = addNode(project, createShapeNode("round-rect", "Hero panel", createTransform(80, 90, 280, 120), { depth: "hero" }));
  const legacyShadow = createShapeNode("round-rect", "Legacy shadow", createTransform(420, 90, 260, 120), { shadow: true });
  delete legacyShadow.style.depth;
  project = addNode(project, legacyShadow);
  project = addNode(project, createCuratedSymbolNode({ assetId: "risk-gate", x: 740, y: 80, label: "Risk gate" }));

  const svg = String(exportProject(project, { format: "svg" }).data);

  assert.match(svg, /id="contact-shadow"/);
  assert.match(svg, /id="raised-panel-shadow"/);
  assert.match(svg, /id="soft-object-shadow"/);
  assert.match(svg, /id="hero-shadow"/);
  assert.match(svg, /id="focus-glow"/);
  assert.match(svg, /data-depth="hero"/);
  assert.match(svg, /data-depth="floating"/);
  assert.match(svg, /filter="url\(#warning-object-shadow\)"/);
});

test("PPTX export names exact premium fallback assets and templates", () => {
  let project = createProject("Flagship warning fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" });
  for (const node of nodes) project = addNode(project, node);

  const pptx = exportProject(project, { format: "pptx" });
  const premiumWarning = pptx.warnings.find((warning) => warning.includes("premium styled symbol"));
  assert.ok(premiumWarning);
  assert.match(premiumWarning, /risk-gate/);
  assert.match(premiumWarning, /human-review/);
  assert.match(premiumWarning, /ai-biosecurity-pipeline/);
});

test("SVG export renders heatmaps with publication-grade plot affordances", () => {
  let project = createProject("Spatial heatmap fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "spatial-results-panel", styleProfile: "consulting-2p5d" });
  for (const node of nodes) project = addNode(project, node);

  const svg = String(exportProject(project, { format: "svg" }).data);

  assert.match(svg, /plot-heatmap-layer/);
  assert.match(svg, /plot-heatmap-matrix-frame/);
  assert.match(svg, /plot-heatmap-cell/);
  assert.match(svg, /plot-heatmap-row-guide/);
  assert.match(svg, /plot-heatmap-column-guide/);
  assert.match(svg, /plot-heatmap-row-label/);
  assert.match(svg, /plot-heatmap-column-label/);
  assert.match(svg, /plot-heatmap-colorbar/);
  assert.match(svg, /data-x="immune"/);
  assert.match(svg, /data-y="CXCL10"/);
});

test("SVG export renders embedding scatter with cluster hulls and labels", () => {
  let project = createProject("Publication embedding fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "manuscript-results-figure", styleProfile: "consulting-2p5d" });
  for (const node of nodes) project = addNode(project, node);

  const svg = String(exportProject(project, { format: "svg" }).data);

  assert.match(svg, /plot-embedding-layer/);
  assert.match(svg, /plot-embedding-field/);
  assert.match(svg, /plot-embedding-grid/);
  assert.match(svg, /plot-embedding-cluster-hull/);
  assert.match(svg, /plot-embedding-cluster-rim/);
  assert.match(svg, /plot-embedding-point/);
  assert.match(svg, /plot-embedding-centroid/);
  assert.match(svg, /plot-embedding-cluster-label/);
  assert.match(svg, /plot-embedding-summary/);
  assert.match(svg, /data-group="IFN-high"/);
  assert.match(svg, /4 clusters \/ n=16/);
});

test("publication results template exports line and dark style plot themes", () => {
  let lineProject = createProject("Publication line fixture");
  for (const node of createWorkflowFigureNodes({ templateId: "manuscript-results-figure", styleProfile: "publication-line" })) {
    lineProject = addNode(lineProject, node);
  }
  const lineSvg = String(exportProject(lineProject, { format: "svg" }).data);

  assert.match(lineSvg, /fill="#ffffff" stroke="#111827"/);
  assert.match(lineSvg, /plot-embedding-layer/);
  assert.match(lineSvg, /plot-heatmap-colorbar/);
  assert.match(lineSvg, /data-style-profile="publication-line"/);
  assert.doesNotMatch(lineSvg, /fill="#fff7ed"/);

  let darkProject = createProject("Dark talk fixture");
  for (const node of createWorkflowFigureNodes({ templateId: "manuscript-results-figure", styleProfile: "dark-talk" })) {
    darkProject = addNode(darkProject, node);
  }
  const darkSvg = String(exportProject(darkProject, { format: "svg" }).data);

  assert.match(darkSvg, /fill="#020617"/);
  assert.match(darkSvg, /fill="#111827" stroke="#475569"/);
  assert.match(darkSvg, /fill="#0f172a" stroke="#334155" stroke-width="0.8" opacity="0.78"/);
  assert.match(darkSvg, /data-style-profile="dark-talk"/);
  assert.match(darkSvg, /#38bdf8|#34d399|#f87171|#c084fc/);
});

test("priority flagship templates honor publication-line and dark-talk style themes", () => {
  const templateIds = ["perturb-seq-workflow", "spatial-results-panel", "ai-biosecurity-pipeline", "drug-discovery-funnel", "protein-engineering-platform", "synthetic-biology-platform", "microbiome-infectious-disease-platform", "cell-therapy-manufacturing-platform", "microscopy-image-analysis-pipeline", "lab-automation-platform"];

  for (const templateId of templateIds) {
    let lineProject = createProject(`${templateId} line fixture`);
    for (const node of createWorkflowFigureNodes({ templateId, styleProfile: "publication-line" })) {
      lineProject = addNode(lineProject, node);
    }
    const lineSvg = String(exportProject(lineProject, { format: "svg" }).data);

    assert.match(lineSvg, /fill="#ffffff" stroke="#111827"/, `${templateId} should use line-art frame or panels`);
    assert.match(lineSvg, /data-style-profile="publication-line"/, `${templateId} should render publication-line symbols`);
    assert.doesNotMatch(lineSvg, /fill="#fff7ed"/, `${templateId} should not leak consulting warning fills in publication-line`);
    assert.doesNotMatch(lineSvg, /stroke="#(?:bfdbfe|e9d5ff|fecaca)"/, `${templateId} should not keep consulting outer strokes in publication-line`);

    let darkProject = createProject(`${templateId} dark fixture`);
    for (const node of createWorkflowFigureNodes({ templateId, styleProfile: "dark-talk" })) {
      darkProject = addNode(darkProject, node);
    }
    const darkSvg = String(exportProject(darkProject, { format: "svg" }).data);

    assert.match(darkSvg, /fill="#020617"/, `${templateId} should use a dark-talk outer stage`);
    assert.match(darkSvg, /fill="#111827" stroke="#475569"/, `${templateId} should use dark-talk plot surfaces`);
    assert.match(darkSvg, /data-style-profile="dark-talk"/, `${templateId} should render dark-talk symbols`);
    assert.match(darkSvg, /#38bdf8|#34d399|#fdba74/, `${templateId} should retain controlled dark-talk accents`);
  }
});

test("symbol labels fit long scientific names in export-safe pills", () => {
  let project = createProject("Long symbol label fixture");
  project = addNode(project, createCuratedSymbolNode({
    assetId: "scrna-droplet",
    label: "Cell x guide capture",
    x: 0,
    y: 0,
    width: 124,
    height: 98,
    styleProfile: "publication-line"
  }));
  const svg = String(exportProject(project, { format: "svg" }).data);

  assert.match(svg, /<rect x="5" y="76" width="114" height="17"/);
  assert.match(svg, /font-size="9\.[0-9]+"[^>]*>Cell x guide cap\.\.\.<\/text>/);
});

test("SVG export renders bar plots with premium axis and value affordances", () => {
  let project = createProject("Bar plot fixture");
  const table = parseDelimited(`class,score
benign protocol,0.12
dual-use ambiguity,0.61
wetlab feasibility,0.74
DURC,0.86`);
  const spec = createPlotSpec({
    plotType: "bar",
    table,
    encodings: { x: "class", y: "score" },
    title: "Risk score by class"
  });
  project = addNode(project, createPlotNode({ spec, x: 90, y: 120, width: 520, height: 220 }));

  const svg = String(exportProject(project, { format: "svg" }).data);

  assert.match(svg, /plot-bar-layer/);
  assert.match(svg, /plot-bar-axis-tick/);
  assert.match(svg, /plot-bar-grid/);
  assert.match(svg, /plot-bar-track/);
  assert.match(svg, /plot-bar-mark/);
  assert.match(svg, /plot-bar-highlight/);
  assert.match(svg, /plot-bar-value-label/);
  assert.match(svg, /plot-bar-category-label/);
  assert.match(svg, /plot-bar-category-line/);
  assert.match(svg, /data-lines="2"/);
  assert.match(svg, /data-group="DURC"/);
  assert.match(svg, /data-value="0.86"/);
  assert.match(svg, /dual/);
  assert.match(svg, /ambiguity/);
  assert.doesNotMatch(svg, /use\.\.\./);
});

test("workflow pack flagship demos export across SVG PDF PPTX and DOCX with snapshot warnings", () => {
  for (const pack of listWorkflowPacks()) {
    let project = createProject(`${pack.name} export snapshot`);
    const nodes = createFlagshipWorkflowDemoNodes({ workflowPack: pack.id, styleProfile: "consulting-2p5d" });
    for (const node of nodes) project = addNode(project, node);

    const snapshot = getWorkflowPackExportSnapshot(pack.id, { styleProfile: "consulting-2p5d" });
    const svg = exportProject(project, { format: "svg" });
    const pdf = exportProject(project, { format: "pdf" });
    const pptx = exportProject(project, { format: "pptx" });
    const docx = exportProject(project, { format: "docx" });

    assert.equal(snapshot.blockedTemplateCount, 0, `${pack.id} has blocked templates`);
    assert.match(String(svg.data), /<svg/);
    assert.ok(String(svg.data).length > 5000, `${pack.id} SVG output is unexpectedly small`);
    assert.equal(Buffer.from(pdf.data as Uint8Array).subarray(0, 4).toString(), "%PDF");
    assert.equal(Buffer.from(pptx.data as Uint8Array).subarray(0, 2).toString(), "PK");
    assert.equal(Buffer.from(docx.data as Uint8Array).subarray(0, 2).toString(), "PK");
    assert.ok(docx.warnings.some((warning) => warning.includes("DOCX embeds")));
    if (snapshot.totalPremiumAssetFallbackCount) {
      assert.ok(pptx.warnings.some((warning) => warning.includes("premium styled symbol")), `${pack.id} is missing premium PPTX warning`);
    }
  }
});
