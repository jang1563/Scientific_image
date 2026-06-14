import type {
  Asset,
  ClaimStatus,
  DeckState,
  Page,
  PageKind,
  PlotSpec,
  Project,
  ReviewItem,
  SourceDocument,
  Provenance,
  SceneNode,
  SceneNodeKind,
  ShapeKind,
  Style,
  TextPayload,
  Transform,
  ValidationIssue,
  ValidationResult
} from "./types.ts";

export * from "./types.ts";

export const SCHEMA_VERSION = "0.2.0" as const;
export const SUPPORTED_SCHEMA_VERSIONS = ["0.1.0", "0.2.0"] as const;

export const DEFAULT_THEME = {
  id: "professional-bio-ai",
  name: "Professional Biology + AI",
  background: "#f8fafc",
  palette: ["#0f172a", "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b"],
  fontFamily: "Inter, Arial, sans-serif"
};

export const PAGE_PRESETS: Record<PageKind, { width: number; height: number; unit: "px"; name: string }> = {
  slide: { width: 1280, height: 720, unit: "px", name: "16:9 Slide" },
  figure: { width: 1200, height: 900, unit: "px", name: "Manuscript Figure" },
  poster: { width: 1600, height: 2200, unit: "px", name: "Conference Poster" }
};

export function createId(prefix: string): string {
  const maybeCrypto = globalThis.crypto as Crypto | undefined;
  if (maybeCrypto?.randomUUID) {
    return `${prefix}_${maybeCrypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function manualProvenance(source = "User-authored scene object"): Provenance {
  return {
    kind: "manual",
    source,
    license: "private/unverified",
    editState: "modified"
  };
}

export function curatedProvenance(source: string, citation?: string): Provenance {
  return {
    kind: "curated",
    source,
    license: "CC0-1.0",
    citation,
    editState: "original"
  };
}

export function createProject(title = "Untitled scientific visual", kind: PageKind = "slide"): Project {
  const timestamp = nowIso();
  const firstPage = createPage(kind);
  return {
    schemaVersion: SCHEMA_VERSION,
    id: createId("project"),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    pages: [firstPage],
    assets: [],
    theme: { ...DEFAULT_THEME },
    citations: [],
    deck: createDeckState(firstPage)
  };
}

export function createDeckState(firstPage?: Page): DeckState {
  return {
    slideMeta: firstPage
      ? {
          [firstPage.id]: {
            pageId: firstPage.id,
            title: firstPage.name,
            section: "Opening",
            speakerNotes: "",
            narrativeIntent: "Introduce the scientific story and orient the audience.",
            layoutIntent: "title",
            sourceIds: []
          }
        }
      : {},
    sources: [],
    reviewItems: [],
    agentRuns: []
  };
}

export function migrateProject(input: Project | Record<string, unknown>): Project {
  const project = cloneProject(input as Project);
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(project.schemaVersion as "0.1.0" | "0.2.0")) {
    throw new Error(`Unsupported schema version ${project.schemaVersion}`);
  }
  if (!project.deck) {
    project.deck = createDeckState();
  }
  project.deck.slideMeta ??= {};
  project.deck.sources ??= [];
  project.deck.reviewItems ??= [];
  project.deck.agentRuns ??= [];
  for (const page of project.pages ?? []) {
    project.deck.slideMeta[page.id] ??= {
      pageId: page.id,
      title: page.name,
      section: page.kind === "poster" ? "Poster" : "Deck",
      speakerNotes: "",
      narrativeIntent: "Migrated visual page.",
      layoutIntent: page.kind === "slide" ? "summary" : "results",
      sourceIds: []
    };
  }
  project.schemaVersion = SCHEMA_VERSION;
  return project;
}

export function createPage(kind: PageKind = "slide", name?: string): Page {
  const preset = PAGE_PRESETS[kind];
  return {
    id: createId("page"),
    kind,
    name: name ?? preset.name,
    width: preset.width,
    height: preset.height,
    unit: preset.unit,
    background: DEFAULT_THEME.background,
    nodes: []
  };
}

export function addPage(project: Project, page: Page): Project {
  const next = cloneProject(project);
  next.pages.push(page);
  next.deck ??= createDeckState();
  next.deck.slideMeta[page.id] ??= {
    pageId: page.id,
    title: page.name,
    section: page.kind === "poster" ? "Poster" : "Deck",
    speakerNotes: "",
    narrativeIntent: "New visual page.",
    layoutIntent: page.kind === "slide" ? "summary" : "results",
    sourceIds: []
  };
  return touch(next);
}

export function createTransform(
  x: number,
  y: number,
  width: number,
  height: number,
  z = 0,
  rotation = 0
): Transform {
  return { x, y, width, height, rotation, scaleX: 1, scaleY: 1, z };
}

export function createNode(input: {
  kind: SceneNodeKind;
  name: string;
  transform: Transform;
  payload: SceneNode["payload"];
  style?: Style;
  provenance?: Provenance;
  claimStatus?: ClaimStatus;
}): SceneNode {
  return {
    id: createId("node"),
    kind: input.kind,
    name: input.name,
    transform: input.transform,
    payload: input.payload,
    style: input.style ?? {},
    provenance: input.provenance ?? manualProvenance(),
    claimStatus: input.claimStatus ?? "draft-visual"
  };
}

export function createTextNode(text: string, transform: Transform, style: Style = {}): SceneNode {
  return createNode({
    kind: "text",
    name: text.slice(0, 48) || "Text",
    transform,
    payload: { text, align: "middle" },
    style: {
      color: "#0f172a",
      fontFamily: DEFAULT_THEME.fontFamily,
      fontSize: 24,
      fontWeight: 600,
      ...style
    },
    claimStatus: "needs-citation"
  });
}

export function isStructuralReviewTextNode(node: SceneNode): boolean {
  if (node.kind !== "text") return false;
  const payload = node.payload as TextPayload & Record<string, unknown>;
  const text = String(payload.text ?? "").trim();
  const hasWorkflowContext = typeof payload.templateId === "string"
    || typeof payload.workflowPack === "string"
    || (typeof payload.layoutHint === "string" && payload.layoutHint.includes(":"));
  if (!hasWorkflowContext) return false;
  if (!text) return true;
  if (/^(?:[A-Z]|\d{1,2}|[A-Z]\d?)$/.test(text)) return true;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasSentencePunctuation = /[.:;?]/.test(text);
  return !hasSentencePunctuation && text.length <= 48 && wordCount <= 5;
}

export function isEvidenceReviewNode(node: SceneNode): boolean {
  return node.kind === "plot";
}

export function createShapeNode(
  shape: ShapeKind,
  label: string,
  transform: Transform,
  style: Style = {}
): SceneNode {
  return createNode({
    kind: "shape",
    name: label || shape,
    transform,
    payload: { shape, label },
    style: {
      fill: "#ffffff",
      stroke: "#1f2937",
      strokeWidth: 2,
      color: "#0f172a",
      fontSize: 18,
      depth: "raised",
      ...style
    }
  });
}

export function createSymbolNode(
  asset: Asset,
  label: string,
  transform: Transform,
  style: Style = {}
): SceneNode {
  return createNode({
    kind: "symbol",
    name: label || asset.name,
    transform,
    payload: { assetId: asset.id, label: label || asset.name },
    style: {
      fill: "#e0f2fe",
      stroke: "#0369a1",
      strokeWidth: 2,
      color: "#0f172a",
      fontSize: 16,
      depth: "floating",
      ...style
    },
    provenance: asset.provenance,
    claimStatus: "draft-visual"
  });
}

export function createConnectorNode(
  points: { x: number; y: number }[],
  label = "",
  style: Style = {}
): SceneNode {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return createNode({
    kind: "connector",
    name: label || "Connector",
    transform: createTransform(minX, minY, Math.max(1, maxX - minX), Math.max(1, maxY - minY)),
    payload: { points, label },
    style: {
      stroke: "#334155",
      strokeWidth: 3,
      arrowEnd: true,
      ...style
    }
  });
}

export function createPlotNode(spec: PlotSpec, transform: Transform): SceneNode {
  return createNode({
    kind: "plot",
    name: spec.title,
    transform,
    payload: { spec },
    style: {
      fill: "#ffffff",
      stroke: "#cbd5e1",
      strokeWidth: 1,
      depth: "raised"
    },
    provenance: spec.table.source ?? manualProvenance("Imported tabular data"),
    claimStatus: "needs-citation"
  });
}

export function cloneProject(project: Project): Project {
  return JSON.parse(JSON.stringify(project)) as Project;
}

export function touch(project: Project): Project {
  return { ...project, updatedAt: nowIso() };
}

export function getPage(project: Project, pageId?: string): Page {
  const page = pageId ? project.pages.find((candidate) => candidate.id === pageId) : project.pages[0];
  if (!page) {
    throw new Error(`Page not found: ${pageId ?? "<first page>"}`);
  }
  return page;
}

export function listNodes(project: Project, pageId?: string): SceneNode[] {
  return [...getPage(project, pageId).nodes].sort((a, b) => a.transform.z - b.transform.z);
}

export function addNode(project: Project, node: SceneNode, pageId?: string): Project {
  const next = cloneProject(project);
  const page = getPage(next, pageId);
  const maxZ = page.nodes.reduce((max, current) => Math.max(max, current.transform.z), -1);
  page.nodes.push({ ...node, transform: { ...node.transform, z: node.transform.z || maxZ + 1 } });
  return touch(next);
}

export function updateNode(
  project: Project,
  nodeId: string,
  patch: Partial<Omit<SceneNode, "id">>,
  pageId?: string
): Project {
  const next = cloneProject(project);
  const page = getPage(next, pageId);
  const index = page.nodes.findIndex((node) => node.id === nodeId);
  if (index === -1) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  page.nodes[index] = {
    ...page.nodes[index],
    ...patch,
    transform: patch.transform ? { ...page.nodes[index].transform, ...patch.transform } : page.nodes[index].transform,
    style: patch.style ? { ...page.nodes[index].style, ...patch.style } : page.nodes[index].style,
    payload: patch.payload ? { ...page.nodes[index].payload, ...patch.payload } as SceneNode["payload"] : page.nodes[index].payload
  };
  return touch(next);
}

export function deleteNode(project: Project, nodeId: string, pageId?: string): Project {
  const next = cloneProject(project);
  const page = getPage(next, pageId);
  page.nodes = page.nodes.filter((node) => node.id !== nodeId);
  return touch(next);
}

export function addAsset(project: Project, asset: Asset): Project {
  const next = cloneProject(project);
  if (!next.assets.some((candidate) => candidate.id === asset.id)) {
    next.assets.push(asset);
  }
  return touch(next);
}

export function addSourceDocument(project: Project, source: SourceDocument): Project {
  const next = cloneProject(project);
  next.deck ??= createDeckState();
  if (!next.deck.sources.some((candidate) => candidate.id === source.id)) {
    next.deck.sources.push(source);
  }
  return touch(next);
}

export function setReviewItems(project: Project, reviewItems: ReviewItem[]): Project {
  const next = cloneProject(project);
  next.deck ??= createDeckState();
  next.deck.reviewItems = reviewItems;
  return touch(next);
}

export function resolveReviewItem(project: Project, reviewItemId: string, status: ReviewItem["status"] = "resolved"): Project {
  const next = cloneProject(project);
  next.deck ??= createDeckState();
  const item = next.deck.reviewItems.find((candidate) => candidate.id === reviewItemId);
  if (!item) throw new Error(`Review item not found: ${reviewItemId}`);
  item.status = status;
  item.resolvedAt = nowIso();
  return touch(next);
}

export function applyTemplate(project: Project, template: "perturb-seq-workflow" | "ai-biosecurity-pipeline"): Project {
  let next = cloneProject(project);
  const page = getPage(next);
  if (template === "perturb-seq-workflow") {
    const cells = createShapeNode("round-rect", "Cells + CRISPR library", createTransform(80, 220, 210, 110), {
      fill: "#dcfce7",
      stroke: "#15803d"
    });
    const sequencing = createShapeNode("round-rect", "Single-cell sequencing", createTransform(410, 220, 230, 110), {
      fill: "#dbeafe",
      stroke: "#2563eb"
    });
    const analysis = createShapeNode("round-rect", "Perturbation effects", createTransform(760, 220, 230, 110), {
      fill: "#fef3c7",
      stroke: "#d97706"
    });
    next = addNode(next, cells, page.id);
    next = addNode(next, sequencing, page.id);
    next = addNode(next, analysis, page.id);
    next = addNode(next, createConnectorNode([{ x: 290, y: 275 }, { x: 410, y: 275 }]), page.id);
    next = addNode(next, createConnectorNode([{ x: 640, y: 275 }, { x: 760, y: 275 }]), page.id);
  }
  if (template === "ai-biosecurity-pipeline") {
    const nodes = [
      createShapeNode("round-rect", "Prompt / protocol", createTransform(80, 180, 190, 90), { fill: "#eef2ff", stroke: "#4f46e5" }),
      createShapeNode("round-rect", "Bio classifier", createTransform(350, 180, 190, 90), { fill: "#ecfeff", stroke: "#0891b2" }),
      createShapeNode("diamond", "Risk tier", createTransform(620, 170, 130, 110), { fill: "#fff7ed", stroke: "#ea580c" }),
      createShapeNode("round-rect", "Permissioned response", createTransform(830, 180, 230, 90), { fill: "#f0fdf4", stroke: "#16a34a" })
    ];
    for (const node of nodes) next = addNode(next, node, page.id);
    next = addNode(next, createConnectorNode([{ x: 270, y: 225 }, { x: 350, y: 225 }]), page.id);
    next = addNode(next, createConnectorNode([{ x: 540, y: 225 }, { x: 620, y: 225 }]), page.id);
    next = addNode(next, createConnectorNode([{ x: 750, y: 225 }, { x: 830, y: 225 }]), page.id);
  }
  return next;
}

export function validateProject(project: Project): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(project.schemaVersion as "0.1.0" | "0.2.0")) {
    issues.push({
      severity: "error",
      code: "schema.version",
      message: `Unsupported schema version ${project.schemaVersion}`
    });
  } else if (project.schemaVersion !== SCHEMA_VERSION) {
    issues.push({
      severity: "warning",
      code: "schema.version.migration-available",
      message: `Project schema ${project.schemaVersion} can be migrated to ${SCHEMA_VERSION}.`
    });
  }
  if (!project.pages.length) {
    issues.push({ severity: "error", code: "project.pages.empty", message: "Project must include at least one page." });
  }

  const pageIds = new Set<string>();
  const nodeIds = new Set<string>();
  for (const page of project.pages) {
    if (pageIds.has(page.id)) {
      issues.push({ severity: "error", code: "page.id.duplicate", message: `Duplicate page id ${page.id}`, pageId: page.id });
    }
    pageIds.add(page.id);
    if (page.width <= 0 || page.height <= 0) {
      issues.push({ severity: "error", code: "page.size.invalid", message: "Page width and height must be positive.", pageId: page.id });
    }
    for (const node of page.nodes) {
      if (nodeIds.has(node.id)) {
        issues.push({ severity: "error", code: "node.id.duplicate", message: `Duplicate node id ${node.id}`, nodeId: node.id, pageId: page.id });
      }
      nodeIds.add(node.id);
      if (node.transform.width <= 0 || node.transform.height <= 0) {
        issues.push({ severity: "error", code: "node.size.invalid", message: "Node width and height must be positive.", nodeId: node.id, pageId: page.id });
      }
      if (!node.provenance?.source || !node.provenance?.license) {
        issues.push({ severity: "warning", code: "node.provenance.missing", message: "Node is missing source/license provenance.", nodeId: node.id, pageId: page.id });
      }
      if (node.claimStatus === "unsupported-claim") {
        issues.push({ severity: "error", code: "node.claim.unsupported", message: "Node is marked as an unsupported scientific claim.", nodeId: node.id, pageId: page.id });
      }
      if (node.claimStatus === "needs-citation") {
        issues.push({ severity: "warning", code: "node.claim.needs-citation", message: "Node contains a claim or imported data that needs citation/user confirmation.", nodeId: node.id, pageId: page.id });
      }
      if (node.provenance.kind === "generated" && node.provenance.editState === "needs-review") {
        issues.push({ severity: "warning", code: "node.ai.needs-review", message: "AI-generated asset needs scientific review.", nodeId: node.id, pageId: page.id });
      }
      if (node.transform.x + node.transform.width < 0 || node.transform.y + node.transform.height < 0 || node.transform.x > page.width || node.transform.y > page.height) {
        issues.push({ severity: "warning", code: "node.bounds.off-page", message: "Node is outside the page bounds.", nodeId: node.id, pageId: page.id });
      }
    }
  }
  if (!project.deck) {
    issues.push({
      severity: "warning",
      code: "deck.missing",
      message: "Project is missing premium deck metadata; run migration before deck generation."
    });
  } else {
    for (const page of project.pages) {
      if (!project.deck.slideMeta[page.id]) {
        issues.push({
          severity: "warning",
          code: "deck.slide-meta.missing",
          message: "Slide is missing deck metadata.",
          pageId: page.id
        });
      }
    }
    for (const item of project.deck.reviewItems) {
      if (item.status === "open" && item.severity === "error") {
        issues.push({
          severity: "error",
          code: `review.${item.kind}`,
          message: item.message,
          nodeId: item.nodeId,
          pageId: item.pageId
        });
      }
    }
  }
  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues
  };
}
