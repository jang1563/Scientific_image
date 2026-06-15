import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  addAsset,
  addNode,
  applyTemplate,
  createProject,
  deleteNode,
  listNodes,
  migrateProject,
  updateNode,
  validateProject,
  type Project,
  type SceneNode,
  type SceneOperation,
  type SourceDocumentKind
} from "../../../packages/scene/src/index.ts";
import { compactAssetSetRecommendation, createAssetBrief, createFlagshipWorkflowDemoNodes, createRealisticImageNode, createUploadAsset, createWorkflowFigureNodes, createWorkflowTemplateSpec, getAnyAsset, getAssetCoverageGapReport, getAssetOntology, getAssetQualityReport, getCommercialVisualAudit, getRealisticAssetGallery, getWorkflowPackExportSnapshot, getWorkflowPackGallery, getWorkflowPackQuality, getWorkflowPackVisualQaGallery, getWorkflowTemplate, getWorkflowTemplateQa, listAssets, listRealisticAssets, listWorkflowPacks, listWorkflowTemplates, recommendAssetSet, recommendAssetsForSlide, recommendWorkflowPack, renderPremiumAssetSvg, searchAssets } from "../../../packages/assets/src/index.ts";
import { createPlotNode, createPlotSpec, parseDelimited } from "../../../packages/plotting/src/index.ts";
import { exportProject } from "../../../packages/export/src/index.ts";
import { getAgentManifest, listAgentResources, readAgentResource } from "../../../packages/agent/src/index.ts";
import {
  approveDeckOutline,
  applyWorkflowFigureSlideMeta,
  applySceneOperations,
  createDeckOutline,
  generateDeckFromOutline,
  generateReviewItems,
  generateSlideFromBrief,
  importSource,
  recordAgentRun,
  refreshDeckReviewItems,
  resolveDeckReviewItem,
  resolveDeckReviewItems,
  reviseDeckOutline,
  summarizeAgentTrace,
  summarizeReviewQueue,
  validateDeck
} from "../../../packages/deck/src/index.ts";

const DATA_DIR = resolve(process.env.SCI_IMAGE_DATA_DIR ?? ".scientific-image/projects");
const DEFAULT_PORT = Number(process.env.PORT ?? 8787);

export interface ApiContext {
  dataDir: string;
}

export async function startServer(port = DEFAULT_PORT, context: ApiContext = { dataDir: DATA_DIR }) {
  await mkdir(context.dataDir, { recursive: true });
  const server = createServer((request, response) => {
    handleRequest(request, response, context).catch((error) => sendJson(response, 500, { error: error.message }));
  });
  await new Promise<void>((resolveReady) => server.listen(port, "127.0.0.1", resolveReady));
  return server;
}

export async function handleRequest(request: IncomingMessage, response: ServerResponse, context: ApiContext): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const parts = url.pathname.split("/").filter(Boolean);

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders());
    response.end();
    return;
  }

  if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/health") {
    if (request.method === "HEAD") {
      response.writeHead(200, {
        ...corsHeaders(),
        "content-type": "application/json; charset=utf-8"
      });
      response.end();
      return;
    }
    sendJson(response, 200, { ok: true, service: "scientific-image-api" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/agent/manifest") {
    sendJson(response, 200, { manifest: getAgentManifest() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/agent/resources") {
    sendJson(response, 200, { resources: listAgentResources() });
    return;
  }

  if (request.method === "GET" && parts[0] === "agent" && parts[1] === "resources" && parts[2]) {
    const resource = readAgentResource(parts.slice(2).join("/"));
    sendText(response, 200, resource.text, resource.mimeType);
    return;
  }

  if (parts[0] === "assets" && request.method === "POST" && parts[1] === "recommend") {
    const body = await readJson<{ title?: string; narrative?: string; layoutIntent?: string; sourceText?: string; styleProfile?: string; workflowPack?: string; limit?: number }>(request);
    sendJson(response, 200, { recommendations: recommendAssetsForSlide(body) });
    return;
  }

  if (parts[0] === "assets" && request.method === "POST" && parts[1] === "recommend-workflow-pack") {
    const body = await readJson<{ title?: string; narrative?: string; sourceText?: string; workflowPack?: string; limit?: number }>(request);
    sendJson(response, 200, { recommendations: recommendWorkflowPack(body) });
    return;
  }

  if (parts[0] === "assets" && request.method === "POST" && parts[1] === "recommend-asset-set") {
    const body = await readJson<{ title?: string; narrative?: string; layoutIntent?: string; sourceText?: string; styleProfile?: string; style?: string; workflowPack?: string; templateId?: string; semanticSlots?: string[]; panelRoles?: string[]; limit?: number; responseShape?: "compact" | "full" }>(request);
    const recommendation = recommendAssetSet({
      ...body,
      styleProfile: styleProfileFromBody(body)
    });
    sendJson(response, 200, { recommendation: body.responseShape === "compact" ? compactAssetSetRecommendation(recommendation) : recommendation });
    return;
  }

  if (parts[0] === "assets" && request.method === "POST" && parts[1] === "brief") {
    const body = await readJson<{ concept?: string; assetId?: string; workflowPack?: string; styleProfile?: string; qualityTarget?: string }>(request);
    sendJson(response, 200, { brief: createAssetBrief(body) });
    return;
  }

  if (parts[0] === "assets" && request.method === "POST" && parts[1] === "workflow-template-spec") {
    const body = await readJson<{ workflowPack: string; intent?: string; name?: string; layout?: Parameters<typeof createWorkflowTemplateSpec>[0]["layout"]; styleProfile?: string }>(request);
    sendJson(response, 200, { templateSpec: createWorkflowTemplateSpec(body) });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "coverage-gap-report") {
    sendJson(response, 200, { report: getAssetCoverageGapReport() });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "commercial-visual-audit") {
    sendJson(response, 200, {
      audit: getCommercialVisualAudit({
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "ontology") {
    sendJson(response, 200, {
      ontology: getAssetOntology({
        workflowPack: url.searchParams.get("workflowPack") ?? undefined,
        qualityTier: url.searchParams.get("qualityTier") ?? undefined,
        includeAssets: url.searchParams.get("includeAssets") === "false" ? false : undefined,
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-packs" && parts[2] && parts[3] === "gallery") {
    sendJson(response, 200, { gallery: getWorkflowPackGallery(parts[2], { styleProfile: styleProfileFromSearchParams(url.searchParams) }) });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-packs" && parts[2] && parts[3] === "visual-qa-gallery") {
    sendJson(response, 200, {
      gallery: getWorkflowPackVisualQaGallery(parts[2], {
        styleProfile: styleProfileFromSearchParams(url.searchParams),
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-packs" && parts[2] && parts[3] === "export-snapshot") {
    sendJson(response, 200, { snapshot: getWorkflowPackExportSnapshot(parts[2], { styleProfile: styleProfileFromSearchParams(url.searchParams) }) });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-packs" && parts[2] && parts[3] === "quality") {
    sendJson(response, 200, { quality: getWorkflowPackQuality(parts[2]) });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-packs") {
    sendJson(response, 200, { workflowPacks: listWorkflowPacks() });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-templates" && parts[2] && parts[3] === "qa") {
    sendJson(response, 200, {
      qa: getWorkflowTemplateQa(parts[2], {
        styleProfile: styleProfileFromSearchParams(url.searchParams),
        pageWidth: url.searchParams.has("pageWidth") ? Number(url.searchParams.get("pageWidth")) : undefined,
        pageHeight: url.searchParams.has("pageHeight") ? Number(url.searchParams.get("pageHeight")) : undefined
      })
    });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "workflow-templates") {
    sendJson(response, 200, { templates: listWorkflowTemplates({ workflowPack: url.searchParams.get("workflowPack") ?? undefined }) });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "quality-report") {
    sendJson(response, 200, { report: getAssetQualityReport() });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "realistic" && parts[2] === "gallery") {
    sendJson(response, 200, {
      gallery: getRealisticAssetGallery({
        workflowPack: url.searchParams.get("workflowPack") ?? undefined,
        styleProfile: styleProfileFromSearchParams(url.searchParams),
        limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined
      })
    });
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1] === "realistic") {
    sendJson(response, 200, {
      assets: listRealisticAssets({
        workflowPack: url.searchParams.get("workflowPack") ?? undefined,
        realismLevel: url.searchParams.get("realismLevel") ?? undefined,
        mediaType: url.searchParams.get("mediaType") ?? undefined,
        rightsStatus: url.searchParams.get("rightsStatus") ?? undefined,
        sourceAssetType: url.searchParams.get("sourceAssetType") ?? undefined
      })
    });
    return;
  }

	  if (parts[0] === "assets" && request.method === "GET" && parts[1] && parts[2] === "render") {
	    const svg = renderPremiumAssetSvg(parts[1], {
		      variant: (url.searchParams.get("variant") as Parameters<typeof renderPremiumAssetSvg>[1]["variant"]) ?? "soft-3d-vector",
		      styleProfile: styleProfileFromSearchParams(url.searchParams) as Parameters<typeof renderPremiumAssetSvg>[1]["styleProfile"],
		      width: Number(url.searchParams.get("width") ?? 160),
		      height: Number(url.searchParams.get("height") ?? 120),
	      appearance: assetAppearanceFromSearchParams(url.searchParams)
	    });
    response.writeHead(200, {
      ...corsHeaders(),
      "content-type": "image/svg+xml; charset=utf-8"
    });
    response.end(svg);
    return;
  }

  if (parts[0] === "assets" && request.method === "GET" && parts[1]) {
    sendJson(response, 200, { asset: getAnyAsset(parts[1]) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/assets") {
    const query = url.searchParams.get("query") ?? url.searchParams.get("q") ?? "";
    const results = searchAssets({
      query,
      category: url.searchParams.get("category") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      family: url.searchParams.get("family") ?? undefined,
      modality: url.searchParams.get("modality") ?? undefined,
	      riskDomain: url.searchParams.get("riskDomain") ?? undefined,
	      slideIntent: url.searchParams.get("slideIntent") ?? undefined,
	      styleProfile: styleProfileFromSearchParams(url.searchParams),
	      workflowPack: url.searchParams.get("workflowPack") ?? undefined,
	      qualityTier: url.searchParams.get("qualityTier") ?? undefined,
	      panelRole: url.searchParams.get("panelRole") ?? undefined,
	      semanticSlot: url.searchParams.get("semanticSlot") ?? undefined,
	      assetKind: url.searchParams.get("assetKind") ?? undefined,
	      mediaType: url.searchParams.get("mediaType") ?? undefined,
	      realismLevel: url.searchParams.get("realismLevel") ?? undefined,
	      rightsStatus: url.searchParams.get("rightsStatus") ?? undefined,
	      sourceAssetType: url.searchParams.get("sourceAssetType") ?? undefined,
	      limit: Number(url.searchParams.get("limit") ?? 200)
	    });
    sendJson(response, 200, { assets: results.map((result) => result.asset), results, count: listAssets().length });
    return;
  }

  if (request.method === "POST" && parts[0] === "exports" && parts[1]) {
    const body = await readJson<{ project: Project; pageId?: string; dpi?: number }>(request);
    const result = exportProject(migrateProject(body.project), {
      format: parts[1] as "svg" | "pdf" | "png" | "pptx" | "docx" | "json",
      pageId: body.pageId,
      dpi: body.dpi
    });
    sendExport(response, result);
    return;
  }

  if (request.method === "POST" && url.pathname === "/projects") {
    const body = await readJson<{ title?: string; kind?: "slide" | "figure" | "poster" }>(request);
    const project = createProject(body.title ?? "Untitled scientific visual", body.kind ?? "slide");
    await saveProject(project, context);
    sendJson(response, 201, { project });
    return;
  }

  if (parts[0] === "projects" && parts[1]) {
    const project = await loadProject(parts[1], context);

    if (request.method === "GET" && parts.length === 2) {
      sendJson(response, 200, { project });
      return;
    }

    if (request.method === "PUT" && parts.length === 2) {
      const body = await readJson<{ project: Project }>(request);
      await saveProject(body.project, context);
      sendJson(response, 200, { project: body.project });
      return;
    }

    if (request.method === "GET" && parts[2] === "nodes") {
      sendJson(response, 200, { nodes: listNodes(project, url.searchParams.get("pageId") ?? undefined) });
      return;
    }

    if (request.method === "POST" && parts[2] === "nodes") {
      const body = await readJson<{ node: SceneNode; pageId?: string }>(request);
      const next = addNode(project, body.node, body.pageId);
      await saveProject(next, context);
      sendJson(response, 201, { project: next, node: body.node });
      return;
    }

    if (request.method === "PATCH" && parts[2] === "nodes" && parts[3]) {
      const body = await readJson<{ patch: Partial<Omit<SceneNode, "id">>; pageId?: string }>(request);
      const next = updateNode(project, parts[3], body.patch, body.pageId);
      await saveProject(next, context);
      sendJson(response, 200, { project: next });
      return;
    }

    if (request.method === "DELETE" && parts[2] === "nodes" && parts[3]) {
      const next = deleteNode(project, parts[3], url.searchParams.get("pageId") ?? undefined);
      await saveProject(next, context);
      sendJson(response, 200, { project: next });
      return;
    }

    if (request.method === "POST" && parts[2] === "assets") {
      const body = await readJson<{ name: string; dataUri: string; source?: string; license?: string; citation?: string; creator?: string; tags?: string[] }>(request);
      const asset = createUploadAsset(body);
      const next = addAsset(project, asset);
      await saveProject(next, context);
      sendJson(response, 201, { project: next, asset });
      return;
    }

    if (request.method === "POST" && parts[2] === "realistic-images") {
      const body = await readJson<Parameters<typeof createRealisticImageNode>[0] & { pageId?: string; style?: string; workflowPack?: string }>(request);
      const asset = getAnyAsset(body.assetId);
      const styleProfile = styleProfileFromBody(body);
      const workflowPack = body.workflowPack ?? asset.workflowPacks[0];
      const node = createRealisticImageNode({ ...body, styleProfile: styleProfile as Parameters<typeof createRealisticImageNode>[0]["styleProfile"] });
      const withNode = addNode(project, node, body.pageId);
      const traced = recordAgentRun(withNode, {
        name: "Insert realistic asset",
        prompt: `Insert ${asset.name} (${asset.id}) as a provenance-tracked realistic asset.`,
        operations: [{ op: "add-node", pageId: body.pageId, nodeId: node.id, payload: { node } }],
        trace: {
          workflowPack,
          styleProfile,
          resourceUris: defaultAgentResourceUris(),
          toolSequence: ["get_asset_index", "recommend_asset_set", "insert_realistic_asset"],
          compactIndex: {
            filters: { workflowPack, styleProfile, assetKind: "realistic" },
            returnedAssets: 1,
            assetIds: [asset.id]
          },
          recommendation: {
            tool: "recommend_asset_set",
            responseShape: "compact",
            assetIds: [asset.id],
            insertPlanCount: 1
          },
          insertPlan: [{
            tool: "insert_realistic_asset",
            assetId: asset.id,
            styleProfile,
            nodeId: node.id
          }],
          generatedNodeIds: [node.id],
          references: [{
            kind: "insert-plan",
            id: `${asset.id}:${node.id}`,
            tool: "insert_realistic_asset",
            workflowPack,
            assetIds: [asset.id],
            nodeIds: [node.id],
            summary: "Realistic asset inserted as image fallback with provenance-aware export behavior."
          }]
        }
      });
      await saveProject(traced.project, context);
      sendJson(response, 201, { project: traced.project, node, agentRun: traced.agentRun });
      return;
    }

    if (request.method === "POST" && parts[2] === "plots") {
      const body = await readJson<{
        tableText: string;
        delimiter?: "," | "\t";
        plotType: "scatter" | "embedding-scatter" | "volcano" | "heatmap" | "box" | "violin" | "dot" | "bar" | "line";
        encodings: Record<string, string>;
        title?: string;
        pageId?: string;
      }>(request);
      const table = parseDelimited(body.tableText, { delimiter: body.delimiter, name: body.title ?? "Imported table" });
      const spec = createPlotSpec({ plotType: body.plotType, table, encodings: body.encodings, title: body.title });
      const node = createPlotNode({ spec });
      const next = addNode(project, node, body.pageId);
      await saveProject(next, context);
      sendJson(response, 201, { project: next, node, spec });
      return;
    }

    if (request.method === "POST" && parts[2] === "sources") {
      const body = await readJson<{
        kind: SourceDocumentKind;
        name: string;
        text?: string;
        dataUri?: string;
        mimeType?: string;
        citation?: string;
        source?: string;
        license?: string;
      }>(request);
      const result = importSource(project, body);
      await saveProject(result.project, context);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "outline" && parts[4] === "approve") {
      const next = approveDeckOutline(project);
      await saveProject(next, context);
      sendJson(response, 200, { project: next, outline: next.deck.outline });
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "outline" && parts.length === 4) {
      const body = await readJson<{ title?: string; audience?: string; goal?: string; slideCount?: number; sourceIds?: string[] }>(request);
      const result = createDeckOutline(project, body);
      await saveProject(result.project, context);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === "PATCH" && parts[2] === "deck" && parts[3] === "outline") {
      const body = await readJson<{ instructions: string }>(request);
      const result = reviseDeckOutline(project, body.instructions);
      await saveProject(result.project, context);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "generate") {
      const result = generateDeckFromOutline(project);
      await saveProject(result.project, context);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "slides" && parts[4] && parts[5] === "generate") {
      const result = generateSlideFromBrief(project, parts[4]);
      await saveProject(result.project, context);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "operations") {
      const body = await readJson<{ operations: SceneOperation[] }>(request);
      const next = applySceneOperations(project, body.operations ?? []);
      await saveProject(next, context);
      sendJson(response, 200, { project: next });
      return;
    }

    if (request.method === "GET" && parts[2] === "deck" && parts[3] === "review") {
      sendJson(response, 200, { reviewItems: project.deck.reviewItems.length ? project.deck.reviewItems : generateReviewItems(project) });
      return;
    }

    if (request.method === "GET" && parts[2] === "deck" && parts[3] === "review-summary") {
      sendJson(response, 200, { summary: summarizeReviewQueue(project) });
      return;
    }

    if (request.method === "GET" && parts[2] === "deck" && parts[3] === "agent-trace") {
      sendJson(response, 200, { report: summarizeAgentTrace(project, { limit: Number(url.searchParams.get("limit") ?? 12) }) });
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "review" && parts.length === 4) {
      const next = refreshDeckReviewItems(project);
      await saveProject(next, context);
      sendJson(response, 200, { project: next, reviewItems: next.deck.reviewItems, summary: summarizeReviewQueue(next) });
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "review" && parts[4] === "resolve") {
      const body = await readJson<{ reviewItemIds?: string[]; status?: "resolved" | "accepted-risk" }>(request);
      const next = resolveDeckReviewItems(project, body.reviewItemIds ?? [], body.status ?? "resolved");
      await saveProject(next, context);
      sendJson(response, 200, { project: next, reviewItems: next.deck.reviewItems, summary: summarizeReviewQueue(next) });
      return;
    }

    if (request.method === "PATCH" && parts[2] === "deck" && parts[3] === "review" && parts[4]) {
      const body = await readJson<{ status?: "resolved" | "accepted-risk" }>(request);
      const next = resolveDeckReviewItem(project, parts[4], body.status ?? "resolved");
      await saveProject(next, context);
      sendJson(response, 200, { project: next, reviewItems: next.deck.reviewItems, summary: summarizeReviewQueue(next) });
      return;
    }

    if (request.method === "POST" && parts[2] === "deck" && parts[3] === "validate") {
      sendJson(response, 200, { validation: validateDeck(project) });
      return;
    }

	    if (request.method === "POST" && parts[2] === "templates" && parts[3]) {
	      const next = applyTemplate(project, parts[3] as "perturb-seq-workflow" | "ai-biosecurity-pipeline");
	      await saveProject(next, context);
	      sendJson(response, 200, { project: next });
	      return;
	    }

	    if (request.method === "POST" && parts[2] === "workflow-packs" && parts[3] && parts[4] === "flagship-demo") {
	      const body = await readJson<{ styleProfile?: Parameters<typeof createFlagshipWorkflowDemoNodes>[0]["styleProfile"]; style?: string; x?: number; y?: number; width?: number; stepCount?: number; pageId?: string }>(request);
	      const workflowPack = parts[3];
	      const styleProfile = styleProfileFromBody(body);
	      const nodes = createFlagshipWorkflowDemoNodes({
	        workflowPack,
	        styleProfile: styleProfile as Parameters<typeof createFlagshipWorkflowDemoNodes>[0]["styleProfile"],
	        x: body.x,
	        y: body.y,
	        width: body.width,
	        stepCount: body.stepCount
	      });
	      const withNodes = nodes.reduce((current, node) => addNode(current, node, body.pageId), project);
	      const withMeta = applyWorkflowFigureSlideMeta(withNodes, { pageId: body.pageId, workflowPack, mode: "flagship-demo" });
	      const reviewed = refreshDeckReviewItems(withMeta);
	      const assetIds = assetIdsFromNodes(nodes);
	      const traced = recordAgentRun(reviewed, {
	        name: "Create flagship workflow demo",
	        prompt: `Create flagship demo for ${workflowPack}.`,
	        operations: nodes.map((node) => ({ op: "add-node", pageId: body.pageId, nodeId: node.id, payload: { node } })),
	        trace: {
	          workflowPack,
	          styleProfile,
	          resourceUris: defaultAgentResourceUris(),
	          toolSequence: ["get_workflow_pack_gallery", "create_flagship_workflow_demo", "validate_deck", "export_pack_qa_report"],
	          compactIndex: {
	            filters: { workflowPack, styleProfile },
	            returnedAssets: assetIds.length,
	            assetIds
	          },
	          recommendation: {
	            tool: "recommend_asset_set",
	            responseShape: "compact",
	            assetIds,
	            insertPlanCount: nodes.length
	          },
	          insertPlan: nodes.map((node) => ({
	            tool: "insert_premium_asset",
	            assetId: assetIdFromNode(node) ?? node.id,
	            semanticRole: semanticRoleFromNode(node),
	            layoutHint: layoutHintFromNode(node),
	            styleProfile,
	            nodeId: node.id
	          })),
	          generatedNodeIds: nodes.map((node) => node.id),
	          references: [{
	            kind: "template",
	            id: `${workflowPack}:flagship-demo`,
	            tool: "create_flagship_workflow_demo",
	            workflowPack,
	            assetIds,
	            nodeIds: nodes.map((node) => node.id),
	            summary: "Flagship demo generated as editable scene nodes from the workflow pack."
	          }]
	        }
	      });
	      await saveProject(traced.project, context);
	      sendJson(response, 201, { project: traced.project, nodes, reviewItems: traced.project.deck.reviewItems, agentRun: traced.agentRun });
	      return;
	    }

	    if (request.method === "POST" && parts[2] === "workflow-figures") {
	      const body = await readJson<{ workflowPack?: string; templateId?: string; styleProfile?: Parameters<typeof createWorkflowFigureNodes>[0]["styleProfile"]; style?: string; x?: number; y?: number; width?: number; stepCount?: number; pageId?: string }>(request);
	      const template = body.templateId ? getWorkflowTemplate(body.templateId) : undefined;
	      const workflowPack = body.workflowPack ?? template?.workflowPack;
	      const styleProfile = styleProfileFromBody(body);
	      const nodes = createWorkflowFigureNodes({ ...body, workflowPack, styleProfile: styleProfile as Parameters<typeof createWorkflowFigureNodes>[0]["styleProfile"] });
	      const withNodes = nodes.reduce((current, node) => addNode(current, node, body.pageId), project);
	      const withMeta = applyWorkflowFigureSlideMeta(withNodes, { pageId: body.pageId, workflowPack, templateId: body.templateId, mode: "workflow-figure" });
	      const reviewed = refreshDeckReviewItems(withMeta);
	      const assetIds = assetIdsFromNodes(nodes);
	      const traced = recordAgentRun(reviewed, {
	        name: "Create workflow figure",
	        prompt: `Create editable workflow figure${body.templateId ? ` from template ${body.templateId}` : ""}${workflowPack ? ` for ${workflowPack}` : ""}.`,
	        operations: nodes.map((node) => ({ op: "add-node", pageId: body.pageId, nodeId: node.id, payload: { node } })),
	        trace: {
	          workflowPack,
	          templateId: body.templateId,
	          styleProfile,
	          resourceUris: defaultAgentResourceUris(),
	          toolSequence: ["get_asset_index", "get_workflow_pack_gallery", "get_workflow_template_qa", "create_workflow_figure", "validate_deck", "export_pack_qa_report"],
	          compactIndex: {
	            filters: { workflowPack, templateId: body.templateId, styleProfile },
	            returnedAssets: assetIds.length,
	            assetIds
	          },
	          recommendation: {
	            tool: "recommend_asset_set",
	            responseShape: "compact",
	            assetIds,
	            insertPlanCount: nodes.length
	          },
	          insertPlan: nodes.map((node) => ({
	            tool: "insert_premium_asset",
	            assetId: assetIdFromNode(node) ?? node.id,
	            semanticRole: semanticRoleFromNode(node),
	            layoutHint: layoutHintFromNode(node),
	            styleProfile,
	            nodeId: node.id
	          })),
	          generatedNodeIds: nodes.map((node) => node.id),
	          references: [{
	            kind: "template",
	            id: body.templateId ?? workflowPack ?? "workflow-figure",
	            tool: "create_workflow_figure",
	            workflowPack,
	            templateId: body.templateId,
	            assetIds,
	            nodeIds: nodes.map((node) => node.id),
	            summary: "Workflow figure generated as editable scene nodes from pack/template recipe."
	          }]
	        }
	      });
	      await saveProject(traced.project, context);
	      sendJson(response, 201, { project: traced.project, nodes, reviewItems: traced.project.deck.reviewItems, agentRun: traced.agentRun });
	      return;
	    }

    if (request.method === "POST" && parts[2] === "validate") {
      sendJson(response, 200, { validation: validateProject(project) });
      return;
    }

    if (request.method === "GET" && parts[2] === "export" && parts[3]) {
      const result = exportProject(project, {
	        format: parts[3] as "svg" | "pdf" | "png" | "pptx" | "docx" | "json",
        pageId: url.searchParams.get("pageId") ?? undefined,
        dpi: Number(url.searchParams.get("dpi") ?? 144)
      });
      sendExport(response, result);
      return;
    }
  }

  sendJson(response, 404, { error: "Route not found." });
}

function defaultAgentResourceUris(): string[] {
  return [
    "scientific-image://agent/manifest",
    "scientific-image://agent/asset-index-compact",
    "scientific-image://agent/agent-cookbook"
  ];
}

function assetIdsFromNodes(nodes: SceneNode[]): string[] {
  return Array.from(new Set(nodes.map(assetIdFromNode).filter((assetId): assetId is string => Boolean(assetId))));
}

function assetIdFromNode(node: SceneNode): string | undefined {
  const assetId = nodePayloadObject(node).assetId;
  return typeof assetId === "string" && assetId.trim() ? assetId : undefined;
}

function semanticRoleFromNode(node: SceneNode): string | undefined {
  const semanticRole = nodePayloadObject(node).semanticRole;
  return typeof semanticRole === "string" && semanticRole.trim() ? semanticRole : undefined;
}

function layoutHintFromNode(node: SceneNode): string | undefined {
  const layoutHint = nodePayloadObject(node).layoutHint;
  return typeof layoutHint === "string" && layoutHint.trim() ? layoutHint : undefined;
}

function nodePayloadObject(node: SceneNode): Record<string, unknown> {
  return typeof node.payload === "object" && node.payload !== null ? node.payload as Record<string, unknown> : {};
}

function styleProfileFromBody(body: { styleProfile?: string; style?: string }): string | undefined {
  return body.styleProfile ?? body.style ?? undefined;
}

function assetAppearanceFromSearchParams(params: URLSearchParams): Parameters<typeof renderPremiumAssetSvg>[1]["appearance"] {
  return Object.fromEntries([
    ["accent", params.get("accent") ?? undefined],
    ["secondary", params.get("secondary") ?? undefined],
    ["fill", params.get("fill") ?? undefined],
	    ["stroke", params.get("stroke") ?? undefined],
	    ["labelColor", params.get("labelColor") ?? undefined],
	    ["strokeWidth", params.has("strokeWidth") ? Number(params.get("strokeWidth")) : undefined],
	    ["styleProfile", params.get("styleProfile") ?? undefined],
	    ["detailLevel", params.get("detailLevel") ?? undefined]
	  ].filter(([, value]) => value !== undefined));
}

function styleProfileFromSearchParams(params: URLSearchParams): string | undefined {
  return params.get("styleProfile") ?? params.get("style") ?? undefined;
}

async function saveProject(project: Project, context: ApiContext): Promise<void> {
  await mkdir(context.dataDir, { recursive: true });
  await writeFile(join(context.dataDir, `${project.id}.json`), JSON.stringify(project, null, 2));
}

async function loadProject(projectId: string, context: ApiContext): Promise<Project> {
  const raw = await readFile(join(context.dataDir, `${projectId}.json`), "utf8");
  return migrateProject(JSON.parse(raw) as Project);
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) as T : {} as T;
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    ...corsHeaders(),
    "content-type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response: ServerResponse, status: number, payload: string, contentType: string): void {
  response.writeHead(status, {
    ...corsHeaders(),
    "content-type": `${contentType}; charset=utf-8`
  });
  response.end(payload);
}

function sendExport(response: ServerResponse, result: ReturnType<typeof exportProject>): void {
  response.writeHead(200, {
    ...corsHeaders(),
    "content-type": result.mime,
    "content-disposition": `attachment; filename="${result.filename}"`,
    "x-scientific-image-warnings": encodeURIComponent(JSON.stringify(result.warnings))
  });
  response.end(result.data);
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-expose-headers": "content-disposition,x-scientific-image-warnings"
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = await startServer();
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : DEFAULT_PORT;
  console.log(`Scientific Image API listening on http://127.0.0.1:${port}`);
}
