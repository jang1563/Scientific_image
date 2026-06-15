# Agent Demo Evidence

This page is the reviewer-facing map for the MCP/agent path. It shows how an external agent can move from source notes to an editable, validated scientific figure without guessing asset IDs or emitting raw SVG as the editing source.

## Canonical Smoke

Run the default agent smoke:

```bash
node scripts/agent-acceptance-smoke.ts
```

Run the Perturb-seq biology path explicitly:

```bash
node scripts/agent-acceptance-smoke.ts --workflow-pack perturb-seq-crispr
```

Optional local artifacts:

```bash
node scripts/agent-acceptance-smoke.ts --workflow-pack perturb-seq-crispr --write-output
```

The `--write-output` mode writes SVG/PDF/PPTX files under ignored `output/agent-smoke/`. Those artifacts are useful for local review but should not be committed.

## What The Smoke Proves

| Step | Evidence in code | Expected handoff |
| --- | --- | --- |
| Read agent resources | `packages/agent/src/index.ts`, `packages/mcp/src/server.ts` | `scientific-image://agent/manifest`, `scientific-image://agent/agent-cookbook`, `scientific-image://agent/demo-perturb-seq-crispr`, `scientific-image://agent/asset-index-compact` |
| Select workflow pack | `recommend_workflow_pack` in MCP/API surfaces | `workflowPack`, recommended template, reason, score |
| Get insert-ready assets | `get_asset_index`, `recommend_asset_set` | compact assets plus `insertPlan[].args` for `insert_premium_asset` |
| Generate editable figure | `create_workflow_figure` | `projectId`, `templateId`, `generatedNodeIds`, `assetIds` |
| Validate delivery | `validate_deck`, `summarize_review_queue` | delivery readiness, next action, claim/citation/export queues |
| Export with QA | `export_deck`, `export_pack_qa_report` | SVG/PDF/PPTX data plus exact fallback warnings |

## Useful Output Fields

The smoke prints JSON. Reviewers and agents should inspect these fields first:

- `workflowPack`
- `templateId`
- `generatedNodeIds`
- `assetIds`
- `deliveryReadiness`
- `nextAction`
- `fallbackAssetIds`
- `exportWarnings`
- `exports.svg.sizeBytes`
- `exports.pdf.sizeBytes`
- `exports.pptx.sizeBytes`

## MCP Resources To Inspect

```text
scientific-image://agent/manifest
scientific-image://agent/quickstart
scientific-image://agent/agent-cookbook
scientific-image://agent/demo-perturb-seq-crispr
scientific-image://agent/asset-index-compact
scientific-image://agent/review-export-checklist
```

## Agent Contract

- Use `workflowPack`, `templateId`, `assetId`, `styleProfile`, `semanticSlot`, and `appearance` as the editing contract.
- Keep structured scene JSON as the canonical artifact.
- Use exported SVG/PDF/PPTX/DOCX as delivery artifacts, not as the source of truth.
- Run review/export QA before delivery.
- Surface unresolved scientific review items and exact Office fallback assets to the user.

## Public Boundary

The smoke uses synthetic source fixtures in `scripts/agent-acceptance-smoke.ts`. It does not require private notes, unpublished source documents, API keys, or network access.
