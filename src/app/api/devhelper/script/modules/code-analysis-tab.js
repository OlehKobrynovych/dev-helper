// Code Analysis Tab - аналіз невикористаного коду з ZIP файлу
import { analyzeZipProject } from "./zip-analyzer.js";

export function renderCodeAnalysisTab(baseUrl, config) {
  const html =
    '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:16px;">' +
    '<p style="margin:0;font-size:13px;color:#374151;">🔍 <strong>Unused Code Detector</strong> - Завантажте ZIP архів вашого проекту для аналізу невикористаного коду</p>' +
    "</div>" +
    '<div style="text-align:center;margin-bottom:16px;">' +
    '<input type="file" id="project-zip-input" accept=".zip" style="display:none;">' +
    '<button id="upload-project-btn" style="padding:12px 24px;background:#9333ea;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;">' +
    "📁 Завантажити ZIP проекту" +
    "</button>" +
    '<p style="margin:8px 0 0;font-size:11px;color:#6b7280;">Підтримуються ZIP архіви з вихідним кодом проекту</p>' +
    "</div>" +
    '<div id="code-analysis-results"></div>';

  setTimeout(function () {
    const uploadBtn = document.getElementById("upload-project-btn");
    const fileInput = document.getElementById("project-zip-input");
    const resultsDiv = document.getElementById("code-analysis-results");

    if (uploadBtn && fileInput) {
      uploadBtn.onclick = function () {
        fileInput.click();
      };

      fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
          analyzeZipFile(file, resultsDiv, uploadBtn);
        }
      };
    }
  }, 100);

  return html;
}

function analyzeZipFile(file, resultsDiv, uploadBtn) {
  uploadBtn.disabled = true;
  uploadBtn.textContent = "🔄 Аналіз проекту...";

  resultsDiv.innerHTML =
    '<div style="text-align:center;padding:40px;"><p style="margin:0;color:#6b7280;">⏳ Розпаковка та аналіз файлів...</p></div>';

  const reader = new FileReader();

  reader.onload = function (e) {
    const zipData = e.target.result;
    analyzeProjectFiles(zipData, resultsDiv, uploadBtn);
  };

  reader.onerror = function () {
    resultsDiv.innerHTML =
      '<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;text-align:center;">' +
      '<p style="margin:0;color:#991b1b;">❌ Помилка читання файлу</p></div>';
    uploadBtn.disabled = false;
    uploadBtn.textContent = "📁 Завантажити ZIP проекту";
  };

  reader.readAsArrayBuffer(file);
}

function analyzeProjectFiles(zipData, resultsDiv, uploadBtn) {
  // Реальний аналіз ZIP файлу
  analyzeZipProject(zipData)
    .then(function (results) {
      displayResults(
        results.unusedCSS,
        results.unusedFunctions,
        results.unusedVariables,
        results.unusedImages || [],
        results.duplicateFunctions || [],
        results.apiRoutes || [],
        results.fileTypes || {},
        results.pages || [],
        results.stats,
        resultsDiv
      );

      uploadBtn.disabled = false;
      uploadBtn.textContent = "📁 Завантажити ZIP проекту";
    })
    .catch(function (error) {
      console.error("Analysis error:", error);

      resultsDiv.innerHTML =
        '<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;">' +
        '<p style="margin:0 0 8px 0;color:#991b1b;font-weight:bold;">❌ Помилка аналізу</p>' +
        '<p style="margin:0;color:#991b1b;font-size:12px;">' +
        error.message +
        "</p>" +
        '<p style="margin:8px 0 0;color:#6b7280;font-size:11px;">Переконайтесь що файл є валідним ZIP архівом без стиснення або використовуйте формат без пароля.</p>' +
        "</div>";

      uploadBtn.disabled = false;
      uploadBtn.textContent = "📁 Завантажити ZIP проекту";
    });
}

function displayResults(
  unusedCSS,
  unusedFunctions,
  unusedVariables,
  unusedImages,
  duplicateFunctions,
  apiRoutes,
  fileTypes,
  pages,
  stats,
  resultsDiv
) {
  unusedImages = unusedImages || [];
  duplicateFunctions = duplicateFunctions || [];
  apiRoutes = apiRoutes || [];
  fileTypes = fileTypes || {};
  pages = pages || [];

  let html =
    '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;margin-bottom:16px;">';
  html +=
    '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';

  // Статистика
  html +=
    '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html +=
    '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' +
    stats.cssFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' +
    stats.jsFilesAnalyzed +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього класів:</span> <strong>' +
    stats.totalCSSClasses +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' +
    stats.totalFunctions +
    "</strong></div>";
  html +=
    '<div><span style="color:#6b7280;">Всього змінних:</span> <strong>' +
    stats.totalVariables +
    "</strong></div>";
  html += "</div></div>";

  // Картки з результатами
  html +=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">';

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedCSS.length > 0 ? "#9333ea" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористаний CSS</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#9333ea;">' +
    unusedCSS.length +
    "</p>";
  if (stats.totalCSSClasses) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedCSS.length / stats.totalCSSClasses) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedFunctions.length > 0 ? "#3b82f6" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' +
    unusedFunctions.length +
    "</p>";
  if (stats.totalFunctions) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedFunctions.length / stats.totalFunctions) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html +=
    '<div style="background:#fff;border-radius:6px;padding:12px;border:2px solid ' +
    (unusedVariables.length > 0 ? "#f59e0b" : "#22c55e") +
    ';">';
  html +=
    '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані змінні</p>';
  html +=
    '<p style="margin:0;font-size:24px;font-weight:bold;color:#f59e0b;">' +
    unusedVariables.length +
    "</p>";
  if (stats.totalVariables) {
    html +=
      '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
      ((unusedVariables.length / stats.totalVariables) * 100).toFixed(1) +
      "% від всіх</p>";
  }
  html += "</div>";

  html += "</div></div>";

  // Невикористані CSS класи
  if (unusedCSS.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#9333ea;">🎨 Невикористані CSS класи</span>';
    html +=
      '<span style="font-size:11px;background:#f3e8ff;color:#7c3aed;padding:4px 8px;border-radius:4px;">' +
      unusedCSS.length +
      "</span>";
    html += "</h3>";

    html += '<div style="max-height:200px;overflow-y:auto;">';
    unusedCSS.forEach(function (item) {
      html +=
        '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
      html +=
        '<code style="font-family:monospace;color:#7c3aed;font-weight:bold;">' +
        item.name +
        "</code>";
      html +=
        '<span style="color:#6b7280;font-size:10px;">📄 ' +
        item.location +
        "</span>";
      html += "</div>";
    });
    html += "</div></div>";
  }

  // Невикористані функції
  if (unusedFunctions.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#3b82f6;">⚡ Невикористані функції</span>';
    html +=
      '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;">' +
      unusedFunctions.length +
      "</span>";
    html += "</h3>";

    html += '<div style="max-height:200px;overflow-y:auto;">';
    unusedFunctions.forEach(function (fn) {
      html +=
        '<div style="padding:8px;background:#eff6ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;">';
      html +=
        '<code style="font-family:monospace;color:#1e40af;font-weight:bold;">' +
        (fn.name || fn) +
        "()</code>";
      if (fn.location) {
        html +=
          '<span style="color:#6b7280;font-size:10px;">📄 ' +
          fn.location +
          "</span>";
      }
      html += "</div></div>";
    });
    html += "</div></div>";
  }

  // Невикористані змінні
  if (unusedVariables.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
    html += '<span style="color:#f59e0b;">📦 Невикористані змінні</span>';
    html +=
      '<span style="font-size:11px;background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;">' +
      unusedVariables.length +
      "</span>";
    html += "</h3>";

    html += '<div style="max-height:200px;overflow-y:auto;">';
    unusedVariables.forEach(function (variable) {
      const typeLabels = {
        simple: "змінна",
        useState: "state",
        "useState-setter": "setState",
        "array-destruct": "деструктуризація []",
        "object-destruct": "деструктуризація {}",
        "export-const": "export const",
      };
      const typeLabel = typeLabels[variable.type] || variable.type;

      html +=
        '<div style="padding:8px;background:#fef3c7;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html +=
        '<code style="font-family:monospace;color:#92400e;font-weight:bold;">' +
        variable.name +
        "</code>";
      html +=
        '<span style="font-size:9px;background:#fbbf24;color:#78350f;padding:2px 6px;border-radius:3px;">' +
        typeLabel +
        "</span>";
      html += "</div>";
      html +=
        '<span style="color:#6b7280;font-size:10px;">📄 ' +
        variable.location +
        "</span>";
      html += "</div>";
    });
    html += "</div></div>";
  }

  // Невикористані зображення
  if (unusedImages.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#ec4899;">🖼️ Невикористані зображення (' +
      unusedImages.length +
      ")</h3>";
    html += '<div style="max-height:200px;overflow-y:auto;">';

    unusedImages.forEach(function (image) {
      html +=
        '<div style="padding:8px;background:#fce7f3;border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="font-weight:bold;color:#9f1239;margin-bottom:4px;">' +
        image.name +
        "</div>";
      html +=
        '<div style="color:#6b7280;font-size:10px;">📄 ' +
        image.path +
        "</div>";
      html += "</div>";
    });

    html += "</div></div>";
  }

  // Дублікати функцій
  if (duplicateFunctions.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#f59e0b;">🔄 Функції з однаковими назвами (' +
      duplicateFunctions.length +
      ")</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Функції з однаковими іменами у різних файлах можуть призвести до конфліктів</p>';
    html += '<div style="max-height:200px;overflow-y:auto;">';

    duplicateFunctions.forEach(function (dup) {
      const bgColor = dup.similar ? "#fef3c7" : "#fee2e2";
      const borderColor = dup.similar ? "#fbbf24" : "#ef4444";

      html +=
        '<div style="padding:12px;background:' +
        bgColor +
        ";border-left:3px solid " +
        borderColor +
        ';border-radius:4px;margin-bottom:8px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      html +=
        '<code style="font-family:monospace;color:#92400e;font-weight:bold;font-size:13px;">' +
        dup.name +
        "()</code>";
      html += '<div style="display:flex;gap:6px;align-items:center;">';

      if (dup.similar) {
        html +=
          '<span style="background:#22c55e;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">⚠️ Схожий код</span>';
      } else {
        html +=
          '<span style="background:#3b82f6;color:#fff;padding:2px 6px;border-radius:8px;font-size:9px;">✓ Різний код</span>';
      }

      html +=
        '<span style="background:#f59e0b;color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;">' +
        dup.count +
        " файли</span>";
      html += "</div></div>";
      html += '<div style="color:#6b7280;font-size:10px;">';

      dup.locations.forEach(function (loc) {
        html += '<div style="margin-top:4px;">📄 ' + loc + "</div>";
      });

      html += "</div></div>";
    });

    html += "</div></div>";
  }

  // API Routes
  if (apiRoutes.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#8b5cf6;">🌐 API Роути (' +
      apiRoutes.length +
      ")</h3>";
    html +=
      '<p style="margin:0 0 12px 0;font-size:11px;color:#6b7280;">Знайдені API ендпоінти та їх параметри</p>';
    html += '<div style="max-height:400px;overflow-y:auto;">';

    // Групуємо за методами
    const methodColors = {
      GET: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
      POST: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
      PUT: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
      DELETE: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
      PATCH: { bg: "#e9d5ff", border: "#a855f7", text: "#6b21a8" },
    };

    apiRoutes.forEach(function (route) {
      const colors = methodColors[route.method] || methodColors.GET;

      html +=
        '<div style="padding:12px;background:' +
        colors.bg +
        ";border-left:3px solid " +
        colors.border +
        ';border-radius:4px;margin-bottom:12px;">';

      // Метод та шлях
      html +=
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html +=
        '<span style="background:' +
        colors.border +
        ';color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' +
        route.method +
        "</span>";
      html +=
        '<code style="font-family:monospace;color:' +
        colors.text +
        ';font-weight:bold;font-size:12px;">' +
        route.path +
        "</code>";
      if (route.type === "client") {
        html +=
          '<span style="background:#6b7280;color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">CLIENT</span>';
      }
      html += "</div>";

      // Параметри
      if (route.params) {
        const hasParams =
          (route.params.body && route.params.body.length > 0) ||
          (route.params.query && route.params.query.length > 0) ||
          (route.params.headers && route.params.headers.length > 0);

        if (hasParams) {
          html +=
            '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">';

          // Body параметри
          if (route.params.body && route.params.body.length > 0) {
            html +=
              '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📦 Body:</span> ';
            html +=
              '<span style="font-size:10px;color:' +
              colors.text +
              ';">' +
              route.params.body.join(", ") +
              "</span></div>";
          }

          // Query параметри
          if (route.params.query && route.params.query.length > 0) {
            html +=
              '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">🔍 Query:</span> ';
            html +=
              '<span style="font-size:10px;color:' +
              colors.text +
              ';">' +
              route.params.query.join(", ") +
              "</span></div>";
          }

          // Headers
          if (route.params.headers && route.params.headers.length > 0) {
            html +=
              '<div style="margin-bottom:6px;"><span style="font-size:10px;color:#6b7280;font-weight:bold;">📋 Headers:</span> ';
            html +=
              '<span style="font-size:10px;color:' +
              colors.text +
              ';">' +
              route.params.headers.join(", ") +
              "</span></div>";
          }

          html += "</div>";
        }
      }

      // Файли де використовується
      if (route.files && route.files.length > 0) {
        html += '<div style="margin-top:8px;font-size:10px;color:#6b7280;">';
        html += "📄 Файли: ";
        html += route.files.slice(0, 3).join(", ");
        if (route.files.length > 3) {
          html += " та ще " + (route.files.length - 3);
        }
        html += "</div>";
      }

      html += "</div>";
    });

    html += "</div></div>";
  }

  // Типи файлів
  if (Object.keys(fileTypes).length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#374151;">📄 Типи файлів</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';

    const fileTypeIcons = {
      js: "🟨",
      jsx: "⚛️",
      ts: "🔷",
      tsx: "⚛️",
      vue: "💚",
      css: "🎨",
      scss: "🎨",
      json: "📋",
      md: "📝",
      html: "🌐",
      png: "🖼️",
      jpg: "🖼️",
      svg: "🎨",
    };

    Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(function ([ext, count]) {
        const icon = fileTypeIcons[ext] || "📄";
        html +=
          '<div style="background:#f3f4f6;padding:8px 12px;border-radius:6px;font-size:11px;">';
        html +=
          "<span>" +
          icon +
          " ." +
          ext +
          '</span> <strong style="color:#3b82f6;">' +
          count +
          "</strong>";
        html += "</div>";
      });

    html += "</div></div>";
  }

  // Сторінки
  if (pages.length > 0) {
    html +=
      '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
    html +=
      '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#10b981;">📄 Сторінки (' +
      pages.length +
      ")</h3>";
    html += '<div style="max-height:300px;overflow-y:auto;">';

    pages.forEach(function (page) {
      const fileName = page.path.split("/").pop();
      const path = page.path.substring(0, page.path.lastIndexOf("/"));

      html +=
        '<div style="padding:8px;background:#ecfdf5;border-radius:4px;margin-bottom:6px;font-size:11px;">';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">';
      html +=
        '<div style="font-weight:bold;color:#059669;">' + fileName + "</div>";
      html +=
        '<span style="background:#10b981;color:#fff;padding:2px 6px;border-radius:10px;font-size:9px;">' +
        page.type +
        "</span>";
      html += "</div>";
      html +=
        '<div style="color:#6b7280;font-size:10px;">📁 ' + path + "</div>";
      html += "</div>";
    });

    html += "</div></div>";
  }

  // Якщо все чисто
  if (
    unusedCSS.length === 0 &&
    unusedFunctions.length === 0 &&
    unusedVariables.length === 0 &&
    unusedImages.length === 0 &&
    duplicateFunctions.length === 0
  ) {
    html +=
      '<div style="border:1px solid #bbf7d0;border-radius:8px;padding:24px;text-align:center;background:#f0fdf4;">';
    html += '<p style="margin:0;font-size:48px;">🎉</p>';
    html +=
      '<p style="margin:8px 0 0;color:#15803d;font-size:16px;font-weight:bold;">Чудово! Не знайдено невикористаного коду</p>';
    html +=
      '<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Ваш проект оптимізований</p>';
    html += "</div>";
  } else {
    // Рекомендації
    html +=
      '<div style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fef3c7;margin-top:16px;">';
    html +=
      '<h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#92400e;">💡 Рекомендації</h3>';
    html +=
      '<ul style="margin:0;padding-left:20px;font-size:11px;color:#92400e;">';
    if (unusedCSS.length > 0) {
      html +=
        "<li>Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>";
    }
    if (unusedFunctions.length > 0) {
      html += "<li>Видаліть невикористані функції або експорти</li>";
    }
    if (unusedVariables.length > 0) {
      html += "<li>Видаліть невикористані змінні та константи</li>";
    }
    html += '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
    html +=
      "<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>";
    html += "</ul></div>";
  }

  resultsDiv.innerHTML = html;
}
