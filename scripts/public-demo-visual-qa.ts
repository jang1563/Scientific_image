import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getJournalFigureQa,
  getWorkflowPackExportSnapshot,
  getWorkflowPackVisualQaGallery,
  getWorkflowTemplate,
  getWorkflowTemplateQa,
  workflowTemplateFigureIntent
} from "../packages/assets/src/index.ts";

type ExampleManifest = {
  generatedBy?: string;
  examples?: Array<{
    filename: string;
    title: string;
    templateId: string;
    styleProfile?: string;
    figureIntent?: string;
  }>;
};

type PublicDemoQaStatus = "pass" | "needs-review" | "blocked";

const manifest = JSON.parse(readFileSync("docs/examples/manifest.json", "utf8")) as ExampleManifest;
const examples = manifest.examples ?? [];

const demoReports = examples.map((example) => {
  const template = getWorkflowTemplate(example.templateId);
  const styleProfile = example.styleProfile ?? template.recommendedStyleProfile;
  const figureIntent = example.figureIntent ?? template.figureIntent ?? workflowTemplateFigureIntent(template);
  const templateQa = getWorkflowTemplateQa(example.templateId, { styleProfile });
  const journalQa = figureIntent === "journal-figure" ? getJournalFigureQa(example.templateId, { styleProfile }) : undefined;
  const visualQa = getWorkflowPackVisualQaGallery(template.workflowPack, { styleProfile, limit: 8 });
  const exportSnapshot = getWorkflowPackExportSnapshot(template.workflowPack, { styleProfile });
  const filePath = join("docs/examples", example.filename);
  const blockingReasons = [
    !existsSync(filePath) ? `missing generated example file: ${filePath}` : "",
    templateQa.outOfBoundsCount ? `${templateQa.outOfBoundsCount} out-of-bounds node(s)` : "",
    templateQa.textOverflowCount ? `${templateQa.textOverflowCount} text overflow issue(s)` : "",
    templateQa.unsupportedClaimCount ? `${templateQa.unsupportedClaimCount} unsupported claim(s)` : "",
    templateQa.qaStatus === "incomplete" ? "template QA status is incomplete" : "",
    !visualQa.previewSizes.some((size) => size.id === "icon" && size.width === 48) ? "missing 48px icon QA preview" : "",
    !visualQa.previewSizes.some((size) => size.id === "preview" && size.width === 120) ? "missing 120px preview QA" : "",
    !visualQa.previewSizes.some((size) => size.id === "slide") ? "missing slide-size QA preview" : "",
    !visualQa.renderedAssetIds.length ? "visual QA gallery rendered no assets" : "",
    journalQa && journalQa.status !== "journal-ready" ? `journal QA status is ${journalQa.status}` : ""
  ].filter(Boolean);
  const reviewReasons = [
    templateQa.needsCitationCount ? `${templateQa.needsCitationCount} citation/review item(s)` : "",
    templateQa.exportReadiness.pptx.premiumAssetFallbackCount ? `${templateQa.exportReadiness.pptx.premiumAssetFallbackCount} named premium PPTX fallback asset(s)` : "",
    templateQa.exportReadiness.pptx.plotFallbackCount ? `${templateQa.exportReadiness.pptx.plotFallbackCount} plot PPTX fallback placeholder(s)` : "",
    exportSnapshot.status === "needs-review" ? "pack export snapshot needs review" : ""
  ].filter(Boolean);
  const status: PublicDemoQaStatus = blockingReasons.length ? "blocked" : reviewReasons.length ? "needs-review" : "pass";

  return {
    filename: example.filename,
    title: example.title,
    templateId: example.templateId,
    workflowPack: template.workflowPack,
    styleProfile,
    figureIntent,
    status,
    templateQa: {
      qaStatus: templateQa.qaStatus,
      score: templateQa.score,
      nodeCount: templateQa.nodeCount,
      symbolCount: templateQa.symbolCount,
      plotCount: templateQa.plotCount,
      outOfBoundsCount: templateQa.outOfBoundsCount,
      textOverflowCount: templateQa.textOverflowCount,
      needsCitationCount: templateQa.needsCitationCount,
      unsupportedClaimCount: templateQa.unsupportedClaimCount
    },
    visualQa: {
      previewSizes: visualQa.previewSizes,
      renderedAssetIds: visualQa.renderedAssetIds,
      qaChecks: visualQa.qaChecks,
      snapshotKey: visualQa.snapshotKey
    },
    journalQa: journalQa ? {
      status: journalQa.status,
      score: journalQa.score,
      visualIssueCount: journalQa.visualIssues.length,
      plotIssueCount: journalQa.plotIssues.length,
      exportWarningCount: journalQa.exportWarnings.length,
      nextAction: journalQa.nextAction
    } : undefined,
    exportQa: {
      pptxStatus: templateQa.exportReadiness.pptx.status,
      premiumAssetFallbackCount: templateQa.exportReadiness.pptx.premiumAssetFallbackCount,
      plotFallbackCount: templateQa.exportReadiness.pptx.plotFallbackCount,
      fallbackAssetIds: templateQa.exportReadiness.pptx.fallbackAssets.map((asset) => asset.assetId),
      nextAction: templateQa.exportReadiness.pptx.nextAction
    },
    blockingReasons,
    reviewReasons
  };
});

const blocked = demoReports.filter((report) => report.status === "blocked");
const needsReview = demoReports.filter((report) => report.status === "needs-review");
const report = {
  ok: blocked.length === 0,
  generatedBy: "scripts/public-demo-visual-qa.ts",
  manifestGeneratedBy: manifest.generatedBy,
  exampleCount: demoReports.length,
  blockedCount: blocked.length,
  needsReviewCount: needsReview.length,
  acceptanceGates: [
    "Each public example file exists under docs/examples.",
    "Each example resolves to a workflow template and workflow pack.",
    "Each example has 48px, 120px, and slide-size visual QA previews.",
    "No public example has out-of-bounds nodes, text overflow, or unsupported claims.",
    "PPTX/DOCX fallback review remains explicit and named by asset ID."
  ],
  demos: demoReports,
  nextAction: blocked.length
    ? "Fix blocked public demo QA before sharing the repository."
    : needsReview.length
      ? "Public demos are exportable; surface named Office fallback and citation review items before delivery."
      : "Public demos pass automated visual QA gates."
};

console.log(`${JSON.stringify(report, null, 2)}\n`);

if (!report.ok) process.exitCode = 1;
