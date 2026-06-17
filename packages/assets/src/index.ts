import {
  createConnectorNode,
  createId,
  createPlotNode,
  createShapeNode,
  createSymbolNode,
  createTextNode,
  createTransform,
  curatedProvenance,
  isEvidenceReviewNode,
  isStructuralReviewTextNode,
  PAGE_PRESETS,
  type Asset,
  type BackgroundTreatment,
  type CutoutStatus,
  type AssetFamily,
  type AssetDetailLevel,
  type AssetPanelRole,
  type AssetQaStatus,
  type AssetQualityTier,
  type AssetStyleProfile,
  type AssetVariant,
  type AssetVisualRole,
  type ImageAppearance,
  type ImageCrop,
  type ImageMask,
  type Page,
  type Project,
  type Provenance,
  type RealismLevel,
  type RealisticMediaType,
  type RightsStatus,
  type SceneNode,
  type SourceAssetType,
  type Style,
  type SymbolAppearance,
  type Transform
} from "../../scene/src/index.ts";
import {
  ASSET_STYLE_PROFILES,
  HERO_ASSET_IDS,
  commercialAssetRecipe,
  renderCommercialAssetDefs,
  renderCommercialAssetGlyph,
  isHeroAsset,
  normalizeAssetStyleProfile
} from "./renderer.js";

export { ASSET_STYLE_PROFILES, HERO_ASSET_IDS, commercialAssetRecipe, isHeroAsset, normalizeAssetStyleProfile };

export type PremiumAsset = Asset & {
  family: AssetFamily;
  subcategory: string;
  aliases: string[];
  organism: string[];
  assay: string[];
  modality: string[];
  visualRole: AssetVisualRole;
  riskDomain: string[];
  agentUseHints: string[];
  variants: AssetVariant[];
  styleProfiles: AssetStyleProfile[];
  workflowPacks: string[];
  semanticSlots: string[];
  panelRole: AssetPanelRole;
  fidelityScore: number;
  qaStatus: AssetQaStatus;
  editableParts: string[];
  editablePartDefinitions: NonNullable<Asset["editablePartDefinitions"]>;
  recommendedSize: { width: number; height: number };
  qualityTier: AssetQualityTier;
  renderSpec: NonNullable<Asset["renderSpec"]> & { version: 2; assetRecipe: string };
};

export type RealisticAsset = Asset & {
  kind: "image";
  aliases: string[];
  styleProfiles: AssetStyleProfile[];
  workflowPacks: string[];
  semanticSlots: string[];
  panelRole: AssetPanelRole;
  qualityTier: AssetQualityTier;
  fidelityScore: number;
  qaStatus: AssetQaStatus;
  editableParts: string[];
  editablePartDefinitions: NonNullable<Asset["editablePartDefinitions"]>;
  recommendedSize: { width: number; height: number };
  realismLevel: RealismLevel;
  mediaType: RealisticMediaType;
  resolution: { width: number; height: number; dpi?: number };
  backgroundTreatment: BackgroundTreatment;
  cutoutStatus: CutoutStatus;
  rightsStatus: RightsStatus;
  sourceAssetType: SourceAssetType;
};

export type LibraryAsset = PremiumAsset | RealisticAsset;

export interface AssetSearchInput {
  query?: string;
  category?: string;
  role?: AssetVisualRole | string;
  family?: AssetFamily | string;
  modality?: string;
  riskDomain?: string;
  slideIntent?: string;
  styleProfile?: AssetStyleProfile | string;
  workflowPack?: string;
  qualityTier?: AssetQualityTier | string;
  panelRole?: AssetPanelRole | string;
  semanticSlot?: string;
  assetKind?: Asset["kind"] | "vector" | "realistic" | "hybrid";
  mediaType?: RealisticMediaType | string;
  realismLevel?: RealismLevel | string;
  rightsStatus?: RightsStatus | string;
  sourceAssetType?: SourceAssetType | string;
  responseShape?: "compact" | "full";
  limit?: number;
}

export interface AssetRecommendationInput {
  title?: string;
  narrative?: string;
  layoutIntent?: string;
  sourceText?: string;
  styleProfile?: AssetStyleProfile | string;
  workflowPack?: string;
  limit?: number;
}

export interface AssetSearchResult {
  asset: LibraryAsset;
  score: number;
  reason: string;
  suggestedLabel: string;
  recommendedStyleProfile: AssetStyleProfile;
  workflowPack?: string;
  semanticSlot?: string;
  suggestedPlacement: "hero" | "workflow-step" | "supporting" | "badge" | "background";
}

export interface CompactAssetReference {
  assetId: string;
  name: string;
  kind: Asset["kind"];
  qualityTier: AssetQualityTier;
  workflowPacks: string[];
  semanticSlots: string[];
  panelRole: AssetPanelRole;
  styleProfiles: AssetStyleProfile[] | "all";
  recommendedSize: { width: number; height: number };
  editablePartBindings: {
    id: string;
    colorBinding?: string;
    anchor?: string;
    exportMapping?: string;
  }[];
  insertDefaults: {
    tool: "insert_premium_asset";
    args: {
      assetId: string;
      styleProfile: AssetStyleProfile;
      semanticRole?: string;
      layoutHint?: string;
      width: number;
      height: number;
      appearance?: SymbolAppearance | ImageAppearance;
    };
  };
  previewArgs: {
    assetId: string;
    styleProfile: AssetStyleProfile;
    width: number;
    height: number;
  };
}

export interface CompactAssetSearchResult {
  asset: CompactAssetReference;
  score: number;
  reason: string;
  suggestedLabel: string;
  recommendedStyleProfile: AssetStyleProfile;
  workflowPack?: string;
  semanticSlot?: string;
  suggestedPlacement: AssetSearchResult["suggestedPlacement"];
}

export interface AssetInsertAction {
  tool: "insert_premium_asset";
  args: {
    projectId?: string;
    assetId: string;
    styleProfile: AssetStyleProfile;
    semanticRole?: string;
    layoutHint?: string;
    x?: number;
    y?: number;
    width: number;
    height: number;
    appearance?: SymbolAppearance | ImageAppearance;
  };
}

export interface AssetIndex {
  schemaVersion: string;
  generatedAt: string;
  responseShape: "compact";
  filters: {
    workflowPack?: string;
    styleProfile?: AssetStyleProfile;
    qualityTier?: string;
    semanticSlot?: string;
    assetKind?: string;
    limit: number;
  };
  facets: {
    workflowPacks: string[];
    styleProfiles: AssetStyleProfile[];
    qualityTiers: AssetQualityTier[];
    semanticSlots: string[];
    panelRoles: AssetPanelRole[];
    assetKinds: string[];
  };
  totalAssets: number;
  returnedAssets: number;
  sizeBudget: {
    currentTargetBytes: number;
    twelveMonthTargetBytes: number;
    estimatedBytes: number;
  };
  assets: CompactAssetReference[];
}

export interface VisualBenchmark {
  id: string;
  product: string;
  url: string;
  observedSignal: string;
  implementationTakeaway: string;
}

export interface AssetQualityReport {
  reviewedAt: string;
  summary: {
    totalAssets: number;
    biologyAssets: number;
    aiAssets: number;
    signatureAssets: number;
    heroAssets: number;
    workflowPacks: number;
    styleProfiles: AssetStyleProfile[];
    rendererContract: string;
  };
  tierCounts: Record<AssetQualityTier, number>;
  qaCounts: Record<AssetQaStatus, number>;
  workflowCoverage: {
    id: string;
    name: string;
    priority: number;
    assetCount: number;
    signatureOrHeroCount: number;
    missingAssetIds: string[];
    missingTemplateIds: string[];
    flagshipTemplateId?: string;
    templateCount: number;
    qaStatus: WorkflowPackQuality["qaStatus"];
    templates: string[];
  }[];
  categoryCoverage: {
    category: string;
    count: number;
    premiumCount: number;
  }[];
  styleCoverage: {
    styleProfile: AssetStyleProfile;
    count: number;
  }[];
  benchmarks: VisualBenchmark[];
  qualityRubric: string[];
  commercialVisualAudit: CommercialVisualQualityAudit;
  priorityGaps: string[];
  recommendedNextPacks: string[];
}

export interface CommercialVisualAuditAssetRisk {
  assetId: string;
  name: string;
  qualityTier: AssetQualityTier;
  workflowPacks: string[];
  rendererFamily: AssetFamily;
  renderRecipe: string;
  riskLevel: "low" | "medium" | "high";
  riskReasons: string[];
  recommendedTier: AssetQualityTier;
  visualMetrics: {
    svgBytes: number;
    domainClassCount: number;
    panelTokenCount: number;
    rectCount: number;
    pathCount: number;
    circleCount: number;
  };
  nextAction: string;
}

export interface CommercialVisualAuditPackRisk {
  packId: string;
  name: string;
  claimedPremiumAssets: number;
  highRiskPremiumAssets: number;
  mediumRiskPremiumAssets: number;
  flagshipTemplateId?: string;
  templateSkeleton: string;
  skeletonRisk: "low" | "medium" | "high";
  riskReasons: string[];
  nextAction: string;
}

export interface CommercialVisualAuditTemplateRisk {
  templateId: string;
  workflowPack: string;
  skeletonSignature: string;
  nodeCount: number;
  symbolCount: number;
  connectorCount: number;
  textCount: number;
  riskLevel: "low" | "medium" | "high";
  riskReasons: string[];
  nextAction: string;
}

export interface CommercialVisualQualityAudit {
  reviewedAt: string;
  status: "commercial-baseline" | "needs-polish" | "blocked";
  policy: {
    premiumLabelFreeze: boolean;
    rule: string;
    recommendedPromotionGate: string[];
  };
  summary: {
    claimedPremiumAssets: number;
    highRiskPremiumAssets: number;
    mediumRiskPremiumAssets: number;
    factoryTemplateRisks: number;
    packRisks: number;
    nextAnchor: string;
  };
  assetRisks: CommercialVisualAuditAssetRisk[];
  packRisks: CommercialVisualAuditPackRisk[];
  templateRisks: CommercialVisualAuditTemplateRisk[];
  gates: string[];
  nextActions: string[];
}

export interface AssetCoverageMilestone {
  id: string;
  name: string;
  horizonMonths: number;
  targetAssets: number;
  targetSignatureHeroAssets: number;
  targetWorkflowPacks: number;
  targetTemplates: number;
  acceptance: string;
}

export interface PlannedWorkflowPack {
  id: string;
  name: string;
  wave: "current-polish" | "jk-aligned" | "commercial-broad";
  priority: number;
  rationale: string;
  targetAssets: number;
  targetSignatureHeroAssets: number;
  targetTemplates: number;
  seedConcepts: string[];
  agentUseHints: string[];
}

export interface AssetCoverageGapReport {
  reviewedAt: string;
  baseline: AssetQualityReport["summary"] & {
    templates: number;
    signatureHeroAssets: number;
  };
  productWedge: "premium-workflow-assets" | "asset-breadth-library";
  firstWave: "jk-aligned" | "broad-biology-market";
  qualityGate: "pack-complete-premium";
  broadMarketPackOrder: string[];
  packMinimumContract: {
    assetRange: string;
    minSignatureHeroAssets: number;
    templateRange: string;
    requiresFlagshipDemo: boolean;
    requiresCompactGallery: boolean;
    requiresVisualQaGallery: boolean;
    requiresAgentPath: boolean;
    requiresNamedExportWarnings: boolean;
  };
  milestones: (AssetCoverageMilestone & {
    remainingAssets: number;
    remainingSignatureHeroAssets: number;
    remainingWorkflowPacks: number;
    remainingTemplates: number;
  })[];
  currentWorkflowReadiness: AssetQualityReport["workflowCoverage"];
  commercialVisualAudit: {
    status: CommercialVisualQualityAudit["status"];
    premiumLabelFreeze: boolean;
    highRiskPremiumAssets: number;
    mediumRiskPremiumAssets: number;
    factoryTemplateRisks: number;
    nextAnchor: string;
  };
  categoryGaps: {
    category: string;
    currentAssets: number;
    currentPremiumAssets: number;
    premiumRatio: number;
    status: "premium-seed" | "thin-premium" | "coverage-only";
    nextAction: string;
  }[];
  plannedWorkflowPacks: PlannedWorkflowPack[];
  acceptanceGates: string[];
  productionPipeline: string[];
  implementationRisks: string[];
  nextActions: string[];
}

export interface AssetOntology {
  schemaVersion: string;
  generatedAt: string;
  sourceOfTruth: string;
  styleProfiles: AssetStyleProfile[];
  qualityTiers: AssetQualityTier[];
  panelRoles: AssetPanelRole[];
  semanticSlots: string[];
  workflowPacks: {
    id: string;
    name: string;
    priority: number;
    assetCount: number;
    templateCount: number;
    flagshipTemplateId?: string;
    agentUseHints: string[];
  }[];
  categories: {
    category: string;
    assetCount: number;
    premiumCount: number;
  }[];
  assets: {
    id: string;
    name: string;
    category: string;
    family: AssetFamily;
    qualityTier: AssetQualityTier;
    qaStatus: AssetQaStatus;
    workflowPacks: string[];
    semanticSlots: string[];
    panelRole: AssetPanelRole;
    styleProfiles: AssetStyleProfile[];
    editableParts: string[];
    renderRecipe: string;
    fidelityScore: number;
  }[];
  agentContract: {
    normalReferenceFields: string[];
    avoid: string[];
    preferredSequence: string[];
  };
}

export interface AssetBrief {
  concept: string;
  status: "existing-asset" | "new-asset-candidate";
  assetId?: string;
  candidateId: string;
  workflowPack?: string;
  styleProfile: AssetStyleProfile;
  assetBrief: string;
  semanticContract: {
    tags: string[];
    aliases: string[];
    panelRole: AssetPanelRole | string;
    semanticSlots: string[];
    qualityTarget: AssetQualityTier;
  };
  recipeDesign: {
    silhouette: string;
    primitives: string[];
    editableParts: string[];
    forbiddenAmbiguity: string[];
  };
  renderQa: string[];
  templateIntegration: string[];
  agentContract: string[];
  exportQa: string[];
}

export interface WorkflowPackRecommendation {
  pack: WorkflowPack;
  score: number;
  reason: string;
  recommendedTemplateId?: string;
  recommendedStyleProfile: AssetStyleProfile;
  premiumAssetCount: number;
  exportQaAction: string;
}

export interface AssetSetRecommendation {
  workflowPack?: string;
  templateId?: string;
  styleProfile: AssetStyleProfile;
  groups: {
    semanticSlot: string;
    panelRole: string;
    recommendedPlacement: AssetSearchResult["suggestedPlacement"];
    assets: AssetSearchResult[];
  }[];
  insertPlan: AssetInsertAction[];
  agentInstructions: string[];
}

export interface WorkflowTemplateSpec {
  idCandidate: string;
  workflowPack: string;
  name: string;
  layout: WorkflowTemplate["layout"];
  recommendedStyleProfile: AssetStyleProfile;
  previewAssetIds: string[];
  nodeKinds: SceneNode["kind"][];
  agentUseHints: string[];
  qaChecklist: string[];
  acceptanceGates: string[];
}

export interface WorkflowPackVisualQaGallery {
  packId: string;
  styleProfile: AssetStyleProfile;
  previewSizes: { id: "icon" | "preview" | "slide"; width: number; height: number }[];
  assetCount: number;
  renderedAssetIds: string[];
  qaChecks: string[];
  snapshotKey: string;
  svg: string;
}

interface AssetSeed {
  id: string;
  name: string;
  domain: "Biology" | "AI";
  subcategory: string;
  family: AssetFamily;
  visualRole: AssetVisualRole;
  tags: string[];
  aliases?: string[];
  organism?: string[];
  assay?: string[];
  modality?: string[];
  riskDomain?: string[];
  motif?: string;
  accent?: string;
  secondary?: string;
  complexity?: "simple" | "moderate" | "complex";
}

const DEFAULT_VARIANTS: AssetVariant[] = ["filled", "outline", "soft-3d-vector", "dark", "warning", "selected", "disabled"];
const DEFAULT_STYLE_PROFILES = [...ASSET_STYLE_PROFILES] as AssetStyleProfile[];
const ASSET_ROADMAP_REVIEWED_AT = "2026-06-12";

const COVERAGE_MILESTONES: AssetCoverageMilestone[] = [
  {
    id: "phase-1-commercial-baseline",
    name: "Commercial baseline polish",
    horizonMonths: 2,
    targetAssets: 216,
    targetSignatureHeroAssets: 143,
    targetWorkflowPacks: 8,
    targetTemplates: 37,
    acceptance: "Top workflow packs pass 48px, 120px, slide-size gallery QA and are credible for lab meeting or biotech strategy deck use."
  },
  {
    id: "phase-2-jk-coverage-500",
    name: "Broad biology market coverage to 500 assets",
    horizonMonths: 5,
    targetAssets: 500,
    targetSignatureHeroAssets: 200,
    targetWorkflowPacks: 15,
    targetTemplates: 70,
    acceptance: "Agents can build complete perturb-seq, spatial, AI biosecurity, BioLLM benchmark, and grant-summary figures without missing core visuals."
  },
  {
    id: "phase-3-template-library",
    name: "Commercial template library",
    horizonMonths: 8,
    targetAssets: 800,
    targetSignatureHeroAssets: 300,
    targetWorkflowPacks: 20,
    targetTemplates: 100,
    acceptance: "Every active pack has flagship demos, result/method templates, export QA, and MCP recipe coverage."
  },
  {
    id: "phase-4-paid-library-1200",
    name: "Paid-quality 1,200 asset library",
    horizonMonths: 12,
    targetAssets: 1200,
    targetSignatureHeroAssets: 400,
    targetWorkflowPacks: 24,
    targetTemplates: 120,
    acceptance: "Coverage feels broad enough for paid scientific deck work; missing assets become edge cases rather than common blockers."
  }
];

const ACCEPTANCE_GATES = [
  "Signature assets are recognizable at 48px without relying on labels.",
  "Signature and hero assets show distinct silhouettes, not one shared base shape with a motif swap.",
  "Every premium asset supports consulting-2p5d, publication-line, minimal-flat, dark-talk, and risk-warning style profiles.",
  "Every asset exposes editable fill, stroke, accent, label anchor, connector anchor, and PPTX mapping metadata where applicable.",
  "Every workflow pack has a flagship demo, compact gallery, export snapshot, and actionable QA checklist.",
  "Agent-facing outputs reference assetId, workflowPack, semanticSlot, styleProfile, appearance, and editablePartOverrides rather than raw SVG."
];

const PRODUCTION_PIPELINE = [
  "asset_brief",
  "semantic_contract",
  "recipe_design",
  "render_qa",
  "template_integration",
  "agent_contract",
  "export_qa"
];

export const BROAD_MARKET_PACK_ORDER = [
  "drug-discovery",
  "protein-engineering",
  "synthetic-biology",
  "microbiome-infectious-disease",
  "cell-therapy",
  "microscopy-image-analysis",
  "lab-automation",
  "anatomy-organ-systems",
  "methods-and-protocols",
  "grant-and-consulting-summary",
  "clinical-translational"
];

const COMMERCIAL_PACK_MINIMUM_CONTRACT = {
  assetRange: "35-55",
  minSignatureHeroAssets: 12,
  templateRange: "4-7",
  requiresFlagshipDemo: true,
  requiresCompactGallery: true,
  requiresVisualQaGallery: true,
  requiresAgentPath: true,
  requiresNamedExportWarnings: true
};

const PLANNED_WORKFLOW_PACKS: PlannedWorkflowPack[] = [
  {
    id: "immunology-oncology",
    name: "Immunology / oncology",
    wave: "jk-aligned",
    priority: 1,
    rationale: "Needed for tumor microenvironment, immune cell states, cell therapy, and translational genomics figures.",
    targetAssets: 55,
    targetSignatureHeroAssets: 22,
    targetTemplates: 6,
    seedConcepts: ["tumor microenvironment", "T cell exhaustion", "myeloid niche", "checkpoint blockade", "cytotoxic killing"],
    agentUseHints: ["Use for TME result panels, immune cell-state summaries, and oncology mechanism slides."]
  },
  {
    id: "omics-analysis-figures",
    name: "Omics analysis figures",
    wave: "jk-aligned",
    priority: 1,
    rationale: "Turns common bioinformatics outputs into editable figure panels rather than screenshots.",
    targetAssets: 50,
    targetSignatureHeroAssets: 18,
    targetTemplates: 8,
    seedConcepts: ["volcano plot", "UMAP", "heatmap", "gene set enrichment", "trajectory", "differential abundance"],
    agentUseHints: ["Use for paper-style result panels, lab-meeting analysis summaries, and figure legends."]
  },
  {
    id: "bio-llm-benchmarks",
    name: "Bio LLM benchmarks",
    wave: "jk-aligned",
    priority: 1,
    rationale: "Directly supports BioProtocolBench, peer-review benchmark, calibration, and domain evaluation decks.",
    targetAssets: 42,
    targetSignatureHeroAssets: 18,
    targetTemplates: 6,
    seedConcepts: ["benchmark dataset", "judge model", "calibration", "domain expert rubric", "failure taxonomy"],
    agentUseHints: ["Use for benchmark dashboards, model comparison panels, and eval protocol slides."]
  },
  {
    id: "biosafety-permissioning",
    name: "Biosafety permissioning",
    wave: "jk-aligned",
    priority: 1,
    rationale: "Expands AI biosecurity visuals into policy, permission tier, DURC, and review workflows.",
    targetAssets: 45,
    targetSignatureHeroAssets: 20,
    targetTemplates: 6,
    seedConcepts: ["permission ladder", "DURC triage", "BSL boundary", "human escalation", "audit trail"],
    agentUseHints: ["Use for calibrated permissioning, dual-use review, and governance slides."]
  },
  {
    id: "grant-and-consulting-summary",
    name: "Grant and consulting summary",
    wave: "jk-aligned",
    priority: 2,
    rationale: "Adds executive-summary visual patterns for proposals, biotech strategy decks, and funder updates.",
    targetAssets: 36,
    targetSignatureHeroAssets: 12,
    targetTemplates: 8,
    seedConcepts: ["problem statement", "impact metric", "timeline", "risk matrix", "milestone roadmap"],
    agentUseHints: ["Use when a source brief asks for strategy, grant aims, or investor-style scientific communication."]
  },
  {
    id: "clinical-translational",
    name: "Clinical / translational",
    wave: "jk-aligned",
    priority: 2,
    rationale: "Bridges cohorts, samples, omics, clinical endpoints, and validation workflows.",
    targetAssets: 44,
    targetSignatureHeroAssets: 16,
    targetTemplates: 6,
    seedConcepts: ["patient cohort", "sample collection", "clinical endpoint", "biomarker", "validation cohort"],
    agentUseHints: ["Use for translational study designs, cohort diagrams, and biomarker result decks."]
  },
  {
    id: "methods-and-protocols",
    name: "Methods and protocols",
    wave: "jk-aligned",
    priority: 2,
    rationale: "Covers common lab procedure figures and protocol-safe visual communication.",
    targetAssets: 55,
    targetSignatureHeroAssets: 18,
    targetTemplates: 7,
    seedConcepts: ["pipetting", "incubation", "centrifugation", "qPCR", "western blot", "ELISA"],
    agentUseHints: ["Use for method overview slides and protocol diagrams without implying operational hidden detail."]
  },
  {
    id: "space-omics-mission-design",
    name: "Space omics mission design",
    wave: "jk-aligned",
    priority: 2,
    rationale: "Extends current space biology pack into mission timelines, samples, omics assays, and GeneLab-ready analysis figures.",
    targetAssets: 38,
    targetSignatureHeroAssets: 14,
    targetTemplates: 6,
    seedConcepts: ["mission timeline", "crew sampling", "microgravity exposure", "GeneLab dataset", "omics pipeline"],
    agentUseHints: ["Use for spaceflight experiment design, Fram2/i4-style sample flows, and GeneLab analysis decks."]
  },
  {
    id: "protein-engineering",
    name: "Protein engineering",
    wave: "commercial-broad",
    priority: 3,
    rationale: "Commercially important for biotech mechanism and platform decks.",
    targetAssets: 45,
    targetSignatureHeroAssets: 16,
    targetTemplates: 5,
    seedConcepts: ["protein domain", "binding pocket", "directed evolution", "library screen", "affinity maturation"],
    agentUseHints: ["Use for protein design, assay workflow, and molecular mechanism panels."]
  },
  {
    id: "synthetic-biology",
    name: "Synthetic biology",
    wave: "commercial-broad",
    priority: 3,
    rationale: "Adds circuits, chassis, plasmids, pathway engineering, and biomanufacturing coverage.",
    targetAssets: 48,
    targetSignatureHeroAssets: 18,
    targetTemplates: 6,
    seedConcepts: ["gene circuit", "promoter library", "plasmid map", "metabolic pathway", "bioreactor"],
    agentUseHints: ["Use for circuit diagrams, strain engineering, and biomanufacturing workflows."]
  },
  {
    id: "microbiome-infectious-disease",
    name: "Microbiome / infectious disease",
    wave: "commercial-broad",
    priority: 3,
    rationale: "Fills pathogen, host-microbe, microbiome, and surveillance presentation needs.",
    targetAssets: 52,
    targetSignatureHeroAssets: 18,
    targetTemplates: 6,
    seedConcepts: ["microbiome community", "pathogen surveillance", "host response", "antimicrobial resistance", "metagenomics"],
    agentUseHints: ["Use for microbiome study designs, infection mechanisms, and surveillance pipelines."]
  },
  {
    id: "neuroscience",
    name: "Neuroscience",
    wave: "commercial-broad",
    priority: 4,
    rationale: "Adds neurons, circuits, brain regions, electrophysiology, and neuro-omics coverage.",
    targetAssets: 45,
    targetSignatureHeroAssets: 15,
    targetTemplates: 5,
    seedConcepts: ["neural circuit", "brain region", "synapse", "electrophysiology", "spatial neuro-omics"],
    agentUseHints: ["Use for neurobiology methods, circuit diagrams, and brain atlas result panels."]
  },
  {
    id: "cell-therapy",
    name: "Cell therapy",
    wave: "commercial-broad",
    priority: 3,
    rationale: "Supports CAR-T, immune engineering, manufacturing, and clinical workflow diagrams.",
    targetAssets: 42,
    targetSignatureHeroAssets: 16,
    targetTemplates: 5,
    seedConcepts: ["CAR-T cell", "cell expansion", "engineered receptor", "release testing", "infusion"],
    agentUseHints: ["Use for therapeutic workflow, manufacturing, and translational immunology slides."]
  },
  {
    id: "drug-discovery",
    name: "Drug discovery",
    wave: "commercial-broad",
    priority: 3,
    rationale: "High-value commercial wedge for screening, validation, candidate nomination, and translational decks.",
    targetAssets: 55,
    targetSignatureHeroAssets: 20,
    targetTemplates: 7,
    seedConcepts: ["compound library", "target validation", "hit triage", "lead optimization", "toxicity screen"],
    agentUseHints: ["Use for pharma discovery funnels, screening summaries, and hit validation figures."]
  },
  {
    id: "lab-automation",
    name: "Lab automation",
    wave: "commercial-broad",
    priority: 4,
    rationale: "Adds robotics, liquid handlers, LIMS, plate logistics, and automated assay workflows.",
    targetAssets: 40,
    targetSignatureHeroAssets: 14,
    targetTemplates: 5,
    seedConcepts: ["liquid handler", "robot arm", "plate stack", "LIMS", "automated assay"],
    agentUseHints: ["Use for automation architecture, assay scheduling, and lab operations decks."]
  },
  {
    id: "microscopy-image-analysis",
    name: "Microscopy image analysis",
    wave: "commercial-broad",
    priority: 3,
    rationale: "Extends spatial/imaging coverage into image analysis, segmentation, phenotyping, and QC workflows.",
    targetAssets: 46,
    targetSignatureHeroAssets: 16,
    targetTemplates: 6,
    seedConcepts: ["image tile", "segmentation model", "phenotype feature", "quality control", "cell tracking"],
    agentUseHints: ["Use for microscopy pipelines, cell segmentation, and computer-vision result panels."]
  },
  {
    id: "anatomy-organ-systems",
    name: "Anatomy / organ systems",
    wave: "commercial-broad",
    priority: 4,
    rationale: "Broadens library coverage for teaching, grant, and cross-domain medical communication.",
    targetAssets: 60,
    targetSignatureHeroAssets: 18,
    targetTemplates: 6,
    seedConcepts: ["brain", "lung", "gut", "liver", "kidney", "immune system"],
    agentUseHints: ["Use for organ context, disease summary, and clinical mechanism slides."]
  }
];

export interface WorkflowPack {
  id: string;
  name: string;
  priority: number;
  description: string;
  flagshipTemplateId?: string;
  assetIds: string[];
  templates: string[];
  agentUseHints: string[];
}

export interface WorkflowTemplate {
  id: string;
  workflowPack: string;
  name: string;
  description: string;
  layout: "workflow" | "multi-panel" | "pipeline" | "results" | "architecture" | "hybrid-template";
  recommendedStyleProfile: AssetStyleProfile;
  previewAssetIds: string[];
  nodeKinds: SceneNode["kind"][];
  agentUseHints: string[];
  qaChecklist: string[];
}

export interface WorkflowTemplateQaIssue {
  severity: "pass" | "warning" | "error";
  kind: "bounds" | "text-overflow" | "provenance" | "claim" | "export" | "coverage";
  message: string;
  nodeIds: string[];
}

export interface WorkflowTemplateQaActionItem {
  severity: "pass" | "info" | "warning" | "error";
  kind: WorkflowTemplateQaIssue["kind"];
  title: string;
  action: string;
  nodeIds: string[];
}

export interface WorkflowTemplateFallbackAssetDetail {
  assetId: string;
  name: string;
  qualityTier: AssetQualityTier;
  assetRecipe: string;
  panelRole: string;
  workflowPacks: string[];
  exportBehavior: "embed-svg-fallback" | "embed-image-fallback";
  action: string;
}

export interface WorkflowTemplateExportReadiness {
  svg: {
    status: "full-vector";
    action: string;
  };
  pdf: {
    status: "full-vector";
    action: string;
  };
  pptx: {
    status: "editable" | "editable-with-fallbacks";
    plotFallbackCount: number;
    premiumAssetFallbackCount: number;
    fallbackAssets: WorkflowTemplateFallbackAssetDetail[];
    warnings: string[];
    nextAction: string;
  };
  docx: {
    status: "figure-panel";
    action: string;
  };
}

export interface WorkflowTemplateQaReport {
  templateId: string;
  workflowPack: string;
  styleProfile: AssetStyleProfile;
  pageSize: { width: number; height: number };
  nodeCount: number;
  symbolCount: number;
  plotCount: number;
  textCount: number;
  connectorCount: number;
  missingProvenanceCount: number;
  needsCitationCount: number;
  unsupportedClaimCount: number;
  outOfBoundsCount: number;
  textOverflowCount: number;
  premiumFallbackAssetIds: string[];
  exportReadiness: WorkflowTemplateExportReadiness;
  exportWarnings: string[];
  score: number;
  qaStatus: "premium" | "needs-polish" | "incomplete";
  issues: WorkflowTemplateQaIssue[];
  actionItems: WorkflowTemplateQaActionItem[];
}

export interface WorkflowPackQuality {
  packId: string;
  assetCount: number;
  signatureOrHeroCount: number;
  signatureCoverage: number;
  templateCount: number;
  missingAssetIds: string[];
  missingTemplateIds: string[];
  exportRisks: string[];
  qaStatus: "premium" | "needs-polish" | "incomplete";
}

export interface WorkflowPackExportSnapshot {
  packId: string;
  styleProfile: AssetStyleProfile;
  status: "pass" | "needs-review" | "blocked";
  templateCount: number;
  premiumTemplateCount: number;
  blockedTemplateCount: number;
  totalNodeCount: number;
  totalPlotFallbackCount: number;
  totalPremiumAssetFallbackCount: number;
  uniqueFallbackAssetIds: string[];
  exportFormats: {
    svg: { status: "full-vector"; action: string };
    pdf: { status: "full-vector"; action: string };
    pptx: { status: "editable" | "editable-with-fallbacks"; action: string };
    docx: { status: "figure-panel"; action: string };
  };
  templates: {
    templateId: string;
    name: string;
    qaStatus: WorkflowTemplateQaReport["qaStatus"];
    score: number;
    nodeCount: number;
    plotFallbackCount: number;
    premiumAssetFallbackCount: number;
    fallbackAssetIds: string[];
    exportWarnings: string[];
    reviewAction: string;
  }[];
  warnings: string[];
  nextAction: string;
  snapshotKey: string;
}

export interface WorkflowPackGallery {
  pack: WorkflowPack;
  assets: PremiumAsset[];
  templates: WorkflowTemplate[];
  templateQa: WorkflowTemplateQaReport[];
  flagshipDemo: {
    templateId: string;
    name: string;
    description: string;
    nodeCountEstimate: number;
    qaStatus: WorkflowTemplateQaReport["qaStatus"];
    score: number;
  };
  compactGallery: {
    styleProfile: AssetStyleProfile;
    assetIds: string[];
    svg: string;
  };
  exportSnapshot: WorkflowPackExportSnapshot;
  quality: WorkflowPackQuality;
}

export const PREMIUM_WORKFLOW_PACKS: WorkflowPack[] = [
  {
    id: "perturb-seq-crispr",
    name: "Perturb-seq / CRISPR",
    priority: 1,
    description: "CRISPR perturbation, pooled screening, single-cell sequencing, and hit interpretation.",
    flagshipTemplateId: "perturb-seq-workflow",
    assetIds: ["cell-t", "cell-immune", "cell-macrophage", "cell-tumor", "crispr-cas9", "guide-rna", "lentiviral-library", "perturb-seq", "pooled-screen", "arrayed-screen", "knockdown", "activation", "inhibition", "base-editor", "prime-editor", "drug-perturbation", "scrna-droplet", "cell-barcode", "umi-tag", "sequencing-read", "sequencer", "expression-matrix", "gene-locus", "metric-card", "plate-96", "plate-384", "pipette"],
    templates: ["perturb-seq-workflow", "crispr-screen-results", "hit-validation-panel", "perturb-method-overview"],
    agentUseHints: ["Use for CRISPR screen or Perturb-seq workflow slides.", "Pair cells, guide RNA, sequencing, matrix, and result plot in left-to-right process order."]
  },
  {
    id: "spatial-transcriptomics",
    name: "Spatial transcriptomics",
    priority: 2,
    description: "Tissue context, spatial spot arrays, imaging, segmentation, and neighborhood analysis.",
    flagshipTemplateId: "spatial-results-panel",
    assetIds: ["tissue-section", "histology-section", "spatial-grid", "visium-spot-array", "merfish-field", "xenium-panel", "microscopy-tile", "segmentation-mask", "cell-boundary", "neighborhood-graph", "tissue-region", "image-registration", "morphology-feature", "microscope", "confocal-microscope", "cell-immune", "cell-tumor", "cell-neighborhood", "expression-matrix", "embedding-space", "gene-locus", "protein", "antibody"],
    templates: ["spatial-workflow", "spatial-results-panel", "spatial-realistic-hybrid-panel", "tissue-to-spot-workflow", "segmentation-neighborhood-figure", "spatial-expression-summary"],
    agentUseHints: ["Use for Visium, MERFISH, Xenium, histology, and segmentation slides.", "Make tissue and spatial map assets the main subject."]
  },
  {
    id: "single-cell-multiomics",
    name: "Single-cell multiomics",
    priority: 3,
    description: "Single-cell capture, barcoding, reads, count matrices, embeddings, and cell-state interpretation.",
    flagshipTemplateId: "single-cell-workflow",
    assetIds: ["scrna-droplet", "cell-barcode", "umi-tag", "sequencing-read", "read-pair", "expression-matrix", "dataset", "embedding-space", "cell-neighborhood", "cell-stem", "cell-dividing", "cell-immune", "cell-t", "cell-b", "cell-macrophage", "gene-locus", "chromatin", "nucleosome", "peak-call", "genome-browser-track", "variant-snp", "copy-number"],
    templates: ["single-cell-workflow", "embedding-results", "cell-state-summary", "multiome-assay-summary"],
    agentUseHints: ["Use for scRNA-seq, multiome, clustering, and trajectory-style method slides.", "Pair droplet/barcode assets with matrix and embedding outputs."]
  },
  {
    id: "publication-results-panels",
    name: "Publication results panels",
    priority: 1,
    description: "Manuscript-style multi-panel result figures with omics plots, spatial panels, evidence cards, and concise claims.",
    flagshipTemplateId: "manuscript-results-figure",
    assetIds: ["expression-matrix", "embedding-space", "metric-card", "calibration", "confusion-matrix", "error-analysis", "cell-tumor", "cell-immune", "cell-t", "cell-macrophage", "gene-locus", "chromatin", "tissue-section", "spatial-grid", "segmentation-mask", "microscope", "sequencer", "protein", "antibody", "plate-96", "benchmark", "dataset"],
    templates: ["manuscript-results-figure", "omics-results-summary", "screening-hit-panel", "wetlab-realistic-context-panel", "evidence-claim-card"],
    agentUseHints: ["Use when a slide brief asks for paper-style results, graphical abstract evidence, or manuscript figure panels.", "Combine editable PlotSpec nodes with signature assets; keep claims in captions and review queue."]
  },
  {
    id: "ai-biosecurity-eval",
    name: "AI biosecurity evaluation",
    priority: 1,
    description: "Benchmarks, classifiers, DURC flags, permission tiers, human review, audit, and escalation.",
    flagshipTemplateId: "ai-biosecurity-pipeline",
    assetIds: ["dataset", "benchmark", "metric-card", "classifier", "bio-classifier", "protocol-risk-screen", "durc-flag", "risk-gate", "permission-tier", "human-review", "audit-log", "red-team", "domain-expert-review", "biosafety-tier", "dual-use-triage", "pathogen-intent-classifier", "wetlab-feasibility-review", "bio-protocol-benchmark", "gene-synthesis-screen", "escalation-path", "safety-classifier", "policy-stack", "review-queue", "approval-stamp", "blocked-output"],
    templates: ["ai-biosecurity-pipeline", "permissioning-ladder", "benchmark-dashboard", "review-audit-flow"],
    agentUseHints: ["Use for biological AI safety, permissioning, DURC, and review slides.", "Place risk gates and human review after classifier or benchmark evidence."]
  },
  {
    id: "agentic-ai-mcp-rag",
    name: "Agentic AI / MCP / RAG",
    priority: 2,
    description: "Agent planning, retrieval, tools, MCP servers, memory, execution, and verifier loops.",
    flagshipTemplateId: "agent-loop-architecture",
    assetIds: ["prompt", "context-window", "retrieval", "vector-store", "memory", "tool-call", "planner", "executor", "mcp-server", "agent-loop", "multi-agent", "router", "scratchpad", "function-schema", "audit-log", "dataset", "model-block", "foundation-model", "classifier", "risk-gate", "human-review"],
    templates: ["agent-loop-architecture", "rag-tool-workflow", "mcp-system-map", "agent-verifier-loop"],
    agentUseHints: ["Use for agentic workflow diagrams and MCP architecture slides.", "Group planner, executor, memory, retrieval, and tool calls as a loop."]
  },
  {
    id: "drug-discovery",
    name: "Drug discovery",
    priority: 3,
    description: "Target validation, assay screening, hit triage, lead optimization, toxicity review, and candidate nomination.",
    flagshipTemplateId: "drug-discovery-funnel",
    assetIds: ["target-validation", "target-engagement", "compound-library", "hit-triage", "dose-response-curve", "selectivity-panel", "sar-table", "medicinal-chemistry-cycle", "admet-panel", "toxicity-screen", "pk-profile", "efficacy-model", "biomarker-response", "lead-series", "candidate-nomination", "ind-enabling-package", "drug-perturbation", "pooled-screen", "arrayed-screen", "plate-96", "plate-384", "pipette", "incubator", "centrifuge", "cell-tumor", "protein", "receptor", "ligand", "metabolite", "pathway-node", "signaling-cascade", "protein-complex", "dataset", "metric-card", "calibration", "error-analysis", "benchmark", "classifier", "human-cohort", "blood-sample", "gene-locus"],
    templates: ["drug-discovery-funnel", "hit-triage-panel", "target-validation-panel", "lead-optimization-summary"],
    agentUseHints: ["Use for pharma discovery funnels, hit validation, lead optimization, and translational biotech strategy slides.", "Pair target/mechanism assets with assay plates, screening metrics, toxicity or calibration evidence, and candidate nomination."]
  },
  {
    id: "protein-engineering",
    name: "Protein engineering",
    priority: 3,
    description: "Protein design, variant libraries, directed evolution, binding/kinetic assays, purification, and developability.",
    flagshipTemplateId: "protein-engineering-platform",
    assetIds: ["protein-domain", "binding-pocket", "antibody-fragment", "enzyme-active-site", "protein-variant-library", "directed-evolution", "affinity-maturation", "protein-design-model", "expression-host", "purification-column", "structure-prediction", "stability-assay", "binding-affinity-assay", "enzyme-kinetics", "developability-profile", "sequence-logo", "protein", "enzyme", "antibody", "receptor", "ligand", "protein-complex", "cell-surface-marker", "western-blot", "mass-spectrometer", "plate-96", "plate-384", "liquid-handler", "microfluidic-chip", "dataset", "metric-card", "calibration", "expression-matrix", "sequencer", "cell-stem", "cell-organoid"],
    templates: ["protein-engineering-platform", "directed-evolution-cycle", "binder-affinity-panel", "developability-summary"],
    agentUseHints: ["Use for protein design, binder optimization, enzyme engineering, and platform biotech slides.", "Pair structure/design assets with variant libraries, assay evidence, purification, and developability review."]
  },
  {
    id: "synthetic-biology",
    name: "Synthetic biology",
    priority: 3,
    description: "Genetic circuits, DNA assembly, chassis engineering, biosensors, metabolic pathway engineering, and containment.",
    flagshipTemplateId: "synthetic-biology-platform",
    assetIds: ["genetic-circuit", "promoter-library", "ribosome-binding-site", "terminator", "plasmid-vector", "synthetic-operon", "dna-assembly", "golden-gate-assembly", "gibson-assembly", "design-build-test-learn-cycle", "chassis-cell", "bioreactor", "biosensor-circuit", "logic-gate-genetic", "metabolic-pathway-engineering", "pathway-flux-map", "strain-library", "kill-switch", "plasmid", "dna-helix", "gene-locus", "promoter", "enhancer", "rna-strand", "transcription-factor", "pathway-node", "signaling-cascade", "activation-edge", "inhibition-edge", "enzyme", "metabolite", "bacteria", "cell-epithelial", "microfluidic-chip", "liquid-handler", "plate-96", "sequencer", "dataset"],
    templates: ["synthetic-biology-platform", "genetic-circuit-design", "metabolic-engineering-panel", "biosensor-kill-switch-summary"],
    agentUseHints: ["Use for DBTL, genetic circuit, plasmid assembly, biosensor, metabolic engineering, and containment slides.", "Keep genetic parts, chassis behavior, assay evidence, and safety/containment gates as separate editable objects."]
  },
  {
    id: "microbiome-infectious-disease",
    name: "Microbiome / infectious disease",
    priority: 3,
    description: "Microbiome ecology, host-pathogen interaction, metagenomics, antimicrobial resistance, outbreak clusters, and infection models.",
    flagshipTemplateId: "microbiome-infectious-disease-platform",
    assetIds: ["microbiome-community", "gut-microbiome", "bacterial-strain", "viral-phage", "fungal-cell", "pathogen-host-interaction", "mucosal-barrier", "microbiome-profile", "metagenomic-read", "taxonomic-abundance", "alpha-diversity", "beta-diversity", "amr-gene", "antimicrobial-resistance", "antibiotic-treatment", "microbiome-dysbiosis", "outbreak-cluster", "infection-model", "bacteria", "virus-particle", "pathogen-sample", "gut", "immune-system", "cell-epithelial", "cell-immune", "cell-macrophage", "tissue-section", "sequencer", "metabolite", "cytokine", "antibody", "receptor", "dataset", "metric-card", "calibration", "error-analysis", "human-cohort", "blood-sample", "biosafety-cabinet"],
    templates: ["microbiome-infectious-disease-platform", "host-pathogen-interaction-panel", "amr-surveillance-dashboard", "microbiome-diversity-results"],
    agentUseHints: ["Use for microbiome study designs, host-microbe interaction, pathogen surveillance, AMR dashboards, and infectious disease evidence slides.", "Keep community context, host barrier, metagenomic evidence, AMR review, and outbreak interpretation as distinct editable objects."]
  },
  {
    id: "cell-therapy",
    name: "Cell therapy",
    priority: 3,
    description: "CAR-T/TCR/NK therapy, immune engineering, manufacturing, release testing, infusion, and patient monitoring workflows.",
    flagshipTemplateId: "cell-therapy-manufacturing-platform",
    assetIds: ["car-t-cell", "engineered-t-cell", "tcr-therapy", "nk-cell-therapy", "tumor-antigen", "antigen-presentation", "viral-vector-transduction", "leukapheresis", "cell-expansion", "activation-beads", "gene-edited-cell", "potency-assay", "cytokine-release", "infusion-bag", "patient-infusion", "manufacturing-batch", "release-testing", "cryopreservation", "cell-t", "cell-nk", "cell-immune", "cell-tumor", "cytokine", "antibody", "receptor", "lentiviral-library", "flow-cytometry", "cell-sorter", "plate-96", "human-cohort", "blood-sample", "biosafety-cabinet", "metric-card", "calibration", "dataset"],
    templates: ["cell-therapy-manufacturing-platform", "car-t-mechanism-panel", "cell-therapy-release-qc", "patient-infusion-monitoring"],
    agentUseHints: ["Use for cell therapy platform, CAR-T/TCR/NK mechanism, manufacturing, release testing, and clinical monitoring slides.", "Keep patient sample, engineering/manufacturing, potency/release evidence, infusion, and toxicity monitoring as separate editable objects."]
  },
  {
    id: "microscopy-image-analysis",
    name: "Microscopy image analysis",
    priority: 3,
    description: "Microscopy fields, channel/z-stack preprocessing, segmentation, tracking, phenotyping, QC, and model-assisted annotation workflows.",
    flagshipTemplateId: "microscopy-image-analysis-pipeline",
    assetIds: ["image-analysis-pipeline", "microscope-field", "fluorescence-channel", "z-stack", "tile-stitching", "illumination-correction", "focus-quality", "nuclei-segmentation", "membrane-segmentation", "organelle-segmentation", "instance-mask", "cell-tracking", "phenotype-feature-vector", "morphology-embedding", "classifier-heatmap", "image-qc-dashboard", "annotation-brush", "segmentation-model", "microscope", "confocal-microscope", "microscopy-tile", "segmentation-mask", "cell-boundary", "image-registration", "morphology-feature", "spatial-grid", "histology-section", "tissue-region", "neighborhood-graph", "dataset", "metric-card", "classifier", "calibration", "error-analysis", "embedding-space", "cell-neighborhood"],
    templates: ["microscopy-image-analysis-pipeline", "segmentation-qc-panel", "phenotyping-results-dashboard", "model-assisted-annotation-workflow"],
    agentUseHints: ["Use for microscopy computer-vision pipelines, segmentation, tracking, morphology phenotyping, and image QC slides.", "Keep raw image evidence, preprocessing, segmentation masks, feature extraction, model outputs, and review/QC as separate editable objects."]
  },
  {
    id: "lab-automation",
    name: "Lab automation",
    priority: 3,
    description: "Robotic lab automation, liquid handling, plate logistics, barcode tracking, LIMS handoff, and assay QC workflows.",
    flagshipTemplateId: "lab-automation-platform",
    assetIds: ["lab-automation-platform", "liquid-handler", "robotic-arm", "automated-liquid-handler", "plate-handler", "plate-stack", "barcode-scanner", "plate-reader", "reagent-reservoir", "tip-rack", "robotic-gripper", "lims-dashboard", "assay-scheduler", "sample-tracker", "qc-gate-automation", "incubator-stack", "automated-microscope", "acoustic-dispenser", "colony-picker", "tube-rack", "sample-tube-array", "robotic-rail", "deck-layout", "waste-chute", "seal-peeler", "lab-sensor", "automation-orchestrator", "plate-96", "plate-384", "pipette", "incubator", "centrifuge", "microfluidic-chip", "biosafety-cabinet", "microscope", "confocal-microscope", "flow-cytometry", "sequencer", "dataset", "metric-card", "calibration", "error-analysis"],
    templates: ["lab-automation-platform", "liquid-handling-deck-layout", "plate-logistics-qc", "lims-run-monitor"],
    agentUseHints: ["Use for automated assay execution, robotic plate movement, liquid handling, LIMS tracking, and lab operations slides.", "Keep deck setup, robotic execution, readout, sample tracking, and QC handoff as separate editable objects."]
  },
  {
    id: "anatomy-organ-systems",
    name: "Anatomy / organ systems",
    priority: 3,
    description: "Organ context maps, tissue modules, sample flow, clinical endpoint evidence, and cross-organ comparison figures.",
    flagshipTemplateId: "anatomy-organ-system-overview",
    assetIds: ["anatomy-overview", "organ-axis-brain-lung-gut", "brain", "lung", "gut", "liver", "heart", "immune-system", "blood-brain-barrier", "kidney", "spleen", "pancreas", "skin", "bone-marrow", "lymph-node", "vasculature", "respiratory-tract", "intestinal-villus", "renal-nephron", "hepatic-lobule", "cardiac-muscle", "neural-circuit", "blood-vessel", "lymphatic-vessel", "immune-organ-map", "organ-chip", "patient-organ-cohort", "disease-tissue-map", "organ-sample-flow", "tissue-biomarker-panel", "organ-risk-context", "clinical-endpoint-card", "anatomy-callout", "organ-scale-bar", "tissue-region-map", "organ-legend", "organ-system-network", "cross-organ-comparison", "human-cohort", "mouse-model", "organoid-model", "blood-sample", "tissue-section", "histology-section", "cell-immune", "cell-epithelial", "cell-neuron", "cell-hepatocyte", "cell-muscle", "dataset", "metric-card", "spatial-grid"],
    templates: ["anatomy-organ-system-overview", "cross-organ-disease-context", "organ-to-sample-flow", "clinical-anatomy-summary"],
    agentUseHints: ["Use for anatomy-aware study overviews, organ-to-sample workflows, tissue biomarker context, translational evidence, and clinical endpoint slides.", "Keep organ context, tissue region, sample flow, evidence panel, and clinical review as separate editable objects."]
  },
  {
    id: "methods-and-protocols",
    name: "Methods and protocols",
    priority: 3,
    description: "Protocol overview figures, sample preparation, assay setup, readout, controls, timeline, QC, and review-safe method summaries.",
    flagshipTemplateId: "methods-protocol-overview",
    assetIds: ["protocol-overview", "sample-prep-workflow", "reagent-mastermix", "serial-dilution", "incubation-step", "wash-step", "centrifugation-step", "magnetic-bead-cleanup", "pcr-amplification", "qpcr-assay", "rt-qpcr-assay", "elisa-assay", "western-blot-workflow", "gel-imaging", "immunostaining", "fixation-permeabilization", "cell-culture-passaging", "transfection-step", "library-prep-workflow", "assay-timeline", "protocol-checklist", "protocol-qc-gate", "replicate-layout", "control-sample-set", "standard-curve", "reagent-compatibility", "temperature-profile", "sample-normalization", "aliquot-plan", "protocol-deviation", "method-safety-note", "pipette", "plate-96", "plate-384", "centrifuge", "incubator", "gel-electrophoresis", "western-blot", "qpcr-machine", "flow-cytometry", "sequencer", "microscope", "biosafety-cabinet", "dataset", "metric-card"],
    templates: ["methods-protocol-overview", "sample-prep-to-readout", "assay-qc-summary", "protocol-timeline-panel"],
    agentUseHints: ["Use for protocol-safe method overview slides, manuscript methods schematics, SOP summary decks, and assay setup figures.", "Keep sample preparation, reagent setup, assay execution, readout, controls, QC, and safety/review caveats as separate editable objects."]
  },
  {
    id: "grant-and-consulting-summary",
    name: "Grant and consulting summary",
    priority: 3,
    description: "Executive scientific one-pagers, grant specific aims, strategy briefs, impact evidence, milestone roadmaps, risk matrices, and recommendation slides.",
    flagshipTemplateId: "grant-consulting-one-slide",
    assetIds: ["grant-summary-board", "problem-statement-card", "scientific-opportunity-map", "hypothesis-aims", "specific-aim-1", "specific-aim-2", "specific-aim-3", "innovation-claim", "approach-workplan", "milestone-roadmap", "quarterly-timeline", "budget-envelope", "resource-allocation", "team-capability-map", "stakeholder-map", "decision-brief", "value-proposition", "impact-metric-card", "outcome-kpi", "market-landscape", "competitive-positioning", "evidence-snapshot", "data-room-index", "risk-matrix", "risk-mitigation-plan", "dependency-map", "go-no-go-gate", "deliverable-package", "proposal-review", "funder-alignment", "recommendation-card", "executive-takeaway", "appendix-evidence", "consulting-one-pager", "roadmap-swimlane", "priority-scorecard", "dataset", "metric-card", "calibration", "risk-gate", "human-review", "audit-log"],
    templates: ["grant-consulting-one-slide", "specific-aims-summary", "milestone-risk-roadmap", "impact-evidence-brief"],
    agentUseHints: ["Use for grant aims pages, biotech strategy one-pagers, funder updates, consulting summaries, and executive scientific recommendation slides.", "Keep problem, opportunity, evidence, roadmap, risk, budget/resource, and recommendation objects separately editable for human review."]
  },
  {
    id: "clinical-translational",
    name: "Clinical / translational",
    priority: 3,
    description: "Translational study overviews linking patient cohorts, consent/enrollment, biospecimens, omics bridges, biomarkers, endpoints, safety, and clinical review.",
    flagshipTemplateId: "clinical-translational-study-overview",
    assetIds: ["clinical-study-overview", "patient-journey-map", "consent-enrollment", "eligibility-criteria", "inclusion-exclusion", "cohort-stratification", "cohort-table", "trial-design-schema", "randomization-schema", "treatment-arm-comparison", "clinical-sample-flow", "biospecimen-collection", "longitudinal-visit-schedule", "clinical-omics-bridge", "translational-readout", "biomarker-discovery", "biomarker-validation", "assay-validation", "companion-diagnostic", "validation-cohort", "endpoint-hierarchy", "primary-endpoint", "secondary-endpoint", "clinical-response-card", "survival-curve", "adverse-event-panel", "safety-monitoring", "clinical-risk-benefit", "regulatory-evidence-brief", "evidence-grade", "ecrf-data-capture", "data-lock", "irb-review", "clinician-review", "site-activation", "patient-reported-outcome", "real-world-evidence", "clinical-decision-support", "human-cohort", "patient-organ-cohort", "organ-sample-flow", "tissue-biomarker-panel", "clinical-endpoint-card", "blood-sample", "dataset", "metric-card", "calibration", "human-review", "audit-log"],
    templates: ["clinical-translational-study-overview", "cohort-to-biomarker-flow", "endpoint-validation-dashboard", "safety-evidence-review"],
    agentUseHints: ["Use for translational study design, cohort-to-biomarker figures, clinical endpoint summaries, safety evidence reviews, and validation cohort slides.", "Keep enrollment, biospecimen flow, biomarker evidence, endpoint status, safety review, and clinical interpretation as separate editable objects."]
  },
  {
    id: "space-biology-genelab",
    name: "Space biology / GeneLab",
    priority: 3,
    description: "Microgravity, spacecraft, astronaut sample collection, mission biology assay, and omics analysis.",
    flagshipTemplateId: "spaceflight-sample-workflow",
    assetIds: ["microgravity", "spacecraft", "astronaut-sample", "spaceflight-assay", "human-cohort", "tissue-section", "sequencer", "expression-matrix", "dataset", "gene-locus", "chromatin", "protein", "cell-immune", "cell-muscle", "cell-hepatocyte", "organoid-model", "mouse-model", "blood-sample", "microscope", "metric-card"],
    templates: ["spaceflight-sample-workflow", "genelab-omics-pipeline", "mission-biology-summary", "space-omics-results-panel"],
    agentUseHints: ["Use for space biology and GeneLab mission sample workflows.", "Pair mission context assets with assay and omics output assets."]
  }
];

export const PREMIUM_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "manuscript-results-figure",
    workflowPack: "publication-results-panels",
    name: "Manuscript results figure",
    description: "A-E paper-style figure with experimental context, volcano, embedding, heatmap, and claim/evidence panel.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["cell-tumor", "sequencer", "expression-matrix", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for manuscript figures, lab-meeting evidence slides, and paper-style result summaries.", "Keep claim text short and attach citations or user confirmation before export."],
    qaChecklist: ["Every panel label is visible.", "Plot axes and encodings are readable.", "Claims are cited or user-confirmed.", "PPTX export warnings are reviewed."]
  },
  {
    id: "omics-results-summary",
    workflowPack: "publication-results-panels",
    name: "Omics results summary",
    description: "Compact results slide for matrix-to-embedding-to-marker interpretation.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["expression-matrix", "embedding-space", "gene-locus", "protein"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when the slide brief emphasizes differential expression, clusters, biomarkers, or omics evidence.", "Prefer editable PlotSpec nodes for result panels rather than screenshots."],
    qaChecklist: ["Marker labels do not collide.", "Color scale has enough contrast.", "Source table/provenance is attached."]
  },
  {
    id: "screening-hit-panel",
    workflowPack: "publication-results-panels",
    name: "Screening hit panel",
    description: "Perturbation result figure focused on hit genes, effect sizes, and validation evidence.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["pooled-screen", "crispr-cas9", "gene-locus", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for CRISPR or chemical screen hit summaries.", "Place the strongest hit and evidence card in the right-most conclusion area."],
    qaChecklist: ["Hit threshold is visible.", "Control/treated labels are clear.", "Validation evidence is flagged if uncited."]
  },
  {
    id: "perturb-seq-workflow",
    workflowPack: "perturb-seq-crispr",
    name: "Perturb-seq workflow",
    description: "Left-to-right CRISPR perturbation, pooled screen, single-cell capture, sequencing, and expression matrix workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["cell-t", "crispr-cas9", "scrna-droplet", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for methods slides explaining Perturb-seq or pooled CRISPR screens.", "Connect assets in process order and keep each step label under six words."],
    qaChecklist: ["Workflow order is biologically correct.", "Connectors do not cross important labels.", "Methods terms are consistent with source notes."]
  },
  {
    id: "spatial-results-panel",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial results panel",
    description: "Tissue image, spot array, segmentation, neighborhood graph, and result annotation layout.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["tissue-section", "visium-spot-array", "segmentation-mask", "neighborhood-graph"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for Visium, MERFISH, Xenium, histology, and neighborhood result slides.", "Make the tissue or spatial map the primary subject, then add evidence panels."],
    qaChecklist: ["Spot/map colors are distinguishable.", "Scale/context labels are present where needed.", "Image provenance is marked private or cited."]
  },
  {
    id: "spatial-realistic-hybrid-panel",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial realistic hybrid panel",
    description: "Editorial histology/microscopy image evidence with editable SVG annotations, spatial plots, and provenance/export QA.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-he-tissue-section", "realistic-segmentation-overlay", "realistic-spatial-map", "neighborhood-graph"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when a slide brief asks for microscopy, histology, source evidence, segmentation, or spatial context.", "Keep mechanism diagrams SVG-first; insert realistic assets as provenance-tracked evidence panels."],
    qaChecklist: ["Image rights/provenance are visible.", "Crop and mask preserve the relevant tissue or cellular region.", "PPTX/DOCX image fallback warnings are reviewed before delivery."]
  },
  {
    id: "wetlab-realistic-context-panel",
    workflowPack: "publication-results-panels",
    name: "Wetlab realistic context panel",
    description: "Editorial wetlab protocol context with realistic instrument/sample panels, editable QA badges, and export fallback warnings.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-pipette-bench", "realistic-plate-96-photo", "realistic-microscope-bench", "realistic-biosafety-cabinet"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when a slide brief asks for protocol context, wetlab credibility, sample handling, assay setup, or instrument evidence.", "Keep claims in callouts and mark realistic panels as provenance-tracked image fallbacks for PPTX/DOCX."],
    qaChecklist: ["Image rights/provenance are visible.", "Protocol step labels are source-backed or marked draft.", "PPTX/DOCX realistic image fallback warnings are reviewed before delivery."]
  },
  {
    id: "cellular-realistic-evidence-panel",
    workflowPack: "publication-results-panels",
    name: "Cellular realistic evidence panel",
    description: "Editorial cellular texture evidence with organoid, tumor microenvironment, immune infiltrate, assay evidence, and editable biology annotations.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-organoid-texture", "realistic-tumor-microenvironment", "realistic-immune-infiltrate", "realistic-protein-gel"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when a slide brief asks for cellular evidence, organoid context, tumor microenvironment, immune infiltration, or microscopy-like textures.", "Keep interpretation in editable labels and attach source/review state to realistic image panels."],
    qaChecklist: ["Image rights/provenance are visible.", "Cell-state and marker labels are source-backed or marked as demo evidence.", "PPTX/DOCX realistic image fallback warnings are reviewed before delivery."]
  },
  {
    id: "space-realistic-context-panel",
    workflowPack: "space-biology-genelab",
    name: "Space realistic context panel",
    description: "Editorial spaceflight biology context with mission imagery, crew sample, flight assay, GeneLab data evidence, and export/provenance QA.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-spacecraft-context", "realistic-astronaut-sample", "realistic-spaceflight-assay", "realistic-genelab-data-context"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when a slide brief asks for mission context, astronaut sample collection, spaceflight assay, or GeneLab data evidence.", "Keep mission context compact so the biological result and provenance review stay visible."],
    qaChecklist: ["Mission/sample provenance is visible.", "Crew/sample labels avoid unsupported causal claims.", "PPTX/DOCX realistic image fallback warnings are reviewed before delivery."]
  },
  {
    id: "ai-biosecurity-pipeline",
    workflowPack: "ai-biosecurity-eval",
    name: "AI biosecurity pipeline",
    description: "Benchmark, classifier, risk gate, permission tier, human review, audit log, and escalation pipeline.",
    layout: "pipeline",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["benchmark", "classifier", "risk-gate", "human-review"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for safety evaluation, calibrated permissioning, and DURC triage presentations.", "Show risk decisions as explicit gates instead of vague arrows."],
    qaChecklist: ["Permission states are named.", "Human review appears after risk decision.", "Audit/provenance path is visible.", "Risk-warning style is used only for true warning elements."]
  },
  {
    id: "agent-loop-architecture",
    workflowPack: "agentic-ai-mcp-rag",
    name: "Agent MCP/RAG architecture",
    description: "Prompt, planner, retrieval, tool call, MCP server, memory, executor, verifier, and audit loop.",
    layout: "architecture",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["prompt", "retrieval", "tool-call", "mcp-server"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for agentic AI system diagrams that need editable components and provenance.", "Group planner/executor/tool/server paths separately from audit and verifier paths."],
    qaChecklist: ["Data and tool boundaries are explicit.", "Verifier/audit path is visible.", "Loop arrows do not imply unsupervised autonomy unless intended."]
  },
  {
    id: "spaceflight-sample-workflow",
    workflowPack: "space-biology-genelab",
    name: "Spaceflight sample workflow",
    description: "Mission context, astronaut sample, tissue/omics assay, GeneLab dataset, and analysis output workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["microgravity", "astronaut-sample", "sequencer", "dataset"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for GeneLab, spaceflight omics, and mission sample processing slides.", "Separate mission metadata from assay and analysis outputs."],
    qaChecklist: ["Mission/sample labels are concise.", "Assay and dataset provenance is attached.", "Space context does not overwhelm biology result."]
  },
  {
    id: "crispr-screen-results",
    workflowPack: "perturb-seq-crispr",
    name: "CRISPR screen result",
    description: "Screen plate, pooled library, hit gene, and metric evidence layout for CRISPR screen readouts.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["pooled-screen", "plate-96", "gene-locus", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for hit discovery or screen readout slides.", "Put hit gene and validation metric in the conclusion panel."],
    qaChecklist: ["Hit threshold is visible.", "Controls are labeled.", "Screen library provenance is present."]
  },
  {
    id: "hit-validation-panel",
    workflowPack: "perturb-seq-crispr",
    name: "Hit validation panel",
    description: "Follow-up validation figure with perturbation, cells, assay plate, and evidence card.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["knockdown", "activation", "cell-tumor", "plate-96"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use after primary screen summary.", "Separate primary hit from validation assay evidence."],
    qaChecklist: ["Perturbation direction is clear.", "Replicate/sample labels are not ambiguous.", "Validation claim needs citation or user confirmation."]
  },
  {
    id: "perturb-method-overview",
    workflowPack: "perturb-seq-crispr",
    name: "Perturbation method overview",
    description: "Methods slide covering guide design, delivery, capture, sequencing, and matrix output.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["guide-rna", "lentiviral-library", "scrna-droplet", "sequencing-read"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for grant, methods, or lab-meeting process slides.", "Keep guide delivery and single-cell capture as separate steps."],
    qaChecklist: ["Method order is biologically plausible.", "Terminology matches source notes.", "Connector labels do not overlap assets."]
  },
  {
    id: "drug-discovery-funnel",
    workflowPack: "drug-discovery",
    name: "Drug discovery funnel",
    description: "Target validation, compound screen, hit triage, lead optimization, toxicity review, and candidate nomination workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["target-validation", "compound-library", "medicinal-chemistry-cycle", "candidate-nomination"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use as the flagship drug-discovery slide from source notes about hit finding, validation, or lead optimization.", "Keep target biology, assay readout, safety/toxicity review, and nomination as distinct editable steps."],
    qaChecklist: ["Target, assay, hit, and candidate terms are source-backed.", "Screening metrics and validation evidence are visibly separated.", "PPTX export warnings name premium fallback assets."]
  },
  {
    id: "hit-triage-panel",
    workflowPack: "drug-discovery",
    name: "Hit triage panel",
    description: "Screen output, hit rank, potency/selectivity metric, and confidence caveat panel for early discovery decks.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["compound-library", "hit-triage", "dose-response-curve", "selectivity-panel"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when the brief asks for screen hits, rank ordering, or primary hit triage.", "Pair assay context with a metric card and an explicit uncertainty/caveat block."],
    qaChecklist: ["Hit threshold and controls are visible.", "Metric definitions are not implied by decoration alone.", "Caveats are cited, user-confirmed, or left in review."]
  },
  {
    id: "target-validation-panel",
    workflowPack: "drug-discovery",
    name: "Target validation panel",
    description: "Target biology and assay evidence panel linking receptor/protein mechanism to cellular validation.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["target-validation", "target-engagement", "receptor", "biomarker-response"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use when the source emphasizes biological rationale, target engagement, knockdown/perturbation evidence, or translational validation.", "Do not let the molecule icon stand in for experimental proof; keep evidence panels explicit."],
    qaChecklist: ["Mechanism and evidence are visually distinct.", "Validation claims have provenance or review items.", "Cell/model context is named."]
  },
  {
    id: "lead-optimization-summary",
    workflowPack: "drug-discovery",
    name: "Lead optimization summary",
    description: "Lead series summary with potency, selectivity, ADMET/toxicity, cohort or sample context, and go/no-go status.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["lead-series", "sar-table", "pk-profile", "toxicity-screen"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for consulting or biotech strategy slides that compare candidate readiness.", "Surface toxicity/safety and uncertainty as reviewable objects rather than decorative badges."],
    qaChecklist: ["Candidate labels fit in their panels.", "ADMET/toxicity evidence is not overstated.", "Go/no-go status is reviewable before export."]
  },
  {
    id: "protein-engineering-platform",
    workflowPack: "protein-engineering",
    name: "Protein engineering platform",
    description: "Design-to-developability workflow linking structure design, variant libraries, assay selection, purification, and readiness review.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["protein-design-model", "protein-variant-library", "binding-affinity-assay", "purification-column"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship protein engineering slide from notes about protein design, directed evolution, binder optimization, enzyme engineering, or developability.", "Keep model/design, assay evidence, purification, and developability review as separate editable objects."],
    qaChecklist: ["Structure/design claims are not treated as experimental evidence.", "Assay metrics identify affinity, kinetics, stability, or developability.", "PPTX export warnings name layered protein assets."]
  },
  {
    id: "directed-evolution-cycle",
    workflowPack: "protein-engineering",
    name: "Directed evolution cycle",
    description: "Library generation, expression, selection/screening, sequencing, and iterative improvement cycle.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["directed-evolution", "protein-variant-library", "expression-host", "sequence-logo"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when the source emphasizes rounds of diversification, selection, enrichment, or sequence learning.", "Show each cycle step as editable nodes rather than one static circular graphic."],
    qaChecklist: ["Round labels are readable.", "Selection criteria are source-backed.", "Sequence logo is clearly marked as illustrative unless data is imported."]
  },
  {
    id: "binder-affinity-panel",
    workflowPack: "protein-engineering",
    name: "Binder affinity panel",
    description: "Binder/domain mechanism with affinity maturation, binding assay, sensorgram/kinetics, and sequence evidence.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["antibody-fragment", "binding-pocket", "affinity-maturation", "binding-affinity-assay"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for antibody, nanobody, receptor-ligand, or binder optimization result slides.", "Keep KD/kon/koff style claims attached to assay or source tables."],
    qaChecklist: ["Affinity labels are explicit.", "Binding mechanism and assay evidence are separate.", "Claim strength is reviewed before export."]
  },
  {
    id: "developability-summary",
    workflowPack: "protein-engineering",
    name: "Developability summary",
    description: "Stability, purification, expression, kinetics, and developability risk summary for candidate-ready protein assets.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["stability-assay", "purification-column", "enzyme-kinetics", "developability-profile"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for candidate readiness, manufacturability, assay package, and platform summary slides.", "Represent risk flags as reviewable QA items rather than final claims."],
    qaChecklist: ["Stability and purification metrics are not conflated.", "Developability risks are visible.", "Source/provenance for assay values is attached."]
  },
  {
    id: "synthetic-biology-platform",
    workflowPack: "synthetic-biology",
    name: "Synthetic biology platform",
    description: "DBTL workflow linking genetic circuit design, DNA assembly, chassis screening, biosensor readout, pathway flux, and containment review.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["genetic-circuit", "dna-assembly", "chassis-cell", "kill-switch"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship synthetic biology slide from notes about DBTL, genetic circuits, chassis engineering, biosensors, metabolic engineering, or containment.", "Keep circuit design, build method, test/readout evidence, and safety guardrails as distinct editable objects."],
    qaChecklist: ["Genetic part function is not implied without source evidence.", "Chassis and assay context are visible.", "Containment or kill-switch elements remain reviewable before export."]
  },
  {
    id: "genetic-circuit-design",
    workflowPack: "synthetic-biology",
    name: "Genetic circuit design",
    description: "Promoter, RBS, coding sequence, terminator, plasmid vector, and logic gate design panel.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["promoter-library", "ribosome-binding-site", "synthetic-operon", "logic-gate-genetic"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for circuit architecture, part library, plasmid/vector design, or gene cassette slides.", "Show promoter/RBS/terminator as editable parts rather than one opaque DNA cartoon."],
    qaChecklist: ["Part order is biologically plausible.", "Regulatory logic is labeled.", "Part/source provenance is attached or marked draft."]
  },
  {
    id: "metabolic-engineering-panel",
    workflowPack: "synthetic-biology",
    name: "Metabolic engineering panel",
    description: "Engineered pathway, strain library, flux map, bioreactor, and production metric summary.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["metabolic-pathway-engineering", "pathway-flux-map", "strain-library", "bioreactor"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when source notes mention pathway optimization, flux balance, strain screening, yield, titer, productivity, or fermentation.", "Keep production metrics and pathway edits separate from chassis cartoons."],
    qaChecklist: ["Yield/titer units are visible.", "Flux or pathway arrows are not overstated.", "Imported data or illustrative demo status is clear."]
  },
  {
    id: "biosensor-kill-switch-summary",
    workflowPack: "synthetic-biology",
    name: "Biosensor and kill-switch summary",
    description: "Biosensor circuit, genetic logic gate, chassis response, containment boundary, and kill-switch review summary.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["biosensor-circuit", "logic-gate-genetic", "chassis-cell", "kill-switch"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for engineered sensing, containment, safety review, or deployability slides.", "Represent kill-switch and containment as reviewable gates, not decorative warning icons."],
    qaChecklist: ["Sensor input/output is labeled.", "Containment claims are flagged for review.", "Export warnings name layered SVG fallback assets."]
  },
  {
    id: "microbiome-infectious-disease-platform",
    workflowPack: "microbiome-infectious-disease",
    name: "Microbiome infectious disease platform",
    description: "Workflow linking baseline microbial community, host barrier context, pathogen interaction, metagenomic evidence, AMR review, and outbreak interpretation.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["microbiome-community", "mucosal-barrier", "metagenomic-read", "antimicrobial-resistance"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship microbiome/infectious disease slide from notes about microbiome ecology, host-pathogen interaction, metagenomics, AMR, or outbreak surveillance.", "Keep community state, host tissue, pathogen evidence, sequencing output, and AMR/public-health review as separate editable objects."],
    qaChecklist: ["Microbiome association is not treated as causal without source support.", "AMR/outbreak labels remain reviewable.", "PPTX export warnings name layered SVG fallback assets."]
  },
  {
    id: "host-pathogen-interaction-panel",
    workflowPack: "microbiome-infectious-disease",
    name: "Host-pathogen interaction panel",
    description: "Host barrier, pathogen/microbiome interface, immune signal, infection trajectory, and evidence review.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["pathogen-host-interaction", "mucosal-barrier", "cytokine", "infection-model"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for infection mechanism, host response, mucosal barrier, and immune-microbe interaction result slides.", "Separate mechanistic cartoons from evidence plots and source-backed claims."],
    qaChecklist: ["Host-pathogen directionality is labeled.", "Immune response claims are cited or marked draft.", "Export warnings name premium fallback assets."]
  },
  {
    id: "amr-surveillance-dashboard",
    workflowPack: "microbiome-infectious-disease",
    name: "AMR surveillance dashboard",
    description: "AMR gene evidence, resistance interpretation, outbreak cluster, taxonomic abundance, and review status.",
    layout: "results",
    recommendedStyleProfile: "risk-warning",
    previewAssetIds: ["amr-gene", "antimicrobial-resistance", "outbreak-cluster", "taxonomic-abundance"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when source notes mention antimicrobial resistance, pathogen surveillance, outbreak clusters, isolate tracking, or public-health review.", "Keep AMR evidence and risk interpretation as reviewable objects."],
    qaChecklist: ["AMR labels distinguish gene detection from phenotypic resistance.", "Outbreak linkage is source-backed.", "PPTX export warnings name AMR fallback assets."]
  },
  {
    id: "microbiome-diversity-results",
    workflowPack: "microbiome-infectious-disease",
    name: "Microbiome diversity results",
    description: "Community profile, alpha/beta diversity, dysbiosis summary, and cohort/sample context.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["microbiome-profile", "alpha-diversity", "beta-diversity", "microbiome-dysbiosis"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for microbiome composition, diversity, dysbiosis, cohort, or treatment response result panels.", "Mark illustrative diversity plots unless source tables are imported."],
    qaChecklist: ["Diversity metric labels are readable.", "Dysbiosis claims are not overstated.", "Source/provenance for cohort/table values is attached."]
  },
  {
    id: "cell-therapy-manufacturing-platform",
    workflowPack: "cell-therapy",
    name: "Cell therapy manufacturing platform",
    description: "Vein-to-vein workflow linking leukapheresis, vector/gene engineering, expansion, release testing, infusion, and safety monitoring.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["leukapheresis", "viral-vector-transduction", "cell-expansion", "release-testing"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship cell therapy slide from notes about CAR-T, TCR, NK therapy, immune engineering, manufacturing, release, or infusion.", "Keep manufacturing steps, potency evidence, release QA, and clinical monitoring as distinct editable objects."],
    qaChecklist: ["Patient/sample flow is not confused with mechanism.", "Release and potency claims are source-backed or reviewable.", "PPTX export warnings name layered cell-therapy fallback assets."]
  },
  {
    id: "car-t-mechanism-panel",
    workflowPack: "cell-therapy",
    name: "CAR-T mechanism panel",
    description: "CAR/TCR/NK therapy interaction with tumor antigen, antigen presentation, cytokine release, and mechanism caveat.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["car-t-cell", "tumor-antigen", "antigen-presentation", "cytokine-release"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for mechanism or mode-of-action slides about engineered immune cells.", "Separate antigen recognition cartoons from evidence plots and clinical claims."],
    qaChecklist: ["Antigen specificity is labeled.", "Cytokine/toxicity language is reviewable.", "Mechanism claims are not overstated without source support."]
  },
  {
    id: "cell-therapy-release-qc",
    workflowPack: "cell-therapy",
    name: "Cell therapy release QC",
    description: "Potency assay, release testing, flow cytometry, batch record, cryopreservation, and go/no-go QA dashboard.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["potency-assay", "release-testing", "flow-cytometry", "cryopreservation"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when source notes mention potency, viability, phenotype, sterility, batch release, or QC gates.", "Keep release criteria and data source as editable review objects."],
    qaChecklist: ["Release criteria have units or source labels.", "Batch and assay evidence are separated.", "Go/no-go status remains reviewable before export."]
  },
  {
    id: "patient-infusion-monitoring",
    workflowPack: "cell-therapy",
    name: "Patient infusion monitoring",
    description: "Infusion, patient monitoring, cytokine release, safety review, cohort/sample context, and clinical follow-up panel.",
    layout: "results",
    recommendedStyleProfile: "risk-warning",
    previewAssetIds: ["infusion-bag", "patient-infusion", "cytokine-release", "human-cohort"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for clinical cell therapy monitoring, CRS/ICANS safety, infusion timeline, and patient follow-up slides.", "Represent safety monitoring as reviewable risk items, not decorative warning icons."],
    qaChecklist: ["Clinical safety language is cited or marked draft.", "Monitoring timepoints are readable.", "PPTX warnings name premium fallback assets."]
  },
  {
    id: "microscopy-image-analysis-pipeline",
    workflowPack: "microscopy-image-analysis",
    name: "Microscopy image analysis pipeline",
    description: "Image-to-phenotype workflow linking raw microscopy fields, channel/z-stack preprocessing, segmentation, feature extraction, model review, and QC output.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["microscope-field", "tile-stitching", "nuclei-segmentation", "phenotype-feature-vector"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship microscopy image-analysis slide from notes about segmentation, tracking, phenotyping, QC, or model-assisted annotation.", "Keep raw image evidence, preprocessing, segmentation, features, model output, and QC review as separate editable objects."],
    qaChecklist: ["Image/source provenance is visible.", "Segmentation masks are distinguishable from raw microscopy evidence.", "QC/model claims are source-backed or marked reviewable.", "PPTX warnings name layered microscopy fallback assets."]
  },
  {
    id: "segmentation-qc-panel",
    workflowPack: "microscopy-image-analysis",
    name: "Segmentation QC panel",
    description: "Nuclei, membrane, instance mask, focus quality, and annotation review panel for image-analysis QA.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["nuclei-segmentation", "membrane-segmentation", "instance-mask", "focus-quality"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when source notes mention segmentation quality, mask review, focus/illumination QC, or annotation correction.", "Separate algorithmic mask output from human review or ground truth labels."],
    qaChecklist: ["Mask boundaries remain readable at slide size.", "QC metrics have labels or source tables.", "Manual review state is visible before export."]
  },
  {
    id: "phenotyping-results-dashboard",
    workflowPack: "microscopy-image-analysis",
    name: "Phenotyping results dashboard",
    description: "Morphology feature vector, embedding, classifier heatmap, tracking summary, and evidence/QC cards for result slides.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["phenotype-feature-vector", "morphology-embedding", "classifier-heatmap", "cell-tracking"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for morphology phenotyping, classifier result, cellular imaging screen, and CV benchmark summary slides.", "Keep embeddings and classifier confidence separate from biological interpretation claims."],
    qaChecklist: ["Class labels are not implied by color alone.", "Feature/embedding claims are marked illustrative unless source data is imported.", "Export warnings name premium fallback assets."]
  },
  {
    id: "model-assisted-annotation-workflow",
    workflowPack: "microscopy-image-analysis",
    name: "Model-assisted annotation workflow",
    description: "Human-in-the-loop annotation, segmentation model, review brush, error analysis, and final QC path.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["segmentation-model", "annotation-brush", "image-qc-dashboard", "error-analysis"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when a slide brief mentions manual annotation, model-assisted labeling, human review, or active learning for microscopy.", "Represent model output, human correction, and QC signoff as explicit editable review steps."],
    qaChecklist: ["Human review is visually distinct from model output.", "Annotation state is not treated as final ground truth without source confirmation.", "PPTX export warnings name fallback assets."]
  },
  {
    id: "lab-automation-platform",
    workflowPack: "lab-automation",
    name: "Lab automation platform",
    description: "Deck setup, robotic liquid handling, plate logistics, readout, LIMS tracking, and QC handoff workflow for automated assays.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["lab-automation-platform", "automated-liquid-handler", "robotic-arm", "lims-dashboard"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship slide for automated wetlab workflows, high-throughput screening operations, and lab robotics platform decks.", "Separate physical deck setup, robotic execution, readout, sample tracking, and QC/LIMS handoff."],
    qaChecklist: ["Deck positions are readable.", "Sample identity/barcode path is visible.", "QC and LIMS handoff are source-backed or marked reviewable.", "PPTX warnings name layered automation fallback assets."]
  },
  {
    id: "liquid-handling-deck-layout",
    workflowPack: "lab-automation",
    name: "Liquid handling deck layout",
    description: "Editable deck-map figure with plate, tip rack, reagent reservoir, waste, and liquid handler head.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["deck-layout", "tip-rack", "reagent-reservoir", "automated-liquid-handler"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when the slide brief mentions liquid handling method setup, plate map, reagent layout, or deck configuration.", "Keep deck layout schematic, not protocol-operational instructions."],
    qaChecklist: ["Deck locations are labeled at slide size.", "Reagent and waste labels are unambiguous.", "Export fallback warnings name premium SVG assets."]
  },
  {
    id: "plate-logistics-qc",
    workflowPack: "lab-automation",
    name: "Plate logistics and QC",
    description: "Plate stack, handler, barcode scanner, incubator stack, plate reader, and automated QC routing.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["plate-stack", "plate-handler", "barcode-scanner", "qc-gate-automation"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for plate movement, scheduling, barcode identity, incubation, readout, and QC gate diagrams.", "Keep sample identity tracking explicit before interpreting assay output."],
    qaChecklist: ["Barcode/sample identity path is visible.", "QC threshold is not overclaimed without source data.", "PPTX fallback names exact automation assets."]
  },
  {
    id: "lims-run-monitor",
    workflowPack: "lab-automation",
    name: "LIMS run monitor",
    description: "LIMS dashboard, run scheduler, sample tracker, sensor telemetry, automation orchestrator, and review queue summary.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["lims-dashboard", "assay-scheduler", "sample-tracker", "automation-orchestrator"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for lab operations, LIMS integration, run monitoring, and automation reliability dashboards.", "Represent scheduling and QC alerts as reviewable operational state, not scientific conclusions."],
    qaChecklist: ["Run status is readable.", "Alerts are actionable.", "Operational metrics are marked synthetic or source-backed."]
  },
  {
    id: "anatomy-organ-system-overview",
    workflowPack: "anatomy-organ-systems",
    name: "Anatomy organ system overview",
    description: "Organ context map linking brain, lung, gut, liver, kidney, tissue modules, samples, biomarker evidence, and clinical review.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["anatomy-overview", "organ-axis-brain-lung-gut", "organ-sample-flow", "tissue-biomarker-panel"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship anatomy slide from notes about organ systems, tissue context, clinical samples, biomarkers, or translational endpoint evidence.", "Keep organ map, tissue module, sample flow, evidence, and clinical endpoint review as separate editable objects."],
    qaChecklist: ["Organ and tissue labels are anatomically plausible.", "Sample flow does not imply unsupported clinical conclusions.", "Clinical endpoint and biomarker claims stay reviewable before export."]
  },
  {
    id: "cross-organ-disease-context",
    workflowPack: "anatomy-organ-systems",
    name: "Cross-organ disease context",
    description: "Comparison panel for organ involvement, tissue regions, immune context, and endpoint evidence across multiple organs.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["brain", "lung", "kidney", "cross-organ-comparison"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when the source compares disease signals across organs, systems, or tissues.", "Make organ labels explicit and keep evidence panels separate from interpretation callouts."],
    qaChecklist: ["Cross-organ comparison labels fit.", "Evidence and interpretation are visually separated.", "Unsupported clinical language is flagged."]
  },
  {
    id: "organ-to-sample-flow",
    workflowPack: "anatomy-organ-systems",
    name: "Organ-to-sample flow",
    description: "Workflow from organ system context to tissue region, biospecimen, assay handoff, and evidence panel.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["organ-axis-brain-lung-gut", "tissue-region-map", "organ-sample-flow", "blood-sample"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for sample collection, tissue-to-assay, translational study design, and organ context workflow slides.", "Keep biospecimen and clinical interpretation as separate objects."],
    qaChecklist: ["Sample source is clear.", "Organ/tissue/sample directionality is visible.", "Assay and provenance labels are attached."]
  },
  {
    id: "clinical-anatomy-summary",
    workflowPack: "anatomy-organ-systems",
    name: "Clinical anatomy summary",
    description: "Consulting-style summary tying organ system context, biomarker panel, cohort evidence, endpoint status, and review caveats.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["clinical-endpoint-card", "tissue-biomarker-panel", "human-cohort", "organ-risk-context"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for clinical/translational overview slides, grant summaries, or organ-context result summaries.", "Represent clinical interpretation as a reviewable evidence card instead of a decorative conclusion."],
    qaChecklist: ["Endpoint status is source-backed or marked draft.", "Cohort/sample context is visible.", "PPTX fallback warnings name exact anatomy assets."]
  },
  {
    id: "methods-protocol-overview",
    workflowPack: "methods-and-protocols",
    name: "Methods protocol overview",
    description: "Sample preparation, reagent setup, assay execution, readout, controls, QC, and review-safe method caveats for manuscript or deck method slides.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["protocol-overview", "sample-prep-workflow", "reagent-mastermix", "protocol-qc-gate"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship methods slide from notes about protocol summary, sample prep, assay setup, readout, controls, or method validation.", "Keep visual communication high-level; do not convert into operational hidden procedural instructions."],
    qaChecklist: ["Protocol steps are schematic and non-operational.", "Controls and QC are visible.", "Method caveats and provenance are reviewable before export."]
  },
  {
    id: "sample-prep-to-readout",
    workflowPack: "methods-and-protocols",
    name: "Sample prep to readout",
    description: "Editable workflow from biological sample to cleanup, amplification, assay readout, and data handoff.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["sample-prep-workflow", "magnetic-bead-cleanup", "pcr-amplification", "standard-curve"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for methods sections, lab meeting assay overview, and assay-to-data handoff figures.", "Separate sample handling, cleanup, amplification, readout, and data interpretation as explicit objects."],
    qaChecklist: ["Sample and assay stages are clearly labeled.", "No timing or concentration detail is implied unless source-backed.", "Export warnings name exact method assets."]
  },
  {
    id: "assay-qc-summary",
    workflowPack: "methods-and-protocols",
    name: "Assay QC summary",
    description: "Controls, replicate layout, standard curve, normalization, protocol deviation, and QC gate summary panel.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["control-sample-set", "replicate-layout", "standard-curve", "protocol-qc-gate"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when the brief asks for controls, assay validation, standard curve, replicates, or method QC.", "Keep QC thresholds marked illustrative unless source data is imported."],
    qaChecklist: ["Control/sample labels fit.", "QC thresholds are not overclaimed.", "Plot evidence is synthetic or source-backed."]
  },
  {
    id: "protocol-timeline-panel",
    workflowPack: "methods-and-protocols",
    name: "Protocol timeline panel",
    description: "Timeline-style method overview with setup, incubation, wash, readout, review, and safety caveat checkpoints.",
    layout: "pipeline",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["assay-timeline", "incubation-step", "wash-step", "method-safety-note"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for non-operational protocol timeline summaries in talks, posters, or consulting decks.", "Show order and review gates, not executable step-by-step conditions."],
    qaChecklist: ["Timeline labels remain compact.", "Safety/review caveat is visible.", "PPTX fallback warnings name exact method assets."]
  },
  {
    id: "grant-consulting-one-slide",
    workflowPack: "grant-and-consulting-summary",
    name: "Grant consulting one-slide summary",
    description: "Executive scientific one-pager with problem, opportunity, evidence, aims, roadmap, risk, impact metrics, and recommendation.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["grant-summary-board", "problem-statement-card", "milestone-roadmap", "recommendation-card"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship slide for grant summary, consulting brief, funder update, or biotech strategy deck source notes.", "Keep problem, evidence, aims, roadmap, risk, and recommendation as separate editable objects."],
    qaChecklist: ["Executive claim language is concise.", "Evidence and recommendation are visually separated.", "Impact and risk claims remain reviewable before export."]
  },
  {
    id: "specific-aims-summary",
    workflowPack: "grant-and-consulting-summary",
    name: "Specific aims summary",
    description: "Grant-style aims page with hypothesis, three aims, innovation, approach, and expected outcome cards.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["hypothesis-aims", "specific-aim-1", "specific-aim-2", "specific-aim-3"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when source notes mention specific aims, proposal hypothesis, innovation, approach, or expected outcomes.", "Avoid overclaiming feasibility; attach review items to hypothesis and outcome statements."],
    qaChecklist: ["Aim numbering is clear.", "Hypothesis and approach are distinct.", "Uncited expected outcomes are flagged."]
  },
  {
    id: "milestone-risk-roadmap",
    workflowPack: "grant-and-consulting-summary",
    name: "Milestone and risk roadmap",
    description: "Milestone roadmap with quarterly timeline, dependencies, go/no-go gate, risk matrix, mitigation, and deliverables.",
    layout: "pipeline",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["milestone-roadmap", "quarterly-timeline", "risk-matrix", "go-no-go-gate"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for workplans, project roadmaps, grant milestones, consulting implementation plans, and risk mitigation slides.", "Keep roadmap state and risk assumptions as reviewable objects."],
    qaChecklist: ["Milestones fit without text overflow.", "Risks and mitigations are paired.", "Go/no-go criteria are marked draft unless source-backed."]
  },
  {
    id: "impact-evidence-brief",
    workflowPack: "grant-and-consulting-summary",
    name: "Impact evidence brief",
    description: "Impact and value brief with evidence snapshot, metrics, stakeholder alignment, market landscape, and recommendation card.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["impact-metric-card", "evidence-snapshot", "stakeholder-map", "executive-takeaway"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for executive summaries, funder updates, strategy recommendations, or outcome-oriented consulting slides.", "Separate evidence, metric, stakeholder, and recommendation claims for review."],
    qaChecklist: ["Metric provenance is visible.", "Recommendation does not hide evidence caveats.", "PPTX fallback warnings name exact strategy assets."]
  },
  {
    id: "clinical-translational-study-overview",
    workflowPack: "clinical-translational",
    name: "Clinical translational study overview",
    description: "Flagship translational evidence bridge from enrollment and biospecimen flow to biomarker validation, endpoints, safety, and clinical review.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["clinical-study-overview", "clinical-sample-flow", "biomarker-validation", "clinical-response-card"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use as the flagship clinical/translational slide from notes about patient cohorts, biospecimens, omics, biomarkers, endpoints, safety, or validation.", "Keep cohort, sample, biomarker, endpoint, and review components separately editable for scientific QA."],
    qaChecklist: ["Cohort and endpoint terms are source-backed.", "Biomarker and clinical interpretation are visually separated.", "Safety and review caveats remain visible before export."]
  },
  {
    id: "cohort-to-biomarker-flow",
    workflowPack: "clinical-translational",
    name: "Cohort to biomarker flow",
    description: "Patient enrollment, eligibility, biospecimen collection, omics bridge, biomarker discovery, and validation cohort workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["consent-enrollment", "biospecimen-collection", "clinical-omics-bridge", "biomarker-validation"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when the source describes enrollment, eligibility criteria, sample collection, assay handoff, biomarker discovery, or validation cohorts.", "Do not collapse biospecimen provenance and biomarker interpretation into one object."],
    qaChecklist: ["Eligibility and consent are not hidden.", "Sample source and assay handoff are clear.", "Validation cohort status is marked source-backed or draft."]
  },
  {
    id: "endpoint-validation-dashboard",
    workflowPack: "clinical-translational",
    name: "Endpoint validation dashboard",
    description: "Clinical endpoint and biomarker validation dashboard with cohort table, response card, survival curve, and evidence grade.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["endpoint-hierarchy", "validation-cohort", "survival-curve", "clinical-response-card"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for clinical endpoint summaries, validation cohort dashboards, biomarker performance, or translational result slides.", "Keep response and survival visuals illustrative unless source data is imported."],
    qaChecklist: ["Endpoint hierarchy is readable.", "Survival/response plots are marked synthetic or source-backed.", "Evidence grade and validation status remain reviewable."]
  },
  {
    id: "safety-evidence-review",
    workflowPack: "clinical-translational",
    name: "Safety evidence review",
    description: "Safety and translational evidence panel with adverse events, monitoring, risk-benefit review, clinical decision support, and audit trail.",
    layout: "multi-panel",
    recommendedStyleProfile: "risk-warning",
    previewAssetIds: ["adverse-event-panel", "safety-monitoring", "clinical-risk-benefit", "clinician-review"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for clinical safety monitoring, adverse-event review, translational risk-benefit, and clinician review slides.", "Represent safety conclusions as review items, not decorative warning badges."],
    qaChecklist: ["Safety claims are cited or marked draft.", "Risk-benefit decision is visually separated from data capture.", "PPTX warnings name exact clinical fallback assets."]
  },
  {
    id: "spatial-workflow",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial workflow",
    description: "Tissue section to imaging, spot/molecule capture, segmentation, and spatial analysis output.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["tissue-section", "microscope", "visium-spot-array", "neighborhood-graph"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for spatial method overview slides.", "Make tissue context the first visual anchor."],
    qaChecklist: ["Assay platform is named.", "Image/source provenance is attached.", "Map colors are distinguishable."]
  },
  {
    id: "tissue-to-spot-workflow",
    workflowPack: "spatial-transcriptomics",
    name: "Tissue-to-spot workflow",
    description: "Tissue ROI, spot grid, segmentation mask, and expression summary for Visium-style slides.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["histology-section", "spatial-grid", "visium-spot-array", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use when explaining how tissue images become spatial matrices.", "Show ROI and spot array as separate editable objects."],
    qaChecklist: ["ROI boundaries are legible.", "Spot-to-expression transition is clear.", "Scale/context label is included if needed."]
  },
  {
    id: "segmentation-neighborhood-figure",
    workflowPack: "spatial-transcriptomics",
    name: "Segmentation and neighborhood figure",
    description: "Segmentation mask, cell boundaries, neighborhood graph, and annotation panel.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["segmentation-mask", "cell-boundary", "neighborhood-graph", "morphology-feature"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for image analysis or neighborhood result slides.", "Use panel labels and evidence cards for algorithm outputs."],
    qaChecklist: ["Boundary colors contrast with tissue background.", "Graph edges do not obscure labels.", "Algorithm/output provenance is attached."]
  },
  {
    id: "spatial-expression-summary",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial expression summary",
    description: "Spatial gene expression and cell-type map summary with concise result annotations.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["xenium-panel", "merfish-field", "gene-locus", "antibody"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for result slides comparing spatial expression patterns.", "Place strongest biological interpretation in a claim/evidence card."],
    qaChecklist: ["Color legend is present.", "Gene/cell-type names are readable.", "Claims are cited or marked for review."]
  },
  {
    id: "single-cell-workflow",
    workflowPack: "single-cell-multiomics",
    name: "Single-cell workflow",
    description: "Droplet capture, barcode/UMI, reads, matrix, and embedding workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["scrna-droplet", "cell-barcode", "umi-tag", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for scRNA-seq or multiome method slides.", "Keep barcode, UMI, read, and matrix concepts visually distinct."],
    qaChecklist: ["Capture/barcoding order is correct.", "Output matrix is clearly an editable data object.", "Sample provenance is attached."]
  },
  {
    id: "embedding-results",
    workflowPack: "single-cell-multiomics",
    name: "Embedding results",
    description: "Embedding, clusters, cell states, and marker summary for single-cell result slides.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["embedding-space", "cell-neighborhood", "cell-stem", "gene-locus"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for cluster/cell-state interpretation slides.", "Prefer editable PlotSpec embedding panels over screenshots."],
    qaChecklist: ["Cluster labels do not collide.", "Marker interpretation is cited.", "Legend is readable at slide scale."]
  },
  {
    id: "cell-state-summary",
    workflowPack: "single-cell-multiomics",
    name: "Cell-state summary",
    description: "Cell-state transition or composition summary with lineage/cell-type anchors.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["cell-stem", "cell-dividing", "cell-immune", "cell-neighborhood"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for trajectory, composition, or cell-state mechanism slides.", "Connect inferred states with explicit uncertainty wording when needed."],
    qaChecklist: ["State names are concise.", "Inferred transitions are not overstated.", "Color coding is consistent across panels."]
  },
  {
    id: "multiome-assay-summary",
    workflowPack: "single-cell-multiomics",
    name: "Multiome assay summary",
    description: "RNA and chromatin evidence combined into one editable assay/result summary.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["chromatin", "peak-call", "genome-browser-track", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for scATAC/multiome slides.", "Separate gene expression and chromatin accessibility evidence visually."],
    qaChecklist: ["Genome coordinates/source are attached if shown.", "Assay modalities are labeled.", "Panel evidence supports the claim."]
  },
  {
    id: "evidence-claim-card",
    workflowPack: "publication-results-panels",
    name: "Evidence and claim card",
    description: "Compact paper/consulting figure block with result asset, metric card, claim, caveat, and provenance warning.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["metric-card", "error-analysis", "dataset", "audit-log"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use when a slide needs one crisp result with visible evidence and caveat.", "Keep the claim sentence short and reviewable."],
    qaChecklist: ["Claim is source-backed.", "Caveat is visible.", "Export warning/provenance state is resolved."]
  },
  {
    id: "permissioning-ladder",
    workflowPack: "ai-biosecurity-eval",
    name: "Permissioning ladder",
    description: "Tiered permission and escalation path for biological AI outputs.",
    layout: "pipeline",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["permission-tier", "risk-gate", "human-review", "escalation-path"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for calibrated permissioning or policy slides.", "Show low/medium/high tiers as explicit states."],
    qaChecklist: ["Permission states are named.", "Human review/escalation condition is visible.", "Risk-warning style is used only for true warning states."]
  },
  {
    id: "benchmark-dashboard",
    workflowPack: "ai-biosecurity-eval",
    name: "Benchmark dashboard",
    description: "Biosecurity benchmark summary with classifier, metric cards, calibration, and error analysis.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["benchmark", "bio-classifier", "calibration", "error-analysis"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for evaluation result slides.", "Keep metrics, calibration, and failure modes in separate visual panels."],
    qaChecklist: ["Metric definitions are stated.", "Calibration/failure mode claims are cited.", "Benchmark provenance is attached."]
  },
  {
    id: "review-audit-flow",
    workflowPack: "ai-biosecurity-eval",
    name: "Review and audit flow",
    description: "Human review, domain expert review, audit log, and approval/block outcome flow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["human-review", "domain-expert-review", "audit-log", "approval-stamp"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for governance or SOP-style review slides.", "Show audit trail as a first-class output, not a footnote."],
    qaChecklist: ["Review responsibilities are clear.", "Audit/provenance path is visible.", "Approval/block outcome is explicit."]
  },
  {
    id: "rag-tool-workflow",
    workflowPack: "agentic-ai-mcp-rag",
    name: "RAG and tool workflow",
    description: "Prompt, retrieval, context, tool call, and model response workflow.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["prompt", "retrieval", "context-window", "tool-call"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for RAG or tool-augmented AI system slides.", "Separate retrieval context from tool execution."],
    qaChecklist: ["Data boundary is explicit.", "Tool output provenance is visible.", "Loop arrows do not imply unchecked autonomy."]
  },
  {
    id: "mcp-system-map",
    workflowPack: "agentic-ai-mcp-rag",
    name: "MCP system map",
    description: "MCP server, function schemas, tools, memory, and audit boundaries for agentic systems.",
    layout: "architecture",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["mcp-server", "function-schema", "tool-call", "audit-log"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for MCP architecture diagrams.", "Keep server/tool/data boundaries visually separated."],
    qaChecklist: ["Boundary labels are visible.", "Tool permissions are explicit.", "Audit path is connected."]
  },
  {
    id: "agent-verifier-loop",
    workflowPack: "agentic-ai-mcp-rag",
    name: "Agent verifier loop",
    description: "Planner, executor, verifier, memory, and audit loop for controlled agent workflows.",
    layout: "architecture",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["planner", "executor", "agent-loop", "human-review"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for agent governance or validation loops.", "Show verifier/human review as a control path."],
    qaChecklist: ["Verifier is not hidden in the loop.", "Escalation path is explicit.", "Memory/tool writes are reviewable."]
  },
  {
    id: "genelab-omics-pipeline",
    workflowPack: "space-biology-genelab",
    name: "GeneLab omics pipeline",
    description: "Spaceflight sample, sequencing, GeneLab dataset, and omics result pipeline.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["astronaut-sample", "sequencer", "dataset", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for GeneLab data processing slides.", "Separate mission metadata from molecular assay outputs."],
    qaChecklist: ["Mission/sample provenance is attached.", "Assay type is labeled.", "Dataset identifier/citation is included if known."]
  },
  {
    id: "mission-biology-summary",
    workflowPack: "space-biology-genelab",
    name: "Mission biology summary",
    description: "Mission context, organism/model, sample, assay, and result summary for space biology decks.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["spacecraft", "microgravity", "mouse-model", "spaceflight-assay"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for mission overview or grant/presentation summary slides.", "Keep space context restrained so biology remains readable."],
    qaChecklist: ["Mission context is accurate.", "Sample/model context is not ambiguous.", "Result claim is cited or flagged."]
  },
  {
    id: "space-omics-results-panel",
    workflowPack: "space-biology-genelab",
    name: "Space omics results panel",
    description: "Spaceflight omics result figure with sample, matrix, gene/protein evidence, and metric summary.",
    layout: "results",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["expression-matrix", "gene-locus", "protein", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "plot"],
    agentUseHints: ["Use for space omics lab meeting or manuscript draft figures.", "Tie every result panel back to sample/mission metadata."],
    qaChecklist: ["Gene/protein labels are readable.", "Mission/sample provenance is visible.", "Claim strength matches data source."]
  }
];

export const VISUAL_BENCHMARKS: VisualBenchmark[] = [
  {
    id: "biorender",
    product: "BioRender",
    url: "https://www.biorender.com/",
    observedSignal: "Professional science figures, graphs, slides, AI-assisted editable visuals, and thousands of templates are presented as one workspace.",
    implementationTakeaway: "Prioritize editable structured figures, workflow templates, consistent visual style, and source-to-slide agent operations over isolated icon coverage."
  },
  {
    id: "mind-the-graph",
    product: "Mind the Graph",
    url: "https://mindthegraph.com/",
    observedSignal: "Large-scale scientific illustration coverage and template-first infographic creation are core product signals.",
    implementationTakeaway: "Treat the current curated assets as a premium seed library and make workflow packs/templates the first scalable coverage unit."
  },
  {
    id: "bioicons",
    product: "BioIcons",
    url: "https://bioicons.com/",
    observedSignal: "Open science icon libraries emphasize broad taxonomy, clear category browsing, and license/provenance visibility.",
    implementationTakeaway: "Keep asset metadata, aliases, licensing, provenance, categories, and search filters complete enough for agentic selection."
  },
  {
    id: "servier-medical-art",
    product: "Servier Medical Art",
    url: "https://smart.servier.com/",
    observedSignal: "Medical illustration libraries expose downloadable vector-friendly assets with attribution terms.",
    implementationTakeaway: "Preserve SVG-first rendering, provenance, citation/license metadata, and Word/PPT-friendly figure export."
  },
  {
    id: "figma-components",
    product: "Figma component model",
    url: "https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma",
    observedSignal: "Reusable components, instances, overrides, and variants keep design systems consistent while allowing controlled customization.",
    implementationTakeaway: "Model each scientific asset as a reusable component with style profiles, editable parts, appearance overrides, and semantic slots."
  },
  {
    id: "office-svg",
    product: "Microsoft 365 SVG/icon workflow",
    url: "https://support.microsoft.com/en-au/office/insert-icons-in-microsoft-365-e2459f17-3996-4795-996e-b9a13486fa79",
    observedSignal: "Office workflows can style inserted SVG/icon assets and convert some vector content into editable shapes.",
    implementationTakeaway: "Export premium assets as SVG for visual fidelity now, then map high-priority editable parts to native PPTX shapes in the next export milestone."
  }
];

export const ASSET_QUALITY_RUBRIC = [
  "Recognizable at 48px without relying on the text label.",
  "Polished at 120px preview size with controlled depth, rim highlight, and readable silhouette.",
  "Distinct silhouette for signature/hero assets; no same-base-shape motif swaps.",
  "Complete metadata for search, provenance, workflow pack, semantic slot, panel role, and editable parts.",
  "Style profiles render materially different outputs for consulting decks, publication line art, dark talks, minimal schematics, and risk-warning visuals.",
  "Agent output references asset IDs, style profiles, semantic roles, and appearance overrides instead of raw opaque SVG.",
  "SVG/PDF preserve structured rendering; PPTX/DOCX export gives clear warnings where visual fidelity requires SVG fallback."
];

const WORKFLOW_PACK_BY_ID = new Map(PREMIUM_WORKFLOW_PACKS.map((pack) => [pack.id, pack]));
const WORKFLOW_TEMPLATE_BY_ID = new Map(PREMIUM_WORKFLOW_TEMPLATES.map((template) => [template.id, template]));
const ASSET_TO_WORKFLOW_PACKS = new Map<string, string[]>();
for (const pack of PREMIUM_WORKFLOW_PACKS) {
  for (const assetId of pack.assetIds) {
    ASSET_TO_WORKFLOW_PACKS.set(assetId, [...(ASSET_TO_WORKFLOW_PACKS.get(assetId) ?? []), pack.id]);
  }
}

const SIGNATURE_ASSET_IDS = new Set([
  ...PREMIUM_WORKFLOW_PACKS.filter((pack) => pack.priority <= 2).flatMap((pack) => pack.assetIds),
  "cell-t",
  "cell-macrophage",
  "dna-helix",
  "crispr-cas9",
  "perturb-seq",
  "compound-library",
  "target-validation",
  "target-engagement",
  "protein-domain",
  "binding-pocket",
  "protein-variant-library",
  "directed-evolution",
  "affinity-maturation",
  "protein-design-model",
  "structure-prediction",
  "binding-affinity-assay",
  "genetic-circuit",
  "plasmid-vector",
  "dna-assembly",
  "golden-gate-assembly",
  "design-build-test-learn-cycle",
  "chassis-cell",
  "biosensor-circuit",
  "metabolic-pathway-engineering",
  "pathway-flux-map",
  "kill-switch",
  "microbiome-community",
  "gut-microbiome",
  "pathogen-host-interaction",
  "mucosal-barrier",
  "microbiome-profile",
  "taxonomic-abundance",
  "antimicrobial-resistance",
  "microbiome-dysbiosis",
  "outbreak-cluster",
  "infection-model",
  "amr-gene",
  "car-t-cell",
  "engineered-t-cell",
  "tcr-therapy",
  "nk-cell-therapy",
  "tumor-antigen",
  "antigen-presentation",
  "viral-vector-transduction",
  "leukapheresis",
  "cell-expansion",
  "potency-assay",
  "infusion-bag",
  "release-testing",
  "image-analysis-pipeline",
  "microscope-field",
  "fluorescence-channel",
  "z-stack",
  "tile-stitching",
  "nuclei-segmentation",
  "membrane-segmentation",
  "instance-mask",
  "cell-tracking",
  "phenotype-feature-vector",
  "morphology-embedding",
  "segmentation-model",
  "liquid-handler",
  "lab-automation-platform",
  "robotic-arm",
  "automated-liquid-handler",
  "plate-handler",
  "plate-stack",
  "barcode-scanner",
  "plate-reader",
  "reagent-reservoir",
  "tip-rack",
  "lims-dashboard",
  "assay-scheduler",
  "sample-tracker",
  "qc-gate-automation",
  "incubator-stack",
  "automated-microscope",
  "automation-orchestrator",
  "anatomy-overview",
  "organ-axis-brain-lung-gut",
  "brain",
  "lung",
  "gut",
  "liver",
  "heart",
  "immune-system",
  "blood-brain-barrier",
  "kidney",
  "spleen",
  "pancreas",
  "skin",
  "bone-marrow",
  "lymph-node",
  "vasculature",
  "intestinal-villus",
  "renal-nephron",
  "hepatic-lobule",
  "organ-sample-flow",
  "tissue-biomarker-panel",
  "clinical-endpoint-card",
  "organ-system-network",
  "protocol-overview",
  "sample-prep-workflow",
  "reagent-mastermix",
  "serial-dilution",
  "incubation-step",
  "wash-step",
  "centrifugation-step",
  "magnetic-bead-cleanup",
  "pcr-amplification",
  "qpcr-assay",
  "rt-qpcr-assay",
  "elisa-assay",
  "western-blot-workflow",
  "gel-imaging",
  "immunostaining",
  "fixation-permeabilization",
  "library-prep-workflow",
  "assay-timeline",
  "protocol-checklist",
  "protocol-qc-gate",
  "replicate-layout",
  "control-sample-set",
  "standard-curve",
  "sample-normalization",
  "method-safety-note",
  "grant-summary-board",
  "problem-statement-card",
  "scientific-opportunity-map",
  "hypothesis-aims",
  "specific-aim-1",
  "specific-aim-2",
  "specific-aim-3",
  "innovation-claim",
  "approach-workplan",
  "milestone-roadmap",
  "quarterly-timeline",
  "budget-envelope",
  "resource-allocation",
  "team-capability-map",
  "stakeholder-map",
  "decision-brief",
  "value-proposition",
  "impact-metric-card",
  "outcome-kpi",
  "market-landscape",
  "competitive-positioning",
  "evidence-snapshot",
  "risk-matrix",
  "risk-mitigation-plan",
  "go-no-go-gate",
  "proposal-review",
  "funder-alignment",
  "recommendation-card",
  "executive-takeaway",
  "clinical-study-overview",
  "patient-journey-map",
  "consent-enrollment",
  "eligibility-criteria",
  "cohort-stratification",
  "trial-design-schema",
  "randomization-schema",
  "treatment-arm-comparison",
  "clinical-sample-flow",
  "biospecimen-collection",
  "longitudinal-visit-schedule",
  "clinical-omics-bridge",
  "translational-readout",
  "biomarker-discovery",
  "biomarker-validation",
  "assay-validation",
  "companion-diagnostic",
  "validation-cohort",
  "endpoint-hierarchy",
  "primary-endpoint",
  "secondary-endpoint",
  "clinical-response-card",
  "survival-curve",
  "adverse-event-panel",
  "safety-monitoring",
  "clinical-risk-benefit",
  "regulatory-evidence-brief",
  "evidence-grade",
  "irb-review",
  "clinician-review",
  "real-world-evidence",
  "clinical-decision-support",
  "medicinal-chemistry-cycle",
  "efficacy-model",
  "ind-enabling-package",
  "toxicity-screen",
  "candidate-nomination",
  "spatial-grid",
  "visium-spot-array",
  "risk-gate",
  "permission-tier",
  "human-review",
  "audit-log",
  "agent-loop"
]);

const FAMILY_PARTS: Record<AssetFamily, string[]> = {
  cell: ["membrane", "nucleus", "organelle", "highlight region", "label anchor", "connector anchor"],
  molecule: ["backbone", "binding site", "domain", "highlight region", "label anchor", "connector anchor"],
  perturbation: ["effector", "target", "guide", "payload", "label anchor", "connector anchor"],
  instrument: ["device body", "sample inlet", "display", "status light", "label anchor", "connector anchor"],
  spatial: ["tissue boundary", "spot grid", "cell neighborhood", "highlight region", "label anchor", "connector anchor"],
  pathway: ["node", "edge", "activation marker", "inhibition marker", "label anchor", "connector anchor"],
  organ: ["organ silhouette", "region", "sample marker", "label anchor", "connector anchor"],
  pathogen: ["capsid/body", "genome", "surface marker", "biosafety badge", "label anchor", "connector anchor"],
  space: ["vehicle/body", "orbit path", "sample marker", "microgravity cue", "label anchor", "connector anchor"],
  modelSystem: ["model body", "layers", "input port", "output port", "label anchor", "connector anchor"],
  dataSystem: ["data stack", "record", "schema stripe", "label anchor", "connector anchor"],
  agentSystem: ["agent node", "tool port", "memory", "loop arrow", "label anchor", "connector anchor"],
  metricPanel: ["plot frame", "axis", "metric mark", "threshold", "label anchor", "connector anchor"],
  riskGate: ["gate body", "shield", "tier badge", "decision arrow", "label anchor", "connector anchor"],
  governance: ["review body", "person marker", "audit line", "approval badge", "label anchor", "connector anchor"],
  workflowBlock: ["block body", "input port", "output port", "step badge", "label anchor", "connector anchor"]
};

const BIOLOGY_SEEDS: AssetSeed[] = [
  ...biology("Cells and tissues", "cell", "entity", [
    ["cell-immune", "Immune cell", "immune single-cell leukocyte"],
    ["cell-t", "T cell", "immune t lymphocyte cd3"],
    ["cell-b", "B cell", "immune b lymphocyte antibody"],
    ["cell-macrophage", "Macrophage", "immune myeloid phagocyte"],
    ["cell-dendritic", "Dendritic cell", "immune antigen-presenting"],
    ["cell-nk", "NK cell", "immune natural killer cytotoxic"],
    ["cell-epithelial", "Epithelial cell", "epithelial tissue barrier"],
    ["cell-endothelial", "Endothelial cell", "vascular vessel"],
    ["cell-fibroblast", "Fibroblast", "stroma extracellular matrix"],
    ["cell-stem", "Stem cell", "development progenitor"],
    ["cell-neuron", "Neuron", "brain neural axon"],
    ["cell-astrocyte", "Astrocyte", "brain glia"],
    ["cell-microglia", "Microglia", "brain immune glia"],
    ["cell-muscle", "Muscle cell", "myocyte tissue"],
    ["cell-hepatocyte", "Hepatocyte", "liver metabolism"],
    ["cell-tumor", "Tumor cell", "cancer malignant"],
    ["cell-apoptotic", "Apoptotic cell", "death apoptosis"],
    ["cell-dividing", "Dividing cell", "mitosis proliferation"],
    ["cell-organoid", "Organoid", "3d culture model"],
    ["cell-spheroid", "Tumor spheroid", "3d cancer model"],
    ["tissue-section", "Tissue section", "histology slice"],
    ["tumor-microenvironment", "Tumor microenvironment", "cancer stroma immune"],
    ["blood-sample", "Blood sample", "blood tube cohort"],
    ["cell-neighborhood", "Cell neighborhood", "spatial neighborhood"]
  ], "#38bdf8"),
  ...biology("Genomics/transcriptomics/epigenomics", "molecule", "data", [
    ["dna-helix", "DNA helix", "dna genome double helix"],
    ["rna-strand", "RNA strand", "rna transcript"],
    ["gene-locus", "Gene locus", "gene genome locus"],
    ["promoter", "Promoter", "regulatory promoter"],
    ["enhancer", "Enhancer", "regulatory enhancer"],
    ["chromatin", "Chromatin", "epigenomics nucleosome"],
    ["nucleosome", "Nucleosome", "histone chromatin"],
    ["methylation-mark", "Methylation mark", "epigenetic methylation"],
    ["scrna-droplet", "scRNA-seq droplet", "single-cell droplet"],
    ["cell-barcode", "Cell barcode", "barcode single-cell"],
    ["umi-tag", "UMI tag", "unique molecular identifier"],
    ["sequencing-read", "Sequencing read", "read fastq"],
    ["read-pair", "Read pair", "paired-end sequencing"],
    ["genome-browser-track", "Genome browser track", "track browser"],
    ["peak-call", "Peak call", "atac chip peak"],
    ["variant-snp", "SNP variant", "variant snp"],
    ["copy-number", "Copy number segment", "cnv segment"],
    ["expression-matrix", "Expression matrix", "counts matrix transcriptomics"]
  ], "#2563eb"),
  ...biology("Perturbation and screening", "perturbation", "process", [
    ["crispr-cas9", "CRISPR-Cas9", "crispr cas9 nuclease"],
    ["guide-rna", "Guide RNA", "grna guide crispr"],
    ["lentiviral-library", "Lentiviral library", "lentivirus pooled library"],
    ["perturb-seq", "Perturb-seq", "perturbation single-cell crispr"],
    ["pooled-screen", "Pooled screen", "screen pooled crispr"],
    ["arrayed-screen", "Arrayed screen", "screen plate"],
    ["knockdown", "Knockdown", "rnai repression"],
    ["activation", "CRISPR activation", "crispr activation"],
    ["inhibition", "CRISPR inhibition", "crispri inhibition"],
    ["base-editor", "Base editor", "editing base"],
    ["prime-editor", "Prime editor", "editing prime"],
    ["drug-perturbation", "Drug perturbation", "compound treatment"]
  ], "#16a34a"),
  ...biology("Drug discovery/translational screening", "molecule", "entity", [
    ["compound-library", "Compound library", "compound library small molecule screening"],
    ["lead-series", "Lead series", "lead optimization analog series structure activity"]
  ], "#0f766e"),
  ...biology("Drug discovery/translational screening", "workflowBlock", "process", [
    ["target-validation", "Target validation", "target validation engagement biology evidence"],
    ["target-engagement", "Target engagement", "target engagement occupancy binding evidence"],
    ["medicinal-chemistry-cycle", "Medicinal chemistry cycle", "design make test learn medicinal chemistry"],
    ["efficacy-model", "Efficacy model", "in vivo efficacy model tumor response"],
    ["candidate-nomination", "Candidate nomination", "lead candidate nomination go no-go"],
    ["ind-enabling-package", "IND-enabling package", "ind enabling package regulatory dossier readiness"]
  ], "#0f766e"),
  ...biology("Drug discovery/translational screening", "metricPanel", "evaluation", [
    ["hit-triage", "Hit triage", "hit triage potency selectivity rank evidence"],
    ["dose-response-curve", "Dose-response curve", "dose response ic50 potency curve"],
    ["selectivity-panel", "Selectivity panel", "selectivity off target panel kinase liability"],
    ["pk-profile", "PK profile", "pharmacokinetics plasma concentration time half life"],
    ["sar-table", "SAR table", "structure activity relationship potency selectivity"],
    ["admet-panel", "ADMET panel", "admet absorption distribution metabolism excretion toxicity"],
    ["biomarker-response", "Biomarker response", "biomarker response patient stratification pharmacodynamic"]
  ], "#0f766e"),
  ...biology("Drug discovery/translational screening", "riskGate", "risk", [
    ["toxicity-screen", "Toxicity screen", "toxicity safety screen cell viability admet"]
  ], "#dc2626"),
  ...biology("Assays and instruments", "instrument", "assay", [
    ["microscope", "Microscope", "microscopy imaging"],
    ["confocal-microscope", "Confocal microscope", "confocal imaging"],
    ["sequencer", "Sequencer", "ngs sequencing"],
    ["nanopore", "Nanopore sequencer", "long-read nanopore"],
    ["flow-cytometry", "Flow cytometer", "flow facs"],
    ["cell-sorter", "Cell sorter", "facs sorting"],
    ["plate-96", "96-well plate", "plate assay screen"],
    ["plate-384", "384-well plate", "high-throughput plate"],
    ["pipette", "Pipette", "liquid handling"],
    ["centrifuge", "Centrifuge", "sample prep"],
    ["incubator", "Incubator", "cell culture"],
    ["biosafety-cabinet", "Biosafety cabinet", "bsl biosafety"],
    ["microfluidic-chip", "Microfluidic chip", "microfluidics droplet"],
    ["gel-electrophoresis", "Gel electrophoresis", "gel dna"],
    ["western-blot", "Western blot", "protein assay"],
    ["qpcr-machine", "qPCR machine", "qpcr pcr"],
    ["mass-spectrometer", "Mass spectrometer", "proteomics metabolomics"],
    ["liquid-handler", "Liquid handler", "automation plate"]
  ], "#0891b2"),
  ...biology("Lab automation", "workflowBlock", "process", [
    ["lab-automation-platform", "Lab automation platform", "lab automation platform robotic workflow high throughput assay"],
    ["plate-handler", "Plate handler", "automated plate handler shuttle robot plate logistics"],
    ["plate-stack", "Plate stack", "plate stack hotel loader automated plate logistics"],
    ["assay-scheduler", "Assay scheduler", "assay scheduler run calendar batch automation"],
    ["automation-orchestrator", "Automation orchestrator", "automation orchestrator run control workflow engine"],
    ["robotic-rail", "Robotic rail", "robotic rail gantry transport automation"],
    ["deck-layout", "Deck layout", "liquid handler deck layout reagent plate map"],
    ["seal-peeler", "Seal peeler", "plate seal peeler automated lab"],
    ["waste-chute", "Waste chute", "waste chute tips liquid handler deck"]
  ], "#0ea5e9"),
  ...biology("Lab automation", "instrument", "assay", [
    ["robotic-arm", "Robotic arm", "robotic arm gripper lab automation"],
    ["automated-liquid-handler", "Automated liquid handler", "automated liquid handler pipetting head deck"],
    ["barcode-scanner", "Barcode scanner", "barcode scanner sample identity plate tracking"],
    ["plate-reader", "Plate reader", "plate reader absorbance fluorescence luminescence"],
    ["reagent-reservoir", "Reagent reservoir", "reagent reservoir liquid handler trough"],
    ["tip-rack", "Tip rack", "pipette tip rack automated liquid handling"],
    ["robotic-gripper", "Robotic gripper", "robotic gripper plate transfer end effector"],
    ["incubator-stack", "Incubator stack", "automated incubator stack plate storage"],
    ["automated-microscope", "Automated microscope", "automated microscope imaging robot integration"],
    ["acoustic-dispenser", "Acoustic dispenser", "acoustic dispenser nanoliter compound transfer"],
    ["colony-picker", "Colony picker", "colony picker robotic picking microbiology"],
    ["tube-rack", "Tube rack", "tube rack sample rack automation"],
    ["sample-tube-array", "Sample tube array", "sample tube array rack barcode automation"]
  ], "#0891b2"),
  ...biology("Lab automation", "metricPanel", "evaluation", [
    ["lims-dashboard", "LIMS dashboard", "lims dashboard sample tracking run status"],
    ["sample-tracker", "Sample tracker", "sample tracker barcode chain of custody"],
    ["qc-gate-automation", "Automation QC gate", "automation qc gate threshold run acceptance"],
    ["lab-sensor", "Lab sensor", "lab sensor telemetry temperature humidity status"]
  ], "#2563eb"),
  ...biology("Methods and protocols", "workflowBlock", "process", [
    ["protocol-overview", "Protocol overview", "methods protocol overview schematic workflow"],
    ["sample-prep-workflow", "Sample prep workflow", "sample preparation workflow extraction cleanup assay"],
    ["reagent-mastermix", "Reagent mastermix", "reagent mastermix tube mix assay setup"],
    ["serial-dilution", "Serial dilution", "serial dilution gradient assay calibration"],
    ["incubation-step", "Incubation step", "incubation step method timeline"],
    ["wash-step", "Wash step", "wash step buffer method protocol"],
    ["centrifugation-step", "Centrifugation step", "centrifugation spin sample prep protocol"],
    ["magnetic-bead-cleanup", "Magnetic bead cleanup", "magnetic bead cleanup purification sample prep"],
    ["pcr-amplification", "PCR amplification", "pcr amplification thermocycler method"],
    ["library-prep-workflow", "Library prep workflow", "library preparation sequencing sample prep"],
    ["assay-timeline", "Assay timeline", "assay timeline method schedule"],
    ["aliquot-plan", "Aliquot plan", "aliquot plan sample split protocol"],
    ["cell-culture-passaging", "Cell culture passaging", "cell culture passaging method"],
    ["transfection-step", "Transfection step", "transfection delivery method cell culture"],
    ["fixation-permeabilization", "Fixation permeabilization", "fixation permeabilization immunostaining method"]
  ], "#0d9488"),
  ...biology("Methods and protocols", "instrument", "assay", [
    ["qpcr-assay", "qPCR assay", "qpcr assay amplification curve method"],
    ["rt-qpcr-assay", "RT-qPCR assay", "reverse transcription qpcr assay method"],
    ["elisa-assay", "ELISA assay", "elisa plate antibody assay"],
    ["western-blot-workflow", "Western blot workflow", "western blot protein transfer membrane antibody"],
    ["gel-imaging", "Gel imaging", "gel imaging electrophoresis bands"],
    ["immunostaining", "Immunostaining", "immunostaining antibody fluorescence method"]
  ], "#0891b2"),
  ...biology("Methods and protocols", "metricPanel", "evaluation", [
    ["protocol-checklist", "Protocol checklist", "protocol checklist method review"],
    ["replicate-layout", "Replicate layout", "replicate layout controls plate map"],
    ["control-sample-set", "Control sample set", "positive negative control sample set"],
    ["standard-curve", "Standard curve", "standard curve assay calibration"],
    ["reagent-compatibility", "Reagent compatibility", "reagent compatibility matrix"],
    ["temperature-profile", "Temperature profile", "temperature profile thermocycler incubation"],
    ["sample-normalization", "Sample normalization", "sample normalization input equalization"],
    ["protocol-deviation", "Protocol deviation", "protocol deviation exception log"]
  ], "#2563eb"),
  ...biology("Methods and protocols", "riskGate", "risk", [
    ["protocol-qc-gate", "Protocol QC gate", "protocol qc gate acceptance review"],
    ["method-safety-note", "Method safety note", "method safety note caveat review"]
  ], "#dc2626"),
  ...biology("Grant and consulting summary", "workflowBlock", "process", [
    ["grant-summary-board", "Grant summary board", "grant consulting executive summary board one pager"],
    ["problem-statement-card", "Problem statement card", "problem statement unmet need scientific challenge"],
    ["scientific-opportunity-map", "Scientific opportunity map", "opportunity map strategy landscape science"],
    ["hypothesis-aims", "Hypothesis and aims", "grant hypothesis specific aims overview"],
    ["specific-aim-1", "Specific Aim 1", "specific aim one grant objective"],
    ["specific-aim-2", "Specific Aim 2", "specific aim two grant objective"],
    ["specific-aim-3", "Specific Aim 3", "specific aim three grant objective"],
    ["innovation-claim", "Innovation claim", "innovation novelty scientific claim"],
    ["approach-workplan", "Approach workplan", "approach workplan strategy plan"],
    ["milestone-roadmap", "Milestone roadmap", "milestone roadmap project plan"],
    ["quarterly-timeline", "Quarterly timeline", "quarterly timeline roadmap gantt"],
    ["roadmap-swimlane", "Roadmap swimlane", "roadmap swimlane workstream plan"],
    ["consulting-one-pager", "Consulting one-pager", "consulting one pager executive summary"],
    ["deliverable-package", "Deliverable package", "deliverable package report deck data handoff"],
    ["appendix-evidence", "Appendix evidence", "appendix evidence backup data"]
  ], "#2563eb"),
  ...biology("Grant and consulting summary", "metricPanel", "evaluation", [
    ["budget-envelope", "Budget envelope", "budget envelope funding cost summary"],
    ["resource-allocation", "Resource allocation", "resource allocation capacity budget"],
    ["impact-metric-card", "Impact metric card", "impact metric kpi outcome summary"],
    ["outcome-kpi", "Outcome KPI", "outcome kpi success metric"],
    ["market-landscape", "Market landscape", "market landscape competitive field"],
    ["competitive-positioning", "Competitive positioning", "competitive positioning 2x2 matrix"],
    ["evidence-snapshot", "Evidence snapshot", "evidence snapshot result summary"],
    ["data-room-index", "Data room index", "data room diligence document index"],
    ["priority-scorecard", "Priority scorecard", "priority scorecard weighted ranking"]
  ], "#0d9488"),
  ...biology("Grant and consulting summary", "governance", "governance", [
    ["team-capability-map", "Team capability map", "team capability map roles expertise"],
    ["stakeholder-map", "Stakeholder map", "stakeholder map funder sponsor team"],
    ["decision-brief", "Decision brief", "decision brief recommendation memo"],
    ["proposal-review", "Proposal review", "proposal review panel feedback"],
    ["funder-alignment", "Funder alignment", "funder alignment mission fit"],
    ["recommendation-card", "Recommendation card", "recommendation card executive action"],
    ["executive-takeaway", "Executive takeaway", "executive takeaway headline summary"]
  ], "#7c3aed"),
  ...biology("Grant and consulting summary", "riskGate", "risk", [
    ["value-proposition", "Value proposition", "value proposition benefit risk tradeoff"],
    ["risk-matrix", "Risk matrix", "risk matrix likelihood impact"],
    ["risk-mitigation-plan", "Risk mitigation plan", "risk mitigation plan"],
    ["dependency-map", "Dependency map", "dependency map blockers assumptions"],
    ["go-no-go-gate", "Go/no-go gate", "go no-go gate decision milestone"]
  ], "#dc2626"),
  ...biology("Clinical translational", "workflowBlock", "process", [
    ["clinical-study-overview", "Clinical study overview", "clinical translational study overview cohort endpoint biomarker"],
    ["patient-journey-map", "Patient journey map", "patient journey clinical visit care pathway"],
    ["trial-design-schema", "Trial design schema", "trial design schema arms endpoint study"],
    ["randomization-schema", "Randomization schema", "randomization schema treatment arms allocation"],
    ["treatment-arm-comparison", "Treatment arm comparison", "treatment arm comparison intervention control"],
    ["clinical-sample-flow", "Clinical sample flow", "clinical sample flow biospecimen assay"],
    ["biospecimen-collection", "Biospecimen collection", "biospecimen collection blood tissue sample"],
    ["longitudinal-visit-schedule", "Longitudinal visit schedule", "longitudinal visit schedule timepoints follow up"],
    ["clinical-omics-bridge", "Clinical omics bridge", "clinical omics bridge sample sequencing analysis"],
    ["translational-readout", "Translational readout", "translational readout assay to clinic"]
  ], "#0d9488"),
  ...biology("Clinical translational", "metricPanel", "evaluation", [
    ["cohort-stratification", "Cohort stratification", "cohort stratification subgroups clinical phenotype"],
    ["cohort-table", "Cohort table", "cohort table demographics baseline clinical"],
    ["biomarker-discovery", "Biomarker discovery", "biomarker discovery omics candidate marker"],
    ["biomarker-validation", "Biomarker validation", "biomarker validation independent cohort assay"],
    ["assay-validation", "Assay validation", "assay validation sensitivity specificity reproducibility"],
    ["companion-diagnostic", "Companion diagnostic", "companion diagnostic biomarker patient selection"],
    ["validation-cohort", "Validation cohort", "validation cohort external replication"],
    ["endpoint-hierarchy", "Endpoint hierarchy", "clinical endpoint hierarchy primary secondary"],
    ["primary-endpoint", "Primary endpoint", "primary endpoint clinical outcome"],
    ["secondary-endpoint", "Secondary endpoint", "secondary endpoint clinical outcome"],
    ["clinical-response-card", "Clinical response card", "clinical response responder nonresponder"],
    ["survival-curve", "Survival curve", "survival curve kaplan meier clinical endpoint"],
    ["regulatory-evidence-brief", "Regulatory evidence brief", "regulatory evidence brief clinical dossier"],
    ["evidence-grade", "Evidence grade", "evidence grade confidence level clinical"]
  ], "#2563eb"),
  ...biology("Clinical translational", "riskGate", "risk", [
    ["eligibility-criteria", "Eligibility criteria", "eligibility criteria inclusion exclusion clinical"],
    ["inclusion-exclusion", "Inclusion/exclusion", "inclusion exclusion criteria clinical trial"],
    ["adverse-event-panel", "Adverse event panel", "adverse event safety clinical monitoring"],
    ["safety-monitoring", "Safety monitoring", "safety monitoring clinical trial review"],
    ["clinical-risk-benefit", "Clinical risk-benefit", "clinical risk benefit decision"],
    ["data-lock", "Data lock", "data lock clinical database freeze"]
  ], "#dc2626"),
  ...biology("Clinical translational", "governance", "governance", [
    ["consent-enrollment", "Consent and enrollment", "consent enrollment patient recruitment"],
    ["ecrf-data-capture", "eCRF data capture", "electronic case report form data capture"],
    ["irb-review", "IRB review", "irb review ethics approval"],
    ["clinician-review", "Clinician review", "clinician review clinical interpretation"],
    ["site-activation", "Site activation", "clinical site activation multicenter"],
    ["patient-reported-outcome", "Patient-reported outcome", "patient reported outcome pro instrument"],
    ["real-world-evidence", "Real-world evidence", "real world evidence registry claims"],
    ["clinical-decision-support", "Clinical decision support", "clinical decision support recommendation"]
  ], "#7c3aed"),
  ...biology("Spatial and imaging", "spatial", "assay", [
    ["spatial-grid", "Spatial transcriptomics grid", "spatial transcriptomics visium"],
    ["visium-spot-array", "Visium spot array", "spatial spot"],
    ["merfish-field", "MERFISH field", "spatial imaging merfish"],
    ["xenium-panel", "Xenium panel", "spatial imaging xenium"],
    ["histology-section", "Histology section", "histology h&e"],
    ["microscopy-tile", "Microscopy tile", "image tile"],
    ["segmentation-mask", "Segmentation mask", "image segmentation"],
    ["cell-boundary", "Cell boundary", "segmentation membrane"],
    ["neighborhood-graph", "Neighborhood graph", "spatial graph"],
    ["tissue-region", "Tissue region", "annotation roi"],
    ["image-registration", "Image registration", "alignment image"],
    ["morphology-feature", "Morphology feature", "shape image"]
  ], "#9333ea"),
  ...biology("Molecules and pathways", "molecule", "entity", [
    ["protein", "Protein", "protein structure"],
    ["antibody", "Antibody", "antibody immunology"],
    ["receptor", "Receptor", "membrane receptor"],
    ["ligand", "Ligand", "ligand binding"],
    ["cytokine", "Cytokine", "immune cytokine"],
    ["metabolite", "Metabolite", "small molecule metabolomics"],
    ["enzyme", "Enzyme", "protein catalysis"],
    ["transcription-factor", "Transcription factor", "tf gene regulation"],
    ["protein-complex", "Protein complex", "complex interaction"],
    ["pathway-node", "Pathway node", "pathway network"],
    ["signaling-cascade", "Signaling cascade", "pathway signaling"],
    ["activation-edge", "Activation edge", "pathway activation"],
    ["inhibition-edge", "Inhibition edge", "pathway inhibition"],
    ["cell-surface-marker", "Cell surface marker", "marker cd protein"]
  ], "#f59e0b"),
  ...biology("Protein engineering", "molecule", "entity", [
    ["protein-domain", "Protein domain", "protein domain folding alpha helix beta sheet"],
    ["binding-pocket", "Binding pocket", "binding pocket ligand docking active site"],
    ["antibody-fragment", "Antibody fragment", "fab scfv nanobody affinity binder"],
    ["enzyme-active-site", "Enzyme active site", "enzyme catalytic residue active site"]
  ], "#0d9488"),
  ...biology("Protein engineering", "workflowBlock", "process", [
    ["protein-variant-library", "Protein variant library", "variant library saturation mutagenesis sequence library"],
    ["directed-evolution", "Directed evolution", "directed evolution mutagenesis selection round"],
    ["affinity-maturation", "Affinity maturation", "affinity maturation antibody binder selection"],
    ["protein-design-model", "Protein design model", "protein design model alphafold rosetta generative design"],
    ["expression-host", "Expression host", "expression host cell protein production"],
    ["purification-column", "Purification column", "protein purification chromatography fractions"]
  ], "#0d9488"),
  ...biology("Protein engineering", "metricPanel", "evaluation", [
    ["structure-prediction", "Structure prediction", "structure prediction confidence plddt alphafold"],
    ["stability-assay", "Stability assay", "protein stability thermal shift melting temperature"],
    ["binding-affinity-assay", "Binding affinity assay", "binding affinity kd spr assay sensorgram"],
    ["enzyme-kinetics", "Enzyme kinetics", "enzyme kinetics vmax km michaelis menten"],
    ["developability-profile", "Developability profile", "developability aggregation immunogenicity manufacturability"],
    ["sequence-logo", "Sequence logo", "sequence logo motif conservation amino acid"]
  ], "#0d9488"),
  ...biology("Synthetic biology", "molecule", "entity", [
    ["genetic-circuit", "Genetic circuit", "synthetic biology genetic circuit regulatory module"],
    ["promoter-library", "Promoter library", "promoter library part strength genetic part"],
    ["ribosome-binding-site", "Ribosome binding site", "rbs translation initiation synthetic part"],
    ["terminator", "Terminator", "transcription terminator hairpin genetic part"],
    ["plasmid-vector", "Plasmid vector", "plasmid vector backbone origin marker cargo"],
    ["synthetic-operon", "Synthetic operon", "operon cassette promoter rbs cds terminator"]
  ], "#059669"),
  ...biology("Synthetic biology", "workflowBlock", "process", [
    ["dna-assembly", "DNA assembly", "dna assembly fragments cloning"],
    ["golden-gate-assembly", "Golden Gate assembly", "golden gate type iis assembly cloning"],
    ["gibson-assembly", "Gibson assembly", "gibson overlap assembly cloning"],
    ["design-build-test-learn-cycle", "Design-build-test-learn cycle", "dbtl design build test learn cycle"],
    ["chassis-cell", "Chassis cell", "engineered chassis host strain cell"],
    ["bioreactor", "Bioreactor", "fermentation bioreactor engineered strain scale up"]
  ], "#059669"),
  ...biology("Synthetic biology", "metricPanel", "evaluation", [
    ["biosensor-circuit", "Biosensor circuit", "biosensor genetic circuit input output reporter"],
    ["logic-gate-genetic", "Genetic logic gate", "genetic logic gate and or not circuit"],
    ["metabolic-pathway-engineering", "Metabolic pathway engineering", "metabolic engineering pathway flux enzyme"],
    ["pathway-flux-map", "Pathway flux map", "pathway flux map titer yield productivity"],
    ["strain-library", "Strain library", "strain library clones barcoded screen"]
  ], "#059669"),
  ...biology("Synthetic biology", "riskGate", "risk", [
    ["kill-switch", "Kill switch", "kill switch containment biosafety engineered organism"]
  ], "#dc2626"),
  ...biology("Microbiome/infectious disease", "pathogen", "entity", [
    ["microbiome-community", "Microbiome community", "microbiome community microbial ecology taxa"],
    ["bacterial-strain", "Bacterial strain", "bacterial strain isolate lineage"],
    ["viral-phage", "Viral phage", "bacteriophage viral phage microbial virus"],
    ["fungal-cell", "Fungal cell", "fungal yeast microbiome eukaryotic microbe"]
  ], "#0d9488"),
  ...biology("Microbiome/infectious disease", "organ", "context", [
    ["gut-microbiome", "Gut microbiome", "gut intestine microbiome host context"],
    ["mucosal-barrier", "Mucosal barrier", "mucosal barrier epithelial host microbe interface"],
    ["infection-model", "Infection model", "infection model pathogen load host response"]
  ], "#059669"),
  ...biology("Microbiome/infectious disease", "workflowBlock", "process", [
    ["pathogen-host-interaction", "Host-pathogen interaction", "host pathogen interaction microbiome infection"],
    ["antibiotic-treatment", "Antibiotic treatment", "antibiotic treatment perturbation microbiome"],
    ["microbiome-dysbiosis", "Microbiome dysbiosis", "dysbiosis imbalance microbiome disease association"],
    ["outbreak-cluster", "Outbreak cluster", "outbreak cluster pathogen surveillance transmission"]
  ], "#b45309"),
  ...biology("Microbiome/infectious disease", "metricPanel", "evaluation", [
    ["microbiome-profile", "Microbiome profile", "microbiome composition taxonomic profile"],
    ["metagenomic-read", "Metagenomic read", "metagenomic read sequencing kmer"],
    ["taxonomic-abundance", "Taxonomic abundance", "taxonomic abundance stacked bar taxa"],
    ["alpha-diversity", "Alpha diversity", "alpha diversity shannon richness"],
    ["beta-diversity", "Beta diversity", "beta diversity ordination pcoa"]
  ], "#0d9488"),
  ...biology("Microbiome/infectious disease", "riskGate", "risk", [
    ["amr-gene", "AMR gene cassette", "antimicrobial resistance gene amr cassette"],
    ["antimicrobial-resistance", "Antimicrobial resistance", "antimicrobial resistance amr resistance phenotype"]
  ], "#dc2626"),
  ...biology("Cell therapy", "cell", "entity", [
    ["car-t-cell", "CAR-T cell", "car t cell chimeric antigen receptor engineered t cell"],
    ["engineered-t-cell", "Engineered T cell", "engineered t cell immune cell therapy"],
    ["tcr-therapy", "TCR therapy", "tcr engineered t cell receptor therapy"],
    ["nk-cell-therapy", "NK cell therapy", "nk cell therapy innate cytotoxic cell"]
  ], "#0d9488"),
  ...biology("Cell therapy", "molecule", "entity", [
    ["tumor-antigen", "Tumor antigen", "tumor antigen target epitope cancer cell therapy"],
    ["antigen-presentation", "Antigen presentation", "antigen presentation mhc t cell synapse"]
  ], "#be123c"),
  ...biology("Cell therapy", "workflowBlock", "process", [
    ["viral-vector-transduction", "Viral vector transduction", "viral vector transduction cell engineering"],
    ["leukapheresis", "Leukapheresis", "leukapheresis patient blood collection apheresis"],
    ["cell-expansion", "Cell expansion", "cell expansion culture manufacturing"],
    ["activation-beads", "Activation beads", "t cell activation beads cd3 cd28"],
    ["gene-edited-cell", "Gene-edited cell", "gene edited cell therapy crispr engineered cell"],
    ["infusion-bag", "Infusion bag", "cell therapy infusion product bag"],
    ["patient-infusion", "Patient infusion", "patient infusion clinical cell therapy"],
    ["manufacturing-batch", "Manufacturing batch", "cell therapy manufacturing batch record"],
    ["cryopreservation", "Cryopreservation", "cryopreservation frozen vial cell therapy"]
  ], "#0d9488"),
  ...biology("Cell therapy", "metricPanel", "evaluation", [
    ["potency-assay", "Potency assay", "cell therapy potency assay killing function"],
    ["cytokine-release", "Cytokine release", "cytokine release crs il6 toxicity monitoring"],
    ["release-testing", "Release testing", "release testing qa qc sterility viability potency"]
  ], "#7c3aed"),
  ...biology("Microscopy image analysis", "workflowBlock", "process", [
    ["image-analysis-pipeline", "Image analysis pipeline", "microscopy image analysis pipeline preprocessing segmentation features qc"],
    ["tile-stitching", "Tile stitching", "microscopy tile stitching montage image registration"],
    ["illumination-correction", "Illumination correction", "flat field illumination correction microscopy preprocessing"],
    ["cell-tracking", "Cell tracking", "live cell tracking trajectory microscopy time lapse"],
    ["annotation-brush", "Annotation brush", "manual annotation brush ground truth microscopy labels"]
  ], "#0ea5e9"),
  ...biology("Microscopy image analysis", "spatial", "assay", [
    ["microscope-field", "Microscope field", "microscope field of view fluorescence cells image"],
    ["fluorescence-channel", "Fluorescence channel", "fluorescence channel merge dapi fitc cy3 microscopy"],
    ["z-stack", "Z-stack", "z stack confocal optical section microscopy volume"],
    ["nuclei-segmentation", "Nuclei segmentation", "nuclei segmentation dapi mask image analysis"],
    ["membrane-segmentation", "Membrane segmentation", "membrane segmentation cell boundary microscopy"],
    ["organelle-segmentation", "Organelle segmentation", "organelle segmentation mitochondria puncta microscopy"],
    ["instance-mask", "Instance mask", "instance mask cell segmentation object labels"]
  ], "#7c3aed"),
  ...biology("Microscopy image analysis", "metricPanel", "evaluation", [
    ["focus-quality", "Focus quality", "focus quality sharpness microscopy qc metric"],
    ["phenotype-feature-vector", "Phenotype feature vector", "morphology phenotype feature vector image features"],
    ["morphology-embedding", "Morphology embedding", "morphology embedding umap image phenotyping"],
    ["classifier-heatmap", "Classifier heatmap", "classifier heatmap saliency image model confidence"],
    ["image-qc-dashboard", "Image QC dashboard", "image qc dashboard focus illumination segmentation quality"]
  ], "#2563eb"),
  ...biology("Microscopy image analysis", "modelSystem", "process", [
    ["segmentation-model", "Segmentation model", "segmentation model neural network microscopy mask prediction"]
  ], "#4f46e5"),
  ...biology("Organ systems and model contexts", "organ", "context", [
    ["brain", "Brain", "organ brain neuroscience"],
    ["lung", "Lung", "organ respiratory"],
    ["gut", "Gut", "organ intestine microbiome"],
    ["liver", "Liver", "organ metabolism"],
    ["heart", "Heart", "organ cardiac"],
    ["immune-system", "Immune system", "organ system immune"],
    ["mouse-model", "Mouse model", "animal model"],
    ["human-cohort", "Human cohort", "clinical cohort"],
    ["organoid-model", "Organoid model", "model organoid"],
    ["blood-brain-barrier", "Blood-brain barrier", "barrier brain vascular"]
  ], "#ec4899"),
  ...biology("Anatomy organ systems", "organ", "context", [
    ["kidney", "Kidney", "organ renal nephrology cortex medulla"],
    ["spleen", "Spleen", "organ immune spleen lymphoid"],
    ["pancreas", "Pancreas", "organ endocrine pancreas islet"],
    ["skin", "Skin", "organ barrier dermis epidermis"],
    ["bone-marrow", "Bone marrow", "hematopoiesis marrow immune niche"],
    ["lymph-node", "Lymph node", "immune lymph node follicle"],
    ["vasculature", "Vasculature", "vascular vessel network circulation"],
    ["respiratory-tract", "Respiratory tract", "airway trachea bronchus lung"],
    ["intestinal-villus", "Intestinal villus", "gut intestine villus epithelial"],
    ["renal-nephron", "Renal nephron", "kidney nephron glomerulus loop"],
    ["hepatic-lobule", "Hepatic lobule", "liver lobule sinusoid portal"],
    ["cardiac-muscle", "Cardiac muscle", "heart myocardium muscle tissue"],
    ["neural-circuit", "Neural circuit", "brain neural circuit synapse"],
    ["blood-vessel", "Blood vessel", "vascular blood vessel capillary"],
    ["lymphatic-vessel", "Lymphatic vessel", "lymphatic vessel drainage"]
  ], "#ec4899"),
  ...biology("Anatomy organ systems", "workflowBlock", "process", [
    ["anatomy-overview", "Anatomy overview", "anatomy organ system overview map"],
    ["organ-axis-brain-lung-gut", "Brain-lung-gut axis", "organ axis brain lung gut cross organ"],
    ["immune-organ-map", "Immune organ map", "immune organ map lymphoid spleen marrow"],
    ["organ-chip", "Organ-on-chip", "organ chip microphysiological system"],
    ["patient-organ-cohort", "Patient organ cohort", "patient cohort organ stratification"],
    ["disease-tissue-map", "Disease tissue map", "disease tissue organ region map"],
    ["organ-sample-flow", "Organ sample flow", "organ tissue sample flow biospecimen"],
    ["organ-system-network", "Organ system network", "organ system network cross organ communication"]
  ], "#ec4899"),
  ...biology("Anatomy organ systems", "metricPanel", "evaluation", [
    ["tissue-biomarker-panel", "Tissue biomarker panel", "tissue biomarker panel clinical evidence"],
    ["clinical-endpoint-card", "Clinical endpoint card", "clinical endpoint card patient outcome"],
    ["cross-organ-comparison", "Cross-organ comparison", "cross organ comparison matrix summary"]
  ], "#7c3aed"),
  ...biology("Anatomy organ systems", "riskGate", "risk", [
    ["organ-risk-context", "Organ risk context", "organ risk clinical caveat review"]
  ], "#dc2626"),
  ...biology("Anatomy organ systems", "workflowBlock", "annotation", [
    ["anatomy-callout", "Anatomy callout", "anatomy callout label annotation"],
    ["organ-scale-bar", "Organ scale bar", "organ tissue scale bar annotation"],
    ["tissue-region-map", "Tissue region map", "tissue region map roi annotation"],
    ["organ-legend", "Organ legend", "organ legend color key annotation"]
  ], "#64748b"),
  ...biology("Pathogens and biosafety", "pathogen", "risk", [
    ["virus-particle", "Virus particle", "virus pathogen"],
    ["bacteria", "Bacterium", "bacteria pathogen"],
    ["plasmid", "Plasmid", "dna plasmid"],
    ["pathogen-sample", "Pathogen sample", "sample biosafety"],
    ["ppe", "PPE", "personal protective equipment"],
    ["containment-boundary", "Containment boundary", "containment bsl"],
    ["biohazard-label", "Biohazard label", "biosafety biohazard"],
    ["sample-chain-of-custody", "Sample chain of custody", "traceability sample"]
  ], "#dc2626"),
  ...biology("Space Biology", "space", "context", [
    ["microgravity", "Microgravity", "space microgravity"],
    ["spacecraft", "Spacecraft", "spaceflight spacecraft"],
    ["astronaut-sample", "Astronaut sample", "spaceflight human sample"],
    ["spaceflight-assay", "Spaceflight biology assay", "space biology genelab"]
  ], "#0ea5e9")
];

const AI_SEEDS: AssetSeed[] = [
  ...ai("Data/model/training/inference", "modelSystem", "model", [
    ["dataset", "Dataset", "data table corpus"],
    ["model-block", "AI model", "model llm classifier"],
    ["neural-network", "Neural network", "layers neural"],
    ["transformer", "Transformer", "attention llm"],
    ["embedding-space", "Embedding space", "embedding latent umap"],
    ["training-loop", "Training loop", "training optimization"],
    ["inference-endpoint", "Inference endpoint", "deployment inference"],
    ["classifier", "Classifier", "classification model"],
    ["foundation-model", "Foundation model", "large model"],
    ["fine-tuning", "Fine-tuning", "adaptation tuning"],
    ["feature-extractor", "Feature extractor", "features representation"],
    ["prediction-output", "Prediction output", "output prediction"],
    ["uncertainty-score", "Uncertainty score", "confidence uncertainty"],
    ["model-card", "Model card", "documentation model"],
    ["data-pipeline", "Data pipeline", "etl pipeline"],
    ["label-set", "Label set", "labels taxonomy"]
  ], "#7c3aed"),
  ...ai("LLM/RAG/agent systems", "agentSystem", "process", [
    ["prompt", "Prompt", "instruction prompt"],
    ["context-window", "Context window", "context tokens"],
    ["retrieval", "Retrieval system", "rag retrieval"],
    ["vector-store", "Vector store", "embedding database"],
    ["memory", "Memory", "agent memory"],
    ["tool-call", "Tool call", "agent tool"],
    ["planner", "Planner", "agent planning"],
    ["executor", "Executor", "agent execution"],
    ["mcp-server", "MCP server", "mcp api tools"],
    ["agent-loop", "Agent loop", "multi-step agent"],
    ["multi-agent", "Multi-agent system", "agents collaboration"],
    ["router", "Router", "routing model"],
    ["scratchpad", "Scratchpad", "reasoning workspace"],
    ["function-schema", "Function schema", "structured tool schema"]
  ], "#2563eb"),
  ...ai("Evaluation and benchmarking", "metricPanel", "evaluation", [
    ["benchmark", "Benchmark suite", "benchmark evaluation"],
    ["metric-card", "Metric card", "metrics score"],
    ["confusion-matrix", "Confusion matrix", "classification metrics"],
    ["calibration", "Calibration curve", "calibration uncertainty"],
    ["roc-curve", "ROC curve", "auc evaluation"],
    ["pr-curve", "Precision-recall curve", "precision recall"],
    ["error-analysis", "Error analysis", "failure analysis"],
    ["judge-model", "Judge model", "evaluation judge"],
    ["eval-harness", "Evaluation harness", "test harness"],
    ["test-set", "Test set", "dataset split"],
    ["rubric", "Rubric", "grading criteria"],
    ["leaderboard", "Leaderboard", "ranking benchmark"],
    ["ablation", "Ablation study", "ablation comparison"],
    ["confidence-interval", "Confidence interval", "statistics interval"],
    ["failure-mode", "Failure mode", "error failure"],
    ["gold-standard", "Gold standard", "ground truth"]
  ], "#059669"),
  ...ai("Safety/risk/permissioning", "riskGate", "risk", [
    ["risk-gate", "Risk gate", "risk gate"],
    ["policy", "Policy constraint", "policy constitutional"],
    ["permission-tier", "Permission tier", "permission tier"],
    ["refusal-boundary", "Refusal boundary", "refusal safety"],
    ["human-review", "Human review", "review human"],
    ["audit-log", "Audit log", "audit traceability"],
    ["red-team", "Red-team evaluation", "red-team safety"],
    ["escalation-path", "Escalation path", "escalation review"],
    ["safety-classifier", "Safety classifier", "classifier safety"],
    ["content-filter", "Content filter", "filter policy"],
    ["risk-score", "Risk score", "score risk"],
    ["allow-deny-gate", "Allow/deny gate", "permission decision"],
    ["policy-stack", "Policy stack", "policy layers"],
    ["review-queue", "Review queue", "queue review"],
    ["approval-stamp", "Approval stamp", "approval governance"],
    ["blocked-output", "Blocked output", "blocked refusal"],
    ["safe-completion", "Safe completion", "safe response"],
    ["threat-model", "Threat model", "threat risk"]
  ], "#dc2626"),
  ...ai("Biosecurity-specific AI workflows", "workflowBlock", "risk", [
    ["bio-classifier", "Bio classifier", "biosecurity classifier"],
    ["protocol-risk-screen", "Protocol risk screen", "protocol risk"],
    ["durc-flag", "DURC flag", "dual-use durc"],
    ["pathogen-intent-classifier", "Pathogen intent classifier", "pathogen intent"],
    ["wetlab-feasibility-review", "Wetlab feasibility review", "wetlab feasibility"],
    ["domain-expert-review", "Domain expert review", "expert biology review"],
    ["bio-protocol-benchmark", "Bio protocol benchmark", "benchmark protocol"],
    ["biosafety-tier", "Biosafety tier", "bsl tier"],
    ["gene-synthesis-screen", "Gene synthesis screen", "screen synthesis"],
    ["dual-use-triage", "Dual-use triage", "dual-use triage"]
  ], "#ea580c"),
  ...ai("Deployment/governance/monitoring", "governance", "governance", [
    ["deployment", "Deployment", "deployment cloud"],
    ["monitoring-dashboard", "Monitoring dashboard", "monitoring dashboard"],
    ["drift-detector", "Drift detector", "drift monitoring"],
    ["governance-board", "Governance board", "governance committee"],
    ["incident-report", "Incident report", "incident report"],
    ["traceability-ledger", "Traceability ledger", "traceability ledger"]
  ], "#0f766e")
];

export const CURATED_ASSETS: PremiumAsset[] = [...BIOLOGY_SEEDS, ...AI_SEEDS].map(makePremiumAsset);

interface RealisticAssetSeed {
  id: string;
  name: string;
  pack: "realistic-spatial-microscopy" | "realistic-wetlab-context" | "realistic-cellular-textures" | "realistic-space-biology";
  category: string;
  family: AssetFamily;
  visualRole: AssetVisualRole;
  tags: string[];
  aliases: string[];
  semanticSlots: string[];
  panelRole: AssetPanelRole;
  qualityTier: AssetQualityTier;
  realismLevel: RealismLevel;
  mediaType: RealisticMediaType;
  sourceAssetType: SourceAssetType;
  backgroundTreatment: BackgroundTreatment;
  cutoutStatus: CutoutStatus;
  accent: string;
  secondary: string;
  pattern: "tissue" | "microscopy" | "segmentation" | "map" | "bench" | "instrument" | "sample" | "cells" | "space" | "data";
}

export interface RealisticAssetGallery {
  styleProfile: AssetStyleProfile;
  workflowPack?: string;
  pack?: WorkflowPack;
  assetCount: number;
  renderedAssetIds: string[];
  qaChecks: string[];
  assets: RealisticAsset[];
  templates?: WorkflowTemplate[];
  templateQa?: WorkflowTemplateQaReport[];
  flagshipDemo?: WorkflowPackGallery["flagshipDemo"];
  exportSnapshot?: WorkflowPackExportSnapshot;
  quality?: WorkflowPackQuality;
  visualQa?: WorkflowPackVisualQaGallery;
  svg: string;
}

interface RealisticWorkflowPackSpec {
  id: RealisticAssetSeed["pack"];
  name: string;
  priority: number;
  description: string;
  flagshipTemplateId?: string;
  templates: string[];
  minAssetsForPremium: number;
  minSignatureOrHeroForPremium: number;
  minTemplatesForPremium: number;
  agentUseHints: string[];
}

const REALISTIC_WORKFLOW_PACK_SPECS: RealisticWorkflowPackSpec[] = [
  {
    id: "realistic-spatial-microscopy",
    name: "Realistic spatial microscopy",
    priority: 1,
    description: "Editorial histology, microscopy, segmentation, and spatial expression image panels blended with SVG annotations.",
    flagshipTemplateId: "spatial-realistic-hybrid-panel",
    templates: ["spatial-realistic-hybrid-panel"],
    minAssetsForPremium: 10,
    minSignatureOrHeroForPremium: 8,
    minTemplatesForPremium: 1,
    agentUseHints: ["Use for evidence/context panels when source notes mention microscopy, histology, spatial maps, segmentation, or tissue regions.", "Keep mechanism diagrams SVG-first; use realistic panels as provenance-tracked evidence."]
  },
  {
    id: "realistic-wetlab-context",
    name: "Realistic wetlab context",
    priority: 1,
    description: "Editorial wetlab protocol context panels for sample handling, assay setup, instruments, containment, and export QA.",
    flagshipTemplateId: "wetlab-realistic-context-panel",
    templates: ["wetlab-realistic-context-panel"],
    minAssetsForPremium: 8,
    minSignatureOrHeroForPremium: 6,
    minTemplatesForPremium: 1,
    agentUseHints: ["Use for protocol credibility, wetlab setup, sample handling, assay context, microscopy, or biosafety review panels.", "Pair realistic panels with editable labels, plots, review cards, and explicit PPTX/DOCX fallback warnings."]
  },
  {
    id: "realistic-cellular-textures",
    name: "Realistic cellular textures",
    priority: 2,
    description: "Editorial cellular, organoid, tissue microenvironment, pathogen-like particle, and gel evidence textures.",
    flagshipTemplateId: "cellular-realistic-evidence-panel",
    templates: ["cellular-realistic-evidence-panel"],
    minAssetsForPremium: 6,
    minSignatureOrHeroForPremium: 5,
    minTemplatesForPremium: 1,
    agentUseHints: ["Use for evidence/context panels when cell texture, organoid, microenvironment, pathogen-like particles, or gel evidence improves credibility.", "Combine realistic cellular panels with editable cell/protein symbols and marker PlotSpec summaries."]
  },
  {
    id: "realistic-space-biology",
    name: "Realistic space biology",
    priority: 2,
    description: "Editorial spaceflight biology context panels for spacecraft, astronaut samples, flight assays, and GeneLab-style data.",
    flagshipTemplateId: "space-realistic-context-panel",
    templates: ["space-realistic-context-panel"],
    minAssetsForPremium: 4,
    minSignatureOrHeroForPremium: 4,
    minTemplatesForPremium: 1,
    agentUseHints: ["Use for mission context, sample return, spaceflight assay, and GeneLab data evidence panels.", "Pair realistic mission panels with editable microgravity, assay, dataset, and provenance review objects."]
  }
];

const REALISTIC_ASSET_SEEDS: RealisticAssetSeed[] = [
  { id: "realistic-he-tissue-section", name: "Editorial H&E tissue section", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["histology", "h&e", "tissue", "microscopy", "evidence"], aliases: ["he tissue", "histology tissue", "tissue section image"], semanticSlots: ["microscopy-evidence", "input-sample", "spatial-context"], panelRole: "evidence", qualityTier: "signature", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#c084fc", secondary: "#f9a8d4", pattern: "tissue" },
  { id: "realistic-microscopy-tile", name: "Microscopy tile with cell texture", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["microscopy", "tile", "cells", "fluorescence", "evidence"], aliases: ["microscopy field", "image tile", "cell image"], semanticSlots: ["microscopy-evidence", "image-tile"], panelRole: "evidence", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#38bdf8", secondary: "#a78bfa", pattern: "microscopy" },
  { id: "realistic-segmentation-overlay", name: "Segmentation overlay on cells", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["segmentation", "mask", "cell boundary", "microscopy"], aliases: ["cell masks", "segmentation mask", "boundary overlay"], semanticSlots: ["segmentation-overlay", "image-analysis"], panelRole: "evidence", qualityTier: "signature", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#22c55e", secondary: "#0ea5e9", pattern: "segmentation" },
  { id: "realistic-spatial-map", name: "Spatial expression map", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "data", tags: ["spatial", "expression", "map", "spots", "omics"], aliases: ["spatial gene map", "spot map", "spatial expression"], semanticSlots: ["spatial-expression", "data-evidence"], panelRole: "evidence", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#f97316", secondary: "#3b82f6", pattern: "map" },
  { id: "realistic-visium-slide", name: "Visium slide context", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "context", tags: ["visium", "spatial transcriptomics", "slide", "capture area"], aliases: ["capture slide", "visium capture", "spot array slide"], semanticSlots: ["spatial-context", "input-sample"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#14b8a6", secondary: "#93c5fd", pattern: "map" },
  { id: "realistic-xenium-field", name: "Xenium-like field of view", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["xenium", "in situ", "transcripts", "field of view"], aliases: ["in situ field", "transcript puncta", "spatial fov"], semanticSlots: ["microscopy-evidence", "spatial-transcripts"], panelRole: "evidence", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#06b6d4", secondary: "#f472b6", pattern: "microscopy" },
  { id: "realistic-merfish-puncta", name: "MERFISH puncta texture", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["merfish", "puncta", "transcripts", "spatial"], aliases: ["rna puncta", "merfish texture", "spot puncta"], semanticSlots: ["spatial-transcripts", "microscopy-evidence"], panelRole: "evidence", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#ec4899", secondary: "#22d3ee", pattern: "microscopy" },
  { id: "realistic-cell-boundary-overlay", name: "Cell boundary overlay", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["cell boundary", "segmentation", "overlay", "image analysis"], aliases: ["boundary mask", "cell outlines", "segmentation contours"], semanticSlots: ["segmentation-overlay", "image-analysis"], panelRole: "evidence", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#84cc16", secondary: "#60a5fa", pattern: "segmentation" },
  { id: "realistic-neighborhood-map", name: "Cell neighborhood map", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "data", tags: ["neighborhood", "cell graph", "spatial", "community"], aliases: ["spatial graph", "neighborhood image", "cell community map"], semanticSlots: ["neighborhood-graph", "data-evidence"], panelRole: "evidence", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#8b5cf6", secondary: "#10b981", pattern: "map" },
  { id: "realistic-tissue-region", name: "Annotated tissue region", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "evidence", tags: ["tissue region", "roi", "histology", "annotation"], aliases: ["region of interest", "roi tissue", "annotated histology"], semanticSlots: ["microscopy-evidence", "annotation-region"], panelRole: "evidence", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#f59e0b", secondary: "#fb7185", pattern: "tissue" },
  { id: "realistic-image-registration", name: "Image registration overlay", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "process", tags: ["registration", "alignment", "overlay", "microscopy"], aliases: ["registration image", "aligned sections", "image alignment"], semanticSlots: ["image-analysis", "registration-step"], panelRole: "process-step", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "mask-ready", accent: "#2563eb", secondary: "#f97316", pattern: "segmentation" },
  { id: "realistic-morphology-panel", name: "Morphology feature panel", pack: "realistic-spatial-microscopy", category: "Realistic / Spatial microscopy", family: "spatial", visualRole: "data", tags: ["morphology", "features", "image analysis", "panel"], aliases: ["morphology features", "shape feature panel", "image feature card"], semanticSlots: ["image-analysis", "data-evidence"], panelRole: "output", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#0ea5e9", secondary: "#94a3b8", pattern: "data" },
  { id: "realistic-pipette-bench", name: "Pipette on clean bench", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "context", tags: ["pipette", "bench", "wetlab", "protocol"], aliases: ["pipette photo", "wetlab pipette", "bench pipette"], semanticSlots: ["wetlab-context", "protocol-step"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#2563eb", secondary: "#cbd5e1", pattern: "bench" },
  { id: "realistic-plate-96-photo", name: "96-well plate context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "assay", tags: ["96-well plate", "plate", "assay", "screen"], aliases: ["well plate image", "assay plate", "screening plate"], semanticSlots: ["assay-context", "wetlab-context"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#0ea5e9", secondary: "#e0f2fe", pattern: "instrument" },
  { id: "realistic-microscope-bench", name: "Microscope bench context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "context", tags: ["microscope", "bench", "imaging", "wetlab"], aliases: ["microscope photo", "imaging bench", "lab microscope"], semanticSlots: ["wetlab-context", "microscopy-evidence"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#14b8a6", secondary: "#64748b", pattern: "instrument" },
  { id: "realistic-sequencer-bay", name: "Sequencer bay context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "assay", tags: ["sequencer", "ngs", "instrument", "omics"], aliases: ["sequencer photo", "ngs instrument", "sequencing bay"], semanticSlots: ["omics-assay", "wetlab-context"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#7c3aed", secondary: "#93c5fd", pattern: "instrument" },
  { id: "realistic-biosafety-cabinet", name: "Biosafety cabinet context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "pathogen", visualRole: "risk", tags: ["biosafety cabinet", "bsc", "containment", "wetlab"], aliases: ["bsc image", "biosafety hood", "containment cabinet"], semanticSlots: ["containment-context", "biosafety-review"], panelRole: "warning", qualityTier: "signature", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#dc2626", secondary: "#fbbf24", pattern: "instrument" },
  { id: "realistic-sample-tubes", name: "Sample tubes context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "context", tags: ["sample tubes", "aliquot", "wetlab", "specimen"], aliases: ["tube rack", "sample vials", "specimen tubes"], semanticSlots: ["input-sample", "wetlab-context"], panelRole: "main-subject", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#22c55e", secondary: "#bae6fd", pattern: "sample" },
  { id: "realistic-centrifuge-bench", name: "Centrifuge bench context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "process", tags: ["centrifuge", "bench", "protocol", "sample prep"], aliases: ["centrifuge photo", "sample prep centrifuge", "bench centrifuge"], semanticSlots: ["wetlab-context", "protocol-step"], panelRole: "process-step", qualityTier: "standard", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#64748b", secondary: "#cbd5e1", pattern: "instrument" },
  { id: "realistic-flow-cytometer", name: "Flow cytometer context", pack: "realistic-wetlab-context", category: "Realistic / Wetlab context", family: "instrument", visualRole: "assay", tags: ["flow cytometer", "cell sorting", "facs", "instrument"], aliases: ["facs instrument", "flow cytometry photo", "cell sorter image"], semanticSlots: ["assay-context", "wetlab-context"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#06b6d4", secondary: "#a78bfa", pattern: "instrument" },
  { id: "realistic-cell-cluster", name: "Cell cluster texture", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "cell", visualRole: "evidence", tags: ["cell cluster", "texture", "cells", "microenvironment"], aliases: ["cell texture", "cluster image", "cellular texture"], semanticSlots: ["cell-state", "microscopy-evidence"], panelRole: "evidence", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#38bdf8", secondary: "#fda4af", pattern: "cells" },
  { id: "realistic-organoid-texture", name: "Organoid texture", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "cell", visualRole: "evidence", tags: ["organoid", "3d culture", "texture", "model"], aliases: ["organoid image", "spheroid texture", "3d culture"], semanticSlots: ["model-context", "cell-state"], panelRole: "main-subject", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#f472b6", secondary: "#fef3c7", pattern: "cells" },
  { id: "realistic-tumor-microenvironment", name: "Tumor microenvironment texture", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "cell", visualRole: "evidence", tags: ["tumor microenvironment", "tme", "immune", "cellular"], aliases: ["tme image", "tumor tissue texture", "immune infiltrate"], semanticSlots: ["cell-state", "microscopy-evidence"], panelRole: "evidence", qualityTier: "signature", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#ef4444", secondary: "#8b5cf6", pattern: "cells" },
  { id: "realistic-immune-infiltrate", name: "Immune infiltrate texture", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "cell", visualRole: "evidence", tags: ["immune infiltrate", "t cell", "myeloid", "texture"], aliases: ["immune cell texture", "infiltrate image", "immune microenvironment"], semanticSlots: ["cell-state", "microscopy-evidence"], panelRole: "evidence", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#22c55e", secondary: "#60a5fa", pattern: "cells" },
  { id: "realistic-pathogen-particles", name: "Pathogen-like particle texture", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "pathogen", visualRole: "risk", tags: ["pathogen", "particles", "biosafety", "texture"], aliases: ["virus-like particles", "pathogen texture", "microbial particles"], semanticSlots: ["biosafety-review", "risk-context"], panelRole: "warning", qualityTier: "hero", realismLevel: "texture", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#dc2626", secondary: "#f97316", pattern: "cells" },
  { id: "realistic-protein-gel", name: "Protein gel evidence panel", pack: "realistic-cellular-textures", category: "Realistic / Cellular textures", family: "molecule", visualRole: "evidence", tags: ["protein gel", "western blot", "evidence", "assay"], aliases: ["gel panel", "western blot image", "protein assay"], semanticSlots: ["data-evidence", "assay-context"], panelRole: "evidence", qualityTier: "standard", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#334155", secondary: "#94a3b8", pattern: "data" },
  { id: "realistic-spacecraft-context", name: "Spacecraft biology context", pack: "realistic-space-biology", category: "Realistic / Space biology", family: "space", visualRole: "context", tags: ["spacecraft", "space biology", "mission", "context"], aliases: ["spacecraft image", "mission context", "spaceflight context"], semanticSlots: ["mission-context", "space-biology"], panelRole: "main-subject", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#2563eb", secondary: "#c4b5fd", pattern: "space" },
  { id: "realistic-astronaut-sample", name: "Astronaut sample collection", pack: "realistic-space-biology", category: "Realistic / Space biology", family: "space", visualRole: "context", tags: ["astronaut sample", "crew", "sample collection", "space biology"], aliases: ["astronaut sample image", "crew sample", "spaceflight biospecimen"], semanticSlots: ["input-sample", "mission-context"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#0ea5e9", secondary: "#f59e0b", pattern: "space" },
  { id: "realistic-spaceflight-assay", name: "Spaceflight assay context", pack: "realistic-space-biology", category: "Realistic / Space biology", family: "space", visualRole: "assay", tags: ["spaceflight assay", "omics", "sample prep", "mission"], aliases: ["space assay image", "space omics assay", "flight assay"], semanticSlots: ["omics-assay", "mission-context"], panelRole: "process-step", qualityTier: "hero", realismLevel: "context", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "soft-cutout", accent: "#7c3aed", secondary: "#22d3ee", pattern: "sample" },
  { id: "realistic-genelab-data-context", name: "GeneLab data context", pack: "realistic-space-biology", category: "Realistic / Space biology", family: "dataSystem", visualRole: "data", tags: ["genelab", "space omics", "dataset", "data portal"], aliases: ["genelab dataset", "space omics data", "mission data"], semanticSlots: ["data-evidence", "mission-context"], panelRole: "output", qualityTier: "hero", realismLevel: "editorial", mediaType: "svg-fixture", sourceAssetType: "generated-fixture", backgroundTreatment: "editorial-frame", cutoutStatus: "not-cutout", accent: "#0891b2", secondary: "#64748b", pattern: "data" }
];

export const REALISTIC_ASSETS: RealisticAsset[] = REALISTIC_ASSET_SEEDS.map(makeRealisticAsset);
export const LIBRARY_ASSETS: LibraryAsset[] = [...CURATED_ASSETS, ...REALISTIC_ASSETS];

export function getAssetQualityReport(): AssetQualityReport {
  const assetById = new Map(CURATED_ASSETS.map((asset) => [asset.id, asset]));
  const tierCounts = countByTier(CURATED_ASSETS);
  const qaCounts = countByQaStatus(CURATED_ASSETS);
  const categoryMap = new Map<string, { category: string; count: number; premiumCount: number }>();
  for (const asset of CURATED_ASSETS) {
    const current = categoryMap.get(asset.category) ?? { category: asset.category, count: 0, premiumCount: 0 };
    current.count += 1;
    if (asset.qualityTier === "signature" || asset.qualityTier === "hero") current.premiumCount += 1;
    categoryMap.set(asset.category, current);
  }
  const styleCoverage = DEFAULT_STYLE_PROFILES.map((styleProfile) => ({
    styleProfile,
    count: CURATED_ASSETS.filter((asset) => asset.styleProfiles.includes(styleProfile)).length
  }));
  const workflowCoverage = PREMIUM_WORKFLOW_PACKS.map((pack) => {
    const packAssets = pack.assetIds.map((assetId) => assetById.get(assetId)).filter((asset): asset is PremiumAsset => Boolean(asset));
    const quality = getWorkflowPackQuality(pack.id);
    return {
      id: pack.id,
      name: pack.name,
      priority: pack.priority,
      assetCount: packAssets.length,
      signatureOrHeroCount: packAssets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length,
      missingAssetIds: pack.assetIds.filter((assetId) => !assetById.has(assetId)),
      missingTemplateIds: quality.missingTemplateIds,
      flagshipTemplateId: pack.flagshipTemplateId,
      templateCount: pack.templates.length,
      qaStatus: quality.qaStatus,
      templates: [...pack.templates]
    };
  });
  const signatureAssets = tierCounts.signature;
  const heroAssets = tierCounts.hero;
  return {
    reviewedAt: "2026-06-10",
    summary: {
      totalAssets: CURATED_ASSETS.length,
      biologyAssets: CURATED_ASSETS.filter((asset) => asset.category.startsWith("Biology /")).length,
      aiAssets: CURATED_ASSETS.filter((asset) => asset.category.startsWith("AI /")).length,
      signatureAssets,
      heroAssets,
      workflowPacks: PREMIUM_WORKFLOW_PACKS.length,
      styleProfiles: [...DEFAULT_STYLE_PROFILES],
      rendererContract: "local-first structured SVG with recipe primitives, style profiles, editable part metadata, provenance, and export-safe output"
    },
    tierCounts,
    qaCounts,
    workflowCoverage,
    categoryCoverage: [...categoryMap.values()].sort((a, b) => b.premiumCount - a.premiumCount || b.count - a.count || a.category.localeCompare(b.category)),
    styleCoverage,
    benchmarks: VISUAL_BENCHMARKS.map((benchmark) => ({ ...benchmark })),
    qualityRubric: [...ASSET_QUALITY_RUBRIC],
    commercialVisualAudit: getCommercialVisualAudit(),
    priorityGaps: buildPriorityGaps(workflowCoverage, styleCoverage),
    recommendedNextPacks: [
      "immunology-oncology",
      "bio-llm-benchmarks",
      "biosafety-permissioning",
      "space-omics-mission-design",
      "omics-analysis-figures"
    ]
  };
}

export function getCommercialVisualAudit(input: { limit?: number } = {}): CommercialVisualQualityAudit {
  const limit = Math.max(1, Math.min(200, input.limit ?? 48));
  const premiumAssets = CURATED_ASSETS.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero");
  const assetRisks = premiumAssets
    .map(auditPremiumAssetVisualRisk)
    .filter((risk) => risk.riskReasons.length)
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.riskReasons.length - a.riskReasons.length || a.assetId.localeCompare(b.assetId));
  const templateRisks = PREMIUM_WORKFLOW_PACKS
    .map((pack) => auditFlagshipTemplateSkeleton(pack))
    .filter((risk) => risk.riskReasons.length)
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || a.workflowPack.localeCompare(b.workflowPack));
  const riskByAssetId = new Map(assetRisks.map((risk) => [risk.assetId, risk]));
  const packRisks = PREMIUM_WORKFLOW_PACKS
    .map((pack) => auditWorkflowPackVisualRisk(pack, riskByAssetId, templateRisks))
    .filter((risk) => risk.riskReasons.length)
    .sort((a, b) => riskRank(b.skeletonRisk) - riskRank(a.skeletonRisk) || b.highRiskPremiumAssets - a.highRiskPremiumAssets || a.packId.localeCompare(b.packId));
  const highRiskPremiumAssets = assetRisks.filter((risk) => risk.riskLevel === "high").length;
  const mediumRiskPremiumAssets = assetRisks.filter((risk) => risk.riskLevel === "medium").length;
  const factoryTemplateRisks = templateRisks.filter((risk) => risk.riskLevel !== "low").length;
  const status: CommercialVisualQualityAudit["status"] = highRiskPremiumAssets || factoryTemplateRisks ? "needs-polish" : "commercial-baseline";
  return {
    reviewedAt: ASSET_ROADMAP_REVIEWED_AT,
    status,
    policy: {
      premiumLabelFreeze: true,
      rule: "Do not promote more signature/hero assets until the touched pack has a 48px, 120px, and slide-size visual QA artifact plus a non-factory flagship layout.",
      recommendedPromotionGate: [
        "Distinct silhouette at 48px, not the same rounded card with a motif swap.",
        "120px preview has domain-specific detail, rim/highlight/depth, and readable visual hierarchy.",
        "Slide-size rendering supports a real figure, not only an icon grid.",
        "Publication-line and dark-talk styles preserve meaning without decorative clutter.",
        "PPTX/DOCX fallback warnings name exact asset IDs and recipes."
      ]
    },
    summary: {
      claimedPremiumAssets: premiumAssets.length,
      highRiskPremiumAssets,
      mediumRiskPremiumAssets,
      factoryTemplateRisks,
      packRisks: packRisks.length,
      nextAnchor: packRisks[0]?.nextAction ?? "Run a manual visual QA pass on the next flagship template before adding new coverage."
    },
    assetRisks: assetRisks.slice(0, limit),
    packRisks: packRisks.slice(0, limit),
    templateRisks: templateRisks.slice(0, limit),
    gates: [
      "Premium labels are frozen until visual QA evidence exists for the touched pack.",
      "Signature assets with generic default cards, low domain markers, or panel-heavy render structure must be demoted or hand-redrawn.",
      "Broad-pack flagship templates must not reuse the same five-stage decision-spine skeleton unless the workflow genuinely requires it.",
      "Every premium pack needs at least one flagship demo that looks domain-native at slide size.",
      "Agent recommendations should prefer visually verified assets over merely claimed signature assets."
    ],
    nextActions: [
      "Start with the highest-risk active pack and redesign its flagship template layout before adding more packs.",
      "For each high-risk signature asset, either hand-draw a distinct recipe or demote it to hero/standard.",
      "Replace rounded-card motif renderers with domain-native silhouettes for synthetic biology, clinical/translational, and anatomy assets.",
      "Add a visual QA snapshot after each asset upgrade and keep the audit risk list shrinking over time."
    ]
  };
}

export function getAssetCoverageGapReport(): AssetCoverageGapReport {
  const report = getAssetQualityReport();
  const commercialVisualAudit = report.commercialVisualAudit;
  const templateCount = PREMIUM_WORKFLOW_TEMPLATES.length;
  const signatureHeroAssets = report.summary.signatureAssets + report.summary.heroAssets;
  const baseline = {
    ...report.summary,
    templates: templateCount,
    signatureHeroAssets
  };
  const milestones = COVERAGE_MILESTONES.map((milestone) => ({
    ...milestone,
    remainingAssets: Math.max(0, milestone.targetAssets - report.summary.totalAssets),
    remainingSignatureHeroAssets: Math.max(0, milestone.targetSignatureHeroAssets - signatureHeroAssets),
    remainingWorkflowPacks: Math.max(0, milestone.targetWorkflowPacks - report.summary.workflowPacks),
    remainingTemplates: Math.max(0, milestone.targetTemplates - templateCount)
  }));
  const categoryGaps = report.categoryCoverage.map((category) => {
    const premiumRatio = Math.round((category.premiumCount / Math.max(1, category.count)) * 100) / 100;
    const status = premiumRatio >= 0.75
      ? "premium-seed"
      : category.premiumCount > 0
        ? "thin-premium"
        : "coverage-only";
    const nextAction = status === "premium-seed"
      ? "Connect these assets to flagship templates and pack-level gallery QA."
      : status === "thin-premium"
        ? "Promote the most common presentation assets to hero/signature recipes."
        : "Add the first signature assets before treating this category as commercial coverage.";
    return {
      category: category.category,
      currentAssets: category.count,
      currentPremiumAssets: category.premiumCount,
      premiumRatio,
      status,
      nextAction
    };
  });
  return {
    reviewedAt: ASSET_ROADMAP_REVIEWED_AT,
    baseline,
    productWedge: "asset-breadth-library",
    firstWave: "broad-biology-market",
    qualityGate: "pack-complete-premium",
    broadMarketPackOrder: [...BROAD_MARKET_PACK_ORDER],
    packMinimumContract: { ...COMMERCIAL_PACK_MINIMUM_CONTRACT },
    milestones,
    currentWorkflowReadiness: report.workflowCoverage,
    commercialVisualAudit: {
      status: commercialVisualAudit.status,
      premiumLabelFreeze: commercialVisualAudit.policy.premiumLabelFreeze,
      highRiskPremiumAssets: commercialVisualAudit.summary.highRiskPremiumAssets,
      mediumRiskPremiumAssets: commercialVisualAudit.summary.mediumRiskPremiumAssets,
      factoryTemplateRisks: commercialVisualAudit.summary.factoryTemplateRisks,
      nextAnchor: commercialVisualAudit.summary.nextAnchor
    },
    categoryGaps,
    plannedWorkflowPacks: [...PLANNED_WORKFLOW_PACKS]
      .sort((a, b) => plannedPackRank(a) - plannedPackRank(b) || a.priority - b.priority || a.name.localeCompare(b.name))
      .map((pack) => ({ ...pack, seedConcepts: [...pack.seedConcepts], agentUseHints: [...pack.agentUseHints] })),
    acceptanceGates: [...ACCEPTANCE_GATES],
    productionPipeline: [...PRODUCTION_PIPELINE],
    implementationRisks: [
      "Breadth can make the library look larger while weakening commercial quality if signature recipes are not visually audited.",
      "Office editability still lags SVG/PDF fidelity for layered premium assets.",
      "Agent-generated deck quality depends on pack-level templates and semantic slots, not isolated icon search.",
      "A 1,200 asset target requires repeatable recipe primitives and QA snapshots before large-scale expansion."
    ],
    nextActions: [
      "Use drug-discovery as the first active broad-market pack and run its gallery, template QA, and export snapshot after every asset/template edit.",
      "Use protein-engineering as the second active broad-market pack and tighten its flagship design/model/assay/developability visual QA.",
      "Use synthetic-biology as the third active broad-market pack and audit DBTL/circuit/chassis/biosensor/containment visual QA.",
      "Use microbiome-infectious-disease as the fourth active broad-market pack and audit community/barrier/metagenomic/AMR/outbreak visual QA.",
      "Use cell-therapy as the fifth active broad-market pack and audit CAR/TCR/NK, manufacturing, release QC, infusion, and monitoring visual QA.",
      "Use microscopy-image-analysis as the sixth active broad-market pack and audit field/channel/z-stack/segmentation/tracking/phenotyping/QC visual QA.",
      "Use lab-automation as the seventh active broad-market pack and audit liquid handling, robotics, plate logistics, LIMS, scheduling, and QC visual QA.",
      "Use anatomy-organ-systems as the eighth active broad-market pack and audit organ maps, tissue modules, sample flow, biomarker evidence, and clinical endpoint review.",
      "Use methods-and-protocols as the ninth active broad-market pack and audit sample prep, reagent setup, assay readout, controls, QC, and method caveat visual QA.",
      "Use grant-and-consulting-summary as the tenth active workflow pack and audit problem, aims, evidence, roadmap, risk, budget/resource, stakeholder, and recommendation visual QA.",
      "Use clinical-translational as the eleventh active workflow pack and audit cohort, consent, sample flow, biomarker, endpoint, safety, and clinician-review visual QA.",
      "Promote or add pack-specific signature assets for target validation, compound library, toxicity screen, ADMET, candidate nomination, and assay evidence.",
      "Add the next broad packs in order: immunology-oncology, bio-llm-benchmarks.",
      "Keep MCP/API recommendations pack-first so Codex or Claude can request workflowPack, templateId, assetId, styleProfile, semanticSlot, and appearance overrides."
    ]
  };
}

function plannedPackRank(pack: PlannedWorkflowPack): number {
  if (pack.wave === "commercial-broad") {
    const broadIndex = BROAD_MARKET_PACK_ORDER.indexOf(pack.id);
    return 100 + (broadIndex === -1 ? 99 : broadIndex);
  }
  if (pack.wave === "jk-aligned") return 20 + pack.priority;
  return pack.priority;
}

export function getAssetOntology(input: {
  workflowPack?: string;
  qualityTier?: AssetQualityTier | string;
  includeAssets?: boolean;
  limit?: number;
} = {}): AssetOntology {
  const workflowPack = input.workflowPack?.toLowerCase();
  const qualityTier = input.qualityTier?.toLowerCase();
  const report = getAssetQualityReport();
  const semanticSlots = uniqueValues(CURATED_ASSETS.flatMap((asset) => asset.semanticSlots)).sort();
  const panelRoles = uniqueValues(CURATED_ASSETS.map((asset) => asset.panelRole)).sort() as AssetPanelRole[];
  const assets = input.includeAssets === false
    ? []
    : CURATED_ASSETS
      .filter((asset) => !workflowPack || asset.workflowPacks.some((pack) => pack.toLowerCase() === workflowPack))
      .filter((asset) => !qualityTier || asset.qualityTier.toLowerCase() === qualityTier)
      .slice(0, input.limit ?? CURATED_ASSETS.length)
      .map((asset) => ({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        family: asset.family,
        qualityTier: asset.qualityTier,
        qaStatus: asset.qaStatus,
        workflowPacks: [...asset.workflowPacks],
        semanticSlots: [...asset.semanticSlots],
        panelRole: asset.panelRole,
        styleProfiles: [...asset.styleProfiles],
        editableParts: [...asset.editableParts],
        renderRecipe: asset.renderSpec.assetRecipe,
        fidelityScore: asset.fidelityScore
      }));
  return {
    schemaVersion: "0.5.0-asset-ontology",
    generatedAt: ASSET_ROADMAP_REVIEWED_AT,
    sourceOfTruth: "structured scene JSON with curated SVG asset recipes",
    styleProfiles: [...DEFAULT_STYLE_PROFILES],
    qualityTiers: ["signature", "hero", "standard", "utility"],
    panelRoles,
    semanticSlots,
    workflowPacks: PREMIUM_WORKFLOW_PACKS.map((pack) => ({
      id: pack.id,
      name: pack.name,
      priority: pack.priority,
      assetCount: pack.assetIds.length,
      templateCount: pack.templates.length,
      flagshipTemplateId: pack.flagshipTemplateId,
      agentUseHints: [...pack.agentUseHints]
    })),
    categories: report.categoryCoverage.map((category) => ({
      category: category.category,
      assetCount: category.count,
      premiumCount: category.premiumCount
    })),
    assets,
    agentContract: {
      normalReferenceFields: ["assetId", "workflowPack", "semanticSlot", "styleProfile", "appearance", "editablePartOverrides"],
      avoid: ["raw SVG for normal editing", "opaque screenshots as canonical source", "unsupported claims without review items"],
      preferredSequence: ["recommend_workflow_pack", "recommend_asset_set", "insert_premium_asset", "validate_deck", "export_pack_qa_report"]
    }
  };
}

function countByTier(assets: PremiumAsset[]): Record<AssetQualityTier, number> {
  return assets.reduce<Record<AssetQualityTier, number>>((counts, asset) => {
    counts[asset.qualityTier] += 1;
    return counts;
  }, { signature: 0, hero: 0, standard: 0, utility: 0 });
}

function auditPremiumAssetVisualRisk(asset: PremiumAsset): CommercialVisualAuditAssetRisk {
  const svg = renderPremiumAssetSvg(asset.id, {
    styleProfile: "consulting-2p5d",
    width: 160,
    height: 120,
    showLabel: false
  });
  const classNames = extractSvgClassNames(svg);
  const domainClasses = classNames.filter((className) => !COMMON_RENDER_CLASS_RE.test(className));
  const domainClassCount = new Set(domainClasses).size;
  const panelTokenCount = countMatches(svg, /\b(?:asset-[\w-]*(?:panel|card|default|dashboard|table|form|board)[\w-]*)\b/g);
  const rectCount = countMatches(svg, /<rect\b/g);
  const pathCount = countMatches(svg, /<path\b/g);
  const circleCount = countMatches(svg, /<circle\b/g);
  const riskReasons: string[] = [];

  if (asset.qaStatus === "premium" && asset.fidelityScore >= 0.9) {
    riskReasons.push("premium-status-is-derived-from-tier; needs explicit visual QA evidence before treating as commercial-ready");
  }
  if (domainClassCount < 5) {
    riskReasons.push("low-domain-marker-count; renderer may be visually under-specified or hard to distinguish at 48px");
  }
  if (panelTokenCount >= 3 || (panelTokenCount >= 1 && rectCount > pathCount + circleCount)) {
    riskReasons.push("panel-heavy-render; likely reads as UI card/icon rather than scientific illustration");
  }
  if (/asset-[\w-]*default(?:-|_)?(?:card|chart|panel)/.test(svg)) {
    riskReasons.push("generic-default-renderer-path; should not be signature without a hand-tuned recipe");
  }
  if (asset.qualityTier === "signature" && !asset.workflowPacks.length) {
    riskReasons.push("signature-asset-is-not-attached-to-a workflow pack; premium status lacks product context");
  }

  const riskLevel = riskReasons.some((reason) => reason.includes("generic-default") || reason.includes("panel-heavy"))
    ? "high"
    : riskReasons.length >= 2
      ? "medium"
      : riskReasons.length
        ? "low"
        : "low";
  const recommendedTier: AssetQualityTier = riskLevel === "high"
    ? asset.qualityTier === "signature" ? "hero" : "standard"
    : riskLevel === "medium" && asset.qualityTier === "signature"
      ? "hero"
      : asset.qualityTier;

  return {
    assetId: asset.id,
    name: asset.name,
    qualityTier: asset.qualityTier,
    workflowPacks: [...asset.workflowPacks],
    rendererFamily: asset.family,
    renderRecipe: asset.renderSpec.assetRecipe,
    riskLevel,
    riskReasons,
    recommendedTier,
    visualMetrics: {
      svgBytes: svg.length,
      domainClassCount,
      panelTokenCount,
      rectCount,
      pathCount,
      circleCount
    },
    nextAction: riskLevel === "high"
      ? `Hand-redraw ${asset.id} with a distinct silhouette or demote it to ${recommendedTier}.`
      : riskLevel === "medium"
        ? `Add visual QA evidence and more domain-specific micro-detail before keeping ${asset.id} as ${asset.qualityTier}.`
        : `Keep ${asset.id} on the watch list until pack-level visual QA is complete.`
  };
}

const COMMON_RENDER_CLASS_RE = /^(premium-asset|commercial-premium-asset|style-|asset-(anchors|contact-shadow|soft-shadow|body-depth|body-depth-overlay|soft-body-gradient|glass-highlight|inner-highlight|rim-highlight|label|selected|warning-glow))/;

function auditWorkflowPackVisualRisk(
  pack: WorkflowPack,
  riskByAssetId: Map<string, CommercialVisualAuditAssetRisk>,
  templateRisks: CommercialVisualAuditTemplateRisk[]
): CommercialVisualAuditPackRisk {
  const packAssets = pack.assetIds
    .map((assetId) => CURATED_ASSETS.find((asset) => asset.id === assetId))
    .filter((asset): asset is PremiumAsset => Boolean(asset));
  const claimedPremiumAssets = packAssets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length;
  const highRiskPremiumAssets = pack.assetIds.filter((assetId) => riskByAssetId.get(assetId)?.riskLevel === "high").length;
  const mediumRiskPremiumAssets = pack.assetIds.filter((assetId) => riskByAssetId.get(assetId)?.riskLevel === "medium").length;
  const templateRisk = templateRisks.find((risk) => risk.templateId === pack.flagshipTemplateId);
  const riskReasons: string[] = [];
  if (claimedPremiumAssets / Math.max(1, packAssets.length) > 0.82 && highRiskPremiumAssets + mediumRiskPremiumAssets > 6) {
    riskReasons.push("premium-ratio-is-too-high-for-an-unaudited-pack; likely label inflation");
  }
  if (highRiskPremiumAssets > 4) {
    riskReasons.push("multiple high-risk signature/hero assets need hand redraw or demotion");
  }
  if (templateRisk && templateRisk.riskLevel !== "low") {
    riskReasons.push(`flagship-template-uses-${templateRisk.skeletonSignature}; layout may feel factory-made`);
  }
  const skeletonRisk = templateRisk?.riskLevel ?? (highRiskPremiumAssets > 4 ? "medium" : "low");
  return {
    packId: pack.id,
    name: pack.name,
    claimedPremiumAssets,
    highRiskPremiumAssets,
    mediumRiskPremiumAssets,
    flagshipTemplateId: pack.flagshipTemplateId,
    templateSkeleton: templateRisk?.skeletonSignature ?? "not-audited",
    skeletonRisk,
    riskReasons,
    nextAction: templateRisk && templateRisk.riskLevel !== "low"
      ? `Redesign ${pack.flagshipTemplateId} so ${pack.id} has a domain-native flagship layout, then redraw the highest-risk core assets.`
      : `Audit ${pack.id} signature assets at 48px/120px/slide-size before adding more coverage.`
  };
}

function auditFlagshipTemplateSkeleton(pack: WorkflowPack): CommercialVisualAuditTemplateRisk {
  const nodes = createFlagshipWorkflowDemoNodes({ workflowPack: pack.id, styleProfile: "consulting-2p5d" });
  const symbolCount = nodes.filter((node) => node.kind === "symbol").length;
  const connectorCount = nodes.filter((node) => node.kind === "connector").length;
  const textNodes = nodes.filter((node) => node.kind === "text");
  const text = textNodes.map((node) => String((node.payload as { text?: unknown }).text ?? "")).join(" | ");
  const hasDecisionSpine = /Decision spine:/i.test(text);
  const hasAgentReadyChip = /agent-ready/i.test(text);
  const hasReviewChip = /review/i.test(text);
  const skeletonSignature = hasDecisionSpine && connectorCount >= 4 && symbolCount >= 9
    ? "five-stage-decision-spine"
    : hasAgentReadyChip && symbolCount >= 8
      ? "agent-ready-card-grid"
      : "custom-or-lightweight";
  const riskReasons: string[] = [];
  if (skeletonSignature === "five-stage-decision-spine") {
    riskReasons.push("flagship uses the repeated five-stage decision-spine skeleton; broad packs may look interchangeable");
  }
  if (hasAgentReadyChip && hasReviewChip && symbolCount >= 10) {
    riskReasons.push("template emphasizes system status chips more than domain-native figure structure");
  }
  const riskLevel = riskReasons.length >= 2 ? "high" : riskReasons.length ? "medium" : "low";
  return {
    templateId: pack.flagshipTemplateId ?? pack.templates[0],
    workflowPack: pack.id,
    skeletonSignature,
    nodeCount: nodes.length,
    symbolCount,
    connectorCount,
    textCount: textNodes.length,
    riskLevel,
    riskReasons,
    nextAction: riskLevel === "low"
      ? `Keep ${pack.flagshipTemplateId ?? pack.templates[0]} but still inspect it visually before delivery.`
      : `Redesign ${pack.flagshipTemplateId ?? pack.templates[0]} around the real scientific object or evidence panel, not a generic workflow skeleton.`
  };
}

function extractSvgClassNames(svg: string): string[] {
  return [...svg.matchAll(/class="([^"]+)"/g)]
    .flatMap((match) => match[1].split(/\s+/))
    .filter(Boolean);
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function riskRank(risk: "low" | "medium" | "high"): number {
  if (risk === "high") return 3;
  if (risk === "medium") return 2;
  return 1;
}

function countByQaStatus(assets: PremiumAsset[]): Record<AssetQaStatus, number> {
  return assets.reduce<Record<AssetQaStatus, number>>((counts, asset) => {
    counts[asset.qaStatus] += 1;
    return counts;
  }, { draft: 0, reviewed: 0, premium: 0 });
}

function buildPriorityGaps(
  workflowCoverage: AssetQualityReport["workflowCoverage"],
  styleCoverage: AssetQualityReport["styleCoverage"]
): string[] {
  const gaps = [];
  const thinPacks = workflowCoverage.filter((pack) => pack.signatureOrHeroCount < Math.min(10, pack.assetCount));
  if (CURATED_ASSETS.length < 1000) gaps.push(`Coverage gap: ${CURATED_ASSETS.length} curated assets is still a focused premium seed library; adjacent scientific visual products benchmark at thousands of assets/templates.`);
  if (thinPacks.length) gaps.push(`Workflow polish gap: ${thinPacks.map((pack) => pack.id).join(", ")} need more signature/hero assets before they feel like paid workflow packs.`);
  if (styleCoverage.some((style) => style.count < CURATED_ASSETS.length)) gaps.push("Style gap: every asset should round-trip through all style profiles before claiming complete multi-style coverage.");
  gaps.push("Recipe gap: signature assets still need more hand-tuned silhouettes, micro-details, and part-level overrides beyond shared family primitives.");
  gaps.push("Template gap: workflow packs list templates, but full commercial-quality demo scenes and paper-style result panels are still sparse.");
  gaps.push("Office editability gap: PPTX/DOCX export prioritizes SVG visual fidelity today; native editable shape mapping is still partial.");
  return gaps;
}

function biology(
  subcategory: string,
  family: AssetFamily,
  visualRole: AssetVisualRole,
  rows: [string, string, string][],
  accent: string
): AssetSeed[] {
  return rows.map(([id, name, tagString]) => ({
    id,
    name,
    domain: "Biology",
    subcategory,
    family,
    visualRole,
    tags: words(tagString),
    aliases: aliasFrom(name, tagString),
    organism: inferOrganism(tagString),
    assay: inferAssay(tagString),
    modality: inferModality(tagString),
    riskDomain: tagString.includes("pathogen") || tagString.includes("biosafety") || tagString.includes("bsl") ? ["biosafety"] : [],
    motif: id,
    accent,
    secondary: softSecondary(accent),
    complexity: family === "cell" || family === "molecule" ? "moderate" : "simple"
  }));
}

function ai(
  subcategory: string,
  family: AssetFamily,
  visualRole: AssetVisualRole,
  rows: [string, string, string][],
  accent: string
): AssetSeed[] {
  return rows.map(([id, name, tagString]) => ({
    id,
    name,
    domain: "AI",
    subcategory,
    family,
    visualRole,
    tags: words(tagString),
    aliases: aliasFrom(name, tagString),
    organism: [],
    assay: [],
    modality: inferModality(tagString),
    riskDomain: inferRiskDomain(tagString),
    motif: id,
    accent,
    secondary: softSecondary(accent),
    complexity: family === "agentSystem" || family === "riskGate" ? "moderate" : "simple"
  }));
}

function softSecondary(accent: string): string {
  const palette: Record<string, string> = {
    "#38bdf8": "#e0f2fe",
    "#2563eb": "#dbeafe",
    "#16a34a": "#dcfce7",
    "#0891b2": "#cffafe",
    "#9333ea": "#f3e8ff",
    "#f59e0b": "#fef3c7",
    "#ec4899": "#fce7f3",
    "#dc2626": "#fee2e2",
    "#0ea5e9": "#e0f2fe",
    "#7c3aed": "#ede9fe",
    "#059669": "#d1fae5",
    "#ea580c": "#ffedd5",
    "#0f766e": "#ccfbf1",
    "#be123c": "#ffe4e6",
    "#7e22ce": "#f3e8ff",
    "#f97316": "#ffedd5",
    "#0369a1": "#e0f2fe",
    "#b45309": "#fef3c7",
    "#4f46e5": "#e0e7ff",
    "#65a30d": "#ecfccb",
    "#c2410c": "#ffedd5",
    "#0d9488": "#ccfbf1"
  };
  return palette[accent] ?? "#e0f2fe";
}

function premiumSeedTheme(seed: AssetSeed): Pick<AssetSeed, "accent" | "secondary"> {
  const mechanismThemes: Record<string, string> = {
    protein: "#f59e0b",
    antibody: "#f97316",
    receptor: "#0d9488",
    ligand: "#7e22ce",
    cytokine: "#be123c",
    metabolite: "#65a30d",
    enzyme: "#0369a1",
    "transcription-factor": "#4f46e5",
    "protein-complex": "#b45309",
    "protein-domain": "#0d9488",
    "binding-pocket": "#0f766e",
    "antibody-fragment": "#f97316",
    "enzyme-active-site": "#0369a1",
    "protein-variant-library": "#0d9488",
    "directed-evolution": "#16a34a",
    "affinity-maturation": "#f97316",
    "protein-design-model": "#4f46e5",
    "expression-host": "#0891b2",
    "purification-column": "#0f766e",
    "structure-prediction": "#4f46e5",
    "stability-assay": "#dc2626",
    "binding-affinity-assay": "#0d9488",
    "enzyme-kinetics": "#0369a1",
    "developability-profile": "#b45309",
    "sequence-logo": "#7c3aed",
    "genetic-circuit": "#059669",
    "promoter-library": "#16a34a",
    "ribosome-binding-site": "#0d9488",
    terminator: "#0f766e",
    "plasmid-vector": "#059669",
    "synthetic-operon": "#16a34a",
    "dna-assembly": "#4f46e5",
    "golden-gate-assembly": "#f59e0b",
    "gibson-assembly": "#0d9488",
    "design-build-test-learn-cycle": "#059669",
    "chassis-cell": "#0891b2",
    bioreactor: "#0f766e",
    "biosensor-circuit": "#0d9488",
    "logic-gate-genetic": "#7c3aed",
    "metabolic-pathway-engineering": "#65a30d",
    "pathway-flux-map": "#16a34a",
    "strain-library": "#0891b2",
    "kill-switch": "#dc2626",
    "microbiome-community": "#0d9488",
    "gut-microbiome": "#059669",
    "bacterial-strain": "#0f766e",
    "viral-phage": "#7c3aed",
    "fungal-cell": "#ec4899",
    "pathogen-host-interaction": "#b45309",
    "mucosal-barrier": "#16a34a",
    "microbiome-profile": "#0d9488",
    "metagenomic-read": "#2563eb",
    "taxonomic-abundance": "#059669",
    "alpha-diversity": "#65a30d",
    "beta-diversity": "#4f46e5",
    "amr-gene": "#dc2626",
    "antimicrobial-resistance": "#be123c",
    "antibiotic-treatment": "#f97316",
    "microbiome-dysbiosis": "#b45309",
    "outbreak-cluster": "#ea580c",
    "infection-model": "#dc2626",
    "car-t-cell": "#0d9488",
    "engineered-t-cell": "#0891b2",
    "tcr-therapy": "#2563eb",
    "nk-cell-therapy": "#7c3aed",
    "tumor-antigen": "#be123c",
    "antigen-presentation": "#f97316",
    "viral-vector-transduction": "#4f46e5",
    leukapheresis: "#dc2626",
    "cell-expansion": "#16a34a",
    "activation-beads": "#f59e0b",
    "gene-edited-cell": "#059669",
    "potency-assay": "#7c3aed",
    "cytokine-release": "#be123c",
    "infusion-bag": "#0891b2",
    "patient-infusion": "#0d9488",
    "manufacturing-batch": "#0f766e",
    "release-testing": "#f97316",
    cryopreservation: "#2563eb",
    "image-analysis-pipeline": "#0ea5e9",
    "microscope-field": "#38bdf8",
    "fluorescence-channel": "#ec4899",
    "z-stack": "#7c3aed",
    "tile-stitching": "#0891b2",
    "illumination-correction": "#f59e0b",
    "focus-quality": "#2563eb",
    "nuclei-segmentation": "#7c3aed",
    "membrane-segmentation": "#16a34a",
    "organelle-segmentation": "#0d9488",
    "instance-mask": "#9333ea",
    "cell-tracking": "#f97316",
    "phenotype-feature-vector": "#0369a1",
    "morphology-embedding": "#4f46e5",
    "classifier-heatmap": "#dc2626",
    "image-qc-dashboard": "#0f766e",
    "annotation-brush": "#b45309",
    "segmentation-model": "#4f46e5",
    "lab-automation-platform": "#0ea5e9",
    "robotic-arm": "#2563eb",
    "automated-liquid-handler": "#0891b2",
    "plate-handler": "#0f766e",
    "plate-stack": "#0284c7",
    "barcode-scanner": "#7c3aed",
    "plate-reader": "#16a34a",
    "reagent-reservoir": "#0d9488",
    "tip-rack": "#64748b",
    "robotic-gripper": "#4f46e5",
    "lims-dashboard": "#2563eb",
    "assay-scheduler": "#f59e0b",
    "sample-tracker": "#9333ea",
    "qc-gate-automation": "#dc2626",
    "incubator-stack": "#0f766e",
    "automated-microscope": "#38bdf8",
    "acoustic-dispenser": "#7c3aed",
    "colony-picker": "#b45309",
    "tube-rack": "#0891b2",
    "sample-tube-array": "#2563eb",
    "robotic-rail": "#475569",
    "deck-layout": "#0ea5e9",
    "waste-chute": "#64748b",
    "seal-peeler": "#f97316",
    "lab-sensor": "#16a34a",
    "automation-orchestrator": "#4f46e5",
    "anatomy-overview": "#ec4899",
    "organ-axis-brain-lung-gut": "#7c3aed",
    brain: "#7c3aed",
    lung: "#0ea5e9",
    gut: "#059669",
    liver: "#f97316",
    heart: "#dc2626",
    "immune-system": "#16a34a",
    "blood-brain-barrier": "#2563eb",
    kidney: "#0891b2",
    spleen: "#be123c",
    pancreas: "#f59e0b",
    skin: "#ec4899",
    "bone-marrow": "#dc2626",
    "lymph-node": "#16a34a",
    vasculature: "#2563eb",
    "respiratory-tract": "#0ea5e9",
    "intestinal-villus": "#059669",
    "renal-nephron": "#0891b2",
    "hepatic-lobule": "#f97316",
    "cardiac-muscle": "#dc2626",
    "neural-circuit": "#7c3aed",
    "blood-vessel": "#2563eb",
    "lymphatic-vessel": "#16a34a",
    "immune-organ-map": "#16a34a",
    "organ-chip": "#0f766e",
    "patient-organ-cohort": "#0d9488",
    "disease-tissue-map": "#b45309",
    "organ-sample-flow": "#0891b2",
    "tissue-biomarker-panel": "#7c3aed",
    "organ-risk-context": "#dc2626",
    "clinical-endpoint-card": "#be123c",
    "anatomy-callout": "#64748b",
    "organ-scale-bar": "#64748b",
    "tissue-region-map": "#f59e0b",
    "organ-legend": "#475569",
    "organ-system-network": "#4f46e5",
    "cross-organ-comparison": "#7c3aed",
    "pathway-node": "#c2410c",
    "signaling-cascade": "#9333ea",
    "activation-edge": "#16a34a",
    "inhibition-edge": "#dc2626",
    "cell-surface-marker": "#0891b2"
  };
  const spatialThemes: Record<string, string> = {
    "spatial-grid": "#7c3aed",
    "visium-spot-array": "#0d9488",
    "merfish-field": "#ec4899",
    "xenium-panel": "#2563eb",
    "histology-section": "#c084fc",
    "microscopy-tile": "#38bdf8",
    "segmentation-mask": "#16a34a",
    "cell-boundary": "#f97316",
    "neighborhood-graph": "#4f46e5",
    "tissue-region": "#f59e0b",
    "image-registration": "#0891b2",
    "morphology-feature": "#64748b"
  };
  const accent = mechanismThemes[seed.id] ?? spatialThemes[seed.id] ?? seed.accent ?? "#2563eb";
  return { accent, secondary: seed.secondary && !mechanismThemes[seed.id] && !spatialThemes[seed.id] ? seed.secondary : softSecondary(accent) };
}

function makePremiumAsset(seed: AssetSeed): PremiumAsset {
  const qualityTier = qualityTierFor(seed);
  const workflowPacks = ASSET_TO_WORKFLOW_PACKS.get(seed.id) ?? [];
  const semanticSlots = semanticSlotsFor(seed, workflowPacks);
  const panelRole = panelRoleFor(seed);
  const editableParts = FAMILY_PARTS[seed.family];
  const assetRecipe = commercialAssetRecipe({ id: seed.id, family: seed.family });
  const theme = premiumSeedTheme(seed);
  return {
    id: seed.id,
    name: seed.name,
    kind: "symbol",
    category: `${seed.domain} / ${seed.subcategory}`,
    family: seed.family,
    subcategory: seed.subcategory,
    qualityTier,
    tags: [...new Set([seed.domain.toLowerCase(), seed.subcategory.toLowerCase(), seed.family, seed.visualRole, ...workflowPacks, ...semanticSlots, ...seed.tags])],
    aliases: seed.aliases ?? [],
    organism: seed.organism ?? [],
    assay: seed.assay ?? [],
    modality: seed.modality ?? [],
    visualRole: seed.visualRole,
    riskDomain: seed.riskDomain ?? [],
    agentUseHints: [
      `Use for ${seed.subcategory.toLowerCase()} slides.`,
      `Good visual role: ${seed.visualRole}.`,
      workflowPacks.length ? `Workflow pack: ${workflowPacks.join(", ")}.` : "Use as a general supporting scientific visual.",
      `Panel role: ${panelRole}.`,
      seed.domain === "AI" ? "Pairs well with review, dataset, model, and risk assets." : "Pairs well with assay, cell, molecule, and analysis assets."
    ],
    variants: [...DEFAULT_VARIANTS],
    styleProfiles: styleProfilesFor(seed),
    workflowPacks,
    semanticSlots,
    panelRole,
    fidelityScore: fidelityScoreFor(qualityTier),
    qaStatus: qualityTier === "signature" || qualityTier === "hero" ? "premium" : "reviewed",
    editableParts,
    editablePartDefinitions: editableParts.map((part) => editablePartDefinition(part, seed)),
    recommendedSize: { width: 160, height: 120 },
    preview: seed.motif ?? seed.id,
    renderSpec: {
      family: seed.family,
      motif: seed.motif ?? seed.id,
      accent: theme.accent,
      secondary: theme.secondary,
      complexity: seed.complexity ?? "moderate",
      version: 2,
      assetRecipe
    },
    provenance: curatedProvenance(
      `Scientific Image premium ${seed.domain.toLowerCase()} structured SVG asset pack`,
      "Scientific Image premium curated asset library v0.3"
    )
  };
}

function makeRealisticAsset(seed: RealisticAssetSeed): RealisticAsset {
  const styleProfiles = uniqueValues<AssetStyleProfile>(["scientific-editorial-realism", "consulting-2p5d", seed.panelRole === "warning" ? "risk-warning" : "dark-talk"]);
  const editableParts = ["image crop", "mask", "color wash", "rim highlight", "caption anchor", "connector anchor", "provenance badge"];
  const provenance = curatedProvenance(
    `Scientific Image generated editorial fixture: ${seed.name}`,
    "Scientific Image local realistic fixture library v0.1"
  );
  return {
    id: seed.id,
    name: seed.name,
    kind: "image",
    category: seed.category,
    family: seed.family,
    subcategory: seed.pack.replace(/^realistic-/, "").replace(/-/g, " "),
    qualityTier: seed.qualityTier,
    tags: uniqueValues([
      "realistic",
      "scientific-editorial-realism",
      seed.pack,
      seed.family,
      seed.visualRole,
      seed.realismLevel,
      seed.mediaType,
      seed.sourceAssetType,
      ...seed.tags,
      ...seed.semanticSlots
    ]),
    aliases: seed.aliases,
    organism: [],
    assay: seed.tags.filter((tag) => /assay|omics|microscopy|sequencing|screen|protocol/.test(tag)),
    modality: uniqueValues([seed.realismLevel, seed.mediaType, "hybrid-svg-raster", seed.pattern]),
    visualRole: seed.visualRole,
    riskDomain: seed.panelRole === "warning" || seed.tags.some((tag) => /biosafety|containment|pathogen|risk/.test(tag)) ? ["biosafety", "editorial-realism"] : [],
    agentUseHints: [
      "Use when the slide intent asks for context, evidence, microscopy, sample imagery, protocol credibility, or editorial visual texture.",
      "Keep mechanism diagrams and highly editable workflows SVG-first unless the realistic context panel improves trust.",
      `Insert by assetId with styleProfile scientific-editorial-realism, crop, mask, color wash, caption anchor, and provenance.`,
      `Workflow pack: ${seed.pack}.`
    ],
    variants: ["filled", "dark", "warning", "selected", "disabled"],
    styleProfiles,
    workflowPacks: [seed.pack],
    semanticSlots: seed.semanticSlots,
    panelRole: seed.panelRole,
    fidelityScore: seed.qualityTier === "signature" ? 0.9 : seed.qualityTier === "hero" ? 0.82 : 0.68,
    qaStatus: seed.qualityTier === "signature" || seed.qualityTier === "hero" ? "reviewed" : "draft",
    editableParts,
    editablePartDefinitions: editableParts.map((part) => realisticEditablePart(part, seed)),
    recommendedSize: { width: 260, height: 170 },
    preview: seed.pattern,
    dataUri: realisticFixtureDataUri(seed),
    realismLevel: seed.realismLevel,
    mediaType: seed.mediaType,
    resolution: { width: 1024, height: 672, dpi: 144 },
    backgroundTreatment: seed.backgroundTreatment,
    cutoutStatus: seed.cutoutStatus,
    rightsStatus: "curated-fixture",
    sourceAssetType: seed.sourceAssetType,
    provenance
  };
}

function realisticEditablePart(part: string, seed: RealisticAssetSeed): NonNullable<Asset["editablePartDefinitions"]>[number] {
  const id = part.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const anchor = part.includes("caption") ? "label" : part.includes("connector") ? "connector" : part.includes("badge") ? "badge" : "highlight";
  const colorBinding = part.includes("wash") || part.includes("rim") || part.includes("badge") ? "accent" : part.includes("caption") ? "label" : "stroke";
  return {
    id,
    role: `${seed.pack}:${part}`,
    selectable: !part.includes("anchor"),
    colorBinding,
    anchor,
    exportMapping: part.includes("caption") ? "text" : part.includes("crop") || part.includes("mask") ? "group" : "shape"
  };
}

function realisticFixtureDataUri(seed: RealisticAssetSeed): string {
  const svg = realisticFixtureSvg(seed);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function realisticFixtureSvg(seed: RealisticAssetSeed): string {
  const bg = seed.pattern === "space" ? "#111827" : seed.pattern === "microscopy" || seed.pattern === "cells" ? "#172033" : "#f8fafc";
  const washBaseOpacity = seed.pattern === "bench" || seed.pattern === "instrument" || seed.pattern === "sample" || seed.pattern === "data" ? 0.44 : seed.pattern === "space" ? 0.34 : 0.56;
  const base = `<rect width="1024" height="672" fill="${bg}"/><rect width="1024" height="672" fill="url(#wash)" opacity="${fmt(washBaseOpacity)}"/>`;
  const texture = realisticPattern(seed);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="672" viewBox="0 0 1024 672"><defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${seed.secondary}" stop-opacity="0.58"/><stop offset="56%" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="100%" stop-color="${seed.accent}" stop-opacity="0.42"/></linearGradient><radialGradient id="spot" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="50%" stop-color="${seed.secondary}" stop-opacity="0.45"/><stop offset="100%" stop-color="${seed.accent}" stop-opacity="0.18"/></radialGradient><radialGradient id="microscopyHaze" cx="44%" cy="38%" r="72%"><stop offset="0%" stop-color="${seed.secondary}" stop-opacity="0.34"/><stop offset="64%" stop-color="${seed.accent}" stop-opacity="0.13"/><stop offset="100%" stop-color="#020617" stop-opacity="0"/></radialGradient><filter id="softGrain"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.026" numOctaves="3" seed="${seed.id.length}"/><feColorMatrix type="saturate" values="0.45"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.13"/></feComponentTransfer></filter></defs>${base}<rect width="1024" height="672" filter="url(#softGrain)" opacity="0.8"/>${texture}<rect x="34" y="34" width="956" height="604" rx="42" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.42"/></svg>`;
}

function realisticPattern(seed: RealisticAssetSeed): string {
  if (seed.id === "realistic-spacecraft-context") return spacecraftContextTexture(seed);
  if (seed.id === "realistic-astronaut-sample") return astronautSampleTexture(seed);
  if (seed.id === "realistic-spaceflight-assay") return spaceflightAssayTexture(seed);
  if (seed.id === "realistic-genelab-data-context") return genelabDataContextTexture(seed);
  if (seed.id === "realistic-cell-cluster") return cellClusterTexture(seed);
  if (seed.id === "realistic-tumor-microenvironment") return tumorMicroenvironmentTexture(seed);
  if (seed.id === "realistic-immune-infiltrate") return immuneInfiltrateTexture(seed);
  if (seed.id === "realistic-protein-gel") return proteinGelTexture(seed);
  if (seed.pattern === "tissue") return tissueTexture(seed);
  if (seed.pattern === "microscopy") return microscopyTexture(seed);
  if (seed.pattern === "segmentation") return segmentationTexture(seed);
  if (seed.pattern === "map") return spatialMapTexture(seed);
  if (seed.pattern === "bench") return benchTexture(seed);
  if (seed.pattern === "instrument") return instrumentTexture(seed);
  if (seed.pattern === "sample") return sampleTexture(seed);
  if (seed.pattern === "cells") return cellsTexture(seed);
  if (seed.pattern === "space") return spaceTexture(seed);
  return dataPanelTexture(seed);
}

function organicBlobPath(cx: number, cy: number, rx: number, ry: number, phase = 0, points = 12): string {
  const coords = Array.from({ length: points }, (_, index) => {
    const angle = (Math.PI * 2 * index) / points;
    const wobble = 0.82 + (((index * 37 + phase * 11) % 19) / 100) + Math.sin(index * 1.7 + phase) * 0.075;
    return {
      x: cx + Math.cos(angle) * rx * wobble,
      y: cy + Math.sin(angle) * ry * (0.86 + Math.cos(index * 1.3 + phase) * 0.11)
    };
  });
  return `${coords.map((point, index) => `${index === 0 ? "M" : "L"}${fmt(point.x)},${fmt(point.y)}`).join(" ")} Z`;
}

function fixtureCell(seed: RealisticAssetSeed, x: number, y: number, rx: number, ry: number, index: number, opacity = 0.48): string {
  const fill = index % 3 === 0 ? seed.secondary : index % 3 === 1 ? seed.accent : "#f8fafc";
  const nucleus = index % 2 === 0 ? seed.accent : seed.secondary;
  return `<g opacity="${fmt(opacity)}"><path d="${organicBlobPath(x, y, rx, ry, index, 10)}" fill="${fill}" stroke="#ffffff" stroke-width="${fmt(Math.max(1.2, Math.min(rx, ry) * 0.09))}" stroke-opacity="0.28"/><ellipse cx="${fmt(x - rx * 0.12)}" cy="${fmt(y - ry * 0.08)}" rx="${fmt(rx * 0.25)}" ry="${fmt(ry * 0.2)}" fill="${nucleus}" opacity="0.55"/><circle cx="${fmt(x + rx * 0.22)}" cy="${fmt(y - ry * 0.22)}" r="${fmt(Math.max(2, Math.min(rx, ry) * 0.08))}" fill="#ffffff" opacity="0.5"/></g>`;
}

function fixturePuncta(seed: RealisticAssetSeed, count: number, opacity = 0.72): string {
  return Array.from({ length: count }, (_, index) => {
    const x = 48 + (index * 157) % 928;
    const y = 42 + (index * 89) % 584;
    const r = 2.2 + (index % 4) * 1.7;
    const fill = index % 5 === 0 ? "#ffffff" : index % 2 ? seed.accent : seed.secondary;
    return `<circle cx="${x}" cy="${y}" r="${fmt(r)}" fill="${fill}" opacity="${fmt(opacity - (index % 5) * 0.08)}"/>`;
  }).join("");
}

function tissueTexture(seed: RealisticAssetSeed): string {
  const tissueBody = `<path d="${organicBlobPath(518, 326, 414, 244, seed.id.length, 18)}" fill="#fff1f7" opacity="0.74" stroke="#ffffff" stroke-width="13" stroke-opacity="0.72"/><path d="${organicBlobPath(510, 326, 374, 208, seed.id.length + 3, 16)}" fill="none" stroke="${seed.accent}" stroke-width="18" stroke-opacity="0.16"/>`;
  const stainClouds = Array.from({ length: 24 }, (_, index) => {
    const x = 128 + (index * 89) % 768;
    const y = 96 + (index * 61) % 472;
    const rx = 76 + (index % 5) * 24;
    const ry = 30 + (index % 4) * 18;
    const fill = index % 3 === 0 ? seed.secondary : index % 3 === 1 ? seed.accent : "#f0abfc";
    return `<path d="${organicBlobPath(x, y, rx, ry, index, 9)}" fill="${fill}" opacity="${fmt(0.12 + (index % 5) * 0.028)}"/>`;
  }).join("");
  const stromalStrands = Array.from({ length: 18 }, (_, index) => {
    const x = 122 + (index * 71) % 780;
    const y = 118 + (index * 53) % 430;
    return `<path d="M${x},${y} C${x + 78},${y - 44} ${x + 142},${y + 64} ${x + 238},${y + (index % 2 ? -16 : 28)}" fill="none" stroke="${index % 2 ? seed.secondary : seed.accent}" stroke-width="${fmt(2.2 + (index % 3) * 1.3)}" stroke-linecap="round" opacity="${fmt(0.18 + (index % 4) * 0.045)}"/>`;
  }).join("");
  const nuclei = Array.from({ length: 126 }, (_, index) => {
    const x = 92 + (index * 113) % 842;
    const y = 78 + (index * 73) % 510;
    const r = 2.7 + (index % 5) * 1.4;
    return `<ellipse cx="${x}" cy="${y}" rx="${fmt(r * 1.25)}" ry="${fmt(r)}" fill="#7e22ce" opacity="${fmt(0.18 + (index % 4) * 0.045)}" transform="rotate(${(index * 31) % 180} ${x} ${y})"/>`;
  }).join("");
  const vessels = Array.from({ length: 5 }, (_, index) => {
    const x = 230 + index * 142;
    const y = 182 + (index % 3) * 116;
    return `<path d="${organicBlobPath(x, y, 42 + index * 5, 20 + (index % 2) * 8, index + 11, 10)}" fill="#ffffff" opacity="0.58" stroke="${seed.secondary}" stroke-width="5" stroke-opacity="0.28"/>`;
  }).join("");
  return `${tissueBody}${stainClouds}${stromalStrands}${nuclei}${vessels}`;
}

function microscopyTexture(seed: RealisticAssetSeed): string {
  const haze = `<rect width="1024" height="672" fill="url(#microscopyHaze)" opacity="0.88"/>`;
  const cells = Array.from({ length: 48 }, (_, index) => {
    const x = 60 + (index * 131) % 902;
    const y = 48 + (index * 83) % 572;
    const rx = 16 + (index % 6) * 6;
    const ry = 14 + (index % 5) * 5;
    return fixtureCell(seed, x, y, rx, ry, index, 0.32 + (index % 4) * 0.06);
  }).join("");
  const channelDots = fixturePuncta(seed, 150, 0.68);
  const fibers = Array.from({ length: 16 }, (_, index) => {
    const x = 72 + (index * 109) % 830;
    const y = 76 + (index * 79) % 500;
    return `<path d="M${x},${y} C${x + 54},${y - 42} ${x + 124},${y + 58} ${x + 214},${y + (index % 2 ? 18 : -28)}" fill="none" stroke="${index % 2 ? seed.accent : seed.secondary}" stroke-width="${fmt(1.6 + (index % 4) * 0.7)}" stroke-linecap="round" opacity="${fmt(0.18 + (index % 3) * 0.07)}"/>`;
  }).join("");
  return `${haze}${fibers}${cells}${channelDots}`;
}

function segmentationTexture(seed: RealisticAssetSeed): string {
  const base = microscopyTexture(seed);
  const masks = Array.from({ length: 28 }, (_, index) => {
    const x = 68 + (index * 101) % 880;
    const y = 62 + (index * 71) % 540;
    const rx = 30 + (index % 5) * 9;
    const ry = 24 + (index % 4) * 8;
    const fill = index % 4 === 0 ? seed.accent : index % 4 === 1 ? seed.secondary : index % 4 === 2 ? "#f8fafc" : "#86efac";
    const stroke = index % 3 === 0 ? "#ffffff" : seed.accent;
    return `<path d="${organicBlobPath(x, y, rx, ry, index + 4, 11)}" fill="${fill}" fill-opacity="0.12" stroke="${stroke}" stroke-width="${fmt(3 + (index % 3) * 0.8)}" stroke-opacity="${fmt(0.52 + (index % 4) * 0.07)}"/>`;
  }).join("");
  const classOverlay = Array.from({ length: 10 }, (_, index) => {
    const x = 110 + (index * 87) % 790;
    const y = 110 + (index * 59) % 430;
    return `<circle cx="${x}" cy="${y}" r="${10 + (index % 4) * 3}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="0.68" stroke="#ffffff" stroke-width="3"/>`;
  }).join("");
  return `${base}<rect x="42" y="42" width="940" height="588" rx="38" fill="#ecfeff" opacity="0.1"/>${masks}${classOverlay}`;
}

function spatialMapTexture(seed: RealisticAssetSeed): string {
  const tissue = `<path d="${organicBlobPath(520, 338, 398, 238, seed.id.length + 9, 18)}" fill="#f8fafc" opacity="0.66" stroke="#ffffff" stroke-width="12" stroke-opacity="0.55"/><path d="${organicBlobPath(522, 340, 350, 196, seed.id.length + 14, 16)}" fill="${seed.secondary}" opacity="0.13"/>`;
  const spots = Array.from({ length: 176 }, (_, index) => {
    const col = index % 16;
    const row = Math.floor(index / 16);
    const x = 70 + col * 56 + (row % 2) * 27;
    const y = 62 + row * 49;
    const centerBias = Math.max(0, 1 - (Math.abs(x - 520) / 520 + Math.abs(y - 330) / 360) / 1.55);
    const intensity = 0.22 + centerBias * 0.44 + ((col * 3 + row) % 5) * 0.045;
    const fill = (col + row) % 5 === 0 ? "#f8fafc" : (col + row) % 3 ? seed.accent : seed.secondary;
    return `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(10 + centerBias * 8 + ((col + row) % 3) * 1.8)}" fill="${fill}" opacity="${fmt(Math.min(0.92, intensity))}" stroke="#ffffff" stroke-width="2.4" stroke-opacity="0.54"/>`;
  }).join("");
  const roi = `<path d="${organicBlobPath(594, 314, 146, 84, 21, 12)}" fill="none" stroke="#0f172a" stroke-width="5" stroke-opacity="0.42" stroke-dasharray="14 12"/><path d="${organicBlobPath(384, 394, 114, 68, 25, 12)}" fill="none" stroke="${seed.accent}" stroke-width="5" stroke-opacity="0.46"/>`;
  return `${tissue}${spots}${roi}`;
}

function benchTexture(seed: RealisticAssetSeed): string {
  const surface = `<path class="fixture-bench-surface" d="M92 392 C230 338 750 334 932 394 L876 548 C640 602 324 596 134 548 Z" fill="#ffffff" opacity="0.7"/><path d="M118 418 C300 382 698 378 902 420" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" opacity="0.62"/><path d="M168 470 C338 514 706 510 856 466" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity="0.42"/>`;
  const pipette = `<g class="fixture-pipette" transform="rotate(-17 520 314)"><rect x="270" y="268" width="410" height="62" rx="31" fill="#f8fafc" stroke="#ffffff" stroke-width="9"/><rect x="324" y="281" width="218" height="34" rx="17" fill="${seed.accent}" opacity="0.82"/><rect x="352" y="288" width="74" height="20" rx="10" fill="#ffffff" opacity="0.3"/><rect x="636" y="284" width="136" height="30" rx="15" fill="#dbe4ef" stroke="#ffffff" stroke-width="5"/><path class="fixture-pipette-tip" d="M766 299 L912 318 L770 342 Z" fill="#cbd5e1" stroke="#ffffff" stroke-width="5"/><path d="M874 317 L936 326" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" opacity="0.62"/><rect x="204" y="281" width="88" height="34" rx="17" fill="${seed.secondary}" stroke="#ffffff" stroke-width="6"/><circle cx="548" cy="298" r="9" fill="#ffffff" opacity="0.55"/></g>`;
  const tubeRack = Array.from({ length: 6 }, (_, index) => {
    const x = 176 + index * 46;
    return `<rect x="${x}" y="448" width="24" height="92" rx="10" fill="#ffffff" opacity="0.9" stroke="#dbe4ef" stroke-width="2"/><rect x="${x + 3}" y="496" width="18" height="36" rx="8" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="0.62"/><ellipse cx="${x + 12}" cy="${496}" rx="9" ry="4" fill="#ffffff" opacity="0.5"/><rect x="${x - 5}" y="434" width="34" height="18" rx="6" fill="#cbd5e1" opacity="0.95"/>`;
  }).join("");
  const plate = Array.from({ length: 24 }, (_, index) => {
    const col = index % 6;
    const row = Math.floor(index / 6);
    return `<circle cx="${620 + col * 28}" cy="${452 + row * 24}" r="7" fill="${index % 3 ? seed.accent : seed.secondary}" opacity="${fmt(0.3 + (index % 4) * 0.07)}" stroke="#ffffff" stroke-width="1.5"/>`;
  }).join("");
  return `${surface}<ellipse cx="520" cy="516" rx="360" ry="62" fill="#0f172a" opacity="0.07"/>${pipette}<g class="fixture-tube-rack">${tubeRack}<rect x="158" y="524" width="312" height="36" rx="12" fill="#e2e8f0" opacity="0.76"/></g><g class="fixture-assay-plate"><rect x="590" y="424" width="218" height="128" rx="20" fill="#ffffff" opacity="0.8" stroke="#cbd5e1" stroke-width="4"/>${plate}</g>`;
}

function instrumentTexture(seed: RealisticAssetSeed): string {
  if (/biosafety-cabinet/.test(seed.id)) return biosafetyCabinetTexture(seed);
  if (/microscope/.test(seed.id)) return microscopeBenchTexture(seed);
  if (/plate-96/.test(seed.id)) return assayPlateTexture(seed);
  if (/sequencer/.test(seed.id)) return sequencerBayTexture(seed);
  if (/flow-cytometer/.test(seed.id)) return flowCytometerTexture(seed);
  if (/centrifuge/.test(seed.id)) return centrifugeTexture(seed);
  return sequencerBayTexture(seed);
}

function biosafetyCabinetTexture(seed: RealisticAssetSeed): string {
  const grille = Array.from({ length: 12 }, (_, index) => `<rect class="fixture-front-grille" x="${182 + index * 54}" y="468" width="32" height="8" rx="4" fill="#64748b" opacity="0.58"/>`).join("");
  const airflow = Array.from({ length: 9 }, (_, index) => {
    const x = 236 + index * 66;
    return `<path class="fixture-airflow-curtain" d="M${x} 166 C${x - 18} 236 ${x + 20} 308 ${x - 4} 382" fill="none" stroke="${seed.secondary}" stroke-width="4" stroke-linecap="round" opacity="${fmt(0.34 + (index % 3) * 0.07)}"/>`;
  }).join("");
  const workObjects = `<g class="fixture-bsc-work-zone"><rect x="310" y="320" width="118" height="46" rx="14" fill="#ffffff" opacity="0.56" stroke="#cbd5e1" stroke-width="4"/><rect x="332" y="336" width="70" height="12" rx="6" fill="${seed.secondary}" opacity="0.52"/><g transform="rotate(-11 606 322)"><rect x="534" y="308" width="150" height="24" rx="12" fill="#ffffff" opacity="0.68" stroke="#cbd5e1" stroke-width="3"/><path d="M672 320 L760 334 L676 344 Z" fill="#dbe4ef" stroke="#ffffff" stroke-width="3"/></g></g>`;
  return `<g class="fixture-biosafety-cabinet"><ellipse cx="512" cy="546" rx="370" ry="60" fill="#0f172a" opacity="0.11"/><rect x="142" y="116" width="740" height="446" rx="42" fill="#f8fafc" opacity="0.88" stroke="#ffffff" stroke-width="10"/><rect x="182" y="156" width="660" height="276" rx="26" fill="#dbeafe" opacity="0.56" stroke="#ffffff" stroke-width="7"/><rect class="fixture-sash" x="208" y="192" width="608" height="190" rx="22" fill="#ffffff" opacity="0.3" stroke="#93c5fd" stroke-width="5" stroke-opacity="0.34"/><rect x="214" y="214" width="596" height="154" rx="20" fill="#ffffff" opacity="0.32"/>${workObjects}<rect x="182" y="430" width="660" height="76" rx="18" fill="#e2e8f0" opacity="0.82"/><rect x="198" y="486" width="626" height="18" rx="9" fill="#64748b" opacity="0.3"/>${grille}${airflow}<path d="M180 132 H842" stroke="${seed.accent}" stroke-width="16" stroke-linecap="round" opacity="0.66"/><path d="M226 382 H798" stroke="#ffffff" stroke-width="8" opacity="0.72"/><circle cx="780" cy="142" r="22" fill="${seed.accent}" opacity="0.78" stroke="#ffffff" stroke-width="5"/><circle cx="728" cy="142" r="12" fill="${seed.secondary}" opacity="0.72"/></g>`;
}

function microscopeBenchTexture(seed: RealisticAssetSeed): string {
  const objective = Array.from({ length: 3 }, (_, index) => `<rect class="fixture-objective" x="${574 + index * 30}" y="${304 + index * 7}" width="22" height="58" rx="9" fill="${index === 1 ? seed.accent : "#e2e8f0"}" opacity="${fmt(index === 1 ? 0.74 : 0.88)}" stroke="#ffffff" stroke-width="3" transform="rotate(${index * 10 - 9} ${585 + index * 30} ${333 + index * 7})"/>`).join("");
  const slide = `<g class="fixture-microscope-slide"><rect x="366" y="408" width="228" height="36" rx="12" fill="#ffffff" opacity="0.82" stroke="#cbd5e1" stroke-width="4"/><rect x="446" y="418" width="64" height="16" rx="8" fill="${seed.secondary}" opacity="0.46"/><circle cx="476" cy="426" r="5" fill="${seed.accent}" opacity="0.65"/></g>`;
  return `<g class="fixture-microscope"><ellipse cx="520" cy="526" rx="350" ry="64" fill="#0f172a" opacity="0.1"/><rect x="154" y="468" width="724" height="58" rx="20" fill="#ffffff" opacity="0.7"/><path d="M348 438 H708" stroke="#cbd5e1" stroke-width="30" stroke-linecap="round"/><rect class="fixture-stage" x="318" y="438" width="430" height="40" rx="18" fill="#64748b" opacity="0.62"/><rect x="442" y="374" width="214" height="40" rx="16" fill="#ffffff" opacity="0.9" stroke="#cbd5e1" stroke-width="5"/>${slide}<path d="M510 374 C536 316 594 286 652 270" fill="none" stroke="${seed.accent}" stroke-width="46" stroke-linecap="round" opacity="0.78"/><path d="M640 260 L720 190" stroke="#dbe4ef" stroke-width="36" stroke-linecap="round"/><path class="fixture-ocular" d="M696 182 L792 132" stroke="#f8fafc" stroke-width="28" stroke-linecap="round"/><circle cx="496" cy="410" r="62" fill="${seed.secondary}" opacity="0.64" stroke="#ffffff" stroke-width="10"/><circle cx="496" cy="410" r="28" fill="#0f172a" opacity="0.16"/><circle cx="570" cy="294" r="25" fill="#ffffff" opacity="0.66"/>${objective}<path d="M558 362 C532 382 500 394 474 420" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.28"/><rect x="242" y="492" width="560" height="28" rx="14" fill="#cbd5e1" opacity="0.78"/></g>`;
}

function assayPlateTexture(seed: RealisticAssetSeed): string {
  const wells = Array.from({ length: 96 }, (_, index) => {
    const col = index % 12;
    const row = Math.floor(index / 12);
    const x = 196 + col * 54;
    const y = 172 + row * 42;
    const active = (col * 5 + row * 3) % 7;
    const cls = active < 2 ? "fixture-control-well" : "fixture-well";
    return `<circle class="${cls}" cx="${x}" cy="${y}" r="15" fill="${active < 3 ? seed.accent : active < 5 ? seed.secondary : "#f8fafc"}" opacity="${fmt(active < 5 ? 0.42 + active * 0.07 : 0.78)}" stroke="#ffffff" stroke-width="3"/><circle cx="${fmt(x - 4)}" cy="${fmt(y - 4)}" r="4" fill="#ffffff" opacity="0.42"/>`;
  }).join("");
  return `<g class="fixture-assay-plate"><ellipse cx="512" cy="532" rx="374" ry="58" fill="#0f172a" opacity="0.09"/><rect x="128" y="118" width="760" height="438" rx="44" fill="#ffffff" opacity="0.86" stroke="#e2e8f0" stroke-width="8"/><rect x="158" y="142" width="700" height="368" rx="30" fill="#f8fafc" opacity="0.8"/><g class="fixture-well-grid">${wells}</g><path d="M152 520 H864" stroke="#ffffff" stroke-width="12" opacity="0.56"/><path d="M158 142 H858" stroke="${seed.accent}" stroke-width="10" stroke-linecap="round" opacity="0.34"/><circle cx="822" cy="154" r="18" fill="${seed.accent}" opacity="0.7" stroke="#ffffff" stroke-width="4"/></g>`;
}

function sequencerBayTexture(seed: RealisticAssetSeed): string {
  const lanes = Array.from({ length: 7 }, (_, index) => `<rect class="fixture-run-lane" x="${236 + index * 54}" y="402" width="32" height="${48 + (index % 4) * 20}" rx="10" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="${fmt(0.48 + (index % 3) * 0.08)}"/><rect x="${244 + index * 54}" y="412" width="16" height="${26 + (index % 4) * 14}" rx="6" fill="#ffffff" opacity="0.2"/>`).join("");
  const flowCell = `<g class="fixture-flow-cell"><rect x="214" y="180" width="256" height="160" rx="28" fill="${seed.secondary}" opacity="0.56" stroke="#ffffff" stroke-width="7"/><rect x="246" y="214" width="188" height="28" rx="14" fill="#ffffff" opacity="0.52"/><path d="M256 278 C318 230 370 310 432 258" fill="none" stroke="${seed.accent}" stroke-width="9" stroke-linecap="round" opacity="0.7"/></g>`;
  return `<g class="fixture-sequencer"><ellipse cx="512" cy="544" rx="360" ry="64" fill="#0f172a" opacity="0.1"/><rect x="162" y="132" width="700" height="420" rx="48" fill="#ffffff" opacity="0.86" stroke="#e2e8f0" stroke-width="8"/>${flowCell}<rect class="fixture-sequencer-display" x="510" y="178" width="282" height="96" rx="24" fill="#0f172a" opacity="0.86"/><path d="M536 224 H744" stroke="${seed.accent}" stroke-width="12" stroke-linecap="round" opacity="0.78"/><path d="M536 244 H688" stroke="${seed.secondary}" stroke-width="7" stroke-linecap="round" opacity="0.56"/><rect x="508" y="304" width="286" height="166" rx="26" fill="#f8fafc" opacity="0.9" stroke="#cbd5e1" stroke-width="5"/><path d="M234 374 H456" stroke="#94a3b8" stroke-width="18" stroke-linecap="round" opacity="0.7"/>${lanes}<circle cx="804" cy="508" r="22" fill="${seed.accent}" opacity="0.78" stroke="#ffffff" stroke-width="5"/></g>`;
}

function flowCytometerTexture(seed: RealisticAssetSeed): string {
  const dots = Array.from({ length: 42 }, (_, index) => `<circle cx="${218 + (index * 43) % 248}" cy="${190 + (index * 31) % 180}" r="${fmt(4 + (index % 3) * 2)}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="${fmt(0.48 + (index % 4) * 0.05)}"/>`).join("");
  const axes = `<path d="M242 376 H470 M242 376 V206" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" opacity="0.54"/><path d="M278 344 C330 286 382 332 454 234" fill="none" stroke="${seed.accent}" stroke-width="5" stroke-linecap="round" opacity="0.52"/>`;
  return `<g class="fixture-flow-cytometer"><ellipse cx="512" cy="542" rx="346" ry="60" fill="#0f172a" opacity="0.09"/><rect x="176" y="142" width="672" height="400" rx="46" fill="#ffffff" opacity="0.86" stroke="#e2e8f0" stroke-width="8"/><g class="fixture-scatter-screen"><rect x="216" y="178" width="286" height="226" rx="28" fill="#f8fafc" opacity="0.84" stroke="#cbd5e1" stroke-width="5"/>${axes}${dots}</g><path class="fixture-fluidics" d="M540 206 H760" stroke="${seed.accent}" stroke-width="34" stroke-linecap="round" opacity="0.72"/><path class="fixture-fluidics" d="M574 290 H736" stroke="${seed.secondary}" stroke-width="30" stroke-linecap="round" opacity="0.68"/><rect class="fixture-sort-tube" x="590" y="370" width="90" height="116" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="5"/><rect x="602" y="428" width="66" height="40" rx="14" fill="${seed.accent}" opacity="0.56"/><path d="M492 292 C548 304 574 348 618 370" fill="none" stroke="#94a3b8" stroke-width="9" stroke-linecap="round" opacity="0.58"/></g>`;
}

function centrifugeTexture(seed: RealisticAssetSeed): string {
  const wells = Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8;
    const x = 512 + Math.cos(angle) * 112;
    const y = 330 + Math.sin(angle) * 76;
    return `<ellipse class="fixture-rotor-well" cx="${fmt(x)}" cy="${fmt(y)}" rx="28" ry="17" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="0.54" stroke="#ffffff" stroke-width="4" transform="rotate(${fmt((angle * 180) / Math.PI)} ${fmt(x)} ${fmt(y)})"/>`;
  }).join("");
  const rotorLines = Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8;
    const x = 512 + Math.cos(angle) * 84;
    const y = 330 + Math.sin(angle) * 56;
    return `<path d="M512 330 L${fmt(x)} ${fmt(y)}" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" opacity="0.28"/>`;
  }).join("");
  return `<g class="fixture-centrifuge"><ellipse cx="512" cy="546" rx="346" ry="58" fill="#0f172a" opacity="0.09"/><rect x="178" y="158" width="668" height="354" rx="58" fill="#ffffff" opacity="0.84" stroke="#e2e8f0" stroke-width="8"/><ellipse class="fixture-centrifuge-rotor" cx="512" cy="330" rx="228" ry="160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="8"/><ellipse cx="512" cy="330" rx="148" ry="96" fill="#e2e8f0" opacity="0.78"/>${rotorLines}<circle cx="512" cy="330" r="44" fill="${seed.accent}" opacity="0.72" stroke="#ffffff" stroke-width="7"/>${wells}<rect x="246" y="454" width="532" height="34" rx="17" fill="#94a3b8" opacity="0.48"/><circle cx="758" cy="210" r="20" fill="${seed.secondary}" opacity="0.54" stroke="#ffffff" stroke-width="5"/></g>`;
}

function sampleTexture(seed: RealisticAssetSeed): string {
  const tubes = Array.from({ length: 9 }, (_, index) => {
    const x = 176 + index * 76;
    const fill = index % 2 ? seed.secondary : seed.accent;
    const yOffset = (index % 3) * 8;
    return `<g class="fixture-sample-tube" transform="rotate(${(index % 2 ? -2 : 2)} ${x + 24} 330)"><rect x="${x}" y="${138 + yOffset}" width="48" height="300" rx="18" fill="#ffffff" opacity="0.9" stroke="#dbe4ef" stroke-width="3"/><rect x="${x + 6}" y="${276 + yOffset}" width="36" height="${120 - (index % 3) * 10}" rx="13" fill="${fill}" opacity="0.62"/><ellipse cx="${x + 24}" cy="${276 + yOffset}" rx="18" ry="7" fill="#ffffff" opacity="0.62"/><rect x="${x - 9}" y="${112 + yOffset}" width="66" height="36" rx="10" fill="#cbd5e1" stroke="#ffffff" stroke-width="4"/><rect x="${x + 7}" y="${194 + yOffset}" width="34" height="34" rx="7" fill="#f8fafc" opacity="0.86"/></g>`;
  }).join("");
  const rackSlots = Array.from({ length: 9 }, (_, index) => `<ellipse cx="${200 + index * 76}" cy="488" rx="29" ry="12" fill="#94a3b8" opacity="0.28"/>`).join("");
  return `<g class="fixture-sample-rack"><ellipse cx="512" cy="526" rx="390" ry="68" fill="#0f172a" opacity="0.09"/><rect x="128" y="432" width="764" height="74" rx="22" fill="#e2e8f0" opacity="0.9" stroke="#ffffff" stroke-width="8"/><rect x="154" y="456" width="712" height="24" rx="12" fill="#cbd5e1" opacity="0.7"/>${rackSlots}${tubes}<path d="M136 506 C330 552 688 552 884 506" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.46"/></g>`;
}

function spaceBackdrop(seed: RealisticAssetSeed, options: { earth?: boolean; planet?: boolean; orbit?: boolean } = {}): string {
  const stars = Array.from({ length: 96 }, (_, index) => {
    const x = 30 + (index * 97) % 964;
    const y = 24 + (index * 53) % 610;
    const r = 0.8 + (index % 5) * 0.55;
    return `<circle cx="${x}" cy="${y}" r="${fmt(r)}" fill="#ffffff" opacity="${fmt(0.22 + (index % 6) * 0.09)}"/>`;
  }).join("");
  const nebula = `<ellipse cx="282" cy="164" rx="236" ry="118" fill="${seed.secondary}" opacity="0.13"/><ellipse cx="676" cy="256" rx="298" ry="154" fill="${seed.accent}" opacity="0.1"/>`;
  const earth = options.earth === false ? "" : `<g class="fixture-earth-limb"><path d="M-112 596 C156 410 466 400 760 610 L760 708 L-112 708 Z" fill="#0ea5e9" opacity="0.38"/><path d="M-92 614 C188 452 464 454 746 628" fill="none" stroke="#e0f2fe" stroke-width="18" opacity="0.5"/><path d="M122 548 C226 510 308 568 404 530" fill="none" stroke="#22c55e" stroke-width="22" opacity="0.34"/></g>`;
  const planet = options.planet ? `<g class="fixture-orbital-planet"><circle cx="812" cy="166" r="110" fill="${seed.secondary}" opacity="0.48"/><path d="M704 196 C758 134 862 136 916 196" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.28"/></g>` : "";
  const orbit = options.orbit === false ? "" : `<path class="fixture-orbit" d="M152 438 C326 238 656 226 878 392" fill="none" stroke="${seed.accent}" stroke-width="10" stroke-dasharray="20 18" opacity="0.5"/>`;
  return `${stars}${nebula}${earth}${planet}${orbit}`;
}

function spacecraftContextTexture(seed: RealisticAssetSeed): string {
  const panels = Array.from({ length: 9 }, (_, index) => {
    const x = 166 + index * 38;
    return `<rect x="${x}" y="282" width="28" height="74" rx="6" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="${fmt(0.34 + (index % 3) * 0.08)}" stroke="#ffffff" stroke-width="2" stroke-opacity="0.28"/>`;
  }).join("");
  const starboardPanels = Array.from({ length: 8 }, (_, index) => {
    const x = 702 + index * 35;
    return `<rect x="${x}" y="286" width="26" height="68" rx="6" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="${fmt(0.32 + (index % 3) * 0.07)}" stroke="#ffffff" stroke-width="2" stroke-opacity="0.26"/>`;
  }).join("");
  const craft = `<g class="fixture-spacecraft" transform="rotate(6 514 320)">
    <ellipse cx="514" cy="360" rx="300" ry="54" fill="#020617" opacity="0.16"/>
    <g class="fixture-solar-panel" transform="skewY(-4)">${panels}<rect x="150" y="268" width="372" height="104" rx="14" fill="#dbeafe" opacity="0.18" stroke="#ffffff" stroke-width="4" stroke-opacity="0.24"/></g>
    <g class="fixture-solar-panel" transform="skewY(4)">${starboardPanels}<rect x="688" y="272" width="320" height="96" rx="14" fill="#dbeafe" opacity="0.16" stroke="#ffffff" stroke-width="4" stroke-opacity="0.24"/></g>
    <rect x="388" y="244" width="276" height="132" rx="34" fill="#f8fafc" opacity="0.9" stroke="#ffffff" stroke-width="7"/>
    <rect x="434" y="270" width="76" height="54" rx="16" fill="${seed.accent}" opacity="0.68"/>
    <rect x="528" y="268" width="84" height="58" rx="18" fill="#0f172a" opacity="0.56"/>
    <circle cx="570" cy="296" r="20" fill="#e0f2fe" opacity="0.82" stroke="#ffffff" stroke-width="5"/>
    <path d="M388 312 C332 292 292 318 244 284 M664 306 C728 286 772 314 842 276" fill="none" stroke="#e2e8f0" stroke-width="15" stroke-linecap="round"/>
    <rect x="464" y="346" width="128" height="22" rx="11" fill="${seed.secondary}" opacity="0.54"/>
  </g>`;
  const missionCues = `<g class="fixture-mission-cue"><circle cx="132" cy="132" r="34" fill="#ffffff" opacity="0.22" stroke="${seed.accent}" stroke-width="5"/><path d="M116 132 H148 M132 116 V148" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.64"/></g>`;
  return `${spaceBackdrop(seed, { planet: true })}${craft}${missionCues}`;
}

function astronautSampleTexture(seed: RealisticAssetSeed): string {
  const sampleDrops = Array.from({ length: 22 }, (_, index) => {
    const x = 124 + (index * 73) % 772;
    const y = 94 + (index * 47) % 420;
    return `<circle cx="${x}" cy="${y}" r="${fmt(3 + (index % 4) * 1.8)}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="${fmt(0.28 + (index % 4) * 0.07)}"/>`;
  }).join("");
  const astronaut = `<g class="fixture-astronaut" transform="translate(92 32)">
    <ellipse cx="398" cy="472" rx="226" ry="42" fill="#020617" opacity="0.14"/>
    <path d="M322 242 C312 186 348 128 420 126 C492 124 534 178 526 242 C518 310 482 344 424 344 C366 344 330 310 322 242 Z" fill="#f8fafc" stroke="#ffffff" stroke-width="10" opacity="0.92"/>
    <ellipse cx="424" cy="218" rx="78" ry="64" fill="#0f172a" opacity="0.58" stroke="#dbeafe" stroke-width="9"/>
    <path d="M372 198 C404 170 458 174 482 202" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.35"/>
    <path d="M318 334 C254 348 224 390 190 448" fill="none" stroke="#f8fafc" stroke-width="42" stroke-linecap="round" opacity="0.9"/>
    <path d="M530 334 C600 346 644 394 690 448" fill="none" stroke="#f8fafc" stroke-width="42" stroke-linecap="round" opacity="0.9"/>
    <circle cx="188" cy="452" r="34" fill="#ffffff" opacity="0.9" stroke="#dbeafe" stroke-width="7"/>
    <circle cx="692" cy="452" r="34" fill="#ffffff" opacity="0.9" stroke="#dbeafe" stroke-width="7"/>
    <rect x="318" y="338" width="218" height="146" rx="38" fill="#f8fafc" opacity="0.92" stroke="#ffffff" stroke-width="9"/>
    <rect x="356" y="372" width="142" height="56" rx="18" fill="${seed.accent}" opacity="0.58"/>
    <path d="M214 442 C312 426 472 430 660 448" fill="none" stroke="${seed.secondary}" stroke-width="9" stroke-linecap="round" opacity="0.56"/>
  </g>`;
  const sampleTube = `<g class="fixture-crew-sample fixture-sample-tube" transform="rotate(-9 716 382)">
    <rect x="696" y="260" width="60" height="186" rx="20" fill="#ffffff" opacity="0.9" stroke="#e2e8f0" stroke-width="5"/>
    <rect x="704" y="344" width="44" height="72" rx="15" fill="${seed.accent}" opacity="0.55"/>
    <ellipse cx="726" cy="344" rx="21" ry="7" fill="#ffffff" opacity="0.56"/>
    <rect x="684" y="234" width="82" height="36" rx="12" fill="#cbd5e1" stroke="#ffffff" stroke-width="4"/>
    <rect x="706" y="298" width="40" height="36" rx="8" fill="#f8fafc" opacity="0.86"/>
  </g>`;
  const label = `<g class="fixture-sample-label"><rect x="104" y="106" width="226" height="48" rx="18" fill="#ffffff" opacity="0.22"/><text x="126" y="136" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" opacity="0.78">crew sample</text></g>`;
  return `${spaceBackdrop(seed, { planet: false })}${sampleDrops}${astronaut}${sampleTube}${label}`;
}

function spaceflightAssayTexture(seed: RealisticAssetSeed): string {
  const rackTubes = Array.from({ length: 7 }, (_, index) => {
    const x = 232 + index * 62;
    const fill = index % 2 ? seed.secondary : seed.accent;
    return `<g class="fixture-sample-tube" transform="rotate(${index % 2 ? -3 : 3} ${x + 22} 342)"><rect x="${x}" y="196" width="44" height="190" rx="16" fill="#ffffff" opacity="0.88" stroke="#e2e8f0" stroke-width="4"/><rect x="${x + 6}" y="${282 - (index % 3) * 10}" width="32" height="${84 + (index % 3) * 8}" rx="12" fill="${fill}" opacity="0.5"/><rect x="${x - 8}" y="170" width="60" height="32" rx="10" fill="#cbd5e1" stroke="#ffffff" stroke-width="4"/></g>`;
  }).join("");
  const assayChip = Array.from({ length: 36 }, (_, index) => {
    const col = index % 9;
    const row = Math.floor(index / 9);
    return `<rect x="${590 + col * 30}" y="${222 + row * 30}" width="18" height="18" rx="5" fill="${(col + row) % 3 ? seed.accent : seed.secondary}" opacity="${fmt(0.25 + ((col + row) % 4) * 0.08)}" stroke="#ffffff" stroke-width="1.4"/>`;
  }).join("");
  const flightAssay = `<g class="fixture-flight-assay">
    <ellipse cx="510" cy="536" rx="360" ry="62" fill="#020617" opacity="0.12"/>
    <rect x="164" y="406" width="390" height="76" rx="26" fill="#e2e8f0" opacity="0.86" stroke="#ffffff" stroke-width="8"/>
    <rect x="190" y="430" width="338" height="24" rx="12" fill="#cbd5e1" opacity="0.66"/>
    ${rackTubes}
    <rect x="560" y="178" width="324" height="232" rx="36" fill="#ffffff" opacity="0.82" stroke="#e2e8f0" stroke-width="7"/>
    <rect x="586" y="206" width="272" height="154" rx="24" fill="#f8fafc" opacity="0.72"/>
    ${assayChip}
    <path d="M618 386 H830" stroke="${seed.secondary}" stroke-width="14" stroke-linecap="round" opacity="0.56"/>
    <circle cx="836" cy="196" r="26" fill="${seed.accent}" opacity="0.6" stroke="#ffffff" stroke-width="6"/>
  </g>`;
  const arrows = `<g class="fixture-microgravity-assay-cues"><path d="M166 160 C262 102 368 104 438 172" fill="none" stroke="#ffffff" stroke-width="7" stroke-dasharray="14 13" opacity="0.36"/><path d="M424 158 l30 18 l-30 18" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.48"/></g>`;
  return `${spaceBackdrop(seed, { earth: false, planet: true })}${flightAssay}${arrows}`;
}

function genelabDataContextTexture(seed: RealisticAssetSeed): string {
  const heatmap = Array.from({ length: 56 }, (_, index) => {
    const col = index % 8;
    const row = Math.floor(index / 8);
    const fill = (col + row) % 4 === 0 ? seed.accent : (col + row) % 3 === 0 ? seed.secondary : "#dbeafe";
    return `<rect x="${582 + col * 27}" y="${216 + row * 24}" width="19" height="16" rx="4" fill="${fill}" opacity="${fmt(0.32 + ((col * 2 + row) % 5) * 0.08)}"/>`;
  }).join("");
  const tracks = Array.from({ length: 8 }, (_, index) => {
    const y = 178 + index * 34;
    const widthA = 116 + (index % 4) * 38;
    const widthB = 68 + (index % 5) * 28;
    return `<g class="fixture-data-track"><rect x="178" y="${y}" width="292" height="17" rx="8" fill="#e2e8f0" opacity="0.72"/><rect x="178" y="${y}" width="${widthA}" height="17" rx="8" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="0.55"/><rect x="${486 - widthB}" y="${y}" width="${widthB}" height="17" rx="8" fill="#ffffff" opacity="0.52"/></g>`;
  }).join("");
  const network = Array.from({ length: 12 }, (_, index) => {
    const x = 206 + (index * 71) % 250;
    const y = 466 + (index * 43) % 94;
    const x2 = 194 + ((index + 3) * 71) % 260;
    const y2 = 466 + ((index + 5) * 43) % 94;
    return `<path d="M${x} ${y} L${x2} ${y2}" stroke="${seed.secondary}" stroke-width="2.4" opacity="0.26"/><circle cx="${x}" cy="${y}" r="${5 + (index % 3) * 2}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="0.58" stroke="#ffffff" stroke-width="1.6"/>`;
  }).join("");
  const dashboard = `<g class="fixture-genelab">
    <ellipse cx="512" cy="548" rx="380" ry="62" fill="#020617" opacity="0.1"/>
    <rect x="126" y="112" width="772" height="458" rx="42" fill="#ffffff" opacity="0.82" stroke="#e2e8f0" stroke-width="8"/>
    <rect x="158" y="144" width="706" height="60" rx="20" fill="#0f172a" opacity="0.82"/>
    <rect x="182" y="164" width="196" height="22" rx="11" fill="${seed.accent}" opacity="0.72"/>
    <circle cx="816" cy="174" r="15" fill="${seed.secondary}" opacity="0.76"/>
    <rect x="160" y="224" width="350" height="184" rx="26" fill="#f8fafc" opacity="0.86" stroke="#dbe4f0" stroke-width="4"/>
    ${tracks}
    <rect x="548" y="224" width="282" height="218" rx="28" fill="#f8fafc" opacity="0.86" stroke="#dbe4f0" stroke-width="4"/>
    <g class="fixture-omics-heatmap">${heatmap}</g>
    <rect x="160" y="438" width="350" height="100" rx="26" fill="#f8fafc" opacity="0.84" stroke="#dbe4f0" stroke-width="4"/>
    ${network}
    <path d="M576 500 C638 448 698 534 768 482 S834 472 858 442" fill="none" stroke="${seed.accent}" stroke-width="9" stroke-linecap="round" opacity="0.58"/>
    <circle cx="698" cy="534" r="15" fill="#ffffff" stroke="${seed.accent}" stroke-width="6"/>
  </g>`;
  const missionBadge = `<g class="fixture-mission-data-badge"><rect x="672" y="96" width="178" height="44" rx="18" fill="#ffffff" opacity="0.2"/><text x="694" y="124" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="850" opacity="0.76">GeneLab</text></g>`;
  return `${spaceBackdrop(seed, { earth: false, planet: false, orbit: false })}${dashboard}${missionBadge}`;
}

function cellsTexture(seed: RealisticAssetSeed): string {
  if (/organoid/.test(seed.id)) return organoidTexture(seed);
  if (/pathogen/.test(seed.id)) return pathogenParticleTexture(seed);
  const matrix = Array.from({ length: 22 }, (_, index) => {
    const x = 82 + (index * 111) % 850;
    const y = 90 + (index * 61) % 480;
    return `<path d="M${x},${y} C${x + 74},${y - 48} ${x + 126},${y + 58} ${x + 206},${y + (index % 2 ? -14 : 24)}" fill="none" stroke="${index % 2 ? seed.secondary : "#ffffff"}" stroke-width="${fmt(1.7 + (index % 4) * 0.8)}" stroke-linecap="round" opacity="${fmt(0.16 + (index % 3) * 0.06)}"/>`;
  }).join("");
  const cells = Array.from({ length: 66 }, (_, index) => {
    const x = 58 + (index * 113) % 906;
    const y = 56 + (index * 67) % 552;
    const rx = 20 + (index % 5) * 7;
    const ry = 16 + (index % 4) * 6;
    return fixtureCell(seed, x, y, rx, ry, index, 0.36 + (index % 4) * 0.05);
  }).join("");
  const immuneSpots = Array.from({ length: /immune|tumor/.test(seed.id) ? 36 : 18 }, (_, index) => {
    const x = 70 + (index * 149) % 884;
    const y = 68 + (index * 97) % 536;
    return `<circle cx="${x}" cy="${y}" r="${fmt(5 + (index % 4) * 2.4)}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="0.62" stroke="#ffffff" stroke-width="1.6"/>`;
  }).join("");
  return `${matrix}${cells}${immuneSpots}`;
}

function cellClusterTexture(seed: RealisticAssetSeed): string {
  const regions = [
    { x: 292, y: 228, rx: 142, ry: 94, color: seed.secondary },
    { x: 548, y: 310, rx: 184, ry: 118, color: seed.accent },
    { x: 720, y: 450, rx: 136, ry: 86, color: "#f8fafc" },
    { x: 364, y: 462, rx: 128, ry: 78, color: seed.secondary }
  ];
  const density = regions.map((region, index) => `<path class="fixture-cell-density" d="${organicBlobPath(region.x, region.y, region.rx, region.ry, index + 4, 15)}" fill="${region.color}" opacity="${fmt(0.11 + index * 0.025)}" stroke="#ffffff" stroke-width="${fmt(4 + index)}" stroke-opacity="0.14"/>`).join("");
  const matrix = Array.from({ length: 28 }, (_, index) => {
    const x = 64 + (index * 87) % 874;
    const y = 82 + (index * 59) % 502;
    const sag = index % 2 ? -30 : 36;
    return `<path class="fixture-matrix-fiber" d="M${x},${y} C${x + 76},${y - 50} ${x + 156},${y + sag} ${x + 248},${y + (index % 3 - 1) * 22}" fill="none" stroke="${index % 3 === 0 ? "#ffffff" : index % 3 === 1 ? seed.secondary : seed.accent}" stroke-width="${fmt(1.8 + (index % 5) * 0.6)}" stroke-linecap="round" opacity="${fmt(0.13 + (index % 4) * 0.045)}"/>`;
  }).join("");
  const cells = Array.from({ length: 72 }, (_, index) => {
    const region = regions[index % regions.length];
    const angle = ((index * 137) % 360) * Math.PI / 180;
    const radius = 18 + (index % 8) * 10 + Math.floor(index / 9) * 3;
    const x = region.x + Math.cos(angle) * radius * (0.7 + (index % 4) * 0.18);
    const y = region.y + Math.sin(angle) * radius * (0.54 + (index % 5) * 0.12);
    const rx = 17 + (index % 5) * 5;
    const ry = 14 + (index % 4) * 4;
    return fixtureCell(seed, x, y, rx, ry, index, 0.42 + (index % 4) * 0.045);
  }).join("");
  const nuclei = Array.from({ length: 92 }, (_, index) => {
    const x = 72 + (index * 109) % 884;
    const y = 76 + (index * 71) % 518;
    return `<ellipse cx="${x}" cy="${y}" rx="${fmt(3.4 + (index % 3) * 1.4)}" ry="${fmt(2.4 + (index % 4) * 1.1)}" fill="#ffffff" opacity="${fmt(0.18 + (index % 5) * 0.04)}" transform="rotate(${(index * 29) % 180} ${x} ${y})"/>`;
  }).join("");
  return `<g class="fixture-cell-cluster"><ellipse cx="512" cy="540" rx="374" ry="62" fill="#020617" opacity="0.07"/>${density}${matrix}${cells}${nuclei}<path d="M158 154 C268 82 390 118 504 188 S750 208 866 132" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.15"/></g>`;
}

function tumorMicroenvironmentTexture(seed: RealisticAssetSeed): string {
  const tumorCenters = [
    { x: 356, y: 296, rx: 154, ry: 118 },
    { x: 586, y: 350, rx: 190, ry: 132 },
    { x: 714, y: 206, rx: 112, ry: 78 }
  ];
  const stroma = Array.from({ length: 34 }, (_, index) => {
    const x = 72 + (index * 79) % 874;
    const y = 96 + (index * 61) % 474;
    return `<path class="fixture-stroma-fiber" d="M${x},${y} C${x + 88},${y - 42} ${x + 138},${y + 72} ${x + 240},${y + (index % 2 ? -20 : 28)}" fill="none" stroke="${index % 3 === 0 ? "#ffffff" : index % 3 === 1 ? "#fda4af" : seed.secondary}" stroke-width="${fmt(2.2 + (index % 4) * 0.9)}" stroke-linecap="round" opacity="${fmt(0.14 + (index % 5) * 0.035)}"/>`;
  }).join("");
  const tumorIslands = tumorCenters.map((center, index) => {
    const body = `<path d="${organicBlobPath(center.x, center.y, center.rx, center.ry, index + 12, 18)}" fill="${seed.accent}" opacity="${fmt(0.36 + index * 0.03)}" stroke="#ffffff" stroke-width="${fmt(8 + index * 2)}" stroke-opacity="0.42"/>`;
    const necroticCore = `<path d="${organicBlobPath(center.x + 14, center.y - 8, center.rx * 0.42, center.ry * 0.32, index + 26, 13)}" fill="#7f1d1d" opacity="0.22"/><path d="${organicBlobPath(center.x - 24, center.y + 18, center.rx * 0.28, center.ry * 0.24, index + 34, 11)}" fill="#ffffff" opacity="0.16"/>`;
    const nuclei = Array.from({ length: 18 }, (_, cellIndex) => {
      const angle = ((cellIndex * 113 + index * 31) % 360) * Math.PI / 180;
      const r = 12 + (cellIndex % 5) * 12;
      const x = center.x + Math.cos(angle) * r * 1.25;
      const y = center.y + Math.sin(angle) * r * 0.82;
      return `<ellipse cx="${fmt(x)}" cy="${fmt(y)}" rx="${fmt(5 + (cellIndex % 3) * 1.6)}" ry="${fmt(3.2 + (cellIndex % 2) * 1.1)}" fill="#ffffff" opacity="${fmt(0.22 + (cellIndex % 4) * 0.035)}" transform="rotate(${(cellIndex * 41) % 180} ${fmt(x)} ${fmt(y)})"/>`;
    }).join("");
    return `<g class="fixture-tumor-island">${body}${necroticCore}${nuclei}</g>`;
  }).join("");
  const immuneEdge = Array.from({ length: 72 }, (_, index) => {
    const angle = ((index * 47) % 360) * Math.PI / 180;
    const radiusX = 306 + (index % 6) * 16;
    const radiusY = 192 + (index % 5) * 12;
    const x = 526 + Math.cos(angle) * radiusX;
    const y = 330 + Math.sin(angle) * radiusY;
    const fill = index % 3 === 0 ? "#22c55e" : index % 3 === 1 ? seed.secondary : "#60a5fa";
    return `<circle class="fixture-immune-edge" cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(6 + (index % 4) * 2.2)}" fill="${fill}" opacity="${fmt(0.48 + (index % 4) * 0.06)}" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.66"/>`;
  }).join("");
  const vessel = `<g class="fixture-vessel"><path d="M120 498 C264 410 376 526 526 442 S770 384 910 474" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" opacity="0.26"/><path d="M122 498 C264 410 376 526 526 442 S770 384 910 474" fill="none" stroke="#ef4444" stroke-width="15" stroke-linecap="round" opacity="0.34"/><circle cx="356" cy="474" r="15" fill="#ffffff" opacity="0.28"/></g>`;
  return `<g class="fixture-tumor-microenvironment"><ellipse cx="512" cy="548" rx="388" ry="58" fill="#020617" opacity="0.08"/>${stroma}${tumorIslands}${immuneEdge}${vessel}<rect x="78" y="88" width="868" height="496" rx="46" fill="none" stroke="#ffffff" stroke-width="6" stroke-opacity="0.16" stroke-dasharray="18 16"/></g>`;
}

function immuneInfiltrateTexture(seed: RealisticAssetSeed): string {
  const chemokineField = Array.from({ length: 6 }, (_, index) => {
    const x = 170 + index * 116;
    return `<path class="fixture-chemokine-field" d="${organicBlobPath(x + 42, 308 + (index % 2) * 44, 118 + index * 10, 88 + (index % 3) * 10, index + 9, 14)}" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="${fmt(0.08 + index * 0.012)}"/>`;
  }).join("");
  const barrier = `<g class="fixture-tissue-interface"><path d="M82 426 C186 348 282 396 386 328 S590 280 706 336 S838 374 942 286" fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round" opacity="0.18"/><path d="M82 426 C186 348 282 396 386 328 S590 280 706 336 S838 374 942 286" fill="none" stroke="${seed.secondary}" stroke-width="8" stroke-linecap="round" opacity="0.38"/></g>`;
  const tCells = Array.from({ length: 74 }, (_, index) => {
    const x = 82 + (index * 127) % 868;
    const y = 72 + (index * 83) % 530;
    const r = 7 + (index % 5) * 2.4;
    return `<g class="fixture-t-cell"><circle cx="${x}" cy="${y}" r="${fmt(r)}" fill="${seed.accent}" opacity="${fmt(0.46 + (index % 4) * 0.06)}" stroke="#ffffff" stroke-width="1.8"/><circle cx="${fmt(x - r * 0.18)}" cy="${fmt(y - r * 0.15)}" r="${fmt(r * 0.36)}" fill="#ffffff" opacity="0.32"/></g>`;
  }).join("");
  const myeloid = Array.from({ length: 18 }, (_, index) => {
    const x = 130 + (index * 173) % 768;
    const y = 112 + (index * 97) % 430;
    const rx = 24 + (index % 4) * 5;
    const ry = 18 + (index % 3) * 6;
    return `<g class="fixture-myeloid-cell">${fixtureCell(seed, x, y, rx, ry, index + 30, 0.46)}<path d="M${fmt(x - rx * 0.26)} ${fmt(y)} C${fmt(x - rx * 0.1)} ${fmt(y - ry * 0.34)} ${fmt(x + rx * 0.12)} ${fmt(y + ry * 0.24)} ${fmt(x + rx * 0.28)} ${fmt(y - ry * 0.08)}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.38"/></g>`;
  }).join("");
  const arrows = Array.from({ length: 7 }, (_, index) => {
    const y = 182 + index * 48;
    const x = 118 + (index % 2) * 42;
    return `<path class="fixture-infiltration-arrow" d="M${x} ${y} C${x + 96} ${y - 20} ${x + 166} ${y + 34} ${x + 250} ${y + 2}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="${fmt(0.22 + (index % 3) * 0.06)}"/><path d="M${x + 238} ${y - 10} l22 13 l-24 11" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="${fmt(0.24 + (index % 3) * 0.06)}"/>`;
  }).join("");
  return `<g class="fixture-immune-infiltrate"><ellipse cx="512" cy="548" rx="378" ry="58" fill="#020617" opacity="0.07"/>${chemokineField}${barrier}${arrows}${myeloid}${tCells}${fixturePuncta(seed, 58, 0.38)}</g>`;
}

function organoidTexture(seed: RealisticAssetSeed): string {
  const spheroids = Array.from({ length: 7 }, (_, index) => {
    const x = 220 + (index * 119) % 610;
    const y = 176 + (index * 73) % 330;
    const rx = 74 + (index % 3) * 18;
    const ry = 58 + (index % 4) * 12;
    const outer = `<path d="${organicBlobPath(x, y, rx, ry, index + 8, 15)}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="0.34" stroke="#ffffff" stroke-width="8" stroke-opacity="0.48"/>`;
    const inner = `<path d="${organicBlobPath(x - 8, y - 4, rx * 0.58, ry * 0.52, index + 14, 12)}" fill="#ffffff" opacity="0.26"/><path d="${organicBlobPath(x + 12, y + 10, rx * 0.34, ry * 0.3, index + 22, 10)}" fill="${index % 2 ? seed.secondary : seed.accent}" opacity="0.24"/>`;
    return `<g class="fixture-organoid">${outer}${inner}</g>`;
  }).join("");
  const microCells = Array.from({ length: 84 }, (_, index) => {
    const x = 92 + (index * 97) % 838;
    const y = 84 + (index * 61) % 506;
    return `<circle cx="${x}" cy="${y}" r="${fmt(2.6 + (index % 4) * 1.2)}" fill="#ffffff" opacity="${fmt(0.18 + (index % 5) * 0.04)}"/>`;
  }).join("");
  return `<ellipse cx="512" cy="540" rx="360" ry="58" fill="#0f172a" opacity="0.06"/>${spheroids}${microCells}<path d="M182 458 C302 522 706 524 850 448" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.18"/>`;
}

function pathogenParticleTexture(seed: RealisticAssetSeed): string {
  const particles = Array.from({ length: 24 }, (_, index) => {
    const x = 82 + (index * 131) % 860;
    const y = 78 + (index * 89) % 510;
    const r = 18 + (index % 5) * 6;
    const spikes = Array.from({ length: 10 }, (_, spikeIndex) => {
      const angle = (Math.PI * 2 * spikeIndex) / 10;
      const x1 = x + Math.cos(angle) * (r * 0.82);
      const y1 = y + Math.sin(angle) * (r * 0.82);
      const x2 = x + Math.cos(angle) * (r * 1.26);
      const y2 = y + Math.sin(angle) * (r * 1.26);
      return `<path d="M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}" stroke="${seed.secondary}" stroke-width="3" stroke-linecap="round" opacity="0.48"/>`;
    }).join("");
    return `<g class="fixture-pathogen">${spikes}<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 2 ? seed.accent : seed.secondary}" opacity="0.42" stroke="#ffffff" stroke-width="4"/><circle cx="${fmt(x - r * 0.2)}" cy="${fmt(y - r * 0.18)}" r="${fmt(r * 0.28)}" fill="#ffffff" opacity="0.34"/></g>`;
  }).join("");
  const riskField = `<rect x="80" y="88" width="864" height="496" rx="44" fill="#7f1d1d" opacity="0.08" stroke="${seed.accent}" stroke-width="6" stroke-dasharray="20 16" stroke-opacity="0.34"/>`;
  return `${riskField}${particles}${fixturePuncta(seed, 80, 0.44)}`;
}

function spaceTexture(seed: RealisticAssetSeed): string {
  const stars = Array.from({ length: 88 }, (_, index) => `<circle cx="${36 + (index * 97) % 952}" cy="${28 + (index * 53) % 602}" r="${fmt(0.9 + (index % 4) * 0.7)}" fill="#ffffff" opacity="${fmt(0.24 + (index % 5) * 0.11)}"/>`).join("");
  const earth = `<path d="M-90 592 C162 418 454 404 742 606 L742 706 L-90 706 Z" fill="#0ea5e9" opacity="0.38"/><path d="M-80 610 C190 452 456 456 730 622" fill="none" stroke="#e0f2fe" stroke-width="18" opacity="0.48"/><path d="M126 546 C220 512 304 566 392 530" fill="none" stroke="#22c55e" stroke-width="22" opacity="0.32"/>`;
  const planet = `<circle cx="792" cy="178" r="116" fill="${seed.secondary}" opacity="0.54"/><path d="M692 206 C746 144 854 142 900 202" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.3"/>`;
  const orbit = `<path d="M176 432 C342 258 646 244 842 380" fill="none" stroke="${seed.accent}" stroke-width="12" stroke-dasharray="22 18" opacity="0.52"/>`;
  const craft = `<g class="fixture-spacecraft" transform="rotate(8 468 318)"><rect x="320" y="260" width="236" height="118" rx="28" fill="#ffffff" opacity="0.86" stroke="#cbd5e1" stroke-width="6"/><rect x="358" y="286" width="72" height="46" rx="14" fill="${seed.accent}" opacity="0.68"/><rect x="570" y="286" width="150" height="50" rx="16" fill="${seed.secondary}" opacity="0.64"/><path d="M304 318 L212 264 M304 326 L210 382 M724 312 L826 268 M724 330 L826 386" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/><circle cx="470" cy="320" r="24" fill="#0f172a" opacity="0.58"/></g>`;
  const sample = /sample|assay/.test(seed.id) ? `<g class="fixture-space-sample"><rect x="652" y="426" width="54" height="132" rx="18" fill="#ffffff" opacity="0.84"/><rect x="660" y="484" width="38" height="48" rx="12" fill="${seed.accent}" opacity="0.52"/><rect x="644" y="398" width="70" height="34" rx="10" fill="#cbd5e1"/></g>` : "";
  return `${stars}${earth}${planet}${orbit}${craft}${sample}`;
}

function dataPanelTexture(seed: RealisticAssetSeed): string {
  return `<rect x="126" y="112" width="772" height="442" rx="36" fill="#ffffff" opacity="0.78"/><rect x="170" y="164" width="240" height="48" rx="14" fill="${seed.accent}" opacity="0.68"/><rect x="170" y="242" width="668" height="44" rx="12" fill="#e2e8f0"/><rect x="170" y="314" width="528" height="44" rx="12" fill="${seed.secondary}" opacity="0.8"/><path d="M184 468 C298 388 390 504 512 424 S708 404 826 336" fill="none" stroke="${seed.accent}" stroke-width="14" stroke-linecap="round"/><circle cx="512" cy="424" r="24" fill="#ffffff" stroke="${seed.accent}" stroke-width="10"/>`;
}

function proteinGelTexture(seed: RealisticAssetSeed): string {
  const lanes = Array.from({ length: 8 }, (_, index) => {
    const x = 232 + index * 66;
    const laneOpacity = 0.24 + (index % 3) * 0.04;
    const bands = [0, 1, 2, 3].map((bandIndex) => {
      const y = 210 + bandIndex * 72 + ((index * 17 + bandIndex * 19) % 28);
      const width = 34 + ((index + bandIndex * 2) % 4) * 12;
      const height = 10 + ((index + bandIndex) % 3) * 4;
      const bandOpacity = 0.48 + ((index * 3 + bandIndex) % 5) * 0.075;
      return `<rect class="fixture-protein-band" x="${fmt(x + 22 - width / 2)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="${fmt(height / 2)}" fill="${seed.accent}" opacity="${fmt(Math.min(0.86, bandOpacity))}"/><rect x="${fmt(x + 20 - width / 2)}" y="${fmt(y - 1)}" width="${fmt(width + 4)}" height="${fmt(height + 2)}" rx="${fmt((height + 2) / 2)}" fill="#ffffff" opacity="0.09"/>`;
    }).join("");
    return `<g class="fixture-gel-lane"><rect x="${x}" y="154" width="44" height="308" rx="12" fill="#ffffff" opacity="${fmt(laneOpacity)}"/><rect x="${x + 4}" y="164" width="36" height="286" rx="9" fill="#0f172a" opacity="0.035"/><path d="M${x + 4} 164 V452" stroke="#0f172a" stroke-width="2" opacity="0.08"/>${bands}</g>`;
  }).join("");
  const ladder = Array.from({ length: 7 }, (_, index) => {
    const y = 184 + index * 42;
    const width = 58 - index * 4;
      return `<rect class="fixture-ladder" x="${fmt(164 + (58 - width) / 2)}" y="${y}" width="${width}" height="9" rx="4.5" fill="${seed.accent}" opacity="${fmt(0.68 - index * 0.042)}"/>`;
  }).join("");
  const exposure = Array.from({ length: 5 }, (_, index) => `<path d="${organicBlobPath(392 + index * 84, 298 + (index % 2) * 44, 84, 34, index + 12, 12)}" fill="#0f172a" opacity="${fmt(0.025 + index * 0.008)}"/>`).join("");
  const labels = `<g class="fixture-gel-labels" opacity="0.62"><rect x="150" y="486" width="86" height="28" rx="10" fill="#ffffff" opacity="0.72"/><rect x="304" y="486" width="138" height="28" rx="10" fill="#ffffff" opacity="0.52"/><rect x="610" y="486" width="150" height="28" rx="10" fill="#ffffff" opacity="0.52"/><path d="M166 128 H818" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.5"/></g>`;
  return `<g class="fixture-protein-gel"><ellipse cx="512" cy="546" rx="360" ry="60" fill="#020617" opacity="0.08"/><rect x="128" y="104" width="768" height="452" rx="38" fill="#f8fafc" opacity="0.88" stroke="#ffffff" stroke-width="8"/><rect x="152" y="134" width="720" height="340" rx="26" fill="#cbd5e1" opacity="0.94" stroke="#ffffff" stroke-width="5"/><rect x="158" y="142" width="708" height="322" rx="22" fill="#0f172a" opacity="0.075"/>${exposure}<g class="fixture-ladder-track"><rect x="142" y="154" width="96" height="308" rx="14" fill="#ffffff" opacity="0.36"/>${ladder}</g>${lanes}<path d="M152 246 H866 M152 354 H866" stroke="#ffffff" stroke-width="3" opacity="0.25"/>${labels}<circle cx="834" cy="130" r="20" fill="${seed.secondary}" opacity="0.54" stroke="#ffffff" stroke-width="5"/></g>`;
}

function qualityTierFor(seed: AssetSeed): AssetQualityTier {
  if (SIGNATURE_ASSET_IDS.has(seed.id) && isHeroAsset(seed.id)) return "signature";
  if (isHeroAsset(seed.id)) return "hero";
  if (/edge|label|stamp|blocked|safe-completion/.test(seed.id)) return "utility";
  return "standard";
}

function styleProfilesFor(seed: AssetSeed): AssetStyleProfile[] {
  const profiles = new Set<AssetStyleProfile>(DEFAULT_STYLE_PROFILES);
  if (seed.visualRole === "risk" || (seed.riskDomain ?? []).length) profiles.add("risk-warning");
  if (seed.family === "pathway" || seed.family === "molecule" || seed.family === "metricPanel") profiles.add("publication-line");
  return [...profiles];
}

function semanticSlotsFor(seed: AssetSeed, workflowPacks: string[]): string[] {
  const slots = new Set<string>();
  const text = `${seed.id} ${seed.name} ${seed.tags.join(" ")}`.toLowerCase();
  if (/sample|cell|tissue|cohort|organoid|mouse|astronaut/.test(text)) slots.add("input-sample");
  if (/cell|tumor|immune|neuron|state|cluster/.test(text)) slots.add("cell-state");
  if (/crispr|guide|perturb|screen|drug|knockdown|activation|inhibition/.test(text)) slots.add("perturbation-step");
  if (/sequenc|read|barcode|umi|matrix|dataset|store|table/.test(text)) slots.add("data-evidence");
  if (/spatial|visium|histology|mask|neighborhood|microscopy|image/.test(text)) slots.add("spatial-context");
  if (/model|classifier|foundation|network|training|inference/.test(text)) slots.add("model-checkpoint");
  if (/benchmark|metric|confusion|calibration|roc|judge|error|gold/.test(text)) slots.add("evaluation-evidence");
  if (/risk|durc|permission|review|audit|red-team|biosafety|policy|refusal/.test(text)) slots.add("risk-decision");
  if (/agent|prompt|retrieval|mcp|tool|planner|executor|memory|router/.test(text)) slots.add("agent-operation");
  if (/deployment|monitoring|governance|incident|traceability/.test(text)) slots.add("governance-record");
  for (const pack of workflowPacks) slots.add(pack);
  if (!slots.size) slots.add(`${seed.visualRole}-visual`);
  return [...slots];
}

function panelRoleFor(seed: AssetSeed): AssetPanelRole {
  if (seed.visualRole === "risk") return "warning";
  if (seed.visualRole === "data" || seed.visualRole === "evaluation") return "evidence";
  if (seed.visualRole === "process" || seed.visualRole === "assay") return "process-step";
  if (seed.visualRole === "annotation" || seed.family === "governance") return "annotation";
  if (seed.family === "metricPanel" || /output|prediction|matrix|curve|score/.test(seed.id)) return "output";
  return "main-subject";
}

function fidelityScoreFor(tier: AssetQualityTier): number {
  if (tier === "signature") return 0.96;
  if (tier === "hero") return 0.9;
  if (tier === "standard") return 0.72;
  return 0.58;
}

function editablePartDefinition(part: string, seed: AssetSeed): NonNullable<Asset["editablePartDefinitions"]>[number] {
  const lower = part.toLowerCase();
  const colorBinding = lower.includes("label") ? "label" : lower.includes("stroke") || lower.includes("edge") ? "stroke" : lower.includes("highlight") || lower.includes("badge") || lower.includes("marker") ? "accent" : lower.includes("body") || lower.includes("membrane") || lower.includes("silhouette") ? "fill" : "secondary";
  const anchor = lower.includes("connector") || lower.includes("port") ? "connector" : lower.includes("label") ? "label" : lower.includes("badge") ? "badge" : lower.includes("highlight") ? "highlight" : undefined;
  return {
    id: part.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    role: `${seed.family}:${part}`,
    selectable: !lower.includes("anchor"),
    colorBinding,
    anchor,
    exportMapping: lower.includes("label") ? "text" : lower.includes("anchor") ? "group" : lower.includes("body") || lower.includes("panel") || lower.includes("node") ? "shape" : "path"
  };
}

export function listAssets(query = ""): LibraryAsset[] {
  return searchAssets({ query, limit: LIBRARY_ASSETS.length }).map((result) => result.asset);
}

export function searchAssets(input: AssetSearchInput = {}): AssetSearchResult[] {
  const tokens = tokenize([input.query, input.slideIntent, input.category, input.role, input.family, input.modality, input.riskDomain, input.workflowPack, input.panelRole, input.semanticSlot, input.assetKind, input.mediaType, input.realismLevel, input.rightsStatus, input.sourceAssetType].filter(Boolean).join(" "));
  const category = input.category?.toLowerCase();
  const role = input.role?.toLowerCase();
  const family = input.family?.toLowerCase();
  const modality = input.modality?.toLowerCase();
  const riskDomain = input.riskDomain?.toLowerCase();
  const styleProfile = input.styleProfile ? normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile : "consulting-2p5d";
  const workflowPack = input.workflowPack?.toLowerCase();
  const qualityTier = input.qualityTier?.toLowerCase();
  const panelRole = input.panelRole?.toLowerCase();
  const semanticSlot = input.semanticSlot?.toLowerCase();
  const assetKind = input.assetKind?.toLowerCase();
  const mediaType = input.mediaType?.toLowerCase();
  const realismLevel = input.realismLevel?.toLowerCase();
  const rightsStatus = input.rightsStatus?.toLowerCase();
  const sourceAssetType = input.sourceAssetType?.toLowerCase();
  const results = LIBRARY_ASSETS.filter((asset) => {
    if (assetKind === "vector" && asset.kind !== "symbol") return false;
    if (assetKind === "realistic" && !isRealisticAsset(asset)) return false;
    if (assetKind && !["vector", "realistic", "hybrid"].includes(assetKind) && asset.kind.toLowerCase() !== assetKind) return false;
    if (category && !asset.category.toLowerCase().includes(category)) return false;
    if (role && asset.visualRole?.toLowerCase() !== role) return false;
    if (family && asset.family?.toLowerCase() !== family) return false;
    if (modality && !asset.modality?.some((value) => value.toLowerCase().includes(modality))) return false;
    if (riskDomain && !asset.riskDomain?.some((value) => value.toLowerCase().includes(riskDomain))) return false;
    if (workflowPack && !asset.workflowPacks.some((value) => value.toLowerCase() === workflowPack)) return false;
    if (qualityTier && asset.qualityTier.toLowerCase() !== qualityTier) return false;
    if (panelRole && asset.panelRole.toLowerCase() !== panelRole) return false;
    if (semanticSlot && !asset.semanticSlots.some((value) => value.toLowerCase() === semanticSlot)) return false;
    if (mediaType && asset.mediaType?.toLowerCase() !== mediaType) return false;
    if (realismLevel && asset.realismLevel?.toLowerCase() !== realismLevel) return false;
    if (rightsStatus && asset.rightsStatus?.toLowerCase() !== rightsStatus) return false;
    if (sourceAssetType && asset.sourceAssetType?.toLowerCase() !== sourceAssetType) return false;
    if (input.styleProfile && !asset.styleProfiles.includes(styleProfile)) return false;
    return true;
  }).map((asset) => {
    let score = 0;
    const haystack = searchableText(asset);
    for (const token of tokens) {
      if (asset.id.toLowerCase() === token) score += 30;
      if (asset.name.toLowerCase().includes(token)) score += 18;
      if (asset.aliases.some((alias) => alias.toLowerCase().includes(token))) score += 12;
      if (asset.tags.some((tag) => tag.toLowerCase().includes(token))) score += 10;
      if (haystack.includes(token)) score += 4;
    }
    if (!tokens.length) score += 1;
    if (category) score += 24;
    if (role) score += 20;
    if (family) score += 20;
    if (modality) score += 14;
    if (riskDomain) score += 14;
    if (workflowPack) score += 28;
    if (panelRole) score += 16;
    if (semanticSlot) score += 18;
    if (assetKind) score += assetKind === "realistic" && isRealisticAsset(asset) ? 28 : 10;
    if (mediaType || realismLevel || rightsStatus || sourceAssetType) score += 18;
    if (input.styleProfile) score += 8;
    if (input.slideIntent) score += slideIntentBoost(asset, input.slideIntent);
    score += realisticIntentBoost(asset, [input.query, input.slideIntent].filter(Boolean).join(" "));
    score += tierRank(asset) * (tokens.length || input.slideIntent ? 5 : 1);
    score += Math.round(asset.fidelityScore * 4);
    return {
      asset,
      score,
      reason: reasonFor(asset, tokens, input.slideIntent, workflowPack),
      suggestedLabel: asset.name,
      recommendedStyleProfile: styleProfile,
      workflowPack: workflowPack ? asset.workflowPacks.find((pack) => pack.toLowerCase() === workflowPack) : asset.workflowPacks[0],
      semanticSlot: semanticSlot ? asset.semanticSlots.find((slot) => slot.toLowerCase() === semanticSlot) : asset.semanticSlots[0],
      suggestedPlacement: placementFor(asset)
    } satisfies AssetSearchResult;
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || tierRank(b.asset) - tierRank(a.asset) || a.asset.name.localeCompare(b.asset.name));
  return results.slice(0, input.limit ?? 40);
}

export function getAssetIndex(input: AssetSearchInput = {}): AssetIndex {
  const limit = input.limit ?? 20;
  const styleProfile = input.styleProfile ? normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile : undefined;
  const results = searchAssets({ ...input, styleProfile, limit });
  const assets = results.map((result) => compactAssetReference(result.asset, {
    styleProfile: result.recommendedStyleProfile,
    semanticRole: result.semanticSlot,
    layoutHint: result.suggestedPlacement
  }));
  const indexWithoutBudget = {
    schemaVersion: "0.6.0-agent-asset-index",
    generatedAt: ASSET_ROADMAP_REVIEWED_AT,
    responseShape: "compact" as const,
    filters: {
      workflowPack: input.workflowPack,
      styleProfile,
      qualityTier: input.qualityTier,
      semanticSlot: input.semanticSlot,
      assetKind: input.assetKind,
      limit
    },
    facets: assetIndexFacets(),
    totalAssets: LIBRARY_ASSETS.length,
    returnedAssets: assets.length,
    assets
  };
  return {
    ...indexWithoutBudget,
    sizeBudget: {
      currentTargetBytes: 25000,
      twelveMonthTargetBytes: 150000,
      estimatedBytes: JSON.stringify(indexWithoutBudget).length
    }
  };
}

export function compactAssetSearchResult(result: AssetSearchResult): CompactAssetSearchResult {
  return {
    asset: compactAssetReference(result.asset, {
      styleProfile: result.recommendedStyleProfile,
      semanticRole: result.semanticSlot,
      layoutHint: result.suggestedPlacement
    }),
    score: result.score,
    reason: result.reason,
    suggestedLabel: result.suggestedLabel,
    recommendedStyleProfile: result.recommendedStyleProfile,
    workflowPack: result.workflowPack,
    semanticSlot: result.semanticSlot,
    suggestedPlacement: result.suggestedPlacement
  };
}

export function compactAssetSearchResults(results: AssetSearchResult[]): CompactAssetSearchResult[] {
  return results.map(compactAssetSearchResult);
}

export function compactAssetSetRecommendation(recommendation: AssetSetRecommendation) {
  return {
    workflowPack: recommendation.workflowPack,
    templateId: recommendation.templateId,
    styleProfile: recommendation.styleProfile,
    groups: recommendation.groups.map((group) => ({
      semanticSlot: group.semanticSlot,
      panelRole: group.panelRole,
      recommendedPlacement: group.recommendedPlacement,
      assets: group.assets.map(compactAssetSearchResult)
    })),
    insertPlan: recommendation.insertPlan,
    agentInstructions: recommendation.agentInstructions
  };
}

function compactAssetReference(asset: LibraryAsset, input: {
  styleProfile?: AssetStyleProfile;
  semanticRole?: string;
  layoutHint?: string;
} = {}): CompactAssetReference {
  const styleProfile = preferredAssetStyleProfile(asset, input.styleProfile);
  const width = asset.recommendedSize.width;
  const height = asset.recommendedSize.height;
  return {
    assetId: asset.id,
    name: asset.name,
    kind: asset.kind,
    qualityTier: asset.qualityTier,
    workflowPacks: [...asset.workflowPacks],
    semanticSlots: [...asset.semanticSlots],
    panelRole: asset.panelRole,
    styleProfiles: sameStyleProfiles(asset.styleProfiles, DEFAULT_STYLE_PROFILES) ? "all" : [...asset.styleProfiles],
    recommendedSize: { width, height },
    editablePartBindings: compactEditablePartBindings(asset),
    insertDefaults: {
      tool: "insert_premium_asset",
      args: {
        assetId: asset.id,
        styleProfile,
        semanticRole: input.semanticRole ?? asset.semanticSlots[0],
        layoutHint: input.layoutHint ?? placementFor(asset),
        width,
        height
      }
    },
    previewArgs: {
      assetId: asset.id,
      styleProfile,
      width,
      height
    }
  };
}

function createAssetInsertAction(result: AssetSearchResult, styleProfile: AssetStyleProfile): AssetInsertAction {
  const asset = result.asset;
  return {
    tool: "insert_premium_asset",
    args: {
      assetId: asset.id,
      styleProfile: preferredAssetStyleProfile(asset, styleProfile),
      semanticRole: result.semanticSlot ?? asset.semanticSlots[0],
      layoutHint: result.suggestedPlacement,
      width: asset.recommendedSize.width,
      height: asset.recommendedSize.height
    }
  };
}

function compactEditablePartBindings(asset: LibraryAsset): CompactAssetReference["editablePartBindings"] {
  const preferred = ["highlight", "badge", "label", "connector", "shape", "path", "text"];
  const sorted = [...asset.editablePartDefinitions].sort((a, b) => {
    const aRank = preferred.findIndex((token) => a.anchor === token || a.exportMapping === token || a.colorBinding === token);
    const bRank = preferred.findIndex((token) => b.anchor === token || b.exportMapping === token || b.colorBinding === token);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
  return sorted.slice(0, 3).map((part) => Object.fromEntries(Object.entries({
    id: part.id,
    colorBinding: part.colorBinding,
    anchor: part.anchor,
    exportMapping: part.exportMapping
  }).filter(([, value]) => value !== undefined)) as CompactAssetReference["editablePartBindings"][number]);
}

function preferredAssetStyleProfile(asset: LibraryAsset, requested?: AssetStyleProfile): AssetStyleProfile {
  if (requested && asset.styleProfiles.includes(requested)) return requested;
  if (isRealisticAsset(asset) && asset.styleProfiles.includes("scientific-editorial-realism")) return "scientific-editorial-realism";
  if (asset.workflowPacks.includes("ai-biosecurity-eval") && asset.styleProfiles.includes("risk-warning")) return "risk-warning";
  return asset.styleProfiles.includes("consulting-2p5d") ? "consulting-2p5d" : asset.styleProfiles[0];
}

function sameStyleProfiles(left: AssetStyleProfile[], right: AssetStyleProfile[]): boolean {
  return left.length === right.length && right.every((profile) => left.includes(profile));
}

function assetIndexFacets(): AssetIndex["facets"] {
  return {
    workflowPacks: uniqueValues(LIBRARY_ASSETS.flatMap((asset) => asset.workflowPacks)).sort(),
    styleProfiles: [...DEFAULT_STYLE_PROFILES],
    qualityTiers: ["signature", "hero", "standard", "utility"],
    semanticSlots: uniqueValues(LIBRARY_ASSETS.flatMap((asset) => asset.semanticSlots)).sort(),
    panelRoles: uniqueValues(LIBRARY_ASSETS.map((asset) => asset.panelRole)).sort() as AssetPanelRole[],
    assetKinds: ["vector", "realistic", "symbol", "image", "hybrid"]
  };
}

function tierRank(asset: LibraryAsset): number {
  if (asset.qualityTier === "signature") return 3;
  if (asset.qualityTier === "hero") return 2;
  if (asset.qualityTier === "standard") return 1;
  return 0;
}

export function recommendAssetsForSlide(input: AssetRecommendationInput = {}): AssetSearchResult[] {
  const intent = [input.title, input.narrative, input.layoutIntent, input.sourceText].filter(Boolean).join(" ");
  const limit = input.limit ?? 8;
  const workflowPack = input.workflowPack ?? inferWorkflowPack(intent);
  const preferRealistic = prefersRealisticForIntent(intent);
  const assetKind = preferRealistic && (!input.workflowPack || input.workflowPack.startsWith("realistic-")) ? "realistic" : undefined;
  const firstPass = searchAssets({
    query: intent,
    slideIntent: input.layoutIntent,
    styleProfile: input.styleProfile ?? (preferRealistic ? "scientific-editorial-realism" : undefined),
    workflowPack: assetKind ? input.workflowPack : workflowPack,
    assetKind,
    limit
  });
  if (firstPass.length >= limit) return firstPass.slice(0, limit);
  const seen = new Set(firstPass.map((result) => result.asset.id));
  const fill = searchAssets({ query: intent, slideIntent: input.layoutIntent, styleProfile: input.styleProfile, limit })
    .filter((result) => !seen.has(result.asset.id));
  return [...firstPass, ...fill].slice(0, limit);
}

export function recommendWorkflowPack(input: {
  title?: string;
  narrative?: string;
  sourceText?: string;
  workflowPack?: string;
  limit?: number;
} = {}): WorkflowPackRecommendation[] {
  const intent = [input.title, input.narrative, input.sourceText, input.workflowPack].filter(Boolean).join(" ");
  const tokens = tokenize(intent);
  const inferredPack = input.workflowPack ?? inferWorkflowPack(intent);
  const recommendations = PREMIUM_WORKFLOW_PACKS.map((pack) => {
    let score = pack.priority <= 1 ? 12 : pack.priority === 2 ? 8 : 4;
    const haystack = workflowSearchText(pack);
    for (const token of tokens) {
      if (pack.id.includes(token)) score += 28;
      if (pack.name.toLowerCase().includes(token)) score += 22;
      if (haystack.includes(token)) score += 8;
    }
    if (inferredPack && pack.id === inferredPack) score += 140;
    const quality = getWorkflowPackQuality(pack.id);
    score += Math.round(quality.signatureCoverage * 20);
    score += Math.min(12, pack.templates.length * 2);
    const template = pack.flagshipTemplateId ? getWorkflowTemplate(pack.flagshipTemplateId) : undefined;
    const reason = [
      `${quality.signatureOrHeroCount}/${quality.assetCount} signature+hero assets`,
      `${quality.templateCount} templates`,
      pack.agentUseHints[0]
    ].filter(Boolean).join("; ");
    return {
      pack,
      score,
      reason,
      recommendedTemplateId: pack.flagshipTemplateId,
      recommendedStyleProfile: template?.recommendedStyleProfile ?? packStyleProfile(pack),
      premiumAssetCount: quality.signatureOrHeroCount,
      exportQaAction: `Call export_pack_qa_report for ${pack.id} before PPTX/DOCX delivery.`
    } satisfies WorkflowPackRecommendation;
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.pack.priority - b.pack.priority || a.pack.name.localeCompare(b.pack.name));
  return recommendations.slice(0, input.limit ?? 5);
}

export function recommendAssetSet(input: AssetRecommendationInput & {
  semanticSlots?: string[];
  panelRoles?: string[];
  templateId?: string;
} = {}): AssetSetRecommendation {
  const packRecommendation = input.workflowPack
    ? undefined
    : recommendWorkflowPack(input)[0];
  const workflowPack = input.workflowPack ?? packRecommendation?.pack.id ?? inferWorkflowPack([input.title, input.narrative, input.layoutIntent, input.sourceText].filter(Boolean).join(" "));
  const templateId = input.templateId ?? (workflowPack ? getWorkflowPack(workflowPack).flagshipTemplateId : packRecommendation?.recommendedTemplateId);
  const styleProfile = (normalizeAssetStyleProfile(input.styleProfile ?? (templateId ? getWorkflowTemplate(templateId).recommendedStyleProfile : undefined)) as AssetStyleProfile) ?? "consulting-2p5d";
  const coreResults = coreAssetResultsForWorkflow(workflowPack, styleProfile);
  const searchedRecommendations = recommendAssetsForSlide({
    title: input.title,
    narrative: input.narrative,
    layoutIntent: input.layoutIntent,
    sourceText: input.sourceText,
    workflowPack,
    styleProfile,
    limit: input.limit ?? 14
  });
  const recommendations = uniqueSearchResults([
    ...coreResults,
    ...searchedRecommendations
  ]).slice(0, Math.max(input.limit ?? 14, coreResults.length));
  const slotFilters = input.semanticSlots?.length ? input.semanticSlots : uniqueValues(recommendations.map((result) => result.semanticSlot).filter(Boolean) as string[]).slice(0, 6);
  const groups = (slotFilters.length ? slotFilters : ["main-subject"]).map((slot) => {
    const panelRole = input.panelRoles?.[0];
    const primary = recommendations.filter((result) => result.asset.semanticSlots.includes(slot) && (!panelRole || result.asset.panelRole === panelRole));
    const fallback = searchAssets({
      query: [input.title, input.narrative, input.sourceText].filter(Boolean).join(" "),
      workflowPack,
      semanticSlot: slot,
      panelRole,
      styleProfile,
      limit: 4
    });
    const assets = uniqueSearchResults([...primary, ...fallback]).slice(0, 4);
    const first = assets[0];
    return {
      semanticSlot: slot,
      panelRole: panelRole ?? first?.asset.panelRole ?? "main-subject",
      recommendedPlacement: first?.suggestedPlacement ?? "supporting",
      assets
    };
  }).filter((group) => group.assets.length);
  const insertPlan = uniqueSearchResults([
    ...groups.flatMap((group) => group.assets),
    ...coreResults.slice(0, input.limit ?? 14)
  ])
    .map((result) => createAssetInsertAction(result, styleProfile));
  return {
    workflowPack,
    templateId,
    styleProfile,
    groups,
    insertPlan,
    agentInstructions: [
      "Insert assets as structured symbol nodes with assetId, workflowPack, semanticSlot, styleProfile, and appearance overrides.",
      "Prefer the recommended template before manually placing many assets.",
      "Run validate_deck and export_pack_qa_report before delivering Office formats.",
      "Keep scientific claims in review items until cited, user-confirmed, or accepted-risk."
    ]
  };
}

const WORKFLOW_CORE_ASSET_IDS: Record<string, string[]> = {
  "perturb-seq-crispr": [
    "cell-immune",
    "crispr-cas9",
    "guide-rna",
    "pooled-screen",
    "scrna-droplet",
    "sequencer",
    "expression-matrix",
    "sequencing-read"
  ],
  "drug-discovery": [
    "target-validation",
    "target-engagement",
    "compound-library",
    "hit-triage",
    "dose-response-curve",
    "selectivity-panel",
    "sar-table",
    "medicinal-chemistry-cycle",
    "admet-panel",
    "toxicity-screen",
    "pk-profile",
    "efficacy-model",
    "biomarker-response",
    "lead-series",
    "candidate-nomination",
    "ind-enabling-package",
    "receptor",
    "ligand",
    "drug-perturbation",
    "plate-384",
    "metric-card",
    "metabolite",
    "calibration",
    "error-analysis",
    "human-cohort",
    "protein",
    "pathway-node",
    "signaling-cascade",
    "protein-complex",
    "blood-sample"
  ],
  "protein-engineering": [
    "protein-design-model",
    "protein-domain",
    "binding-pocket",
    "protein-variant-library",
    "directed-evolution",
    "affinity-maturation",
    "binding-affinity-assay",
    "structure-prediction",
    "stability-assay",
    "enzyme-kinetics",
    "purification-column",
    "developability-profile",
    "sequence-logo",
    "antibody-fragment",
    "enzyme-active-site",
    "expression-host",
    "protein-complex",
    "western-blot"
  ],
  "synthetic-biology": [
    "genetic-circuit",
    "promoter-library",
    "ribosome-binding-site",
    "terminator",
    "plasmid-vector",
    "synthetic-operon",
    "dna-assembly",
    "golden-gate-assembly",
    "gibson-assembly",
    "design-build-test-learn-cycle",
    "chassis-cell",
    "biosensor-circuit",
    "logic-gate-genetic",
    "metabolic-pathway-engineering",
    "pathway-flux-map",
    "strain-library",
    "kill-switch",
    "bioreactor",
    "plasmid",
    "transcription-factor"
  ],
  "microbiome-infectious-disease": [
    "microbiome-community",
    "gut-microbiome",
    "mucosal-barrier",
    "pathogen-host-interaction",
    "bacterial-strain",
    "viral-phage",
    "fungal-cell",
    "metagenomic-read",
    "microbiome-profile",
    "taxonomic-abundance",
    "alpha-diversity",
    "beta-diversity",
    "amr-gene",
    "antimicrobial-resistance",
    "antibiotic-treatment",
    "microbiome-dysbiosis",
    "outbreak-cluster",
    "infection-model",
    "sequencer",
    "biosafety-cabinet"
  ],
  "cell-therapy": [
    "leukapheresis",
    "viral-vector-transduction",
    "engineered-t-cell",
    "car-t-cell",
    "tcr-therapy",
    "nk-cell-therapy",
    "tumor-antigen",
    "antigen-presentation",
    "activation-beads",
    "gene-edited-cell",
    "cell-expansion",
    "manufacturing-batch",
    "potency-assay",
    "release-testing",
    "cryopreservation",
    "infusion-bag",
    "patient-infusion",
    "cytokine-release",
    "flow-cytometry",
    "cell-sorter"
  ],
  "microscopy-image-analysis": [
    "microscope-field",
    "fluorescence-channel",
    "z-stack",
    "tile-stitching",
    "illumination-correction",
    "focus-quality",
    "nuclei-segmentation",
    "membrane-segmentation",
    "organelle-segmentation",
    "instance-mask",
    "segmentation-model",
    "cell-tracking",
    "phenotype-feature-vector",
    "morphology-embedding",
    "classifier-heatmap",
    "image-qc-dashboard",
    "annotation-brush",
    "microscope",
    "confocal-microscope",
    "cell-boundary"
  ],
  "lab-automation": [
    "lab-automation-platform",
    "liquid-handler",
    "automated-liquid-handler",
    "robotic-arm",
    "robotic-gripper",
    "plate-handler",
    "plate-stack",
    "plate-384",
    "barcode-scanner",
    "sample-tracker",
    "assay-scheduler",
    "deck-layout",
    "tip-rack",
    "reagent-reservoir",
    "plate-reader",
    "incubator-stack",
    "automated-microscope",
    "lims-dashboard",
    "qc-gate-automation",
    "automation-orchestrator"
  ],
  "anatomy-organ-systems": [
    "anatomy-overview",
    "organ-axis-brain-lung-gut",
    "brain",
    "lung",
    "gut",
    "liver",
    "kidney",
    "heart",
    "immune-system",
    "blood-brain-barrier",
    "intestinal-villus",
    "renal-nephron",
    "hepatic-lobule",
    "organ-sample-flow",
    "tissue-biomarker-panel",
    "clinical-endpoint-card",
    "organ-system-network",
    "patient-organ-cohort",
    "tissue-region-map",
    "human-cohort"
  ],
  "methods-and-protocols": [
    "protocol-overview",
    "sample-prep-workflow",
    "reagent-mastermix",
    "serial-dilution",
    "incubation-step",
    "wash-step",
    "centrifugation-step",
    "magnetic-bead-cleanup",
    "pcr-amplification",
    "qpcr-assay",
    "rt-qpcr-assay",
    "elisa-assay",
    "western-blot-workflow",
    "gel-imaging",
    "immunostaining",
    "fixation-permeabilization",
    "library-prep-workflow",
    "assay-timeline",
    "protocol-checklist",
    "protocol-qc-gate",
    "replicate-layout",
    "control-sample-set",
    "standard-curve",
    "sample-normalization",
    "method-safety-note",
    "pipette",
    "plate-96",
    "centrifuge",
    "incubator"
  ],
  "grant-and-consulting-summary": [
    "grant-summary-board",
    "problem-statement-card",
    "scientific-opportunity-map",
    "hypothesis-aims",
    "specific-aim-1",
    "specific-aim-2",
    "specific-aim-3",
    "innovation-claim",
    "approach-workplan",
    "milestone-roadmap",
    "quarterly-timeline",
    "roadmap-swimlane",
    "budget-envelope",
    "resource-allocation",
    "team-capability-map",
    "stakeholder-map",
    "decision-brief",
    "value-proposition",
    "impact-metric-card",
    "outcome-kpi",
    "evidence-snapshot",
    "risk-matrix",
    "risk-mitigation-plan",
    "dependency-map",
    "go-no-go-gate",
    "recommendation-card",
    "executive-takeaway",
    "priority-scorecard",
    "dataset",
    "metric-card"
  ],
  "clinical-translational": [
    "clinical-study-overview",
    "patient-journey-map",
    "consent-enrollment",
    "eligibility-criteria",
    "cohort-stratification",
    "cohort-table",
    "trial-design-schema",
    "randomization-schema",
    "treatment-arm-comparison",
    "clinical-sample-flow",
    "biospecimen-collection",
    "longitudinal-visit-schedule",
    "clinical-omics-bridge",
    "translational-readout",
    "biomarker-discovery",
    "biomarker-validation",
    "assay-validation",
    "companion-diagnostic",
    "validation-cohort",
    "endpoint-hierarchy",
    "primary-endpoint",
    "clinical-response-card",
    "survival-curve",
    "adverse-event-panel",
    "safety-monitoring",
    "clinical-risk-benefit",
    "regulatory-evidence-brief",
    "evidence-grade",
    "clinician-review",
    "human-cohort"
  ]
};

function coreAssetResultsForWorkflow(workflowPack: string | undefined, styleProfile: AssetStyleProfile): AssetSearchResult[] {
  const assetIds = workflowPack ? WORKFLOW_CORE_ASSET_IDS[workflowPack] ?? [] : [];
  return assetIds.map((assetId, index) => {
    const asset = getAnyAsset(assetId);
    return {
      asset,
      score: 1000 - index,
      reason: `Core ${workflowPack} agent happy-path asset.`,
      suggestedLabel: asset.name,
      recommendedStyleProfile: preferredAssetStyleProfile(asset, styleProfile),
      workflowPack,
      semanticSlot: asset.semanticSlots[0],
      suggestedPlacement: placementFor(asset)
    } satisfies AssetSearchResult;
  });
}

export function createAssetBrief(input: {
  concept?: string;
  assetId?: string;
  workflowPack?: string;
  styleProfile?: AssetStyleProfile | string;
  qualityTarget?: AssetQualityTier | string;
}): AssetBrief {
  const asset = input.assetId ? getAnyAsset(input.assetId) : undefined;
  const concept = input.concept ?? asset?.name ?? "New scientific visual asset";
  const workflowPack = input.workflowPack ?? asset?.workflowPacks[0] ?? recommendWorkflowPack({ title: concept })[0]?.pack.id;
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? asset?.styleProfiles[0] ?? "consulting-2p5d") as AssetStyleProfile;
  const qualityTarget = (input.qualityTarget ?? asset?.qualityTier ?? "hero") as AssetQualityTier;
  const candidateId = asset?.id ?? slugId(concept);
  const semanticSlots = asset?.semanticSlots ?? semanticSlotsForBrief(concept, workflowPack);
  const tags = asset?.tags ?? tokenize(concept).slice(0, 8);
  const aliases = asset?.aliases ?? aliasFrom(concept, tags.join(" "));
  const panelRole = asset?.panelRole ?? panelRoleForBrief(concept);
  const editableParts = asset?.editableParts ?? ["body", "rim highlight", "inner detail", "accent marker", "label anchor", "connector anchor"];
  return {
    concept,
    status: asset ? "existing-asset" : "new-asset-candidate",
    assetId: asset?.id,
    candidateId,
    workflowPack,
    styleProfile,
    assetBrief: asset
      ? `${asset.name} is an existing ${asset.qualityTier} asset for ${asset.workflowPacks.join(", ")}. Use this brief to audit commercial polish, part overrides, and template placement.`
      : `Create an original structured SVG asset for ${concept}. It should be recognizable at 48px, polished at 120px, and useful in editable workflow templates.`,
    semanticContract: {
      tags,
      aliases,
      panelRole,
      semanticSlots,
      qualityTarget
    },
    recipeDesign: {
      silhouette: asset ? `${asset.family ?? "image"} ${asset.renderSpec?.assetRecipe ?? asset.mediaType ?? "editorial realistic wrapper"}` : `Distinct ${workflowPack ?? "scientific"} silhouette, not a generic rounded card with a motif.`,
      primitives: recipePrimitiveHints(asset?.family, concept),
      editableParts,
      forbiddenAmbiguity: [
        "Do not copy proprietary BioRender, Mind the Graph, or Servier artwork.",
        "Do not rely on label text as the only differentiator.",
        "Do not imply unsupported scientific claims through warning or risk styling."
      ]
    },
    renderQa: [
      "Render non-empty SVG in all style profiles.",
      "Pass 48px icon, 120px preview, and slide-size gallery checks.",
      "Keep viewBox bounds, contrast, rim highlight, contact shadow, and connector anchors valid."
    ],
    templateIntegration: [
      `Attach to ${workflowPack ?? "a named workflow pack"}.`,
      "Use in at least one workflow template or flagship demo before promoting to premium.",
      "Add exact PPTX fallback warning if layered SVG cannot map to native Office shapes."
    ],
    agentContract: [
      "Agents should reference assetId, workflowPack, semanticSlot, styleProfile, appearance, and editablePartOverrides.",
      "Agents should request preview SVG only for inspection/export, not as the editable source of truth."
    ],
    exportQa: [
      "SVG/PDF must preserve structured renderer output.",
      "PPTX must name fallback asset IDs and recipes when visual fidelity requires SVG embedding.",
      "DOCX exports should include figure panel, caption, and provenance metadata."
    ]
  };
}

export function createWorkflowTemplateSpec(input: {
  workflowPack: string;
  intent?: string;
  name?: string;
  layout?: WorkflowTemplate["layout"];
  styleProfile?: AssetStyleProfile | string;
}): WorkflowTemplateSpec {
  const pack = getWorkflowPack(input.workflowPack);
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? "consulting-2p5d") as AssetStyleProfile;
  const assetSet = recommendAssetSet({
    title: input.intent ?? pack.description,
    workflowPack: pack.id,
    styleProfile,
    limit: 10
  });
  const previewAssetIds = uniqueValues(assetSet.groups.flatMap((group) => group.assets.map((result) => result.asset.id))).slice(0, 6);
  const layout = input.layout ?? layoutForIntent(input.intent ?? pack.description);
  const name = input.name ?? `${pack.name} ${layout.replace(/-/g, " ")} template`;
  return {
    idCandidate: slugId(`${pack.id}-${name}`).slice(0, 72),
    workflowPack: pack.id,
    name,
    layout,
    recommendedStyleProfile: styleProfile,
    previewAssetIds,
    nodeKinds: layout === "multi-panel" || layout === "results"
      ? ["shape", "text", "symbol", "plot", "connector"]
      : ["shape", "text", "symbol", "connector"],
    agentUseHints: [
      `Use ${pack.id} as the semantic pack.`,
      "Place signature/hero assets first, then add labels, connectors, plots, and review text.",
      "Keep claims short and attach citations or review items."
    ],
    qaChecklist: [
      "Panel labels are visible and do not overlap assets.",
      "All premium assets pass 48px/120px/slide-size preview checks.",
      "PPTX fallback ledger names exact layered assets.",
      "Claims are cited, user-confirmed, or left in review queue."
    ],
    acceptanceGates: [...ACCEPTANCE_GATES.slice(0, 4)]
  };
}

export function getAsset(assetId: string): PremiumAsset {
  const asset = CURATED_ASSETS.find((candidate) => candidate.id === assetId);
  if (!asset) throw new Error(`Curated asset not found: ${assetId}`);
  return asset;
}

export function getRealisticAsset(assetId: string): RealisticAsset {
  const asset = REALISTIC_ASSETS.find((candidate) => candidate.id === assetId);
  if (!asset) throw new Error(`Realistic asset not found: ${assetId}`);
  return asset;
}

export function getAnyAsset(assetId: string): LibraryAsset {
  const asset = LIBRARY_ASSETS.find((candidate) => candidate.id === assetId);
  if (!asset) throw new Error(`Library asset not found: ${assetId}`);
  return asset;
}

export function listRealisticAssets(input: {
  workflowPack?: string;
  realismLevel?: RealismLevel | string;
  mediaType?: RealisticMediaType | string;
  rightsStatus?: RightsStatus | string;
  sourceAssetType?: SourceAssetType | string;
} = {}): RealisticAsset[] {
  return searchAssets({
    assetKind: "realistic",
    workflowPack: input.workflowPack,
    realismLevel: input.realismLevel,
    mediaType: input.mediaType,
    rightsStatus: input.rightsStatus,
    sourceAssetType: input.sourceAssetType,
    limit: REALISTIC_ASSETS.length
  }).map((result) => result.asset).filter(isRealisticAsset);
}

export function listWorkflowPacks(): WorkflowPack[] {
  return PREMIUM_WORKFLOW_PACKS.map((pack) => ({ ...pack, assetIds: [...pack.assetIds], templates: [...pack.templates], agentUseHints: [...pack.agentUseHints] }));
}

export function listWorkflowTemplates(input: { workflowPack?: string } = {}): WorkflowTemplate[] {
  const workflowPack = input.workflowPack?.toLowerCase();
  return PREMIUM_WORKFLOW_TEMPLATES
    .filter((template) => !workflowPack || template.workflowPack.toLowerCase() === workflowPack)
    .map((template) => ({
      ...template,
      previewAssetIds: [...template.previewAssetIds],
      nodeKinds: [...template.nodeKinds],
      agentUseHints: [...template.agentUseHints],
      qaChecklist: [...template.qaChecklist]
    }));
}

export function getWorkflowTemplate(templateId: string): WorkflowTemplate {
  const template = WORKFLOW_TEMPLATE_BY_ID.get(templateId);
  if (!template) throw new Error(`Workflow template not found: ${templateId}`);
  return {
    ...template,
    previewAssetIds: [...template.previewAssetIds],
    nodeKinds: [...template.nodeKinds],
    agentUseHints: [...template.agentUseHints],
    qaChecklist: [...template.qaChecklist]
  };
}

export function getWorkflowPack(packId: string): WorkflowPack {
  const pack = WORKFLOW_PACK_BY_ID.get(packId);
  if (!pack) throw new Error(`Workflow pack not found: ${packId}`);
  return { ...pack, assetIds: [...pack.assetIds], templates: [...pack.templates], agentUseHints: [...pack.agentUseHints] };
}

function getRealisticWorkflowPackSpec(packId?: string): RealisticWorkflowPackSpec | undefined {
  return packId ? REALISTIC_WORKFLOW_PACK_SPECS.find((pack) => pack.id === packId) : undefined;
}

function realisticAssetsForPack(packId: string): RealisticAsset[] {
  return REALISTIC_ASSETS.filter((asset) => asset.workflowPacks.includes(packId));
}

function realisticTemplatesForSpec(spec?: RealisticWorkflowPackSpec): WorkflowTemplate[] {
  return (spec?.templates ?? [])
    .map((templateId) => WORKFLOW_TEMPLATE_BY_ID.get(templateId))
    .filter((template): template is WorkflowTemplate => Boolean(template));
}

export function listRealisticWorkflowPacks(): WorkflowPack[] {
  return REALISTIC_WORKFLOW_PACK_SPECS.map((spec) => getRealisticWorkflowPack(spec.id));
}

export function getRealisticWorkflowPack(packId: string): WorkflowPack {
  const spec = getRealisticWorkflowPackSpec(packId);
  if (!spec) throw new Error(`Realistic workflow pack not found: ${packId}`);
  return {
    id: spec.id,
    name: spec.name,
    priority: spec.priority,
    description: spec.description,
    flagshipTemplateId: spec.flagshipTemplateId,
    assetIds: realisticAssetsForPack(spec.id).map((asset) => asset.id),
    templates: [...spec.templates],
    agentUseHints: [...spec.agentUseHints]
  };
}

export function getRealisticWorkflowPackQuality(packId: string): WorkflowPackQuality {
  const spec = getRealisticWorkflowPackSpec(packId);
  if (!spec) throw new Error(`Realistic workflow pack not found: ${packId}`);
  const pack = getRealisticWorkflowPack(packId);
  const assets = realisticAssetsForPack(packId);
  const assetIds = new Set(assets.map((asset) => asset.id));
  const missingAssetIds = pack.assetIds.filter((assetId) => !assetIds.has(assetId));
  const missingTemplateIds = spec.templates.filter((templateId) => !WORKFLOW_TEMPLATE_BY_ID.has(templateId));
  const signatureOrHeroCount = assets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length;
  const signatureCoverage = Math.round((signatureOrHeroCount / Math.max(1, pack.assetIds.length)) * 100) / 100;
  const templateCount = spec.templates.length - missingTemplateIds.length;
  const exportRisks = [
    assets.length ? "PPTX/DOCX embed scientific editorial realistic panels as named image fallbacks; SVG/PDF plus scene JSON remain canonical." : "",
    assets.some((asset) => asset.rightsStatus !== "curated-fixture") ? "Some realistic assets need source/license review before commercial export." : "",
    templateCount < spec.minTemplatesForPremium ? "This realistic pack needs a flagship hybrid template before premium delivery." : ""
  ].filter(Boolean);
  const qaStatus: WorkflowPackQuality["qaStatus"] = missingAssetIds.length || missingTemplateIds.length
    ? "incomplete"
    : assets.length >= spec.minAssetsForPremium && signatureOrHeroCount >= spec.minSignatureOrHeroForPremium && templateCount >= spec.minTemplatesForPremium
      ? "premium"
      : "needs-polish";
  return {
    packId: pack.id,
    assetCount: assets.length,
    signatureOrHeroCount,
    signatureCoverage,
    templateCount,
    missingAssetIds,
    missingTemplateIds,
    exportRisks,
    qaStatus
  };
}

export function getRealisticWorkflowPackVisualQaGallery(packId: string, input: {
  styleProfile?: AssetStyleProfile | string;
  limit?: number;
} = {}): WorkflowPackVisualQaGallery {
  const pack = getRealisticWorkflowPack(packId);
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? "scientific-editorial-realism") as AssetStyleProfile;
  const assets = realisticAssetsForPack(packId).slice(0, input.limit ?? 12);
  const previewSizes: WorkflowPackVisualQaGallery["previewSizes"] = [
    { id: "icon", width: 48, height: 48 },
    { id: "preview", width: 120, height: 90 },
    { id: "slide", width: 240, height: 150 }
  ];
  const qaChecks = [
    "48px icon: recognizable wetlab/context silhouette, not a dark stock-photo thumbnail.",
    "120px preview: editorial frame, rim highlight, crop, provenance badge, and soft depth remain readable.",
    "Slide-size: realistic panel blends with consulting-2.5D vector assets and leaves room for SVG labels/callouts.",
    "PPTX/DOCX: exact realistic asset IDs are listed as image fallbacks with provenance before delivery."
  ];
  const snapshotKey = [
    pack.id,
    styleProfile,
    assets.map((asset) => `${asset.id}:${asset.mediaType}:${asset.qualityTier}:${asset.rightsStatus}:${asset.qaStatus}`).join(",")
  ].join("|");
  return {
    packId: pack.id,
    styleProfile,
    previewSizes,
    assetCount: pack.assetIds.length,
    renderedAssetIds: assets.map((asset) => asset.id),
    qaChecks,
    snapshotKey,
    svg: renderRealisticAssetGallerySvg({ workflowPack: pack.id, styleProfile, limit: input.limit })
  };
}

export function renderPremiumAssetDefs(): string {
  return `${renderCommercialAssetDefs()}${renderRealisticAssetDefs()}`;
}

export function renderPremiumAssetSvg(assetId: string, options: {
  variant?: AssetVariant;
  styleProfile?: AssetStyleProfile;
  detailLevel?: AssetDetailLevel;
  width?: number;
  height?: number;
  label?: string;
  showLabel?: boolean;
  appearance?: SymbolAppearance;
} & SymbolAppearance = {}): string {
  const width = options.width ?? 160;
  const height = options.height ?? 120;
  const asset = getAnyAsset(assetId);
  if (isRealisticAsset(asset)) return renderRealisticAssetSvg(asset.id, options);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(options.label ?? asset.name)}"><defs>${renderPremiumAssetDefs()}</defs>${renderPremiumAssetGlyph(asset, width, height, options)}</svg>`;
}

export function renderPremiumAssetGlyph(
  assetOrId: LibraryAsset | string,
  width: number,
  height: number,
  options: { variant?: AssetVariant; styleProfile?: AssetStyleProfile; detailLevel?: AssetDetailLevel; label?: string; showLabel?: boolean; appearance?: SymbolAppearance } & SymbolAppearance = {}
): string {
  const asset = typeof assetOrId === "string" ? getAnyAsset(assetOrId) : assetOrId;
  if (isRealisticAsset(asset)) {
    return renderRealisticAssetGlyph(asset, width, height, {
      styleProfile: options.styleProfile,
      label: options.label,
      showCaption: options.showLabel,
      appearance: {
        colorWash: options.accent,
        rimColor: options.stroke,
        opacity: undefined
      }
    });
  }
  return renderCommercialAssetGlyph(asset, width, height, options);
}

export function renderRealisticAssetDefs(): string {
  return [
    `<filter id="realistic-editorial-shadow" x="-24%" y="-28%" width="148%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.4" result="ambient"/><feOffset in="ambient" dx="0" dy="5" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.03 0 0 0 0 0.07 0 0 0 0 0.14 0 0 0 0.18 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="14" result="drop"/><feOffset in="drop" dx="0" dy="15" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.03 0 0 0 0 0.07 0 0 0 0 0.14 0 0 0 0.12 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="realistic-image-polish" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.03" intercept="0.01"/><feFuncG type="linear" slope="1.03" intercept="0.01"/><feFuncB type="linear" slope="1.02" intercept="0.01"/></feComponentTransfer></filter>`,
    `<linearGradient id="realistic-frame-highlight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.78"/><stop offset="44%" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`
  ].join("");
}

export function renderRealisticAssetSvg(assetId: string, options: {
  styleProfile?: AssetStyleProfile | string;
  width?: number;
  height?: number;
  label?: string;
  showCaption?: boolean;
  appearance?: ImageAppearance;
  crop?: ImageCrop;
  mask?: ImageMask;
  captionAnchor?: "top" | "bottom" | "left" | "right";
} = {}): string {
  const asset = getRealisticAsset(assetId);
  const width = options.width ?? 220;
  const height = options.height ?? 154;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(options.label ?? asset.name)}"><defs>${renderRealisticAssetDefs()}</defs>${renderRealisticAssetGlyph(asset, width, height, options)}</svg>`;
}

export function renderRealisticAssetGlyph(
  assetOrId: RealisticAsset | string,
  width: number,
  height: number,
  options: {
    styleProfile?: AssetStyleProfile | string;
    label?: string;
    showCaption?: boolean;
    appearance?: ImageAppearance;
    crop?: ImageCrop;
    mask?: ImageMask;
    captionAnchor?: "top" | "bottom" | "left" | "right";
  } = {}
): string {
  const asset = typeof assetOrId === "string" ? getRealisticAsset(assetOrId) : assetOrId;
  const styleProfile = normalizeAssetStyleProfile(options.styleProfile ?? "scientific-editorial-realism") as AssetStyleProfile;
  const appearance = options.appearance ?? {};
  const pad = Math.max(8, Math.min(width, height) * 0.055);
  const captionHeight = options.showCaption === false ? 0 : Math.min(28, Math.max(18, height * 0.16));
  const imageHeight = Math.max(24, height - pad * 2 - captionHeight);
  const innerWidth = Math.max(24, width - pad * 2);
  const rx = Math.min(18, innerWidth * 0.08, imageHeight * 0.12);
  const maskShape = options.mask?.shape ?? "round-rect";
  const clipId = `realistic-clip-${slugId(asset.id)}-${Math.round(width)}-${Math.round(height)}`;
  const wash = appearance.colorWash ?? (styleProfile === "risk-warning" ? "#dc2626" : styleProfile === "dark-talk" ? "#38bdf8" : "#2563eb");
  const washOpacity = appearance.colorWashOpacity ?? (styleProfile === "publication-line" ? 0.035 : styleProfile === "dark-talk" ? 0.16 : 0.075);
  const rimColor = appearance.rimColor ?? (styleProfile === "risk-warning" ? "#f97316" : "#ffffff");
  const frameFill = styleProfile === "dark-talk" ? "#0f172a" : "#ffffff";
  const frameStroke = styleProfile === "dark-talk" ? "#334155" : "#dbe4f0";
  const labelColor = styleProfile === "dark-talk" ? "#e2e8f0" : "#0f172a";
  const imageMarkup = imageMarkupForCrop(asset, pad, pad, innerWidth, imageHeight, options.crop);
  const clipShape = maskShape === "ellipse"
    ? `<ellipse cx="${fmt(pad + innerWidth / 2)}" cy="${fmt(pad + imageHeight / 2)}" rx="${fmt(innerWidth / 2)}" ry="${fmt(imageHeight / 2)}"/>`
    : `<rect x="${fmt(pad)}" y="${fmt(pad)}" width="${fmt(innerWidth)}" height="${fmt(imageHeight)}" rx="${maskShape === "rect" ? 0 : fmt(rx)}"/>`;
  const imageFrame = [
    `<defs><clipPath id="${escapeXml(clipId)}">${clipShape}</clipPath></defs>`,
    `<rect x="2" y="2" width="${fmt(width - 4)}" height="${fmt(height - 4)}" rx="${fmt(Math.min(22, height * 0.12))}" fill="${frameFill}" stroke="${frameStroke}" stroke-width="1.2"/>`,
    `<g clip-path="url(#${escapeXml(clipId)})" filter="url(#realistic-image-polish)">${imageMarkup}<rect x="${fmt(pad)}" y="${fmt(pad)}" width="${fmt(innerWidth)}" height="${fmt(imageHeight)}" fill="${escapeXml(wash)}" opacity="${fmt(washOpacity)}"/><rect x="${fmt(pad)}" y="${fmt(pad)}" width="${fmt(innerWidth)}" height="${fmt(imageHeight * 0.44)}" fill="url(#realistic-frame-highlight)" opacity="0.46"/></g>`,
    maskShape === "ellipse"
      ? `<ellipse cx="${fmt(pad + innerWidth / 2)}" cy="${fmt(pad + imageHeight / 2)}" rx="${fmt(Math.max(0, innerWidth / 2 - 1))}" ry="${fmt(Math.max(0, imageHeight / 2 - 1))}" fill="none" stroke="${escapeXml(rimColor)}" stroke-width="2" opacity="0.72"/>`
      : `<rect x="${fmt(pad + 1)}" y="${fmt(pad + 1)}" width="${fmt(Math.max(0, innerWidth - 2))}" height="${fmt(Math.max(0, imageHeight - 2))}" rx="${maskShape === "rect" ? 0 : fmt(Math.max(0, rx - 1))}" fill="none" stroke="${escapeXml(rimColor)}" stroke-width="2" opacity="0.72"/>`,
    `<circle cx="${fmt(width - pad - 12)}" cy="${fmt(pad + 14)}" r="8" fill="${escapeXml(asset.rightsStatus === "curated-fixture" ? "#22c55e" : "#f59e0b")}" stroke="#ffffff" stroke-width="2"><title>${escapeXml(asset.rightsStatus)}</title></circle>`,
    renderRealisticAnchors(width, height, pad, imageHeight)
  ].join("");
  const caption = options.showCaption === false ? "" : `<text x="${fmt(width / 2)}" y="${fmt(height - Math.max(7, pad * 0.7))}" text-anchor="middle" fill="${escapeXml(labelColor)}" font-family="Inter, Arial, sans-serif" font-size="${fmt(Math.min(12, Math.max(9, height * 0.07)))}" font-weight="760">${escapeXml(trimLabel(options.label ?? asset.name, Math.max(12, Math.floor(width / 8))))}</text>`;
  return `<g class="scientific-realistic-asset realistic-image-asset style-${escapeXml(styleProfile)}" data-asset-id="${escapeXml(asset.id)}" data-media-type="${escapeXml(asset.mediaType)}" data-realism-level="${escapeXml(asset.realismLevel)}" data-rights-status="${escapeXml(asset.rightsStatus)}" data-source-asset-type="${escapeXml(asset.sourceAssetType)}" data-workflow-pack="${escapeXml(asset.workflowPacks[0])}" data-style-profile="${escapeXml(styleProfile)}" data-quality-tier="${escapeXml(asset.qualityTier)}" filter="url(#realistic-editorial-shadow)">${imageFrame}${caption}</g>`;
}

function imageMarkupForCrop(asset: RealisticAsset, x: number, y: number, width: number, height: number, crop?: ImageCrop): string {
  const fixture = inlineSvgFixtureMarkup(asset);
  const drawImage = (imageX: number, imageY: number, imageWidth: number, imageHeight: number, preserveAspectRatio: string) => {
    if (fixture) {
      return `<svg x="${fmt(imageX)}" y="${fmt(imageY)}" width="${fmt(imageWidth)}" height="${fmt(imageHeight)}" viewBox="0 0 ${asset.resolution.width} ${asset.resolution.height}" preserveAspectRatio="${preserveAspectRatio}"><title>${escapeXml(asset.name)}</title>${fixture}</svg>`;
    }
    return `<image href="${escapeXml(asset.dataUri ?? "")}" x="${fmt(imageX)}" y="${fmt(imageY)}" width="${fmt(imageWidth)}" height="${fmt(imageHeight)}" preserveAspectRatio="${preserveAspectRatio}"><title>${escapeXml(asset.name)}</title></image>`;
  };
  if (!crop) return drawImage(x, y, width, height, "xMidYMid slice");
  const cropLike = crop as ImageCrop & { zoom?: number; fit?: "cover" | "contain" };
  if (Number.isFinite(cropLike.width) && Number.isFinite(cropLike.height)) {
    const scale = Math.max(width / Math.max(1, cropLike.width), height / Math.max(1, cropLike.height));
    const imageWidth = asset.resolution.width * scale;
    const imageHeight = asset.resolution.height * scale;
    const imageX = x - cropLike.x * scale + (width - cropLike.width * scale) / 2;
    const imageY = y - cropLike.y * scale + (height - cropLike.height * scale) / 2;
    return drawImage(imageX, imageY, imageWidth, imageHeight, "none");
  }
  const zoom = Math.max(0.8, Math.min(2.2, Number(cropLike.zoom ?? 1)));
  const offsetX = Math.max(-0.35, Math.min(0.35, Number(cropLike.x ?? 0)));
  const offsetY = Math.max(-0.35, Math.min(0.35, Number(cropLike.y ?? 0)));
  const imageWidth = width * zoom;
  const imageHeight = height * zoom;
  const imageX = x - width * (zoom - 1) / 2 - width * offsetX;
  const imageY = y - height * (zoom - 1) / 2 - height * offsetY;
  return drawImage(imageX, imageY, imageWidth, imageHeight, cropLike.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice");
}

function inlineSvgFixtureMarkup(asset: RealisticAsset): string | undefined {
  if (asset.mediaType !== "svg-fixture" || !asset.dataUri?.startsWith("data:image/svg+xml")) return undefined;
  const commaIndex = asset.dataUri.indexOf(",");
  if (commaIndex < 0) return undefined;
  try {
    const encoded = asset.dataUri.slice(commaIndex + 1);
    const svg = asset.dataUri.includes(";base64,")
      ? globalThis.atob?.(encoded)
      : decodeURIComponent(encoded);
    const match = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
    if (!match) return undefined;
    return scopeInlineSvgIds(match[1], `fixture-${slugId(asset.id)}`);
  } catch {
    return undefined;
  }
}

function scopeInlineSvgIds(markup: string, scope: string): string {
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  return ids.reduce((value, id) => {
    const scoped = `${scope}-${id}`;
    return value
      .replaceAll(`id="${id}"`, `id="${scoped}"`)
      .replaceAll(`url(#${id})`, `url(#${scoped})`)
      .replaceAll(`href="#${id}"`, `href="#${scoped}"`)
      .replaceAll(`xlink:href="#${id}"`, `xlink:href="#${scoped}"`);
  }, markup);
}

function renderRealisticAnchors(width: number, height: number, pad: number, imageHeight: number): string {
  const anchors = [
    { id: "label-anchor", x: width / 2, y: height - pad },
    { id: "connector-left", x: pad, y: pad + imageHeight / 2 },
    { id: "connector-right", x: width - pad, y: pad + imageHeight / 2 },
    { id: "highlight-region", x: width / 2, y: pad + imageHeight / 2 }
  ];
  return anchors.map((anchor) => `<circle class="asset-anchor ${anchor.id}" data-anchor="${anchor.id}" cx="${fmt(anchor.x)}" cy="${fmt(anchor.y)}" r="2.5" fill="#2563eb" opacity="0"/>`).join("");
}

export function getRealisticAssetGallery(input: {
  workflowPack?: string;
  styleProfile?: AssetStyleProfile | string;
  limit?: number;
} = {}): RealisticAssetGallery {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? "scientific-editorial-realism") as AssetStyleProfile;
  const assets = listRealisticAssets({ workflowPack: input.workflowPack }).slice(0, input.limit ?? REALISTIC_ASSETS.length);
  const packSpec = getRealisticWorkflowPackSpec(input.workflowPack);
  const pack = packSpec ? getRealisticWorkflowPack(packSpec.id) : undefined;
  const templates = realisticTemplatesForSpec(packSpec);
  const templateQa = templates.map((template) => getWorkflowTemplateQa(template.id, { styleProfile }));
  const flagshipTemplate = pack?.flagshipTemplateId ? templates.find((template) => template.id === pack.flagshipTemplateId) : undefined;
  const flagshipQa = flagshipTemplate ? templateQa.find((qa) => qa.templateId === flagshipTemplate.id) : undefined;
  const exportSnapshot = pack && templates.length ? createWorkflowPackExportSnapshot(pack, templates, templateQa, styleProfile) : undefined;
  const quality = pack ? getRealisticWorkflowPackQuality(pack.id) : undefined;
  const visualQa = pack ? getRealisticWorkflowPackVisualQaGallery(pack.id, { styleProfile, limit: input.limit }) : undefined;
  return {
    styleProfile,
    workflowPack: input.workflowPack,
    pack,
    assetCount: assets.length,
    renderedAssetIds: assets.map((asset) => asset.id),
    qaChecks: [
      "48px preview preserves object context without becoming a dark blurry thumbnail.",
      "120px preview shows editorial frame, rim highlight, crop, and provenance badge.",
      "Slide-size preview blends with consulting-2p5d vector assets through shared shadow, muted wash, and SVG annotation anchors.",
      "PPTX/DOCX export must name exact realistic asset IDs as image fallbacks with provenance."
    ],
    assets,
    templates,
    templateQa,
    flagshipDemo: flagshipTemplate && flagshipQa ? {
      templateId: flagshipTemplate.id,
      name: flagshipTemplate.name,
      description: flagshipTemplate.description,
      nodeCountEstimate: estimateTemplateNodeCount(flagshipTemplate),
      qaStatus: flagshipQa.qaStatus,
      score: flagshipQa.score
    } : undefined,
    exportSnapshot,
    quality,
    visualQa,
    svg: renderRealisticAssetGallerySvg({ workflowPack: input.workflowPack, styleProfile, limit: input.limit })
  };
}

export function renderRealisticAssetGallerySvg(input: {
  workflowPack?: string;
  styleProfile?: AssetStyleProfile | string;
  columns?: number;
  limit?: number;
} = {}): string {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? "scientific-editorial-realism") as AssetStyleProfile;
  const assets = listRealisticAssets({ workflowPack: input.workflowPack }).slice(0, input.limit ?? REALISTIC_ASSETS.length);
  const columns = input.columns ?? 5;
  const cellWidth = 210;
  const cellHeight = 178;
  const rows = Math.max(1, Math.ceil(assets.length / columns));
  const width = columns * cellWidth + 36;
  const height = rows * cellHeight + 86;
  const cards = assets.map((asset, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = 18 + col * cellWidth;
    const y = 68 + row * cellHeight;
    const badge = asset.qualityTier === "signature" ? "SIGNATURE REALISM" : asset.qualityTier === "hero" ? "HERO REALISM" : "EDITORIAL";
    return `<g class="realistic-gallery-card" data-asset-id="${escapeXml(asset.id)}" transform="translate(${x} ${y})"><rect x="3" y="3" width="${cellWidth - 10}" height="${cellHeight - 10}" rx="14" fill="#ffffff" stroke="${asset.qualityTier === "signature" ? "#7dd3fc" : "#dbe4f0"}"/><g transform="translate(14 13)">${renderRealisticAssetGlyph(asset, 178, 124, { styleProfile, showCaption: false })}</g><text x="${cellWidth / 2}" y="${cellHeight - 30}" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="10.5" font-weight="850">${escapeXml(trimLabel(asset.name, 25))}</text><text x="${cellWidth / 2}" y="${cellHeight - 14}" text-anchor="middle" fill="#0f766e" font-family="Inter, Arial, sans-serif" font-size="8.5" font-weight="850">${escapeXml(badge)}</text></g>`;
  }).join("");
  const subtitle = input.workflowPack ? `${input.workflowPack} / ${assets.length} realistic assets` : `${assets.length} scientific editorial realistic assets`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="realistic-asset-gallery" data-workflow-pack="${escapeXml(input.workflowPack ?? "all-realistic")}" data-style-profile="${escapeXml(styleProfile)}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Scientific editorial realistic asset gallery"><defs>${renderRealisticAssetDefs()}</defs><rect width="${width}" height="${height}" rx="18" fill="#f8fafc"/><rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="16" fill="none" stroke="#dbe4f0"/><text x="24" y="32" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="900">Scientific Editorial Realism</text><text x="24" y="52" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="750">${escapeXml(subtitle)}</text>${cards}</svg>`;
}

export function getWorkflowPackQuality(packId: string): WorkflowPackQuality {
  const pack = getWorkflowPack(packId);
  const assetById = new Map(CURATED_ASSETS.map((asset) => [asset.id, asset]));
  const templateIds = new Set(PREMIUM_WORKFLOW_TEMPLATES.map((template) => template.id));
  const assets = pack.assetIds.map((assetId) => assetById.get(assetId)).filter((asset): asset is PremiumAsset => Boolean(asset));
  const missingAssetIds = pack.assetIds.filter((assetId) => !assetById.has(assetId));
  const missingTemplateIds = pack.templates.filter((templateId) => !templateIds.has(templateId));
  const signatureOrHeroCount = assets.filter((asset) => asset.qualityTier === "signature" || asset.qualityTier === "hero").length;
  const signatureCoverage = Math.round((signatureOrHeroCount / Math.max(1, pack.assetIds.length)) * 100) / 100;
  const exportRisks = [
    signatureOrHeroCount ? "PPTX embeds layered signature/hero SVG assets as visual-fidelity fallbacks until native shape mapping is expanded." : "",
    assets.some((asset) => asset.panelRole === "warning") ? "Warning/risk assets should be reviewed before deck export to avoid overstated claims." : ""
  ].filter(Boolean);
  const qaStatus: WorkflowPackQuality["qaStatus"] = missingAssetIds.length || missingTemplateIds.length
    ? "incomplete"
    : pack.assetIds.length >= 20 && pack.templates.length >= 4 && signatureOrHeroCount >= Math.min(10, pack.assetIds.length)
      ? "premium"
      : "needs-polish";
  return {
    packId: pack.id,
    assetCount: assets.length,
    signatureOrHeroCount,
    signatureCoverage,
    templateCount: pack.templates.length,
    missingAssetIds,
    missingTemplateIds,
    exportRisks,
    qaStatus
  };
}

export function getWorkflowPackGallery(packId: string, input: { styleProfile?: AssetStyleProfile | string } = {}): WorkflowPackGallery {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile;
  const pack = getWorkflowPack(packId);
  const assets = pack.assetIds.map((assetId) => getAsset(assetId));
  const templates = pack.templates.map((templateId) => getWorkflowTemplate(templateId));
  const flagshipTemplate = getWorkflowTemplate(pack.flagshipTemplateId ?? templates[0]?.id ?? pack.templates[0]);
  const templateQa = templates.map((template) => getWorkflowTemplateQa(template.id, { styleProfile }));
  const flagshipQa = templateQa.find((qa) => qa.templateId === flagshipTemplate.id) ?? getWorkflowTemplateQa(flagshipTemplate.id, { styleProfile });
  const exportSnapshot = createWorkflowPackExportSnapshot(pack, templates, templateQa, styleProfile);
  return {
    pack,
    assets,
    templates,
    templateQa,
    flagshipDemo: {
      templateId: flagshipTemplate.id,
      name: flagshipTemplate.name,
      description: flagshipTemplate.description,
      nodeCountEstimate: estimateTemplateNodeCount(flagshipTemplate),
      qaStatus: flagshipQa.qaStatus,
      score: flagshipQa.score
    },
    compactGallery: {
      styleProfile,
      assetIds: assets.slice(0, 18).map((asset) => asset.id),
      svg: renderWorkflowPackGallerySvg(pack.id, { styleProfile })
    },
    exportSnapshot,
    quality: getWorkflowPackQuality(pack.id)
  };
}

export function getWorkflowPackVisualQaGallery(packId: string, input: {
  styleProfile?: AssetStyleProfile | string;
  limit?: number;
} = {}): WorkflowPackVisualQaGallery {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile;
  const pack = getWorkflowPack(packId);
  const assets = pack.assetIds.map((assetId) => getAsset(assetId)).slice(0, input.limit ?? 12);
  const previewSizes: WorkflowPackVisualQaGallery["previewSizes"] = [
    { id: "icon", width: 48, height: 48 },
    { id: "preview", width: 120, height: 90 },
    { id: "slide", width: 240, height: 150 }
  ];
  const qaChecks = [
    "48px icon: recognizable silhouette without label.",
    "120px preview: premium depth, rim highlight, and micro-detail visible without clutter.",
    "Slide-size: editable parts and connector anchors remain visually clear.",
    "Publication-line style should remove decorative depth without losing scientific identity.",
    "Risk-warning style should emphasize review/permission assets without overstating claims."
  ];
  const snapshotKey = [
    pack.id,
    styleProfile,
    assets.map((asset) => `${asset.id}:${asset.renderSpec.assetRecipe}:${asset.qualityTier}:${asset.qaStatus}`).join(",")
  ].join("|");
  return {
    packId: pack.id,
    styleProfile,
    previewSizes,
    assetCount: pack.assetIds.length,
    renderedAssetIds: assets.map((asset) => asset.id),
    qaChecks,
    snapshotKey,
    svg: renderWorkflowPackVisualQaGallerySvg(pack.id, { styleProfile, limit: input.limit })
  };
}

export function getWorkflowPackExportSnapshot(packId: string, input: { styleProfile?: AssetStyleProfile | string } = {}): WorkflowPackExportSnapshot {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile;
  const pack = getWorkflowPack(packId);
  const templates = pack.templates.map((templateId) => getWorkflowTemplate(templateId));
  const templateQa = templates.map((template) => getWorkflowTemplateQa(template.id, { styleProfile }));
  return createWorkflowPackExportSnapshot(pack, templates, templateQa, styleProfile);
}

function createWorkflowPackExportSnapshot(
  pack: WorkflowPack,
  templates: WorkflowTemplate[],
  templateQa: WorkflowTemplateQaReport[],
  styleProfile: AssetStyleProfile
): WorkflowPackExportSnapshot {
  const qaByTemplateId = new Map(templateQa.map((qa) => [qa.templateId, qa]));
  const templateSnapshots = templates.map((template) => {
    const qa = qaByTemplateId.get(template.id) ?? getWorkflowTemplateQa(template.id, { styleProfile });
    const fallbackAssetIds = qa.exportReadiness.pptx.fallbackAssets.map((asset) => asset.assetId);
    return {
      templateId: template.id,
      name: template.name,
      qaStatus: qa.qaStatus,
      score: qa.score,
      nodeCount: qa.nodeCount,
      plotFallbackCount: qa.exportReadiness.pptx.plotFallbackCount,
      premiumAssetFallbackCount: qa.exportReadiness.pptx.premiumAssetFallbackCount,
      fallbackAssetIds,
      exportWarnings: [...qa.exportWarnings],
      reviewAction: qa.exportReadiness.pptx.nextAction
    };
  });
  const uniqueFallbackAssetIds = uniqueValues(templateSnapshots.flatMap((template) => template.fallbackAssetIds)).sort();
  const totalPlotFallbackCount = templateSnapshots.reduce((sum, template) => sum + template.plotFallbackCount, 0);
  const totalPremiumAssetFallbackCount = templateSnapshots.reduce((sum, template) => sum + template.premiumAssetFallbackCount, 0);
  const blockedTemplateCount = templateSnapshots.filter((template) => template.qaStatus === "incomplete").length;
  const premiumTemplateCount = templateSnapshots.filter((template) => template.qaStatus === "premium").length;
  const status: WorkflowPackExportSnapshot["status"] = blockedTemplateCount
    ? "blocked"
    : totalPlotFallbackCount || totalPremiumAssetFallbackCount || premiumTemplateCount < templateSnapshots.length
      ? "needs-review"
      : "pass";
  const warnings = [
    blockedTemplateCount ? `${blockedTemplateCount} template(s) are blocked by layout/provenance/claim QA.` : "",
    totalPremiumAssetFallbackCount ? `PPTX has ${totalPremiumAssetFallbackCount} premium SVG fallback asset reference(s) across ${pack.id}.` : "",
    totalPlotFallbackCount ? `PPTX has ${totalPlotFallbackCount} editable PlotSpec placeholder(s) across ${pack.id}.` : "",
    "DOCX exports figure-panel snapshots with captions/provenance; edit canonical scene JSON for object-level changes."
  ].filter(Boolean);
  const snapshotKey = [
    pack.id,
    styleProfile,
    ...templateSnapshots.map((template) => [
      template.templateId,
      template.qaStatus,
      template.score,
      template.nodeCount,
      template.premiumAssetFallbackCount,
      template.plotFallbackCount
    ].join(":"))
  ].join("|");
  return {
    packId: pack.id,
    styleProfile,
    status,
    templateCount: templateSnapshots.length,
    premiumTemplateCount,
    blockedTemplateCount,
    totalNodeCount: templateSnapshots.reduce((sum, template) => sum + template.nodeCount, 0),
    totalPlotFallbackCount,
    totalPremiumAssetFallbackCount,
    uniqueFallbackAssetIds,
    exportFormats: {
      svg: {
        status: "full-vector",
        action: "SVG is the canonical visual snapshot for premium workflow packs."
      },
      pdf: {
        status: "full-vector",
        action: "PDF preserves vector scene rendering for review and presentation handoff."
      },
      pptx: {
        status: totalPlotFallbackCount || totalPremiumAssetFallbackCount ? "editable-with-fallbacks" : "editable",
        action: totalPlotFallbackCount || totalPremiumAssetFallbackCount
          ? "Review exact fallback assets and plots before sending editable PPTX."
          : "PPTX has no known automated fallback warnings for this workflow pack."
      },
      docx: {
        status: "figure-panel",
        action: "DOCX should be treated as a figure-panel export with caption and provenance."
      }
    },
    templates: templateSnapshots,
    warnings,
    nextAction: status === "blocked"
      ? "Fix incomplete templates before using this workflow pack in final exports."
      : status === "needs-review"
        ? "Run visual QA on gallery SVG/PDF and inspect PPTX fallback warnings by named asset before delivery."
        : "Workflow pack export snapshot has no blocking automated warnings.",
    snapshotKey
  };
}

export function renderWorkflowPackGallerySvg(packId: string, input: {
  styleProfile?: AssetStyleProfile | string;
  columns?: number;
  cellWidth?: number;
  cellHeight?: number;
  limit?: number;
} = {}): string {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile;
  const pack = getWorkflowPack(packId);
  const assets = pack.assetIds.map((assetId) => getAsset(assetId));
  const limit = Math.max(4, Math.min(input.limit ?? 18, assets.length));
  const columns = Math.max(2, Math.min(input.columns ?? 6, 8));
  const cellWidth = input.cellWidth ?? 136;
  const cellHeight = input.cellHeight ?? 132;
  const headerHeight = 56;
  const rows = Math.ceil(limit / columns);
  const width = columns * cellWidth + 32;
  const height = headerHeight + rows * cellHeight + 24;
  const quality = getWorkflowPackQuality(pack.id);
  const cards = assets.slice(0, limit).map((asset, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = 16 + col * cellWidth;
    const y = headerHeight + row * cellHeight;
    const badge = asset.qualityTier === "signature" ? "SIG" : asset.qualityTier === "hero" ? "HERO" : "STD";
    return `<g class="workflow-gallery-card ${escapeXml(asset.qualityTier)}" data-asset-id="${escapeXml(asset.id)}" transform="translate(${x} ${y})"><rect x="4" y="4" width="${cellWidth - 12}" height="${cellHeight - 12}" rx="10" fill="#ffffff" stroke="${asset.qualityTier === "signature" ? "#7dd3fc" : "#dbe4f0"}"/><g transform="translate(${Math.round((cellWidth - 112) / 2)} 12)">${renderPremiumAssetGlyph(asset, 112, 82, { showLabel: false, styleProfile })}</g><text x="${cellWidth / 2}" y="${cellHeight - 30}" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="10.5" font-weight="800">${escapeXml(trimLabel(asset.name, 18))}</text><text x="${cellWidth / 2}" y="${cellHeight - 14}" text-anchor="middle" fill="#2563eb" font-family="Inter, Arial, sans-serif" font-size="8.5" font-weight="800">${escapeXml(badge)}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="workflow-pack-gallery" data-workflow-pack="${escapeXml(pack.id)}" data-style-profile="${escapeXml(styleProfile)}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(pack.name)} gallery"><defs>${renderPremiumAssetDefs()}</defs><rect width="${width}" height="${height}" rx="16" fill="#f8fafc"/><rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="14" fill="none" stroke="#dbe4f0"/><text x="24" y="31" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="900">${escapeXml(pack.name)}</text><text x="24" y="48" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="700">${quality.assetCount} assets / ${quality.signatureOrHeroCount} premium / ${quality.templateCount} templates / ${escapeXml(quality.qaStatus)}</text>${cards}</svg>`;
}

export function renderWorkflowPackVisualQaGallerySvg(packId: string, input: {
  styleProfile?: AssetStyleProfile | string;
  limit?: number;
} = {}): string {
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile) as AssetStyleProfile;
  const pack = getWorkflowPack(packId);
  const assets = pack.assetIds.map((assetId) => getAsset(assetId)).slice(0, input.limit ?? 12);
  const rowH = 184;
  const headerH = 84;
  const width = 920;
  const height = headerH + assets.length * rowH + 28;
  const rows = assets.map((asset, index) => {
    const y = headerH + index * rowH;
    const icon = renderPremiumAssetGlyph(asset, 48, 48, { showLabel: false, styleProfile });
    const preview = renderPremiumAssetGlyph(asset, 120, 90, { showLabel: false, styleProfile });
    const slide = renderPremiumAssetGlyph(asset, 240, 150, { showLabel: false, styleProfile });
    const quality = asset.qualityTier === "signature" ? "#dcfce7" : asset.qualityTier === "hero" ? "#dbeafe" : "#f1f5f9";
    const qualityText = asset.qualityTier === "signature" ? "#166534" : asset.qualityTier === "hero" ? "#1d4ed8" : "#475569";
    return `<g class="visual-qa-row" data-asset-id="${escapeXml(asset.id)}" transform="translate(0 ${fmt(y)})">
      <rect x="18" y="8" width="${width - 36}" height="${rowH - 16}" rx="14" fill="#ffffff" stroke="#dbe4f0"/>
      <text x="36" y="34" fill="#0f172a" font-size="15" font-weight="800" font-family="Inter, Arial, sans-serif">${escapeXml(asset.name)}</text>
      <text x="36" y="56" fill="#64748b" font-size="11" font-weight="650" font-family="Inter, Arial, sans-serif">${escapeXml(asset.id)} / ${escapeXml(asset.renderSpec.assetRecipe)}</text>
      <rect x="36" y="70" width="92" height="22" rx="11" fill="${quality}"/>
      <text x="82" y="85" text-anchor="middle" fill="${qualityText}" font-size="10" font-weight="800" font-family="Inter, Arial, sans-serif">${escapeXml(asset.qualityTier.toUpperCase())}</text>
      <g transform="translate(190 62)">${icon}</g>
      <text x="214" y="134" text-anchor="middle" fill="#64748b" font-size="10" font-weight="750" font-family="Inter, Arial, sans-serif">48px</text>
      <g transform="translate(320 44)">${preview}</g>
      <text x="380" y="154" text-anchor="middle" fill="#64748b" font-size="10" font-weight="750" font-family="Inter, Arial, sans-serif">120px</text>
      <g transform="translate(560 24)">${slide}</g>
      <text x="680" y="162" text-anchor="middle" fill="#64748b" font-size="10" font-weight="750" font-family="Inter, Arial, sans-serif">slide-size</text>
      <text x="820" y="62" text-anchor="middle" fill="#475569" font-size="10" font-weight="750" font-family="Inter, Arial, sans-serif">fidelity</text>
      <text x="820" y="88" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="850" font-family="Inter, Arial, sans-serif">${escapeXml(String(Math.round(asset.fidelityScore * 100)))}</text>
      <text x="820" y="116" text-anchor="middle" fill="#64748b" font-size="10" font-weight="650" font-family="Inter, Arial, sans-serif">${escapeXml(asset.panelRole)}</text>
    </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="workflow-pack-visual-qa-gallery" data-workflow-pack="${escapeXml(pack.id)}" data-style-profile="${escapeXml(styleProfile)}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(pack.name)} visual QA gallery">
    <defs>${renderPremiumAssetDefs()}</defs>
    <rect width="${width}" height="${height}" rx="18" fill="#edf2f8"/>
    <rect x="18" y="18" width="${width - 36}" height="50" rx="14" fill="#ffffff" stroke="#dbe4f0"/>
    <text x="38" y="49" fill="#0f172a" font-size="18" font-weight="850" font-family="Inter, Arial, sans-serif">${escapeXml(pack.name)} visual QA</text>
    <text x="${width - 38}" y="49" text-anchor="end" fill="#64748b" font-size="12" font-weight="750" font-family="Inter, Arial, sans-serif">${escapeXml(styleProfile)} / ${assets.length} of ${pack.assetIds.length} assets</text>
    ${rows}
  </svg>`;
}

export function createFlagshipWorkflowDemoNodes(input: {
  workflowPack: string;
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
  stepCount?: number;
}): SceneNode[] {
  const pack = getWorkflowPack(input.workflowPack);
  return createWorkflowFigureNodes({
    workflowPack: pack.id,
    templateId: pack.flagshipTemplateId ?? pack.templates[0],
    styleProfile: input.styleProfile,
    x: input.x,
    y: input.y,
    width: input.width,
    stepCount: input.stepCount
  });
}

export function getWorkflowTemplateQa(templateId: string, input: {
  styleProfile?: AssetStyleProfile | string;
  pageWidth?: number;
  pageHeight?: number;
} = {}): WorkflowTemplateQaReport {
  const template = getWorkflowTemplate(templateId);
  const styleProfile = normalizeAssetStyleProfile(input.styleProfile ?? template.recommendedStyleProfile) as AssetStyleProfile;
  const pageSize = {
    width: input.pageWidth ?? PAGE_PRESETS.slide.width,
    height: input.pageHeight ?? PAGE_PRESETS.slide.height
  };
  const nodes = createWorkflowFigureNodes({ templateId, styleProfile });
  const symbols = nodes.filter((node) => node.kind === "symbol");
  const images = nodes.filter((node) => node.kind === "image");
  const plots = nodes.filter((node) => node.kind === "plot");
  const textNodes = nodes.filter((node) => node.kind === "text");
  const connectors = nodes.filter((node) => node.kind === "connector");
  const outOfBounds = nodes.filter((node) => nodeOutOfBounds(node, pageSize.width, pageSize.height));
  const textOverflow = nodes.filter(templateTextLikelyOverflows);
  const missingProvenance = nodes.filter((node) => !node.provenance?.source || !node.provenance?.license);
  const needsCitation = nodes.filter((node) => node.claimStatus === "needs-citation" && !isStructuralReviewTextNode(node) && !isEvidenceReviewNode(node));
  const unsupported = nodes.filter((node) => node.claimStatus === "unsupported-claim");
  const premiumFallbackAssetIds = uniqueValues(symbols
    .filter((node) => {
      const payload = node.payload as { styleProfile?: string; appearance?: { styleProfile?: string }; assetId?: string };
      return Boolean(payload.assetId && (payload.styleProfile || payload.appearance?.styleProfile));
    })
    .map((node) => (node.payload as { assetId?: string }).assetId)
    .filter((assetId): assetId is string => Boolean(assetId)));
  const realisticImageFallbackAssetIds = uniqueValues(images
    .map((node) => (node.payload as { assetId?: string }).assetId)
    .filter((assetId): assetId is string => Boolean(assetId))
    .filter((assetId) => isRealisticAsset(getAnyAsset(assetId))));
  const fallbackAssetIds = uniqueValues([...premiumFallbackAssetIds, ...realisticImageFallbackAssetIds]);
  const fallbackAssetDetails = fallbackAssetIds.map((assetId) => {
    const asset = getAnyAsset(assetId);
    const realistic = isRealisticAsset(asset);
    return {
      assetId: asset.id,
      name: asset.name,
      qualityTier: asset.qualityTier,
      assetRecipe: asset.renderSpec?.assetRecipe ?? asset.mediaType ?? "scientific-editorial-realism",
      panelRole: asset.panelRole,
      workflowPacks: [...asset.workflowPacks],
      exportBehavior: realistic ? "embed-image-fallback" as const : "embed-svg-fallback" as const,
      action: realistic
        ? `${asset.name} is a scientific editorial realistic image panel; inspect PPTX/DOCX visual fidelity and keep SVG/PDF plus scene JSON as canonical exports.`
        : `${asset.name} uses layered structured SVG; inspect PPTX visual fidelity and keep SVG/PDF as canonical exports if native editability is required.`
    };
  });
  const issues: WorkflowTemplateQaIssue[] = [];
  const actionItems: WorkflowTemplateQaActionItem[] = [];
  if (outOfBounds.length) {
    issues.push({
      severity: "error",
      kind: "bounds",
      message: `${outOfBounds.length} object(s) extend outside the 16:9 slide bounds.`,
      nodeIds: outOfBounds.map((node) => node.id)
    });
    actionItems.push({
      severity: "error",
      kind: "bounds",
      title: "Move clipped objects inside the slide",
      action: `Reposition or resize ${outOfBounds.length} object(s) before exporting so SVG/PDF/PPTX do not clip content.`,
      nodeIds: outOfBounds.map((node) => node.id)
    });
  }
  if (textOverflow.length) {
    issues.push({
      severity: "warning",
      kind: "text-overflow",
      message: `${textOverflow.length} text object(s) may overflow their boxes at export scale.`,
      nodeIds: textOverflow.map((node) => node.id)
    });
    actionItems.push({
      severity: "warning",
      kind: "text-overflow",
      title: "Shorten or widen template text",
      action: `Shorten copy or increase text boxes for ${textOverflow.length} text object(s) to keep deck export readable.`,
      nodeIds: textOverflow.map((node) => node.id)
    });
  }
  if (missingProvenance.length) {
    issues.push({
      severity: "error",
      kind: "provenance",
      message: `${missingProvenance.length} object(s) are missing source or license provenance.`,
      nodeIds: missingProvenance.map((node) => node.id)
    });
    actionItems.push({
      severity: "error",
      kind: "provenance",
      title: "Add missing provenance fields",
      action: `Attach source and license metadata to ${missingProvenance.length} object(s), or mark uploads as private/unverified.`,
      nodeIds: missingProvenance.map((node) => node.id)
    });
  }
  if (unsupported.length || needsCitation.length) {
    issues.push({
      severity: unsupported.length ? "error" : "warning",
      kind: "claim",
      message: unsupported.length
        ? `${unsupported.length} object(s) are marked as unsupported scientific claims.`
        : `${needsCitation.length} object(s) need citation or user confirmation.`,
      nodeIds: [...unsupported, ...needsCitation].map((node) => node.id)
    });
    if (unsupported.length) {
      actionItems.push({
        severity: "error",
        kind: "claim",
        title: "Remove unsupported claims",
        action: `Delete, rewrite, or source ${unsupported.length} unsupported claim object(s) before this template is export-ready.`,
        nodeIds: unsupported.map((node) => node.id)
      });
    }
    if (needsCitation.length) {
      actionItems.push({
        severity: "warning",
        kind: "claim",
        title: "Resolve claim citations",
        action: `Attach citations or mark user-confirmed for ${needsCitation.length} claim/data object(s) before final PPTX/PDF export.`,
        nodeIds: needsCitation.map((node) => node.id)
      });
    }
  }
  const exportWarnings: string[] = [];
  if (plots.length) {
    exportWarnings.push(`${plots.length} editable PlotSpec plot(s) export to PPTX as editable placeholders in this MVP.`);
    actionItems.push({
      severity: "info",
      kind: "export",
      title: "Review plot PPTX editability",
      action: `${plots.length} PlotSpec plot(s) preserve SVG/PDF fidelity; verify PPTX fallback/editability before sending the deck.`,
      nodeIds: plots.map((node) => node.id)
    });
  }
  if (fallbackAssetIds.length) {
    exportWarnings.push(`PPTX premium fallback assets: ${describeTemplateQaList(fallbackAssetIds, 10)}.`);
    issues.push({
      severity: "warning",
      kind: "export",
      message: `PPTX fallback warning will name ${fallbackAssetIds.length} premium layered SVG/image asset(s).`,
      nodeIds: [...symbols, ...images].map((node) => node.id)
    });
    actionItems.push({
      severity: "info",
      kind: "export",
      title: "Confirm premium asset fallback",
      action: `PPTX will embed ${fallbackAssetIds.length} layered premium asset(s) as SVG/image fallbacks: ${describeTemplateQaList(fallbackAssetIds, 6)}. See exportReadiness.pptx.fallbackAssets for asset names, recipes, and exact follow-up actions.`,
      nodeIds: [...symbols, ...images].map((node) => node.id)
    });
  }
  const exportReadiness: WorkflowTemplateExportReadiness = {
    svg: {
      status: "full-vector",
      action: "Use SVG as the canonical structured visual export; premium assets, depth, labels, and PlotSpec rendering preserve visual fidelity."
    },
    pdf: {
      status: "full-vector",
      action: "Use PDF for sharing/review; vector scene structure and depth filters are preserved for presentation-quality output."
    },
    pptx: {
      status: plots.length || fallbackAssetDetails.length ? "editable-with-fallbacks" : "editable",
      plotFallbackCount: plots.length,
      premiumAssetFallbackCount: fallbackAssetDetails.length,
      fallbackAssets: fallbackAssetDetails,
      warnings: [...exportWarnings],
      nextAction: plots.length || fallbackAssetDetails.length
        ? "Before sending PPTX, review embedded SVG/plot fallbacks visually and keep the scene JSON/SVG as the editable source of truth."
        : "PPTX export has no known automated fallback warnings for this template."
    },
    docx: {
      status: "figure-panel",
      action: "DOCX export should embed the figure panel with caption/provenance; do not promise Word-native editable scientific shapes for this milestone."
    }
  };
  if (!symbols.length || !textNodes.length) {
    issues.push({
      severity: "warning",
      kind: "coverage",
      message: "Template should include both editable scientific symbols and editable text annotations.",
      nodeIds: []
    });
    actionItems.push({
      severity: "warning",
      kind: "coverage",
      title: "Add editable visual coverage",
      action: "Add at least one editable scientific symbol and one editable text annotation so agents and humans can revise the template.",
      nodeIds: []
    });
  }
  const score = Math.max(0, Math.min(100, Math.round(
    100
    - outOfBounds.length * 18
    - textOverflow.length * 7
    - missingProvenance.length * 18
    - unsupported.length * 24
    - Math.min(12, needsCitation.length * 1.2)
    - (symbols.length ? 0 : 12)
    - (plots.length && ["results", "multi-panel", "pipeline"].includes(template.layout) ? 0 : 4)
  )));
  const qaStatus: WorkflowTemplateQaReport["qaStatus"] = outOfBounds.length || missingProvenance.length || unsupported.length
    ? "incomplete"
    : score >= 78 && !textOverflow.length
      ? "premium"
      : "needs-polish";
  if (!issues.some((issue) => issue.severity !== "pass")) {
    issues.push({
      severity: "pass",
      kind: "coverage",
      message: "Template passes bounds, provenance, text-fit, and editable-scene QA checks.",
      nodeIds: []
    });
  }
  if (!actionItems.length) {
    actionItems.push({
      severity: "pass",
      kind: "coverage",
      title: "Ready for review",
      action: "Template passes automated layout, provenance, text-fit, and editable-scene QA checks.",
      nodeIds: []
    });
  }
  return {
    templateId: template.id,
    workflowPack: template.workflowPack,
    styleProfile,
    pageSize,
    nodeCount: nodes.length,
    symbolCount: symbols.length,
    plotCount: plots.length,
    textCount: textNodes.length,
    connectorCount: connectors.length,
    missingProvenanceCount: missingProvenance.length,
    needsCitationCount: needsCitation.length,
    unsupportedClaimCount: unsupported.length,
    outOfBoundsCount: outOfBounds.length,
    textOverflowCount: textOverflow.length,
    premiumFallbackAssetIds: fallbackAssetIds,
    exportReadiness,
    exportWarnings,
    score,
    qaStatus,
    issues,
    actionItems
  };
}

function estimateTemplateNodeCount(template: WorkflowTemplate): number {
  if (template.id === "manuscript-results-figure") return 28;
  if (template.layout === "hybrid-template") return 24;
  if (template.layout === "multi-panel" || template.layout === "results") return 4 + template.previewAssetIds.length * 5;
  return 4 + Math.min(6, template.previewAssetIds.length) * 3;
}

function trimLabel(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(1, maxLength - 1)).trim()}...`;
}

function nodeOutOfBounds(node: SceneNode, pageWidth: number, pageHeight: number): boolean {
  return node.transform.x < -2
    || node.transform.y < -2
    || node.transform.x + node.transform.width > pageWidth + 2
    || node.transform.y + node.transform.height > pageHeight + 2;
}

function templateTextLikelyOverflows(node: SceneNode): boolean {
  if (node.kind !== "text" && node.kind !== "shape") return false;
  const text = node.kind === "text"
    ? String((node.payload as { text?: string }).text ?? "")
    : String((node.payload as { label?: string }).label ?? node.name ?? "");
  if (!text.trim()) return false;
  const fontSize = Number(node.style.fontSize ?? 16);
  const charsPerLine = Math.max(5, Math.floor(node.transform.width / Math.max(5, fontSize * 0.52)));
  const maxLines = Math.max(1, Math.floor(node.transform.height / Math.max(8, fontSize * 1.18)));
  const longWord = text.split(/\s+/).some((word) => word.length > charsPerLine + 4);
  const neededLines = Math.ceil(text.length / charsPerLine);
  return longWord || neededLines > maxLines + 1;
}

function uniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function describeTemplateQaList(values: string[], limit: number): string {
  const shown = values.slice(0, limit);
  const extra = values.length - shown.length;
  return `${shown.join(", ")}${extra > 0 ? `, +${extra} more` : ""}`;
}

function renderFamily(asset: PremiumAsset, width: number, height: number, palette: ReturnType<typeof variantPalette>): string {
  const cx = width / 2;
  const cy = height * 0.42;
  const s = Math.min(width, height) / 120;
  const common = `stroke="${palette.stroke}" stroke-width="${fmt(2.3 * s)}" stroke-linecap="round" stroke-linejoin="round"`;
  const fine = `stroke="${palette.stroke}" stroke-width="${fmt(1.35 * s)}" stroke-linecap="round" stroke-linejoin="round"`;
  const depth = assetDepth(cx, cy, s, palette);
  const shine = `<ellipse cx="${fmt(cx - 18 * s)}" cy="${fmt(cy - 22 * s)}" rx="${fmt(18 * s)}" ry="${fmt(7 * s)}" fill="#ffffff" opacity="0.36"/>`;
  switch (asset.family) {
    case "cell":
      return `${depth}<path d="${cellMembrane(cx, cy, s)}" fill="${palette.fill}" ${common}/><path d="${cellMembrane(cx, cy, s * 0.82)}" fill="${palette.secondary}" opacity="0.28"/><circle cx="${fmt(cx - 9 * s)}" cy="${fmt(cy)}" r="${fmt(13 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx - 11 * s)}" cy="${fmt(cy - 3 * s)}" r="${fmt(4.5 * s)}" fill="#ffffff" opacity="0.55"/><circle cx="${fmt(cx + 20 * s)}" cy="${fmt(cy - 10 * s)}" r="${fmt(5 * s)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 25 * s)}" cy="${fmt(cy + 9 * s)}" r="${fmt(3.8 * s)}" fill="${palette.accent}" opacity="0.7"/><path d="M${fmt(cx - 36 * s)},${fmt(cy + 8 * s)} C${fmt(cx - 12 * s)},${fmt(cy + 25 * s)} ${fmt(cx + 20 * s)},${fmt(cy + 20 * s)} ${fmt(cx + 38 * s)},${fmt(cy + 1 * s)}" fill="none" ${fine} opacity="0.5"/>${cellMotif(asset, cx, cy, s, palette)}${shine}`;
    case "molecule":
      if (asset.id.includes("droplet")) {
        return `${depth}<path d="M${fmt(cx)},${fmt(cy - 42 * s)} C${fmt(cx + 30 * s)},${fmt(cy - 10 * s)} ${fmt(cx + 38 * s)},${fmt(cy + 13 * s)} ${fmt(cx + 23 * s)},${fmt(cy + 31 * s)} C${fmt(cx + 7 * s)},${fmt(cy + 50 * s)} ${fmt(cx - 27 * s)},${fmt(cy + 41 * s)} ${fmt(cx - 34 * s)},${fmt(cy + 14 * s)} C${fmt(cx - 39 * s)},${fmt(cy - 8 * s)} ${fmt(cx - 21 * s)},${fmt(cy - 25 * s)} ${fmt(cx)},${fmt(cy - 42 * s)} Z" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx - 8 * s)}" cy="${fmt(cy + 6 * s)}" r="${fmt(14 * s)}" fill="${palette.secondary}" ${fine}/><path d="M${fmt(cx + 12 * s)},${fmt(cy - 8 * s)} h${fmt(22 * s)} M${fmt(cx + 10 * s)},${fmt(cy + 5 * s)} h${fmt(26 * s)} M${fmt(cx + 13 * s)},${fmt(cy + 18 * s)} h${fmt(18 * s)}" ${fine}/>${shine}`;
      }
      if (asset.id.includes("barcode") || asset.id.includes("umi") || asset.id.includes("read") || asset.id.includes("matrix") || asset.id.includes("track") || asset.id.includes("variant") || asset.id.includes("copy-number") || asset.id.includes("peak")) {
        return `${depth}<rect x="${fmt(cx - 43 * s)}" y="${fmt(cy - 30 * s)}" width="${fmt(86 * s)}" height="${fmt(60 * s)}" rx="${fmt(12 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 32 * s)},${fmt(cy - 12 * s)} H${fmt(cx + 30 * s)} M${fmt(cx - 32 * s)},${fmt(cy + 4 * s)} H${fmt(cx + 18 * s)} M${fmt(cx - 32 * s)},${fmt(cy + 20 * s)} H${fmt(cx + 34 * s)}" ${fine}/><rect x="${fmt(cx - 36 * s)}" y="${fmt(cy - 24 * s)}" width="${fmt(10 * s)}" height="${fmt(8 * s)}" rx="${fmt(2 * s)}" fill="${palette.accent}"/><rect x="${fmt(cx + 16 * s)}" y="${fmt(cy - 1 * s)}" width="${fmt(20 * s)}" height="${fmt(8 * s)}" rx="${fmt(2 * s)}" fill="${palette.accent}" opacity="0.75"/>`;
      }
      if (asset.id.includes("dna") || asset.id.includes("rna") || asset.id.includes("gene") || asset.id.includes("chromatin")) {
        return `${depth}<path d="M${fmt(cx - 42 * s)},${fmt(cy - 34 * s)} C${fmt(cx + 45 * s)},${fmt(cy - 13 * s)} ${fmt(cx - 45 * s)},${fmt(cy + 13 * s)} ${fmt(cx + 42 * s)},${fmt(cy + 34 * s)}" fill="none" stroke="${palette.stroke}" stroke-width="${fmt(4 * s)}" stroke-linecap="round"/><path d="M${fmt(cx + 42 * s)},${fmt(cy - 34 * s)} C${fmt(cx - 45 * s)},${fmt(cy - 13 * s)} ${fmt(cx + 45 * s)},${fmt(cy + 13 * s)} ${fmt(cx - 42 * s)},${fmt(cy + 34 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(4 * s)}" stroke-linecap="round"/>${helixRungs(cx, cy, s, palette)}${shine}`;
      }
      if (asset.id.includes("antibody")) {
        return `${depth}<path d="M${fmt(cx)},${fmt(cy + 31 * s)} V${fmt(cy - 1 * s)} M${fmt(cx)},${fmt(cy - 1 * s)} L${fmt(cx - 30 * s)},${fmt(cy - 32 * s)} M${fmt(cx)},${fmt(cy - 1 * s)} L${fmt(cx + 30 * s)},${fmt(cy - 32 * s)}" fill="none" stroke="${palette.stroke}" stroke-width="${fmt(9 * s)}" stroke-linecap="round"/><circle cx="${fmt(cx - 34 * s)}" cy="${fmt(cy - 36 * s)}" r="${fmt(9 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx + 34 * s)}" cy="${fmt(cy - 36 * s)}" r="${fmt(9 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx)}" cy="${fmt(cy + 35 * s)}" r="${fmt(8 * s)}" fill="${palette.accent}"/>`;
      }
      return `${depth}<circle cx="${fmt(cx - 26 * s)}" cy="${fmt(cy + 1 * s)}" r="${fmt(18 * s)}" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx + 2 * s)}" cy="${fmt(cy - 19 * s)}" r="${fmt(15 * s)}" fill="${palette.secondary}" ${common}/><circle cx="${fmt(cx + 30 * s)}" cy="${fmt(cy + 8 * s)}" r="${fmt(20 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 9 * s)},${fmt(cy - 7 * s)} L${fmt(cx + 13 * s)},${fmt(cy - 10 * s)} M${fmt(cx + 15 * s)},${fmt(cy - 4 * s)} L${fmt(cx + 19 * s)},${fmt(cy + 2 * s)}" ${fine}/>${shine}`;
    case "perturbation":
      return `${depth}<rect x="${fmt(cx - 44 * s)}" y="${fmt(cy - 26 * s)}" width="${fmt(88 * s)}" height="${fmt(52 * s)}" rx="${fmt(16 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 29 * s)},${fmt(cy + 18 * s)} L${fmt(cx + 30 * s)},${fmt(cy - 20 * s)} M${fmt(cx - 28 * s)},${fmt(cy - 17 * s)} L${fmt(cx + 31 * s)},${fmt(cy + 20 * s)}" ${fine}/><circle cx="${fmt(cx - 28 * s)}" cy="${fmt(cy - 18 * s)}" r="${fmt(8.5 * s)}" fill="${palette.secondary}" ${common}/><circle cx="${fmt(cx - 28 * s)}" cy="${fmt(cy + 18 * s)}" r="${fmt(8.5 * s)}" fill="${palette.secondary}" ${common}/><path d="M${fmt(cx + 10 * s)},${fmt(cy - 31 * s)} C${fmt(cx + 27 * s)},${fmt(cy - 39 * s)} ${fmt(cx + 45 * s)},${fmt(cy - 32 * s)} ${fmt(cx + 51 * s)},${fmt(cy - 15 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * s)}" stroke-dasharray="${fmt(5 * s)} ${fmt(4 * s)}"/>${perturbationMotif(asset, cx, cy, s, palette)}${shine}`;
    case "instrument":
      return `${depth}<rect x="${fmt(cx - 42 * s)}" y="${fmt(cy - 34 * s)}" width="${fmt(84 * s)}" height="${fmt(67 * s)}" rx="${fmt(13 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 42 * s)},${fmt(cy - 16 * s)} H${fmt(cx + 42 * s)}" ${fine} opacity="0.55"/><rect x="${fmt(cx - 27 * s)}" y="${fmt(cy - 23 * s)}" width="${fmt(54 * s)}" height="${fmt(21 * s)}" rx="${fmt(5 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx - 20 * s)}" cy="${fmt(cy + 17 * s)}" r="${fmt(6.5 * s)}" fill="${palette.accent}"/><path d="M${fmt(cx - 5 * s)},${fmt(cy + 16 * s)} H${fmt(cx + 27 * s)} M${fmt(cx - 25 * s)},${fmt(cy + 32 * s)} H${fmt(cx + 25 * s)}" ${fine}/>${instrumentMotif(asset, cx, cy, s, palette)}${shine}`;
    case "spatial":
      return `${depth}<path d="M${fmt(cx - 45 * s)},${fmt(cy - 24 * s)} C${fmt(cx - 27 * s)},${fmt(cy - 48 * s)} ${fmt(cx + 31 * s)},${fmt(cy - 42 * s)} ${fmt(cx + 46 * s)},${fmt(cy - 13 * s)} C${fmt(cx + 61 * s)},${fmt(cy + 19 * s)} ${fmt(cx + 16 * s)},${fmt(cy + 42 * s)} ${fmt(cx - 28 * s)},${fmt(cy + 29 * s)} C${fmt(cx - 55 * s)},${fmt(cy + 20 * s)} ${fmt(cx - 61 * s)},${fmt(cy - 3 * s)} ${fmt(cx - 45 * s)},${fmt(cy - 24 * s)} Z" fill="${palette.fill}" ${common}/>${gridDots(cx, cy, s, palette.accent)}<path d="M${fmt(cx - 37 * s)},${fmt(cy - 9 * s)} C${fmt(cx - 11 * s)},${fmt(cy - 22 * s)} ${fmt(cx + 18 * s)},${fmt(cy - 16 * s)} ${fmt(cx + 40 * s)},${fmt(cy + 4 * s)}" fill="none" ${fine} opacity="0.45"/>${spatialMotif(asset, cx, cy, s, palette)}`;
    case "pathway":
      return `${depth}<circle cx="${fmt(cx - 32 * s)}" cy="${fmt(cy - 14 * s)}" r="${fmt(16 * s)}" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx + 30 * s)}" cy="${fmt(cy - 19 * s)}" r="${fmt(16 * s)}" fill="${palette.secondary}" ${common}/><circle cx="${fmt(cx)}" cy="${fmt(cy + 24 * s)}" r="${fmt(16 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 16 * s)},${fmt(cy - 14 * s)} H${fmt(cx + 13 * s)} M${fmt(cx + 19 * s)},${fmt(cy - 5 * s)} L${fmt(cx + 8 * s)},${fmt(cy + 10 * s)} M${fmt(cx - 21 * s)},${fmt(cy - 1 * s)} L${fmt(cx - 9 * s)},${fmt(cy + 11 * s)}" ${fine}/><circle cx="${fmt(cx + 30 * s)}" cy="${fmt(cy - 19 * s)}" r="${fmt(4 * s)}" fill="${palette.accent}"/>`;
    case "organ":
      return `${depth}<path d="M${fmt(cx - 18 * s)},${fmt(cy - 36 * s)} C${fmt(cx + 36 * s)},${fmt(cy - 50 * s)} ${fmt(cx + 51 * s)},${fmt(cy - 2 * s)} ${fmt(cx + 22 * s)},${fmt(cy + 33 * s)} C${fmt(cx - 8 * s)},${fmt(cy + 65 * s)} ${fmt(cx - 57 * s)},${fmt(cy + 29 * s)} ${fmt(cx - 41 * s)},${fmt(cy - 9 * s)} C${fmt(cx - 34 * s)},${fmt(cy - 24 * s)} ${fmt(cx - 30 * s)},${fmt(cy - 33 * s)} ${fmt(cx - 18 * s)},${fmt(cy - 36 * s)} Z" fill="${palette.fill}" ${common}/><path d="${organVessel(cx, cy, s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * s)}" stroke-linecap="round"/><circle cx="${fmt(cx + 11 * s)}" cy="${fmt(cy)}" r="${fmt(11 * s)}" fill="${palette.secondary}" ${fine}/>${shine}`;
    case "pathogen":
      return `${depth}<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(33 * s)}" fill="${palette.fill}" ${common}/>${spikes(cx, cy, 33 * s, palette.stroke)}<circle cx="${fmt(cx - 11 * s)}" cy="${fmt(cy - 7 * s)}" r="${fmt(6.5 * s)}" fill="${palette.secondary}"/><circle cx="${fmt(cx + 13 * s)}" cy="${fmt(cy + 8 * s)}" r="${fmt(7.5 * s)}" fill="${palette.accent}"/><path d="M${fmt(cx - 16 * s)},${fmt(cy + 13 * s)} C${fmt(cx - 2 * s)},${fmt(cy + 23 * s)} ${fmt(cx + 17 * s)},${fmt(cy + 20 * s)} ${fmt(cx + 24 * s)},${fmt(cy + 5 * s)}" fill="none" ${fine} opacity="0.45"/>`;
    case "space":
      return `${depth}<path d="M${fmt(cx - 8 * s)},${fmt(cy - 40 * s)} L${fmt(cx + 26 * s)},${fmt(cy)} L${fmt(cx - 8 * s)},${fmt(cy + 40 * s)} L${fmt(cx - 21 * s)},${fmt(cy + 12 * s)} L${fmt(cx - 47 * s)},${fmt(cy + 29 * s)} L${fmt(cx - 28 * s)},${fmt(cy)} L${fmt(cx - 47 * s)},${fmt(cy - 29 * s)} L${fmt(cx - 21 * s)},${fmt(cy - 12 * s)} Z" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx + 1 * s)}" cy="${fmt(cy)}" r="${fmt(8 * s)}" fill="${palette.secondary}" ${fine}/><path d="M${fmt(cx - 60 * s)},${fmt(cy + 29 * s)} C${fmt(cx - 10 * s)},${fmt(cy + 59 * s)} ${fmt(cx + 49 * s)},${fmt(cy + 32 * s)} ${fmt(cx + 60 * s)},${fmt(cy - 21 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * s)}" stroke-dasharray="${fmt(6 * s)} ${fmt(5 * s)}"/>`;
    case "modelSystem":
      return `${depth}<rect x="${fmt(cx - 46 * s)}" y="${fmt(cy - 31 * s)}" width="${fmt(92 * s)}" height="${fmt(62 * s)}" rx="${fmt(15 * s)}" fill="${palette.fill}" ${common}/><rect x="${fmt(cx - 35 * s)}" y="${fmt(cy - 20 * s)}" width="${fmt(18 * s)}" height="${fmt(40 * s)}" rx="${fmt(6 * s)}" fill="${palette.secondary}" ${fine}/><rect x="${fmt(cx - 7 * s)}" y="${fmt(cy - 22 * s)}" width="${fmt(18 * s)}" height="${fmt(44 * s)}" rx="${fmt(6 * s)}" fill="#ffffff" opacity="0.65" ${fine}/><rect x="${fmt(cx + 21 * s)}" y="${fmt(cy - 17 * s)}" width="${fmt(18 * s)}" height="${fmt(34 * s)}" rx="${fmt(6 * s)}" fill="${palette.secondary}" ${fine}/><path d="M${fmt(cx - 17 * s)},${fmt(cy - 7 * s)} H${fmt(cx - 7 * s)} M${fmt(cx + 11 * s)},${fmt(cy - 7 * s)} H${fmt(cx + 21 * s)} M${fmt(cx - 17 * s)},${fmt(cy + 9 * s)} H${fmt(cx - 7 * s)} M${fmt(cx + 11 * s)},${fmt(cy + 9 * s)} H${fmt(cx + 21 * s)}" ${fine}/><circle cx="${fmt(cx - 26 * s)}" cy="${fmt(cy - 7 * s)}" r="${fmt(4.5 * s)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 30 * s)}" cy="${fmt(cy + 9 * s)}" r="${fmt(4.5 * s)}" fill="${palette.accent}"/>${modelMotif(asset, cx, cy, s, palette)}`;
    case "dataSystem":
      return `${depth}<ellipse cx="${fmt(cx)}" cy="${fmt(cy - 25 * s)}" rx="${fmt(38 * s)}" ry="${fmt(11 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 38 * s)},${fmt(cy - 25 * s)} V${fmt(cy + 25 * s)} C${fmt(cx - 38 * s)},${fmt(cy + 41 * s)} ${fmt(cx + 38 * s)},${fmt(cy + 41 * s)} ${fmt(cx + 38 * s)},${fmt(cy + 25 * s)} V${fmt(cy - 25 * s)}" fill="${palette.fill}" ${common}/><ellipse cx="${fmt(cx)}" cy="${fmt(cy + 25 * s)}" rx="${fmt(38 * s)}" ry="${fmt(11 * s)}" fill="${palette.secondary}" ${common}/><path d="M${fmt(cx - 28 * s)},${fmt(cy - 4 * s)} H${fmt(cx + 28 * s)} M${fmt(cx - 28 * s)},${fmt(cy + 13 * s)} H${fmt(cx + 28 * s)}" ${fine} opacity="0.55"/>`;
    case "agentSystem":
      return `${depth}<rect x="${fmt(cx - 40 * s)}" y="${fmt(cy - 29 * s)}" width="${fmt(80 * s)}" height="${fmt(58 * s)}" rx="${fmt(17 * s)}" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx - 22 * s)}" cy="${fmt(cy)}" r="${fmt(8 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx + 22 * s)}" cy="${fmt(cy)}" r="${fmt(8 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx)}" cy="${fmt(cy - 17 * s)}" r="${fmt(7 * s)}" fill="#ffffff" opacity="0.72" ${fine}/><path d="M${fmt(cx - 14 * s)},${fmt(cy - 4 * s)} L${fmt(cx - 5 * s)},${fmt(cy - 13 * s)} M${fmt(cx + 5 * s)},${fmt(cy - 13 * s)} L${fmt(cx + 14 * s)},${fmt(cy - 4 * s)} M${fmt(cx - 14 * s)},${fmt(cy + 4 * s)} H${fmt(cx + 14 * s)}" ${fine}/><path d="M${fmt(cx + 47 * s)},${fmt(cy - 8 * s)} A${fmt(19 * s)},${fmt(19 * s)} 0 1 1 ${fmt(cx + 44 * s)},${fmt(cy + 14 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * s)}"/>${agentMotif(asset, cx, cy, s, palette)}`;
    case "metricPanel":
      return `${depth}<rect x="${fmt(cx - 45 * s)}" y="${fmt(cy - 32 * s)}" width="${fmt(90 * s)}" height="${fmt(64 * s)}" rx="${fmt(11 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 29 * s)},${fmt(cy + 19 * s)} V${fmt(cy - 20 * s)} M${fmt(cx - 29 * s)},${fmt(cy + 19 * s)} H${fmt(cx + 31 * s)}" ${fine}/><path d="M${fmt(cx - 23 * s)},${fmt(cy + 11 * s)} C${fmt(cx - 5 * s)},${fmt(cy - 13 * s)} ${fmt(cx + 8 * s)},${fmt(cy + 5 * s)} ${fmt(cx + 26 * s)},${fmt(cy - 18 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(4 * s)}"/><circle cx="${fmt(cx + 26 * s)}" cy="${fmt(cy - 18 * s)}" r="${fmt(4.5 * s)}" fill="${palette.accent}"/>${metricMotif(asset, cx, cy, s, palette)}`;
    case "riskGate":
      return `${depth}<path d="M${fmt(cx)},${fmt(cy - 41 * s)} L${fmt(cx + 40 * s)},${fmt(cy - 19 * s)} V${fmt(cy + 18 * s)} C${fmt(cx + 30 * s)},${fmt(cy + 40 * s)} ${fmt(cx + 13 * s)},${fmt(cy + 49 * s)} ${fmt(cx)},${fmt(cy + 55 * s)} C${fmt(cx - 13 * s)},${fmt(cy + 49 * s)} ${fmt(cx - 30 * s)},${fmt(cy + 40 * s)} ${fmt(cx - 40 * s)},${fmt(cy + 18 * s)} V${fmt(cy - 19 * s)} Z" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 18 * s)},${fmt(cy + 2 * s)} L${fmt(cx - 4 * s)},${fmt(cy + 16 * s)} L${fmt(cx + 20 * s)},${fmt(cy - 13 * s)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(5 * s)}"/><rect x="${fmt(cx - 26 * s)}" y="${fmt(cy + 26 * s)}" width="${fmt(52 * s)}" height="${fmt(8 * s)}" rx="${fmt(4 * s)}" fill="${palette.secondary}" opacity="0.9"/><circle cx="${fmt(cx + 10 * s)}" cy="${fmt(cy + 30 * s)}" r="${fmt(5 * s)}" fill="${palette.accent}"/>${riskMotif(asset, cx, cy, s, palette)}`;
    case "governance":
      return `${depth}<rect x="${fmt(cx - 42 * s)}" y="${fmt(cy - 33 * s)}" width="${fmt(84 * s)}" height="${fmt(66 * s)}" rx="${fmt(11 * s)}" fill="${palette.fill}" ${common}/><circle cx="${fmt(cx - 19 * s)}" cy="${fmt(cy - 10 * s)}" r="${fmt(8.5 * s)}" fill="${palette.secondary}" ${fine}/><circle cx="${fmt(cx + 17 * s)}" cy="${fmt(cy - 10 * s)}" r="${fmt(8.5 * s)}" fill="${palette.secondary}" ${fine}/><path d="M${fmt(cx - 31 * s)},${fmt(cy + 13 * s)} H${fmt(cx + 31 * s)} M${fmt(cx - 26 * s)},${fmt(cy + 25 * s)} H${fmt(cx + 26 * s)}" ${fine}/><circle cx="${fmt(cx + 31 * s)}" cy="${fmt(cy - 29 * s)}" r="${fmt(8 * s)}" fill="${palette.accent}" opacity="0.9"/>`;
    case "workflowBlock":
    default:
      return `${depth}<rect x="${fmt(cx - 46 * s)}" y="${fmt(cy - 31 * s)}" width="${fmt(92 * s)}" height="${fmt(62 * s)}" rx="${fmt(16 * s)}" fill="${palette.fill}" ${common}/><path d="M${fmt(cx - 27 * s)},${fmt(cy)} H${fmt(cx + 21 * s)}" ${fine}/><path d="M${fmt(cx + 12 * s)},${fmt(cy - 11 * s)} L${fmt(cx + 25 * s)},${fmt(cy)} L${fmt(cx + 12 * s)},${fmt(cy + 11 * s)}" fill="none" ${fine}/><circle cx="${fmt(cx - 32 * s)}" cy="${fmt(cy)}" r="${fmt(4.5 * s)}" fill="${palette.accent}"/>`;
  }
}

function assetDepth(cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  const warningGlow = palette.accent === "#dc2626"
    ? `<ellipse class="asset-warning-glow" cx="${fmt(cx)}" cy="${fmt(cy + 2 * scale)}" rx="${fmt(58 * scale)}" ry="${fmt(46 * scale)}" fill="${palette.accent}" opacity="0.18" filter="url(#asset-warning-glow)"/>`
    : "";
  return [
    warningGlow,
    `<ellipse class="asset-contact-shadow" cx="${fmt(cx)}" cy="${fmt(cy + 45 * scale)}" rx="${fmt(48 * scale)}" ry="${fmt(11 * scale)}" fill="#0f172a" opacity="0.16" filter="url(#asset-contact-shadow)"/>`,
    `<ellipse class="asset-soft-body-gradient" cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(55 * scale)}" ry="${fmt(43 * scale)}" fill="${palette.secondary}" opacity="0.26"/>`,
    `<ellipse class="asset-body-depth-overlay" cx="${fmt(cx)}" cy="${fmt(cy - 2 * scale)}" rx="${fmt(51 * scale)}" ry="${fmt(39 * scale)}" fill="url(#asset-body-depth)" opacity="0.78"/>`,
    `<ellipse class="asset-rim-highlight" cx="${fmt(cx)}" cy="${fmt(cy - 2 * scale)}" rx="${fmt(51 * scale)}" ry="${fmt(39 * scale)}" fill="none" stroke="#ffffff" stroke-width="${fmt(1.4 * scale)}" opacity="0.56"/>`,
    `<ellipse class="asset-inner-highlight" cx="${fmt(cx - 17 * scale)}" cy="${fmt(cy - 24 * scale)}" rx="${fmt(18 * scale)}" ry="${fmt(6.5 * scale)}" fill="#ffffff" opacity="0.38"/>`
  ].join("");
}

function cellMembrane(cx: number, cy: number, scale: number): string {
  return `M${fmt(cx - 43 * scale)},${fmt(cy - 8 * scale)} C${fmt(cx - 39 * scale)},${fmt(cy - 33 * scale)} ${fmt(cx - 10 * scale)},${fmt(cy - 43 * scale)} ${fmt(cx + 19 * scale)},${fmt(cy - 34 * scale)} C${fmt(cx + 49 * scale)},${fmt(cy - 24 * scale)} ${fmt(cx + 52 * scale)},${fmt(cy + 15 * scale)} ${fmt(cx + 27 * scale)},${fmt(cy + 31 * scale)} C${fmt(cx + 1 * scale)},${fmt(cy + 48 * scale)} ${fmt(cx - 39 * scale)},${fmt(cy + 28 * scale)} ${fmt(cx - 43 * scale)},${fmt(cy - 8 * scale)} Z`;
}

function cellMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("cell-t")) {
    return `<path d="M${fmt(cx + 34 * scale)},${fmt(cy - 17 * scale)} v${fmt(16 * scale)} M${fmt(cx + 26 * scale)},${fmt(cy - 17 * scale)} h${fmt(16 * scale)} M${fmt(cx + 38 * scale)},${fmt(cy + 4 * scale)} v${fmt(14 * scale)} M${fmt(cx + 31 * scale)},${fmt(cy + 4 * scale)} h${fmt(14 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("cell-b")) {
    return `<path d="M${fmt(cx + 31 * scale)},${fmt(cy - 20 * scale)} v${fmt(16 * scale)} M${fmt(cx + 31 * scale)},${fmt(cy - 10 * scale)} l${fmt(-10 * scale)},${fmt(-10 * scale)} M${fmt(cx + 31 * scale)},${fmt(cy - 10 * scale)} l${fmt(10 * scale)},${fmt(-10 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("neuron")) {
    return `<path d="M${fmt(cx + 33 * scale)},${fmt(cy - 3 * scale)} C${fmt(cx + 57 * scale)},${fmt(cy - 25 * scale)} ${fmt(cx + 68 * scale)},${fmt(cy - 6 * scale)} ${fmt(cx + 82 * scale)},${fmt(cy - 25 * scale)} M${fmt(cx + 31 * scale)},${fmt(cy + 10 * scale)} C${fmt(cx + 58 * scale)},${fmt(cy + 28 * scale)} ${fmt(cx + 65 * scale)},${fmt(cy + 13 * scale)} ${fmt(cx + 82 * scale)},${fmt(cy + 27 * scale)}" fill="none" stroke="${palette.stroke}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("macrophage") || asset.id.includes("dendritic")) {
    return `<path d="M${fmt(cx - 39 * scale)},${fmt(cy - 11 * scale)} C${fmt(cx - 56 * scale)},${fmt(cy - 22 * scale)} ${fmt(cx - 62 * scale)},${fmt(cy - 2 * scale)} ${fmt(cx - 49 * scale)},${fmt(cy + 6 * scale)} M${fmt(cx + 36 * scale)},${fmt(cy + 6 * scale)} C${fmt(cx + 56 * scale)},${fmt(cy + 4 * scale)} ${fmt(cx + 56 * scale)},${fmt(cy + 26 * scale)} ${fmt(cx + 39 * scale)},${fmt(cy + 24 * scale)}" fill="none" stroke="${palette.stroke}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("tumor")) {
    return `<circle cx="${fmt(cx + 6 * scale)}" cy="${fmt(cy + 13 * scale)}" r="${fmt(5 * scale)}" fill="${palette.accent}" opacity="0.75"/><circle cx="${fmt(cx - 24 * scale)}" cy="${fmt(cy + 7 * scale)}" r="${fmt(3.5 * scale)}" fill="${palette.accent}" opacity="0.55"/>`;
  }
  if (asset.id.includes("epithelial")) {
    return `<path d="M${fmt(cx - 30 * scale)},${fmt(cy + 29 * scale)} h${fmt(58 * scale)} M${fmt(cx - 18 * scale)},${fmt(cy + 19 * scale)} v${fmt(11 * scale)} M${fmt(cx)},${fmt(cy + 17 * scale)} v${fmt(13 * scale)} M${fmt(cx + 18 * scale)},${fmt(cy + 19 * scale)} v${fmt(11 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("endothelial")) {
    return `<path d="M${fmt(cx - 35 * scale)},${fmt(cy + 22 * scale)} C${fmt(cx - 12 * scale)},${fmt(cy + 8 * scale)} ${fmt(cx + 18 * scale)},${fmt(cy + 8 * scale)} ${fmt(cx + 38 * scale)},${fmt(cy + 22 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.6 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 33 * scale)}" cy="${fmt(cy + 21 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("fibroblast")) {
    return `<path d="M${fmt(cx - 46 * scale)},${fmt(cy + 2 * scale)} L${fmt(cx - 20 * scale)},${fmt(cy - 11 * scale)} M${fmt(cx + 2 * scale)},${fmt(cy + 11 * scale)} L${fmt(cx + 44 * scale)},${fmt(cy + 2 * scale)} M${fmt(cx - 10 * scale)},${fmt(cy + 24 * scale)} L${fmt(cx + 31 * scale)},${fmt(cy + 29 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("stem")) {
    return `<circle cx="${fmt(cx + 27 * scale)}" cy="${fmt(cy + 14 * scale)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><circle cx="${fmt(cx + 42 * scale)}" cy="${fmt(cy + 3 * scale)}" r="${fmt(6 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>`;
  }
  if (asset.id.includes("apoptotic")) {
    return `<path d="M${fmt(cx + 14 * scale)},${fmt(cy - 18 * scale)} L${fmt(cx + 39 * scale)},${fmt(cy + 18 * scale)} M${fmt(cx + 39 * scale)},${fmt(cy - 18 * scale)} L${fmt(cx + 14 * scale)},${fmt(cy + 18 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.8 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx - 25 * scale)}" cy="${fmt(cy + 16 * scale)}" r="${fmt(3.5 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("dividing")) {
    return `<path d="M${fmt(cx)},${fmt(cy - 31 * scale)} V${fmt(cy + 33 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.5 * scale)}" stroke-dasharray="${fmt(4 * scale)} ${fmt(4 * scale)}"/><circle cx="${fmt(cx - 20 * scale)}" cy="${fmt(cy)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><circle cx="${fmt(cx + 20 * scale)}" cy="${fmt(cy)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>`;
  }
  if (asset.id.includes("organoid") || asset.id.includes("spheroid")) {
    return `<circle cx="${fmt(cx + 18 * scale)}" cy="${fmt(cy - 13 * scale)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}"/><circle cx="${fmt(cx + 31 * scale)}" cy="${fmt(cy + 2 * scale)}" r="${fmt(7 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}"/><circle cx="${fmt(cx + 10 * scale)}" cy="${fmt(cy + 15 * scale)}" r="${fmt(6 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}"/>`;
  }
  if (asset.id.includes("blood-sample")) {
    return `<rect x="${fmt(cx + 18 * scale)}" y="${fmt(cy - 30 * scale)}" width="${fmt(20 * scale)}" height="${fmt(54 * scale)}" rx="${fmt(7 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 20 * scale)},${fmt(cy + 7 * scale)} h${fmt(16 * scale)} v${fmt(14 * scale)} h${fmt(-16 * scale)} Z" fill="${palette.accent}" opacity="0.8"/>`;
  }
  return "";
}

function perturbationMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("perturb-seq")) {
    return `<path d="M${fmt(cx + 33 * scale)},${fmt(cy - 37 * scale)} C${fmt(cx + 47 * scale)},${fmt(cy - 20 * scale)} ${fmt(cx + 49 * scale)},${fmt(cy - 8 * scale)} ${fmt(cx + 39 * scale)},${fmt(cy + 1 * scale)} C${fmt(cx + 29 * scale)},${fmt(cy + 10 * scale)} ${fmt(cx + 10 * scale)},${fmt(cy + 5 * scale)} ${fmt(cx + 7 * scale)},${fmt(cy - 10 * scale)} C${fmt(cx + 5 * scale)},${fmt(cy - 22 * scale)} ${fmt(cx + 20 * scale)},${fmt(cy - 30 * scale)} ${fmt(cx + 33 * scale)},${fmt(cy - 37 * scale)} Z" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 19 * scale)},${fmt(cy - 12 * scale)} h${fmt(22 * scale)} M${fmt(cx + 20 * scale)},${fmt(cy - 2 * scale)} h${fmt(16 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("crispr-cas9")) {
    return `<rect x="${fmt(cx + 14 * scale)}" y="${fmt(cy - 39 * scale)}" width="${fmt(35 * scale)}" height="${fmt(18 * scale)}" rx="${fmt(7 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><text x="${fmt(cx + 31.5 * scale)}" y="${fmt(cy - 26 * scale)}" text-anchor="middle" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="${fmt(9 * scale)}" font-weight="800">Cas9</text>`;
  }
  if (asset.id.includes("guide-rna")) {
    return `<path d="M${fmt(cx - 3 * scale)},${fmt(cy - 39 * scale)} C${fmt(cx + 12 * scale)},${fmt(cy - 48 * scale)} ${fmt(cx + 30 * scale)},${fmt(cy - 43 * scale)} ${fmt(cx + 38 * scale)},${fmt(cy - 29 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 40 * scale)}" cy="${fmt(cy - 27 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("lentiviral")) {
    return `<circle cx="${fmt(cx + 34 * scale)}" cy="${fmt(cy - 27 * scale)}" r="${fmt(11 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>${spikes(cx + 34 * scale, cy - 27 * scale, 11 * scale, palette.accent)}`;
  }
  if (asset.id.includes("screen")) {
    return `<g opacity="0.92">${[-1, 0, 1].flatMap((row) => [-1, 0, 1].map((col) => `<circle cx="${fmt(cx + (23 + col * 10) * scale)}" cy="${fmt(cy + (-19 + row * 10) * scale)}" r="${fmt(2.7 * scale)}" fill="${palette.accent}"/>`)).join("")}</g>`;
  }
  if (asset.id.includes("activation")) {
    return `<path d="M${fmt(cx + 36 * scale)},${fmt(cy + 23 * scale)} V${fmt(cy - 26 * scale)} M${fmt(cx + 24 * scale)},${fmt(cy - 15 * scale)} L${fmt(cx + 36 * scale)},${fmt(cy - 28 * scale)} L${fmt(cx + 48 * scale)},${fmt(cy - 15 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("inhibition") || asset.id.includes("knockdown")) {
    return `<path d="M${fmt(cx + 35 * scale)},${fmt(cy - 26 * scale)} V${fmt(cy + 23 * scale)} M${fmt(cx + 24 * scale)},${fmt(cy + 12 * scale)} L${fmt(cx + 35 * scale)},${fmt(cy + 25 * scale)} L${fmt(cx + 47 * scale)},${fmt(cy + 12 * scale)} M${fmt(cx + 22 * scale)},${fmt(cy - 27 * scale)} H${fmt(cx + 48 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("editor")) {
    return `<text x="${fmt(cx + 31 * scale)}" y="${fmt(cy - 28 * scale)}" text-anchor="middle" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="${fmt(15 * scale)}" font-weight="800">A/G</text>`;
  }
  if (asset.id.includes("drug")) {
    return `<circle cx="${fmt(cx + 27 * scale)}" cy="${fmt(cy - 24 * scale)}" r="${fmt(6 * scale)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 41 * scale)}" cy="${fmt(cy - 17 * scale)}" r="${fmt(6 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 32 * scale)},${fmt(cy - 21 * scale)} L${fmt(cx + 36 * scale)},${fmt(cy - 19 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>`;
  }
  return "";
}

function helixRungs(cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  return [-24, -12, 0, 12, 24].map((offset, index) => {
    const width = 27 + (index % 2) * 8;
    return `<path d="M${fmt(cx - width * scale)},${fmt(cy + offset * scale)} H${fmt(cx + width * scale)}" stroke="${index % 2 ? palette.stroke : palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round" opacity="0.65"/>`;
  }).join("");
}

function instrumentMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("microscope")) {
    return `<path d="M${fmt(cx + 7 * scale)},${fmt(cy - 31 * scale)} V${fmt(cy - 48 * scale)} M${fmt(cx + 7 * scale)},${fmt(cy - 48 * scale)} L${fmt(cx + 30 * scale)},${fmt(cy - 39 * scale)}" fill="none" stroke="${palette.stroke}" stroke-width="${fmt(4 * scale)}" stroke-linecap="round"/><path d="M${fmt(cx - 24 * scale)},${fmt(cy + 28 * scale)} H${fmt(cx + 38 * scale)}" stroke="${palette.stroke}" stroke-width="${fmt(4 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("plate")) {
    return gridDots(cx, cy + 3 * scale, scale * 0.66, palette.accent);
  }
  if (asset.id.includes("sequencer")) {
    return `<path d="M${fmt(cx - 31 * scale)},${fmt(cy - 32 * scale)} h${fmt(62 * scale)} M${fmt(cx - 22 * scale)},${fmt(cy + 3 * scale)} h${fmt(44 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 29 * scale)}" cy="${fmt(cy + 17 * scale)}" r="${fmt(5 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("nanopore")) {
    return `<path d="M${fmt(cx - 25 * scale)},${fmt(cy - 5 * scale)} h${fmt(50 * scale)} M${fmt(cx)},${fmt(cy - 25 * scale)} v${fmt(43 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.5 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx)}" cy="${fmt(cy - 5 * scale)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>`;
  }
  if (asset.id.includes("flow") || asset.id.includes("sorter")) {
    return `<path d="M${fmt(cx - 31 * scale)},${fmt(cy - 23 * scale)} C${fmt(cx - 5 * scale)},${fmt(cy - 8 * scale)} ${fmt(cx + 2 * scale)},${fmt(cy + 8 * scale)} ${fmt(cx + 30 * scale)},${fmt(cy + 22 * scale)} M${fmt(cx + 2 * scale)},${fmt(cy + 8 * scale)} L${fmt(cx + 31 * scale)},${fmt(cy - 17 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx - 18 * scale)}" cy="${fmt(cy - 16 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 3 * scale)}" cy="${fmt(cy + 6 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("centrifuge")) {
    return `<circle cx="${fmt(cx)}" cy="${fmt(cy + 3 * scale)}" r="${fmt(22 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx)},${fmt(cy + 3 * scale)} l${fmt(17 * scale)},${fmt(-10 * scale)} M${fmt(cx)},${fmt(cy + 3 * scale)} l${fmt(-16 * scale)},${fmt(-10 * scale)} M${fmt(cx)},${fmt(cy + 3 * scale)} v${fmt(19 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.4 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("incubator") || asset.id.includes("biosafety-cabinet")) {
    return `<rect x="${fmt(cx - 29 * scale)}" y="${fmt(cy - 9 * scale)}" width="${fmt(58 * scale)}" height="${fmt(33 * scale)}" rx="${fmt(4 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx - 22 * scale)},${fmt(cy + 8 * scale)} h${fmt(44 * scale)} M${fmt(cx - 14 * scale)},${fmt(cy - 33 * scale)} c${fmt(7 * scale)},${fmt(8 * scale)} ${fmt(7 * scale)},${fmt(16 * scale)} 0,${fmt(24 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round" fill="none"/>`;
  }
  if (asset.id.includes("gel") || asset.id.includes("western")) {
    return `<rect x="${fmt(cx - 29 * scale)}" y="${fmt(cy - 21 * scale)}" width="${fmt(58 * scale)}" height="${fmt(42 * scale)}" rx="${fmt(4 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx - 20 * scale)},${fmt(cy - 9 * scale)} h${fmt(40 * scale)} M${fmt(cx - 16 * scale)},${fmt(cy + 3 * scale)} h${fmt(24 * scale)} M${fmt(cx - 20 * scale)},${fmt(cy + 14 * scale)} h${fmt(36 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("qpcr") || asset.id.includes("mass-spectrometer") || asset.id.includes("liquid-handler")) {
    return `<path d="M${fmt(cx - 28 * scale)},${fmt(cy - 31 * scale)} h${fmt(56 * scale)} M${fmt(cx - 20 * scale)},${fmt(cy + 25 * scale)} h${fmt(40 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/><path d="M${fmt(cx - 10 * scale)},${fmt(cy - 1 * scale)} C${fmt(cx - 2 * scale)},${fmt(cy - 15 * scale)} ${fmt(cx + 12 * scale)},${fmt(cy - 2 * scale)} ${fmt(cx + 21 * scale)},${fmt(cy - 17 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.5 * scale)}"/>`;
  }
  if (asset.id.includes("pipette")) {
    return `<path d="M${fmt(cx + 32 * scale)},${fmt(cy - 39 * scale)} L${fmt(cx - 24 * scale)},${fmt(cy + 22 * scale)}" stroke="${palette.stroke}" stroke-width="${fmt(5 * scale)}" stroke-linecap="round"/><path d="M${fmt(cx - 25 * scale)},${fmt(cy + 22 * scale)} L${fmt(cx - 35 * scale)},${fmt(cy + 36 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  return "";
}

function spatialMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("visium") || asset.id.includes("spot")) {
    return `<circle cx="${fmt(cx + 35 * scale)}" cy="${fmt(cy - 28 * scale)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><circle cx="${fmt(cx + 48 * scale)}" cy="${fmt(cy - 15 * scale)}" r="${fmt(5 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("merfish") || asset.id.includes("xenium")) {
    return `<path d="M${fmt(cx + 29 * scale)},${fmt(cy - 30 * scale)} h${fmt(21 * scale)} M${fmt(cx + 29 * scale)},${fmt(cy - 20 * scale)} h${fmt(16 * scale)} M${fmt(cx + 29 * scale)},${fmt(cy - 10 * scale)} h${fmt(21 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 21 * scale)}" cy="${fmt(cy - 20 * scale)}" r="${fmt(3.5 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("segmentation") || asset.id.includes("boundary")) {
    return `<path d="M${fmt(cx - 28 * scale)},${fmt(cy - 16 * scale)} C${fmt(cx - 8 * scale)},${fmt(cy - 31 * scale)} ${fmt(cx + 16 * scale)},${fmt(cy - 24 * scale)} ${fmt(cx + 28 * scale)},${fmt(cy - 6 * scale)} C${fmt(cx + 13 * scale)},${fmt(cy + 8 * scale)} ${fmt(cx - 10 * scale)},${fmt(cy + 12 * scale)} ${fmt(cx - 26 * scale)},${fmt(cy + 1 * scale)} Z" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.4 * scale)}" stroke-dasharray="${fmt(4 * scale)} ${fmt(3 * scale)}"/>`;
  }
  if (asset.id.includes("neighborhood") || asset.id.includes("graph")) {
    return `<path d="M${fmt(cx - 18 * scale)},${fmt(cy - 14 * scale)} L${fmt(cx + 11 * scale)},${fmt(cy - 3 * scale)} L${fmt(cx + 30 * scale)},${fmt(cy + 18 * scale)} M${fmt(cx + 11 * scale)},${fmt(cy - 3 * scale)} L${fmt(cx - 9 * scale)},${fmt(cy + 20 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><circle cx="${fmt(cx - 18 * scale)}" cy="${fmt(cy - 14 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 11 * scale)}" cy="${fmt(cy - 3 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/><circle cx="${fmt(cx + 30 * scale)}" cy="${fmt(cy + 18 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("registration")) {
    return `<path d="M${fmt(cx - 31 * scale)},${fmt(cy - 25 * scale)} h${fmt(24 * scale)} v${fmt(24 * scale)} M${fmt(cx + 31 * scale)},${fmt(cy + 25 * scale)} h${fmt(-24 * scale)} v${fmt(-24 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.3 * scale)}"/>`;
  }
  return "";
}

function modelMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("transformer") || asset.id.includes("foundation")) {
    return `<path d="M${fmt(cx - 32 * scale)},${fmt(cy - 31 * scale)} h${fmt(64 * scale)} M${fmt(cx - 30 * scale)},${fmt(cy + 31 * scale)} h${fmt(60 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 36 * scale)}" cy="${fmt(cy - 20 * scale)}" r="${fmt(5 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("embedding")) {
    return `${[-1, 0, 1].flatMap((row) => [-1, 0, 1].map((col) => `<circle cx="${fmt(cx + (23 + col * 10) * scale)}" cy="${fmt(cy + (-18 + row * 10) * scale)}" r="${fmt((row === col ? 4 : 2.7) * scale)}" fill="${palette.accent}" opacity="${row === col ? 0.95 : 0.55}"/>`)).join("")}`;
  }
  if (asset.id.includes("training")) {
    return `<path d="M${fmt(cx + 38 * scale)},${fmt(cy - 2 * scale)} A${fmt(15 * scale)},${fmt(15 * scale)} 0 1 1 ${fmt(cx + 26 * scale)},${fmt(cy - 16 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}"/><path d="M${fmt(cx + 38 * scale)},${fmt(cy - 2 * scale)} l${fmt(-8 * scale)},${fmt(-2 * scale)} l${fmt(4 * scale)},${fmt(-7 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/>`;
  }
  if (asset.id.includes("classifier")) {
    return `<path d="M${fmt(cx + 19 * scale)},${fmt(cy - 25 * scale)} h${fmt(27 * scale)} M${fmt(cx + 19 * scale)},${fmt(cy)} h${fmt(27 * scale)} M${fmt(cx + 19 * scale)},${fmt(cy + 25 * scale)} h${fmt(27 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.4 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 12 * scale)}" cy="${fmt(cy)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("uncertainty")) {
    return `<text x="${fmt(cx + 33 * scale)}" y="${fmt(cy - 19 * scale)}" text-anchor="middle" fill="${palette.accent}" font-family="Inter, Arial, sans-serif" font-size="${fmt(24 * scale)}" font-weight="800">?</text>`;
  }
  return "";
}

function agentMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("retrieval") || asset.id.includes("vector-store")) {
    return `<path d="M${fmt(cx + 29 * scale)},${fmt(cy - 27 * scale)} C${fmt(cx + 43 * scale)},${fmt(cy - 14 * scale)} ${fmt(cx + 42 * scale)},${fmt(cy + 7 * scale)} ${fmt(cx + 26 * scale)},${fmt(cy + 18 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.4 * scale)}"/><circle cx="${fmt(cx + 33 * scale)}" cy="${fmt(cy - 23 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("tool") || asset.id.includes("mcp") || asset.id.includes("function")) {
    return `<path d="M${fmt(cx + 25 * scale)},${fmt(cy - 26 * scale)} h${fmt(19 * scale)} v${fmt(18 * scale)} h${fmt(-19 * scale)} Z M${fmt(cx + 29 * scale)},${fmt(cy - 17 * scale)} h${fmt(11 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}"/>`;
  }
  if (asset.id.includes("planner")) {
    return `<path d="M${fmt(cx + 25 * scale)},${fmt(cy - 28 * scale)} h${fmt(22 * scale)} M${fmt(cx + 25 * scale)},${fmt(cy - 17 * scale)} h${fmt(16 * scale)} M${fmt(cx + 25 * scale)},${fmt(cy - 6 * scale)} h${fmt(22 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("memory")) {
    return `<rect x="${fmt(cx + 21 * scale)}" y="${fmt(cy - 29 * scale)}" width="${fmt(24 * scale)}" height="${fmt(30 * scale)}" rx="${fmt(5 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 27 * scale)},${fmt(cy - 20 * scale)} h${fmt(12 * scale)} M${fmt(cx + 27 * scale)},${fmt(cy - 11 * scale)} h${fmt(12 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}"/>`;
  }
  return "";
}

function metricMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("confusion")) {
    return `<rect x="${fmt(cx + 12 * scale)}" y="${fmt(cy - 24 * scale)}" width="${fmt(31 * scale)}" height="${fmt(31 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 27.5 * scale)},${fmt(cy - 24 * scale)} v${fmt(31 * scale)} M${fmt(cx + 12 * scale)},${fmt(cy - 8.5 * scale)} h${fmt(31 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(1.7 * scale)}"/><rect x="${fmt(cx + 13.5 * scale)}" y="${fmt(cy - 22.5 * scale)}" width="${fmt(12.5 * scale)}" height="${fmt(12.5 * scale)}" fill="${palette.accent}" opacity="0.72"/>`;
  }
  if (asset.id.includes("roc") || asset.id.includes("pr") || asset.id.includes("calibration")) {
    return `<path d="M${fmt(cx + 2 * scale)},${fmt(cy + 18 * scale)} C${fmt(cx + 17 * scale)},${fmt(cy - 6 * scale)} ${fmt(cx + 27 * scale)},${fmt(cy + 3 * scale)} ${fmt(cx + 42 * scale)},${fmt(cy - 24 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}"/><path d="M${fmt(cx + 4 * scale)},${fmt(cy - 21 * scale)} L${fmt(cx + 42 * scale)},${fmt(cy + 17 * scale)}" stroke="${palette.stroke}" stroke-width="${fmt(1.3 * scale)}" opacity="0.45"/>`;
  }
  if (asset.id.includes("leaderboard") || asset.id.includes("metric-card")) {
    return `<path d="M${fmt(cx + 5 * scale)},${fmt(cy - 20 * scale)} h${fmt(34 * scale)} M${fmt(cx + 5 * scale)},${fmt(cy - 7 * scale)} h${fmt(25 * scale)} M${fmt(cx + 5 * scale)},${fmt(cy + 6 * scale)} h${fmt(16 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("failure")) {
    return `<path d="M${fmt(cx + 17 * scale)},${fmt(cy - 22 * scale)} L${fmt(cx + 41 * scale)},${fmt(cy + 2 * scale)} M${fmt(cx + 41 * scale)},${fmt(cy - 22 * scale)} L${fmt(cx + 17 * scale)},${fmt(cy + 2 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  return "";
}

function riskMotif(asset: PremiumAsset, cx: number, cy: number, scale: number, palette: ReturnType<typeof variantPalette>): string {
  if (asset.id.includes("permission") || asset.id.includes("tier")) {
    return `<path d="M${fmt(cx - 26 * scale)},${fmt(cy - 27 * scale)} h${fmt(52 * scale)} M${fmt(cx - 17 * scale)},${fmt(cy - 18 * scale)} h${fmt(34 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 23 * scale)}" cy="${fmt(cy - 27 * scale)}" r="${fmt(4 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("human-review") || asset.id.includes("review-queue")) {
    return `<circle cx="${fmt(cx + 29 * scale)}" cy="${fmt(cy - 20 * scale)}" r="${fmt(8 * scale)}" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 16 * scale)},${fmt(cy + 2 * scale)} C${fmt(cx + 23 * scale)},${fmt(cy - 7 * scale)} ${fmt(cx + 38 * scale)},${fmt(cy - 7 * scale)} ${fmt(cx + 45 * scale)},${fmt(cy + 2 * scale)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(2.4 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("audit")) {
    return `<path d="M${fmt(cx + 20 * scale)},${fmt(cy - 28 * scale)} h${fmt(26 * scale)} M${fmt(cx + 20 * scale)},${fmt(cy - 16 * scale)} h${fmt(18 * scale)} M${fmt(cx + 20 * scale)},${fmt(cy - 4 * scale)} h${fmt(26 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.1 * scale)}" stroke-linecap="round"/>`;
  }
  if (asset.id.includes("red-team") || asset.id.includes("threat")) {
    return `<path d="M${fmt(cx + 30 * scale)},${fmt(cy - 28 * scale)} l${fmt(13 * scale)},${fmt(24 * scale)} h${fmt(-26 * scale)} Z" fill="${palette.secondary}" stroke="${palette.accent}" stroke-width="${fmt(2 * scale)}"/><path d="M${fmt(cx + 30 * scale)},${fmt(cy - 20 * scale)} v${fmt(9 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(2.2 * scale)}" stroke-linecap="round"/><circle cx="${fmt(cx + 30 * scale)}" cy="${fmt(cy - 6 * scale)}" r="${fmt(2.2 * scale)}" fill="${palette.accent}"/>`;
  }
  if (asset.id.includes("blocked") || asset.id.includes("refusal")) {
    return `<path d="M${fmt(cx + 18 * scale)},${fmt(cy - 25 * scale)} L${fmt(cx + 44 * scale)},${fmt(cy + 1 * scale)} M${fmt(cx + 44 * scale)},${fmt(cy - 25 * scale)} L${fmt(cx + 18 * scale)},${fmt(cy + 1 * scale)}" stroke="${palette.accent}" stroke-width="${fmt(3 * scale)}" stroke-linecap="round"/>`;
  }
  return "";
}

function organVessel(cx: number, cy: number, scale: number): string {
  return `M${fmt(cx - 12 * scale)},${fmt(cy - 23 * scale)} C${fmt(cx - 3 * scale)},${fmt(cy - 7 * scale)} ${fmt(cx - 7 * scale)},${fmt(cy + 10 * scale)} ${fmt(cx - 20 * scale)},${fmt(cy + 28 * scale)} M${fmt(cx - 2 * scale)},${fmt(cy - 4 * scale)} C${fmt(cx + 17 * scale)},${fmt(cy - 11 * scale)} ${fmt(cx + 28 * scale)},${fmt(cy - 2 * scale)} ${fmt(cx + 34 * scale)},${fmt(cy + 14 * scale)}`;
}

function variantPalette(asset: PremiumAsset, variant: AssetVariant): { fill: string; secondary: string; accent: string; stroke: string; text: string } {
  const accent = asset.renderSpec.accent;
  const secondary = asset.renderSpec.secondary;
  if (variant === "outline") return { fill: "none", secondary: "#ffffff", accent, stroke: accent, text: "#0f172a" };
  if (variant === "dark") return { fill: "#1e293b", secondary: "#334155", accent: "#38bdf8", stroke: "#e2e8f0", text: "#f8fafc" };
  if (variant === "warning") return { fill: "#fee2e2", secondary: "#fff7ed", accent: "#dc2626", stroke: "#991b1b", text: "#7f1d1d" };
  if (variant === "disabled") return { fill: "#e2e8f0", secondary: "#f1f5f9", accent: "#94a3b8", stroke: "#64748b", text: "#64748b" };
  if (variant === "selected") return { fill: "#dbeafe", secondary: "#eff6ff", accent: "#2563eb", stroke: "#1d4ed8", text: "#0f172a" };
  if (variant === "filled") return { fill: secondary, secondary: "#ffffff", accent, stroke: "#0f172a", text: "#0f172a" };
  return { fill: secondary, secondary: "#ffffff", accent, stroke: accent, text: "#0f172a" };
}

function gridDots(cx: number, cy: number, scale: number, color: string): string {
  const dots: string[] = [];
  for (let row = -1; row <= 1; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      dots.push(`<circle cx="${fmt(cx + col * 15 * scale)}" cy="${fmt(cy + row * 14 * scale)}" r="${fmt(3.3 * scale)}" fill="${color}"/>`);
    }
  }
  return dots.join("");
}

function spikes(cx: number, cy: number, radius: number, color: string): string {
  const paths: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;
    const x2 = cx + Math.cos(angle) * (radius + 10);
    const y2 = cy + Math.sin(angle) * (radius + 10);
    paths.push(`<path d="M${fmt(x1)},${fmt(y1)} L${fmt(x2)},${fmt(y2)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`);
  }
  return paths.join("");
}

export function validatePremiumAssetRegistry(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const asset of CURATED_ASSETS) {
    if (ids.has(asset.id)) issues.push(`Duplicate asset id: ${asset.id}`);
    ids.add(asset.id);
    if (!asset.name || !asset.category || !asset.family || !asset.subcategory) issues.push(`Missing core metadata: ${asset.id}`);
    if (!asset.aliases.length || !asset.tags.length) issues.push(`Missing aliases/tags: ${asset.id}`);
    if (!asset.provenance.source || !asset.provenance.license) issues.push(`Missing provenance: ${asset.id}`);
    if (!asset.variants.length || !asset.editableParts.length) issues.push(`Missing variants/editable parts: ${asset.id}`);
    if (!asset.styleProfiles.length || !asset.styleProfiles.includes("consulting-2p5d")) issues.push(`Missing style profiles: ${asset.id}`);
    if (!asset.semanticSlots.length || !asset.panelRole || !asset.qaStatus) issues.push(`Missing semantic visual contract: ${asset.id}`);
    if (!asset.editablePartDefinitions.length) issues.push(`Missing editable part definitions: ${asset.id}`);
    if (!Number.isFinite(asset.fidelityScore) || asset.fidelityScore <= 0 || asset.fidelityScore > 1) issues.push(`Invalid fidelity score: ${asset.id}`);
    if (!asset.renderSpec?.family) issues.push(`Missing render spec: ${asset.id}`);
    if (!asset.qualityTier) issues.push(`Missing quality tier: ${asset.id}`);
    if (asset.renderSpec?.version !== 2 || !asset.renderSpec?.assetRecipe) issues.push(`Missing renderer v2 recipe: ${asset.id}`);
    if ((asset.qualityTier === "signature" || asset.qualityTier === "hero") && !String(asset.renderSpec.assetRecipe).startsWith("hero-")) issues.push(`Premium asset uses non-hero recipe: ${asset.id}`);
    const svg = renderPremiumAssetSvg(asset.id);
    if (!svg.includes("<svg") || !svg.includes("premium-asset") || !svg.includes("commercial-premium-asset") || svg.length < 400) issues.push(`Invalid SVG render: ${asset.id}`);
  }
  const allIds = new Set(LIBRARY_ASSETS.map((asset) => asset.id));
  const curatedIds = new Set(CURATED_ASSETS.map((asset) => asset.id));
  const templateIds = new Set(PREMIUM_WORKFLOW_TEMPLATES.map((template) => template.id));
  for (const pack of PREMIUM_WORKFLOW_PACKS) {
    if (pack.assetIds.length < 20) issues.push(`Workflow pack too small: ${pack.id}`);
    if (pack.templates.length < 4) issues.push(`Workflow pack needs at least 4 templates: ${pack.id}`);
    if (!pack.flagshipTemplateId || !templateIds.has(pack.flagshipTemplateId)) issues.push(`Workflow pack missing flagship template: ${pack.id}`);
    for (const assetId of pack.assetIds) {
      if (!curatedIds.has(assetId)) issues.push(`Workflow pack ${pack.id} references missing asset: ${assetId}`);
    }
    for (const templateId of pack.templates) {
      if (!templateIds.has(templateId)) issues.push(`Workflow pack ${pack.id} references missing template: ${templateId}`);
    }
  }
  for (const template of PREMIUM_WORKFLOW_TEMPLATES) {
    if (!WORKFLOW_PACK_BY_ID.has(template.workflowPack)) issues.push(`Template references missing workflow pack: ${template.id}`);
    if (template.previewAssetIds.length < 4) issues.push(`Template needs at least 4 preview assets: ${template.id}`);
    for (const assetId of template.previewAssetIds) {
      if (!allIds.has(assetId)) issues.push(`Template ${template.id} references missing asset: ${assetId}`);
    }
  }
  if (CURATED_ASSETS.length < 200) issues.push(`Expected at least 200 curated assets, found ${CURATED_ASSETS.length}`);
  if (CURATED_ASSETS.filter((asset) => asset.qualityTier === "hero" || asset.qualityTier === "signature").length !== HERO_ASSET_IDS.length) issues.push(`Expected ${HERO_ASSET_IDS.length} signature/hero assets`);
  return { ok: issues.length === 0, issues };
}

export function validateRealisticAssetRegistry(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const asset of REALISTIC_ASSETS) {
    if (ids.has(asset.id)) issues.push(`Duplicate realistic asset id: ${asset.id}`);
    ids.add(asset.id);
    if (!asset.name || !asset.category || !asset.tags.length || !asset.aliases.length) issues.push(`Missing realistic metadata: ${asset.id}`);
    if (!asset.styleProfiles.includes("scientific-editorial-realism")) issues.push(`Missing editorial realism style: ${asset.id}`);
    if (!asset.workflowPacks.length || !asset.semanticSlots.length || !asset.panelRole) issues.push(`Missing realistic semantic contract: ${asset.id}`);
    if (!asset.dataUri || !asset.dataUri.startsWith("data:image/")) issues.push(`Missing realistic image payload: ${asset.id}`);
    if (!asset.provenance.source || !asset.provenance.license) issues.push(`Missing realistic provenance: ${asset.id}`);
    if (!asset.resolution.width || !asset.resolution.height || asset.resolution.width < 512 || asset.resolution.height < 384) issues.push(`Insufficient realistic resolution: ${asset.id}`);
    if (!asset.mediaType || !asset.realismLevel || !asset.rightsStatus || !asset.sourceAssetType) issues.push(`Missing realism metadata: ${asset.id}`);
    if (!asset.editablePartDefinitions.some((part) => part.id === "image-crop")) issues.push(`Missing crop editable part: ${asset.id}`);
    const svg = renderRealisticAssetSvg(asset.id, { styleProfile: "scientific-editorial-realism" });
    const validInlineFixture = asset.mediaType === "svg-fixture" && svg.includes(`data-media-type="${asset.mediaType}"`) && svg.includes("<svg x=");
    const validRasterImage = asset.mediaType !== "svg-fixture" && svg.includes("<image");
    if (!svg.includes("scientific-realistic-asset") || (!validInlineFixture && !validRasterImage) || /NaN/.test(svg) || svg.length < 800) issues.push(`Invalid realistic render: ${asset.id}`);
  }
  if (REALISTIC_ASSETS.length !== 30) issues.push(`Expected 30 realistic assets, found ${REALISTIC_ASSETS.length}`);
  return { ok: issues.length === 0, issues };
}

export function createUploadAsset(input: {
  name: string;
  dataUri: string;
  category?: string;
  tags?: string[];
  source?: string;
  license?: string;
  citation?: string;
  creator?: string;
}): Asset {
  const provenance: Provenance = {
    kind: "upload",
    source: input.source || "User upload",
    license: input.license || "private/unverified",
    citation: input.citation,
    creator: input.creator,
    editState: "original"
  };
  return {
    id: createId("asset"),
    name: input.name,
    kind: "image",
    category: input.category ?? "Uploads",
    tags: input.tags ?? ["upload"],
    dataUri: input.dataUri,
    provenance
  };
}

export function createGeneratedAsset(input: {
  name: string;
  dataUri: string;
  prompt: string;
  model: string;
  category?: string;
  tags?: string[];
}): Asset {
  return {
    id: createId("asset"),
    name: input.name,
    kind: "image",
    category: input.category ?? "Generated assets",
    tags: input.tags ?? ["ai-generated"],
    dataUri: input.dataUri,
    provenance: {
      kind: "generated",
      source: "AI-generated image asset",
      license: "review-required",
      ai: {
        prompt: input.prompt,
        model: input.model,
        generatedAt: new Date().toISOString()
      },
      editState: "needs-review"
    }
  };
}

export function createRealisticAsset(input: {
  name: string;
  dataUri: string;
  resolution: { width: number; height: number; dpi?: number };
  source: string;
  license: string;
  category?: string;
  tags?: string[];
  workflowPacks?: string[];
  semanticSlots?: string[];
  panelRole?: AssetPanelRole;
  realismLevel?: RealismLevel;
  mediaType?: RealisticMediaType;
  backgroundTreatment?: BackgroundTreatment;
  cutoutStatus?: CutoutStatus;
  rightsStatus?: RightsStatus;
  sourceAssetType?: SourceAssetType;
  citation?: string;
  creator?: string;
}): RealisticAsset {
  const panelRole = input.panelRole ?? "evidence";
  const workflowPacks = input.workflowPacks ?? ["user-realistic-library"];
  const semanticSlots = input.semanticSlots ?? ["image-evidence"];
  const editableParts = ["image crop", "mask", "color wash", "rim highlight", "caption anchor", "connector anchor", "provenance badge"];
  return {
    id: createId("realistic-asset"),
    name: input.name,
    kind: "image",
    category: input.category ?? "Realistic / User library",
    family: "spatial",
    subcategory: "user realistic library",
    qualityTier: "standard",
    tags: uniqueValues(["realistic", "scientific-editorial-realism", ...workflowPacks, ...semanticSlots, ...(input.tags ?? [])]),
    aliases: aliasFrom(input.name, (input.tags ?? []).join(" ")),
    organism: [],
    assay: [],
    modality: uniqueValues([input.mediaType ?? "raster", input.realismLevel ?? "editorial", "hybrid-svg-raster"]),
    visualRole: panelRole === "warning" ? "risk" : panelRole === "process-step" ? "process" : "evidence",
    riskDomain: panelRole === "warning" ? ["review-required"] : [],
    agentUseHints: [
      "Use as a provenance-tracked realistic image panel with SVG labels, masks, callouts, and connectors overlaid.",
      "Use vector assets for mechanism geometry and workflow logic; use this image for context or evidence panels."
    ],
    variants: ["filled", "dark", "warning", "selected", "disabled"],
    styleProfiles: uniqueValues<AssetStyleProfile>(["scientific-editorial-realism", "consulting-2p5d", panelRole === "warning" ? "risk-warning" : "dark-talk"]),
    workflowPacks,
    semanticSlots,
    panelRole,
    fidelityScore: 0.66,
    qaStatus: input.rightsStatus === "curated-fixture" ? "reviewed" : "draft",
    editableParts,
    editablePartDefinitions: editableParts.map((part) => ({
      id: part.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      role: `user-realistic:${part}`,
      selectable: !part.includes("anchor"),
      colorBinding: part.includes("caption") ? "label" : part.includes("wash") || part.includes("rim") ? "accent" : "stroke",
      anchor: part.includes("caption") ? "label" : part.includes("connector") ? "connector" : part.includes("badge") ? "badge" : "highlight",
      exportMapping: part.includes("caption") ? "text" : "group"
    })),
    recommendedSize: { width: 260, height: 170 },
    dataUri: input.dataUri,
    realismLevel: input.realismLevel ?? "editorial",
    mediaType: input.mediaType ?? "raster",
    resolution: input.resolution,
    backgroundTreatment: input.backgroundTreatment ?? "editorial-frame",
    cutoutStatus: input.cutoutStatus ?? "not-cutout",
    rightsStatus: input.rightsStatus ?? "private-unverified",
    sourceAssetType: input.sourceAssetType ?? "user-upload",
    provenance: {
      kind: input.sourceAssetType === "generated-fixture" ? "generated" : input.sourceAssetType === "user-upload" || !input.sourceAssetType ? "upload" : "curated",
      source: input.source,
      license: input.license,
      citation: input.citation,
      creator: input.creator,
      editState: input.rightsStatus === "curated-fixture" ? "original" : "needs-review"
    }
  };
}

export function createCuratedSymbolNode(input: {
  assetId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  variant?: AssetVariant;
  styleProfile?: AssetStyleProfile;
  detailLevel?: AssetDetailLevel;
  semanticRole?: string;
  layoutHint?: string;
  appearance?: SymbolAppearance;
  accent?: string;
  secondary?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  labelColor?: string;
  labelVisible?: boolean;
  style?: Style;
}): SceneNode {
  const asset = getAsset(input.assetId);
  const appearance = normalizeSymbolAppearance(input);
  const node = createSymbolNode(
    asset,
    input.label ?? asset.name,
    createTransform(input.x, input.y, input.width ?? asset.recommendedSize.width, input.height ?? asset.recommendedSize.height),
    symbolStyleWithAppearance(input.style, appearance)
  );
  return { ...node, payload: { ...node.payload, variant: input.variant, styleProfile: input.styleProfile, semanticRole: input.semanticRole, layoutHint: input.layoutHint, appearance } };
}

export function createAssetSymbolNode(asset: Asset, transform: Transform, label?: string, style?: Style): SceneNode {
  return createSymbolNode(asset, label ?? asset.name, transform, style);
}

export function createRealisticImageNode(input: {
  assetId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  styleProfile?: AssetStyleProfile;
  appearance?: ImageAppearance;
  crop?: ImageCrop;
  mask?: ImageMask;
  captionAnchor?: "top" | "bottom" | "left" | "right";
  label?: string;
  depth?: Style["depth"];
}): SceneNode {
  const asset = getRealisticAsset(input.assetId);
  return {
    id: createId("node"),
    kind: "image",
    name: input.label ?? asset.name,
    transform: createTransform(input.x, input.y, input.width ?? asset.recommendedSize.width, input.height ?? asset.recommendedSize.height),
    style: {
      depth: input.depth ?? "floating",
      stroke: "#dbe4f0",
      strokeWidth: 1.2
    },
    payload: {
      assetId: asset.id,
      src: asset.dataUri ?? "",
      alt: input.label ?? asset.name,
      styleProfile: input.styleProfile ?? "scientific-editorial-realism",
      appearance: input.appearance,
      crop: input.crop,
      mask: input.mask,
      captionAnchor: input.captionAnchor ?? "bottom"
    },
    provenance: asset.provenance,
    claimStatus: "needs-citation"
  };
}

export function insertPremiumAsset(
  project: Project,
  input: {
    assetId: string;
    pageId?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    label?: string;
    variant?: AssetVariant;
    styleProfile?: AssetStyleProfile;
    detailLevel?: AssetDetailLevel;
    semanticRole?: string;
    layoutHint?: string;
    appearance?: SymbolAppearance;
    accent?: string;
    secondary?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    labelColor?: string;
    labelVisible?: boolean;
    style?: Style;
  }
): { project: Project; node: SceneNode } {
  const asset = getAnyAsset(input.assetId);
  const node = isRealisticAsset(asset)
    ? createRealisticImageNode({
      assetId: input.assetId,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      label: input.label,
      styleProfile: input.styleProfile ?? "scientific-editorial-realism",
      appearance: {
        colorWash: input.accent,
        rimColor: input.stroke,
        colorWashOpacity: input.appearance?.fill ? 0.12 : undefined
      }
    })
    : createCuratedSymbolNode(input);
  const next = JSON.parse(JSON.stringify(project)) as Project;
  const page: Page | undefined = input.pageId ? next.pages.find((candidate) => candidate.id === input.pageId) : next.pages[0];
  if (!page) throw new Error(`Page not found: ${input.pageId ?? "<first page>"}`);
  const maxZ = page.nodes.reduce((max, current) => Math.max(max, current.transform.z), -1);
  node.transform.z = maxZ + 1;
  page.nodes.push(node);
  next.updatedAt = new Date().toISOString();
  return { project: next, node };
}

export function createWorkflowFigureNodes(input: {
  workflowPack?: string;
  templateId?: string;
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
  stepCount?: number;
}): SceneNode[] {
  const template = input.templateId ? getWorkflowTemplate(input.templateId) : undefined;
  const pack = getWorkflowPack(input.workflowPack ?? template?.workflowPack ?? "publication-results-panels");
  if (!template && pack.id === "publication-results-panels") {
    return withWorkflowFigureMetadata(createPublicationResultsPanelNodes({ ...input, workflowPack: pack.id }), pack.id, pack.flagshipTemplateId);
  }
  if (template?.id === "manuscript-results-figure") {
    return withWorkflowFigureMetadata(createPublicationResultsPanelNodes({ ...input, workflowPack: template.workflowPack }), template.workflowPack, template.id);
  }
  if (template) {
    return withWorkflowFigureMetadata(createTemplateFigureNodes(pack, template, input), template.workflowPack, template.id);
  }
  const stepCount = Math.max(3, Math.min(input.stepCount ?? 5, 6));
  const x = input.x ?? 92;
  const y = input.y ?? 250;
  const width = input.width ?? 920;
  const gap = width / stepCount;
  const selectedAssets = pack.assetIds
    .map((assetId) => CURATED_ASSETS.find((asset) => asset.id === assetId))
    .filter((asset): asset is PremiumAsset => Boolean(asset))
    .sort((a, b) => tierRank(b) - tierRank(a) || a.panelRole.localeCompare(b.panelRole))
    .slice(0, stepCount);
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", pack.name, createTransform(x - 26, y - 78, width + 72, 230), {
      fill: "#ffffff",
      stroke: "#dbeafe",
      strokeWidth: 2,
      color: "#0f172a",
      fontSize: 18,
      depth: "hero"
    })
  ];
  selectedAssets.forEach((asset, index) => {
    const nodeX = x + index * gap;
    const node = createCuratedSymbolNode({
      assetId: asset.id,
      label: asset.name,
      x: nodeX,
      y,
      width: 150,
      height: 120,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: asset.semanticSlots[0],
      layoutHint: `${pack.id}:step-${index + 1}`
    });
    nodes.push({ ...node, transform: { ...node.transform, z: index * 2 + 1 } });
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: nodeX - gap + 154, y: y + 58 },
        { x: nodeX - 8, y: y + 58 }
      ], "", { stroke: "#475569", strokeWidth: 2.6 }));
    }
  });
  return withWorkflowFigureMetadata(nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } })), pack.id);
}

function withWorkflowFigureMetadata(nodes: SceneNode[], workflowPack: string, templateId?: string): SceneNode[] {
  return nodes.map((node) => ({
    ...node,
    payload: {
      ...(node.payload as Record<string, unknown>),
      workflowPack,
      ...(templateId ? { templateId } : {})
    } as SceneNode["payload"]
  }));
}

function createTemplateFigureNodes(pack: WorkflowPack, template: WorkflowTemplate, input: {
  workflowPack?: string;
  templateId?: string;
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
  stepCount?: number;
}): SceneNode[] {
  if (template.id === "perturb-seq-workflow") return createPerturbSeqFlagshipTemplateNodes(template, input);
  if (template.id === "single-cell-workflow") return createSingleCellMultiomicsFlagshipTemplateNodes(template, input);
  if (template.id === "embedding-results") return createSingleCellEmbeddingResultsTemplateNodes(template, input);
  if (template.id === "cell-state-summary") return createSingleCellStateSummaryTemplateNodes(template, input);
  if (template.id === "multiome-assay-summary") return createSingleCellMultiomeAssaySummaryTemplateNodes(template, input);
  if (template.id === "spatial-results-panel") return createSpatialResultsFlagshipTemplateNodes(template, input);
  if (template.id === "spatial-realistic-hybrid-panel") return createSpatialRealisticHybridTemplateNodes(template, input);
  if (template.id === "wetlab-realistic-context-panel") return createWetlabRealisticContextTemplateNodes(template, input);
  if (template.id === "cellular-realistic-evidence-panel") return createCellularRealisticEvidenceTemplateNodes(template, input);
  if (template.id === "space-realistic-context-panel") return createSpaceRealisticContextTemplateNodes(template, input);
  if (template.id === "drug-discovery-funnel") return createDrugDiscoveryFlagshipTemplateNodes(template, input);
  if (template.id === "protein-engineering-platform") return createProteinEngineeringFlagshipTemplateNodes(template, input);
  if (template.id === "synthetic-biology-platform") return createSyntheticBiologyFlagshipTemplateNodes(template, input);
  if (template.id === "microbiome-infectious-disease-platform") return createMicrobiomeInfectiousDiseaseFlagshipTemplateNodes(template, input);
  if (template.id === "cell-therapy-manufacturing-platform") return createCellTherapyFlagshipTemplateNodes(template, input);
  if (template.id === "microscopy-image-analysis-pipeline") return createMicroscopyImageAnalysisFlagshipTemplateNodes(template, input);
  if (template.id === "lab-automation-platform") return createLabAutomationFlagshipTemplateNodes(template, input);
  if (template.id === "anatomy-organ-system-overview") return createAnatomyOrganSystemsFlagshipTemplateNodes(template, input);
  if (template.id === "methods-protocol-overview") return createMethodsProtocolsFlagshipTemplateNodes(template, input);
  if (template.id === "grant-consulting-one-slide") return createGrantConsultingFlagshipTemplateNodes(template, input);
  if (template.id === "clinical-translational-study-overview") return createClinicalTranslationalFlagshipTemplateNodes(template, input);
  if (template.id === "ai-biosecurity-pipeline") return createAiBiosecurityFlagshipTemplateNodes(template, input);
  if (template.id === "permissioning-ladder") return createPermissioningLadderTemplateNodes(template, input);
  if (template.id === "benchmark-dashboard") return createBenchmarkDashboardTemplateNodes(template, input);
  if (template.id === "review-audit-flow") return createReviewAuditFlowTemplateNodes(template, input);
  if (template.layout === "multi-panel" || template.layout === "results") {
    return createTemplatePanelFigureNodes(pack, template, input);
  }
  return createTemplateWorkflowStripNodes(pack, template, input);
}

function createTemplateWorkflowStripNodes(pack: WorkflowPack, template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
  stepCount?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const stepCount = Math.max(3, Math.min(input.stepCount ?? template.previewAssetIds.length, 6));
  const x = input.x ?? 92;
  const y = input.y ?? 250;
  const width = input.width ?? 940;
  const gap = width / stepCount;
  const selectedAssetIds = [...template.previewAssetIds, ...pack.assetIds].filter((assetId, index, values) => values.indexOf(assetId) === index).slice(0, stepCount);
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", template.name, createTransform(x - 26, y - 86, width + 72, 250), {
      fill: "#ffffff",
      stroke: template.layout === "pipeline" ? "#bfdbfe" : "#dbeafe",
      strokeWidth: 2,
      color: "#0f172a",
      fontSize: 18,
      depth: "hero"
    }),
    createTextNode(template.name, createTransform(x, y - 66, Math.min(width, 620), 28), {
      fontSize: 21,
      fontWeight: 850,
      color: "#0f172a"
    }),
    createTextNode(template.description, createTransform(x, y - 38, width - 20, 24), {
      fontSize: 12,
      fontWeight: 650,
      color: "#64748b"
    })
  ];
  selectedAssetIds.forEach((assetId, index) => {
    const asset = getAsset(assetId);
    const nodeX = x + index * gap;
    const node = createCuratedSymbolNode({
      assetId,
      label: asset.name,
      x: nodeX,
      y,
      width: 150,
      height: 120,
      styleProfile,
      semanticRole: template.workflowPack,
      layoutHint: `${template.id}:step-${index + 1}`
    });
    nodes.push(node);
    nodes.push(createTextNode(asset.panelRole.replace(/-/g, " "), createTransform(nodeX + 8, y + 124, 132, 22), {
      fontSize: 11,
      fontWeight: 750,
      color: "#475569"
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: nodeX - gap + 154, y: y + 58 },
        { x: nodeX - 8, y: y + 58 }
      ], "", { stroke: template.layout === "pipeline" ? "#2563eb" : "#475569", strokeWidth: 2.6 }));
    }
  });
  nodes.push(createTextNode(`QA: ${template.qaChecklist[0] ?? "Review layout, provenance, and export warnings."}`, createTransform(x, y + 174, width - 12, 28), {
    fontSize: 12,
    fontWeight: 700,
    color: "#7c2d12"
  }));
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createTemplatePanelFigureNodes(pack: WorkflowPack, template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 84;
  const y = input.y ?? 120;
  const width = input.width ?? 1048;
  const panelGap = 22;
  const panelWidth = Math.round((width - panelGap) / 2);
  const panelHeight = 178;
  const selectedAssetIds = [...template.previewAssetIds, ...pack.assetIds].filter((assetId, index, values) => values.indexOf(assetId) === index).slice(0, 4);
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", template.name, createTransform(x - 20, y - 48, width + 40, 464), {
      fill: "#ffffff",
      stroke: "#dbeafe",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode(template.name, createTransform(x, y - 36, 560, 28), {
      fontSize: 22,
      fontWeight: 850,
      color: "#0f172a"
    }),
    createTextNode(template.description, createTransform(x + 560, y - 34, width - 560, 26), {
      fontSize: 12,
      fontWeight: 650,
      color: "#64748b"
    })
  ];
  selectedAssetIds.forEach((assetId, index) => {
    const asset = getAsset(assetId);
    const col = index % 2;
    const row = Math.floor(index / 2);
    const panelX = x + col * (panelWidth + panelGap);
    const panelY = y + row * (panelHeight + panelGap);
    const tag = String.fromCharCode(65 + index);
    nodes.push(createShapeNode("round-rect", "", createTransform(panelX, panelY, panelWidth, panelHeight), {
      fill: "#f8fafc",
      stroke: "#cbd5e1",
      strokeWidth: 1.4,
      depth: "raised"
    }));
    nodes.push(createTextNode(tag, createTransform(panelX + 14, panelY + 12, 24, 24), {
      fontSize: 18,
      fontWeight: 900,
      color: "#0f172a"
    }));
    nodes.push(createTextNode(asset.name, createTransform(panelX + 45, panelY + 14, panelWidth - 72, 22), {
      fontSize: 13,
      fontWeight: 800,
      color: "#334155"
    }));
    nodes.push(createCuratedSymbolNode({
      assetId,
      label: asset.name,
      x: panelX + 32,
      y: panelY + 48,
      width: 150,
      height: 112,
      styleProfile,
      semanticRole: asset.semanticSlots[0] ?? template.workflowPack,
      layoutHint: `${template.id}:panel-${tag}`
    }));
    nodes.push(createTextNode(template.qaChecklist[index % template.qaChecklist.length] ?? "Review provenance before export.", createTransform(panelX + 202, panelY + 58, panelWidth - 230, 66), {
      fontSize: 12,
      fontWeight: 650,
      color: "#475569"
    }));
  });
  nodes.push(createTextNode(`Agent template: ${template.id}. Sources and claims remain editable; resolve QA items before PPTX/PDF export.`, createTransform(x + 26, y + 372, width - 52, 28), {
    fontSize: 12,
    fontWeight: 750,
    color: "#7c2d12"
  }));
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function flagshipStyleTheme(styleProfile: AssetStyleProfile | undefined, accent: "blue" | "purple" | "risk" = "blue") {
  const profile = styleProfile ?? "consulting-2p5d";
  const isLine = profile === "publication-line";
  const isDark = profile === "dark-talk";
  const accentMap = {
    blue: { accent: "#2563eb", accent2: "#16a34a", outer: "#bfdbfe" },
    purple: { accent: "#7c3aed", accent2: "#0891b2", outer: "#e9d5ff" },
    risk: { accent: "#dc2626", accent2: "#f97316", outer: "#fecaca" }
  }[accent];
  const accentColor = isLine ? "#111827" : isDark ? "#38bdf8" : accentMap.accent;
  const accent2Color = isLine ? "#374151" : isDark ? "#34d399" : accentMap.accent2;
  const warningColor = isLine ? "#111827" : isDark ? "#fdba74" : "#9a3412";
  const panelFill = isDark ? "#0f172a" : "#f8fafc";
  const panelAltFill = isDark ? "#111827" : isLine ? "#ffffff" : accent === "risk" ? "#fff7ed" : "#f0f9ff";
  const panelStroke = isLine ? "#111827" : isDark ? "#334155" : "#cbd5e1";
  const warningFill = isDark ? "#431407" : isLine ? "#ffffff" : "#fff7ed";
  const warningStroke = isDark ? "#f97316" : isLine ? "#111827" : "#fed7aa";
  const plotStyle: Style = {
    fill: isDark ? "#111827" : "#ffffff",
    stroke: isLine ? "#111827" : isDark ? "#475569" : "#cbd5e1",
    color: isDark ? "#e2e8f0" : "#0f172a",
    depth: isLine ? "surface" : "raised"
  };
  const symbolAppearance = isLine
    ? { accent: "#111827", stroke: "#111827", secondary: "#f3f4f6", fill: "#ffffff", labelColor: "#111827", strokeWidth: 1.6 }
    : isDark
      ? { accent: accentColor, stroke: "#7dd3fc", secondary: "#1e293b", fill: "#0f172a", labelColor: "#e2e8f0", strokeWidth: 2.2 }
      : {};
  const riskSymbolProfile = isLine ? "publication-line" : isDark ? "dark-talk" : "risk-warning";
  const riskSymbolAppearance = isLine
    ? symbolAppearance
    : isDark
      ? { accent: "#fb923c", stroke: "#fdba74", secondary: "#431407", fill: "#1e293b", labelColor: "#fde68a", strokeWidth: 2.2 }
      : {};
  return {
    profile,
    isLine,
    isDark,
    outerFill: isDark ? "#020617" : "#ffffff",
    outerStroke: isLine ? "#111827" : isDark ? "#334155" : accentMap.outer,
    outerDepth: isLine ? "surface" as const : "hero" as const,
    panelFill,
    panelAltFill,
    panelStroke,
    panelDepth: isLine ? "surface" as const : "raised" as const,
    floatingDepth: isLine ? "surface" as const : "floating" as const,
    chipFill: isDark ? "#111827" : isLine ? "#ffffff" : "#eff6ff",
    chipAltFill: isDark ? "#0f172a" : isLine ? "#ffffff" : "#f0fdf4",
    chipStroke: isLine ? "#111827" : isDark ? "#334155" : "#bfdbfe",
    heading: isDark ? "#f8fafc" : "#0f172a",
    text: isDark ? "#e2e8f0" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    accent: accentColor,
    accent2: accent2Color,
    connector: isLine ? "#111827" : isDark ? "#94a3b8" : "#334155",
    warningFill,
    warningStroke,
    warningText: warningColor,
    reviewText: isDark ? "#fdba74" : isLine ? "#374151" : "#9a3412",
    plotStyle,
    symbolAppearance,
    riskSymbolProfile,
    riskSymbolAppearance
  };
}

function createPerturbSeqFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic Perturb-seq flagship demo data generated by Scientific Image", "Scientific Image perturb-seq workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Perturb-seq CRISPR source-to-hit figure", createTransform(x, y - 32, 600, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Workflow hierarchy: perturbation identity, single-cell readout, hit evidence, and review-ready export.", createTransform(x + 572, y - 34, width - 572, 44), {
      fontSize: 11.5,
      fontWeight: 650,
      color: theme.muted
    }),
    createShapeNode("round-rect", "", createTransform(x + 4, y + 12, 226, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Source to scene JSON", createTransform(x + 18, y + 17, 198, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    createShapeNode("round-rect", "", createTransform(x + 246, y + 12, 208, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Review-aware PPTX/PDF export", createTransform(x + 260, y + 17, 178, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];
  const panelGap = 18;
  const topY = y + 64;
  const topH = 184;
  const designW = 320;
  const assayW = 326;
  const readoutW = width - designW - assayW - panelGap * 2;
  const panels = [
    { tag: "A", title: "Design perturbation library", px: x, py: topY, pw: designW, ph: topH, fill: theme.panelFill, accent: theme.accent },
    { tag: "B", title: "Deliver and capture cells", px: x + designW + panelGap, py: topY, pw: assayW, ph: topH, fill: theme.panelAltFill, accent: theme.accent2 },
    { tag: "C", title: "Read out guide-linked expression", px: x + designW + assayW + panelGap * 2, py: topY, pw: readoutW, ph: topH, fill: theme.panelFill, accent: theme.accent }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.px, panel.py, panel.pw, panel.ph), {
      fill: panel.fill,
      stroke: theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureText(panel.tag, createTransform(panel.px + 14, panel.py + 12, 24, 24), {
      fontSize: 17,
      fontWeight: 950,
      color: panel.accent
    }));
    nodes.push(figureText(panel.title, createTransform(panel.px + 46, panel.py + 14, panel.pw - 64, 22), {
      fontSize: 13,
      fontWeight: 880,
      color: theme.text
    }));
  }
  nodes.push(
    createCuratedSymbolNode({
      assetId: "cell-t",
      label: "Target cells",
      x: x + 28,
      y: topY + 58,
      width: 118,
      height: 92,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "input-sample",
      layoutHint: `${template.id}:step-1-target-cells`
    }),
    createCuratedSymbolNode({
      assetId: "guide-rna",
      label: "Guide library",
      x: x + 168,
      y: topY + 56,
      width: 126,
      height: 96,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "perturbation-step",
      layoutHint: `${template.id}:step-2-guide-library`
    }),
    createConnectorNode([
      { x: x + 145, y: topY + 104 },
      { x: x + 168, y: topY + 104 }
    ], "", { stroke: theme.accent, strokeWidth: 2.2 }),
    figureText("Target cells plus guide design.", createTransform(x + 24, topY + 154, designW - 48, 20), {
      fontSize: 10.5,
      fontWeight: 720,
      color: theme.muted
    }),
    createCuratedSymbolNode({
      assetId: "lentiviral-library",
      label: "Pooled delivery",
      x: x + designW + panelGap + 30,
      y: topY + 56,
      width: 124,
      height: 96,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "perturbation-step",
      layoutHint: `${template.id}:step-3-pooled-delivery`
    }),
    createCuratedSymbolNode({
      assetId: "scrna-droplet",
      label: "Cell + guide",
      x: x + designW + panelGap + 174,
      y: topY + 54,
      width: 124,
      height: 98,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "assay-step",
      layoutHint: `${template.id}:step-4-single-cell-capture`
    }),
    createConnectorNode([
      { x: x + designW + panelGap + 154, y: topY + 104 },
      { x: x + designW + panelGap + 176, y: topY + 104 }
    ], "", { stroke: theme.accent2, strokeWidth: 2.2 }),
    figureText("Guide barcode plus transcriptome.", createTransform(x + designW + panelGap + 24, topY + 154, assayW - 48, 20), {
      fontSize: 10.5,
      fontWeight: 720,
      color: theme.muted
    }),
    createCuratedSymbolNode({
      assetId: "sequencer",
      label: "Sequencing",
      x: x + designW + assayW + panelGap * 2 + 26,
      y: topY + 54,
      width: 126,
      height: 98,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "data-evidence",
      layoutHint: `${template.id}:step-5-sequencing`
    }),
    createCuratedSymbolNode({
      assetId: "expression-matrix",
      label: "Matrix",
      x: x + designW + assayW + panelGap * 2 + 174,
      y: topY + 54,
      width: 132,
      height: 100,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "data-evidence",
      layoutHint: `${template.id}:step-6-expression-matrix`
    }),
    createConnectorNode([
      { x: x + designW + assayW + panelGap * 2 + 152, y: topY + 104 },
      { x: x + designW + assayW + panelGap * 2 + 174, y: topY + 104 }
    ], "", { stroke: theme.accent, strokeWidth: 2.2 }),
    createShapeNode("round-rect", "", createTransform(x + designW + assayW + panelGap * 2 + 308, topY + 76, 56, 54), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("QC", createTransform(x + designW + assayW + panelGap * 2 + 323, topY + 86, 28, 16), {
      fontSize: 10,
      fontWeight: 900,
      color: theme.accent
    }),
    figureText("calls", createTransform(x + designW + assayW + panelGap * 2 + 318, topY + 106, 38, 16), {
      fontSize: 8.5,
      fontWeight: 750,
      color: theme.muted
    }),
    createConnectorNode([
      { x: x + designW - 2, y: topY + 92 },
      { x: x + designW + panelGap + 2, y: topY + 92 }
    ], "", { stroke: theme.connector, strokeWidth: 2.4 }),
    createConnectorNode([
      { x: x + designW + panelGap + assayW - 2, y: topY + 92 },
      { x: x + designW + assayW + panelGap * 2 + 2, y: topY + 92 }
    ], "", { stroke: theme.connector, strokeWidth: 2.4 })
  );
  const volcanoTable = {
    id: createId("table"),
    name: "Demo perturb-seq hit table",
    columns: ["gene", "log2FC", "pValue", "program"],
    rows: [
      { gene: "STAT1", log2FC: 2.35, pValue: 0.00000008, program: "IFN" },
      { gene: "IRF7", log2FC: 1.9, pValue: 0.0000006, program: "IFN" },
      { gene: "MYC", log2FC: -1.4, pValue: 0.00003, program: "growth" },
      { gene: "CDKN1A", log2FC: 2.1, pValue: 0.000004, program: "cell-cycle" },
      { gene: "CXCL10", log2FC: 2.8, pValue: 0.00000001, program: "IFN" },
      { gene: "MKI67", log2FC: -1.7, pValue: 0.000006, program: "cell-cycle" },
      { gene: "GZMB", log2FC: 1.2, pValue: 0.0004, program: "cytotoxic" }
    ],
    source
  };
  nodes.push(
    createShapeNode("round-rect", "", createTransform(x, y + 280, 372, 176), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("D", createTransform(x + 14, y + 294, 24, 24), {
      fontSize: 17,
      fontWeight: 950,
      color: theme.accent
    }),
    figureText("Mechanism to effect-size readout", createTransform(x + 46, y + 296, 286, 22), {
      fontSize: 13,
      fontWeight: 880,
      color: theme.text
    }),
    figureText("Mechanism and effect-size objects remain editable for figure refinement.", createTransform(x + 24, y + 324, 324, 34), {
      fontSize: 10.5,
      fontWeight: 720,
      color: theme.muted
    }),
    createCuratedSymbolNode({
      assetId: "crispr-cas9",
      label: "Cas9",
      x: x + 18,
      y: y + 338,
      width: 128,
      height: 96,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "perturbation-step",
      layoutHint: `${template.id}:interpretation-cas9`
    }),
    createCuratedSymbolNode({
      assetId: "metric-card",
      label: "Effect size",
      x: x + 186,
      y: y + 338,
      width: 128,
      height: 96,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "evaluation-evidence",
      layoutHint: `${template.id}:interpretation-metric`
    }),
    createConnectorNode([
      { x: x + 146, y: y + 386 },
      { x: x + 186, y: y + 386 }
    ], "", { stroke: theme.accent, strokeWidth: 2.2 }),
    createShapeNode("round-rect", "", createTransform(x + 392, y + 280, width - 392, 176), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("E", createTransform(x + 408, y + 294, 24, 24), {
      fontSize: 17,
      fontWeight: 950,
      color: theme.accent2
    }),
    figureText("Evidence panel and review queue", createTransform(x + 440, y + 296, 286, 22), {
      fontSize: 13,
      fontWeight: 880,
      color: theme.text
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "volcano",
      title: "Hit genes",
      table: volcanoTable,
      encodings: { x: "log2FC", y: "pValue", color: "program", label: "gene" },
      style: theme.plotStyle
    }, createTransform(x + 414, y + 320, 430, 128)),
    createShapeNode("round-rect", "", createTransform(x + 856, y + 318, 190, 136), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1.2,
      depth: "surface"
    }),
    figureText("Review before export", createTransform(x + 872, y + 334, 156, 20), {
      fontSize: 12,
      fontWeight: 900,
      color: theme.warningText
    }),
    createTextNode("Confirm source, guide mapping, hit threshold, and plot provenance.", createTransform(x + 872, y + 358, 156, 42), {
      fontSize: 9.8,
      fontWeight: 720,
      color: theme.reviewText
    }),
    createShapeNode("round-rect", "", createTransform(x + 868, y + 414, 74, 20), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("SVG exact", createTransform(x + 878, y + 418, 54, 14), {
      fontSize: 8.4,
      fontWeight: 850,
      color: theme.accent
    }),
    createShapeNode("round-rect", "", createTransform(x + 950, y + 414, 84, 20), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PPTX fallback", createTransform(x + 954, y + 418, 76, 14), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSingleCellMultiomicsFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic single-cell multiomics flagship demo data generated by Scientific Image", "Scientific Image single-cell-multiomics workflow pack fixture");
  const figureText = (value: string, transform: Transform, style: Style = {}, align: "start" | "middle" | "end" = "middle"): SceneNode => {
    const node = createTextNode(value, transform, style);
    return { ...node, payload: { ...(node.payload as Record<string, unknown>), align }, claimStatus: "draft-visual" } as SceneNode;
  };
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    semanticRole: string,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole,
    layoutHint: `${template.id}:${layoutHint}`,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 548), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Single-cell multiomics capture-to-state figure", createTransform(x, y - 32, 620, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }, "start"),
    figureText("Editable assay evidence links droplet capture, RNA/ATAC readout, embedding, cell states, and review-aware export.", createTransform(x + 604, y - 34, width - 604, 44), {
      fontSize: 11.4,
      fontWeight: 650,
      color: theme.muted
    }, "end"),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 198, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: single-cell multiomics", createTransform(x + 18, y + 17, 168, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }, "middle"),
    figureShape("round-rect", "", createTransform(x + 218, y + 12, 206, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("RNA + chromatin evidence", createTransform(x + 232, y + 17, 176, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    }, "middle"),
    figureShape("round-rect", "", createTransform(x + 440, y + 12, 192, 28), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("reviewable PlotSpec output", createTransform(x + 454, y + 17, 162, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.warningText
    }, "middle")
  ];

  const topY = y + 64;
  const panelGap = 18;
  const topH = 184;
  const captureW = 318;
  const readoutW = 350;
  const chromatinW = width - captureW - readoutW - panelGap * 2;
  const panels = [
    { tag: "A", title: "Capture and molecular identity", px: x, py: topY, pw: captureW, ph: topH, fill: theme.panelFill, accent: theme.accent },
    { tag: "B", title: "Reads to expression matrix", px: x + captureW + panelGap, py: topY, pw: readoutW, ph: topH, fill: theme.panelAltFill, accent: theme.accent2 },
    { tag: "C", title: "Chromatin evidence layer", px: x + captureW + readoutW + panelGap * 2, py: topY, pw: chromatinW, ph: topH, fill: theme.panelFill, accent: theme.accent }
  ];
  for (const panel of panels) {
    nodes.push(figureShape("round-rect", "", createTransform(panel.px, panel.py, panel.pw, panel.ph), {
      fill: panel.fill,
      stroke: theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(panel.px + 14, panel.py + 13, 28, 22), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(panel.tag, createTransform(panel.px + 14, panel.py + 16, 28, 16), {
      fontSize: 12,
      fontWeight: 930,
      color: panel.accent
    }));
    nodes.push(figureText(panel.title, createTransform(panel.px + 52, panel.py + 15, panel.pw - 68, 20), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"));
  }

  nodes.push(
    symbol("scrna-droplet", "Droplet", x + 24, topY + 56, 88, 84, "assay-step", "capture-droplet", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cell-barcode", "Barcode", x + 118, topY + 58, 78, 76, "sample-identity", "cell-barcode", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("umi-tag", "UMI", x + 208, topY + 60, 76, 72, "sample-identity", "umi-tag", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    createConnectorNode([
      { x: x + 108, y: topY + 98 },
      { x: x + 124, y: topY + 98 }
    ], "", { stroke: theme.accent, strokeWidth: 1.9 }),
    createConnectorNode([
      { x: x + 194, y: topY + 98 },
      { x: x + 210, y: topY + 98 }
    ], "", { stroke: theme.accent2, strokeWidth: 1.9 }),
    figureText("barcode + UMI preserve molecule IDs", createTransform(x + 24, topY + 146, captureW - 48, 20), {
      fontSize: 9.7,
      fontWeight: 720,
      color: theme.muted
    }),
    symbol("read-pair", "Read pair", x + captureW + panelGap + 28, topY + 58, 92, 78, "data-evidence", "paired-end-reads", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("sequencing-read", "Reads", x + captureW + panelGap + 132, topY + 60, 82, 74, "data-evidence", "aligned-reads", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("expression-matrix", "Matrix", x + captureW + panelGap + 230, topY + 52, 96, 92, "data-evidence", "expression-matrix", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    createConnectorNode([
      { x: x + captureW + panelGap + 118, y: topY + 98 },
      { x: x + captureW + panelGap + 134, y: topY + 98 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    createConnectorNode([
      { x: x + captureW + panelGap + 212, y: topY + 98 },
      { x: x + captureW + panelGap + 230, y: topY + 98 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    figureText("editable matrix keeps table provenance", createTransform(x + captureW + panelGap + 24, topY + 146, readoutW - 48, 20), {
      fontSize: 9.7,
      fontWeight: 720,
      color: theme.muted
    }),
    symbol("chromatin", "Chromatin", x + captureW + readoutW + panelGap * 2 + 28, topY + 58, 88, 78, "chromatin-evidence", "chromatin-state", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("peak-call", "Peak", x + captureW + readoutW + panelGap * 2 + 126, topY + 58, 78, 78, "chromatin-evidence", "peak-call", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("genome-browser-track", "Track", x + captureW + readoutW + panelGap * 2 + 216, topY + 52, 104, 88, "chromatin-evidence", "genome-browser-track", { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    createConnectorNode([
      { x: x + captureW + readoutW + panelGap * 2 + 116, y: topY + 98 },
      { x: x + captureW + readoutW + panelGap * 2 + 128, y: topY + 98 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    createConnectorNode([
      { x: x + captureW + readoutW + panelGap * 2 + 204, y: topY + 98 },
      { x: x + captureW + readoutW + panelGap * 2 + 216, y: topY + 98 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    figureText("ATAC peaks stay separate from RNA counts", createTransform(x + captureW + readoutW + panelGap * 2 + 24, topY + 146, chromatinW - 48, 20), {
      fontSize: 9.7,
      fontWeight: 720,
      color: theme.muted
    })
  );

  const lowerY = y + 284;
  const lowerH = 196;
  const leftW = 448;
  const rightW = width - leftW - panelGap;
  const embeddingTable = {
    id: createId("table"),
    name: "Illustrative single-cell embedding",
    columns: ["cell", "umap1", "umap2", "state", "marker"],
    rows: [
      { cell: "C1", umap1: -2.2, umap2: 1.1, state: "naive", marker: "IL7R" },
      { cell: "C2", umap1: -1.8, umap2: 1.5, state: "naive", marker: "CCR7" },
      { cell: "C3", umap1: -1.2, umap2: 0.6, state: "cycling", marker: "MKI67" },
      { cell: "C4", umap1: 0.2, umap2: -0.4, state: "cycling", marker: "TOP2A" },
      { cell: "C5", umap1: 1.1, umap2: -1.0, state: "effector", marker: "GZMB" },
      { cell: "C6", umap1: 1.8, umap2: -0.8, state: "effector", marker: "NKG7" },
      { cell: "C7", umap1: 1.5, umap2: 1.2, state: "myeloid", marker: "LYZ" },
      { cell: "C8", umap1: 2.2, umap2: 1.4, state: "myeloid", marker: "S100A8" },
      { cell: "C9", umap1: -0.4, umap2: -1.5, state: "transition", marker: "JUN" }
    ],
    source
  };
  const accessibilityTable = {
    id: createId("table"),
    name: "Illustrative multiome evidence",
    columns: ["feature", "score", "layer"],
    rows: [
      { feature: "RNA", score: 86, layer: "expression" },
      { feature: "ATAC", score: 74, layer: "accessibility" },
      { feature: "SNP", score: 31, layer: "variant" },
      { feature: "CNV", score: 22, layer: "copy-number" }
    ],
    source
  };
  nodes.push(
    figureShape("round-rect", "", createTransform(x, lowerY, leftW, lowerH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("D", createTransform(x + 14, lowerY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("Cell-state interpretation", createTransform(x + 52, lowerY + 15, 220, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "embedding-scatter",
      title: "Embedding",
      table: embeddingTable,
      encodings: { x: "umap1", y: "umap2", color: "state", label: "marker" },
      style: theme.plotStyle
    }, createTransform(x + 24, lowerY + 48, 244, 122)),
    symbol("embedding-space", "Embedding", x + 282, lowerY + 48, 76, 72, "cell-state", "embedding-asset", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cell-neighborhood", "Neighborhood", x + 354, lowerY + 48, 68, 72, "cell-state", "neighborhood-context", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("cell-stem", "State", x + 292, lowerY + 120, 58, 54, "cell-state", "stem-state", { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("cell-dividing", "Cycling", x + 362, lowerY + 120, 58, 54, "cell-state", "cycling-state", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Cluster labels, marker claims, and cell-state names stay editable.", createTransform(x + 24, lowerY + 172, leftW - 48, 18), {
      fontSize: 9.3,
      fontWeight: 720,
      color: theme.muted
    }, "start"),
    figureShape("round-rect", "", createTransform(x + leftW + panelGap, lowerY, rightW, lowerH), {
      fill: theme.panelAltFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("E", createTransform(x + leftW + panelGap + 14, lowerY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent2
    }),
    figureText("Multiome evidence and export QA", createTransform(x + leftW + panelGap + 52, lowerY + 15, 260, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Evidence layers",
      table: accessibilityTable,
      encodings: { x: "feature", y: "score", color: "layer" },
      style: theme.plotStyle
    }, createTransform(x + leftW + panelGap + 24, lowerY + 48, 190, 124)),
    symbol("variant-snp", "Variant", x + leftW + panelGap + 228, lowerY + 48, 72, 72, "variant-evidence", "variant-snp", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("copy-number", "CNV", x + leftW + panelGap + 306, lowerY + 48, 76, 72, "variant-evidence", "copy-number", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureShape("round-rect", "", createTransform(x + leftW + panelGap + 404, lowerY + 48, rightW - 428, 124), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1.15,
      depth: "surface"
    }),
    figureText("Review queue", createTransform(x + leftW + panelGap + 420, lowerY + 62, rightW - 460, 18), {
      fontSize: 11.4,
      fontWeight: 900,
      color: theme.warningText
    }, "start"),
    figureText("Confirm sample source, barcode mapping, ATAC peak caller, marker labels, and PPTX fallbacks.", createTransform(x + leftW + panelGap + 420, lowerY + 88, rightW - 460, 46), {
      fontSize: 9.2,
      fontWeight: 720,
      color: theme.reviewText
    }, "start"),
    figureShape("round-rect", "", createTransform(x + leftW + panelGap + 420, lowerY + 144, 74, 20), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("SVG exact", createTransform(x + leftW + panelGap + 430, lowerY + 148, 54, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + leftW + panelGap + 504, lowerY + 144, 88, 20), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PPTX review", createTransform(x + leftW + panelGap + 512, lowerY + 148, 72, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSingleCellEmbeddingResultsTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic single-cell embedding result demo data generated by Scientific Image", "Scientific Image single-cell-multiomics embedding-results fixture");
  const figureText = (value: string, transform: Transform, style: Style = {}, align: "start" | "middle" | "end" = "middle"): SceneNode => {
    const node = createTextNode(value, transform, style);
    return { ...node, payload: { ...(node.payload as Record<string, unknown>), align }, claimStatus: "draft-visual" } as SceneNode;
  };
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    semanticRole: string,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole,
    layoutHint: `${template.id}:${layoutHint}`,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const embeddingTable = {
    id: createId("table"),
    name: "Illustrative immune embedding",
    columns: ["cell", "umap1", "umap2", "state", "marker"],
    rows: [
      { cell: "T01", umap1: -2.4, umap2: 1.4, state: "Naive", marker: "IL7R" },
      { cell: "T02", umap1: -2.0, umap2: 1.0, state: "Naive", marker: "CCR7" },
      { cell: "T03", umap1: -1.5, umap2: 1.7, state: "Naive", marker: "TCF7" },
      { cell: "C01", umap1: -0.6, umap2: -0.4, state: "Cycle", marker: "MKI67" },
      { cell: "C02", umap1: -0.1, umap2: -0.8, state: "Cycle", marker: "TOP2A" },
      { cell: "C03", umap1: 0.3, umap2: -0.2, state: "Cycle", marker: "PCNA" },
      { cell: "E01", umap1: 1.2, umap2: -1.2, state: "Eff", marker: "GZMB" },
      { cell: "E02", umap1: 1.8, umap2: -1.0, state: "Eff", marker: "NKG7" },
      { cell: "E03", umap1: 2.2, umap2: -0.5, state: "Eff", marker: "PRF1" },
      { cell: "M01", umap1: 1.2, umap2: 1.2, state: "Mye", marker: "LYZ" },
      { cell: "M02", umap1: 1.8, umap2: 1.5, state: "Mye", marker: "S100A8" },
      { cell: "M03", umap1: 2.4, umap2: 1.0, state: "Mye", marker: "FCGR3A" }
    ],
    source
  };
  const markerTable = {
    id: createId("table"),
    name: "Illustrative marker expression heatmap",
    columns: ["gene", "state", "value"],
    rows: [
      { gene: "IL7R", state: "Naive", value: 0.92 },
      { gene: "IL7R", state: "Cycle", value: 0.36 },
      { gene: "IL7R", state: "Eff", value: 0.22 },
      { gene: "IL7R", state: "Mye", value: 0.08 },
      { gene: "MKI67", state: "Naive", value: 0.18 },
      { gene: "MKI67", state: "Cycle", value: 0.94 },
      { gene: "MKI67", state: "Eff", value: 0.28 },
      { gene: "MKI67", state: "Mye", value: 0.12 },
      { gene: "GZMB", state: "Naive", value: 0.16 },
      { gene: "GZMB", state: "Cycle", value: 0.26 },
      { gene: "GZMB", state: "Eff", value: 0.91 },
      { gene: "GZMB", state: "Mye", value: 0.2 },
      { gene: "LYZ", state: "Naive", value: 0.06 },
      { gene: "LYZ", state: "Cycle", value: 0.12 },
      { gene: "LYZ", state: "Eff", value: 0.18 },
      { gene: "LYZ", state: "Mye", value: 0.95 }
    ],
    source
  };
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 548), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Single-cell embedding and marker evidence", createTransform(x, y - 32, 660, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }, "start"),
    figureText("PlotSpec embedding, marker heatmap, state labels, and review queue remain editable.", createTransform(x + 646, y - 34, width - 646, 44), {
      fontSize: 11.4,
      fontWeight: 650,
      color: theme.muted
    }, "end"),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 156, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable embedding", createTransform(x + 18, y + 17, 128, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }, "middle"),
    figureShape("round-rect", "", createTransform(x + 176, y + 12, 158, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("marker evidence", createTransform(x + 190, y + 17, 130, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    }, "middle"),
    figureShape("round-rect", "", createTransform(x + 350, y + 12, 170, 28), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("claim review required", createTransform(x + 364, y + 17, 140, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.warningText
    }, "middle")
  ];

  const topY = y + 64;
  const gap = 18;
  const topH = 270;
  const leftW = 572;
  const rightW = width - leftW - gap;
  nodes.push(
    figureShape("round-rect", "", createTransform(x, topY, leftW, topH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("A", createTransform(x + 14, topY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("Embedding with cluster labels", createTransform(x + 52, topY + 15, 230, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "embedding-scatter",
      title: "Cell-state embedding",
      table: embeddingTable,
      encodings: { x: "umap1", y: "umap2", color: "state", label: "marker" },
      style: theme.plotStyle
    }, createTransform(x + 24, topY + 50, 352, 178)),
    symbol("embedding-space", "Embedding", x + 396, topY + 54, 78, 74, "cell-state", "embedding-space", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cell-neighborhood", "Neighborhood", x + 476, topY + 54, 70, 74, "cell-state", "cell-neighborhood", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureShape("round-rect", "", createTransform(x + 396, topY + 146, 150, 70), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("State legend", createTransform(x + 410, topY + 158, 116, 14), {
      fontSize: 9.1,
      fontWeight: 900,
      color: theme.text
    }, "start")
  );
  [
    { label: "Naive", fill: "#a78bfa" },
    { label: "Cycle", fill: "#22c55e" },
    { label: "Effector", fill: "#fb923c" },
    { label: "Myeloid", fill: "#38bdf8" }
  ].forEach((item, index) => {
    const rowY = topY + 178 + index * 14;
    nodes.push(figureShape("ellipse", "", createTransform(x + 412, rowY, 8, 8), {
      fill: item.fill,
      stroke: item.fill,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(item.label, createTransform(x + 426, rowY - 3, 78, 12), {
      fontSize: 8,
      fontWeight: 760,
      color: theme.muted
    }, "start"));
  });
  nodes.push(figureText("Labels are editable and stay separate from raw PlotSpec data.", createTransform(x + 24, topY + 236, leftW - 48, 18), {
    fontSize: 9.4,
    fontWeight: 720,
    color: theme.muted
  }, "start"));

  nodes.push(
    figureShape("round-rect", "", createTransform(x + leftW + gap, topY, rightW, topH), {
      fill: theme.panelAltFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("B", createTransform(x + leftW + gap + 14, topY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent2
    }),
    figureText("Marker heatmap and lineage anchors", createTransform(x + leftW + gap + 52, topY + 15, 260, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "Marker program",
      table: markerTable,
      encodings: { x: "state", y: "gene", value: "value" },
      style: theme.plotStyle
    }, createTransform(x + leftW + gap + 24, topY + 50, 238, 168)),
    symbol("gene-locus", "Gene", x + leftW + gap + 282, topY + 52, 76, 70, "marker-evidence", "gene-locus", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("expression-matrix", "Matrix", x + leftW + gap + 372, topY + 52, 84, 72, "marker-evidence", "expression-matrix", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("cell-t", "T cell", x + leftW + gap + 282, topY + 142, 62, 58, "cell-state", "t-cell-anchor", { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("cell-b", "B cell", x + leftW + gap + 350, topY + 142, 62, 58, "cell-state", "b-cell-anchor", { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("cell-macrophage", "Myeloid", x + leftW + gap + 418, topY + 142, 62, 58, "cell-state", "myeloid-anchor", { accent: "#f97316", stroke: "#f97316", labelVisible: false }),
    figureText("Marker labels require source-backed interpretation before final export.", createTransform(x + leftW + gap + 24, topY + 236, rightW - 48, 18), {
      fontSize: 9.4,
      fontWeight: 720,
      color: theme.muted
    }, "start")
  );

  const bottomY = topY + topH + 20;
  const bottomH = 154;
  const calloutW = 662;
  const reviewW = width - calloutW - gap;
  nodes.push(
    figureShape("round-rect", "", createTransform(x, bottomY, calloutW, bottomH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }),
    figureText("C", createTransform(x + 14, bottomY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("Cell-state callouts", createTransform(x + 52, bottomY + 15, 180, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    symbol("cell-stem", "Progenitor-like", x + 24, bottomY + 52, 84, 78, "cell-state", "progenitor-state", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cell-dividing", "Cycling", x + 124, bottomY + 52, 84, 78, "cell-state", "cycling-state", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("cell-immune", "Immune", x + 224, bottomY + 52, 84, 78, "cell-state", "immune-state", { accent: "#f97316", stroke: "#f97316", labelVisible: false }),
    createConnectorNode([
      { x: x + 108, y: bottomY + 90 },
      { x: x + 126, y: bottomY + 90 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    createConnectorNode([
      { x: x + 208, y: bottomY + 90 },
      { x: x + 226, y: bottomY + 90 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    figureShape("round-rect", "", createTransform(x + 336, bottomY + 50, 136, 72), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Marker rule", createTransform(x + 352, bottomY + 62, 104, 14), {
      fontSize: 9.3,
      fontWeight: 900,
      color: theme.accent
    }, "start"),
    figureText("state label = cluster + marker support", createTransform(x + 352, bottomY + 84, 104, 28), {
      fontSize: 8.3,
      fontWeight: 720,
      color: theme.muted
    }, "start"),
    figureShape("round-rect", "", createTransform(x + 492, bottomY + 50, 140, 72), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Uncertainty", createTransform(x + 508, bottomY + 62, 102, 14), {
      fontSize: 9.3,
      fontWeight: 900,
      color: theme.accent2
    }, "start"),
    figureText("avoid overstating inferred transitions", createTransform(x + 508, bottomY + 84, 102, 28), {
      fontSize: 8.3,
      fontWeight: 720,
      color: theme.muted
    }, "start")
  );

  nodes.push(
    figureShape("round-rect", "", createTransform(x + calloutW + gap, bottomY, reviewW, bottomH), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1.25,
      depth: theme.floatingDepth
    }),
    figureText("D", createTransform(x + calloutW + gap + 14, bottomY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.warningText
    }),
    figureText("Review before export", createTransform(x + calloutW + gap + 52, bottomY + 15, 190, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.warningText
    }, "start"),
    figureText("Confirm cluster labels, marker thresholds, sample source, and citation status before PPTX/PDF delivery.", createTransform(x + calloutW + gap + 28, bottomY + 48, reviewW - 56, 42), {
      fontSize: 9.6,
      fontWeight: 730,
      color: theme.reviewText
    }, "start"),
    figureShape("round-rect", "", createTransform(x + calloutW + gap + 28, bottomY + 106, 76, 22), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("SVG exact", createTransform(x + calloutW + gap + 38, bottomY + 111, 56, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + calloutW + gap + 114, bottomY + 106, 92, 22), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PlotSpec QA", createTransform(x + calloutW + gap + 124, bottomY + 111, 72, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    }),
    figureShape("round-rect", "", createTransform(x + calloutW + gap + 216, bottomY + 106, 102, 22), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PPTX review", createTransform(x + calloutW + gap + 228, bottomY + 111, 78, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSingleCellStateSummaryTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic single-cell cell-state summary demo data generated by Scientific Image", "Scientific Image single-cell-multiomics cell-state-summary fixture");
  const figureText = (value: string, transform: Transform, style: Style = {}, align: "start" | "middle" | "end" = "middle"): SceneNode => {
    const node = createTextNode(value, transform, style);
    return { ...node, payload: { ...(node.payload as Record<string, unknown>), align }, claimStatus: "draft-visual" } as SceneNode;
  };
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    semanticRole: string,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole,
    layoutHint: `${template.id}:${layoutHint}`,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const compositionTable = {
    id: createId("table"),
    name: "Illustrative cell-state composition",
    columns: ["state", "fraction", "condition"],
    rows: [
      { state: "Naive", fraction: 34, condition: "baseline" },
      { state: "Cycle", fraction: 18, condition: "baseline" },
      { state: "Eff", fraction: 28, condition: "baseline" },
      { state: "Mye", fraction: 20, condition: "baseline" },
      { state: "Naive", fraction: 22, condition: "stimulated" },
      { state: "Cycle", fraction: 24, condition: "stimulated" },
      { state: "Eff", fraction: 38, condition: "stimulated" },
      { state: "Mye", fraction: 16, condition: "stimulated" }
    ],
    source
  };
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 548), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Single-cell cell-state summary", createTransform(x, y - 32, 520, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }, "start"),
    figureText("Editable trajectory hypothesis, composition plot, marker support, and uncertainty review for single-cell result slides.", createTransform(x + 548, y - 34, width - 548, 44), {
      fontSize: 11.4,
      fontWeight: 650,
      color: theme.muted
    }, "end"),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 168, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("state hypothesis", createTransform(x + 18, y + 17, 138, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 188, y + 12, 164, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("composition evidence", createTransform(x + 202, y + 17, 134, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    }),
    figureShape("round-rect", "", createTransform(x + 368, y + 12, 166, 28), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("uncertainty visible", createTransform(x + 382, y + 17, 136, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.warningText
    })
  ];

  const topY = y + 64;
  const gap = 18;
  const trajectoryW = 646;
  const sideW = width - trajectoryW - gap;
  const topH = 260;
  nodes.push(
    figureShape("round-rect", "", createTransform(x, topY, trajectoryW, topH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("A", createTransform(x + 14, topY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("State trajectory hypothesis", createTransform(x + 52, topY + 15, 230, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    figureText("Dashed links = inferred.", createTransform(x + 430, topY + 16, 194, 18), {
      fontSize: 8.8,
      fontWeight: 720,
      color: theme.muted
    }, "end")
  );
  const stateNodes = [
    { assetId: "cell-stem", label: "Naive", sx: x + 54, sy: topY + 70, sw: 96, sh: 86, accent: "#7c3aed", slot: "state-naive" },
    { assetId: "cell-dividing", label: "Cycling", sx: x + 228, sy: topY + 78, sw: 96, sh: 82, accent: "#16a34a", slot: "state-cycling" },
    { assetId: "cell-immune", label: "Effector", sx: x + 402, sy: topY + 64, sw: 104, sh: 90, accent: "#f97316", slot: "state-effector" },
    { assetId: "cell-macrophage", label: "Myeloid", sx: x + 404, sy: topY + 162, sw: 100, sh: 80, accent: "#0891b2", slot: "state-myeloid" }
  ];
  for (const state of stateNodes) {
    nodes.push(symbol(state.assetId, state.label, state.sx, state.sy, state.sw, state.sh, "cell-state", state.slot, {
      accent: state.accent,
      stroke: state.accent,
      labelVisible: false
    }));
    nodes.push(figureShape("round-rect", "", createTransform(state.sx + 16, state.sy + state.sh - 6, state.sw - 32, 20), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: state.accent,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(state.label, createTransform(state.sx + 22, state.sy + state.sh - 2, state.sw - 44, 12), {
      fontSize: 8.2,
      fontWeight: 850,
      color: state.accent
    }));
  }
  nodes.push(
    createConnectorNode([
      { x: x + 150, y: topY + 116 },
      { x: x + 228, y: topY + 118 }
    ], "", { stroke: theme.connector, strokeWidth: 2.2, lineStyle: "dashed" }),
    createConnectorNode([
      { x: x + 324, y: topY + 118 },
      { x: x + 402, y: topY + 112 }
    ], "", { stroke: theme.connector, strokeWidth: 2.2, lineStyle: "dashed" }),
    createConnectorNode([
      { x: x + 454, y: topY + 154 },
      { x: x + 454, y: topY + 166 }
    ], "", { stroke: theme.accent2, strokeWidth: 2.2, lineStyle: "dashed" }),
    figureShape("round-rect", "", createTransform(x + 36, topY + 194, 300, 42), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Interpretation guardrail", createTransform(x + 52, topY + 204, 134, 14), {
      fontSize: 9,
      fontWeight: 900,
      color: theme.accent
    }, "start"),
    figureText("hypothesis until lineage or time evidence", createTransform(x + 190, topY + 204, 132, 20), {
      fontSize: 8,
      fontWeight: 710,
      color: theme.muted
    }, "start"),
    symbol("cell-neighborhood", "Neighborhood", x + 536, topY + 74, 78, 76, "cell-state", "neighborhood-context", {
      accent: theme.accent2,
      stroke: theme.accent2,
      labelVisible: false
    }),
    figureText("neighborhood context", createTransform(x + 532, topY + 154, 92, 14), {
      fontSize: 8.2,
      fontWeight: 800,
      color: theme.muted
    })
  );

  nodes.push(
    figureShape("round-rect", "", createTransform(x + trajectoryW + gap, topY, sideW, topH), {
      fill: theme.panelAltFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("B", createTransform(x + trajectoryW + gap + 14, topY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent2
    }),
    figureText("Composition and marker support", createTransform(x + trajectoryW + gap + 52, topY + 15, 244, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "State composition",
      table: compositionTable,
      encodings: { x: "state", y: "fraction", color: "condition" },
      style: theme.plotStyle
    }, createTransform(x + trajectoryW + gap + 24, topY + 50, 206, 142)),
    figureShape("round-rect", "", createTransform(x + trajectoryW + gap + 246, topY + 50, sideW - 270, 142), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Marker support", createTransform(x + trajectoryW + gap + 264, topY + 66, sideW - 306, 14), {
      fontSize: 9.6,
      fontWeight: 900,
      color: theme.text
    }, "start"),
    symbol("gene-locus", "Markers", x + trajectoryW + gap + 266, topY + 86, 62, 54, "marker-evidence", "marker-support-locus", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("expression-matrix", "Matrix", x + trajectoryW + gap + 338, topY + 86, 62, 54, "marker-evidence", "marker-support-matrix", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureShape("round-rect", "", createTransform(x + trajectoryW + gap + 266, topY + 154, 126, 24), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("IL7R / MKI67 / GZMB / LYZ", createTransform(x + trajectoryW + gap + 276, topY + 160, 106, 10), {
      fontSize: 6.8,
      fontWeight: 820,
      color: theme.accent
    }),
    figureText("Composition and marker panels are source-linked PlotSpec objects.", createTransform(x + trajectoryW + gap + 24, topY + 210, sideW - 48, 18), {
      fontSize: 9.4,
      fontWeight: 720,
      color: theme.muted
    }, "start")
  );

  const bottomY = topY + topH + 20;
  const bottomH = 154;
  const evidenceW = 658;
  const reviewW = width - evidenceW - gap;
  nodes.push(
    figureShape("round-rect", "", createTransform(x, bottomY, evidenceW, bottomH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }),
    figureText("C", createTransform(x + 14, bottomY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("Editable state evidence chain", createTransform(x + 52, bottomY + 15, 224, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    symbol("embedding-space", "Embedding", x + 28, bottomY + 52, 78, 72, "cell-state", "embedding-context", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("expression-matrix", "Matrix", x + 126, bottomY + 52, 82, 72, "data-evidence", "matrix-evidence", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("gene-locus", "Markers", x + 228, bottomY + 52, 82, 72, "marker-evidence", "marker-locus", { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    createConnectorNode([
      { x: x + 106, y: bottomY + 88 },
      { x: x + 126, y: bottomY + 88 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    createConnectorNode([
      { x: x + 208, y: bottomY + 88 },
      { x: x + 228, y: bottomY + 88 }
    ], "", { stroke: theme.connector, strokeWidth: 1.9 }),
    figureShape("round-rect", "", createTransform(x + 342, bottomY + 48, 132, 76), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("State label rule", createTransform(x + 358, bottomY + 60, 100, 14), {
      fontSize: 9.1,
      fontWeight: 900,
      color: theme.accent
    }, "start"),
    figureText("cluster + marker + context", createTransform(x + 358, bottomY + 84, 96, 24), {
      fontSize: 8.2,
      fontWeight: 720,
      color: theme.muted
    }, "start"),
    figureShape("round-rect", "", createTransform(x + 500, bottomY + 48, 132, 76), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Uncertainty rule", createTransform(x + 516, bottomY + 60, 100, 14), {
      fontSize: 9.1,
      fontWeight: 900,
      color: theme.accent2
    }, "start"),
    figureText("show confidence and caveats", createTransform(x + 516, bottomY + 84, 96, 24), {
      fontSize: 8.2,
      fontWeight: 720,
      color: theme.muted
    }, "start")
  );

  nodes.push(
    figureShape("round-rect", "", createTransform(x + evidenceW + gap, bottomY, reviewW, bottomH), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1.25,
      depth: theme.floatingDepth
    }),
    figureText("D", createTransform(x + evidenceW + gap + 14, bottomY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.warningText
    }),
    figureText("Review before export", createTransform(x + evidenceW + gap + 52, bottomY + 15, 190, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.warningText
    }, "start"),
    figureText("Confirm transition wording, marker support, condition labels, and source citations before final deck export.", createTransform(x + evidenceW + gap + 28, bottomY + 48, reviewW - 56, 42), {
      fontSize: 9.6,
      fontWeight: 730,
      color: theme.reviewText
    }, "start"),
    figureShape("round-rect", "", createTransform(x + evidenceW + gap + 28, bottomY + 106, 76, 22), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("SVG exact", createTransform(x + evidenceW + gap + 38, bottomY + 111, 56, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + evidenceW + gap + 114, bottomY + 106, 100, 22), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Claim review", createTransform(x + evidenceW + gap + 126, bottomY + 111, 76, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    }),
    figureShape("round-rect", "", createTransform(x + evidenceW + gap + 224, bottomY + 106, 96, 22), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PPTX QA", createTransform(x + evidenceW + gap + 240, bottomY + 111, 64, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSingleCellMultiomeAssaySummaryTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic single-cell multiome assay summary demo data generated by Scientific Image", "Scientific Image single-cell-multiomics multiome-assay-summary fixture");
  const figureText = (value: string, transform: Transform, style: Style = {}, align: "start" | "middle" | "end" = "middle"): SceneNode => {
    const node = createTextNode(value, transform, style);
    return { ...node, payload: { ...(node.payload as Record<string, unknown>), align }, claimStatus: "draft-visual" } as SceneNode;
  };
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    semanticRole: string,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole,
    layoutHint: `${template.id}:${layoutHint}`,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const rnaTable = {
    id: createId("table"),
    name: "Illustrative RNA expression",
    columns: ["gene", "expression", "program"],
    rows: [
      { gene: "IL7R", expression: 82, program: "naive" },
      { gene: "MKI67", expression: 68, program: "cycling" },
      { gene: "GZMB", expression: 76, program: "effector" },
      { gene: "LYZ", expression: 71, program: "myeloid" }
    ],
    source
  };
  const atacTable = {
    id: createId("table"),
    name: "Illustrative ATAC peak signal",
    columns: ["position", "accessibility", "peak"],
    rows: [
      { position: 1, accessibility: 18, peak: "distal" },
      { position: 2, accessibility: 34, peak: "distal" },
      { position: 3, accessibility: 72, peak: "promoter" },
      { position: 4, accessibility: 58, peak: "promoter" },
      { position: 5, accessibility: 30, peak: "enhancer" },
      { position: 6, accessibility: 44, peak: "enhancer" }
    ],
    source
  };
  const concordanceTable = {
    id: createId("table"),
    name: "Illustrative RNA ATAC concordance",
    columns: ["feature", "modality", "score"],
    rows: [
      { feature: "IL7R", modality: "RNA", score: 0.88 },
      { feature: "IL7R", modality: "ATAC", score: 0.81 },
      { feature: "MKI67", modality: "RNA", score: 0.72 },
      { feature: "MKI67", modality: "ATAC", score: 0.68 },
      { feature: "GZMB", modality: "RNA", score: 0.84 },
      { feature: "GZMB", modality: "ATAC", score: 0.79 },
      { feature: "LYZ", modality: "RNA", score: 0.78 },
      { feature: "LYZ", modality: "ATAC", score: 0.83 }
    ],
    source
  };
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 548), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Single-cell multiome RNA + ATAC summary", createTransform(x, y - 32, 610, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }, "start"),
    figureText("Shared cell identity connects RNA expression, ATAC peak evidence, concordance, and export review.", createTransform(x + 622, y - 34, width - 622, 44), {
      fontSize: 11.4,
      fontWeight: 650,
      color: theme.muted
    }, "end"),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 166, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("shared barcode", createTransform(x + 18, y + 17, 136, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 186, y + 12, 156, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("RNA + ATAC", createTransform(x + 200, y + 17, 128, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    }),
    figureShape("round-rect", "", createTransform(x + 358, y + 12, 176, 28), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("coordinate review", createTransform(x + 372, y + 17, 146, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.warningText
    })
  ];

  const topY = y + 64;
  const topH = 156;
  nodes.push(
    figureShape("round-rect", "", createTransform(x, topY, width, topH), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    figureText("A", createTransform(x + 14, topY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: theme.accent
    }),
    figureText("Joint capture to paired modalities", createTransform(x + 52, topY + 15, 250, 18), {
      fontSize: 12.4,
      fontWeight: 880,
      color: theme.text
    }, "start"),
    symbol("scrna-droplet", "Cell", x + 44, topY + 54, 78, 72, "input-sample", "joint-cell-capture", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cell-barcode", "Barcode", x + 150, topY + 56, 76, 68, "sample-identity", "shared-barcode", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("read-pair", "Reads", x + 256, topY + 56, 82, 68, "data-evidence", "paired-reads", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    createConnectorNode([
      { x: x + 122, y: topY + 90 },
      { x: x + 150, y: topY + 90 }
    ], "", { stroke: theme.connector, strokeWidth: 2 }),
    createConnectorNode([
      { x: x + 226, y: topY + 90 },
      { x: x + 256, y: topY + 90 }
    ], "", { stroke: theme.connector, strokeWidth: 2 }),
    createConnectorNode([
      { x: x + 338, y: topY + 88 },
      { x: x + 432, y: topY + 62 }
    ], "", { stroke: theme.accent2, strokeWidth: 2, lineStyle: "dashed" }),
    createConnectorNode([
      { x: x + 338, y: topY + 96 },
      { x: x + 432, y: topY + 112 }
    ], "", { stroke: theme.accent, strokeWidth: 2, lineStyle: "dashed" }),
    figureShape("round-rect", "", createTransform(x + 410, topY + 38, 232, 42), {
      fill: theme.chipAltFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("RNA expression branch", createTransform(x + 426, topY + 51, 200, 14), {
      fontSize: 9.4,
      fontWeight: 880,
      color: theme.accent2
    }, "start"),
    symbol("expression-matrix", "RNA matrix", x + 662, topY + 28, 90, 78, "data-evidence", "rna-expression-matrix", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureShape("round-rect", "", createTransform(x + 410, topY + 94, 232, 42), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("ATAC accessibility branch", createTransform(x + 426, topY + 107, 200, 14), {
      fontSize: 9.4,
      fontWeight: 880,
      color: theme.accent
    }, "start"),
    symbol("chromatin", "Chromatin", x + 662, topY + 96, 82, 66, "chromatin-evidence", "atac-chromatin", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("peak-call", "Peak", x + 766, topY + 96, 82, 66, "chromatin-evidence", "atac-peak-call", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("genome-browser-track", "Track", x + 870, topY + 64, 114, 80, "chromatin-evidence", "genome-track", { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    figureText("Shared barcode, paired evidence.", createTransform(x + 766, topY + 36, 260, 18), {
      fontSize: 9.4,
      fontWeight: 730,
      color: theme.muted
    }, "start")
  );

  const bottomY = topY + topH + 20;
  const bottomH = 234;
  const gap = 18;
  const colW = Math.round((width - gap * 2) / 3);
  const panelA = x;
  const panelB = x + colW + gap;
  const panelC = x + (colW + gap) * 2;
  const addPanelHeader = (tag: string, title: string, px: number, tone: string) => {
    nodes.push(figureShape("round-rect", "", createTransform(px, bottomY, colW, bottomH), {
      fill: tag === "D" ? theme.warningFill : tag === "C" ? theme.panelAltFill : theme.panelFill,
      stroke: tag === "D" ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: tag === "D" ? theme.floatingDepth : theme.panelDepth
    }));
    nodes.push(figureText(tag, createTransform(px + 14, bottomY + 14, 28, 18), {
      fontSize: 12,
      fontWeight: 930,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, bottomY + 15, colW - 70, 18), {
      fontSize: 12.1,
      fontWeight: 880,
      color: tone
    }, "start"));
  };
  addPanelHeader("B", "RNA expression evidence", panelA, theme.accent2);
  addPanelHeader("C", "ATAC accessibility evidence", panelB, theme.accent);
  addPanelHeader("D", "Concordance and review", panelC, theme.warningText);
  nodes.push(
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "RNA expression",
      table: rnaTable,
      encodings: { x: "gene", y: "expression", color: "program" },
      style: theme.plotStyle
    }, createTransform(panelA + 24, bottomY + 50, colW - 150, 132)),
    symbol("expression-matrix", "Matrix", panelA + colW - 112, bottomY + 64, 82, 72, "data-evidence", "rna-matrix-panel", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Expression values stay table-backed.", createTransform(panelA + 24, bottomY + 196, colW - 48, 18), {
      fontSize: 9.1,
      fontWeight: 720,
      color: theme.muted
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Peak signal",
      table: atacTable,
      encodings: { x: "position", y: "accessibility", color: "peak" },
      style: theme.plotStyle
    }, createTransform(panelB + 24, bottomY + 50, colW - 154, 132)),
    symbol("peak-call", "Peak", panelB + colW - 116, bottomY + 54, 82, 68, "chromatin-evidence", "peak-panel", { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("nucleosome", "Nucleosome", panelB + colW - 106, bottomY + 126, 66, 58, "chromatin-evidence", "nucleosome-panel", { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Peak calls require genome coordinate provenance.", createTransform(panelB + 24, bottomY + 196, colW - 48, 18), {
      fontSize: 9.1,
      fontWeight: 720,
      color: theme.muted
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "RNA/ATAC concordance",
      table: concordanceTable,
      encodings: { x: "modality", y: "feature", value: "score" },
      style: theme.plotStyle
    }, createTransform(panelC + 24, bottomY + 50, colW - 172, 118)),
    figureShape("round-rect", "", createTransform(panelC + colW - 124, bottomY + 54, 104, 86), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("Review", createTransform(panelC + colW - 106, bottomY + 68, 70, 14), {
      fontSize: 9.2,
      fontWeight: 900,
      color: theme.warningText
    }, "start"),
    figureText("coords\nlabels\nclaim", createTransform(panelC + colW - 106, bottomY + 92, 76, 36), {
      fontSize: 7.8,
      fontWeight: 720,
      color: theme.reviewText
    }, "start"),
    figureShape("round-rect", "", createTransform(panelC + 24, bottomY + 184, 76, 22), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("SVG exact", createTransform(panelC + 34, bottomY + 189, 56, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(panelC + 110, bottomY + 184, 100, 22), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("PPTX review", createTransform(panelC + 124, bottomY + 189, 72, 12), {
      fontSize: 8.1,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createDrugDiscoveryFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic drug-discovery flagship demo data generated by Scientific Image", "Scientific Image drug-discovery workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "drug-discovery",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Drug discovery target-to-candidate funnel", createTransform(x, y - 32, 600, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable assets connect target biology, screen evidence, safety review, and nomination readiness.", createTransform(x + 572, y - 34, width - 572, 44), {
      fontSize: 11.5,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 190, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: drug-discovery", createTransform(x + 18, y + 17, 160, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 208, y + 12, 228, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("insert-ready MCP recipe", createTransform(x + 224, y + 17, 196, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const boardY = y + 64;
  const boardH = 168;
  const evidenceW = Math.round(width * 0.62);
  const gateGap = 24;
  const gateX = x + evidenceW + gateGap;
  const gateW = width - evidenceW - gateGap;
  nodes.push(figureShape("round-rect", "", createTransform(x, boardY, evidenceW, boardH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Target-to-hit evidence board", createTransform(x + 22, boardY + 16, 270, 18), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureText("editable evidence layers", createTransform(x + 506, boardY + 18, 132, 16), {
    fontSize: 9.1,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 24, boardY + 48, evidenceW - 48, 82), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(
    symbol("target-validation", "Target", x + 42, boardY + 60, 76, 76, `${template.id}:evidence-target-validation`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("target-engagement", "Engagement", x + 126, boardY + 60, 76, 76, `${template.id}:evidence-target-engagement`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("compound-library", "Library", x + 210, boardY + 60, 78, 76, `${template.id}:evidence-compound-library`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("hit-triage", "Hit triage", x + 300, boardY + 60, 76, 76, `${template.id}:evidence-hit-triage`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("dose-response-curve", "Dose", x + 386, boardY + 60, 76, 76, `${template.id}:evidence-dose-response`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("medicinal-chemistry-cycle", "Med chem", x + 474, boardY + 60, 78, 76, `${template.id}:evidence-med-chem-cycle`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false })
  );
  for (const cx of [118, 202, 290, 376, 464]) {
    nodes.push(createConnectorNode([
      { x: x + cx, y: boardY + 98 },
      { x: x + cx + 12, y: boardY + 98 }
    ], "", { stroke: theme.connector, strokeWidth: 1.7 }));
  }
  nodes.push(figureText("Evidence board links target confidence, compound screen, potency, and chemistry iteration.", createTransform(x + 24, boardY + 142, evidenceW - 48, 16), {
    fontSize: 9.2,
    fontWeight: 720,
    color: theme.muted
  }));

  nodes.push(figureShape("round-rect", "", createTransform(gateX, boardY, gateW, boardH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("DMPK, safety, and nomination gate", createTransform(gateX + 20, boardY + 16, gateW - 40, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(figureText("Selectivity, ADMET, toxicity, efficacy, and IND package stay visible before export.", createTransform(gateX + 20, boardY + 40, gateW - 40, 28), {
    fontSize: 8.8,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(
    symbol("selectivity-panel", "Selectivity", gateX + 24, boardY + 74, 64, 68, `${template.id}:gate-selectivity`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("admet-panel", "ADMET", gateX + 98, boardY + 72, 64, 70, `${template.id}:gate-admet`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("toxicity-screen", "Toxicity", gateX + 172, boardY + 72, 64, 70, `${template.id}:gate-toxicity`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("efficacy-model", "Efficacy", gateX + 246, boardY + 72, 64, 70, `${template.id}:gate-efficacy`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("candidate-nomination", "Nominate", gateX + 318, boardY + 72, 64, 70, `${template.id}:gate-candidate-nomination`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(gateX + 70, boardY + 138, gateW - 140, 24), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("nomination-readiness-review", createTransform(gateX + 92, boardY + 144, gateW - 184, 12), {
    fontSize: 8.6,
    fontWeight: 880,
    color: theme.warningText
  }));

  const ribbonY = boardY + boardH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, ribbonY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Candidate evidence path", createTransform(x + 24, ribbonY + 7, 146, 14), {
    fontSize: 9.4,
    fontWeight: 900,
    color: theme.accent
  }));
  ["target", "screen", "triage", "optimize", "safety", "nominate"].forEach((label, index) => {
    const chipX = x + 188 + index * 96;
    const warning = index >= 4;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, ribbonY + 5, 78, 18), {
      fill: warning ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: warning ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 12, ribbonY + 9, 54, 10), {
      fontSize: 7.5,
      fontWeight: 850,
      color: warning ? theme.warningText : theme.accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 17, y: ribbonY + 14 },
        { x: chipX - 3, y: ribbonY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });
  nodes.push(figureText("source-linked candidate package for reviewable claims", createTransform(x + width - 304, ribbonY + 8, 272, 12), {
    fontSize: 8.3,
    fontWeight: 720,
    color: theme.muted
  }));

  const lowerY = y + 284;
  const gap = 22;
  const leftW = 354;
  const midW = 314;
  const rightW = width - leftW - midW - gap * 2;
  const doseTable = {
    id: createId("table"),
    name: "Illustrative drug response",
    columns: ["dose", "response", "series"],
    rows: [
      { dose: 0.01, response: 96, series: "lead" },
      { dose: 0.03, response: 88, series: "lead" },
      { dose: 0.1, response: 70, series: "lead" },
      { dose: 0.3, response: 44, series: "lead" },
      { dose: 1, response: 19, series: "lead" },
      { dose: 3, response: 9, series: "lead" }
    ],
    source
  };
  const selectivityTable = {
    id: createId("table"),
    name: "Illustrative selectivity score",
    columns: ["target", "score", "risk"],
    rows: [
      { target: "Primary", score: 92, risk: "on-target" },
      { target: "K-A", score: 28, risk: "off-target" },
      { target: "K-B", score: 16, risk: "off-target" },
      { target: "CYP", score: 21, risk: "liability" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, ph: number, fill = theme.panelFill, stroke = theme.panelStroke, tone = theme.text) => {
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 136, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 90, py + 14, 76, 22), {
      fill: status === "QA gate" ? theme.warningFill : theme.chipFill,
      stroke: status === "QA gate" ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 80, py + 19, 58, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: status === "QA gate" ? theme.warningText : tone
    }));
  };
  addPanel("A", "Hit evidence package", "source-linked", x, lowerY, leftW, 196, theme.panelFill, theme.panelStroke, theme.accent);
  addPanel("B", "Lead optimization profile", "editable SAR", x + leftW + gap, lowerY, midW, 196, theme.panelAltFill, theme.panelStroke, theme.accent2);
  addPanel("C", "Safety and nomination gate", "QA gate", x + leftW + midW + gap * 2, lowerY, rightW, 196, theme.warningFill, theme.warningStroke, theme.warningText);
  nodes.push(
    symbol("target-engagement", "Engagement", x + 24, lowerY + 54, 112, 88, `${template.id}:target-engagement`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("dose-response-curve", "Dose response", x + 144, lowerY + 54, 112, 88, `${template.id}:dose-response`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Dose response",
      table: doseTable,
      encodings: { x: "dose", y: "response", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + 238, lowerY + 58, 100, 82)),
    figureText("Engagement", createTransform(x + 44, lowerY + 136, 72, 14), {
      fontSize: 9.4,
      fontWeight: 850,
      color: theme.text
    }),
    figureText("Dose curve", createTransform(x + 162, lowerY + 136, 76, 14), {
      fontSize: 9.4,
      fontWeight: 850,
      color: theme.text
    }),
    figureText("Potency claim remains tied to source table.", createTransform(x + 24, lowerY + 152, leftW - 48, 24), {
      fontSize: 10,
      fontWeight: 720,
      color: theme.muted
    }),
    symbol("lead-series", "Lead series", x + leftW + gap + 22, lowerY + 54, 100, 88, `${template.id}:lead-series`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("sar-table", "SAR table", x + leftW + gap + 128, lowerY + 54, 100, 88, `${template.id}:sar-table`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("pk-profile", "PK profile", x + leftW + gap + 226, lowerY + 54, 72, 88, `${template.id}:pk-profile`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Lead series", createTransform(x + leftW + gap + 38, lowerY + 136, 74, 14), {
      fontSize: 9.4,
      fontWeight: 850,
      color: theme.text
    }),
    figureText("SAR table", createTransform(x + leftW + gap + 146, lowerY + 136, 70, 14), {
      fontSize: 9.4,
      fontWeight: 850,
      color: theme.text
    }),
    figureText("PK profile", createTransform(x + leftW + gap + 228, lowerY + 136, 70, 14), {
      fontSize: 9.4,
      fontWeight: 850,
      color: theme.text
    }),
    figureText("SAR, PK, and med-chem cycle stay editable as separate nodes.", createTransform(x + leftW + gap + 24, lowerY + 152, midW - 48, 24), {
      fontSize: 10,
      fontWeight: 720,
      color: theme.muted
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Selectivity",
      table: selectivityTable,
      encodings: { x: "target", y: "score", color: "risk" },
      style: theme.plotStyle
    }, createTransform(x + leftW + midW + gap * 2 + 22, lowerY + 54, 142, 96)),
    symbol("toxicity-screen", "Toxicity", x + leftW + midW + gap * 2 + 174, lowerY + 48, 76, 78, `${template.id}:toxicity`, { ...theme.riskSymbolAppearance, labelVisible: false }, theme.riskSymbolProfile),
    symbol("ind-enabling-package", "IND package", x + leftW + midW + gap * 2 + 254, lowerY + 48, 76, 78, `${template.id}:ind-package`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }),
    figureText("Toxicity", createTransform(x + leftW + midW + gap * 2 + 187, lowerY + 126, 52, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    }),
    figureText("IND package", createTransform(x + leftW + midW + gap * 2 + 251, lowerY + 126, 82, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    }),
    figureShape("round-rect", "", createTransform(x + leftW + midW + gap * 2 + 176, lowerY + 140, 156, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("review before export", createTransform(x + leftW + midW + gap * 2 + 192, lowerY + 146, 124, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createProteinEngineeringFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic protein-engineering flagship demo data generated by Scientific Image", "Scientific Image protein-engineering workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "protein-engineering",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Protein engineering design-to-developability platform", createTransform(x, y - 32, 690, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Variant library design, structure rationale, assay evidence, purification, and developability review as editable evidence layers.", createTransform(x + 650, y - 34, width - 650, 44), {
      fontSize: 11.1,
      fontWeight: 700,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 214, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: protein-engineering", createTransform(x + 18, y + 17, 182, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 232, y + 12, 344, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable brief: design / screen / developability", createTransform(x + 248, y + 17, 306, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const panelTop = y + 58;
  const panelGap = 18;
  const leftW = 370;
  const centerW = 336;
  const rightW = width - leftW - centerW - panelGap * 2;
  const panelH = 210;
  const bottomY = y + 294;
  const bottomH = 184;
  const affinityTable = {
    id: createId("table"),
    name: "Illustrative affinity maturation",
    columns: ["round", "affinity", "series"],
    rows: [
      { round: 0, affinity: 18, series: "binder" },
      { round: 1, affinity: 34, series: "binder" },
      { round: 2, affinity: 57, series: "binder" },
      { round: 3, affinity: 72, series: "binder" },
      { round: 4, affinity: 88, series: "binder" }
    ],
    source
  };
  const developabilityTable = {
    id: createId("table"),
    name: "Illustrative developability profile",
    columns: ["axis", "score", "risk"],
    rows: [
      { axis: "Tm", score: 82, risk: "stability" },
      { axis: "Yld", score: 68, risk: "expression" },
      { axis: "Agg", score: 24, risk: "liability" },
      { axis: "Pur", score: 91, risk: "process" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, ph: number, fill = theme.panelFill, tone = theme.text) => {
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke: status === "review" ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: status === "review" ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: status === "review" ? theme.warningFill : theme.chipFill,
      stroke: status === "review" ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: status === "review" ? theme.warningText : tone
    }));
  };
  addPanel("A", "Library design and selection logic", "design", x, panelTop, leftW, panelH, theme.panelFill, theme.accent);
  addPanel("B", "Screening evidence", "source", x + leftW + panelGap, panelTop, centerW, panelH, theme.panelAltFill, theme.accent2);
  addPanel("C", "Developability gate", "review", x + leftW + centerW + panelGap * 2, panelTop, rightW, panelH, theme.warningFill, theme.warningText);
  addPanel("D", "Structure and sequence rationale", "rationale", x, bottomY, Math.round(width * 0.62), bottomH, theme.panelFill, theme.accent);
  addPanel("E", "Lead selection handoff", "review", x + Math.round(width * 0.62) + panelGap, bottomY, width - Math.round(width * 0.62) - panelGap, bottomH, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("protein-design-model", "Design model", x + 24, panelTop + 56, 76, 82, `${template.id}:design-model`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("protein-variant-library", "Variant library", x + 108, panelTop + 56, 76, 82, `${template.id}:variant-library`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("sequence-logo", "Sequence logo", x + 192, panelTop + 56, 76, 82, `${template.id}:sequence-logo`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("directed-evolution", "Evolution", x + 276, panelTop + 56, 72, 82, `${template.id}:directed-evolution`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Mutation space, sequence constraints, and selection pressure stay independently editable.", createTransform(x + 24, panelTop + 154, leftW - 48, 30), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Affinity gain",
      table: affinityTable,
      encodings: { x: "round", y: "affinity", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + leftW + panelGap + 24, panelTop + 58, 118, 82)),
    symbol("binding-affinity-assay", "Affinity assay", x + leftW + panelGap + 158, panelTop + 56, 78, 82, `${template.id}:affinity-assay`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("enzyme-kinetics", "Kinetics", x + leftW + panelGap + 242, panelTop + 56, 72, 82, `${template.id}:enzyme-kinetics`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("KD, kinetics, and enrichment evidence remain tied to source tables.", createTransform(x + leftW + panelGap + 24, panelTop + 154, centerW - 48, 30), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Developability",
      table: developabilityTable,
      encodings: { x: "axis", y: "score", color: "risk" },
      style: theme.plotStyle
    }, createTransform(x + leftW + centerW + panelGap * 2 + 24, panelTop + 58, 130, 82)),
    symbol("purification-column", "Purification", x + leftW + centerW + panelGap * 2 + 170, panelTop + 56, 72, 82, `${template.id}:purification`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }),
    symbol("developability-profile", "Developability", x + leftW + centerW + panelGap * 2 + 248, panelTop + 56, 72, 82, `${template.id}:developability`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }),
    figureText("Expression, aggregation, purification, and liability scores are flagged for review.", createTransform(x + leftW + centerW + panelGap * 2 + 24, panelTop + 154, rightW - 48, 30), { fontSize: 9.5, fontWeight: 720, color: theme.muted }),
    symbol("protein-domain", "Domain", x + 28, bottomY + 54, 88, 82, `${template.id}:protein-domain`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("binding-pocket", "Pocket", x + 124, bottomY + 54, 88, 82, `${template.id}:binding-pocket`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("structure-prediction", "Structure", x + 220, bottomY + 54, 88, 82, `${template.id}:structure-prediction`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("affinity-maturation", "Maturation", x + 316, bottomY + 54, 88, 82, `${template.id}:affinity-maturation`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("antibody-fragment", "Fragment", x + 424, bottomY + 54, 88, 82, `${template.id}:antibody-fragment`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    figureText("Structure pocket, domain architecture, and maturation rationale stay separate from measured assay claims.", createTransform(x + 28, bottomY + 142, Math.round(width * 0.62) - 56, 26), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    symbol("stability-assay", "Stability", x + Math.round(width * 0.62) + panelGap + 28, bottomY + 54, 82, 78, `${template.id}:stability`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("expression-host", "Yield", x + Math.round(width * 0.62) + panelGap + 118, bottomY + 54, 82, 78, `${template.id}:expression-yield`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("protein-complex", "Liability", x + Math.round(width * 0.62) + panelGap + 208, bottomY + 54, 82, 78, `${template.id}:liability-map`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureShape("round-rect", "", createTransform(x + Math.round(width * 0.62) + panelGap + 78, bottomY + 140, 208, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("review-before-export", createTransform(x + Math.round(width * 0.62) + panelGap + 112, bottomY + 146, 136, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSyntheticBiologyFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic synthetic-biology flagship demo data generated by Scientific Image", "Scientific Image synthetic-biology workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "synthetic-biology",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Synthetic biology design-build-test-learn platform", createTransform(x, y - 32, 696, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable pack connects circuit design, DNA assembly, chassis testing, biosensor readout, and containment review.", createTransform(x + 650, y - 34, width - 650, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 210, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: synthetic-biology", createTransform(x + 18, y + 17, 178, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 228, y + 12, 262, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable DBTL circuit map", createTransform(x + 244, y + 17, 226, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const canvasY = y + 64;
  const canvasH = 168;
  const circuitW = Math.round(width * 0.58);
  const reviewW = width - circuitW - 24;
  nodes.push(figureShape("round-rect", "", createTransform(x, canvasY, circuitW, canvasH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Genetic circuit design canvas", createTransform(x + 22, canvasY + 16, 284, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 24, canvasY + 48, circuitW - 48, 82), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(
    symbol("genetic-circuit", "Circuit", x + 38, canvasY + 62, 78, 74, `${template.id}:circuit-map`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("promoter-library", "Promoters", x + 126, canvasY + 62, 70, 74, `${template.id}:promoter-bank`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("ribosome-binding-site", "RBS", x + 204, canvasY + 62, 66, 74, `${template.id}:rbs-part`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("synthetic-operon", "Operon", x + 278, canvasY + 62, 82, 74, `${template.id}:operon-cassette`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("logic-gate-genetic", "Logic gate", x + 370, canvasY + 62, 70, 74, `${template.id}:logic-gate`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("plasmid-vector", "Vector", x + 448, canvasY + 62, 72, 74, `${template.id}:plasmid-vector`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("terminator", "Terminator", x + 528, canvasY + 62, 62, 74, `${template.id}:terminator`, { accent: "#64748b", stroke: "#64748b", labelVisible: false })
  );
  for (const cx of [118, 198, 272, 362, 442, 522]) {
    nodes.push(createConnectorNode([
      { x: x + cx, y: canvasY + 100 },
      { x: x + cx + 14, y: canvasY + 100 }
    ], "", { stroke: theme.connector, strokeWidth: 1.8 }));
  }
  nodes.push(figureText("Part order, logic, vector, and terminator remain separately editable.", createTransform(x + 24, canvasY + 140, circuitW - 48, 16), {
    fontSize: 9.4,
    fontWeight: 720,
    color: theme.muted
  }));

  const reviewX = x + circuitW + 24;
  nodes.push(figureShape("round-rect", "", createTransform(reviewX, canvasY, reviewW, canvasH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("Chassis test + containment review", createTransform(reviewX + 20, canvasY + 16, reviewW - 40, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(
    symbol("dna-assembly", "Assembly", reviewX + 22, canvasY + 52, 68, 72, `${template.id}:dna-assembly`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("golden-gate-assembly", "Golden Gate", reviewX + 94, canvasY + 52, 68, 72, `${template.id}:golden-gate-build`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("chassis-cell", "Chassis", reviewX + 166, canvasY + 52, 68, 72, `${template.id}:chassis-test`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("biosensor-circuit", "Biosensor", reviewX + 238, canvasY + 52, 68, 72, `${template.id}:biosensor-readout`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("kill-switch", "Containment", reviewX + 310, canvasY + 52, 68, 72, `${template.id}:containment-gate`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(reviewX + 78, canvasY + 136, reviewW - 156, 24), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("containment-review", createTransform(reviewX + 112, canvasY + 142, reviewW - 224, 12), {
    fontSize: 8.8,
    fontWeight: 880,
    color: theme.warningText
  }));

  const traceY = canvasY + canvasH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, traceY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("DBTL trace", createTransform(x + 24, traceY + 7, 86, 14), {
    fontSize: 9.4,
    fontWeight: 820,
    color: theme.muted
  }));
  const traceSteps = [
    ["design", theme.accent],
    ["assemble", theme.accent],
    ["transform", "#0d9488"],
    ["measure", theme.accent2],
    ["learn", "#7c3aed"],
    ["contain", theme.warningText]
  ] as const;
  traceSteps.forEach(([label, accent], index) => {
    const chipX = x + 132 + index * 96;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, traceY + 5, 80, 18), {
      fill: index === traceSteps.length - 1 ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: index === traceSteps.length - 1 ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 12, traceY + 9, 56, 10), {
      fontSize: 7.6,
      fontWeight: 850,
      color: accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 17, y: traceY + 14 },
        { x: chipX - 3, y: traceY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const responseTable = {
    id: createId("table"),
    name: "Illustrative biosensor response",
    columns: ["dose", "response", "series"],
    rows: [
      { dose: 0, response: 8, series: "reporter" },
      { dose: 1, response: 22, series: "reporter" },
      { dose: 2, response: 47, series: "reporter" },
      { dose: 3, response: 71, series: "reporter" },
      { dose: 4, response: 84, series: "reporter" }
    ],
    source
  };
  const fluxTable = {
    id: createId("table"),
    name: "Illustrative pathway output",
    columns: ["metric", "value", "class"],
    rows: [
      { metric: "Tit", value: 76, class: "output" },
      { metric: "Yld", value: 62, class: "output" },
      { metric: "Flx", value: 88, class: "output" },
      { metric: "Risk", value: 21, class: "review" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 196), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Circuit parts", "design", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Build and test", "source", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "Flux and containment", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("promoter-library", "Promoters", x + 22, lowerY + 52, 78, 80, `${template.id}:promoters`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("ribosome-binding-site", "RBS", x + 102, lowerY + 52, 70, 80, `${template.id}:rbs`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("synthetic-operon", "Operon", x + 176, lowerY + 52, 86, 80, `${template.id}:operon`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("logic-gate-genetic", "Logic", x + 268, lowerY + 52, 64, 80, `${template.id}:logic`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    figureText("Part order and logic remain editable.", createTransform(x + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("golden-gate-assembly", "Golden Gate", x + panelW + gap + 22, lowerY + 50, 84, 82, `${template.id}:golden-gate`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("plasmid-vector", "Vector", x + panelW + gap + 108, lowerY + 50, 78, 82, `${template.id}:vector`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Sensor response",
      table: responseTable,
      encodings: { x: "dose", y: "response", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + panelW + gap + 198, lowerY + 54, 130, 90)),
    figureText("Reporter response is tied to source table.", createTransform(x + panelW + gap + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Pathway output",
      table: fluxTable,
      encodings: { x: "metric", y: "value", color: "class" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 20, lowerY + 54, 134, 92)),
    symbol("metabolic-pathway-engineering", "Pathway", x + (panelW + gap) * 2 + 166, lowerY + 50, 78, 80, `${template.id}:metabolic-pathway`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }),
    symbol("kill-switch", "Kill switch", x + (panelW + gap) * 2 + 252, lowerY + 50, 78, 80, `${template.id}:kill-switch`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 166, lowerY + 140, 160, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("containment-review", createTransform(x + (panelW + gap) * 2 + 184, lowerY + 146, 124, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createMicrobiomeInfectiousDiseaseFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic microbiome infectious disease flagship demo data generated by Scientific Image", "Scientific Image microbiome-infectious-disease workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "microbiome-infectious-disease",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Microbiome and infectious disease evidence workflow", createTransform(x, y - 32, 668, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable pack connects community ecology, host barrier context, pathogen interaction, metagenomic evidence, and AMR/outbreak review.", createTransform(x + 650, y - 34, width - 650, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 278, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: microbiome-infectious-disease", createTransform(x + 18, y + 17, 246, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 296, y + 12, 294, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable host-microbe evidence map", createTransform(x + 312, y + 17, 258, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const mapY = y + 64;
  const mapH = 164;
  const interfaceW = Math.round(width * 0.62);
  const reviewGap = 24;
  const reviewX = x + interfaceW + reviewGap;
  const reviewW = width - interfaceW - reviewGap;
  nodes.push(figureShape("round-rect", "", createTransform(x, mapY, interfaceW, mapH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Host-microbe interface map", createTransform(x + 22, mapY + 16, 260, 18), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureText("editable interface layers", createTransform(x + 500, mapY + 18, 136, 16), {
    fontSize: 9.1,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 24, mapY + 48, interfaceW - 48, 80), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(
    symbol("microbiome-community", "Community", x + 42, mapY + 58, 82, 76, `${template.id}:interface-community`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("gut-microbiome", "Gut", x + 128, mapY + 58, 76, 76, `${template.id}:interface-gut`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("mucosal-barrier", "Barrier", x + 210, mapY + 58, 82, 76, `${template.id}:interface-barrier`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("pathogen-host-interaction", "Interaction", x + 300, mapY + 58, 86, 76, `${template.id}:interface-pathogen-contact`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("metagenomic-read", "Reads", x + 394, mapY + 58, 76, 76, `${template.id}:interface-metagenomic-read`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("microbiome-profile", "Profile", x + 476, mapY + 58, 76, 76, `${template.id}:interface-profile`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false })
  );
  for (const cx of [124, 204, 294, 386, 470]) {
    nodes.push(createConnectorNode([
      { x: x + cx, y: mapY + 96 },
      { x: x + cx + 12, y: mapY + 96 }
    ], "", { stroke: theme.connector, strokeWidth: 1.7 }));
  }
  nodes.push(figureText("Map separates ecological context from infection evidence and source-linked reads.", createTransform(x + 24, mapY + 140, interfaceW - 48, 16), {
    fontSize: 9.2,
    fontWeight: 720,
    color: theme.muted
  }));

  nodes.push(figureShape("round-rect", "", createTransform(reviewX, mapY, reviewW, mapH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("AMR and outbreak review", createTransform(reviewX + 20, mapY + 16, reviewW - 40, 18), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(figureText("Resistance signals, outbreak clustering, and containment notes stay visible before export.", createTransform(reviewX + 20, mapY + 40, reviewW - 40, 28), {
    fontSize: 8.8,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(
    symbol("antimicrobial-resistance", "AMR", reviewX + 24, mapY + 74, 66, 66, `${template.id}:review-amr`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("amr-gene", "AMR gene", reviewX + 104, mapY + 72, 64, 68, `${template.id}:review-amr-gene`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("outbreak-cluster", "Outbreak", reviewX + 184, mapY + 72, 66, 68, `${template.id}:review-outbreak`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("antibiotic-treatment", "Antibiotic", reviewX + 268, mapY + 72, 58, 68, `${template.id}:review-antibiotic`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(reviewX + 58, mapY + 134, reviewW - 116, 24), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("source-and-containment-review", createTransform(reviewX + 78, mapY + 140, reviewW - 156, 12), {
    fontSize: 8.7,
    fontWeight: 880,
    color: theme.warningText
  }));

  const ribbonY = mapY + mapH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, ribbonY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Evidence path", createTransform(x + 24, ribbonY + 7, 96, 14), {
    fontSize: 9.4,
    fontWeight: 900,
    color: theme.accent
  }));
  ["community", "barrier", "pathogen", "reads", "AMR", "outbreak"].forEach((label, index) => {
    const chipX = x + 144 + index * 98;
    const warning = index >= 4;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, ribbonY + 5, 82, 18), {
      fill: warning ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: warning ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 10, ribbonY + 9, 62, 10), {
      fontSize: 7.4,
      fontWeight: 850,
      color: warning ? theme.warningText : theme.accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 17, y: ribbonY + 14 },
        { x: chipX - 3, y: ribbonY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });
  nodes.push(figureText("source-linked surveillance schematic for reviewable claims", createTransform(x + width - 316, ribbonY + 8, 284, 12), {
    fontSize: 8.3,
    fontWeight: 720,
    color: theme.muted
  }));

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const communityTable = {
    id: createId("table"),
    name: "Illustrative community diversity",
    columns: ["sample", "value", "class"],
    rows: [
      { sample: "S1", value: 82, class: "baseline" },
      { sample: "S2", value: 74, class: "baseline" },
      { sample: "D1", value: 39, class: "dysbiosis" },
      { sample: "D2", value: 46, class: "dysbiosis" }
    ],
    source
  };
  const infectionTable = {
    id: createId("table"),
    name: "Illustrative infection load",
    columns: ["day", "load", "series"],
    rows: [
      { day: 0, load: 7, series: "load" },
      { day: 1, load: 28, series: "load" },
      { day: 2, load: 66, series: "load" },
      { day: 3, load: 51, series: "load" },
      { day: 4, load: 31, series: "load" }
    ],
    source
  };
  const amrTable = {
    id: createId("table"),
    name: "Illustrative AMR signal",
    columns: ["gene", "score", "class"],
    rows: [
      { gene: "bla", score: 84, class: "AMR" },
      { gene: "tet", score: 58, class: "AMR" },
      { gene: "erm", score: 42, class: "AMR" },
      { gene: "ctx", score: 77, class: "AMR" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 196), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Community profile", "source", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Pathogen evidence", "evidence", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "AMR surveillance", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("gut-microbiome", "Gut", x + 20, lowerY + 52, 76, 78, `${template.id}:gut`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("microbiome-profile", "Profile", x + 102, lowerY + 52, 72, 78, `${template.id}:profile`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Diversity index",
      table: communityTable,
      encodings: { x: "sample", y: "value", color: "class" },
      style: theme.plotStyle
    }, createTransform(x + 196, lowerY + 50, 142, 92)),
    figureText("Composition and diversity stay source-linked.", createTransform(x + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("infection-model", "Infection model", x + panelW + gap + 20, lowerY + 52, 76, 78, `${template.id}:infection-model`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("bacterial-strain", "Strain", x + panelW + gap + 102, lowerY + 54, 68, 74, `${template.id}:strain`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("viral-phage", "Phage", x + panelW + gap + 174, lowerY + 52, 62, 76, `${template.id}:phage`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Infection load",
      table: infectionTable,
      encodings: { x: "day", y: "load", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + panelW + gap + 244, lowerY + 54, 92, 84)),
    figureText("Mechanism cartoon and evidence curve are separate.", createTransform(x + panelW + gap + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "AMR signals",
      table: amrTable,
      encodings: { x: "gene", y: "score", color: "class" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 20, lowerY + 54, 148, 90)),
    symbol("amr-gene", "AMR gene", x + (panelW + gap) * 2 + 188, lowerY + 52, 62, 74, `${template.id}:amr-gene`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("outbreak-cluster", "Outbreak", x + (panelW + gap) * 2 + 256, lowerY + 52, 64, 74, `${template.id}:outbreak`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("antibiotic-treatment", "Antibiotic", x + (panelW + gap) * 2 + 326, lowerY + 52, 54, 74, `${template.id}:antibiotic`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 188, lowerY + 140, 190, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("source-and-containment-review", createTransform(x + (panelW + gap) * 2 + 198, lowerY + 146, 170, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createCellTherapyFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic cell therapy flagship demo data generated by Scientific Image", "Scientific Image cell-therapy workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "cell-therapy",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Cell therapy vein-to-vein manufacturing workflow", createTransform(x, y - 32, 694, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable pack separates patient material, immune engineering, expansion, release QC, infusion, and safety monitoring.", createTransform(x + 668, y - 34, width - 668, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 214, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: cell-therapy", createTransform(x + 18, y + 17, 182, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 232, y + 12, 294, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable vein-to-vein map", createTransform(x + 248, y + 17, 258, 18), {
      fontSize: 10.5,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const mapY = y + 62;
  const mapH = 166;
  const mapW = Math.round(width * 0.64);
  const safetyGap = 22;
  const safetyX = x + mapW + safetyGap;
  const safetyW = width - mapW - safetyGap;
  nodes.push(figureShape("round-rect", "", createTransform(x, mapY, mapW, mapH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.3,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Vein-to-vein manufacturing map", createTransform(x + 22, mapY + 16, 318, 20), {
    fontSize: 12.6,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureText("editable manufacturing path", createTransform(x + 456, mapY + 18, 186, 18), {
    fontSize: 9.5,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(figureShape("line", "", createTransform(x + 46, mapY + 88, mapW - 92, 1), {
    stroke: theme.connector,
    strokeWidth: 3,
    opacity: 0.45
  }));

  const pathY = mapY + 52;
  const slotW = (mapW - 56) / 5;
  const manufacturingSteps: Array<{ assetId: string; label: string; note: string; hint: string; accent: string; width: number; height: number; profile?: AssetStyleProfile }> = [
    { assetId: "leukapheresis", label: "Collect", note: "patient cells", hint: "vein-leukapheresis", accent: theme.accent, width: 74, height: 72 },
    { assetId: "viral-vector-transduction", label: "Engineer", note: "gene transfer", hint: "vector-engineering", accent: theme.accent, width: 82, height: 72 },
    { assetId: "cell-expansion", label: "Expand", note: "culture scale", hint: "expansion", accent: theme.accent2, width: 82, height: 72 },
    { assetId: "release-testing", label: "Release", note: "QC gate", hint: "release-gate", accent: theme.accent2, width: 78, height: 72 },
    { assetId: "patient-infusion", label: "Infuse", note: "return dose", hint: "patient-infusion", accent: theme.warningText, width: 78, height: 72, profile: theme.riskSymbolProfile }
  ];
  manufacturingSteps.forEach((step, index) => {
    const slotX = x + 28 + index * slotW;
    const centerX = slotX + slotW / 2;
    const warningStep = Boolean(step.profile);
    nodes.push(figureShape("round-rect", "", createTransform(centerX - 42, pathY - 10, 84, 82), {
      fill: warningStep ? theme.warningFill : index % 2 ? theme.panelAltFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: warningStep ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(symbol(step.assetId, step.label, centerX - step.width / 2, pathY - 4, step.width, step.height, `${template.id}:${step.hint}`, { accent: step.accent, stroke: step.accent, labelVisible: false }, step.profile ?? styleProfile));
    nodes.push(figureText(step.label, createTransform(slotX + 4, pathY + 82, slotW - 8, 14), {
      fontSize: 9.8,
      fontWeight: 900,
      color: warningStep ? theme.warningText : theme.text
    }));
    nodes.push(figureText(step.note, createTransform(slotX + 4, pathY + 98, slotW - 8, 14), {
      fontSize: 7.9,
      fontWeight: 720,
      color: theme.muted
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: slotX - 16, y: pathY + 30 },
        { x: slotX - 4, y: pathY + 30 }
      ], "", { stroke: theme.connector, strokeWidth: 2.25 }));
    }
  });

  nodes.push(figureShape("round-rect", "", createTransform(safetyX, mapY, safetyW, mapH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.3,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("Safety and follow-up review", createTransform(safetyX + 20, mapY + 16, safetyW - 40, 20), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(figureText("Release evidence, infusion context, CRS signal, and follow-up status stay visible before export.", createTransform(safetyX + 20, mapY + 40, safetyW - 40, 28), {
    fontSize: 8.8,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(
    symbol("infusion-bag", "Product", safetyX + 24, mapY + 74, 62, 62, `${template.id}:safety-product`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("patient-infusion", "Patient", safetyX + 102, mapY + 72, 64, 64, `${template.id}:safety-patient`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("cytokine-release", "CRS", safetyX + 182, mapY + 70, 78, 68, `${template.id}:safety-cytokine`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(safetyX + safetyW - 92, mapY + 82, 72, 28), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("review", createTransform(safetyX + safetyW - 74, mapY + 91, 38, 11), {
    fontSize: 8.4,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(figureShape("round-rect", "", createTransform(safetyX + 24, mapY + 134, safetyW - 48, 22), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("toxicity-and-followup-review", createTransform(safetyX + 44, mapY + 140, safetyW - 88, 12), {
    fontSize: 9,
    fontWeight: 850,
    color: theme.warningText
  }));

  const ribbonY = mapY + mapH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, ribbonY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Vein-to-vein path", createTransform(x + 24, ribbonY + 7, 112, 14), {
    fontSize: 9.5,
    fontWeight: 900,
    color: theme.accent
  }));
  ["collect", "engineer", "expand", "release QC", "infuse", "monitor"].forEach((label, index) => {
    const chipW = label.length > 8 ? 78 : 64;
    const chipX = x + 150 + index * 100;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, ribbonY + 5, chipW, 18), {
      fill: index >= 4 ? theme.warningFill : theme.chipFill,
      stroke: index >= 4 ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 10, ribbonY + 9, chipW - 20, 10), {
      fontSize: 7.3,
      fontWeight: 850,
      color: index >= 4 ? theme.warningText : theme.accent
    }));
  });
  nodes.push(figureText("structured assets + plots stay editable for export QA", createTransform(x + width - 328, ribbonY + 8, 296, 12), {
    fontSize: 8.2,
    fontWeight: 720,
    color: theme.muted
  }));

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const potencyTable = {
    id: createId("table"),
    name: "Illustrative cell therapy potency",
    columns: ["dose", "lysis", "series"],
    rows: [
      { dose: 1, lysis: 18, series: "CAR-T" },
      { dose: 2, lysis: 38, series: "CAR-T" },
      { dose: 3, lysis: 62, series: "CAR-T" },
      { dose: 4, lysis: 79, series: "CAR-T" }
    ],
    source
  };
  const releaseTable = {
    id: createId("table"),
    name: "Illustrative release criteria",
    columns: ["gate", "pct", "class"],
    rows: [
      { gate: "Release", pct: 92, class: "pass" },
      { gate: "Potency", pct: 78, class: "pass" }
    ],
    source
  };
  const monitoringTable = {
    id: createId("table"),
    name: "Illustrative cytokine monitoring",
    columns: ["day", "value", "series"],
    rows: [
      { day: 0, value: 12, series: "IL-6" },
      { day: 1, value: 48, series: "IL-6" },
      { day: 2, value: 76, series: "IL-6" },
      { day: 3, value: 44, series: "IL-6" },
      { day: 4, value: 28, series: "IL-6" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 196), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Mechanism", "editable", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Release QC", "source", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "Clinical monitoring", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("car-t-cell", "CAR-T", x + 20, lowerY + 52, 76, 78, `${template.id}:car-t`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("tumor-antigen", "Antigen", x + 102, lowerY + 52, 72, 78, `${template.id}:antigen`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("antigen-presentation", "Synapse", x + 180, lowerY + 54, 58, 72, `${template.id}:synapse`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Potency",
      table: potencyTable,
      encodings: { x: "dose", y: "lysis", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + 246, lowerY + 52, 92, 88)),
    figureText("Mechanism and potency evidence stay separate.", createTransform(x + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("manufacturing-batch", "Batch", x + panelW + gap + 20, lowerY + 52, 76, 78, `${template.id}:batch`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("potency-assay", "Potency", x + panelW + gap + 104, lowerY + 54, 66, 74, `${template.id}:potency`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Release QC",
      table: releaseTable,
      encodings: { x: "gate", y: "pct", color: "class" },
      style: theme.plotStyle
    }, createTransform(x + panelW + gap + 184, lowerY + 50, 148, 92)),
    figureText("QC criteria remain source-linked and reviewable.", createTransform(x + panelW + gap + 24, lowerY + 154, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Cytokine trend",
      table: monitoringTable,
      encodings: { x: "day", y: "value", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 20, lowerY + 54, 126, 90)),
    symbol("infusion-bag", "Product", x + (panelW + gap) * 2 + 164, lowerY + 52, 62, 74, `${template.id}:infusion-bag`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("patient-infusion", "Patient", x + (panelW + gap) * 2 + 232, lowerY + 52, 64, 74, `${template.id}:patient`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("cytokine-release", "CRS", x + (panelW + gap) * 2 + 302, lowerY + 52, 78, 74, `${template.id}:cytokine`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 164, lowerY + 140, 214, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("toxicity-and-followup-review", createTransform(x + (panelW + gap) * 2 + 182, lowerY + 146, 178, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createMicroscopyImageAnalysisFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic microscopy image-analysis flagship demo data generated by Scientific Image", "Scientific Image microscopy-image-analysis workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "microscopy-image-analysis",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 530), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Microscopy image analysis to phenotype workflow", createTransform(x, y - 32, 690, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Raw image evidence, channel QC, segmentation masks, morphology features, model output, and human review as editable layers.", createTransform(x + 668, y - 34, width - 668, 44), {
      fontSize: 11.1,
      fontWeight: 700,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 238, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: microscopy-image-analysis", createTransform(x + 18, y + 17, 210, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 256, y + 12, 342, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable brief: image / mask / phenotype / QA", createTransform(x + 272, y + 17, 306, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const panelTop = y + 58;
  const panelGap = 18;
  const leftW = 352;
  const centerW = 352;
  const rightW = width - leftW - centerW - panelGap * 2;
  const panelH = 210;
  const bottomY = y + 294;
  const bottomH = 184;
  const focusTable = {
    id: createId("table"),
    name: "Illustrative microscopy focus QC",
    columns: ["tile", "score", "series"],
    rows: [
      { tile: 1, score: 0.64, series: "sharpness" },
      { tile: 2, score: 0.81, series: "sharpness" },
      { tile: 3, score: 0.73, series: "sharpness" },
      { tile: 4, score: 0.88, series: "sharpness" }
    ],
    source
  };
  const maskTable = {
    id: createId("table"),
    name: "Illustrative segmentation QC",
    columns: ["metric", "score", "class"],
    rows: [
      { metric: "IoU", score: 84, class: "mask" },
      { metric: "Edge", score: 76, class: "boundary" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, ph: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Image acquisition and channel QC", "source", x, panelTop, leftW, panelH, theme.panelFill, theme.accent);
  addPanel("B", "Segmentation and mask evidence", "editable", x + leftW + panelGap, panelTop, centerW, panelH, theme.panelAltFill, theme.accent2);
  addPanel("C", "Model output and review", "review", x + leftW + centerW + panelGap * 2, panelTop, rightW, panelH, theme.warningFill, theme.warningText);
  addPanel("D", "Phenotype feature layer", "features", x, bottomY, Math.round(width * 0.62), bottomH, theme.panelFill, theme.accent);
  addPanel("E", "Export QA and annotation handoff", "review", x + Math.round(width * 0.62) + panelGap, bottomY, width - Math.round(width * 0.62) - panelGap, bottomH, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("microscope-field", "Field", x + 22, panelTop + 56, 76, 78, `${template.id}:microscope-field`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("fluorescence-channel", "Channels", x + 104, panelTop + 56, 76, 78, `${template.id}:channels`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("z-stack", "Z-stack", x + 186, panelTop + 56, 72, 78, `${template.id}:zstack`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("illumination-correction", "Flat field", x + 264, panelTop + 58, 64, 76, `${template.id}:illumination`, { accent: "#f59e0b", stroke: "#f59e0b", labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Focus QC",
      table: focusTable,
      encodings: { x: "tile", y: "score", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + 222, panelTop + 142, 106, 48)),
    figureText("Raw image evidence, focus score, and acquisition channels stay separate.", createTransform(x + 24, panelTop + 150, 178, 34), { fontSize: 9.5, fontWeight: 720, color: theme.muted }),
    symbol("tile-stitching", "Tiles", x + leftW + panelGap + 24, panelTop + 56, 72, 76, `${template.id}:tile-stitching`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("nuclei-segmentation", "Nuclei", x + leftW + panelGap + 104, panelTop + 56, 72, 76, `${template.id}:nuclei-segmentation`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("membrane-segmentation", "Membrane", x + leftW + panelGap + 184, panelTop + 56, 72, 76, `${template.id}:membrane`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("instance-mask", "Instances", x + leftW + panelGap + 264, panelTop + 56, 64, 76, `${template.id}:instances`, { accent: "#4f46e5", stroke: "#4f46e5", labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Mask QC",
      table: maskTable,
      encodings: { x: "metric", y: "score", color: "class" },
      style: theme.plotStyle
    }, createTransform(x + leftW + panelGap + 222, panelTop + 142, 106, 48)),
    figureText("Segmentation model outputs and mask quality stay reviewable before interpretation.", createTransform(x + leftW + panelGap + 24, panelTop + 150, 178, 34), { fontSize: 9.4, fontWeight: 720, color: theme.muted }),
    symbol("segmentation-model", "Model", x + leftW + centerW + panelGap * 2 + 24, panelTop + 56, 76, 78, `${template.id}:model`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("classifier-heatmap", "Classifier", x + leftW + centerW + panelGap * 2 + 108, panelTop + 56, 76, 78, `${template.id}:classifier`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("image-qc-dashboard", "QC", x + leftW + centerW + panelGap * 2 + 192, panelTop + 56, 76, 78, `${template.id}:image-qc`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureText("Model calls and image QC require human signoff before phenotype claims.", createTransform(x + leftW + centerW + panelGap * 2 + 24, panelTop + 150, rightW - 48, 34), { fontSize: 9.3, fontWeight: 720, color: theme.muted }),
    symbol("phenotype-feature-vector", "Features", x + 30, bottomY + 54, 82, 78, `${template.id}:feature-vector`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("morphology-embedding", "Embedding", x + 120, bottomY + 54, 82, 78, `${template.id}:embedding`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("cell-tracking", "Tracking", x + 210, bottomY + 54, 82, 78, `${template.id}:tracking`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("classifier-heatmap", "Heatmap", x + 300, bottomY + 54, 82, 78, `${template.id}:feature-heatmap`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("cell-neighborhood", "Context", x + 390, bottomY + 54, 82, 78, `${template.id}:cell-neighborhood`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    figureText("Morphology vectors, embeddings, tracking, and neighborhood context stay editable.", createTransform(x + 30, bottomY + 142, Math.round(width * 0.62) - 60, 26), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    symbol("annotation-brush", "Annotation", x + Math.round(width * 0.62) + panelGap + 30, bottomY + 54, 82, 78, `${template.id}:annotation`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("image-qc-dashboard", "Dashboard", x + Math.round(width * 0.62) + panelGap + 120, bottomY + 54, 82, 78, `${template.id}:review-dashboard`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("error-analysis", "Errors", x + Math.round(width * 0.62) + panelGap + 210, bottomY + 54, 82, 78, `${template.id}:error-analysis`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureShape("round-rect", "", createTransform(x + Math.round(width * 0.62) + panelGap + 78, bottomY + 140, 224, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("model-and-annotation-review", createTransform(x + Math.round(width * 0.62) + panelGap + 104, bottomY + 146, 176, 13), {
      fontSize: 9.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createLabAutomationFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic lab automation flagship demo data generated by Scientific Image", "Scientific Image lab-automation workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "lab-automation",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 538), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Lab automation assay execution platform", createTransform(x, y - 32, 640, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable workcell view separates deck setup, robotic execution, readout, sample identity, LIMS handoff, and QC review.", createTransform(x + 650, y - 34, width - 650, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 210, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: lab-automation", createTransform(x + 18, y + 17, 178, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 228, y + 12, 336, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("deck map -> robot -> readout -> LIMS path", createTransform(x + 244, y + 17, 306, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const workcellY = y + 64;
  const workcellH = 168;
  const deckW = Math.round(width * 0.62);
  const sideW = width - deckW - 24;
  nodes.push(figureShape("round-rect", "", createTransform(x, workcellY, deckW, workcellH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Robotic workcell deck map", createTransform(x + 22, workcellY + 16, 260, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 22, workcellY + 46, deckW - 44, 100), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bfdbfe",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(figureShape("line", "", createTransform(x + 54, workcellY + 60, deckW - 108, 0), {
    stroke: theme.connector,
    strokeWidth: 4,
    opacity: 0.62
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 34, workcellY + 58, deckW - 68, 16), {
    fill: theme.isDark ? "#1e293b" : "#e0f2fe",
    stroke: theme.isDark ? "#475569" : "#7dd3fc",
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(
    symbol("deck-layout", "Deck", x + 42, workcellY + 82, 80, 72, `${template.id}:workcell-deck`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("tip-rack", "Tips", x + 132, workcellY + 82, 72, 72, `${template.id}:workcell-tips`, { accent: "#64748b", stroke: "#64748b", labelVisible: false }),
    symbol("reagent-reservoir", "Reservoir", x + 214, workcellY + 82, 72, 72, `${template.id}:workcell-reservoir`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("plate-384", "384-well plate", x + 296, workcellY + 78, 86, 78, `${template.id}:workcell-plate384`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("waste-chute", "Waste", x + 392, workcellY + 84, 68, 70, `${template.id}:workcell-waste`, { accent: "#475569", stroke: "#475569", labelVisible: false }),
    symbol("automated-liquid-handler", "Head", x + 468, workcellY + 74, 92, 84, `${template.id}:liquid-handler-head`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("robotic-arm", "Robot arm", x + 560, workcellY + 54, 94, 102, `${template.id}:robot-arm`, { accent: "#4f46e5", stroke: "#4f46e5", labelVisible: false })
  );
  nodes.push(figureText("Deck map components remain individually editable.", createTransform(x + 22, workcellY + 154, deckW - 44, 18), {
    fontSize: 9.4,
    fontWeight: 720,
    color: theme.muted
  }));

  const sideX = x + deckW + 24;
  nodes.push(figureShape("round-rect", "", createTransform(sideX, workcellY, sideW, workcellH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("Run orchestration + QC", createTransform(sideX + 20, workcellY + 16, sideW - 40, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(
    symbol("assay-scheduler", "Scheduler", sideX + 18, workcellY + 52, 62, 70, `${template.id}:scheduler`, { accent: "#f59e0b", stroke: "#f59e0b", labelVisible: false }),
    symbol("barcode-scanner", "Barcode", sideX + 86, workcellY + 52, 62, 70, `${template.id}:barcode-scanner`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("plate-reader", "Reader", sideX + 154, workcellY + 52, 62, 70, `${template.id}:plate-reader`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("lims-dashboard", "LIMS", sideX + 222, workcellY + 52, 62, 70, `${template.id}:lims-dashboard`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("qc-gate-automation", "QC", sideX + 290, workcellY + 52, 62, 70, `${template.id}:qc-gate`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(sideX + 36, workcellY + 136, sideW - 72, 26), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("operator-review-and-run-release", createTransform(sideX + 62, workcellY + 143, sideW - 124, 12), {
    fontSize: 8.6,
    fontWeight: 880,
    color: theme.warningText
  }));

  const identityY = workcellY + workcellH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, identityY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Sample identity ribbon", createTransform(x + 24, identityY + 7, 138, 14), {
    fontSize: 9.4,
    fontWeight: 820,
    color: theme.muted
  }));
  const identitySteps = [
    ["batch", "#f59e0b"],
    ["barcode", "#7c3aed"],
    ["transfer", "#4f46e5"],
    ["incubate", "#0f766e"],
    ["readout", theme.accent2],
    ["QC state", theme.warningText]
  ] as const;
  identitySteps.forEach(([label, accent], index) => {
    const chipX = x + 176 + index * 92;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, identityY + 5, 76, 18), {
      fill: index === identitySteps.length - 1 ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: index === identitySteps.length - 1 ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 10, identityY + 9, 56, 10), {
      fontSize: 7.5,
      fontWeight: 850,
      color: accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 16, y: identityY + 14 },
        { x: chipX - 3, y: identityY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const runTable = {
    id: createId("table"),
    name: "Illustrative automation run QC",
    columns: ["step", "score", "series"],
    rows: [
      { step: 1, score: 0.91, series: "run-qc" },
      { step: 2, score: 0.87, series: "run-qc" },
      { step: 3, score: 0.94, series: "run-qc" },
      { step: 4, score: 0.89, series: "run-qc" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 204), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Deck setup", "layout", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Plate logistics", "identity", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "LIMS + QC handoff", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("deck-layout", "Deck", x + 20, lowerY + 52, 74, 76, `${template.id}:deck`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("tip-rack", "Tips", x + 100, lowerY + 52, 68, 74, `${template.id}:tips`, { accent: "#64748b", stroke: "#64748b", labelVisible: false }),
    symbol("reagent-reservoir", "Reagent", x + 174, lowerY + 52, 68, 74, `${template.id}:reservoir`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("plate-384", "384-well", x + 248, lowerY + 52, 76, 76, `${template.id}:plate384`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    figureText("Deck layout, tips, reagents, and assay plate stay editable.", createTransform(x + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("plate-stack", "Stack", x + panelW + gap + 18, lowerY + 52, 56, 72, `${template.id}:stack`, { accent: "#0284c7", stroke: "#0284c7", labelVisible: false }),
    symbol("plate-handler", "Handler", x + panelW + gap + 82, lowerY + 52, 56, 72, `${template.id}:handler`, { accent: "#0f766e", stroke: "#0f766e", labelVisible: false }),
    symbol("barcode-scanner", "Scan", x + panelW + gap + 146, lowerY + 52, 56, 72, `${template.id}:barcode`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("incubator-stack", "Incubate", x + panelW + gap + 210, lowerY + 52, 56, 72, `${template.id}:incubator`, { accent: "#0f766e", stroke: "#0f766e", labelVisible: false }),
    symbol("sample-tracker", "Track", x + panelW + gap + 274, lowerY + 52, 54, 72, `${template.id}:tracker`, { accent: "#9333ea", stroke: "#9333ea", labelVisible: false }),
    figureText("Barcode and movement state stay separate from assay interpretation.", createTransform(x + panelW + gap + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("automation-orchestrator", "Orchestrator", x + (panelW + gap) * 2 + 20, lowerY + 52, 72, 76, `${template.id}:orchestrator`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("qc-gate-automation", "QC gate", x + (panelW + gap) * 2 + 100, lowerY + 52, 70, 76, `${template.id}:qcgateway`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("lab-sensor", "Sensor", x + (panelW + gap) * 2 + 178, lowerY + 54, 62, 72, `${template.id}:sensor`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Run QC",
      table: runTable,
      encodings: { x: "step", y: "score", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 248, lowerY + 50, 86, 86)),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 118, lowerY + 148, 196, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("operator-review-and-qc-signoff", createTransform(x + (panelW + gap) * 2 + 130, lowerY + 154, 172, 13), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createAnatomyOrganSystemsFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic anatomy organ systems flagship demo data generated by Scientific Image", "Scientific Image anatomy-organ-systems workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "anatomy-organ-systems",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 538), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Anatomy organ system context map", createTransform(x, y - 32, 610, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable organ context, tissue regions, biospecimens, biomarker evidence, endpoint status, and review caveats stay separated for agent + human edits.", createTransform(x + 628, y - 34, width - 628, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 238, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: anatomy-organ-systems", createTransform(x + 18, y + 17, 204, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 256, y + 12, 338, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable organ -> evidence map", createTransform(x + 272, y + 17, 304, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const atlasY = y + 64;
  const atlasH = 168;
  const mapW = Math.round(width * 0.58);
  const evidenceW = width - mapW - 24;
  nodes.push(figureShape("round-rect", "", createTransform(x, atlasY, mapW, atlasH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Cross-organ atlas map", createTransform(x + 22, atlasY + 16, 240, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 24, atlasY + 48, mapW - 48, 82), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#ddd6fe",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(
    symbol("anatomy-overview", "Overview", x + 38, atlasY + 58, 76, 78, `${template.id}:atlas-overview`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("organ-axis-brain-lung-gut", "Axis", x + 124, atlasY + 58, 76, 78, `${template.id}:organ-axis`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("brain", "Brain", x + 210, atlasY + 62, 62, 72, `${template.id}:atlas-brain`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("lung", "Lung", x + 278, atlasY + 62, 62, 72, `${template.id}:atlas-lung`, { accent: "#0ea5e9", stroke: "#0ea5e9", labelVisible: false }),
    symbol("gut", "Gut", x + 346, atlasY + 62, 62, 72, `${template.id}:atlas-gut`, { accent: "#059669", stroke: "#059669", labelVisible: false }),
    symbol("kidney", "Kidney", x + 414, atlasY + 62, 62, 72, `${template.id}:atlas-kidney`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("heart", "Heart", x + 482, atlasY + 62, 62, 72, `${template.id}:atlas-heart`, { accent: "#dc2626", stroke: "#dc2626", labelVisible: false }),
    symbol("immune-organ-map", "Immune", x + 550, atlasY + 62, 62, 72, `${template.id}:immune-organ`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false })
  );
  for (const cx of [116, 202, 274, 342, 410, 478, 546]) {
    nodes.push(createConnectorNode([
      { x: x + cx, y: atlasY + 100 },
      { x: x + cx + 10, y: atlasY + 100 }
    ], "", { stroke: theme.connector, strokeWidth: 1.55 }));
  }
  nodes.push(figureText("Organ silhouettes and cross-organ axis stay editable for tissue context maps.", createTransform(x + 24, atlasY + 140, mapW - 48, 16), {
    fontSize: 9.4,
    fontWeight: 720,
    color: theme.muted
  }));

  const evidenceX = x + mapW + 24;
  nodes.push(figureShape("round-rect", "", createTransform(evidenceX, atlasY, evidenceW, atlasH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("Sample, biomarker, endpoint review", createTransform(evidenceX + 20, atlasY + 16, evidenceW - 40, 18), {
    fontSize: 12.2,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(
    symbol("organ-sample-flow", "Sample flow", evidenceX + 22, atlasY + 52, 68, 72, `${template.id}:sample-flow`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("tissue-biomarker-panel", "Biomarker", evidenceX + 96, atlasY + 52, 68, 72, `${template.id}:biomarker-evidence`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("patient-organ-cohort", "Cohort", evidenceX + 170, atlasY + 52, 68, 72, `${template.id}:patient-organ-cohort`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("clinical-endpoint-card", "Endpoint", evidenceX + 244, atlasY + 52, 68, 72, `${template.id}:clinical-endpoint`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("organ-risk-context", "Risk context", evidenceX + 318, atlasY + 52, 68, 72, `${template.id}:organ-risk-context`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(evidenceX + 88, atlasY + 136, evidenceW - 176, 24), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("clinical-context-review", createTransform(evidenceX + 118, atlasY + 142, evidenceW - 236, 12), {
    fontSize: 8.6,
    fontWeight: 880,
    color: theme.warningText
  }));

  const traceY = atlasY + atlasH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, traceY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Organ evidence path", createTransform(x + 24, traceY + 7, 132, 14), {
    fontSize: 9.4,
    fontWeight: 820,
    color: theme.muted
  }));
  const evidenceSteps = [
    ["organ", theme.accent],
    ["region", "#7c3aed"],
    ["sample", "#0891b2"],
    ["biomarker", theme.accent2],
    ["cohort", theme.warningText],
    ["endpoint", theme.warningText]
  ] as const;
  evidenceSteps.forEach(([label, accent], index) => {
    const chipX = x + 176 + index * 94;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, traceY + 5, 78, 18), {
      fill: index >= 4 ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: index >= 4 ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 12, traceY + 9, 54, 10), {
      fontSize: 7.5,
      fontWeight: 850,
      color: accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 17, y: traceY + 14 },
        { x: chipX - 3, y: traceY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const endpointTable = {
    id: createId("table"),
    name: "Illustrative endpoint trend",
    columns: ["visit", "score", "series"],
    rows: [
      { visit: 0, score: 0.22, series: "endpoint" },
      { visit: 1, score: 0.34, series: "endpoint" },
      { visit: 2, score: 0.48, series: "endpoint" },
      { visit: 3, score: 0.57, series: "endpoint" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 204), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Organ map", "context", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Tissue module", "sample", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "Cohort evidence", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("brain", "Brain", x + 20, lowerY + 52, 62, 72, `${template.id}:brain`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("lung", "Lung", x + 88, lowerY + 52, 62, 72, `${template.id}:lung`, { accent: "#0ea5e9", stroke: "#0ea5e9", labelVisible: false }),
    symbol("gut", "Gut", x + 156, lowerY + 52, 62, 72, `${template.id}:gut`, { accent: "#059669", stroke: "#059669", labelVisible: false }),
    symbol("kidney", "Kidney", x + 224, lowerY + 52, 62, 72, `${template.id}:kidney`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("heart", "Heart", x + 292, lowerY + 52, 58, 72, `${template.id}:heart`, { accent: "#dc2626", stroke: "#dc2626", labelVisible: false }),
    figureText("Organ silhouettes are separately selectable for cross-organ summaries.", createTransform(x + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("intestinal-villus", "Villus", x + panelW + gap + 22, lowerY + 52, 66, 76, `${template.id}:villus`, { accent: "#059669", stroke: "#059669", labelVisible: false }),
    symbol("renal-nephron", "Nephron", x + panelW + gap + 94, lowerY + 52, 66, 76, `${template.id}:nephron`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("hepatic-lobule", "Lobule", x + panelW + gap + 166, lowerY + 52, 66, 76, `${template.id}:lobule`, { accent: "#f97316", stroke: "#f97316", labelVisible: false }),
    symbol("blood-vessel", "Vessel", x + panelW + gap + 238, lowerY + 52, 66, 76, `${template.id}:vessel`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    figureText("Tissue units preserve scale, region, and sampling anchors for annotations.", createTransform(x + panelW + gap + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("human-cohort", "Cohort", x + (panelW + gap) * 2 + 20, lowerY + 52, 66, 76, `${template.id}:cohort`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("patient-organ-cohort", "Patient organ", x + (panelW + gap) * 2 + 92, lowerY + 52, 66, 76, `${template.id}:patient`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("tissue-biomarker-panel", "Biomarker", x + (panelW + gap) * 2 + 164, lowerY + 52, 66, 76, `${template.id}:biomarker`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Endpoint trend",
      table: endpointTable,
      encodings: { x: "visit", y: "score", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 242, lowerY + 50, 88, 88)),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 96, lowerY + 148, 218, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("clinical-context-review", createTransform(x + (panelW + gap) * 2 + 124, lowerY + 154, 166, 13), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createMethodsProtocolsFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic methods-and-protocols flagship demo data generated by Scientific Image", "Scientific Image methods-and-protocols workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "methods-and-protocols",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });
  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 538), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Methods and protocol overview", createTransform(x, y - 32, 560, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Editable method communication separates sample prep, reagent setup, assay readout, controls, QC, and review caveats without becoming an operational protocol.", createTransform(x + 590, y - 34, width - 590, 44), {
      fontSize: 11.2,
      fontWeight: 650,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 224, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: methods-and-protocols", createTransform(x + 18, y + 17, 194, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 242, y + 12, 344, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable protocol evidence board", createTransform(x + 258, y + 17, 310, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const boardY = y + 64;
  const boardH = 164;
  const benchW = Math.round(width * 0.62);
  const reviewGap = 24;
  const reviewX = x + benchW + reviewGap;
  const reviewW = width - benchW - reviewGap;
  nodes.push(figureShape("round-rect", "", createTransform(x, boardY, benchW, boardH), {
    fill: theme.panelFill,
    stroke: theme.panelStroke,
    strokeWidth: 1.35,
    depth: theme.panelDepth
  }));
  nodes.push(figureText("Protocol bench board", createTransform(x + 22, boardY + 16, 222, 18), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.text
  }));
  nodes.push(figureText("Sample, reagent, reaction, and readout objects stay editable.", createTransform(x + 302, boardY + 18, benchW - 328, 16), {
    fontSize: 9.1,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(figureShape("round-rect", "", createTransform(x + 24, boardY + 48, benchW - 48, 80), {
    fill: theme.isDark ? "#0f172a" : "#ffffff",
    stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bae6fd",
    strokeWidth: 1.15,
    depth: "raised"
  }));
  nodes.push(
    symbol("sample-prep-workflow", "Sample prep", x + 40, boardY + 60, 74, 74, `${template.id}:bench-sample-prep`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("reagent-mastermix", "Reagent", x + 126, boardY + 60, 72, 74, `${template.id}:bench-reagent-mastermix`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("pcr-amplification", "PCR", x + 210, boardY + 60, 72, 74, `${template.id}:bench-pcr-amplification`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("qpcr-assay", "qPCR", x + 294, boardY + 60, 72, 74, `${template.id}:bench-qpcr-readout`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("standard-curve", "Curve", x + 378, boardY + 60, 72, 74, `${template.id}:bench-standard-curve`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("plate-96", "Plate", x + 462, boardY + 60, 70, 74, `${template.id}:bench-plate-layout`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("replicate-layout", "Replicates", x + 542, boardY + 60, 70, 74, `${template.id}:bench-replicates`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false })
  );
  for (const cx of [116, 200, 284, 368, 452, 534]) {
    nodes.push(createConnectorNode([
      { x: x + cx, y: boardY + 96 },
      { x: x + cx + 12, y: boardY + 96 }
    ], "", { stroke: theme.connector, strokeWidth: 1.65 }));
  }
  nodes.push(figureText("Bench order is schematic; it communicates method structure, not operational instructions.", createTransform(x + 24, boardY + 140, benchW - 48, 16), {
    fontSize: 9.2,
    fontWeight: 720,
    color: theme.muted
  }));

  nodes.push(figureShape("round-rect", "", createTransform(reviewX, boardY, reviewW, boardH), {
    fill: theme.warningFill,
    stroke: theme.warningStroke,
    strokeWidth: 1.35,
    depth: theme.floatingDepth
  }));
  nodes.push(figureText("Controls + caveat review", createTransform(reviewX + 20, boardY + 16, reviewW - 40, 18), {
    fontSize: 12.4,
    fontWeight: 900,
    color: theme.warningText
  }));
  nodes.push(figureText("Controls, checklist, deviation, and safety note stay visible before export.", createTransform(reviewX + 20, boardY + 40, reviewW - 40, 26), {
    fontSize: 8.8,
    fontWeight: 720,
    color: theme.muted
  }));
  nodes.push(
    symbol("control-sample-set", "Controls", reviewX + 24, boardY + 74, 66, 66, `${template.id}:review-controls`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("protocol-checklist", "Checklist", reviewX + 102, boardY + 72, 66, 68, `${template.id}:review-checklist`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("protocol-qc-gate", "QC gate", reviewX + 180, boardY + 70, 72, 70, `${template.id}:review-qc-gate`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("method-safety-note", "Safety", reviewX + 266, boardY + 72, 66, 68, `${template.id}:review-safety-note`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile)
  );
  nodes.push(figureShape("round-rect", "", createTransform(reviewX + 58, boardY + 134, reviewW - 116, 24), {
    fill: theme.isDark ? "#111827" : "#ffffff",
    stroke: theme.warningStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("method-caveat-review", createTransform(reviewX + 94, boardY + 140, reviewW - 188, 12), {
    fontSize: 8.8,
    fontWeight: 880,
    color: theme.warningText
  }));

  const ribbonY = boardY + boardH + 14;
  nodes.push(figureShape("round-rect", "", createTransform(x + 4, ribbonY, width - 8, 28), {
    fill: theme.isDark ? "#0f172a" : "#f8fafc",
    stroke: theme.panelStroke,
    strokeWidth: 1,
    depth: "surface"
  }));
  nodes.push(figureText("Method evidence path", createTransform(x + 24, ribbonY + 7, 132, 14), {
    fontSize: 9.4,
    fontWeight: 900,
    color: theme.accent
  }));
  ["sample", "reagent", "reaction", "readout", "controls", "caveat"].forEach((label, index) => {
    const chipX = x + 176 + index * 96;
    const warning = index >= 4;
    nodes.push(figureShape("round-rect", "", createTransform(chipX, ribbonY + 5, 78, 18), {
      fill: warning ? theme.warningFill : theme.isDark ? "#111827" : "#ffffff",
      stroke: warning ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(label, createTransform(chipX + 12, ribbonY + 9, 54, 10), {
      fontSize: 7.5,
      fontWeight: 850,
      color: warning ? theme.warningText : theme.accent
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: chipX - 17, y: ribbonY + 14 },
        { x: chipX - 3, y: ribbonY + 14 }
      ], "", { stroke: theme.connector, strokeWidth: 1.6 }));
    }
  });
  nodes.push(figureText("source-linked schematic for method communication", createTransform(x + width - 300, ribbonY + 8, 268, 12), {
    fontSize: 8.3,
    fontWeight: 720,
    color: theme.muted
  }));

  const lowerY = y + 280;
  const gap = 22;
  const panelW = Math.round((width - gap * 2) / 3);
  const qcTable = {
    id: createId("table"),
    name: "Illustrative method QC signal",
    columns: ["cycle", "signal", "series"],
    rows: [
      { cycle: 1, signal: 0.12, series: "qc" },
      { cycle: 2, signal: 0.28, series: "qc" },
      { cycle: 3, signal: 0.52, series: "qc" },
      { cycle: 4, signal: 0.81, series: "qc" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, 204), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Assay setup", "controls", x, lowerY, panelW, theme.panelFill, theme.accent);
  addPanel("B", "Method modules", "readout", x + panelW + gap, lowerY, panelW, theme.panelAltFill, theme.accent2);
  addPanel("C", "QC + caveat", "review", x + (panelW + gap) * 2, lowerY, width - (panelW + gap) * 2, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("serial-dilution", "Dilution", x + 20, lowerY + 52, 64, 74, `${template.id}:dilution`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("plate-96", "Plate", x + 92, lowerY + 52, 64, 74, `${template.id}:plate`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("replicate-layout", "Replicates", x + 164, lowerY + 52, 64, 74, `${template.id}:replicates`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("control-sample-set", "Controls", x + 236, lowerY + 52, 64, 74, `${template.id}:controls`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    figureText("Controls, replicates, and reagent setup stay editable as structured objects.", createTransform(x + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("incubation-step", "Incubate", x + panelW + gap + 18, lowerY + 52, 58, 72, `${template.id}:incubate`, { accent: "#f59e0b", stroke: "#f59e0b", labelVisible: false }),
    symbol("wash-step", "Wash", x + panelW + gap + 82, lowerY + 52, 58, 72, `${template.id}:wash`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("magnetic-bead-cleanup", "Cleanup", x + panelW + gap + 146, lowerY + 52, 58, 72, `${template.id}:cleanup`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("western-blot-workflow", "Blot", x + panelW + gap + 210, lowerY + 52, 58, 72, `${template.id}:blot`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("elisa-assay", "ELISA", x + panelW + gap + 274, lowerY + 52, 58, 72, `${template.id}:elisa`, { accent: "#dc2626", stroke: "#dc2626", labelVisible: false }),
    figureText("Method modules can be swapped for qPCR, ELISA, staining, blot, or library prep.", createTransform(x + panelW + gap + 24, lowerY + 160, panelW - 48, 24), { fontSize: 10, fontWeight: 720, color: theme.muted }),
    symbol("standard-curve", "Curve", x + (panelW + gap) * 2 + 20, lowerY + 52, 66, 76, `${template.id}:curve`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("protocol-checklist", "Checklist", x + (panelW + gap) * 2 + 92, lowerY + 52, 66, 76, `${template.id}:checklist`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("method-safety-note", "Safety note", x + (panelW + gap) * 2 + 164, lowerY + 52, 66, 76, `${template.id}:safety`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "QC signal",
      table: qcTable,
      encodings: { x: "cycle", y: "signal", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + (panelW + gap) * 2 + 242, lowerY + 50, 88, 88)),
    figureShape("round-rect", "", createTransform(x + (panelW + gap) * 2 + 104, lowerY + 148, 210, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("method-caveat-review", createTransform(x + (panelW + gap) * 2 + 138, lowerY + 154, 142, 13), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createGrantConsultingFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic grant-and-consulting flagship demo data generated by Scientific Image", "Scientific Image grant-and-consulting-summary workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "grant-and-consulting-summary",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });

  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 538), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Grant and consulting executive summary", createTransform(x, y - 32, 650, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Source-linked one-pager for funder updates, biotech strategy, and specific-aims review.", createTransform(x + 656, y - 34, width - 656, 38), {
      fontSize: 11.4,
      fontWeight: 700,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 274, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: grant-and-consulting-summary", createTransform(x + 18, y + 17, 244, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 292, y + 12, 304, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable brief: thesis / aims / risk / ask", createTransform(x + 308, y + 17, 268, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const panelTop = y + 58;
  const panelGap = 18;
  const leftW = 330;
  const centerW = 346;
  const rightW = width - leftW - centerW - panelGap * 2;
  const panelH = 208;
  const bottomY = y + 292;
  const bottomH = 188;
  const impactTable = {
    id: createId("table"),
    name: "Illustrative impact trajectory",
    columns: ["milestone", "impact", "series"],
    rows: [
      { milestone: 1, impact: 0.22, series: "impact" },
      { milestone: 2, impact: 0.38, series: "impact" },
      { milestone: 3, impact: 0.58, series: "impact" },
      { milestone: 4, impact: 0.76, series: "impact" }
    ],
    source
  };
  const riskTable = {
    id: createId("table"),
    name: "Illustrative risk retirement",
    columns: ["quarter", "risk", "series"],
    rows: [
      { quarter: "Q1", risk: 0.72, series: "open risk" },
      { quarter: "Q2", risk: 0.54, series: "open risk" },
      { quarter: "Q3", risk: 0.31, series: "open risk" },
      { quarter: "Q4", risk: 0.18, series: "open risk" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, ph: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Executive recommendation", "decision", x, panelTop, leftW, panelH, theme.panelFill, theme.accent);
  addPanel("B", "Evidence wedge", "source", x + leftW + panelGap, panelTop, centerW, panelH, theme.panelAltFill, theme.accent2);
  addPanel("C", "Funding ask and risk", "review", x + leftW + centerW + panelGap * 2, panelTop, rightW, panelH, theme.warningFill, theme.warningText);
  addPanel("D", "Specific aims and delivery path", "roadmap", x, bottomY, Math.round(width * 0.62), bottomH, theme.panelFill, theme.accent);
  addPanel("E", "Evidence ledger", "review", x + Math.round(width * 0.62) + panelGap, bottomY, width - Math.round(width * 0.62) - panelGap, bottomH, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("recommendation-card", "Recommendation", x + 24, panelTop + 56, 108, 104, `${template.id}:recommendation`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    figureText("Recommended ask", createTransform(x + 144, panelTop + 60, 150, 18), { fontSize: 13.5, fontWeight: 900, color: theme.heading }),
    figureText("Fund a focused validation wedge with explicit go/no-go criteria, source-linked evidence, and reviewable risk assumptions.", createTransform(x + 144, panelTop + 84, 156, 62), { fontSize: 10.4, fontWeight: 680, color: theme.text }),
    figureShape("round-rect", "", createTransform(x + 144, panelTop + 154, 148, 28), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("human approval required", createTransform(x + 158, panelTop + 162, 120, 12), { fontSize: 8.2, fontWeight: 850, color: theme.accent }),
    symbol("problem-statement-card", "Problem", x + leftW + panelGap + 22, panelTop + 56, 72, 78, `${template.id}:problem`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("scientific-opportunity-map", "Opportunity", x + leftW + panelGap + 102, panelTop + 56, 72, 78, `${template.id}:opportunity`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("evidence-snapshot", "Evidence", x + leftW + panelGap + 182, panelTop + 56, 72, 78, `${template.id}:evidence`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Impact",
      table: impactTable,
      encodings: { x: "milestone", y: "impact", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + leftW + panelGap + 258, panelTop + 58, 74, 76)),
    figureText("Problem, opportunity, evidence, and impact remain source-linked.", createTransform(x + leftW + panelGap + 24, panelTop + 154, centerW - 48, 28), { fontSize: 9.8, fontWeight: 720, color: theme.muted }),
    symbol("budget-envelope", "Budget", x + leftW + centerW + panelGap * 2 + 24, panelTop + 56, 74, 78, `${template.id}:budget`, { accent: "#f59e0b", stroke: "#f59e0b", labelVisible: false }),
    symbol("resource-allocation", "Resources", x + leftW + centerW + panelGap * 2 + 102, panelTop + 56, 74, 78, `${template.id}:resources`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("go-no-go-gate", "Gate", x + leftW + centerW + panelGap * 2 + 180, panelTop + 56, 74, 78, `${template.id}:gate`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    figureText("Budget, team capacity, and review gate are separated from the scientific claim.", createTransform(x + leftW + centerW + panelGap * 2 + 24, panelTop + 154, rightW - 48, 32), { fontSize: 9.6, fontWeight: 720, color: theme.muted }),
    symbol("specific-aim-1", "Aim 1", x + 28, bottomY + 56, 72, 76, `${template.id}:aim-1`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("specific-aim-2", "Aim 2", x + 112, bottomY + 56, 72, 76, `${template.id}:aim-2`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("specific-aim-3", "Aim 3", x + 196, bottomY + 56, 72, 76, `${template.id}:aim-3`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("milestone-roadmap", "Milestones", x + 306, bottomY + 52, 94, 82, `${template.id}:milestone-roadmap`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("team-capability-map", "Team", x + 416, bottomY + 54, 78, 78, `${template.id}:team`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("deliverable-package", "Deliverable", x + 504, bottomY + 54, 78, 78, `${template.id}:deliverable`, { accent: "#f59e0b", stroke: "#f59e0b", labelVisible: false }),
    createConnectorNode([
      { x: x + 276, y: bottomY + 94 },
      { x: x + 300, y: bottomY + 94 }
    ], "", { stroke: theme.connector, strokeWidth: 2 }),
    figureText("Aim 1 validates the signal, Aim 2 scales the assay, Aim 3 packages decision evidence.", createTransform(x + 28, bottomY + 142, Math.round(width * 0.62) - 56, 26), { fontSize: 9.8, fontWeight: 720, color: theme.muted }),
    symbol("risk-matrix", "Risk", x + Math.round(width * 0.62) + panelGap + 24, bottomY + 54, 76, 78, `${template.id}:risk`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("risk-mitigation-plan", "Mitigation", x + Math.round(width * 0.62) + panelGap + 106, bottomY + 54, 76, 78, `${template.id}:mitigation`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Risk",
      table: riskTable,
      encodings: { x: "quarter", y: "risk", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + Math.round(width * 0.62) + panelGap + 198, bottomY + 54, 96, 78)),
    figureShape("round-rect", "", createTransform(x + Math.round(width * 0.62) + panelGap + 72, bottomY + 140, 218, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("executive-recommendation-review", createTransform(x + Math.round(width * 0.62) + panelGap + 98, bottomY + 146, 166, 13), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createClinicalTranslationalFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 104;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = curatedProvenance("Synthetic clinical-translational flagship demo data generated by Scientific Image", "Scientific Image clinical-translational workflow pack fixture");
  const figureText = (text: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createTextNode(text, transform, style),
    claimStatus: "draft-visual"
  });
  const figureShape = (shape: "round-rect" | "ellipse" | "rect" | "diamond" | "line", label: string, transform: Transform, style: Style = {}): SceneNode => ({
    ...createShapeNode(shape, label, transform, style),
    claimStatus: "draft-visual"
  });
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    layoutHint: string,
    appearance: SymbolAppearance = {},
    profile: AssetStyleProfile = styleProfile
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole: "clinical-translational",
    layoutHint,
    appearance: { ...theme.symbolAppearance, ...appearance }
  });

  const nodes: SceneNode[] = [
    figureShape("round-rect", "", createTransform(x - 18, y - 44, width + 36, 538), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    figureText("Clinical translational evidence bridge", createTransform(x, y - 32, 620, 30), {
      fontSize: 22,
      fontWeight: 900,
      color: theme.heading
    }),
    figureText("Patient journey, biospecimen chain, biomarker validation, endpoints, safety, and clinician review as editable evidence layers.", createTransform(x + 626, y - 34, width - 626, 44), {
      fontSize: 11.1,
      fontWeight: 700,
      color: theme.muted
    }),
    figureShape("round-rect", "", createTransform(x + 4, y + 12, 246, 28), {
      fill: theme.chipFill,
      stroke: theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("pack: clinical-translational", createTransform(x + 18, y + 17, 214, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent
    }),
    figureShape("round-rect", "", createTransform(x + 264, y + 12, 356, 28), {
      fill: theme.chipAltFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0",
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("editable brief: cohort / assay / endpoint / safety", createTransform(x + 280, y + 17, 322, 18), {
      fontSize: 10.2,
      fontWeight: 850,
      color: theme.accent2
    })
  ];

  const panelTop = y + 58;
  const panelGap = 18;
  const leftW = 338;
  const centerW = 352;
  const rightW = width - leftW - centerW - panelGap * 2;
  const panelH = 210;
  const bottomY = y + 294;
  const bottomH = 186;
  const enrollmentTable = {
    id: createId("table"),
    name: "Illustrative enrollment trajectory",
    columns: ["month", "enrolled", "series"],
    rows: [
      { month: 1, enrolled: 18, series: "cohort" },
      { month: 2, enrolled: 34, series: "cohort" },
      { month: 3, enrolled: 57, series: "cohort" },
      { month: 4, enrolled: 82, series: "cohort" }
    ],
    source
  };
  const safetyTable = {
    id: createId("table"),
    name: "Illustrative safety signal trend",
    columns: ["visit", "rate", "series"],
    rows: [
      { visit: "V1", rate: 0.22, series: "AE rate" },
      { visit: "V2", rate: 0.18, series: "AE rate" },
      { visit: "V3", rate: 0.16, series: "AE rate" },
      { visit: "V4", rate: 0.12, series: "AE rate" }
    ],
    source
  };
  const addPanel = (tag: string, title: string, status: string, px: number, py: number, pw: number, ph: number, fill = theme.panelFill, tone = theme.text) => {
    const review = status === "review";
    nodes.push(figureShape("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + 14, py + 14, 28, 22), {
      fill: theme.isDark ? "#0f172a" : "#ffffff",
      stroke: review ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(tag, createTransform(px + 14, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 920,
      color: tone
    }));
    nodes.push(figureText(title, createTransform(px + 52, py + 16, pw - 142, 20), {
      fontSize: 11.6,
      fontWeight: 850,
      color: tone
    }));
    nodes.push(figureShape("round-rect", "", createTransform(px + pw - 88, py + 14, 74, 22), {
      fill: review ? theme.warningFill : theme.chipFill,
      stroke: review ? theme.warningStroke : theme.chipStroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(figureText(status, createTransform(px + pw - 76, py + 19, 52, 12), {
      fontSize: 7.9,
      fontWeight: 850,
      color: review ? theme.warningText : tone
    }));
  };
  addPanel("A", "Cohort and trial schema", "source", x, panelTop, leftW, panelH, theme.panelFill, theme.accent);
  addPanel("B", "Biospecimen to biomarker", "evidence", x + leftW + panelGap, panelTop, centerW, panelH, theme.panelAltFill, theme.accent2);
  addPanel("C", "Endpoint and safety review", "review", x + leftW + centerW + panelGap * 2, panelTop, rightW, panelH, theme.warningFill, theme.warningText);
  addPanel("D", "Validation and evidence grade", "validation", x, bottomY, Math.round(width * 0.62), bottomH, theme.panelFill, theme.accent);
  addPanel("E", "Clinical decision handoff", "review", x + Math.round(width * 0.62) + panelGap, bottomY, width - Math.round(width * 0.62) - panelGap, bottomH, theme.warningFill, theme.warningText);
  nodes.push(
    symbol("patient-journey-map", "Journey", x + 22, panelTop + 56, 70, 76, `${template.id}:patient-journey`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("consent-enrollment", "Consent", x + 98, panelTop + 56, 70, 76, `${template.id}:consent`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("eligibility-criteria", "Eligibility", x + 174, panelTop + 56, 70, 76, `${template.id}:eligibility`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("randomization-schema", "Design", x + 250, panelTop + 56, 70, 76, `${template.id}:cohort-schema`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Enrollment",
      table: enrollmentTable,
      encodings: { x: "month", y: "enrolled", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + 220, panelTop + 142, 96, 48)),
    figureText("Cohort source, eligibility, and trial schema remain editable before claims.", createTransform(x + 24, panelTop + 148, 178, 34), { fontSize: 9.2, fontWeight: 720, color: theme.muted }),
    symbol("clinical-sample-flow", "Sample flow", x + leftW + panelGap + 24, panelTop + 56, 76, 80, `${template.id}:sample-flow`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    symbol("biospecimen-collection", "Biospecimen", x + leftW + panelGap + 106, panelTop + 56, 76, 80, `${template.id}:biospecimen`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("clinical-omics-bridge", "Omics bridge", x + leftW + panelGap + 188, panelTop + 56, 76, 80, `${template.id}:omics-bridge`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("biomarker-validation", "Biomarker", x + leftW + panelGap + 270, panelTop + 56, 62, 80, `${template.id}:biomarker`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    figureText("Specimen chain, omics readout, and biomarker evidence are separate scene nodes for review.", createTransform(x + leftW + panelGap + 26, panelTop + 154, centerW - 52, 30), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    symbol("endpoint-hierarchy", "Endpoint", x + leftW + centerW + panelGap * 2 + 22, panelTop + 56, 72, 78, `${template.id}:endpoint`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("clinical-response-card", "Response", x + leftW + centerW + panelGap * 2 + 102, panelTop + 56, 72, 78, `${template.id}:response`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("survival-curve", "Survival", x + leftW + centerW + panelGap * 2 + 182, panelTop + 56, 72, 78, `${template.id}:survival`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Safety",
      table: safetyTable,
      encodings: { x: "visit", y: "rate", color: "series" },
      style: theme.plotStyle
    }, createTransform(x + leftW + centerW + panelGap * 2 + 70, panelTop + 144, 132, 48)),
    symbol("adverse-event-panel", "AE", x + Math.round(width * 0.62) + panelGap + 22, bottomY + 54, 74, 78, `${template.id}:adverse-event`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("clinical-risk-benefit", "Risk benefit", x + Math.round(width * 0.62) + panelGap + 104, bottomY + 54, 74, 78, `${template.id}:risk-benefit`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("clinician-review", "Review", x + Math.round(width * 0.62) + panelGap + 186, bottomY + 54, 74, 78, `${template.id}:clinician-review`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("clinical-decision-support", "Decision", x + Math.round(width * 0.62) + panelGap + 268, bottomY + 54, 74, 78, `${template.id}:decision-support`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }, theme.riskSymbolProfile),
    symbol("cohort-stratification", "Cohort", x + 26, bottomY + 54, 72, 76, `${template.id}:cohort`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("cohort-table", "Table", x + 106, bottomY + 54, 72, 76, `${template.id}:cohort-table`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("biomarker-discovery", "Discovery", x + 206, bottomY + 54, 72, 76, `${template.id}:discovery`, { accent: "#2563eb", stroke: "#2563eb", labelVisible: false }),
    symbol("assay-validation", "Assay", x + 286, bottomY + 54, 72, 76, `${template.id}:assay`, { accent: "#7c3aed", stroke: "#7c3aed", labelVisible: false }),
    symbol("validation-cohort", "Validation", x + 366, bottomY + 54, 72, 76, `${template.id}:validation`, { accent: "#0891b2", stroke: "#0891b2", labelVisible: false }),
    symbol("regulatory-evidence-brief", "Evidence", x + 466, bottomY + 54, 72, 76, `${template.id}:regulatory-evidence`, { accent: "#0d9488", stroke: "#0d9488", labelVisible: false }),
    figureText("Cohort stratification, assay validation, and evidence grade are reviewable before endpoint claims.", createTransform(x + 26, bottomY + 142, Math.round(width * 0.62) - 52, 26), { fontSize: 9.7, fontWeight: 720, color: theme.muted }),
    figureShape("round-rect", "", createTransform(x + Math.round(width * 0.62) + panelGap + 78, bottomY + 140, 224, 24), {
      fill: theme.isDark ? "#111827" : "#ffffff",
      stroke: theme.warningStroke,
      strokeWidth: 1,
      depth: "surface"
    }),
    figureText("clinical-claims-review", createTransform(x + Math.round(width * 0.62) + panelGap + 112, bottomY + 146, 154, 13), {
      fontSize: 8.2,
      fontWeight: 850,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSpatialResultsFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 98;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const source = curatedProvenance("Synthetic spatial transcriptomics flagship demo data generated by Scientific Image", "Scientific Image spatial transcriptomics workflow pack fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 42, width + 36, 520), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    createTextNode("Spatial transcriptomics results panel", createTransform(x, y - 30, 560, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }),
    createTextNode("Tissue -> spots -> segmentation -> neighborhoods -> review-ready export.", createTransform(x + 544, y - 27, width - 544, 28), {
      fontSize: 11,
      fontWeight: 650,
      color: theme.muted
    })
  ];
  const panelGap = 22;
  const topY = y + 42;
  const leftW = 334;
  const midW = 334;
  const rightW = width - leftW - midW - panelGap * 2;
  const panels = [
    { tag: "A", title: "Tissue + spots", x, y: topY, w: leftW, h: 214 },
    { tag: "B", title: "Segmentation", x: x + leftW + panelGap, y: topY, w: midW, h: 214 },
    { tag: "C", title: "Neighborhood graph", x: x + leftW + midW + panelGap * 2, y: topY, w: rightW, h: 214 },
    { tag: "D", title: "Expression summary", x, y: topY + 238, w: Math.round(width * 0.62), h: 196 },
    { tag: "E", title: "Interpretation + QA", x: x + Math.round(width * 0.62) + panelGap, y: topY + 238, w: width - Math.round(width * 0.62) - panelGap, h: 196 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: theme.panelFill,
      stroke: theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#d8b4fe",
      strokeWidth: 1.25,
      depth: theme.panelDepth
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 24), {
      fontSize: 18,
      fontWeight: 900,
      color: theme.accent
    }));
    nodes.push(createTextNode(panel.title, createTransform(panel.x + 46, panel.y + 14, panel.w - 62, 22), {
      fontSize: 13,
      fontWeight: 850,
      color: theme.text
    }));
  }
  nodes.push(
    createCuratedSymbolNode({
      assetId: "histology-section",
      label: "H&E section",
      x: x + 28,
      y: topY + 56,
      width: 140,
      height: 112,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "spatial-context",
      layoutHint: `${template.id}:panel-A`
    }),
    createCuratedSymbolNode({
      assetId: "visium-spot-array",
      label: "Spot array",
      x: x + 170,
      y: topY + 56,
      width: 140,
      height: 112,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "spatial-context",
      layoutHint: `${template.id}:panel-A`
    }),
    createCuratedSymbolNode({
      assetId: "segmentation-mask",
      label: "Mask",
      x: x + leftW + panelGap + 42,
      y: topY + 56,
      width: 140,
      height: 112,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "image-analysis",
      layoutHint: `${template.id}:panel-B`
    }),
    createCuratedSymbolNode({
      assetId: "cell-boundary",
      label: "Boundaries",
      x: x + leftW + panelGap + 176,
      y: topY + 56,
      width: 128,
      height: 104,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "image-analysis",
      layoutHint: `${template.id}:panel-B`
    }),
    createCuratedSymbolNode({
      assetId: "neighborhood-graph",
      label: "Neighborhoods",
      x: x + leftW + midW + panelGap * 2 + 62,
      y: topY + 58,
      width: 152,
      height: 118,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "spatial-context",
      layoutHint: `${template.id}:panel-C`
    })
  );
  const heatmapTable = {
    id: createId("table"),
    name: "Demo spatial gene expression table",
    columns: ["gene", "region", "expression"],
    rows: [
	      { gene: "CXCL10", region: "immune", expression: 2.6 },
	      { gene: "CXCL10", region: "tumor", expression: 0.8 },
	      { gene: "COL1A1", region: "stroma", expression: 2.1 },
	      { gene: "EPCAM", region: "tumor", expression: 2.4 },
	      { gene: "PTPRC", region: "immune", expression: 2.2 },
	      { gene: "MKI67", region: "tumor", expression: 1.8 },
	      { gene: "PECAM1", region: "vessel", expression: 1.7 }
    ],
    source
  };
  nodes.push(
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "Spatial expression",
      table: heatmapTable,
      encodings: { x: "region", y: "gene", value: "expression" },
      style: theme.plotStyle
    }, createTransform(x + 28, topY + 282, Math.round(width * 0.62) - 56, 144)),
    createCuratedSymbolNode({
      assetId: "gene-locus",
      label: "Marker gene",
      x: x + Math.round(width * 0.62) + panelGap + 40,
      y: topY + 296,
      width: 132,
      height: 104,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "data-evidence",
      layoutHint: `${template.id}:panel-E`
    }),
    createTextNode("Claim: immune-edge interferon signal. Confirm annotation and image provenance.", createTransform(x + Math.round(width * 0.62) + panelGap + 178, topY + 308, width - Math.round(width * 0.62) - panelGap - 204, 70), {
      fontSize: 13,
      fontWeight: 750,
      color: theme.reviewText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createTemplateRealisticImageNode(input: {
  assetId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layoutHint: string;
  semanticRole: string;
  appearance?: ImageAppearance;
  crop?: ImageCrop;
  mask?: ImageMask;
}): SceneNode {
  const node = createRealisticImageNode({
    assetId: input.assetId,
    label: input.label,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    styleProfile: "scientific-editorial-realism",
    appearance: input.appearance,
    crop: input.crop,
    mask: input.mask ?? { shape: "round-rect" },
    depth: "floating"
  });
  return {
    ...node,
    claimStatus: "user-confirmed",
    payload: {
      ...(node.payload as Record<string, unknown>),
      semanticRole: input.semanticRole,
      layoutHint: input.layoutHint
    } as SceneNode["payload"]
  };
}

function createSpatialRealisticHybridTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const x = input.x ?? 52;
  const y = input.y ?? 56;
  const width = input.width ?? 1176;
  const topY = y + 66;
  const gap = 24;
  const leftW = 468;
  const midW = 330;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 294;
  const source = curatedProvenance("Synthetic spatial realistic hybrid demo data generated by Scientific Image", "Scientific Image realistic spatial microscopy fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 44, width + 36, 652), {
      fill: "#ffffff",
      stroke: "#bae6fd",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Spatial realistic hybrid figure", createTransform(x, y - 30, 560, 32), {
      fontSize: 27,
      fontWeight: 920,
      color: "#0f172a"
    }),
    createTextNode("Editorial image evidence plus editable SVG annotations, plots, and export/provenance QA.", createTransform(x + 566, y - 25, width - 566, 27), {
      fontSize: 13.2,
      fontWeight: 680,
      color: "#64748b"
    })
  ];
  const panels = [
    { tag: "A", title: "Histology evidence", x, y: topY, w: leftW, h: 270 },
    { tag: "B", title: "Segmentation overlay", x: x + leftW + gap, y: topY, w: midW, h: 270 },
    { tag: "C", title: "Spatial map", x: x + leftW + midW + gap * 2, y: topY, w: rightW, h: 270 },
    { tag: "D", title: "Expression evidence", x, y: lowerY, w: Math.round(width * 0.58), h: 216 },
    { tag: "E", title: "Review packet", x: x + Math.round(width * 0.58) + gap, y: lowerY, w: width - Math.round(width * 0.58) - gap, h: 216 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: "#f8fafc",
      stroke: "#cbd5e1",
      strokeWidth: 1.25,
      depth: "raised"
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 22), {
      fontSize: 17,
      fontWeight: 950,
      color: "#075985"
    }));
    nodes.push(createTextNode(panel.title, createTransform(panel.x + 46, panel.y + 13, panel.w - 60, 20), {
      fontSize: 12.8,
      fontWeight: 850,
      color: "#334155"
    }));
  }
  const heatmapTable = {
    id: createId("table"),
    name: "Demo spatial realistic hybrid expression table",
    columns: ["gene", "region", "expression"],
    rows: [
      { gene: "CXCL10", region: "immune edge", expression: 2.6 },
      { gene: "CXCL10", region: "tumor core", expression: 0.8 },
      { gene: "COL1A1", region: "stroma", expression: 2.1 },
      { gene: "EPCAM", region: "tumor core", expression: 2.4 },
      { gene: "PTPRC", region: "immune edge", expression: 2.2 },
      { gene: "MKI67", region: "tumor core", expression: 1.8 },
      { gene: "PECAM1", region: "vessel", expression: 1.7 }
    ],
    source
  };
  nodes.push(
    createTemplateRealisticImageNode({
      assetId: "realistic-he-tissue-section",
      label: "H&E tissue image",
      x: x + 24,
      y: topY + 50,
      width: 304,
      height: 188,
      layoutHint: `${template.id}:panel-A`,
      semanticRole: "microscopy-evidence",
      appearance: { colorWash: "#c084fc", colorWashOpacity: 0.1, contrast: 1.08 },
      crop: { x: -0.03, y: 0.02, zoom: 1.12, fit: "cover" },
      mask: { shape: "tissue-contour" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-visium-slide",
      label: "Spot capture context",
      x: x + 338,
      y: topY + 64,
      width: 106,
      height: 154,
      layoutHint: `${template.id}:panel-A-context`,
      semanticRole: "spatial-context",
      appearance: { colorWash: "#14b8a6", colorWashOpacity: 0.13, contrast: 1.03 },
      crop: { x: 0, y: 0, zoom: 1.04, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createConnectorNode([{ x: x + 328, y: topY + 144 }, { x: x + 338, y: topY + 144 }], "", { stroke: "#0891b2", strokeWidth: 2.4 }),
    createTemplateRealisticImageNode({
      assetId: "realistic-segmentation-overlay",
      label: "Cell segmentation",
      x: x + leftW + gap + 24,
      y: topY + 50,
      width: midW - 48,
      height: 188,
      layoutHint: `${template.id}:panel-B`,
      semanticRole: "segmentation-overlay",
      appearance: { colorWash: "#22c55e", colorWashOpacity: 0.1, contrast: 1.1 },
      crop: { x: 0.03, y: 0, zoom: 1.16, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-spatial-map",
      label: "Spatial expression",
      x: x + leftW + midW + gap * 2 + 24,
      y: topY + 50,
      width: rightW - 48,
      height: 188,
      layoutHint: `${template.id}:panel-C`,
      semanticRole: "spatial-expression",
      appearance: { colorWash: "#f97316", colorWashOpacity: 0.09, contrast: 1.07 },
      crop: { x: 0, y: -0.02, zoom: 1.08, fit: "cover" },
      mask: { shape: "soft-vignette" }
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "Marker expression by region",
      table: heatmapTable,
      encodings: { x: "region", y: "gene", value: "expression" }
    }, createTransform(x + 28, lowerY + 48, Math.round(width * 0.58) - 56, 148)),
    createCuratedSymbolNode({
      assetId: "neighborhood-graph",
      label: "Neighborhood graph",
      x: x + Math.round(width * 0.58) + gap + 28,
      y: lowerY + 56,
      width: 140,
      height: 118,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: "neighborhood-graph",
      layoutHint: `${template.id}:review-neighborhood`
    }),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.58) + gap + 188, lowerY + 48, width - Math.round(width * 0.58) - gap - 222, 128), {
      fill: "#fffbeb",
      stroke: "#fcd34d",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Review before export", createTransform(x + Math.round(width * 0.58) + gap + 210, lowerY + 66, 230, 20), {
      fontSize: 14,
      fontWeight: 920,
      color: "#92400e"
    }),
    createTextNode("Confirm image rights, crop focus, segmentation source, and PPTX/DOCX fallback warnings. SVG/PDF preserve the hybrid figure.", createTransform(x + Math.round(width * 0.58) + gap + 210, lowerY + 96, width - Math.round(width * 0.58) - gap - 278, 58), {
      fontSize: 12.2,
      fontWeight: 720,
      color: "#7c2d12"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createWetlabRealisticContextTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const x = input.x ?? 54;
  const y = input.y ?? 58;
  const width = input.width ?? 1172;
  const gap = 24;
  const topY = y + 68;
  const mainW = 468;
  const midW = 328;
  const rightW = width - mainW - midW - gap * 2;
  const lowerY = topY + 292;
  const source = curatedProvenance("Synthetic wetlab realistic context demo data generated by Scientific Image", "Scientific Image realistic wetlab context fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 44, width + 36, 646), {
      fill: "#ffffff",
      stroke: "#bfdbfe",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Wetlab realistic protocol context", createTransform(x, y - 30, 610, 32), {
      fontSize: 27,
      fontWeight: 920,
      color: "#0f172a"
    }),
    createTextNode("Editorial protocol evidence plus editable assay summary, biosafety cue, and export/provenance QA.", createTransform(x + 590, y - 25, width - 590, 27), {
      fontSize: 13.2,
      fontWeight: 680,
      color: "#64748b"
    })
  ];
  const panels = [
    { tag: "A", title: "Sample handling", x, y: topY, w: mainW, h: 268 },
    { tag: "B", title: "Assay setup", x: x + mainW + gap, y: topY, w: midW, h: 268 },
    { tag: "C", title: "Instrument context", x: x + mainW + midW + gap * 2, y: topY, w: rightW, h: 268 },
    { tag: "D", title: "Protocol QC", x, y: lowerY, w: Math.round(width * 0.58), h: 214 },
    { tag: "E", title: "Biosafety / export review", x: x + Math.round(width * 0.58) + gap, y: lowerY, w: width - Math.round(width * 0.58) - gap, h: 214 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: "#f8fafc",
      stroke: panel.tag === "E" ? "#fed7aa" : "#cbd5e1",
      strokeWidth: 1.25,
      depth: panel.tag === "E" ? "floating" : "raised"
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 22), {
      fontSize: 17,
      fontWeight: 950,
      color: panel.tag === "E" ? "#9a3412" : "#1d4ed8"
    }));
    nodes.push(createTextNode(panel.title, createTransform(panel.x + 46, panel.y + 13, panel.w - 60, 20), {
      fontSize: 12.8,
      fontWeight: 850,
      color: "#334155"
    }));
  }
  const qcTable = {
    id: createId("table"),
    name: "Demo wetlab protocol QC table",
    columns: ["step", "score", "class"],
    rows: [
      { step: "Sample", score: 0.92, class: "pass" },
      { step: "Plate", score: 0.86, class: "pass" },
      { step: "Image", score: 0.78, class: "review" },
      { step: "Sequence", score: 0.83, class: "pass" },
      { step: "BSC", score: 0.7, class: "review" }
    ],
    source
  };
  nodes.push(
    createTemplateRealisticImageNode({
      assetId: "realistic-pipette-bench",
      label: "Pipette workflow",
      x: x + 24,
      y: topY + 50,
      width: 300,
      height: 186,
      layoutHint: `${template.id}:panel-A`,
      semanticRole: "protocol-step",
      appearance: { colorWash: "#2563eb", colorWashOpacity: 0.05, contrast: 1.12 },
      crop: { x: -0.02, y: 0.02, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-sample-tubes",
      label: "Sample tubes",
      x: x + 336,
      y: topY + 66,
      width: 108,
      height: 150,
      layoutHint: `${template.id}:panel-A-context`,
      semanticRole: "input-sample",
      appearance: { colorWash: "#22c55e", colorWashOpacity: 0.07, contrast: 1.08 },
      crop: { x: 0, y: 0.03, zoom: 1.12, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createCuratedSymbolNode({
      assetId: "pipette",
      label: "Editable protocol icon",
      x: x + 34,
      y: topY + 212,
      width: 58,
      height: 42,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: "protocol-step",
      layoutHint: `${template.id}:editable-protocol-icon`,
      labelVisible: false,
      style: {
        depth: "floating",
        stroke: "#2563eb",
        strokeWidth: 1.6
      }
    }),
    createConnectorNode([{ x: x + 324, y: topY + 142 }, { x: x + 336, y: topY + 142 }], "", { stroke: "#2563eb", strokeWidth: 2.4 }),
    createTemplateRealisticImageNode({
      assetId: "realistic-plate-96-photo",
      label: "Assay plate",
      x: x + mainW + gap + 24,
      y: topY + 50,
      width: midW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-B`,
      semanticRole: "assay-context",
      appearance: { colorWash: "#0ea5e9", colorWashOpacity: 0.06, contrast: 1.1 },
      crop: { x: 0, y: 0, zoom: 1.06, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-microscope-bench",
      label: "Microscope context",
      x: x + mainW + midW + gap * 2 + 24,
      y: topY + 50,
      width: rightW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-C`,
      semanticRole: "microscopy-evidence",
      appearance: { colorWash: "#14b8a6", colorWashOpacity: 0.05, contrast: 1.1 },
      crop: { x: 0, y: 0, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Protocol QC by step",
      table: qcTable,
      encodings: { x: "step", y: "score", color: "class" }
    }, createTransform(x + 28, lowerY + 48, Math.round(width * 0.58) - 56, 146)),
    createTemplateRealisticImageNode({
      assetId: "realistic-biosafety-cabinet",
      label: "BSC context",
      x: x + Math.round(width * 0.58) + gap + 28,
      y: lowerY + 54,
      width: 156,
      height: 112,
      layoutHint: `${template.id}:biosafety-context`,
      semanticRole: "biosafety-review",
      appearance: { colorWash: "#dc2626", colorWashOpacity: 0.08, contrast: 1.1 },
      crop: { x: 0, y: 0, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.58) + gap + 208, lowerY + 48, width - Math.round(width * 0.58) - gap - 242, 128), {
      fill: "#fff7ed",
      stroke: "#fed7aa",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Review before export", createTransform(x + Math.round(width * 0.58) + gap + 230, lowerY + 66, 230, 20), {
      fontSize: 14,
      fontWeight: 920,
      color: "#92400e"
    }),
    createTextNode("Confirm protocol source, sample handling claim, BSC context, and image fallback warnings before PPTX/DOCX delivery.", createTransform(x + Math.round(width * 0.58) + gap + 230, lowerY + 96, width - Math.round(width * 0.58) - gap - 298, 58), {
      fontSize: 12.2,
      fontWeight: 720,
      color: "#7c2d12"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createCellularRealisticEvidenceTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const x = input.x ?? 54;
  const y = input.y ?? 58;
  const width = input.width ?? 1172;
  const gap = 24;
  const topY = y + 68;
  const leftW = 392;
  const midW = 360;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 292;
  const lowerLeftW = Math.round(width * 0.58);
  const source = curatedProvenance("Synthetic cellular realistic evidence demo data generated by Scientific Image", "Scientific Image realistic cellular texture fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 44, width + 36, 646), {
      fill: "#ffffff",
      stroke: "#fbcfe8",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Cellular realistic evidence panel", createTransform(x, y - 30, 610, 32), {
      fontSize: 27,
      fontWeight: 920,
      color: "#0f172a"
    }),
    createTextNode("Editorial cellular textures plus editable marker summary, biology symbols, and export/provenance QA.", createTransform(x + 590, y - 25, width - 590, 27), {
      fontSize: 13.2,
      fontWeight: 680,
      color: "#64748b"
    })
  ];
  const panels = [
    { tag: "A", title: "Organoid context", x, y: topY, w: leftW, h: 268 },
    { tag: "B", title: "Tumor microenvironment", x: x + leftW + gap, y: topY, w: midW, h: 268 },
    { tag: "C", title: "Immune infiltrate", x: x + leftW + midW + gap * 2, y: topY, w: rightW, h: 268 },
    { tag: "D", title: "Marker evidence", x, y: lowerY, w: lowerLeftW, h: 214 },
    { tag: "E", title: "Assay / risk context", x: x + lowerLeftW + gap, y: lowerY, w: width - lowerLeftW - gap, h: 214 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: "#f8fafc",
      stroke: panel.tag === "E" ? "#fed7aa" : "#cbd5e1",
      strokeWidth: 1.25,
      depth: panel.tag === "E" ? "floating" : "raised"
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 22), {
      fontSize: 17,
      fontWeight: 950,
      color: panel.tag === "E" ? "#9a3412" : "#be185d"
    }));
    nodes.push(createTextNode(panel.title, createTransform(panel.x + 46, panel.y + 13, panel.w - 60, 20), {
      fontSize: 12.8,
      fontWeight: 850,
      color: "#334155"
    }));
  }
  const markerTable = {
    id: createId("table"),
    name: "Demo cellular marker evidence table",
    columns: ["marker", "state", "score"],
    rows: [
      { marker: "EPCAM", state: "tumor", score: 2.4 },
      { marker: "MKI67", state: "cycling", score: 2.1 },
      { marker: "PTPRC", state: "immune", score: 2.2 },
      { marker: "GZMB", state: "cytotoxic", score: 2.0 },
      { marker: "COL1A1", state: "stroma", score: 1.8 },
      { marker: "ISG15", state: "IFN", score: 2.3 }
    ],
    source
  };
  nodes.push(
    createTemplateRealisticImageNode({
      assetId: "realistic-organoid-texture",
      label: "Organoid texture",
      x: x + 24,
      y: topY + 50,
      width: leftW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-A`,
      semanticRole: "model-context",
      appearance: { colorWash: "#f472b6", colorWashOpacity: 0.08, contrast: 1.1 },
      crop: { x: 0, y: 0.01, zoom: 1.1, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-tumor-microenvironment",
      label: "Tumor microenvironment",
      x: x + leftW + gap + 24,
      y: topY + 50,
      width: midW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-B`,
      semanticRole: "cell-state",
      appearance: { colorWash: "#ef4444", colorWashOpacity: 0.08, contrast: 1.1 },
      crop: { x: 0.02, y: 0, zoom: 1.12, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-immune-infiltrate",
      label: "Immune infiltrate",
      x: x + leftW + midW + gap * 2 + 24,
      y: topY + 50,
      width: rightW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-C`,
      semanticRole: "microscopy-evidence",
      appearance: { colorWash: "#22c55e", colorWashOpacity: 0.07, contrast: 1.1 },
      crop: { x: -0.01, y: 0.01, zoom: 1.1, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createCuratedSymbolNode({
      assetId: "cell-tumor",
      label: "Tumor cell",
      x: x + leftW + gap + 38,
      y: topY + 206,
      width: 58,
      height: 44,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: "cell-state",
      layoutHint: `${template.id}:editable-tumor-cell`,
      labelVisible: false,
      style: { depth: "floating", stroke: "#ef4444", strokeWidth: 1.6 }
    }),
    createCuratedSymbolNode({
      assetId: "cell-t",
      label: "T cell",
      x: x + leftW + midW + gap * 2 + 38,
      y: topY + 206,
      width: 58,
      height: 44,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: "cell-state",
      layoutHint: `${template.id}:editable-t-cell`,
      labelVisible: false,
      style: { depth: "floating", stroke: "#22c55e", strokeWidth: 1.6 }
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "Marker score by cell state",
      table: markerTable,
      encodings: { x: "state", y: "marker", value: "score" }
    }, createTransform(x + 28, lowerY + 48, lowerLeftW - 230, 146)),
    createCuratedSymbolNode({
      assetId: "antibody",
      label: "Antibody marker",
      x: x + lowerLeftW - 176,
      y: lowerY + 66,
      width: 126,
      height: 104,
      styleProfile: input.styleProfile ?? "consulting-2p5d",
      semanticRole: "assay-context",
      layoutHint: `${template.id}:editable-antibody`
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-protein-gel",
      label: "Protein gel evidence",
      x: x + lowerLeftW + gap + 28,
      y: lowerY + 54,
      width: 142,
      height: 112,
      layoutHint: `${template.id}:protein-gel`,
      semanticRole: "data-evidence",
      appearance: { colorWash: "#334155", colorWashOpacity: 0.06, contrast: 1.08 },
      crop: { x: 0, y: 0, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-pathogen-particles",
      label: "Risk texture",
      x: x + lowerLeftW + gap + 186,
      y: lowerY + 54,
      width: 132,
      height: 112,
      layoutHint: `${template.id}:risk-context`,
      semanticRole: "risk-context",
      appearance: { colorWash: "#dc2626", colorWashOpacity: 0.08, contrast: 1.08 },
      crop: { x: 0, y: 0, zoom: 1.12, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createShapeNode("round-rect", "", createTransform(x + lowerLeftW + gap + 28, lowerY + 168, width - lowerLeftW - gap - 56, 34), {
      fill: "#fff7ed",
      stroke: "#fed7aa",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Review image source, marker context, and PPTX/DOCX fallbacks.", createTransform(x + lowerLeftW + gap + 44, lowerY + 177, width - lowerLeftW - gap - 88, 18), {
      fontSize: 11.4,
      fontWeight: 920,
      color: "#92400e"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSpaceRealisticContextTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const x = input.x ?? 54;
  const y = input.y ?? 58;
  const width = input.width ?? 1172;
  const gap = 24;
  const topY = y + 68;
  const leftW = 402;
  const midW = 346;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 292;
  const lowerLeftW = Math.round(width * 0.58);
  const styleProfile = input.styleProfile ?? "consulting-2p5d";
  const source = curatedProvenance("Synthetic space biology realistic context demo data generated by Scientific Image", "Scientific Image realistic space biology fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 44, width + 36, 646), {
      fill: "#ffffff",
      stroke: "#c7d2fe",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Space biology realistic context panel", createTransform(x, y - 30, 650, 32), {
      fontSize: 27,
      fontWeight: 920,
      color: "#0f172a"
    }),
    createTextNode("Mission imagery, biospecimen handling, flight assay, GeneLab-style data, and export/provenance QA.", createTransform(x + 610, y - 25, width - 610, 27), {
      fontSize: 13.2,
      fontWeight: 680,
      color: "#64748b"
    })
  ];
  const panels = [
    { tag: "A", title: "Mission context", x, y: topY, w: leftW, h: 268 },
    { tag: "B", title: "Crew sample", x: x + leftW + gap, y: topY, w: midW, h: 268 },
    { tag: "C", title: "Flight assay", x: x + leftW + midW + gap * 2, y: topY, w: rightW, h: 268 },
    { tag: "D", title: "Omics response", x, y: lowerY, w: lowerLeftW, h: 214 },
    { tag: "E", title: "GeneLab / review packet", x: x + lowerLeftW + gap, y: lowerY, w: width - lowerLeftW - gap, h: 214 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: "#f8fafc",
      stroke: panel.tag === "E" ? "#bae6fd" : "#cbd5e1",
      strokeWidth: 1.25,
      depth: panel.tag === "E" ? "floating" : "raised"
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 22), {
      fontSize: 17,
      fontWeight: 950,
      color: panel.tag === "E" ? "#0369a1" : "#3730a3"
    }));
    nodes.push(createTextNode(panel.title, createTransform(panel.x + 46, panel.y + 13, panel.w - 60, 20), {
      fontSize: 12.8,
      fontWeight: 850,
      color: "#334155"
    }));
  }
  const omicsTable = {
    id: createId("table"),
    name: "Demo space omics response table",
    columns: ["feature", "response", "system"],
    rows: [
      { feature: "DNA repair", response: 1.8, system: "stress" },
      { feature: "Mitochondria", response: 1.5, system: "metabolism" },
      { feature: "Immune", response: 1.2, system: "immune" },
      { feature: "Muscle", response: -1.1, system: "tissue" },
      { feature: "Bone", response: -0.9, system: "tissue" },
      { feature: "Circadian", response: 1.35, system: "regulation" }
    ],
    source
  };
  nodes.push(
    createTemplateRealisticImageNode({
      assetId: "realistic-spacecraft-context",
      label: "Spacecraft context",
      x: x + 24,
      y: topY + 50,
      width: leftW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-A`,
      semanticRole: "mission-context",
      appearance: { colorWash: "#2563eb", colorWashOpacity: 0.07, contrast: 1.1 },
      crop: { x: -0.01, y: 0, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createCuratedSymbolNode({
      assetId: "microgravity",
      label: "Microgravity",
      x: x + 38,
      y: topY + 204,
      width: 64,
      height: 48,
      styleProfile,
      semanticRole: "mission-context",
      layoutHint: `${template.id}:editable-microgravity`,
      labelVisible: false,
      style: { depth: "floating", stroke: "#2563eb", strokeWidth: 1.6 }
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-astronaut-sample",
      label: "Astronaut sample",
      x: x + leftW + gap + 24,
      y: topY + 50,
      width: midW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-B`,
      semanticRole: "input-sample",
      appearance: { colorWash: "#0ea5e9", colorWashOpacity: 0.07, contrast: 1.1 },
      crop: { x: 0.01, y: 0.02, zoom: 1.12, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createCuratedSymbolNode({
      assetId: "astronaut-sample",
      label: "Biospecimen",
      x: x + leftW + gap + 40,
      y: topY + 204,
      width: 64,
      height: 48,
      styleProfile,
      semanticRole: "input-sample",
      layoutHint: `${template.id}:editable-sample`,
      labelVisible: false,
      style: { depth: "floating", stroke: "#0ea5e9", strokeWidth: 1.6 }
    }),
    createConnectorNode([
      { x: x + leftW + gap - 12, y: topY + 143 },
      { x: x + leftW + gap + 24, y: topY + 143 }
    ], "", { stroke: "#2563eb", strokeWidth: 2.2 }),
    createTemplateRealisticImageNode({
      assetId: "realistic-spaceflight-assay",
      label: "Spaceflight assay",
      x: x + leftW + midW + gap * 2 + 24,
      y: topY + 50,
      width: rightW - 48,
      height: 186,
      layoutHint: `${template.id}:panel-C`,
      semanticRole: "omics-assay",
      appearance: { colorWash: "#7c3aed", colorWashOpacity: 0.08, contrast: 1.1 },
      crop: { x: 0, y: 0.01, zoom: 1.1, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createCuratedSymbolNode({
      assetId: "spaceflight-assay",
      label: "Flight assay",
      x: x + leftW + midW + gap * 2 + 40,
      y: topY + 204,
      width: 64,
      height: 48,
      styleProfile,
      semanticRole: "omics-assay",
      layoutHint: `${template.id}:editable-assay`,
      labelVisible: false,
      style: { depth: "floating", stroke: "#7c3aed", strokeWidth: 1.6 }
    }),
    createConnectorNode([
      { x: x + leftW + midW + gap * 2 - 12, y: topY + 143 },
      { x: x + leftW + midW + gap * 2 + 24, y: topY + 143 }
    ], "", { stroke: "#2563eb", strokeWidth: 2.2 }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Space omics response",
      table: omicsTable,
      encodings: { x: "feature", y: "response", color: "system" }
    }, createTransform(x + 28, lowerY + 48, lowerLeftW - 230, 146)),
    createCuratedSymbolNode({
      assetId: "dataset",
      label: "GeneLab dataset",
      x: x + lowerLeftW - 176,
      y: lowerY + 66,
      width: 126,
      height: 104,
      styleProfile,
      semanticRole: "data-evidence",
      layoutHint: `${template.id}:editable-dataset`
    }),
    createTemplateRealisticImageNode({
      assetId: "realistic-genelab-data-context",
      label: "GeneLab data context",
      x: x + lowerLeftW + gap + 28,
      y: lowerY + 54,
      width: 172,
      height: 112,
      layoutHint: `${template.id}:genelab-context`,
      semanticRole: "data-evidence",
      appearance: { colorWash: "#0891b2", colorWashOpacity: 0.07, contrast: 1.08 },
      crop: { x: 0, y: 0, zoom: 1.08, fit: "cover" },
      mask: { shape: "round-rect" }
    }),
    createShapeNode("round-rect", "", createTransform(x + lowerLeftW + gap + 224, lowerY + 54, width - lowerLeftW - gap - 252, 112), {
      fill: "#f0f9ff",
      stroke: "#bae6fd",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Review before export", createTransform(x + lowerLeftW + gap + 244, lowerY + 72, 210, 20), {
      fontSize: 14,
      fontWeight: 920,
      color: "#075985"
    }),
    createTextNode("Mission/sample source and image fallbacks.", createTransform(x + lowerLeftW + gap + 244, lowerY + 102, width - lowerLeftW - gap - 300, 44), {
      fontSize: 12,
      fontWeight: 720,
      color: "#0f172a"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createAiBiosecurityFlagshipTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 112;
  const width = input.width ?? 1064;
  const theme = flagshipStyleTheme(styleProfile, "risk");
  const source = curatedProvenance("Synthetic AI biosecurity flagship demo metrics generated by Scientific Image", "Scientific Image AI biosecurity workflow pack fixture");
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 18, y - 48, width + 36, 500), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    createTextNode("AI biosecurity evaluation pipeline", createTransform(x, y - 36, 560, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: theme.heading
    }),
    createTextNode("Benchmarks, classifier, permissioning, review, audit, escalation.", createTransform(x + 536, y - 32, width - 536, 26), {
      fontSize: 12,
      fontWeight: 650,
      color: theme.muted
    })
  ];
  const stages = [
    { assetId: "dataset", label: "Prompt/source set", slot: "data-evidence" },
    { assetId: "benchmark", label: "Benchmark suite", slot: "evaluation-evidence" },
    { assetId: "bio-classifier", label: "Bio classifier", slot: "model-checkpoint" },
    { assetId: "risk-gate", label: "Risk gate", slot: "risk-decision" },
    { assetId: "permission-tier", label: "Permission tier", slot: "risk-decision" },
    { assetId: "human-review", label: "Human review", slot: "risk-decision" }
  ];
  const stageGap = width / stages.length;
  stages.forEach((stage, index) => {
    const cardX = x + index * stageGap + 2;
    const cardY = y + 64;
    const isRisk = index >= 3;
    nodes.push(createShapeNode("round-rect", "", createTransform(cardX, cardY, 148, 150), {
      fill: isRisk ? theme.warningFill : theme.panelFill,
      stroke: isRisk ? theme.warningStroke : theme.panelStroke,
      strokeWidth: 1.3,
      depth: isRisk ? theme.floatingDepth : theme.panelDepth
    }));
    nodes.push(createCuratedSymbolNode({
      assetId: stage.assetId,
      label: stage.label,
      x: cardX + 14,
      y: cardY + 24,
      width: 120,
      height: 96,
      styleProfile: isRisk ? theme.riskSymbolProfile : styleProfile,
      ...(isRisk ? theme.riskSymbolAppearance : theme.symbolAppearance),
      labelVisible: false,
      semanticRole: stage.slot,
      layoutHint: `${template.id}:stage-${index + 1}`
    }));
    nodes.push(createTextNode(stage.label, createTransform(cardX + 10, cardY + 122, 128, 22), {
      fontSize: 11,
      fontWeight: 850,
      color: isRisk ? theme.warningText : theme.text
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: cardX - 24, y: cardY + 74 },
        { x: cardX + 2, y: cardY + 74 }
      ], "", { stroke: isRisk ? theme.warningText : theme.connector, strokeWidth: 2.5 }));
    }
  });
  const metricTable = {
    id: createId("table"),
    name: "Demo biosecurity evaluation metrics",
    columns: ["class", "score", "threshold", "split"],
    rows: [
      { class: "benign protocol", score: 0.12, threshold: 0.5, split: "test" },
      { class: "dual-use ambiguity", score: 0.61, threshold: 0.5, split: "test" },
      { class: "wetlab feasibility", score: 0.74, threshold: 0.5, split: "test" },
      { class: "DURC flag", score: 0.86, threshold: 0.5, split: "test" }
    ],
    source
  };
  nodes.push(
    createShapeNode("round-rect", "", createTransform(x, y + 260, Math.round(width * 0.42), 150), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.3,
      depth: theme.panelDepth
    }),
    createTextNode("Risk review outputs", createTransform(x + 20, y + 276, 220, 22), {
      fontSize: 15,
      fontWeight: 900,
      color: theme.text
    }),
    createCuratedSymbolNode({
      assetId: "durc-flag",
      label: "DURC flag",
      x: x + 22,
      y: y + 306,
      width: 118,
      height: 92,
      styleProfile: theme.riskSymbolProfile,
      ...theme.riskSymbolAppearance,
      semanticRole: "risk-decision",
      layoutHint: `${template.id}:review-durc`
    }),
    createCuratedSymbolNode({
      assetId: "audit-log",
      label: "Audit log",
      x: x + 154,
      y: y + 306,
      width: 118,
      height: 92,
      styleProfile,
      ...theme.symbolAppearance,
      semanticRole: "governance-record",
      layoutHint: `${template.id}:review-audit`
    }),
    createTextNode("Escalate ambiguous wetlab cases to expert review; retain audit trail.", createTransform(x + 292, y + 314, Math.round(width * 0.42) - 296, 58), {
      fontSize: 12,
      fontWeight: 750,
      color: theme.reviewText
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Risk score by class",
      table: metricTable,
      encodings: { x: "class", y: "score", color: "split" },
      style: theme.plotStyle
    }, createTransform(x + Math.round(width * 0.45), y + 260, Math.round(width * 0.28), 150)),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.76), y + 260, Math.round(width * 0.24), 150), {
      fill: theme.warningFill,
      stroke: theme.warningStroke,
      strokeWidth: 1.3,
      depth: theme.floatingDepth
    }),
    createCuratedSymbolNode({
      assetId: "domain-expert-review",
      label: "Expert review",
      x: x + Math.round(width * 0.77) + 14,
      y: y + 300,
      width: 116,
      height: 90,
      styleProfile: theme.riskSymbolProfile,
      ...theme.riskSymbolAppearance,
      semanticRole: "risk-decision",
      layoutHint: `${template.id}:expert-review`
    }),
    createTextNode("Queue: permission, refusal boundary, citation context.", createTransform(x + Math.round(width * 0.77) + 132, y + 312, Math.round(width * 0.24) - 148, 54), {
      fontSize: 12,
      fontWeight: 800,
      color: theme.warningText
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createPermissioningLadderTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 76;
  const y = input.y ?? 118;
  const width = input.width ?? 1056;
  const tierY = y + 72;
  const tierW = Math.round((width - 54) / 4);
  const tierGap = 18;
  const tiers = [
    { assetId: "permission-tier", tier: "Tier 0", title: "Open scientific help", note: "Benign educational or analysis request", fill: "#ecfeff", stroke: "#67e8f9", style: styleProfile, slot: "risk-decision" },
    { assetId: "risk-gate", tier: "Tier 1", title: "Context-limited", note: "Answer with source grounding and constraints", fill: "#f8fafc", stroke: "#cbd5e1", style: styleProfile, slot: "risk-decision" },
    { assetId: "human-review", tier: "Tier 2", title: "Human review", note: "Ambiguous dual-use or wetlab feasibility", fill: "#fff7ed", stroke: "#fed7aa", style: "risk-warning" as AssetStyleProfile, slot: "risk-decision" },
    { assetId: "escalation-path", tier: "Tier 3", title: "Escalate or block", note: "High-risk, DURC, or unsupported request", fill: "#fef2f2", stroke: "#fecaca", style: "risk-warning" as AssetStyleProfile, slot: "risk-decision" }
  ];
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 22, y - 48, width + 44, 474), {
      fill: "#ffffff",
      stroke: "#bfdbfe",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Permissioning ladder", createTransform(x, y - 36, 420, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: "#0f172a"
    }),
    createTextNode("Calibrated biological AI outputs with explicit tiers, review triggers, and auditable outcomes.", createTransform(x + 420, y - 32, width - 420, 26), {
      fontSize: 12,
      fontWeight: 650,
      color: "#64748b",
      align: "end"
    }),
    createShapeNode("round-rect", "", createTransform(x, y + 276, Math.round(width * 0.48), 116), {
      fill: "#f8fafc",
      stroke: "#cbd5e1",
      strokeWidth: 1.4,
      depth: "raised"
    }),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.52), y + 276, Math.round(width * 0.48), 116), {
      fill: "#fff7ed",
      stroke: "#fed7aa",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Release path", createTransform(x + 20, y + 294, 160, 24), {
      fontSize: 15,
      fontWeight: 900,
      color: "#0f172a"
    }),
    createTextNode("Allowed answers keep citations, uncertainty, and scope constraints attached to the exported scene.", createTransform(x + 20, y + 324, Math.round(width * 0.48) - 176, 44), {
      fontSize: 12,
      fontWeight: 720,
      color: "#475569"
    }),
    createCuratedSymbolNode({
      assetId: "approval-stamp",
      label: "Approved",
      x: x + Math.round(width * 0.48) - 140,
      y: y + 302,
      width: 112,
      height: 84,
      styleProfile,
      semanticRole: "output",
      layoutHint: `${template.id}:approved-outcome`
    }),
    createTextNode("Escalation path", createTransform(x + Math.round(width * 0.52) + 20, y + 294, 170, 24), {
      fontSize: 15,
      fontWeight: 900,
      color: "#9a3412"
    }),
    createTextNode("If provenance, policy, or reviewer confidence is insufficient, block the output and preserve rationale.", createTransform(x + Math.round(width * 0.52) + 20, y + 324, Math.round(width * 0.48) - 176, 44), {
      fontSize: 12,
      fontWeight: 750,
      color: "#7c2d12"
    }),
    createCuratedSymbolNode({
      assetId: "blocked-output",
      label: "Blocked",
      x: x + width - 142,
      y: y + 302,
      width: 112,
      height: 84,
      styleProfile: "risk-warning",
      semanticRole: "risk-decision",
      layoutHint: `${template.id}:blocked-outcome`
    })
  ];
  tiers.forEach((tier, index) => {
    const cardX = x + index * (tierW + tierGap);
    const isRisk = tier.style === "risk-warning";
    nodes.push(createShapeNode("round-rect", "", createTransform(cardX, tierY, tierW, 158), {
      fill: tier.fill,
      stroke: tier.stroke,
      strokeWidth: 1.35,
      depth: isRisk ? "floating" : "raised"
    }));
    nodes.push(createTextNode(tier.tier, createTransform(cardX + 14, tierY + 12, 72, 18), {
      fontSize: 11,
      fontWeight: 950,
      color: isRisk ? "#9a3412" : "#0369a1"
    }));
    nodes.push(createCuratedSymbolNode({
      assetId: tier.assetId,
      label: tier.title,
      x: cardX + Math.round((tierW - 116) / 2),
      y: tierY + 32,
      width: 116,
      height: 88,
      styleProfile: tier.style,
      semanticRole: tier.slot,
      layoutHint: `${template.id}:tier-${index}`
    }));
    nodes.push(createTextNode(tier.title, createTransform(cardX + 12, tierY + 122, tierW - 24, 18), {
      fontSize: 11,
      fontWeight: 900,
      color: isRisk ? "#9a3412" : "#334155"
    }));
    nodes.push(createTextNode(tier.note, createTransform(cardX + 12, tierY + 140, tierW - 24, 18), {
      fontSize: 9.4,
      fontWeight: 700,
      color: "#64748b"
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: cardX - tierGap + tierW + 4, y: tierY + 78 },
        { x: cardX - 5, y: tierY + 78 }
      ], "", { stroke: isRisk ? "#dc2626" : "#2563eb", strokeWidth: 2.5 }));
    }
  });
  nodes.push(
    createConnectorNode([
      { x: x + tierW + Math.round(tierGap * 0.5), y: tierY + 158 },
      { x: x + 142, y: y + 304 }
    ], "release path", { stroke: "#2563eb", strokeWidth: 2.2, lineStyle: "dashed" }),
    createConnectorNode([
      { x: x + 3 * (tierW + tierGap) + Math.round(tierW * 0.72), y: tierY + 158 },
      { x: x + Math.round(width * 0.52) + 24, y: y + 336 }
    ], "escalation path", { stroke: "#dc2626", strokeWidth: 2.4, lineStyle: "dashed" }),
    createTextNode("QA: Permission states, escalation triggers, and approval/block outcomes are explicit before export.", createTransform(x + 20, y + 404, width - 40, 24), {
      fontSize: 12,
      fontWeight: 800,
      color: "#7c2d12"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createBenchmarkDashboardTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 72;
  const y = input.y ?? 108;
  const width = input.width ?? 1064;
  const panelGap = 22;
  const leftW = 332;
  const midW = 338;
  const rightW = width - leftW - midW - panelGap * 2;
  const topY = y + 68;
  const bottomY = y + 300;
  const source = curatedProvenance("Synthetic biosecurity benchmark dashboard generated by Scientific Image", "Scientific Image AI biosecurity benchmark fixture");
  const calibrationTable = {
    id: createId("table"),
    name: "Demo calibration table",
    columns: ["bin", "confidence", "observed", "split"],
    rows: [
      { bin: "0.1", confidence: 0.12, observed: 0.09, split: "eval" },
      { bin: "0.3", confidence: 0.31, observed: 0.27, split: "eval" },
      { bin: "0.5", confidence: 0.52, observed: 0.48, split: "eval" },
      { bin: "0.7", confidence: 0.71, observed: 0.76, split: "eval" },
      { bin: "0.9", confidence: 0.89, observed: 0.92, split: "eval" }
    ],
    source
  };
  const failureTable = {
    id: createId("table"),
    name: "Demo benchmark failure modes",
    columns: ["mode", "count", "severity"],
    rows: [
      { mode: "ambiguous intent", count: 18, severity: "medium" },
      { mode: "missing context", count: 12, severity: "low" },
      { mode: "wetlab feasibility", count: 9, severity: "high" },
      { mode: "policy conflict", count: 6, severity: "high" }
    ],
    source
  };
  const text = (value: string, transform: Transform, style: Style = {}, align: "start" | "middle" | "end" = "middle"): SceneNode => {
    const node = createTextNode(value, transform, style);
    return { ...node, payload: { ...(node.payload as Record<string, unknown>), align } } as SceneNode;
  };
  const symbol = (
    assetId: string,
    label: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    semanticRole: string,
    layoutHint: string,
    profile: AssetStyleProfile = styleProfile,
    accent?: string
  ): SceneNode => createCuratedSymbolNode({
    assetId,
    label,
    x: sx,
    y: sy,
    width: sw,
    height: sh,
    styleProfile: profile,
    semanticRole,
    layoutHint: `${template.id}:${layoutHint}`,
    accent,
    stroke: accent,
    style: { fontSize: 11.2, depth: "floating" }
  });
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 22, y - 52, width + 44, 552), {
      fill: "#ffffff",
      stroke: "#bfdbfe",
      strokeWidth: 2,
      depth: "hero"
    }),
    text("AI biosecurity benchmark review", createTransform(x, y - 38, 520, 34), {
      fontSize: 24,
      fontWeight: 920,
      color: "#0f172a"
    }, "start"),
    text("Evidence, classifier behavior, and human-governance handoff in one editable figure.", createTransform(x + 528, y - 34, width - 528, 30), {
      fontSize: 12.4,
      fontWeight: 650,
      color: "#64748b"
    }, "end")
  ];
  const metrics = [
    ["AUROC", "0.91", "#e0f2fe", "#0284c7"],
    ["High-risk recall", "0.84", "#dcfce7", "#16a34a"],
    ["Calibration ECE", "0.07", "#fef3c7", "#d97706"],
    ["Review load", "12%", "#fee2e2", "#dc2626"]
  ];
  metrics.forEach(([label, value, fill, stroke], index) => {
    const cardW = Math.round((width - 42) / 4);
    const cardX = x + index * (cardW + 14);
    nodes.push(createShapeNode("round-rect", "", createTransform(cardX, y + 18, cardW, 48), {
      fill,
      stroke,
      strokeWidth: 1.15,
      depth: index >= 2 ? "floating" : "raised"
    }));
    nodes.push(text(String(value), createTransform(cardX + 16, y + 28, 78, 20), {
      fontSize: 18,
      fontWeight: 920,
      color: String(stroke)
    }, "start"));
    nodes.push(text(String(label), createTransform(cardX + 96, y + 31, cardW - 110, 18), {
      fontSize: 10.4,
      fontWeight: 780,
      color: "#334155"
    }, "end"));
  });

  const mainY = y + 92;
  const mainH = 220;
  const bottomY2 = y + 336;
  const bottomH = 148;
  const gap = 24;
  const evidenceW = 330;
  const modelW = 360;
  const reviewW = width - evidenceW - modelW - gap * 2;
  const evidenceX = x;
  const modelX = evidenceX + evidenceW + gap;
  const reviewX = modelX + modelW + gap;
  const addPanel = (tag: string, label: string, px: number, py: number, pw: number, ph: number, fill = "#f8fafc", stroke = "#cbd5e1", tone = "#0f172a"): void => {
    nodes.push(createShapeNode("round-rect", "", createTransform(px, py, pw, ph), {
      fill,
      stroke,
      strokeWidth: 1.35,
      depth: tag === "C" ? "floating" : "raised"
    }));
    nodes.push(createShapeNode("round-rect", "", createTransform(px + 16, py + 14, 28, 22), {
      fill: "#ffffff",
      stroke,
      strokeWidth: 1,
      depth: "surface"
    }));
    nodes.push(text(tag, createTransform(px + 16, py + 17, 28, 16), {
      fontSize: 12,
      fontWeight: 900,
      color: tone
    }, "middle"));
    nodes.push(text(label, createTransform(px + 52, py + 15, pw - 72, 20), {
      fontSize: 12.8,
      fontWeight: 820,
      color: tone
    }, "start"));
  };
  addPanel("A", "Evidence package", evidenceX, mainY, evidenceW, mainH, "#f8fafc", "#bae6fd", "#075985");
  addPanel("B", "Classifier behavior", modelX, mainY, modelW, mainH, "#f0f9ff", "#bfdbfe", "#1d4ed8");
  addPanel("C", "Risk review handoff", reviewX, mainY, reviewW, mainH, "#fff7ed", "#fed7aa", "#9a3412");
  addPanel("D", "Failure modes by severity", x, bottomY2, Math.round(width * 0.61), bottomH, "#f8fafc", "#cbd5e1", "#334155");
  addPanel("E", "Decision packet before export", x + Math.round(width * 0.61) + gap, bottomY2, width - Math.round(width * 0.61) - gap, bottomH, "#fffbeb", "#fcd34d", "#92400e");

  nodes.push(
    createConnectorNode([{ x: evidenceX + evidenceW + 6, y: mainY + 113 }, { x: modelX - 8, y: mainY + 113 }], "", {
      stroke: "#2563eb",
      strokeWidth: 2.2,
      arrowEnd: true
    }),
    createConnectorNode([{ x: modelX + modelW + 6, y: mainY + 113 }, { x: reviewX - 8, y: mainY + 113 }], "", {
      stroke: "#f97316",
      strokeWidth: 2.2,
      arrowEnd: true
    }),
    symbol("benchmark", "Benchmark", evidenceX + 28, mainY + 60, 126, 104, "evaluation-evidence", "benchmark"),
    symbol("dataset", "Eval set", evidenceX + 176, mainY + 62, 118, 100, "data-evidence", "dataset"),
    text("Protocol QA, wetlab feasibility, and policy-context cases remain source linked.", createTransform(evidenceX + 26, mainY + 166, evidenceW - 52, 38), {
      fontSize: 11.2,
      fontWeight: 680,
      color: "#475569"
    }, "start"),
    symbol("bio-classifier", "Classifier", modelX + 26, mainY + 52, 138, 110, "model-checkpoint", "classifier"),
    symbol("metric-card", "Metric card", modelX + 206, mainY + 56, 118, 96, "evaluation-evidence", "metric-card"),
    createPlotNode({
      id: createId("plot"),
      plotType: "line",
      title: "Calibration curve",
      table: calibrationTable,
      encodings: { x: "confidence", y: "observed", color: "split" }
    }, createTransform(modelX + 28, mainY + 144, modelW - 56, 62)),
    symbol("risk-gate", "Risk gate", reviewX + 24, mainY + 54, 104, 94, "risk-decision", "risk-gate", "risk-warning", "#f97316"),
    symbol("error-analysis", "Failure map", reviewX + 138, mainY + 54, 104, 94, "evaluation-evidence", "error-analysis"),
    symbol("human-review", "Human review", reviewX + 252, mainY + 54, 108, 94, "risk-decision", "human-review", "risk-warning", "#dc2626"),
    text("Route high-severity and ambiguous-intent cases to expert review; retain audit trail.", createTransform(reviewX + 28, mainY + 158, reviewW - 56, 38), {
      fontSize: 11.2,
      fontWeight: 720,
      color: "#7c2d12"
    }, "start"),
    createPlotNode({
      id: createId("plot"),
      plotType: "bar",
      title: "Failure modes",
      table: failureTable,
      encodings: { x: "mode", y: "count", color: "severity" }
    }, createTransform(x + 28, bottomY2 + 48, Math.round(width * 0.61) - 56, 84)),
    symbol("audit-log", "Audit log", x + Math.round(width * 0.61) + gap + 28, bottomY2 + 46, 106, 86, "governance-record", "audit-log"),
    text("Export QA checks", createTransform(x + Math.round(width * 0.61) + gap + 154, bottomY2 + 48, 230, 20), {
      fontSize: 12,
      fontWeight: 850,
      color: "#92400e"
    }, "start"),
    createShapeNode("ellipse", "", createTransform(x + Math.round(width * 0.61) + gap + 154, bottomY2 + 78, 10, 10), {
      fill: "#dcfce7",
      stroke: "#16a34a",
      strokeWidth: 1,
      depth: "surface"
    }),
    text("Source citations attached", createTransform(x + Math.round(width * 0.61) + gap + 170, bottomY2 + 73, 240, 18), {
      fontSize: 10.8,
      fontWeight: 700,
      color: "#475569"
    }, "start"),
    createShapeNode("ellipse", "", createTransform(x + Math.round(width * 0.61) + gap + 154, bottomY2 + 98, 10, 10), {
      fill: "#dbeafe",
      stroke: "#2563eb",
      strokeWidth: 1,
      depth: "surface"
    }),
    text("PPTX fallbacks named", createTransform(x + Math.round(width * 0.61) + gap + 170, bottomY2 + 93, 240, 18), {
      fontSize: 10.8,
      fontWeight: 700,
      color: "#475569"
    }, "start"),
    createShapeNode("ellipse", "", createTransform(x + Math.round(width * 0.61) + gap + 154, bottomY2 + 118, 10, 10), {
      fill: "#fee2e2",
      stroke: "#dc2626",
      strokeWidth: 1,
      depth: "surface"
    }),
    text("Unsupported claims resolved", createTransform(x + Math.round(width * 0.61) + gap + 170, bottomY2 + 113, 240, 18), {
      fontSize: 10.8,
      fontWeight: 700,
      color: "#475569"
    }, "start")
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createReviewAuditFlowTemplateNodes(template: WorkflowTemplate, input: {
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? template.recommendedStyleProfile;
  const x = input.x ?? 78;
  const y = input.y ?? 118;
  const width = input.width ?? 1052;
  const topY = y + 62;
  const stageW = 158;
  const stageGap = Math.round((width - stageW * 5) / 4);
  const stageAssets = [
    { assetId: "review-queue", label: "Review queue", slot: "input-sample", note: "Cases needing human triage" },
    { assetId: "human-review", label: "Human reviewer", slot: "risk-decision", note: "Policy and context check" },
    { assetId: "domain-expert-review", label: "Domain expert", slot: "risk-decision", note: "Wetlab feasibility review" },
    { assetId: "audit-log", label: "Audit ledger", slot: "governance-record", note: "Traceable decision history" },
    { assetId: "approval-stamp", label: "Approved output", slot: "output", note: "Allowed with provenance" }
  ];
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 22, y - 48, width + 44, 474), {
      fill: "#ffffff",
      stroke: "#fed7aa",
      strokeWidth: 2,
      depth: "hero"
    }),
    createTextNode("Review and audit flow", createTransform(x, y - 36, 480, 30), {
      fontSize: 23,
      fontWeight: 900,
      color: "#0f172a"
    }),
    createTextNode("Human accountability, expert escalation, audit trail, and explicit approval/block outcomes.", createTransform(x + 480, y - 32, width - 480, 26), {
      fontSize: 12,
      fontWeight: 650,
      color: "#64748b",
      align: "end"
    }),
    createShapeNode("round-rect", "", createTransform(x, y + 258, Math.round(width * 0.54), 122), {
      fill: "#f8fafc",
      stroke: "#cbd5e1",
      strokeWidth: 1.4,
      depth: "raised"
    }),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.57), y + 258, Math.round(width * 0.43), 122), {
      fill: "#fff7ed",
      stroke: "#fed7aa",
      strokeWidth: 1.4,
      depth: "floating"
    }),
    createTextNode("Audit package", createTransform(x + 22, y + 276, 180, 24), {
      fontSize: 15,
      fontWeight: 900,
      color: "#0f172a"
    }),
    createTextNode("Retain source snippets, reviewer rationale, policy tier, timestamp, and export warnings as structured scene metadata.", createTransform(x + 22, y + 306, Math.round(width * 0.54) - 44, 44), {
      fontSize: 12,
      fontWeight: 700,
      color: "#475569"
    }),
    createTextNode("Blocked outcome path", createTransform(x + Math.round(width * 0.57) + 20, y + 276, 210, 24), {
      fontSize: 15,
      fontWeight: 900,
      color: "#9a3412"
    }),
    createTextNode("If the reviewer cannot justify release, route to refusal boundary and keep the blocked decision auditable.", createTransform(x + Math.round(width * 0.57) + 20, y + 306, Math.round(width * 0.43) - 184, 48), {
      fontSize: 12,
      fontWeight: 750,
      color: "#7c2d12"
    }),
    createCuratedSymbolNode({
      assetId: "blocked-output",
      label: "Blocked output",
      x: x + Math.round(width * 0.57) + Math.round(width * 0.43) - 150,
      y: y + 286,
      width: 118,
      height: 88,
      styleProfile: "risk-warning",
      semanticRole: "risk-decision",
      layoutHint: `${template.id}:blocked-outcome`
    })
  ];
  stageAssets.forEach((stage, index) => {
    const cardX = x + index * (stageW + stageGap);
    const isRisk = index >= 1 && index <= 2;
    const isOutcome = index === stageAssets.length - 1;
    nodes.push(createShapeNode("round-rect", "", createTransform(cardX, topY, stageW, 158), {
      fill: isRisk || isOutcome ? "#fff7ed" : "#f8fafc",
      stroke: isRisk || isOutcome ? "#fed7aa" : "#cbd5e1",
      strokeWidth: 1.35,
      depth: isOutcome ? "floating" : "raised"
    }));
    nodes.push(createCuratedSymbolNode({
      assetId: stage.assetId,
      label: stage.label,
      x: cardX + 18,
      y: topY + 24,
      width: 122,
      height: 94,
      styleProfile: isRisk || isOutcome ? "risk-warning" : styleProfile,
      semanticRole: stage.slot,
      layoutHint: `${template.id}:stage-${index + 1}`
    }));
    nodes.push(createTextNode(stage.label, createTransform(cardX + 10, topY + 120, stageW - 20, 18), {
      fontSize: 11,
      fontWeight: 900,
      color: isRisk || isOutcome ? "#9a3412" : "#334155"
    }));
    nodes.push(createTextNode(stage.note, createTransform(cardX + 12, topY + 138, stageW - 24, 18), {
      fontSize: 9.5,
      fontWeight: 700,
      color: "#64748b"
    }));
    if (index > 0) {
      nodes.push(createConnectorNode([
        { x: cardX - stageGap + stageW + 4, y: topY + 78 },
        { x: cardX - 4, y: topY + 78 }
      ], "", { stroke: isRisk || isOutcome ? "#dc2626" : "#2563eb", strokeWidth: 2.5 }));
    }
  });
  nodes.push(
    createConnectorNode([
      { x: x + 3 * (stageW + stageGap) + Math.round(stageW * 0.72), y: topY + 158 },
      { x: x + Math.round(width * 0.57) + 24, y: y + 319 }
    ], "block path", { stroke: "#dc2626", strokeWidth: 2.4, lineStyle: "dashed" }),
    createConnectorNode([
      { x: x + 3 * (stageW + stageGap) + Math.round(stageW * 0.5), y: topY + 158 },
      { x: x + 176, y: y + 278 }
    ], "audit package", { stroke: "#2563eb", strokeWidth: 2.2, lineStyle: "dashed" }),
    createTextNode("QA: Review responsibilities, audit trail, and approval/block branches must remain visible before PPTX/PDF export.", createTransform(x + 20, y + 396, width - 40, 24), {
      fontSize: 12,
      fontWeight: 800,
      color: "#7c2d12"
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createPublicationResultsPanelNodes(input: {
  workflowPack: string;
  templateId?: string;
  styleProfile?: AssetStyleProfile;
  x?: number;
  y?: number;
  width?: number;
  stepCount?: number;
}): SceneNode[] {
  const styleProfile = input.styleProfile ?? "consulting-2p5d";
  const x = input.x ?? 74;
  const y = input.y ?? 112;
  const width = input.width ?? 1060;
  const panelGap = 24;
  const leftWidth = Math.round(width * 0.36);
  const midWidth = Math.round(width * 0.31);
  const rightWidth = width - leftWidth - midWidth - panelGap * 2;
  const isPublicationLine = styleProfile === "publication-line";
  const isDarkTalk = styleProfile === "dark-talk";
  const theme = {
    outerFill: isDarkTalk ? "#020617" : "#ffffff",
    outerStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#334155" : "#dbeafe",
    panelFill: isDarkTalk ? "#0f172a" : "#f8fafc",
    panelStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#334155" : "#cbd5e1",
    plotFill: isDarkTalk ? "#111827" : "#ffffff",
    plotStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#475569" : "#cbd5e1",
    text: isDarkTalk ? "#e2e8f0" : "#0f172a",
    heading: isDarkTalk ? "#f8fafc" : "#0f172a",
    muted: isDarkTalk ? "#94a3b8" : "#64748b",
    panelText: isDarkTalk ? "#cbd5e1" : "#334155",
    connector: isPublicationLine ? "#111827" : isDarkTalk ? "#94a3b8" : "#64748b",
    claimFill: isDarkTalk ? "#431407" : isPublicationLine ? "#ffffff" : "#fff7ed",
    claimStroke: isDarkTalk ? "#f97316" : isPublicationLine ? "#111827" : "#fed7aa",
    claimText: isDarkTalk ? "#fed7aa" : isPublicationLine ? "#111827" : "#7c2d12",
    reviewText: isDarkTalk ? "#fdba74" : isPublicationLine ? "#374151" : "#9a3412",
    depth: isPublicationLine ? "surface" as const : "raised" as const,
    outerDepth: isPublicationLine ? "surface" as const : "hero" as const
  };
  const plotStyle = {
    fill: theme.plotFill,
    stroke: theme.plotStroke,
    color: theme.text,
    depth: isPublicationLine ? "surface" as const : "raised" as const
  };
  const symbolAppearance = isPublicationLine
    ? { accent: "#111827", stroke: "#111827", secondary: "#f3f4f6", fill: "#ffffff", labelColor: theme.heading, strokeWidth: 1.6 }
    : isDarkTalk
      ? { accent: "#38bdf8", stroke: "#7dd3fc", secondary: "#1e293b", fill: "#0f172a", labelColor: theme.heading, strokeWidth: 2.2 }
      : {};
  const demoSource = curatedProvenance(
    "Synthetic publication-results demo data generated by Scientific Image",
    "Scientific Image premium workflow pack fixture"
  );
  const volcanoTable = {
    id: createId("table"),
    name: "Demo differential expression table",
    columns: ["gene", "log2FC", "pValue", "cellState"],
    rows: [
      { gene: "STAT1", log2FC: 2.4, pValue: 0.00000008, cellState: "IFN-high" },
      { gene: "CXCL10", log2FC: 2.1, pValue: 0.0000004, cellState: "IFN-high" },
      { gene: "MKI67", log2FC: -1.7, pValue: 0.000006, cellState: "cycling" },
      { gene: "IL7R", log2FC: -1.2, pValue: 0.00005, cellState: "memory" },
      { gene: "GZMB", log2FC: 1.5, pValue: 0.000016, cellState: "cytotoxic" },
      { gene: "CCR7", log2FC: -0.9, pValue: 0.0008, cellState: "naive" },
      { gene: "ISG15", log2FC: 1.8, pValue: 0.000002, cellState: "IFN-high" },
      { gene: "NKG7", log2FC: 1.1, pValue: 0.00016, cellState: "cytotoxic" }
    ],
    source: demoSource
  };
  const embeddingTable = {
    id: createId("table"),
    name: "Demo embedding table",
    columns: ["cell", "umap1", "umap2", "cluster"],
    rows: [
      { cell: "c1", umap1: -2.4, umap2: 1.6, cluster: "T cell" },
      { cell: "c2", umap1: -1.9, umap2: 1.2, cluster: "T cell" },
      { cell: "c3", umap1: -1.4, umap2: 1.8, cluster: "T cell" },
      { cell: "c4", umap1: -0.9, umap2: 0.9, cluster: "T cell" },
      { cell: "c5", umap1: 1.2, umap2: -0.1, cluster: "Tumor" },
      { cell: "c6", umap1: 1.8, umap2: -0.4, cluster: "Tumor" },
      { cell: "c7", umap1: 2.4, umap2: 0.2, cluster: "Tumor" },
      { cell: "c8", umap1: 1.6, umap2: 0.8, cluster: "Tumor" },
      { cell: "c9", umap1: -0.2, umap2: -1.4, cluster: "Myeloid" },
      { cell: "c10", umap1: 0.5, umap2: -1.9, cluster: "Myeloid" },
      { cell: "c11", umap1: 1.0, umap2: -1.5, cluster: "Myeloid" },
      { cell: "c12", umap1: 0.1, umap2: -2.2, cluster: "Myeloid" },
      { cell: "c13", umap1: -0.1, umap2: 0.7, cluster: "IFN-high" },
      { cell: "c14", umap1: 0.5, umap2: 0.9, cluster: "IFN-high" },
      { cell: "c15", umap1: 0.2, umap2: 1.4, cluster: "IFN-high" },
      { cell: "c16", umap1: 0.9, umap2: 0.5, cluster: "IFN-high" }
    ],
    source: demoSource
  };
  const heatmapTable = {
    id: createId("table"),
    name: "Demo marker heatmap",
    columns: ["gene", "cluster", "scaledExpression"],
    rows: [
      { gene: "STAT1", cluster: "IFN-high", scaledExpression: 2.2 },
      { gene: "STAT1", cluster: "Tumor", scaledExpression: 0.7 },
      { gene: "CXCL10", cluster: "IFN-high", scaledExpression: 2.5 },
      { gene: "CXCL10", cluster: "Myeloid", scaledExpression: 1.2 },
      { gene: "MKI67", cluster: "Cycling", scaledExpression: 2.0 },
      { gene: "GZMB", cluster: "Cytotoxic", scaledExpression: 2.3 },
      { gene: "IL7R", cluster: "Memory", scaledExpression: 1.8 },
      { gene: "CCR7", cluster: "Naive", scaledExpression: 1.7 }
    ],
    source: demoSource
  };
  const nodes: SceneNode[] = [
    createShapeNode("round-rect", "", createTransform(x - 20, y - 48, width + 40, 560), {
      fill: theme.outerFill,
      stroke: theme.outerStroke,
      strokeWidth: 2,
      depth: theme.outerDepth
    }),
    createTextNode("Publication-style results figure", createTransform(x, y - 34, 520, 32), {
      fontSize: 22,
      fontWeight: 800,
      color: theme.heading
    }),
    createTextNode("Editable PlotSpec panels, source-linked evidence, and export QA.", createTransform(x + 540, y - 29, 500, 28), {
      fontSize: 13,
      fontWeight: 650,
      color: theme.muted
    })
  ];
  const panels = [
    { tag: "A", label: "Experimental context", x, y, w: leftWidth, h: 210 },
    { tag: "B", label: "Differential response", x: x + leftWidth + panelGap, y, w: midWidth, h: 210 },
    { tag: "C", label: "Cell-state map", x: x + leftWidth + midWidth + panelGap * 2, y, w: rightWidth, h: 210 },
    { tag: "D", label: "Marker program summary", x, y: y + 246, w: Math.round(width * 0.58), h: 220 },
    { tag: "E", label: "Claim, evidence, and export QA", x: x + Math.round(width * 0.58) + panelGap, y: y + 246, w: width - Math.round(width * 0.58) - panelGap, h: 220 }
  ];
  for (const panel of panels) {
    nodes.push(createShapeNode("round-rect", "", createTransform(panel.x, panel.y, panel.w, panel.h), {
      fill: theme.panelFill,
      stroke: theme.panelStroke,
      strokeWidth: 1.4,
      depth: theme.depth
    }));
    nodes.push(createTextNode(panel.tag, createTransform(panel.x + 14, panel.y + 12, 24, 24), {
      fontSize: 18,
      fontWeight: 900,
      color: theme.heading
    }));
    nodes.push(createTextNode(panel.label, createTransform(panel.x + 45, panel.y + 14, panel.w - 70, 22), {
      fontSize: 13,
      fontWeight: 800,
      color: theme.panelText
    }));
  }
  nodes.push(
    createCuratedSymbolNode({
      assetId: "cell-tumor",
      label: "Tumor cells",
      x: x + 22,
      y: y + 58,
      width: 108,
      height: 90,
      styleProfile,
      ...symbolAppearance,
      semanticRole: "input-sample",
      layoutHint: "publication-results-panels:panel-A"
    }),
    createCuratedSymbolNode({
      assetId: "cell-immune",
      label: "Immune cells",
      x: x + 142,
      y: y + 58,
      width: 108,
      height: 90,
      styleProfile,
      ...symbolAppearance,
      semanticRole: "cell-state",
      layoutHint: "publication-results-panels:panel-A"
    }),
    createCuratedSymbolNode({
      assetId: "sequencer",
      label: "Sequencing",
      x: x + 260,
      y: y + 58,
      width: 108,
      height: 90,
      styleProfile,
      ...symbolAppearance,
      semanticRole: "data-evidence",
      layoutHint: "publication-results-panels:panel-A"
    }),
    createPlotNode({
      id: createId("plot"),
      plotType: "volcano",
      title: "Hit genes",
      table: volcanoTable,
      encodings: { x: "log2FC", y: "pValue", color: "cellState", label: "gene" },
      style: plotStyle
    }, createTransform(x + leftWidth + panelGap + 26, y + 48, midWidth - 52, 142)),
    createPlotNode({
      id: createId("plot"),
      plotType: "embedding-scatter",
      title: "Cell states",
      table: embeddingTable,
      encodings: { x: "umap1", y: "umap2", color: "cluster", label: "cell" },
      style: plotStyle
    }, createTransform(x + leftWidth + midWidth + panelGap * 2 + 24, y + 48, rightWidth - 48, 142)),
    createPlotNode({
      id: createId("plot"),
      plotType: "heatmap",
      title: "Marker programs",
      table: heatmapTable,
      encodings: { x: "cluster", y: "gene", value: "scaledExpression" },
      style: plotStyle
    }, createTransform(x + 28, y + 300, Math.round(width * 0.58) - 56, 144)),
    createCuratedSymbolNode({
      assetId: "metric-card",
      label: "Effect size",
      x: x + Math.round(width * 0.58) + panelGap + 36,
      y: y + 292,
      width: 132,
      height: 104,
      styleProfile,
      ...symbolAppearance,
      semanticRole: "evaluation-evidence",
      layoutHint: "publication-results-panels:panel-E"
    }),
    createCuratedSymbolNode({
      assetId: "gene-locus",
      label: "STAT1 locus",
      x: x + Math.round(width * 0.58) + panelGap + 196,
      y: y + 292,
      width: 132,
      height: 104,
      styleProfile,
      ...symbolAppearance,
      semanticRole: "data-evidence",
      layoutHint: "publication-results-panels:panel-E"
    }),
    createShapeNode("round-rect", "", createTransform(x + Math.round(width * 0.58) + panelGap + 30, y + 410, width - Math.round(width * 0.58) - panelGap - 60, 66), {
      fill: theme.claimFill,
      stroke: theme.claimStroke,
      strokeWidth: 1.2,
      depth: "surface"
    }),
    createTextNode("Claim: IFN-high program shift; verify table, citation, and threshold before export.", createTransform(x + Math.round(width * 0.58) + panelGap + 48, y + 422, width - Math.round(width * 0.58) - panelGap - 96, 34), {
      fontSize: 12.4,
      fontWeight: 760,
      color: theme.claimText
    }),
    createTextNode("Source table + PPTX fallback review required", createTransform(x + Math.round(width * 0.58) + panelGap + 48, y + 454, width - Math.round(width * 0.58) - panelGap - 96, 16), {
      fontSize: 9.6,
      fontWeight: 800,
      color: theme.reviewText
    })
  );
  const connectors = [
    createConnectorNode([{ x: x + 250, y: y + 108 }, { x: x + 260, y: y + 108 }], "", { stroke: theme.connector, strokeWidth: 2 }),
    createConnectorNode([{ x: x + 368, y: y + 108 }, { x: x + leftWidth + panelGap + 26, y: y + 118 }], "", { stroke: theme.connector, strokeWidth: 2.2 })
  ];
  nodes.push(...connectors);
  nodes.push(
    createTextNode("+", createTransform(x + 128, y + 96, 16, 20), {
      fontSize: 16,
      fontWeight: 900,
      color: theme.muted
    }),
    createTextNode("co-profiled sample", createTransform(x + 80, y + 166, 210, 18), {
      fontSize: 10.4,
      fontWeight: 760,
      color: theme.muted
    })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function normalizeSymbolAppearance(input: {
  appearance?: SymbolAppearance;
  accent?: string;
  secondary?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  labelColor?: string;
  labelVisible?: boolean;
  styleProfile?: AssetStyleProfile;
  detailLevel?: AssetDetailLevel;
}): SymbolAppearance {
  const merged = {
    ...(input.appearance ?? {}),
    accent: input.accent ?? input.appearance?.accent,
    secondary: input.secondary ?? input.appearance?.secondary,
    fill: input.fill ?? input.appearance?.fill,
    stroke: input.stroke ?? input.appearance?.stroke,
    strokeWidth: input.strokeWidth ?? input.appearance?.strokeWidth,
    labelColor: input.labelColor ?? input.appearance?.labelColor,
    labelVisible: input.labelVisible ?? input.appearance?.labelVisible,
    styleProfile: input.styleProfile ?? input.appearance?.styleProfile,
    detailLevel: input.detailLevel ?? input.appearance?.detailLevel
  };
  return Object.fromEntries(Object.entries(merged).filter(([, value]) => value !== undefined)) as SymbolAppearance;
}

function symbolStyleWithAppearance(style: Style | undefined, appearance: SymbolAppearance): Style {
  return Object.fromEntries(Object.entries({
    ...(style ?? {}),
    stroke: appearance.stroke ?? appearance.accent ?? style?.stroke,
    strokeWidth: appearance.strokeWidth ?? style?.strokeWidth,
    color: appearance.labelColor ?? style?.color
  }).filter(([, value]) => value !== undefined)) as Style;
}

function workflowSearchText(pack: WorkflowPack): string {
  const templates = pack.templates.map((templateId) => WORKFLOW_TEMPLATE_BY_ID.get(templateId)).filter((template): template is WorkflowTemplate => Boolean(template));
  const assets = pack.assetIds.map((assetId) => CURATED_ASSETS.find((asset) => asset.id === assetId)).filter((asset): asset is PremiumAsset => Boolean(asset));
  return [
    pack.id,
    pack.name,
    pack.description,
    ...pack.agentUseHints,
    ...templates.flatMap((template) => [template.id, template.name, template.description, template.layout, ...template.agentUseHints, ...template.previewAssetIds]),
    ...assets.flatMap((asset) => [asset.id, asset.name, asset.category, ...asset.tags, ...asset.aliases, ...asset.semanticSlots])
  ].join(" ").toLowerCase();
}

function packStyleProfile(pack: WorkflowPack): AssetStyleProfile {
  if (/biosecurity|biosafety|risk|permission|review/.test(pack.id)) return "risk-warning";
  return "consulting-2p5d";
}

function uniqueSearchResults(results: AssetSearchResult[]): AssetSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (seen.has(result.asset.id)) return false;
    seen.add(result.asset.id);
    return true;
  });
}

function slugId(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "scientific-asset";
}

function semanticSlotsForBrief(concept: string, workflowPack?: string): string[] {
  const slots = new Set<string>();
  const text = concept.toLowerCase();
  if (/sample|cell|tissue|cohort|patient|organoid|mouse|mission/.test(text)) slots.add("input-sample");
  if (/model|classifier|llm|foundation|checkpoint|network/.test(text)) slots.add("model-checkpoint");
  if (/benchmark|metric|eval|calibration|confusion|roc|error|result|evidence/.test(text)) slots.add("evaluation-evidence");
  if (/risk|safety|permission|durc|review|audit|policy|biosafety/.test(text)) slots.add("risk-decision");
  if (/agent|mcp|tool|retrieval|memory|planner|executor/.test(text)) slots.add("agent-operation");
  if (/spatial|visium|histology|segmentation|microscopy|image/.test(text)) slots.add("spatial-context");
  if (/crispr|perturb|screen|guide|drug|knockdown|activation/.test(text)) slots.add("perturbation-step");
  if (/data|dataset|matrix|table|read|sequence|omics/.test(text)) slots.add("data-evidence");
  if (workflowPack) slots.add(workflowPack);
  if (!slots.size) slots.add("main-subject");
  return [...slots];
}

function panelRoleForBrief(concept: string): AssetPanelRole {
  const text = concept.toLowerCase();
  if (/risk|safety|permission|durc|review|audit|policy|biosafety|warning/.test(text)) return "warning";
  if (/benchmark|metric|eval|calibration|plot|matrix|data|evidence|result/.test(text)) return "evidence";
  if (/workflow|process|step|assay|protocol|pipeline|method/.test(text)) return "process-step";
  if (/label|badge|legend|callout|annotation/.test(text)) return "annotation";
  if (/output|report|summary|dashboard/.test(text)) return "output";
  return "main-subject";
}

function recipePrimitiveHints(family: AssetFamily | undefined, concept: string): string[] {
  const text = concept.toLowerCase();
  if (family === "cell" || /cell|tumor|immune|neuron|macrophage/.test(text)) return ["membrane", "nucleus", "organelle", "surface receptors", "rim highlight", "contact shadow"];
  if (family === "molecule" || /dna|rna|protein|antibody|gene|chromatin/.test(text)) return ["helix or molecule backbone", "domain lobes", "binding highlight", "connector anchor", "publication-line path"];
  if (family === "instrument" || /microscope|sequencer|cytometer|plate|pipette|device/.test(text)) return ["instrument body", "display panel", "sample port", "control accents", "depth base"];
  if (family === "spatial" || /spatial|tissue|histology|segmentation|microscopy/.test(text)) return ["tissue contour", "spot grid", "image tile", "mask overlay", "scale/legend anchor"];
  if (family === "riskGate" || /risk|permission|durc|biosafety|review|audit/.test(text)) return ["gate silhouette", "shield panel", "decision badge", "warning glow", "audit trail"];
  if (family === "modelSystem" || /model|classifier|llm|agent|mcp|rag/.test(text)) return ["model block", "tensor grid", "input/output port", "tool node", "status badge"];
  if (family === "metricPanel" || /benchmark|metric|calibration|confusion|dashboard/.test(text)) return ["metric card", "mini plot", "score badge", "axis ticks", "evidence label"];
  return ["soft 2.5D body", "rim highlight", "inner detail", "accent marker", "label anchor", "connector anchor"];
}

function layoutForIntent(intent: string): WorkflowTemplate["layout"] {
  const text = intent.toLowerCase();
  if (/architecture|system|agent|mcp|rag/.test(text)) return "architecture";
  if (/dashboard|benchmark|metric|result|evidence|panel/.test(text)) return "results";
  if (/multi-panel|manuscript|paper/.test(text)) return "multi-panel";
  if (/pipeline|permission|screen|triage|review/.test(text)) return "pipeline";
  return "workflow";
}

function words(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9+.-]+/).filter(Boolean);
}

function aliasFrom(name: string, tagString: string): string[] {
  const normalized = name.toLowerCase();
  return [...new Set([normalized, normalized.replace(/[-/]/g, " "), ...words(tagString)])];
}

function inferOrganism(tagString: string): string[] {
  const tags = words(tagString);
  if (tags.includes("mouse")) return ["mouse"];
  if (tags.includes("human") || tags.includes("cohort")) return ["human"];
  if (tags.includes("spaceflight")) return ["human", "model organism"];
  return [];
}

function inferAssay(tagString: string): string[] {
  const tags = words(tagString);
  return ["scrna", "single-cell", "spatial", "visium", "merfish", "xenium", "crispr", "perturb-seq", "flow", "facs", "qpcr", "western"].filter((assay) => tags.includes(assay));
}

function inferModality(tagString: string): string[] {
  const tags = words(tagString);
  const modalities = ["genomics", "transcriptomics", "epigenomics", "proteomics", "metabolomics", "imaging", "spatial", "single-cell", "llm", "rag", "benchmark", "evaluation", "biosecurity", "agent"];
  return modalities.filter((modality) => tags.includes(modality) || tagString.toLowerCase().includes(modality));
}

function inferRiskDomain(tagString: string): string[] {
  const tags = words(tagString);
  const domains = [];
  if (tags.some((tag) => ["risk", "safety", "permission", "refusal", "policy", "threat"].includes(tag))) domains.push("ai-safety");
  if (tags.some((tag) => ["biosecurity", "pathogen", "durc", "wetlab", "biosafety", "dual-use"].includes(tag))) domains.push("biosecurity");
  if (tags.some((tag) => ["audit", "traceability", "governance"].includes(tag))) domains.push("governance");
  return domains;
}

function tokenize(value: string): string[] {
  return [...new Set(value.toLowerCase().split(/[^a-z0-9+.-]+/).filter((token) => token.length > 1))];
}

export function isRealisticAsset(asset: LibraryAsset): asset is RealisticAsset {
  return asset.kind === "image" && asset.sourceAssetType !== undefined && asset.realismLevel !== undefined;
}

function searchableText(asset: LibraryAsset): string {
  return [
    asset.id,
    asset.name,
    asset.category,
    asset.family ?? "",
    asset.subcategory ?? "",
    asset.visualRole ?? "",
    ...asset.tags,
    ...(asset.aliases ?? []),
    ...(asset.organism ?? []),
    ...(asset.assay ?? []),
    ...(asset.modality ?? []),
    ...(asset.riskDomain ?? []),
    ...(asset.styleProfiles ?? []),
    ...(asset.workflowPacks ?? []),
    ...(asset.semanticSlots ?? []),
    asset.panelRole ?? "",
    asset.qualityTier ?? "",
    asset.qaStatus ?? "",
    asset.mediaType ?? "",
    asset.realismLevel ?? "",
    asset.rightsStatus ?? "",
    asset.sourceAssetType ?? "",
    ...(asset.agentUseHints ?? [])
  ].join(" ").toLowerCase();
}

function slideIntentBoost(asset: LibraryAsset, slideIntent: string): number {
  const text = slideIntent.toLowerCase();
  if (text.includes("workflow") && ["process", "assay", "risk"].includes(asset.visualRole ?? "")) return 18;
  if (text.includes("mechanism") && ["molecule", "cell", "pathway", "perturbation"].includes(asset.family ?? "")) return isRealisticAsset(asset) ? 2 : 18;
  if (text.includes("result") && ["metricPanel", "dataSystem", "spatial"].includes(asset.family ?? "")) return 18;
  if (text.includes("comparison") && ["modelSystem", "metricPanel", "workflowBlock"].includes(asset.family ?? "")) return 14;
  if (text.includes("safety") && (asset.riskDomain ?? []).length) return 20;
  return 0;
}

function realisticIntentBoost(asset: LibraryAsset, intent: string): number {
  if (!intent) return 0;
  const text = intent.toLowerCase();
  const wantsRealism = /realistic|photo|image|microscopy|histology|h&e|evidence|context|sample|wetlab|protocol|bench|tissue|texture|editorial|spatial map|segmentation/.test(text);
  const wantsVector = /mechanism|editable workflow|diagram|schematic|icon|symbol|pathway|molecule|dna|rna|agent architecture|pipeline/.test(text);
  if (isRealisticAsset(asset) && wantsRealism) return 34;
  if (isRealisticAsset(asset) && wantsVector && !wantsRealism) return -16;
  if (!isRealisticAsset(asset) && wantsVector) return 12;
  return 0;
}

function prefersRealisticForIntent(intent: string): boolean {
  const text = intent.toLowerCase();
  return /realistic|photo|microscopy|histology|h&e|evidence image|context panel|sample image|wetlab context|protocol context|tissue image|editorial realism|segmentation overlay/.test(text)
    && !/mechanism|pathway mechanism|editable schematic|pure vector|symbol-only/.test(text);
}

function inferWorkflowPack(text: string): string | undefined {
  const normalized = text.toLowerCase();
  if (/cell therapy|car[-\s]?t|cart cell|tcr therapy|nk cell therapy|engineered t cell|leukapheresis|apheresis|viral vector transduction|cell expansion|activation beads|potency assay|release testing|infusion bag|patient infusion|cryopreservation|manufacturing batch|cytokine release|crs|icans/.test(normalized)) return "cell-therapy";
  if (/microbiome|metagenomic|metagenomics|taxonomy|taxonomic|alpha diversity|beta diversity|dysbiosis|host[-\s]?pathogen|infectious disease|infection model|antimicrobial resistance|amr|antibiotic|outbreak|pathogen surveillance|phage|fungal|mucosal barrier/.test(normalized)) return "microbiome-infectious-disease";
  if (/synthetic biology|genetic circuit|dbtl|design build test learn|dna assembly|golden gate|gibson|plasmid vector|synthetic operon|biosensor|kill switch|chassis cell|metabolic engineering|pathway flux|strain library|bioreactor|engineered organism/.test(normalized)) return "synthetic-biology";
  if (/protein engineering|protein design|directed evolution|affinity maturation|binding pocket|protein domain|variant library|enzyme kinetics|protein stability|developability|purification column|structure prediction|binder optimization|nanobody|scfv/.test(normalized)) return "protein-engineering";
  if (/lab automation|liquid handler|automated liquid handler|robotic arm|robotic gripper|plate handler|plate stack|plate reader|barcode scanner|lims|assay scheduler|sample tracker|automation qc|qc gate|incubator stack|automated microscope|acoustic dispenser|colony picker|deck layout|tip rack|reagent reservoir|automation orchestrator|robotic rail/.test(normalized)) return "lab-automation";
  if (/drug|compound|hit triage|lead|admet|toxicity|target validation|candidate nomination|pharma|potency|selectivity/.test(normalized)) return "drug-discovery";
  if (/(?:^|[^a-z0-9])(?:clinical translational|translational|patient cohort|patient journey|consent|enrollment|eligibility|inclusion|exclusion|cohort stratification|cohort table|trial design|randomization|treatment arm|clinical sample|biospecimen|longitudinal visit|clinical omics|translational readout|biomarker discovery|biomarker validation|assay validation|companion diagnostic|validation cohort|endpoint hierarchy|primary endpoint|secondary endpoint|clinical response|survival curve|adverse event|safety monitoring|risk[-\s]?benefit|regulatory evidence|evidence grade|ecrf|data lock|irb|clinician review|site activation|patient[-\s]?reported outcome|real[-\s]?world evidence|clinical decision support)(?:$|[^a-z0-9])/.test(normalized)) return "clinical-translational";
  if (/(?:^|[^a-z0-9])(?:methods?|protocols?|sample prep(?:aration)?|reagent mastermix|mastermix|serial dilution|incubation|wash step|centrifugation|magnetic bead|pcr amplification|qpcr|rt[-\s]?qpcr|elisa|western blot|gel imaging|immunostaining|fixation|permeabilization|library prep(?:aration)?|assay timeline|protocol checklist|protocol qc|replicate layout|control sample|standard curve|sample normalization|aliquot|protocol deviation|method safety)(?:$|[^a-z0-9])/.test(normalized)) return "methods-and-protocols";
  if (/(?:^|[^a-z0-9])(?:grant|specific aims?|proposal|consulting|executive summary|one[-\s]?pager|funder|milestone roadmap|roadmap|workplan|budget|resource allocation|stakeholder|decision brief|value proposition|impact metric|outcome kpi|market landscape|competitive positioning|evidence snapshot|risk matrix|risk mitigation|dependency map|go[-\s]?no[-\s]?go|deliverable|recommendation|executive takeaway|priority scorecard)(?:$|[^a-z0-9])/.test(normalized)) return "grant-and-consulting-summary";
  if (/(?:^|[^a-z0-9])(?:perturb(?:-seq)?|crispr|screens?|screening|guide rnas?|grnas?|lentiviral)(?:$|[^a-z0-9])/.test(normalized)) return "perturb-seq-crispr";
  if (/(?:^|[^a-z0-9])(?:anatomy|organ systems?|cross[-\s]?organ|organ axis|brain[-\s]?lung[-\s]?gut|brain|lung|liver|kidney|heart|spleen|pancreas|skin|bone marrow|lymph node|vasculature|respiratory tract|intestinal villus|renal nephron|hepatic lobule|cardiac muscle|neural circuit|blood vessel|lymphatic vessel|organ sample|tissue biomarker|clinical endpoint)(?:$|[^a-z0-9])/.test(normalized)) return "anatomy-organ-systems";
  if (/publication|manuscript|paper|results?|figure panel|multi-panel|volcano|heatmap|result panel/.test(normalized)) return "publication-results-panels";
  if (/microscopy image analysis|image analysis|microscope field|fluorescence channel|z[-\s]?stack|tile stitching|illumination correction|focus quality|nuclei segmentation|membrane segmentation|instance mask|cell tracking|morphology embedding|phenotype feature|classifier heatmap|segmentation model|annotation brush|image qc|computer vision/.test(normalized)) return "microscopy-image-analysis";
  if (/spatial|visium|merfish|xenium|histology|segmentation|neighborhood/.test(normalized)) return "spatial-transcriptomics";
  if (/single-cell|scrna|multiomic|barcode|umi|embedding|trajectory/.test(normalized)) return "single-cell-multiomics";
  if (/biosecurity|durc|permission|biosafety|dual-use|risk|review/.test(normalized)) return "ai-biosecurity-eval";
  if (/agent|mcp|rag|retrieval|tool|planner|executor|memory/.test(normalized)) return "agentic-ai-mcp-rag";
  if (/space|microgravity|spaceflight|astronaut|genelab|mission/.test(normalized)) return "space-biology-genelab";
  return undefined;
}

function reasonFor(asset: LibraryAsset, tokens: string[], slideIntent?: string, workflowPack?: string): string {
  if (workflowPack && asset.workflowPacks.some((pack) => pack.toLowerCase() === workflowPack)) return `Matches workflow pack "${workflowPack}" as ${asset.panelRole}.`;
  if (isRealisticAsset(asset) && slideIntent && realisticIntentBoost(asset, slideIntent) > 0) return `Matches realistic evidence/context intent with ${asset.realismLevel} ${asset.mediaType}.`;
  if (slideIntent && slideIntentBoost(asset, slideIntent) > 0) return `Matches slide intent "${slideIntent}" and ${asset.visualRole} role.`;
  const matched = tokens.find((token) => searchableText(asset).includes(token));
  return matched ? `Matched "${matched}" in ${asset.category}.` : `Relevant ${asset.category} asset.`;
}

function placementFor(asset: LibraryAsset): AssetSearchResult["suggestedPlacement"] {
  if (isRealisticAsset(asset)) return asset.panelRole === "main-subject" ? "hero" : asset.panelRole === "warning" ? "workflow-step" : "supporting";
  if (asset.panelRole === "warning" || asset.panelRole === "process-step") return "workflow-step";
  if (asset.panelRole === "annotation") return "badge";
  if (asset.panelRole === "evidence" || asset.panelRole === "output") return "supporting";
  if (asset.visualRole === "risk" || asset.visualRole === "governance") return "workflow-step";
  if (asset.visualRole === "annotation") return "badge";
  if (asset.visualRole === "context") return "supporting";
  if (["model", "entity"].includes(asset.visualRole)) return "hero";
  return "supporting";
}

function fmt(value: number): string {
  return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "0";
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}
