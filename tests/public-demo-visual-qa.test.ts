import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("public demo visual QA links README examples to pack, template, and export gates", () => {
  const result = spawnSync(process.execPath, ["scripts/public-demo-visual-qa.ts"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.exampleCount, 3);
  assert.equal(report.blockedCount, 0);
  assert.ok(report.needsReviewCount >= 1);
  assert.deepEqual(report.demos.map((demo: { templateId: string }) => demo.templateId), [
    "perturb-seq-workflow",
    "spatial-results-panel",
    "ai-biosecurity-pipeline"
  ]);

  for (const demo of report.demos) {
    assert.ok(demo.workflowPack);
    assert.ok(["pass", "needs-review"].includes(demo.status));
    assert.equal(demo.templateQa.outOfBoundsCount, 0);
    assert.equal(demo.templateQa.textOverflowCount, 0);
    assert.equal(demo.templateQa.unsupportedClaimCount, 0);
    assert.deepEqual(demo.visualQa.previewSizes.map((size: { id: string }) => size.id), ["icon", "preview", "slide"]);
    assert.ok(demo.visualQa.renderedAssetIds.length > 0);
    assert.ok(demo.visualQa.qaChecks.some((check: string) => check.includes("48px")));
    assert.ok(demo.exportQa.nextAction);
    assert.ok(Array.isArray(demo.exportQa.fallbackAssetIds));
  }
});
