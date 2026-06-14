import test from "node:test";
import assert from "node:assert/strict";
import { createPlotNode, createPlotSpec, parseDelimited, summarizePlot } from "../packages/plotting/src/index.ts";

const volcano = `gene\tlog2fc\tpadj\tscore\tgroup
TP53\t1.8\t0.0008\t9.1\tDNA damage
MYC\t-1.2\t0.004\t7.5\tOncogene
CDKN1A\t2.4\t0.0002\t11.2\tCell cycle`;

test("parses TSV and creates editable volcano PlotSpec nodes", () => {
  const table = parseDelimited(volcano, { name: "Volcano fixture" });
  const spec = createPlotSpec({
    plotType: "volcano",
    table,
    encodings: { x: "log2fc", y: "padj", color: "group", label: "gene" },
    title: "Volcano plot"
  });
  const node = createPlotNode({ spec, x: 50, y: 60 });
  const summary = summarizePlot(spec);

  assert.equal(table.columns.includes("log2fc"), true);
  assert.equal(table.rows[0].log2fc, 1.8);
  assert.equal(spec.plotType, "volcano");
  assert.equal(node.kind, "plot");
  assert.deepEqual(summary.xRange, [-1.2, 2.4]);
});

test("rejects plots with missing required encodings", () => {
  const table = parseDelimited(volcano);
  assert.throws(() => createPlotSpec({ plotType: "scatter", table, encodings: { x: "log2fc" } }), /requires y/);
});
