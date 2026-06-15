# Portfolio Scorecard

This scorecard is the public, reviewer-facing snapshot for the repository. It should stay factual, measurable, and reproducible from code.

## Current Verified Metrics

| Area | Current status |
| --- | --- |
| Browseable assets | `496` total: `466` curated structured assets, `30` realistic fixtures |
| Curated structured assets | `466` total: `386` biology, `80` AI |
| Premium assets | `429` signature/hero assets |
| Workflow packs | `18` workflow packs |
| Templates | `77` workflow templates |
| Style profiles | `6`: consulting, publication-line, minimal-flat, dark-talk, risk-warning, realism |
| Export surfaces | SVG, PDF, PPTX, DOCX |
| Agent surfaces | Local API, MCP resources, MCP tools, compact asset index |
| Public visual examples | `3` generated SVG examples under `docs/examples/` |
| Canonical artifact | Structured scene JSON |

## Portfolio Signals

- Structured scene graph with validation, provenance, review state, deterministic edits, and export-aware rendering.
- Premium scientific asset registry with workflow packs, semantic search, editable part metadata, and shared SVG rendering.
- Agent-first interface for Codex, Claude, and other MCP clients to create editable scientific figures from asset IDs, templates, semantic slots, and style profiles.
- Review and export QA that names exact fallback assets instead of hiding limitations behind screenshots.
- Local-first architecture that keeps generated artifacts, private notes, and source documents out of git by default.
- Public SVG examples are generated from structured scene nodes and checked for freshness in CI.

## Public Quality Gate

Run this before sharing the repository:

```bash
node --test tests/*.test.ts
node scripts/public-readiness-audit.ts
```

The public readiness audit currently enforces:

- Required reviewer-facing files exist.
- Asset, workflow-pack, template, and premium coverage stay above the portfolio baseline.
- README and this scorecard match computed registry metrics.
- Generated local artifacts are not tracked.
- Tracked files do not contain obvious credentials, local paths, private notes, or planning transcripts.

## Known Product Boundary

This is a local-first MVP and asset-system prototype, not a hosted collaboration product. Sync, team libraries, marketplace distribution, and native PowerPoint shape reconstruction for all complex premium assets remain future work.
