import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("web inspector exposes premium asset contract and part-level controls", async () => {
  const app = await readFile(new URL("../apps/web/src/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/styles.css", import.meta.url), "utf8");

  assert.match(app, /renderAssetContractPanel/);
  assert.match(app, /fieldPalettePreset/);
  assert.match(app, /fieldShowLabel/);
  assert.match(app, /fieldSemanticRole/);
  assert.match(app, /fieldPanelRole/);
  assert.match(app, /editablePartDefinitions/);
  assert.match(app, /createBrowserAgentTrace/);
  assert.match(app, /agent-review-row/);
  assert.match(app, /agent-fallback-row/);
  assert.match(app, /asset-preview-scale-strip/);
  assert.match(app, /48/);
  assert.match(app, /120/);
  assert.match(app, /slide/);

  assert.match(css, /\.inspector-contract/);
  assert.match(css, /\.editable-part-grid/);
  assert.match(css, /\.agent-summary-card/);
  assert.match(css, /\.agent-review-row/);
  assert.match(css, /\.agent-chip\.fallback/);
  assert.match(css, /\.asset-preview-svg/);
  assert.match(css, /\.asset-preview-scale-strip/);
});
