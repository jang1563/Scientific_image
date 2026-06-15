# Reviewer Evidence Map

This map keeps the public portfolio claims testable. It points reviewers to concrete files, commands, and demos instead of private context or planning history.

## Evidence To Inspect

| Reviewer question | Evidence | Verification |
| --- | --- | --- |
| Is the canonical artifact structured, editable scene JSON? | `packages/scene/src/index.ts`, `packages/scene/src/types.ts`, `tests/scene.test.ts` | `node --test tests/scene.test.ts` |
| Do the web editor, API, MCP tools, and exporters share the same scene model? | `apps/web/src/app.js`, `apps/api/src/server.ts`, `packages/mcp/src/server.ts`, `packages/export/src/index.ts` | `node --test tests/api-mcp.test.ts tests/export.test.ts tests/web-ui.test.ts` |
| Can a reviewer open public examples quickly? | README direct demo links and `apps/web/src/app.js` public demo launcher | `node scripts/serve-static.ts apps/web 4173`, then open `http://127.0.0.1:4173/?demo=perturb-seq-workflow` |
| Are the SVG examples generated from code instead of hand-edited screenshots? | `scripts/generate-public-examples.ts`, `docs/examples/manifest.json`, `docs/examples/*.svg` | `node scripts/generate-public-examples.ts` and `git diff --exit-code docs/examples` |
| Is the asset library broad enough to demonstrate system design rather than a toy icon set? | `docs/PORTFOLIO_SCORECARD.md`, `packages/assets/src/index.ts`, `tests/assets.test.ts` | `node --test tests/assets.test.ts` |
| Can an agent use compact indexes and insert-ready asset recommendations? | `docs/AGENT_QUICKSTART.md`, `packages/agent/src/index.ts`, `packages/mcp/src/server.ts` | `node scripts/agent-acceptance-smoke.ts` |
| Does export QA name fidelity fallbacks and review issues? | `packages/export/src/index.ts`, `packages/deck/src/index.ts`, `tests/export.test.ts`, `tests/deck.test.ts` | `node --test tests/export.test.ts tests/deck.test.ts` |
| Is the public repository clean enough to share? | `scripts/public-readiness-audit.ts`, `.github/workflows/ci.yml`, `docs/PUBLIC_RELEASE_CHECKLIST.md` | `node scripts/public-readiness-audit.ts` |

## Public Demo Entry Points

After starting the static server, these URLs should load editable demo scenes in the local workspace:

- `http://127.0.0.1:4173/?demo=perturb-seq-workflow`
- `http://127.0.0.1:4173/?demo=spatial-results-panel`
- `http://127.0.0.1:4173/?demo=ai-biosecurity-pipeline`

## What This Proves

- Human and agent workflows operate on the same structured scene graph.
- Scientific assets are selected by IDs, semantic slots, workflow packs, and style profiles rather than raw SVG strings.
- Public examples and portfolio metrics are reproducible from tracked code.
- Export surfaces are warning-aware, especially where Office formats cannot preserve all premium SVG structure as native editable shapes.
- No private source material is required to evaluate the project.
