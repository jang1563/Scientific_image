# Scientific Image

Local-first scientific visual communication MVP: a structured SVG-first editor for biology and AI diagrams, figures, plots, posters, and premium slide decks.

The repo is intentionally usable with only Node 24 in this environment. The current MVP core runs without installing packages and keeps structured scene JSON as the canonical artifact.

## Portfolio Snapshot

- `496` browseable assets in the local gallery: `466` curated structured assets plus `30` realistic fixtures.
- `429` signature/hero assets across `18` workflow packs and `77` templates.
- Local-first web workspace, API, and MCP server share the same scene graph.
- Agent-ready contract: agents use `workflowPack`, `templateId`, `assetId`, `styleProfile`, semantic slots, and editable appearance overrides instead of raw screenshots.
- Export-aware pipeline: SVG/PDF/PPTX/DOCX paths emit exact fallback and provenance warnings.
- Verification target: `node --test tests/*.test.ts` and `node scripts/public-readiness-audit.ts`.

For a reviewer-oriented Repository Index, see [docs/REPOSITORY_INDEX.md](docs/REPOSITORY_INDEX.md). For a metrics-based Portfolio Scorecard, see [docs/PORTFOLIO_SCORECARD.md](docs/PORTFOLIO_SCORECARD.md). For public release rules, see [docs/PUBLIC_RELEASE_CHECKLIST.md](docs/PUBLIC_RELEASE_CHECKLIST.md).

## What Is Included

- Strict scene graph package with validation, provenance, claim status, and deterministic editing helpers.
- Premium deck layer with source documents, deck outlines, slide metadata, review queues, and agent run history.
- Outline-first agent workflow for source import, deck outline drafting, approved slide generation, deterministic operations, and deck validation.
- Premium structured SVG asset system with curated biology and AI assets, semantic search, variants, provenance, and reusable renderer families.
- CSV/TSV parser and editable `PlotSpec` generation for common bio plots.
- Multi-slide SVG, PDF, PNG-helper, and minimal editable PPTX export primitives.
- Local HTTP API covering project, source, outline, deck generation, review, node, plot, validation, and export operations.
- MCP stdio server exposing deterministic project and premium deck tools.
- Static local premium deck workspace using the same project schema.
- Node tests for schema, deck workflow, plotting, export, and API/MCP-facing operations.

## Run

```bash
node --test tests/*.test.ts
node scripts/public-readiness-audit.ts
node scripts/agent-acceptance-smoke.ts
node scripts/serve-static.ts apps/web 4173
node apps/api/src/server.ts
node packages/mcp/src/server.ts
```

Then open `http://127.0.0.1:4173`.

## Premium Deck Flow

1. Paste markdown notes, paper summary text, or extracted PDF text into the source panel.
2. Import the source.
3. Draft an outline.
4. Approve and generate editable slides.
5. Resolve the review queue for claims, provenance, layout, accessibility, and export warnings.
6. Export structured JSON, deck SVG, current-slide PNG, or use the API/MCP exporters for PPTX/PDF.

Important API routes:

- `GET /agent/manifest`
- `GET /agent/resources`
- `GET /agent/resources/:resourceId`
- `GET /assets?query=...&category=...&role=...`
- `GET /assets/:assetId`
- `GET /assets/:assetId/render?variant=...`
- `POST /assets/recommend`
- `POST /projects/:id/sources`
- `POST /projects/:id/deck/outline`
- `POST /projects/:id/deck/outline/approve`
- `POST /projects/:id/deck/generate`
- `POST /projects/:id/deck/validate`
- `GET /projects/:id/deck/review`
- `GET /projects/:id/deck/review-summary`
- `POST /projects/:id/deck/review/resolve`
- `PATCH /projects/:id/deck/review/:reviewItemId`
- `GET /projects/:id/export/pptx`
- `GET /projects/:id/export/pdf`
- `POST /exports/:format` for transient scene JSON export without saving to the API data directory

Important MCP tools:

- `get_agent_manifest`
- `read_agent_resource`
- `search_assets`
- `get_asset`
- `render_asset_preview`
- `recommend_assets_for_slide`
- `insert_premium_asset`
- `import_source`
- `create_deck_outline`
- `revise_deck_outline`
- `generate_slide_from_brief`
- `generate_deck_from_outline`
- `apply_scene_operations`
- `validate_deck`
- `list_review_items`
- `summarize_review_queue`
- `resolve_review_item`
- `resolve_review_items`
- `export_deck`

Important MCP resources:

- `scientific-image://agent/manifest`
- `scientific-image://agent/quickstart`
- `scientific-image://agent/workflow-recipes`
- `scientific-image://agent/client-configs`
- `scientific-image://agent/review-export-checklist`

## Agent Setup

Claude Code, Codex, and other MCP clients should connect to the local stdio server:

```bash
node packages/mcp/src/server.ts
```

Recommended first calls:

1. `resources/list`
2. `resources/read` for `scientific-image://agent/manifest`
3. `tools/list`

Agents should prefer workflow-pack templates and asset IDs over raw SVG strings, keep scene JSON as the canonical artifact, run review/export QA before delivery, and surface exact PPTX fallback assets when Office export cannot preserve native editability.

For review resolution, agents should call `summarize_review_queue` after `validate_deck`. The summary returns delivery readiness, next action, claim/citation queues, exact export fallback assets, and batchable review item IDs. Use `resolve_review_items` only after human approval, typically with `status: "resolved"` for citations/layout fixes or `status: "accepted-risk"` for reviewed Office fallback limitations.

The web workspace includes a Delivery panel that mirrors this gate for humans. It keeps scene JSON as the canonical source export, allows SVG/PNG local exports, and uses the local API for PDF/PPTX delivery exports when `node apps/api/src/server.ts` is running.

Agent acceptance smoke:

```bash
node scripts/agent-acceptance-smoke.ts
node scripts/agent-acceptance-smoke.ts --write-output
```

The smoke follows the same loop an agent should use: read the manifest resource, inspect tools, create a project, insert a premium workflow template, validate review/export QA, and verify SVG/PDF/PPTX output. With `--write-output`, it writes files under `output/agent-smoke`.

## Premium Asset System

The local gallery contains `496` browseable assets: `466` curated structured visual assets plus `30` realistic editorial fixtures.

- `386` biology assets across cells/tissues, genomics, perturbation, assays, spatial imaging, molecules/pathways, model systems, pathogens/biosafety, clinical/translational, drug discovery, protein engineering, synthetic biology, microscopy, lab automation, organ systems, methods, and space biology.
- `80` AI assets across data/model systems, LLM/RAG/agents, evaluation, safety/permissioning, biosecurity workflows, and governance/monitoring.
- Every asset includes semantic metadata, aliases, tags, provenance, variants, editable parts, recommended size, and a reusable render family.
- The renderer is used by web previews, scene SVG export, API rendering, and MCP previews.

## Public Repo Hygiene

Generated files under `output/` and `.playwright-cli/` are local QA artifacts and are ignored by git. Do not commit private notes, internal chat logs, application-specific personal context, API keys, proprietary source documents, or generated decks containing non-public data. Run:

```bash
node scripts/public-readiness-audit.ts
```

before sharing the repository or changing GitHub visibility.

## V1 Boundaries

This MVP is single-user and local-first. Sync, collaboration, team libraries, marketplace, AnnData/h5ad, spatial-native readers, and full hosted React/Next deployment are extension points, not implemented v1 features.
