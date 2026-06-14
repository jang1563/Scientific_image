import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  addPage,
  createConnectorNode,
  createPage,
  createPlotNode,
  createProject,
  createShapeNode,
  createTextNode,
  createTransform,
  type Page,
  type PlotSpec,
  type Project,
  type SceneNode,
  type Style
} from "../packages/scene/src/index.ts";
import { createCuratedSymbolNode } from "../packages/assets/src/index.ts";
import { exportProject } from "../packages/export/src/index.ts";

const OUT_DIR = "output/example-three-slide-drug-discovery";

const palette = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  pale: "#f8fafc",
  panel: "#ffffff",
  blue: "#2563eb",
  teal: "#0f766e",
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#dc2626",
  purple: "#7c3aed"
};

function t(text: string, x: number, y: number, width: number, height: number, style: Style = {}, align: "start" | "middle" | "end" = "start"): SceneNode {
  const node = createTextNode(text, createTransform(x, y, width, height), {
    color: palette.ink,
    fontSize: 18,
    fontWeight: 650,
    ...style
  });
  return {
    ...node,
    payload: { ...node.payload, align },
    claimStatus: "user-confirmed"
  };
}

function shape(label: string, x: number, y: number, width: number, height: number, style: Style = {}): SceneNode {
  return {
    ...createShapeNode("round-rect", label, createTransform(x, y, width, height), {
      fill: palette.panel,
      stroke: palette.line,
      strokeWidth: 1.4,
      depth: "raised",
      ...style
    }),
    claimStatus: "user-confirmed"
  };
}

function symbol(assetId: string, label: string, x: number, y: number, width: number, height: number, styleProfile = "consulting-2p5d", appearance: Record<string, unknown> = {}): SceneNode {
  return createCuratedSymbolNode({
    assetId,
    label,
    x,
    y,
    width,
    height,
    styleProfile: styleProfile as never,
    semanticRole: "drug-discovery",
    layoutHint: `example-drug-discovery:${assetId}`,
    appearance: {
      labelVisible: true,
      strokeWidth: 2.1,
      ...appearance
    }
  });
}

function pill(text: string, x: number, y: number, width: number, fill: string, stroke: string, color = palette.ink): SceneNode[] {
  return [
    shape("", x, y, width, 28, { fill, stroke, strokeWidth: 1.1, depth: "surface" }),
    t(text, x + 12, y + 5, width - 24, 16, { fontSize: 10.5, fontWeight: 850, color }, "middle")
  ];
}

function cardTitle(text: string, x: number, y: number, width: number): SceneNode {
  return t(text, x, y, width, 22, { fontSize: 14.5, fontWeight: 900, color: palette.ink });
}

function slideHeader(page: Page, kicker: string, title: string, subtitle: string): SceneNode[] {
  return [
    t(kicker.toUpperCase(), 72, 42, 560, 18, { fontSize: 11, fontWeight: 900, color: palette.teal }),
    t(title, 72, 66, 760, 42, { fontSize: 30, fontWeight: 920, color: palette.ink }),
    t(subtitle, 74, 108, 860, 26, { fontSize: 13.2, fontWeight: 650, color: palette.muted }),
    shape("", 1040, 44, 156, 38, { fill: "#ecfeff", stroke: "#99f6e4", depth: "surface" }),
    t("structured scene JSON", 1054, 56, 128, 14, { fontSize: 10.5, fontWeight: 900, color: palette.teal }, "middle"),
    shape("", 72, 148, page.width - 144, 1.6, { fill: "#dbe4f0", stroke: "#dbe4f0", depth: "none" })
  ];
}

function slideFooter(): SceneNode[] {
  return [
    t("Example only: claims and data are illustrative; review/citation required before scientific delivery.", 72, 684, 760, 18, { fontSize: 9.6, fontWeight: 700, color: "#7c2d12" }),
    t("Scientific Image MVP | editable assets + export QA", 852, 684, 356, 18, { fontSize: 9.6, fontWeight: 750, color: palette.muted }, "end")
  ];
}

function addNodes(page: Page, nodes: SceneNode[]): void {
  page.nodes.push(...nodes.map((node, index) => ({
    ...node,
    transform: { ...node.transform, z: node.transform.z || page.nodes.length + index + 1 }
  })));
}

function makePlotSpec(id: string, title: string, plotType: PlotSpec["plotType"], rows: Record<string, string | number | null>[], encodings: PlotSpec["encodings"], style: Style = {}): PlotSpec {
  return {
    id,
    title,
    plotType,
    table: {
      id: `${id}-table`,
      name: title,
      columns: Object.keys(rows[0] ?? {}),
      rows,
      source: {
        kind: "manual",
        source: "Illustrative generated example values",
        license: "private/unverified",
        editState: "needs-review"
      }
    },
    encodings,
    style
  };
}

function slide1(page: Page): void {
  const nodes: SceneNode[] = [
    ...slideHeader(page, "Drug discovery pack demo", "Target-to-candidate funnel", "Agent-selectable premium assets form an editable discovery funnel rather than a static screenshot."),
    shape("", 72, 176, 1136, 430, { fill: "#ffffff", stroke: "#dbe4f0", strokeWidth: 1.6, depth: "hero" }),
    t("Core workflow", 100, 202, 240, 22, { fontSize: 17, fontWeight: 900 }),
    t("Scene nodes keep assetId, style, role, and provenance.", 100, 228, 720, 22, { fontSize: 12.5, color: palette.muted, fontWeight: 650 })
  ];

  const stages = [
    { asset: "target-validation", label: "Validate target", detail: "biology + evidence", color: palette.teal },
    { asset: "compound-library", label: "Screen library", detail: "384-well compatible", color: palette.blue },
    { asset: "hit-triage", label: "Triage hits", detail: "rank potency/selectivity", color: palette.purple },
    { asset: "medicinal-chemistry-cycle", label: "Optimize lead", detail: "design-make-test-learn", color: palette.green },
    { asset: "candidate-nomination", label: "Nominate", detail: "readiness package", color: palette.amber }
  ];

  stages.forEach((stage, index) => {
    const x = 112 + index * 214;
    nodes.push(shape("", x - 12, 280, 168, 218, { fill: index === 4 ? "#fffbeb" : "#f8fafc", stroke: index === 4 ? "#fde68a" : "#e2e8f0", depth: "raised" }));
    nodes.push(symbol(stage.asset, stage.label, x + 18, 302, 108, 94, "consulting-2p5d", { accent: stage.color, stroke: stage.color }));
    nodes.push(t(stage.label, x, 416, 144, 22, { fontSize: 14, fontWeight: 900, color: palette.ink }, "middle"));
    nodes.push(t(stage.detail, x + 8, 442, 128, 30, { fontSize: 10.5, fontWeight: 650, color: palette.muted }, "middle"));
    nodes.push(...pill(`assetId: ${stage.asset}`, x + 4, 472, 136, "#ffffff", "#dbe4f0", palette.muted));
    if (index > 0) {
      nodes.push(createConnectorNode([{ x: x - 58, y: 388 }, { x: x - 16, y: 388 }], "", { stroke: "#94a3b8", strokeWidth: 2.4 }));
    }
  });

  nodes.push(shape("", 104, 532, 1040, 42, { fill: "#f0fdfa", stroke: "#99f6e4", depth: "surface" }));
  nodes.push(t("Agent handoff", 126, 543, 120, 18, { fontSize: 12.5, fontWeight: 900, color: palette.teal }));
  nodes.push(t("recommend_workflow_pack -> recommend_asset_set -> insert_premium_asset -> validate_deck -> export_deck", 258, 543, 804, 18, { fontSize: 12, fontWeight: 760, color: palette.ink }));
  nodes.push(...slideFooter());
  addNodes(page, nodes);
}

function slide2(page: Page): void {
  const doseRows = [
    { dose: 0.01, response: 96, group: "A" },
    { dose: 0.03, response: 89, group: "A" },
    { dose: 0.1, response: 74, group: "A" },
    { dose: 0.3, response: 48, group: "A" },
    { dose: 1, response: 22, group: "A" },
    { dose: 3, response: 10, group: "A" }
  ];
  const selectivityRows = [
    { target: "Primary", score: 92, group: "target" },
    { target: "Kinase A", score: 28, group: "off-target" },
    { target: "Kinase B", score: 16, group: "off-target" },
    { target: "CYP", score: 21, group: "liability" }
  ];
  const nodes: SceneNode[] = [
    ...slideHeader(page, "Hit triage evidence", "Potency, selectivity, and safety review", "Premium vector assets and editable PlotSpec nodes share one reviewable scientific scene graph."),
    shape("", 72, 176, 350, 446, { fill: "#ffffff", stroke: "#dbe4f0", depth: "hero" }),
    shape("", 452, 176, 360, 446, { fill: "#ffffff", stroke: "#dbe4f0", depth: "hero" }),
    shape("", 842, 176, 366, 446, { fill: "#ffffff", stroke: "#dbe4f0", depth: "hero" }),
    cardTitle("A. Screen + triage", 98, 204, 210),
    cardTitle("B. Potency / selectivity", 478, 204, 260),
    cardTitle("C. Safety and review", 868, 204, 250),
    t("Triage links screen output to potency, selectivity, and toxicity review.", 98, 232, 286, 42, { fontSize: 12, fontWeight: 650, color: palette.muted }),
    symbol("compound-library", "Compound library", 104, 288, 118, 96, "consulting-2p5d", { accent: palette.teal }),
    symbol("plate-384", "384-well plate", 244, 288, 118, 96, "consulting-2p5d", { accent: palette.blue }),
    createConnectorNode([{ x: 225, y: 334 }, { x: 244, y: 334 }], "", { stroke: "#94a3b8", strokeWidth: 2.1 }),
    symbol("hit-triage", "Hit triage", 170, 404, 128, 102, "consulting-2p5d", { accent: palette.purple }),
    ...pill("ranked hit list", 150, 530, 170, "#f5f3ff", "#ddd6fe", palette.purple),
    symbol("dose-response-curve", "Dose response", 486, 246, 132, 102, "consulting-2p5d", { accent: palette.teal }),
    symbol("selectivity-panel", "Selectivity", 644, 246, 132, 102, "consulting-2p5d", { accent: palette.blue }),
    createPlotNode(makePlotSpec("example-dose-response", "Illustrative dose-response", "line", doseRows, { x: "dose", y: "response", group: "group" }, { fill: "#ffffff", stroke: "#dbe4f0" }), createTransform(486, 374, 286, 168)),
    createPlotNode(makePlotSpec("example-selectivity", "Selectivity score", "bar", selectivityRows, { x: "target", y: "score", group: "group" }, { fill: "#ffffff", stroke: "#dbe4f0" }), createTransform(862, 248, 292, 176)),
    symbol("toxicity-screen", "Toxicity screen", 888, 442, 120, 96, "risk-warning", { accent: palette.red, stroke: palette.red }),
    symbol("admet-panel", "ADMET panel", 1026, 442, 120, 96, "consulting-2p5d", { accent: palette.amber }),
    shape("", 882, 558, 278, 36, { fill: "#fff7ed", stroke: "#fed7aa", depth: "surface" }),
    t("Review queue: toxicity claim needs source", 898, 568, 246, 16, { fontSize: 11.3, fontWeight: 850, color: "#9a3412" })
  ];
  nodes.push(...slideFooter());
  addNodes(page, nodes);
}

function slide3(page: Page): void {
  const nodes: SceneNode[] = [
    ...slideHeader(page, "Lead nomination", "Candidate readiness package", "Structured SVG assets become a consulting-style decision frame for expert review."),
    shape("", 72, 176, 1136, 448, { fill: "#ffffff", stroke: "#dbe4f0", strokeWidth: 1.6, depth: "hero" }),
    shape("", 100, 212, 438, 362, { fill: "#f8fafc", stroke: "#e2e8f0", depth: "raised" }),
    shape("", 574, 212, 300, 362, { fill: "#f8fafc", stroke: "#e2e8f0", depth: "raised" }),
    shape("", 910, 212, 238, 362, { fill: "#fffbeb", stroke: "#fde68a", depth: "raised" }),
    cardTitle("Optimization evidence", 124, 236, 240),
    cardTitle("Translational confidence", 598, 236, 230),
    cardTitle("Decision package", 934, 236, 180),
    symbol("lead-series", "Lead series", 126, 282, 132, 100, "consulting-2p5d", { accent: palette.teal }),
    symbol("sar-table", "SAR table", 274, 282, 132, 100, "consulting-2p5d", { accent: palette.blue }),
    symbol("pk-profile", "PK profile", 126, 418, 132, 100, "consulting-2p5d", { accent: palette.purple }),
    symbol("medicinal-chemistry-cycle", "Med-chem cycle", 274, 418, 132, 100, "consulting-2p5d", { accent: palette.green }),
    t("Editable part-level controls can adjust accent, stroke, depth, labels, and style profile without replacing the scene object.", 424, 302, 86, 184, { fontSize: 11.3, fontWeight: 650, color: palette.muted }, "middle"),
    symbol("efficacy-model", "Efficacy model", 608, 284, 118, 96, "consulting-2p5d", { accent: palette.green }),
    symbol("biomarker-response", "Biomarker response", 734, 284, 118, 96, "consulting-2p5d", { accent: palette.purple }),
    symbol("human-cohort", "Cohort", 608, 422, 112, 92, "consulting-2p5d", { accent: palette.blue }),
    symbol("calibration", "Calibration", 736, 422, 112, 92, "consulting-2p5d", { accent: palette.teal }),
    createConnectorNode([{ x: 538, y: 392 }, { x: 574, y: 392 }], "", { stroke: "#94a3b8", strokeWidth: 2.4 }),
    createConnectorNode([{ x: 874, y: 392 }, { x: 910, y: 392 }], "", { stroke: "#94a3b8", strokeWidth: 2.4 }),
    symbol("candidate-nomination", "Candidate", 964, 278, 134, 106, "consulting-2p5d", { accent: palette.amber }),
    symbol("ind-enabling-package", "IND package", 964, 420, 134, 106, "consulting-2p5d", { accent: palette.teal }),
    ...pill("go / no-go review", 946, 542, 170, "#ffffff", "#fcd34d", "#92400e"),
    shape("", 122, 584, 1000, 34, { fill: "#f8fafc", stroke: "#dbe4f0", depth: "surface" }),
    t("Export behavior", 144, 594, 126, 14, { fontSize: 11.5, fontWeight: 900, color: palette.ink }),
    t("SVG/PDF vector-safe; PPTX uses named premium SVG fallbacks.", 270, 594, 520, 14, { fontSize: 10.4, fontWeight: 700, color: palette.muted }),
    t("Next: stronger composition + PPTX-native mapping.", 850, 591, 250, 20, { fontSize: 9.5, fontWeight: 760, color: "#7c2d12" }, "middle")
  ];
  nodes.push(...slideFooter());
  addNodes(page, nodes);
}

function buildProject(): Project {
  let project = createProject("Drug discovery premium asset demo", "slide");
  const first = project.pages[0];
  first.name = "Discovery funnel";
  first.background = "#f8fafc";
  const second = createPage("slide", "Hit triage evidence");
  const third = createPage("slide", "Lead nomination package");
  second.background = "#f8fafc";
  third.background = "#f8fafc";
  project = addPage(project, second);
  project = addPage(project, third);
  slide1(project.pages[0]);
  slide2(project.pages[1]);
  slide3(project.pages[2]);
  project.deck.slideMeta[project.pages[0].id] = {
    pageId: project.pages[0].id,
    title: "Discovery funnel",
    section: "Drug discovery demo",
    speakerNotes: "Show that each visual object is structured and agent-addressable.",
    narrativeIntent: "Introduce the editable drug-discovery workflow.",
    layoutIntent: "workflow",
    sourceIds: []
  };
  project.deck.slideMeta[project.pages[1].id] = {
    pageId: project.pages[1].id,
    title: "Hit triage evidence",
    section: "Drug discovery demo",
    speakerNotes: "Explain that plots and premium symbols can coexist in one reviewable slide.",
    narrativeIntent: "Show evidence review path from screen to safety.",
    layoutIntent: "results",
    sourceIds: []
  };
  project.deck.slideMeta[project.pages[2].id] = {
    pageId: project.pages[2].id,
    title: "Lead nomination package",
    section: "Drug discovery demo",
    speakerNotes: "Emphasize readiness package and export warnings.",
    narrativeIntent: "Frame go/no-go decision from multiple evidence objects.",
    layoutIntent: "decision",
    sourceIds: []
  };
  return project;
}

function writeExport(path: string, data: string | Uint8Array): void {
  writeFileSync(path, typeof data === "string" ? data : Buffer.from(data));
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const project = buildProject();
  writeFileSync(join(OUT_DIR, "drug-discovery-three-slide-demo.sci-vis.json"), JSON.stringify(project, null, 2));
  for (const page of project.pages) {
    const svg = exportProject(project, { format: "svg", pageId: page.id });
    writeExport(join(OUT_DIR, `${svg.filename}`), svg.data);
  }
  const deckSvg = exportProject(project, { format: "svg" });
  const pdf = exportProject(project, { format: "pdf" });
  const pptx = exportProject(project, { format: "pptx" });
  writeExport(join(OUT_DIR, deckSvg.filename), deckSvg.data);
  writeExport(join(OUT_DIR, pdf.filename), pdf.data);
  writeExport(join(OUT_DIR, pptx.filename), pptx.data);
  writeFileSync(join(OUT_DIR, "export-warnings.json"), JSON.stringify({
    svg: deckSvg.warnings,
    pdf: pdf.warnings,
    pptx: pptx.warnings
  }, null, 2));
  console.log(JSON.stringify({
    outputDir: OUT_DIR,
    pages: project.pages.map((page) => ({ id: page.id, name: page.name, nodeCount: page.nodes.length })),
    files: [
      "drug-discovery-three-slide-demo.sci-vis.json",
      ...project.pages.map((page) => `drug-discovery-premium-asset-demo-${page.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.svg`),
      deckSvg.filename,
      pdf.filename,
      pptx.filename,
      "export-warnings.json"
    ],
    warnings: {
      svg: deckSvg.warnings.length,
      pdf: pdf.warnings.length,
      pptx: pptx.warnings.length
    }
  }, null, 2));
}

main();
