// ZIP Analyzer - покращений аналіз проекту

export function analyzeZipProject(zipData) {
  return new Promise(function (resolve, reject) {
    try {
      const view = new DataView(zipData);

      extractZipFiles(view)
        .then(function (files) {
          console.log("📦 Extracted files:", files.length);

          const cssFiles = files.filter((f) =>
            f.name.match(/\.(css|scss|sass|less)$/)
          );
          const jsFiles = files.filter((f) =>
            f.name.match(/\.(js|jsx|ts|tsx)$/)
          );

          console.log("🎨 CSS/SCSS files:", cssFiles.length);
          console.log("⚡ JS files:", jsFiles.length);

          const cssAnalysis = analyzeCSSClasses(cssFiles, jsFiles);
          const functionAnalysis = analyzeFunctions(jsFiles);
          const variableAnalysis = analyzeVariables(jsFiles);

          resolve({
            unusedCSS: cssAnalysis.unused,
            unusedFunctions: functionAnalysis.unused,
            unusedVariables: variableAnalysis.unused,
            stats: {
              cssFilesAnalyzed: cssFiles.length,
              jsFilesAnalyzed: jsFiles.length,
              totalCSSClasses: cssAnalysis.total,
              totalFunctions: functionAnalysis.total,
              totalVariables: variableAnalysis.total,
            },
          });
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

function analyzeCSSClasses(cssFiles, jsFiles) {
  const allClasses = new Set();
  const classLocations = {};

  cssFiles.forEach(function (file) {
    // 1. Звичайні CSS класи: .className {
    const matches = file.content.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/g);
    for (const match of matches) {
      const className = "." + match[1];
      allClasses.add(className);
      if (!classLocations[className]) classLocations[className] = [];
      classLocations[className].push(file.name);
    }

    // 2. SCSS вкладені класи: &.className {
    const nestedMatches = file.content.matchAll(
      /&\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/g
    );
    for (const match of nestedMatches) {
      const className = "." + match[1];
      allClasses.add(className);
      if (!classLocations[className]) classLocations[className] = [];
      classLocations[className].push(file.name);
    }

    // Логування для дебагу
    if (
      file.name.includes("test") ||
      file.content.includes("header-test") ||
      file.content.includes("minimal")
    ) {
      console.log("🔍 CSS file:", file.name);
      if (file.content.includes("minimal")) {
        console.log("🔍 Contains 'minimal' class");
      }
    }
  });

  const usedClasses = new Set();
  jsFiles.forEach(function (file) {
    const content = file.content;

    // 1. Звичайні класи: className="header"
    const classNameMatches = content.matchAll(
      /className\s*=\s*["']([^"']+)["']/g
    );
    for (const match of classNameMatches) {
      match[1].split(/\s+/).forEach((cls) => {
        if (cls) {
          usedClasses.add("." + cls);
          if (cls.includes("test")) {
            console.log("🔍 Found used class:", cls, "in", file.name);
          }
        }
      });
    }

    // 2. HTML класи: class="header"
    const classMatches = content.matchAll(/class\s*=\s*["']([^"']+)["']/g);
    for (const match of classMatches) {
      match[1].split(/\s+/).forEach((cls) => {
        if (cls) {
          usedClasses.add("." + cls);
          if (cls.includes("test")) {
            console.log("🔍 Found used class (HTML):", cls, "in", file.name);
          }
        }
      });
    }

    // 3. CSS Modules: styles.header або className={styles.header}
    const cssModuleMatches = content.matchAll(
      /(?:styles|css|classes)\.([a-zA-Z_][a-zA-Z0-9_-]*)/g
    );
    for (const match of cssModuleMatches) {
      usedClasses.add("." + match[1]);
      if (match[1].includes("test")) {
        console.log("🔍 Found CSS Module class:", match[1], "in", file.name);
      }
    }

    // 4. Рядкові літерали в коді: "minimal", 'compact' (можуть бути назви класів)
    // Шукаємо в об'єктах типу baseStyles = { minimal: "...", compact: "..." }
    const stringLiteralMatches = content.matchAll(
      /["']([a-zA-Z_][a-zA-Z0-9_-]*)["']\s*:/g
    );
    for (const match of stringLiteralMatches) {
      usedClasses.add("." + match[1]);
      if (match[1] === "minimal" || match[1].includes("test")) {
        console.log(
          "🔍 Found string literal class:",
          match[1],
          "in",
          file.name
        );
      }
    }

    // 5. Динамічні класи через змінні: baseStyles[variant]
    // Якщо є об'єкт з ключами, всі ключі вважаємо використаними
    if (content.includes("baseStyles") || content.includes("disclaimerTexts")) {
      const objectKeyMatches = content.matchAll(
        /\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/g
      );
      for (const match of objectKeyMatches) {
        usedClasses.add("." + match[1]);
        if (match[1] === "minimal" || match[1].includes("test")) {
          console.log("🔍 Found object key class:", match[1], "in", file.name);
        }
      }
    }
  });

  const unused = [];
  allClasses.forEach(function (className) {
    if (!usedClasses.has(className)) {
      // Логування для дебагу
      if (className === ".minimal") {
        console.log("❌ .minimal marked as UNUSED");
        console.log(
          "All used classes:",
          Array.from(usedClasses).filter((c) => c.includes("minimal"))
        );
      }
      unused.push({ name: className, location: classLocations[className][0] });
    }
  });

  console.log(
    "🎨 CSS: Total",
    allClasses.size,
    "Used",
    usedClasses.size,
    "Unused",
    unused.length
  );
  return { total: allClasses.size, unused: unused };
}

function analyzeFunctions(jsFiles) {
  const allFunctions = new Map();
  const usedFunctions = new Set();

  jsFiles.forEach(function (file) {
    const content = file.content;

    const funcMatches = content.matchAll(
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    );
    for (const match of funcMatches) {
      allFunctions.set(match[1], file.name);
    }

    const constFuncMatches = content.matchAll(
      /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g
    );
    for (const match of constFuncMatches) {
      allFunctions.set(match[1], file.name);
    }

    const exportFuncMatches = content.matchAll(
      /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    );
    for (const match of exportFuncMatches) {
      allFunctions.set(match[1], file.name);
    }
  });

  console.log("⚡ Found", allFunctions.size, "functions");

  jsFiles.forEach(function (file) {
    const content = file.content;

    allFunctions.forEach(function (location, funcName) {
      // Пропускаємо Next.js сторінки (page.js/tsx) та default експорти
      const isNextPage = location.match(/\/page\.(js|jsx|ts|tsx)$/);
      const isDefaultExport = new RegExp(
        "export\\s+default\\s+" + funcName
      ).test(content);

      if (isNextPage || isDefaultExport) {
        usedFunctions.add(funcName);
        return;
      }

      // Перевірка JSX компонента: <ComponentName або <ComponentName/>
      if (new RegExp("<" + funcName + "(?:\\s|/|>)").test(content)) {
        usedFunctions.add(funcName);
      }
      // Виклик функції: funcName(
      else if (new RegExp("\\b" + funcName + "\\s*\\(").test(content)) {
        usedFunctions.add(funcName);
      }
      // Передача як пропс: ={funcName}
      else if (new RegExp("=\\{\\s*" + funcName + "\\s*\\}").test(content)) {
        usedFunctions.add(funcName);
      }
      // В хуках: useEffect(() => funcName
      else if (
        new RegExp(
          "use(?:Effect|Callback|Memo)[^}]*\\b" + funcName + "\\b"
        ).test(content)
      ) {
        usedFunctions.add(funcName);
      }
      // Імпорт: import { funcName }
      else if (
        new RegExp("import\\s*\\{[^}]*\\b" + funcName + "\\b").test(content)
      ) {
        usedFunctions.add(funcName);
      }
      // Експорт: export { funcName }
      else if (
        new RegExp("export\\s*\\{[^}]*\\b" + funcName + "\\b").test(content)
      ) {
        usedFunctions.add(funcName);
      }
    });
  });

  console.log("⚡ Used", usedFunctions.size, "functions");

  const unused = [];
  allFunctions.forEach(function (_location, funcName) {
    if (!usedFunctions.has(funcName)) {
      unused.push(funcName);
    }
  });

  console.log("⚡ Unused", unused.length, "functions");
  return { total: allFunctions.size, unused: unused };
}

function analyzeVariables(jsFiles) {
  const allVariables = new Map();
  const usedVariables = new Set();

  jsFiles.forEach(function (file) {
    const content = file.content;
    const lines = content.split("\n");

    lines.forEach(function (line, lineIndex) {
      // 1. Прості змінні: const test1 = []
      if (
        !line.includes("useState") &&
        !line.includes("function") &&
        !line.includes("=>")
      ) {
        const simpleMatches = line.matchAll(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g
        );
        for (const match of simpleMatches) {
          if (!line.includes("[") || line.includes("= [")) {
            allVariables.set(match[1], {
              location: file.name + ":" + (lineIndex + 1),
              type: "змінна",
            });
          }
        }
      }

      // 3. export const
      const exportMatches = line.matchAll(
        /export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=/g
      );
      for (const match of exportMatches) {
        allVariables.set(match[1], {
          location: file.name + ":" + (lineIndex + 1),
          type: "export const",
        });
      }
    });

    // 2. useState - шукаємо в усьому файлі (може бути багаторядковим)
    const stateRegex =
      /const\s*\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\]\s*=\s*useState/gs;
    const stateMatches = [...content.matchAll(stateRegex)];

    stateMatches.forEach(function (match) {
      // Знаходимо номер рядка де це оголошення
      const beforeMatch = content.substring(0, match.index);
      const lineNum = beforeMatch.split("\n").length;

      allVariables.set(match[1], {
        location: file.name + ":" + lineNum,
        type: "useState",
      });
      allVariables.set(match[2], {
        location: file.name + ":" + lineNum,
        type: "setState",
      });
    });
  });

  console.log("📦 Found", allVariables.size, "variables");

  jsFiles.forEach(function (file) {
    const content = file.content;

    allVariables.forEach(function (_info, varName) {
      // Перевіряємо використання в усьому файлі, а не по рядках
      const lines = content.split("\n");

      lines.forEach(function (line) {
        // Пропускаємо рядок де змінна оголошена
        const isDeclaration =
          line.includes("const " + varName) ||
          line.includes("let " + varName) ||
          line.includes("var " + varName) ||
          line.includes("const [" + varName);

        // Якщо це не оголошення і змінна згадується - вона використовується
        if (!isDeclaration && new RegExp("\\b" + varName + "\\b").test(line)) {
          usedVariables.add(varName);
        }
      });
    });
  });

  console.log("📦 Used", usedVariables.size, "variables");

  const unused = [];
  allVariables.forEach(function (varInfo, varName) {
    if (!usedVariables.has(varName)) {
      unused.push({
        name: varName,
        location: varInfo.location,
        type: varInfo.type,
      });
    }
  });

  console.log("📦 Unused", unused.length, "variables");
  return { total: allVariables.size, unused: unused };
}

async function extractZipFiles(view) {
  const files = [];
  let eocdOffset = -1;

  for (let i = view.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) throw new Error("Invalid ZIP file");

  const centralDirOffset = view.getUint32(eocdOffset + 16, true);
  const numEntries = view.getUint16(eocdOffset + 10, true);
  let offset = centralDirOffset;

  for (let i = 0; i < numEntries; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const fileNameLength = view.getUint16(offset + 28, true);
    const extraFieldLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);

    const fileNameBytes = new Uint8Array(
      view.buffer,
      offset + 46,
      fileNameLength
    );
    const fileName = new TextDecoder().decode(fileNameBytes);

    if (!fileName.endsWith("/")) {
      if (view.getUint32(localHeaderOffset, true) === 0x04034b50) {
        const compMethod = view.getUint16(localHeaderOffset + 8, true);
        const compSize = view.getUint32(localHeaderOffset + 18, true);
        const uncompSize = view.getUint32(localHeaderOffset + 22, true);
        const localFileNameLength = view.getUint16(
          localHeaderOffset + 26,
          true
        );
        const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
        const dataOffset =
          localHeaderOffset + 30 + localFileNameLength + localExtraLength;

        try {
          let content = "";

          if (compMethod === 0) {
            const fileData = new Uint8Array(
              view.buffer,
              dataOffset,
              uncompSize
            );
            content = new TextDecoder().decode(fileData);
          } else if (compMethod === 8) {
            const compressedData = new Uint8Array(
              view.buffer,
              dataOffset,
              compSize
            );
            const ds = new DecompressionStream("deflate-raw");
            const writer = ds.writable.getWriter();
            writer.write(compressedData);
            writer.close();

            const reader = ds.readable.getReader();
            const chunks = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }

            const totalLength = chunks.reduce(
              (acc, chunk) => acc + chunk.length,
              0
            );
            const result = new Uint8Array(totalLength);
            let position = 0;
            for (const chunk of chunks) {
              result.set(chunk, position);
              position += chunk.length;
            }
            content = new TextDecoder().decode(result);
          }

          if (content) files.push({ name: fileName, content: content });
        } catch (error) {
          console.warn("⚠️ Failed:", fileName);
        }
      }
    }

    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  console.log("✅ Extracted", files.length, "files");
  return files;
}
