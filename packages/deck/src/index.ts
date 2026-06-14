import {
  addNode,
  addPage,
  addSourceDocument,
  createConnectorNode,
  createId,
  createPage,
  createShapeNode,
  createTextNode,
  createTransform,
  isEvidenceReviewNode,
  isStructuralReviewTextNode,
  manualProvenance,
  migrateProject,
  nowIso,
  setReviewItems,
  touch,
  updateNode,
  validateProject,
  type AgentRun,
  type AgentTrace,
  type AgentTraceReference,
  type DeckOutline,
  type Page,
  type Project,
  type ReviewItem,
  type ReviewItemKind,
  type ReviewSeverity,
  type ReviewStatus,
  type SceneNode,
  type SceneOperation,
  type SlideBrief,
  type SlideMeta,
  type SourceDocument,
  type SourceDocumentKind,
  type SourceSnippet,
  type ValidationIssue
} from "../../scene/src/index.ts";
import {
  createCuratedSymbolNode,
  getAsset,
  getWorkflowPack,
  getWorkflowTemplate,
  getWorkflowTemplateQa,
  listAssets,
  listWorkflowTemplates,
  type WorkflowPack,
  type WorkflowTemplate
} from "../../assets/src/index.ts";

export interface SourceInput {
  kind: SourceDocumentKind;
  name: string;
  text?: string;
  dataUri?: string;
  mimeType?: string;
  citation?: string;
  source?: string;
  license?: string;
}

export interface OutlineInput {
  title?: string;
  audience?: string;
  goal?: string;
  slideCount?: number;
  sourceIds?: string[];
}

export interface DeckValidationResult {
  ok: boolean;
  sceneIssues: ReturnType<typeof validateProject>["issues"];
  reviewItems: ReviewItem[];
}

export interface WorkflowFigureSlideMetaInput {
  pageId?: string;
  workflowPack?: string;
  templateId?: string;
  mode?: "workflow-figure" | "flagship-demo";
  replaceExistingNotes?: boolean;
}

export interface AgentTraceInput {
  workflowPack?: string;
  templateId?: string;
  styleProfile?: string;
  resourceUris?: string[];
  toolSequence?: string[];
  compactIndex?: {
    schemaVersion?: string;
    filters?: Record<string, unknown>;
    returnedAssets?: number;
    assetIds?: string[];
  };
  recommendation?: {
    tool?: string;
    responseShape?: "compact" | "full";
    semanticSlots?: string[];
    assetIds?: string[];
    insertPlanCount?: number;
  };
  insertPlan?: NonNullable<AgentTrace["insertPlan"]>;
  generatedNodeIds?: string[];
  references?: AgentTraceReference[];
}

export interface AgentRunInput {
  name: string;
  prompt: string;
  inputSourceIds?: string[];
  operations?: SceneOperation[];
  provider?: string;
  model?: string;
  trace?: AgentTraceInput;
}

export interface AgentTraceRunSummary {
  id: string;
  name: string;
  status: AgentRun["status"];
  startedAt: string;
  completedAt?: string;
  workflowPack?: string;
  templateId?: string;
  styleProfile?: string;
  toolSequence: string[];
  resourceUris: string[];
  generatedNodeIds: string[];
  assetIds: string[];
  insertPlanCount: number;
  operationCount: number;
}

export interface AgentTraceReport {
  schemaVersion: "0.1.0-agent-trace-report";
  projectId: string;
  title: string;
  runCount: number;
  tracedRunCount: number;
  untracedRunCount: number;
  generatedNodeCount: number;
  workflowPacks: string[];
  templateIds: string[];
  styleProfiles: string[];
  assetIds: string[];
  resourceUris: string[];
  toolUsage: Record<string, number>;
  latestRuns: AgentTraceRunSummary[];
  missingTraceRunIds: string[];
  nextAction: string;
}

export interface ReviewQueueActionItem {
  id: string;
  kind: ReviewItemKind;
  severity: ReviewSeverity;
  title: string;
  count: number;
  reviewItemIds: string[];
  action: string;
  blocking: boolean;
  recommendedStatus?: ReviewStatus;
}

export interface ReviewQueueSummary {
  generatedAt: string;
  okToExport: boolean;
  deliveryReadiness: "blocked" | "needs-science-review" | "needs-export-review" | "needs-layout-review" | "ready-with-notes" | "ready";
  nextAction: string;
  totals: Record<ReviewStatus | "total" | "openBlocking", number>;
  byKind: Record<ReviewItemKind, Record<ReviewStatus | ReviewSeverity | "total", number>>;
  bySeverity: Record<ReviewSeverity, number>;
  actionItems: ReviewQueueActionItem[];
  claimReview: {
    openCount: number;
    itemIds: string[];
    pageIds: string[];
    nodeIds: string[];
  };
  exportFallbacks: {
    openCount: number;
    acceptedCount: number;
    templates: string[];
    workflowPacks: string[];
    formats: string[];
    assetIds: string[];
    acceptedAssetIds: string[];
    itemIds: string[];
    acceptedItemIds: string[];
  };
  humanDecisionQueue: {
    reviewItemId: string;
    kind: ReviewItemKind;
    severity: ReviewSeverity;
    title: string;
    message: string;
    action?: string;
    pageId?: string;
    nodeId?: string;
    templateId?: string;
    workflowPack?: string;
  }[];
}

const DEFAULT_AUDIENCE = "scientific presentation audience";
const DEFAULT_GOAL = "Communicate the scientific motivation, approach, evidence, and implications clearly.";
const WORKFLOW_TEMPLATE_IDS = new Set(listWorkflowTemplates().map((template) => template.id));

export function createSourceDocument(input: SourceInput): SourceDocument {
  const text = input.text?.trim();
  return {
    id: createId("source"),
    kind: input.kind,
    name: input.name,
    text,
    dataUri: input.dataUri,
    mimeType: input.mimeType,
    snippets: text ? extractSnippets(text) : [],
    provenance: {
      kind: input.kind === "image" ? "upload" : "derived",
      source: input.source ?? input.name,
      license: input.license ?? "private/unverified",
      citation: input.citation,
      editState: "original"
    },
    createdAt: nowIso()
  };
}

export function importSource(project: Project, input: SourceInput): { project: Project; source: SourceDocument } {
  const source = createSourceDocument(input);
  return { project: addSourceDocument(migrateProject(project), source), source };
}

export function createAgentTrace(input: AgentTraceInput = {}): AgentTrace {
  const recommendation = input.recommendation
    ? {
        tool: input.recommendation.tool ?? "recommend_asset_set",
        responseShape: input.recommendation.responseShape,
        semanticSlots: uniqueStrings(input.recommendation.semanticSlots ?? []),
        assetIds: uniqueStrings(input.recommendation.assetIds ?? []),
        insertPlanCount: input.recommendation.insertPlanCount
      }
    : undefined;
  const compactIndex = input.compactIndex
    ? {
        schemaVersion: input.compactIndex.schemaVersion,
        filters: input.compactIndex.filters,
        returnedAssets: input.compactIndex.returnedAssets,
        assetIds: uniqueStrings(input.compactIndex.assetIds ?? [])
      }
    : undefined;
  return {
    workflowPack: input.workflowPack,
    templateId: input.templateId,
    styleProfile: input.styleProfile,
    resourceUris: uniqueStrings(input.resourceUris ?? []),
    toolSequence: uniqueStrings(input.toolSequence ?? []),
    compactIndex,
    recommendation,
    insertPlan: input.insertPlan?.map((item) => ({
      tool: item.tool,
      assetId: item.assetId,
      semanticRole: item.semanticRole,
      layoutHint: item.layoutHint,
      styleProfile: item.styleProfile,
      nodeId: item.nodeId
    })),
    generatedNodeIds: uniqueStrings(input.generatedNodeIds ?? []),
    references: (input.references ?? []).map((reference) => ({
      ...reference,
      assetIds: reference.assetIds ? uniqueStrings(reference.assetIds) : undefined,
      nodeIds: reference.nodeIds ? uniqueStrings(reference.nodeIds) : undefined
    }))
  };
}

export function recordAgentRun(project: Project, input: AgentRunInput): { project: Project; agentRun: AgentRun } {
  const next = migrateProject(project);
  const agentRun = createAgentRun(input);
  next.deck.agentRuns.push(agentRun);
  return { project: touch(next), agentRun };
}

export function summarizeAgentTrace(project: Project, input: { limit?: number } = {}): AgentTraceReport {
  const next = migrateProject(project);
  const limit = Math.max(1, Math.min(input.limit ?? 12, 50));
  const runs = next.deck.agentRuns;
  const tracedRuns = runs.filter((run) => Boolean(run.trace));
  const latestRuns = runs
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit)
    .map(agentTraceRunSummary);
  const toolUsage: Record<string, number> = {};
  for (const run of tracedRuns) {
    for (const tool of run.trace?.toolSequence ?? []) {
      toolUsage[tool] = (toolUsage[tool] ?? 0) + 1;
    }
  }
  const missingTraceRunIds = runs.filter((run) => !run.trace).map((run) => run.id);
  return {
    schemaVersion: "0.1.0-agent-trace-report",
    projectId: next.id,
    title: next.title,
    runCount: runs.length,
    tracedRunCount: tracedRuns.length,
    untracedRunCount: runs.length - tracedRuns.length,
    generatedNodeCount: uniqueStrings(tracedRuns.flatMap((run) => run.trace?.generatedNodeIds ?? [])).length,
    workflowPacks: uniqueStrings(tracedRuns.flatMap((run) => run.trace?.workflowPack ? [run.trace.workflowPack] : [])),
    templateIds: uniqueStrings(tracedRuns.flatMap((run) => run.trace?.templateId ? [run.trace.templateId] : [])),
    styleProfiles: uniqueStrings(tracedRuns.flatMap((run) => run.trace?.styleProfile ? [run.trace.styleProfile] : [])),
    assetIds: uniqueStrings(tracedRuns.flatMap(agentTraceAssetIds)),
    resourceUris: uniqueStrings(tracedRuns.flatMap((run) => run.trace?.resourceUris ?? [])),
    toolUsage,
    latestRuns,
    missingTraceRunIds,
    nextAction: missingTraceRunIds.length
      ? "Legacy or manual agent runs are missing trace metadata; keep new agent tools on trace-aware MCP/API routes."
      : tracedRuns.length
        ? "Use validate_deck and export_pack_qa_report before delivery; trace metadata is available for audit."
        : "No agent-created content has been recorded yet; start with get_asset_index, recommend_asset_set, then insert_premium_asset or create_workflow_figure."
  };
}

export function createDeckOutline(project: Project, input: OutlineInput = {}): { project: Project; outline: DeckOutline; agentRun: AgentRun } {
  const next = migrateProject(project);
  const sources = input.sourceIds?.length
    ? next.deck.sources.filter((source) => input.sourceIds?.includes(source.id))
    : next.deck.sources;
  const signalText = sources.flatMap((source) => source.snippets.map((snippet) => snippet.text)).join("\n");
  const title = input.title ?? inferTitle(signalText, next.title);
  const audience = input.audience ?? DEFAULT_AUDIENCE;
  const goal = input.goal ?? DEFAULT_GOAL;
  const slideCount = Math.max(4, Math.min(14, input.slideCount ?? 8));
  const outline = buildOutline({ title, audience, goal, slideCount, sourceIds: sources.map((source) => source.id), signalText });
  const agentRun = createAgentRun({
    name: "Create deck outline",
    prompt: `Create ${slideCount}-slide outline for ${title}`,
    inputSourceIds: sources.map((source) => source.id),
    operations: [{ op: "set-outline", payload: { outline } }],
    trace: {
      resourceUris: ["scientific-image://agent/manifest", "scientific-image://agent/agent-cookbook"],
      toolSequence: ["import_source", "create_deck_outline"],
      references: sources.map((source) => ({
        kind: "resource",
        id: source.id,
        label: source.name,
        summary: source.provenance.source
      }))
    }
  });
  next.deck.outline = outline;
  next.deck.agentRuns.push(agentRun);
  return { project: touch(next), outline, agentRun };
}

export function reviseDeckOutline(project: Project, instructions: string): { project: Project; outline: DeckOutline; agentRun: AgentRun } {
  const next = migrateProject(project);
  if (!next.deck.outline) throw new Error("Cannot revise deck outline before one exists.");
  const outline = {
    ...next.deck.outline,
    goal: `${next.deck.outline.goal} Revision note: ${instructions}`,
    updatedAt: nowIso(),
    status: "draft" as const,
    slides: next.deck.outline.slides.map((slide, index) => ({
      ...slide,
      narrative: index === 0 ? `${slide.narrative} Revised focus: ${instructions}` : slide.narrative,
      status: "draft" as const
    }))
  };
  const agentRun = createAgentRun({
    name: "Revise deck outline",
    prompt: instructions,
    inputSourceIds: outline.slides.flatMap((slide) => slide.requiredSources),
    operations: [{ op: "set-outline", payload: { outline } }],
    trace: {
      resourceUris: ["scientific-image://agent/manifest", "scientific-image://agent/agent-cookbook"],
      toolSequence: ["create_deck_outline", "revise_deck_outline"],
      references: [{
        kind: "tool",
        id: "revise_deck_outline",
        tool: "revise_deck_outline",
        summary: instructions.slice(0, 240)
      }]
    }
  });
  next.deck.outline = outline;
  next.deck.agentRuns.push(agentRun);
  return { project: touch(next), outline, agentRun };
}

export function approveDeckOutline(project: Project): Project {
  const next = migrateProject(project);
  if (!next.deck.outline) throw new Error("Cannot approve missing deck outline.");
  next.deck.outline.status = "approved";
  next.deck.outline.updatedAt = nowIso();
  for (const slide of next.deck.outline.slides) slide.status = "approved";
  return touch(next);
}

export function generateDeckFromOutline(project: Project): { project: Project; operations: SceneOperation[]; reviewItems: ReviewItem[]; agentRun: AgentRun } {
  let next = migrateProject(project);
  const outline = next.deck.outline;
  if (!outline) throw new Error("Cannot generate slides before creating a deck outline.");
  if (outline.status !== "approved") {
    throw new Error("Deck outline must be approved before slide generation.");
  }

  const operations: SceneOperation[] = [];
  const generatedPages: Page[] = [];
  const existingFirstPage = next.pages[0];
  next.pages = [];
  next.deck.slideMeta = {};

  for (const [index, brief] of outline.slides.entries()) {
    const page = createSlidePageFromBrief(brief, outline, index, existingFirstPage?.id);
    generatedPages.push(page);
    next = addPage(next, page);
    next.deck.slideMeta[page.id] = createSlideMeta(page, brief, outline);
    operations.push({ op: "add-page", pageId: page.id, payload: { page } });
    operations.push({ op: "update-slide-meta", pageId: page.id, payload: { meta: next.deck.slideMeta[page.id] } });
  }

  next.deck.outline.status = "generated";
  next.deck.outline.slides = next.deck.outline.slides.map((slide) => ({ ...slide, status: "generated" }));
  const reviewItems = generateReviewItems(next);
  next.deck.reviewItems = reviewItems;
  const agentRun = createAgentRun({
    name: "Generate deck slides",
    prompt: `Generate editable slides for ${outline.title}`,
    inputSourceIds: outline.slides.flatMap((slide) => slide.requiredSources),
    operations,
    trace: {
      resourceUris: ["scientific-image://agent/manifest", "scientific-image://agent/agent-cookbook"],
      toolSequence: ["create_deck_outline", "approve_deck_outline", "generate_deck_from_outline", "validate_deck"],
      generatedNodeIds: generatedPages.flatMap((page) => page.nodes.map((node) => node.id)),
      references: [{
        kind: "tool",
        id: "generate_deck_from_outline",
        tool: "generate_deck_from_outline",
        summary: `${outline.slides.length} approved slide briefs generated into editable pages.`
      }]
    }
  });
  next.deck.agentRuns.push(agentRun);
  return { project: touch(next), operations, reviewItems, agentRun };
}

export function generateSlideFromBrief(project: Project, briefId: string): { project: Project; page: Page; operations: SceneOperation[]; reviewItems: ReviewItem[] } {
  let next = migrateProject(project);
  const outline = next.deck.outline;
  if (!outline) throw new Error("Cannot generate slide before creating a deck outline.");
  const brief = outline.slides.find((candidate) => candidate.id === briefId);
  if (!brief) throw new Error(`Slide brief not found: ${briefId}`);
  const page = createSlidePageFromBrief(brief, outline, next.pages.length);
  next = addPage(next, page);
  next.deck.slideMeta[page.id] = createSlideMeta(page, brief, outline);
  const operations: SceneOperation[] = [
    { op: "add-page", pageId: page.id, payload: { page } },
    { op: "update-slide-meta", pageId: page.id, payload: { meta: next.deck.slideMeta[page.id] } }
  ];
  next.deck.reviewItems = generateReviewItems(next);
  return { project: touch(next), page, operations, reviewItems: next.deck.reviewItems };
}

export function applySceneOperations(project: Project, operations: SceneOperation[]): Project {
  let next = migrateProject(project);
  for (const operation of operations) {
    if (operation.op === "add-node") {
      next = addNode(next, operation.payload.node as SceneNode, operation.pageId);
    } else if (operation.op === "update-node") {
      if (!operation.nodeId) throw new Error("update-node operation requires nodeId.");
      next = updateNode(next, operation.nodeId, operation.payload.patch as Partial<Omit<SceneNode, "id">>, operation.pageId);
    } else if (operation.op === "delete-node") {
      if (!operation.nodeId) throw new Error("delete-node operation requires nodeId.");
      const page = operation.pageId ? next.pages.find((candidate) => candidate.id === operation.pageId) : next.pages[0];
      if (!page) throw new Error(`Page not found: ${operation.pageId ?? "<first page>"}`);
      page.nodes = page.nodes.filter((node) => node.id !== operation.nodeId);
      next = touch(next);
    } else if (operation.op === "add-page") {
      next = addPage(next, operation.payload.page as Page);
    } else if (operation.op === "update-slide-meta") {
      const meta = operation.payload.meta as SlideMeta;
      next.deck.slideMeta[meta.pageId] = meta;
      next = touch(next);
    } else if (operation.op === "set-outline") {
      next.deck.outline = operation.payload.outline as DeckOutline;
      next = touch(next);
    } else if (operation.op === "add-source") {
      next = addSourceDocument(next, operation.payload.source as SourceDocument);
    }
  }
  return next;
}

export function applyWorkflowFigureSlideMeta(project: Project, input: WorkflowFigureSlideMetaInput = {}): Project {
  const next = migrateProject(project);
  const page = input.pageId ? next.pages.find((candidate) => candidate.id === input.pageId) : next.pages[0];
  if (!page) throw new Error(`Page not found: ${input.pageId ?? "<first page>"}`);
  const context = resolveWorkflowFigureContext(page.nodes, input);
  const template = context.template;
  const pack = context.pack;
  const existing = next.deck.slideMeta[page.id];
  const title = template?.name ?? pack?.name ?? page.name;
  const speakerNotes = buildWorkflowFigureSpeakerNotes({ template, pack, mode: input.mode ?? "workflow-figure" });
  next.deck.slideMeta[page.id] = {
    pageId: page.id,
    title,
    section: pack?.name ?? existing?.section ?? "Workflow Pack",
    speakerNotes: input.replaceExistingNotes || !existing?.speakerNotes?.trim() ? speakerNotes : existing.speakerNotes,
    narrativeIntent: template?.description ?? pack?.description ?? existing?.narrativeIntent ?? "Explain the editable scientific workflow figure.",
    layoutIntent: template ? slideLayoutIntentForTemplate(template.layout) : existing?.layoutIntent ?? "workflow",
    sourceIds: existing?.sourceIds ?? []
  };
  page.name = title;
  return touch(next);
}

export function generateReviewItems(project: Project): ReviewItem[] {
  const next = migrateProject(project);
  const items: ReviewItem[] = [];
  const sceneValidation = validateProject(next);
  for (const issue of sceneValidation.issues) {
    if (issue.code === "schema.version.migration-available") continue;
    const reviewItem = reviewItemForValidationIssue(next, issue);
    if (reviewItem) items.push(createReviewItem(reviewItem));
  }
  for (const page of next.pages) {
    const meta = next.deck.slideMeta[page.id];
    if (!meta?.speakerNotes.trim()) {
      items.push(createReviewItem({
        kind: "accessibility",
        severity: "info",
        message: "Slide has no speaker notes.",
        pageId: page.id
      }));
    }
    const hasText = page.nodes.some((node) => node.kind === "text" || (node.kind === "shape" && "label" in node.payload));
    if (!hasText) {
      items.push(createReviewItem({
        kind: "layout",
        severity: "warning",
        message: "Slide needs at least one readable title or label.",
        pageId: page.id
      }));
    }
    const exportItem = createWorkflowExportReviewItem(page);
    if (exportItem) items.push(createReviewItem(exportItem));
  }
  return dedupeReviewItems(items);
}

export function validateDeck(project: Project): DeckValidationResult {
  const next = migrateProject(project);
  const reviewItems = generateReviewItems(next);
  const scene = validateProject({ ...next, deck: { ...next.deck, reviewItems } });
  return {
    ok: scene.ok && !reviewItems.some((item) => item.status === "open" && item.severity === "error"),
    sceneIssues: scene.issues,
    reviewItems
  };
}

export function summarizeReviewQueue(project: Project): ReviewQueueSummary {
  const next = migrateProject(project);
  const reviewItems = next.deck.reviewItems.length ? next.deck.reviewItems : generateReviewItems(next);
  const openItems = reviewItems.filter((item) => item.status === "open");
  const openErrors = openItems.filter((item) => item.severity === "error");
  const openWarnings = openItems.filter((item) => item.severity === "warning");
  const openInfo = openItems.filter((item) => item.severity === "info");
  const openClaims = openItems.filter((item) => item.kind === "claim" || /claim|citation|confirmation/i.test(item.message));
  const openScience = openItems.filter((item) => item.kind === "claim" || item.kind === "provenance" || /citation|provenance|confirmation/i.test(item.message));
  const openExports = openItems.filter((item) => item.kind === "export");
  const acceptedExports = reviewItems.filter((item) => item.kind === "export" && item.status === "accepted-risk");
  const openLayout = openItems.filter((item) => item.kind === "layout" || item.kind === "accessibility");
  const actionItems = createReviewQueueActionItems({ openErrors, openClaims, openScience, openExports, openLayout, openWarnings, openInfo });
  const deliveryReadiness = openErrors.length
    ? "blocked"
    : openScience.length
      ? "needs-science-review"
      : openExports.length
        ? "needs-export-review"
        : openWarnings.length
          ? "needs-layout-review"
          : openInfo.length
            ? "ready-with-notes"
            : "ready";

  return {
    generatedAt: nowIso(),
    okToExport: openErrors.length === 0,
    deliveryReadiness,
    nextAction: actionItems[0]?.action ?? "Ready for export. Keep scene JSON/SVG as source preservation alongside delivery files.",
    totals: {
      total: reviewItems.length,
      open: openItems.length,
      resolved: reviewItems.filter((item) => item.status === "resolved").length,
      "accepted-risk": reviewItems.filter((item) => item.status === "accepted-risk").length,
      openBlocking: openErrors.length
    },
    byKind: countReviewItemsByKind(reviewItems),
    bySeverity: {
      error: reviewItems.filter((item) => item.severity === "error").length,
      warning: reviewItems.filter((item) => item.severity === "warning").length,
      info: reviewItems.filter((item) => item.severity === "info").length
    },
    actionItems,
    claimReview: {
      openCount: openClaims.length,
      itemIds: openClaims.map((item) => item.id),
      pageIds: uniqueDefined(openClaims.map((item) => item.pageId)),
      nodeIds: uniqueDefined(openClaims.map((item) => item.nodeId))
    },
    exportFallbacks: summarizeExportFallbacks(openExports, acceptedExports),
    humanDecisionQueue: openItems
      .sort((a, b) => reviewPriority(a) - reviewPriority(b))
      .slice(0, 20)
      .map((item) => ({
        reviewItemId: item.id,
        kind: item.kind,
        severity: item.severity,
        title: item.title ?? titleForReviewKind(item.kind),
        message: item.message,
        action: item.action,
        pageId: item.pageId,
        nodeId: item.nodeId,
        templateId: item.templateId,
        workflowPack: item.workflowPack
      }))
  };
}

export function resolveDeckReviewItem(project: Project, reviewItemId: string, status: ReviewItem["status"] = "resolved"): Project {
  const next = migrateProject(project);
  const item = next.deck.reviewItems.find((candidate) => candidate.id === reviewItemId);
  if (!item) {
    next.deck.reviewItems = generateReviewItems(next);
  }
  const resolved = next.deck.reviewItems.find((candidate) => candidate.id === reviewItemId);
  if (!resolved) throw new Error(`Review item not found: ${reviewItemId}`);
  resolved.status = status;
  resolved.resolvedAt = nowIso();
  applyReviewResolutionToScene(next, resolved, status);
  return touch(next);
}

export function resolveDeckReviewItems(project: Project, reviewItemIds: string[], status: ReviewItem["status"] = "resolved"): Project {
  const next = migrateProject(project);
  const ids = new Set(reviewItemIds);
  if (!ids.size) throw new Error("resolveDeckReviewItems requires at least one review item id.");
  const existingIds = new Set(next.deck.reviewItems.map((item) => item.id));
  if (reviewItemIds.some((id) => !existingIds.has(id))) {
    next.deck.reviewItems = generateReviewItems(next);
  }
  const refreshedIds = new Set(next.deck.reviewItems.map((item) => item.id));
  const missing = reviewItemIds.filter((id) => !refreshedIds.has(id));
  if (missing.length) throw new Error(`Review item(s) not found: ${missing.join(", ")}`);
  const resolvedAt = nowIso();
  for (const item of next.deck.reviewItems) {
    if (ids.has(item.id)) {
      item.status = status;
      item.resolvedAt = resolvedAt;
      applyReviewResolutionToScene(next, item, status);
    }
  }
  return touch(next);
}

export function refreshDeckReviewItems(project: Project): Project {
  const next = migrateProject(project);
  return setReviewItems(next, generateReviewItems(next));
}

function buildOutline(input: { title: string; audience: string; goal: string; slideCount: number; sourceIds: string[]; signalText: string }): DeckOutline {
  const sectionTitles = ["Context", "Approach", "Evidence", "Implications"];
  const sections = sectionTitles.map((title) => ({
    id: createId("section"),
    title,
    summary: sectionSummary(title, input.signalText),
    slideIds: [] as string[]
  }));
  const slidePatterns: SlideBrief["layoutIntent"][] = ["title", "mechanism", "workflow", "results", "comparison", "results", "summary", "summary"];
  const slideTitles = inferSlideTitles(input.title, input.signalText, input.slideCount);
  const slides: SlideBrief[] = slideTitles.map((title, index) => {
    const section = sections[Math.min(sections.length - 1, Math.floor(index / Math.ceil(input.slideCount / sections.length)))];
    const slide: SlideBrief = {
      id: createId("brief"),
      title,
      sectionId: section.id,
      goal: index === 0 ? `Frame ${input.title} for ${input.audience}.` : `Advance the story: ${title}.`,
      narrative: inferNarrative(title, input.signalText),
      layoutIntent: slidePatterns[index % slidePatterns.length],
      requiredSources: input.sourceIds.slice(0, 3),
      status: "draft"
    };
    section.slideIds.push(slide.id);
    return slide;
  });
  const timestamp = nowIso();
  return {
    id: createId("outline"),
    audience: input.audience,
    goal: input.goal,
    title: input.title,
    sections,
    slides,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function createSlidePageFromBrief(brief: SlideBrief, outline: DeckOutline, index: number, preferredFirstPageId?: string): Page {
  const page = createPage("slide", brief.title);
  if (index === 0 && preferredFirstPageId) page.id = preferredFirstPageId;
  page.background = index % 3 === 0 ? "#f8fafc" : index % 3 === 1 ? "#f0fdf4" : "#eff6ff";
  page.nodes = buildSlideNodes(brief, outline, index);
  return page;
}

function buildSlideNodes(brief: SlideBrief, outline: DeckOutline, index: number): SceneNode[] {
  const nodes: SceneNode[] = [];
  nodes.push(createTextNode(brief.title, createTransform(72, 44, 760, 58), {
    color: "#0f172a",
    fontSize: index === 0 ? 38 : 30,
    fontWeight: 800
  }));
  const subtitle = index === 0 ? outline.goal : brief.narrative;
  nodes.push(createTextNode(subtitle, createTransform(76, 112, 760, 82), {
    color: "#475569",
    fontSize: 18,
    fontWeight: 500
  }));

  if (brief.layoutIntent === "workflow" || brief.layoutIntent === "mechanism") {
    const labels = ["Input", "Analysis", "Evidence", "Decision"];
    const colors = [
      ["#dcfce7", "#16a34a"],
      ["#dbeafe", "#2563eb"],
      ["#fef3c7", "#d97706"],
      ["#fae8ff", "#c026d3"]
    ];
    for (let i = 0; i < labels.length; i += 1) {
      nodes.push(createShapeNode("round-rect", labels[i], createTransform(90 + i * 275, 300, 190, 110), {
        fill: colors[i][0],
        stroke: colors[i][1],
        strokeWidth: 3,
        fontSize: 19
      }));
      if (i > 0) nodes.push(createConnectorNode([{ x: 90 + (i - 1) * 275 + 190, y: 355 }, { x: 90 + i * 275, y: 355 }]));
    }
  } else if (brief.layoutIntent === "comparison") {
    nodes.push(createShapeNode("round-rect", "Current state", createTransform(100, 280, 430, 210), {
      fill: "#e0f2fe",
      stroke: "#0284c7",
      strokeWidth: 3,
      fontSize: 24
    }));
    nodes.push(createShapeNode("round-rect", "Proposed advance", createTransform(680, 280, 430, 210), {
      fill: "#dcfce7",
      stroke: "#16a34a",
      strokeWidth: 3,
      fontSize: 24
    }));
  } else if (brief.layoutIntent === "results") {
    nodes.push(createShapeNode("round-rect", "Key result", createTransform(96, 250, 450, 270), {
      fill: "#ffffff",
      stroke: "#2563eb",
      strokeWidth: 3,
      fontSize: 26
    }));
    nodes.push(createShapeNode("round-rect", "Interpretation", createTransform(680, 250, 420, 270), {
      fill: "#fff7ed",
      stroke: "#ea580c",
      strokeWidth: 3,
      fontSize: 24
    }));
  } else {
    const asset = chooseAssetForBrief(brief);
    nodes.push(createCuratedSymbolNode({
      assetId: asset,
      x: 875,
      y: 160,
      width: 230,
      height: 160,
      label: brief.layoutIntent === "title" ? "Scientific visual story" : "Take-home model",
      style: {
        fill: "#e0f2fe",
        stroke: "#2563eb",
        strokeWidth: 3,
        fontSize: 18
      }
    }));
    nodes.push(createShapeNode("round-rect", "Take-home message", createTransform(120, 330, 610, 150), {
      fill: "#ecfeff",
      stroke: "#0891b2",
      strokeWidth: 3,
      fontSize: 25
    }));
  }

  nodes.push(createTextNode(`Review: cite claims and confirm slide ${index + 1}`, createTransform(72, 640, 520, 34), {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500
  }));
  return nodes.map((node, z) => ({ ...node, transform: { ...node.transform, z } }));
}

function createSlideMeta(page: Page, brief: SlideBrief, outline: DeckOutline): SlideMeta {
  const section = outline.sections.find((candidate) => candidate.id === brief.sectionId);
  return {
    pageId: page.id,
    outlineSlideId: brief.id,
    title: brief.title,
    section: section?.title ?? "Deck",
    speakerNotes: `${brief.goal}\n\n${brief.narrative}`,
    narrativeIntent: brief.narrative,
    layoutIntent: brief.layoutIntent,
    sourceIds: brief.requiredSources
  };
}

function reviewItemForValidationIssue(project: Project, issue: ValidationIssue): Omit<ReviewItem, "id" | "status" | "createdAt"> | null {
  const severity = issue.severity === "error" ? "error" : "warning";
  const page = issue.pageId ? project.pages.find((candidate) => candidate.id === issue.pageId) : undefined;
  const node = page && issue.nodeId ? page.nodes.find((candidate) => candidate.id === issue.nodeId) : undefined;
  if (!node) {
    return {
      kind: issue.code.includes("provenance") ? "provenance" : issue.code.includes("bounds") || issue.code.includes("size") ? "layout" : issue.code.includes("claim") ? "claim" : "export",
      severity,
      title: titleForIssueCode(issue.code),
      message: issue.message,
      action: actionForIssueCode(issue.code),
      pageId: issue.pageId,
      nodeId: issue.nodeId
    };
  }

  const context = reviewContextFromNode(node);
  const label = reviewNodeLabel(node);
  const pageText = page ? ` on ${page.name}` : "";
  if (issue.code === "node.claim.needs-citation") {
    if (isStructuralReviewTextNode(node)) return null;
    if (isEvidenceReviewNode(node)) {
      return {
        kind: "provenance",
        severity,
        title: `Verify evidence source: ${label}`,
        message: `${label}${pageText} is a data-derived evidence object that needs source verification before delivery.`,
        action: "Attach the table/source citation, verify encodings and labels, then resolve after human scientific review.",
        pageId: issue.pageId,
        nodeId: issue.nodeId,
        ...context
      };
    }
    return {
      kind: "claim",
      severity,
      title: `Confirm or cite: ${label}`,
      message: `${label}${pageText} is marked as a scientific claim or data-derived visual that needs citation/user confirmation.`,
      action: "Attach a source/citation, rewrite as draft visual language, or resolve only after human scientific review.",
      pageId: issue.pageId,
      nodeId: issue.nodeId,
      ...context
    };
  }
  if (issue.code === "node.claim.unsupported") {
    return {
      kind: "claim",
      severity,
      title: `Fix unsupported claim: ${label}`,
      message: `${label}${pageText} is explicitly marked unsupported and should not ship in a final scientific deck.`,
      action: "Delete the claim, rewrite it as a caveat, or attach supporting evidence before changing the claim status.",
      pageId: issue.pageId,
      nodeId: issue.nodeId,
      ...context
    };
  }
  if (issue.code === "node.provenance.missing") {
    return {
      kind: "provenance",
      severity,
      title: `Complete provenance: ${label}`,
      message: `${label}${pageText} is missing source and/or license metadata.`,
      action: "Add source and license metadata, attach a citation, or mark the object private/unverified before export.",
      pageId: issue.pageId,
      nodeId: issue.nodeId,
      ...context
    };
  }
  if (issue.code === "node.ai.needs-review") {
    return {
      kind: "claim",
      severity,
      title: `Review generated asset: ${label}`,
      message: `${label}${pageText} was generated by AI and still needs human scientific review.`,
      action: "Inspect the visual for scientific accuracy, provenance, and dual-use sensitivity before resolving.",
      pageId: issue.pageId,
      nodeId: issue.nodeId,
      ...context
    };
  }
  if (issue.code.includes("bounds") || issue.code.includes("size")) {
    return {
      kind: "layout",
      severity,
      title: `Fix layout: ${label}`,
      message: `${label}${pageText} has a layout or bounds issue that may break export/readability.`,
      action: "Move, resize, or remove the object so it stays inside the slide and remains readable.",
      pageId: issue.pageId,
      nodeId: issue.nodeId,
      ...context
    };
  }
  return {
    kind: issue.code.includes("provenance") ? "provenance" : issue.code.includes("claim") ? "claim" : "export",
    severity,
    title: titleForIssueCode(issue.code),
    message: issue.message,
    action: actionForIssueCode(issue.code),
    pageId: issue.pageId,
    nodeId: issue.nodeId,
    ...context
  };
}

function reviewContextFromNode(node: SceneNode): Partial<Omit<ReviewItem, "id" | "status" | "createdAt">> {
  const payload = node.payload as Record<string, unknown>;
  const templateId = typeof payload.templateId === "string" ? payload.templateId : templateIdFromLayoutHint(payload.layoutHint);
  const workflowPack = typeof payload.workflowPack === "string" ? payload.workflowPack : undefined;
  const metrics: ReviewItem["metrics"] = {};
  if (typeof payload.semanticRole === "string") metrics.semanticRole = payload.semanticRole;
  if (typeof payload.layoutHint === "string") metrics.layoutHint = payload.layoutHint;
  if (node.claimStatus) metrics.claimStatus = node.claimStatus;
  if (node.provenance?.kind) metrics.provenanceKind = node.provenance.kind;
  if (node.provenance?.license) metrics.license = node.provenance.license;
  return {
    templateId: templateId || undefined,
    workflowPack,
    metrics: Object.keys(metrics).length ? metrics : undefined
  };
}

function reviewNodeLabel(node: SceneNode): string {
  const payload = node.payload as Record<string, unknown>;
  const candidate = payload.label ?? payload.text ?? (payload.spec as { title?: unknown } | undefined)?.title ?? node.name ?? node.id;
  return String(candidate).slice(0, 72);
}

function titleForIssueCode(code: string): string {
  if (code.includes("provenance")) return "Complete provenance";
  if (code.includes("bounds") || code.includes("size")) return "Fix layout bounds";
  if (code.includes("claim")) return "Review scientific claim";
  if (code.includes("ai")) return "Review generated visual";
  return "Review export readiness";
}

function actionForIssueCode(code: string): string {
  if (code.includes("provenance")) return "Add source/license metadata or mark the object private/unverified before export.";
  if (code.includes("bounds") || code.includes("size")) return "Move or resize the object until it is readable and inside the page bounds.";
  if (code.includes("claim")) return "Attach evidence, rewrite the claim, or confirm it after human scientific review.";
  if (code.includes("ai")) return "Human-review generated content before resolving this item.";
  return "Inspect and resolve this item before final delivery.";
}

function createReviewItem(input: Omit<ReviewItem, "id" | "status" | "createdAt">): ReviewItem {
  return {
    id: createId("review"),
    status: "open",
    createdAt: nowIso(),
    ...input
  };
}

function createWorkflowExportReviewItem(page: Page): Omit<ReviewItem, "id" | "status" | "createdAt"> | null {
  const qa = workflowTemplateQaForPage(page);
  const pptx = qa?.exportReadiness.pptx;
  if (!pptx) return createPagePremiumExportReviewItem(page);
  if (!pptx.premiumAssetFallbackCount && !pptx.plotFallbackCount) return null;
  const fallbackNames = pptx.fallbackAssets.slice(0, 4).map((asset) => asset.name || asset.assetId);
  const details = fallbackNames.length ? ` Assets: ${fallbackNames.join(", ")}.` : "";
  return {
    kind: "export",
    severity: pptx.premiumAssetFallbackCount ? "warning" : "info",
    title: "Review PPTX fallback fidelity",
    message: `Template ${qa.templateId} PPTX export uses ${pptx.premiumAssetFallbackCount} premium SVG fallback asset(s) and ${pptx.plotFallbackCount} plot placeholder(s). Review fallback fidelity before sending editable PPTX.${details}`,
    action: pptx.nextAction,
    templateId: qa.templateId,
    workflowPack: qa.workflowPack,
    exportFormat: "pptx",
    metrics: {
      premiumAssetFallbackCount: pptx.premiumAssetFallbackCount,
      plotFallbackCount: pptx.plotFallbackCount
    },
    fallbackAssets: pptx.fallbackAssets.slice(0, 8).map((asset) => ({
      assetId: asset.assetId,
      name: asset.name,
      qualityTier: asset.qualityTier,
      assetRecipe: asset.assetRecipe,
      exportBehavior: asset.exportBehavior,
      action: asset.action
    })),
    pageId: page.id
  };
}

function createPagePremiumExportReviewItem(page: Page): Omit<ReviewItem, "id" | "status" | "createdAt"> | null {
  const fallback = collectPremiumPptxFallbacks(page);
  if (!fallback.assets.length && !fallback.plotFallbackCount && !fallback.imageOrGroupFallbackCount) return null;
  const fallbackNames = fallback.assets.slice(0, 4).map((asset) => asset.name || asset.assetId);
  const details = fallbackNames.length ? ` Assets: ${fallbackNames.join(", ")}.` : "";
  const complexCount = fallback.plotFallbackCount + fallback.imageOrGroupFallbackCount;
  const complexDetails = complexCount ? ` Complex plot/image/group fallback count: ${complexCount}.` : "";
  return {
    kind: "export",
    severity: fallback.assets.length ? "warning" : "info",
    title: "Review PPTX fallback fidelity",
    message: `PPTX export will simplify ${fallback.assets.length} premium layered asset(s) to editable placeholders.${complexDetails} Review fallback fidelity before sending editable PPTX.${details}`,
    action: "Before sending PPTX, inspect named fallback assets, accept the Office limitation, or export SVG/PDF for exact premium rendering.",
    exportFormat: "pptx",
    metrics: {
      premiumAssetFallbackCount: fallback.assets.length,
      plotFallbackCount: fallback.plotFallbackCount,
      imageOrGroupFallbackCount: fallback.imageOrGroupFallbackCount
    },
    fallbackAssets: fallback.assets.slice(0, 8),
    pageId: page.id
  };
}

function collectPremiumPptxFallbacks(page: Page): {
  assets: NonNullable<ReviewItem["fallbackAssets"]>;
  plotFallbackCount: number;
  imageOrGroupFallbackCount: number;
} {
  const seen = new Set<string>();
  const assets: NonNullable<ReviewItem["fallbackAssets"]> = [];
  let plotFallbackCount = 0;
  let imageOrGroupFallbackCount = 0;
  for (const node of page.nodes) {
    if (node.kind === "plot") plotFallbackCount += 1;
    if (node.kind === "image" || node.kind === "group") imageOrGroupFallbackCount += 1;
    if (node.kind !== "symbol") continue;
    const payload = node.payload as Record<string, unknown>;
    const assetId = typeof payload.assetId === "string" ? payload.assetId : "";
    if (!assetId || seen.has(assetId)) continue;
    try {
      const asset = getAsset(assetId);
      const premium = asset.qualityTier === "signature" || asset.qualityTier === "hero";
      const layered = Number(asset.renderSpec?.version ?? 0) >= 2 || Boolean(asset.renderSpec?.assetRecipe);
      if (!premium || !layered) continue;
      seen.add(assetId);
      assets.push({
        assetId,
        name: asset.name,
        qualityTier: asset.qualityTier,
        assetRecipe: asset.renderSpec.assetRecipe,
        exportBehavior: "embed-svg-fallback",
        action: "Use SVG/PDF for exact rendering or accept PPTX placeholder simplification."
      });
    } catch {
      // Unknown custom symbols are left to general scene validation/provenance checks.
    }
  }
  return { assets, plotFallbackCount, imageOrGroupFallbackCount };
}

function resolveWorkflowFigureContext(nodes: SceneNode[], input: WorkflowFigureSlideMetaInput): {
  pack?: WorkflowPack;
  template?: WorkflowTemplate;
} {
  const inferred = inferWorkflowFigureIds(nodes);
  const templateId = input.templateId ?? inferred.templateId;
  let template: WorkflowTemplate | undefined;
  let pack: WorkflowPack | undefined;
  if (templateId) {
    try {
      template = getWorkflowTemplate(templateId);
    } catch {
      template = undefined;
    }
  }
  const packId = input.workflowPack ?? template?.workflowPack ?? inferred.workflowPack;
  if (packId) {
    try {
      pack = getWorkflowPack(packId);
    } catch {
      pack = undefined;
    }
  }
  return { pack, template };
}

function inferWorkflowFigureIds(nodes: SceneNode[]): { workflowPack?: string; templateId?: string } {
  for (const node of nodes) {
    const payload = node.payload as Record<string, unknown>;
    const templateId = typeof payload.templateId === "string" ? payload.templateId : templateIdFromLayoutHint(payload.layoutHint);
    const workflowPack = typeof payload.workflowPack === "string" ? payload.workflowPack : undefined;
    if (templateId || workflowPack) return { templateId, workflowPack };
  }
  return {};
}

function buildWorkflowFigureSpeakerNotes(input: {
  template?: WorkflowTemplate;
  pack?: WorkflowPack;
  mode: NonNullable<WorkflowFigureSlideMetaInput["mode"]>;
}): string {
  const title = input.template?.name ?? input.pack?.name ?? "Scientific workflow figure";
  const description = input.template?.description ?? input.pack?.description ?? "Editable structured scientific figure.";
  const qa = input.template?.qaChecklist?.length ? input.template.qaChecklist.slice(0, 3) : [
    "Confirm scientific claims and labels against sources.",
    "Review provenance and citation status before final export.",
    "Use SVG/PDF for exact visual fidelity when PPTX fallbacks are accepted."
  ];
  const agentHints = input.template?.agentUseHints?.length
    ? input.template.agentUseHints.slice(0, 2)
    : input.pack?.agentUseHints?.slice(0, 2) ?? [];
  const lines = [
    `${title}: ${description}`,
    "",
    input.mode === "flagship-demo"
      ? "Speaker cue: present this as the workflow pack's flagship editable demo, then resolve review queue items before export."
      : "Speaker cue: walk through the editable workflow from inputs to evidence, decision points, and export-ready outputs.",
    "",
    `QA focus: ${qa.join(" ")}`
  ];
  if (agentHints.length) {
    lines.push("", `Agent use: ${agentHints.join(" ")}`);
  }
  lines.push(
    "",
    "Export note: keep scene JSON/SVG as the canonical source; accept PPTX fallback warnings only after human review."
  );
  return lines.join("\n");
}

function slideLayoutIntentForTemplate(layout: WorkflowTemplate["layout"]): SlideMeta["layoutIntent"] {
  if (layout === "results" || layout === "multi-panel") return "results";
  if (layout === "workflow" || layout === "pipeline" || layout === "architecture") return "workflow";
  return "summary";
}

function workflowTemplateQaForPage(page: Page) {
  const templateCounts = new Map<string, number>();
  for (const node of page.nodes) {
    const payload = node.payload as Record<string, unknown>;
    const templateId = typeof payload.templateId === "string" ? payload.templateId : templateIdFromLayoutHint(payload.layoutHint);
    if (templateId && WORKFLOW_TEMPLATE_IDS.has(templateId)) {
      templateCounts.set(templateId, (templateCounts.get(templateId) ?? 0) + 1);
    }
  }
  const templateId = mostFrequentKey(templateCounts);
  return templateId ? getWorkflowTemplateQa(templateId) : null;
}

function templateIdFromLayoutHint(layoutHint: unknown): string {
  if (typeof layoutHint !== "string") return "";
  const [candidate] = layoutHint.split(":");
  return WORKFLOW_TEMPLATE_IDS.has(candidate) ? candidate : "";
}

function mostFrequentKey(counts: Map<string, number>): string {
  let selected = "";
  let best = 0;
  for (const [key, count] of counts.entries()) {
    if (count > best) {
      selected = key;
      best = count;
    }
  }
  return selected;
}

function createAgentRun(input: AgentRunInput): AgentRun {
  const timestamp = nowIso();
  return {
    id: createId("agent"),
    name: input.name,
    prompt: input.prompt,
    provider: input.provider ?? "local-deterministic",
    model: input.model ?? "scientific-image-agent-v0",
    inputSourceIds: input.inputSourceIds ?? [],
    operations: input.operations ?? [],
    status: "completed",
    startedAt: timestamp,
    completedAt: timestamp,
    trace: input.trace ? createAgentTrace(input.trace) : undefined
  };
}

function agentTraceRunSummary(run: AgentRun): AgentTraceRunSummary {
  return {
    id: run.id,
    name: run.name,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    workflowPack: run.trace?.workflowPack,
    templateId: run.trace?.templateId,
    styleProfile: run.trace?.styleProfile,
    toolSequence: run.trace?.toolSequence ?? [],
    resourceUris: run.trace?.resourceUris ?? [],
    generatedNodeIds: run.trace?.generatedNodeIds ?? [],
    assetIds: agentTraceAssetIds(run),
    insertPlanCount: run.trace?.insertPlan?.length ?? 0,
    operationCount: run.operations.length
  };
}

function agentTraceAssetIds(run: AgentRun): string[] {
  return uniqueStrings([
    ...(run.trace?.compactIndex?.assetIds ?? []),
    ...(run.trace?.recommendation?.assetIds ?? []),
    ...(run.trace?.insertPlan?.map((item) => item.assetId) ?? []),
    ...((run.trace?.references ?? []).flatMap((reference) => reference.assetIds ?? []))
  ]);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function applyReviewResolutionToScene(project: Project, item: ReviewItem, status: ReviewItem["status"]): void {
  if (status !== "resolved") return;
  if (item.kind !== "claim" || !item.nodeId) return;
  for (const page of project.pages) {
    if (item.pageId && page.id !== item.pageId) continue;
    const node = page.nodes.find((candidate) => candidate.id === item.nodeId);
    if (node && node.claimStatus === "needs-citation") {
      node.claimStatus = "user-confirmed";
      node.provenance = {
        ...node.provenance,
        editState: "modified"
      };
      return;
    }
  }
}

function extractSnippets(text: string): SourceSnippet[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headings = lines.filter((line) => /^#{1,4}\s+/.test(line)).map((line) => line.replace(/^#{1,4}\s+/, ""));
  const candidates = headings.length ? headings : lines.filter((line) => line.length > 40);
  return candidates.slice(0, 12).map((line, index) => ({
    id: createId("snippet"),
    text: line.slice(0, 360),
    locator: headings.length ? "heading" : `paragraph-${index + 1}`
  }));
}

function inferTitle(signalText: string, fallback: string): string {
  const heading = signalText.split(/\r?\n/).find((line) => line.length > 8 && line.length < 90);
  return heading?.replace(/^#+\s*/, "") ?? fallback;
}

function inferSlideTitles(title: string, signalText: string, count: number): string[] {
  const headings = signalText
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter((line) => line.length > 8 && line.length < 72);
  const defaults = [
    title,
    "Why this problem matters",
    "Scientific and technical context",
    "Experimental or computational approach",
    "Core workflow",
    "Key evidence",
    "Interpretation and risks",
    "Take-home message"
  ];
  const merged = [...new Set([title, ...headings, ...defaults])];
  return merged.slice(0, count);
}

function inferNarrative(title: string, signalText: string): string {
  const sentence = signalText
    .split(/(?<=[.!?])\s+/)
    .find((candidate) => candidate.toLowerCase().includes(title.toLowerCase().split(/\s+/)[0] ?? ""));
  return sentence?.slice(0, 180) ?? `Use this slide to explain ${title.toLowerCase()} with clear scientific provenance.`;
}

function sectionSummary(title: string, signalText: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("context")) return "Motivation, background, and why the audience should care.";
  if (normalized.includes("approach")) return "Methods, workflow, inputs, and analysis strategy.";
  if (normalized.includes("evidence")) return "Results, comparisons, figures, and confidence-building details.";
  if (normalized.includes("implications")) return "Takeaways, caveats, risks, and next steps.";
  return signalText.slice(0, 140) || "Deck section.";
}

function chooseAssetForBrief(brief: SlideBrief): string {
  const text = `${brief.title} ${brief.narrative}`.toLowerCase();
  const candidates = text.includes("ai") || text.includes("model")
    ? listAssets("model")
    : text.includes("risk") || text.includes("safety")
      ? listAssets("risk")
      : text.includes("dna") || text.includes("crispr")
        ? listAssets("crispr")
        : listAssets("cell");
  return candidates[0]?.id ?? "cell-immune";
}

function dedupeReviewItems(items: ReviewItem[]): ReviewItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.kind}:${item.severity}:${item.pageId ?? ""}:${item.nodeId ?? ""}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createReviewQueueActionItems(input: {
  openErrors: ReviewItem[];
  openClaims: ReviewItem[];
  openScience: ReviewItem[];
  openExports: ReviewItem[];
  openLayout: ReviewItem[];
  openWarnings: ReviewItem[];
  openInfo: ReviewItem[];
}): ReviewQueueActionItem[] {
  const actions: ReviewQueueActionItem[] = [];
  if (input.openErrors.length) {
    actions.push({
      id: "fix-blocking-review-errors",
      kind: input.openErrors[0].kind,
      severity: "error",
      title: "Fix blocking review errors",
      count: input.openErrors.length,
      reviewItemIds: input.openErrors.map((item) => item.id),
      action: "Fix unsupported claims or invalid scene issues before exporting delivery files.",
      blocking: true
    });
  }
  if (input.openScience.length) {
    actions.push({
      id: "confirm-or-cite-scientific-claims",
      kind: input.openScience.some((item) => item.kind === "claim") ? "claim" : "provenance",
      severity: input.openScience.some((item) => item.severity === "error") ? "error" : "warning",
      title: "Confirm or cite scientific claims",
      count: input.openScience.length,
      reviewItemIds: input.openScience.map((item) => item.id),
      action: "Attach citations, edit unsupported language, or mark these items as accepted-risk only after human review.",
      blocking: input.openScience.some((item) => item.severity === "error"),
      recommendedStatus: "resolved"
    });
  }
  if (input.openExports.length) {
    actions.push({
      id: "review-office-export-fallbacks",
      kind: "export",
      severity: input.openExports.some((item) => item.severity === "error") ? "error" : "warning",
      title: "Review Office export fallbacks",
      count: input.openExports.length,
      reviewItemIds: input.openExports.map((item) => item.id),
      action: "Check named PPTX/DOCX fallback assets and prefer SVG/PDF when exact premium rendering matters.",
      blocking: input.openExports.some((item) => item.severity === "error"),
      recommendedStatus: "accepted-risk"
    });
  }
  const layoutOnly = input.openLayout.filter((item) => !input.openScience.includes(item) && !input.openExports.includes(item));
  if (layoutOnly.length) {
    actions.push({
      id: "resolve-layout-accessibility-warnings",
      kind: layoutOnly.some((item) => item.kind === "layout") ? "layout" : "accessibility",
      severity: layoutOnly.some((item) => item.severity === "warning") ? "warning" : "info",
      title: "Resolve layout and speaker-note warnings",
      count: layoutOnly.length,
      reviewItemIds: layoutOnly.map((item) => item.id),
      action: "Add speaker notes, readable labels, or fix layout warnings before final presentation use.",
      blocking: false,
      recommendedStatus: "resolved"
    });
  }
  const uncategorizedWarnings = input.openWarnings.filter((item) => !actions.some((action) => action.reviewItemIds.includes(item.id)));
  if (uncategorizedWarnings.length) {
    actions.push({
      id: "review-remaining-warnings",
      kind: uncategorizedWarnings[0].kind,
      severity: "warning",
      title: "Review remaining warnings",
      count: uncategorizedWarnings.length,
      reviewItemIds: uncategorizedWarnings.map((item) => item.id),
      action: "Inspect remaining warnings and resolve or accept risk before delivery.",
      blocking: false
    });
  }
  const uncategorizedInfo = input.openInfo.filter((item) => !actions.some((action) => action.reviewItemIds.includes(item.id)));
  if (uncategorizedInfo.length) {
    actions.push({
      id: "review-informational-items",
      kind: uncategorizedInfo[0].kind,
      severity: "info",
      title: "Review informational items",
      count: uncategorizedInfo.length,
      reviewItemIds: uncategorizedInfo.map((item) => item.id),
      action: "Resolve informational review items when they are no longer useful reminders.",
      blocking: false,
      recommendedStatus: "resolved"
    });
  }
  return actions.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function countReviewItemsByKind(reviewItems: ReviewItem[]): ReviewQueueSummary["byKind"] {
  const kinds: ReviewItemKind[] = ["claim", "provenance", "layout", "accessibility", "export"];
  const empty = () => ({
    total: 0,
    open: 0,
    resolved: 0,
    "accepted-risk": 0,
    error: 0,
    warning: 0,
    info: 0
  });
  const counts = Object.fromEntries(kinds.map((kind) => [kind, empty()])) as ReviewQueueSummary["byKind"];
  for (const item of reviewItems) {
    counts[item.kind].total += 1;
    counts[item.kind][item.status] += 1;
    counts[item.kind][item.severity] += 1;
  }
  return counts;
}

function summarizeExportFallbacks(openExports: ReviewItem[], acceptedExports: ReviewItem[] = []): ReviewQueueSummary["exportFallbacks"] {
  const assets = openExports.flatMap((item) => item.fallbackAssets ?? []);
  const acceptedAssets = acceptedExports.flatMap((item) => item.fallbackAssets ?? []);
  return {
    openCount: openExports.length,
    acceptedCount: acceptedExports.length,
    templates: uniqueDefined(openExports.map((item) => item.templateId)),
    workflowPacks: uniqueDefined(openExports.map((item) => item.workflowPack)),
    formats: uniqueDefined(openExports.map((item) => item.exportFormat)),
    assetIds: uniqueDefined(assets.map((asset) => asset.assetId)),
    acceptedAssetIds: uniqueDefined(acceptedAssets.map((asset) => asset.assetId)),
    itemIds: openExports.map((item) => item.id),
    acceptedItemIds: acceptedExports.map((item) => item.id)
  };
}

function titleForReviewKind(kind: ReviewItemKind): string {
  if (kind === "claim") return "Claim review";
  if (kind === "provenance") return "Provenance review";
  if (kind === "layout") return "Layout review";
  if (kind === "accessibility") return "Accessibility review";
  return "Export review";
}

function reviewPriority(item: ReviewItem): number {
  return severityRank(item.severity) * 10 + kindRank(item.kind);
}

function severityRank(severity: ReviewSeverity): number {
  if (severity === "error") return 0;
  if (severity === "warning") return 1;
  return 2;
}

function kindRank(kind: ReviewItemKind): number {
  if (kind === "claim") return 0;
  if (kind === "provenance") return 1;
  if (kind === "export") return 2;
  if (kind === "layout") return 3;
  return 4;
}

function uniqueDefined<T extends string | undefined>(values: T[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
