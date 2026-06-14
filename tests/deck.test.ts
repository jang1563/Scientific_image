import test from "node:test";
import assert from "node:assert/strict";
import { addNode, createProject, isEvidenceReviewNode, isStructuralReviewTextNode, migrateProject } from "../packages/scene/src/index.ts";
import {
  approveDeckOutline,
  applyWorkflowFigureSlideMeta,
  createDeckOutline,
  generateDeckFromOutline,
  generateReviewItems,
  importSource,
  resolveDeckReviewItem,
  resolveDeckReviewItems,
  refreshDeckReviewItems,
  summarizeAgentTrace,
  summarizeReviewQueue,
  validateDeck
} from "../packages/deck/src/index.ts";
import { exportProject } from "../packages/export/src/index.ts";
import { createCuratedSymbolNode, createWorkflowFigureNodes } from "../packages/assets/src/index.ts";

const markdown = `# Biosecurity AI Evaluation Platform

## Motivation
Biology-capable AI systems need calibrated permissioning, provenance-aware outputs, and expert review.

## Approach
We combine benchmark prompts, risk classifiers, human review, and structured visual reporting.

## Evidence
Evaluation pipelines should expose model behavior, uncertainty, and failure modes across biological domains.

## Implications
The platform should support safe scientific communication without hiding important technical detail.`;

test("migrates 0.1 projects into deck-aware 0.2 projects", () => {
  const oldProject = {
    schemaVersion: "0.1.0",
    id: "project_old",
    title: "Old fixture",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    pages: [
      {
        id: "page_old",
        kind: "slide",
        name: "Legacy slide",
        width: 1280,
        height: 720,
        unit: "px",
        background: "#ffffff",
        nodes: []
      }
    ],
    assets: [],
    theme: {
      id: "theme",
      name: "Theme",
      background: "#ffffff",
      palette: ["#000000"],
      fontFamily: "Arial"
    },
    citations: []
  };

  const migrated = migrateProject(oldProject);
  assert.equal(migrated.schemaVersion, "0.2.0");
  assert.ok(migrated.deck.slideMeta.page_old);
  assert.deepEqual(migrated.deck.sources, []);
});

test("creates outline-first deck and exports multi-slide PPTX/PDF", () => {
  let project = createProject("Bio AI deck");
  const imported = importSource(project, {
    kind: "markdown",
    name: "Research notes.md",
    text: markdown,
    citation: "Internal research notes"
  });
  project = imported.project;

  const outlined = createDeckOutline(project, {
    title: "Biosecurity AI Evaluation Platform",
    audience: "lab meeting",
    goal: "Explain the platform concept and evidence flow.",
    slideCount: 6
  });
  assert.ok(outlined.agentRun.trace?.toolSequence.includes("create_deck_outline"));
  assert.ok(outlined.agentRun.trace?.resourceUris.includes("scientific-image://agent/agent-cookbook"));
  project = approveDeckOutline(outlined.project);
  const generated = generateDeckFromOutline(project);
  project = generated.project;

  assert.equal(project.pages.length, 6);
  assert.equal(project.deck.outline?.status, "generated");
  assert.ok(project.deck.reviewItems.length > 0);
  assert.ok(project.deck.agentRuns.length >= 2);
  assert.ok(generated.agentRun.trace?.toolSequence.includes("generate_deck_from_outline"));
  assert.ok((generated.agentRun.trace?.generatedNodeIds.length ?? 0) > 0);

  const traceReport = summarizeAgentTrace(project);
  assert.equal(traceReport.schemaVersion, "0.1.0-agent-trace-report");
  assert.equal(traceReport.untracedRunCount, 0);
  assert.ok(traceReport.toolUsage.create_deck_outline >= 1);
  assert.ok(traceReport.toolUsage.generate_deck_from_outline >= 1);
  assert.ok(traceReport.resourceUris.includes("scientific-image://agent/agent-cookbook"));

  const validation = validateDeck(project);
  assert.equal(validation.ok, true);

  const pptx = exportProject(project, { format: "pptx" });
  const pdf = exportProject(project, { format: "pdf" });
  assert.equal(Buffer.from(pptx.data as Uint8Array).subarray(0, 2).toString(), "PK");
  assert.equal(Buffer.from(pdf.data as Uint8Array).subarray(0, 4).toString(), "%PDF");
});

test("resolves review queue items", () => {
  let project = createProject("Review fixture");
  project = createDeckOutline(project, { slideCount: 4 }).project;
  project = approveDeckOutline(project);
  project = generateDeckFromOutline(project).project;
  const first = project.deck.reviewItems[0];
  assert.ok(first);

  const resolved = resolveDeckReviewItem(project, first.id);
  assert.equal(resolved.deck.reviewItems.find((item) => item.id === first.id)?.status, "resolved");
});

test("summarizes review queue readiness and supports batch resolution", () => {
  let project = createProject("Review summary fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" });
  project = nodes.reduce((current, node) => addNode(current, node), project);
  project = refreshDeckReviewItems(project);

  const summary = summarizeReviewQueue(project);
  assert.equal(summary.okToExport, true);
  assert.equal(summary.deliveryReadiness, "needs-science-review");
  assert.ok(summary.claimReview.openCount > 0);
  assert.ok(summary.exportFallbacks.assetIds.includes("risk-gate"));
  assert.ok(summary.actionItems.some((item) => item.id === "confirm-or-cite-scientific-claims"));
  assert.ok(summary.actionItems.some((item) => item.id === "review-office-export-fallbacks" && item.recommendedStatus === "accepted-risk"));
  assert.ok(summary.humanDecisionQueue[0].reviewItemId);

  const claimAction = summary.actionItems.find((item) => item.id === "confirm-or-cite-scientific-claims");
  assert.ok(claimAction);
  const claimResolved = resolveDeckReviewItems(project, claimAction.reviewItemIds, "resolved");
  const afterClaims = summarizeReviewQueue(claimResolved);
  assert.equal(afterClaims.claimReview.openCount, 0);
  assert.equal(afterClaims.deliveryReadiness, "needs-export-review");
  assert.equal(claimResolved.pages.flatMap((page) => page.nodes).filter((node) => node.claimStatus === "needs-citation" && !isStructuralReviewTextNode(node) && !isEvidenceReviewNode(node)).length, 0);
  assert.equal(exportProject(claimResolved, { format: "pdf" }).warnings.some((warning) => warning.includes("need citation")), false);

  const exportAction = afterClaims.actionItems.find((item) => item.id === "review-office-export-fallbacks");
  assert.ok(exportAction);
  const exportAccepted = resolveDeckReviewItems(claimResolved, exportAction.reviewItemIds, "accepted-risk");
  const afterExport = summarizeReviewQueue(exportAccepted);
  assert.equal(afterExport.exportFallbacks.openCount, 0);
  assert.ok(afterExport.exportFallbacks.acceptedAssetIds.includes("risk-gate"));
  assert.ok(afterExport.exportFallbacks.acceptedCount > 0);
  assert.equal(afterExport.deliveryReadiness, "ready-with-notes");
});

test("workflow template export readiness appears in review queue", () => {
  let project = createProject("Workflow export review fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" });
  assert.ok(nodes.every((node) => (node.payload as Record<string, unknown>).templateId === "ai-biosecurity-pipeline"));
  project = nodes.reduce((current, node) => addNode(current, node), project);

  const reviewItems = generateReviewItems(project);
  const exportItem = reviewItems.find((item) => item.kind === "export" && item.message.includes("premium SVG fallback"));
  assert.ok(exportItem);
  assert.equal(exportItem.severity, "warning");
  assert.equal(exportItem.title, "Review PPTX fallback fidelity");
  assert.equal(exportItem.templateId, "ai-biosecurity-pipeline");
  assert.equal(exportItem.workflowPack, "ai-biosecurity-eval");
  assert.equal(exportItem.exportFormat, "pptx");
  assert.equal(exportItem.metrics?.premiumAssetFallbackCount, 9);
  assert.ok(exportItem.action?.includes("Before sending PPTX"));
  assert.ok(exportItem.fallbackAssets?.some((asset) => asset.assetId === "risk-gate" && asset.assetRecipe === "hero-risk-gate"));
  assert.match(exportItem.message, /Risk gate|Bio classifier|Dataset/);
});

test("manual premium symbols appear in PPTX fallback review queue", () => {
  let project = createProject("Manual premium export fixture");
  project = addNode(project, createCuratedSymbolNode({
    assetId: "risk-gate",
    label: "Risk gate",
    x: 120,
    y: 180,
    width: 180,
    height: 140,
    styleProfile: "consulting-2p5d"
  }));
  project = refreshDeckReviewItems(project);

  const summary = summarizeReviewQueue(project);
  assert.equal(summary.exportFallbacks.openCount, 1);
  assert.ok(summary.exportFallbacks.assetIds.includes("risk-gate"));
  assert.equal(summary.deliveryReadiness, "needs-export-review");
  assert.ok(summary.actionItems.some((item) => item.id === "review-office-export-fallbacks"));
});

test("review queue items include actionable node QA context", () => {
  let project = createProject("Actionable review fixture");
  const node = createCuratedSymbolNode({
    assetId: "risk-gate",
    label: "Permission decision",
    x: 120,
    y: 180,
    width: 180,
    height: 140,
    styleProfile: "risk-warning",
    semanticRole: "risk-decision",
    layoutHint: "ai-biosecurity-pipeline:decision"
  });
  node.claimStatus = "needs-citation";
  project = addNode(project, node);

  const reviewItems = generateReviewItems(project);
  const claimItem = reviewItems.find((item) => item.kind === "claim" && item.nodeId);
  assert.ok(claimItem);
  assert.match(claimItem.title ?? "", /Confirm or cite/);
  assert.match(claimItem.action ?? "", /Attach a source/);
  assert.equal(claimItem.templateId, "ai-biosecurity-pipeline");
  assert.equal(claimItem.metrics?.semanticRole, "risk-decision");
  assert.equal(claimItem.metrics?.layoutHint, "ai-biosecurity-pipeline:decision");
  assert.equal(claimItem.metrics?.claimStatus, "needs-citation");
});

test("workflow figure metadata fills speaker notes for agent-created figures", () => {
  let project = createProject("Workflow figure notes fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "ai-biosecurity-pipeline", styleProfile: "consulting-2p5d" });
  project = nodes.reduce((current, node) => addNode(current, node), project);
  project = applyWorkflowFigureSlideMeta(project, {
    templateId: "ai-biosecurity-pipeline",
    workflowPack: "ai-biosecurity-eval",
    mode: "flagship-demo"
  });

  const pageId = project.pages[0].id;
  assert.equal(project.deck.slideMeta[pageId].title, "AI biosecurity pipeline");
  assert.match(project.deck.slideMeta[pageId].speakerNotes, /Export note/);
  assert.equal(generateReviewItems(project).some((item) => item.kind === "accessibility" && item.message.includes("speaker notes")), false);
});

test("workflow template structural labels are not treated as scientific claims", () => {
  let project = createProject("Structural label fixture");
  const nodes = createWorkflowFigureNodes({ templateId: "manuscript-results-figure", styleProfile: "consulting-2p5d" });
  project = nodes.reduce((current, node) => addNode(current, node), project);
  project = applyWorkflowFigureSlideMeta(project, {
    templateId: "manuscript-results-figure",
    workflowPack: "publication-results-panels",
    mode: "flagship-demo"
  });

  const claimTitles = generateReviewItems(project)
    .filter((item) => item.kind === "claim")
    .map((item) => item.title ?? "");
  assert.equal(claimTitles.some((title) => /^Confirm or cite: [A-E]$/.test(title)), false);
  assert.equal(claimTitles.some((title) => title.includes("Experimental context")), false);
  assert.equal(claimTitles.some((title) => title.includes("Hit genes")), false);
  const evidenceItems = generateReviewItems(project).filter((item) => item.kind === "provenance" && item.title?.startsWith("Verify evidence source"));
  assert.ok(evidenceItems.some((item) => item.title?.includes("Hit genes")));
});
