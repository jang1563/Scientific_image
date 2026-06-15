import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createProject, type Project } from "../packages/scene/src/index.ts";
import { createWorkflowFigureNodes } from "../packages/assets/src/index.ts";
import { exportProject } from "../packages/export/src/index.ts";

const OUT_DIR = "docs/examples";

const examples = [
  {
    filename: "perturb-seq-workflow.svg",
    title: "Perturb-seq CRISPR Workflow",
    pageName: "Perturb-seq workflow",
    templateId: "perturb-seq-workflow",
    styleProfile: "consulting-2p5d"
  },
  {
    filename: "spatial-results-panel.svg",
    title: "Spatial Transcriptomics Results Panel",
    pageName: "Spatial results panel",
    templateId: "spatial-results-panel",
    styleProfile: "consulting-2p5d"
  },
  {
    filename: "ai-biosecurity-pipeline.svg",
    title: "AI Biosecurity Evaluation Pipeline",
    pageName: "AI biosecurity pipeline",
    templateId: "ai-biosecurity-pipeline",
    styleProfile: "risk-warning"
  }
] as const;

function createExampleProject(example: (typeof examples)[number]): Project {
  const project = createProject(example.title, "slide");
  const page = project.pages[0];
  page.name = example.pageName;
  page.background = "#f8fbff";
  page.nodes = createWorkflowFigureNodes({
    templateId: example.templateId,
    styleProfile: example.styleProfile
  }).map((node, index) => ({
    ...node,
    transform: {
      ...node.transform,
      z: index + 1
    }
  }));
  project.deck.slideMeta[page.id] = {
    pageId: page.id,
    title: example.pageName,
    section: "Public examples",
    speakerNotes: "Synthetic public portfolio example generated from structured scene nodes.",
    narrativeIntent: "Show a public, editable scientific workflow figure generated from the local asset system.",
    layoutIntent: "portfolio-example",
    sourceIds: []
  };
  return project;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const example of examples) {
  const project = createExampleProject(example);
  const pageId = project.pages[0].id;
  const svg = exportProject(project, { format: "svg", pageId });
  writeFileSync(join(OUT_DIR, example.filename), normalizeGeneratedSvg(String(svg.data)));
}

writeFileSync(
  join(OUT_DIR, "manifest.json"),
  `${JSON.stringify({
    generatedBy: "scripts/generate-public-examples.ts",
    artifactType: "public synthetic portfolio examples",
    examples: examples.map((example) => ({
      filename: example.filename,
      title: example.title,
      templateId: example.templateId,
      styleProfile: example.styleProfile
    }))
  }, null, 2)}\n`
);

function normalizeGeneratedSvg(svg: string): string {
  const seen = new Map<string, string>();
  let index = 0;
  return svg.replace(/\bnode_[a-z0-9]+\b/g, (id) => {
    const existing = seen.get(id);
    if (existing) return existing;
    index += 1;
    const next = `node_public_${String(index).padStart(3, "0")}`;
    seen.set(id, next);
    return next;
  });
}
