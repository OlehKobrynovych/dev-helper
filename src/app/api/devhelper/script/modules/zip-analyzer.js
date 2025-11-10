// ZIP Analyzer - аналіз проекту з ZIP файлу
// Використовує DecompressionStream API для розпаковки

export function analyzeZipProject(zipData) {
  return new Promise(function (resolve, reject) {
    try {
      const view = new DataView(zipData);

      extractZipFiles(view)
        .then(function (files) {
          console.log("Extracted files:", files.length);

          // Фільтруємо файли
          const cssFiles = files.filter((f) => f.name.endsWith(".css"));
          const jsFiles = files.filter((f) =>
            f.name.match(/\.(js|jsx|ts|tsx)$/)
          );

          console.log("CSS files:", cssFiles.length);
          console.log("JS files:", jsFiles.length);

          // Аналіз CSS класів
          const allCSSClasses = new Set();
          const cssClassLocations = {};

          cssFiles.forEach(function (file) {
            const content = file.content;
            // Шукаємо CSS класи: .className
            const classMatches = content.matchAll(
              /\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\{/g
            );

            for (const match of classMatches) {
              const className = "." + match[1];
              allCSSClasses.add(className);

              if (!cssClassLocations[className]) {
                cssClassLocations[className] = [];
              }
              cssClassLocations[className].push(file.name);
            }
          });

          console.log("Total CSS classes found:", allCSSClasses.size);

          // Збираємо використання класів в JS/JSX
          const usedCSSClasses = new Set();

          jsFiles.forEach(function (file) {
            const content = file.content;

            // className="..." або className='...'
            const classNameMatches = content.matchAll(
              /className\s*=\s*["']([^"']+)["']/g
            );
            for (const match of classNameMatches) {
              const classes = match[1].split(/\s+/);
              classes.forEach((cls) => {
                if (cls) usedCSSClasses.add("." + cls);
              });
            }

            // class="..." або class='...'
            const classMatches = content.matchAll(
              /class\s*=\s*["']([^"']+)["']/g
            );
            for (const match of classMatches) {
              const classes = match[1].split(/\s+/);
              classes.forEach((cls) => {
                if (cls) usedCSSClasses.add("." + cls);
              });
            }

            // styles['...'] або styles["..."]
            const stylesMatches = content.matchAll(
              /styles\[["']([^"']+)["']\]/g
            );
            for (const match of stylesMatches) {
              usedCSSClasses.add("." + match[1]);
            }

            // clsx, classnames бібліотеки
            const clsxMatches = content.matchAll(/["']([a-z-]+)["']/g);
            for (const match of clsxMatches) {
              usedCSSClasses.add("." + match[1]);
            }
          });

          console.log("Used CSS classes:", usedCSSClasses.size);

          // Невикористані класи
          const unusedCSS = [];
          allCSSClasses.forEach(function (className) {
            if (!usedCSSClasses.has(className)) {
              unusedCSS.push({
                name: className,
                location: cssClassLocations[className][0] || "unknown",
              });
            }
          });

          console.log("Unused CSS classes:", unusedCSS.length);

          // Аналіз функцій
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
              /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
            );
            for (const match of arrowMatches) {
              allFunctions.add(match[1]);
              functionLocations[match[1]] = file.name;
            }

            // export function name()
            const exportFuncMatches = content.matchAll(
              /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
            );
            for (const match of exportFuncMatches) {
              allFunctions.add(match[1]);
              functionLocations[match[1]] = file.name;
            }
          });

          console.log("Total functions found:", allFunctions.size);

          // Використання функцій
          const usedFunctions = new Set();

          jsFiles.forEach(function (file) {
            const content = file.content;

            allFunctions.forEach(function (funcName) {
              // Шукаємо виклики: funcName( або funcName<
              const callRegex = new RegExp("\\b" + funcName + "\\s*[(<]", "g");
              if (callRegex.test(content)) {
                usedFunctions.add(funcName);
              }
            });
          });

          console.log("Used functions:", usedFunctions.size);

          // Невикористані функції
          const unusedFunctions = [];
          allFunctions.forEach(function (funcName) {
            if (!usedFunctions.has(funcName)) {
              unusedFunctions.push(funcName);
            }
          });

          console.log("Unused functions:", unusedFunctions.length);

          // Аналіз змінних (тільки КОНСТАНТИ великими літерами)
          const allVariables = new Set();
          const variableLocations = {};

          jsFiles.forEach(function (file) {
            const content = file.content;

            // const/let/var UPPERCASE_NAME =
            const varMatches = content.matchAll(
              /(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=/g
            );
            for (const match of varMatches) {
              allVariables.add(match[1]);
              variableLocations[match[1]] = file.name;
            }

            // export const UPPERCASE_NAME =
            const exportVarMatches = content.matchAll(
              /export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=/g
            );
            for (const match of exportVarMatches) {
              allVariables.add(match[1]);
              variableLocations[match[1]] = file.name;
            }
          });

          console.log("Total variables found:", allVariables.size);

          // Використання змінних
          const usedVariables = new Set();

          jsFiles.forEach(function (file) {
            const content = file.content;

            allVariables.forEach(function (varName) {
              // Шукаємо використання (не в оголошенні)
              const lines = content.split("\n");
              lines.forEach(function (line) {
                // Пропускаємо рядки з оголошенням
                if (
                  line.includes("const " + varName) ||
                  line.includes("let " + varName) ||
                  line.includes("var " + varName)
                ) {
                  return;
                }
                // Шукаємо використання
                if (new RegExp("\\b" + varName + "\\b").test(line)) {
                  usedVariables.add(varName);
                }
              });
            });
          });

          console.log("Used variables:", usedVariables.size);

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

          console.log("Unused variables:", unusedVariables.length);

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
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function extractZipFiles(view) {
  const files = [];

  // Шукаємо End of Central Directory
  let eocdOffset = -1;
  for (let i = view.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Invalid ZIP file: End of Central Directory not found");
  }

  const centralDirOffset = view.getUint32(eocdOffset + 16, true);
  const numEntries = view.getUint16(eocdOffset + 10, true);

  console.log("ZIP entries:", numEntries);

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

    // Пропускаємо папки
    if (fileName.endsWith("/")) {
      offset += 46 + fileNameLength + extraFieldLength + commentLength;
      continue;
    }

    // Читаємо локальний заголовок
    if (view.getUint32(localHeaderOffset, true) === 0x04034b50) {
      const compMethod = view.getUint16(localHeaderOffset + 8, true);
      const compSize = view.getUint32(localHeaderOffset + 18, true);
      const uncompSize = view.getUint32(localHeaderOffset + 22, true);
      const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLength = view.getUint16(localHeaderOffset + 28, true);

      const dataOffset =
        localHeaderOffset + 30 + localFileNameLength + localExtraLength;

      try {
        let content = "";

        if (compMethod === 0) {
          // Без стиснення
          const fileData = new Uint8Array(view.buffer, dataOffset, uncompSize);
          content = new TextDecoder().decode(fileData);
        } else if (compMethod === 8) {
          // DEFLATE стиснення
          const compressedData = new Uint8Array(
            view.buffer,
            dataOffset,
            compSize
          );

          // Використовуємо DecompressionStream API
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

          // Об'єднуємо chunks
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

        if (content) {
          files.push({
            name: fileName,
            content: content,
          });
        }
      } catch (error) {
        console.warn("Failed to extract file:", fileName, error);
      }
    }

    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  console.log("Successfully extracted files:", files.length);
  return files;
}
