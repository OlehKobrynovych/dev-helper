// Code Analysis Tab - аналіз невикористаного коду
export function renderCodeAnalysisTab(baseUrl, config) {
  let codeAnalysisResults = null;

  const html =
    '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#374151;">🔍 <strong>Unused Code Detector</strong> - Знаходить невикористаний CSS та JavaScript код у вашому проекті</p></div>' +
    '<div style="text-align:center;margin-bottom:16px;"><button id="analyze-current-project-btn" style="padding:12px 24px;background:#9333ea;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;">🚀 Сканувати проект</button><p style="margin:8px 0 0;font-size:11px;color:#6b7280;">Сканування проекту може зайняти до 30 секунд</p></div>' +
    '<div id="code-analysis-results">' +
    (codeAnalysisResults || "") +
    "</div>";

  setTimeout(function () {
    const analyzeProjectBtn = document.getElementById(
      "analyze-current-project-btn"
    );
    if (analyzeProjectBtn) {
      analyzeProjectBtn.onclick = function () {
        if (analyzeProjectBtn.disabled) return;

        analyzeProjectBtn.disabled = true;
        analyzeProjectBtn.textContent = "🔄 Сканування проекту...";

        fetch(baseUrl + "/api/devhelper/analyze-project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": config.apiKey,
          },
          body: JSON.stringify({ scanCurrentProject: true }),
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Failed to analyze project");
            return response.json();
          })
          .then(function (data) {
            if (!data.success) throw new Error(data.error || "Analysis failed");

            const unusedCSS = data.unusedCSS || [];
            const unusedFunctions = data.unusedFunctions || [];
            const stats = data.stats || {};

            let html =
              '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:linear-gradient(to right, #faf5ff, #fce7f3);margin-bottom:16px;">';
            html +=
              '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';

            if (stats.cssFilesAnalyzed || stats.jsFilesAnalyzed) {
              html +=
                '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
              html +=
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
              html +=
                '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' +
                (stats.cssFilesAnalyzed || 0) +
                "</strong></div>";
              html +=
                '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' +
                (stats.jsFilesAnalyzed || 0) +
                "</strong></div>";
              html +=
                '<div><span style="color:#6b7280;">Всього CSS класів:</span> <strong>' +
                (stats.totalCSSClasses || 0) +
                "</strong></div>";
              html +=
                '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' +
                (stats.totalFunctions || 0) +
                "</strong></div>";
              html += "</div></div>";
            }

            html +=
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
            html +=
              '<div style="background:#fff;border-radius:6px;padding:12px;">';
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
              '<div style="background:#fff;border-radius:6px;padding:12px;">';
            html +=
              '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
            html +=
              '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' +
              unusedFunctions.length +
              "</p>";
            if (stats.totalFunctions) {
              html +=
                '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' +
                ((unusedFunctions.length / stats.totalFunctions) * 100).toFixed(
                  1
                ) +
                "% від всіх</p>";
            }
            html += "</div>";
            html += "</div></div>";

            if (unusedCSS.length > 0) {
              html +=
                '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
              html +=
                '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
              html +=
                '<span style="color:#9333ea;">🎨 Невикористані CSS класи</span>';
              html +=
                '<span style="font-size:11px;background:#f3e8ff;color:#7c3aed;padding:4px 8px;border-radius:4px;">' +
                unusedCSS.length +
                "</span>";
              html += "</h3>";

              if (unusedCSS.length > 50) {
                html +=
                  '<div style="margin-bottom:12px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;font-size:11px;color:#92400e;">';
                html +=
                  "⚠️ Показано перші 50 класів з " +
                  unusedCSS.length +
                  ". Завантажте повний звіт для перегляду всіх.";
                html += "</div>";
              }

              html += '<div style="max-height:300px;overflow-y:auto;">';
              unusedCSS.slice(0, 50).forEach(function (item) {
                const className = item.name || item;
                const location = item.location || "";
                html +=
                  '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
                html +=
                  '<code style="font-family:monospace;color:#7c3aed;font-weight:bold;">' +
                  className +
                  "</code>";
                if (location) {
                  html +=
                    '<p style="margin:4px 0 0;color:#6b7280;">📄 ' +
                    location +
                    "</p>";
                }
                html += "</div>";
              });
              html += "</div>";

              if (unusedCSS.length > 50) {
                html +=
                  '<p style="margin:12px 0 0;font-size:11px;color:#6b7280;text-align:center;">... та ще ' +
                  (unusedCSS.length - 50) +
                  " класів</p>";
              }
              html += "</div>";
            }

            if (unusedFunctions.length > 0) {
              html +=
                '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
              html +=
                '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
              html +=
                '<span style="color:#3b82f6;">⚡ Невикористані функції</span>';
              html +=
                '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;">' +
                unusedFunctions.length +
                "</span>";
              html += "</h3>";
              html += '<div style="max-height:200px;overflow-y:auto;">';
              unusedFunctions.slice(0, 30).forEach(function (fn) {
                html +=
                  '<div style="padding:8px;background:#eff6ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
                html +=
                  '<code style="font-family:monospace;color:#1e40af;">' +
                  fn +
                  "()</code>";
                html += "</div>";
              });
              if (unusedFunctions.length > 30) {
                html +=
                  '<p style="margin:8px 0 0;font-size:11px;color:#6b7280;text-align:center;">... та ще ' +
                  (unusedFunctions.length - 30) +
                  " функцій</p>";
              }
              html += "</div></div>";
            }

            if (unusedCSS.length === 0 && unusedFunctions.length === 0) {
              html +=
                '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">';
              html +=
                '<p style="margin:0;color:#6b7280;font-size:13px;">✅ Не знайдено невикористаного коду в проекті</p>';
              html += "</div>";
            }

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
            html +=
              '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
            html +=
              "<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>";
            html += "</ul></div>";

            codeAnalysisResults = html;
            document.getElementById("code-analysis-results").innerHTML = html;
            analyzeProjectBtn.disabled = false;
            analyzeProjectBtn.textContent = "🚀 Сканувати проект";
          })
          .catch(function (error) {
            console.error("Project analysis failed:", error);
            alert("❌ Помилка аналізу проекту: " + error.message);
            analyzeProjectBtn.disabled = false;
            analyzeProjectBtn.textContent = "🚀 Сканувати проект";
          });
      };
    }
  }, 100);

  return html;
}
