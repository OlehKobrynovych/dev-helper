// Core функціонал DevHelper - перехоплення помилок та базова логіка
export function createDevHelperCore(config, baseUrl) {
  const errors = [];
  const originalConsole = {
    error: console.error,
    warn: console.warn,
  };

  // Intercept console
  console.error = function (...args) {
    captureError("error", args);
    originalConsole.error.apply(console, args);
  };

  console.warn = function (...args) {
    captureError("warning", args);
    originalConsole.warn.apply(console, args);
  };

  // Intercept errors
  window.addEventListener("error", function (event) {
    captureError("error", [event.message], {
      stack: event.error?.stack,
      url: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    captureError("error", [event.reason]);
  });

  function extractFileInfo(stack) {
    if (!stack) return {};

    const lines = stack.split("\\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/(?:at\\s+.*?\\()?([^()]+):(\\d+):(\\d+)\\)?/);
      if (match && match[1]) {
        const url = match[1].trim();
        const lineNumber = parseInt(match[2], 10);
        const columnNumber = parseInt(match[3], 10);
        const fileName = url.split("/").pop().split("?")[0];
        return {
          url: url,
          lineNumber: lineNumber,
          columnNumber: columnNumber,
          fileName: fileName,
        };
      }
    }
    return {};
  }

  function captureError(type, args, extra = {}) {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");

    const stack = extra.stack || new Error().stack;
    const fileInfo = extractFileInfo(stack);

    errors.push({
      type: type,
      message: message,
      timestamp: Date.now(),
      stack: stack,
      ...fileInfo,
      ...extra,
    });
  }

  function sendReport() {
    fetch(baseUrl + "/api/devhelper/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({
        projectId: config.projectId,
        errors: errors,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(function (error) {
      originalConsole.error("DevHelper: Failed to send report", error);
    });
  }

  function downloadReport() {
    let report = "# DevHelper Report\\n\\n";
    report += "**Date:** " + new Date().toLocaleString("uk-UA") + "\\n\\n";
    report += "## Summary\\n\\n";
    report += "- Total Issues: " + errors.length + "\\n\\n";

    errors.forEach(function (error, index) {
      report += "### " + (index + 1) + ". " + error.message + "\\n\\n";
      if (error.stack) {
        report += "\`\`\`\\n" + error.stack + "\\n\`\`\`\\n\\n";
      }
      report +=
        "**Time:** " +
        new Date(error.timestamp).toLocaleString("uk-UA") +
        "\\n\\n";
      report += "---\\n\\n";
    });

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devhelper-report-" + Date.now() + ".md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function analyzeWithAI() {
    if (errors.length === 0) {
      alert("Немає помилок для аналізу");
      return Promise.resolve();
    }

    return fetch(baseUrl + "/api/devhelper/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({ errors: errors }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to analyze errors");
        return response.json();
      })
      .then(function (data) {
        if (data.success && data.analyzedErrors) {
          errors.length = 0;
          data.analyzedErrors.forEach(function (err) {
            errors.push(err);
          });
          alert("✅ Аналіз завершено! Перегляньте оновлені помилки.");
        }
      })
      .catch(function (error) {
        console.error("AI analysis failed:", error);
        alert("❌ Не вдалося проаналізувати помилки. Перевірте консоль.");
      });
  }

  window.analyzeError = function (errorIndex) {
    if (errorIndex < 0 || errorIndex >= errors.length) {
      alert("Помилка не знайдена");
      return;
    }

    const errorToAnalyze = errors[errorIndex];
    const button = window.event.target;
    button.disabled = true;
    button.textContent = "⏳ Аналіз...";

    fetch(baseUrl + "/api/devhelper/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({ errors: [errorToAnalyze] }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to analyze error");
        return response.json();
      })
      .then(function (data) {
        if (data.success && data.analyzedErrors && data.analyzedErrors[0]) {
          errors[errorIndex] = data.analyzedErrors[0];
          // Використовуємо глобальну функцію оновлення модалки
          if (window.DevHelperUpdateModal) {
            window.DevHelperUpdateModal();
          }
        }
      })
      .catch(function (error) {
        console.error("AI analysis failed:", error);
        alert("❌ Не вдалося проаналізувати помилку.");
        button.disabled = false;
        button.textContent = "🤖 AI";
      });
  };

  // Auto report
  if (config.autoReport) {
    setInterval(function () {
      if (errors.length > 0) {
        sendReport();
      }
    }, 60000);
  }

  return {
    errors,
    getErrors: function () {
      return errors;
    },
    clearErrors: function () {
      errors.length = 0;
    },
    sendReport,
    downloadReport,
    analyzeWithAI,
  };
}
