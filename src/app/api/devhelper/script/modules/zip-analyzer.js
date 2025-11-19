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
          const imageFiles = files.filter((f) =>
            f.name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
          );

          console.log("🎨 CSS/SCSS files:", cssFiles.length);
          console.log("⚡ JS files:", jsFiles.length);
          console.log("🖼️ Image files:", imageFiles.length);

          const cssAnalysis = analyzeCSSClasses(cssFiles, jsFiles);
          const functionAnalysis = analyzeFunctions(jsFiles);
          const variableAnalysis = analyzeVariables(jsFiles);
          const imageAnalysis = analyzeImages(imageFiles, jsFiles, cssFiles);
          const duplicateFunctions = findDuplicateFunctions(jsFiles);
          const apiRoutes = analyzeAPIRoutes(jsFiles);
          const fileTypesInfo = analyzeFileTypes(files);
          const pagesInfo = analyzePages(files);

          resolve({
            unusedCSS: cssAnalysis.unused,
            unusedFunctions: functionAnalysis.unused,
            unusedVariables: variableAnalysis.unused,
            unusedImages: imageAnalysis.unused,
            duplicateFunctions: duplicateFunctions,
            apiRoutes: apiRoutes,
            fileTypes: fileTypesInfo,
            pages: pagesInfo,
            stats: {
              cssFilesAnalyzed: cssFiles.length,
              jsFilesAnalyzed: jsFiles.length,
              totalCSSClasses: cssAnalysis.total,
              totalFunctions: functionAnalysis.total,
              totalVariables: variableAnalysis.total,
              totalImages: imageAnalysis.total,
              totalFiles: files.length,
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

  // Список популярних бібліотечних функцій для фільтрації
  const libraryFunctions = new Set([
    "$",
    "jQuery",
    "after",
    "before",
    "append",
    "prepend",
    "remove",
    "hide",
    "show",
    "$t",
    "$i18n",
    "$router",
    "$store",
    "$emit",
    "$on",
    "$off",
    "require",
    "define",
    "module",
    "exports",
    "$d",
    "$f",
    "$s",
    "$c",
    "$v",
    "$e",
    "$a",
    "$b",
    "$g",
    "$h",
    "$j",
    "$k",
    "$l",
    "$m",
    "$n",
    "$o",
    "$p",
    "$q",
    "$r",
    "$u",
    "$w",
    "$x",
    "$y",
    "$z",
  ]);

  allFunctions.forEach(function (location, funcName) {
    // Фільтруємо бібліотечні функції
    if (libraryFunctions.has(funcName)) {
      return;
    }

    // Фільтруємо функції з 1-2 символів (часто це бібліотеки)
    if (funcName.length <= 2) {
      return;
    }

    // Фільтруємо функції з node_modules
    if (location.includes("node_modules")) {
      return;
    }

    if (!usedFunctions.has(funcName)) {
      unused.push({ name: funcName, location: location });
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

function analyzeImages(imageFiles, jsFiles, cssFiles) {
  const allImages = [];
  const usedImages = new Set();

  imageFiles.forEach(function (file) {
    const fileName = file.name.split("/").pop();
    allImages.push({ name: fileName, path: file.name });
  });

  console.log("🖼️ Found", allImages.length, "images");

  const allContent = jsFiles
    .concat(cssFiles)
    .map((f) => f.content)
    .join(" ");

  allImages.forEach(function (img) {
    if (allContent.includes(img.name)) {
      usedImages.add(img.name);
    }
  });

  console.log("🖼️ Used", usedImages.size, "images");

  const unused = allImages.filter((img) => !usedImages.has(img.name));

  console.log("🖼️ Unused", unused.length, "images");
  return { total: allImages.length, unused: unused };
}

function findDuplicateFunctions(jsFiles) {
  const functionData = {};

  jsFiles.forEach(function (file) {
    const content = file.content;
    const lines = content.split("\n");

    // Знаходимо функції з їх тілом
    lines.forEach(function (line, index) {
      // Пропускаємо змінні з new (const cookies = new Cookies())
      if (line.match(/(?:const|let|var)\s+\w+\s*=\s*new\s+/)) {
        return;
      }

      // Пропускаємо виклики методів (cookies.get())
      if (line.match(/(?:const|let|var)\s+\w+\s*=\s*\w+\.\w+\(/)) {
        return;
      }

      // Знаходимо оголошення функцій
      const funcMatch = line.match(
        /(?:function\s+|export\s+function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/
      );
      const arrowMatch = line.match(
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/
      );

      const funcName = funcMatch
        ? funcMatch[1]
        : arrowMatch
          ? arrowMatch[1]
          : null;

      if (funcName) {
        // Витягуємо тіло функції (наступні 5 рядків для порівняння)
        const bodyLines = lines.slice(index + 1, index + 6).join("\n");
        const normalizedBody = bodyLines
          .replace(/\s+/g, " ")
          .replace(/\/\/.*/g, "")
          .trim()
          .substring(0, 100);

        if (!functionData[funcName]) {
          functionData[funcName] = [];
        }

        functionData[funcName].push({
          file: file.name,
          body: normalizedBody,
        });
      }
    });
  });

  const duplicates = [];

  Object.keys(functionData).forEach(function (funcName) {
    const occurrences = functionData[funcName];

    if (occurrences.length > 1) {
      const uniqueFiles = {};

      occurrences.forEach(function (occ) {
        if (!uniqueFiles[occ.file]) {
          uniqueFiles[occ.file] = occ.body;
        }
      });

      const fileNames = Object.keys(uniqueFiles);

      if (fileNames.length > 1) {
        // Перевіряємо чи тіла функцій схожі
        const bodies = Object.values(uniqueFiles);
        const firstBody = bodies[0];
        let allSimilar = true;

        for (let i = 1; i < bodies.length; i++) {
          const similarity = calculateSimilarity(firstBody, bodies[i]);
          if (similarity < 0.7) {
            allSimilar = false;
            break;
          }
        }

        duplicates.push({
          name: funcName,
          count: fileNames.length,
          locations: fileNames,
          similar: allSimilar,
        });
      }
    }
  });

  console.log("🔄 Found", duplicates.length, "duplicate function names");
  return duplicates;
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  let matches = 0;
  const minLen = Math.min(len1, len2);

  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) {
      matches++;
    }
  }

  return matches / maxLen;
}

function analyzeAPIRoutes(jsFiles) {
  const routes = [];

  jsFiles.forEach(function (file) {
    const content = file.content;

    // 1. Next.js API Routes: export async function GET(request)
    const nextApiMatches = content.matchAll(
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/gi
    );
    for (const match of nextApiMatches) {
      const method = match[1].toUpperCase();
      const path = extractNextJSPath(file.name);
      const lineNum = content.substring(0, match.index).split("\n").length;
      const params = extractRouteParamsFromContent(content, match.index);
      routes.push({
        method: method,
        path: path,
        file: file.name,
        line: lineNum,
        params: params,
      });
    }

    // 2. Express.js стиль: app.get('/api/users', ...) або router.post(...)
    const expressMatches = content.matchAll(
      /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of expressMatches) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const lineNum = content.substring(0, match.index).split("\n").length;
      const params = extractRouteParamsFromContent(content, match.index);
      routes.push({
        method: method,
        path: path,
        file: file.name,
        line: lineNum,
        params: params,
      });
    }

    // 3. Fetch викли: fetch('/api/users') або fetch(`/api/${id}`)
    // Шукаємо всі fetch виклики
    const fetchMatches = content.matchAll(
      /\bfetch\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of fetchMatches) {
      const path = match[1];
      const lineNum = content.substring(0, match.index).split("\n").length;

      // Шукаємо метод в наступних 200 символах
      const contextAfter = content.substring(match.index, match.index + 200);
      const methodMatch = contextAfter.match(
        /method\s*:\s*['"`]([^'"`]+)['"`]/i
      );
      const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

      const params = extractFetchParamsFromContent(content, match.index);
      routes.push({
        method: method,
        path: path,
        file: file.name,
        line: lineNum,
        params: params,
        type: "client",
      });
    }

    // 4. Axios прямі методи: axios.get('/api/users') або axios.post(...)
    const axiosDirectMatches = content.matchAll(
      /\baxios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of axiosDirectMatches) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const lineNum = content.substring(0, match.index).split("\n").length;
      const params = extractAxiosParamsFromContent(content, match.index);
      routes.push({
        method: method,
        path: path,
        file: file.name,
        line: lineNum,
        params: params,
        type: "client",
      });
    }

    // 5. Axios конфіг: axios({ method: 'POST', url: '/api/users' })
    const axiosConfigMatches = content.matchAll(
      /\baxios\s*\(\s*\{[^}]*?(?:method\s*:\s*['"`]([^'"`]+)['"`])[^}]*?(?:url\s*:\s*['"`]([^'"`]+)['"`])|(?:url\s*:\s*['"`]([^'"`]+)['"`])[^}]*?(?:method\s*:\s*['"`]([^'"`]+)['"`])/gis
    );
    for (const match of axiosConfigMatches) {
      const method = (match[1] || match[4] || "GET").toUpperCase();
      const path = match[2] || match[3];
      if (path) {
        const lineNum = content.substring(0, match.index).split("\n").length;
        const params = extractAxiosParamsFromContent(content, match.index);
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: params,
          type: "client",
        });
      }
    }

    // 6. axiosInterceptor.get або інші кастомні інстанси
    // Оновлений regex: підтримує api.get, http.post, request.put, client.delete
    // та суфікси Service, Interceptor, Client, Api, Instance, Axios
    const customAxiosMatches = content.matchAll(
      /\b((?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:Interceptor|Client|Api|Instance|Axios|Service)|api|http|request|client)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of customAxiosMatches) {
      const method = match[2].toUpperCase();
      const path = match[3];
      const lineNum = content.substring(0, match.index).split("\n").length;
      const params = extractAxiosParamsFromContent(content, match.index);
      routes.push({
        method: method,
        path: path,
        file: file.name,
        line: lineNum,
        params: params,
        type: "client",
      });
    }

    // 7. useSWR hooks: useSWR('/api/user', fetcher)
    const swrMatches = content.matchAll(
      /\buseSWR\s*\(\s*['"`]([^'"`]+)['"`]/gi
    );
    for (const match of swrMatches) {
      const path = match[1];
      const lineNum = content.substring(0, match.index).split("\n").length;
      routes.push({
        method: "GET", // SWR зазвичай використовується для GET запитів
        path: path,
        file: file.name,
        line: lineNum,
        params: null,
        type: "client",
      });
    }

    // 8. Custom Request Wrappers: fetchRequest("GET", "/api/url")
    // Підтримує виклики де метод передається першим аргументом
    const customWrapperMatches = content.matchAll(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*["'](GET|POST|PUT|DELETE|PATCH)["']\s*,\s*[`'"]([^`'"]+)[`'"]/gi
    );
    for (const match of customWrapperMatches) {
      const method = match[2].toUpperCase();
      const path = match[3];
      const lineNum = content.substring(0, match.index).split("\n").length;
      
      // Фільтруємо якщо це не схоже на URL (занадто коротке або без слешів, хоча це евристика)
      if (path.length > 1) {
        routes.push({
          method: method,
          path: path,
          file: file.name,
          line: lineNum,
          params: null,
          type: "client",
        });
      }
    }
  });

  // Групуємо роути за шляхом та методом
  const groupedRoutes = {};
  routes.forEach(function (route) {
    const key = route.method + " " + route.path;
    if (!groupedRoutes[key]) {
      groupedRoutes[key] = {
        method: route.method,
        path: route.path,
        files: [],
        params: route.params,
        type: route.type,
      };
    }

    const fileInfo = route.file + (route.line ? ":" + route.line : "");
    if (groupedRoutes[key].files.indexOf(fileInfo) === -1) {
      groupedRoutes[key].files.push(fileInfo);
    }

    // Об'єднуємо параметри з різних файлів
    if (route.params) {
      if (!groupedRoutes[key].params) {
        groupedRoutes[key].params = route.params;
      } else {
        Object.keys(route.params).forEach(function (paramType) {
          if (route.params[paramType]) {
            if (!groupedRoutes[key].params[paramType]) {
              groupedRoutes[key].params[paramType] = [];
            }
            route.params[paramType].forEach(function (param) {
              if (groupedRoutes[key].params[paramType].indexOf(param) === -1) {
                groupedRoutes[key].params[paramType].push(param);
              }
            });
          }
        });
      }
    }
  });

  const result = Object.values(groupedRoutes);
  console.log("🌐 Found", result.length, "API routes");
  return result;
}

function extractNextJSPath(fileName) {
  // Конвертуємо шлях файлу Next.js в API роут
  // Наприклад: src/app/api/users/route.ts -> /api/users
  const match = fileName.match(/\/api\/(.+?)\/route\.(js|ts|jsx|tsx)$/);
  if (match) {
    return "/api/" + match[1];
  }
  // Для pages/api
  const pagesMatch = fileName.match(/\/pages\/api\/(.+?)\.(js|ts|jsx|tsx)$/);
  if (pagesMatch) {
    return "/api/" + pagesMatch[1];
  }
  return fileName;
}

function extractRouteParamsFromContent(content, startIndex) {
  const params = {
    body: [],
    query: [],
    headers: [],
  };

  // Беремо контекст 1000 символів після початку функції
  const context = content.substring(startIndex, startIndex + 1000);

  // Body параметри: req.body.username, request.json(), await request.json()
  const bodyMatches = context.matchAll(
    /(?:req\.body|request\.json\(\)|await\s+request\.json\(\))\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  );
  for (const match of bodyMatches) {
    if (params.body.indexOf(match[1]) === -1) {
      params.body.push(match[1]);
    }
  }

  // Деструктуризація body: const { username, password } = req.body або await request.json()
  const destructMatches = context.matchAll(
    /const\s*\{\s*([^}]+)\}\s*=\s*(?:await\s+)?(?:req\.body|request\.json\(\)|body)/g
  );
  for (const match of destructMatches) {
    const vars = match[1].split(",");
    vars.forEach(function (v) {
      const varName = v.trim().split(":")[0].trim();
      if (varName && params.body.indexOf(varName) === -1) {
        params.body.push(varName);
      }
    });
  }

  // Query параметри: req.query.page, searchParams.get('page'), params.get('id')
  const queryMatches = context.matchAll(
    /(?:req\.query|searchParams|params)\.(?:get\s*\(\s*['"`]([^'"`]+)['"`]\)|([a-zA-Z_$][a-zA-Z0-9_$]*))/g
  );
  for (const match of queryMatches) {
    const paramName = match[1] || match[2];
    if (paramName && params.query.indexOf(paramName) === -1) {
      params.query.push(paramName);
    }
  }

  // Headers: req.headers.authorization, headers.get('Authorization')
  const headerMatches = context.matchAll(
    /(?:req\.)?headers\.(?:get\s*\(\s*['"`]([^'"`]+)['"`]\)|([a-zA-Z_$][a-zA-Z0-9_$-]*))/g
  );
  for (const match of headerMatches) {
    const headerName = match[1] || match[2];
    if (headerName && params.headers.indexOf(headerName) === -1) {
      params.headers.push(headerName);
    }
  }

  return params;
}

function extractFetchParamsFromContent(content, startIndex) {
  const params = {
    body: [],
    query: [],
    headers: [],
  };

  // Беремо контекст 500 символів після fetch виклику
  const context = content.substring(startIndex, startIndex + 500);

  // body: JSON.stringify({ username, password }) або body: formData
  const bodyStringifyMatches = context.matchAll(
    /body\s*:\s*JSON\.stringify\s*\(\s*\{([^}]+)\}/g
  );
  for (const match of bodyStringifyMatches) {
    const vars = match[1].split(",");
    vars.forEach(function (v) {
      const varName = v.trim().split(":")[0].trim();
      if (varName && params.body.indexOf(varName) === -1) {
        params.body.push(varName);
      }
    });
  }

  // body: { key: value }
  const bodyObjectMatches = context.matchAll(/body\s*:\s*\{([^}]+)\}/g);
  for (const match of bodyObjectMatches) {
    if (!match[1].includes("JSON.stringify")) {
      const vars = match[1].split(",");
      vars.forEach(function (v) {
        const varName = v.trim().split(":")[0].trim();
        if (varName && params.body.indexOf(varName) === -1) {
          params.body.push(varName);
        }
      });
    }
  }

  // headers: { 'Content-Type': '...', 'Authorization': token }
  const headerMatches = context.matchAll(/headers\s*:\s*\{([^}]+)\}/g);
  for (const match of headerMatches) {
    const headerLines = match[1].split(",");
    headerLines.forEach(function (line) {
      const headerMatch = line.match(/['"`]([a-zA-Z-]+)['"`]\s*:/);
      if (headerMatch && params.headers.indexOf(headerMatch[1]) === -1) {
        params.headers.push(headerMatch[1]);
      }
    });
  }

  return params;
}

function extractAxiosParamsFromContent(content, startIndex) {
  const params = {
    body: [],
    query: [],
    headers: [],
  };

  // Беремо контекст 500 символів після axios виклику
  const context = content.substring(startIndex, startIndex + 500);

  // data: { username, password } або другий параметр axios.post('/api', { data })
  const dataMatches = context.matchAll(
    /(?:data\s*:\s*\{([^}]+)\}|\{\s*([^}]+)\s*\})/g
  );
  for (const match of dataMatches) {
    const dataContent = match[1] || match[2];
    if (dataContent) {
      const vars = dataContent.split(",");
      vars.forEach(function (v) {
        const varName = v.trim().split(":")[0].trim();
        // Фільтруємо ключові слова
        if (
          varName &&
          varName !== "method" &&
          varName !== "url" &&
          varName !== "headers" &&
          varName !== "params" &&
          params.body.indexOf(varName) === -1
        ) {
          params.body.push(varName);
        }
      });
    }
  }

  // params: { page, limit } - query параметри
  const paramsMatches = context.matchAll(/params\s*:\s*\{([^}]+)\}/g);
  for (const match of paramsMatches) {
    const vars = match[1].split(",");
    vars.forEach(function (v) {
      const varName = v.trim().split(":")[0].trim();
      if (varName && params.query.indexOf(varName) === -1) {
        params.query.push(varName);
      }
    });
  }

  // headers: { 'Content-Type': '...', Authorization: token }
  const headerMatches = context.matchAll(/headers\s*:\s*\{([^}]+)\}/g);
  for (const match of headerMatches) {
    const headerLines = match[1].split(",");
    headerLines.forEach(function (line) {
      const headerMatch = line.match(/['"`]?([a-zA-Z-]+)['"`]?\s*:/);
      if (headerMatch && params.headers.indexOf(headerMatch[1]) === -1) {
        params.headers.push(headerMatch[1]);
      }
    });
  }

  return params;
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

function analyzeFileTypes(files) {
  const fileTypes = {};

  files.forEach(function (file) {
    if (file.name.includes("node_modules/")) return;
    if (file.name.includes(".git/")) return;

    const ext = file.name.split(".").pop();
    if (ext && ext.length < 10) {
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }
  });

  return fileTypes;
}

function analyzePages(files) {
  const pages = [];

  files.forEach(function (file) {
    if (file.name.includes("node_modules/")) return;
    if (file.name.includes(".git/")) return;
    if (file.name.includes("/.")) return; // Пропускаємо приховані файли

    // Next.js App Router: app/**/page.tsx
    if (file.name.match(/\/app\/.*\/page\.(jsx?|tsx?)$/i)) {
      pages.push({
        path: file.name,
        type: "Next.js App Router",
      });
    }
    // Next.js Pages Router: pages/**/*.tsx (але не _app, _document, _error)
    else if (
      file.name.match(/\/pages\/.*\.(jsx?|tsx?)$/i) &&
      !file.name.match(/\/((_app|_document|_error|api)\.(jsx?|tsx?)|api\/)/i)
    ) {
      pages.push({
        path: file.name,
        type: "Next.js Pages Router",
      });
    }
    // React Router: src/pages/**/*.tsx або src/views/**/*.tsx
    else if (
      file.name.match(/\/src\/(pages|views|screens|routes)\/.*\.(jsx?|tsx?)$/i)
    ) {
      pages.push({
        path: file.name,
        type: "React Page",
      });
    }
    // React: компоненти які виглядають як сторінки (Home, About, Dashboard, тощо)
    else if (
      file.name.match(
        /\/(Home|About|Dashboard|Profile|Login|Register|Contact|Settings|Admin|User|Product|Cart|Checkout|Detail|List|Index|Main)(Page)?\.(jsx?|tsx?)$/i
      )
    ) {
      pages.push({
        path: file.name,
        type: "React Component",
      });
    }
    // Vue/Nuxt: pages/**/*.vue
    else if (file.name.match(/\/pages\/.*\.vue$/i)) {
      pages.push({
        path: file.name,
        type: "Vue/Nuxt",
      });
    }
    // Vue: views/**/*.vue
    else if (file.name.match(/\/views\/.*\.vue$/i)) {
      pages.push({
        path: file.name,
        type: "Vue View",
      });
    }
    // Angular: *.component.ts
    else if (file.name.match(/\.component\.(ts|js)$/i)) {
      pages.push({
        path: file.name,
        type: "Angular Component",
      });
    }
  });

  return pages;
}
