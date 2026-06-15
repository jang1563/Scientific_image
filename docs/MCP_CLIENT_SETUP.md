# MCP Client Setup

This page is for users who want Claude Code, Codex, or another MCP client to call Scientific Image as a local scientific figure engine.

## Current Distribution Model

Scientific Image is exposed as a local stdio MCP server from this public repository. It is not published as an npm package or hosted MCP service yet.

Use the server after cloning the repo:

```bash
git clone https://github.com/jang1563/Scientific_image.git
cd Scientific_image
node packages/mcp/src/server.ts
```

The server is intentionally local-first. Agents create editable scene JSON by calling tools that reference workflow packs, template IDs, asset IDs, style profiles, semantic slots, and appearance overrides.

## Claude Code

Copy `.mcp.json.example` to your Claude Code project as `.mcp.json`, then replace `cwd` with the absolute path to this repository:

```json
{
  "mcpServers": {
    "scientific-image": {
      "command": "node",
      "args": ["packages/mcp/src/server.ts"],
      "cwd": "/absolute/path/to/Scientific_image"
    }
  }
}
```

Restart Claude Code after adding the server.

## Codex

Copy `codex.mcp.example.toml` into your Codex config, then replace `cwd` with the absolute path to this repository:

```toml
[mcp_servers.scientific-image]
command = "node"
args = ["packages/mcp/src/server.ts"]
cwd = "/absolute/path/to/Scientific_image"
startup_timeout_sec = 20
tool_timeout_sec = 120
```

Restart Codex after adding the server.

## First Calls

Once connected, the easiest path is:

1. `resources/list`
2. `resources/read` for `scientific-image://agent/manifest`
3. `resources/read` for `scientific-image://agent/agent-cookbook`
4. `resources/read` for `scientific-image://agent/demo-perturb-seq-crispr`
5. `tools/list`
6. `get_asset_index` with a workflow pack filter
7. `recommend_asset_set`
8. `create_workflow_figure`
9. `validate_deck`
10. `summarize_review_queue`
11. `export_deck`

For copy-paste JSON-RPC examples, use [AGENT_QUICKSTART.md](AGENT_QUICKSTART.md).

## Smoke Test

Run this from the repository root before connecting a client:

```bash
node scripts/agent-acceptance-smoke.ts --workflow-pack perturb-seq-crispr
```

Expected result:

- `ok: true`
- `workflowPack: "perturb-seq-crispr"`
- `templateId: "perturb-seq-workflow"`
- non-empty `generatedNodeIds`
- `reviewSummary.deliveryReadiness` explaining remaining human review
- exact SVG/PDF/PPTX export warnings

## Agent Contract

Agents should:

- Use `assetId`, `workflowPack`, `templateId`, `styleProfile`, `semanticSlot`, and `appearance`.
- Prefer `recommend_asset_set` before inserting individual assets.
- Keep structured scene JSON as the source of truth.
- Run review/export QA before delivery.
- Surface scientific claim review items and PPTX/DOCX fallback asset IDs.

Rule: Do not use raw SVG as the editable source.

Agents should not:

- Treat exported SVG/PDF/PPTX as the editable source.
- Paste raw SVG when an asset ID exists.
- Hide export fallback warnings.
- Resolve scientific review items without citation or human approval.
