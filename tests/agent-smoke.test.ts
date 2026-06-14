import test from "node:test";
import assert from "node:assert/strict";
import { PERTURB_SEQ_SOURCE_FIXTURE, runAgentAcceptanceSmoke } from "../scripts/agent-acceptance-smoke.ts";

test("agent acceptance smoke follows manifest, workflow template, QA, and export loop", async () => {
  const result = await runAgentAcceptanceSmoke({
    workflowPack: "ai-biosecurity-eval",
    templateId: "ai-biosecurity-pipeline",
    styleProfile: "consulting-2p5d"
  });

  assert.equal(result.ok, true);
  assert.equal(result.workflowPack, "ai-biosecurity-eval");
  assert.equal(result.templateId, "ai-biosecurity-pipeline");
  assert.equal(result.workflowRecommendation.workflowPack, "ai-biosecurity-eval");
  assert.equal(result.validationOk, true);
  assert.equal(result.deliveryReadiness, "needs-science-review");
  assert.match(result.nextAction, /citations|claims|human review/i);
  assert.ok(result.resourceCount >= 6);
  assert.ok(result.toolCount >= 20);
  assert.ok(result.createdNodeCount >= 5);
  assert.ok(result.generatedNodeIds.length >= 5);
  assert.ok(result.assetIds.includes("risk-gate"));
  assert.equal(result.reviewSummary.deliveryReadiness, "needs-science-review");
  assert.ok(result.reviewItemCount >= 1);
  assert.ok(result.fallbackAssetIds.includes("risk-gate"));
  assert.ok(result.exportWarnings.all.length >= result.exportWarnings.pptx.length);
  assert.match(result.agentSummary, /editable slide/);
  assert.match(result.exports.svg.filename, /\.svg$/);
  assert.match(result.exports.pdf.filename, /\.pdf$/);
  assert.match(result.exports.pptx.filename, /\.pptx$/);
  assert.ok(result.exports.svg.sizeBytes > 5000);
  assert.ok(result.exports.pdf.sizeBytes > 100);
  assert.ok(result.exports.pptx.sizeBytes > 1000);
});

test("Perturb-seq agent smoke starts from source notes and returns an editable handoff", async () => {
  const result = await runAgentAcceptanceSmoke({
    sourceText: PERTURB_SEQ_SOURCE_FIXTURE,
    styleProfile: "consulting-2p5d"
  });

  assert.equal(result.ok, true);
  assert.equal(result.workflowPack, "perturb-seq-crispr");
  assert.equal(result.workflowRecommendation.workflowPack, "perturb-seq-crispr");
  assert.equal(result.templateId, "perturb-seq-workflow");
  assert.equal(result.sourceName, "perturb-seq-crispr-source.md");
  assert.ok(result.sourceId);
  assert.equal(result.validationOk, true);
  assert.ok(result.generatedNodeIds.length >= 20);
  assert.ok(result.assetIds.includes("guide-rna"));
  assert.ok(result.assetIds.includes("crispr-cas9"));
  assert.ok(result.assetIds.includes("expression-matrix"));
  assert.ok(result.reviewItemCount >= 1);
  assert.equal(result.reviewSummary.deliveryReadiness, "needs-science-review");
  assert.match(result.nextAction, /citations|claims|human review/i);
  assert.match(result.agentSummary, /perturb-seq-crispr editable slide/i);
  assert.match(result.exports.svg.filename, /\.svg$/);
  assert.ok(result.exports.svg.sizeBytes > 5000);
  assert.ok(result.exports.pptx.sizeBytes > 1000);
});

test("workflow-specific agent smoke filenames do not fall back to AI biosecurity defaults", async () => {
  const result = await runAgentAcceptanceSmoke({
    workflowPack: "spatial-transcriptomics",
    styleProfile: "consulting-2p5d"
  });

  assert.equal(result.ok, true);
  assert.equal(result.workflowPack, "spatial-transcriptomics");
  assert.equal(result.templateId, "spatial-results-panel");
  assert.equal(result.sourceName, "spatial-transcriptomics-source.md");
  assert.match(result.agentSummary, /spatial-transcriptomics editable slide/i);
  assert.match(result.exports.svg.filename, /^spatial-transcriptomics-results-panel-spatial-results-panel\.svg$/);
  assert.match(result.exports.pdf.filename, /^spatial-transcriptomics-results-panel-deck\.pdf$/);
  assert.match(result.exports.pptx.filename, /^spatial-transcriptomics-results-panel-deck\.pptx$/);
  assert.doesNotMatch(result.exports.svg.filename, /ai-biosecurity/);
});
