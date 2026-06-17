import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

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
  assert.match(app, /publicDemos/);
  assert.match(app, /renderPublicDemoLauncher/);
  assert.match(app, /syncWorkflowControls/);
  assert.match(app, /syncWorkflowPackSelect/);
  assert.match(app, /syncWorkflowFigureSelect/);
  assert.match(app, /dataset\.registryBacked = "true"/);
  assert.match(app, /launchPublicDemo/);
  assert.match(app, /initialPublicDemoId/);
  assert.match(app, /resolvePublicDemoId/);
  assert.match(app, /searchParams\.set\("demo"/);
  assert.match(app, /ai-biosecurity-pipeline/);
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
  assert.match(css, /\.public-demo-launcher/);
  assert.match(css, /\.public-demo-card/);
});

test("static web server exposes the premium asset catalog without the API server", async () => {
  const cwd = fileURLToPath(new URL("../", import.meta.url));
  const port = await getFreePort();
  const server = spawn(process.execPath, ["scripts/serve-static.ts", "apps/web", String(port)], {
    cwd,
    stdio: "ignore"
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/assets?limit=500`);
    const assets = await fetch(`http://127.0.0.1:${port}/assets?limit=500`).then((response) => response.json());
    const packs = await fetch(`http://127.0.0.1:${port}/assets/workflow-packs`).then((response) => response.json());
    const templates = await fetch(`http://127.0.0.1:${port}/assets/workflow-templates`).then((response) => response.json());

    assert.equal(assets.count, 496);
    assert.ok(assets.assets.length >= 466);
    assert.equal(packs.workflowPacks.length, 18);
    assert.equal(templates.templates.length, 77);
    assert.ok(packs.workflowPacks.every((pack: { id: string; templates: string[]; flagshipTemplateId?: string }) => pack.id && pack.templates.length >= 4 && pack.flagshipTemplateId));
    assert.ok(packs.workflowPacks.some((pack: { id: string }) => pack.id === "synthetic-biology"));
    assert.ok(packs.workflowPacks.some((pack: { id: string }) => pack.id === "drug-discovery"));
    assert.ok(templates.templates.some((template: { id: string; workflowPack: string }) => template.id === "synthetic-biology-platform" && template.workflowPack === "synthetic-biology"));
  } finally {
    server.kill();
  }
});

async function waitForServer(url: string): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function getFreePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : 0;
      probe.close(() => resolve(port));
    });
  });
}
