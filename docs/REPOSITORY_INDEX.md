# Repository Index

This repository is a local-first scientific visual communication system. It is meant to show structured product engineering, scientific design systems, export-aware rendering, and agent-facing APIs in one coherent project.

## Reviewer Fast Path

1. Read the product summary in `README.md`.
2. Run `node --test tests/*.test.ts`.
3. Run `node scripts/public-readiness-audit.ts`.
4. Inspect the core packages listed below.
5. Start the static web workspace with `node scripts/serve-static.ts apps/web 4173`.
6. Run the agent smoke with `node scripts/agent-acceptance-smoke.ts`.

## Product Surface

- `apps/web/`: Static local scientific deck workspace. It demonstrates asset browsing, slide canvas editing, inspector controls, review/export affordances, and visual QA surfaces.

- `apps/api/src/server.ts`: Local HTTP API for assets, workflow packs, deck generation, review queues, export QA, and transient exports.

- `packages/mcp/src/server.ts`: MCP server for Codex, Claude, and other agents. Tools expose asset search, compact indexes, workflow figure creation, review validation, and export QA.

## Core Packages

- `packages/scene/`: Canonical scene graph, validation, migrations, provenance, transforms, style, review state, and deterministic editing helpers.

- `packages/assets/`: Curated asset registry, workflow packs, templates, semantic search, visual QA reports, realistic fixtures, commercial visual audit, and shared SVG renderer.

- `packages/export/`: SVG/PDF/PPTX/DOCX export surfaces with depth filters, plot rendering, premium asset fallback warnings, and review-aware output.

- `packages/deck/`: Deck outline, source document, slide metadata, review item, and agent-run model.

- `packages/plotting/`: CSV/TSV parsing and editable biological plot specs.

- `packages/agent/`: Agent resources, onboarding manifests, cookbook examples, and compact workflow guidance.

## Tests And QA

- `tests/assets.test.ts`: Asset registry, workflow packs, visual QA reports, semantic search, recommendations, templates, and commercial audit.

- `tests/api-mcp.test.ts`: Local API and MCP tools/resources, compact indexes, recommendation outputs, and agent workflows.

- `tests/export.test.ts`: SVG/PDF/PPTX/DOCX export behavior, depth filters, fallback warnings, and plot rendering.

- `tests/deck.test.ts`: Deck schema, source import, review queues, export readiness, and workflow figure metadata.

- `tests/agent-smoke.test.ts`: Agent acceptance paths from manifest to editable output and export QA.

## Demonstrable Capabilities

- Structured SVG scientific asset system with editable metadata and style profiles.
- Workflow-pack templates for biology, AI safety, translational science, automation, microscopy, and scientific consulting.
- Agent-addressable asset and template contracts through MCP.
- Review queue for scientific claims, provenance, layout, accessibility, and export fallbacks.
- Local-first static app plus API/MCP surfaces over the same scene JSON.

## Local-Only Artifacts

Generated QA and demo files belong under ignored directories such as `output/` and `.playwright-cli/`. They are useful during development but should not be committed unless intentionally curated as small public examples.
