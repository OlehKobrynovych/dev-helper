// Testing Tab - тестування помилок
export function renderTestingTab() {
  const html =
    '<p style="margin:0 0 16px 0;font-size:13px;color:#6b7280;">Натисніть на кнопки нижче, щоб згенерувати тестові помилки:</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<button onclick="testConsoleError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Console Error</span></div>' +
    "</button>" +
    '<button onclick="testConsoleWarning()" style="background:#eab308;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚠️</span><span style="font-weight:bold;font-size:13px;">Console Warning</span></div>' +
    "</button>" +
    '<button onclick="testRuntimeError()" style="background:#9333ea;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚡</span><span style="font-weight:bold;font-size:13px;">Runtime Error</span></div>' +
    "</button>" +
    '<button onclick="testPromiseRejection()" style="background:#3b82f6;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">ℹ️</span><span style="font-weight:bold;font-size:13px;">Promise Rejection</span></div>' +
    "</button>" +
    '<button onclick="testUndefinedError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Undefined Error</span></div>' +
    "</button>" +
    '<button onclick="testTypeError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Type Error</span></div>' +
    "</button>" +
    '<button onclick="testNetworkError()" style="background:#eab308;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚠️</span><span style="font-weight:bold;font-size:13px;">Network Error</span></div>' +
    "</button>" +
    '<button onclick="testMultipleErrors()" style="background:#3b82f6;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">ℹ️</span><span style="font-weight:bold;font-size:13px;">Multiple Errors</span></div>' +
    "</button>" +
    "</div>" +
    '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">' +
    '<p style="margin:0;font-size:13px;color:#374151;">💡 <strong>Підказка:</strong> Після виклику помилок, перейдіть на вкладку "Помилки" та натисніть "🤖 AI" для отримання детального аналізу.</p>' +
    "</div>";

  // Define test functions
  window.testConsoleError = function () {
    console.error("Тестова помилка від DevHelper");
  };

  window.testConsoleWarning = function () {
    console.warn("Тестове попередження від DevHelper");
  };

  window.testRuntimeError = function () {
    try {
      throw new Error("Тестова runtime помилка");
    } catch (e) {
      console.error(e);
    }
  };

  window.testPromiseRejection = function () {
    Promise.reject("Тестове відхилення Promise").catch(function () {});
  };

  window.testUndefinedError = function () {
    try {
      var obj = undefined;
      console.log(obj.property);
    } catch (e) {
      console.error("Cannot read property of undefined");
    }
  };

  window.testTypeError = function () {
    try {
      var num = null;
      num.toFixed(2);
    } catch (e) {
      console.error("TypeError: Cannot read property toFixed");
    }
  };

  window.testNetworkError = function () {
    fetch("https://invalid-url-that-does-not-exist.com").catch(
      function (error) {
        console.error("Network Error:", error.message);
      }
    );
  };

  window.testMultipleErrors = function () {
    console.error("Помилка 1");
    console.warn("Попередження 1");
    console.error("Помилка 2");
    console.warn("Попередження 2");
  };

  return html;
}
