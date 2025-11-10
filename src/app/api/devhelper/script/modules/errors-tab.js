// Errors Tab - відображення списку помилок
export function renderErrorsTab(errors) {
  if (errors.length === 0) {
    return '<div style="text-align:center;color:#6b7280;padding:40px 20px;"><p style="margin:0 0 16px 0;">Немає помилок</p><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:left;"><p style="margin:0 0 8px 0;font-weight:bold;font-size:14px;color:#1e40af;">💡 Швидке тестування:</p><p style="margin:0;font-size:13px;color:#374151;">Відкрийте консоль (F12) та виконайте:</p><pre style="margin:8px 0 0 0;padding:8px;background:#1e293b;color:#e2e8f0;border-radius:4px;font-size:12px;overflow-x:auto;">console.error("Test error");\\nconsole.warn("Test warning");\\nthrow new Error("Test runtime error");</pre></div></div>';
  }

  const container = document.createElement("div");

  errors.forEach(function (error, index) {
    const item = document.createElement("div");
    item.style.cssText =
      "border:1px solid #e5e7eb;border-radius:4px;padding:12px;margin-bottom:8px;";

    const icon = error.type === "error" ? "❌" : "⚠️";
    const color = error.type === "error" ? "#ef4444" : "#f59e0b";

    let html =
      '<div style="display:flex;gap:8px;"><span style="font-size:16px;">' +
      icon +
      '</span><div style="flex:1;">';

    html +=
      '<div style="display:flex;align-items:start;justify-content:space-between;gap:8px;">';
    html +=
      '<p style="margin:0;font-family:monospace;font-size:13px;color:' +
      color +
      ';flex:1;">' +
      error.message +
      "</p>";

    if (!error.aiAnalysis) {
      html +=
        '<button onclick="analyzeError(' +
        index +
        ')" style="padding:4px 12px;background:#9333ea;color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;white-space:nowrap;" title="Аналізувати з AI">🤖 AI</button>';
    }

    html += "</div>";

    // AI Аналіз
    if (error.aiAnalysis) {
      const severityColors = {
        critical: "background:#fee;border-color:#fcc;color:#c00",
        high: "background:#fed;border-color:#fca;color:#c50",
        medium: "background:#ffc;border-color:#fc6;color:#960",
        low: "background:#efe;border-color:#cfc;color:#060",
      };
      const severityLabels = {
        critical: "Критична",
        high: "Висока",
        medium: "Середня",
        low: "Низька",
      };
      const severityStyle =
        severityColors[error.severity] || severityColors.medium;
      const severityLabel = severityLabels[error.severity] || "Середня";

      html +=
        '<div style="margin-top:12px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;">';
      html +=
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      html +=
        '<span style="font-weight:bold;font-size:11px;color:#2563eb;">🤖 AI АНАЛІЗ</span>';
      html +=
        '<span style="font-size:10px;padding:2px 8px;border-radius:3px;' +
        severityStyle +
        '">' +
        severityLabel +
        "</span>";
      html += "</div>";
      html +=
        '<p style="margin:0;font-size:13px;color:#374151;">' +
        error.aiAnalysis +
        "</p>";
      html += "</div>";
    }

    // Рекомендації
    if (error.suggestions && error.suggestions.length > 0) {
      html +=
        '<div style="margin-top:12px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;">';
      html +=
        '<p style="margin:0 0 8px 0;font-weight:bold;font-size:11px;color:#15803d;">💡 РЕКОМЕНДАЦІЇ:</p>';
      html +=
        '<ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;">';
      error.suggestions.forEach(function (suggestion) {
        html += '<li style="margin-bottom:4px;">' + suggestion + "</li>";
      });
      html += "</ul>";
      html += "</div>";
    }

    // Інформація про файл
    if (error.fileName || error.url || error.lineNumber) {
      html +=
        '<div style="margin-top:8px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;">';
      html += '<p style="margin:0;font-size:11px;color:#92400e;">';

      if (error.fileName) {
        html +=
          '<strong>📄 Файл:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;font-weight:bold;">' +
          error.fileName +
          "</code>";
      } else if (error.url) {
        const fileName = error.url.split("/").pop() || error.url;
        html +=
          '<strong>📄 Файл:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;font-weight:bold;">' +
          fileName +
          "</code>";
      }

      if (error.lineNumber) {
        html +=
          ' <strong>Рядок:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;color:#1e40af;">' +
          error.lineNumber +
          "</code>";
      }

      if (error.columnNumber) {
        html +=
          '<strong>:</strong><code style="background:#fef9e7;padding:2px 6px;border-radius:3px;color:#1e40af;">' +
          error.columnNumber +
          "</code>";
      }

      html += "</p></div>";
    }

    if (error.stack) {
      html +=
        '<details style="margin-top:8px;"><summary style="font-size:11px;color:#6b7280;cursor:pointer;">📋 Stack trace</summary>';
      html +=
        '<pre style="margin:8px 0 0;font-size:11px;color:#6b7280;overflow-x:auto;background:#f9fafb;padding:8px;border-radius:4px;">' +
        error.stack +
        "</pre>";
      html += "</details>";
    }

    html +=
      '<p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">🕐 ' +
      new Date(error.timestamp).toLocaleString("uk-UA") +
      "</p></div></div>";

    item.innerHTML = html;
    container.appendChild(item);
  });

  return container.innerHTML;
}
