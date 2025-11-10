import { NextRequest, NextResponse } from "next/server";
import type { ErrorReport } from "@/types/devhelper";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    const report: ErrorReport = await request.json();

    // Тут можна зберігати звіти в базу даних
    // Наразі просто генеруємо markdown
    const markdown = generateMarkdownReport(report);

    // Повертаємо звіт
    return NextResponse.json({
      success: true,
      report: markdown,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error processing report:", error);
    return NextResponse.json(
      { error: "Failed to process report" },
      { status: 500 }
    );
  }
}

function generateMarkdownReport(report: ErrorReport): string {
  const errorCount = report.errors.filter((e) => e.type === "error").length;
  const warningCount = report.errors.filter((e) => e.type === "warning").length;

  let md = `# DevHelper Report\n\n`;
  md += `**Project ID:** ${report.projectId}\n`;
  md += `**Date:** ${new Date(report.timestamp).toLocaleString("uk-UA")}\n`;
  md += `**URL:** ${report.url}\n`;
  md += `**User Agent:** ${report.userAgent}\n\n`;

  md += `## Summary\n\n`;
  md += `- Total Issues: ${report.errors.length}\n`;
  md += `- Errors: ${errorCount}\n`;
  md += `- Warnings: ${warningCount}\n\n`;

  if (errorCount > 0) {
    md += `## Errors\n\n`;
    report.errors
      .filter((e) => e.type === "error")
      .forEach((error, index) => {
        md += `### ${index + 1}. ${error.message}\n\n`;
        if (error.stack) {
          md += `\`\`\`\n${error.stack}\n\`\`\`\n\n`;
        }
        md += `**Time:** ${new Date(error.timestamp).toLocaleString("uk-UA")}\n\n`;
        if (error.url) {
          md += `**Location:** ${error.url}:${error.lineNumber || 0}\n\n`;
        }
        md += `---\n\n`;
      });
  }

  if (warningCount > 0) {
    md += `## Warnings\n\n`;
    report.errors
      .filter((e) => e.type === "warning")
      .forEach((error, index) => {
        md += `### ${index + 1}. ${error.message}\n\n`;
        md += `**Time:** ${new Date(error.timestamp).toLocaleString("uk-UA")}\n\n`;
        md += `---\n\n`;
      });
  }

  return md;
}
