import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { glob } from "glob";
import ts from "typescript";
import AdmZip from "adm-zip";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    let projectDir: string;
    let shouldCleanup = false;

    // Перевіряємо чи це запит на сканування поточного проекту
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      if (body.scanCurrentProject) {
        // Сканування поточного проекту
        projectDir = process.cwd();
      } else {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
    } else {
      // Завантаження ZIP файлу
      const formData = await req.formData();
      const file = formData.get("project") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      // 1️⃣ Зберігаємо архів тимчасово
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempDir = path.join(process.cwd(), `.temp/project-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const zipPath = path.join(tempDir, "project.zip");
      fs.writeFileSync(zipPath, buffer);

      // 2️⃣ Розпаковуємо проект
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);

      projectDir = tempDir;
      shouldCleanup = true;
    }

    // 3️⃣ Аналіз CSS
    const cssFiles = glob.sync(`${projectDir}/**/*.css`, {
      ignore: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/tailwind.css",
        "**/output.css",
      ],
    });
    const codeFiles = glob.sync(`${projectDir}/**/*.{js,jsx,ts,tsx,html}`, {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    const cssClassesMap = new Map<string, string>(); // className -> filePath
    const tailwindPatterns = [
      // Responsive prefixes
      /^(sm|md|lg|xl|2xl):/,
      // State prefixes
      /^(hover|focus|active|disabled|group-hover|peer|first|last|odd|even|visited|checked|focus-within|focus-visible):/,
      // Theme prefixes
      /^(dark|light):/,
      // Margin/padding: m-4, -mt-2, px-4, py-2
      /^-?[mp][trblxy]?-(\d+|auto|px)$/,
      /^-?p[xy]-(\d+|px)$/,
      // Width/Height: w-full, h-screen, min-w-0
      /^(w|h|min-w|min-h|max-w|max-h)-/,
      // Colors: text-blue-500, bg-red-100
      /^(text|bg|border|ring|from|to|via|decoration|divide|outline|shadow|placeholder|caret)-(\w+-)?\d+$/,
      /^(text|bg|border|ring|from|to|via|decoration|divide|outline|shadow)-(current|transparent|white|black|inherit)$/,
      // Display utilities
      /^(flex|grid|block|inline|inline-block|inline-flex|inline-grid|hidden|table|table-row|table-cell|flow-root)$/,
      // Effects: rounded-lg, opacity-50
      /^(rounded|opacity|z|blur|brightness|contrast|grayscale|saturate|sepia|hue-rotate|invert|drop-shadow)-/,
      // Spacing: gap-4, space-x-2
      /^(gap|space)-[xy]-/,
      // Typography: font-bold, text-lg, leading-tight
      /^(font|leading|tracking|text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|tight|snug|relaxed|loose)$/,
      // Position: absolute, top-0, left-1/2
      /^(absolute|relative|fixed|sticky|static)$/,
      /^(top|bottom|left|right|inset)-/,
      // Overflow
      /^(overflow|overscroll)-(auto|hidden|visible|scroll|x-auto|y-auto|x-hidden|y-hidden|x-scroll|y-scroll)$/,
      // Transitions: transition-all, duration-300
      /^(transition|duration|ease|delay|animate)-/,
      // Interactivity: cursor-pointer, select-none
      /^(cursor|select|pointer-events|resize|appearance)-/,
      // Flexbox/Grid alignment: justify-center, items-start
      /^(justify|items|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline|auto)$/,
      // Grid: col-span-2, grid-cols-3
      /^(col|row|auto-cols|auto-rows|grid-cols|grid-rows)-/,
      // Flex: flex-1, grow, shrink
      /^(order|grow|shrink|basis|flex)-/,
      // Layout: container, mx-auto
      /^(container|mx-auto|aspect|object|sr-only|not-sr-only)$/,
      // Fractions: w-1/2, left-1/3
      /^\w+-\d+\/\d+$/,
      // Text decoration: underline, line-through
      /^(underline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|truncate|break-normal|break-words|break-all|whitespace-normal|whitespace-nowrap|whitespace-pre)$/,
      // Border: border-2, border-t-4
      /^border(-[trblxy])?(-\d+)?$/,
      // Pure numbers or single letters (often Tailwind)
      /^[a-z]$/,
      /^\d+$/,
      // Common Tailwind utilities
      /^(align|list|table|caption|clear|float|isolate|object|mix|bg|box|decoration|list|scroll|snap|touch|will|fill|stroke|outline)-/,
    ];

    cssFiles.forEach((f) => {
      const content = fs.readFileSync(f, "utf8");

      // Пропускаємо файли з Tailwind директивами
      if (content.includes("@tailwind") || content.includes("@apply")) {
        return;
      }

      const matches = content.match(/\.[a-zA-Z0-9_-]+/g);
      matches?.forEach((m) => {
        const className = m.slice(1);

        // Ігноруємо Tailwind utility класи
        const isTailwind = tailwindPatterns.some((pattern) =>
          pattern.test(className)
        );

        // Додаткова перевірка: якщо клас містить тільки цифри або дуже короткий
        const isTooShort = className.length <= 1;
        const isOnlyNumbers = /^\d+$/.test(className);

        if (!isTailwind && !isTooShort && !isOnlyNumbers) {
          const relativePath = f.replace(projectDir, "").replace(/\\/g, "/");
          cssClassesMap.set(className, relativePath);
        }
      });
    });

    const usedClasses = new Set<string>();
    codeFiles.forEach((f) => {
      const content = fs.readFileSync(f, "utf8");
      cssClassesMap.forEach((_, cls) => {
        if (content.includes(cls)) usedClasses.add(cls);
      });
    });

    const unusedCSS = Array.from(cssClassesMap.entries())
      .filter(([cls]) => !usedClasses.has(cls))
      .map(([name, location]) => ({ name, location }));

    // 4️⃣ Аналіз функцій (через TypeScript API)
    const tsFiles = glob.sync(`${projectDir}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });
    const exportedFunctions = new Set<string>();
    const usedFunctions = new Set<string>();

    tsFiles.forEach((file) => {
      const code = fs.readFileSync(file, "utf8");
      const source = ts.createSourceFile(
        file,
        code,
        ts.ScriptTarget.Latest,
        true
      );

      ts.forEachChild(source, (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
          exportedFunctions.add(node.name.text);
        }
        if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach((d) => {
            if (d.name && ts.isIdentifier(d.name)) {
              exportedFunctions.add(d.name.text);
            }
          });
        }
      });

      exportedFunctions.forEach((fn) => {
        if (code.includes(`${fn}(`)) usedFunctions.add(fn);
      });
    });

    const unusedFunctions = [...exportedFunctions].filter(
      (fn) => !usedFunctions.has(fn)
    );

    // 5️⃣ Очищаємо тимчасові файли (тільки для ZIP)
    if (shouldCleanup && projectDir.includes(".temp")) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    // Сортуємо результати
    const sortedUnusedCSS = unusedCSS.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedUnusedFunctions = unusedFunctions.sort();

    return NextResponse.json({
      success: true,
      unusedCSS: sortedUnusedCSS, // Всі класи з локацією
      unusedFunctions: sortedUnusedFunctions, // Всі функції
      stats: {
        totalCSSClasses: cssClassesMap.size,
        totalFunctions: exportedFunctions.size,
        unusedCSSCount: unusedCSS.length,
        unusedFunctionsCount: unusedFunctions.length,
        cssFilesAnalyzed: cssFiles.length,
        jsFilesAnalyzed: tsFiles.length,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
