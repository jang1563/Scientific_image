export type SchemaVersion = "0.1.0" | "0.2.0";

export type PageKind = "slide" | "figure" | "poster";
export type PageUnit = "px" | "in" | "mm";
export type SceneNodeKind =
  | "symbol"
  | "image"
  | "text"
  | "connector"
  | "group"
  | "plot"
  | "shape"
  | "annotation";

export type ShapeKind = "rect" | "round-rect" | "ellipse" | "diamond" | "line";
export type ClaimStatus = "draft-visual" | "needs-citation" | "user-confirmed" | "unsupported-claim";
export type ProvenanceKind = "curated" | "upload" | "generated" | "derived" | "manual";
export type EditState = "original" | "modified" | "needs-review";
export type AssetKind = "symbol" | "image" | "background" | "template";
export type AssetVariant = "filled" | "outline" | "soft-3d-vector" | "dark" | "warning" | "selected" | "disabled";
export type AssetStyleProfile = "consulting-2p5d" | "publication-line" | "minimal-flat" | "dark-talk" | "risk-warning" | "scientific-editorial-realism";
export type AssetQualityTier = "signature" | "hero" | "standard" | "utility";
export type AssetPanelRole = "main-subject" | "process-step" | "annotation" | "warning" | "evidence" | "output";
export type AssetQaStatus = "draft" | "reviewed" | "premium";
export type AssetDetailLevel = "low" | "medium" | "high";
export type RealismLevel = "editorial" | "photo-like" | "texture" | "context";
export type RealisticMediaType = "raster" | "svg-fixture" | "photo" | "microscopy" | "generated";
export type BackgroundTreatment = "editorial-frame" | "cutout" | "soft-mask" | "full-bleed";
export type CutoutStatus = "not-cutout" | "soft-cutout" | "transparent" | "mask-ready";
export type RightsStatus = "curated-fixture" | "private-unverified" | "license-required" | "review-required";
export type SourceAssetType = "generated-fixture" | "user-upload" | "curated-reference" | "licensed-source";
export type DepthLevel = "none" | "surface" | "raised" | "floating" | "hero";
export type AssetFamily =
  | "cell"
  | "molecule"
  | "perturbation"
  | "instrument"
  | "spatial"
  | "pathway"
  | "organ"
  | "pathogen"
  | "space"
  | "modelSystem"
  | "dataSystem"
  | "agentSystem"
  | "metricPanel"
  | "riskGate"
  | "governance"
  | "workflowBlock";
export type AssetVisualRole =
  | "entity"
  | "process"
  | "assay"
  | "data"
  | "model"
  | "evaluation"
  | "risk"
  | "governance"
  | "context"
  | "annotation";
export type SourceDocumentKind = "markdown" | "pdf-text" | "image" | "table";
export type ReviewItemKind = "claim" | "provenance" | "layout" | "accessibility" | "export";
export type ReviewSeverity = "info" | "warning" | "error";
export type ReviewStatus = "open" | "resolved" | "accepted-risk";
export type AgentRunStatus = "planned" | "running" | "completed" | "failed";
export type PlotType =
  | "scatter"
  | "embedding-scatter"
  | "volcano"
  | "heatmap"
  | "box"
  | "violin"
  | "dot"
  | "bar"
  | "line";

export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  z: number;
}

export interface Style {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  lineStyle?: "solid" | "dashed" | "dotted";
  arrowStart?: boolean;
  arrowEnd?: boolean;
  depth?: DepthLevel;
  shadow?: boolean;
}

export interface AiProvenance {
  model?: string;
  prompt?: string;
  generatedAt?: string;
}

export interface Provenance {
  kind: ProvenanceKind;
  source: string;
  license: string;
  citation?: string;
  creator?: string;
  url?: string;
  ai?: AiProvenance;
  editState: EditState;
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  palette: string[];
  fontFamily: string;
}

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  category: string;
  tags: string[];
  preview?: string;
  dataUri?: string;
  qualityTier?: AssetQualityTier;
  family?: AssetFamily;
  subcategory?: string;
  aliases?: string[];
  organism?: string[];
  assay?: string[];
  modality?: string[];
  visualRole?: AssetVisualRole;
  riskDomain?: string[];
  agentUseHints?: string[];
  variants?: AssetVariant[];
  styleProfiles?: AssetStyleProfile[];
  workflowPacks?: string[];
  semanticSlots?: string[];
  panelRole?: AssetPanelRole;
  fidelityScore?: number;
  qaStatus?: AssetQaStatus;
  realismLevel?: RealismLevel;
  mediaType?: RealisticMediaType;
  resolution?: { width: number; height: number; dpi?: number };
  backgroundTreatment?: BackgroundTreatment;
  cutoutStatus?: CutoutStatus;
  rightsStatus?: RightsStatus;
  sourceAssetType?: SourceAssetType;
  editableParts?: string[];
  editablePartDefinitions?: {
    id: string;
    role: string;
    selectable: boolean;
    colorBinding?: "accent" | "secondary" | "fill" | "stroke" | "label";
    anchor?: "label" | "connector" | "highlight" | "badge";
    exportMapping?: "shape" | "path" | "text" | "group";
  }[];
  recommendedSize?: { width: number; height: number };
  renderSpec?: {
    family: AssetFamily;
    motif: string;
    accent: string;
    secondary: string;
    complexity: "simple" | "moderate" | "complex";
    version?: number;
    assetRecipe?: string;
  };
  provenance: Provenance;
}

export interface TableData {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
  source?: Provenance;
}

export interface PlotEncoding {
  x?: string;
  y?: string;
  color?: string;
  label?: string;
  size?: string;
  group?: string;
  value?: string;
}

export interface PlotSpec {
  id: string;
  plotType: PlotType;
  title: string;
  table: TableData;
  encodings: PlotEncoding;
  style?: Style;
}

export interface SymbolAppearance {
  accent?: string;
  secondary?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  labelColor?: string;
  labelVisible?: boolean;
  styleProfile?: AssetStyleProfile;
  detailLevel?: AssetDetailLevel;
}

export interface SymbolPayload {
  assetId: string;
  label?: string;
  variant?: AssetVariant;
  styleProfile?: AssetStyleProfile;
  semanticRole?: string;
  layoutHint?: string;
  appearance?: SymbolAppearance;
}

export interface ImageAppearance {
  colorWash?: string;
  colorWashOpacity?: number;
  contrast?: number;
  opacity?: number;
  backgroundTreatment?: BackgroundTreatment;
  rimColor?: string;
  shadow?: DepthLevel;
}

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageMask {
  shape: "rect" | "round-rect" | "ellipse";
  feather?: number;
}

export interface ImagePayload {
  assetId?: string;
  src: string;
  alt?: string;
  styleProfile?: AssetStyleProfile;
  appearance?: ImageAppearance;
  crop?: ImageCrop;
  mask?: ImageMask;
  captionAnchor?: "top" | "bottom" | "left" | "right";
}

export interface TextPayload {
  text: string;
  align?: "start" | "middle" | "end";
}

export interface ConnectorPayload {
  fromNodeId?: string;
  toNodeId?: string;
  points: Point[];
  label?: string;
}

export interface GroupPayload {
  childNodeIds: string[];
}

export interface ShapePayload {
  shape: ShapeKind;
  label?: string;
}

export interface AnnotationPayload {
  text: string;
  severity?: "info" | "warning" | "critical";
}

export interface SceneNode {
  id: string;
  kind: SceneNodeKind;
  name: string;
  transform: Transform;
  style: Style;
  payload:
    | SymbolPayload
    | ImagePayload
    | TextPayload
    | ConnectorPayload
    | GroupPayload
    | { spec: PlotSpec }
    | ShapePayload
    | AnnotationPayload;
  provenance: Provenance;
  claimStatus: ClaimStatus;
  locked?: boolean;
  hidden?: boolean;
}

export interface Page {
  id: string;
  kind: PageKind;
  name: string;
  width: number;
  height: number;
  unit: PageUnit;
  background: string;
  nodes: SceneNode[];
}

export interface Citation {
  id: string;
  label: string;
  text: string;
  url?: string;
}

export interface DeckSection {
  id: string;
  title: string;
  summary: string;
  slideIds: string[];
}

export interface SlideBrief {
  id: string;
  title: string;
  sectionId: string;
  goal: string;
  narrative: string;
  layoutIntent: "title" | "workflow" | "mechanism" | "comparison" | "results" | "summary";
  requiredSources: string[];
  status: "draft" | "approved" | "generated";
}

export interface DeckOutline {
  id: string;
  audience: string;
  goal: string;
  title: string;
  sections: DeckSection[];
  slides: SlideBrief[];
  status: "draft" | "approved" | "generated";
  createdAt: string;
  updatedAt: string;
}

export interface SlideMeta {
  pageId: string;
  outlineSlideId?: string;
  title: string;
  section: string;
  speakerNotes: string;
  narrativeIntent: string;
  layoutIntent: SlideBrief["layoutIntent"];
  sourceIds: string[];
}

export interface SourceSnippet {
  id: string;
  text: string;
  page?: number;
  locator?: string;
}

export interface SourceDocument {
  id: string;
  kind: SourceDocumentKind;
  name: string;
  text?: string;
  dataUri?: string;
  mimeType?: string;
  snippets: SourceSnippet[];
  provenance: Provenance;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  kind: ReviewItemKind;
  severity: ReviewSeverity;
  status: ReviewStatus;
  title?: string;
  message: string;
  action?: string;
  templateId?: string;
  workflowPack?: string;
  exportFormat?: "svg" | "pdf" | "pptx" | "docx";
  metrics?: Record<string, number | string | boolean>;
  fallbackAssets?: Array<{
    assetId: string;
    name: string;
    qualityTier?: string;
    assetRecipe?: string;
    exportBehavior?: string;
    action?: string;
  }>;
  pageId?: string;
  nodeId?: string;
  sourceId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SceneOperation {
  op: "add-node" | "update-node" | "delete-node" | "add-page" | "update-slide-meta" | "set-outline" | "add-source";
  pageId?: string;
  nodeId?: string;
  payload: Record<string, unknown>;
}

export interface AgentTraceReference {
  kind: "resource" | "tool" | "index" | "recommendation" | "insert-plan" | "template" | "export-qa";
  id: string;
  label?: string;
  uri?: string;
  tool?: string;
  workflowPack?: string;
  templateId?: string;
  assetIds?: string[];
  nodeIds?: string[];
  summary?: string;
}

export interface AgentTrace {
  workflowPack?: string;
  templateId?: string;
  styleProfile?: string;
  resourceUris: string[];
  toolSequence: string[];
  compactIndex?: {
    schemaVersion?: string;
    filters?: Record<string, unknown>;
    returnedAssets?: number;
    assetIds: string[];
  };
  recommendation?: {
    tool: string;
    responseShape?: "compact" | "full";
    semanticSlots?: string[];
    assetIds: string[];
    insertPlanCount?: number;
  };
  insertPlan?: Array<{
    tool: string;
    assetId: string;
    semanticRole?: string;
    layoutHint?: string;
    styleProfile?: string;
    nodeId?: string;
  }>;
  generatedNodeIds: string[];
  references: AgentTraceReference[];
}

export interface AgentRun {
  id: string;
  name: string;
  prompt: string;
  provider: string;
  model: string;
  inputSourceIds: string[];
  operations: SceneOperation[];
  status: AgentRunStatus;
  startedAt: string;
  completedAt?: string;
  trace?: AgentTrace;
  error?: string;
}

export interface DeckState {
  outline?: DeckOutline;
  slideMeta: Record<string, SlideMeta>;
  sources: SourceDocument[];
  reviewItems: ReviewItem[];
  agentRuns: AgentRun[];
}

export interface Project {
  schemaVersion: SchemaVersion;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
  assets: Asset[];
  theme: Theme;
  citations: Citation[];
  deck: DeckState;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  nodeId?: string;
  pageId?: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}
