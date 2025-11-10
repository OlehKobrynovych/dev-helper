// Modal UI - створення та управління модальним вікном
import { renderErrorsTab } from "./errors-tab.js";
import {
  renderPerformanceTab,
  startPerformanceMonitoring,
} from "./performance-tab.js";
import { renderCodeAnalysisTab } from "./code-analysis-tab.js";
import { renderTestingTab } from "./testing-tab.js";

export function createModal(core, baseUrl, config) {
  let currentTab = "errors";
  let currentModal = null;

  function updateModalContent() {
    if (currentModal) {
      currentModal.remove();
      currentModal = null;
    }
    showModal();
  }

  function showModal() {
    const errors = core.getErrors();
    const modal = document.createElement("div");
    modal.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;";

    currentModal = modal;

    const content = document.createElement("div");
    content.style.cssText =
      "background:#fff;border-radius:8px;max-width:800px;width:100%;max-height:80vh;display:flex;flex-direction:column;";

    // Header
    const header = document.createElement("div");
    header.style.cssText =
      "padding:20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;";
    header.innerHTML =
      '<div><h2 style="margin:0;font-size:20px;font-weight:bold;">DevHelper Console</h2><p style="margin:4px 0 0;font-size:14px;color:#6b7280;">' +
      errors.length +
      " проблем знайдено</p></div>";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText =
      "background:none;border:none;font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;";
    closeBtn.onclick = function () {
      if (currentModal) {
        currentModal.remove();
        currentModal = null;
      }
    };
    header.appendChild(closeBtn);

    // Tabs
    const tabs = document.createElement("div");
    tabs.style.cssText = "padding:20px;border-bottom:1px solid #e5e7eb;";

    const tabButtons = document.createElement("div");
    tabButtons.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;";

    const errorsTab = createTabButton(
      "Помилки (" + errors.length + ")",
      "errors"
    );
    const perfTab = createTabButton("📊 Performance", "performance");
    const codeTab = createTabButton("🔍 Code Analysis", "code");
    const testTab = createTabButton("🧪 Тестування", "test");

    tabButtons.appendChild(errorsTab);
    tabButtons.appendChild(perfTab);
    tabButtons.appendChild(codeTab);
    tabButtons.appendChild(testTab);
    tabs.appendChild(tabButtons);

    // Body
    const body = document.createElement("div");
    body.style.cssText = "padding:20px;overflow-y:auto;flex:1;";

    if (currentTab === "performance") {
      body.innerHTML = renderPerformanceTab();
      setTimeout(function () {
        startPerformanceMonitoring(modal);
      }, 100);
    } else if (currentTab === "code") {
      body.innerHTML = renderCodeAnalysisTab(baseUrl, config);
    } else if (currentTab === "test") {
      body.innerHTML = renderTestingTab();
    } else {
      body.innerHTML = renderErrorsTab(errors);
    }

    // Footer - тільки для errors табу
    const footer = document.createElement("div");
    footer.style.cssText =
      "padding:20px;border-top:1px solid #e5e7eb;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;";

    if (currentTab === "errors") {
      const aiBtn = document.createElement("button");
      aiBtn.innerHTML = "🤖 AI";
      aiBtn.style.cssText =
        "padding:8px 16px;background:#9333ea;color:#fff;border:none;border-radius:4px;cursor:pointer;";
      aiBtn.onclick = function () {
        aiBtn.disabled = true;
        aiBtn.textContent = "⏳ Аналіз...";
        core.analyzeWithAI().finally(function () {
          aiBtn.disabled = false;
          aiBtn.innerHTML = "🤖 AI";
          if (currentModal) {
            currentModal.remove();
            currentModal = null;
          }
          showModal();
        });
      };

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Завантажити звіт";
      downloadBtn.style.cssText =
        "padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;";
      downloadBtn.onclick = function () {
        core.downloadReport();
      };

      const clearBtn = document.createElement("button");
      clearBtn.textContent = "Очистити";
      clearBtn.style.cssText =
        "padding:8px 16px;background:#e5e7eb;border:none;border-radius:4px;cursor:pointer;";
      clearBtn.onclick = function () {
        core.clearErrors();
        if (currentModal) {
          currentModal.remove();
          currentModal = null;
        }
      };

      footer.appendChild(aiBtn);
      footer.appendChild(downloadBtn);
      footer.appendChild(clearBtn);
    }

    content.appendChild(header);
    content.appendChild(tabs);
    content.appendChild(body);
    content.appendChild(footer);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  function createTabButton(text, tabName) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText =
      "padding:8px 16px;border-radius:4px;border:none;cursor:pointer;" +
      (currentTab === tabName
        ? "background:#000;color:#fff;"
        : "background:#f3f4f6;");
    button.onclick = function () {
      if (currentTab !== tabName) {
        currentTab = tabName;
        updateModalContent();
      }
    };
    return button;
  }

  // Expose functions globally
  window.DevHelperShowModal = showModal;
  window.DevHelperUpdateModal = updateModalContent;

  return {
    show: showModal,
    update: updateModalContent,
  };
}

// Floating Button - створення кнопки для відкриття модалки
export function createFloatingButton(modal) {
  const button = document.createElement("button");
  button.innerHTML = "🐛";
  button.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#000;color:#fff;border:none;font-size:24px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);";

  const badge = document.createElement("span");
  badge.style.cssText =
    "position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:50%;width:24px;height:24px;font-size:12px;display:flex;align-items:center;justify-content:center;";
  button.appendChild(badge);

  button.onclick = function () {
    modal.show();
  };

  document.body.appendChild(button);

  return {
    updateBadge: function (count) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    },
  };
}
