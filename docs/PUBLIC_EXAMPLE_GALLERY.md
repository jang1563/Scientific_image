# Public Example Gallery

These examples are synthetic, public, and regenerated from structured scene nodes. They are meant to give reviewers a fast visual read on the project without requiring private source material.

## Gallery

| Example | Template ID | File | Editable local demo | What it demonstrates |
| --- | --- | --- | --- | --- |
| Perturb-seq CRISPR workflow | `perturb-seq-workflow` | `docs/examples/perturb-seq-workflow.svg` | `http://127.0.0.1:4173/?demo=perturb-seq-workflow` | Workflow-pack template generation, premium biology assets, agent-ready semantic slots, and export QA for a common genomics figure. |
| Spatial transcriptomics results panel | `spatial-results-panel` | `docs/examples/spatial-results-panel.svg` | `http://127.0.0.1:4173/?demo=spatial-results-panel` | Multi-panel results layout, spatial/imaging assets, plot panels, review items, and editable publication-style composition. |
| AI biosecurity evaluation pipeline | `ai-biosecurity-pipeline` | `docs/examples/ai-biosecurity-pipeline.svg` | `http://127.0.0.1:4173/?demo=ai-biosecurity-pipeline` | AI safety workflow assets, risk gates, human review, audit trail structure, and warning-aware delivery. |

## Reproducibility

Regenerate the examples:

```bash
node scripts/generate-public-examples.ts
```

Check that generated examples stay in sync with tracked source:

```bash
git diff --exit-code docs/examples
```

Run the public portfolio gate:

```bash
node scripts/public-readiness-audit.ts
```

## Reviewer Notes

- Every example is rendered from editable scene graph nodes.
- Template IDs, workflow packs, style profiles, asset IDs, and review/export warnings stay inspectable through code and tests.
- The local demo URLs load editable scenes in the static web workspace after `node scripts/serve-static.ts apps/web 4173`.
