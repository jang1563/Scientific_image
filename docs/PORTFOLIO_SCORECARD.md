# Portfolio Scorecard

This scorecard is the public, reviewer-facing snapshot for the repository. It should stay factual, measurable, and reproducible from code.

## Current Verified Metrics

| Area | Current status |
| --- | --- |
| Browseable assets | `496` total: `466` curated structured assets, `30` realistic fixtures |
| Curated structured assets | `466` total: `386` biology, `80` AI |
| Premium assets | `429` signature/hero assets |
| Workflow packs | `18` workflow packs |
| Templates | `80` workflow templates |
| Style profiles | `6`: consulting, publication-line, minimal-flat, dark-talk, risk-warning, realism |
| Export surfaces | SVG, PDF, PPTX, DOCX |
| Agent surfaces | Local API, MCP resources, MCP tools, compact asset index |
| Agent quickstart | Copy-paste MCP/API path in `docs/AGENT_QUICKSTART.md` |
| Public visual examples | `3` generated SVG examples under `docs/examples/` |
| Canonical artifact | Structured scene JSON |
| Metrics freshness | Recompute with `node scripts/portfolio-metrics.ts`; enforced by `node scripts/public-readiness-audit.ts` |

## Portfolio Signals

- Product prototype that joins a human web workspace with agent-addressable API/MCP workflows over one structured scene JSON artifact.
- Structured scene graph with validation, provenance, review state, deterministic edits, and export-aware rendering.
- Premium scientific asset registry with workflow packs, semantic search, editable part metadata, and shared SVG rendering.
- Agent-first interface for Codex, Claude, and other MCP clients to create editable scientific figures from asset IDs, templates, semantic slots, and style profiles.
- Copy-pasteable agent quickstart that demonstrates compact indexing, workflow figure generation, review validation, and export QA.
- Review and export QA that names exact fallback assets instead of hiding limitations behind screenshots.
- Local-first architecture that keeps generated artifacts, private notes, and source documents out of git by default.
- Public SVG examples are generated from structured scene nodes and checked for freshness in CI.

## Public Quality Gate

Run this before sharing the repository:

```bash
node --test tests/*.test.ts
node scripts/portfolio-metrics.ts
node scripts/public-readiness-audit.ts
```

The public readiness audit currently enforces:

- Required reviewer-facing files exist.
- Asset, workflow-pack, template, and premium coverage stay above the portfolio baseline.
- `scripts/portfolio-metrics.ts` returns the same computed metrics used in README and this scorecard.
- README and this scorecard match computed registry metrics.
- Generated local artifacts are not tracked.
- Tracked files do not contain obvious credentials, local paths, private notes, or planning transcripts.

## Known Product Boundary

This is a local-first MVP and asset-system prototype, not a hosted collaboration product. Sync, team libraries, marketplace distribution, and native PowerPoint shape reconstruction for all complex premium assets remain future work.
