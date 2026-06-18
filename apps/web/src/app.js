import {
  HERO_ASSET_IDS,
  commercialAssetRecipe,
  renderCommercialAssetDefs,
  renderCommercialAssetGlyph as renderSharedPremiumAssetGlyph
} from "/__shared/assets/renderer.js";

const schemaVersion = "0.2.0";

const canvas = document.querySelector("#canvas");
const projectMeta = document.querySelector("#projectMeta");
const slideList = document.querySelector("#slideList");
const outlineList = document.querySelector("#outlineList");
const sourceList = document.querySelector("#sourceList");
const sourceText = document.querySelector("#sourceText");
const speakerNotes = document.querySelector("#speakerNotes");
const inspector = document.querySelector("#inspector");
const reviewList = document.querySelector("#reviewList");
const reviewSummary = document.querySelector("#reviewSummary");
const reviewCount = document.querySelector("#reviewCount");
const deliveryPanel = document.querySelector("#deliveryPanel");
const deliveryStatus = document.querySelector("#deliveryStatus");
const visualQaList = document.querySelector("#visualQaList");
const visualQaCount = document.querySelector("#visualQaCount");
const agentLog = document.querySelector("#agentLog");
const assetSearch = document.querySelector("#assetSearch");
const assetStyleProfile = document.querySelector("#assetStyleProfile");
const assetWorkflowPack = document.querySelector("#assetWorkflowPack");
const workflowTemplate = document.querySelector("#workflowTemplate");
const insertWorkflowFigure = document.querySelector("#insertWorkflowFigure");
const insertFlagshipDemo = document.querySelector("#insertFlagshipDemo");
const packTabs = document.querySelector("#packTabs");
const packQualitySummary = document.querySelector("#packQualitySummary");
const selectedTemplateSummary = document.querySelector("#selectedTemplateSummary");
const templateGallery = document.querySelector("#templateGallery");
const publicDemoLauncher = document.querySelector("#publicDemoLauncher");
const assetQualityFilters = document.querySelector("#assetQualityFilters");
const assetFilters = document.querySelector("#assetFilters");
const assetList = document.querySelector("#assetList");

let curatedAssets = [
  ["cell-immune", "Immune cell", "Biology / Cells", "cell", ["cell", "immune", "single-cell"], "#38bdf8"],
  ["dna-helix", "DNA helix", "Biology / Genomics", "molecule", ["dna", "genomics", "crispr"], "#2563eb"],
  ["crispr-cas9", "CRISPR-Cas9", "Biology / Perturbation", "perturbation", ["crispr", "screen", "perturb-seq"], "#16a34a"],
  ["compound-library", "Compound library", "Biology / Drug discovery", "molecule", ["compound", "screen", "drug-discovery"], "#0f766e"],
  ["target-validation", "Target validation", "Biology / Drug discovery", "workflowBlock", ["target", "validation", "evidence"], "#0f766e"],
  ["target-engagement", "Target engagement", "Biology / Drug discovery", "workflowBlock", ["target", "engagement", "occupancy"], "#0f766e"],
  ["hit-triage", "Hit triage", "Biology / Drug discovery", "metricPanel", ["hit", "triage", "screen"], "#0f766e"],
  ["dose-response-curve", "Dose-response curve", "Biology / Drug discovery", "metricPanel", ["dose", "response", "ic50"], "#0f766e"],
  ["selectivity-panel", "Selectivity panel", "Biology / Drug discovery", "metricPanel", ["selectivity", "off-target", "panel"], "#0f766e"],
  ["pk-profile", "PK profile", "Biology / Drug discovery", "metricPanel", ["pharmacokinetics", "pk", "half-life"], "#0f766e"],
  ["sar-table", "SAR table", "Biology / Drug discovery", "metricPanel", ["sar", "potency", "selectivity"], "#0f766e"],
  ["medicinal-chemistry-cycle", "Medicinal chemistry cycle", "Biology / Drug discovery", "workflowBlock", ["medchem", "design", "make-test-learn"], "#0f766e"],
  ["admet-panel", "ADMET panel", "Biology / Drug discovery", "metricPanel", ["admet", "toxicity", "safety"], "#0f766e"],
  ["toxicity-screen", "Toxicity screen", "Biology / Drug discovery", "riskGate", ["toxicity", "safety", "viability"], "#dc2626"],
  ["efficacy-model", "Efficacy model", "Biology / Drug discovery", "workflowBlock", ["efficacy", "model", "response"], "#0f766e"],
  ["biomarker-response", "Biomarker response", "Biology / Drug discovery", "metricPanel", ["biomarker", "response", "stratification"], "#0f766e"],
  ["lead-series", "Lead series", "Biology / Drug discovery", "molecule", ["lead", "optimization", "sar"], "#0f766e"],
  ["candidate-nomination", "Candidate nomination", "Biology / Drug discovery", "workflowBlock", ["candidate", "nomination", "go-no-go"], "#0f766e"],
  ["ind-enabling-package", "IND-enabling package", "Biology / Drug discovery", "workflowBlock", ["ind", "regulatory", "readiness"], "#0f766e"],
  ["sequencer", "Sequencer", "Biology / Assays", "instrument", ["sequencing", "ngs"], "#0891b2"],
  ["spatial-grid", "Spatial grid", "Biology / Spatial", "spatial", ["spatial", "tissue", "visium"], "#9333ea"],
  ["model-block", "AI model", "AI / Model Systems", "modelSystem", ["model", "llm", "classifier"], "#7c3aed"],
  ["dataset", "Dataset", "AI / Data", "dataSystem", ["data", "benchmark"], "#2563eb"],
  ["benchmark", "Benchmark", "AI / Evaluation", "metricPanel", ["benchmark", "eval"], "#059669"],
  ["risk-gate", "Risk gate", "AI / Safety", "riskGate", ["risk", "biosecurity", "permissioning"], "#dc2626"],
  ["human-review", "Human review", "AI / Governance", "governance", ["review", "governance"], "#0f766e"]
].map(([id, name, category, family, tags, accent]) => ({
  id,
  name,
  kind: "symbol",
  category,
  family,
  subcategory: category.split("/").pop().trim(),
  tags,
  aliases: [name.toLowerCase(), ...tags],
  visualRole: category.startsWith("AI") ? "model" : "entity",
  qualityTier: HERO_ASSET_IDS.includes(id) ? "hero" : "standard",
  styleProfiles: ["consulting-2p5d", "publication-line", "minimal-flat", "dark-talk", "risk-warning", "scientific-editorial-realism"],
  workflowPacks: fallbackWorkflowPacks(id),
  semanticSlots: fallbackSemanticSlots(id),
  panelRole: category.includes("Safety") ? "warning" : category.includes("Evaluation") ? "evidence" : "main-subject",
  fidelityScore: HERO_ASSET_IDS.includes(id) ? 0.9 : 0.72,
  qaStatus: HERO_ASSET_IDS.includes(id) ? "premium" : "reviewed",
  renderSpec: {
    family,
    motif: id,
    accent,
    secondary: category.startsWith("AI") ? "#ede9fe" : "#e0f2fe",
    complexity: "moderate",
    version: 2,
    assetRecipe: commercialAssetRecipe({ id, family })
  },
  recommendedSize: { width: 160, height: 120 },
  provenance: {
    kind: "curated",
    source: "Scientific Image curated premium visual pack",
    license: "CC0-1.0",
    citation: "Scientific Image curated asset library v0.2",
    editState: "original"
  }
}));

const defaultNotes = `# Biosecurity AI Evaluation Platform

## Motivation
Biology-capable AI systems need calibrated permissioning, provenance-aware outputs, and expert review.

## Approach
We combine benchmark prompts, risk classifiers, human review, and structured visual reporting.

## Evidence
Evaluation pipelines should expose model behavior, uncertainty, and failure modes across biological domains.

## Implications
The platform should support safe scientific communication without hiding important technical detail.`;

const sampleVolcano = `gene\tlog2fc\tpadj\tscore\tgroup
TP53\t1.8\t0.0008\t9.1\tDNA damage
MYC\t-1.2\t0.004\t7.5\tOncogene
CDKN1A\t2.4\t0.0002\t11.2\tCell cycle
STAT1\t1.1\t0.03\t4.1\tInterferon
CXCL10\t2.8\t0.00001\t14.0\tInterferon
ISG15\t2.1\t0.0004\t10.0\tInterferon`;

const publicDemos = [
  {
    id: "perturb-seq-workflow",
    title: "Perturb-seq",
    subtitle: "CRISPR source-to-hit workflow",
    workflowPack: "perturb-seq-crispr",
    templateId: "perturb-seq-workflow",
    styleProfile: "consulting-2p5d"
  },
  {
    id: "perturb-seq-workflow-journal",
    title: "Perturb-seq paper",
    subtitle: "Publication-line manuscript schematic",
    workflowPack: "perturb-seq-crispr",
    templateId: "perturb-seq-workflow-journal",
    styleProfile: "publication-line"
  },
  {
    id: "spatial-results-panel",
    title: "Spatial",
    subtitle: "Tissue, spots, segmentation, evidence",
    workflowPack: "spatial-transcriptomics",
    templateId: "spatial-results-panel",
    styleProfile: "consulting-2p5d"
  },
  {
    id: "spatial-results-panel-journal",
    title: "Spatial paper",
    subtitle: "Journal-safe results panel",
    workflowPack: "spatial-transcriptomics",
    templateId: "spatial-results-panel-journal",
    styleProfile: "publication-line"
  },
  {
    id: "ai-biosecurity-pipeline",
    title: "AI biosecurity",
    subtitle: "Risk gate, review, audit pipeline",
    workflowPack: "ai-biosecurity-eval",
    templateId: "ai-biosecurity-pipeline",
    styleProfile: "risk-warning"
  },
  {
    id: "ai-biosecurity-pipeline-journal",
    title: "AI safety paper",
    subtitle: "Publication-line methods schematic",
    workflowPack: "ai-biosecurity-eval",
    templateId: "ai-biosecurity-pipeline-journal",
    styleProfile: "publication-line"
  }
];
let pendingPublicDemoId = initialPublicDemoId();

let project = createProject("Premium scientific deck");
let activePageId = project.pages[0].id;
let selectedId = null;
let dragState = null;
let activeAssetFilter = "featured";
let activeAssetQualityFilter = "all";
let selectedWorkflowTemplateId = "manuscript-results-figure";
let activeTemplateFigureIntent = "all";
let deliveryNotice = "";
let workflowPacks = [
  { id: "perturb-seq-crispr", name: "Perturb-seq / CRISPR", flagshipTemplateId: "perturb-seq-workflow" },
  { id: "publication-results-panels", name: "Publication results", flagshipTemplateId: "manuscript-results-figure" },
  { id: "spatial-transcriptomics", name: "Spatial transcriptomics", flagshipTemplateId: "spatial-results-panel" },
  { id: "single-cell-multiomics", name: "Single-cell multiomics", flagshipTemplateId: "single-cell-workflow" },
  { id: "ai-biosecurity-eval", name: "AI biosecurity", flagshipTemplateId: "ai-biosecurity-pipeline" },
  { id: "agentic-ai-mcp-rag", name: "Agentic AI / MCP", flagshipTemplateId: "agent-loop-architecture" },
  { id: "drug-discovery", name: "Drug discovery", flagshipTemplateId: "drug-discovery-funnel" },
  { id: "space-biology-genelab", name: "Space biology", flagshipTemplateId: "spaceflight-sample-workflow" }
];
const realisticWorkflowPacks = [
  { id: "realistic-spatial-microscopy", name: "Realistic spatial microscopy", flagshipTemplateId: "spatial-realistic-hybrid-panel" },
  { id: "realistic-wetlab-context", name: "Realistic wetlab context", flagshipTemplateId: "wetlab-realistic-context-panel" },
  { id: "realistic-cellular-textures", name: "Realistic cellular textures", flagshipTemplateId: "cellular-realistic-evidence-panel" },
  { id: "realistic-space-biology", name: "Realistic space biology", flagshipTemplateId: "space-realistic-context-panel" }
];
const workflowPackGalleries = new Map();
const workflowPackVisualQaGalleries = new Map();
let assetCoverageReport = null;
const undoStack = [];
const redoStack = [];

const featuredAssetIds = [
  "expression-matrix",
  "embedding-space",
  "metric-card",
  "calibration",
  "cell-tumor",
  "perturb-seq",
  "crispr-cas9",
  "guide-rna",
  "scrna-droplet",
  "spatial-grid",
  "tissue-section",
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
  "metabolite",
  "cell-t",
  "cell-macrophage",
  "sequencer",
  "microscope",
  "model-block",
  "foundation-model",
  "agent-loop",
  "benchmark",
  "risk-gate",
  "permission-tier",
  "human-review",
  "audit-log"
];

let workflowTemplates = [
  {
    id: "manuscript-results-figure",
    workflowPack: "publication-results-panels",
    name: "Manuscript results figure",
    description: "A-E paper-style figure with editable plots and claim/evidence panel.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["cell-tumor", "sequencer", "expression-matrix", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for manuscript figures and lab-meeting evidence slides."],
    qaChecklist: ["Check panel labels, plot readability, and claim citations."]
  },
  {
    id: "perturb-seq-workflow",
    workflowPack: "perturb-seq-crispr",
    name: "Perturb-seq workflow",
    description: "CRISPR perturbation to single-cell sequencing and matrix output.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["cell-t", "crispr-cas9", "scrna-droplet", "expression-matrix"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for methods slides explaining Perturb-seq."],
    qaChecklist: ["Check biological order and connector clarity."]
  },
  {
    id: "perturb-seq-workflow-journal",
    workflowPack: "perturb-seq-crispr",
    name: "Perturb-seq journal workflow figure",
    description: "Manuscript-safe Perturb-seq schematic with publication-line assets and source/provenance placeholders.",
    layout: "multi-panel",
    recommendedStyleProfile: "publication-line",
    previewAssetIds: ["cell-t", "guide-rna", "scrna-droplet", "expression-matrix", "crispr-cas9", "metric-card"],
    nodeKinds: ["shape", "text", "symbol", "connector", "plot"],
    agentUseHints: ["Use for paper, manuscript, and journal-safe Perturb-seq schematics."],
    qaChecklist: ["Use publication-line styling, plot metadata, and source-data placeholders."]
  },
  {
    id: "drug-discovery-funnel",
    workflowPack: "drug-discovery",
    name: "Drug discovery funnel",
    description: "Target validation, compound screen, hit triage, lead optimization, and candidate nomination.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["target-validation", "compound-library", "medicinal-chemistry-cycle", "candidate-nomination"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for pharma discovery funnels, hit validation, and lead optimization slides."],
    qaChecklist: ["Check target/assay/hit/candidate terms, evidence separation, and PPTX fallback warnings."]
  },
  {
    id: "spatial-results-panel",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial results panel",
    description: "Tissue, spots, segmentation, and neighborhood evidence.",
    layout: "multi-panel",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["tissue-section", "visium-spot-array", "segmentation-mask", "neighborhood-graph"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for spatial transcriptomics result slides."],
    qaChecklist: ["Check map color contrast and image provenance."]
  },
  {
    id: "spatial-results-panel-journal",
    workflowPack: "spatial-transcriptomics",
    name: "Spatial transcriptomics journal results panel",
    description: "Manuscript-safe spatial transcriptomics panel with publication-line assets, heatmap metadata, and source/provenance checklist.",
    layout: "multi-panel",
    recommendedStyleProfile: "publication-line",
    previewAssetIds: ["histology-section", "visium-spot-array", "segmentation-mask", "neighborhood-graph", "gene-locus"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for paper, manuscript, and journal-safe spatial transcriptomics figures."],
    qaChecklist: ["Use publication-line styling, explicit plot metadata, and visible source placeholders."]
  },
  {
    id: "spatial-realistic-hybrid-panel",
    workflowPack: "realistic-spatial-microscopy",
    name: "Spatial realistic hybrid panel",
    description: "Editorial tissue/microscopy image panels with editable SVG annotations, plots, and provenance QA.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-he-tissue-section", "realistic-segmentation-overlay", "realistic-spatial-map", "neighborhood-graph"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when slide intent asks for microscopy, histology, evidence imagery, or spatial context.", "Keep mechanisms SVG-first; use realistic images as source/evidence panels."],
    qaChecklist: ["Check image provenance and rights.", "Confirm crop/mask does not hide the relevant tissue region.", "Review PPTX/DOCX image fallback warnings."]
  },
  {
    id: "wetlab-realistic-context-panel",
    workflowPack: "realistic-wetlab-context",
    name: "Wetlab realistic context panel",
    description: "Editorial protocol context with realistic wetlab panels, editable QC, and provenance/export QA.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-pipette-bench", "realistic-plate-96-photo", "realistic-microscope-bench", "realistic-biosafety-cabinet"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when slide intent asks for protocol context, wetlab credibility, samples, assay setup, or instruments."],
    qaChecklist: ["Check image provenance and rights.", "Confirm protocol claims are cited or left as review items.", "Review PPTX/DOCX image fallback warnings."]
  },
  {
    id: "cellular-realistic-evidence-panel",
    workflowPack: "realistic-cellular-textures",
    name: "Cellular realistic evidence panel",
    description: "Editorial cellular evidence with realistic organoid, tumor microenvironment, immune infiltrate, assay context, and editable biology annotations.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-organoid-texture", "realistic-tumor-microenvironment", "realistic-immune-infiltrate", "realistic-protein-gel"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when slide intent asks for cellular evidence, organoid context, tumor microenvironment, or immune infiltration."],
    qaChecklist: ["Check image provenance and rights.", "Confirm marker interpretation remains source-backed.", "Review PPTX/DOCX image fallback warnings."]
  },
  {
    id: "space-realistic-context-panel",
    workflowPack: "realistic-space-biology",
    name: "Space realistic context panel",
    description: "Editorial spaceflight biology context with mission imagery, crew sample, flight assay, GeneLab data evidence, and export/provenance QA.",
    layout: "hybrid-template",
    recommendedStyleProfile: "scientific-editorial-realism",
    previewAssetIds: ["realistic-spacecraft-context", "realistic-astronaut-sample", "realistic-spaceflight-assay", "realistic-genelab-data-context"],
    nodeKinds: ["image", "shape", "text", "plot", "connector", "symbol"],
    agentUseHints: ["Use when slide intent asks for mission context, astronaut sample collection, spaceflight assay, or GeneLab data evidence."],
    qaChecklist: ["Check mission/sample provenance.", "Keep biological result visible.", "Review PPTX/DOCX image fallback warnings."]
  },
  {
    id: "ai-biosecurity-pipeline",
    workflowPack: "ai-biosecurity-eval",
    name: "AI biosecurity pipeline",
    description: "Benchmark, classifier, risk gate, human review, and audit.",
    layout: "pipeline",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["benchmark", "classifier", "risk-gate", "human-review"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for calibrated permissioning and DURC triage slides."],
    qaChecklist: ["Check risk states, review path, and audit visibility."]
  },
  {
    id: "ai-biosecurity-pipeline-journal",
    workflowPack: "ai-biosecurity-eval",
    name: "AI biosecurity journal evaluation schematic",
    description: "Manuscript-safe AI biosecurity evaluation schematic with publication-line assets, metric metadata, and review/audit source placeholders.",
    layout: "multi-panel",
    recommendedStyleProfile: "publication-line",
    previewAssetIds: ["dataset", "benchmark", "bio-classifier", "risk-gate", "human-review", "audit-log"],
    nodeKinds: ["shape", "text", "symbol", "plot", "connector"],
    agentUseHints: ["Use for paper, manuscript, and journal-safe AI biosecurity methods schematics."],
    qaChecklist: ["Use publication-line styling, explicit threshold metadata, and visible audit/source placeholders."]
  },
  {
    id: "agent-loop-architecture",
    workflowPack: "agentic-ai-mcp-rag",
    name: "Agent MCP/RAG architecture",
    description: "Prompt, retrieval, tool call, MCP server, and verifier loop.",
    layout: "architecture",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["prompt", "retrieval", "tool-call", "mcp-server"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for agentic AI system diagrams."],
    qaChecklist: ["Check tool/data boundaries and verifier path."]
  },
  {
    id: "spaceflight-sample-workflow",
    workflowPack: "space-biology-genelab",
    name: "Spaceflight sample workflow",
    description: "Mission context, astronaut sample, assay, and GeneLab dataset.",
    layout: "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: ["microgravity", "astronaut-sample", "sequencer", "dataset"],
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: ["Use for GeneLab and spaceflight omics slides."],
    qaChecklist: ["Check sample metadata and assay provenance."]
  }
];
const staticWorkflowTemplates = workflowTemplates.map((template) => ({ ...template, previewAssetIds: [...template.previewAssetIds], nodeKinds: [...template.nodeKinds], agentUseHints: [...template.agentUseHints], qaChecklist: [...template.qaChecklist] }));

function fallbackWorkflowPacks(assetId) {
  if (/drug|compound|target-validation|target-engagement|hit-triage|dose-response|selectivity-panel|pk-profile|sar-table|medicinal-chemistry-cycle|admet|toxicity|efficacy-model|biomarker-response|lead-series|candidate-nomination|ind-enabling-package|ligand|receptor|metabolite|plate-384/.test(assetId)) return ["drug-discovery"];
  if (/expression|embedding|metric|calibration|confusion|error|tumor|immune|gene|chromatin|protein|antibody/.test(assetId)) return ["publication-results-panels"];
  if (/crispr|perturb|guide|droplet|sequencer/.test(assetId)) return ["perturb-seq-crispr"];
  if (/spatial|tissue/.test(assetId)) return ["spatial-transcriptomics"];
  if (/risk|review|benchmark/.test(assetId)) return ["ai-biosecurity-eval"];
  if (/model|dataset/.test(assetId)) return ["agentic-ai-mcp-rag"];
  return [];
}

function fallbackSemanticSlots(assetId) {
  if (/risk|review/.test(assetId)) return ["risk-decision"];
  if (/benchmark|dataset/.test(assetId)) return ["evaluation-evidence"];
  if (/spatial|tissue/.test(assetId)) return ["spatial-context"];
  if (/crispr|perturb/.test(assetId)) return ["perturbation-step"];
  return ["main-subject"];
}

sourceText.value = defaultNotes;
syncWorkflowControls();
renderAll();
loadAssetCoverageReport();
loadPremiumAssets();
loadWorkflowTemplates();
loadWorkflowPacks();
launchInitialPublicDemoFromUrl();

document.querySelector("#newProject").addEventListener("click", () => {
  checkpoint();
  project = createProject("Premium scientific deck");
  activePageId = project.pages[0].id;
  selectedId = null;
  renderAll();
});
document.querySelector("#saveProject").addEventListener("click", () => {
  localStorage.setItem("scientific-image-premium-deck", JSON.stringify(project));
  projectMeta.textContent = `Saved ${new Date().toLocaleTimeString()}`;
});
document.querySelector("#loadProject").addEventListener("click", () => {
  const saved = localStorage.getItem("scientific-image-premium-deck");
  if (!saved) return;
  checkpoint();
  project = migrateProject(JSON.parse(saved));
  activePageId = project.pages[0]?.id;
  selectedId = null;
  renderAll();
});
document.querySelector("#exportJson").addEventListener("click", () => deliveryExport("json"));
document.querySelector("#exportDeckSvg").addEventListener("click", () => deliveryExport("svg"));
document.querySelector("#exportPng").addEventListener("click", () => deliveryExport("png"));
document.querySelector("#addSlide").addEventListener("click", addSlide);
document.querySelector("#importSource").addEventListener("click", importSourceFromTextarea);
document.querySelector("#createOutline").addEventListener("click", draftOutline);
document.querySelector("#approveGenerate").addEventListener("click", approveAndGenerateDeck);
document.querySelector("#refreshReview").addEventListener("click", () => {
  checkpoint();
  project.deck.reviewItems = generateReviewItems(project);
  renderAll();
});
document.querySelector("#addText").addEventListener("click", addText);
document.querySelector("#addConnector").addEventListener("click", addConnector);
document.querySelector("#addVolcano").addEventListener("click", addVolcano);
document.querySelector("#uploadImage").addEventListener("change", uploadImage);
insertWorkflowFigure?.addEventListener("click", () => addWorkflowFigure());
insertFlagshipDemo?.addEventListener("click", addFlagshipWorkflowDemo);
assetSearch.addEventListener("input", renderAssets);
assetStyleProfile.addEventListener("change", () => {
  workflowPackGalleries.clear();
  workflowPackVisualQaGalleries.clear();
  loadWorkflowPackGallery(assetWorkflowPack?.value || workflowPacks[0]?.id);
  loadWorkflowPackVisualQaGallery(assetWorkflowPack?.value || workflowPacks[0]?.id);
  renderAll();
});
assetWorkflowPack.addEventListener("change", () => {
  if (assetWorkflowPack.value) {
    selectedWorkflowTemplateId = defaultTemplateForPack(assetWorkflowPack.value)?.id ?? selectedWorkflowTemplateId;
    if (workflowTemplate) workflowTemplate.value = assetWorkflowPack.value;
    if (syncStyleProfileForPack(assetWorkflowPack.value)) {
      workflowPackGalleries.clear();
      workflowPackVisualQaGalleries.clear();
    }
    loadWorkflowPackGallery(assetWorkflowPack.value);
    loadWorkflowPackVisualQaGallery(assetWorkflowPack.value);
  }
  renderAll();
});
workflowTemplate?.addEventListener("change", () => {
  if (assetWorkflowPack) {
    assetWorkflowPack.value = workflowTemplate.value;
    selectedWorkflowTemplateId = defaultTemplateForPack(workflowTemplate.value)?.id ?? selectedWorkflowTemplateId;
    if (syncStyleProfileForPack(workflowTemplate.value)) {
      workflowPackGalleries.clear();
      workflowPackVisualQaGalleries.clear();
    }
    loadWorkflowPackGallery(workflowTemplate.value);
    loadWorkflowPackVisualQaGallery(workflowTemplate.value);
    renderAll();
  }
});
assetFilters.querySelectorAll("button[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeAssetFilter = button.dataset.filter;
    assetFilters.querySelectorAll("button[data-filter]").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    renderAssets();
  });
});
assetQualityFilters?.querySelectorAll("button[data-quality-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeAssetQualityFilter = button.dataset.qualityFilter;
    assetQualityFilters.querySelectorAll("button[data-quality-filter]").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    renderAssets();
  });
});
speakerNotes.addEventListener("change", () => {
  const meta = currentSlideMeta();
  if (!meta) return;
  checkpoint();
  meta.speakerNotes = speakerNotes.value;
  renderReview();
});
canvas.addEventListener("pointerdown", (event) => {
  if (event.target === canvas) {
    selectedId = null;
    renderCanvas();
    renderInspector();
  }
});
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  }
  if (event.key === "Delete" && selectedId) {
    checkpoint();
    currentPage().nodes = currentPage().nodes.filter((node) => node.id !== selectedId);
    selectedId = null;
    renderAll();
  }
});

function createProject(title) {
  const now = new Date().toISOString();
  const pageId = id("page");
  return {
    schemaVersion,
    id: id("project"),
    title,
    createdAt: now,
    updatedAt: now,
    pages: [createPage("Opening slide", pageId)],
    assets: [],
    theme: {
      id: "biorender-color",
      name: "BioRender-like colorful",
      background: "#f8fafc",
      palette: ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#0891b2"],
      fontFamily: "Inter, Arial, sans-serif"
    },
    citations: [],
    deck: {
      outline: undefined,
      slideMeta: {
        [pageId]: {
          pageId,
          title: "Opening slide",
          section: "Opening",
          speakerNotes: starterOpeningSpeakerNotes(),
          narrativeIntent: "Introduce the scientific story.",
          layoutIntent: "title",
          sourceIds: []
        }
      },
      sources: [],
      reviewItems: [],
      agentRuns: []
    }
  };
}

function createPage(name, pageId = id("page")) {
  return {
    id: pageId,
    kind: "slide",
    name,
    width: 1280,
    height: 720,
    unit: "px",
    background: "#f8fbff",
    nodes: [
      createShapeNode("round-rect", "", 0, 0, 1280, 132, "#ffffff", "#ffffff", "surface"),
      createTextNode("Scientific deck workspace", 72, 48, 720, 56, { fontSize: 40, fontWeight: 800 }),
      createTextNode("Source-grounded visuals for biology, AI evaluation, and review-ready presentations.", 76, 111, 760, 58, {
        fontSize: 20,
        fontWeight: 500,
        color: "#475569"
      }),
      createTextNode("Outline-first generation", 90, 196, 330, 36, { fontSize: 18, fontWeight: 800, color: "#0f172a" }),
      createShapeNode("round-rect", "", 84, 246, 1074, 178, "#ffffff", "#dbeafe", "hero"),
      createSymbolNode("dataset", "Sources", 118, 275, 170, 136),
      createConnectorNode(294, 343, 366, 343),
      createSymbolNode("agent-loop", "Agent outline", 378, 275, 170, 136),
      createConnectorNode(554, 343, 626, 343),
      createSymbolNode("model-block", "Editable slides", 638, 275, 170, 136),
      createConnectorNode(814, 343, 886, 343),
      createSymbolNode("risk-gate", "Review queue", 898, 275, 170, 136),
      createShapeNode("round-rect", "Object-level provenance", 132, 505, 270, 74, "#eff6ff", "#2563eb"),
      createShapeNode("round-rect", "Semantic asset search", 462, 505, 270, 74, "#f0fdf4", "#16a34a"),
      createShapeNode("round-rect", "PPTX / PDF export QA", 792, 505, 270, 74, "#fff7ed", "#ea580c"),
      createSymbolNode("human-review", "Human approval", 1015, 138, 160, 128)
    ].map((node, z) => ({ ...node, transform: { ...node.transform, z } }))
  };
}

function starterOpeningSpeakerNotes() {
  return [
    "Scientific deck workspace: local-first structured scene editing for premium biology and AI presentations.",
    "",
    "Speaker cue: explain that sources enter first, agents draft editable scene operations, humans resolve claims/provenance/export QA, and final PPTX/PDF/SVG remain delivery formats rather than the canonical source.",
    "",
    "QA focus: confirm scientific claims, preserve object-level provenance, and review Office fallback warnings before sending a deck."
  ].join("\n");
}

function migrateProject(input) {
  input.schemaVersion = schemaVersion;
  input.deck ??= { slideMeta: {}, sources: [], reviewItems: [], agentRuns: [] };
  input.deck.slideMeta ??= {};
  input.deck.sources ??= [];
  input.deck.reviewItems ??= [];
  input.deck.agentRuns ??= [];
  for (const page of input.pages ?? []) {
    input.deck.slideMeta[page.id] ??= {
      pageId: page.id,
      title: page.name,
      section: "Deck",
      speakerNotes: "",
      narrativeIntent: "Migrated slide.",
      layoutIntent: "summary",
      sourceIds: []
    };
  }
  return input;
}

function renderAll() {
  project = migrateProject(project);
  renderSlides();
  renderOutline();
  renderSources();
  renderCanvas();
  renderInspector();
  renderPackTabs();
  renderPackQualitySummary();
  renderPublicDemoLauncher();
  renderAssets();
  renderTemplateGallery();
  renderWorkflowInsertButton();
  renderSelectedTemplateSummary();
  renderReview();
  renderDeliveryPanel();
  renderVisualQa();
  renderAgentLog();
  const page = currentPage();
  const meta = currentSlideMeta();
  speakerNotes.value = meta?.speakerNotes ?? "";
  projectMeta.textContent = `${project.pages.length} slides / ${project.deck.sources.length} sources / ${openReviewItems().length} review items / ${project.deck.agentRuns.length} agent runs`;
  if (page) document.title = `${page.name} - Scientific Image`;
}

function renderSlides() {
  slideList.innerHTML = project.pages.map((page, index) => {
    const meta = project.deck.slideMeta[page.id];
    return `<div class="slide-card ${page.id === activePageId ? "active" : ""}" data-page-id="${page.id}">
      <div class="slide-thumb"></div>
      <div><div class="slide-title">${index + 1}. ${escapeXml(meta?.title ?? page.name)}</div><div class="slide-meta">${escapeXml(meta?.section ?? "Deck")} / ${page.nodes.length} objects</div></div>
    </div>`;
  }).join("");
  slideList.querySelectorAll(".slide-card").forEach((card) => {
    card.addEventListener("click", () => {
      activePageId = card.dataset.pageId;
      selectedId = null;
      renderAll();
    });
  });
}

function renderOutline() {
  const outline = project.deck.outline;
  if (!outline) {
    outlineList.innerHTML = `<div class="outline-card"><div class="outline-title">No outline yet</div><div class="outline-meta">Import source text and draft an outline.</div></div>`;
    return;
  }
  outlineList.innerHTML = [
    `<div class="outline-card"><div class="outline-title">${escapeXml(outline.title)}</div><div class="outline-meta">${escapeXml(outline.status)} / ${outline.slides.length} slides</div></div>`,
    ...outline.slides.map((slide, index) => `<div class="outline-card"><div class="outline-title">${index + 1}. ${escapeXml(slide.title)}</div><div class="outline-meta">${escapeXml(slide.layoutIntent)} / ${escapeXml(slide.status)}</div></div>`)
  ].join("");
}

function renderSources() {
  if (!project.deck.sources.length) {
    sourceList.innerHTML = `<div class="source-card"><div class="source-title">No sources</div><div class="source-meta">Markdown, extracted PDF text, images, and tables can be attached.</div></div>`;
    return;
  }
  sourceList.innerHTML = project.deck.sources.map((source) => `<div class="source-card"><div class="source-title">${escapeXml(source.name)}</div><div class="source-meta">${escapeXml(source.kind)} / ${source.snippets.length} snippets</div></div>`).join("");
}

function renderCanvas() {
  const page = currentPage();
  if (!page) return;
  canvas.setAttribute("viewBox", `0 0 ${page.width} ${page.height}`);
  canvas.setAttribute("width", page.width);
  canvas.setAttribute("height", page.height);
  canvas.innerHTML = renderSvgInner(page);
  canvas.querySelectorAll(".node").forEach((nodeEl) => {
    nodeEl.addEventListener("pointerdown", onNodePointerDown);
  });
}

function renderSvgInner(page) {
  return [
    `<defs>${renderDepthDefs()}</defs>`,
    `<rect width="100%" height="100%" fill="${page.background}"/>`,
    ...page.nodes.slice().sort((a, b) => a.transform.z - b.transform.z).map(renderNode)
  ].join("");
}

function renderDepthDefs(includeMarker = true) {
  return [
    includeMarker ? `<marker id="arrow-end" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill="#334155"/></marker>` : "",
    `<filter id="contact-shadow" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur"/><feOffset in="blur" dx="0" dy="3" result="offset"/><feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.18 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="raised-panel-shadow" x="-18%" y="-22%" width="136%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="1.2" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.12 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="9" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.12 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="soft-object-shadow" x="-28%" y="-32%" width="156%" height="168%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="3" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.14 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="14" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.11 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="hero-shadow" x="-24%" y="-28%" width="148%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="4" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.16 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="18" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="22" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.14 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="warning-object-shadow" x="-32%" y="-36%" width="164%" height="172%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="contact-blur"/><feOffset in="contact-blur" dx="0" dy="3" result="contact-offset"/><feColorMatrix in="contact-offset" type="matrix" values="0 0 0 0 0.57 0 0 0 0 0.25 0 0 0 0 0.05 0 0 0 0.14 0" result="contact-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="glow-blur"/><feColorMatrix in="glow-blur" type="matrix" values="0 0 0 0 0.96 0 0 0 0 0.62 0 0 0 0 0.04 0 0 0 0.32 0" result="glow-shadow"/><feMerge><feMergeNode in="glow-shadow"/><feMergeNode in="contact-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="danger-object-shadow" x="-36%" y="-40%" width="172%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="contact-blur"/><feOffset in="contact-blur" dx="0" dy="4" result="contact-offset"/><feColorMatrix in="contact-offset" type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.11 0 0 0 0 0.11 0 0 0 0.18 0" result="contact-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="glow-blur"/><feColorMatrix in="glow-blur" type="matrix" values="0 0 0 0 0.86 0 0 0 0 0.15 0 0 0 0 0.15 0 0 0 0.36 0" result="glow-shadow"/><feMerge><feMergeNode in="glow-shadow"/><feMergeNode in="contact-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="focus-glow" x="-26%" y="-26%" width="152%" height="152%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="focus-blur"/><feColorMatrix in="focus-blur" type="matrix" values="0 0 0 0 0.15 0 0 0 0 0.39 0 0 0 0 0.92 0 0 0 0.5 0" result="focus-shadow"/><feMerge><feMergeNode in="focus-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    renderCommercialAssetDefs()
  ].join("");
}

function renderNode(node) {
  const t = node.transform;
  const selected = node.id === selectedId ? " selected" : "";
  const depth = depthForNode(node);
  const filter = filterForDepth(depth, node);
  return `<g class="node depth-${depth}${selected}" data-node-id="${node.id}" data-kind="${node.kind}" data-depth="${depth}" transform="translate(${t.x} ${t.y}) rotate(${t.rotation} ${t.width / 2} ${t.height / 2})"><g class="node-body"${filter}>${renderNodeBody(node)}</g><rect class="selection-box" x="-5" y="-5" width="${t.width + 10}" height="${t.height + 10}" rx="8" filter="url(#focus-glow)"/></g>`;
}

function depthForNode(node) {
  if (node.style?.depth) return node.style.depth;
  if (node.style?.shadow) return "floating";
  if (node.kind === "text" || node.kind === "connector") return "none";
  if (node.kind === "symbol" || node.kind === "image") return "floating";
  if (node.kind === "plot" || node.kind === "shape" || node.kind === "annotation") return "raised";
  return "surface";
}

function filterForDepth(depth, node) {
  if (node.claimStatus === "unsupported-claim") return ` filter="url(#danger-object-shadow)"`;
  if (isRiskVisualNode(node)) return ` filter="url(#warning-object-shadow)"`;
  if (depth === "hero") return ` filter="url(#hero-shadow)"`;
  if (depth === "floating") return ` filter="url(#soft-object-shadow)"`;
  if (depth === "raised") return ` filter="url(#raised-panel-shadow)"`;
  return "";
}

function isRiskVisualNode(node) {
  if (node.kind === "annotation") return true;
  if (node.kind !== "symbol") return false;
  return /risk|review|permission|audit|policy|safety|biosecurity|durc|biosafety|containment|refusal/.test(String(node.payload?.assetId ?? ""));
}

function renderNodeBody(node) {
  if (node.kind === "text") {
    const anchor = node.payload.align ?? "middle";
    const x = anchor === "start" ? 0 : anchor === "end" ? node.transform.width : node.transform.width / 2;
    return renderTextBlock(node.payload.text, x, node.transform.height / 2, node.transform.width, node.transform.height, node.style, anchor);
  }
  if (node.kind === "shape") return renderShape(node);
  if (node.kind === "symbol") return renderSymbol(node);
  if (node.kind === "connector") return renderConnector(node);
  if (node.kind === "plot") return renderPlot(node);
  if (node.kind === "image") return renderImageNode(node);
  return "";
}

function renderShape(node) {
  const { width, height } = node.transform;
  const s = node.style;
  const label = node.payload.label ?? "";
  const text = label ? renderTextBlock(label, width / 2, height / 2, width - 26, height - 20, { ...s, fontWeight: 700 }, "middle") : "";
  if (node.payload.shape === "diamond") {
    const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
    const inset = `${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`;
    return `<polygon points="${points}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth ?? 2}"/><polygon points="${inset}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.42"/>${text}`;
  }
  if (node.payload.shape === "ellipse") {
    return `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth ?? 2}"/><ellipse cx="${width / 2}" cy="${height / 2}" rx="${Math.max(0, width / 2 - 1.5)}" ry="${Math.max(0, height / 2 - 1.5)}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.5"/><ellipse cx="${width * 0.34}" cy="${height * 0.28}" rx="${width * 0.16}" ry="${height * 0.07}" fill="#ffffff" opacity="0.35"/>${text}`;
  }
  const radius = node.payload.shape === "round-rect" ? 18 : 0;
  const highlightHeight = Math.min(30, Math.max(8, height * 0.42));
  const darkSurface = isDarkColor(s.fill ?? "#ffffff");
  return `<rect width="${width}" height="${height}" rx="${radius}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth ?? 2}"/><rect x="1" y="1" width="${Math.max(0, width - 2)}" height="${highlightHeight}" rx="${Math.max(0, radius - 1)}" fill="#ffffff" opacity="${darkSurface ? "0.08" : "0.26"}" pointer-events="none"/><rect x="1" y="1" width="${Math.max(0, width - 2)}" height="${Math.max(0, height - 2)}" rx="${Math.max(0, radius - 1)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="${darkSurface ? "0.18" : "0.48"}" pointer-events="none"/>${text}`;
}

function renderTextBlock(text, x, y, width, height, style = {}, anchor = "middle") {
  const fontSize = Number(style.fontSize ?? 18);
  const lineHeight = fontSize * 1.18;
  const maxChars = Math.max(8, Math.floor(width / (fontSize * 0.56)));
  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const lines = wrapWords(String(text), maxChars, maxLines);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  return `<text x="${x}" y="${startY}" text-anchor="${anchor}" dominant-baseline="middle" fill="${style.color ?? "#0f172a"}" font-size="${fontSize}" font-weight="${style.fontWeight ?? 600}" font-family="${style.fontFamily ?? "Inter, Arial, sans-serif"}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function wrapWords(text, maxChars, maxLines) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.+$/, "")}...`;
  return lines.length ? lines : [""];
}

function renderSymbol(node) {
  const { width, height } = node.transform;
  const s = node.style;
  const asset = findAsset(node.payload.assetId);
  const baseAppearance = node.payload.appearance ?? {};
  const showLabel = node.payload.showLabel !== false && baseAppearance.labelVisible !== false;
  const glyphHeight = showLabel ? Math.max(44, height - 26) : height;
  const appearance = { accent: s.stroke, stroke: s.stroke, strokeWidth: s.strokeWidth, labelColor: s.color, ...baseAppearance };
  const labelMetrics = symbolLabelMetrics(node.payload.label ?? node.name, width, Math.min(Number(s.fontSize ?? 12), 12));
  const profile = node.payload.styleProfile ?? appearance.styleProfile;
  const labelFill = profile === "dark-talk" ? "#0f172a" : "#ffffff";
  const labelStroke = profile === "publication-line" ? "#111827" : profile === "dark-talk" ? "#334155" : "none";
  const labelOpacity = profile === "publication-line" ? "0.96" : profile === "dark-talk" ? "0.78" : "0.58";
  const label = showLabel
    ? `<rect x="${(width - labelMetrics.boxWidth) / 2}" y="${height - 22}" width="${labelMetrics.boxWidth}" height="17" rx="8.5" fill="${labelFill}" stroke="${labelStroke}" stroke-width="${labelStroke === "none" ? 0 : 0.8}" opacity="${labelOpacity}"/><text x="${width / 2}" y="${height - 9}" text-anchor="middle" fill="${s.color ?? appearance.labelColor ?? "#0f172a"}" font-size="${labelMetrics.fontSize}" font-weight="680" font-family="Inter, Arial, sans-serif">${escapeXml(labelMetrics.text)}</text>`
    : "";
  return `${renderSharedPremiumAssetGlyph(asset, width, glyphHeight, { variant: node.payload.variant ?? "soft-3d-vector", styleProfile: node.payload.styleProfile ?? appearance.styleProfile, showLabel: false, appearance })}${label}`;
}

function symbolLabelMetrics(label, width, baseFontSize) {
  const text = String(label ?? "");
  const maxBoxWidth = Math.max(34, width - 10);
  const targetBoxWidth = Math.max(width * 0.68, Math.min(maxBoxWidth, text.length * baseFontSize * 0.54 + 14));
  const boxWidth = Math.min(maxBoxWidth, Math.max(34, targetBoxWidth));
  const availableTextWidth = Math.max(12, boxWidth - 12);
  const fontSize = Math.min(baseFontSize, Math.max(8.2, availableTextWidth / Math.max(1, text.length * 0.54)));
  const maxChars = Math.max(4, Math.floor(availableTextWidth / Math.max(4.5, fontSize * 0.54)));
  return {
    text: text.length > maxChars ? shortPlotLabel(text, maxChars) : text,
    fontSize,
    boxWidth
  };
}

function renderImageNode(node) {
  const asset = node.payload.assetId ? findAsset(node.payload.assetId) : null;
  if (asset?.kind === "image" && asset?.sourceAssetType) {
    return renderRealisticPreviewGlyph(asset, node.transform.width, node.transform.height, {
      label: node.payload.alt ?? node.name,
      styleProfile: node.payload.styleProfile ?? currentAssetStyleProfile(),
      crop: node.payload.crop,
      mask: node.payload.mask,
      appearance: node.payload.appearance,
      captionAnchor: node.payload.captionAnchor ?? "bottom",
      uid: node.id
    });
  }
  return `<image href="${escapeAttr(node.payload.src ?? asset?.dataUri ?? "")}" width="${node.transform.width}" height="${node.transform.height}" preserveAspectRatio="xMidYMid meet"/>`;
}

function assetCardPreviewSvg(asset, styleProfile) {
  if (asset.kind === "image" && asset.sourceAssetType) {
    return `<svg class="asset-preview-svg realistic-preview" viewBox="0 0 220 156" role="img" aria-label="${escapeAttr(asset.name)} preview"><defs>${renderDepthDefs(false)}</defs>${renderRealisticPreviewGlyph(asset, 210, 128, { showCaption: false, styleProfile })}<g class="asset-preview-scale-strip" transform="translate(12 132)"><rect width="196" height="16" rx="8" fill="#ffffff" opacity="0.82" stroke="#dbe4f0"/><text x="24" y="11" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="850">48</text><text x="98" y="11" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="850">120</text><text x="170" y="11" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="850">slide</text></g></svg>`;
  }
  return `<svg class="asset-preview-svg vector-preview" viewBox="0 0 220 156" role="img" aria-label="${escapeAttr(asset.name)} preview"><defs>${renderDepthDefs(false)}</defs><g class="asset-preview-main">${renderSharedPremiumAssetGlyph(asset, 220, 126, { showLabel: false, styleProfile })}</g><g class="asset-preview-scale-strip" transform="translate(12 132)"><rect width="196" height="16" rx="8" fill="#ffffff" opacity="0.86" stroke="#dbe4f0"/><g transform="translate(14 3) scale(0.18)">${renderSharedPremiumAssetGlyph(asset, 48, 48, { showLabel: false, styleProfile, detailLevel: "icon" })}</g><g transform="translate(81 1) scale(0.12)">${renderSharedPremiumAssetGlyph(asset, 120, 90, { showLabel: false, styleProfile, detailLevel: "preview" })}</g><text x="170" y="11" text-anchor="middle" fill="#64748b" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="850">slide</text></g></svg>`;
}

function renderRealisticPreviewGlyph(asset, width, height, options = {}) {
  const pad = Math.max(7, Math.min(width, height) * 0.055);
  const captionAnchor = options.showCaption === false ? "none" : (options.captionAnchor ?? "bottom");
  const showCaption = captionAnchor !== "none";
  const captionTop = captionAnchor === "top";
  const captionHeight = showCaption ? Math.min(24, Math.max(16, height * 0.16)) : 0;
  const imageHeight = Math.max(24, height - pad * 2 - captionHeight);
  const innerWidth = Math.max(24, width - pad * 2);
  const rx = Math.min(18, innerWidth * 0.08, imageHeight * 0.12);
  const clipSuffix = options.uid ? `-${String(options.uid).replace(/[^a-z0-9-]/gi, "-")}` : "";
  const clipId = `web-realistic-${asset.id.replace(/[^a-z0-9-]/gi, "-")}-${Math.round(width)}-${Math.round(height)}${clipSuffix}`;
  const wash = options.appearance?.colorWash ?? (options.styleProfile === "risk-warning" ? "#dc2626" : "#2563eb");
  const washOpacity = options.appearance?.colorWashOpacity ?? 0.12;
  const opacity = clampNumber(options.appearance?.opacity ?? 1, 0.1, 1);
  const contrast = clampNumber(options.appearance?.contrast ?? 1, 0.65, 1.45);
  const rimColor = options.appearance?.rimColor ?? "#ffffff";
  const crop = normalizedImageCrop(options.crop);
  const imageTop = pad + (captionTop ? captionHeight : 0);
  const imageX = pad - innerWidth * crop.x;
  const imageY = imageTop - imageHeight * crop.y;
  const imageWidth = innerWidth * crop.zoom;
  const imageHeightCropped = imageHeight * crop.zoom;
  const preserveAspectRatio = crop.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice";
  const maskShape = options.mask?.shape ?? "round-rect";
  const maskOverlay = renderRealisticMaskOverlay(maskShape, pad, imageTop, innerWidth, imageHeight, rx, wash);
  const imageMarkup = renderWebRealisticImageMarkup(asset, imageX, imageY, imageWidth, imageHeightCropped, preserveAspectRatio);
  const label = options.label ?? asset.name;
  return `<g class="scientific-realistic-asset web-realistic-preview" data-asset-id="${escapeAttr(asset.id)}" data-media-type="${escapeAttr(asset.mediaType ?? "image")}" data-realism-level="${escapeAttr(asset.realismLevel ?? "editorial")}">
    <defs><clipPath id="${escapeAttr(clipId)}"><rect x="${pad}" y="${imageTop}" width="${innerWidth}" height="${imageHeight}" rx="${rx}"/></clipPath></defs>
    <rect x="2" y="2" width="${Math.max(0, width - 4)}" height="${Math.max(0, height - 4)}" rx="${Math.min(22, height * 0.12)}" fill="#ffffff" stroke="#dbe4f0" stroke-width="1.2"/>
    <g clip-path="url(#${escapeAttr(clipId)})" opacity="${fmt(opacity)}" style="filter: contrast(${fmt(contrast)})">${imageMarkup}<rect x="${pad}" y="${imageTop}" width="${innerWidth}" height="${imageHeight}" fill="${escapeAttr(wash)}" opacity="${fmt(washOpacity)}"/><rect x="${pad}" y="${imageTop}" width="${innerWidth}" height="${imageHeight * 0.42}" fill="#ffffff" opacity="0.22"/>${maskOverlay}</g>
    <rect x="${pad + 1}" y="${imageTop + 1}" width="${Math.max(0, innerWidth - 2)}" height="${Math.max(0, imageHeight - 2)}" rx="${Math.max(0, rx - 1)}" fill="none" stroke="${escapeAttr(rimColor)}" stroke-width="2" opacity="0.72"/>
    <circle cx="${width - pad - 12}" cy="${imageTop + 14}" r="8" fill="${asset.rightsStatus === "curated-fixture" ? "#22c55e" : "#f59e0b"}" stroke="#ffffff" stroke-width="2"/>
    ${showCaption ? `<text x="${width / 2}" y="${captionTop ? pad + captionHeight * 0.58 : height - Math.max(7, pad * 0.7)}" text-anchor="middle" fill="#0f172a" font-size="${Math.min(12, Math.max(9, height * 0.07))}" font-weight="760" font-family="Inter, Arial, sans-serif">${escapeXml(shortPlotLabel(label, Math.max(12, Math.floor(width / 8))))}</text>` : ""}
  </g>`;
}

function renderWebRealisticImageMarkup(asset, x, y, width, height, preserveAspectRatio) {
  const fixture = inlineWebSvgFixtureMarkup(asset);
  if (fixture) {
    const resolution = asset.resolution ?? { width: 1024, height: 672 };
    return `<svg x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" viewBox="0 0 ${fmt(resolution.width)} ${fmt(resolution.height)}" preserveAspectRatio="${preserveAspectRatio}"><title>${escapeXml(asset.name)}</title>${fixture}</svg>`;
  }
  return `<image href="${escapeAttr(asset.dataUri ?? "")}" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" preserveAspectRatio="${preserveAspectRatio}"/>`;
}

function inlineWebSvgFixtureMarkup(asset) {
  if (asset.mediaType !== "svg-fixture" || !asset.dataUri?.startsWith("data:image/svg+xml")) return "";
  const commaIndex = asset.dataUri.indexOf(",");
  if (commaIndex < 0) return "";
  try {
    const encoded = asset.dataUri.slice(commaIndex + 1);
    const svg = asset.dataUri.includes(";base64,") ? atob(encoded) : decodeURIComponent(encoded);
    const match = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
    return match ? scopeWebInlineSvgIds(match[1], `web-fixture-${slug(asset.id)}`) : "";
  } catch {
    return "";
  }
}

function scopeWebInlineSvgIds(markup, scope) {
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  return ids.reduce((value, idValue) => {
    const scoped = `${scope}-${idValue}`;
    return value
      .replaceAll(`id="${idValue}"`, `id="${scoped}"`)
      .replaceAll(`url(#${idValue})`, `url(#${scoped})`)
      .replaceAll(`href="#${idValue}"`, `href="#${scoped}"`)
      .replaceAll(`xlink:href="#${idValue}"`, `xlink:href="#${scoped}"`);
  }, markup);
}

function normalizedImageCrop(crop = {}) {
  return {
    x: clampNumber(crop.x ?? 0, -0.35, 0.35),
    y: clampNumber(crop.y ?? 0, -0.35, 0.35),
    zoom: clampNumber(crop.zoom ?? 1, 0.8, 2.2),
    fit: crop.fit === "contain" ? "contain" : "cover"
  };
}

function renderRealisticMaskOverlay(shape, x, y, width, height, rx, wash) {
  if (shape === "circle") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = Math.min(width, height) * 0.46;
    return `<path d="M${x},${y}H${x + width}V${y + height}H${x}Z M${cx},${cy}m-${r},0a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0" fill="#ffffff" opacity="0.22" fill-rule="evenodd"/>`;
  }
  if (shape === "tissue-contour") {
    const d = `M${x + width * 0.12},${y + height * 0.46} C${x + width * 0.18},${y + height * 0.18} ${x + width * 0.45},${y + height * 0.08} ${x + width * 0.72},${y + height * 0.18} C${x + width * 0.95},${y + height * 0.28} ${x + width * 0.91},${y + height * 0.7} ${x + width * 0.68},${y + height * 0.82} C${x + width * 0.36},${y + height * 0.98} ${x + width * 0.08},${y + height * 0.78} ${x + width * 0.12},${y + height * 0.46}Z`;
    return `<path d="${d}" fill="none" stroke="${escapeAttr(wash)}" stroke-width="3" opacity="0.72"/><path d="${d}" fill="#ffffff" opacity="0.08"/>`;
  }
  if (shape === "soft-vignette") {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="none" stroke="#0f172a" stroke-width="12" opacity="0.08"/>`;
  }
  return "";
}

function renderConnector(node) {
  const points = node.payload.points.map((p) => ({ x: p.x - node.transform.x, y: p.y - node.transform.y }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return `<path d="${d}" fill="none" stroke="${node.style.stroke ?? "#334155"}" stroke-width="${node.style.strokeWidth ?? 3}" marker-end="url(#arrow-end)"/>`;
}

function renderPlot(node) {
  const spec = node.payload.spec;
  const w = node.transform.width;
  const h = node.transform.height;
  const compact = h < 170 || w < 460;
  const compactHeatmap = compact && spec.plotType === "heatmap";
  const barPlot = spec.plotType === "bar";
  const theme = plotTheme(spec);
  const margin = compact ? { left: compactHeatmap ? 66 : 48, top: compactHeatmap ? 32 : 28, right: compactHeatmap ? 58 : 18, bottom: barPlot ? 44 : compactHeatmap ? 36 : 28 } : { left: 44, top: 42, right: compactHeatmap ? 64 : 18, bottom: barPlot ? 48 : 34 };
  const frame = `<rect class="plot-frame${compact ? " plot-compact-frame" : ""}" width="${w}" height="${h}" rx="8" fill="${theme.frameFill}" stroke="${theme.frameStroke}"/><rect x="1" y="1" width="${Math.max(0, w - 2)}" height="${compact ? 23 : 28}" rx="7" fill="${theme.headerFill}"/><text x="${w / 2}" y="${compact ? 17 : 20}" text-anchor="middle" font-size="${compact ? 12.5 : 13}" font-weight="800" font-family="Inter, Arial, sans-serif" fill="${theme.text}">${escapeXml(spec.title)}</text>`;
  if (spec.plotType === "heatmap") return `${frame}${renderHeatmapPlot(spec, w, h, margin, theme)}`;
  const points = plotPoints(spec);
  const sx = scale(points.map((p) => p.x), margin.left, w - margin.right);
  const sy = scale(points.map((p) => p.y), h - margin.bottom, margin.top);
  const plotH = h - margin.top - margin.bottom;
  const axis = `<path d="M${margin.left},${h - margin.bottom} H${w - margin.right} M${margin.left},${h - margin.bottom} V${margin.top}" stroke="${theme.axis}" stroke-width="${compact ? 1 : 1.2}" fill="none"/>${compact ? `<text x="15" y="${margin.top + plotH / 2}" text-anchor="middle" transform="rotate(-90 15 ${margin.top + plotH / 2})" font-size="8.5" font-weight="700" fill="${theme.muted}">${escapeXml(shortPlotLabel(spec.plotType === "volcano" ? "-log10(p)" : spec.encodings.y ?? "", 12))}</text><text x="${margin.left + (w - margin.left - margin.right) / 2}" y="${h - 8}" text-anchor="middle" font-size="8.8" font-weight="700" fill="${theme.muted}">${escapeXml(shortPlotLabel(spec.encodings.x ?? "", 14))}</text>` : `<text x="${w / 2}" y="${h - 9}" text-anchor="middle" font-size="10" font-weight="700" fill="${theme.muted}">${escapeXml(spec.encodings.x ?? "")}</text><text x="13" y="${h / 2}" text-anchor="middle" transform="rotate(-90 13 ${h / 2})" font-size="10" font-weight="700" fill="${theme.muted}">${escapeXml(spec.plotType === "volcano" ? "-log10(p)" : spec.encodings.y ?? "")}</text>`}`;
  if (["bar", "box", "violin", "dot"].includes(spec.plotType)) {
    return `${frame}${axis}${renderGroupedPlot(spec, margin.left, margin.top, w - margin.left - margin.right, h - margin.top - margin.bottom, theme)}`;
  }
  if (spec.plotType === "line") {
    return `${frame}${axis}${renderLinePlot(spec, margin.left, margin.top, w - margin.left - margin.right, h - margin.top - margin.bottom)}`;
  }
  if (spec.plotType === "volcano") {
    return `${frame}${axis}${renderVolcanoPlot(points, margin.left, margin.top, w - margin.left - margin.right, h - margin.top - margin.bottom, theme)}`;
  }
  if (spec.plotType === "embedding-scatter") {
    return `${frame}${axis}${renderEmbeddingPlot(points, margin.left, margin.top, w - margin.left - margin.right, h - margin.top - margin.bottom, theme)}`;
  }
  return `${frame}${axis}${points.map((p) => `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="4.5" fill="${theme.color(p.group)}" opacity="0.86" stroke="${theme.pointStroke}" stroke-width="0.4"/>`).join("")}`;
}

function renderEmbeddingPlot(points, x, y, width, height, theme) {
  if (!points.length) return "";
  const compact = height < 95 || width < 310;
  const sx = scale(points.map((point) => point.x), x, x + width);
  const sy = scale(points.map((point) => point.y), y + height, y);
  const screenPoints = points.map((point) => ({
    ...point,
    group: point.group || "Cells",
    sx: sx(point.x),
    sy: sy(point.y)
  }));
  const groups = [...new Set(screenPoints.map((point) => point.group).filter(Boolean))].slice(0, compact ? 4 : 6);
  const grid = [0.25, 0.5, 0.75].map((ratio) => {
    const gx = x + width * ratio;
    const gy = y + height * ratio;
    return `<path class="plot-embedding-grid" d="M${fmt(gx)},${fmt(y)} V${fmt(y + height)} M${fmt(x)},${fmt(gy)} H${fmt(x + width)}" stroke="${theme.grid}" stroke-width="0.65" opacity="${ratio === 0.5 ? "0.62" : "0.4"}"/>`;
  }).join("");
  const hulls = groups.map((group) => renderEmbeddingHull(group, screenPoints.filter((point) => point.group === group), compact, theme)).join("");
  const marks = screenPoints.map((point) => `<circle class="plot-embedding-point" data-group="${escapeAttr(point.group)}" cx="${fmt(point.sx)}" cy="${fmt(point.sy)}" r="${fmt(compact ? 3.4 : 4.4)}" fill="${theme.color(point.group)}" opacity="0.9" stroke="${theme.pointStroke}" stroke-width="${compact ? "0.8" : "1"}"/>`).join("");
  const centroidMarks = groups.map((group) => {
    const centroid = embeddingCentroid(screenPoints.filter((point) => point.group === group));
    return `<circle class="plot-embedding-centroid" data-group="${escapeAttr(group)}" cx="${fmt(centroid.x)}" cy="${fmt(centroid.y)}" r="${fmt(compact ? 4.6 : 5.8)}" fill="none" stroke="${theme.color(group)}" stroke-width="1.1" opacity="0.72"/>`;
  }).join("");
  const labels = groups.map((group, index) => renderEmbeddingClusterLabel(group, screenPoints.filter((point) => point.group === group), x, y, width, height, compact, index, theme)).join("");
  const summary = `<text class="plot-embedding-summary" x="${fmt(x + width - 4)}" y="${fmt(y + height - 5)}" text-anchor="end" font-size="${compact ? "7.4" : "8.8"}" font-weight="760" fill="${theme.muted}">${groups.length} clusters / n=${points.length}</text>`;
  return `<g class="plot-embedding-layer"><rect class="plot-embedding-field" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="7" fill="${theme.fieldFill}" stroke="${theme.grid}" opacity="${theme.mode === "dark" ? "0.95" : "0.82"}"/>${grid}${hulls}${marks}${centroidMarks}${labels}${summary}</g>`;
}

function renderEmbeddingHull(group, points, compact, theme) {
  if (!points.length) return "";
  const color = theme.color(group);
  const centroid = embeddingCentroid(points);
  const xs = points.map((point) => point.sx);
  const ys = points.map((point) => point.sy);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padX = compact ? 9 : 15;
  const padY = compact ? 7 : 12;
  if (points.length < 3) {
    const rx = Math.max(compact ? 13 : 18, (maxX - minX) / 2 + padX);
    const ry = Math.max(compact ? 10 : 14, (maxY - minY) / 2 + padY);
    return `<ellipse class="plot-embedding-cluster-hull" data-group="${escapeAttr(group)}" cx="${fmt(centroid.x)}" cy="${fmt(centroid.y)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${color}" opacity="${theme.mode === "publication" ? "0.08" : "0.13"}" stroke="${color}" stroke-width="1.1"/>`;
  }
  const boundary = points.map((point) => {
    const dx = point.sx - centroid.x;
    const dy = point.sy - centroid.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    return {
      x: point.sx + (dx / length) * padX,
      y: point.sy + (dy / length) * padY,
      angle: Math.atan2(dy, dx)
    };
  }).sort((a, b) => a.angle - b.angle);
  const d = smoothClosedPath(boundary);
  return `<path class="plot-embedding-cluster-hull" data-group="${escapeAttr(group)}" d="${d}" fill="${color}" opacity="${theme.mode === "publication" ? "0.08" : "0.13"}" stroke="${color}" stroke-width="1.05"/><path class="plot-embedding-cluster-rim" d="${d}" fill="none" stroke="${theme.mode === "dark" ? "#0f172a" : "#ffffff"}" stroke-width="0.8" opacity="0.7"/>`;
}

function renderEmbeddingClusterLabel(group, points, x, y, width, height, compact, index, theme) {
  const centroid = embeddingCentroid(points);
  const label = shortPlotLabel(group, compact ? 9 : 13);
  const fontSize = compact ? 7.6 : 9.4;
  const labelWidth = Math.max(compact ? 34 : 44, label.length * (compact ? 5.1 : 6) + 15);
  const labelHeight = compact ? 14 : 17;
  const labelX = clampNumber(centroid.x, x + labelWidth / 2 + 2, x + width - labelWidth / 2 - 2);
  const labelY = clampNumber(centroid.y - (compact ? 13 : 16) + (index % 2) * (compact ? 5 : 7), y + labelHeight / 2 + 2, y + height - labelHeight / 2 - 12);
  return `<g class="plot-embedding-cluster-label" data-group="${escapeAttr(group)}"><rect class="plot-embedding-label-bg" x="${fmt(labelX - labelWidth / 2)}" y="${fmt(labelY - labelHeight / 2)}" width="${fmt(labelWidth)}" height="${fmt(labelHeight)}" rx="${fmt(labelHeight / 2)}" fill="${theme.mode === "dark" ? "#1e293b" : "#ffffff"}" stroke="${theme.color(group)}" stroke-width="0.8" opacity="0.92"/><text x="${fmt(labelX)}" y="${fmt(labelY + fontSize * 0.33)}" text-anchor="middle" font-size="${fmt(fontSize)}" font-weight="800" fill="${theme.label}">${escapeXml(label)}</text></g>`;
}

function embeddingCentroid(points) {
  const sum = points.reduce((acc, point) => ({ x: acc.x + point.sx, y: acc.y + point.sy }), { x: 0, y: 0 });
  return { x: sum.x / Math.max(points.length, 1), y: sum.y / Math.max(points.length, 1) };
}

function smoothClosedPath(points) {
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = midpoint(points[points.length - 1], points[0]);
  return `${points.reduce((path, point, index) => {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(point, next);
    return `${path} Q${fmt(point.x)},${fmt(point.y)} ${fmt(mid.x)},${fmt(mid.y)}`;
  }, `M${fmt(start.x)},${fmt(start.y)}`)} Z`;
}

function renderVolcanoPlot(points, x, y, width, height, theme) {
  if (!points.length) return "";
  const compact = height < 90 || width < 380;
  const isPublication = theme.mode === "publication";
  const fcThreshold = 1;
  const pThreshold = 4;
  const maxAbsX = Math.max(fcThreshold * 1.55, ...points.map((point) => Math.abs(point.x))) * 1.08;
  const maxY = Math.max(pThreshold * 1.18, ...points.map((point) => point.y)) * 1.06;
  const sx = (value) => x + ((value + maxAbsX) / (maxAbsX * 2)) * width;
  const sy = (value) => y + height - (Math.max(0, value) / maxY) * height;
  const thresholdY = sy(pThreshold);
  const leftThresholdX = sx(-fcThreshold);
  const rightThresholdX = sx(fcThreshold);
  const xTicks = [-Math.ceil(maxAbsX), -fcThreshold, 0, fcThreshold, Math.ceil(maxAbsX)]
    .filter((value, index, values) => values.indexOf(value) === index && value >= -maxAbsX && value <= maxAbsX);
  const yTicks = [0, pThreshold / 2, pThreshold, Math.ceil(maxY)].filter((value, index, values) => values.indexOf(value) === index && value <= maxY);
  const grid = [
    ...xTicks.map((value) => `<g class="plot-volcano-axis-tick"><path class="plot-volcano-grid" d="M${sx(value)},${y} V${y + height}" stroke="${theme.grid}" stroke-width="0.65" opacity="${value === 0 ? "0.82" : "0.55"}"/><text x="${sx(value)}" y="${y + height + 11}" text-anchor="middle" font-size="7.2" font-weight="700" fill="${theme.muted}">${escapeXml(fmtCompactNumber(value))}</text></g>`),
    ...yTicks.map((value) => `<g class="plot-volcano-axis-tick"><path class="plot-volcano-grid" d="M${x},${sy(value)} H${x + width}" stroke="${theme.grid}" stroke-width="0.65" opacity="${value === pThreshold ? "0.2" : "0.58"}"/><text x="${x - 6}" y="${sy(value) + 2.8}" text-anchor="end" font-size="7.2" font-weight="700" fill="${theme.muted}">${escapeXml(fmtCompactNumber(value))}</text></g>`)
  ].join("");
  const hitPoints = points
    .filter((point) => point.label && Math.abs(point.x) >= fcThreshold && point.y >= pThreshold)
    .sort((a, b) => b.y - a.y)
    .slice(0, compact ? 3 : 4);
  const significanceZones = isPublication ? [] : [
    `<rect class="plot-volcano-significance-zone" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(Math.max(0, leftThresholdX - x))}" height="${fmt(Math.max(0, thresholdY - y))}" fill="#ede9fe" opacity="0.18"/>`,
    `<rect class="plot-volcano-significance-zone" x="${fmt(rightThresholdX)}" y="${fmt(y)}" width="${fmt(Math.max(0, x + width - rightThresholdX))}" height="${fmt(Math.max(0, thresholdY - y))}" fill="#ccfbf1" opacity="0.18"/>`
  ];
  const journalReferenceBand = isPublication
    ? `<g class="plot-journal-volcano-reference-band" aria-label="publication volcano threshold guide"><path class="plot-journal-volcano-reference-bracket" d="M${fmt(leftThresholdX)},${fmt(thresholdY - 5)} V${fmt(thresholdY + 5)} M${fmt(rightThresholdX)},${fmt(thresholdY - 5)} V${fmt(thresholdY + 5)} M${fmt(leftThresholdX)},${fmt(thresholdY)} H${fmt(rightThresholdX)}" fill="none" stroke="#111827" stroke-width="0.85" opacity="0.62"/><path class="plot-journal-volcano-reference-cap" d="M${fmt(x)},${fmt(thresholdY)} H${fmt(x + width)}" fill="none" stroke="#111827" stroke-width="0.45" opacity="0.28"/></g>`
    : "";
  const guides = [
    ...significanceZones,
    journalReferenceBand,
    `<path class="plot-volcano-threshold-line" d="M${leftThresholdX},${y} V${y + height} M${rightThresholdX},${y} V${y + height}" stroke="${theme.muted}" stroke-width="0.8" stroke-dasharray="4 5" opacity="0.62"/>`,
    `<path class="plot-volcano-threshold-line" d="M${x},${thresholdY} H${x + width}" stroke="${isPublication ? "#111827" : "#f59e0b"}" stroke-width="0.9" stroke-dasharray="4 5" opacity="0.78"/>`,
    `<path class="plot-volcano-zero-line" d="M${sx(0)},${y} V${y + height}" stroke="${theme.grid}" stroke-width="0.8" opacity="0.72"/>`,
    `<text class="plot-volcano-threshold-label${isPublication ? " plot-journal-threshold-label" : ""}" x="${x + 5}" y="${Math.max(y + 10, thresholdY - 4)}" font-size="7.6" font-weight="${isPublication ? "650" : "700"}" fill="${theme.label}">adj. P &lt; 1e-4</text>`,
    `<text class="plot-volcano-effect-threshold-label${isPublication ? " plot-journal-threshold-label" : ""}" x="${sx(0)}" y="${y + 10}" text-anchor="middle" font-size="7.2" font-weight="${isPublication ? "650" : "700"}" fill="${theme.muted}">|log2FC| = 1</text>`,
    compact ? "" : `<text class="plot-volcano-direction-label" x="${x + 7}" y="${y + height - 6}" font-size="7.6" font-weight="800" fill="${theme.color("down")}">depleted</text><text class="plot-volcano-direction-label" x="${x + width - 7}" y="${y + height - 6}" text-anchor="end" font-size="7.6" font-weight="800" fill="${theme.color("up")}">enriched</text>`
  ].join("");
  const marks = points
    .sort((a, b) => Number(Math.abs(a.x) >= fcThreshold && a.y >= pThreshold) - Number(Math.abs(b.x) >= fcThreshold && b.y >= pThreshold))
    .map((point) => {
      const significant = Math.abs(point.x) >= fcThreshold && point.y >= pThreshold;
      const direction = point.x < -fcThreshold ? "down" : point.x > fcThreshold ? "up" : "neutral";
      const fill = significant ? (direction === "down" ? theme.color("down") : theme.color("up")) : theme.muted;
      const opacity = significant ? "0.9" : "0.5";
      const radius = significant ? Math.min(5.6, Math.max(4.3, 3.4 + point.y * 0.18)) : 3.4;
      const halo = significant && !isPublication ? `<circle class="plot-volcano-hit-halo" cx="${sx(point.x)}" cy="${sy(point.y)}" r="${radius + 3.6}" fill="${fill}" opacity="0.13"/>` : "";
      return `${halo}<circle class="plot-volcano-point ${significant ? `significant ${direction}` : "background"}" data-group="${escapeAttr(point.group)}" cx="${sx(point.x)}" cy="${sy(point.y)}" r="${radius}" fill="${fill}" opacity="${opacity}" stroke="${theme.pointStroke}" stroke-width="${significant ? "1" : "0.45"}"/>`;
    })
    .join("");
  let upLabelIndex = 0;
  let downLabelIndex = 0;
  const labels = hitPoints
    .map((point, index) => {
      const pointX = sx(point.x);
      const pointY = sy(point.y);
      const placeLeft = point.x > 0;
      const stackIndex = placeLeft ? upLabelIndex++ : downLabelIndex++;
      const labelX = compact ? (placeLeft ? x + width - 12 : x + 12) : Math.max(x + 18, Math.min(x + width - 18, pointX + (placeLeft ? -24 : 24)));
      const labelY = compact ? Math.min(y + height - 8, y + 13 + stackIndex * 10) : Math.max(y + 12, Math.min(y + height - 8, pointY + (index % 2 ? 12 : -8)));
      const leader = isPublication ? "" : `<path class="plot-volcano-label-leader" d="M${pointX},${pointY} L${labelX + (placeLeft ? 4 : -4)},${labelY - 3}" stroke="${theme.muted}" stroke-width="0.65" opacity="0.62"/>`;
      return `${leader}<text class="plot-volcano-label${isPublication ? " plot-journal-volcano-label" : ""}" x="${labelX}" y="${labelY}" text-anchor="${placeLeft ? "end" : "start"}" font-size="8.4" font-weight="${isPublication ? "690" : "760"}" fill="${theme.label}">${escapeXml(shortPlotLabel(point.label, 8))}</text>`;
    })
    .join("");
  const legendX = x + width - 92;
  const legendY = compact ? y - 8 : y + 9;
  const legendClass = `plot-volcano-legend${isPublication ? " plot-journal-volcano-legend" : ""}`;
  const upMarker = isPublication ? `<circle cx="0" cy="0" r="3.2" fill="none" stroke="${theme.color("up")}" stroke-width="0.9"/>` : `<circle cx="0" cy="0" r="3.4" fill="${theme.color("up")}"/>`;
  const downMarker = isPublication ? `<circle cx="45" cy="0" r="3.2" fill="none" stroke="${theme.color("down")}" stroke-width="0.9"/>` : `<circle cx="45" cy="0" r="3.4" fill="${theme.color("down")}"/>`;
  const legend = `<g class="${legendClass}" transform="translate(${legendX} ${legendY})">${upMarker}<text x="8" y="3" font-size="7.8" font-weight="${isPublication ? "650" : "700"}" fill="${theme.muted}">up hit</text>${downMarker}<text x="53" y="3" font-size="7.8" font-weight="${isPublication ? "650" : "700"}" fill="${theme.muted}">down</text></g>`;
  return `<g class="plot-volcano-layer">${grid}${guides}${marks}${labels}${legend}</g>`;
}

function renderLinePlot(spec, x, y, width, height) {
  const points = plotPoints(spec).sort((a, b) => a.x - b.x);
  const sx = scale(points.map((p) => p.x), x, x + width);
  const sy = scale(points.map((p) => p.y), y + height, y);
  const compact = height < 45;
  const d = points.map((p, index) => `${index === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ");
  return `<path d="${d}" fill="none" stroke="#2563eb" stroke-width="${compact ? 2.2 : 3}"/>${points.map((p) => `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${compact ? 3 : 4}" fill="#2563eb" stroke="#ffffff" stroke-width="${compact ? 0.8 : 0}"/>`).join("")}`;
}

function renderGroupedPlot(spec, x, y, width, height, theme = plotTheme(spec)) {
  const xColumn = spec.encodings.x;
  const yColumn = spec.encodings.y;
  const groups = [...new Set(spec.table.rows.map((row) => String(row[xColumn] ?? "")))].filter(Boolean);
  const valuesByGroup = groups.map((group) => ({
    group,
    values: spec.table.rows.filter((row) => String(row[xColumn] ?? "") === group).map((row) => Number(row[yColumn])).filter(Number.isFinite)
  }));
  const allValues = valuesByGroup.flatMap((entry) => entry.values);
  const isPublication = theme.mode === "publication";
  const sy = scale(allValues, y + height, y);
  const band = width / Math.max(groups.length, 1);
  const compact = height < 48 || band < 118;
  const labelFont = compact ? 8.5 : 11;
  const labelY = y + height + (compact ? 14 : 18);
  const labelMaxChars = Math.max(compact ? 8 : 10, Math.floor(band / (compact ? 7.2 : 8.5)));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const baseline = sy(0);
  const tickValues = uniqueNumbers([minValue, 0, maxValue / 2, maxValue]).filter((value) => value >= minValue && value <= maxValue);
  const guides = tickValues.map((value) => `<g class="plot-bar-axis-tick"><path class="plot-bar-grid" d="M${x},${sy(value)} H${x + width}" stroke="${theme.grid}" stroke-width="${value === 0 ? "1" : "0.75"}" opacity="${value === 0 ? "0.9" : "0.62"}"/><text x="${x - 7}" y="${sy(value) + 3}" text-anchor="end" font-size="7.6" font-weight="700" fill="${theme.muted}">${escapeXml(fmtCompactNumber(value))}</text></g>`).join("");
  const threshold = spec.plotType === "bar" ? plotThresholdValue(spec) : undefined;
  const thresholdBand = isPublication && threshold !== undefined && threshold >= minValue && threshold <= maxValue
    ? `<rect class="plot-journal-bar-threshold-band" x="${x}" y="${Math.max(y, sy(threshold) - 3.5)}" width="${width}" height="${Math.min(height, 7)}" fill="#111827" opacity="0.035"/>`
    : "";
  const thresholdGuide = threshold !== undefined && threshold >= minValue && threshold <= maxValue
    ? `<g class="plot-bar-threshold" data-threshold="${escapeAttr(fmtCompactNumber(threshold))}"><path class="plot-bar-threshold-line" d="M${x},${sy(threshold)} H${x + width}" stroke="${isPublication ? "#111827" : "#f59e0b"}" stroke-width="0.9" stroke-dasharray="4 4" opacity="0.78"/><text class="plot-bar-threshold-label${isPublication ? " plot-journal-bar-threshold-label" : ""}" x="${x + width - 4}" y="${Math.max(y + 9, sy(threshold) - 4)}" text-anchor="end" font-size="${compact ? "7.2" : "8.2"}" font-weight="760" fill="${theme.label}">threshold = ${escapeXml(fmtCompactNumber(threshold))}</text></g>`
    : "";
  const bars = valuesByGroup.map((entry, index) => {
    const cx = x + band * index + band / 2;
    const mean = entry.values.reduce((sum, value) => sum + value, 0) / Math.max(entry.values.length, 1);
    const top = sy(mean);
    const barY = Math.min(top, baseline);
    const barHeight = Math.max(1, Math.abs(baseline - top));
    const fill = theme.color(entry.group);
    const valueLabel = compact && barHeight < 18 ? "" : `<text class="plot-bar-value-label${isPublication ? " plot-journal-bar-value-label" : ""}" x="${cx}" y="${Math.max(y + 8, barY - 5)}" text-anchor="middle" font-size="${compact ? 7.4 : 8.8}" font-weight="800" fill="${theme.label}">${escapeXml(fmtCompactNumber(mean))}</text>`;
    const categoryLabel = renderBarCategoryLabel(entry.group, cx, labelY, labelFont, labelMaxChars, compact ? 2 : 3, theme);
    const track = isPublication ? "" : `<rect class="plot-bar-track" x="${cx - band * 0.31}" y="${y}" width="${band * 0.62}" height="${height}" rx="${Math.min(5, band * 0.08)}" fill="${theme.fieldFill}" opacity="0.72"/>`;
    const barRadius = isPublication ? 0 : Math.min(4, band * 0.08);
    const highlight = isPublication ? "" : `<path class="plot-bar-highlight" d="M${cx - band * 0.22},${barY + 3} H${cx + band * 0.22}" stroke="${theme.pointStroke}" stroke-width="1.1" opacity="0.54"/>`;
    const cap = isPublication ? `<path class="plot-journal-bar-cap" d="M${cx - band * 0.25},${barY} H${cx + band * 0.25}" stroke="#111827" stroke-width="0.85" opacity="0.82"/>` : "";
    return `${track}<rect class="plot-bar-mark${isPublication ? " plot-journal-bar-mark" : ""}" data-group="${escapeAttr(entry.group)}" data-value="${escapeAttr(fmtCompactNumber(mean))}" x="${cx - band * 0.26}" y="${barY}" width="${band * 0.52}" height="${barHeight}" rx="${barRadius}" fill="${fill}" opacity="${isPublication ? "1" : "0.88"}"/>${cap}${highlight}${valueLabel}${categoryLabel}`;
  }).join("");
  return `<g class="plot-bar-layer">${guides}${thresholdBand}${thresholdGuide}${bars}</g>`;
}

function plotThresholdValue(spec) {
  const metadata = spec && typeof spec.journalPlot === "object" && spec.journalPlot !== null ? spec.journalPlot : {};
  if (typeof metadata.threshold === "number" && Number.isFinite(metadata.threshold)) return metadata.threshold;
  if (typeof metadata.threshold === "string" && Number.isFinite(Number(metadata.threshold))) return Number(metadata.threshold);
  const rowThresholds = uniqueNumbers((spec.table?.rows ?? []).map((row) => Number(row.threshold)).filter(Number.isFinite));
  return rowThresholds.length === 1 ? rowThresholds[0] : undefined;
}

function renderBarCategoryLabel(label, x, y, fontSize, maxChars, maxLines, theme = plotTheme({ style: {} })) {
  const normalized = String(label).replace(/[/_]+/g, " ").replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();
  const lines = wrapWords(normalized || String(label), maxChars, maxLines);
  const tspans = lines.map((line, index) => `<tspan class="plot-bar-category-line" x="${x}" dy="${index === 0 ? 0 : fontSize + 2}">${escapeXml(line)}</tspan>`).join("");
  return `<text class="plot-bar-category-label${theme.mode === "publication" ? " plot-journal-bar-category-label" : ""}" data-lines="${lines.length}" x="${x}" y="${y}" text-anchor="middle" font-size="${fontSize}" font-weight="760" fill="${theme.label}">${tspans}</text>`;
}

function plotPoints(spec) {
  return spec.table.rows.map((row) => {
    const x = Number(row[spec.encodings.x]);
    const yRaw = Number(row[spec.encodings.y]);
    if (!Number.isFinite(x) || !Number.isFinite(yRaw)) return null;
    return {
      x,
      y: spec.plotType === "volcano" ? -Math.log10(Math.max(yRaw, 1e-300)) : yRaw,
      group: String(row[spec.encodings.color ?? spec.encodings.group] ?? ""),
      label: spec.encodings.label ? String(row[spec.encodings.label] ?? "") : ""
    };
  }).filter(Boolean);
}

function renderHeatmapPlot(spec, w, h, margin, theme = plotTheme(spec)) {
  const xColumn = spec.encodings.x;
  const yColumn = spec.encodings.y;
  const valueColumn = spec.encodings.value;
  if (!xColumn || !yColumn || !valueColumn) return "";
  const xs = [...new Set(spec.table.rows.map((row) => String(row[xColumn] ?? "")))].filter(Boolean);
  const ys = [...new Set(spec.table.rows.map((row) => String(row[yColumn] ?? "")))].filter(Boolean);
  const values = spec.table.rows.map((row) => Number(row[valueColumn])).filter(Number.isFinite);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;
  const cellW = plotW / Math.max(1, xs.length);
  const cellH = plotH / Math.max(1, ys.length);
  const labelFont = Math.max(7.4, Math.min(8.6, cellH - 3));
  const isPublication = theme.mode === "publication";
  const separator = theme.mode === "publication" ? "#e5e7eb" : theme.mode === "dark" ? "#0f172a" : "#ffffff";
  const rowLines = ys.slice(1).map((_, index) => {
    const lineY = margin.top + (index + 1) * cellH;
    return `<path class="plot-heatmap-row-guide" d="M${margin.left},${lineY} H${margin.left + plotW}" stroke="${separator}" stroke-width="1.2" opacity="0.95"/>`;
  }).join("");
  const columnLines = xs.slice(1).map((_, index) => {
    const lineX = margin.left + (index + 1) * cellW;
    return `<path class="plot-heatmap-column-guide" d="M${lineX},${margin.top} V${margin.top + plotH}" stroke="${separator}" stroke-width="1.2" opacity="0.95"/>`;
  }).join("");
  const rowByKey = new Map(spec.table.rows.map((row) => [`${String(row[xColumn] ?? "")}\u0000${String(row[yColumn] ?? "")}`, row]));
  const entries = isPublication
    ? xs.flatMap((xValue) => ys.map((yValue) => ({ xValue, yValue, row: rowByKey.get(`${xValue}\u0000${yValue}`) })))
    : spec.table.rows.map((row) => ({ xValue: String(row[xColumn] ?? ""), yValue: String(row[yColumn] ?? ""), row }));
  const cells = entries.map(({ xValue, yValue, row }) => {
    const xi = xs.indexOf(xValue);
    const yi = ys.indexOf(yValue);
    const value = Number(row?.[valueColumn]);
    const hasValue = Number.isFinite(value);
    if (xi < 0 || yi < 0) return "";
    const t = hasValue ? (value - min) / Math.max(max - min, 1e-9) : 0;
    const bin = Math.max(0, Math.min(4, Math.round(t * 4)));
    const rectX = margin.left + xi * cellW;
    const rectY = margin.top + yi * cellH;
    const className = `plot-heatmap-cell${isPublication ? " plot-journal-heatmap-cell" : ""}${hasValue ? "" : " plot-journal-heatmap-missing-cell"}`;
    const stroke = isPublication ? ` stroke="${theme.grid}" stroke-width="0.45"` : "";
    const missingMark = isPublication && !hasValue
      ? `<path class="plot-journal-heatmap-missing-mark" d="M${rectX + cellW * 0.28},${rectY + cellH * 0.72} L${rectX + cellW * 0.72},${rectY + cellH * 0.28}" stroke="${theme.grid}" stroke-width="0.55" opacity="0.72"/>`
      : "";
    return `<rect class="${className}" data-x="${escapeAttr(xValue)}" data-y="${escapeAttr(yValue)}"${isPublication ? ` data-bin="${bin}"` : ""} x="${rectX}" y="${rectY}" width="${Math.max(1, cellW)}" height="${Math.max(1, cellH)}" rx="${isPublication ? 0 : 1.8}" fill="${hasValue ? theme.heat(value, min, max) : theme.fieldFill}"${stroke}/>${missingMark}`;
  }).join("");
  const axisTicks = isPublication
    ? `<g class="plot-journal-heatmap-axis-ticks">${xs.map((_, index) => {
      const tickX = margin.left + index * cellW + cellW / 2;
      return `<path class="plot-journal-heatmap-axis-tick" d="M${tickX},${margin.top + plotH} v3.8" stroke="${theme.axis}" stroke-width="0.55" opacity="0.75"/>`;
    }).join("")}${ys.map((_, index) => {
      const tickY = margin.top + index * cellH + cellH / 2;
      return `<path class="plot-journal-heatmap-axis-tick" d="M${margin.left},${tickY} h-3.8" stroke="${theme.axis}" stroke-width="0.55" opacity="0.75"/>`;
    }).join("")}</g>`
    : "";
  const xLabels = xs.map((label, index) => `<text class="plot-heatmap-column-label" x="${margin.left + index * cellW + cellW / 2}" y="${h - 12}" text-anchor="middle" font-size="${labelFont}" font-weight="700" fill="${theme.muted}">${escapeXml(label.slice(0, 9))}</text>`).join("");
  const yLabels = ys.map((label, index) => `<text class="plot-heatmap-row-label" x="${margin.left - 9}" y="${margin.top + index * cellH + cellH / 2 + labelFont / 3}" text-anchor="end" font-size="${labelFont}" font-weight="700" fill="${theme.muted}">${escapeXml(label.slice(0, 9))}</text>`).join("");
  const colorbarX = margin.left + plotW + 13;
  const colorbarH = Math.max(42, Math.min(plotH, 78));
  const colorbarY = margin.top + Math.max(0, (plotH - colorbarH) / 2);
  const colorbarStops = isPublication
    ? Array.from({ length: 5 }, (_, index) => {
      const t = index / 4;
      const swatchH = colorbarH / 5;
      const barY = colorbarY + (4 - index) * swatchH;
      return `<rect class="plot-heatmap-colorbar-stop plot-journal-heatmap-swatch" data-bin="${index}" x="${colorbarX}" y="${barY}" width="8" height="${swatchH + 0.2}" fill="${theme.heat(min + t * (max - min), min, max)}" stroke="${theme.grid}" stroke-width="0.35"/>`;
    }).join("")
    : Array.from({ length: 18 }, (_, index) => {
      const t = index / 17;
      const barY = colorbarY + (1 - t) * colorbarH;
      return `<rect class="plot-heatmap-colorbar-stop" x="${colorbarX}" y="${barY}" width="8" height="${Math.ceil(colorbarH / 17) + 0.6}" fill="${theme.heat(min + t * (max - min), min, max)}"/>`;
    }).join("");
  const colorbarTicks = isPublication
    ? `<path class="plot-heatmap-colorbar-tick plot-journal-colorbar-tick" d="M${colorbarX + 9},${colorbarY} h5 M${colorbarX + 9},${colorbarY + colorbarH / 2} h4 M${colorbarX + 9},${colorbarY + colorbarH} h5" fill="none" stroke="${theme.muted}" stroke-width="0.55" opacity="0.8"/>`
    : "";
  const colorbar = `<g class="plot-heatmap-colorbar"><rect x="${colorbarX - 1}" y="${colorbarY - 1}" width="10" height="${colorbarH + 2}" rx="${isPublication ? 0 : 3}" fill="${theme.frameFill}" stroke="${theme.frameStroke}"/>${colorbarStops}${colorbarTicks}<text x="${colorbarX + 15}" y="${colorbarY + 3}" font-size="7.4" font-weight="700" fill="${theme.muted}">${escapeXml(fmtCompactNumber(max))}</text><text x="${colorbarX + 15}" y="${colorbarY + colorbarH}" font-size="7.4" font-weight="700" fill="${theme.muted}">${escapeXml(fmtCompactNumber(min))}</text></g>`;
  return `<g class="plot-heatmap-layer"><rect class="plot-heatmap-matrix-frame" x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" rx="${isPublication ? 0 : 5}" fill="${theme.fieldFill}" stroke="${theme.grid}"/>${cells}${rowLines}${columnLines}${axisTicks}${xLabels}${yLabels}${colorbar}</g>`;
}

function renderLegend(points, x, y) {
  const groups = [...new Set(points.map((p) => p.group).filter(Boolean))].slice(0, 4);
  return groups.map((group, index) => `<g transform="translate(${x - 68} ${y + index * 14})"><circle cx="0" cy="0" r="4" fill="${palette(group)}"/><text x="8" y="3" font-size="9" font-weight="700" fill="#64748b">${escapeXml(group.slice(0, 12))}</text></g>`).join("");
}

function heatColor(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / Math.max(max - min, 1e-9)));
  const stops = [
    [239, 246, 255],
    [147, 197, 253],
    [37, 99, 235],
    [124, 58, 237]
  ];
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const rgb = stops[index].map((channel, channelIndex) => Math.round(channel + (stops[index + 1][channelIndex] - channel) * local));
  return `rgb(${rgb.join(",")})`;
}

function renderInspector() {
  const node = currentPage()?.nodes.find((candidate) => candidate.id === selectedId);
  if (!node) {
    inspector.className = "inspector-empty";
    inspector.textContent = "Select an object";
    return;
  }
  inspector.className = "";
  const label = node.kind === "text" ? node.payload.text : node.kind === "shape" ? node.payload.label : node.kind === "symbol" ? node.payload.label : node.name;
  const symbolControls = node.kind === "symbol" ? renderSymbolAppearanceControls(node) : "";
  const imageControls = node.kind === "image" ? renderImageAppearanceControls(node) : "";
  inspector.innerHTML = `<div class="badge">${escapeXml(node.kind)} / ${escapeXml(node.claimStatus)}</div>
    <div class="field"><label>Name</label><input id="fieldName" value="${escapeAttr(node.name)}" /></div>
    <div class="field"><label>Label</label><textarea id="fieldLabel" rows="3">${escapeXml(label ?? "")}</textarea></div>
    <div class="field-row"><div class="field"><label>X</label><input id="fieldX" type="number" value="${node.transform.x}" /></div><div class="field"><label>Y</label><input id="fieldY" type="number" value="${node.transform.y}" /></div></div>
    <div class="field-row"><div class="field"><label>Width</label><input id="fieldW" type="number" value="${node.transform.width}" /></div><div class="field"><label>Height</label><input id="fieldH" type="number" value="${node.transform.height}" /></div></div>
    <div class="field"><label>Depth</label><select id="fieldDepth">${["auto", "none", "surface", "raised", "floating", "hero"].map((value) => `<option value="${value}" ${(node.style.depth ?? "auto") === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
    ${symbolControls}
    ${imageControls}
    <div class="field"><label>Claim status</label><select id="fieldClaim">${["draft-visual", "needs-citation", "user-confirmed", "unsupported-claim"].map((value) => `<option value="${value}" ${node.claimStatus === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
    <div class="field"><label>Source</label><input id="fieldSource" value="${escapeAttr(node.provenance.source)}" /></div>
    <div class="field"><label>License</label><input id="fieldLicense" value="${escapeAttr(node.provenance.license)}" /></div>`;
  ["fieldName", "fieldLabel", "fieldX", "fieldY", "fieldW", "fieldH", "fieldDepth", "fieldVariant", "fieldStyleProfile", "fieldDetailLevel", "fieldPalettePreset", "fieldAccent", "fieldSecondary", "fieldFill", "fieldStroke", "fieldStrokeWidth", "fieldLabelColor", "fieldSemanticRole", "fieldPanelRole", "fieldLayoutHint", "fieldShowLabel", "fieldImageStyleProfile", "fieldImageMask", "fieldImageFit", "fieldImageWash", "fieldImageWashOpacity", "fieldImageContrast", "fieldImageOpacity", "fieldImageCropX", "fieldImageCropY", "fieldImageZoom", "fieldImageRim", "fieldCaptionAnchor", "fieldClaim", "fieldSource", "fieldLicense"].forEach((fieldId) => document.querySelector(`#${fieldId}`)?.addEventListener("change", updateSelectedFromInspector));
}

function renderSymbolAppearanceControls(node) {
  const asset = findAsset(node.payload.assetId);
  const appearance = node.payload.appearance ?? {};
  const styleProfiles = ["consulting-2p5d", "publication-line", "minimal-flat", "dark-talk", "risk-warning", "scientific-editorial-realism"];
  const detailLevels = ["medium", "low", "high"];
  const styleProfile = node.payload.styleProfile ?? appearance.styleProfile ?? "consulting-2p5d";
  const detailLevel = appearance.detailLevel ?? "medium";
  const accent = colorInputValue(appearance.accent ?? node.style.stroke ?? asset?.renderSpec?.accent, "#2563eb");
  const secondary = colorInputValue(appearance.secondary ?? asset?.renderSpec?.secondary, "#dbeafe");
  const fill = colorInputValue(appearance.fill ?? asset?.renderSpec?.secondary, "#dbeafe");
  const stroke = colorInputValue(appearance.stroke ?? appearance.accent ?? node.style.stroke ?? asset?.renderSpec?.accent, "#2563eb");
  const labelColor = colorInputValue(appearance.labelColor ?? node.style.color, "#0f172a");
  const strokeWidth = appearance.strokeWidth ?? node.style.strokeWidth ?? 2;
  const variants = ["auto", "filled", "outline", "soft-3d-vector", "dark", "warning", "selected", "disabled"];
  const semanticSlots = uniqueStrings([node.payload.semanticRole, ...(asset?.semanticSlots ?? [])]);
  const panelRoles = ["main-subject", "process-step", "annotation", "warning", "evidence", "output"];
  const palettePreset = node.payload.palettePreset ?? "custom";
  return `${renderAssetContractPanel(asset, node)}
    <div class="field"><label>Asset variant</label><select id="fieldVariant">${variants.map((value) => `<option value="${value}" ${(node.payload.variant ?? "auto") === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
    <div class="field-row"><div class="field"><label>Style</label><select id="fieldStyleProfile">${styleProfiles.map((value) => `<option value="${value}" ${styleProfile === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label>Detail</label><select id="fieldDetailLevel">${detailLevels.map((value) => `<option value="${value}" ${detailLevel === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div>
    <div class="field-row"><div class="field"><label>Palette preset</label><select id="fieldPalettePreset">${symbolPaletteOptions().map((option) => `<option value="${option.id}" ${palettePreset === option.id ? "selected" : ""}>${option.label}</option>`).join("")}</select></div><div class="field"><label>Label</label><select id="fieldShowLabel">${[["true", "show"], ["false", "hide"]].map(([value, label]) => `<option value="${value}" ${String(node.payload.showLabel !== false) === value ? "selected" : ""}>${label}</option>`).join("")}</select></div></div>
    <div class="field-row color-row"><div class="field"><label>Accent</label><input id="fieldAccent" type="color" value="${accent}" /></div><div class="field"><label>Secondary</label><input id="fieldSecondary" type="color" value="${secondary}" /></div></div>
    <div class="field-row color-row"><div class="field"><label>Fill</label><input id="fieldFill" type="color" value="${fill}" /></div><div class="field"><label>Stroke</label><input id="fieldStroke" type="color" value="${stroke}" /></div></div>
    <div class="field-row"><div class="field"><label>Line</label><input id="fieldStrokeWidth" type="number" min="0.5" max="8" step="0.5" value="${strokeWidth}" /></div><div class="field"><label>Label color</label><input id="fieldLabelColor" type="color" value="${labelColor}" /></div></div>
    <div class="field-row"><div class="field"><label>Semantic slot</label><select id="fieldSemanticRole">${semanticSlots.map((value) => `<option value="${escapeAttr(value)}" ${node.payload.semanticRole === value ? "selected" : ""}>${escapeXml(value)}</option>`).join("")}</select></div><div class="field"><label>Panel role</label><select id="fieldPanelRole">${panelRoles.map((value) => `<option value="${value}" ${(node.payload.panelRole ?? asset?.panelRole) === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div>
    <div class="field"><label>Layout hint</label><input id="fieldLayoutHint" value="${escapeAttr(node.payload.layoutHint ?? asset?.workflowPacks?.[0] ?? "")}" /></div>`;
}

function renderAssetContractPanel(asset, node) {
  if (!asset) return `<div class="inspector-contract warning"><strong>Unknown asset</strong><span>${escapeXml(node.payload.assetId ?? "missing assetId")}</span></div>`;
  const recipe = asset.renderSpec?.assetRecipe ?? asset.mediaType ?? "structured asset";
  const meta = [asset.qualityTier, asset.qaStatus, asset.family ?? asset.mediaType].filter(Boolean).join(" / ");
  const packs = (asset.workflowPacks ?? []).slice(0, 3);
  const slots = (asset.semanticSlots ?? []).slice(0, 4);
  const parts = (asset.editablePartDefinitions ?? []).slice(0, 7);
  return `<div class="inspector-contract">
    <div class="contract-head">
      <strong>${escapeXml(asset.name)}</strong>
      <span>${escapeXml(asset.id)}</span>
    </div>
    <div class="contract-meta">${escapeXml(meta || "asset metadata")} / ${escapeXml(recipe)}</div>
    <div class="contract-chip-row">${packs.map((pack) => `<span>${escapeXml(pack)}</span>`).join("")}${slots.map((slot) => `<span class="semantic">${escapeXml(slot)}</span>`).join("")}</div>
    ${parts.length ? `<div class="editable-part-grid">${parts.map((part) => `<span title="${escapeAttr(part.role)}"><strong>${escapeXml(part.id)}</strong><small>${escapeXml(part.colorBinding ?? part.anchor ?? part.exportMapping ?? "part")}</small></span>`).join("")}</div>` : ""}
  </div>`;
}

function symbolPaletteOptions() {
  return [
    { id: "custom", label: "Custom" },
    { id: "asset-default", label: "Asset default" },
    { id: "bio-blue-green", label: "Bio blue/green" },
    { id: "risk-warning", label: "Risk warning" },
    { id: "publication-line", label: "Publication line" },
    { id: "dark-talk", label: "Dark talk" }
  ];
}

function palettePresetAppearance(preset, asset) {
  const fallbackAccent = asset?.renderSpec?.accent ?? "#2563eb";
  const fallbackSecondary = asset?.renderSpec?.secondary ?? "#dbeafe";
  return {
    "asset-default": {
      accent: fallbackAccent,
      secondary: fallbackSecondary,
      fill: fallbackSecondary,
      stroke: fallbackAccent,
      labelColor: "#0f172a",
      strokeWidth: 2
    },
    "bio-blue-green": {
      accent: "#0ea5e9",
      secondary: "#bbf7d0",
      fill: "#e0f2fe",
      stroke: "#0284c7",
      labelColor: "#0f172a",
      strokeWidth: 2.2
    },
    "risk-warning": {
      accent: "#ef4444",
      secondary: "#fed7aa",
      fill: "#fff7ed",
      stroke: "#b91c1c",
      labelColor: "#7f1d1d",
      strokeWidth: 2.6
    },
    "publication-line": {
      accent: "#111827",
      secondary: "#f8fafc",
      fill: "#ffffff",
      stroke: "#111827",
      labelColor: "#111827",
      strokeWidth: 1.6
    },
    "dark-talk": {
      accent: "#38bdf8",
      secondary: "#1e293b",
      fill: "#0f172a",
      stroke: "#7dd3fc",
      labelColor: "#e0f2fe",
      strokeWidth: 2.4
    }
  }[preset];
}

function updateSelectedFromInspector() {
  const node = currentPage().nodes.find((candidate) => candidate.id === selectedId);
  if (!node) return;
  checkpoint();
  node.name = document.querySelector("#fieldName").value;
  const label = document.querySelector("#fieldLabel").value;
  if (node.kind === "text") node.payload.text = label;
  if (node.kind === "shape") node.payload.label = label;
  if (node.kind === "symbol") node.payload.label = label;
  if (node.kind === "image") node.payload.alt = label;
  node.transform.x = Number(document.querySelector("#fieldX").value);
  node.transform.y = Number(document.querySelector("#fieldY").value);
  node.transform.width = Math.max(1, Number(document.querySelector("#fieldW").value));
  node.transform.height = Math.max(1, Number(document.querySelector("#fieldH").value));
  const depth = document.querySelector("#fieldDepth").value;
  if (depth === "auto") delete node.style.depth;
  else node.style.depth = depth;
  if (node.kind === "symbol") updateSymbolAppearanceFromInspector(node);
  if (node.kind === "image") updateImageAppearanceFromInspector(node);
  node.claimStatus = document.querySelector("#fieldClaim").value;
  node.provenance.source = document.querySelector("#fieldSource").value;
  node.provenance.license = document.querySelector("#fieldLicense").value;
  renderAll();
}

function updateSymbolAppearanceFromInspector(node) {
  const asset = findAsset(node.payload.assetId);
  const variant = document.querySelector("#fieldVariant")?.value;
  if (variant === "auto") delete node.payload.variant;
  else if (variant) node.payload.variant = variant;
  const styleProfile = document.querySelector("#fieldStyleProfile")?.value;
  if (styleProfile) node.payload.styleProfile = styleProfile;
  const palettePreset = document.querySelector("#fieldPalettePreset")?.value ?? "custom";
  if (palettePreset === "custom") delete node.payload.palettePreset;
  else node.payload.palettePreset = palettePreset;
  const presetAppearance = palettePreset === "custom" ? {} : palettePresetAppearance(palettePreset, asset) ?? {};
  const appearance = {
    ...(node.payload.appearance ?? {}),
    accent: presetAppearance.accent ?? document.querySelector("#fieldAccent")?.value,
    secondary: presetAppearance.secondary ?? document.querySelector("#fieldSecondary")?.value,
    fill: presetAppearance.fill ?? document.querySelector("#fieldFill")?.value,
    stroke: presetAppearance.stroke ?? document.querySelector("#fieldStroke")?.value,
    strokeWidth: presetAppearance.strokeWidth ?? Math.max(0.5, Math.min(8, Number(document.querySelector("#fieldStrokeWidth")?.value ?? 2))),
    labelColor: presetAppearance.labelColor ?? document.querySelector("#fieldLabelColor")?.value,
    styleProfile,
    detailLevel: document.querySelector("#fieldDetailLevel")?.value
  };
  node.payload.appearance = Object.fromEntries(Object.entries(appearance).filter(([, value]) => value !== undefined && value !== ""));
  const semanticRole = document.querySelector("#fieldSemanticRole")?.value;
  if (semanticRole) node.payload.semanticRole = semanticRole;
  const panelRole = document.querySelector("#fieldPanelRole")?.value;
  if (panelRole) node.payload.panelRole = panelRole;
  const layoutHint = document.querySelector("#fieldLayoutHint")?.value;
  if (layoutHint) node.payload.layoutHint = layoutHint;
  else delete node.payload.layoutHint;
  const showLabel = document.querySelector("#fieldShowLabel")?.value;
  node.payload.showLabel = showLabel !== "false";
  node.style.stroke = appearance.stroke ?? appearance.accent ?? node.style.stroke;
  node.style.strokeWidth = appearance.strokeWidth;
  node.style.color = appearance.labelColor ?? node.style.color;
}

function renderImageAppearanceControls(node) {
  const asset = findAsset(node.payload.assetId);
  const appearance = node.payload.appearance ?? {};
  const crop = normalizedImageCrop(node.payload.crop);
  const styleProfiles = ["scientific-editorial-realism", "consulting-2p5d", "publication-line", "minimal-flat", "dark-talk", "risk-warning"];
  const styleProfile = node.payload.styleProfile ?? "scientific-editorial-realism";
  const maskShape = node.payload.mask?.shape ?? "round-rect";
  const captionAnchor = node.payload.captionAnchor ?? "bottom";
  const wash = colorInputValue(appearance.colorWash ?? asset?.renderSpec?.accent ?? "#2563eb", "#2563eb");
  const rim = colorInputValue(appearance.rimColor ?? "#ffffff", "#ffffff");
  const washOpacity = clampNumber(appearance.colorWashOpacity ?? 0.12, 0, 0.45);
  const contrast = clampNumber(appearance.contrast ?? 1, 0.65, 1.45);
  const opacity = clampNumber(appearance.opacity ?? 1, 0.1, 1);
  return `${renderAssetContractPanel(asset, node)}
    <div class="inspector-subhead">Editorial image</div>
    <div class="field-row"><div class="field"><label>Style</label><select id="fieldImageStyleProfile">${styleProfiles.map((value) => `<option value="${value}" ${styleProfile === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label>Mask</label><select id="fieldImageMask">${["round-rect", "circle", "tissue-contour", "soft-vignette"].map((value) => `<option value="${value}" ${maskShape === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div>
    <div class="field-row"><div class="field"><label>Fit</label><select id="fieldImageFit">${["cover", "contain"].map((value) => `<option value="${value}" ${crop.fit === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label>Caption</label><select id="fieldCaptionAnchor">${["bottom", "top", "none"].map((value) => `<option value="${value}" ${captionAnchor === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div>
    <div class="field-row color-row"><div class="field"><label>Color wash</label><input id="fieldImageWash" type="color" value="${wash}" /></div><div class="field"><label>Rim</label><input id="fieldImageRim" type="color" value="${rim}" /></div></div>
    <div class="field"><label>Wash opacity <span>${washOpacity.toFixed(2)}</span></label><input id="fieldImageWashOpacity" type="range" min="0" max="0.45" step="0.01" value="${washOpacity}" /></div>
    <div class="field-row"><div class="field"><label>Contrast</label><input id="fieldImageContrast" type="number" min="0.65" max="1.45" step="0.05" value="${contrast}" /></div><div class="field"><label>Opacity</label><input id="fieldImageOpacity" type="number" min="0.1" max="1" step="0.05" value="${opacity}" /></div></div>
    <div class="field-row"><div class="field"><label>Crop X</label><input id="fieldImageCropX" type="number" min="-0.35" max="0.35" step="0.01" value="${crop.x}" /></div><div class="field"><label>Crop Y</label><input id="fieldImageCropY" type="number" min="-0.35" max="0.35" step="0.01" value="${crop.y}" /></div></div>
    <div class="field"><label>Zoom</label><input id="fieldImageZoom" type="number" min="0.8" max="2.2" step="0.05" value="${crop.zoom}" /></div>`;
}

function updateImageAppearanceFromInspector(node) {
  const styleProfile = document.querySelector("#fieldImageStyleProfile")?.value;
  if (styleProfile) node.payload.styleProfile = styleProfile;
  const captionAnchor = document.querySelector("#fieldCaptionAnchor")?.value;
  if (captionAnchor) node.payload.captionAnchor = captionAnchor;
  node.payload.mask = {
    ...(node.payload.mask ?? {}),
    shape: document.querySelector("#fieldImageMask")?.value ?? "round-rect"
  };
  node.payload.crop = {
    x: clampNumber(Number(document.querySelector("#fieldImageCropX")?.value ?? 0), -0.35, 0.35),
    y: clampNumber(Number(document.querySelector("#fieldImageCropY")?.value ?? 0), -0.35, 0.35),
    zoom: clampNumber(Number(document.querySelector("#fieldImageZoom")?.value ?? 1), 0.8, 2.2),
    fit: document.querySelector("#fieldImageFit")?.value === "contain" ? "contain" : "cover"
  };
  node.payload.appearance = Object.fromEntries(Object.entries({
    ...(node.payload.appearance ?? {}),
    colorWash: document.querySelector("#fieldImageWash")?.value,
    colorWashOpacity: clampNumber(Number(document.querySelector("#fieldImageWashOpacity")?.value ?? 0.12), 0, 0.45),
    contrast: clampNumber(Number(document.querySelector("#fieldImageContrast")?.value ?? 1), 0.65, 1.45),
    opacity: clampNumber(Number(document.querySelector("#fieldImageOpacity")?.value ?? 1), 0.1, 1),
    rimColor: document.querySelector("#fieldImageRim")?.value,
    styleProfile
  }).filter(([, value]) => value !== undefined && value !== ""));
}

function renderPackTabs() {
  if (!packTabs) return;
  const selectedPack = assetWorkflowPack?.value || "";
  const tabs = [
    `<button class="${selectedPack ? "" : "active"}" data-pack-id="" type="button">All</button>`,
    ...workflowPacks.map((pack) => `<button class="${pack.id === selectedPack ? "active" : ""}" data-pack-id="${escapeAttr(pack.id)}" type="button">${escapeXml(shortPackLabel(pack.name ?? pack.id))}</button>`)
  ];
  packTabs.innerHTML = tabs.join("");
  packTabs.querySelectorAll("button[data-pack-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const packId = button.dataset.packId || "";
      if (assetWorkflowPack) assetWorkflowPack.value = packId;
      if (workflowTemplate && packId) workflowTemplate.value = packId;
      if (packId) {
        selectedWorkflowTemplateId = workflowPacks.find((pack) => pack.id === packId)?.flagshipTemplateId ?? defaultTemplateForPack(packId)?.id ?? selectedWorkflowTemplateId;
        loadWorkflowPackGallery(packId);
        loadWorkflowPackVisualQaGallery(packId);
      }
      renderAll();
    });
  });
}

function renderPackQualitySummary() {
  if (!packQualitySummary) return;
  const packId = assetWorkflowPack?.value || "";
  if (!packId) {
    const premiumCount = curatedAssets.filter((asset) => ["signature", "hero"].includes(asset.qualityTier)).length;
    const finalMilestone = assetCoverageReport?.milestones?.[assetCoverageReport.milestones.length - 1];
    const nextPacks = assetCoverageReport?.plannedWorkflowPacks?.slice(0, 3).map((pack) => pack.id).join(", ");
    const targetLine = finalMilestone
      ? `<div class="coverage-targets"><span>12 mo target ${escapeXml(String(finalMilestone.targetAssets))} assets</span><span>${escapeXml(String(finalMilestone.targetSignatureHeroAssets))} signature+hero</span><span>${escapeXml(String(finalMilestone.targetWorkflowPacks))} packs</span><span>${escapeXml(String(finalMilestone.targetTemplates))} templates</span></div>`
      : "";
    const nextLine = nextPacks ? `<div class="coverage-next">Next packs: ${escapeXml(nextPacks)}</div>` : "";
    packQualitySummary.innerHTML = `<div><strong>Premium library</strong><span>${curatedAssets.length} assets / ${premiumCount} signature+hero / ${workflowTemplates.length} templates</span></div>${targetLine}${nextLine}`;
    return;
  }
  const gallery = cachedWorkflowPackGallery(packId);
  const pack = workflowPacks.find((candidate) => candidate.id === packId);
  const localAssets = curatedAssets.filter((asset) => (asset.workflowPacks ?? []).includes(packId));
  const localTemplates = workflowTemplates.filter((template) => template.workflowPack === packId || (pack?.templates ?? []).includes(template.id));
  const localPremiumCount = localAssets.filter((asset) => ["signature", "hero"].includes(asset.qualityTier)).length;
  const journalTemplateCount = localTemplates.filter((template) => templateFigureIntent(template) === "journal-figure").length;
  const isRealisticPack = packId.startsWith("realistic-");
  const quality = gallery?.quality ?? {
    assetCount: localAssets.length,
    signatureOrHeroCount: localPremiumCount,
    templateCount: localTemplates.length,
    qaStatus: isRealisticPack
      ? localAssets.length >= 8 && localPremiumCount >= 6 && localTemplates.length >= 1 ? "premium" : "needs-polish"
      : localAssets.length >= 20 && localTemplates.length >= 4 ? "premium" : "needs-polish",
    exportRisks: isRealisticPack ? ["PPTX/DOCX embed realistic panels as named image fallbacks; SVG/PDF plus scene JSON remain canonical."] : []
  };
  const status = String(quality.qaStatus).replace(/-/g, " ");
  const flagship = gallery?.flagshipDemo;
  const flagshipSummary = flagship ? ` / flagship ${String(flagship.qaStatus).replace(/-/g, " ")} ${flagship.score}` : "";
  const exportSnapshot = gallery?.exportSnapshot;
  const exportMarkup = packExportSnapshotMarkup(exportSnapshot, quality);
  const visualQa = packVisualQaMarkup(packId);
  const journalLine = journalTemplateCount ? ` / ${journalTemplateCount} journal` : "";
  packQualitySummary.innerHTML = `<div class="pack-summary-head"><div><strong>${escapeXml(pack?.name ?? workflowLabel(packId))}</strong><span>${quality.assetCount} assets / ${quality.signatureOrHeroCount} premium / ${quality.templateCount} templates${escapeXml(journalLine)}${escapeXml(flagshipSummary)}</span></div><div class="pack-qa-status ${escapeAttr(quality.qaStatus)}">${escapeXml(status)}</div></div>${exportMarkup}${visualQa}`;
}

function renderPublicDemoLauncher() {
  if (!publicDemoLauncher) return;
  const styleProfile = currentAssetStyleProfile();
  publicDemoLauncher.innerHTML = `
    <div class="public-demo-head">
      <div>
        <strong>Public demos</strong>
        <span>Open the same structured examples shown in README</span>
      </div>
      <span class="public-demo-count">${publicDemos.length}</span>
    </div>
    <div class="public-demo-grid">
      ${publicDemos.map((demo) => {
        const template = workflowTemplates.find((candidate) => candidate.id === demo.templateId);
        const isActive = selectedWorkflowTemplateId === demo.templateId;
        return `<button class="public-demo-card ${isActive ? "active" : ""}" type="button" data-public-demo-id="${escapeAttr(demo.id)}" title="Open ${escapeAttr(demo.title)} demo">
          <div class="public-demo-preview">${template ? templatePreviewSvg(template, demo.styleProfile ?? styleProfile) : ""}</div>
          <div class="public-demo-copy">
            <strong>${escapeXml(demo.title)}</strong>
            <span>${escapeXml(demo.subtitle)}</span>
          </div>
        </button>`;
      }).join("")}
    </div>`;
  publicDemoLauncher.querySelectorAll("[data-public-demo-id]").forEach((button) => {
    button.addEventListener("click", () => launchPublicDemo(button.dataset.publicDemoId));
  });
}

function initialPublicDemoId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith("#demo=") ? window.location.hash.slice(6) : window.location.hash.replace(/^#/, "");
    return resolvePublicDemoId(params.get("demo") ?? params.get("template") ?? params.get("workflowPack") ?? hash);
  } catch {
    return null;
  }
}

function resolvePublicDemoId(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  const normalized = raw.replace(/_/g, "-");
  return publicDemos.find((demo) =>
    [demo.id, demo.templateId, demo.workflowPack, slug(demo.title)].map((item) => String(item).toLowerCase()).includes(normalized)
  )?.id ?? null;
}

function launchInitialPublicDemoFromUrl() {
  if (!pendingPublicDemoId) return;
  const demoId = pendingPublicDemoId;
  pendingPublicDemoId = null;
  launchPublicDemo(demoId, { updateUrl: false });
}

function launchPublicDemo(demoId, options = {}) {
  const demo = publicDemos.find((candidate) => candidate.id === demoId);
  if (!demo) return;
  selectedWorkflowTemplateId = demo.templateId;
  if (assetWorkflowPack) assetWorkflowPack.value = demo.workflowPack;
  if (workflowTemplate) workflowTemplate.value = demo.workflowPack;
  if (assetStyleProfile) assetStyleProfile.value = demo.styleProfile;
  if (options.updateUrl !== false) {
    const url = new URL(window.location.href);
    url.searchParams.set("demo", demo.id);
    window.history.replaceState(null, "", url);
  }
  workflowPackGalleries.clear();
  workflowPackVisualQaGalleries.clear();
  loadWorkflowPackGallery(demo.workflowPack);
  loadWorkflowPackVisualQaGallery(demo.workflowPack);
  addWorkflowFigure({
    mode: "public-demo",
    replaceCurrentPage: true,
    replaceExistingNotes: true
  });
}

function packVisualQaMarkup(packId) {
  const cacheKey = workflowPackGalleryCacheKey(packId);
  const visualQa = workflowPackVisualQaGalleries.get(cacheKey);
  if (!visualQa) return `<div class="pack-visual-qa pending">Visual QA gallery: loading 48px / 120px / slide-size previews</div>`;
  const checks = Array.isArray(visualQa.qaChecks) ? visualQa.qaChecks.slice(0, 2) : [];
  const assetLine = Array.isArray(visualQa.renderedAssetIds) ? visualQa.renderedAssetIds.slice(0, 6).join(", ") : "";
  return `<div class="pack-visual-qa">
    <div class="pack-visual-qa-head"><strong>Visual QA</strong><span>${escapeXml(String(visualQa.renderedAssetIds?.length ?? 0))}/${escapeXml(String(visualQa.assetCount ?? 0))} assets / ${escapeXml(visualQa.styleProfile ?? currentAssetStyleProfile())}</span></div>
    <div class="pack-visual-qa-sizes"><span>48px icon</span><span>120px preview</span><span>slide-size</span></div>
    <div class="pack-visual-qa-assets">${escapeXml(assetLine)}</div>
    ${checks.map((check) => `<div class="pack-visual-qa-check">${escapeXml(check)}</div>`).join("")}
  </div>`;
}

function packExportSnapshotMarkup(snapshot, quality) {
  if (!snapshot) {
    return quality.exportRisks?.length ? `<div class="pack-export-risk">${escapeXml(quality.exportRisks[0])}</div>` : "";
  }
  const status = String(snapshot.status ?? "needs-review").replace(/-/g, " ");
  const pptxStatus = String(snapshot.exportFormats?.pptx?.status ?? "editable").replace(/-/g, " ");
  const fallbackAssets = Array.isArray(snapshot.uniqueFallbackAssetIds) ? snapshot.uniqueFallbackAssetIds.slice(0, 4) : [];
  const extra = Math.max(0, (snapshot.uniqueFallbackAssetIds?.length ?? 0) - fallbackAssets.length);
  const assetLine = fallbackAssets.length
    ? `${fallbackAssets.join(", ")}${extra ? `, +${extra}` : ""}`
    : "native objects";
  const blocked = Number(snapshot.blockedTemplateCount ?? 0);
  return `<div class="pack-export-snapshot ${escapeAttr(snapshot.status ?? "needs-review")}">
    <div class="pack-export-snapshot-head"><span>Export QA</span><strong>${escapeXml(status)}</strong></div>
    <div class="pack-export-metrics">
      <span>PPTX ${escapeXml(pptxStatus)}</span>
      <span>${escapeXml(String(snapshot.totalPremiumAssetFallbackCount ?? 0))} SVG assets</span>
      <span>${escapeXml(String(snapshot.totalPlotFallbackCount ?? 0))} plots</span>
      <span>${escapeXml(String(blocked))} blocked</span>
    </div>
    <div class="pack-export-assets">${escapeXml(assetLine)}</div>
    <div class="pack-export-next">${escapeXml(snapshot.nextAction ?? "Review export warnings before delivery.")}</div>
  </div>`;
}

function renderAssets() {
  const query = assetSearch.value.trim().toLowerCase();
  const styleProfile = currentAssetStyleProfile();
  const workflowPack = assetWorkflowPack.value;
  const matchesQuery = (asset) => !query || [asset.name, asset.category, asset.family, asset.visualRole, asset.subcategory, asset.panelRole, asset.qualityTier, ...(asset.workflowPacks ?? []), ...(asset.semanticSlots ?? []), ...(asset.tags ?? []), ...(asset.aliases ?? [])].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
  const matchesFilter = (asset) => {
    if (activeAssetFilter === "biology") return String(asset.category).startsWith("Biology");
    if (activeAssetFilter === "ai") return String(asset.category).startsWith("AI");
    if (activeAssetFilter === "realistic") return asset.kind === "image" || String(asset.category).startsWith("Realistic");
    if (activeAssetFilter === "featured" && !query) return featuredAssetIds.includes(asset.id);
    return true;
  };
  const matchesPack = (asset) => !workflowPack || (asset.workflowPacks ?? []).includes(workflowPack);
  const matchesStyle = (asset) => !styleProfile || !asset.styleProfiles || asset.styleProfiles.includes(styleProfile);
  const matchesQuality = (asset) => {
    const qualityTier = asset.qualityTier ?? (HERO_ASSET_IDS.includes(asset.id) ? "hero" : "standard");
    if (activeAssetQualityFilter === "premium") return ["signature", "hero"].includes(qualityTier);
    if (activeAssetQualityFilter === "needs-polish") return !["signature", "hero"].includes(qualityTier) || asset.qaStatus !== "premium";
    if (activeAssetQualityFilter === "export-risk") return ["signature", "hero"].includes(qualityTier) || (asset.panelRole === "warning");
    return true;
  };
  let assets = curatedAssets.filter((asset) => matchesQuery(asset) && matchesFilter(asset) && matchesPack(asset) && matchesStyle(asset) && matchesQuality(asset));
  if (activeAssetFilter === "featured" && !query) {
    assets = featuredAssetIds.map((assetId) => curatedAssets.find((asset) => asset.id === assetId)).filter(Boolean).filter((asset) => matchesPack(asset) && matchesStyle(asset) && matchesQuality(asset));
  }
  assetList.innerHTML = assets.slice(0, 24).map((asset) => {
    const qualityTier = asset.qualityTier ?? (HERO_ASSET_IDS.includes(asset.id) ? "hero" : "standard");
    const badge = ["signature", "hero"].includes(qualityTier) ? `<span class="asset-quality ${qualityTier}">${qualityTier === "signature" ? "Signature" : "Hero"}</span>` : "";
    const qaBadges = assetQaBadges(asset).map((label) => `<span>${escapeXml(label)}</span>`).join("");
    return `<div class="asset-card ${qualityTier} ${asset.kind === "image" ? "realistic" : ""}" data-asset-id="${asset.id}">${badge}${assetCardPreviewSvg(asset, styleProfile)}<div class="asset-name">${escapeXml(asset.name)}</div><div class="asset-meta">${escapeXml(asset.subcategory ?? asset.category ?? asset.family)}</div><div class="asset-related">${escapeXml(relatedAssetText(asset))}</div><div class="asset-qa-badges">${qaBadges}</div></div>`;
  }).join("");
  assetList.querySelectorAll(".asset-card").forEach((card) => card.addEventListener("click", () => addAssetNode(card.dataset.assetId)));
}

const TEMPLATE_FIGURE_INTENTS = [
  { id: "all", label: "All" },
  { id: "journal-figure", label: "Journal" },
  { id: "talk-slide", label: "Deck" },
  { id: "hybrid-template", label: "Hybrid" }
];

function templateFigureIntent(template) {
  if (template.figureIntent) return template.figureIntent;
  if (template.recommendedStyleProfile === "publication-line") return "journal-figure";
  if (template.recommendedStyleProfile === "scientific-editorial-realism" || template.layout === "hybrid-template") return "hybrid-template";
  return "talk-slide";
}

function templateFigureIntentLabel(intent) {
  if (intent === "journal-figure") return "Journal-safe";
  if (intent === "hybrid-template") return "Hybrid";
  if (intent === "talk-slide") return "Deck";
  return "Template";
}

function templateIntentToolbarMarkup(packTemplates) {
  return `<div class="template-gallery-toolbar" aria-label="Template figure intent filters">
    ${TEMPLATE_FIGURE_INTENTS.map((intent) => {
      const count = intent.id === "all" ? packTemplates.length : packTemplates.filter((template) => templateFigureIntent(template) === intent.id).length;
      return `<button class="template-intent-filter ${activeTemplateFigureIntent === intent.id ? "active" : ""}" data-template-intent="${escapeAttr(intent.id)}" type="button">${escapeXml(intent.label)} <span>${escapeXml(String(count))}</span></button>`;
    }).join("")}
  </div>`;
}

function templateIntentBadgesMarkup(template) {
  const intent = templateFigureIntent(template);
  const styleProfile = template.recommendedStyleProfile || "consulting-2p5d";
  const journalReady = intent === "journal-figure" ? `<span class="template-intent-badge journal-ready">journal-ready path</span>` : "";
  return `<div class="template-intent-row"><span class="template-intent-badge ${escapeAttr(intent)}">${escapeXml(templateFigureIntentLabel(intent))}</span><span class="template-intent-badge style">${escapeXml(styleProfile)}</span>${journalReady}</div>`;
}

function renderTemplateGallery() {
  if (!templateGallery) return;
  const selectedPack = assetWorkflowPack?.value || "";
  const styleProfile = currentAssetStyleProfile();
  const packTemplates = workflowTemplates.filter((template) => !selectedPack || template.workflowPack === selectedPack);
  const templates = packTemplates.length ? packTemplates : workflowTemplates.slice(0, 6);
  const visibleTemplates = templates.filter((template) => activeTemplateFigureIntent === "all" || templateFigureIntent(template) === activeTemplateFigureIntent);
  const templateCards = visibleTemplates.slice(0, 6).map((template) => {
    const qa = templateQaFor(template);
    const qaStatus = qa?.qaStatus ?? "unknown";
    const isActive = template.id === selectedWorkflowTemplateId;
    const exportSummary = templateExportReadinessMarkup(qa, isActive);
    const primaryAction = templatePrimaryAction(qa);
    const previewStyle = template.recommendedStyleProfile || styleProfile;
    const intent = templateFigureIntent(template);
    return `
    <button class="template-card ${isActive ? "active" : ""} qa-${escapeAttr(qaStatus)} intent-${escapeAttr(intent)}" data-workflow-pack="${escapeAttr(template.workflowPack)}" data-template-id="${escapeAttr(template.id)}" type="button" title="${escapeAttr(template.description)}" aria-pressed="${isActive ? "true" : "false"}">
      <div class="template-preview">${templatePreviewSvg(template, previewStyle)}</div>
      <div class="template-name">${escapeXml(template.name)}</div>
      <div class="template-meta">${escapeXml(template.layout)} / ${escapeXml(workflowLabel(template.workflowPack))}</div>
      ${templateIntentBadgesMarkup(template)}
      ${qa ? `<div class="template-qa-row"><span class="template-qa-badge ${escapeAttr(qa.qaStatus)}">${escapeXml(qa.qaStatus.replace(/-/g, " "))}</span><span>${escapeXml(String(qa.score))}</span>${qa.exportReadiness?.pptx?.premiumAssetFallbackCount ? `<span>${escapeXml(String(qa.exportReadiness.pptx.premiumAssetFallbackCount))} SVG</span>` : ""}${qa.exportReadiness?.pptx?.plotFallbackCount ? `<span>${escapeXml(String(qa.exportReadiness.pptx.plotFallbackCount))} plot</span>` : ""}</div>` : ""}
      ${exportSummary}
      ${primaryAction ? `<div class="template-action ${escapeAttr(primaryAction.severity)}">${escapeXml(primaryAction.title)}</div>` : ""}
    </button>
  `;
  }).join("");
  const emptyState = visibleTemplates.length ? "" : `<div class="template-empty-state">No ${escapeXml(templateFigureIntentLabel(activeTemplateFigureIntent).toLowerCase())} templates in this pack yet.</div>`;
  templateGallery.innerHTML = `${templateIntentToolbarMarkup(templates)}<div class="template-gallery-grid">${templateCards}${emptyState}</div>`;
  templateGallery.querySelectorAll("[data-template-intent]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTemplateFigureIntent = button.dataset.templateIntent || "all";
      renderTemplateGallery();
    });
  });
  templateGallery.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("click", () => selectWorkflowTemplateCard(card));
  });
}

function selectWorkflowTemplateCard(card) {
  const pack = card.dataset.workflowPack;
  selectedWorkflowTemplateId = card.dataset.templateId || selectedWorkflowTemplateId;
  const selectedTemplate = workflowTemplates.find((template) => template.id === selectedWorkflowTemplateId);
  if (workflowTemplate && pack) workflowTemplate.value = pack;
  if (assetWorkflowPack && pack) assetWorkflowPack.value = pack;
  if (pack) {
    const previousStyleProfile = currentAssetStyleProfile();
    const packStyleChanged = syncStyleProfileForPack(pack);
    if (assetStyleProfile && selectedTemplate?.recommendedStyleProfile) assetStyleProfile.value = selectedTemplate.recommendedStyleProfile;
    if (packStyleChanged || currentAssetStyleProfile() !== previousStyleProfile) {
      workflowPackGalleries.clear();
      workflowPackVisualQaGalleries.clear();
    }
    loadWorkflowPackGallery(pack);
    loadWorkflowPackVisualQaGallery(pack);
  }
  renderAll();
}

function renderWorkflowInsertButton() {
  if (!insertWorkflowFigure) return;
  const template = currentWorkflowTemplate();
  insertWorkflowFigure.textContent = "Insert";
  insertWorkflowFigure.title = template?.name ? `Insert ${template.name}` : "Insert selected workflow figure";
  insertWorkflowFigure.setAttribute("aria-label", insertWorkflowFigure.title);
}

function renderSelectedTemplateSummary() {
  if (!selectedTemplateSummary) return;
  const template = currentWorkflowTemplate();
  if (!template) {
    selectedTemplateSummary.innerHTML = "";
    return;
  }
  const qa = templateQaFor(template);
  const qaStatus = String(qa?.qaStatus ?? "loading").replace(/-/g, " ");
  const score = qa?.score === undefined ? "..." : String(qa.score);
  const pptx = qa?.exportReadiness?.pptx;
  const pptxStatus = String(pptx?.status ?? "pending").replace(/-/g, " ");
  const fallbackAssets = Array.isArray(pptx?.fallbackAssets) ? pptx.fallbackAssets : [];
  const shownAssets = fallbackAssets.slice(0, 3).map((asset) => asset.name || asset.assetId).filter(Boolean);
  const extra = fallbackAssets.length - shownAssets.length;
  const fallbackLine = shownAssets.length
    ? `${shownAssets.join(", ")}${extra > 0 ? `, +${extra}` : ""}`
    : "native objects";
  const styleProfile = currentAssetStyleProfile();
  selectedTemplateSummary.innerHTML = `
    <div class="selected-template-card qa-${escapeAttr(qa?.qaStatus ?? "loading")}">
      <div class="selected-template-preview">${templatePreviewSvg(template, styleProfile)}</div>
      <div class="selected-template-body">
        <div class="selected-template-eyebrow">Selected figure</div>
        <strong>${escapeXml(template.name)}</strong>
        <span>${escapeXml(template.layout)} / ${escapeXml(workflowLabel(template.workflowPack))}</span>
        <div class="selected-template-metrics">
          <span>QA ${escapeXml(qaStatus)} ${escapeXml(score)}</span>
          <span>PPTX ${escapeXml(pptxStatus)}</span>
          <span>${escapeXml(String(pptx?.premiumAssetFallbackCount ?? 0))} SVG</span>
          <span>${escapeXml(String(pptx?.plotFallbackCount ?? 0))} plots</span>
        </div>
        <div class="selected-template-fallbacks">${escapeXml(fallbackLine)}</div>
      </div>
      <button class="selected-template-insert" type="button" data-action="insert-selected-template">Insert selected</button>
    </div>`;
  selectedTemplateSummary.querySelector("[data-action='insert-selected-template']")?.addEventListener("click", () => addWorkflowFigure());
}

function templateExportReadinessMarkup(qa, showDetail = false) {
  const pptx = qa?.exportReadiness?.pptx;
  if (!pptx) return "";
  const status = String(pptx.status ?? "editable").replace(/-/g, " ");
  const fallbackAssets = Array.isArray(pptx.fallbackAssets) ? pptx.fallbackAssets : [];
  const shownAssets = fallbackAssets.slice(0, 3).map((asset) => asset.name || asset.assetId).filter(Boolean);
  const extra = fallbackAssets.length - shownAssets.length;
  const assetLine = shownAssets.length
    ? `${shownAssets.join(", ")}${extra > 0 ? `, +${extra}` : ""}`
    : "native objects";
  const statusClass = pptx.status === "editable-with-fallbacks" ? "has-fallbacks" : "editable";
  return `<div class="template-export-readiness ${escapeAttr(statusClass)}">
    <div class="template-export-head"><span>PPTX</span><strong>${escapeXml(status)}</strong></div>
    <div class="template-export-stats"><span>${escapeXml(String(pptx.premiumAssetFallbackCount ?? 0))} SVG assets</span><span>${escapeXml(String(pptx.plotFallbackCount ?? 0))} plots</span></div>
    <div class="template-fallback-assets">${escapeXml(assetLine)}</div>
    ${showDetail ? templateExportFallbackLedger(pptx) : ""}
  </div>`;
}

function templateExportFallbackLedger(pptx) {
  const fallbackAssets = Array.isArray(pptx.fallbackAssets) ? pptx.fallbackAssets : [];
  const fallbackChips = fallbackAssets.slice(0, 5).map((asset) => {
    const tier = String(asset.qualityTier ?? "premium").replace(/-/g, " ");
    const recipe = String(asset.assetRecipe ?? asset.exportBehavior ?? "svg fallback").replace(/^hero-/, "");
    return `<span class="template-fallback-chip"><strong>${escapeXml(asset.name || asset.assetId)}</strong><small>${escapeXml(tier)} / ${escapeXml(recipe)}</small></span>`;
  }).join("");
  const extra = fallbackAssets.length > 5 ? `<span class="template-fallback-chip muted"><strong>+${escapeXml(String(fallbackAssets.length - 5))} more</strong><small>named in export warning</small></span>` : "";
  const plots = Number(pptx.plotFallbackCount ?? 0);
  const plotChip = plots ? `<span class="template-fallback-chip plot"><strong>${escapeXml(String(plots))} plot placeholder${plots === 1 ? "" : "s"}</strong><small>verify PPTX editability</small></span>` : "";
  const chips = `${fallbackChips}${extra}${plotChip}`;
  if (!chips) {
    return `<div class="template-export-ledger"><div class="template-export-ledger-title">Fallback ledger</div><div class="template-fallback-chip pass"><strong>Native PPTX path</strong><small>No premium SVG fallback detected</small></div></div>`;
  }
  return `<div class="template-export-ledger">
    <div class="template-export-ledger-title">Fallback ledger</div>
    <div class="template-fallback-grid">${chips}</div>
    <div class="template-export-next-action">${escapeXml(pptx.nextAction ?? "Review PPTX fallback fidelity before sending.")}</div>
  </div>`;
}

function templatePrimaryAction(qa) {
  if (!qa?.actionItems?.length) return null;
  return qa.actionItems.find((item) => item.kind === "export" && item.title === "Confirm premium asset fallback")
    ?? qa.actionItems.find((item) => item.kind === "export")
    ?? qa.actionItems[0];
}

function templatePreviewSvg(template, styleProfile) {
  const assetIds = (template.previewAssetIds ?? []).slice(0, 4);
  const width = 260;
  const height = 82;
  const step = Math.max(1, assetIds.length);
  const gap = 8;
  const iconWidth = 46;
  const start = 12;
  const y = 16;
  const arrows = assetIds.slice(1).map((_, index) => {
    const x1 = start + (index + 1) * ((width - 36) / step) - 13;
    return `<path d="M${x1} 40h16" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" marker-end="url(#template-arrow)"/>`;
  }).join("");
  const glyphs = assetIds.map((assetId, index) => {
    const asset = findAsset(assetId);
    const x = start + index * ((width - 36) / step);
    return `<g transform="translate(${x} ${y})">${renderSharedPremiumAssetGlyph(asset, iconWidth, 42, { showLabel: false, styleProfile })}</g>`;
  }).join("");
  const title = template.layout === "multi-panel" ? "A B C D" : template.layout === "pipeline" ? "gate" : template.layout === "architecture" ? "loop" : "flow";
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(template.name)} preview"><defs>${renderDepthDefs(false)}<marker id="template-arrow" markerWidth="7" markerHeight="7" refX="6.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#94a3b8"/></marker></defs><rect x="7" y="8" width="${width - 14}" height="${height - 16}" rx="8" fill="#ffffff" stroke="#dbe4f0"/><text x="16" y="18" fill="#64748b" font-size="8" font-weight="800">${escapeXml(title)}</text>${arrows}${glyphs}</svg>`;
}

function defaultTemplateForPack(pack) {
  const existing = workflowTemplates.find((template) => template.workflowPack === pack);
  if (existing) return existing;
  const packMeta = workflowPacks.find((candidate) => candidate.id === pack);
  return {
    id: packMeta?.flagshipTemplateId ?? `${pack}-workflow`,
    workflowPack: pack,
    name: packMeta?.name ?? workflowLabel(pack),
    description: `Editable ${workflowLabel(pack)} figure with premium structured SVG assets.`,
    layout: pack?.includes("biosecurity") ? "pipeline" : pack?.includes("mcp") ? "architecture" : "workflow",
    recommendedStyleProfile: "consulting-2p5d",
    previewAssetIds: workflowAssets(pack).slice(0, 4),
    nodeKinds: ["shape", "text", "symbol", "connector"],
    agentUseHints: [`Use for ${workflowLabel(pack)} slides.`],
    qaChecklist: ["Review layout, provenance, and export warnings."]
  };
}

function currentWorkflowTemplate() {
  return workflowTemplates.find((template) => template.id === selectedWorkflowTemplateId) ?? defaultTemplateForPack(workflowTemplate?.value || assetWorkflowPack?.value || "publication-results-panels");
}

function currentAssetStyleProfile() {
  return assetStyleProfile?.value || "consulting-2p5d";
}

function syncStyleProfileForPack(packId) {
  if (!packId?.startsWith?.("realistic-") || !assetStyleProfile) return false;
  if (assetStyleProfile.value === "scientific-editorial-realism") return false;
  assetStyleProfile.value = "scientific-editorial-realism";
  return true;
}

function shortPackLabel(name) {
  return String(name)
    .replace(" / CRISPR", "")
    .replace("transcriptomics", "spatial")
    .replace("Publication results", "Results")
    .replace("Agentic AI / MCP", "MCP/RAG");
}

function workflowPackGalleryCacheKey(packId, styleProfile = currentAssetStyleProfile()) {
  return `${packId}::${styleProfile}`;
}

function cachedWorkflowPackGallery(packId) {
  if (!packId) return null;
  return workflowPackGalleries.get(workflowPackGalleryCacheKey(packId)) ?? workflowPackGalleries.get(packId) ?? null;
}

function assetQaBadges(asset) {
  const badges = [];
  const tier = asset.qualityTier ?? (HERO_ASSET_IDS.includes(asset.id) ? "hero" : "standard");
  if (tier === "signature" || tier === "hero") badges.push("Premium");
  else badges.push("Needs polish");
  if (tier === "signature" || tier === "hero") badges.push("Export fallback");
  if (!asset.provenance?.source || !asset.provenance?.license) badges.push("Missing provenance");
  return badges.slice(0, 3);
}

function templateQaFor(template) {
  const gallery = cachedWorkflowPackGallery(template.workflowPack);
  return gallery?.templateQa?.find((qa) => qa.templateId === template.id);
}

function relatedAssetText(asset) {
  const tokens = [...new Set([asset.workflowPacks?.[0], asset.panelRole, asset.family, asset.visualRole, ...(asset.semanticSlots ?? []), ...(asset.modality ?? []), ...(asset.riskDomain ?? []), ...(asset.assay ?? []), ...(asset.tags ?? [])]
    .filter(Boolean)
    .map((value) => String(value).replace(/[-_]/g, " "))
    .filter((value) => value.length > 2 && !["biology", "ai", "entity", "model"].includes(value.toLowerCase())))];
  return tokens.slice(0, 2).join(" / ");
}

async function loadPremiumAssets() {
  try {
    const response = await fetch("/assets?limit=500");
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.assets) && payload.assets.length >= 100) {
      curatedAssets = payload.assets;
      renderAll();
    }
  } catch {
    // Offline/static fallback keeps the editor usable without the API server.
  }
}

async function loadWorkflowTemplates() {
  try {
    const response = await fetch("/assets/workflow-templates");
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.templates) && payload.templates.length) {
      workflowTemplates = mergeWorkflowTemplates(payload.templates, staticWorkflowTemplates);
      syncWorkflowControls();
      renderAll();
    }
  } catch {
    // Static fallback templates keep workflow insertion available offline.
  }
}

function mergeWorkflowTemplates(remoteTemplates, localTemplates) {
  const merged = [];
  const seen = new Set();
  for (const template of localTemplates.filter((candidate) => candidate.workflowPack?.startsWith("realistic-"))) {
    merged.push(template);
    seen.add(template.id);
  }
  for (const template of remoteTemplates) {
    if (!seen.has(template.id)) {
      merged.push(template);
      seen.add(template.id);
    }
  }
  for (const template of localTemplates) {
    if (!seen.has(template.id)) {
      merged.push(template);
      seen.add(template.id);
    }
  }
  return merged;
}

async function loadWorkflowPacks() {
  try {
    const response = await fetch("/assets/workflow-packs");
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.workflowPacks) && payload.workflowPacks.length) {
      workflowPacks = mergeWorkflowPacks(payload.workflowPacks, realisticWorkflowPacks);
      syncWorkflowControls();
      renderAll();
      await loadWorkflowPackGallery(assetWorkflowPack?.value || workflowPacks[0]?.id);
      await loadWorkflowPackVisualQaGallery(assetWorkflowPack?.value || workflowPacks[0]?.id);
    }
  } catch {
    // Static fallback pack tabs remain usable without the API server.
    workflowPacks = mergeWorkflowPacks(workflowPacks, realisticWorkflowPacks);
  }
}

function syncWorkflowControls() {
  syncWorkflowPackSelect();
  syncWorkflowFigureSelect();
}

function syncWorkflowPackSelect() {
  if (!assetWorkflowPack) return;
  const current = assetWorkflowPack.value;
  const options = [
    { value: "", label: "All packs" },
    ...workflowPacks.map((pack) => ({ value: pack.id, label: pack.name ?? workflowLabel(pack.id) }))
  ];
  setSelectOptions(assetWorkflowPack, options, current);
  assetWorkflowPack.dataset.registryBacked = "true";
  assetWorkflowPack.dataset.workflowPackCount = String(workflowPacks.length);
}

function syncWorkflowFigureSelect() {
  if (!workflowTemplate) return;
  const current = workflowTemplate.value || assetWorkflowPack?.value || workflowPacks[0]?.id || "";
  const options = workflowPacks.map((pack) => {
    const flagship = workflowTemplates.find((template) => template.id === pack.flagshipTemplateId) ?? workflowTemplates.find((template) => template.workflowPack === pack.id);
    const label = flagship ? `${pack.name ?? workflowLabel(pack.id)} - ${flagship.name}` : (pack.name ?? workflowLabel(pack.id));
    return { value: pack.id, label };
  });
  setSelectOptions(workflowTemplate, options, current);
  workflowTemplate.dataset.registryBacked = "true";
  workflowTemplate.dataset.workflowPackCount = String(workflowPacks.length);
  workflowTemplate.dataset.workflowTemplateCount = String(workflowTemplates.length);
}

function setSelectOptions(select, options, preferredValue) {
  const fallbackValue = options.some((option) => option.value === preferredValue) ? preferredValue : (options[0]?.value ?? "");
  const nextMarkup = options.map((option) => `<option value="${escapeAttr(option.value)}">${escapeXml(option.label)}</option>`).join("");
  if (select.innerHTML !== nextMarkup) select.innerHTML = nextMarkup;
  select.value = fallbackValue;
}

function mergeWorkflowPacks(primary, extra) {
  const byId = new Map();
  for (const pack of [...primary, ...extra]) {
    if (!pack?.id || byId.has(pack.id)) continue;
    byId.set(pack.id, pack);
  }
  return [...byId.values()];
}

async function loadWorkflowPackGallery(packId) {
  const cacheKey = workflowPackGalleryCacheKey(packId);
  if (!packId || workflowPackGalleries.has(cacheKey)) return;
  try {
    const styleProfile = encodeURIComponent(currentAssetStyleProfile());
    const url = packId.startsWith("realistic-")
      ? `/assets/realistic/gallery?workflowPack=${encodeURIComponent(packId)}&styleProfile=${styleProfile}`
      : `/assets/workflow-packs/${encodeURIComponent(packId)}/gallery?styleProfile=${styleProfile}`;
    const response = await fetch(url);
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.gallery) {
      workflowPackGalleries.set(cacheKey, payload.gallery);
      if (payload.gallery.visualQa) workflowPackVisualQaGalleries.set(cacheKey, payload.gallery.visualQa);
      renderAll();
    }
  } catch {
    // Gallery summaries are enhanced API data; local asset filtering still works.
  }
}

async function loadWorkflowPackVisualQaGallery(packId) {
  const cacheKey = workflowPackGalleryCacheKey(packId);
  if (!packId || workflowPackVisualQaGalleries.has(cacheKey)) return;
  if (packId.startsWith("realistic-")) {
    await loadWorkflowPackGallery(packId);
    return;
  }
  try {
    const response = await fetch(`/assets/workflow-packs/${encodeURIComponent(packId)}/visual-qa-gallery?styleProfile=${encodeURIComponent(currentAssetStyleProfile())}&limit=12`);
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.gallery) {
      workflowPackVisualQaGalleries.set(cacheKey, payload.gallery);
      renderAll();
    }
  } catch {
    // Visual QA galleries are an API enhancement; existing previews still render locally.
  }
}

async function loadAssetCoverageReport() {
  try {
    const response = await fetch("/assets/coverage-gap-report");
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.report) {
      assetCoverageReport = payload.report;
      renderAll();
    }
  } catch {
    // Coverage roadmap is an enhancement; the static editor remains usable offline.
  }
}

function findAsset(assetId) {
  const family = inferFamily(assetId);
  return curatedAssets.find((asset) => asset.id === assetId) ?? curatedAssets.find((asset) => asset.id === "cell-immune") ?? {
    id: assetId,
    name: assetId,
    family,
    qualityTier: HERO_ASSET_IDS.includes(assetId) ? "hero" : "standard",
    styleProfiles: ["consulting-2p5d", "publication-line", "minimal-flat", "dark-talk", "risk-warning", "scientific-editorial-realism"],
    workflowPacks: fallbackWorkflowPacks(assetId),
    semanticSlots: fallbackSemanticSlots(assetId),
    panelRole: "main-subject",
    renderSpec: { family, accent: "#2563eb", secondary: "#e0f2fe", version: 2, assetRecipe: commercialAssetRecipe({ id: assetId, family }) }
  };
}

function inferFamily(assetId) {
  if (/dna|rna|gene|protein|antibody|receptor|ligand|cytokine|metabolite|chromatin|nucleosome|compound|lead-series/.test(assetId)) return "molecule";
  if (/crispr|guide|screen|perturb|knockdown|activation|inhibition|editor|drug|target-validation|target-engagement|candidate-nomination|medicinal-chemistry-cycle|efficacy-model|ind-enabling-package/.test(assetId)) return "perturbation";
  if (/microscope|sequencer|plate|pipette|centrifuge|incubator|cytometer|sorter|machine|spectrometer|handler|cabinet/.test(assetId)) return "instrument";
  if (/spatial|visium|merfish|xenium|histology|tile|mask|boundary|neighborhood|registration|morphology/.test(assetId)) return "spatial";
  if (/dataset|store|data|label|pipeline/.test(assetId)) return "dataSystem";
  if (/benchmark|metric|matrix|curve|analysis|judge|rubric|leaderboard|ablation|interval|failure|gold|hit-triage|selectivity-panel|pk-profile|sar-table|admet|biomarker-response/.test(assetId)) return "metricPanel";
  if (/risk|policy|permission|refusal|review|audit|red-team|escalation|safety|filter|blocked|threat|biosecurity|durc|biosafety|dual-use|toxicity/.test(assetId)) return "riskGate";
  if (/model|network|transformer|training|inference|classifier|foundation|tuning|prediction|embedding/.test(assetId)) return "modelSystem";
  if (/prompt|context|retrieval|memory|tool|planner|executor|mcp|agent|router|scratchpad|schema/.test(assetId)) return "agentSystem";
  if (/deployment|monitoring|governance|incident|traceability|drift/.test(assetId)) return "governance";
  return "cell";
}

function renderReview() {
  const items = project.deck.reviewItems;
  const open = openReviewItems();
  reviewCount.textContent = String(open.length);
  if (!items.length) {
    if (reviewSummary) reviewSummary.innerHTML = "";
    reviewList.innerHTML = `<div class="review-item info"><div class="slide-title">No review queue yet</div><div class="review-meta">Click Review after generating or editing slides.</div></div>`;
    return;
  }
  renderReviewSummary();
  reviewList.innerHTML = items.map(reviewItemMarkup).join("");
  reviewList.querySelectorAll("button[data-review]").forEach((button) => {
    button.addEventListener("click", () => {
      checkpoint();
      const item = project.deck.reviewItems.find((candidate) => candidate.id === button.dataset.review);
      if (!item) return;
      item.status = button.dataset.status;
      item.resolvedAt = new Date().toISOString();
      applyReviewResolutionToScene(item, item.status);
      renderAll();
    });
  });
}

function renderReviewSummary() {
  if (!reviewSummary) return;
  const summary = summarizeReviewQueue(project);
  if (!summary.totals.total) {
    reviewSummary.innerHTML = "";
    return;
  }
  const readinessLabel = summary.deliveryReadiness.replace(/-/g, " ");
  const actionButtons = summary.actionItems.slice(0, 3).map((action) => {
    const status = action.recommendedStatus ?? (action.kind === "export" ? "accepted-risk" : "resolved");
    return `<button type="button" class="${action.blocking ? "danger" : action.kind === "export" ? "warning" : "primary"}" data-review-batch="${escapeAttr(action.id)}" data-status="${escapeAttr(status)}">${escapeXml(action.title)}</button>`;
  }).join("");
  const openFallbackIds = summary.exportFallbacks.assetIds ?? [];
  const acceptedFallbackIds = summary.exportFallbacks.acceptedAssetIds ?? [];
  const fallbackLine = openFallbackIds.length
    ? `Open Office fallback: ${openFallbackIds.slice(0, 5).map(labelForAsset).join(", ")}${openFallbackIds.length > 5 ? `, +${openFallbackIds.length - 5}` : ""}`
    : acceptedFallbackIds.length
      ? `Accepted Office fallback: ${acceptedFallbackIds.slice(0, 5).map(labelForAsset).join(", ")}${acceptedFallbackIds.length > 5 ? `, +${acceptedFallbackIds.length - 5}` : ""}`
      : "No Office fallbacks";
  reviewSummary.innerHTML = `<div class="review-summary-card ${escapeAttr(summary.deliveryReadiness)}">
    <div class="review-summary-head">
      <div>
        <div class="review-summary-eyebrow">Delivery readiness</div>
        <strong>${escapeXml(readinessLabel)}</strong>
      </div>
      <span class="review-summary-status ${summary.okToExport ? "ok" : "blocked"}">${summary.okToExport ? "exportable" : "blocked"}</span>
    </div>
    <div class="review-summary-metrics">
      <span><strong>${summary.totals.open}</strong><small>open</small></span>
      <span><strong>${summary.claimReview.openCount}</strong><small>claims</small></span>
      <span><strong>${summary.exportFallbacks.openCount}</strong><small>export</small></span>
      <span><strong>${summary.totals["accepted-risk"]}</strong><small>accepted</small></span>
    </div>
    <div class="review-summary-next">${escapeXml(summary.nextAction)}</div>
    <div class="review-summary-fallbacks">${escapeXml(fallbackLine)}</div>
    ${actionButtons ? `<div class="review-summary-actions">${actionButtons}</div>` : ""}
  </div>`;
  reviewSummary.querySelectorAll("button[data-review-batch]").forEach((button) => {
    button.addEventListener("click", () => {
      const freshSummary = summarizeReviewQueue(project);
      const action = freshSummary.actionItems.find((candidate) => candidate.id === button.dataset.reviewBatch);
      if (!action) return;
      checkpoint();
      const ids = new Set(action.reviewItemIds);
      const status = button.dataset.status || action.recommendedStatus || "resolved";
      const resolvedAt = new Date().toISOString();
      project.deck.reviewItems.forEach((item) => {
        if (ids.has(item.id)) {
          item.status = status;
          item.resolvedAt = resolvedAt;
          applyReviewResolutionToScene(item, status);
        }
      });
      renderAll();
    });
  });
}

function applyReviewResolutionToScene(item, status) {
  if (status !== "resolved") return;
  if (item.kind !== "claim" || !item.nodeId) return;
  for (const page of project.pages) {
    if (item.pageId && page.id !== item.pageId) continue;
    const node = page.nodes.find((candidate) => candidate.id === item.nodeId);
    if (node && node.claimStatus === "needs-citation") {
      node.claimStatus = "user-confirmed";
      node.provenance = { ...node.provenance, editState: "modified" };
      return;
    }
  }
}

function renderDeliveryPanel() {
  if (!deliveryPanel || !deliveryStatus) return;
  const hasReview = project.deck.reviewItems.length > 0;
  const summary = hasReview ? summarizeReviewQueue(project) : null;
  const officeFallbackEstimate = estimateOfficeFallbacks(project);
  const open = summary?.totals.open ?? 0;
  deliveryStatus.textContent = hasReview ? String(open) : "!";
  deliveryStatus.classList.toggle("ready", Boolean(summary && summary.deliveryReadiness === "ready"));
  const readiness = summary?.deliveryReadiness ?? "review-needed";
  const readinessLabel = readiness.replace(/-/g, " ");
  const claimCount = summary?.claimReview.openCount ?? 0;
  const openFallbackIds = summary?.exportFallbacks.assetIds ?? [];
  const acceptedFallbackIds = summary?.exportFallbacks.acceptedAssetIds ?? [];
  const estimatedFallbackIds = officeFallbackEstimate.assetIds;
  const fallbackCount = openFallbackIds.length || acceptedFallbackIds.length || estimatedFallbackIds.length;
  const fallbackState = openFallbackIds.length || (!hasReview && estimatedFallbackIds.length) ? "warn" : "pass";
  const fallbackValue = openFallbackIds.length
    ? `${openFallbackIds.length} asset`
    : acceptedFallbackIds.length
      ? `${acceptedFallbackIds.length} accepted`
      : estimatedFallbackIds.length
        ? `${estimatedFallbackIds.length} asset`
        : "clear";
  const sourcePreserved = true;
  const checklist = [
    { label: "Scene JSON source", state: sourcePreserved ? "pass" : "warn", value: sourcePreserved ? "preserved" : "missing" },
    { label: "Review queue", state: hasReview ? "pass" : "warn", value: hasReview ? `${open} open` : "not run" },
    { label: "Claims", state: claimCount ? "warn" : "pass", value: claimCount ? `${claimCount} open` : "clear" },
    { label: "Office fallback", state: fallbackState, value: fallbackValue }
  ];
  const pptxStatus = openFallbackIds.length || (!hasReview && estimatedFallbackIds.length)
    ? "fallbacks"
    : acceptedFallbackIds.length
      ? "accepted"
      : "editable";
  const formats = [
    { id: "json", label: "Scene JSON", mode: "source", status: "canonical" },
    { id: "svg", label: "Deck SVG", mode: "local", status: "vector" },
    { id: "png", label: "Current PNG", mode: "local", status: "raster" },
    { id: "pdf", label: "PDF", mode: "api", status: "share" },
    { id: "pptx", label: "PPTX", mode: "api", status: pptxStatus }
  ];
  const fallbackLine = openFallbackIds.length
    ? `PPTX needs fallback review for ${openFallbackIds.length} premium asset${openFallbackIds.length === 1 ? "" : "s"}: ${openFallbackIds.slice(0, 4).map(labelForAsset).join(", ")}${openFallbackIds.length > 4 ? ", +" + (openFallbackIds.length - 4) : ""}.`
    : acceptedFallbackIds.length
      ? `PPTX fallback accepted for ${acceptedFallbackIds.length} premium asset${acceptedFallbackIds.length === 1 ? "" : "s"}: ${acceptedFallbackIds.slice(0, 4).map(labelForAsset).join(", ")}${acceptedFallbackIds.length > 4 ? ", +" + (acceptedFallbackIds.length - 4) : ""}.`
      : estimatedFallbackIds.length
        ? `PPTX may simplify ${estimatedFallbackIds.length} premium asset${estimatedFallbackIds.length === 1 ? "" : "s"}: ${estimatedFallbackIds.slice(0, 4).map(labelForAsset).join(", ")}${estimatedFallbackIds.length > 4 ? ", +" + (estimatedFallbackIds.length - 4) : ""}.`
    : "";
  const nextAction = summary?.nextAction ?? "Run Review before final delivery so claim, layout, and export warnings are captured.";
  deliveryPanel.innerHTML = `<div class="delivery-card ${escapeAttr(readiness)}">
    <div class="delivery-head">
      <div>
        <div class="delivery-eyebrow">Export gate</div>
        <strong>${escapeXml(readinessLabel)}</strong>
      </div>
      <span class="delivery-badge">${summary?.okToExport ? "exportable" : hasReview ? "blocked" : "review"}</span>
    </div>
    <div class="delivery-checklist">
      ${checklist.map((item) => `<span class="${escapeAttr(item.state)}"><strong>${escapeXml(item.value)}</strong><small>${escapeXml(item.label)}</small></span>`).join("")}
    </div>
    <div class="delivery-next">${escapeXml(fallbackLine || nextAction)}</div>
    ${deliveryNotice ? `<div class="delivery-notice">${escapeXml(deliveryNotice)}</div>` : ""}
    <div class="delivery-format-grid">
      ${formats.map((format) => `<button type="button" data-delivery-export="${escapeAttr(format.id)}" class="${format.id === "pptx" && (openFallbackIds.length || (!hasReview && estimatedFallbackIds.length)) ? "warning" : ""}"><strong>${escapeXml(format.label)}</strong><small>${escapeXml(format.mode)} / ${escapeXml(format.status)}</small></button>`).join("")}
    </div>
  </div>`;
  deliveryPanel.querySelectorAll("button[data-delivery-export]").forEach((button) => {
    button.addEventListener("click", () => {
      deliveryExport(button.dataset.deliveryExport);
    });
  });
}

async function deliveryExport(format) {
  const summary = project.deck.reviewItems.length ? summarizeReviewQueue(project) : null;
  const officeFallbackEstimate = estimateOfficeFallbacks(project);
  const acceptedFallbackIds = new Set(summary?.exportFallbacks.acceptedAssetIds ?? []);
  const unacceptedFallback = format === "pptx" && officeFallbackEstimate.assetIds.some((assetId) => !acceptedFallbackIds.has(assetId));
  const shouldWarn = !summary || summary.claimReview.openCount > 0 || summary.exportFallbacks.openCount > 0 || summary.totals.openBlocking > 0 || unacceptedFallback;
  if (shouldWarn) {
    const label = summary?.deliveryReadiness?.replace(/-/g, " ") ?? "review not run";
    const proceed = window.confirm(`Delivery readiness: ${label}. Export ${String(format).toUpperCase()} anyway?`);
    if (!proceed) return;
  }
  deliveryNotice = "";
  if (format === "json") {
    download(`${slug(project.title)}.sci-vis.json`, "application/json", JSON.stringify(project, null, 2));
    deliveryNotice = "Scene JSON exported as canonical source.";
    renderDeliveryPanel();
    return;
  }
  if (format === "svg") {
    download(`${slug(project.title)}-deck.svg`, "image/svg+xml", renderDeckSvg());
    deliveryNotice = "Deck SVG exported with vector scene structure.";
    renderDeliveryPanel();
    return;
  }
  if (format === "png") {
    await exportPng();
    deliveryNotice = "Current slide PNG export started.";
    renderDeliveryPanel();
    return;
  }
  if (format === "pdf" || format === "pptx" || format === "docx") {
    await exportViaApi(format);
    renderDeliveryPanel();
  }
}

async function exportViaApi(format) {
  try {
    const response = await fetch(`http://127.0.0.1:8787/exports/${encodeURIComponent(format)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project })
    });
    if (!response.ok) throw new Error(`Local API returned ${response.status}`);
    const blob = await response.blob();
    const filename = filenameFromDisposition(response.headers.get("content-disposition")) ?? `${slug(project.title)}-deck.${format}`;
    downloadBlob(filename, blob);
    const warnings = parseWarningsHeader(response.headers.get("x-scientific-image-warnings"));
    deliveryNotice = warnings.length
      ? `${format.toUpperCase()} exported with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}. ${warnings[0]}`
      : `${format.toUpperCase()} exported.`;
  } catch (error) {
    deliveryNotice = `Local API export failed for ${format.toUpperCase()}: ${error instanceof Error ? error.message : String(error)}.`;
  }
}

function filenameFromDisposition(disposition) {
  const match = String(disposition ?? "").match(/filename="([^"]+)"/);
  return match?.[1];
}

function parseWarningsHeader(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function estimateOfficeFallbacks(deck) {
  const assetIds = new Set();
  const templateIds = new Set();
  let plotCount = 0;
  let imageCount = 0;
  for (const page of deck.pages) {
    for (const node of page.nodes) {
      if (node.kind === "plot") plotCount += 1;
      if (node.kind === "image" || node.kind === "group") imageCount += 1;
      if (node.kind !== "symbol") continue;
      const asset = findAsset(node.payload?.assetId);
      const isPremium = ["signature", "hero"].includes(asset?.qualityTier);
      const isLayered = Number(asset?.renderSpec?.version ?? 0) >= 2 || Boolean(asset?.renderSpec?.assetRecipe);
      if (isPremium && isLayered) assetIds.add(node.payload.assetId);
      const templateId = node.payload?.templateId || templateIdFromLayoutHint(node.payload?.layoutHint);
      if (templateId) templateIds.add(templateId);
    }
  }
  return {
    assetIds: [...assetIds],
    templateIds: [...templateIds],
    plotCount,
    imageCount
  };
}

function reviewItemMarkup(item) {
  const chips = reviewItemChips(item);
  const fallbackAssets = Array.isArray(item.fallbackAssets) ? item.fallbackAssets.slice(0, 4) : [];
  return `<div class="review-item ${escapeAttr(item.severity)}">
    <div class="review-title-row">
      <div class="slide-title">${escapeXml(item.title ?? item.kind)}</div>
      <span class="review-status">${escapeXml(item.status)}</span>
    </div>
    <div class="review-meta">${escapeXml(item.message)}</div>
    ${chips.length ? `<div class="review-chip-row">${chips.map((chip) => `<span class="review-chip">${escapeXml(chip)}</span>`).join("")}</div>` : ""}
    ${fallbackAssets.length ? `<div class="review-fallback-grid">${fallbackAssets.map((asset) => `<span class="review-fallback-chip"><strong>${escapeXml(asset.name || asset.assetId)}</strong><small>${escapeXml(asset.assetRecipe || asset.exportBehavior || "svg fallback")}</small></span>`).join("")}</div>` : ""}
    ${item.action ? `<div class="review-action-text">${escapeXml(item.action)}</div>` : ""}
    ${item.status === "open" ? `<div class="review-actions"><button data-review="${item.id}" data-status="resolved">Resolve</button><button data-review="${item.id}" data-status="accepted-risk">Accept risk</button></div>` : ""}
  </div>`;
}

function reviewItemChips(item) {
  const chips = [`${item.kind} / ${item.severity}`];
  if (item.exportFormat) chips.push(String(item.exportFormat).toUpperCase());
  if (item.templateId) chips.push(item.templateId);
  if (item.workflowPack) chips.push(item.workflowPack);
  if (item.metrics?.semanticRole) chips.push(String(item.metrics.semanticRole));
  if (item.metrics?.layoutHint) chips.push(String(item.metrics.layoutHint));
  if (item.metrics?.provenanceKind) chips.push(`source:${item.metrics.provenanceKind}`);
  if (item.metrics?.claimStatus) chips.push(String(item.metrics.claimStatus));
  if (item.metrics?.premiumAssetFallbackCount !== undefined) chips.push(`${item.metrics.premiumAssetFallbackCount} SVG assets`);
  if (item.metrics?.plotFallbackCount !== undefined) chips.push(`${item.metrics.plotFallbackCount} plots`);
  return chips;
}

function renderVisualQa() {
  if (!visualQaList || !visualQaCount) return;
  const page = currentPage();
  const issues = page ? visualQaIssues(page) : [];
  const activeIssues = issues.filter((issue) => issue.severity !== "pass");
  visualQaCount.textContent = String(activeIssues.length);
  visualQaList.innerHTML = issues.map((issue) => `<div class="visual-qa-item ${issue.severity}">
    <div class="qa-title">${escapeXml(issue.title)}</div>
    <div class="qa-meta">${escapeXml(issue.message)}</div>
    ${issue.pills?.length ? `<div class="qa-pill-row">${issue.pills.map((pill) => `<span class="qa-pill">${escapeXml(pill)}</span>`).join("")}</div>` : ""}
  </div>`).join("");
}

function visualQaIssues(page) {
  const issues = [];
  const nodes = page.nodes.filter((node) => !node.hidden);
  const boundsIssues = nodes.filter((node) => isNodeOutOfBounds(node, page));
  const unsupported = nodes.filter((node) => node.claimStatus === "unsupported-claim");
  const evidenceNeedsSource = nodes.filter((node) => node.claimStatus === "needs-citation" && isEvidenceReviewNode(node));
  const needsCitation = nodes.filter((node) => node.claimStatus === "needs-citation" && !isStructuralReviewTextNode(node) && !isEvidenceReviewNode(node));
  const missingProvenance = nodes.filter((node) => !node.provenance?.source || !node.provenance?.license);
  const generatedReview = nodes.filter((node) => node.provenance?.kind === "generated" && node.provenance?.editState === "needs-review");
  const fallbackNodes = nodes.filter((node) => ["image", "plot", "group"].includes(node.kind));
  const textOverflow = nodes.filter(textLikelyOverflows);
  const overlaps = likelyVisualOverlaps(nodes);
  const templateQa = qaForPageTemplate(nodes);
  const pptxReadiness = templateQa?.exportReadiness?.pptx;

  if (boundsIssues.length) {
    issues.push({
      severity: "error",
      title: "Objects outside artboard",
      message: `${boundsIssues.length} object${boundsIssues.length === 1 ? "" : "s"} may be clipped during export.`,
      pills: boundsIssues.slice(0, 3).map((node) => node.name)
    });
  }
  if (unsupported.length) {
    issues.push({
      severity: "error",
      title: "Unsupported scientific claim",
      message: `${unsupported.length} object${unsupported.length === 1 ? "" : "s"} are explicitly marked unsupported.`,
      pills: unsupported.slice(0, 3).map((node) => node.name)
    });
  }
  if (needsCitation.length) {
    issues.push({
      severity: "warning",
      title: "Citation confirmation needed",
      message: `${needsCitation.length} claim object${needsCitation.length === 1 ? "" : "s"} need citation or user confirmation.`,
      pills: summarizeNodeKinds(needsCitation)
    });
  }
  if (evidenceNeedsSource.length) {
    issues.push({
      severity: "warning",
      title: "Evidence source review",
      message: `${evidenceNeedsSource.length} plot/data evidence object${evidenceNeedsSource.length === 1 ? "" : "s"} need source verification.`,
      pills: evidenceNeedsSource.slice(0, 3).map((node) => node.name)
    });
  }
  if (missingProvenance.length) {
    issues.push({
      severity: "warning",
      title: "Missing provenance fields",
      message: `${missingProvenance.length} object${missingProvenance.length === 1 ? "" : "s"} are missing source or license metadata.`,
      pills: summarizeNodeKinds(missingProvenance)
    });
  }
  if (generatedReview.length) {
    issues.push({
      severity: "warning",
      title: "Generated assets need review",
      message: `${generatedReview.length} generated object${generatedReview.length === 1 ? "" : "s"} still have needs-review provenance.`,
      pills: generatedReview.slice(0, 3).map((node) => node.name)
    });
  }
  if (textOverflow.length) {
    issues.push({
      severity: "warning",
      title: "Possible text overflow",
      message: `${textOverflow.length} text object${textOverflow.length === 1 ? "" : "s"} may not fit cleanly at export size.`,
      pills: textOverflow.slice(0, 3).map((node) => node.name)
    });
  }
  if (overlaps.length) {
    issues.push({
      severity: "warning",
      title: "Visual overlap risk",
      message: `${overlaps.length} non-text visual overlap${overlaps.length === 1 ? "" : "s"} could obscure data or assets.`,
      pills: overlaps.slice(0, 3)
    });
  }
  if (nodes.length > 34) {
    issues.push({
      severity: "info",
      title: "Dense slide",
      message: `${nodes.length} objects on this slide. Consider using a multi-panel figure layout or section divider.`,
      pills: [`${nodes.length} objects`]
    });
  }
  if (fallbackNodes.length) {
    issues.push({
      severity: "info",
      title: "PPTX fallback likely",
      message: `${summarizeNodeKinds(fallbackNodes).join(", ")} may export as high-resolution SVG/image fallback for visual fidelity.`,
      pills: ["SVG/PDF preserve fidelity", "PPTX may warn"]
    });
  }
  if (pptxReadiness?.premiumAssetFallbackCount || pptxReadiness?.plotFallbackCount) {
    const fallbackAssets = Array.isArray(pptxReadiness.fallbackAssets) ? pptxReadiness.fallbackAssets : [];
    const shownAssets = fallbackAssets.slice(0, 3).map((asset) => asset.name || asset.assetId).filter(Boolean);
    issues.push({
      severity: "info",
      title: "Template export readiness",
      message: `PPTX is ${String(pptxReadiness.status).replace(/-/g, " ")}: ${pptxReadiness.premiumAssetFallbackCount ?? 0} premium SVG asset fallback${pptxReadiness.premiumAssetFallbackCount === 1 ? "" : "s"} and ${pptxReadiness.plotFallbackCount ?? 0} plot placeholder${pptxReadiness.plotFallbackCount === 1 ? "" : "s"}.`,
      pills: shownAssets.length ? shownAssets : ["Scene JSON/SVG stays canonical"]
    });
  }
  if (!issues.length) {
    issues.push({
      severity: "pass",
      title: "Slide passes visual QA",
      message: "No clipping, unsupported claims, missing provenance, obvious overflow, or unresolved export readiness risks detected.",
      pills: ["ready for review"]
    });
  }
  return issues.slice(0, 8);
}

function qaForPageTemplate(nodes) {
  const templateIds = new Map();
  const packIds = new Map();
  for (const node of nodes) {
    const templateId = node.payload?.templateId ?? templateIdFromLayoutHint(node.payload?.layoutHint);
    const workflowPack = node.payload?.workflowPack;
    if (templateId) templateIds.set(templateId, (templateIds.get(templateId) ?? 0) + 1);
    if (workflowPack) packIds.set(workflowPack, (packIds.get(workflowPack) ?? 0) + 1);
  }
  const templateId = highestCountKey(templateIds);
  const packId = highestCountKey(packIds);
  if (templateId) {
    const template = workflowTemplates.find((candidate) => candidate.id === templateId);
    const gallery = template ? cachedWorkflowPackGallery(template.workflowPack) : packId ? cachedWorkflowPackGallery(packId) : null;
    return gallery?.templateQa?.find((qa) => qa.templateId === templateId) ?? templateQaFor(template ?? { id: templateId, workflowPack: packId });
  }
  if (packId) {
    const gallery = cachedWorkflowPackGallery(packId);
    const flagshipId = gallery?.flagshipDemo?.templateId ?? workflowPacks.find((pack) => pack.id === packId)?.flagshipTemplateId;
    return gallery?.templateQa?.find((qa) => qa.templateId === flagshipId) ?? gallery?.templateQa?.[0] ?? null;
  }
  return null;
}

function templateIdFromLayoutHint(layoutHint) {
  if (typeof layoutHint !== "string") return "";
  const [candidate] = layoutHint.split(":");
  return workflowTemplates.some((template) => template.id === candidate) ? candidate : "";
}

function highestCountKey(counts) {
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

function isNodeOutOfBounds(node, page) {
  const t = node.transform;
  const margin = 3;
  return t.x < -margin || t.y < -margin || t.x + t.width > page.width + margin || t.y + t.height > page.height + margin;
}

function textLikelyOverflows(node) {
  if (!["text", "annotation"].includes(node.kind)) return false;
  const text = node.payload?.text ?? "";
  if (!text || text.length < 36) return false;
  const fontSize = Number(node.style.fontSize ?? 16);
  const lineHeight = fontSize * 1.25;
  const lineChars = Math.max(8, Math.floor(node.transform.width / Math.max(7, fontSize * 0.54)));
  const maxLines = Math.max(1, Math.floor(node.transform.height / lineHeight));
  return text.length > lineChars * maxLines * 1.18;
}

function likelyVisualOverlaps(nodes) {
  const visualNodes = nodes.filter((node) => !["connector", "shape", "text", "annotation"].includes(node.kind));
  const overlaps = [];
  for (let i = 0; i < visualNodes.length; i += 1) {
    for (let j = i + 1; j < visualNodes.length; j += 1) {
      const a = visualNodes[i];
      const b = visualNodes[j];
      const area = overlapArea(a.transform, b.transform);
      const minArea = Math.min(a.transform.width * a.transform.height, b.transform.width * b.transform.height);
      if (minArea > 0 && area / minArea > 0.22) overlaps.push(`${a.name} + ${b.name}`);
    }
  }
  return overlaps;
}

function overlapArea(a, b) {
  const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return x * y;
}

function summarizeNodeKinds(nodes) {
  const counts = new Map();
  for (const node of nodes) counts.set(node.kind, (counts.get(node.kind) ?? 0) + 1);
  return [...counts.entries()].map(([kind, count]) => `${count} ${kind}${count === 1 ? "" : "s"}`);
}

function renderAgentLog() {
  if (!project.deck.agentRuns.length) {
    agentLog.innerHTML = `<div class="agent-entry agent-empty">Agent activity appears here after drafting or generating.</div>`;
    return;
  }
  const report = summarizeAgentTrace(project);
  const reviewSummary = summarizeReviewQueue(project);
  const topTools = Object.entries(report.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const fallbackIds = reviewSummary.exportFallbacks.assetIds.slice(0, 5);
  agentLog.innerHTML = [
    `<div class="agent-summary-card">
      <div class="agent-summary-head">
        <span>Trace report</span>
        <strong>${report.tracedRunCount}/${report.runCount}</strong>
      </div>
      <div class="agent-metrics">
        <span><strong>${report.generatedNodeCount}</strong><small>nodes</small></span>
        <span><strong>${report.assetIds.length}</strong><small>assets</small></span>
        <span><strong>${report.workflowPacks.length}</strong><small>packs</small></span>
        <span><strong>${reviewSummary.totals.open}</strong><small>review</small></span>
      </div>
      <div class="agent-chip-row">${topTools.length ? topTools.map(([tool, count]) => `<span class="agent-chip">${escapeXml(tool)} ${count}</span>`).join("") : `<span class="agent-chip muted">No tools yet</span>`}</div>
      ${fallbackIds.length ? `<div class="agent-chip-row agent-fallback-row">${fallbackIds.map((assetId) => `<span class="agent-chip fallback">${escapeXml(assetId)}</span>`).join("")}</div>` : ""}
      <div class="agent-next">${escapeXml(report.nextAction)}</div>
    </div>`,
    ...report.latestRuns.map((run) => renderAgentRunCard(run, reviewSummary))
  ].join("");
}

function renderAgentRunCard(run, reviewSummary) {
  const toolList = run.toolSequence.slice(0, 5);
  const assetList = run.assetIds.slice(0, 6);
  const detail = [
    `${run.operationCount} operations`,
    `${run.generatedNodeIds.length} generated nodes`,
    run.workflowPack,
    run.templateId
  ].filter(Boolean).join(" / ");
  return `<div class="agent-entry ${run.toolSequence.length ? "traced" : "untraced"}">
    <div class="agent-entry-head">
      <strong>${escapeXml(run.name)}</strong>
      <span>${escapeXml(run.status)}</span>
    </div>
    <div class="review-meta">${escapeXml(detail || "No operations recorded")}</div>
    ${toolList.length ? `<div class="agent-tool-sequence">${toolList.map((tool) => `<span>${escapeXml(tool)}</span>`).join("")}</div>` : `<div class="agent-tool-sequence muted"><span>missing trace</span></div>`}
    ${assetList.length ? `<div class="agent-chip-row">${assetList.map((assetId) => `<span class="agent-chip asset">${escapeXml(assetId)}</span>`).join("")}</div>` : ""}
    ${run.workflowPack ? `<div class="agent-review-row"><span>${escapeXml(run.workflowPack)}</span><span>${escapeXml(run.templateId ?? "no-template")}</span><span>${escapeXml(reviewSummary.deliveryReadiness)}</span><span>${reviewSummary.exportFallbacks.openCount} export fallback</span></div>` : ""}
    ${run.resourceUris.length ? `<div class="agent-resource-row">${run.resourceUris.length} agent resources linked</div>` : ""}
  </div>`;
}

function summarizeAgentTrace(inputProject) {
  const runs = inputProject.deck.agentRuns ?? [];
  const latestRuns = runs.slice().sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))).slice(0, 8).map(agentTraceRunSummary);
  const tracedRuns = runs.filter((run) => Boolean(run.trace));
  const toolUsage = {};
  for (const run of tracedRuns) {
    for (const tool of run.trace?.toolSequence ?? []) toolUsage[tool] = (toolUsage[tool] ?? 0) + 1;
  }
  const missingTraceRunIds = runs.filter((run) => !run.trace).map((run) => run.id);
  return {
    runCount: runs.length,
    tracedRunCount: tracedRuns.length,
    untracedRunCount: missingTraceRunIds.length,
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
      ? "Some legacy runs lack trace metadata; new generated figures are trace-aware."
      : tracedRuns.length
        ? "Validate review items and export fallbacks before delivery."
        : "Use outline or workflow generation to create traceable edits."
  };
}

function agentTraceRunSummary(run) {
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
    operationCount: run.operations?.length ?? 0
  };
}

function agentTraceAssetIds(run) {
  return uniqueStrings([
    ...(run.trace?.compactIndex?.assetIds ?? []),
    ...(run.trace?.recommendation?.assetIds ?? []),
    ...(run.trace?.insertPlan?.map((item) => item.assetId) ?? []),
    ...((run.trace?.references ?? []).flatMap((reference) => reference.assetIds ?? []))
  ]);
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length))];
}

function importSourceFromTextarea() {
  const text = sourceText.value.trim();
  if (!text) return;
  checkpoint();
  const source = {
    id: id("source"),
    kind: "markdown",
    name: inferTitle(text, "Imported notes.md"),
    text,
    snippets: extractSnippets(text),
    provenance: { kind: "derived", source: "User-pasted source text", license: "private/unverified", editState: "original" },
    createdAt: new Date().toISOString()
  };
  project.deck.sources.push(source);
  addAgentRun("Import source", `Imported ${source.name}`, [{ op: "add-source", payload: { source } }], [source.id]);
  renderAll();
}

function draftOutline() {
  checkpoint();
  const sources = project.deck.sources.length ? project.deck.sources : [createEphemeralSource()];
  const signal = sources.flatMap((source) => source.snippets.map((snippet) => snippet.text)).join("\n");
  const title = inferTitle(signal, project.title);
  const slideCount = 8;
  const sectionTitles = ["Context", "Approach", "Evidence", "Implications"];
  const sections = sectionTitles.map((title) => ({ id: id("section"), title, summary: `${title} section`, slideIds: [] }));
  const titles = inferSlideTitles(title, signal, slideCount);
  const intents = ["title", "mechanism", "workflow", "results", "comparison", "results", "summary", "summary"];
  const slides = titles.map((slideTitle, index) => {
    const section = sections[Math.min(sections.length - 1, Math.floor(index / 2))];
    const slide = {
      id: id("brief"),
      title: slideTitle,
      sectionId: section.id,
      goal: index === 0 ? `Frame ${title}.` : `Explain ${slideTitle}.`,
      narrative: inferNarrative(slideTitle, signal),
      layoutIntent: intents[index % intents.length],
      requiredSources: sources.map((source) => source.id).slice(0, 3),
      status: "draft"
    };
    section.slideIds.push(slide.id);
    return slide;
  });
  project.deck.outline = {
    id: id("outline"),
    audience: "scientific presentation audience",
    goal: "Create a clear, colorful scientific slide deck with visible provenance.",
    title,
    sections,
    slides,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  addAgentRun("Create deck outline", `Draft ${slideCount}-slide outline`, [{ op: "set-outline", payload: { outline: project.deck.outline } }], sources.map((source) => source.id));
  renderAll();
}

function approveAndGenerateDeck() {
  if (!project.deck.outline) draftOutline();
  checkpoint();
  project.deck.outline.status = "approved";
  project.pages = [];
  project.deck.slideMeta = {};
  const operations = [];
  project.deck.outline.slides.forEach((brief, index) => {
    brief.status = "generated";
    const page = createGeneratedSlide(brief, index);
    project.pages.push(page);
    activePageId ||= page.id;
    project.deck.slideMeta[page.id] = {
      pageId: page.id,
      outlineSlideId: brief.id,
      title: brief.title,
      section: project.deck.outline.sections.find((section) => section.id === brief.sectionId)?.title ?? "Deck",
      speakerNotes: `${brief.goal}\n\n${brief.narrative}`,
      narrativeIntent: brief.narrative,
      layoutIntent: brief.layoutIntent,
      sourceIds: brief.requiredSources
    };
    operations.push({ op: "add-page", pageId: page.id, payload: { page } });
  });
  project.deck.outline.status = "generated";
  activePageId = project.pages[0]?.id;
  selectedId = null;
  project.deck.reviewItems = generateReviewItems(project);
  addAgentRun("Generate deck slides", `Generated ${project.pages.length} editable slides`, operations, project.deck.outline.slides.flatMap((slide) => slide.requiredSources));
  renderAll();
}

function createGeneratedSlide(brief, index) {
  const page = createPage(brief.title);
  page.background = index % 3 === 0 ? "#f8fafc" : index % 3 === 1 ? "#f0fdf4" : "#eff6ff";
  page.nodes = [
    createTextNode(brief.title, 72, 44, 760, 58, { fontSize: index === 0 ? 38 : 30, fontWeight: 800 }),
    createTextNode(brief.narrative, 76, 112, 760, 82, { fontSize: 18, fontWeight: 500, color: "#475569" }),
    ...nodesForLayout(brief, index),
    createTextNode(`Review: cite claims and confirm slide ${index + 1}`, 72, 640, 520, 34, { fontSize: 14, fontWeight: 500, color: "#64748b" })
  ].map((node, z) => ({ ...node, transform: { ...node.transform, z } }));
  return page;
}

function nodesForLayout(brief) {
  if (brief.layoutIntent === "workflow" || brief.layoutIntent === "mechanism") {
    const labels = ["Sources", "Agent draft", "Evidence", "Review"];
    const assetIds = assetsForBrief(brief);
    const nodes = [];
    labels.forEach((label, index) => {
      nodes.push(createSymbolNode(assetIds[index], label, 104 + index * 278, 286, 158, 126));
      if (index > 0) nodes.push(createConnectorNode(104 + (index - 1) * 278 + 166, 350, 104 + index * 278 - 8, 350));
    });
    nodes.push(createShapeNode("round-rect", brief.narrative.slice(0, 96), 124, 522, 770, 68, "#ffffff", "#cbd5e1"));
    return nodes;
  }
  if (brief.layoutIntent === "comparison") {
    return [
      createSymbolNode("model-block", "Current model", 176, 282, 178, 138),
      createShapeNode("round-rect", "Limited provenance and review visibility", 96, 456, 390, 72, "#e0f2fe", "#0284c7"),
      createSymbolNode("risk-gate", "Controlled workflow", 760, 282, 178, 138),
      createShapeNode("round-rect", "Claims, evidence, and export warnings are explicit", 672, 456, 430, 72, "#dcfce7", "#16a34a"),
      createConnectorNode(520, 392, 640, 392)
    ];
  }
  if (brief.layoutIntent === "results") {
    return [
      createSymbolNode("benchmark", "Evaluation", 134, 260, 180, 138),
      createShapeNode("round-rect", "Key result", 96, 430, 450, 94, "#ffffff", "#2563eb"),
      createSymbolNode("uncertainty-score", "Uncertainty", 746, 260, 180, 138),
      createShapeNode("round-rect", "Interpretation", 680, 430, 420, 94, "#fff7ed", "#ea580c")
    ];
  }
  return [
    createSymbolNode(chooseAsset(brief), "Scientific visual story", 875, 160, 230, 160),
    createShapeNode("round-rect", "Take-home message", 120, 330, 610, 150, "#ecfeff", "#0891b2")
  ];
}

function assetsForBrief(brief) {
  const text = `${brief.title} ${brief.narrative} ${brief.layoutIntent}`.toLowerCase();
  if (/perturb|crispr|screen|single-cell|sequenc/.test(text)) return ["cell-t", "crispr-cas9", "scrna-droplet", "sequencer"];
  if (/spatial|tissue|imaging|microscopy/.test(text)) return ["tissue-section", "spatial-grid", "segmentation-mask", "cell-neighborhood"];
  if (/biosecurity|risk|safety|permission|review/.test(text)) return ["dataset", "bio-classifier", "risk-gate", "human-review"];
  if (/benchmark|evaluation|metric|calibration/.test(text)) return ["benchmark", "confusion-matrix", "calibration-curve", "judge-model"];
  return ["dataset", "agent-loop", "model-block", "risk-gate"];
}

function generateReviewItems(deck) {
  const items = [];
  for (const page of deck.pages) {
    const meta = deck.deck.slideMeta[page.id];
    if (!meta?.speakerNotes.trim()) items.push(reviewItem("accessibility", "info", "Slide has no speaker notes.", page.id));
    for (const node of page.nodes) {
      if (node.claimStatus === "needs-citation" && !isStructuralReviewTextNode(node)) items.push(reviewItemForNodeIssue("node.claim.needs-citation", page, node));
      if (node.claimStatus === "unsupported-claim") items.push(reviewItemForNodeIssue("node.claim.unsupported", page, node));
      if (!node.provenance.source || !node.provenance.license) items.push(reviewItemForNodeIssue("node.provenance.missing", page, node));
      if (node.transform.x + node.transform.width > page.width || node.transform.y + node.transform.height > page.height) items.push(reviewItemForNodeIssue("node.bounds.off-page", page, node));
    }
    const exportItem = templateExportReviewItem(page);
    if (exportItem) items.push(exportItem);
  }
  return dedupe(items);
}

function summarizeReviewQueue(deck) {
  const reviewItems = deck.deck.reviewItems.length ? deck.deck.reviewItems : generateReviewItems(deck);
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
    generatedAt: new Date().toISOString(),
    okToExport: !openErrors.length,
    deliveryReadiness,
    nextAction: actionItems[0]?.action ?? "Ready for export. Keep scene JSON/SVG as source preservation alongside delivery files.",
    totals: {
      total: reviewItems.length,
      open: openItems.length,
      resolved: reviewItems.filter((item) => item.status === "resolved").length,
      "accepted-risk": reviewItems.filter((item) => item.status === "accepted-risk").length,
      openBlocking: openErrors.length
    },
    claimReview: {
      openCount: openClaims.length,
      itemIds: openClaims.map((item) => item.id),
      pageIds: uniqueDefined(openClaims.map((item) => item.pageId)),
      nodeIds: uniqueDefined(openClaims.map((item) => item.nodeId))
    },
    exportFallbacks: summarizeExportFallbacks(openExports, acceptedExports),
    actionItems,
    humanDecisionQueue: openItems
      .slice()
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

function createReviewQueueActionItems(input) {
  const actions = [];
  if (input.openErrors.length) {
    actions.push({
      id: "fix-blocking-review-errors",
      kind: input.openErrors[0].kind,
      severity: "error",
      title: "Fix blocking errors",
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
      title: "Confirm claims",
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
      title: "Accept export fallback",
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
      title: "Resolve layout",
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
      title: "Review warnings",
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
      title: "Clear notes",
      count: uncategorizedInfo.length,
      reviewItemIds: uncategorizedInfo.map((item) => item.id),
      action: "Resolve informational review items when they are no longer useful reminders.",
      blocking: false,
      recommendedStatus: "resolved"
    });
  }
  return actions.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function summarizeExportFallbacks(openExports, acceptedExports = []) {
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

function titleForReviewKind(kind) {
  if (kind === "claim") return "Claim review";
  if (kind === "provenance") return "Provenance review";
  if (kind === "layout") return "Layout review";
  if (kind === "accessibility") return "Accessibility review";
  return "Export review";
}

function reviewPriority(item) {
  return severityRank(item.severity) * 10 + kindRank(item.kind);
}

function severityRank(severity) {
  if (severity === "error") return 0;
  if (severity === "warning") return 1;
  return 2;
}

function kindRank(kind) {
  if (kind === "claim") return 0;
  if (kind === "provenance") return 1;
  if (kind === "export") return 2;
  if (kind === "layout") return 3;
  return 4;
}

function uniqueDefined(values) {
  return [...new Set(values.filter(Boolean))];
}

function templateExportReviewItem(page) {
  const qa = qaForPageTemplate(page.nodes);
  const pptx = qa?.exportReadiness?.pptx;
  if (!pptx) return pagePremiumExportReviewItem(page);
  if (!pptx.premiumAssetFallbackCount && !pptx.plotFallbackCount) return null;
  const fallbackAssets = Array.isArray(pptx.fallbackAssets) ? pptx.fallbackAssets : [];
  const shownAssets = fallbackAssets.slice(0, 4).map((asset) => asset.name || asset.assetId).filter(Boolean);
  const details = shownAssets.length ? ` Assets: ${shownAssets.join(", ")}.` : "";
  const severity = pptx.premiumAssetFallbackCount ? "warning" : "info";
  return reviewItem(
    "export",
    severity,
    `Template ${qa.templateId} PPTX export uses ${pptx.premiumAssetFallbackCount ?? 0} premium SVG fallback asset(s) and ${pptx.plotFallbackCount ?? 0} plot placeholder(s). Review fallback fidelity before sending editable PPTX.${details}`,
    page.id,
    undefined,
    {
      title: "Review PPTX fallback fidelity",
      action: pptx.nextAction,
      templateId: qa.templateId,
      workflowPack: qa.workflowPack,
      exportFormat: "pptx",
      metrics: {
        premiumAssetFallbackCount: pptx.premiumAssetFallbackCount ?? 0,
        plotFallbackCount: pptx.plotFallbackCount ?? 0
      },
      fallbackAssets: fallbackAssets.slice(0, 8).map((asset) => ({
        assetId: asset.assetId,
        name: asset.name,
        qualityTier: asset.qualityTier,
        assetRecipe: asset.assetRecipe,
        exportBehavior: asset.exportBehavior,
        action: asset.action
      }))
    }
  );
}

function pagePremiumExportReviewItem(page) {
  const fallback = collectPremiumPptxFallbacks(page);
  if (!fallback.assets.length && !fallback.plotFallbackCount && !fallback.imageOrGroupFallbackCount) return null;
  const shownAssets = fallback.assets.slice(0, 4).map((asset) => asset.name || asset.assetId).filter(Boolean);
  const details = shownAssets.length ? ` Assets: ${shownAssets.join(", ")}.` : "";
  const complexCount = fallback.plotFallbackCount + fallback.imageOrGroupFallbackCount;
  const complexDetails = complexCount ? ` Complex plot/image/group fallback count: ${complexCount}.` : "";
  return reviewItem(
    "export",
    fallback.assets.length ? "warning" : "info",
    `PPTX export will simplify ${fallback.assets.length} premium layered asset(s) to editable placeholders.${complexDetails} Review fallback fidelity before sending editable PPTX.${details}`,
    page.id,
    undefined,
    {
      title: "Review PPTX fallback fidelity",
      action: "Before sending PPTX, inspect named fallback assets, accept the Office limitation, or export SVG/PDF for exact premium rendering.",
      exportFormat: "pptx",
      metrics: {
        premiumAssetFallbackCount: fallback.assets.length,
        plotFallbackCount: fallback.plotFallbackCount,
        imageOrGroupFallbackCount: fallback.imageOrGroupFallbackCount
      },
      fallbackAssets: fallback.assets.slice(0, 8)
    }
  );
}

function collectPremiumPptxFallbacks(page) {
  const seen = new Set();
  const assets = [];
  let plotFallbackCount = 0;
  let imageOrGroupFallbackCount = 0;
  for (const node of page.nodes) {
    if (node.kind === "plot") plotFallbackCount += 1;
    if (node.kind === "image" || node.kind === "group") imageOrGroupFallbackCount += 1;
    if (node.kind !== "symbol") continue;
    const assetId = node.payload?.assetId;
    if (!assetId || seen.has(assetId)) continue;
    const asset = findAsset(assetId);
    const premium = asset.qualityTier === "signature" || asset.qualityTier === "hero";
    const layered = Number(asset.renderSpec?.version ?? 0) >= 2 || Boolean(asset.renderSpec?.assetRecipe);
    if (!premium || !layered) continue;
    seen.add(assetId);
    assets.push({
      assetId,
      name: asset.name,
      qualityTier: asset.qualityTier,
      assetRecipe: asset.renderSpec?.assetRecipe,
      exportBehavior: "embed-svg-fallback",
      action: "Use SVG/PDF for exact rendering or accept PPTX placeholder simplification."
    });
  }
  return { assets, plotFallbackCount, imageOrGroupFallbackCount };
}

function reviewItemForNodeIssue(code, page, node) {
  const label = reviewNodeLabel(node);
  const context = reviewContextFromNode(node);
  if (code === "node.claim.needs-citation") {
    if (isEvidenceReviewNode(node)) {
      return reviewItem(
        "provenance",
        "warning",
        `${label} on ${page.name} is a data-derived evidence object that needs source verification before delivery.`,
        page.id,
        node.id,
        {
          title: `Verify evidence source: ${label}`,
          action: "Attach the table/source citation, verify encodings and labels, then resolve after human scientific review.",
          ...context
        }
      );
    }
    return reviewItem(
      "claim",
      "warning",
      `${label} on ${page.name} is marked as a scientific claim or data-derived visual that needs citation/user confirmation.`,
      page.id,
      node.id,
      {
        title: `Confirm or cite: ${label}`,
        action: "Attach a source/citation, rewrite as draft visual language, or resolve only after human scientific review.",
        ...context
      }
    );
  }
  if (code === "node.claim.unsupported") {
    return reviewItem(
      "claim",
      "error",
      `${label} on ${page.name} is explicitly marked unsupported and should not ship in a final scientific deck.`,
      page.id,
      node.id,
      {
        title: `Fix unsupported claim: ${label}`,
        action: "Delete the claim, rewrite it as a caveat, or attach supporting evidence before changing the claim status.",
        ...context
      }
    );
  }
  if (code === "node.provenance.missing") {
    return reviewItem(
      "provenance",
      "warning",
      `${label} on ${page.name} is missing source and/or license metadata.`,
      page.id,
      node.id,
      {
        title: `Complete provenance: ${label}`,
        action: "Add source and license metadata, attach a citation, or mark the object private/unverified before export.",
        ...context
      }
    );
  }
  return reviewItem(
    "layout",
    "warning",
    `${label} on ${page.name} has a layout or bounds issue that may break export/readability.`,
    page.id,
    node.id,
    {
      title: `Fix layout: ${label}`,
      action: "Move, resize, or remove the object so it stays inside the slide and remains readable.",
      ...context
    }
  );
}

function reviewContextFromNode(node) {
  const templateId = node.payload?.templateId || templateIdFromLayoutHint(node.payload?.layoutHint);
  const metrics = {};
  if (node.payload?.semanticRole) metrics.semanticRole = node.payload.semanticRole;
  if (node.payload?.layoutHint) metrics.layoutHint = node.payload.layoutHint;
  if (node.claimStatus) metrics.claimStatus = node.claimStatus;
  if (node.provenance?.kind) metrics.provenanceKind = node.provenance.kind;
  if (node.provenance?.license) metrics.license = node.provenance.license;
  return {
    templateId: templateId || undefined,
    workflowPack: node.payload?.workflowPack,
    metrics: Object.keys(metrics).length ? metrics : undefined
  };
}

function reviewNodeLabel(node) {
  return String(node.payload?.label ?? node.payload?.text ?? node.payload?.spec?.title ?? node.name ?? node.id).slice(0, 72);
}

function isStructuralReviewTextNode(node) {
  if (node.kind !== "text") return false;
  const text = String(node.payload?.text ?? "").trim();
  const hasWorkflowContext = typeof node.payload?.templateId === "string"
    || typeof node.payload?.workflowPack === "string"
    || (typeof node.payload?.layoutHint === "string" && node.payload.layoutHint.includes(":"));
  if (!hasWorkflowContext) return false;
  if (!text) return true;
  if (/^(?:[A-Z]|\d{1,2}|[A-Z]\d?)$/.test(text)) return true;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasSentencePunctuation = /[.:;?]/.test(text);
  return !hasSentencePunctuation && text.length <= 48 && wordCount <= 5;
}

function isEvidenceReviewNode(node) {
  return node.kind === "plot";
}

function reviewItem(kind, severity, message, pageId, nodeId, details = {}) {
  return { id: id("review"), kind, severity, status: "open", message, pageId, nodeId, createdAt: new Date().toISOString(), ...details };
}

function addSlide() {
  checkpoint();
  const page = createPage(`Slide ${project.pages.length + 1}`);
  project.pages.push(page);
  project.deck.slideMeta[page.id] = {
    pageId: page.id,
    title: page.name,
    section: "Deck",
    speakerNotes: "",
    narrativeIntent: "Manual slide.",
    layoutIntent: "summary",
    sourceIds: []
  };
  activePageId = page.id;
  selectedId = null;
  renderAll();
}

function addAssetNode(assetId) {
  const asset = curatedAssets.find((candidate) => candidate.id === assetId);
  if (!asset) return;
  checkpoint();
  const placement = findOpenPlacement(currentPage(), asset.kind === "image" ? 300 : 168, asset.kind === "image" ? 194 : 124);
  const node = asset.kind === "image" && asset.sourceAssetType
    ? createRealisticImageNode(asset, placement.x, placement.y, placement.width, placement.height)
    : createSymbolNode(asset.id, asset.name, placement.x, placement.y, placement.width, placement.height, asset.provenance);
  currentPage().nodes.push(node);
  selectedId = node.id;
  renderAll();
}

function findOpenPlacement(page, width, height) {
  const candidates = [];
  for (const y of [156, 212, 286, 360, 448, 532]) {
    for (const x of [76, 418, 770, 938, 216, 590]) {
      candidates.push({ x, y, width, height });
    }
  }
  const margin = 24;
  const valid = candidates.filter((candidate) => candidate.x + candidate.width <= page.width - margin && candidate.y + candidate.height <= page.height - margin);
  const scored = valid.map((candidate) => {
    const overlap = page.nodes.reduce((sum, node) => sum + overlapArea(candidate, node.transform), 0);
    const centerBias = Math.abs(candidate.x + candidate.width / 2 - page.width / 2) * 0.06 + Math.abs(candidate.y + candidate.height / 2 - page.height / 2) * 0.03;
    return { candidate, score: overlap + centerBias };
  }).sort((a, b) => a.score - b.score);
  if (scored[0]) return scored[0].candidate;
  const offset = page.nodes.length % 7;
  return { x: 96 + offset * 28, y: 180 + offset * 22, width, height };
}

function addText() {
  checkpoint();
  const node = createTextNode("Scientific label", 480, 90, 320, 60, { fontSize: 28, fontWeight: 700 });
  currentPage().nodes.push(node);
  selectedId = node.id;
  renderAll();
}

function addConnector() {
  checkpoint();
  const node = createConnectorNode(290, 260, 470, 260);
  currentPage().nodes.push(node);
  selectedId = node.id;
  renderAll();
}

function addVolcano() {
  checkpoint();
  const table = parseDelimited(sampleVolcano, "\t", "Sample volcano data");
  const spec = { id: id("plot"), plotType: "volcano", title: "Perturb-seq volcano plot", table, encodings: { x: "log2fc", y: "padj", color: "group", label: "gene" } };
  const node = {
    id: id("node"),
    kind: "plot",
    name: spec.title,
    transform: transform(710, 330, 460, 300, currentPage().nodes.length + 1),
    style: { fill: "#ffffff", stroke: "#cbd5e1", strokeWidth: 1, depth: "raised" },
    payload: { spec },
    provenance: table.source,
    claimStatus: "needs-citation"
  };
  currentPage().nodes.push(node);
  selectedId = node.id;
  renderAll();
}

function applyWorkflowFigureSlideMetaToCurrentPage(input) {
  const page = currentPage();
  const template = input.template;
  const pack = workflowPacks.find((candidate) => candidate.id === input.packId);
  const meta = project.deck.slideMeta[page.id] ?? {
    pageId: page.id,
    title: page.name,
    section: "Deck",
    speakerNotes: "",
    narrativeIntent: "Manual slide.",
    layoutIntent: "summary",
    sourceIds: []
  };
  const title = template?.name ?? pack?.name ?? page.name;
  page.name = title;
  project.deck.slideMeta[page.id] = {
    ...meta,
    title,
    section: pack?.name ?? meta.section,
    speakerNotes: input.replaceExistingNotes || !meta.speakerNotes?.trim()
      ? workflowFigureSpeakerNotes({ template, pack, mode: input.mode ?? "workflow-figure" })
      : meta.speakerNotes,
    narrativeIntent: template?.description ?? `Editable ${pack?.name ?? "scientific"} workflow figure for source-grounded presentation use.`,
    layoutIntent: template ? slideLayoutIntentForTemplate(template) : "workflow"
  };
}

function workflowFigureSpeakerNotes(input) {
  const title = input.template?.name ?? input.pack?.name ?? "Scientific workflow figure";
  const description = input.template?.description ?? `Editable workflow pack figure for ${input.pack?.name ?? "scientific communication"}.`;
  const qa = input.template?.qaChecklist?.length ? input.template.qaChecklist.slice(0, 3) : [
    "Confirm scientific claims and labels against sources.",
    "Review provenance and citation status before final export.",
    "Use SVG/PDF for exact visual fidelity when PPTX fallbacks are accepted."
  ];
  const hints = input.template?.agentUseHints?.length ? input.template.agentUseHints.slice(0, 2) : [];
  const lines = [
    `${title}: ${description}`,
    "",
    input.mode === "flagship-demo"
      ? "Speaker cue: present this as the workflow pack's flagship editable demo, then resolve review queue items before export."
      : "Speaker cue: walk through the editable workflow from inputs to evidence, decision points, and export-ready outputs.",
    "",
    `QA focus: ${qa.join(" ")}`
  ];
  if (hints.length) {
    lines.push("", `Agent use: ${hints.join(" ")}`);
  }
  lines.push(
    "",
    "Export note: keep scene JSON/SVG as the canonical source; accept PPTX fallback warnings only after human review."
  );
  return lines.join("\n");
}

function slideLayoutIntentForTemplate(templateOrLayout) {
  const layout = typeof templateOrLayout === "string" ? templateOrLayout : templateOrLayout?.layout;
  if (templateOrLayout?.recommendedStyleProfile === "publication-line") return "journal-figure";
  if (layout === "results" || layout === "multi-panel") return "results";
  if (layout === "workflow" || layout === "pipeline" || layout === "architecture") return "workflow";
  return "summary";
}

function addWorkflowFigure(options = {}) {
  const template = currentWorkflowTemplate();
  const pack = template?.workflowPack || workflowTemplate?.value || assetWorkflowPack?.value || "publication-results-panels";
  checkpoint();
  const page = currentPage();
  const previousNodes = [...page.nodes];
  const styleProfile = currentAssetStyleProfile();
  const nodes = template?.id === "manuscript-results-figure" || (!template && pack === "publication-results-panels")
    ? createPublicationResultsPanelNodes(styleProfile)
    : template
      ? createTemplateFigureNodes(template)
    : createGenericWorkflowFigureNodes(pack);
  const replaceCurrentPage = Boolean(options.replaceCurrentPage || (isStarterOpeningPage(page) && !options.appendToCurrentPage));
  const baseZ = replaceCurrentPage ? 0 : page.nodes.reduce((max, node) => Math.max(max, node.transform.z), -1) + 1;
  if (replaceCurrentPage && template?.recommendedStyleProfile === "publication-line") {
    page.background = "#ffffff";
  }
  const preparedNodes = nodes.map((node, index) => ({
    ...node,
    transform: { ...node.transform, z: baseZ + index },
    payload: {
      ...(node.payload ?? {}),
      templateId: template?.id,
      workflowPack: pack
    }
  }));
  if (replaceCurrentPage) {
    page.nodes = preparedNodes;
  } else {
    page.nodes.push(...preparedNodes);
  }
  applyWorkflowFigureSlideMetaToCurrentPage({
    template,
    packId: pack,
    mode: options.mode ?? "workflow-figure",
    replaceExistingNotes: Boolean(options.replaceExistingNotes || replaceCurrentPage)
  });
  project.deck.reviewItems = generateReviewItems(project);
  selectedId = selectInitialWorkflowFigureNode(preparedNodes, template);
  const operations = [
    ...(replaceCurrentPage ? previousNodes.map((node) => ({ op: "delete-node", pageId: page.id, nodeId: node.id, payload: { reason: options.mode === "flagship-demo" ? "replace-current-page-with-flagship-demo" : "replace-starter-slide-with-workflow-figure" } })) : []),
    ...preparedNodes.map((node) => ({ op: "add-node", pageId: page.id, nodeId: node.id, payload: { node, templateId: template?.id, workflowPack: pack } }))
  ];
  addAgentRun(options.mode === "flagship-demo" ? "Create flagship demo" : (replaceCurrentPage ? "Create workflow figure slide" : "Insert workflow figure"), `${replaceCurrentPage ? "Replaced current slide with" : "Inserted"} ${template?.id ?? pack}`, operations);
  renderAll();
}

function isStarterOpeningPage(page) {
  if (!page || page.name !== "Opening slide") return false;
  return page.nodes.some((node) => node.kind === "text" && /Scientific deck workspace/.test(node.payload?.text ?? ""));
}

function selectInitialWorkflowFigureNode(nodes, template) {
  if (template?.layout === "hybrid-template" || nodes.some((node) => node.kind === "image")) {
    return nodes.find((node) => node.kind === "image")?.id ?? nodes[0]?.id ?? null;
  }
  return nodes.find((node) => node.kind === "plot" || node.kind === "symbol")?.id ?? nodes[0]?.id ?? null;
}

function addFlagshipWorkflowDemo() {
  const packId = assetWorkflowPack?.value || workflowTemplate?.value || workflowPacks[0]?.id || "perturb-seq-crispr";
  const gallery = cachedWorkflowPackGallery(packId);
  selectedWorkflowTemplateId = gallery?.flagshipDemo?.templateId ?? workflowPacks.find((pack) => pack.id === packId)?.flagshipTemplateId ?? defaultTemplateForPack(packId)?.id ?? selectedWorkflowTemplateId;
  if (assetWorkflowPack) assetWorkflowPack.value = packId;
  if (workflowTemplate) workflowTemplate.value = packId;
  addWorkflowFigure({ mode: "flagship-demo", replaceExistingNotes: true, replaceCurrentPage: true });
}

function createTemplateFigureNodes(template) {
  if (template.id === "perturb-seq-workflow") return createPerturbSeqFlagshipNodes(template);
  if (template.id === "perturb-seq-workflow-journal") return createPerturbSeqJournalWebNodes(template);
  if (template.id === "spatial-results-panel") return createSpatialResultsFlagshipNodes(template);
  if (template.id === "spatial-results-panel-journal") return createSpatialJournalWebNodes(template);
  if (template.id === "spatial-realistic-hybrid-panel") return createSpatialRealisticHybridNodes(template);
  if (template.id === "wetlab-realistic-context-panel") return createWetlabRealisticContextNodes(template);
  if (template.id === "cellular-realistic-evidence-panel") return createCellularRealisticEvidenceNodes(template);
  if (template.id === "space-realistic-context-panel") return createSpaceRealisticContextNodes(template);
  if (template.id === "drug-discovery-funnel") return createDrugDiscoveryFlagshipNodes(template);
  if (template.id === "ai-biosecurity-pipeline") return createAiBiosecurityFlagshipNodes(template);
  if (template.id === "ai-biosecurity-pipeline-journal") return createAiBiosecurityJournalWebNodes(template);
  if (template.id === "permissioning-ladder") return createPermissioningLadderNodes(template);
  if (template.id === "benchmark-dashboard") return createBenchmarkDashboardNodes(template);
  if (template.id === "review-audit-flow") return createReviewAuditFlowNodes(template);
  if (["multi-panel", "results"].includes(template.layout)) return createTemplatePanelFigureNodes(template);
  return createTemplateWorkflowStripNodes(template);
}

function createTemplateRealisticImage(assetId, label, x, y, width, height, layoutHint, appearance = {}, crop = {}, mask = { shape: "round-rect" }) {
  const asset = findAsset(assetId);
  const node = createRealisticImageNode(asset, x, y, width, height);
  node.name = label;
  node.payload.alt = label;
  node.payload.layoutHint = layoutHint;
  node.payload.styleProfile = "scientific-editorial-realism";
  node.payload.appearance = {
    colorWash: asset?.renderSpec?.accent ?? "#2563eb",
    colorWashOpacity: 0.1,
    contrast: 1.08,
    opacity: 1,
    ...appearance
  };
  node.payload.crop = normalizedImageCrop(crop);
  node.payload.mask = mask;
  node.claimStatus = "user-confirmed";
  return node;
}

function flagshipStyleTheme(styleProfile = currentAssetStyleProfile(), accent = "blue") {
  const isLine = styleProfile === "publication-line";
  const isDark = styleProfile === "dark-talk";
  const accentMap = {
    blue: { accent: "#2563eb", accent2: "#16a34a", outer: "#bfdbfe" },
    purple: { accent: "#7c3aed", accent2: "#0891b2", outer: "#e9d5ff" },
    risk: { accent: "#dc2626", accent2: "#f97316", outer: "#fecaca" }
  }[accent] ?? { accent: "#2563eb", accent2: "#16a34a", outer: "#bfdbfe" };
  const accentColor = isLine ? "#111827" : isDark ? "#38bdf8" : accentMap.accent;
  const accent2Color = isLine ? "#374151" : isDark ? "#34d399" : accentMap.accent2;
  const symbolAppearance = isLine
    ? { accent: "#111827", stroke: "#111827", secondary: "#f3f4f6", fill: "#ffffff", labelColor: "#111827", strokeWidth: 1.6 }
    : isDark
      ? { accent: accentColor, stroke: "#7dd3fc", secondary: "#1e293b", fill: "#0f172a", labelColor: "#e2e8f0", strokeWidth: 2.2 }
      : {};
  return {
    isLine,
    isDark,
    outerFill: isDark ? "#020617" : "#ffffff",
    outerStroke: isLine ? "#111827" : isDark ? "#334155" : accentMap.outer,
    outerDepth: isLine ? "surface" : "hero",
    panelFill: isDark ? "#0f172a" : "#f8fafc",
    panelAltFill: isDark ? "#111827" : isLine ? "#ffffff" : accent === "risk" ? "#fff7ed" : "#f0f9ff",
    panelStroke: isLine ? "#111827" : isDark ? "#334155" : "#cbd5e1",
    panelDepth: isLine ? "surface" : "raised",
    floatingDepth: isLine ? "surface" : "floating",
    chipFill: isDark ? "#111827" : isLine ? "#ffffff" : "#eff6ff",
    chipAltFill: isDark ? "#0f172a" : isLine ? "#ffffff" : "#f0fdf4",
    chipStroke: isLine ? "#111827" : isDark ? "#334155" : "#bfdbfe",
    heading: isDark ? "#f8fafc" : "#0f172a",
    text: isDark ? "#e2e8f0" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    accent: accentColor,
    accent2: accent2Color,
    connector: isLine ? "#111827" : isDark ? "#94a3b8" : "#334155",
    warningFill: isDark ? "#431407" : isLine ? "#ffffff" : "#fff7ed",
    warningStroke: isDark ? "#f97316" : isLine ? "#111827" : "#fed7aa",
    warningText: isLine ? "#111827" : isDark ? "#fdba74" : "#9a3412",
    reviewText: isDark ? "#fdba74" : isLine ? "#374151" : "#9a3412",
    plotStyle: {
      fill: isDark ? "#111827" : "#ffffff",
      stroke: isLine ? "#111827" : isDark ? "#475569" : "#cbd5e1",
      color: isDark ? "#e2e8f0" : "#0f172a",
      depth: isLine ? "surface" : "raised"
    },
    symbolAppearance,
    riskSymbolProfile: isLine ? "publication-line" : isDark ? "dark-talk" : "risk-warning",
    riskSymbolAppearance: isLine
      ? symbolAppearance
      : isDark
        ? { accent: "#fb923c", stroke: "#fdba74", secondary: "#431407", fill: "#1e293b", labelColor: "#fde68a", strokeWidth: 2.2 }
        : {}
  };
}

function createTemplateSymbol(assetId, label, x, y, width, height, layoutHint, styleProfile = currentAssetStyleProfile(), appearance = {}) {
  const node = createSymbolNode(assetId, label, x, y, width, height);
  node.payload.layoutHint = layoutHint;
  node.payload.styleProfile = styleProfile;
  if (Object.keys(appearance).length) node.payload.appearance = { ...(node.payload.appearance ?? {}), ...appearance };
  if (appearance.stroke) node.style.stroke = appearance.stroke;
  if (appearance.strokeWidth) node.style.strokeWidth = appearance.strokeWidth;
  if (appearance.labelColor) node.style.color = appearance.labelColor;
  return node;
}

function createPerturbSeqFlagshipNodes(template) {
  const x = 72;
  const y = 104;
  const width = 1064;
  const styleProfile = currentAssetStyleProfile();
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const figureShape = (shape, label, sx, sy, sw, sh, fill, stroke, depth = "raised", strokeWidth = 1.25) => {
    const node = createShapeNode(shape, label, sx, sy, sw, sh, fill, stroke, depth);
    node.style.strokeWidth = strokeWidth;
    return node;
  };
  const nodes = [
    figureShape("round-rect", "", x - 18, y - 44, width + 36, 530, theme.outerFill, theme.outerStroke, theme.outerDepth, 2),
    createTextNode("Perturb-seq CRISPR source-to-hit figure", x, y - 32, 600, 30, { fontSize: 23, fontWeight: 900, color: theme.heading, align: "start" }),
    createTextNode("Workflow hierarchy: perturbation identity, single-cell readout, hit evidence, and review-ready export.", x + 572, y - 34, width - 572, 44, { fontSize: 11.5, fontWeight: 650, color: theme.muted, align: "end" }),
    figureShape("round-rect", "", x + 4, y + 12, 226, 28, theme.chipFill, theme.chipStroke, "surface", 1),
    createTextNode("Source to scene JSON", x + 18, y + 17, 198, 18, { fontSize: 10.5, fontWeight: 850, color: theme.accent }),
    figureShape("round-rect", "", x + 246, y + 12, 208, 28, theme.chipAltFill, theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0", "surface", 1),
    createTextNode("Review-aware PPTX/PDF export", x + 260, y + 17, 178, 18, { fontSize: 10.5, fontWeight: 850, color: theme.accent2 })
  ];
  const panelGap = 18;
  const topY = y + 64;
  const topH = 184;
  const designW = 320;
  const assayW = 326;
  const readoutW = width - designW - assayW - panelGap * 2;
  const panels = [
    ["A", "Design perturbation library", x, topY, designW, topH, theme.panelFill, theme.accent],
    ["B", "Deliver and capture cells", x + designW + panelGap, topY, assayW, topH, theme.panelAltFill, theme.accent2],
    ["C", "Read out guide-linked expression", x + designW + assayW + panelGap * 2, topY, readoutW, topH, theme.panelFill, theme.accent]
  ];
  panels.forEach(([tag, title, px, py, pw, ph, fill, accent]) => {
    nodes.push(figureShape("round-rect", "", px, py, pw, ph, fill, theme.panelStroke, theme.panelDepth, 1.25));
    nodes.push(createTextNode(tag, px + 14, py + 12, 24, 24, { fontSize: 17, fontWeight: 950, color: accent }));
    nodes.push(createTextNode(title, px + 46, py + 14, pw - 64, 22, { fontSize: 13, fontWeight: 880, color: theme.text, align: "start" }));
  });
  nodes.push(
    createTemplateSymbol("cell-t", "Target cells", x + 28, topY + 58, 118, 92, `${template.id}:step-1-target-cells`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("guide-rna", "Guide library", x + 168, topY + 56, 126, 96, `${template.id}:step-2-guide-library`, styleProfile, theme.symbolAppearance),
    createConnectorNode(x + 145, topY + 104, x + 168, topY + 104, { stroke: theme.accent, strokeWidth: 2.2 }),
    createTextNode("Target cells plus guide design.", x + 24, topY + 154, designW - 48, 20, { fontSize: 10.5, fontWeight: 720, color: theme.muted }),
    createTemplateSymbol("lentiviral-library", "Pooled delivery", x + designW + panelGap + 30, topY + 56, 124, 96, `${template.id}:step-3-pooled-delivery`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("scrna-droplet", "Cell + guide", x + designW + panelGap + 174, topY + 54, 124, 98, `${template.id}:step-4-single-cell-capture`, styleProfile, theme.symbolAppearance),
    createConnectorNode(x + designW + panelGap + 154, topY + 104, x + designW + panelGap + 176, topY + 104, { stroke: theme.accent2, strokeWidth: 2.2 }),
    createTextNode("Guide barcode plus transcriptome.", x + designW + panelGap + 24, topY + 154, assayW - 48, 20, { fontSize: 10.5, fontWeight: 720, color: theme.muted }),
    createTemplateSymbol("sequencer", "Sequencing", x + designW + assayW + panelGap * 2 + 26, topY + 54, 126, 98, `${template.id}:step-5-sequencing`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("expression-matrix", "Matrix", x + designW + assayW + panelGap * 2 + 174, topY + 54, 132, 100, `${template.id}:step-6-expression-matrix`, styleProfile, theme.symbolAppearance),
    createConnectorNode(x + designW + assayW + panelGap * 2 + 152, topY + 104, x + designW + assayW + panelGap * 2 + 174, topY + 104, { stroke: theme.accent, strokeWidth: 2.2 }),
    figureShape("round-rect", "", x + designW + assayW + panelGap * 2 + 308, topY + 76, 56, 54, theme.chipFill, theme.chipStroke, "surface", 1),
    createTextNode("QC", x + designW + assayW + panelGap * 2 + 323, topY + 86, 28, 16, { fontSize: 10, fontWeight: 900, color: theme.accent }),
    createTextNode("calls", x + designW + assayW + panelGap * 2 + 318, topY + 106, 38, 16, { fontSize: 8.5, fontWeight: 750, color: theme.muted }),
    createConnectorNode(x + designW - 2, topY + 92, x + designW + panelGap + 2, topY + 92, { stroke: theme.connector, strokeWidth: 2.4 }),
    createConnectorNode(x + designW + panelGap + assayW - 2, topY + 92, x + designW + assayW + panelGap * 2 + 2, topY + 92, { stroke: theme.connector, strokeWidth: 2.4 }),
    figureShape("round-rect", "", x, y + 280, 372, 176, theme.panelFill, theme.panelStroke, theme.panelDepth, 1.3),
    createTextNode("D", x + 14, y + 294, 24, 24, { fontSize: 17, fontWeight: 950, color: theme.accent }),
    createTextNode("Mechanism to effect-size readout", x + 46, y + 296, 286, 22, { fontSize: 13, fontWeight: 880, color: theme.text, align: "start" }),
    createTextNode("Mechanism and effect-size objects remain editable for figure refinement.", x + 24, y + 324, 324, 34, { fontSize: 10.5, fontWeight: 720, color: theme.muted, align: "start" }),
    createTemplateSymbol("crispr-cas9", "Cas9", x + 18, y + 338, 128, 96, `${template.id}:interpretation-cas9`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("metric-card", "Effect size", x + 186, y + 338, 128, 96, `${template.id}:interpretation-metric`, styleProfile, theme.symbolAppearance),
    createConnectorNode(x + 146, y + 386, x + 186, y + 386, { stroke: theme.accent, strokeWidth: 2.2 }),
    figureShape("round-rect", "", x + 392, y + 280, width - 392, 176, theme.isDark ? "#111827" : "#ffffff", theme.panelStroke, theme.panelDepth, 1.3),
    createTextNode("E", x + 408, y + 294, 24, 24, { fontSize: 17, fontWeight: 950, color: theme.accent2 }),
    createTextNode("Evidence panel and review queue", x + 440, y + 296, 286, 22, { fontSize: 13, fontWeight: 880, color: theme.text, align: "start" }),
    createPlotNode("volcano", "Hit genes", demoVolcanoTable(), { x: "log2FC", y: "pValue", color: "cellState", label: "gene" }, x + 414, y + 320, 430, 128, theme.plotStyle),
    figureShape("round-rect", "", x + 856, y + 322, 190, 112, theme.warningFill, theme.warningStroke, "surface", 1.2),
    createTextNode("Review before export", x + 872, y + 338, 156, 20, { fontSize: 12, fontWeight: 900, color: theme.warningText }),
    createTextNode("Confirm library source, guide mapping, hit threshold, and plot provenance before export.", x + 872, y + 362, 156, 54, { fontSize: 10.5, fontWeight: 720, color: theme.reviewText }),
    figureShape("round-rect", "", x + 856, y + 440, 82, 20, theme.chipFill, theme.chipStroke, "surface", 1),
    createTextNode("SVG exact", x + 870, y + 444, 54, 14, { fontSize: 8.8, fontWeight: 850, color: theme.accent }),
    figureShape("round-rect", "", x + 946, y + 440, 100, 20, theme.warningFill, theme.warningStroke, "surface", 1),
    createTextNode("PPTX fallback", x + 958, y + 444, 76, 14, { fontSize: 8.8, fontWeight: 850, color: theme.warningText })
  );
  return nodes;
}

function createDrugDiscoveryFlagshipNodes(template) {
  const x = 72;
  const y = 104;
  const width = 1064;
  const styleProfile = currentAssetStyleProfile();
  const theme = flagshipStyleTheme(styleProfile, "blue");
  const source = manualProvenance("Synthetic drug-discovery flagship demo data");
  const figureText = (text, sx, sy, sw, sh, style = {}) => {
    const node = createTextNode(text, sx, sy, sw, sh, style);
    node.claimStatus = "draft-visual";
    return node;
  };
  const figureShape = (shape, label, sx, sy, sw, sh, fill, stroke, depth = "raised", strokeWidth = 1.25) => {
    const node = createShapeNode(shape, label, sx, sy, sw, sh, fill, stroke, depth);
    node.style.strokeWidth = strokeWidth;
    node.claimStatus = "draft-visual";
    return node;
  };
  const symbol = (assetId, label, sx, sy, sw, sh, layoutHint, appearance = {}, profile = styleProfile) => createTemplateSymbol(
    assetId,
    label,
    sx,
    sy,
    sw,
    sh,
    layoutHint,
    profile,
    { ...theme.symbolAppearance, ...appearance }
  );
  const nodes = [
    figureShape("round-rect", "", x - 18, y - 44, width + 36, 530, theme.outerFill, theme.outerStroke, theme.outerDepth, 2),
    figureText("Drug discovery target-to-candidate funnel", x, y - 32, 600, 30, { fontSize: 23, fontWeight: 900, color: theme.heading, align: "start" }),
    figureText("Editable assets connect target biology, screen evidence, safety review, and nomination readiness.", x + 572, y - 34, width - 572, 44, { fontSize: 11.5, fontWeight: 650, color: theme.muted, align: "end" }),
    figureShape("round-rect", "", x + 4, y + 12, 190, 28, theme.chipFill, theme.chipStroke, "surface", 1),
    figureText("pack: drug-discovery", x + 18, y + 17, 160, 18, { fontSize: 10.5, fontWeight: 850, color: theme.accent }),
    figureShape("round-rect", "", x + 208, y + 12, 228, 28, theme.chipAltFill, theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#bbf7d0", "surface", 1),
    figureText("insert-ready MCP recipe", x + 224, y + 17, 196, 18, { fontSize: 10.5, fontWeight: 850, color: theme.accent2 })
  ];

  const stageY = y + 64;
  const stageH = 168;
  const stageW = Math.round((width - 64) / 5);
  const stages = [
    { assetId: "target-validation", label: "Target", kind: "evidence", note: "biology evidence", accent: theme.accent },
    { assetId: "compound-library", label: "Screen", kind: "assay", note: "library assay", accent: theme.accent },
    { assetId: "hit-triage", label: "Triage", kind: "rank", note: "rank hits", accent: theme.accent2 },
    { assetId: "medicinal-chemistry-cycle", label: "Optimize", kind: "D-M-T-L", note: "D-M-T-L loop", accent: theme.accent2 },
    { assetId: "candidate-nomination", label: "Nominate", kind: "gate", note: "go/no-go package", accent: theme.isLine ? "#111827" : theme.isDark ? "#fdba74" : "#d97706" }
  ];
  stages.forEach((stage, index) => {
    const sx = x + index * (stageW + 16);
    const warningStage = index === stages.length - 1;
    nodes.push(figureShape(
      "round-rect",
      "",
      sx,
      stageY,
      stageW,
      stageH,
      warningStage ? theme.warningFill : index % 2 ? theme.panelAltFill : theme.panelFill,
      warningStage ? theme.warningStroke : theme.panelStroke,
      warningStage ? theme.floatingDepth : theme.panelDepth,
      1.25
    ));
    nodes.push(figureShape("round-rect", "", sx + 12, stageY + 12, 36, 20, theme.isDark ? "#0f172a" : "#ffffff", warningStage ? theme.warningStroke : theme.panelStroke, "surface", 1));
    nodes.push(figureText(`0${index + 1}`, sx + 21, stageY + 16, 18, 12, { fontSize: 8.8, fontWeight: 950, color: warningStage ? theme.warningText : stage.accent }));
    nodes.push(figureShape("round-rect", "", sx + stageW - 78, stageY + 12, 64, 20, warningStage ? theme.warningFill : theme.chipFill, warningStage ? theme.warningStroke : theme.chipStroke, "surface", 1));
    nodes.push(figureText(stage.kind, sx + stageW - 66, stageY + 16, 44, 12, { fontSize: 8.1, fontWeight: 850, color: warningStage ? theme.warningText : stage.accent }));
    nodes.push(symbol(stage.assetId, stage.label, sx + Math.round((stageW - 112) / 2), stageY + 34, 112, 88, `${template.id}:stage-${index + 1}`, { accent: stage.accent, stroke: stage.accent, labelVisible: false }));
    nodes.push(figureText(stage.label, sx + 14, stageY + 124, stageW - 28, 18, { fontSize: 12.2, fontWeight: 900, color: warningStage ? theme.warningText : theme.text }));
    nodes.push(figureText(stage.note, sx + 14, stageY + 144, stageW - 28, 16, { fontSize: 9.4, fontWeight: 720, color: theme.muted }));
    if (index > 0) nodes.push(createConnectorNode(sx - 16, stageY + 84, sx - 2, stageY + 84, { stroke: theme.connector, strokeWidth: 2.3 }));
  });
  nodes.push(figureShape("round-rect", "", x + 4, stageY + stageH + 14, width - 8, 28, theme.isDark ? "#0f172a" : "#f8fafc", theme.panelStroke, "surface", 1));
  nodes.push(figureText("Decision spine: validate biology -> screen compounds -> rank hits -> optimize leads -> nominate package", x + 24, stageY + stageH + 20, width - 48, 16, { fontSize: 9.6, fontWeight: 820, color: theme.muted, align: "start" }));

  const lowerY = y + 284;
  const gap = 22;
  const leftW = 354;
  const midW = 314;
  const rightW = width - leftW - midW - gap * 2;
  const doseTable = {
    id: id("table"),
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
    id: id("table"),
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
  const addPanel = (tag, title, status, px, py, pw, ph, fill = theme.panelFill, stroke = theme.panelStroke, tone = theme.text) => {
    nodes.push(figureShape("round-rect", "", px, py, pw, ph, fill, stroke, theme.panelDepth, 1.25));
    nodes.push(figureShape("round-rect", "", px + 14, py + 14, 28, 22, theme.isDark ? "#0f172a" : "#ffffff", stroke, "surface", 1));
    nodes.push(figureText(tag, px + 14, py + 17, 28, 16, { fontSize: 12, fontWeight: 920, color: tone }));
    nodes.push(figureText(title, px + 52, py + 16, pw - 136, 20, { fontSize: 11.6, fontWeight: 850, color: tone, align: "start" }));
    nodes.push(figureShape("round-rect", "", px + pw - 90, py + 14, 76, 22, status === "QA gate" ? theme.warningFill : theme.chipFill, status === "QA gate" ? theme.warningStroke : theme.chipStroke, "surface", 1));
    nodes.push(figureText(status, px + pw - 80, py + 19, 58, 12, { fontSize: 7.9, fontWeight: 850, color: status === "QA gate" ? theme.warningText : tone }));
  };
  addPanel("A", "Hit evidence package", "source-linked", x, lowerY, leftW, 196, theme.panelFill, theme.panelStroke, theme.accent);
  addPanel("B", "Lead optimization profile", "editable SAR", x + leftW + gap, lowerY, midW, 196, theme.panelAltFill, theme.panelStroke, theme.accent2);
  addPanel("C", "Safety and nomination gate", "QA gate", x + leftW + midW + gap * 2, lowerY, rightW, 196, theme.warningFill, theme.warningStroke, theme.warningText);
  nodes.push(
    symbol("target-engagement", "Engagement", x + 24, lowerY + 54, 112, 88, `${template.id}:target-engagement`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    symbol("dose-response-curve", "Dose response", x + 144, lowerY + 54, 112, 88, `${template.id}:dose-response`, { accent: theme.accent, stroke: theme.accent, labelVisible: false }),
    createPlotNode("line", "Dose response", doseTable, { x: "dose", y: "response", color: "series" }, x + 238, lowerY + 58, 100, 82, theme.plotStyle),
    figureText("Engagement", x + 44, lowerY + 136, 72, 14, { fontSize: 9.4, fontWeight: 850, color: theme.text }),
    figureText("Dose curve", x + 162, lowerY + 136, 76, 14, { fontSize: 9.4, fontWeight: 850, color: theme.text }),
    figureText("Potency claim remains tied to source table.", x + 24, lowerY + 152, leftW - 48, 24, { fontSize: 10, fontWeight: 720, color: theme.muted, align: "start" }),
    symbol("lead-series", "Lead series", x + leftW + gap + 22, lowerY + 54, 100, 88, `${template.id}:lead-series`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("sar-table", "SAR table", x + leftW + gap + 128, lowerY + 54, 100, 88, `${template.id}:sar-table`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    symbol("pk-profile", "PK profile", x + leftW + gap + 226, lowerY + 54, 72, 88, `${template.id}:pk-profile`, { accent: theme.accent2, stroke: theme.accent2, labelVisible: false }),
    figureText("Lead series", x + leftW + gap + 38, lowerY + 136, 74, 14, { fontSize: 9.4, fontWeight: 850, color: theme.text }),
    figureText("SAR table", x + leftW + gap + 146, lowerY + 136, 70, 14, { fontSize: 9.4, fontWeight: 850, color: theme.text }),
    figureText("PK profile", x + leftW + gap + 228, lowerY + 136, 70, 14, { fontSize: 9.4, fontWeight: 850, color: theme.text }),
    figureText("SAR, PK, and med-chem cycle stay editable as separate nodes.", x + leftW + gap + 24, lowerY + 152, midW - 48, 24, { fontSize: 10, fontWeight: 720, color: theme.muted, align: "start" }),
    createPlotNode("bar", "Selectivity", selectivityTable, { x: "target", y: "score", color: "risk" }, x + leftW + midW + gap * 2 + 22, lowerY + 54, 142, 96, theme.plotStyle),
    symbol("toxicity-screen", "Toxicity", x + leftW + midW + gap * 2 + 174, lowerY + 48, 76, 78, `${template.id}:toxicity`, { ...theme.riskSymbolAppearance, labelVisible: false }, theme.riskSymbolProfile),
    symbol("ind-enabling-package", "IND package", x + leftW + midW + gap * 2 + 254, lowerY + 48, 76, 78, `${template.id}:ind-package`, { accent: theme.warningText, stroke: theme.warningText, labelVisible: false }),
    figureText("Toxicity", x + leftW + midW + gap * 2 + 187, lowerY + 126, 52, 13, { fontSize: 9.2, fontWeight: 850, color: theme.warningText }),
    figureText("IND package", x + leftW + midW + gap * 2 + 251, lowerY + 126, 82, 13, { fontSize: 9.2, fontWeight: 850, color: theme.warningText }),
    figureShape("round-rect", "", x + leftW + midW + gap * 2 + 176, lowerY + 140, 156, 24, theme.isDark ? "#111827" : "#ffffff", theme.warningStroke, "surface", 1),
    figureText("review before export", x + leftW + midW + gap * 2 + 192, lowerY + 146, 124, 13, { fontSize: 9.2, fontWeight: 850, color: theme.warningText })
  );
  return nodes.map((node, index) => ({ ...node, transform: { ...node.transform, z: index } }));
}

function createSpatialResultsFlagshipNodes(template) {
  const x = 72;
  const y = 98;
  const width = 1064;
  const styleProfile = currentAssetStyleProfile();
  const theme = flagshipStyleTheme(styleProfile, "purple");
  const gap = 22;
  const topY = y + 42;
  const leftW = 334;
  const midW = 334;
  const rightW = width - leftW - midW - gap * 2;
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 42, width + 36, 520, theme.outerFill, theme.outerStroke, theme.outerDepth),
    createTextNode("Spatial transcriptomics results panel", x, y - 30, 560, 30, { fontSize: 23, fontWeight: 900, color: theme.heading, align: "start" }),
    createTextNode("Tissue -> spots -> segmentation -> neighborhoods -> review-ready export.", x + 544, y - 27, width - 544, 28, { fontSize: 11, fontWeight: 650, color: theme.muted, align: "end" })
  ];
  [
    ["A", "Tissue + spots", x, topY, leftW, 214],
    ["B", "Segmentation", x + leftW + gap, topY, midW, 214],
    ["C", "Neighborhood graph", x + leftW + midW + gap * 2, topY, rightW, 214],
    ["D", "Expression summary", x, topY + 238, Math.round(width * 0.62), 196],
    ["E", "Interpretation + QA", x + Math.round(width * 0.62) + gap, topY + 238, width - Math.round(width * 0.62) - gap, 196]
  ].forEach(([tag, title, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, theme.panelFill, theme.isLine ? "#111827" : theme.isDark ? "#334155" : "#d8b4fe", theme.panelDepth));
    nodes.push(createTextNode(tag, px + 14, py + 10, 24, 24, { fontSize: 18, fontWeight: 900, color: theme.accent }));
    nodes.push(createTextNode(title, px + 46, py + 11, pw - 62, 24, { fontSize: 13, fontWeight: 850, color: theme.text, align: "start" }));
  });
  nodes.push(
    createTemplateSymbol("histology-section", "H&E section", x + 28, topY + 56, 140, 112, `${template.id}:panel-A`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("visium-spot-array", "Spot array", x + 170, topY + 56, 140, 112, `${template.id}:panel-A`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("segmentation-mask", "Mask", x + leftW + gap + 42, topY + 56, 140, 112, `${template.id}:panel-B`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("cell-boundary", "Boundaries", x + leftW + gap + 176, topY + 56, 128, 104, `${template.id}:panel-B`, styleProfile, theme.symbolAppearance),
    createTemplateSymbol("neighborhood-graph", "Neighborhoods", x + leftW + midW + gap * 2 + 62, topY + 58, 152, 118, `${template.id}:panel-C`, styleProfile, theme.symbolAppearance),
    createPlotNode("heatmap", "Spatial expression", demoSpatialHeatmapTable(), { x: "region", y: "gene", value: "expression" }, x + 28, topY + 282, Math.round(width * 0.62) - 56, 144, theme.plotStyle),
    createTemplateSymbol("gene-locus", "Marker gene", x + Math.round(width * 0.62) + gap + 40, topY + 296, 132, 104, `${template.id}:panel-E`, styleProfile, theme.symbolAppearance),
    createTextNode("Claim: immune-edge interferon signal. Confirm annotation and image provenance.", x + Math.round(width * 0.62) + gap + 178, topY + 308, width - Math.round(width * 0.62) - gap - 204, 70, { fontSize: 13, fontWeight: 750, color: theme.reviewText, align: "start" })
  );
  return nodes;
}

function createSpatialRealisticHybridNodes(template) {
  const x = 52;
  const y = 56;
  const width = 1176;
  const topY = y + 66;
  const gap = 24;
  const leftW = 468;
  const midW = 330;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 294;
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 44, width + 36, 652, "#ffffff", "#bae6fd", "hero"),
    createTextNode("Spatial realistic hybrid figure", x, y - 30, 560, 32, { fontSize: 27, fontWeight: 920, align: "start" }),
    createTextNode("Editorial image evidence plus editable SVG annotations, plots, and export/provenance QA.", x + 566, y - 25, width - 566, 27, { fontSize: 13.2, fontWeight: 680, color: "#64748b", align: "end" })
  ];
  [
    ["A", "Histology evidence", x, topY, leftW, 270],
    ["B", "Segmentation overlay", x + leftW + gap, topY, midW, 270],
    ["C", "Spatial map", x + leftW + midW + gap * 2, topY, rightW, 270],
    ["D", "Expression evidence", x, lowerY, Math.round(width * 0.58), 216],
    ["E", "Review packet", x + Math.round(width * 0.58) + gap, lowerY, width - Math.round(width * 0.58) - gap, 216]
  ].forEach(([tag, title, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, "#f8fafc", "#cbd5e1", "raised"));
    nodes.push(createTextNode(tag, px + 14, py + 12, 24, 22, { fontSize: 17, fontWeight: 950, color: "#075985" }));
    nodes.push(createTextNode(title, px + 46, py + 13, pw - 60, 20, { fontSize: 12.8, fontWeight: 850, color: "#334155", align: "start" }));
  });
  nodes.push(
    createTemplateRealisticImage("realistic-he-tissue-section", "H&E tissue image", x + 24, topY + 50, 304, 188, `${template.id}:panel-A`, { colorWash: "#c084fc", colorWashOpacity: 0.1, contrast: 1.08 }, { x: -0.03, y: 0.02, zoom: 1.12 }, { shape: "tissue-contour" }),
    createTemplateRealisticImage("realistic-visium-slide", "Spot capture context", x + 338, topY + 64, 106, 154, `${template.id}:panel-A-context`, { colorWash: "#14b8a6", colorWashOpacity: 0.13 }, { zoom: 1.04 }, { shape: "round-rect" }),
    createConnectorNode(x + 328, topY + 144, x + 338, topY + 144),
    createTemplateRealisticImage("realistic-segmentation-overlay", "Cell segmentation", x + leftW + gap + 24, topY + 50, midW - 48, 188, `${template.id}:panel-B`, { colorWash: "#22c55e", colorWashOpacity: 0.1 }, { x: 0.03, zoom: 1.16 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-spatial-map", "Spatial expression", x + leftW + midW + gap * 2 + 24, topY + 50, rightW - 48, 188, `${template.id}:panel-C`, { colorWash: "#f97316", colorWashOpacity: 0.09 }, { y: -0.02, zoom: 1.08 }, { shape: "soft-vignette" }),
    createPlotNode("heatmap", "Marker expression by region", demoSpatialHeatmapTable(), { x: "region", y: "gene", value: "expression" }, x + 28, lowerY + 48, Math.round(width * 0.58) - 56, 148),
    createTemplateSymbol("neighborhood-graph", "Neighborhood graph", x + Math.round(width * 0.58) + gap + 28, lowerY + 56, 140, 118, `${template.id}:review-neighborhood`),
    createShapeNode("round-rect", "", x + Math.round(width * 0.58) + gap + 188, lowerY + 48, width - Math.round(width * 0.58) - gap - 222, 128, "#fffbeb", "#fcd34d", "floating"),
    createTextNode("Review before export", x + Math.round(width * 0.58) + gap + 210, lowerY + 66, 230, 20, { fontSize: 14, fontWeight: 920, color: "#92400e", align: "start" }),
    createTextNode("Confirm image rights, crop focus, segmentation source, and PPTX/DOCX fallback warnings. SVG/PDF preserve the hybrid figure.", x + Math.round(width * 0.58) + gap + 210, lowerY + 96, width - Math.round(width * 0.58) - gap - 278, 58, { fontSize: 12.2, fontWeight: 720, color: "#7c2d12", align: "start" })
  );
  return nodes;
}

function createWetlabRealisticContextNodes(template) {
  const x = 54;
  const y = 58;
  const width = 1172;
  const gap = 24;
  const topY = y + 68;
  const mainW = 468;
  const midW = 328;
  const rightW = width - mainW - midW - gap * 2;
  const lowerY = topY + 292;
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 44, width + 36, 646, "#ffffff", "#bfdbfe", "hero"),
    createTextNode("Wetlab realistic protocol context", x, y - 30, 610, 32, { fontSize: 27, fontWeight: 920, align: "start" }),
    createTextNode("Editorial protocol evidence plus editable assay summary, biosafety cue, and export/provenance QA.", x + 590, y - 25, width - 590, 27, { fontSize: 13.2, fontWeight: 680, color: "#64748b", align: "end" })
  ];
  [
    ["A", "Sample handling", x, topY, mainW, 268],
    ["B", "Assay setup", x + mainW + gap, topY, midW, 268],
    ["C", "Instrument context", x + mainW + midW + gap * 2, topY, rightW, 268],
    ["D", "Protocol QC", x, lowerY, Math.round(width * 0.58), 214],
    ["E", "Biosafety / export review", x + Math.round(width * 0.58) + gap, lowerY, width - Math.round(width * 0.58) - gap, 214]
  ].forEach(([tag, title, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, "#f8fafc", tag === "E" ? "#fed7aa" : "#cbd5e1", tag === "E" ? "floating" : "raised"));
    nodes.push(createTextNode(tag, px + 14, py + 12, 24, 22, { fontSize: 17, fontWeight: 950, color: tag === "E" ? "#9a3412" : "#1d4ed8" }));
    nodes.push(createTextNode(title, px + 46, py + 13, pw - 60, 20, { fontSize: 12.8, fontWeight: 850, color: "#334155", align: "start" }));
  });
  nodes.push(
    createTemplateRealisticImage("realistic-pipette-bench", "Pipette workflow", x + 24, topY + 50, 300, 186, `${template.id}:panel-A`, { colorWash: "#2563eb", colorWashOpacity: 0.05, contrast: 1.12 }, { x: -0.02, y: 0.02, zoom: 1.08 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-sample-tubes", "Sample tubes", x + 336, topY + 66, 108, 150, `${template.id}:panel-A-context`, { colorWash: "#22c55e", colorWashOpacity: 0.07, contrast: 1.08 }, { y: 0.03, zoom: 1.12 }, { shape: "round-rect" }),
    createTemplateSymbol("pipette", "Editable protocol icon", x + 34, topY + 212, 58, 42, `${template.id}:editable-protocol-icon`, "consulting-2p5d"),
    createConnectorNode(x + 324, topY + 142, x + 336, topY + 142),
    createTemplateRealisticImage("realistic-plate-96-photo", "Assay plate", x + mainW + gap + 24, topY + 50, midW - 48, 186, `${template.id}:panel-B`, { colorWash: "#0ea5e9", colorWashOpacity: 0.06, contrast: 1.1 }, { zoom: 1.06 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-microscope-bench", "Microscope context", x + mainW + midW + gap * 2 + 24, topY + 50, rightW - 48, 186, `${template.id}:panel-C`, { colorWash: "#14b8a6", colorWashOpacity: 0.05, contrast: 1.1 }, { zoom: 1.08 }, { shape: "round-rect" }),
    createPlotNode("bar", "Protocol QC by step", demoWetlabQcTable(), { x: "step", y: "score", color: "class" }, x + 28, lowerY + 48, Math.round(width * 0.58) - 56, 146),
    createTemplateRealisticImage("realistic-biosafety-cabinet", "BSC context", x + Math.round(width * 0.58) + gap + 28, lowerY + 54, 156, 112, `${template.id}:biosafety-context`, { colorWash: "#dc2626", colorWashOpacity: 0.08, contrast: 1.1 }, { zoom: 1.08 }, { shape: "round-rect" }),
    createShapeNode("round-rect", "", x + Math.round(width * 0.58) + gap + 208, lowerY + 48, width - Math.round(width * 0.58) - gap - 242, 128, "#fff7ed", "#fed7aa", "floating"),
    createTextNode("Review before export", x + Math.round(width * 0.58) + gap + 230, lowerY + 66, 230, 20, { fontSize: 14, fontWeight: 920, color: "#92400e", align: "start" }),
    createTextNode("Confirm protocol source, sample handling claim, BSC context, and image fallback warnings before PPTX/DOCX delivery.", x + Math.round(width * 0.58) + gap + 230, lowerY + 96, width - Math.round(width * 0.58) - gap - 298, 58, { fontSize: 12.2, fontWeight: 720, color: "#7c2d12", align: "start" })
  );
  return nodes;
}

function createCellularRealisticEvidenceNodes(template) {
  const x = 54;
  const y = 58;
  const width = 1172;
  const gap = 24;
  const topY = y + 68;
  const leftW = 392;
  const midW = 360;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 292;
  const lowerLeftW = Math.round(width * 0.58);
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 44, width + 36, 646, "#ffffff", "#fbcfe8", "hero"),
    createTextNode("Cellular realistic evidence panel", x, y - 30, 610, 32, { fontSize: 27, fontWeight: 920, align: "start" }),
    createTextNode("Editorial cellular textures plus editable marker summary, biology symbols, and export/provenance QA.", x + 590, y - 25, width - 590, 27, { fontSize: 13.2, fontWeight: 680, color: "#64748b", align: "end" })
  ];
  [
    ["A", "Organoid context", x, topY, leftW, 268],
    ["B", "Tumor microenvironment", x + leftW + gap, topY, midW, 268],
    ["C", "Immune infiltrate", x + leftW + midW + gap * 2, topY, rightW, 268],
    ["D", "Marker evidence", x, lowerY, lowerLeftW, 214],
    ["E", "Assay / risk context", x + lowerLeftW + gap, lowerY, width - lowerLeftW - gap, 214]
  ].forEach(([tag, title, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, "#f8fafc", tag === "E" ? "#fed7aa" : "#cbd5e1", tag === "E" ? "floating" : "raised"));
    nodes.push(createTextNode(tag, px + 14, py + 12, 24, 22, { fontSize: 17, fontWeight: 950, color: tag === "E" ? "#9a3412" : "#be185d" }));
    nodes.push(createTextNode(title, px + 46, py + 13, pw - 60, 20, { fontSize: 12.8, fontWeight: 850, color: "#334155", align: "start" }));
  });
  nodes.push(
    createTemplateRealisticImage("realistic-organoid-texture", "Organoid texture", x + 24, topY + 50, leftW - 48, 186, `${template.id}:panel-A`, { colorWash: "#f472b6", colorWashOpacity: 0.08, contrast: 1.1 }, { y: 0.01, zoom: 1.1 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-tumor-microenvironment", "Tumor microenvironment", x + leftW + gap + 24, topY + 50, midW - 48, 186, `${template.id}:panel-B`, { colorWash: "#ef4444", colorWashOpacity: 0.08, contrast: 1.1 }, { x: 0.02, zoom: 1.12 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-immune-infiltrate", "Immune infiltrate", x + leftW + midW + gap * 2 + 24, topY + 50, rightW - 48, 186, `${template.id}:panel-C`, { colorWash: "#22c55e", colorWashOpacity: 0.07, contrast: 1.1 }, { x: -0.01, y: 0.01, zoom: 1.1 }, { shape: "round-rect" }),
    createTemplateSymbol("cell-tumor", "Tumor cell", x + leftW + gap + 38, topY + 206, 58, 44, `${template.id}:editable-tumor-cell`, "consulting-2p5d"),
    createTemplateSymbol("cell-t", "T cell", x + leftW + midW + gap * 2 + 38, topY + 206, 58, 44, `${template.id}:editable-t-cell`, "consulting-2p5d"),
    createPlotNode("heatmap", "Marker score by cell state", demoCellularMarkerTable(), { x: "state", y: "marker", value: "score" }, x + 28, lowerY + 48, lowerLeftW - 230, 146),
    createTemplateSymbol("antibody", "Antibody marker", x + lowerLeftW - 176, lowerY + 66, 126, 104, `${template.id}:editable-antibody`, "consulting-2p5d"),
    createTemplateRealisticImage("realistic-protein-gel", "Protein gel evidence", x + lowerLeftW + gap + 28, lowerY + 54, 142, 112, `${template.id}:protein-gel`, { colorWash: "#334155", colorWashOpacity: 0.06, contrast: 1.08 }, { zoom: 1.08 }, { shape: "round-rect" }),
    createTemplateRealisticImage("realistic-pathogen-particles", "Risk texture", x + lowerLeftW + gap + 186, lowerY + 54, 132, 112, `${template.id}:risk-context`, { colorWash: "#dc2626", colorWashOpacity: 0.08, contrast: 1.08 }, { zoom: 1.12 }, { shape: "round-rect" }),
    createShapeNode("round-rect", "", x + lowerLeftW + gap + 28, lowerY + 168, width - lowerLeftW - gap - 56, 34, "#fff7ed", "#fed7aa", "floating"),
    createTextNode("Review image source, marker context, and PPTX/DOCX fallbacks.", x + lowerLeftW + gap + 44, lowerY + 177, width - lowerLeftW - gap - 88, 18, { fontSize: 11.4, fontWeight: 920, color: "#92400e", align: "start" })
  );
  return nodes;
}

function createSpaceRealisticContextNodes(template) {
  const x = 54;
  const y = 58;
  const width = 1172;
  const gap = 24;
  const topY = y + 68;
  const leftW = 402;
  const midW = 346;
  const rightW = width - leftW - midW - gap * 2;
  const lowerY = topY + 292;
  const lowerLeftW = Math.round(width * 0.58);
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 44, width + 36, 646, "#ffffff", "#c7d2fe", "hero"),
    createTextNode("Space biology realistic context panel", x, y - 30, 650, 32, { fontSize: 27, fontWeight: 920, align: "start" }),
    createTextNode("Mission imagery, biospecimen handling, flight assay, GeneLab-style data, and export/provenance QA.", x + 610, y - 25, width - 610, 27, { fontSize: 13.2, fontWeight: 680, color: "#64748b", align: "end" })
  ];
  [
    ["A", "Mission context", x, topY, leftW, 268],
    ["B", "Crew sample", x + leftW + gap, topY, midW, 268],
    ["C", "Flight assay", x + leftW + midW + gap * 2, topY, rightW, 268],
    ["D", "Omics response", x, lowerY, lowerLeftW, 214],
    ["E", "GeneLab / review packet", x + lowerLeftW + gap, lowerY, width - lowerLeftW - gap, 214]
  ].forEach(([tag, title, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, "#f8fafc", tag === "E" ? "#bae6fd" : "#cbd5e1", tag === "E" ? "floating" : "raised"));
    nodes.push(createTextNode(tag, px + 14, py + 12, 24, 22, { fontSize: 17, fontWeight: 950, color: tag === "E" ? "#0369a1" : "#3730a3" }));
    nodes.push(createTextNode(title, px + 46, py + 13, pw - 60, 20, { fontSize: 12.8, fontWeight: 850, color: "#334155", align: "start" }));
  });
  nodes.push(
    createTemplateRealisticImage("realistic-spacecraft-context", "Spacecraft context", x + 24, topY + 50, leftW - 48, 186, `${template.id}:panel-A`, { colorWash: "#2563eb", colorWashOpacity: 0.07, contrast: 1.1 }, { x: -0.01, y: 0, zoom: 1.08 }, { shape: "round-rect" }),
    createTemplateSymbol("microgravity", "Microgravity", x + 38, topY + 204, 64, 48, `${template.id}:editable-microgravity`, "consulting-2p5d"),
    createTemplateRealisticImage("realistic-astronaut-sample", "Astronaut sample", x + leftW + gap + 24, topY + 50, midW - 48, 186, `${template.id}:panel-B`, { colorWash: "#0ea5e9", colorWashOpacity: 0.07, contrast: 1.1 }, { x: 0.01, y: 0.02, zoom: 1.12 }, { shape: "round-rect" }),
    createTemplateSymbol("astronaut-sample", "Biospecimen", x + leftW + gap + 40, topY + 204, 64, 48, `${template.id}:editable-sample`, "consulting-2p5d"),
    createConnectorNode(x + leftW + gap - 12, topY + 143, x + leftW + gap + 24, topY + 143),
    createTemplateRealisticImage("realistic-spaceflight-assay", "Spaceflight assay", x + leftW + midW + gap * 2 + 24, topY + 50, rightW - 48, 186, `${template.id}:panel-C`, { colorWash: "#7c3aed", colorWashOpacity: 0.08, contrast: 1.1 }, { y: 0.01, zoom: 1.1 }, { shape: "round-rect" }),
    createTemplateSymbol("spaceflight-assay", "Flight assay", x + leftW + midW + gap * 2 + 40, topY + 204, 64, 48, `${template.id}:editable-assay`, "consulting-2p5d"),
    createConnectorNode(x + leftW + midW + gap * 2 - 12, topY + 143, x + leftW + midW + gap * 2 + 24, topY + 143),
    createPlotNode("bar", "Space omics response", demoSpaceOmicsTable(), { x: "feature", y: "response", color: "system" }, x + 28, lowerY + 48, lowerLeftW - 230, 146),
    createTemplateSymbol("dataset", "GeneLab dataset", x + lowerLeftW - 176, lowerY + 66, 126, 104, `${template.id}:editable-dataset`, "consulting-2p5d"),
    createTemplateRealisticImage("realistic-genelab-data-context", "GeneLab data context", x + lowerLeftW + gap + 28, lowerY + 54, 172, 112, `${template.id}:genelab-context`, { colorWash: "#0891b2", colorWashOpacity: 0.07, contrast: 1.08 }, { zoom: 1.08 }, { shape: "round-rect" }),
    createShapeNode("round-rect", "", x + lowerLeftW + gap + 224, lowerY + 54, width - lowerLeftW - gap - 252, 112, "#f0f9ff", "#bae6fd", "floating"),
    createTextNode("Review before export", x + lowerLeftW + gap + 244, lowerY + 72, 210, 20, { fontSize: 14, fontWeight: 920, color: "#075985", align: "start" }),
    createTextNode("Mission/sample source and image fallbacks.", x + lowerLeftW + gap + 244, lowerY + 102, width - lowerLeftW - gap - 300, 44, { fontSize: 12, fontWeight: 720, color: "#0f172a", align: "start" })
  );
  return nodes;
}

function createAiBiosecurityFlagshipNodes(template) {
  const x = 72;
  const y = 112;
  const width = 1064;
  const styleProfile = currentAssetStyleProfile();
  const theme = flagshipStyleTheme(styleProfile, "risk");
  const nodes = [
    createShapeNode("round-rect", "", x - 18, y - 48, width + 36, 500, theme.outerFill, theme.outerStroke, theme.outerDepth),
    createTextNode("AI biosecurity evaluation pipeline", x, y - 36, 560, 30, { fontSize: 23, fontWeight: 900, color: theme.heading, align: "start" }),
    createTextNode("Benchmarks, classifier, permissioning, review, audit, escalation.", x + 536, y - 32, width - 536, 26, { fontSize: 12, fontWeight: 650, color: theme.muted, align: "end" })
  ];
  const stages = [
    ["dataset", "Prompt/source set", false],
    ["benchmark", "Benchmark suite", false],
    ["bio-classifier", "Bio classifier", false],
    ["risk-gate", "Risk gate", true],
    ["permission-tier", "Permission tier", true],
    ["human-review", "Human review", true]
  ];
  const gap = width / stages.length;
  stages.forEach(([assetId, label, isRisk], index) => {
    const cardX = x + index * gap + 2;
    const cardY = y + 64;
    nodes.push(createShapeNode("round-rect", "", cardX, cardY, 148, 150, isRisk ? theme.warningFill : theme.panelFill, isRisk ? theme.warningStroke : theme.panelStroke, isRisk ? theme.floatingDepth : theme.panelDepth));
    nodes.push(createTemplateSymbol(
      assetId,
      label,
      cardX + 14,
      cardY + 24,
      120,
      96,
      `${template.id}:stage-${index + 1}`,
      isRisk ? theme.riskSymbolProfile : styleProfile,
      { ...(isRisk ? theme.riskSymbolAppearance : theme.symbolAppearance), labelVisible: false }
    ));
    nodes.push(createTextNode(label, cardX + 10, cardY + 122, 128, 22, { fontSize: 11, fontWeight: 850, color: isRisk ? theme.warningText : theme.text }));
    if (index > 0) nodes.push(createConnectorNode(cardX - 24, cardY + 74, cardX + 2, cardY + 74, { stroke: isRisk ? theme.warningText : theme.connector }));
  });
  nodes.push(
    createShapeNode("round-rect", "", x, y + 260, Math.round(width * 0.42), 150, theme.panelFill, theme.panelStroke, theme.panelDepth),
    createTextNode("Risk review outputs", x + 20, y + 276, 220, 22, { fontSize: 15, fontWeight: 900, color: theme.text, align: "start" }),
    createTemplateSymbol("durc-flag", "DURC flag", x + 22, y + 306, 118, 92, `${template.id}:review-durc`, theme.riskSymbolProfile, theme.riskSymbolAppearance),
    createTemplateSymbol("audit-log", "Audit log", x + 154, y + 306, 118, 92, `${template.id}:review-audit`, styleProfile, theme.symbolAppearance),
    createTextNode("Escalate ambiguous wetlab cases to expert review; retain audit trail.", x + 292, y + 314, Math.round(width * 0.42) - 296, 58, { fontSize: 12, fontWeight: 750, color: theme.reviewText, align: "start" }),
    createPlotNode("bar", "Risk score by class", demoRiskMetricTable(), { x: "class", y: "score", color: "split" }, x + Math.round(width * 0.45), y + 260, Math.round(width * 0.28), 150, theme.plotStyle),
    createShapeNode("round-rect", "", x + Math.round(width * 0.76), y + 260, Math.round(width * 0.24), 150, theme.warningFill, theme.warningStroke, theme.floatingDepth),
    createTemplateSymbol("domain-expert-review", "Expert review", x + Math.round(width * 0.77) + 14, y + 300, 116, 90, `${template.id}:expert-review`, theme.riskSymbolProfile, theme.riskSymbolAppearance),
    createTextNode("Queue: permission, refusal boundary, citation context.", x + Math.round(width * 0.77) + 132, y + 312, Math.round(width * 0.24) - 148, 54, { fontSize: 12, fontWeight: 800, color: theme.warningText, align: "start" })
  );
  return nodes;
}

function createJournalWebToolkit(template, accent = "blue") {
  const styleProfile = "publication-line";
  const theme = flagshipStyleTheme(styleProfile, accent);
  const lineShape = (shape, label, x, y, width, height, fill = "#ffffff", stroke = "#111827", strokeWidth = 1.15) => {
    const node = createShapeNode(shape, label, x, y, width, height, fill, stroke, "surface");
    node.style.strokeWidth = strokeWidth;
    node.style.depth = "surface";
    return node;
  };
  const lineText = (text, x, y, width, height, style = {}) => createTextNode(text, x, y, width, height, {
    color: theme.heading,
    fontWeight: 720,
    align: "start",
    ...style
  });
  const lineSymbol = (assetId, label, x, y, width, height, layoutHint, extraAppearance = {}) => {
    const node = createTemplateSymbol(assetId, label, x, y, width, height, layoutHint, styleProfile, {
      ...theme.symbolAppearance,
      labelVisible: false,
      ...extraAppearance
    });
    node.style.depth = "surface";
    node.style.strokeWidth = 1.35;
    node.claimStatus = "draft-visual";
    return node;
  };
  const linePlot = (plotType, title, table, encodings, x, y, width, height, journalPlot = {}) => {
    const node = createPlotNode(plotType, title, table, encodings, x, y, width, height, {
      fill: "#ffffff",
      stroke: "#111827",
      color: "#111827",
      depth: "surface"
    });
    node.payload.spec.journalPlot = {
      axisLabels: true,
      units: "synthetic public fixture",
      legend: true,
      sourceDataNote: "Replace synthetic fixture with cited source table before manuscript export.",
      ...journalPlot
    };
    node.payload.spec.sourceDataNote = node.payload.spec.journalPlot.sourceDataNote;
    node.claimStatus = "user-confirmed";
    return node;
  };
  const panel = (tag, title, x, y, width, height) => [
    lineShape("rect", "", x, y, width, height),
    lineText(tag, x + 10, y + 9, 26, 22, { fontSize: 16, fontWeight: 950 }),
    lineText(title, x + 40, y + 11, width - 54, 20, { fontSize: 12.4, fontWeight: 840 })
  ];
  const sourceStrip = (text, x, y, width) => [
    lineShape("rect", "", x, y, width, 34, "#ffffff", "#374151", 0.9),
    lineText(text, x + 12, y + 9, width - 24, 16, { fontSize: 9.4, fontWeight: 720, color: "#374151" })
  ];
  return { theme, lineShape, lineText, lineSymbol, linePlot, panel, sourceStrip };
}

function createPerturbSeqJournalWebNodes(template) {
  const x = 66;
  const y = 70;
  const width = 1148;
  const tk = createJournalWebToolkit(template, "blue");
  const nodes = [
    tk.lineShape("rect", "", x - 18, y - 24, width + 36, 584, "#ffffff", "#111827", 1.35),
    tk.lineText("Perturb-seq CRISPR workflow figure", x, y - 12, 560, 28, { fontSize: 21, fontWeight: 880 }),
    tk.lineText("Publication-line schematic: perturbation design, single-cell readout, model matrix, and source-data review.", x + 574, y - 8, width - 574, 24, { fontSize: 10.8, fontWeight: 650, color: "#374151", align: "end" })
  ];
  [
    ["A", "Perturbation design", x, y + 42, 260, 170],
    ["B", "Pooled cell capture", x + 286, y + 42, 260, 170],
    ["C", "Sequencing readout", x + 572, y + 42, 260, 170],
    ["D", "Guide-linked matrix", x + 858, y + 42, 290, 170],
    ["E", "Hit evidence", x, y + 246, 700, 224],
    ["F", "Source + provenance review", x + 724, y + 246, 424, 224]
  ].forEach((panel) => nodes.push(...tk.panel(...panel)));
  nodes.push(
    tk.lineSymbol("cell-t", "Target cells", x + 28, y + 88, 82, 70, `${template.id}:panel-A-cells`),
    tk.lineSymbol("guide-rna", "Guide RNA", x + 124, y + 86, 82, 72, `${template.id}:panel-A-grna`),
    tk.lineSymbol("crispr-cas9", "Cas9", x + 204, y + 88, 44, 66, `${template.id}:panel-A-cas9`),
    createConnectorNode(x + 262, y + 126, x + 286, y + 126, { stroke: "#111827", strokeWidth: 1.4 }),
    tk.lineSymbol("lentiviral-library", "Pooled library", x + 318, y + 84, 88, 78, `${template.id}:panel-B-library`),
    tk.lineSymbol("scrna-droplet", "Single-cell droplet", x + 430, y + 82, 86, 82, `${template.id}:panel-B-droplet`),
    createConnectorNode(x + 548, y + 126, x + 572, y + 126, { stroke: "#111827", strokeWidth: 1.4 }),
    tk.lineSymbol("sequencer", "Sequencer", x + 610, y + 84, 88, 78, `${template.id}:panel-C-sequencer`),
    tk.lineSymbol("cell-barcode", "Barcode", x + 724, y + 88, 76, 68, `${template.id}:panel-C-barcode`),
    createConnectorNode(x + 834, y + 126, x + 858, y + 126, { stroke: "#111827", strokeWidth: 1.4 }),
    tk.lineSymbol("expression-matrix", "Expression matrix", x + 904, y + 78, 112, 90, `${template.id}:panel-D-matrix`),
    tk.lineSymbol("gene-locus", "Hit locus", x + 1030, y + 88, 82, 70, `${template.id}:panel-D-locus`),
    tk.linePlot("volcano", "Differential effect volcano", demoVolcanoTable(), { x: "log2FC", y: "pValue", color: "cellState", label: "gene" }, x + 24, y + 292, 418, 150, { axisLabels: "log2FC vs -log10(FDR)", legend: "cell-state groups" }),
    tk.lineSymbol("metric-card", "Effect summary", x + 472, y + 304, 88, 76, `${template.id}:panel-E-metric`),
    tk.lineText("Candidate hits require guide count QC, replicate support, and cited differential-expression table before final manuscript export.", x + 574, y + 306, 108, 88, { fontSize: 10.2, fontWeight: 700, color: "#374151" }),
    ...tk.sourceStrip("Source placeholders: guide assignment table, cell QC table, count matrix, DE result table, validation citation.", x + 748, y + 300, 364),
    ...tk.sourceStrip("Journal QA: no decorative depth; axis/legend metadata attached; PPTX fallback assets remain named.", x + 748, y + 354, 364),
    tk.lineSymbol("audit-log", "Review ledger", x + 774, y + 400, 88, 62, `${template.id}:panel-F-audit`),
    tk.lineSymbol("approval-stamp", "Ready for review", x + 892, y + 400, 88, 62, `${template.id}:panel-F-approval`)
  );
  return nodes;
}

function createSpatialJournalWebNodes(template) {
  const x = 66;
  const y = 70;
  const width = 1148;
  const tk = createJournalWebToolkit(template, "purple");
  const nodes = [
    tk.lineShape("rect", "", x - 18, y - 24, width + 36, 584, "#ffffff", "#111827", 1.35),
    tk.lineText("Spatial transcriptomics results panel", x, y - 12, 560, 28, { fontSize: 21, fontWeight: 880 }),
    tk.lineText("Publication-line panel grid: tissue region, capture spots, segmentation, neighborhoods, expression summary.", x + 574, y - 8, width - 574, 24, { fontSize: 10.8, fontWeight: 650, color: "#374151", align: "end" })
  ];
  [
    ["A", "Tissue + capture spots", x, y + 42, 344, 194],
    ["B", "Segmentation mask", x + 376, y + 42, 344, 194],
    ["C", "Neighborhood graph", x + 752, y + 42, 396, 194],
    ["D", "Marker expression summary", x, y + 270, 700, 200],
    ["E", "Image/source processing notes", x + 724, y + 270, 424, 200]
  ].forEach((panel) => nodes.push(...tk.panel(...panel)));
  nodes.push(
    tk.lineSymbol("histology-section", "Histology section", x + 24, y + 88, 132, 104, `${template.id}:panel-A-histology`),
    tk.lineSymbol("visium-spot-array", "Spot array", x + 174, y + 86, 136, 104, `${template.id}:panel-A-spots`),
    tk.lineText("Replace fixture with source image and processing notes.", x + 42, y + 194, 250, 18, { fontSize: 9.2, color: "#374151" }),
    tk.lineSymbol("segmentation-mask", "Segmentation", x + 410, y + 86, 134, 104, `${template.id}:panel-B-mask`),
    tk.lineSymbol("cell-boundary", "Cell boundary", x + 562, y + 90, 118, 96, `${template.id}:panel-B-boundary`),
    tk.lineText("Mask version, model, and threshold must be cited.", x + 420, y + 194, 252, 18, { fontSize: 9.2, color: "#374151" }),
    tk.lineSymbol("neighborhood-graph", "Neighborhood graph", x + 792, y + 84, 152, 114, `${template.id}:panel-C-neighborhood`),
    tk.lineSymbol("tissue-region", "Region annotation", x + 966, y + 88, 120, 98, `${template.id}:panel-C-region`),
    tk.linePlot("heatmap", "Marker expression by region", demoSpatialHeatmapTable(), { x: "region", y: "gene", value: "expression" }, x + 26, y + 316, 430, 128, { axisLabels: "region by marker gene", legend: "scaled expression" }),
    tk.lineSymbol("gene-locus", "Marker gene", x + 484, y + 330, 86, 72, `${template.id}:panel-D-gene`),
    tk.lineText("Report region annotation, normalization, and source-data table with the figure.", x + 584, y + 326, 96, 76, { fontSize: 9.5, fontWeight: 700, color: "#374151" }),
    ...tk.sourceStrip("Image provenance: tissue source, staining/imaging metadata, crop/mask policy, segmentation method.", x + 748, y + 324, 364),
    ...tk.sourceStrip("Plot provenance: expression matrix, region labels, source-data table, color-scale limits.", x + 748, y + 378, 364),
    tk.lineSymbol("audit-log", "Source ledger", x + 778, y + 424, 78, 52, `${template.id}:panel-E-ledger`),
    tk.lineSymbol("metric-card", "Scale note", x + 892, y + 424, 78, 52, `${template.id}:panel-E-scale`)
  );
  return nodes;
}

function createAiBiosecurityJournalWebNodes(template) {
  const x = 66;
  const y = 70;
  const width = 1148;
  const tk = createJournalWebToolkit(template, "risk");
  const nodes = [
    tk.lineShape("rect", "", x - 18, y - 24, width + 36, 584, "#ffffff", "#111827", 1.35),
    tk.lineText("AI biosecurity evaluation schematic", x, y - 12, 560, 28, { fontSize: 21, fontWeight: 880 }),
    tk.lineText("Publication-line methods figure: benchmark set, classifier, threshold review, human decision, audit evidence.", x + 574, y - 8, width - 574, 24, { fontSize: 10.8, fontWeight: 650, color: "#374151", align: "end" })
  ];
  [
    ["A", "Evaluation sources", x, y + 42, 270, 174],
    ["B", "Model + calibration", x + 300, y + 42, 338, 174],
    ["C", "Risk review path", x + 668, y + 42, 480, 174],
    ["D", "Failure modes", x, y + 250, 584, 220],
    ["E", "Audit packet", x + 616, y + 250, 532, 220]
  ].forEach((panel) => nodes.push(...tk.panel(...panel)));
  nodes.push(
    tk.lineSymbol("dataset", "Prompt set", x + 28, y + 88, 86, 76, `${template.id}:panel-A-dataset`),
    tk.lineSymbol("benchmark", "Benchmark", x + 142, y + 88, 86, 76, `${template.id}:panel-A-benchmark`),
    tk.lineText("Include source snippets, task classes, and exclusion criteria.", x + 32, y + 170, 218, 28, { fontSize: 9.4, fontWeight: 700, color: "#374151" }),
    tk.lineSymbol("bio-classifier", "Bio classifier", x + 330, y + 88, 88, 76, `${template.id}:panel-B-classifier`),
    tk.lineSymbol("calibration", "Calibration", x + 444, y + 88, 88, 76, `${template.id}:panel-B-calibration`),
    tk.linePlot("line", "Calibration curve", demoCalibrationTable(), { x: "confidence", y: "observed", color: "split" }, x + 536, y + 92, 74, 62, { axisLabels: "confidence vs observed risk", legend: "split" }),
    createConnectorNode(x + 638, y + 128, x + 668, y + 128, { stroke: "#111827", strokeWidth: 1.4 }),
    tk.lineSymbol("risk-gate", "Risk gate", x + 704, y + 84, 82, 72, `${template.id}:panel-C-risk`),
    tk.lineSymbol("permission-tier", "Permission", x + 820, y + 84, 82, 72, `${template.id}:panel-C-permission`),
    tk.lineSymbol("human-review", "Human review", x + 936, y + 84, 82, 72, `${template.id}:panel-C-human`),
    tk.lineSymbol("audit-log", "Audit log", x + 1050, y + 84, 64, 72, `${template.id}:panel-C-audit`),
    tk.lineText("Thresholds route high-uncertainty biological requests to human review.", x + 704, y + 168, 380, 28, { fontSize: 9.4, fontWeight: 700, color: "#374151" }),
    tk.linePlot("bar", "Failure modes by severity", demoFailureModeTable(), { x: "mode", y: "count", color: "severity" }, x + 28, y + 300, 348, 132, { axisLabels: "failure mode vs count", legend: "severity" }),
    tk.lineSymbol("error-analysis", "Error analysis", x + 408, y + 320, 92, 74, `${template.id}:panel-D-error`),
    tk.lineText("Report false positives/negatives, confidence intervals, and review-load assumptions.", x + 504, y + 310, 58, 96, { fontSize: 9.2, fontWeight: 700, color: "#374151" }),
    ...tk.sourceStrip("Audit fields: prompt/source ID, classifier score, threshold version, reviewer rationale, timestamp.", x + 640, y + 302, 464),
    ...tk.sourceStrip("Safety review: DURC flag, permission tier, escalation outcome, export fallback ledger.", x + 640, y + 356, 464),
    tk.lineSymbol("durc-flag", "DURC flag", x + 668, y + 414, 78, 56, `${template.id}:panel-E-durc`),
    tk.lineSymbol("domain-expert-review", "Expert review", x + 790, y + 414, 78, 56, `${template.id}:panel-E-expert`),
    tk.lineSymbol("approval-stamp", "Decision", x + 912, y + 414, 78, 56, `${template.id}:panel-E-decision`)
  );
  return nodes;
}

function createReviewAuditFlowNodes(template) {
  const x = 78;
  const y = 118;
  const width = 1052;
  const topY = y + 62;
  const stageW = 158;
  const stageGap = Math.round((width - stageW * 5) / 4);
  const stages = [
    ["review-queue", "Review queue", "Cases needing human triage", currentAssetStyleProfile()],
    ["human-review", "Human reviewer", "Policy and context check", "risk-warning"],
    ["domain-expert-review", "Domain expert", "Wetlab feasibility review", "risk-warning"],
    ["audit-log", "Audit ledger", "Traceable decision history", currentAssetStyleProfile()],
    ["approval-stamp", "Approved output", "Allowed with provenance", "risk-warning"]
  ];
  const nodes = [
    createShapeNode("round-rect", "", x - 22, y - 48, width + 44, 474, "#ffffff", "#fed7aa", "hero"),
    createTextNode("Review and audit flow", x, y - 36, 480, 30, { fontSize: 23, fontWeight: 900, align: "start" }),
    createTextNode("Human accountability, expert escalation, audit trail, and explicit approval/block outcomes.", x + 480, y - 32, width - 480, 26, { fontSize: 12, fontWeight: 650, color: "#64748b", align: "end" }),
    createShapeNode("round-rect", "", x, y + 258, Math.round(width * 0.54), 122, "#f8fafc", "#cbd5e1", "raised"),
    createShapeNode("round-rect", "", x + Math.round(width * 0.57), y + 258, Math.round(width * 0.43), 122, "#fff7ed", "#fed7aa", "floating"),
    createTextNode("Audit package", x + 22, y + 276, 180, 24, { fontSize: 15, fontWeight: 900, align: "start" }),
    createTextNode("Retain source snippets, reviewer rationale, policy tier, timestamp, and export warnings as structured scene metadata.", x + 22, y + 306, Math.round(width * 0.54) - 44, 44, { fontSize: 12, fontWeight: 700, color: "#475569", align: "start" }),
    createTextNode("Blocked outcome path", x + Math.round(width * 0.57) + 20, y + 276, 210, 24, { fontSize: 15, fontWeight: 900, color: "#9a3412", align: "start" }),
    createTextNode("If the reviewer cannot justify release, route to refusal boundary and keep the blocked decision auditable.", x + Math.round(width * 0.57) + 20, y + 306, Math.round(width * 0.43) - 184, 48, { fontSize: 12, fontWeight: 750, color: "#7c2d12", align: "start" }),
    createTemplateSymbol("blocked-output", "Blocked output", x + Math.round(width * 0.57) + Math.round(width * 0.43) - 150, y + 286, 118, 88, `${template.id}:blocked-outcome`, "risk-warning")
  ];
  stages.forEach(([assetId, label, note, styleProfile], index) => {
    const cardX = x + index * (stageW + stageGap);
    const isRisk = styleProfile === "risk-warning";
    nodes.push(createShapeNode("round-rect", "", cardX, topY, stageW, 158, isRisk ? "#fff7ed" : "#f8fafc", isRisk ? "#fed7aa" : "#cbd5e1", index === stages.length - 1 ? "floating" : "raised"));
    nodes.push(createTemplateSymbol(assetId, label, cardX + 18, topY + 24, 122, 94, `${template.id}:stage-${index + 1}`, styleProfile));
    nodes.push(createTextNode(label, cardX + 10, topY + 120, stageW - 20, 18, { fontSize: 11, fontWeight: 900, color: isRisk ? "#9a3412" : "#334155" }));
    nodes.push(createTextNode(note, cardX + 12, topY + 138, stageW - 24, 18, { fontSize: 9.5, fontWeight: 700, color: "#64748b" }));
    if (index > 0) nodes.push(createConnectorNode(cardX - stageGap + stageW + 4, topY + 78, cardX - 4, topY + 78));
  });
  nodes.push(
    createConnectorNode(x + 3 * (stageW + stageGap) + Math.round(stageW * 0.72), topY + 158, x + Math.round(width * 0.57) + 24, y + 319),
    createConnectorNode(x + 3 * (stageW + stageGap) + Math.round(stageW * 0.5), topY + 158, x + 176, y + 278),
    createTextNode("QA: Review responsibilities, audit trail, and approval/block branches must remain visible before PPTX/PDF export.", x + 20, y + 396, width - 40, 24, { fontSize: 12, fontWeight: 800, color: "#7c2d12", align: "start" })
  );
  return nodes;
}

function createPermissioningLadderNodes(template) {
  const x = 76;
  const y = 118;
  const width = 1056;
  const tierY = y + 72;
  const tierW = Math.round((width - 54) / 4);
  const tierGap = 18;
  const tiers = [
    ["permission-tier", "Tier 0", "Open scientific help", "Benign educational or analysis request", "#ecfeff", "#67e8f9", currentAssetStyleProfile()],
    ["risk-gate", "Tier 1", "Context-limited", "Answer with source grounding and constraints", "#f8fafc", "#cbd5e1", currentAssetStyleProfile()],
    ["human-review", "Tier 2", "Human review", "Ambiguous dual-use or wetlab feasibility", "#fff7ed", "#fed7aa", "risk-warning"],
    ["escalation-path", "Tier 3", "Escalate or block", "High-risk, DURC, or unsupported request", "#fef2f2", "#fecaca", "risk-warning"]
  ];
  const nodes = [
    createShapeNode("round-rect", "", x - 22, y - 48, width + 44, 474, "#ffffff", "#bfdbfe", "hero"),
    createTextNode("Permissioning ladder", x, y - 36, 420, 30, { fontSize: 23, fontWeight: 900, align: "start" }),
    createTextNode("Calibrated biological AI outputs with explicit tiers, review triggers, and auditable outcomes.", x + 420, y - 32, width - 420, 26, { fontSize: 12, fontWeight: 650, color: "#64748b", align: "end" }),
    createShapeNode("round-rect", "", x, y + 276, Math.round(width * 0.48), 116, "#f8fafc", "#cbd5e1", "raised"),
    createShapeNode("round-rect", "", x + Math.round(width * 0.52), y + 276, Math.round(width * 0.48), 116, "#fff7ed", "#fed7aa", "floating"),
    createTextNode("Release path", x + 20, y + 294, 160, 24, { fontSize: 15, fontWeight: 900, align: "start" }),
    createTextNode("Allowed answers keep citations, uncertainty, and scope constraints attached to the exported scene.", x + 20, y + 324, Math.round(width * 0.48) - 176, 44, { fontSize: 12, fontWeight: 720, color: "#475569", align: "start" }),
    createTemplateSymbol("approval-stamp", "Approved", x + Math.round(width * 0.48) - 140, y + 302, 112, 84, `${template.id}:approved-outcome`),
    createTextNode("Escalation path", x + Math.round(width * 0.52) + 20, y + 294, 170, 24, { fontSize: 15, fontWeight: 900, color: "#9a3412", align: "start" }),
    createTextNode("If provenance, policy, or reviewer confidence is insufficient, block the output and preserve rationale.", x + Math.round(width * 0.52) + 20, y + 324, Math.round(width * 0.48) - 176, 44, { fontSize: 12, fontWeight: 750, color: "#7c2d12", align: "start" }),
    createTemplateSymbol("blocked-output", "Blocked", x + width - 142, y + 302, 112, 84, `${template.id}:blocked-outcome`, "risk-warning")
  ];
  tiers.forEach(([assetId, tier, title, note, fill, stroke, styleProfile], index) => {
    const cardX = x + index * (tierW + tierGap);
    const isRisk = styleProfile === "risk-warning";
    nodes.push(createShapeNode("round-rect", "", cardX, tierY, tierW, 158, fill, stroke, isRisk ? "floating" : "raised"));
    nodes.push(createTextNode(tier, cardX + 14, tierY + 12, 72, 18, { fontSize: 11, fontWeight: 950, color: isRisk ? "#9a3412" : "#0369a1", align: "start" }));
    nodes.push(createTemplateSymbol(assetId, title, cardX + Math.round((tierW - 116) / 2), tierY + 32, 116, 88, `${template.id}:tier-${index}`, styleProfile));
    nodes.push(createTextNode(title, cardX + 12, tierY + 122, tierW - 24, 18, { fontSize: 11, fontWeight: 900, color: isRisk ? "#9a3412" : "#334155" }));
    nodes.push(createTextNode(note, cardX + 12, tierY + 140, tierW - 24, 18, { fontSize: 9.4, fontWeight: 700, color: "#64748b" }));
    if (index > 0) nodes.push(createConnectorNode(cardX - tierGap + tierW + 4, tierY + 78, cardX - 5, tierY + 78));
  });
  nodes.push(
    createConnectorNode(x + tierW + Math.round(tierGap * 0.5), tierY + 158, x + 142, y + 304),
    createConnectorNode(x + 3 * (tierW + tierGap) + Math.round(tierW * 0.72), tierY + 158, x + Math.round(width * 0.52) + 24, y + 336),
    createTextNode("QA: Permission states, escalation triggers, and approval/block outcomes are explicit before export.", x + 20, y + 404, width - 40, 24, { fontSize: 12, fontWeight: 800, color: "#7c2d12", align: "start" })
  );
  return nodes;
}

function createBenchmarkDashboardNodes(template) {
  const x = 72;
  const y = 96;
  const width = 1098;
  const nodes = [
    createShapeNode("round-rect", "", x - 22, y - 52, width + 44, 552, "#ffffff", "#bfdbfe", "hero"),
    createTextNode("AI biosecurity benchmark review", x, y - 38, 520, 34, { fontSize: 24, fontWeight: 920, align: "start" }),
    createTextNode("Evidence, classifier behavior, and human-governance handoff in one editable figure.", x + 528, y - 34, width - 528, 30, { fontSize: 12.4, fontWeight: 650, color: "#64748b", align: "end" })
  ];
  [
    ["AUROC", "0.91", "#e0f2fe", "#0284c7"],
    ["High-risk recall", "0.84", "#dcfce7", "#16a34a"],
    ["Calibration ECE", "0.07", "#fef3c7", "#d97706"],
    ["Review load", "12%", "#fee2e2", "#dc2626"]
  ].forEach(([label, value, fill, stroke], index) => {
    const cardW = Math.round((width - 42) / 4);
    const cardX = x + index * (cardW + 14);
    nodes.push(createShapeNode("round-rect", "", cardX, y + 18, cardW, 48, fill, stroke, index >= 2 ? "floating" : "raised"));
    nodes.push(createTextNode(value, cardX + 16, y + 28, 78, 20, { fontSize: 18, fontWeight: 920, color: stroke, align: "start" }));
    nodes.push(createTextNode(label, cardX + 96, y + 31, cardW - 110, 18, { fontSize: 10.4, fontWeight: 780, color: "#334155", align: "end" }));
  });
  const mainY = y + 92;
  const mainH = 220;
  const bottomY = y + 336;
  const bottomH = 148;
  const gap = 24;
  const evidenceW = 330;
  const modelW = 360;
  const reviewW = width - evidenceW - modelW - gap * 2;
  const evidenceX = x;
  const modelX = evidenceX + evidenceW + gap;
  const reviewX = modelX + modelW + gap;
  const addPanel = (tag, label, px, py, pw, ph, fill = "#f8fafc", stroke = "#cbd5e1", tone = "#0f172a") => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, fill, stroke, tag === "C" ? "floating" : "raised"));
    nodes.push(createShapeNode("round-rect", "", px + 16, py + 14, 28, 22, "#ffffff", stroke, "surface"));
    nodes.push(createTextNode(tag, px + 16, py + 17, 28, 16, { fontSize: 12, fontWeight: 900, color: tone }));
    nodes.push(createTextNode(label, px + 52, py + 15, pw - 72, 20, { fontSize: 12.8, fontWeight: 820, color: tone, align: "start" }));
  };
  addPanel("A", "Evidence package", evidenceX, mainY, evidenceW, mainH, "#f8fafc", "#bae6fd", "#075985");
  addPanel("B", "Classifier behavior", modelX, mainY, modelW, mainH, "#f0f9ff", "#bfdbfe", "#1d4ed8");
  addPanel("C", "Risk review handoff", reviewX, mainY, reviewW, mainH, "#fff7ed", "#fed7aa", "#9a3412");
  addPanel("D", "Failure modes by severity", x, bottomY, Math.round(width * 0.61), bottomH, "#f8fafc", "#cbd5e1", "#334155");
  addPanel("E", "Decision packet before export", x + Math.round(width * 0.61) + gap, bottomY, width - Math.round(width * 0.61) - gap, bottomH, "#fffbeb", "#fcd34d", "#92400e");
  nodes.push(
    createConnectorNode(evidenceX + evidenceW + 6, mainY + 113, modelX - 8, mainY + 113),
    createConnectorNode(modelX + modelW + 6, mainY + 113, reviewX - 8, mainY + 113),
    createTemplateSymbol("benchmark", "Benchmark", evidenceX + 28, mainY + 60, 126, 104, `${template.id}:benchmark`),
    createTemplateSymbol("dataset", "Eval set", evidenceX + 176, mainY + 62, 118, 100, `${template.id}:dataset`),
    createTextNode("Protocol QA, wetlab feasibility, and policy-context cases remain source linked.", evidenceX + 26, mainY + 166, evidenceW - 52, 38, { fontSize: 11.2, fontWeight: 680, color: "#475569", align: "start" }),
    createTemplateSymbol("bio-classifier", "Classifier", modelX + 26, mainY + 52, 138, 110, `${template.id}:classifier`),
    createTemplateSymbol("metric-card", "Metric card", modelX + 206, mainY + 56, 118, 96, `${template.id}:metric-card`),
    createPlotNode("line", "Calibration curve", demoCalibrationTable(), { x: "confidence", y: "observed", color: "split" }, modelX + 28, mainY + 144, modelW - 56, 62),
    createTemplateSymbol("risk-gate", "Risk gate", reviewX + 24, mainY + 54, 104, 94, `${template.id}:risk-gate`, "risk-warning"),
    createTemplateSymbol("error-analysis", "Failure map", reviewX + 138, mainY + 54, 104, 94, `${template.id}:error-analysis`),
    createTemplateSymbol("human-review", "Human review", reviewX + 252, mainY + 54, 108, 94, `${template.id}:human-review`, "risk-warning"),
    createTextNode("Route high-severity and ambiguous-intent cases to expert review; retain audit trail.", reviewX + 28, mainY + 158, reviewW - 56, 38, { fontSize: 11.2, fontWeight: 720, color: "#7c2d12", align: "start" }),
    createPlotNode("bar", "Failure modes", demoFailureModeTable(), { x: "mode", y: "count", color: "severity" }, x + 28, bottomY + 48, Math.round(width * 0.61) - 56, 84),
    createTemplateSymbol("audit-log", "Audit log", x + Math.round(width * 0.61) + gap + 28, bottomY + 46, 106, 86, `${template.id}:audit-log`),
    createTextNode("Export QA checks", x + Math.round(width * 0.61) + gap + 154, bottomY + 48, 230, 20, { fontSize: 12, fontWeight: 850, color: "#92400e", align: "start" }),
    createShapeNode("ellipse", "", x + Math.round(width * 0.61) + gap + 154, bottomY + 78, 10, 10, "#dcfce7", "#16a34a", "surface"),
    createTextNode("Source citations attached", x + Math.round(width * 0.61) + gap + 170, bottomY + 73, 240, 18, { fontSize: 10.8, fontWeight: 700, color: "#475569", align: "start" }),
    createShapeNode("ellipse", "", x + Math.round(width * 0.61) + gap + 154, bottomY + 98, 10, 10, "#dbeafe", "#2563eb", "surface"),
    createTextNode("PPTX fallbacks named", x + Math.round(width * 0.61) + gap + 170, bottomY + 93, 240, 18, { fontSize: 10.8, fontWeight: 700, color: "#475569", align: "start" }),
    createShapeNode("ellipse", "", x + Math.round(width * 0.61) + gap + 154, bottomY + 118, 10, 10, "#fee2e2", "#dc2626", "surface"),
    createTextNode("Unsupported claims resolved", x + Math.round(width * 0.61) + gap + 170, bottomY + 113, 240, 18, { fontSize: 10.8, fontWeight: 700, color: "#475569", align: "start" })
  );
  return nodes;
}

function createTemplateWorkflowStripNodes(template) {
  const assets = template.previewAssetIds?.length ? template.previewAssetIds.slice(0, 6) : workflowAssets(template.workflowPack);
  const x = 92;
  const y = 270;
  const width = 940;
  const gap = width / Math.max(3, assets.length);
  const nodes = [
    createShapeNode("round-rect", template.name, x - 26, y - 86, width + 72, 250, "#ffffff", template.layout === "pipeline" ? "#bfdbfe" : "#dbeafe", "hero"),
    createTextNode(template.name, x, y - 66, 620, 28, { fontSize: 21, fontWeight: 850, align: "start" }),
    createTextNode(template.description, x, y - 38, width - 20, 24, { fontSize: 12, fontWeight: 650, color: "#64748b", align: "start" })
  ];
  assets.forEach((assetId, index) => {
    const nodeX = x + index * gap;
    nodes.push(createSymbolNode(assetId, labelForAsset(assetId), nodeX, y, 150, 120));
    nodes.push(createTextNode(template.layout === "pipeline" ? "decision step" : "process step", nodeX + 8, y + 124, 132, 22, { fontSize: 11, fontWeight: 750, color: "#475569" }));
    if (index > 0) nodes.push(createConnectorNode(nodeX - gap + 154, y + 58, nodeX - 8, y + 58));
  });
  nodes.push(createTextNode(`QA: ${template.qaChecklist?.[0] ?? "Review layout, provenance, and export warnings."}`, x, y + 174, width - 12, 28, { fontSize: 12, fontWeight: 700, color: "#7c2d12", align: "start" }));
  return nodes;
}

function createTemplatePanelFigureNodes(template) {
  const assets = template.previewAssetIds?.length ? template.previewAssetIds.slice(0, 4) : workflowAssets(template.workflowPack).slice(0, 4);
  const x = 84;
  const y = 120;
  const width = 1048;
  const panelGap = 22;
  const panelW = Math.round((width - panelGap) / 2);
  const panelH = 178;
  const nodes = [
    createShapeNode("round-rect", template.name, x - 20, y - 48, width + 40, 464, "#ffffff", "#dbeafe", "hero"),
    createTextNode(template.name, x, y - 36, 560, 28, { fontSize: 22, fontWeight: 850, align: "start" }),
    createTextNode(template.description, x + 560, y - 34, width - 560, 26, { fontSize: 12, fontWeight: 650, color: "#64748b", align: "end" })
  ];
  assets.forEach((assetId, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const panelX = x + col * (panelW + panelGap);
    const panelY = y + row * (panelH + panelGap);
    const tag = String.fromCharCode(65 + index);
    nodes.push(createShapeNode("round-rect", "", panelX, panelY, panelW, panelH, "#f8fafc", "#cbd5e1", "raised"));
    nodes.push(createTextNode(tag, panelX + 14, panelY + 10, 24, 24, { fontSize: 18, fontWeight: 900 }));
    nodes.push(createTextNode(labelForAsset(assetId), panelX + 45, panelY + 11, panelW - 68, 24, { fontSize: 13, fontWeight: 800, color: "#334155", align: "start" }));
    nodes.push(createSymbolNode(assetId, labelForAsset(assetId), panelX + 32, panelY + 48, 150, 112));
    nodes.push(createTextNode(template.qaChecklist?.[index % template.qaChecklist.length] ?? "Review provenance before export.", panelX + 202, panelY + 58, panelW - 230, 66, { fontSize: 12, fontWeight: 650, color: "#475569", align: "start" }));
  });
  nodes.push(createTextNode(`Agent template: ${template.id}. Sources and claims remain editable; resolve QA items before PPTX/PDF export.`, x + 26, y + 372, width - 52, 28, { fontSize: 12, fontWeight: 750, color: "#7c2d12", align: "start" }));
  return nodes;
}

function createPublicationResultsPanelNodes(styleProfile = "consulting-2p5d") {
  const x = 74;
  const y = 110;
  const width = 1060;
  const gap = 24;
  const leftW = 382;
  const midW = 322;
  const rightW = width - leftW - midW - gap * 2;
  const lowerLeftW = 610;
  const lowerRightW = width - lowerLeftW - gap;
  const isPublicationLine = styleProfile === "publication-line";
  const isDarkTalk = styleProfile === "dark-talk";
  const theme = {
    outerFill: isDarkTalk ? "#020617" : "#ffffff",
    outerStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#334155" : "#dbeafe",
    panelFill: isDarkTalk ? "#0f172a" : "#f8fafc",
    panelStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#334155" : "#cbd5e1",
    plotFill: isDarkTalk ? "#111827" : "#ffffff",
    plotStroke: isPublicationLine ? "#111827" : isDarkTalk ? "#475569" : "#cbd5e1",
    heading: isDarkTalk ? "#f8fafc" : "#0f172a",
    muted: isDarkTalk ? "#94a3b8" : "#64748b",
    panelText: isDarkTalk ? "#cbd5e1" : "#334155",
    connector: isPublicationLine ? "#111827" : isDarkTalk ? "#94a3b8" : "#64748b",
    claimFill: isDarkTalk ? "#431407" : isPublicationLine ? "#ffffff" : "#fff7ed",
    claimStroke: isDarkTalk ? "#f97316" : isPublicationLine ? "#111827" : "#fed7aa",
    claimText: isDarkTalk ? "#fed7aa" : isPublicationLine ? "#111827" : "#7c2d12",
    reviewText: isDarkTalk ? "#fdba74" : isPublicationLine ? "#374151" : "#9a3412",
    depth: isPublicationLine ? "surface" : "raised",
    outerDepth: isPublicationLine ? "surface" : "hero"
  };
  const plotStyle = { fill: theme.plotFill, stroke: theme.plotStroke, color: theme.heading, depth: isPublicationLine ? "surface" : "raised" };
  const symbolAppearance = isPublicationLine
    ? { accent: "#111827", stroke: "#111827", secondary: "#f3f4f6", fill: "#ffffff", labelColor: theme.heading, strokeWidth: 1.6 }
    : isDarkTalk
      ? { accent: "#38bdf8", stroke: "#7dd3fc", secondary: "#1e293b", fill: "#0f172a", labelColor: theme.heading, strokeWidth: 2.2 }
      : {};
  const pubSymbol = (assetId, label, sx, sy, sw, sh) => {
    const node = createSymbolNode(assetId, label, sx, sy, sw, sh);
    node.payload.styleProfile = styleProfile;
    node.payload.appearance = { ...(node.payload.appearance ?? {}), ...symbolAppearance };
    node.style.color = theme.heading;
    node.style.stroke = symbolAppearance.stroke ?? node.style.stroke;
    node.style.strokeWidth = symbolAppearance.strokeWidth ?? node.style.strokeWidth;
    return node;
  };
  const nodes = [
    createShapeNode("round-rect", "", x - 20, y - 48, width + 40, 560, theme.outerFill, theme.outerStroke, theme.outerDepth),
    createTextNode("Publication-style results figure", x, y - 38, 520, 32, { fontSize: 22, fontWeight: 800, color: theme.heading, align: "start" }),
    createTextNode("Editable PlotSpec panels, source-linked evidence, and export QA.", x + 540, y - 34, 500, 28, { fontSize: 13, fontWeight: 650, color: theme.muted, align: "end" })
  ];
  [
    ["A", "Experimental context", x, y, leftW, 210],
    ["B", "Differential response", x + leftW + gap, y, midW, 210],
    ["C", "Cell-state map", x + leftW + midW + gap * 2, y, rightW, 210],
    ["D", "Marker program summary", x, y + 246, lowerLeftW, 220],
    ["E", "Claim, evidence, and export QA", x + lowerLeftW + gap, y + 246, lowerRightW, 220]
  ].forEach(([tag, label, px, py, pw, ph]) => {
    nodes.push(createShapeNode("round-rect", "", px, py, pw, ph, theme.panelFill, theme.panelStroke, theme.depth));
    nodes.push(createTextNode(tag, px + 14, py + 10, 24, 24, { fontSize: 18, fontWeight: 900, color: theme.heading }));
    nodes.push(createTextNode(label, px + 45, py + 11, pw - 68, 24, { fontSize: 13, fontWeight: 800, color: theme.panelText, align: "start" }));
  });
  nodes.push(
    pubSymbol("cell-tumor", "Tumor cells", x + 22, y + 58, 108, 90),
    pubSymbol("cell-immune", "Immune cells", x + 142, y + 58, 108, 90),
    pubSymbol("sequencer", "Sequencing", x + 260, y + 58, 108, 90),
    createTextNode("+", x + 128, y + 96, 16, 20, { fontSize: 16, fontWeight: 900, color: theme.muted }),
    createTextNode("co-profiled sample", x + 80, y + 166, 210, 18, { fontSize: 10.4, fontWeight: 760, color: theme.muted }),
    createConnectorNode(x + 250, y + 108, x + 260, y + 108, { stroke: theme.connector, strokeWidth: 2 }),
    createConnectorNode(x + 368, y + 108, x + leftW + gap + 26, y + 118, { stroke: theme.connector, strokeWidth: 2.2 }),
    createPlotNode("volcano", "Hit genes", demoVolcanoTable(), { x: "log2FC", y: "pValue", color: "cellState", label: "gene" }, x + leftW + gap + 26, y + 48, midW - 52, 142, plotStyle),
    createPlotNode("embedding-scatter", "Cell states", demoEmbeddingTable(), { x: "umap1", y: "umap2", color: "cluster", label: "cell" }, x + leftW + midW + gap * 2 + 24, y + 48, rightW - 48, 142, plotStyle),
    createPlotNode("heatmap", "Marker programs", demoHeatmapTable(), { x: "cluster", y: "gene", value: "scaledExpression" }, x + 28, y + 300, lowerLeftW - 56, 144, plotStyle),
    pubSymbol("metric-card", "Effect size", x + lowerLeftW + gap + 36, y + 292, 132, 104),
    pubSymbol("gene-locus", "STAT1 locus", x + lowerLeftW + gap + 196, y + 292, 132, 104),
    createShapeNode("round-rect", "", x + lowerLeftW + gap + 30, y + 410, lowerRightW - 60, 66, theme.claimFill, theme.claimStroke, "surface"),
    createTextNode("Claim: IFN-high program shift; verify table, citation, and threshold before export.", x + lowerLeftW + gap + 48, y + 422, lowerRightW - 96, 34, { fontSize: 12.4, fontWeight: 760, color: theme.claimText, align: "start" }),
    createTextNode("Source table + PPTX fallback review required", x + lowerLeftW + gap + 48, y + 454, lowerRightW - 96, 16, { fontSize: 9.6, fontWeight: 800, color: theme.reviewText, align: "start" })
  );
  return nodes;
}

function createGenericWorkflowFigureNodes(pack) {
  const assets = workflowAssets(pack);
  const x = 96;
  const y = 280;
  const gap = 218;
  const nodes = [
    createShapeNode("round-rect", workflowLabel(pack), x - 28, y - 86, 980, 238, "#ffffff", "#dbeafe", "hero")
  ];
  assets.forEach((assetId, index) => {
    const nodeX = x + index * gap;
    nodes.push(createSymbolNode(assetId, labelForAsset(assetId), nodeX, y, 150, 120));
    if (index > 0) nodes.push(createConnectorNode(nodeX - gap + 154, y + 58, nodeX - 8, y + 58));
  });
  return nodes;
}

function createPlotNode(plotType, title, table, encodings, x, y, width, height, plotStyle = {}) {
  const spec = { id: id("plot"), plotType, title, table, encodings, style: plotStyle };
  return {
    id: id("node"),
    kind: "plot",
    name: title,
    transform: transform(x, y, width, height),
    style: { fill: plotStyle.fill ?? "#ffffff", stroke: plotStyle.stroke ?? "#cbd5e1", strokeWidth: 1, depth: plotStyle.depth ?? "raised" },
    payload: { spec },
    provenance: table.source,
    claimStatus: "needs-citation"
  };
}

function demoVolcanoTable() {
  return {
    id: id("table"),
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
    source: manualProvenance("Synthetic publication-results demo data")
  };
}

function demoEmbeddingTable() {
  return {
    id: id("table"),
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
    source: manualProvenance("Synthetic embedding demo data")
  };
}

function demoHeatmapTable() {
  return {
    id: id("table"),
    name: "Demo marker heatmap",
    columns: ["gene", "cluster", "scaledExpression"],
    rows: [
      { gene: "STAT1", cluster: "IFN", scaledExpression: 2.2 },
      { gene: "STAT1", cluster: "Tumor", scaledExpression: 0.7 },
      { gene: "CXCL10", cluster: "IFN", scaledExpression: 2.5 },
      { gene: "CXCL10", cluster: "Myeloid", scaledExpression: 1.2 },
      { gene: "MKI67", cluster: "Cycling", scaledExpression: 2.0 },
      { gene: "GZMB", cluster: "Cyto", scaledExpression: 2.3 },
      { gene: "IL7R", cluster: "Memory", scaledExpression: 1.8 },
      { gene: "CCR7", cluster: "Naive", scaledExpression: 1.7 }
    ],
    source: manualProvenance("Synthetic marker heatmap demo data")
  };
}

function demoSpatialHeatmapTable() {
  return {
    id: id("table"),
    name: "Demo spatial expression table",
    columns: ["gene", "region", "expression"],
    rows: [
      { gene: "CXCL10", region: "immune edge", expression: 2.6 },
      { gene: "CXCL10", region: "tumor core", expression: 0.8 },
      { gene: "CXCL10", region: "stroma", expression: 0.5 },
      { gene: "CXCL10", region: "vessel", expression: 0.7 },
      { gene: "COL1A1", region: "immune edge", expression: 0.6 },
      { gene: "COL1A1", region: "tumor core", expression: 0.9 },
      { gene: "COL1A1", region: "stroma", expression: 2.1 },
      { gene: "COL1A1", region: "vessel", expression: 0.8 },
      { gene: "EPCAM", region: "immune edge", expression: 0.4 },
      { gene: "EPCAM", region: "tumor core", expression: 2.4 },
      { gene: "EPCAM", region: "stroma", expression: 0.7 },
      { gene: "EPCAM", region: "vessel", expression: 0.6 },
      { gene: "PTPRC", region: "immune edge", expression: 2.2 },
      { gene: "PTPRC", region: "tumor core", expression: 0.5 },
      { gene: "PTPRC", region: "stroma", expression: 0.8 },
      { gene: "PTPRC", region: "vessel", expression: 0.4 },
      { gene: "MKI67", region: "immune edge", expression: 0.9 },
      { gene: "MKI67", region: "tumor core", expression: 1.8 },
      { gene: "MKI67", region: "stroma", expression: 1.1 },
      { gene: "MKI67", region: "vessel", expression: 0.6 },
      { gene: "PECAM1", region: "immune edge", expression: 0.5 },
      { gene: "PECAM1", region: "tumor core", expression: 0.6 },
      { gene: "PECAM1", region: "stroma", expression: 0.9 },
      { gene: "PECAM1", region: "vessel", expression: 1.7 }
    ],
    source: manualProvenance("Synthetic spatial transcriptomics demo data")
  };
}

function demoRiskMetricTable() {
  return {
    id: id("table"),
    name: "Demo AI biosecurity risk metrics",
    columns: ["class", "score", "threshold", "split"],
    rows: [
      { class: "benign protocol", score: 0.12, threshold: 0.5, split: "test" },
      { class: "dual-use ambiguity", score: 0.61, threshold: 0.5, split: "test" },
      { class: "wetlab feasibility", score: 0.74, threshold: 0.5, split: "test" },
      { class: "DURC flag", score: 0.86, threshold: 0.5, split: "test" }
    ],
    source: manualProvenance("Synthetic AI biosecurity evaluation demo data")
  };
}

function demoWetlabQcTable() {
  return {
    id: id("table"),
    name: "Demo wetlab protocol QC table",
    columns: ["step", "score", "class"],
    rows: [
      { step: "Sample", score: 0.92, class: "pass" },
      { step: "Plate", score: 0.86, class: "pass" },
      { step: "Image", score: 0.78, class: "review" },
      { step: "Sequence", score: 0.83, class: "pass" },
      { step: "BSC", score: 0.7, class: "review" }
    ],
    source: manualProvenance("Synthetic wetlab protocol QC demo data")
  };
}

function demoCellularMarkerTable() {
  return {
    id: id("table"),
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
    source: manualProvenance("Synthetic cellular marker demo data")
  };
}

function demoSpaceOmicsTable() {
  return {
    id: id("table"),
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
    source: manualProvenance("Synthetic space omics response demo data")
  };
}

function demoCalibrationTable() {
  return {
    id: id("table"),
    name: "Demo calibration table",
    columns: ["bin", "confidence", "observed", "split"],
    rows: [
      { bin: "0.1", confidence: 0.12, observed: 0.09, split: "eval" },
      { bin: "0.3", confidence: 0.31, observed: 0.27, split: "eval" },
      { bin: "0.5", confidence: 0.52, observed: 0.48, split: "eval" },
      { bin: "0.7", confidence: 0.71, observed: 0.76, split: "eval" },
      { bin: "0.9", confidence: 0.89, observed: 0.92, split: "eval" }
    ],
    source: manualProvenance("Synthetic calibration demo data")
  };
}

function demoFailureModeTable() {
  return {
    id: id("table"),
    name: "Demo benchmark failure modes",
    columns: ["mode", "count", "severity"],
    rows: [
      { mode: "ambiguous intent", count: 18, severity: "medium" },
      { mode: "missing context", count: 12, severity: "low" },
      { mode: "wetlab feasibility", count: 9, severity: "high" },
      { mode: "policy conflict", count: 6, severity: "high" }
    ],
    source: manualProvenance("Synthetic benchmark failure-mode demo data")
  };
}

function workflowAssets(pack) {
  const packs = {
    "perturb-seq-crispr": ["cell-t", "crispr-cas9", "scrna-droplet", "sequencer"],
    "ai-biosecurity-eval": ["dataset", "bio-classifier", "risk-gate", "human-review"],
    "spatial-transcriptomics": ["tissue-section", "spatial-grid", "segmentation-mask", "neighborhood-graph"],
    "agentic-ai-mcp-rag": ["prompt", "retrieval", "mcp-server", "agent-loop"],
    "single-cell-multiomics": ["scrna-droplet", "cell-barcode", "expression-matrix", "embedding-space"],
    "publication-results-panels": ["expression-matrix", "embedding-space", "metric-card", "gene-locus"],
    "space-biology-genelab": ["microgravity", "astronaut-sample", "sequencer", "dataset"],
    "realistic-spatial-microscopy": ["realistic-he-tissue-section", "realistic-segmentation-overlay", "realistic-spatial-map", "neighborhood-graph"],
    "realistic-wetlab-context": ["realistic-pipette-bench", "realistic-plate-96-photo", "realistic-microscope-bench", "sequencer"],
    "realistic-cellular-textures": ["realistic-cell-cluster", "realistic-tumor-microenvironment", "realistic-immune-infiltrate", "cell-t"],
    "realistic-space-biology": ["realistic-spacecraft-context", "realistic-astronaut-sample", "realistic-spaceflight-assay", "dataset"]
  };
  return packs[pack] ?? packs["perturb-seq-crispr"];
}

function workflowLabel(pack) {
  return {
    "perturb-seq-crispr": "Perturb-seq / CRISPR workflow",
    "ai-biosecurity-eval": "AI biosecurity evaluation workflow",
    "spatial-transcriptomics": "Spatial transcriptomics workflow",
    "agentic-ai-mcp-rag": "Agentic AI / MCP workflow",
    "single-cell-multiomics": "Single-cell multiomics workflow",
    "publication-results-panels": "Publication results panel workflow",
    "space-biology-genelab": "Space biology / GeneLab workflow",
    "realistic-spatial-microscopy": "Realistic spatial microscopy workflow",
    "realistic-wetlab-context": "Realistic wetlab context workflow",
    "realistic-cellular-textures": "Realistic cellular texture workflow",
    "realistic-space-biology": "Realistic space biology workflow"
  }[pack] ?? "Scientific workflow";
}

function labelForAsset(assetId) {
  return findAsset(assetId)?.name ?? assetId.replace(/-/g, " ");
}

function uploadImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    checkpoint();
    const asset = { id: id("asset"), name: file.name, kind: "image", category: "Uploads", tags: ["upload"], dataUri: String(reader.result), provenance: { kind: "upload", source: "User upload", license: "private/unverified", editState: "original" } };
    project.assets.push(asset);
    currentPage().nodes.push({
      id: id("node"),
      kind: "image",
      name: file.name,
      transform: transform(120, 180, 320, 220, currentPage().nodes.length + 1),
      style: { depth: "floating" },
      payload: { assetId: asset.id, src: asset.dataUri, alt: file.name },
      provenance: asset.provenance,
      claimStatus: "needs-citation"
    });
    renderAll();
  };
  reader.readAsDataURL(file);
}

function createTextNode(text, x, y, width, height, style = {}) {
  return {
    id: id("node"),
    kind: "text",
    name: text.slice(0, 48) || "Text",
    transform: transform(x, y, width, height),
    style: { color: "#0f172a", fontFamily: "Inter, Arial, sans-serif", fontSize: 24, fontWeight: 600, ...style },
    payload: { text, align: style.align ?? "middle" },
    provenance: manualProvenance("User or agent-authored text"),
    claimStatus: "needs-citation"
  };
}

function createShapeNode(shape, label, x, y, width, height, fill, stroke, depth = "raised") {
  return {
    id: id("node"),
    kind: "shape",
    name: label,
    transform: transform(x, y, width, height),
    style: { fill, stroke, strokeWidth: 3, color: "#0f172a", fontSize: 20, depth },
    payload: { shape, label },
    provenance: manualProvenance("Template or user-authored shape"),
    claimStatus: "draft-visual"
  };
}

function createSymbolNode(assetId, label, x, y, width, height, provenance) {
  const asset = curatedAssets.find((candidate) => candidate.id === assetId);
  return {
    id: id("node"),
    kind: "symbol",
    name: label,
    transform: transform(x, y, width, height),
    style: { fill: "transparent", stroke: asset?.renderSpec?.accent ?? "#2563eb", strokeWidth: 2, color: "#0f172a", fontSize: 13, depth: "floating" },
    payload: { assetId, label, styleProfile: currentAssetStyleProfile(), semanticRole: asset?.semanticSlots?.[0], layoutHint: asset?.workflowPacks?.[0] },
    provenance: provenance ?? asset?.provenance ?? manualProvenance("Curated symbol"),
    claimStatus: "draft-visual"
  };
}

function createRealisticImageNode(asset, x, y, width, height) {
  return {
    id: id("node"),
    kind: "image",
    name: asset.name,
    transform: transform(x, y, width, height),
    style: { depth: "floating", stroke: "#dbe4f0", strokeWidth: 1.2 },
    payload: {
      assetId: asset.id,
      src: asset.dataUri ?? "",
      alt: asset.name,
      styleProfile: "scientific-editorial-realism",
      mask: { shape: "round-rect" },
      captionAnchor: "bottom"
    },
    provenance: asset.provenance ?? manualProvenance("Realistic editorial image asset"),
    claimStatus: "needs-citation"
  };
}

function createConnectorNode(x1, y1, x2, y2, style = {}) {
  return {
    id: id("node"),
    kind: "connector",
    name: "Connector",
    transform: transform(Math.min(x1, x2), Math.min(y1, y2), Math.max(1, Math.abs(x2 - x1)), Math.max(1, Math.abs(y2 - y1))),
    style: { stroke: "#334155", strokeWidth: 3, arrowEnd: true, ...style },
    payload: { points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], label: "" },
    provenance: manualProvenance("User or agent-authored connector"),
    claimStatus: "draft-visual"
  };
}

function onNodePointerDown(event) {
  const node = currentPage().nodes.find((candidate) => candidate.id === event.currentTarget.dataset.nodeId);
  if (!node) return;
  selectedId = node.id;
  const point = clientToSvg(event);
  dragState = { nodeId: node.id, startX: point.x, startY: point.y, originalX: node.transform.x, originalY: node.transform.y, didCheckpoint: false };
  event.currentTarget.setPointerCapture(event.pointerId);
  event.currentTarget.addEventListener("pointermove", onNodePointerMove);
  event.currentTarget.addEventListener("pointerup", onNodePointerUp, { once: true });
  canvas.querySelectorAll(".node").forEach((candidate) => candidate.classList.toggle("selected", candidate === event.currentTarget));
  renderInspector();
}

function onNodePointerMove(event) {
  if (!dragState) return;
  if (!dragState.didCheckpoint) {
    checkpoint();
    dragState.didCheckpoint = true;
  }
  const node = currentPage().nodes.find((candidate) => candidate.id === dragState.nodeId);
  if (!node) return;
  const point = clientToSvg(event);
  const nextX = Math.round((dragState.originalX + point.x - dragState.startX) / 6) * 6;
  const nextY = Math.round((dragState.originalY + point.y - dragState.startY) / 6) * 6;
  const dx = nextX - node.transform.x;
  const dy = nextY - node.transform.y;
  node.transform.x = nextX;
  node.transform.y = nextY;
  if (node.kind === "connector") {
    node.payload.points = node.payload.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  event.currentTarget.setAttribute("transform", `translate(${node.transform.x} ${node.transform.y}) rotate(${node.transform.rotation} ${node.transform.width / 2} ${node.transform.height / 2})`);
}

function onNodePointerUp(event) {
  event.currentTarget.removeEventListener("pointermove", onNodePointerMove);
  dragState = null;
  renderAll();
}

function renderDeckSvg() {
  const gap = 80;
  const width = Math.max(...project.pages.map((page) => page.width));
  const height = project.pages.reduce((sum, page) => sum + page.height, 0) + gap * Math.max(0, project.pages.length - 1);
  const pages = project.pages.map((page, index) => {
    const y = project.pages.slice(0, index).reduce((sum, previous) => sum + previous.height + gap, 0);
    return `<g transform="translate(0 ${y})"><text x="20" y="30" font-family="Arial" font-size="18" font-weight="700" fill="#475569">${index + 1}. ${escapeXml(page.name)}</text><g transform="translate(0 44) scale(0.94)">${renderSvgInner(page)}</g></g>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${pages}</svg>`;
}

async function exportPng() {
  const page = currentPage();
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">${renderSvgInner(page)}</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const output = document.createElement("canvas");
    output.width = page.width * 2;
    output.height = page.height * 2;
    const context = output.getContext("2d");
    context.scale(2, 2);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    output.toBlob((pngBlob) => pngBlob && downloadBlob(`${slug(page.name)}.png`, pngBlob), "image/png");
  };
  image.src = url;
}

function currentPage() {
  return project.pages.find((page) => page.id === activePageId) ?? project.pages[0];
}

function currentSlideMeta() {
  const page = currentPage();
  return page ? project.deck.slideMeta[page.id] : undefined;
}

function openReviewItems() {
  return project.deck.reviewItems.filter((item) => item.status === "open");
}

function parseDelimited(input, delimiter = "\t", name = "Imported table") {
  const lines = input.trim().split(/\r?\n/);
  const columns = lines[0].split(delimiter).map((column) => column.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(delimiter);
    const row = {};
    columns.forEach((column, index) => {
      const value = cells[index]?.trim() ?? "";
      const numeric = Number(value);
      row[column] = Number.isFinite(numeric) && /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(value) ? numeric : value;
    });
    return row;
  });
  return { id: id("table"), name, columns, rows, source: manualProvenance("Imported TSV data") };
}

function extractSnippets(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headings = lines.filter((line) => /^#{1,4}\s+/.test(line)).map((line) => line.replace(/^#{1,4}\s+/, ""));
  const candidates = headings.length ? headings : lines.filter((line) => line.length > 40);
  return candidates.slice(0, 12).map((line, index) => ({ id: id("snippet"), text: line.slice(0, 360), locator: headings.length ? "heading" : `paragraph-${index + 1}` }));
}

function inferTitle(text, fallback) {
  return text.split(/\r?\n/).map((line) => line.replace(/^#+\s*/, "").trim()).find((line) => line.length > 8 && line.length < 90) ?? fallback;
}

function inferSlideTitles(title, signal, count) {
  const headings = signal.split(/\r?\n/).map((line) => line.replace(/^#+\s*/, "").trim()).filter((line) => line.length > 8 && line.length < 72);
  const defaults = [title, "Why this problem matters", "Scientific and technical context", "Experimental or computational approach", "Core workflow", "Key evidence", "Interpretation and risks", "Take-home message"];
  return [...new Set([title, ...headings, ...defaults])].slice(0, count);
}

function inferNarrative(title, signal) {
  return signal.split(/(?<=[.!?])\s+/).find((sentence) => sentence.toLowerCase().includes(title.toLowerCase().split(/\s+/)[0] ?? ""))?.slice(0, 180) ?? `Use this slide to explain ${title.toLowerCase()} with clear scientific provenance.`;
}

function createEphemeralSource() {
  const text = sourceText.value.trim() || defaultNotes;
  return { id: id("source"), kind: "markdown", name: "Draft notes", text, snippets: extractSnippets(text), provenance: manualProvenance("Ephemeral source"), createdAt: new Date().toISOString() };
}

function chooseAsset(brief) {
  const text = `${brief.title} ${brief.narrative}`.toLowerCase();
  if (text.includes("ai") || text.includes("model")) return "model-block";
  if (text.includes("risk") || text.includes("safety")) return "risk-gate";
  if (text.includes("dna") || text.includes("crispr")) return "crispr-cas9";
  return "cell-immune";
}

function addAgentRun(name, prompt, operations, inputSourceIds = [], traceInput = {}) {
  const timestamp = new Date().toISOString();
  project.deck.agentRuns.push({
    id: id("agent"),
    name,
    prompt,
    provider: "browser-local",
    model: "scientific-image-agent-v0",
    inputSourceIds,
    operations,
    status: "completed",
    startedAt: timestamp,
    completedAt: timestamp,
    trace: createBrowserAgentTrace(name, operations, traceInput)
  });
}

function createBrowserAgentTrace(name, operations, input = {}) {
  const nodes = nodesFromOperations(operations);
  const assetIds = uniqueStrings(nodes.map((node) => node.payload?.assetId).filter(Boolean));
  const generatedNodeIds = uniqueStrings([
    ...operations.filter((operation) => operation.op === "add-node").map((operation) => operation.nodeId).filter(Boolean),
    ...nodes.map((node) => node.id).filter(Boolean)
  ]);
  const workflowPack = input.workflowPack ?? firstString(nodes.map((node) => node.payload?.workflowPack));
  const templateId = input.templateId ?? firstString(nodes.map((node) => node.payload?.templateId));
  const styleProfile = input.styleProfile ?? firstString(nodes.map((node) => node.payload?.styleProfile));
  return {
    workflowPack,
    templateId,
    styleProfile,
    resourceUris: uniqueStrings(input.resourceUris ?? defaultAgentResourceUris()),
    toolSequence: uniqueStrings(input.toolSequence ?? inferredToolSequence(name)),
    compactIndex: assetIds.length ? {
      filters: { workflowPack, templateId, styleProfile },
      returnedAssets: assetIds.length,
      assetIds
    } : undefined,
    recommendation: assetIds.length ? {
      tool: "recommend_asset_set",
      responseShape: "compact",
      assetIds,
      insertPlanCount: nodes.length
    } : undefined,
    insertPlan: nodes
      .map((node) => ({
        tool: node.kind === "image" ? "insert_realistic_asset" : "insert_premium_asset",
        assetId: node.payload?.assetId,
        semanticRole: node.payload?.semanticRole,
        layoutHint: node.payload?.layoutHint,
        styleProfile: node.payload?.styleProfile ?? styleProfile,
        nodeId: node.id
      }))
      .filter((item) => item.assetId),
    generatedNodeIds,
    references: input.references ?? browserAgentTraceReferences(name, operations, { workflowPack, templateId, assetIds, generatedNodeIds })
  };
}

function defaultAgentResourceUris() {
  return [
    "scientific-image://agent/manifest",
    "scientific-image://agent/asset-index-compact",
    "scientific-image://agent/agent-cookbook"
  ];
}

function inferredToolSequence(name) {
  if (/import source/i.test(name)) return ["import_source"];
  if (/outline/i.test(name)) return ["import_source", "create_deck_outline"];
  if (/generate deck/i.test(name)) return ["create_deck_outline", "approve_deck_outline", "generate_deck_from_outline", "validate_deck"];
  if (/flagship/i.test(name)) return ["get_workflow_pack_gallery", "create_flagship_workflow_demo", "validate_deck", "export_pack_qa_report"];
  if (/workflow figure|insert workflow/i.test(name)) return ["get_asset_index", "get_workflow_pack_gallery", "get_workflow_template_qa", "create_workflow_figure", "validate_deck", "export_pack_qa_report"];
  return ["apply_scene_operations", "validate_deck"];
}

function browserAgentTraceReferences(name, operations, context) {
  const sourceRefs = operations
    .filter((operation) => operation.op === "add-source" && operation.payload?.source)
    .map((operation) => ({
      kind: "resource",
      id: operation.payload.source.id,
      label: operation.payload.source.name,
      summary: operation.payload.source.provenance?.source
    }));
  if (sourceRefs.length) return sourceRefs;
  if (context.templateId || context.workflowPack || context.assetIds.length) {
    return [{
      kind: context.templateId || /workflow|flagship/i.test(name) ? "template" : "insert-plan",
      id: context.templateId ?? context.workflowPack ?? name,
      tool: inferredToolSequence(name).at(-3) ?? inferredToolSequence(name).at(-1),
      workflowPack: context.workflowPack,
      templateId: context.templateId,
      assetIds: context.assetIds,
      nodeIds: context.generatedNodeIds,
      summary: "Browser-local deterministic scene operation with trace-aware asset/template metadata."
    }];
  }
  return [{
    kind: "tool",
    id: slug(name),
    tool: inferredToolSequence(name).at(-1),
    summary: "Browser-local deterministic scene operation."
  }];
}

function nodesFromOperations(operations) {
  return operations.flatMap((operation) => {
    if (operation.payload?.node) return [operation.payload.node];
    if (operation.payload?.page?.nodes) return operation.payload.page.nodes;
    return [];
  });
}

function firstString(values) {
  return values.find((value) => typeof value === "string" && value.trim().length);
}

function transform(x, y, width, height, z = 0) {
  return { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1, z };
}

function manualProvenance(source) {
  return { kind: "manual", source, license: "private/unverified", editState: "modified" };
}

function scale(values, outMin, outMax) {
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = Math.max(max - min, 1e-9);
  return (value) => outMin + ((value - min) / span) * (outMax - outMin);
}

function shortPlotLabel(value, maxLength) {
  return String(value).length <= maxLength ? String(value) : `${String(value).slice(0, Math.max(1, maxLength - 1))}...`;
}

function fmtCompactNumber(value) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 100 || (Math.abs(value) > 0 && Math.abs(value) < 0.1)) return value.toExponential(1);
  return Number(value.toFixed(2)).toString();
}

function uniqueNumbers(values) {
  return [...new Set(values.filter((value) => Number.isFinite(value)).map((value) => Number(value.toFixed(6))))];
}

function plotTheme(spec = {}) {
  const fill = spec.style?.fill ?? "#ffffff";
  const stroke = spec.style?.stroke ?? "#cbd5e1";
  const color = spec.style?.color ?? "#0f172a";
  const dark = isDarkColor(fill);
  const publication = !dark && /^#(?:0{6}|1[0-9a-f]{5}|111827|000000)$/i.test(stroke);
  if (dark) {
    return {
      mode: "dark",
      frameFill: fill,
      frameStroke: stroke,
      headerFill: "#0f172a",
      fieldFill: "#111827",
      grid: "#334155",
      axis: "#94a3b8",
      text: color,
      label: "#cbd5e1",
      muted: "#94a3b8",
      pointStroke: "#0f172a",
      color: darkPalette,
      heat: heatColorDark
    };
  }
  if (publication) {
    return {
      mode: "publication",
      frameFill: "#ffffff",
      frameStroke: "#111827",
      headerFill: "#ffffff",
      fieldFill: "#ffffff",
      grid: "#d1d5db",
      axis: "#111827",
      text: "#111827",
      label: "#374151",
      muted: "#4b5563",
      pointStroke: "#ffffff",
      color: publicationPalette,
      heat: heatColorPublication
    };
  }
  return {
    mode: "consulting",
    frameFill: fill,
    frameStroke: stroke,
    headerFill: "#f8fafc",
    fieldFill: "#f8fafc",
    grid: "#e2e8f0",
    axis: "#475569",
    text: color,
    label: "#475569",
    muted: "#64748b",
    pointStroke: "#ffffff",
    color: palette,
    heat: heatColor
  };
}

function palette(group) {
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#0891b2"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function publicationPalette(group) {
  const colors = ["#111827", "#374151", "#6b7280", "#9ca3af", "#4b5563", "#1f2937"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function darkPalette(group) {
  const colors = ["#38bdf8", "#34d399", "#f87171", "#c084fc", "#fbbf24", "#22d3ee"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function heatColorPublication(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / Math.max(max - min, 1e-9)));
  const stops = ["#ffffff", "#d1d5db", "#6b7280", "#111827"];
  return interpolateHex(stops, t);
}

function heatColorDark(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / Math.max(max - min, 1e-9)));
  const stops = ["#0f172a", "#1e3a8a", "#06b6d4", "#fde68a"];
  return interpolateHex(stops, t);
}

function interpolateHex(stops, t) {
  const scaled = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const a = hexToRgb(stops[index]);
  const b = hexToRgb(stops[index + 1]);
  const rgb = a.map((channel, channelIndex) => Math.round(channel + (b[channelIndex] - channel) * local));
  return `rgb(${rgb.join(",")})`;
}

function hexToRgb(color) {
  const hex = String(color).replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function isDarkColor(color) {
  const [r, g, b] = hexToRgb(colorInputValue(color, "#ffffff"));
  return (r * 299 + g * 587 + b * 114) / 1000 < 96;
}

function clientToSvg(event) {
  const rect = canvas.getBoundingClientRect();
  const page = currentPage();
  return { x: ((event.clientX - rect.left) / rect.width) * page.width, y: ((event.clientY - rect.top) / rect.height) * page.height };
}

function checkpoint() {
  undoStack.push(JSON.stringify(project));
  redoStack.length = 0;
}

function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  redoStack.push(JSON.stringify(project));
  project = migrateProject(JSON.parse(previous));
  activePageId = project.pages[0]?.id;
  selectedId = null;
  renderAll();
}

function redo() {
  const next = redoStack.pop();
  if (!next) return;
  undoStack.push(JSON.stringify(project));
  project = migrateProject(JSON.parse(next));
  activePageId = project.pages[0]?.id;
  selectedId = null;
  renderAll();
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.kind}:${item.pageId ?? ""}:${item.nodeId ?? ""}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function download(filename, mime, text) {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

function downloadBlob(filename, blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function escapeXml(value) {
  return String(value ?? "").replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
}

function escapeAttr(value) {
  return escapeXml(value).replace(/"/g, "&quot;");
}

function colorInputValue(value, fallback) {
  const color = String(value ?? fallback ?? "#2563eb").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) return `#${color.slice(1).split("").map((char) => char + char).join("")}`;
  return fallback;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function fmt(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return String(Math.round(number * 1000) / 1000);
}

function slug(value) {
  return String(value ?? "scientific-image").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scientific-image";
}
