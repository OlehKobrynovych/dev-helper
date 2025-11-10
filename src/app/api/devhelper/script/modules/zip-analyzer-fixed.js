// ВИПРАВЛЕНА ВЕРСІЯ - замініть zip-analyzer.js на цей файл

// Функція для пошуку використання функцій (ВИПРАВЛЕНА)
function findFunctionUsage(jsFiles, allFunctions) {
  const usedFunctions = new Set();

  jsFiles.forEach(function (file) {
    const content = file.content;

    allFunctions.forEach(function (info, funcName) {
      // 1. React компонент в JSX: <FuncName /> або <FuncName>
      if (new RegExp("<" + funcName + "\\s*(?:/?>|\\s)", "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }

      // 2. Виклик функції: funcName(
      if (new RegExp("\\b" + funcName + "\\s*\\(", "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }

      // 3. Передача як пропс: prop={funcName}
      if (new RegExp("\\b" + funcName + "\\s*\\}", "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }

      // 4. В JSX атрибутах: onClick={funcName}
      if (new RegExp("=\\{" + funcName + "\\}", "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }

      // 5. В хуках
      if (
        new RegExp("use(?:Effect|Callback|Memo)\\([^)]*" + funcName, "g").test(
          content
        )
      ) {
        usedFunctions.add(funcName);
        return;
      }

      // 6. Як callback
      if (
        new RegExp(
          "\\.(?:then|catch|map|filter|forEach|reduce)\\(" + funcName + "\\)",
          "g"
        ).test(content)
      ) {
        usedFunctions.add(funcName);
        return;
      }

      // 7. В масиві або об'єкті
      if (
        new RegExp("[\\[,]\\s*" + funcName + "\\s*[\\],]", "g").test(content)
      ) {
        usedFunctions.add(funcName);
        return;
      }

      // 8. Експорт
      if (new RegExp("export\\s*\\{[^}]*" + funcName, "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }

      // 9. Import
      if (new RegExp("import\\s*\\{[^}]*" + funcName, "g").test(content)) {
        usedFunctions.add(funcName);
        return;
      }
    });
  });

  return usedFunctions;
}

// Експортуйте цю функцію і використовуйте в analyzeFunctions
