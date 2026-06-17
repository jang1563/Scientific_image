# Public Example Gallery

These examples are synthetic, public, and regenerated from structured scene nodes. They are meant to give reviewers a fast visual read on the project without requiring private source material.

## Gallery

| Example | Intent | Template ID | File | Editable local demo | What it demonstrates |
| --- | --- | --- | --- | --- | --- |
| Perturb-seq CRISPR workflow | Deck-premium | `perturb-seq-workflow` | `docs/examples/perturb-seq-workflow.svg` | `http://127.0.0.1:4173/?demo=perturb-seq-workflow` | Workflow-pack template generation, premium biology assets, agent-ready semantic slots, and export QA for a common genomics figure. |
| Perturb-seq journal workflow figure | Journal-safe | `perturb-seq-workflow-journal` | `docs/examples/perturb-seq-workflow-journal.svg` | `http://127.0.0.1:4173/?demo=perturb-seq-workflow-journal` | Publication-line Perturb-seq schematic with minimal framing, source/provenance placeholders, and journal QA. |
| Spatial transcriptomics results panel | Deck-premium | `spatial-results-panel` | `docs/examples/spatial-results-panel.svg` | `http://127.0.0.1:4173/?demo=spatial-results-panel` | Multi-panel results layout, spatial/imaging assets, plot panels, review items, and editable publication-style composition. |
| Spatial transcriptomics journal results panel | Journal-safe | `spatial-results-panel-journal` | `docs/examples/spatial-results-panel-journal.svg` | `http://127.0.0.1:4173/?demo=spatial-results-panel-journal` | Manuscript-style spatial figure with publication-line rendering, plot/source-data metadata, and journal QA. |
| AI biosecurity evaluation pipeline | Deck-premium | `ai-biosecurity-pipeline` | `docs/examples/ai-biosecurity-pipeline.svg` | `http://127.0.0.1:4173/?demo=ai-biosecurity-pipeline` | AI safety workflow assets, risk gates, human review, audit trail structure, and warning-aware delivery. |
| AI biosecurity journal evaluation schematic | Journal-safe | `ai-biosecurity-pipeline-journal` | `docs/examples/ai-biosecurity-pipeline-journal.svg` | `http://127.0.0.1:4173/?demo=ai-biosecurity-pipeline-journal` | Publication-line methods schematic for benchmark, classifier, risk review, and audit evidence flow. |

## Reproducibility

Regenerate the examples:

```bash
node scripts/generate-public-examples.ts
```

Check that generated examples stay in sync with tracked source:

```bash
git diff --exit-code docs/examples
```

Run the public-demo visual QA gate:

```bash
node scripts/public-demo-visual-qa.ts
```

Run the public portfolio gate:

```bash
node scripts/public-readiness-audit.ts
```

## Reviewer Notes

- Every example is rendered from editable scene graph nodes.
- Journal-safe examples must pass `getJournalFigureQa(...).status === "journal-ready"` in the public demo QA gate.
- Template IDs, workflow packs, style profiles, asset IDs, and review/export warnings stay inspectable through code and tests.
- `scripts/public-demo-visual-qa.ts` links each README example to template QA, 48px/120px/slide-size pack visual QA, and exact Office fallback assets.
- The local demo URLs load editable scenes in the static web workspace after `node scripts/serve-static.ts apps/web 4173`.
