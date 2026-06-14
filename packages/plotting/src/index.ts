import {
  createId,
  createPlotNode as createScenePlotNode,
  createTransform,
  manualProvenance,
  type PlotEncoding,
  type PlotSpec,
  type PlotType,
  type Provenance,
  type SceneNode,
  type TableData,
  type Transform
} from "../../scene/src/index.ts";

export const SUPPORTED_PLOTS: PlotType[] = [
  "scatter",
  "embedding-scatter",
  "volcano",
  "heatmap",
  "box",
  "violin",
  "dot",
  "bar",
  "line"
];

export function inferDelimiter(input: string): "," | "\t" {
  const firstLine = input.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

export function parseDelimited(input: string, options: { delimiter?: "," | "\t"; name?: string; source?: Provenance } = {}): TableData {
  const delimiter = options.delimiter ?? inferDelimiter(input);
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) throw new Error("Delimited table is empty.");
  const columns = splitLine(lines[0], delimiter).map((column) => column.trim());
  if (!columns.length || columns.some((column) => !column)) {
    throw new Error("Delimited table header must include named columns.");
  }
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line, delimiter);
    const row: Record<string, string | number | null> = {};
    for (let index = 0; index < columns.length; index += 1) {
      row[columns[index]] = coerceValue(cells[index]);
    }
    return row;
  });
  return {
    id: createId("table"),
    name: options.name ?? "Imported table",
    columns,
    rows,
    source: options.source ?? manualProvenance("Imported CSV/TSV data")
  };
}

function splitLine(line: string, delimiter: "," | "\t"): string[] {
  if (delimiter === "\t") return line.split("\t");
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function coerceValue(value: string | undefined): string | number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(trimmed) ? numeric : trimmed;
}

export function createPlotSpec(input: {
  plotType: PlotType;
  table: TableData;
  encodings: PlotEncoding;
  title?: string;
}): PlotSpec {
  if (!SUPPORTED_PLOTS.includes(input.plotType)) {
    throw new Error(`Unsupported plot type: ${input.plotType}`);
  }
  validateEncodings(input.table, input.encodings, input.plotType);
  return {
    id: createId("plot"),
    plotType: input.plotType,
    title: input.title ?? defaultTitle(input.plotType, input.encodings),
    table: input.table,
    encodings: input.encodings
  };
}

export function createPlotNode(input: {
  spec: PlotSpec;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  transform?: Transform;
}): SceneNode {
  return createScenePlotNode(
    input.spec,
    input.transform ?? createTransform(input.x ?? 80, input.y ?? 80, input.width ?? 460, input.height ?? 320)
  );
}

export function summarizePlot(spec: PlotSpec): {
  rows: number;
  columns: string[];
  xRange?: [number, number];
  yRange?: [number, number];
} {
  const xValues = numericValues(spec.table, spec.encodings.x);
  const yValues = numericValues(spec.table, spec.encodings.y);
  return {
    rows: spec.table.rows.length,
    columns: [...spec.table.columns],
    xRange: xValues.length ? [Math.min(...xValues), Math.max(...xValues)] : undefined,
    yRange: yValues.length ? [Math.min(...yValues), Math.max(...yValues)] : undefined
  };
}

export function numericValues(table: TableData, column?: string): number[] {
  if (!column) return [];
  return table.rows
    .map((row) => row[column])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function validateEncodings(table: TableData, encodings: PlotEncoding, plotType: PlotType): void {
  const requiredByType: Record<PlotType, (keyof PlotEncoding)[]> = {
    scatter: ["x", "y"],
    "embedding-scatter": ["x", "y"],
    volcano: ["x", "y"],
    heatmap: ["x", "y", "value"],
    box: ["x", "y"],
    violin: ["x", "y"],
    dot: ["x", "y"],
    bar: ["x", "y"],
    line: ["x", "y"]
  };
  for (const key of requiredByType[plotType]) {
    const column = encodings[key];
    if (!column) throw new Error(`${plotType} plot requires ${key} encoding.`);
    if (!table.columns.includes(column)) {
      throw new Error(`Column "${column}" is not present in table "${table.name}".`);
    }
  }
}

function defaultTitle(plotType: PlotType, encodings: PlotEncoding): string {
  if (plotType === "volcano") return "Volcano plot";
  return `${plotType.replace("-", " ")}: ${encodings.y ?? "value"} by ${encodings.x ?? "x"}`;
}
