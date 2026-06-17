import { stdin, stdout } from "node:process";
import {
  addNode,
  applyTemplate,
  createProject,
  listNodes,
  migrateProject,
  validateProject,
  type Project,
  type SceneNode,
  type SceneOperation,
  type SourceDocumentKind
} from "../../scene/src/index.ts";
import { compactAssetSearchResults, compactAssetSetRecommendation, createAssetBrief, createCuratedSymbolNode, createFlagshipWorkflowDemoNodes, createRealisticImageNode, createWorkflowFigureNodes, createWorkflowTemplateSpec, getAnyAsset, getAssetCoverageGapReport, getAssetIndex, getAssetOntology, getAssetQualityReport, getCommercialVisualAudit, getJournalFigureQa, getRealisticAssetGallery, getWorkflowPackExportSnapshot, getWorkflowPackGallery, getWorkflowPackQuality, getWorkflowPackVisualQaGallery, getWorkflowTemplate, getWorkflowTemplateQa, listWorkflowPacks, listWorkflowTemplates, recommendAssetSet, recommendAssetsForSlide, recommendWorkflowPack, renderPremiumAssetSvg, searchAssets } from "../../assets/src/index.ts";
import { createPlotNode, createPlotSpec, parseDelimited } from "../../plotting/src/index.ts";
import { exportProject } from "../../export/src/index.ts";
import { getAgentManifest, listAgentResources, readAgentResource } from "../../agent/src/index.ts";
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
  summarizeReviewQueue,
  validateDeck
} from "../../deck/src/index.ts";

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number; method: string; params?: Record<string, unknown> };
type JsonRpcResponse = { jsonrpc: "2.0"; id?: string | number; result?: unknown; error?: { code: number; message: string } };

const projects = new Map<string, Project>();

const tools = [
  {
    name: "get_agent_manifest",
    description: "Return the agent-facing manifest with recommended MCP workflows, guardrails, workflow packs, and client resources.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "read_agent_resource",
    description: "Read one agent onboarding resource by URI or short ID for clients that do not support MCP resources/read.",
    inputSchema: {
      type: "object",
      required: ["uri"],
      properties: {
        uri: { type: "string" }
      }
    }
  },
  {
    name: "create_project",
    description: "Create a local-first scientific visual project.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        kind: { type: "string", enum: ["slide", "figure", "poster"] }
      }
    }
  },
  {
    name: "add_curated_symbol",
    description: "Add a curated biology or AI symbol node to a project page.",
    inputSchema: {
      type: "object",
      required: ["projectId", "assetId", "x", "y"],
      properties: {
        projectId: { type: "string" },
        assetId: { type: "string" },
	        label: { type: "string" },
	        variant: { type: "string" },
	        appearance: { type: "object" },
	        accent: { type: "string" },
	        secondary: { type: "string" },
	        fill: { type: "string" },
	        stroke: { type: "string" },
	        strokeWidth: { type: "number" },
	        labelColor: { type: "string" },
	        x: { type: "number" },
	        y: { type: "number" },
	        width: { type: "number" },
        height: { type: "number" }
      }
    }
  },
  {
    name: "add_node",
    description: "Add a fully specified scene node to a project.",
    inputSchema: {
      type: "object",
      required: ["projectId", "node"],
      properties: {
        projectId: { type: "string" },
        node: { type: "object" },
        pageId: { type: "string" }
      }
    }
  },
  {
    name: "import_plot",
    description: "Import CSV/TSV text and add an editable PlotSpec scene node.",
    inputSchema: {
      type: "object",
      required: ["projectId", "tableText", "plotType", "encodings"],
      properties: {
        projectId: { type: "string" },
        tableText: { type: "string" },
        delimiter: { type: "string", enum: [",", "\t"] },
        plotType: { type: "string" },
        encodings: { type: "object" },
        title: { type: "string" }
      }
    }
  },
  {
    name: "apply_template",
    description: "Apply a built-in scientific communication template.",
    inputSchema: {
      type: "object",
      required: ["projectId", "template"],
      properties: {
        projectId: { type: "string" },
        template: { type: "string", enum: ["perturb-seq-workflow", "ai-biosecurity-pipeline"] }
      }
    }
  },
  {
    name: "list_nodes",
    description: "List nodes on a project page.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" }
      }
    }
  },
  {
    name: "validate_project",
    description: "Validate scene graph, provenance, and scientific claim flags.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" }
      }
    }
  },
  {
    name: "export_project",
    description: "Export a project page as SVG, PDF, PPTX, PNG placeholder, or JSON.",
    inputSchema: {
      type: "object",
      required: ["projectId", "format"],
      properties: {
        projectId: { type: "string" },
        format: { type: "string", enum: ["svg", "pdf", "pptx", "docx", "png", "json"] },
        pageId: { type: "string" }
      }
    }
  },
  {
    name: "import_source",
    description: "Import markdown, PDF-extracted text, image, or table source with provenance for deck generation.",
    inputSchema: {
      type: "object",
      required: ["projectId", "kind", "name"],
      properties: {
        projectId: { type: "string" },
        kind: { type: "string", enum: ["markdown", "pdf-text", "image", "table"] },
        name: { type: "string" },
        text: { type: "string" },
        dataUri: { type: "string" },
        mimeType: { type: "string" },
        citation: { type: "string" }
      }
    }
  },
  {
    name: "create_deck_outline",
    description: "Create an outline-first scientific slide deck plan from imported sources.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" },
        title: { type: "string" },
        audience: { type: "string" },
        goal: { type: "string" },
        slideCount: { type: "number" },
        sourceIds: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "revise_deck_outline",
    description: "Revise an existing deck outline with user instructions.",
    inputSchema: {
      type: "object",
      required: ["projectId", "instructions"],
      properties: {
        projectId: { type: "string" },
        instructions: { type: "string" }
      }
    }
  },
  {
    name: "generate_slide_from_brief",
    description: "Generate one editable slide from an approved slide brief.",
    inputSchema: {
      type: "object",
      required: ["projectId", "briefId"],
      properties: {
        projectId: { type: "string" },
        briefId: { type: "string" }
      }
    }
  },
  {
    name: "generate_deck_from_outline",
    description: "Approve if requested and generate editable slides for the whole outline.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" },
        approve: { type: "boolean" }
      }
    }
  },
  {
    name: "apply_scene_operations",
    description: "Apply deterministic scene operations generated by an agent.",
    inputSchema: {
      type: "object",
      required: ["projectId", "operations"],
      properties: {
        projectId: { type: "string" },
        operations: { type: "array", items: { type: "object" } }
      }
    }
  },
  {
    name: "validate_deck",
    description: "Validate a deck, including scene graph, claims, provenance, layout, accessibility, and export warnings.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" }
      }
    }
  },
  {
    name: "list_review_items",
    description: "List current deck review queue items.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" }
      }
    }
  },
  {
    name: "summarize_review_queue",
    description: "Summarize open review items into delivery readiness, next action, claim review, export fallback, and human decision queues.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" }
      }
    }
  },
  {
    name: "resolve_review_item",
    description: "Resolve or accept risk for one review item.",
    inputSchema: {
      type: "object",
      required: ["projectId", "reviewItemId"],
      properties: {
        projectId: { type: "string" },
        reviewItemId: { type: "string" },
        status: { type: "string", enum: ["resolved", "accepted-risk"] }
      }
    }
  },
  {
    name: "resolve_review_items",
    description: "Resolve or accept risk for multiple review queue items after human approval.",
    inputSchema: {
      type: "object",
      required: ["projectId", "reviewItemIds"],
      properties: {
        projectId: { type: "string" },
        reviewItemIds: { type: "array", items: { type: "string" } },
        status: { type: "string", enum: ["resolved", "accepted-risk"] }
      }
    }
  },
  {
    name: "export_deck",
    description: "Export the full deck as PPTX, PDF, SVG, PNG placeholder, or JSON.",
    inputSchema: {
      type: "object",
      required: ["projectId", "format"],
      properties: {
        projectId: { type: "string" },
        format: { type: "string", enum: ["svg", "pdf", "pptx", "docx", "png", "json"] }
      }
    }
  },
  {
    name: "get_asset_index",
    description: "Return a compact insert-ready asset index for MCP agents. Use this before full ontology when selecting assets.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        workflowPack: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        qualityTier: { type: "string" },
        semanticSlot: { type: "string" },
        panelRole: { type: "string" },
        assetKind: { type: "string", enum: ["vector", "realistic", "symbol", "image", "hybrid"] },
        responseShape: { type: "string", enum: ["compact"] },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "search_assets",
    description: "Semantic search over premium structured SVG assets plus provenance-tracked scientific editorial realistic image assets.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        role: { type: "string" },
        family: { type: "string" },
        modality: { type: "string" },
        riskDomain: { type: "string" },
        slideIntent: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        workflowPack: { type: "string" },
        qualityTier: { type: "string" },
        panelRole: { type: "string" },
        semanticSlot: { type: "string" },
        assetKind: { type: "string", enum: ["vector", "realistic", "symbol", "image", "hybrid"] },
        mediaType: { type: "string" },
        realismLevel: { type: "string" },
        rightsStatus: { type: "string" },
        sourceAssetType: { type: "string" },
        responseShape: { type: "string", enum: ["compact", "full"] },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "list_workflow_packs",
    description: "List premium workflow packs for pack-aware scientific figure generation.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "list_workflow_templates",
    description: "List premium workflow figure templates with preview assets, layout intent, agent hints, and QA checklist.",
    inputSchema: {
      type: "object",
      properties: {
        workflowPack: { type: "string" }
      }
    }
  },
  {
    name: "get_workflow_pack_gallery",
    description: "Return a premium workflow-pack gallery with assets, templates, flagship demo metadata, compact SVG preview, and QA status.",
    inputSchema: {
      type: "object",
      required: ["workflowPack"],
      properties: {
        workflowPack: { type: "string" },
        styleProfile: { type: "string" }
      }
    }
  },
  {
    name: "get_workflow_pack_export_snapshot",
    description: "Return workflow-pack export snapshot QA across SVG, PDF, PPTX, and DOCX, including exact PPTX fallback assets and next actions.",
    inputSchema: {
      type: "object",
      required: ["workflowPack"],
      properties: {
        workflowPack: { type: "string" },
        styleProfile: { type: "string" }
      }
    }
  },
  {
    name: "get_workflow_template_qa",
    description: "Return bounds, provenance, claim, text-fit, and export fallback QA for one premium workflow template.",
    inputSchema: {
      type: "object",
      required: ["templateId"],
      properties: {
        templateId: { type: "string" },
        styleProfile: { type: "string" },
        pageWidth: { type: "number" },
        pageHeight: { type: "number" }
      }
    }
  },
  {
    name: "get_journal_figure_qa",
    description: "Return manuscript/journal-safe figure QA for one workflow template, including publication-line styling, plot metadata, provenance, and export-readiness issues.",
    inputSchema: {
      type: "object",
      required: ["templateId"],
      properties: {
        templateId: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        pageWidth: { type: "number" },
        pageHeight: { type: "number" }
      }
    }
  },
  {
    name: "get_asset_quality_report",
    description: "Return benchmark-driven coverage, quality, style, workflow-pack, and priority-gap report for the premium scientific asset system.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_commercial_visual_audit",
    description: "Return the stricter commercial visual audit that flags premium-label inflation, panel-heavy assets, and factory-like flagship templates.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number" }
      }
    }
  },
  {
    name: "get_asset_ontology",
    description: "Return agent-facing asset ontology with style profiles, quality tiers, workflow packs, semantic slots, and compact asset contracts.",
    inputSchema: {
      type: "object",
      properties: {
        workflowPack: { type: "string" },
        qualityTier: { type: "string" },
        includeAssets: { type: "boolean" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "get_coverage_gap_report",
    description: "Return the 12-month premium asset coverage roadmap, current gaps, planned workflow packs, acceptance gates, and next actions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "create_asset_brief",
    description: "Create a deterministic premium asset brief for an existing asset or new concept, including semantic contract, recipe design, QA, and export rules.",
    inputSchema: {
      type: "object",
      properties: {
        concept: { type: "string" },
        assetId: { type: "string" },
        workflowPack: { type: "string" },
        styleProfile: { type: "string" },
        qualityTarget: { type: "string" }
      }
    }
  },
  {
    name: "recommend_workflow_pack",
    description: "Rank workflow packs for a scientific slide/deck intent before selecting individual assets.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        narrative: { type: "string" },
        sourceText: { type: "string" },
        workflowPack: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "recommend_asset_set",
    description: "Return grouped asset recommendations for a slide brief, organized by semantic slot and panel role.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        narrative: { type: "string" },
        layoutIntent: { type: "string" },
        sourceText: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        workflowPack: { type: "string" },
        templateId: { type: "string" },
        semanticSlots: { type: "array", items: { type: "string" } },
        panelRoles: { type: "array", items: { type: "string" } },
        responseShape: { type: "string", enum: ["compact", "full"] },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "create_workflow_template",
    description: "Create a deterministic workflow template spec proposal for a pack and intent. This does not mutate the registry.",
    inputSchema: {
      type: "object",
      required: ["workflowPack"],
      properties: {
        workflowPack: { type: "string" },
        intent: { type: "string" },
        name: { type: "string" },
        layout: { type: "string" },
        styleProfile: { type: "string" }
      }
    }
  },
  {
    name: "validate_asset_pack",
    description: "Validate one workflow pack for quality coverage, visual QA preview, missing metadata, and export-readiness risks.",
    inputSchema: {
      type: "object",
      required: ["workflowPack"],
      properties: {
        workflowPack: { type: "string" },
        styleProfile: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "export_pack_qa_report",
    description: "Return workflow pack export QA plus visual QA gallery metadata; use before SVG/PDF/PPTX/DOCX delivery.",
    inputSchema: {
      type: "object",
      required: ["workflowPack"],
      properties: {
        workflowPack: { type: "string" },
        styleProfile: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "get_realistic_asset_gallery",
    description: "Return the scientific editorial realistic asset gallery with provenance, style, and QA checks.",
    inputSchema: {
      type: "object",
      properties: {
        workflowPack: { type: "string" },
        styleProfile: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "get_asset",
    description: "Get complete metadata for one vector or realistic library asset.",
    inputSchema: {
      type: "object",
      required: ["assetId"],
      properties: {
        assetId: { type: "string" }
      }
    }
  },
  {
    name: "render_asset_preview",
    description: "Render one vector or realistic asset as an export-safe SVG preview.",
    inputSchema: {
      type: "object",
      required: ["assetId"],
      properties: {
		        assetId: { type: "string" },
		        variant: { type: "string" },
		        styleProfile: { type: "string" },
		        style: { type: "string" },
		        detailLevel: { type: "string" },
		        appearance: { type: "object" },
	        accent: { type: "string" },
	        secondary: { type: "string" },
	        fill: { type: "string" },
	        stroke: { type: "string" },
	        strokeWidth: { type: "number" },
	        labelColor: { type: "string" },
	        width: { type: "number" },
	        height: { type: "number" }
	      }
    }
  },
  {
    name: "recommend_assets_for_slide",
    description: "Recommend relevant assets for a slide title, narrative, layout intent, or source text.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        narrative: { type: "string" },
        layoutIntent: { type: "string" },
        sourceText: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        workflowPack: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "insert_premium_asset",
    description: "Insert a premium vector asset or realistic editorial image asset into a project page.",
    inputSchema: {
      type: "object",
      required: ["projectId", "assetId", "x", "y"],
      properties: {
        projectId: { type: "string" },
        assetId: { type: "string" },
        pageId: { type: "string" },
		        label: { type: "string" },
		        variant: { type: "string" },
		        styleProfile: { type: "string" },
		        style: { type: "string" },
		        detailLevel: { type: "string" },
		        semanticRole: { type: "string" },
		        layoutHint: { type: "string" },
		        appearance: { type: "object" },
	        accent: { type: "string" },
	        secondary: { type: "string" },
	        fill: { type: "string" },
	        stroke: { type: "string" },
	        strokeWidth: { type: "number" },
	        labelColor: { type: "string" },
	        x: { type: "number" },
	        y: { type: "number" },
	        width: { type: "number" },
        height: { type: "number" }
      }
    }
  },
  {
    name: "insert_realistic_asset",
    description: "Insert a scientific editorial realistic image asset into a project page by assetId, crop, mask, style profile, and appearance.",
    inputSchema: {
      type: "object",
      required: ["projectId", "assetId", "x", "y"],
      properties: {
        projectId: { type: "string" },
        assetId: { type: "string" },
        pageId: { type: "string" },
        label: { type: "string" },
        styleProfile: { type: "string" },
        style: { type: "string" },
        appearance: { type: "object" },
        crop: { type: "object" },
        mask: { type: "object" },
        captionAnchor: { type: "string" },
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        height: { type: "number" }
      }
    }
  },
  {
    name: "create_workflow_figure",
    description: "Create an editable workflow figure from a premium workflow pack or exact workflow template.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: {
        projectId: { type: "string" },
        workflowPack: { type: "string" },
        templateId: { type: "string" },
        pageId: { type: "string" },
        styleProfile: { type: "string" },
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        stepCount: { type: "number" }
      }
    }
  },
  {
    name: "create_flagship_workflow_demo",
    description: "Create the flagship editable demo figure for a premium workflow pack.",
    inputSchema: {
      type: "object",
      required: ["projectId", "workflowPack"],
      properties: {
        projectId: { type: "string" },
        workflowPack: { type: "string" },
        pageId: { type: "string" },
        styleProfile: { type: "string" },
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        stepCount: { type: "number" }
      }
    }
  }
];

export async function handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  try {
    if (request.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, resources: {} },
          serverInfo: { name: "scientific-image-mcp", version: "0.1.0" }
        }
      };
    }
    if (request.method === "tools/list") {
      return { jsonrpc: "2.0", id: request.id, result: { tools } };
    }
    if (request.method === "resources/list") {
      return { jsonrpc: "2.0", id: request.id, result: { resources: listAgentResources() } };
    }
    if (request.method === "resources/read") {
      const resource = readAgentResource(String(request.params?.uri ?? ""));
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          contents: [{
            uri: resource.uri,
            mimeType: resource.mimeType,
            text: resource.text
          }]
        }
      };
    }
    if (request.method === "tools/call") {
      const params = request.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await callTool(name, args);
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        }
      };
    }
    if (request.method === "notifications/initialized") {
      return { jsonrpc: "2.0", id: request.id, result: {} };
    }
    return { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: `Method not found: ${request.method}` } };
  } catch (error) {
    return { jsonrpc: "2.0", id: request.id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) } };
  }
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "get_agent_manifest") {
    return { manifest: getAgentManifest(), resources: listAgentResources() };
  }
  if (name === "read_agent_resource") {
    return { resource: readAgentResource(String(args.uri)) };
  }
  if (name === "create_project") {
    const project = createProject(String(args.title ?? "Untitled scientific visual"), (args.kind as "slide" | "figure" | "poster") ?? "slide");
    projects.set(project.id, project);
    return { project };
  }
  if (name === "get_asset_index") {
    return {
      index: getAssetIndex({
        query: args.query ? String(args.query) : undefined,
        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
        styleProfile: styleProfileArg(args),
        qualityTier: args.qualityTier ? String(args.qualityTier) : undefined,
        semanticSlot: args.semanticSlot ? String(args.semanticSlot) : undefined,
        panelRole: args.panelRole ? String(args.panelRole) : undefined,
        assetKind: args.assetKind ? String(args.assetKind) : undefined,
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "search_assets") {
    const results = searchAssets({
      query: args.query ? String(args.query) : undefined,
      category: args.category ? String(args.category) : undefined,
      role: args.role ? String(args.role) : undefined,
	      family: args.family ? String(args.family) : undefined,
	      modality: args.modality ? String(args.modality) : undefined,
	      riskDomain: args.riskDomain ? String(args.riskDomain) : undefined,
	      slideIntent: args.slideIntent ? String(args.slideIntent) : undefined,
	      styleProfile: styleProfileArg(args),
	      workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
	      qualityTier: args.qualityTier ? String(args.qualityTier) : undefined,
	      panelRole: args.panelRole ? String(args.panelRole) : undefined,
	      semanticSlot: args.semanticSlot ? String(args.semanticSlot) : undefined,
	      assetKind: args.assetKind ? String(args.assetKind) : undefined,
	      mediaType: args.mediaType ? String(args.mediaType) : undefined,
	      realismLevel: args.realismLevel ? String(args.realismLevel) : undefined,
	      rightsStatus: args.rightsStatus ? String(args.rightsStatus) : undefined,
	      sourceAssetType: args.sourceAssetType ? String(args.sourceAssetType) : undefined,
	      limit: args.limit === undefined ? undefined : Number(args.limit)
	    });
    return {
      results: responseShapeArg(args) === "compact" ? compactAssetSearchResults(results) : results
    };
	  }
	  if (name === "list_workflow_packs") {
	    return { workflowPacks: listWorkflowPacks() };
	  }
  if (name === "list_workflow_templates") {
    return { templates: listWorkflowTemplates({ workflowPack: args.workflowPack ? String(args.workflowPack) : undefined }) };
  }
  if (name === "get_workflow_pack_gallery") {
    return {
      gallery: getWorkflowPackGallery(String(args.workflowPack), {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined
      })
    };
  }
  if (name === "get_workflow_pack_export_snapshot") {
    return {
      snapshot: getWorkflowPackExportSnapshot(String(args.workflowPack), {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined
      })
    };
  }
  if (name === "get_workflow_template_qa") {
    return {
      qa: getWorkflowTemplateQa(String(args.templateId), {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined,
        pageWidth: args.pageWidth === undefined ? undefined : Number(args.pageWidth),
        pageHeight: args.pageHeight === undefined ? undefined : Number(args.pageHeight)
      })
    };
  }
  if (name === "get_journal_figure_qa") {
    return {
      qa: getJournalFigureQa(String(args.templateId), {
        styleProfile: styleProfileArg(args),
        pageWidth: args.pageWidth === undefined ? undefined : Number(args.pageWidth),
        pageHeight: args.pageHeight === undefined ? undefined : Number(args.pageHeight)
      })
    };
  }
  if (name === "get_asset_quality_report") {
    return { report: getAssetQualityReport() };
  }
  if (name === "get_commercial_visual_audit") {
    return {
      audit: getCommercialVisualAudit({
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "get_asset_ontology") {
    return {
      ontology: getAssetOntology({
        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
        qualityTier: args.qualityTier ? String(args.qualityTier) : undefined,
        includeAssets: args.includeAssets === undefined ? undefined : Boolean(args.includeAssets),
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "get_coverage_gap_report") {
    return { report: getAssetCoverageGapReport() };
  }
  if (name === "create_asset_brief") {
    return {
      brief: createAssetBrief({
        concept: args.concept ? String(args.concept) : undefined,
        assetId: args.assetId ? String(args.assetId) : undefined,
        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined,
        qualityTarget: args.qualityTarget ? String(args.qualityTarget) : undefined
      })
    };
  }
  if (name === "recommend_workflow_pack") {
    return {
      recommendations: recommendWorkflowPack({
        title: args.title ? String(args.title) : undefined,
        narrative: args.narrative ? String(args.narrative) : undefined,
        sourceText: args.sourceText ? String(args.sourceText) : undefined,
        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "recommend_asset_set") {
    const recommendation = recommendAssetSet({
      title: args.title ? String(args.title) : undefined,
      narrative: args.narrative ? String(args.narrative) : undefined,
      layoutIntent: args.layoutIntent ? String(args.layoutIntent) : undefined,
      sourceText: args.sourceText ? String(args.sourceText) : undefined,
      styleProfile: styleProfileArg(args),
      workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
      templateId: args.templateId ? String(args.templateId) : undefined,
      semanticSlots: Array.isArray(args.semanticSlots) ? args.semanticSlots.map(String) : undefined,
      panelRoles: Array.isArray(args.panelRoles) ? args.panelRoles.map(String) : undefined,
      limit: args.limit === undefined ? undefined : Number(args.limit)
    });
    return {
      recommendation: responseShapeArg(args) === "compact" ? compactAssetSetRecommendation(recommendation) : recommendation
    };
  }
  if (name === "create_workflow_template") {
    return {
      templateSpec: createWorkflowTemplateSpec({
        workflowPack: String(args.workflowPack),
        intent: args.intent ? String(args.intent) : undefined,
        name: args.name ? String(args.name) : undefined,
        layout: args.layout as Parameters<typeof createWorkflowTemplateSpec>[0]["layout"],
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined
      })
    };
  }
  if (name === "validate_asset_pack") {
    const workflowPack = String(args.workflowPack);
    return {
      quality: getWorkflowPackQuality(workflowPack),
      visualQa: getWorkflowPackVisualQaGallery(workflowPack, {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined,
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "export_pack_qa_report") {
    const workflowPack = String(args.workflowPack);
    return {
      snapshot: getWorkflowPackExportSnapshot(workflowPack, {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined
      }),
      visualQa: getWorkflowPackVisualQaGallery(workflowPack, {
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined,
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "get_realistic_asset_gallery") {
    return {
      gallery: getRealisticAssetGallery({
        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
        styleProfile: args.styleProfile ? String(args.styleProfile) : undefined,
        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  if (name === "get_asset") {
    return { asset: getAnyAsset(String(args.assetId)) };
  }
  if (name === "render_asset_preview") {
    return {
      svg: renderPremiumAssetSvg(String(args.assetId), {
	        variant: args.variant as Parameters<typeof renderPremiumAssetSvg>[1]["variant"],
	        styleProfile: styleProfileArg(args) as Parameters<typeof renderPremiumAssetSvg>[1]["styleProfile"],
	        detailLevel: args.detailLevel as Parameters<typeof renderPremiumAssetSvg>[1]["detailLevel"],
	        width: args.width === undefined ? undefined : Number(args.width),
        height: args.height === undefined ? undefined : Number(args.height),
        appearance: assetAppearanceFromArgs(args)
      })
    };
  }
  if (name === "recommend_assets_for_slide") {
    return {
      recommendations: recommendAssetsForSlide({
	        title: args.title ? String(args.title) : undefined,
	        narrative: args.narrative ? String(args.narrative) : undefined,
		        layoutIntent: args.layoutIntent ? String(args.layoutIntent) : undefined,
		        sourceText: args.sourceText ? String(args.sourceText) : undefined,
		        styleProfile: styleProfileArg(args),
		        workflowPack: args.workflowPack ? String(args.workflowPack) : undefined,
		        limit: args.limit === undefined ? undefined : Number(args.limit)
      })
    };
  }
  const projectId = String(args.projectId ?? "");
  const project = projects.get(projectId);
  if (!project) throw new Error(`Project not found in MCP memory: ${projectId}`);
  const current = migrateProject(project);

  if (name === "add_curated_symbol") {
	    const node = createCuratedSymbolNode({
		      assetId: String(args.assetId),
			      label: args.label ? String(args.label) : undefined,
			      variant: args.variant as Parameters<typeof createCuratedSymbolNode>[0]["variant"],
			      styleProfile: styleProfileArg(args) as Parameters<typeof createCuratedSymbolNode>[0]["styleProfile"],
			      detailLevel: args.detailLevel as Parameters<typeof createCuratedSymbolNode>[0]["detailLevel"],
		      semanticRole: args.semanticRole ? String(args.semanticRole) : undefined,
		      layoutHint: args.layoutHint ? String(args.layoutHint) : undefined,
		      appearance: assetAppearanceFromArgs(args),
	      x: Number(args.x),
	      y: Number(args.y),
	      width: args.width === undefined ? undefined : Number(args.width),
      height: args.height === undefined ? undefined : Number(args.height)
    });
    const next = addNode(current, node);
    projects.set(project.id, next);
    return { project: next, node };
  }
  if (name === "insert_premium_asset") {
    const asset = getAnyAsset(String(args.assetId));
    const styleProfile = styleProfileArg(args);
    const pageId = args.pageId ? String(args.pageId) : undefined;
    const workflowPack = args.workflowPack ? String(args.workflowPack) : asset.workflowPacks[0];
	    const node = asset.kind === "image"
	      ? createRealisticImageNode({
	        assetId: String(args.assetId),
	        label: args.label ? String(args.label) : undefined,
	        styleProfile: styleProfile as Parameters<typeof createRealisticImageNode>[0]["styleProfile"],
	        appearance: realisticAppearanceFromArgs(args),
        crop: objectArg(args.crop) as Parameters<typeof createRealisticImageNode>[0]["crop"],
        mask: objectArg(args.mask) as Parameters<typeof createRealisticImageNode>[0]["mask"],
        captionAnchor: args.captionAnchor as Parameters<typeof createRealisticImageNode>[0]["captionAnchor"],
        x: Number(args.x),
        y: Number(args.y),
        width: args.width === undefined ? undefined : Number(args.width),
        height: args.height === undefined ? undefined : Number(args.height)
      })
      : createCuratedSymbolNode({
	        assetId: String(args.assetId),
	        label: args.label ? String(args.label) : undefined,
	        variant: args.variant as Parameters<typeof createCuratedSymbolNode>[0]["variant"],
	        styleProfile: styleProfile as Parameters<typeof createCuratedSymbolNode>[0]["styleProfile"],
	        detailLevel: args.detailLevel as Parameters<typeof createCuratedSymbolNode>[0]["detailLevel"],
        semanticRole: args.semanticRole ? String(args.semanticRole) : undefined,
        layoutHint: args.layoutHint ? String(args.layoutHint) : undefined,
        appearance: assetAppearanceFromArgs(args),
        x: Number(args.x),
        y: Number(args.y),
        width: args.width === undefined ? undefined : Number(args.width),
        height: args.height === undefined ? undefined : Number(args.height)
      });
    const withNode = addNode(current, node, pageId);
    const traced = recordAgentRun(withNode, {
      name: "Insert premium asset",
      prompt: `Insert ${asset.name} (${asset.id}) as an editable premium asset.`,
      operations: [{ op: "add-node", pageId, nodeId: node.id, payload: { node } }],
      trace: {
        workflowPack,
        styleProfile,
        resourceUris: defaultAgentResourceUris(),
        toolSequence: ["get_asset_index", "recommend_asset_set", "insert_premium_asset"],
        compactIndex: {
          filters: {
            workflowPack,
            styleProfile,
            qualityTier: asset.qualityTier
          },
          returnedAssets: 1,
          assetIds: [asset.id]
        },
        recommendation: {
          tool: "recommend_asset_set",
          responseShape: "compact",
          semanticSlots: args.semanticRole ? [String(args.semanticRole)] : undefined,
          assetIds: [asset.id],
          insertPlanCount: 1
        },
        insertPlan: [{
          tool: "insert_premium_asset",
          assetId: asset.id,
          semanticRole: args.semanticRole ? String(args.semanticRole) : undefined,
          layoutHint: args.layoutHint ? String(args.layoutHint) : undefined,
          styleProfile,
          nodeId: node.id
        }],
        generatedNodeIds: [node.id],
        references: [{
          kind: "insert-plan",
          id: `${asset.id}:${node.id}`,
          tool: "insert_premium_asset",
          workflowPack,
          assetIds: [asset.id],
          nodeIds: [node.id],
          summary: "Asset inserted by ID, style profile, semantic role, and layout hint."
        }]
      }
    });
    projects.set(project.id, traced.project);
	    return { project: traced.project, node, agentRun: traced.agentRun };
	  }
	  if (name === "insert_realistic_asset") {
	    const asset = getAnyAsset(String(args.assetId));
	    const styleProfile = styleProfileArg(args);
	    const pageId = args.pageId ? String(args.pageId) : undefined;
	    const workflowPack = args.workflowPack ? String(args.workflowPack) : asset.workflowPacks[0];
	    const node = createRealisticImageNode({
	      assetId: String(args.assetId),
	      label: args.label ? String(args.label) : undefined,
	      styleProfile: styleProfile as Parameters<typeof createRealisticImageNode>[0]["styleProfile"],
      appearance: realisticAppearanceFromArgs(args),
      crop: objectArg(args.crop) as Parameters<typeof createRealisticImageNode>[0]["crop"],
      mask: objectArg(args.mask) as Parameters<typeof createRealisticImageNode>[0]["mask"],
      captionAnchor: args.captionAnchor as Parameters<typeof createRealisticImageNode>[0]["captionAnchor"],
      x: Number(args.x),
      y: Number(args.y),
      width: args.width === undefined ? undefined : Number(args.width),
      height: args.height === undefined ? undefined : Number(args.height)
    });
    const withNode = addNode(current, node, pageId);
    const traced = recordAgentRun(withNode, {
      name: "Insert realistic asset",
      prompt: `Insert ${asset.name} (${asset.id}) as a provenance-tracked realistic asset.`,
      operations: [{ op: "add-node", pageId, nodeId: node.id, payload: { node } }],
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
    projects.set(project.id, traced.project);
    return { project: traced.project, node, agentRun: traced.agentRun };
  }
	  if (name === "create_workflow_figure") {
	    const templateId = args.templateId ? String(args.templateId) : undefined;
	    const template = templateId ? getWorkflowTemplate(templateId) : undefined;
	    const workflowPack = args.workflowPack ? String(args.workflowPack) : template?.workflowPack;
	    const styleProfile = styleProfileArg(args);
	    const nodes = createWorkflowFigureNodes({
	      workflowPack,
	      templateId,
	      styleProfile: styleProfile as Parameters<typeof createWorkflowFigureNodes>[0]["styleProfile"],
	      x: args.x === undefined ? undefined : Number(args.x),
	      y: args.y === undefined ? undefined : Number(args.y),
	      width: args.width === undefined ? undefined : Number(args.width),
	      stepCount: args.stepCount === undefined ? undefined : Number(args.stepCount)
	    });
	    const pageId = args.pageId ? String(args.pageId) : undefined;
	    const withNodes = nodes.reduce((currentProject, node) => addNode(currentProject, node, pageId), current);
	    const withMeta = applyWorkflowFigureSlideMeta(withNodes, {
	      pageId,
	      workflowPack,
	      templateId,
	      mode: "workflow-figure"
	    });
	    const reviewed = refreshDeckReviewItems(withMeta);
	    const assetIds = assetIdsFromNodes(nodes);
	    const traced = recordAgentRun(reviewed, {
	      name: "Create workflow figure",
	      prompt: `Create editable workflow figure${templateId ? ` from template ${templateId}` : ""}${workflowPack ? ` for ${workflowPack}` : ""}.`,
	      operations: nodes.map((node) => ({ op: "add-node", pageId, nodeId: node.id, payload: { node } })),
	      trace: {
	        workflowPack,
	        templateId,
	        styleProfile,
	        resourceUris: defaultAgentResourceUris(),
	        toolSequence: ["get_asset_index", "get_workflow_pack_gallery", "get_workflow_template_qa", "create_workflow_figure", "validate_deck", "export_pack_qa_report"],
	        compactIndex: {
	          filters: { workflowPack, templateId, styleProfile },
	          returnedAssets: assetIds.length,
	          assetIds
	        },
	        recommendation: {
	          tool: "recommend_asset_set",
	          responseShape: "compact",
	          assetIds,
	          insertPlanCount: nodes.length
	        },
	        insertPlan: nodes
	          .map((node) => {
	            const assetId = assetIdFromNode(node);
	            return assetId ? {
	              tool: "insert_premium_asset",
	              assetId,
	              semanticRole: semanticRoleFromNode(node),
	              layoutHint: layoutHintFromNode(node),
	              styleProfile,
	              nodeId: node.id
	            } : undefined;
	          })
	          .filter((item): item is NonNullable<typeof item> => Boolean(item)),
	        generatedNodeIds: nodes.map((node) => node.id),
	        references: [{
	          kind: "template",
	          id: templateId ?? workflowPack ?? "workflow-figure",
	          tool: "create_workflow_figure",
	          workflowPack,
	          templateId,
	          assetIds,
	          nodeIds: nodes.map((node) => node.id),
	          summary: "Workflow figure generated as editable scene nodes from pack/template recipe."
	        }]
	      }
	    });
	    projects.set(project.id, traced.project);
	    return { project: traced.project, nodes, reviewItems: traced.project.deck.reviewItems, agentRun: traced.agentRun };
	  }
	  if (name === "create_flagship_workflow_demo") {
	    const workflowPack = String(args.workflowPack);
	    const styleProfile = styleProfileArg(args);
	    const nodes = createFlagshipWorkflowDemoNodes({
	      workflowPack,
	      styleProfile: styleProfile as Parameters<typeof createFlagshipWorkflowDemoNodes>[0]["styleProfile"],
	      x: args.x === undefined ? undefined : Number(args.x),
	      y: args.y === undefined ? undefined : Number(args.y),
	      width: args.width === undefined ? undefined : Number(args.width),
	      stepCount: args.stepCount === undefined ? undefined : Number(args.stepCount)
	    });
	    const pageId = args.pageId ? String(args.pageId) : undefined;
	    const withNodes = nodes.reduce((currentProject, node) => addNode(currentProject, node, pageId), current);
	    const withMeta = applyWorkflowFigureSlideMeta(withNodes, {
	      pageId,
	      workflowPack,
	      mode: "flagship-demo"
	    });
	    const reviewed = refreshDeckReviewItems(withMeta);
	    const assetIds = assetIdsFromNodes(nodes);
	    const traced = recordAgentRun(reviewed, {
	      name: "Create flagship workflow demo",
	      prompt: `Create flagship demo for ${workflowPack}.`,
	      operations: nodes.map((node) => ({ op: "add-node", pageId, nodeId: node.id, payload: { node } })),
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
	          insertPlan: nodes
	            .map((node) => {
	              const assetId = assetIdFromNode(node);
	              return assetId ? {
	                tool: "insert_premium_asset",
	                assetId,
	                semanticRole: semanticRoleFromNode(node),
	                layoutHint: layoutHintFromNode(node),
	                styleProfile,
	                nodeId: node.id
	              } : undefined;
	            })
	            .filter((item): item is NonNullable<typeof item> => Boolean(item)),
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
	    projects.set(project.id, traced.project);
	    return { project: traced.project, nodes, reviewItems: traced.project.deck.reviewItems, agentRun: traced.agentRun };
	  }
  if (name === "add_node") {
    const node = args.node as SceneNode;
    const next = addNode(current, node, args.pageId ? String(args.pageId) : undefined);
    projects.set(project.id, next);
    return { project: next, node };
  }
  if (name === "import_plot") {
    const table = parseDelimited(String(args.tableText), { delimiter: args.delimiter as "," | "\t" | undefined });
    const spec = createPlotSpec({
      plotType: args.plotType as Parameters<typeof createPlotSpec>[0]["plotType"],
      table,
      encodings: args.encodings as Parameters<typeof createPlotSpec>[0]["encodings"],
      title: args.title ? String(args.title) : undefined
    });
    const node = createPlotNode({ spec });
    const next = addNode(current, node);
    projects.set(project.id, next);
    return { project: next, node, spec };
  }
  if (name === "apply_template") {
    const next = applyTemplate(current, args.template as "perturb-seq-workflow" | "ai-biosecurity-pipeline");
    projects.set(project.id, next);
    return { project: next };
  }
  if (name === "list_nodes") {
    return { nodes: listNodes(current, args.pageId ? String(args.pageId) : undefined) };
  }
  if (name === "validate_project") {
    return { validation: validateProject(current) };
  }
  if (name === "export_project") {
    const result = exportProject(current, {
      format: args.format as "svg" | "pdf" | "png" | "pptx" | "docx" | "json",
      pageId: args.pageId ? String(args.pageId) : undefined
    });
    return {
      format: result.format,
      mime: result.mime,
      filename: result.filename,
      warnings: result.warnings,
      data: typeof result.data === "string" ? result.data : Buffer.from(result.data).toString("base64")
    };
  }
  if (name === "import_source") {
    const result = importSource(current, {
      kind: args.kind as SourceDocumentKind,
      name: String(args.name),
      text: args.text ? String(args.text) : undefined,
      dataUri: args.dataUri ? String(args.dataUri) : undefined,
      mimeType: args.mimeType ? String(args.mimeType) : undefined,
      citation: args.citation ? String(args.citation) : undefined
    });
    projects.set(projectId, result.project);
    return result;
  }
  if (name === "create_deck_outline") {
    const result = createDeckOutline(current, {
      title: args.title ? String(args.title) : undefined,
      audience: args.audience ? String(args.audience) : undefined,
      goal: args.goal ? String(args.goal) : undefined,
      slideCount: args.slideCount === undefined ? undefined : Number(args.slideCount),
      sourceIds: Array.isArray(args.sourceIds) ? args.sourceIds.map(String) : undefined
    });
    projects.set(projectId, result.project);
    return result;
  }
  if (name === "revise_deck_outline") {
    const result = reviseDeckOutline(current, String(args.instructions));
    projects.set(projectId, result.project);
    return result;
  }
  if (name === "generate_slide_from_brief") {
    const approved = approveDeckOutline(current);
    const result = generateSlideFromBrief(approved, String(args.briefId));
    projects.set(projectId, result.project);
    return result;
  }
  if (name === "generate_deck_from_outline") {
    const approved = args.approve === false ? current : approveDeckOutline(current);
    const result = generateDeckFromOutline(approved);
    projects.set(projectId, result.project);
    return result;
  }
  if (name === "apply_scene_operations") {
    const next = applySceneOperations(current, (args.operations ?? []) as SceneOperation[]);
    projects.set(projectId, next);
    return { project: next };
  }
  if (name === "validate_deck") {
    return { validation: validateDeck(current) };
  }
  if (name === "list_review_items") {
    return { reviewItems: current.deck.reviewItems.length ? current.deck.reviewItems : generateReviewItems(current) };
  }
  if (name === "summarize_review_queue") {
    return { summary: summarizeReviewQueue(current) };
  }
  if (name === "resolve_review_item") {
    const next = resolveDeckReviewItem(current, String(args.reviewItemId), (args.status as "resolved" | "accepted-risk" | undefined) ?? "resolved");
    projects.set(projectId, next);
    return { project: next, reviewItems: next.deck.reviewItems, summary: summarizeReviewQueue(next) };
  }
  if (name === "resolve_review_items") {
    const next = resolveDeckReviewItems(
      current,
      Array.isArray(args.reviewItemIds) ? args.reviewItemIds.map(String) : [],
      (args.status as "resolved" | "accepted-risk" | undefined) ?? "resolved"
    );
    projects.set(projectId, next);
    return { project: next, reviewItems: next.deck.reviewItems, summary: summarizeReviewQueue(next) };
  }
  if (name === "export_deck") {
    const result = exportProject(current, {
      format: args.format as "svg" | "pdf" | "png" | "pptx" | "docx" | "json"
    });
    return {
      format: result.format,
      mime: result.mime,
      filename: result.filename,
      warnings: result.warnings,
      data: typeof result.data === "string" ? result.data : Buffer.from(result.data).toString("base64")
    };
  }
  throw new Error(`Unknown tool: ${name}`);
}

function writeMessage(message: JsonRpcResponse): void {
  const body = JSON.stringify(message);
  stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
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
  const payload = nodePayloadObject(node);
  const assetId = payload.assetId;
  return typeof assetId === "string" && assetId.trim() ? assetId : undefined;
}

function semanticRoleFromNode(node: SceneNode): string | undefined {
  const payload = nodePayloadObject(node);
  const semanticRole = payload.semanticRole;
  return typeof semanticRole === "string" && semanticRole.trim() ? semanticRole : undefined;
}

function layoutHintFromNode(node: SceneNode): string | undefined {
  const payload = nodePayloadObject(node);
  const layoutHint = payload.layoutHint;
  return typeof layoutHint === "string" && layoutHint.trim() ? layoutHint : undefined;
}

function nodePayloadObject(node: SceneNode): Record<string, unknown> {
  return typeof node.payload === "object" && node.payload !== null ? node.payload as Record<string, unknown> : {};
}

function assetAppearanceFromArgs(args: Record<string, unknown>): Parameters<typeof renderPremiumAssetSvg>[1]["appearance"] {
  const explicit = typeof args.appearance === "object" && args.appearance ? args.appearance as Record<string, unknown> : {};
  return Object.fromEntries([
    ["accent", args.accent ?? explicit.accent],
    ["secondary", args.secondary ?? explicit.secondary],
    ["fill", args.fill ?? explicit.fill],
    ["stroke", args.stroke ?? explicit.stroke],
	    ["labelColor", args.labelColor ?? explicit.labelColor],
	    ["strokeWidth", args.strokeWidth ?? explicit.strokeWidth],
	    ["styleProfile", styleProfileArg(args) ?? explicit.styleProfile],
	    ["detailLevel", args.detailLevel ?? explicit.detailLevel]
	  ].filter(([, value]) => value !== undefined));
}

function realisticAppearanceFromArgs(args: Record<string, unknown>): Parameters<typeof createRealisticImageNode>[0]["appearance"] {
  const explicit = objectArg(args.appearance);
  return Object.fromEntries([
    ["colorWash", args.colorWash ?? explicit?.colorWash],
    ["colorWashOpacity", args.colorWashOpacity ?? explicit?.colorWashOpacity],
    ["contrast", args.contrast ?? explicit?.contrast],
    ["opacity", args.opacity ?? explicit?.opacity],
    ["backgroundTreatment", args.backgroundTreatment ?? explicit?.backgroundTreatment],
    ["rimColor", args.rimColor ?? explicit?.rimColor],
    ["shadow", args.shadow ?? explicit?.shadow]
  ].filter(([, value]) => value !== undefined)) as Parameters<typeof createRealisticImageNode>[0]["appearance"];
}

function objectArg(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : undefined;
}

function styleProfileArg(args: Record<string, unknown>): string | undefined {
  return args.styleProfile ? String(args.styleProfile) : args.style ? String(args.style) : undefined;
}

function responseShapeArg(args: Record<string, unknown>): "compact" | "full" {
  return args.responseShape === "compact" ? "compact" : "full";
}

export function startStdioServer(): void {
  let buffer = Buffer.alloc(0);
  stdin.on("data", async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;
      const header = buffer.slice(0, headerEnd).toString("utf8");
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) throw new Error("Missing Content-Length header.");
      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      if (buffer.byteLength < bodyStart + length) return;
      const body = buffer.slice(bodyStart, bodyStart + length).toString("utf8");
      buffer = buffer.slice(bodyStart + length);
      const response = await handleJsonRpc(JSON.parse(body) as JsonRpcRequest);
      if (response.id !== undefined) writeMessage(response);
    }
  });
}

if (process.argv[1]?.endsWith("server.ts")) {
  startStdioServer();
}
