import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { handleJsonRpc } from "../packages/mcp/src/server.ts";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
type McpResponse = Awaited<ReturnType<typeof handleJsonRpc>>;

export interface AgentAcceptanceSmokeOptions {
  workflowPack?: string;
  templateId?: string;
  styleProfile?: string;
  title?: string;
  narrative?: string;
  sourceName?: string;
  sourceText?: string;
  writeOutput?: boolean;
  outputDir?: string;
}

export interface AgentAcceptanceSmokeResult {
  ok: true;
  projectId: string;
  workflowPack: string;
  templateId: string;
  styleProfile: string;
  sourceId?: string;
  sourceName: string;
  workflowRecommendation: {
    workflowPack: string;
    score?: number;
    reason?: string;
    recommendedTemplateId?: string;
  };
  resourceCount: number;
  toolCount: number;
  createdNodeCount: number;
  generatedNodeIds: string[];
  assetIds: string[];
  validationOk: boolean;
  reviewItemCount: number;
  reviewSummary: JsonObject;
  deliveryReadiness: string;
  nextAction: string;
  fallbackAssetIds: string[];
  exportWarnings: {
    svg: string[];
    pdf: string[];
    pptx: string[];
    all: string[];
  };
  agentSummary: string;
  exports: {
    svg: { filename: string; sizeBytes: number; warnings: string[]; path?: string };
    pdf: { filename: string; sizeBytes: number; warnings: string[]; path?: string };
    pptx: { filename: string; sizeBytes: number; warnings: string[]; path?: string };
  };
}

let requestId = 1;

export const PERTURB_SEQ_SOURCE_FIXTURE = `# Perturb-seq CRISPR screen

Input cells receive guide RNAs from a pooled CRISPR library. Perturb-seq links guide identity with single-cell RNA-seq readouts, creating an expression matrix for differential expression analysis.

The slide should explain the workflow from cells and guide RNA delivery through pooled screening, single-cell capture, sequencing, expression matrix construction, volcano-style hit calling, and validation of candidate genes.

Flag scientific claims for citation or human confirmation. Preserve editable scene nodes and report any PPTX fallback warnings by asset ID.`;

const AI_BIOSECURITY_SOURCE_FIXTURE = `# AI biosecurity evaluation pipeline

Biology-capable AI systems need benchmark prompts, classifiers, calibrated risk gates, human review, audit logs, and exportable evidence summaries.

The slide should explain how datasets and model outputs pass through a benchmark suite, biosecurity classifier, permission decision, expert review, and final audit trail.

Flag claims for human review and name any PPTX fallback assets before delivery.`;

export const SPATIAL_TRANSCRIPTOMICS_SOURCE_FIXTURE = `# Spatial transcriptomics results panel

A tissue section is profiled with Visium-style spatial transcriptomics. The figure should show tissue context, capture spot array, segmentation mask, cell boundaries, neighborhood graph, spatial expression heatmap, and review-ready interpretation.

Flag microscopy and spatial expression claims for citation or human confirmation. Preserve editable scene nodes and name any PPTX fallback assets by asset ID.`;

const WORKFLOW_SMOKE_PRESETS: Record<string, {
  title: string;
  narrative: string;
  sourceName: string;
  sourceText: string;
}> = {
  "perturb-seq-crispr": {
    title: "Perturb-seq CRISPR agent demo",
    narrative: "Create an editable Perturb-seq workflow slide with cells, guide RNA, pooled screen, single-cell sequencing, expression matrix, result plot, review queue, and export QA.",
    sourceName: "perturb-seq-crispr-source.md",
    sourceText: PERTURB_SEQ_SOURCE_FIXTURE
  },
  "spatial-transcriptomics": {
    title: "Spatial transcriptomics results panel",
    narrative: "Create an editable spatial transcriptomics results slide with tissue context, spot capture, segmentation, cell boundaries, neighborhood graph, spatial expression heatmap, review queue, and export QA.",
    sourceName: "spatial-transcriptomics-source.md",
    sourceText: SPATIAL_TRANSCRIPTOMICS_SOURCE_FIXTURE
  },
  "ai-biosecurity-eval": {
    title: "AI biosecurity eval figure",
    narrative: "Create an editable AI biosecurity evaluation slide with model, benchmark, risk gate, human review, audit trail, review queue, and export QA.",
    sourceName: "ai-biosecurity-source.md",
    sourceText: AI_BIOSECURITY_SOURCE_FIXTURE
  }
};

export async function runAgentAcceptanceSmoke(options: AgentAcceptanceSmokeOptions = {}): Promise<AgentAcceptanceSmokeResult> {
  const styleProfile = options.styleProfile ?? "consulting-2p5d";
  const outputDir = resolve(options.outputDir ?? "output/agent-smoke");
  const sourceText = options.sourceText ?? sourceFixtureFor(options.workflowPack);
  const title = options.title ?? titleForSource(options.workflowPack, sourceText);
  const narrative = options.narrative ?? narrativeForSource(options.workflowPack, sourceText);
  const sourceName = options.sourceName ?? sourceNameForWorkflow(options.workflowPack, sourceText);

  const initialized = await rpc("initialize");
  assert.equal((initialized.result as { serverInfo: { name: string } }).serverInfo.name, "scientific-image-mcp");

  const resources = await rpc("resources/list");
  const resourceList = (resources.result as { resources: { uri: string }[] }).resources;
  assert.ok(resourceList.some((resource) => resource.uri === "scientific-image://agent/manifest"));

  const manifestResponse = await rpc("resources/read", { uri: "scientific-image://agent/manifest" });
  const manifestText = (manifestResponse.result as { contents: { text: string }[] }).contents[0].text;
  const manifest = JSON.parse(manifestText) as {
    workflowRecipes: { id: string }[];
    workflowPacks: { id: string; flagshipTemplateId?: string }[];
    recommendedFirstCalls?: { tool?: string; uri?: string }[];
  };
  assert.ok(manifest.workflowRecipes.some((recipe) => recipe.id === "workflow-pack-figure"));
  assert.ok(manifest.recommendedFirstCalls?.some((call) => call.tool === "get_asset_index"));
  assert.ok(manifest.recommendedFirstCalls?.some((call) => call.uri === "scientific-image://agent/agent-cookbook"));
  assert.ok(manifest.recommendedFirstCalls?.some((call) => call.uri === "scientific-image://agent/demo-perturb-seq-crispr"));

  const cookbookResource = await rpc("resources/read", { uri: "scientific-image://agent/agent-cookbook" });
  const cookbookText = (cookbookResource.result as { contents: { text: string }[] }).contents[0].text;
  assert.match(cookbookText, /Scientific Image Agent Cookbook/);
  assert.match(cookbookText, /insertPlan\[\]\.args/);
  assert.match(cookbookText, /agentRun\.trace/);
  assert.match(cookbookText, /export_pack_qa_report/);

  const perturbDemoResource = await rpc("resources/read", { uri: "scientific-image://agent/demo-perturb-seq-crispr" });
  const perturbDemoText = (perturbDemoResource.result as { contents: { text: string }[] }).contents[0].text;
  assert.match(perturbDemoText, /Perturb-seq CRISPR Agent Demo/);
  assert.match(perturbDemoText, /perturb-seq-workflow/);

  const compactResource = await rpc("resources/read", { uri: "scientific-image://agent/asset-index-compact" });
  const compactIndexText = (compactResource.result as { contents: { text: string }[] }).contents[0].text;
  const compactIndex = JSON.parse(compactIndexText) as { schemaVersion: string; assets: JsonObject[]; sizeBudget: { currentTargetBytes: number } };
  assert.equal(compactIndex.schemaVersion, "0.6.0-agent-asset-index");
  assert.ok(Buffer.byteLength(compactIndexText) <= Number(compactIndex.sizeBudget.currentTargetBytes));

  const tools = await rpc("tools/list");
  const toolList = (tools.result as { tools: { name: string }[] }).tools;
  assert.ok(toolList.some((tool) => tool.name === "create_workflow_figure"));
  assert.ok(toolList.some((tool) => tool.name === "get_workflow_pack_export_snapshot"));
  assert.ok(toolList.some((tool) => tool.name === "get_asset_index"));

  const packRecommendationResponse = await callTool("recommend_workflow_pack", {
    title,
    narrative,
    sourceText,
    workflowPack: options.workflowPack,
    limit: 3
  });
  const packRecommendations = (packRecommendationResponse.recommendations as JsonObject[] | undefined) ?? [];
  assert.ok(packRecommendations.length > 0);
  const topRecommendation = packRecommendations[0] as JsonObject;
  const recommendedPack = topRecommendation.pack as JsonObject;
  const workflowPack = options.workflowPack ?? String(recommendedPack.id);
  assert.equal(String(recommendedPack.id), workflowPack);

  const pack = manifest.workflowPacks.find((candidate) => candidate.id === workflowPack);
  const templateId = options.templateId ?? pack?.flagshipTemplateId ?? String(topRecommendation.recommendedTemplateId ?? "ai-biosecurity-pipeline");

  const gallery = await callTool("get_workflow_pack_gallery", { workflowPack, styleProfile });
  assert.equal((gallery.gallery as { pack: { id: string } }).pack.id, workflowPack);

  const indexed = await callTool("get_asset_index", { workflowPack, styleProfile, qualityTier: "signature", limit: 8 });
  assert.ok(((indexed.index as JsonObject).assets as JsonObject[]).length > 0);

  const assetSet = await callTool("recommend_asset_set", {
    title,
    narrative,
    sourceText,
    workflowPack,
    styleProfile,
    responseShape: "compact",
    limit: workflowPack === "perturb-seq-crispr" ? 10 : 6
  });
  const insertPlan = ((assetSet.recommendation as JsonObject).insertPlan as JsonObject[] | undefined) ?? [];
  assert.ok(insertPlan.length > 0);

  const snapshot = await callTool("get_workflow_pack_export_snapshot", { workflowPack, styleProfile });
  const fallbackAssetIds = ((snapshot.snapshot as JsonObject).uniqueFallbackAssetIds as string[] | undefined) ?? [];

  const created = await callTool("create_project", { title, kind: "slide" });
  const projectId = String(((created.project as JsonObject).id));
  const imported = await callTool("import_source", {
    projectId,
    kind: "markdown",
    name: sourceName,
    text: sourceText,
    citation: "Agent acceptance smoke source fixture"
  });
  const source = imported.source as JsonObject | undefined;
  const sourceId = source?.id ? String(source.id) : undefined;

  const figure = await callTool("create_workflow_figure", {
    projectId,
    templateId,
    styleProfile,
    stepCount: 4
  });
  const nodes = figure.nodes as JsonObject[];
  assert.ok(nodes.length >= 5);
  assert.ok(nodes.some((node) => node.kind === "symbol"));
  const figureTrace = (figure.agentRun as JsonObject).trace as JsonObject;
  assert.equal(figureTrace.workflowPack, workflowPack);
  assert.equal(figureTrace.templateId, templateId);
  const generatedNodeIds = (figureTrace.generatedNodeIds as string[] | undefined) ?? [];
  const assetIds = agentTraceAssetIds(figureTrace);
  assert.equal(generatedNodeIds.length, nodes.length);

  const validation = await callTool("validate_deck", { projectId });
  const validationOk = Boolean((validation.validation as JsonObject).ok);
  assert.equal(validationOk, true);

  const review = await callTool("list_review_items", { projectId });
  const reviewItems = (review.reviewItems as JsonObject[] | undefined) ?? [];
  const reviewSummary = await callTool("summarize_review_queue", { projectId });
  const summary = reviewSummary.summary as JsonObject;
  assert.ok(["needs-science-review", "needs-export-review", "needs-layout-review", "ready-with-notes", "ready"].includes(String(summary.deliveryReadiness)));

  const exportQa = await callTool("export_pack_qa_report", { workflowPack, styleProfile, limit: 4 });
  assert.equal((exportQa.snapshot as JsonObject).packId, workflowPack);

  const svg = await exportDeck(projectId, "svg");
  const pdf = await exportDeck(projectId, "pdf");
  const pptx = await exportDeck(projectId, "pptx");
  assert.match(svg.text, /<svg/);
  assert.equal(pdf.binary.subarray(0, 4).toString(), "%PDF");
  assert.equal(pptx.binary.subarray(0, 2).toString(), "PK");
  const exportWarnings = {
    svg: svg.warnings,
    pdf: pdf.warnings,
    pptx: pptx.warnings,
    all: [...svg.warnings, ...pdf.warnings, ...pptx.warnings]
  };

  const result: AgentAcceptanceSmokeResult = {
    ok: true,
    projectId,
    workflowPack,
    templateId,
    styleProfile,
    sourceId,
    sourceName,
    workflowRecommendation: {
      workflowPack: String(recommendedPack.id),
      score: typeof topRecommendation.score === "number" ? topRecommendation.score : undefined,
      reason: topRecommendation.reason ? String(topRecommendation.reason) : undefined,
      recommendedTemplateId: topRecommendation.recommendedTemplateId ? String(topRecommendation.recommendedTemplateId) : undefined
    },
    resourceCount: resourceList.length,
    toolCount: toolList.length,
    createdNodeCount: nodes.length,
    generatedNodeIds,
    assetIds,
    validationOk,
    reviewItemCount: reviewItems.length,
    reviewSummary: summary,
    deliveryReadiness: String(summary.deliveryReadiness),
    nextAction: String(summary.nextAction),
    fallbackAssetIds,
    exportWarnings,
    agentSummary: [
      `Created ${workflowPack} editable slide with template ${templateId}.`,
      `Generated ${generatedNodeIds.length} nodes from ${assetIds.length} referenced assets.`,
      `Review readiness: ${String(summary.deliveryReadiness)}.`,
      `Next action: ${String(summary.nextAction)}`
    ].join(" "),
    exports: {
      svg: { filename: svg.filename, sizeBytes: Buffer.byteLength(svg.text), warnings: svg.warnings },
      pdf: { filename: pdf.filename, sizeBytes: pdf.binary.byteLength, warnings: pdf.warnings },
      pptx: { filename: pptx.filename, sizeBytes: pptx.binary.byteLength, warnings: pptx.warnings }
    }
  };

  if (options.writeOutput) {
    await mkdir(outputDir, { recursive: true });
    const svgPath = join(outputDir, svg.filename);
    const pdfPath = join(outputDir, pdf.filename);
    const pptxPath = join(outputDir, pptx.filename);
    await writeFile(svgPath, svg.text);
    await writeFile(pdfPath, pdf.binary);
    await writeFile(pptxPath, pptx.binary);
    result.exports.svg.path = svgPath;
    result.exports.pdf.path = pdfPath;
    result.exports.pptx.path = pptxPath;
  }

  return result;
}

async function exportDeck(projectId: string, format: "svg" | "pdf" | "pptx") {
  const payload = await callTool("export_deck", { projectId, format }) as {
    filename: string;
    warnings: string[];
    data: string;
  };
  if (format === "svg") {
    return {
      filename: payload.filename,
      warnings: payload.warnings,
      text: payload.data,
      binary: Buffer.from(payload.data)
    };
  }
  return {
    filename: payload.filename,
    warnings: payload.warnings,
    text: "",
    binary: Buffer.from(payload.data, "base64")
  };
}

async function callTool(name: string, args: JsonObject = {}): Promise<JsonObject> {
  const response = await rpc("tools/call", { name, arguments: args });
  const content = (response.result as { content: { text: string }[] }).content;
  return JSON.parse(content[0].text) as JsonObject;
}

async function rpc(method: string, params: JsonObject = {}): Promise<McpResponse> {
  const response = await handleJsonRpc({
    jsonrpc: "2.0",
    id: requestId++,
    method,
    params
  });
  if (response.error) throw new Error(response.error.message);
  return response;
}

function cliOptions(argv: string[]): AgentAcceptanceSmokeOptions {
  const getValue = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv[index + 1];
  };
  return {
    workflowPack: getValue("--workflow-pack"),
    templateId: getValue("--template-id"),
    styleProfile: getValue("--style-profile"),
    title: getValue("--title"),
    narrative: getValue("--narrative"),
    sourceName: getValue("--source-name"),
    sourceText: getValue("--source-text"),
    outputDir: getValue("--output-dir"),
    writeOutput: argv.includes("--write-output")
  };
}

function sourceFixtureFor(workflowPack?: string): string {
  return workflowPack ? WORKFLOW_SMOKE_PRESETS[workflowPack]?.sourceText ?? AI_BIOSECURITY_SOURCE_FIXTURE : AI_BIOSECURITY_SOURCE_FIXTURE;
}

function titleForSource(workflowPack: string | undefined, sourceText: string): string {
  if (workflowPack && WORKFLOW_SMOKE_PRESETS[workflowPack]) return WORKFLOW_SMOKE_PRESETS[workflowPack].title;
  if (/perturb|crispr|guide|single-cell|volcano/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["perturb-seq-crispr"].title;
  if (/spatial|visium|histology|segmentation|neighborhood|spot array/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["spatial-transcriptomics"].title;
  return WORKFLOW_SMOKE_PRESETS["ai-biosecurity-eval"].title;
}

function narrativeForSource(workflowPack: string | undefined, sourceText: string): string {
  if (workflowPack && WORKFLOW_SMOKE_PRESETS[workflowPack]) return WORKFLOW_SMOKE_PRESETS[workflowPack].narrative;
  if (/perturb|crispr|guide|single-cell|volcano/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["perturb-seq-crispr"].narrative;
  if (/spatial|visium|histology|segmentation|neighborhood|spot array/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["spatial-transcriptomics"].narrative;
  return WORKFLOW_SMOKE_PRESETS["ai-biosecurity-eval"].narrative;
}

function sourceNameForWorkflow(workflowPack: string | undefined, sourceText: string): string {
  if (workflowPack && WORKFLOW_SMOKE_PRESETS[workflowPack]) return WORKFLOW_SMOKE_PRESETS[workflowPack].sourceName;
  if (/perturb|crispr|guide|single-cell|volcano/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["perturb-seq-crispr"].sourceName;
  if (/spatial|visium|histology|segmentation|neighborhood|spot array/i.test(sourceText)) return WORKFLOW_SMOKE_PRESETS["spatial-transcriptomics"].sourceName;
  return WORKFLOW_SMOKE_PRESETS["ai-biosecurity-eval"].sourceName;
}

function agentTraceAssetIds(trace: JsonObject): string[] {
  return uniqueStrings([
    ...(((trace.compactIndex as JsonObject | undefined)?.assetIds as string[] | undefined) ?? []),
    ...(((trace.recommendation as JsonObject | undefined)?.assetIds as string[] | undefined) ?? []),
    ...(((trace.insertPlan as JsonObject[] | undefined) ?? []).map((item) => item.assetId).filter((value): value is string => typeof value === "string")),
    ...(((trace.references as JsonObject[] | undefined) ?? []).flatMap((reference) => (reference.assetIds as string[] | undefined) ?? []))
  ]);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runAgentAcceptanceSmoke(cliOptions(process.argv.slice(2)));
  console.log(JSON.stringify(result, null, 2));
}
