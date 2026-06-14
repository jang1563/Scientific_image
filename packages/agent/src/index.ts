import { getAssetCoverageGapReport, getAssetIndex, getAssetQualityReport, getAssetOntology, listWorkflowPacks, listWorkflowTemplates } from "../../assets/src/index.ts";

export interface AgentResourceDescriptor {
  uri: string;
  name: string;
  description: string;
  mimeType: "application/json" | "text/markdown";
}

export interface AgentResource extends AgentResourceDescriptor {
  text: string;
}

export interface AgentWorkflowRecipe {
  id: string;
  name: string;
  whenToUse: string;
  orderedTools: string[];
  reviewGate: string;
  exportTarget: string;
}

export const AGENT_RESOURCE_DESCRIPTORS: AgentResourceDescriptor[] = [
  {
    uri: "scientific-image://agent/manifest",
    name: "Scientific Image Agent Manifest",
    description: "Machine-readable product direction, guardrails, workflow recipes, tool groups, and workflow pack summary.",
    mimeType: "application/json"
  },
  {
    uri: "scientific-image://agent/quickstart",
    name: "Agent Quickstart",
    description: "Short Claude/Codex operating loop for creating editable scientific figures and decks.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/workflow-recipes",
    name: "Workflow Recipes",
    description: "Ordered MCP/API tool recipes for deck generation, workflow figures, asset search, QA, and export.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/agent-cookbook",
    name: "Agent Cookbook",
    description: "Copy-paste JSON-RPC examples for compact indexing, insert-ready recommendations, workflow figures, validation, and export QA.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/demo-perturb-seq-crispr",
    name: "Perturb-seq CRISPR Agent Demo",
    description: "Canonical source-notes-to-editable-slide MCP happy path for Perturb-seq CRISPR figures.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/client-configs",
    name: "Claude and Codex Client Configs",
    description: "Local stdio MCP configuration examples for Claude Code and Codex.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/review-export-checklist",
    name: "Review and Export Checklist",
    description: "Human approval, provenance, citation, layout, accessibility, and Office fallback checks.",
    mimeType: "text/markdown"
  },
  {
    uri: "scientific-image://agent/asset-ontology",
    name: "Premium Asset Ontology",
    description: "Machine-readable asset IDs, workflow packs, semantic slots, style profiles, quality tiers, and editable contracts.",
    mimeType: "application/json"
  },
  {
    uri: "scientific-image://agent/asset-index-compact",
    name: "Compact Agent Asset Index",
    description: "Small insert-ready asset index for first-pass MCP clients; use get_asset for full metadata.",
    mimeType: "application/json"
  },
  {
    uri: "scientific-image://agent/coverage-roadmap",
    name: "Premium Coverage Roadmap",
    description: "12-month premium asset coverage targets, workflow-pack expansion plan, acceptance gates, and gap report.",
    mimeType: "application/json"
  }
];

const WORKFLOW_RECIPES: AgentWorkflowRecipe[] = [
  {
    id: "outline-first-deck",
    name: "Outline-first scientific deck",
    whenToUse: "Use when sources or notes should become a multi-slide presentation.",
    orderedTools: [
      "create_project",
      "import_source",
      "create_deck_outline",
      "revise_deck_outline",
      "generate_deck_from_outline",
      "validate_deck",
      "list_review_items",
      "summarize_review_queue",
      "export_deck"
    ],
    reviewGate: "Do not generate final exports until the outline has been approved and review items have been resolved or accepted by the human.",
    exportTarget: "PPTX plus PDF, with SVG/JSON retained as source-of-truth exports."
  },
  {
    id: "workflow-pack-figure",
    name: "Premium workflow-pack figure",
    whenToUse: "Use when the user asks for a perturb-seq, spatial transcriptomics, AI biosecurity, agentic AI, publication panel, single-cell, or space-biology figure.",
    orderedTools: [
      "recommend_workflow_pack",
      "list_workflow_packs",
      "get_workflow_pack_gallery",
      "validate_asset_pack",
      "get_workflow_template_qa",
      "create_workflow_figure",
      "validate_deck",
      "summarize_review_queue",
      "export_pack_qa_report",
      "export_deck"
    ],
    reviewGate: "Prefer a named templateId over raw node construction, then surface template QA and PPTX fallback warnings.",
    exportTarget: "Editable scene JSON plus SVG/PDF; PPTX may embed premium SVG fallbacks with named warnings."
  },
  {
    id: "semantic-asset-insertion",
    name: "Semantic premium asset insertion",
    whenToUse: "Use when an agent needs to choose specific biology or AI visuals for an existing slide.",
    orderedTools: [
      "get_asset_ontology",
      "search_assets",
      "recommend_asset_set",
      "recommend_assets_for_slide",
      "create_asset_brief",
      "render_asset_preview",
      "insert_premium_asset",
      "validate_deck"
    ],
    reviewGate: "Reference asset IDs, styleProfile, semanticRole, layoutHint, and appearance overrides rather than raw SVG strings.",
    exportTarget: "Structured symbol nodes that render through the shared SVG exporter."
  },
  {
    id: "review-export-qa",
    name: "Review queue and export QA pass",
    whenToUse: "Use before delivering files, screenshots, or agent-generated deck revisions.",
    orderedTools: [
      "validate_deck",
      "list_review_items",
      "summarize_review_queue",
      "export_pack_qa_report",
      "resolve_review_items",
      "resolve_review_item",
      "export_deck"
    ],
    reviewGate: "Claims remain draft until cited, user-confirmed, or explicitly accepted as risk.",
    exportTarget: "Warnings must name the exact asset/template that falls back in Office formats."
  }
];

export function listAgentResources(): AgentResourceDescriptor[] {
  return AGENT_RESOURCE_DESCRIPTORS.map((resource) => ({ ...resource }));
}

export function readAgentResource(uriOrId: string): AgentResource {
  const descriptor = resolveAgentResourceDescriptor(uriOrId);
  if (!descriptor) throw new Error(`Unknown agent resource: ${uriOrId}`);
  return {
    ...descriptor,
    text: resourceText(descriptor.uri)
  };
}

export function getAgentManifest() {
  const report = getAssetQualityReport();
  const coverage = getAssetCoverageGapReport();
  const templates = listWorkflowTemplates();
  const workflowPacks = listWorkflowPacks().map((pack) => ({
    id: pack.id,
    name: pack.name,
    priority: pack.priority,
    description: pack.description,
    flagshipTemplateId: pack.flagshipTemplateId,
    assetCount: pack.assetIds.length,
    templateCount: pack.templates.length,
    templates: templates
      .filter((template) => template.workflowPack === pack.id)
      .map((template) => ({
        id: template.id,
        name: template.name,
        layout: template.layout,
        recommendedStyleProfile: template.recommendedStyleProfile,
        previewAssetIds: template.previewAssetIds
      })),
    agentUseHints: pack.agentUseHints
  }));

  return {
    schemaVersion: "0.6.0-agent-manifest",
    name: "Scientific Image",
    purpose: "Local-first, agent-addressable scientific visual workspace for premium structured SVG figures and editable decks.",
    server: {
      mcpName: "scientific-image-mcp",
      protocolVersion: "2024-11-05",
      command: "node packages/mcp/src/server.ts",
      apiBaseUrl: "http://127.0.0.1:8787",
      webWorkspaceUrl: "http://127.0.0.1:4173"
    },
    canonicalArtifact: {
      format: "Project scene JSON",
      rule: "Treat PPTX, PDF, SVG, PNG, and DOCX as exports, not source files.",
      sourceOfTruthFields: ["pages", "nodes", "assets", "deck", "sources", "reviewItems", "agentRuns", "provenance"]
    },
    productDirection: [
      "premium workflow packs first",
      "structured SVG only for source assets",
      "human approval for scientific claims",
      "agent operations must be deterministic and reviewable",
      "PPTX/PDF/SVG export aware"
    ],
    defaultVisualContract: {
      styleProfile: "consulting-2p5d",
      allowedStyleProfiles: report.summary.styleProfiles,
      qualityLadder: ["signature", "hero", "standard", "utility"],
      preferQualityTiers: ["signature", "hero"],
      appearanceOverrides: ["accent", "secondary", "fill", "stroke", "strokeWidth", "labelColor", "detailLevel"]
    },
    agentFacets: getAssetIndex({ limit: 0 }).facets,
    recommendedFirstCalls: [
      { method: "resources/read", uri: "scientific-image://agent/manifest" },
      { method: "resources/read", uri: "scientific-image://agent/agent-cookbook" },
      { method: "resources/read", uri: "scientific-image://agent/demo-perturb-seq-crispr" },
      { tool: "get_asset_index", arguments: { responseShape: "compact", limit: 20 } },
      { tool: "recommend_asset_set", arguments: { responseShape: "compact" } },
      { tool: "insert_premium_asset", argumentsFrom: "recommend_asset_set.insertPlan[].args" },
      { tool: "validate_deck", arguments: { projectId: "<projectId>" } },
      { tool: "export_pack_qa_report", arguments: { workflowPack: "<workflowPack>" } }
    ],
    guardrails: [
      "Use workflow pack templates before hand-placing many generic assets.",
      "Use asset IDs and scene operations rather than emitting opaque screenshots.",
      "Keep unsupported scientific claims in the review queue until cited, user-confirmed, or accepted-risk.",
      "Before Office export, call template or pack export QA and surface exact fallback assets.",
      "Do not download dependencies, call remote services, or mutate external files unless the user explicitly asks."
    ],
    toolGroups: {
      project: ["create_project", "list_nodes", "add_node", "apply_scene_operations", "validate_project"],
      sourcesAndDecks: ["import_source", "create_deck_outline", "revise_deck_outline", "generate_slide_from_brief", "generate_deck_from_outline"],
      premiumAssets: ["get_asset_index", "get_asset_ontology", "search_assets", "get_asset", "create_asset_brief", "render_asset_preview", "recommend_assets_for_slide", "recommend_asset_set", "insert_premium_asset"],
      workflowPacks: ["recommend_workflow_pack", "list_workflow_packs", "list_workflow_templates", "get_workflow_pack_gallery", "validate_asset_pack", "get_workflow_template_qa", "create_workflow_template", "create_workflow_figure", "create_flagship_workflow_demo"],
      reviewAndExport: ["validate_deck", "list_review_items", "summarize_review_queue", "resolve_review_item", "resolve_review_items", "get_coverage_gap_report", "get_workflow_pack_export_snapshot", "export_pack_qa_report", "export_deck"]
    },
    workflowRecipes: WORKFLOW_RECIPES,
    workflowPacks,
    qualitySummary: {
      totalAssets: report.summary.totalAssets,
      signatureAssets: report.summary.signatureAssets,
      heroAssets: report.summary.heroAssets,
      workflowPacks: report.summary.workflowPacks,
      targetAssets12Months: coverage.milestones.at(-1)?.targetAssets,
      targetSignatureHeroAssets12Months: coverage.milestones.at(-1)?.targetSignatureHeroAssets,
      targetWorkflowPacks12Months: coverage.milestones.at(-1)?.targetWorkflowPacks,
      targetTemplates12Months: coverage.milestones.at(-1)?.targetTemplates,
      priorityGaps: report.priorityGaps,
      recommendedNextPacks: report.recommendedNextPacks,
      plannedNextPacks: coverage.plannedWorkflowPacks.slice(0, 8).map((pack) => pack.id)
    },
    resources: listAgentResources()
  };
}

function resolveAgentResourceDescriptor(uriOrId: string): AgentResourceDescriptor | undefined {
  const normalized = uriOrId.startsWith("scientific-image://") ? uriOrId : `scientific-image://agent/${uriOrId.replace(/^agent\//, "")}`;
  return AGENT_RESOURCE_DESCRIPTORS.find((resource) => resource.uri === normalized);
}

function resourceText(uri: string): string {
  if (uri === "scientific-image://agent/manifest") return JSON.stringify(getAgentManifest(), null, 2);
  if (uri === "scientific-image://agent/quickstart") return quickstartMarkdown();
  if (uri === "scientific-image://agent/workflow-recipes") return workflowRecipesMarkdown();
  if (uri === "scientific-image://agent/agent-cookbook") return agentCookbookMarkdown();
  if (uri === "scientific-image://agent/demo-perturb-seq-crispr") return perturbSeqDemoMarkdown();
  if (uri === "scientific-image://agent/client-configs") return clientConfigsMarkdown();
  if (uri === "scientific-image://agent/review-export-checklist") return reviewExportChecklistMarkdown();
  if (uri === "scientific-image://agent/asset-ontology") return JSON.stringify(getAssetOntology({ limit: 240 }), null, 2);
  if (uri === "scientific-image://agent/asset-index-compact") return JSON.stringify(getAssetIndex());
  if (uri === "scientific-image://agent/coverage-roadmap") return JSON.stringify(getAssetCoverageGapReport(), null, 2);
  throw new Error(`Unknown agent resource: ${uri}`);
}

function quickstartMarkdown(): string {
  return `# Scientific Image Agent Quickstart

Use this project as a local-first visual workspace. The canonical source is structured scene JSON; exports are derived artifacts.

## Default agent loop

1. Read \`scientific-image://agent/manifest\`.
2. Read \`scientific-image://agent/agent-cookbook\` for copy-paste JSON-RPC examples.
3. For the canonical biology demo, read \`scientific-image://agent/demo-perturb-seq-crispr\`.
4. Read \`scientific-image://agent/asset-index-compact\` or call \`get_asset_index\` with a workflow pack filter.
5. Choose a workflow recipe: outline-first deck, workflow-pack figure, semantic asset insertion, or review/export QA.
6. Prefer workflow pack templates and signature/hero assets before low-level node construction.
7. Apply deterministic tools and scene operations only.
8. Run validation, list review items, and surface unresolved scientific claims or export fallbacks.
9. Export PPTX/PDF/SVG only after the human has approved or accepted remaining review items.

## Fast path for a premium figure

1. \`create_project\`
2. \`get_asset_index\` with \`workflowPack\` and \`responseShape: "compact"\`
3. \`get_workflow_pack_gallery\`
4. \`create_workflow_figure\` with a \`templateId\`
5. \`validate_deck\`
6. \`summarize_review_queue\`
7. \`get_workflow_pack_export_snapshot\`
8. \`export_deck\`

## Fast path for semantic asset insertion

1. \`get_asset_index\` with a \`workflowPack\`, \`semanticSlot\`, or \`qualityTier\`
2. \`recommend_asset_set\` with \`responseShape: "compact"\`
3. Copy each \`insertPlan[].args\` into \`insert_premium_asset\`
4. \`validate_deck\`
5. \`export_pack_qa_report\`

## Fast path for a scientific deck

1. \`create_project\`
2. \`import_source\`
3. \`create_deck_outline\`
4. Human edits or approves the outline
5. \`generate_deck_from_outline\`
6. \`list_review_items\`
7. \`summarize_review_queue\`
8. \`export_deck\`
`;
}

function workflowRecipesMarkdown(): string {
  return `# Agent Workflow Recipes

${WORKFLOW_RECIPES.map((recipe) => `## ${recipe.name}

When to use: ${recipe.whenToUse}

Ordered tools:
${recipe.orderedTools.map((tool, index) => `${index + 1}. \`${tool}\``).join("\n")}

Review gate: ${recipe.reviewGate}

Export target: ${recipe.exportTarget}
`).join("\n")}
`;
}

function agentCookbookMarkdown(): string {
  return `# Scientific Image Agent Cookbook

These JSON-RPC examples are intentionally compact. Use asset IDs, style profiles, and insert-ready args; do not emit raw SVG as the editable source.

## 1. Start With The Manifest And Compact Index

\`\`\`json
{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"scientific-image://agent/manifest"}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":2,"method":"resources/read","params":{"uri":"scientific-image://agent/asset-index-compact"}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_asset_index","arguments":{"workflowPack":"ai-biosecurity-eval","qualityTier":"signature","semanticSlot":"risk-decision","style":"risk-warning","limit":8}}}
\`\`\`

Use \`asset.insertDefaults.args\` or \`previewArgs\` from the compact index before requesting full metadata with \`get_asset\`.

## 2. Insert Pack-Aware Assets

\`\`\`json
{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{"name":"create_project","arguments":{"title":"AI biosecurity eval figure","kind":"slide"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":11,"method":"tools/call","params":{"name":"recommend_asset_set","arguments":{"title":"AI biosecurity benchmark dashboard","workflowPack":"ai-biosecurity-eval","semanticSlots":["evaluation-evidence","risk-decision"],"style":"risk-warning","responseShape":"compact","limit":8}}}
\`\`\`

For each selected recommendation, copy \`recommendation.insertPlan[].args\`, add \`projectId\`, \`x\`, and \`y\`, then call:

\`\`\`json
{"jsonrpc":"2.0","id":12,"method":"tools/call","params":{"name":"insert_premium_asset","arguments":{"projectId":"<projectId>","assetId":"risk-gate","style":"risk-warning","semanticRole":"risk-decision","layoutHint":"workflow-step","x":120,"y":160,"width":160,"height":120}}}
\`\`\`

The response includes \`agentRun.trace\` with the compact index filters, insert plan entry, generated node IDs, and resource URIs used by the agent.

## 3. Use A Workflow Template When Possible

\`\`\`json
{"jsonrpc":"2.0","id":20,"method":"tools/call","params":{"name":"get_workflow_pack_gallery","arguments":{"workflowPack":"spatial-transcriptomics","styleProfile":"consulting-2p5d"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":21,"method":"tools/call","params":{"name":"create_workflow_figure","arguments":{"projectId":"<projectId>","templateId":"spatial-results-panel","styleProfile":"consulting-2p5d","stepCount":4}}}
\`\`\`

Templates are preferred over manual placement when the user asks for a full figure, workflow, result panel, or deck slide.
Template responses also include \`agentRun.trace.templateId\`, \`agentRun.trace.workflowPack\`, and \`agentRun.trace.generatedNodeIds\` so later tools can audit how the editable scene was created.

## 4. Canonical Perturb-seq CRISPR Happy Path

Read the dedicated demo resource for the full source text:

\`\`\`json
{"jsonrpc":"2.0","id":40,"method":"resources/read","params":{"uri":"scientific-image://agent/demo-perturb-seq-crispr"}}
\`\`\`

Then run the source-notes-to-editable-slide loop:

\`\`\`json
{"jsonrpc":"2.0","id":41,"method":"tools/call","params":{"name":"recommend_workflow_pack","arguments":{"title":"Perturb-seq CRISPR screen result slide","sourceText":"CRISPR guide RNA pooled screen, Perturb-seq single-cell RNA-seq readout, expression matrix, volcano plot hit genes, and validation workflow.","limit":3}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":42,"method":"tools/call","params":{"name":"recommend_asset_set","arguments":{"title":"Perturb-seq CRISPR screen result slide","workflowPack":"perturb-seq-crispr","sourceText":"CRISPR guide RNA pooled screen, Perturb-seq single-cell RNA-seq readout, expression matrix, volcano plot hit genes, and validation workflow.","styleProfile":"consulting-2p5d","responseShape":"compact","limit":10}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":43,"method":"tools/call","params":{"name":"create_project","arguments":{"title":"Perturb-seq CRISPR agent demo","kind":"slide"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":44,"method":"tools/call","params":{"name":"import_source","arguments":{"projectId":"<projectId>","kind":"markdown","name":"perturb-seq-crispr-source.md","text":"# Perturb-seq CRISPR screen\\n\\nInput cells receive guide RNAs from a pooled CRISPR library. Perturb-seq links guide identity with single-cell RNA-seq readouts, creating an expression matrix used for differential expression, volcano-style hit calling, and validation of candidate genes.","citation":"User-provided Perturb-seq notes"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":45,"method":"tools/call","params":{"name":"create_workflow_figure","arguments":{"projectId":"<projectId>","templateId":"perturb-seq-workflow","styleProfile":"consulting-2p5d","stepCount":5}}}
\`\`\`

Finish with \`validate_deck\`, \`summarize_review_queue\`, \`export_pack_qa_report\`, and \`export_deck\`. The useful handoff fields are \`projectId\`, \`workflowPack\`, \`templateId\`, \`agentRun.trace.generatedNodeIds\`, \`agentRun.trace.insertPlan[].assetId\`, \`summary.deliveryReadiness\`, \`summary.nextAction\`, and exact export warnings.

## 5. Validate And Export With Named Warnings

\`\`\`json
{"jsonrpc":"2.0","id":30,"method":"tools/call","params":{"name":"validate_deck","arguments":{"projectId":"<projectId>"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":31,"method":"tools/call","params":{"name":"summarize_review_queue","arguments":{"projectId":"<projectId>"}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":32,"method":"tools/call","params":{"name":"export_pack_qa_report","arguments":{"workflowPack":"ai-biosecurity-eval","styleProfile":"risk-warning","limit":6}}}
\`\`\`

\`\`\`json
{"jsonrpc":"2.0","id":33,"method":"tools/call","params":{"name":"export_deck","arguments":{"projectId":"<projectId>","format":"pptx"}}}
\`\`\`

Always surface unresolved claim review items and exact PPTX/DOCX fallback asset IDs before delivering files.

For HTTP API clients, read \`GET /projects/<projectId>/deck/agent-trace\` after generation to audit \`agentRuns[].trace\`, generated node IDs, asset IDs, tool usage, and resource URIs.
`;
}

function perturbSeqDemoMarkdown(): string {
  return `# Perturb-seq CRISPR Agent Demo

This is the canonical source-notes-to-editable-slide happy path for biology agents. Use it when a Codex, Claude, or MCP client needs to prove it can create a useful editable scientific figure without guessing asset IDs.

## Source fixture

\`\`\`markdown
# Perturb-seq CRISPR screen

Input cells receive guide RNAs from a pooled CRISPR library. Perturb-seq links guide identity with single-cell RNA-seq readouts, creating an expression matrix for differential expression analysis.

The slide should explain the workflow from cells and guide RNA delivery through pooled screening, single-cell capture, sequencing, expression matrix construction, volcano-style hit calling, and validation of candidate genes.

Flag scientific claims for citation or human confirmation. Preserve editable scene nodes and report any PPTX fallback warnings by asset ID.
\`\`\`

## MCP sequence

1. \`recommend_workflow_pack\` with the source fixture. Expected top pack: \`perturb-seq-crispr\`.
2. \`recommend_asset_set\` with \`workflowPack: "perturb-seq-crispr"\`, \`styleProfile: "consulting-2p5d"\`, and \`responseShape: "compact"\`.
3. \`create_project\` with \`kind: "slide"\`.
4. \`import_source\` with the markdown fixture and citation/source metadata.
5. \`create_workflow_figure\` with \`templateId: "perturb-seq-workflow"\`.
6. \`validate_deck\`.
7. \`summarize_review_queue\`.
8. \`export_pack_qa_report\`.
9. \`export_deck\` for \`svg\`, \`pdf\`, and \`pptx\`.

## Expected handoff

Return a compact summary with \`projectId\`, \`workflowPack\`, \`templateId\`, \`generatedNodeIds\`, \`assetIds\`, \`reviewSummary.deliveryReadiness\`, \`reviewSummary.nextAction\`, and \`exportWarnings\`. Do not use raw SVG as the editable source.
`;
}

function clientConfigsMarkdown(): string {
  const cwd = process.cwd();
  return `# Claude and Codex MCP Client Configs

Run from the repository root or set \`cwd\` to this workspace:

\`\`\`text
${cwd}
\`\`\`

## Claude Code project \`.mcp.json\`

\`\`\`json
{
  "mcpServers": {
    "scientific-image": {
      "command": "node",
      "args": ["packages/mcp/src/server.ts"],
      "cwd": "${cwd}"
    }
  }
}
\`\`\`

## Codex \`config.toml\`

\`\`\`toml
[mcp_servers.scientific-image]
command = "node"
args = ["packages/mcp/src/server.ts"]
cwd = "${cwd}"
startup_timeout_sec = 20
tool_timeout_sec = 120
\`\`\`

Recommended first calls: \`resources/list\`, \`resources/read\` for \`scientific-image://agent/manifest\`, \`resources/read\` for \`scientific-image://agent/agent-cookbook\`, then \`tools/list\`.
`;
}

function reviewExportChecklistMarkdown(): string {
  return `# Review and Export Checklist

Before delivering files:

1. Validate scene graph and deck review state with \`validate_deck\`.
2. List unresolved review items with \`list_review_items\`.
3. Summarize delivery readiness with \`summarize_review_queue\`.
4. Confirm claims are cited, user-confirmed, unsupported, or accepted-risk.
5. Batch-resolve human-approved items with \`resolve_review_items\` when appropriate.
6. Check workflow template QA with \`get_workflow_template_qa\` when a template was used.
7. Check pack-level Office fallback behavior with \`get_workflow_pack_export_snapshot\`.
8. Name exact fallback assets and templates when PPTX embeds premium SVG instead of editable native shapes.
9. Export structured JSON or SVG for source preservation, plus PPTX/PDF for delivery.

Do not silently flatten premium assets into screenshots unless the user explicitly asks for raster-only output.
`;
}
