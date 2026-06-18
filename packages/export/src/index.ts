import {
  getPage,
  isEvidenceReviewNode,
  isStructuralReviewTextNode,
  type ConnectorPayload,
  type DepthLevel,
  type ImagePayload,
  type Page,
  type PlotSpec,
  type Project,
  type SceneNode,
  type ShapePayload,
  type Style,
  type SymbolPayload,
  type TextPayload
} from "../../scene/src/index.ts";
import { getAnyAsset, getAsset, isRealisticAsset, renderPremiumAssetDefs, renderPremiumAssetGlyph, renderRealisticAssetGlyph } from "../../assets/src/index.ts";

export interface ExportResult {
  format: "svg" | "pdf" | "png" | "pptx" | "docx" | "json";
  mime: string;
  data: string | Uint8Array;
  filename: string;
  warnings: string[];
}

interface RenderContext {
  lineSafe: boolean;
}

export function exportProject(project: Project, input: { pageId?: string; format: ExportResult["format"]; dpi?: number }): ExportResult {
  if (input.format === "svg") return exportSvg(project, input.pageId);
  if (input.format === "pdf") return exportPdf(project, input.pageId);
  if (input.format === "pptx") return exportPptx(project, input.pageId);
  if (input.format === "docx") return exportDocx(project, input.pageId);
  if (input.format === "png") return exportPngPlaceholder(project, input.pageId, input.dpi);
  return {
    format: "json",
    mime: "application/json",
    filename: `${slug(project.title)}.sci-vis.json`,
    data: JSON.stringify(project, null, 2),
    warnings: []
  };
}

export function exportSvg(project: Project, pageId?: string): ExportResult {
  if (!pageId && project.pages.length > 1) {
    return {
      format: "svg",
      mime: "image/svg+xml",
      filename: `${slug(project.title)}-deck.svg`,
      data: renderDeckToSvg(project),
      warnings: project.pages.flatMap((page) => collectExportWarnings(page, "svg"))
    };
  }
  const page = getPage(project, pageId);
  return {
    format: "svg",
    mime: "image/svg+xml",
    filename: `${slug(project.title)}-${slug(page.name)}.svg`,
    data: renderPageToSvg(project, page.id),
    warnings: collectExportWarnings(page, "svg")
  };
}

export function renderDeckToSvg(project: Project): string {
  const gap = 80;
  const width = Math.max(...project.pages.map((page) => page.width));
  const height = project.pages.reduce((sum, page) => sum + page.height, 0) + gap * Math.max(0, project.pages.length - 1);
  const pages = project.pages.map((page, index) => {
    const y = project.pages.slice(0, index).reduce((sum, previous) => sum + previous.height + gap, 0);
    const inner = renderPageToSvg(project, page.id)
      .replace(/^<\?xml[^>]*>/, "")
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>$/, "");
    return `<g transform="translate(0 ${fmt(y)})"><text x="20" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#475569">${index + 1}. ${escapeXml(page.name)}</text><g transform="translate(0 44) scale(0.94)">${inner}</g></g>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(project.title)} deck">${pages}</svg>`;
}

export function renderPageToSvg(project: Project, pageId?: string): string {
  const page = getPage(project, pageId);
  const nodes = [...page.nodes].filter((node) => !node.hidden).sort((a, b) => a.transform.z - b.transform.z);
  const context: RenderContext = { lineSafe: isPublicationLineScene(nodes) };
  const renderedNodes = nodes.map((node) => renderNodeSvg(node, context));
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}" role="img" aria-label="${escapeXml(project.title)}">`,
    `<defs>${renderDepthDefs({ lineSafe: context.lineSafe, body: renderedNodes.join("") })}</defs>`,
    `<rect width="100%" height="100%" fill="${escapeXml(page.background)}"/>`,
    ...renderedNodes,
    `</svg>`
  ].join("");
}

export function renderDepthDefs(input: { lineSafe?: boolean; body?: string } = {}): string {
  const marker = `<marker id="arrow-end" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill="#334155"/></marker>`;
  if (input.lineSafe) {
    const assetDefs = input.body && /url\(#(?:asset|realistic)-/.test(input.body) ? renderPremiumAssetDefs() : "";
    return [marker, assetDefs].filter(Boolean).join("");
  }
  return [
    marker,
    `<filter id="contact-shadow" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur"/><feOffset in="blur" dx="0" dy="3" result="offset"/><feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.18 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="raised-panel-shadow" x="-18%" y="-22%" width="136%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="1.2" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.12 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="9" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.12 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="soft-object-shadow" x="-28%" y="-32%" width="156%" height="168%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="3" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.14 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="14" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.11 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="hero-shadow" x="-24%" y="-28%" width="148%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="4" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.16 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="18" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="22" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.14 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="warning-object-shadow" x="-32%" y="-36%" width="164%" height="172%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="contact-blur"/><feOffset in="contact-blur" dx="0" dy="3" result="contact-offset"/><feColorMatrix in="contact-offset" type="matrix" values="0 0 0 0 0.57 0 0 0 0 0.25 0 0 0 0 0.05 0 0 0 0.14 0" result="contact-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="glow-blur"/><feColorMatrix in="glow-blur" type="matrix" values="0 0 0 0 0.96 0 0 0 0 0.62 0 0 0 0 0.04 0 0 0 0.32 0" result="glow-shadow"/><feMerge><feMergeNode in="glow-shadow"/><feMergeNode in="contact-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="danger-object-shadow" x="-36%" y="-40%" width="172%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="contact-blur"/><feOffset in="contact-blur" dx="0" dy="4" result="contact-offset"/><feColorMatrix in="contact-offset" type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.11 0 0 0 0 0.11 0 0 0 0.18 0" result="contact-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="glow-blur"/><feColorMatrix in="glow-blur" type="matrix" values="0 0 0 0 0.86 0 0 0 0 0.15 0 0 0 0 0.15 0 0 0 0.36 0" result="glow-shadow"/><feMerge><feMergeNode in="glow-shadow"/><feMergeNode in="contact-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="focus-glow" x="-26%" y="-26%" width="152%" height="152%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="focus-blur"/><feColorMatrix in="focus-blur" type="matrix" values="0 0 0 0 0.15 0 0 0 0 0.39 0 0 0 0 0.92 0 0 0 0.5 0" result="focus-shadow"/><feMerge><feMergeNode in="focus-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    `<filter id="soft-shadow" x="-28%" y="-32%" width="156%" height="168%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="ambient-blur"/><feOffset in="ambient-blur" dx="0" dy="3" result="ambient-offset"/><feColorMatrix in="ambient-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.14 0" result="ambient-shadow"/><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="drop-blur"/><feOffset in="drop-blur" dx="0" dy="14" result="drop-offset"/><feColorMatrix in="drop-offset" type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.11 0" result="drop-shadow"/><feMerge><feMergeNode in="drop-shadow"/><feMergeNode in="ambient-shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    renderPremiumAssetDefs()
  ].join("");
}

function isPublicationLineScene(nodes: SceneNode[]): boolean {
  const profiles = nodes.map((node) => nodeStyleProfile(node)).filter(Boolean);
  return profiles.length > 0 && profiles.every((profile) => profile === "publication-line");
}

function nodeStyleProfile(node: SceneNode): string | undefined {
  if (node.kind === "symbol") {
    const payload = node.payload as SymbolPayload;
    return payload.styleProfile ?? payload.appearance?.styleProfile;
  }
  if (node.kind === "image") {
    const payload = node.payload as ImagePayload;
    return payload.styleProfile;
  }
  return undefined;
}

function renderNodeSvg(node: SceneNode, context: RenderContext = { lineSafe: false }): string {
  const transform = `translate(${fmt(node.transform.x)} ${fmt(node.transform.y)}) rotate(${fmt(node.transform.rotation)} ${fmt(node.transform.width / 2)} ${fmt(node.transform.height / 2)}) scale(${fmt(node.transform.scaleX)} ${fmt(node.transform.scaleY)})`;
  const depth = depthForNode(node);
  const filter = filterForDepth(depth, node, context);
  return `<g id="${escapeXml(node.id)}" data-kind="${node.kind}" data-depth="${depth}" data-claim-status="${node.claimStatus}" transform="${transform}"><g class="node-body" data-depth="${depth}"${filter}>${renderNodeBody(node, context)}</g></g>`;
}

function depthForNode(node: SceneNode): DepthLevel {
  if (node.style.depth) return node.style.depth;
  if (node.style.shadow) return "floating";
  if (node.kind === "text" || node.kind === "connector") return "none";
  if (node.kind === "symbol" || node.kind === "image") return "floating";
  if (node.kind === "plot" || node.kind === "shape" || node.kind === "annotation") return "raised";
  return "surface";
}

function filterForDepth(depth: DepthLevel, node: SceneNode, context: RenderContext): string {
  if (context.lineSafe) return "";
  if (node.claimStatus === "unsupported-claim") return ` filter="url(#danger-object-shadow)"`;
  if (isRiskVisualNode(node)) return ` filter="url(#warning-object-shadow)"`;
  if (depth === "hero") return ` filter="url(#hero-shadow)"`;
  if (depth === "floating") return ` filter="url(#soft-object-shadow)"`;
  if (depth === "raised") return ` filter="url(#raised-panel-shadow)"`;
  return "";
}

function isRiskVisualNode(node: SceneNode): boolean {
  if (node.kind === "annotation") return true;
  if (node.kind !== "symbol") return false;
  const payload = node.payload as Partial<SymbolPayload>;
  return Boolean(payload.assetId && /risk|review|permission|audit|policy|safety|biosecurity|durc|biosafety|containment|refusal/.test(payload.assetId));
}

function renderNodeBody(node: SceneNode, context: RenderContext): string {
  if (node.kind === "text") return renderText(node.payload as TextPayload, node);
  if (node.kind === "shape") return renderShape(node.payload as ShapePayload, node, context);
  if (node.kind === "symbol") return renderSymbol(node.payload as SymbolPayload, node);
  if (node.kind === "connector") return renderConnector(node.payload as ConnectorPayload, node);
  if (node.kind === "plot") return renderPlotSvg((node.payload as { spec: PlotSpec }).spec, node.transform.width, node.transform.height);
  if (node.kind === "image") return renderImage(node.payload as ImagePayload, node);
  if (node.kind === "annotation") {
    const text = (node.payload as { text: string }).text;
    return renderShape({ shape: "round-rect", label: text }, node, context);
  }
  return renderShape({ shape: "round-rect", label: node.name }, node, context);
}

function renderText(payload: TextPayload, node: SceneNode): string {
  const style = node.style;
  const align = payload.align ?? "middle";
  const x = align === "start" ? 0 : align === "end" ? node.transform.width : node.transform.width / 2;
  const fontSize = style.fontSize ?? 20;
  const lineHeight = fontSize * 1.18;
  const maxChars = Math.max(8, Math.floor(node.transform.width / (fontSize * 0.56)));
  const maxLines = Math.max(1, Math.floor(node.transform.height / lineHeight));
  const lines = wrapWords(payload.text, maxChars, maxLines);
  const y = node.transform.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines.map((line, index) => `<tspan x="${fmt(x)}" dy="${index === 0 ? 0 : fmt(lineHeight)}">${escapeXml(line)}</tspan>`).join("");
  return `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="${align}" dominant-baseline="middle" fill="${escapeXml(style.color ?? "#0f172a")}" font-family="${escapeXml(style.fontFamily ?? "Arial, sans-serif")}" font-size="${fmt(fontSize)}" font-weight="${escapeXml(String(style.fontWeight ?? 500))}">${tspans}</text>`;
}

function renderShape(payload: ShapePayload, node: SceneNode, context: RenderContext = { lineSafe: false }): string {
  const style = node.style;
  const fill = escapeXml(style.fill ?? "#ffffff");
  const stroke = escapeXml(style.stroke ?? "#334155");
  const strokeWidth = fmt(style.strokeWidth ?? 2);
  const opacity = fmt(style.opacity ?? 1);
  const width = node.transform.width;
  const height = node.transform.height;
  const label = payload.label ? `<text x="${fmt(width / 2)}" y="${fmt(height / 2)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeXml(style.color ?? "#0f172a")}" font-family="${escapeXml(style.fontFamily ?? "Arial, sans-serif")}" font-size="${fmt(style.fontSize ?? 16)}" font-weight="${escapeXml(String(style.fontWeight ?? 600))}">${escapeXml(payload.label)}</text>` : "";
  if (payload.shape === "line") {
    const y = height > 1 ? height / 2 : 0.5;
    const className = context.lineSafe ? "journal-divider-rule" : "shape-line";
    return `<path class="${className}" d="M0,${fmt(y)} H${fmt(width)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>${label}`;
  }
  if (payload.shape === "ellipse") {
    if (context.lineSafe) return `<ellipse cx="${fmt(width / 2)}" cy="${fmt(height / 2)}" rx="${fmt(width / 2)}" ry="${fmt(height / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>${label}`;
    const rim = `<ellipse cx="${fmt(width / 2)}" cy="${fmt(height / 2)}" rx="${fmt(Math.max(0, width / 2 - 1.5))}" ry="${fmt(Math.max(0, height / 2 - 1.5))}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.5"/>`;
    const shine = `<ellipse cx="${fmt(width * 0.34)}" cy="${fmt(height * 0.28)}" rx="${fmt(width * 0.16)}" ry="${fmt(height * 0.07)}" fill="#ffffff" opacity="0.35"/>`;
    return `<ellipse cx="${fmt(width / 2)}" cy="${fmt(height / 2)}" rx="${fmt(width / 2)}" ry="${fmt(height / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>${rim}${shine}${label}`;
  }
  if (payload.shape === "diamond") {
    const points = `${fmt(width / 2)},0 ${fmt(width)},${fmt(height / 2)} ${fmt(width / 2)},${fmt(height)} 0,${fmt(height / 2)}`;
    if (context.lineSafe) return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>${label}`;
    const inset = `${fmt(width / 2)},${fmt(2)} ${fmt(width - 2)},${fmt(height / 2)} ${fmt(width / 2)},${fmt(height - 2)} 2,${fmt(height / 2)}`;
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/><polygon points="${inset}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.42"/>${label}`;
  }
  const radius = payload.shape === "round-rect" ? Math.min(18, width / 5, height / 5) : 0;
  if (context.lineSafe) return renderJournalPanelShape(width, height, style, opacity, label);
  const highlightHeight = Math.min(30, Math.max(8, height * 0.42));
  const darkSurface = isDarkColor(fill);
  const highlight = `<rect x="1" y="1" width="${fmt(Math.max(0, width - 2))}" height="${fmt(highlightHeight)}" rx="${fmt(Math.max(0, radius - 1))}" fill="#ffffff" opacity="${darkSurface ? "0.08" : "0.26"}" pointer-events="none"/>`;
  const rim = `<rect x="1" y="1" width="${fmt(Math.max(0, width - 2))}" height="${fmt(Math.max(0, height - 2))}" rx="${fmt(Math.max(0, radius - 1))}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="${darkSurface ? "0.18" : "0.48"}" pointer-events="none"/>`;
  return `<rect x="0" y="0" width="${fmt(width)}" height="${fmt(height)}" rx="${fmt(radius)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>${highlight}${rim}${label}`;
}

function renderJournalPanelShape(width: number, height: number, style: Style, opacity: string, label: string): string {
  const rawStrokeWidth = Number(style.strokeWidth ?? 1.1);
  const strokeWidth = fmt(Math.min(1.35, Math.max(0.75, Number.isFinite(rawStrokeWidth) ? rawStrokeWidth : 1.1)));
  return `<rect class="journal-panel-frame" x="0" y="0" width="${fmt(width)}" height="${fmt(height)}" rx="0" fill="#ffffff" stroke="#111827" stroke-width="${strokeWidth}" opacity="${opacity}"/>${label}`;
}

function renderSymbol(payload: SymbolPayload, node: SceneNode): string {
  const style = node.style;
  const width = node.transform.width;
  const height = node.transform.height;
  const label = payload.label ?? node.name;
  const labelMetrics = symbolLabelMetrics(label, width, Math.min(Number(style.fontSize ?? 12), 12));
  const showLabel = (payload as { showLabel?: boolean }).showLabel !== false && payload.appearance?.labelVisible !== false;
  let glyph: string;
  try {
    const asset = getAsset(payload.assetId);
	    glyph = renderPremiumAssetGlyph(asset, width, showLabel ? Math.max(36, height - 24) : height, {
	      variant: payload.variant ?? "soft-3d-vector",
	      styleProfile: payload.styleProfile ?? payload.appearance?.styleProfile,
	      label,
	      showLabel: false,
	      appearance: {
	        accent: style.stroke,
	        stroke: style.stroke,
	        strokeWidth: style.strokeWidth,
	        labelColor: style.color,
	        ...payload.appearance
	      }
	    });
  } catch {
    glyph = `<circle cx="${fmt(width / 2)}" cy="${fmt((height - 24) * 0.42)}" r="${fmt(Math.min(width, height) * 0.22)}" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>`;
  }
  const profile = payload.styleProfile ?? payload.appearance?.styleProfile;
  if (!showLabel) return glyph;
  if (profile === "publication-line") return renderJournalSymbolLabel(glyph, labelMetrics, width, height, style);
  const labelFill = profile === "dark-talk" ? "#0f172a" : "#ffffff";
  const labelStroke = profile === "dark-talk" ? "#334155" : "none";
  const labelOpacity = profile === "dark-talk" ? "0.78" : "0.58";
  return [
    glyph,
    `<rect class="symbol-label-pill" x="${fmt((width - labelMetrics.boxWidth) / 2)}" y="${fmt(height - 22)}" width="${fmt(labelMetrics.boxWidth)}" height="${fmt(17)}" rx="${fmt(8.5)}" fill="${labelFill}" stroke="${labelStroke}" stroke-width="${labelStroke === "none" ? "0" : "0.8"}" opacity="${labelOpacity}"/>`,
    `<text class="symbol-label-text" x="${fmt(width / 2)}" y="${fmt(height - 9)}" text-anchor="middle" fill="${escapeXml(style.color ?? "#0f172a")}" font-family="${escapeXml(style.fontFamily ?? "Arial, sans-serif")}" font-size="${fmt(labelMetrics.fontSize)}" font-weight="680">${escapeXml(labelMetrics.text)}</text>`
  ].join("");
}

function renderJournalSymbolLabel(glyph: string, labelMetrics: { text: string; fontSize: number; boxWidth: number }, width: number, height: number, style: Style): string {
  const labelWidth = Math.max(24, labelMetrics.boxWidth - 12);
  const x1 = (width - labelWidth) / 2;
  const x2 = (width + labelWidth) / 2;
  const ruleY = height - 22;
  const textY = height - 8.5;
  return [
    glyph,
    `<path class="symbol-journal-label-rule" d="M${fmt(x1)},${fmt(ruleY)} H${fmt(x2)}" fill="none" stroke="#111827" stroke-width="0.65" opacity="0.58"/>`,
    `<text class="symbol-journal-label" x="${fmt(width / 2)}" y="${fmt(textY)}" text-anchor="middle" fill="${escapeXml(style.color ?? "#111827")}" font-family="${escapeXml(style.fontFamily ?? "Arial, sans-serif")}" font-size="${fmt(labelMetrics.fontSize)}" font-weight="620">${escapeXml(labelMetrics.text)}</text>`
  ].join("");
}

function symbolLabelMetrics(label: string, width: number, baseFontSize: number): { text: string; fontSize: number; boxWidth: number } {
  const text = String(label);
  const maxBoxWidth = Math.max(34, width - 10);
  const targetBoxWidth = Math.max(width * 0.68, Math.min(maxBoxWidth, text.length * baseFontSize * 0.54 + 14));
  const boxWidth = Math.min(maxBoxWidth, Math.max(34, targetBoxWidth));
  const availableTextWidth = Math.max(12, boxWidth - 12);
  const fittedFontSize = Math.min(baseFontSize, Math.max(8.2, availableTextWidth / Math.max(1, text.length * 0.54)));
  const maxChars = Math.max(4, Math.floor(availableTextWidth / Math.max(4.5, fittedFontSize * 0.54)));
  return {
    text: text.length > maxChars ? shortPlotLabel(text, maxChars) : text,
    fontSize: fittedFontSize,
    boxWidth
  };
}

function renderConnector(payload: ConnectorPayload, node: SceneNode): string {
  const points = payload.points.length ? payload.points : [{ x: 0, y: 0 }, { x: node.transform.width, y: node.transform.height }];
  const local = points.map((point) => ({ x: point.x - node.transform.x, y: point.y - node.transform.y }));
  const d = local.map((point, index) => `${index === 0 ? "M" : "L"}${fmt(point.x)},${fmt(point.y)}`).join(" ");
  const dash = node.style.lineStyle === "dashed" ? ` stroke-dasharray="8 8"` : node.style.lineStyle === "dotted" ? ` stroke-dasharray="2 8"` : "";
  const marker = node.style.arrowEnd === false ? "" : ` marker-end="url(#arrow-end)"`;
  const label = payload.label ? `<text x="${fmt(node.transform.width / 2)}" y="${fmt(node.transform.height / 2 - 8)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#334155">${escapeXml(payload.label)}</text>` : "";
  return `<path d="${d}" fill="none" stroke="${escapeXml(node.style.stroke ?? "#334155")}" stroke-width="${fmt(node.style.strokeWidth ?? 3)}"${dash}${marker}/>${label}`;
}

function renderImage(payload: ImagePayload, node: SceneNode): string {
  if (payload.assetId) {
    try {
      const asset = getAnyAsset(payload.assetId);
      if (isRealisticAsset(asset)) {
        return renderRealisticAssetGlyph(asset, node.transform.width, node.transform.height, {
          styleProfile: payload.styleProfile,
          appearance: payload.appearance,
          crop: payload.crop,
          mask: payload.mask,
          captionAnchor: payload.captionAnchor,
          label: payload.alt ?? node.name
        });
      }
    } catch {
      // Fall back to the explicit src below when a local project references a private image asset.
    }
  }
  return `<image href="${escapeXml(payload.src)}" width="${fmt(node.transform.width)}" height="${fmt(node.transform.height)}" preserveAspectRatio="xMidYMid meet"><title>${escapeXml(payload.alt ?? node.name)}</title></image>`;
}

function renderPlotSvg(spec: PlotSpec, width: number, height: number): string {
  const compact = height < 170 || width < 460;
  const compactHeatmap = compact && spec.plotType === "heatmap";
  const barPlot = spec.plotType === "bar";
  const theme = plotTheme(spec);
  const footerItems = journalPlotFooterItems(spec);
  const compactFooterPadding = compact && footerItems.length ? Math.min(14, footerItems.length * 6 + 2) : 0;
  const margin = compact
    ? {
        left: compactHeatmap ? 66 : 48,
        right: compactHeatmap ? 58 : 18,
        top: compactHeatmap ? 32 : 28,
        bottom: (barPlot ? 44 : compactHeatmap ? 36 : 28) + compactFooterPadding
      }
    : {
        left: 56,
        right: compactHeatmap ? 70 : 24,
        top: 42,
        bottom: (barPlot ? 54 : 48) + Math.min(30, footerItems.length * 12)
      };
  const plotWidth = Math.max(10, width - margin.left - margin.right);
  const plotHeight = Math.max(10, height - margin.top - margin.bottom);
  const rows = spec.table.rows;
  const xColumn = spec.encodings.x;
  const yColumn = spec.encodings.y;
  const valueColumn = spec.encodings.value;
  const groupColumn = spec.encodings.group ?? spec.encodings.color;
  const xAxisLabel = journalAxisLabel(spec, "x", xColumn ?? "");
  const yAxisLabel = journalAxisLabel(spec, "y", spec.plotType === "volcano" ? `-log10(${yColumn ?? "p"})` : yColumn ?? valueColumn ?? "");
  const title = `<text x="${fmt(width / 2)}" y="${compact ? 18 : 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${compact ? 12.5 : 18}" font-weight="760" fill="${theme.text}">${escapeXml(spec.title)}</text>`;
  const frameRadius = theme.mode === "publication" ? 0 : 10;
  const frame = `<rect class="plot-frame${compact ? " plot-compact-frame" : ""}${theme.mode === "publication" ? " plot-journal-frame" : ""}" x="0" y="0" width="${fmt(width)}" height="${fmt(height)}" rx="${fmt(frameRadius)}" fill="${theme.frameFill}" stroke="${theme.frameStroke}"/>`;
  const axes = `<path d="M${margin.left},${height - margin.bottom} H${width - margin.right} M${margin.left},${height - margin.bottom} V${margin.top}" stroke="${theme.axis}" stroke-width="${compact ? 1 : 1.5}" fill="none"/>`;
  const labels = compact
    ? `<text class="plot-axis-label-y" transform="translate(15 ${fmt(margin.top + plotHeight / 2)}) rotate(-90)" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.1" font-weight="700" fill="${theme.muted}">${escapeXml(shortPlotLabel(yAxisLabel, footerItems.length ? 40 : 12))}</text><text class="plot-axis-label-x" x="${fmt(margin.left + plotWidth / 2)}" y="${fmt(height - (footerItems.length ? footerItems.length * 7 + 12 : 8))}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.2" font-weight="700" fill="${theme.muted}">${escapeXml(shortPlotLabel(xAxisLabel, footerItems.length ? 52 : 14))}</text>${renderCompactPlotFooterItems(width, height, footerItems, theme)}`
    : `${renderPlotAxisLabels(xAxisLabel, yAxisLabel, width, height, margin, barPlot, footerItems.length, theme)}${renderPlotFooterItems(spec, width, height, footerItems, theme)}`;
  if (spec.plotType === "heatmap" && xColumn && yColumn && valueColumn) {
    return `${frame}${title}${renderHeatmap(rows, xColumn, yColumn, valueColumn, margin.left, margin.top, plotWidth, plotHeight, theme)}${labels}`;
  }
  if (["bar", "box", "violin", "dot"].includes(spec.plotType) && xColumn && yColumn) {
    return `${frame}${title}${axes}${renderGroupedPlot(spec, margin.left, margin.top, plotWidth, plotHeight, theme)}${labels}`;
  }
  if (spec.plotType === "line" && xColumn && yColumn) {
    return `${frame}${title}${axes}${renderLinePlot(spec, margin.left, margin.top, plotWidth, plotHeight, theme)}${labels}`;
  }
  if (xColumn && yColumn) {
    return `${frame}${title}${axes}${renderScatterLike(spec, margin.left, margin.top, plotWidth, plotHeight, groupColumn, theme)}${labels}`;
  }
  return `${frame}${title}<text x="${fmt(width / 2)}" y="${fmt(height / 2)}" text-anchor="middle" fill="${theme.muted}" font-family="Arial, sans-serif" font-size="16">Plot encodings incomplete</text>`;
}

function journalPlotMetadata(spec: PlotSpec): Record<string, unknown> {
  const extended = spec as PlotSpec & { journalPlot?: unknown };
  return typeof extended.journalPlot === "object" && extended.journalPlot !== null ? extended.journalPlot as Record<string, unknown> : {};
}

function journalAxisLabel(spec: PlotSpec, axis: "x" | "y", fallback: string): string {
  const metadata = journalPlotMetadata(spec);
  const axisLabels = metadata.axisLabels;
  if (typeof axisLabels === "object" && axisLabels !== null) {
    const label = (axisLabels as Record<string, unknown>)[axis];
    if (typeof label === "string" && label.trim()) return label;
  }
  const axes = (spec as PlotSpec & { axes?: unknown }).axes;
  if (typeof axes === "object" && axes !== null) {
    const label = (axes as Record<string, unknown>)[axis];
    if (typeof label === "string" && label.trim()) return label;
  }
  return fallback;
}

function journalPlotFooterItems(spec: PlotSpec): { className: string; label: string; text: string }[] {
  const metadata = journalPlotMetadata(spec);
  const extended = spec as PlotSpec & { legend?: unknown; sourceDataNote?: unknown };
  const legend = typeof metadata.legend === "string" && metadata.legend.trim()
    ? metadata.legend
    : typeof extended.legend === "string" && extended.legend.trim()
      ? extended.legend
      : "";
  const sourceData = typeof metadata.sourceData === "string" && metadata.sourceData.trim() ? metadata.sourceData : "";
  const sourceDataNote = typeof metadata.sourceDataNote === "string" && metadata.sourceDataNote.trim()
    ? metadata.sourceDataNote
    : typeof extended.sourceDataNote === "string" && extended.sourceDataNote.trim()
      ? extended.sourceDataNote
      : "";
  const items: { className: string; label: string; text: string }[] = [];
  if (legend) items.push({ className: "plot-journal-legend", label: "Legend", text: legend });
  if (sourceData || sourceDataNote) {
    items.push({
      className: "plot-source-data-note",
      label: "Source data",
      text: [sourceData, sourceDataNote].filter(Boolean).join(" - ")
    });
  }
  return items;
}

function renderPlotAxisLabels(xAxisLabel: string, yAxisLabel: string, width: number, height: number, margin: { left: number; right: number; top: number; bottom: number }, barPlot: boolean, footerLineCount: number, theme: PlotTheme): string {
  const axisY = height - margin.bottom;
  const xLabelY = axisY + Math.min(barPlot ? 41 : 31, margin.bottom - (footerLineCount ? footerLineCount * 11 + 12 : 12));
  return `<text class="plot-axis-label-x" x="${fmt(margin.left + (width - margin.left - margin.right) / 2)}" y="${fmt(xLabelY)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12.2" font-weight="${theme.mode === "publication" ? "700" : "650"}" fill="${theme.label}">${escapeXml(xAxisLabel)}</text><text class="plot-axis-label-y" transform="translate(16 ${fmt(margin.top + (height - margin.top - margin.bottom) / 2)}) rotate(-90)" text-anchor="middle" font-family="Arial, sans-serif" font-size="12.2" font-weight="${theme.mode === "publication" ? "700" : "650"}" fill="${theme.label}">${escapeXml(yAxisLabel)}</text>`;
}

function renderPlotFooterItems(spec: PlotSpec, width: number, height: number, items: { className: string; label: string; text: string }[], theme: PlotTheme): string {
  const footerItems = items.length
    ? items
    : [{ className: "plot-footer", label: "Plot", text: `${spec.table.rows.length} rows / editable PlotSpec` }];
  const fontSize = items.length ? 8.2 : 9.2;
  const startY = height - (footerItems.length - 1) * 10 - 7;
  const footerRule = theme.mode === "publication" && items.length
    ? `<path class="plot-journal-footer-rule" d="M${fmt(18)},${fmt(startY - 8)} H${fmt(width - 18)}" fill="none" stroke="${theme.grid}" stroke-width="0.65" opacity="0.85"/>`
    : "";
  return `${footerRule}${footerItems
    .map((item, index) => {
      const className = `${item.className}${theme.mode === "publication" && items.length ? " plot-journal-metadata-footer" : ""}`;
      return `<text class="${className}" x="${fmt(width / 2)}" y="${fmt(startY + index * 10)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fmt(fontSize)}" font-weight="${item.className === "plot-footer" ? "700" : "650"}" fill="${theme.muted}">${escapeXml(`${item.label}: ${shortPlotLabel(item.text, 92)}`)}</text>`;
    })
    .join("")}`;
}

function renderCompactPlotFooterItems(width: number, height: number, items: { className: string; label: string; text: string }[], theme: PlotTheme): string {
  if (!items.length) return "";
  const startY = height - (items.length - 1) * 7 - 5;
  const footerRule = theme.mode === "publication"
    ? `<path class="plot-journal-footer-rule" d="M${fmt(16)},${fmt(startY - 5.5)} H${fmt(width - 16)}" fill="none" stroke="${theme.grid}" stroke-width="0.6" opacity="0.82"/>`
    : "";
  return `${footerRule}${items
    .map((item, index) => `<text class="${item.className} plot-compact-footer${theme.mode === "publication" ? " plot-journal-metadata-footer" : ""}" data-compact-footer="true" x="${fmt(width / 2)}" y="${fmt(startY + index * 7)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.4" font-weight="650" fill="${theme.muted}">${escapeXml(compactFooterText(item))}</text>`)
    .join("")}`;
}

function compactFooterText(item: { className: string; label: string; text: string }): string {
  if (item.className === "plot-source-data-note") {
    const [sourceData] = item.text.split(" - ");
    return `${item.label}: ${shortPlotLabel(`${sourceData.trim()} / replace source data`, 68)}`;
  }
  return `${item.label}: ${shortPlotLabel(item.text, 68)}`;
}

function renderScatterLike(spec: PlotSpec, x: number, y: number, width: number, height: number, groupColumn?: string, theme = plotTheme(spec)): string {
  const xColumn = spec.encodings.x as string;
  const yColumn = spec.encodings.y as string;
  const labelColumn = spec.encodings.label;
  const points = spec.table.rows
    .map((row) => {
      const rawX = Number(row[xColumn]);
      const rawY = Number(row[yColumn]);
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return null;
      return {
        rawX,
        rawY: spec.plotType === "volcano" ? -Math.log10(Math.max(rawY, 1e-300)) : rawY,
        group: groupColumn ? String(row[groupColumn] ?? "") : "",
        label: labelColumn ? String(row[labelColumn] ?? "") : ""
      };
    })
    .filter((point): point is { rawX: number; rawY: number; group: string; label: string } => Boolean(point));
  if (!points.length) return "";
  if (spec.plotType === "volcano") {
    return renderVolcanoPlot(points, x, y, width, height, theme);
  }
  if (spec.plotType === "embedding-scatter") {
    return renderEmbeddingScatter(points, x, y, width, height, theme);
  }
  const sx = linearScale(points.map((point) => point.rawX), x, x + width);
  const sy = linearScale(points.map((point) => point.rawY), y + height, y);
  return points
    .map((point) => `<circle cx="${fmt(sx(point.rawX))}" cy="${fmt(sy(point.rawY))}" r="5" fill="${theme.color(point.group)}" opacity="0.82" stroke="${theme.pointStroke}" stroke-width="0.5"/>`)
    .join("");
}

type PlotTheme = {
  mode: "consulting" | "publication" | "dark";
  frameFill: string;
  frameStroke: string;
  fieldFill: string;
  grid: string;
  axis: string;
  text: string;
  label: string;
  muted: string;
  pointStroke: string;
  color: (group: string) => string;
  heat: (t: number) => string;
};

function plotTheme(spec: PlotSpec): PlotTheme {
  const fill = spec.style?.fill ?? "#ffffff";
  const stroke = spec.style?.stroke ?? "#cbd5e1";
  const color = spec.style?.color ?? "#0f172a";
  const isDark = isDarkColor(fill);
  const isPublication = !isDark && /^#(?:0{6}|1[0-9a-f]{5}|111827|000000)$/i.test(stroke.replace("#", "#"));
  if (isDark) {
    return {
      mode: "dark",
      frameFill: fill,
      frameStroke: stroke,
      fieldFill: "#111827",
      grid: "#334155",
      axis: "#94a3b8",
      text: color,
      label: "#cbd5e1",
      muted: "#94a3b8",
      pointStroke: "#0f172a",
      color: (group) => darkPalette(group),
      heat: (t) => heatColorDark(t)
    };
  }
  if (isPublication) {
    return {
      mode: "publication",
      frameFill: "#ffffff",
      frameStroke: "#111827",
      fieldFill: "#ffffff",
      grid: "#d1d5db",
      axis: "#111827",
      text: "#111827",
      label: "#374151",
      muted: "#4b5563",
      pointStroke: "#111827",
      color: (group) => publicationPalette(group),
      heat: (t) => heatColorPublication(t)
    };
  }
  return {
    mode: "consulting",
    frameFill: fill,
    frameStroke: stroke,
    fieldFill: "#f8fafc",
    grid: "#e2e8f0",
    axis: "#475569",
    text: color,
    label: "#475569",
    muted: "#64748b",
    pointStroke: "#ffffff",
    color: (group) => palette(group),
    heat: (t) => heatColor(t)
  };
}

function renderEmbeddingScatter(points: { rawX: number; rawY: number; group: string; label: string }[], x: number, y: number, width: number, height: number, theme: PlotTheme): string {
  const compact = height < 95 || width < 310;
  const sx = linearScale(points.map((point) => point.rawX), x, x + width);
  const sy = linearScale(points.map((point) => point.rawY), y + height, y);
  const screenPoints = points.map((point) => ({
    ...point,
    group: point.group || "Cells",
    x: sx(point.rawX),
    y: sy(point.rawY)
  }));
  const groups = uniqueStrings(screenPoints.map((point) => point.group)).slice(0, compact ? 4 : 6);
  const grid = [0.25, 0.5, 0.75]
    .map((ratio) => {
      const gx = x + width * ratio;
      const gy = y + height * ratio;
      return `<path class="plot-embedding-grid" d="M${fmt(gx)},${fmt(y)} V${fmt(y + height)} M${fmt(x)},${fmt(gy)} H${fmt(x + width)}" stroke="${theme.grid}" stroke-width="0.65" opacity="${ratio === 0.5 ? "0.62" : "0.4"}"/>`;
    })
    .join("");
  const hulls = groups
    .map((group) => renderEmbeddingHull(group, screenPoints.filter((point) => point.group === group), compact, theme))
    .join("");
  const marks = screenPoints
    .map((point) => `<circle class="plot-embedding-point" data-group="${escapeXml(point.group)}" cx="${fmt(point.x)}" cy="${fmt(point.y)}" r="${fmt(compact ? 3.4 : 4.4)}" fill="${theme.color(point.group)}" opacity="0.9" stroke="${theme.pointStroke}" stroke-width="${compact ? "0.8" : "1"}"/>`)
    .join("");
  const centroidMarks = groups
    .map((group) => {
      const groupPoints = screenPoints.filter((point) => point.group === group);
      const centroid = embeddingCentroid(groupPoints);
      return `<circle class="plot-embedding-centroid" data-group="${escapeXml(group)}" cx="${fmt(centroid.x)}" cy="${fmt(centroid.y)}" r="${fmt(compact ? 4.6 : 5.8)}" fill="none" stroke="${theme.color(group)}" stroke-width="1.1" opacity="0.72"/>`;
    })
    .join("");
  const labels = groups
    .map((group, index) => renderEmbeddingClusterLabel(group, screenPoints.filter((point) => point.group === group), x, y, width, height, compact, index, theme))
    .join("");
  const summary = `<text class="plot-embedding-summary" x="${fmt(x + width - 4)}" y="${fmt(y + height - 5)}" text-anchor="end" font-family="Arial, sans-serif" font-size="${compact ? "7.4" : "8.8"}" font-weight="760" fill="${theme.muted}">${groups.length} clusters / n=${points.length}</text>`;
  return `<g class="plot-embedding-layer"><rect class="plot-embedding-field" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="7" fill="${theme.fieldFill}" stroke="${theme.grid}" opacity="${theme.mode === "dark" ? "0.95" : "0.82"}"/>${grid}${hulls}${marks}${centroidMarks}${labels}${summary}</g>`;
}

function renderEmbeddingHull(group: string, points: { x: number; y: number }[], compact: boolean, theme: PlotTheme): string {
  if (!points.length) return "";
  const color = theme.color(group);
  const centroid = embeddingCentroid(points);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padX = compact ? 9 : 15;
  const padY = compact ? 7 : 12;
  if (points.length < 3) {
    const rx = Math.max(compact ? 13 : 18, (maxX - minX) / 2 + padX);
    const ry = Math.max(compact ? 10 : 14, (maxY - minY) / 2 + padY);
    return `<ellipse class="plot-embedding-cluster-hull" data-group="${escapeXml(group)}" cx="${fmt(centroid.x)}" cy="${fmt(centroid.y)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${color}" opacity="${theme.mode === "publication" ? "0.08" : "0.13"}" stroke="${color}" stroke-width="1.1"/>`;
  }
  const boundary = points
    .map((point) => {
      const dx = point.x - centroid.x;
      const dy = point.y - centroid.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      return {
        x: point.x + (dx / length) * padX,
        y: point.y + (dy / length) * padY,
        angle: Math.atan2(dy, dx)
      };
    })
    .sort((a, b) => a.angle - b.angle);
  const d = smoothClosedPath(boundary);
  const rim = theme.mode === "publication" ? "" : `<path class="plot-embedding-cluster-rim" d="${d}" fill="none" stroke="${theme.mode === "dark" ? "#0f172a" : "#ffffff"}" stroke-width="0.8" opacity="0.7"/>`;
  return `<path class="plot-embedding-cluster-hull" data-group="${escapeXml(group)}" d="${d}" fill="${color}" opacity="${theme.mode === "publication" ? "0.08" : "0.13"}" stroke="${color}" stroke-width="1.05"/>${rim}`;
}

function renderEmbeddingClusterLabel(group: string, points: { x: number; y: number }[], x: number, y: number, width: number, height: number, compact: boolean, index: number, theme: PlotTheme): string {
  const centroid = embeddingCentroid(points);
  const label = shortPlotLabel(group, compact ? 9 : 13);
  const fontSize = compact ? 7.6 : 9.4;
  const labelWidth = Math.max(compact ? 34 : 44, label.length * (compact ? 5.1 : 6) + 15);
  const labelHeight = compact ? 14 : 17;
  const labelX = clamp(centroid.x, x + labelWidth / 2 + 2, x + width - labelWidth / 2 - 2);
  const labelY = clamp(centroid.y - (compact ? 13 : 16) + (index % 2) * (compact ? 5 : 7), y + labelHeight / 2 + 2, y + height - labelHeight / 2 - 12);
  return `<g class="plot-embedding-cluster-label" data-group="${escapeXml(group)}"><rect class="plot-embedding-label-bg" x="${fmt(labelX - labelWidth / 2)}" y="${fmt(labelY - labelHeight / 2)}" width="${fmt(labelWidth)}" height="${fmt(labelHeight)}" rx="${fmt(labelHeight / 2)}" fill="${theme.mode === "dark" ? "#1e293b" : "#ffffff"}" stroke="${theme.color(group)}" stroke-width="0.8" opacity="0.92"/><text x="${fmt(labelX)}" y="${fmt(labelY + fontSize * 0.33)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fmt(fontSize)}" font-weight="800" fill="${theme.label}">${escapeXml(label)}</text></g>`;
}

function embeddingCentroid(points: { x: number; y: number }[]): { x: number; y: number } {
  const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
  return { x: sum.x / Math.max(points.length, 1), y: sum.y / Math.max(points.length, 1) };
}

function smoothClosedPath(points: { x: number; y: number }[]): string {
  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = midpoint(points[points.length - 1], points[0]);
  return `${points.reduce((path, point, index) => {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(point, next);
    return `${path} Q${fmt(point.x)},${fmt(point.y)} ${fmt(mid.x)},${fmt(mid.y)}`;
  }, `M${fmt(start.x)},${fmt(start.y)}`)} Z`;
}

function renderVolcanoPlot(points: { rawX: number; rawY: number; group: string; label: string }[], x: number, y: number, width: number, height: number, theme: PlotTheme): string {
  const compact = height < 90 || width < 380;
  const fcThreshold = 1;
  const pThreshold = 4;
  const maxAbsX = Math.max(fcThreshold * 1.55, ...points.map((point) => Math.abs(point.rawX))) * 1.08;
  const maxY = Math.max(pThreshold * 1.18, ...points.map((point) => point.rawY)) * 1.06;
  const sx = (value: number) => x + ((value + maxAbsX) / (maxAbsX * 2)) * width;
  const sy = (value: number) => y + height - (Math.max(0, value) / maxY) * height;
  const thresholdY = sy(pThreshold);
  const leftThresholdX = sx(-fcThreshold);
  const rightThresholdX = sx(fcThreshold);
  const xTicks = [-Math.ceil(maxAbsX), -fcThreshold, 0, fcThreshold, Math.ceil(maxAbsX)]
    .filter((value, index, values) => values.indexOf(value) === index && value >= -maxAbsX && value <= maxAbsX);
  const yTicks = [0, pThreshold / 2, pThreshold, Math.ceil(maxY)].filter((value, index, values) => values.indexOf(value) === index && value <= maxY);
  const grid = [
    ...xTicks.map((value) => `<g class="plot-volcano-axis-tick"><path class="plot-volcano-grid" d="M${fmt(sx(value))},${fmt(y)} V${fmt(y + height)}" stroke="${theme.grid}" stroke-width="0.65" opacity="${value === 0 ? "0.82" : "0.55"}"/><text x="${fmt(sx(value))}" y="${fmt(y + height + 11)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.2" font-weight="700" fill="${theme.muted}">${escapeXml(fmt(value))}</text></g>`),
    ...yTicks.map((value) => `<g class="plot-volcano-axis-tick"><path class="plot-volcano-grid" d="M${fmt(x)},${fmt(sy(value))} H${fmt(x + width)}" stroke="${theme.grid}" stroke-width="0.65" opacity="${value === pThreshold ? "0.2" : "0.58"}"/><text x="${fmt(x - 6)}" y="${fmt(sy(value) + 2.8)}" text-anchor="end" font-family="Arial, sans-serif" font-size="7.2" font-weight="700" fill="${theme.muted}">${escapeXml(fmt(value))}</text></g>`)
  ].join("");
  const hitPoints = points
    .filter((point) => point.label && Math.abs(point.rawX) >= fcThreshold && point.rawY >= pThreshold)
    .sort((a, b) => b.rawY - a.rawY)
    .slice(0, compact ? 3 : 4);
  const guides = [
    `<rect class="plot-volcano-significance-zone" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(Math.max(0, leftThresholdX - x))}" height="${fmt(Math.max(0, thresholdY - y))}" fill="${theme.mode === "publication" ? "#111827" : "#ede9fe"}" opacity="${theme.mode === "publication" ? "0.04" : "0.18"}"/>`,
    `<rect class="plot-volcano-significance-zone" x="${fmt(rightThresholdX)}" y="${fmt(y)}" width="${fmt(Math.max(0, x + width - rightThresholdX))}" height="${fmt(Math.max(0, thresholdY - y))}" fill="${theme.mode === "publication" ? "#111827" : "#ccfbf1"}" opacity="${theme.mode === "publication" ? "0.04" : "0.18"}"/>`,
    `<path class="plot-volcano-threshold-line" d="M${fmt(leftThresholdX)},${fmt(y)} V${fmt(y + height)} M${fmt(rightThresholdX)},${fmt(y)} V${fmt(y + height)}" stroke="${theme.muted}" stroke-width="0.8" stroke-dasharray="4 5" opacity="0.62"/>`,
    `<path class="plot-volcano-threshold-line" d="M${fmt(x)},${fmt(thresholdY)} H${fmt(x + width)}" stroke="${theme.mode === "publication" ? "#111827" : "#f59e0b"}" stroke-width="0.9" stroke-dasharray="4 5" opacity="0.78"/>`,
    `<path class="plot-volcano-zero-line" d="M${fmt(sx(0))},${fmt(y)} V${fmt(y + height)}" stroke="${theme.grid}" stroke-width="0.8" opacity="0.72"/>`,
    `<text class="plot-volcano-threshold-label" x="${fmt(x + 5)}" y="${fmt(Math.max(y + 10, thresholdY - 4))}" font-family="Arial, sans-serif" font-size="7.6" font-weight="700" fill="${theme.label}">adj. P &lt; 1e-4</text>`,
    `<text class="plot-volcano-effect-threshold-label" x="${fmt(sx(0))}" y="${fmt(y + 10)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.2" font-weight="700" fill="${theme.muted}">|log2FC| = 1</text>`,
    compact ? "" : `<text class="plot-volcano-direction-label" x="${fmt(x + 7)}" y="${fmt(y + height - 6)}" font-family="Arial, sans-serif" font-size="7.6" font-weight="800" fill="${theme.color("down")}">depleted</text><text class="plot-volcano-direction-label" x="${fmt(x + width - 7)}" y="${fmt(y + height - 6)}" text-anchor="end" font-family="Arial, sans-serif" font-size="7.6" font-weight="800" fill="${theme.color("up")}">enriched</text>`
  ].join("");
  const marks = points
    .sort((a, b) => Number(Math.abs(a.rawX) >= fcThreshold && a.rawY >= pThreshold) - Number(Math.abs(b.rawX) >= fcThreshold && b.rawY >= pThreshold))
    .map((point) => {
      const significant = Math.abs(point.rawX) >= fcThreshold && point.rawY >= pThreshold;
      const direction = point.rawX < -fcThreshold ? "down" : point.rawX > fcThreshold ? "up" : "neutral";
      const fill = significant ? (direction === "down" ? theme.color("down") : theme.color("up")) : theme.muted;
      const opacity = significant ? "0.9" : "0.5";
      const radius = significant ? Math.min(5.6, Math.max(4.3, 3.4 + point.rawY * 0.18)) : 3.4;
      const halo = significant && theme.mode !== "publication" ? `<circle class="plot-volcano-hit-halo" cx="${fmt(sx(point.rawX))}" cy="${fmt(sy(point.rawY))}" r="${fmt(radius + 3.6)}" fill="${fill}" opacity="0.13"/>` : "";
      return `${halo}<circle class="plot-volcano-point ${significant ? `significant ${direction}` : "background"}" data-group="${escapeXml(point.group)}" cx="${fmt(sx(point.rawX))}" cy="${fmt(sy(point.rawY))}" r="${fmt(radius)}" fill="${fill}" opacity="${opacity}" stroke="${theme.pointStroke}" stroke-width="${significant ? "1" : "0.45"}"/>`;
    })
    .join("");
  let upLabelIndex = 0;
  let downLabelIndex = 0;
  const labels = hitPoints
    .map((point, index) => {
      const pointX = sx(point.rawX);
      const pointY = sy(point.rawY);
      const placeLeft = point.rawX > 0;
      const stackIndex = placeLeft ? upLabelIndex++ : downLabelIndex++;
      const labelX = compact
        ? (placeLeft ? x + width - 12 : x + 12)
        : Math.max(x + 18, Math.min(x + width - 18, pointX + (placeLeft ? -24 : 24)));
      const labelY = compact
        ? Math.min(y + height - 8, y + 13 + stackIndex * 10)
        : Math.max(y + 12, Math.min(y + height - 8, pointY + (index % 2 ? 12 : -8)));
      return `<path class="plot-volcano-label-leader" d="M${fmt(pointX)},${fmt(pointY)} L${fmt(labelX + (placeLeft ? 4 : -4))},${fmt(labelY - 3)}" stroke="${theme.muted}" stroke-width="0.65" opacity="0.62"/><text class="plot-volcano-label" x="${fmt(labelX)}" y="${fmt(labelY)}" text-anchor="${placeLeft ? "end" : "start"}" font-family="Arial, sans-serif" font-size="8.4" font-weight="760" fill="${theme.label}">${escapeXml(shortPlotLabel(point.label, 8))}</text>`;
    })
    .join("");
  const legendX = x + width - 92;
  const legendY = y + 9;
  const legend = `<g class="plot-volcano-legend" transform="translate(${fmt(legendX)} ${fmt(legendY)})"><circle cx="0" cy="0" r="3.4" fill="${theme.color("up")}"/><text x="8" y="3" font-family="Arial, sans-serif" font-size="7.8" font-weight="700" fill="${theme.muted}">up hit</text><circle cx="45" cy="0" r="3.4" fill="${theme.color("down")}"/><text x="53" y="3" font-family="Arial, sans-serif" font-size="7.8" font-weight="700" fill="${theme.muted}">down</text></g>`;
  return `<g class="plot-volcano-layer">${grid}${guides}${marks}${labels}${legend}</g>`;
}

function renderLinePlot(spec: PlotSpec, x: number, y: number, width: number, height: number, theme: PlotTheme): string {
  const xColumn = spec.encodings.x as string;
  const yColumn = spec.encodings.y as string;
  const points = spec.table.rows
    .map((row) => ({ rawX: Number(row[xColumn]), rawY: Number(row[yColumn]) }))
    .filter((point) => Number.isFinite(point.rawX) && Number.isFinite(point.rawY))
    .sort((a, b) => a.rawX - b.rawX);
  if (!points.length) return "";
  const sx = linearScale(points.map((point) => point.rawX), x, x + width);
  const sy = linearScale(points.map((point) => point.rawY), y + height, y);
  const d = points.map((point, index) => `${index === 0 ? "M" : "L"}${fmt(sx(point.rawX))},${fmt(sy(point.rawY))}`).join(" ");
  const compact = height < 45 || width < 240;
  const stroke = theme.color("line");
  const yValues = points.map((point) => point.rawY);
  const tickValues = uniqueNumbers([Math.min(...yValues), Math.max(...yValues) / 2, Math.max(...yValues)]).slice(0, 4);
  const guides = tickValues
    .map((value) => `<path class="plot-line-grid" d="M${fmt(x)},${fmt(sy(value))} H${fmt(x + width)}" stroke="${theme.grid}" stroke-width="0.65" opacity="0.58"/>`)
    .join("");
  const marks = points.map((point) => `<circle class="plot-line-point" cx="${fmt(sx(point.rawX))}" cy="${fmt(sy(point.rawY))}" r="${compact ? 2.8 : 3.8}" fill="${stroke}" stroke="${theme.pointStroke}" stroke-width="${theme.mode === "publication" ? "0.8" : "1"}"/>`).join("");
  return `<g class="plot-line-layer">${guides}<path class="plot-line-path" d="${d}" fill="none" stroke="${stroke}" stroke-width="${compact ? 1.7 : 2.4}" stroke-linecap="round" stroke-linejoin="round"/>${marks}</g>`;
}

function renderGroupedPlot(spec: PlotSpec, x: number, y: number, width: number, height: number, theme = plotTheme(spec)): string {
  const xColumn = spec.encodings.x as string;
  const yColumn = spec.encodings.y as string;
  const groups = [...new Set(spec.table.rows.map((row) => String(row[xColumn] ?? "")))].filter(Boolean);
  const valuesByGroup = groups.map((group) => ({
    group,
    values: spec.table.rows.filter((row) => String(row[xColumn] ?? "") === group).map((row) => Number(row[yColumn])).filter(Number.isFinite)
  }));
  const allValues = valuesByGroup.flatMap((entry) => entry.values);
  const sy = linearScale(allValues, y + height, y);
  const band = width / Math.max(groups.length, 1);
  const compact = height < 48 || band < 118;
  const labelFont = compact ? 8.5 : 11;
  const labelY = y + height + (compact ? 14 : 18);
  const labelMaxChars = Math.max(compact ? 8 : 10, Math.floor(band / (compact ? 7.2 : 8.5)));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const baseline = sy(0);
  const tickValues = uniqueNumbers([minValue, 0, maxValue / 2, maxValue]).filter((value) => value >= minValue && value <= maxValue);
  const guides = tickValues.map((value) => `<g class="plot-bar-axis-tick"><path class="plot-bar-grid" d="M${fmt(x)},${fmt(sy(value))} H${fmt(x + width)}" stroke="${theme.grid}" stroke-width="${value === 0 ? "1" : "0.75"}" opacity="${value === 0 ? "0.9" : "0.62"}"/><text x="${fmt(x - 7)}" y="${fmt(sy(value) + 3)}" text-anchor="end" font-size="7.6" font-family="Arial" font-weight="700" fill="${theme.muted}">${escapeXml(fmt(value))}</text></g>`).join("");
  const threshold = spec.plotType === "bar" ? plotThresholdValue(spec) : undefined;
  const thresholdGuide = threshold !== undefined && threshold >= minValue && threshold <= maxValue
    ? `<g class="plot-bar-threshold" data-threshold="${escapeXml(fmt(threshold))}"><path class="plot-bar-threshold-line" d="M${fmt(x)},${fmt(sy(threshold))} H${fmt(x + width)}" stroke="${theme.mode === "publication" ? "#111827" : "#f59e0b"}" stroke-width="0.9" stroke-dasharray="4 4" opacity="0.78"/><text class="plot-bar-threshold-label" x="${fmt(x + width - 4)}" y="${fmt(Math.max(y + 9, sy(threshold) - 4))}" text-anchor="end" font-size="${compact ? "7.2" : "8.2"}" font-family="Arial" font-weight="760" fill="${theme.label}">threshold = ${escapeXml(fmt(threshold))}</text></g>`
    : "";
  const bars = valuesByGroup
    .map((entry, index) => {
      const cx = x + band * index + band / 2;
      const mean = entry.values.reduce((sum, value) => sum + value, 0) / Math.max(entry.values.length, 1);
      const categoryLabel = renderBarCategoryLabel(entry.group, cx, labelY, labelFont, labelMaxChars, compact ? 2 : 3, theme);
      if (spec.plotType === "bar") {
        const top = sy(mean);
        const barY = Math.min(top, baseline);
        const barHeight = Math.max(1, Math.abs(baseline - top));
        const fill = theme.color(entry.group);
        const valueLabel = compact && barHeight < 18 ? "" : `<text class="plot-bar-value-label" x="${fmt(cx)}" y="${fmt(Math.max(y + 8, barY - 5))}" text-anchor="middle" font-size="${fmt(compact ? 7.4 : 8.8)}" font-family="Arial" font-weight="800" fill="${theme.label}">${escapeXml(fmt(mean))}</text>`;
        const track = theme.mode === "publication" ? "" : `<rect class="plot-bar-track" x="${fmt(cx - band * 0.31)}" y="${fmt(y)}" width="${fmt(band * 0.62)}" height="${fmt(height)}" rx="${fmt(Math.min(5, band * 0.08))}" fill="${theme.fieldFill}" opacity="0.72"/>`;
        const barRadius = theme.mode === "publication" ? 0 : Math.min(4, band * 0.08);
        const highlight = theme.mode === "publication" ? "" : `<path class="plot-bar-highlight" d="M${fmt(cx - band * 0.22)},${fmt(barY + 3)} H${fmt(cx + band * 0.22)}" stroke="${theme.pointStroke}" stroke-width="1.1" opacity="0.54"/>`;
        return `${track}<rect class="plot-bar-mark" data-group="${escapeXml(entry.group)}" data-value="${escapeXml(fmt(mean))}" x="${fmt(cx - band * 0.26)}" y="${fmt(barY)}" width="${fmt(band * 0.52)}" height="${fmt(barHeight)}" rx="${fmt(barRadius)}" fill="${fill}" opacity="${theme.mode === "publication" ? "1" : "0.88"}"/>${highlight}${valueLabel}${categoryLabel}`;
      }
      const label = shortPlotLabel(entry.group, compact ? 15 : 20);
      if (spec.plotType === "dot") {
        return entry.values.map((value, offset) => `<circle cx="${fmt(cx + jitter(offset) * band * 0.18)}" cy="${fmt(sy(value))}" r="${compact ? 3 : 4}" fill="${theme.color(entry.group)}" opacity="0.72"/>`).join("") + `<text x="${fmt(cx)}" y="${fmt(labelY)}" text-anchor="middle" font-size="${fmt(labelFont)}" font-family="Arial" fill="${theme.label}">${escapeXml(label)}</text>`;
      }
      const sorted = [...entry.values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)] ?? mean;
      const q2 = sorted[Math.floor(sorted.length * 0.5)] ?? mean;
      const q3 = sorted[Math.floor(sorted.length * 0.75)] ?? mean;
      const min = sorted[0] ?? mean;
      const max = sorted[sorted.length - 1] ?? mean;
      if (spec.plotType === "violin") {
        return `<ellipse cx="${fmt(cx)}" cy="${fmt(sy(q2))}" rx="${fmt(band * 0.24)}" ry="${fmt(Math.max(8, Math.abs(sy(q1) - sy(q3)) / 1.4))}" fill="${theme.color(entry.group)}" opacity="0.5" stroke="${theme.color(entry.group)}"/><path d="M${fmt(cx)},${fmt(sy(min))} V${fmt(sy(max))}" stroke="${theme.color(entry.group)}"/><text x="${fmt(cx)}" y="${fmt(labelY)}" text-anchor="middle" font-size="${fmt(labelFont)}" font-family="Arial" fill="${theme.label}">${escapeXml(label)}</text>`;
      }
      return `<path d="M${fmt(cx)},${fmt(sy(min))} V${fmt(sy(max))}" stroke="${theme.text}"/><rect x="${fmt(cx - band * 0.22)}" y="${fmt(sy(q3))}" width="${fmt(band * 0.44)}" height="${fmt(Math.max(1, sy(q1) - sy(q3)))}" fill="${theme.fieldFill}" stroke="${theme.color(entry.group)}"/><path d="M${fmt(cx - band * 0.22)},${fmt(sy(q2))} H${fmt(cx + band * 0.22)}" stroke="${theme.color(entry.group)}" stroke-width="2"/><text x="${fmt(cx)}" y="${fmt(labelY)}" text-anchor="middle" font-size="${fmt(labelFont)}" font-family="Arial" fill="${theme.label}">${escapeXml(label)}</text>`;
    })
    .join("");
  return `<g class="plot-bar-layer">${guides}${thresholdGuide}${bars}</g>`;
}

function plotThresholdValue(spec: PlotSpec): number | undefined {
  const metadata = journalPlotMetadata(spec);
  if (typeof metadata.threshold === "number" && Number.isFinite(metadata.threshold)) return metadata.threshold;
  if (typeof metadata.threshold === "string" && Number.isFinite(Number(metadata.threshold))) return Number(metadata.threshold);
  const rowThresholds = uniqueNumbers(spec.table.rows
    .map((row) => Number(row.threshold))
    .filter(Number.isFinite));
  return rowThresholds.length === 1 ? rowThresholds[0] : undefined;
}

function renderBarCategoryLabel(label: string, x: number, y: number, fontSize: number, maxChars: number, maxLines: number, theme: PlotTheme): string {
  const normalized = label.replace(/[/_]+/g, " ").replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();
  const lines = wrapWords(normalized || label, maxChars, maxLines);
  const tspans = lines
    .map((line, index) => `<tspan class="plot-bar-category-line" x="${fmt(x)}" dy="${index === 0 ? "0" : fmt(fontSize + 2)}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text class="plot-bar-category-label" data-lines="${lines.length}" x="${fmt(x)}" y="${fmt(y)}" text-anchor="middle" font-size="${fmt(fontSize)}" font-family="Arial" font-weight="760" fill="${theme.label}">${tspans}</text>`;
}

function renderHeatmap(rows: Record<string, string | number | null>[], xColumn: string, yColumn: string, valueColumn: string, x: number, y: number, width: number, height: number, theme: PlotTheme): string {
  const xs = [...new Set(rows.map((row) => String(row[xColumn] ?? "")))].filter(Boolean);
  const ys = [...new Set(rows.map((row) => String(row[yColumn] ?? "")))].filter(Boolean);
  const values = rows.map((row) => Number(row[valueColumn])).filter(Number.isFinite);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const cellWidth = width / Math.max(xs.length, 1);
  const cellHeight = height / Math.max(ys.length, 1);
  const labelFont = Math.max(7.6, Math.min(9.2, cellHeight - 3));
  const separator = theme.mode === "publication" ? "#e5e7eb" : theme.mode === "dark" ? "#0f172a" : "#ffffff";
  const rowLines = ys.slice(1).map((_, index) => {
    const lineY = y + (index + 1) * cellHeight;
    return `<path class="plot-heatmap-row-guide" d="M${fmt(x)},${fmt(lineY)} H${fmt(x + width)}" stroke="${separator}" stroke-width="1.2" opacity="0.95"/>`;
  }).join("");
  const columnLines = xs.slice(1).map((_, index) => {
    const lineX = x + (index + 1) * cellWidth;
    return `<path class="plot-heatmap-column-guide" d="M${fmt(lineX)},${fmt(y)} V${fmt(y + height)}" stroke="${separator}" stroke-width="1.2" opacity="0.95"/>`;
  }).join("");
  const cellRadius = theme.mode === "publication" ? 0 : 1.8;
  const matrixRadius = theme.mode === "publication" ? 0 : 5;
  const colorbarRadius = theme.mode === "publication" ? 0 : 3;
  const cells = rows
    .map((row) => {
      const xi = xs.indexOf(String(row[xColumn] ?? ""));
      const yi = ys.indexOf(String(row[yColumn] ?? ""));
      const value = Number(row[valueColumn]);
      const t = Number.isFinite(value) ? (value - min) / Math.max(max - min, 1e-9) : 0;
      return `<rect class="plot-heatmap-cell" data-x="${escapeXml(String(row[xColumn] ?? ""))}" data-y="${escapeXml(String(row[yColumn] ?? ""))}" x="${fmt(x + xi * cellWidth)}" y="${fmt(y + yi * cellHeight)}" width="${fmt(Math.max(1, cellWidth))}" height="${fmt(Math.max(1, cellHeight))}" rx="${fmt(cellRadius)}" fill="${theme.heat(t)}"/>`;
    })
    .join("");
  const xLabels = xs.map((label, index) => `<text class="plot-heatmap-column-label" x="${fmt(x + index * cellWidth + cellWidth / 2)}" y="${fmt(y + height + 15)}" text-anchor="middle" font-size="${fmt(labelFont)}" font-family="Arial" font-weight="700" fill="${theme.muted}">${escapeXml(label.slice(0, 9))}</text>`).join("");
  const yLabels = ys.map((label, index) => `<text class="plot-heatmap-row-label" x="${fmt(x - 9)}" y="${fmt(y + index * cellHeight + cellHeight / 2 + labelFont / 3)}" text-anchor="end" font-size="${fmt(labelFont)}" font-family="Arial" font-weight="700" fill="${theme.muted}">${escapeXml(label.slice(0, 9))}</text>`).join("");
  const colorbarX = x + width + 13;
  const colorbarH = Math.max(42, Math.min(height, 78));
  const colorbarY = y + Math.max(0, (height - colorbarH) / 2);
  const colorbarStops = Array.from({ length: 18 }, (_, index) => {
    const t = index / 17;
    const barY = colorbarY + (1 - t) * colorbarH;
    return `<rect class="plot-heatmap-colorbar-stop" x="${fmt(colorbarX)}" y="${fmt(barY)}" width="8" height="${fmt(Math.ceil(colorbarH / 17) + 0.6)}" fill="${theme.heat(t)}"/>`;
  }).join("");
  const colorbarClass = `plot-heatmap-colorbar-frame${theme.mode === "publication" ? " plot-journal-colorbar-frame" : ""}`;
  const colorbar = `<g class="plot-heatmap-colorbar"><rect class="${colorbarClass}" x="${fmt(colorbarX - 1)}" y="${fmt(colorbarY - 1)}" width="10" height="${fmt(colorbarH + 2)}" rx="${fmt(colorbarRadius)}" fill="${theme.frameFill}" stroke="${theme.frameStroke}"/>${colorbarStops}<text x="${fmt(colorbarX + 15)}" y="${fmt(colorbarY + 3)}" font-size="7.4" font-family="Arial" font-weight="700" fill="${theme.muted}">${escapeXml(fmt(max))}</text><text x="${fmt(colorbarX + 15)}" y="${fmt(colorbarY + colorbarH)}" font-size="7.4" font-family="Arial" font-weight="700" fill="${theme.muted}">${escapeXml(fmt(min))}</text></g>`;
  return `<g class="plot-heatmap-layer"><rect class="plot-heatmap-matrix-frame" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="${fmt(matrixRadius)}" fill="${theme.fieldFill}" stroke="${theme.grid}"/>${cells}${rowLines}${columnLines}${xLabels}${yLabels}${colorbar}</g>`;
}

export function exportPdf(project: Project, pageId?: string): ExportResult {
  const page = getPage(project, pageId);
  return {
    format: "pdf",
    mime: "application/pdf",
    filename: pageId ? `${slug(project.title)}-${slug(page.name)}.pdf` : `${slug(project.title)}-deck.pdf`,
    data: pageId ? createMinimalPdf(project, page) : createDeckPdf(project),
    warnings: pageId ? collectExportWarnings(page, "pdf") : project.pages.flatMap((candidate) => collectExportWarnings(candidate, "pdf"))
  };
}

function createMinimalPdf(project: Project, page: Page): Uint8Array {
  const content = page.nodes
    .filter((node) => !node.hidden)
    .sort((a, b) => a.transform.z - b.transform.z)
    .map((node) => pdfNodeCommands(node, page.height))
    .join("\n");
  const stream = `q 1 1 1 rg 0 0 ${fmt(page.width)} ${fmt(page.height)} re f Q\n${content}`;
  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(page.width)} ${fmt(page.height)}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj`,
    `4 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream endobj`,
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`
  ];
  return encodePdf(objects, project.title);
}

function createDeckPdf(project: Project): Uint8Array {
  const objects: string[] = [];
  const pageRefs: string[] = [];
  objects.push(`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`);
  objects.push(`2 0 obj << /Type /Pages /Kids [] /Count ${project.pages.length} >> endobj`);
  let objectId = 3;
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  for (const page of project.pages) {
    const pageObjectId = objectId++;
    const contentObjectId = objectId++;
    pageObjectIds.push(pageObjectId);
    contentObjectIds.push(contentObjectId);
    pageRefs.push(`${pageObjectId} 0 R`);
    const content = page.nodes
      .filter((node) => !node.hidden)
      .sort((a, b) => a.transform.z - b.transform.z)
      .map((node) => pdfNodeCommands(node, page.height))
      .join("\n");
    const stream = `q 1 1 1 rg 0 0 ${fmt(page.width)} ${fmt(page.height)} re f Q\n${content}`;
    objects.push(`${pageObjectId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(page.width)} ${fmt(page.height)}] /Resources << /Font << /F1 ${objectId} 0 R >> >> /Contents ${contentObjectId} 0 R >> endobj`);
    objects.push(`${contentObjectId} 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream endobj`);
  }
  const fontObjectId = objectId++;
  objects.push(`${fontObjectId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
  objects[1] = `2 0 obj << /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${project.pages.length} >> endobj`;
  objects.forEach((object, index) => {
    if (pageObjectIds.includes(index + 1)) {
      objects[index] = object.replace(/\/F1 \d+ 0 R/, `/F1 ${fontObjectId} 0 R`);
    }
  });
  return encodePdf(objects, project.title);
}

function pdfNodeCommands(node: SceneNode, pageHeight: number): string {
  const x = node.transform.x;
  const y = pageHeight - node.transform.y - node.transform.height;
  const width = node.transform.width;
  const height = node.transform.height;
  const style = node.style;
  if (node.kind === "text") {
    const payload = node.payload as TextPayload;
    return `BT /F1 ${fmt(style.fontSize ?? 20)} Tf ${fmt(x)} ${fmt(y + height / 2)} Td (${escapePdf(payload.text)}) Tj ET`;
  }
  if (node.kind === "connector") {
    const payload = node.payload as ConnectorPayload;
    const points = payload.points.map((point) => `${fmt(point.x)} ${fmt(pageHeight - point.y)}`);
    return points.length ? `${rgbStroke(style.stroke ?? "#334155")} ${fmt(style.strokeWidth ?? 2)} w ${points.map((point, index) => `${index === 0 ? point + " m" : point + " l"}`).join(" ")} S` : "";
  }
  const label = node.kind === "shape" ? (node.payload as ShapePayload).label : node.kind === "symbol" ? ((node.payload as SymbolPayload).label ?? node.name) : node.name;
  return `${rgbFill(style.fill ?? "#ffffff")} ${rgbStroke(style.stroke ?? "#334155")} ${fmt(style.strokeWidth ?? 1)} w ${fmt(x)} ${fmt(y)} ${fmt(width)} ${fmt(height)} re B\nBT /F1 ${fmt(style.fontSize ?? 14)} Tf ${fmt(x + 12)} ${fmt(y + height / 2)} Td (${escapePdf(label)}) Tj ET`;
}

function encodePdf(objects: string[], title: string): Uint8Array {
  const chunks = [`%PDF-1.4\n% Scientific Image: ${title}\n`];
  const offsets: number[] = [0];
  let offset = chunks[0].length;
  for (const object of objects) {
    offsets.push(offset);
    const chunk = `${object}\n`;
    chunks.push(chunk);
    offset += chunk.length;
  }
  const xrefOffset = offset;
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (let index = 1; index <= objects.length; index += 1) {
    chunks.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new TextEncoder().encode(chunks.join(""));
}

export function exportPngPlaceholder(project: Project, pageId?: string, dpi = 144): ExportResult {
  const page = getPage(project, pageId);
  const svg = renderPageToSvg(project, page.id);
  return {
    format: "png",
    mime: "image/svg+xml",
    filename: `${slug(project.title)}-${slug(page.name)}-${dpi}dpi.svg`,
    data: svg,
    warnings: [
      "Node-only PNG rasterization is not available without an image backend. The web editor rasterizes this SVG to PNG through browser canvas.",
      ...collectExportWarnings(page, "png")
    ]
  };
}

export function browserSvgToPng(svg: string, width: number, height: number, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas 2D context is unavailable."));
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Failed to rasterize SVG."));
    image.src = url;
  });
}

export function exportPptx(project: Project, pageId?: string): ExportResult {
  const page = getPage(project, pageId);
  const pages = pageId ? [page] : project.pages;
  const entries = createPptxEntries(project, pages);
  return {
    format: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    filename: pageId ? `${slug(project.title)}-${slug(page.name)}.pptx` : `${slug(project.title)}-deck.pptx`,
    data: createStoreZip(entries),
    warnings: pages.flatMap((candidate) => collectExportWarnings(candidate, "pptx"))
  };
}

export function exportDocx(project: Project, pageId?: string): ExportResult {
  const page = getPage(project, pageId);
  const pages = pageId ? [page] : project.pages;
  const media = pages.map((candidate) => renderPageToSvg(project, candidate.id));
  const entries: { path: string; data: string | Uint8Array }[] = [
    { path: "[Content_Types].xml", data: docxContentTypesXml() },
    { path: "_rels/.rels", data: docxRootRelsXml() },
    { path: "docProps/app.xml", data: docxAppXml(pages.length) },
    { path: "docProps/core.xml", data: coreXml(project.title) },
    { path: "word/document.xml", data: docxDocumentXml(project, pages) },
    { path: "word/_rels/document.xml.rels", data: docxDocumentRelsXml(pages.length) }
  ];
  media.forEach((svg, index) => entries.push({ path: `word/media/figure${index + 1}.svg`, data: svg }));
  return {
    format: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: pageId ? `${slug(project.title)}-${slug(page.name)}.docx` : `${slug(project.title)}-figures.docx`,
    data: createStoreZip(entries),
    warnings: [
      "DOCX export embeds each figure panel as SVG with caption and provenance text; individual SVG parts are not Word-native editable shapes.",
      ...pages.flatMap((candidate) => collectExportWarnings(candidate, "docx"))
    ]
  };
}

function createPptxEntries(project: Project, pages: Page[]): { path: string; data: string | Uint8Array }[] {
  const firstPage = pages[0];
  const width = Math.round(firstPage.width * 9525);
  const height = Math.round(firstPage.height * 9525);
  const entries: { path: string; data: string | Uint8Array }[] = [
    { path: "[Content_Types].xml", data: contentTypesXml(pages.length) },
    { path: "_rels/.rels", data: rootRelsXml() },
    { path: "docProps/app.xml", data: appXml() },
    { path: "docProps/core.xml", data: coreXml(project.title) },
    { path: "ppt/presentation.xml", data: presentationXml(width, height, pages.length) },
    { path: "ppt/_rels/presentation.xml.rels", data: presentationRelsXml(pages.length) },
    { path: "ppt/slideLayouts/slideLayout1.xml", data: emptySlideLayoutXml() },
    { path: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: slideLayoutRelsXml() },
    { path: "ppt/slideMasters/slideMaster1.xml", data: emptySlideMasterXml() },
    { path: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: slideMasterRelsXml() },
    { path: "ppt/theme/theme1.xml", data: themeXml() }
  ];
  pages.forEach((page, index) => {
    const slideNumber = index + 1;
    entries.push({ path: `ppt/slides/slide${slideNumber}.xml`, data: slideXml(project, page) });
    entries.push({ path: `ppt/slides/_rels/slide${slideNumber}.xml.rels`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` });
  });
  return entries;
}

function slideXml(project: Project, page: Page): string {
  const nodes = page.nodes.filter((node) => !node.hidden).sort((a, b) => a.transform.z - b.transform.z);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${hex(page.background)}"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name="${escapeXml(project.title)}"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${nodes.map((node, index) => pptxNodeXml(node, index + 2)).join("\n")}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function pptxNodeXml(node: SceneNode, id: number): string {
  if (node.kind === "connector") {
    const payload = node.payload as ConnectorPayload;
    const first = payload.points[0] ?? { x: node.transform.x, y: node.transform.y };
    const last = payload.points[payload.points.length - 1] ?? { x: node.transform.x + node.transform.width, y: node.transform.y + node.transform.height };
    const x = Math.min(first.x, last.x);
    const y = Math.min(first.y, last.y);
    const width = Math.max(1, Math.abs(last.x - first.x));
    const height = Math.max(1, Math.abs(last.y - first.y));
    return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="${escapeXml(node.name)}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(width)}" cy="${emu(height)}"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom>${pptxLine(node.style)}</p:spPr></p:cxnSp>`;
  }
  const label = node.kind === "text"
    ? (node.payload as TextPayload).text
    : node.kind === "shape"
      ? ((node.payload as ShapePayload).label ?? node.name)
      : node.kind === "symbol"
        ? ((node.payload as SymbolPayload).label ?? node.name)
        : node.kind === "plot"
          ? `${node.name} (editable plot fallback)`
          : node.name;
  const preset = node.kind === "shape" && (node.payload as ShapePayload).shape === "ellipse" ? "ellipse" : node.kind === "shape" && (node.payload as ShapePayload).shape === "diamond" ? "diamond" : "roundRect";
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${escapeXml(node.name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="${Math.round((node.transform.rotation ?? 0) * 60000)}"><a:off x="${emu(node.transform.x)}" y="${emu(node.transform.y)}"/><a:ext cx="${emu(node.transform.width)}" cy="${emu(node.transform.height)}"/></a:xfrm><a:prstGeom prst="${preset}"><a:avLst/></a:prstGeom>${pptxFill(node.style)}${pptxLine(node.style)}</p:spPr><p:txBody><a:bodyPr wrap="square" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" sz="${Math.round((node.style.fontSize ?? 16) * 100)}" b="${Number(node.style.fontWeight ?? 400) >= 600 ? "1" : "0"}"><a:solidFill><a:srgbClr val="${hex(node.style.color ?? "#0f172a")}"/></a:solidFill></a:rPr><a:t>${escapeXml(label)}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

function collectExportWarnings(page: Page, format: ExportResult["format"]): string[] {
  const warnings: string[] = [];
  const complexNodes = page.nodes.filter((node) => ["plot", "image", "group"].includes(node.kind));
  if (format === "pptx" && complexNodes.length) {
    warnings.push("PPTX maps text, shapes, connectors, and simple symbols to editable objects; plots/images/groups are exported as editable placeholders in this zero-dependency MVP.");
    const realisticAssetIds = uniqueStrings(page.nodes
      .filter((node) => node.kind === "image")
      .map((node) => (node.payload as ImagePayload).assetId)
      .filter((assetId): assetId is string => Boolean(assetId))
      .filter((assetId) => {
        try {
          return isRealisticAsset(getAnyAsset(assetId));
        } catch {
          return false;
        }
      }));
    if (realisticAssetIds.length) {
      warnings.push(`PPTX embeds scientific editorial realistic assets as image fallbacks for visual fidelity. Assets: ${describeList(realisticAssetIds, 10)}.`);
    }
  }
  const premiumSymbols = page.nodes.filter((node) => node.kind === "symbol" && ((node.payload as SymbolPayload).styleProfile || (node.payload as SymbolPayload).appearance?.styleProfile));
  if (format === "pptx" && premiumSymbols.length) {
    const assetIds = uniqueStrings(premiumSymbols.map((node) => (node.payload as SymbolPayload).assetId).filter(Boolean));
    const templateIds = uniqueStrings(premiumSymbols
      .map((node) => String((node.payload as SymbolPayload).layoutHint ?? "").split(":")[0])
      .filter((value) => value.includes("-")));
    const assetText = describeList(assetIds, 8);
    const templateText = templateIds.length ? ` Templates: ${describeList(templateIds, 4)}.` : "";
    warnings.push(`${premiumSymbols.length} premium styled symbol(s) use layered SVG fidelity and are simplified to editable PPTX placeholders. Assets: ${assetText}.${templateText} Use SVG/PDF for exact rendering.`);
  }
  if (format === "docx") {
    warnings.push("DOCX embeds figure panels as SVG images with captions/provenance; edit the canonical scene JSON for object-level changes.");
  }
  const unsupported = page.nodes.filter((node) => node.claimStatus === "unsupported-claim");
  if (unsupported.length) warnings.push(`${unsupported.length} node(s) are marked as unsupported scientific claims.`);
  const evidenceNeedsSource = page.nodes.filter((node) => node.claimStatus === "needs-citation" && isEvidenceReviewNode(node));
  if (evidenceNeedsSource.length) warnings.push(`${evidenceNeedsSource.length} plot/data evidence node(s) need source verification.`);
  const needsCitation = page.nodes.filter((node) => node.claimStatus === "needs-citation" && !isStructuralReviewTextNode(node) && !isEvidenceReviewNode(node));
  if (needsCitation.length) warnings.push(`${needsCitation.length} claim node(s) need citation or user confirmation.`);
  return warnings;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isFinite(value)).map((value) => Number(value.toFixed(6))))];
}

function describeList(values: string[], limit: number): string {
  if (!values.length) return "none";
  const shown = values.slice(0, limit);
  const extra = values.length - shown.length;
  return `${shown.join(", ")}${extra > 0 ? `, +${extra} more` : ""}`;
}

function linearScale(values: number[], outMin: number, outMax: number): (value: number) => number {
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = Math.max(max - min, 1e-9);
  return (value: number) => outMin + ((value - min) / span) * (outMax - outMin);
}

function shortPlotLabel(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(1, maxLength - 3))}...`;
}

function interpolateColor(a: string, b: string, t: number): string {
  const ac = parseColor(a);
  const bc = parseColor(b);
  const mix = ac.map((value, index) => Math.round(value + (bc[index] - value) * Math.max(0, Math.min(1, t))));
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
}

function heatColor(t: number): string {
  const stops = ["#eff6ff", "#93c5fd", "#2563eb", "#7c3aed"];
  const scaled = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return interpolateColor(stops[index], stops[index + 1], scaled - index);
}

function heatColorPublication(t: number): string {
  const stops = ["#ffffff", "#d1d5db", "#6b7280", "#111827"];
  const scaled = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return interpolateColor(stops[index], stops[index + 1], scaled - index);
}

function heatColorDark(t: number): string {
  const stops = ["#0f172a", "#1e3a8a", "#06b6d4", "#fde68a"];
  const scaled = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return interpolateColor(stops[index], stops[index + 1], scaled - index);
}

function parseColor(color: string): [number, number, number] {
  const normalized = color.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}

function wrapWords(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.+$/, "")}...`;
  }
  return lines.length ? lines : [""];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isDarkColor(color: string): boolean {
  const [r, g, b] = parseColor(`#${hex(color)}`);
  return (r * 299 + g * 587 + b * 114) / 1000 < 96;
}

function palette(group: string): string {
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#0891b2"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function publicationPalette(group: string): string {
  const colors = ["#111827", "#374151", "#6b7280", "#9ca3af", "#4b5563", "#1f2937"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function darkPalette(group: string): string {
  const colors = ["#38bdf8", "#34d399", "#f87171", "#c084fc", "#fbbf24", "#22d3ee"];
  let hash = 0;
  for (const char of group || "default") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function jitter(index: number): number {
  return ((index * 9301 + 49297) % 233280) / 233280 - 0.5;
}

function pptxFill(style: Style): string {
  return `<a:solidFill><a:srgbClr val="${hex(style.fill ?? "#ffffff")}"/></a:solidFill>`;
}

function pptxLine(style: Style): string {
  return `<a:ln w="${Math.round((style.strokeWidth ?? 1.5) * 12700)}"><a:solidFill><a:srgbClr val="${hex(style.stroke ?? "#334155")}"/></a:solidFill></a:ln>`;
}

function hex(color: string): string {
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    if (color.length === 4) {
      return color.slice(1).split("").map((char) => char + char).join("").toUpperCase();
    }
    return color.slice(1).toUpperCase();
  }
  if (color.startsWith("rgb")) {
    const values = color.match(/\d+/g)?.slice(0, 3).map(Number) ?? [255, 255, 255];
    return values.map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  return "FFFFFF";
}

function rgbFill(color: string): string {
  const [r, g, b] = parseColor(`#${hex(color)}`).map((value) => fmt(value / 255));
  return `${r} ${g} ${b} rg`;
}

function rgbStroke(color: string): string {
  const [r, g, b] = parseColor(`#${hex(color)}`).map((value) => fmt(value / 255));
  return `${r} ${g} ${b} RG`;
}

function emu(value: number): number {
  return Math.round(value * 9525);
}

function fmt(value: number): string {
  return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "0";
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

function escapePdf(value: string): string {
  return value.replace(/[\\()]/g, "\\$&");
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scientific-image";
}

function docxContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="svg" ContentType="image/svg+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
}

function docxRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
}

function docxDocumentRelsXml(pageCount: number): string {
  const rels = Array.from({ length: pageCount }, (_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/figure${index + 1}.svg"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function docxAppXml(pageCount: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Scientific Image</Application><Pages>${pageCount}</Pages></Properties>`;
}

function docxDocumentXml(project: Project, pages: Page[]): string {
  const body = pages.map((page, index) => {
    const widthEmu = 5943600;
    const heightEmu = Math.round(widthEmu * (page.height / page.width));
    const warnings = collectExportWarnings(page, "docx");
    const provenance = page.nodes
      .filter((node) => !node.hidden)
      .slice(0, 8)
      .map((node) => `${node.name}: ${node.provenance.source} (${node.provenance.license})`)
      .join("; ");
    return [
      docxParagraph(`${index + 1}. ${page.name}`, true),
      docxImage(index + 1, widthEmu, heightEmu, page.name),
      docxParagraph(`Caption: ${page.name} exported from structured Scientific Image scene JSON.`, false),
      provenance ? docxParagraph(`Provenance: ${provenance}`, false) : "",
      warnings.length ? docxParagraph(`Export warnings: ${warnings.join(" ")}`, false) : ""
    ].join("");
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${docxParagraph(project.title, true)}${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body></w:document>`;
}

function docxParagraph(text: string, bold: boolean): string {
  return `<w:p><w:r><w:rPr>${bold ? "<w:b/>" : ""}</w:rPr><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxImage(index: number, widthEmu: number, heightEmu: number, name: string): string {
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="${index}" name="${escapeXml(name)}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${index}" name="${escapeXml(name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${index}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function contentTypesXml(slideCount = 1): string {
  const slideOverrides = Array.from({ length: slideCount }, (_, index) => `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${slideOverrides}<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/></Types>`;
}

function rootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
}

function presentationXml(width: number, height: number, slideCount = 1): string {
  const slideIds = Array.from({ length: slideCount }, (_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideIds}</p:sldIdLst><p:sldSz cx="${width}" cy="${height}" type="custom"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`;
}

function presentationRelsXml(slideCount = 1): string {
  const slideRels = Array.from({ length: slideCount }, (_, index) => `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${slideRels}<Relationship Id="rId${slideCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`;
}

function appXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Scientific Image</Application><PresentationFormat>Custom</PresentationFormat><Slides>1</Slides></Properties>`;
}

function coreXml(title: string): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(title)}</dc:title><dc:creator>Scientific Image</dc:creator><cp:lastModifiedBy>Scientific Image</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
}

function emptySlideLayoutXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
}

function slideLayoutRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
}

function emptySlideMasterXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`;
}

function slideMasterRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
}

function themeXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Scientific Image"><a:themeElements><a:clrScheme name="Scientific"><a:dk1><a:srgbClr val="0F172A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="2563EB"/></a:accent1><a:accent2><a:srgbClr val="16A34A"/></a:accent2><a:accent3><a:srgbClr val="DC2626"/></a:accent3><a:accent4><a:srgbClr val="9333EA"/></a:accent4><a:accent5><a:srgbClr val="F59E0B"/></a:accent5><a:accent6><a:srgbClr val="0891B2"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="9333EA"/></a:folHlink></a:clrScheme><a:fontScheme name="Scientific"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme><a:fmtScheme name="Scientific"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
}

function createStoreZip(entries: { path: string; data: string | Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const data = typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(data);
    const local = zipLocalHeader(name, data, crc);
    localParts.push(local, name, data);
    centralParts.push(zipCentralHeader(name, data, crc, offset), name);
    offset += local.byteLength + name.byteLength + data.byteLength;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const centralOffset = offset;
  const end = zipEndRecord(entries.length, centralSize, centralOffset);
  return concatBytes([...localParts, ...centralParts, end]);
}

function zipLocalHeader(name: Uint8Array, data: Uint8Array, crc: number): Uint8Array {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, data.byteLength, true);
  view.setUint32(22, data.byteLength, true);
  view.setUint16(26, name.byteLength, true);
  view.setUint16(28, 0, true);
  return header;
}

function zipCentralHeader(name: Uint8Array, data: Uint8Array, crc: number, offset: number): Uint8Array {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, data.byteLength, true);
  view.setUint32(24, data.byteLength, true);
  view.setUint16(28, name.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function zipEndRecord(count: number, centralSize: number, centralOffset: number): Uint8Array {
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return end;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
