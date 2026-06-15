# Repository Index

This repository is a local-first scientific visual communication system. It is meant to show structured product engineering, scientific design systems, export-aware rendering, and agent-facing APIs in one coherent project.

## Reviewer Fast Path

1. Inspect generated public examples in `docs/examples/`.
2. Read the `30-Second Reviewer Path` and `Why This Is Technically Interesting` sections in `README.md`.
3. Run the `Copy-Paste Reviewer Commands` in `README.md`.
4. Use `docs/REVIEWER_EVIDENCE_MAP.md` to map each portfolio claim to files and commands.
5. Follow the MCP/API sequence in `docs/AGENT_QUICKSTART.md`.
6. Inspect the core packages listed below.

## What To Judge

- Is the source of truth structured scene JSON rather than opaque screenshots?
- Can a human edit the same objects that an agent creates through MCP/API tools?
- Do assets have semantic metadata, provenance, style profiles, and editable part contracts?
- Do exports report exact PPTX/DOCX fidelity fallbacks instead of pretending everything is natively editable?
- Do tests and the public readiness audit keep the portfolio claims reproducible?

## Product Surface

- `apps/web/`: Static local scientific deck workspace. It demonstrates asset browsing, public demo launching, slide canvas editing, inspector controls, review/export affordances, and visual QA surfaces.

- `apps/api/src/server.ts`: Local HTTP API for assets, workflow packs, deck generation, review queues, export QA, and transient exports.

- `packages/mcp/src/server.ts`: MCP server for Codex, Claude, and other agents. Tools expose asset search, compact indexes, workflow figure creation, review validation, and export QA.

## Core Packages

- `packages/scene/`: Canonical scene graph, validation, migrations, provenance, transforms, style, review state, and deterministic editing helpers.

- `packages/assets/`: Curated asset registry, workflow packs, templates, semantic search, visual QA reports, realistic fixtures, commercial visual audit, and shared SVG renderer.

- `packages/export/`: SVG/PDF/PPTX/DOCX export surfaces with depth filters, plot rendering, premium asset fallback warnings, and review-aware output.

- `packages/deck/`: Deck outline, source document, slide metadata, review item, and agent-run model.

- `packages/plotting/`: CSV/TSV parsing and editable biological plot specs.

- `packages/agent/`: Agent resources, onboarding manifests, cookbook examples, and compact workflow guidance.

- `docs/examples/`: Small public SVG examples generated from structured scene nodes for README/reviewer preview.

- `docs/AGENT_QUICKSTART.md`: Copy-pasteable MCP/API path for agents that need to create editable figures through compact indexes, workflow templates, review validation, and export QA.

- `docs/REVIEWER_EVIDENCE_MAP.md`: Claim-by-claim evidence map for public portfolio review, linking product claims to source files, tests, local demos, and audit commands.

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
