# Agent Quickstart

This guide is for Codex, Claude, or any MCP/API client that wants to use Scientific Image as an editable scientific figure engine.

The rule of thumb is simple: agents should create scene JSON by referencing workflow packs, templates, asset IDs, style profiles, semantic slots, and appearance overrides. Do not use raw SVG as the editable source.

## Fast Smoke Test

Run this first to verify that the MCP stdio server can answer the same startup calls a Claude/Codex client needs:

```bash
npm run mcp:doctor
```

Run this from the repository root:

```bash
node scripts/agent-acceptance-smoke.ts
```

The smoke test follows the same loop an agent should use:

1. Read the agent manifest.
2. Create a local project.
3. Insert a premium workflow template.
4. Validate the review/export queue.
5. Verify SVG/PDF/PPTX output paths.

Use this when evaluating whether the agent surface is still working after changes.

For a reviewer-facing map of what this smoke proves, see `docs/AGENT_DEMO_EVIDENCE.md`.

## MCP Server

After npm publication, start the stdio MCP server with:

```bash
npx -y -p @jang1563/scientific-image scientific-image-mcp
```

To verify the npm package before adding it to a client config:

```bash
npx -y -p @jang1563/scientific-image scientific-image-mcp-doctor
```

For source checkout development, start the same server with:

```bash
node bin/scientific-image-mcp.js
```

For client setup, see [MCP_CLIENT_SETUP.md](MCP_CLIENT_SETUP.md). Root examples are provided for common clients:

- `.mcp.json.example` for Claude Code.
- `codex.mcp.example.toml` for Codex.
- `.mcp.npm.example.json` for Claude Code with npm.
- `codex.npm.example.toml` for Codex with npm.

Copy the relevant file into your client config, replace `cwd` with the absolute path to this repository, then restart the client.

Recommended first calls:

1. `resources/list`
2. `resources/read` for `scientific-image://agent/manifest`
3. `resources/read` for `scientific-image://agent/quickstart`
4. `tools/list`
5. `get_asset_index` with compact filters
6. `recommend_asset_set`
7. `create_workflow_figure`
8. `validate_deck`
9. `summarize_review_queue`
10. `export_deck`

## Minimal MCP Happy Path

Read the manifest:

```json
{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"scientific-image://agent/manifest"}}
```

Get a compact asset index for a workflow pack:

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_asset_index","arguments":{"workflowPack":"perturb-seq-crispr","styleProfile":"consulting-2p5d","responseShape":"compact","limit":12}}}
```

Ask for insert-ready recommendations:

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"recommend_asset_set","arguments":{"title":"Perturb-seq CRISPR workflow slide","workflowPack":"perturb-seq-crispr","sourceText":"Cells receive guide RNAs from a pooled CRISPR library. Single-cell sequencing links guides to expression, matrix construction, hit calling, and validation.","styleProfile":"consulting-2p5d","responseShape":"compact","limit":10}}}
```

Create a project:

```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"create_project","arguments":{"title":"Perturb-seq CRISPR agent demo","kind":"slide"}}}
```

Create an editable workflow figure:

```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"create_workflow_figure","arguments":{"projectId":"<projectId>","templateId":"perturb-seq-workflow","styleProfile":"consulting-2p5d","stepCount":5}}}
```

Validate and summarize review state:

```json
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"validate_deck","arguments":{"projectId":"<projectId>"}}}
```

```json
{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"summarize_review_queue","arguments":{"projectId":"<projectId>"}}}
```

Export with named warnings:

```json
{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"export_deck","arguments":{"projectId":"<projectId>","format":"pptx"}}}
```

The useful handoff fields are `projectId`, `workflowPack`, `templateId`, `generatedNodeIds`, `assetIds`, `reviewSummary.deliveryReadiness`, `reviewSummary.nextAction`, and exact export warnings.

## What Agents Should Prefer

- Prefer `create_workflow_figure` when the user asks for a full workflow, result panel, benchmark slide, or deck-ready figure.
- Prefer `recommend_asset_set` before inserting individual assets.
- Prefer `get_asset_index` with compact filters before requesting full metadata.
- Preserve `assetId`, `styleProfile`, `semanticRole`, `layoutHint`, and `appearance` in generated operations.
- Run `validate_deck` and `summarize_review_queue` before export.
- Surface unresolved claim/citation review items and PPTX/DOCX fallback asset IDs to the user.

## What Agents Should Avoid

- Do not treat exported SVG/PDF/PPTX as the source of truth.
- Do not paste raw SVG into scene JSON when an `assetId` exists.
- Do not resolve scientific claim review items without human approval or citation.
- Do not hide Office fallback warnings; name the exact assets or templates involved.
- Do not commit generated local output from `output/` or browser QA artifacts.

## API Alternative

For HTTP clients, start the API server:

```bash
node apps/api/src/server.ts
```

Useful endpoints:

- `GET /agent/manifest`
- `GET /agent/resources`
- `POST /projects`
- `POST /projects/:id/sources`
- `POST /projects/:id/workflow-figures`
- `POST /projects/:id/deck/validate`
- `GET /projects/:id/deck/review-summary`
- `GET /projects/:id/export/pptx`
- `GET /projects/:id/export/pdf`

MCP remains the preferred interface for agent clients because it exposes compact resources, typed tool schemas, and insert-ready recommendations.
