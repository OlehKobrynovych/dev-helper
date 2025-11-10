// ZIP Analyzer - аналіз проекту з ZIP файлу
// Мінімальна реалізація розпаковки ZIP без зовнішніх бібліотек

export function analyzeZipProject(zipData) {
  return new Promise(function (resolve, reject) {
    try {
      // Простий парсер ZIP файлів
      const view = new DataView(zipData);
      const files = extractZipFiles(view);

      // Аналізуємо файли
      const cssFiles = files.filter((f) => f.name.endsWith(".css"));
      const jsFiles = files.filter((f) => f.name.match(/\.(js|jsx|ts|tsx)$/));

      // Збираємо всі CSS класи
      const allCSSClasses = new Set();
      const cssClassLocations = {};

      cssFiles.forEach(function (file) {
        const content = file.content;
        const classMatches = content.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g);

        for (const match of classMatches) {
          const className = "." + match[1];
          allCSSClasses.add(className);

          if (!cssClassLocations[className]) {
            cssClassLocations[className] = [];
          }
          cssClassLocations[className].push(file.name);
        }
      });

      // Збираємо всі використання класів в JS/JSX
      const usedCSSClasses = new Set();

      jsFiles.forEach(function (file) {
        const content = file.content;

        // className="..."
        const classNameMatches = content.matchAll(
          /className=["']([^"']+)["']/g
        );
        for (const match of classNameMatches) {
          const classes = match[1].split(/\s+/);
          classes.forEach((cls) => usedCSSClasses.add("." + cls));
        }

        // class="..."
        const classMatches = content.matchAll(/class=["']([^"']+)["']/g);
        for (const match of classMatches) {
          const classes = match[1].split(/\s+/);
          classes.forEach((cls) => usedCSSClasses.add("." + cls));
        }

        // styles['...']
        const stylesMatches = content.matchAll(/styles\[['"]([^'"]+)['"]\]/g);
        for (const match of stylesMatches) {
          usedCSSClasses.add("." + match[1]);
        }
      });

      // Знаходимо невикористані класи
      const unusedCSS = [];
      allCSSClasses.forEach(function (className) {
        if (!usedCSSClasses.has(className)) {
          unusedCSS.push({
            name: className,
            location: cssClassLocations[className][0] || "unknown",
          });
        }
      });

      // Збираємо всі функції
      const allFunctions = new Set();
      const functionLocations = {};

      jsFiles.forEach(function (file) {
        const content = file.content;

        // function name()
        const funcMatches = content.matchAll(
          /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
        );
        for (const match of funcMatches) {
          allFunctions.add(match[1]);
          functionLocations[match[1]] = file.name;
        }

        // const name = function()
        const constFuncMatches = content.matchAll(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g
        );
        for (const match of constFuncMatches) {
          allFunctions.add(match[1]);
          functionLocations[match[1]] = file.name;
        }

        // const name = () =>
        const arrowMatches = content.matchAll(
          /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g
        );
        for (const match of arrowMatches) {
          allFunctions.add(match[1]);
          functionLocations[match[1]] = file.name;
        }
      });

      // Знаходимо використання функцій
      const usedFunctions = new Set();

      jsFiles.forEach(function (file) {
        const content = file.content;

        allFunctions.forEach(function (funcName) {
          // Шукаємо виклики функції
          const callRegex = new RegExp(funcName + "\\s*\\(", "g");
          if (callRegex.test(content)) {
            usedFunctions.add(funcName);
          }
        });
      });

      // Невикористані функції
      const unusedFunctions = [];
      allFunctions.forEach(function (funcName) {
        if (!usedFunctions.has(funcName)) {
          unusedFunctions.push(funcName);
        }
      });

      // Збираємо всі змінні
      const allVariables = new Set();
      const variableLocations = {};

      jsFiles.forEach(function (file) {
        const content = file.content;

        // const/let/var NAME =
        const varMatches = content.matchAll(
          /(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=/g
        );
        for (const match of varMatches) {
          allVariables.add(match[1]);
          variableLocations[match[1]] = file.name;
        }
      });

      // Знаходимо використання змінних
      const usedVariables = new Set();

      jsFiles.forEach(function (file) {
        const content = file.content;

        allVariables.forEach(function (varName) {
          // Шукаємо використання змінної (не в оголошенні)
          const useRegex = new RegExp(
            "[^a-zA-Z0-9_]" + varName + "[^a-zA-Z0-9_=]",
            "g"
          );
          if (useRegex.test(content)) {
            usedVariables.add(varName);
          }
        });
      });

      // Невикористані змінні
      const unusedVariables = [];
      allVariables.forEach(function (varName) {
        if (!usedVariables.has(varName)) {
          unusedVariables.push({
            name: varName,
            location: variableLocations[varName] || "unknown",
          });
        }
      });

      resolve({
        unusedCSS: unusedCSS,
        unusedFunctions: unusedFunctions,
        unusedVariables: unusedVariables,
        stats: {
          cssFilesAnalyzed: cssFiles.length,
          jsFilesAnalyzed: jsFiles.length,
          totalCSSClasses: allCSSClasses.size,
          totalFunctions: allFunctions.size,
          totalVariables: allVariables.size,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

function extractZipFiles(view) {
  const files = [];

  // Простий парсер ZIP (Central Directory)
  // Шукаємо End of Central Directory signature
  let eocdOffset = -1;
  for (let i = view.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Invalid ZIP file");
  }

  const centralDirOffset = view.getUint32(eocdOffset + 16, true);
  const numEntries = view.getUint16(eocdOffset + 10, true);

  let offset = centralDirOffset;

  for (let i = 0; i < numEntries; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      break;
    }

    const fileNameLength = view.getUint16(offset + 28, true);
    const extraFieldLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);

    // Читаємо ім'я файлу
    const fileNameBytes = new Uint8Array(
      view.buffer,
      offset + 46,
      fileNameLength
    );
    const fileName = new TextDecoder().decode(fileNameBytes);

    // Читаємо локальний заголовок
    if (view.getUint32(localHeaderOffset, true) === 0x04034b50) {
      const compMethod = view.getUint16(localHeaderOffset + 8, true);
      const compSize = view.getUint32(localHeaderOffset + 18, true);
      const uncompSize = view.getUint32(localHeaderOffset + 22, true);
      const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);

      const dataOffset =
        localHeaderOffset + 30 + localFileNameLength + localExtraLength;

      // Читаємо дані файлу
      if (compMethod === 0) {
        // Без стиснення
        const fileData = new Uint8Array(view.buffer, dataOffset, uncompSize);
        const content = new TextDecoder().decode(fileData);

        files.push({
          name: fileName,
          content: content,
        });
      }
      // Для стиснених файлів потрібна бібліотека inflate
    }

    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  return files;
}
