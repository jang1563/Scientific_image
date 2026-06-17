import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("reviewer status reports no-install repo readiness and CI wiring", () => {
  const result = spawnSync(process.execPath, ["scripts/reviewer-status.ts", "--skip-tests"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const status = JSON.parse(result.stdout);
  assert.equal(status.schemaVersion, "0.1.0-reviewer-status");
  assert.equal(status.portfolio.browseableAssets, 496);
  assert.equal(status.portfolio.curatedStructuredAssets, 466);
  assert.equal(status.portfolio.workflowPacks, 18);
  assert.equal(status.portfolio.templates, 78);
  assert.equal(status.ci.workflowPresent, true);
  assert.equal(status.ci.nodeVersionPinnedTo24, true);
  assert.equal(status.ci.modernActionRuntime, true);
  assert.equal(status.ci.node24ActionRuntimeForced, false);
  assert.equal(status.ci.badgePresentInReadme, true);
  assert.equal(status.checks.tests.status, "skipped");
  assert.equal(status.checks.publicReadinessAudit.status, "passed");
  assert.ok(Array.isArray(status.noInstallReviewerPath));
});

test("npm package readiness reports missing package tooling without stack trace", () => {
  const result = spawnSync(process.execPath, ["scripts/npm-package-readiness.ts"], {
    encoding: "utf8",
    env: { ...process.env, PATH: "" }
  });
  assert.equal(result.status, 1);
  assert.equal(result.stderr, "");

  const status = JSON.parse(result.stdout);
  assert.equal(status.ok, false);
  assert.equal(status.mode, "strict-npm-package-readiness");
  assert.deepEqual(status.packageTooling.missing, ["npm", "tsc"]);
  assert.match(status.nextAction, /Install npm and TypeScript package tooling/);
  assert.doesNotMatch(result.stdout, /Error:|at file:|stack/i);
});
