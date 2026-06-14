import test from "node:test";
import assert from "node:assert/strict";
import {
  addNode,
  applyTemplate,
  createProject,
  createTextNode,
  createTransform,
  listNodes,
  validateProject
} from "../packages/scene/src/index.ts";
import { createCuratedSymbolNode, listAssets } from "../packages/assets/src/index.ts";

test("creates and validates a project with curated symbol provenance", () => {
  const project = createProject("Perturb-seq figure");
  const asset = listAssets("crispr")[0];
  const symbol = createCuratedSymbolNode({ assetId: asset.id, x: 100, y: 120, label: "CRISPR library" });
  const withSymbol = addNode(project, symbol);
  const withText = addNode(withSymbol, createTextNode("Perturb-seq workflow", createTransform(360, 60, 360, 64)));

  assert.equal(withText.schemaVersion, "0.2.0");
  assert.ok(withText.deck.slideMeta[withText.pages[0].id]);
  assert.equal(listNodes(withText).length, 2);
  assert.equal(symbol.provenance.kind, "curated");

  const validation = validateProject(withText);
  assert.equal(validation.ok, true);
  assert.ok(validation.issues.some((issue) => issue.code === "node.claim.needs-citation"));
});

test("applies built-in biology and AI templates", () => {
  const project = createProject("AI biosecurity slide");
  const templated = applyTemplate(project, "ai-biosecurity-pipeline");

  assert.ok(listNodes(templated).length >= 7);
  assert.ok(listNodes(templated).some((node) => node.name.includes("Bio classifier")));
  assert.equal(validateProject(templated).ok, true);
});
