// Performance Tab - моніторинг продуктивності
export function renderPerformanceTab() {
  const html =
    '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#374151;">📊 <strong>Performance Monitor</strong> - Відстежує продуктивність вашого додатку в реальному часі</p></div>' +
    // FPS Monitor
    '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h3 style="margin:0;font-size:14px;font-weight:bold;">🎮 FPS (Frames Per Second)</h3><span id="fps-value" style="font-size:24px;font-weight:bold;padding:4px 12px;border-radius:4px;background:#dcfce7;color:#166534;">0</span></div><div style="width:100%;background:#e5e7eb;border-radius:9999px;height:8px;"><div id="fps-bar" style="height:8px;border-radius:9999px;background:#22c55e;width:0%;transition:width 0.3s;"></div></div><p id="fps-status" style="margin:8px 0 0;font-size:11px;color:#6b7280;">Вимірювання...</p></div>' +
    // Memory Monitor
    (performance.memory
      ? '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h3 style="margin:0;font-size:14px;font-weight:bold;">💾 Використання пам\'яті</h3><span id="memory-value" style="font-size:12px;font-family:monospace;">0 MB / 0 MB</span></div><div style="width:100%;background:#e5e7eb;border-radius:9999px;height:8px;"><div id="memory-bar" style="height:8px;border-radius:9999px;background:#22c55e;width:0%;transition:width 0.3s;"></div></div><p id="memory-status" style="margin:8px 0 0;font-size:11px;color:#6b7280;">Ліміт: 0 MB</p><details style="margin-top:12px;"><summary style="font-size:11px;color:#2563eb;cursor:pointer;font-weight:bold;">ℹ️ Що таке використання пам\'яті?</summary><div style="margin-top:8px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;"><p style="margin:0 0 8px 0;color:#374151;"><strong>JavaScript Heap Memory</strong> - це область RAM, яку браузер виділяє для зберігання даних вашого коду:</p><ul style="margin:0 0 8px 0;padding-left:20px;color:#6b7280;"><li>Змінні та об\'єкти</li><li>DOM елементи в пам\'яті</li><li>React компоненти та state</li><li>Кеш та тимчасові дані</li></ul></div></details></div>'
      : "") +
    // Load Metrics
    '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;"><h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;">⚡ Метрики завантаження</h3><div id="load-metrics"></div></div>' +
    // Explanations
    '<div style="border:1px solid #bfdbfe;border-radius:8px;padding:16px;background:#eff6ff;margin-bottom:16px;"><h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#1e40af;">ℹ️ Пояснення метрик</h3><details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">🎮 FPS (Frames Per Second)</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Кількість кадрів за секунду. 60 FPS = ідеально плавна анімація. Нижче 30 FPS користувачі помічають затримки.</p></details><details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">💾 JavaScript Heap Memory</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Пам\'ять для JavaScript коду. Якщо постійно зростає - можливий memory leak. Браузер має ліміт (~2GB).</p></details><details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">⚡ Load Time</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Повний час завантаження сторінки. Рекомендовано: &lt;3с для мобільних, &lt;1с для desktop.</p></details><details style="cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">🎨 First Contentful Paint (FCP)</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Час до появи першого контенту. Критична метрика UX. Рекомендовано: &lt;1.8с (добре), &lt;3с (потребує покращення).</p></details></div>' +
    // Tips
    '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;"><h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#7c3aed;">🔍 Виявлені проблеми</h3><div id="perf-tips"></div></div>';

  return html;
}

export function startPerformanceMonitoring(modal) {
  let frameCount = 0;
  let lastTime = performance.now();
  let currentFPS = 0;
  let animationId = null;
  let memoryIntervalId = null;

  function measureFPS() {
    if (!document.body.contains(modal)) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return;
    }

    frameCount++;
    const now = performance.now();

    if (now >= lastTime + 1000) {
      currentFPS = frameCount;
      const fpsValue = document.getElementById("fps-value");
      const fpsBar = document.getElementById("fps-bar");
      const fpsStatus = document.getElementById("fps-status");

      if (fpsValue) {
        fpsValue.textContent = currentFPS;
        fpsValue.style.background =
          currentFPS >= 55
            ? "#dcfce7"
            : currentFPS >= 30
              ? "#fef3c7"
              : "#fee2e2";
        fpsValue.style.color =
          currentFPS >= 55
            ? "#166534"
            : currentFPS >= 30
              ? "#92400e"
              : "#991b1b";
      }
      if (fpsBar) {
        fpsBar.style.width = Math.min((currentFPS / 60) * 100, 100) + "%";
        fpsBar.style.background =
          currentFPS >= 55
            ? "#22c55e"
            : currentFPS >= 30
              ? "#eab308"
              : "#ef4444";
      }
      if (fpsStatus) {
        fpsStatus.textContent =
          currentFPS >= 55
            ? "✅ Відмінно • Оптимально: 60 FPS"
            : currentFPS >= 30
              ? "⚠️ Прийнятно • Оптимально: 60 FPS"
              : "❌ Погано • Оптимально: 60 FPS";
      }

      updateTips(currentFPS);
      frameCount = 0;
      lastTime = now;
    }

    animationId = requestAnimationFrame(measureFPS);
  }

  animationId = requestAnimationFrame(measureFPS);

  // Memory monitoring
  if (performance.memory) {
    function updateMemory() {
      if (!document.body.contains(modal)) {
        if (memoryIntervalId) {
          clearInterval(memoryIntervalId);
          memoryIntervalId = null;
        }
        return;
      }

      const mem = performance.memory;
      const used = Math.round(mem.usedJSHeapSize / 1048576);
      const total = Math.round(mem.totalJSHeapSize / 1048576);
      const limit = Math.round(mem.jsHeapSizeLimit / 1048576);
      const percent = (used / limit) * 100;

      const memValue = document.getElementById("memory-value");
      const memBar = document.getElementById("memory-bar");
      const memStatus = document.getElementById("memory-status");

      if (memValue) memValue.textContent = used + " MB / " + total + " MB";
      if (memBar) {
        memBar.style.width = percent + "%";
        memBar.style.background =
          percent < 50 ? "#22c55e" : percent < 75 ? "#eab308" : "#ef4444";
      }
      if (memStatus)
        memStatus.textContent =
          "Ліміт: " + limit + " MB • " + percent.toFixed(1) + "% використано";

      updateTips(currentFPS);
    }

    updateMemory();
    memoryIntervalId = setInterval(updateMemory, 1000);
  }

  // Load metrics
  if (performance.timing) {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded =
      timing.domContentLoadedEventEnd - timing.navigationStart;

    let metricsHTML = "";
    metricsHTML +=
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">Повне завантаження:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' +
      (loadTime < 1000
        ? "#dcfce7;color:#166534"
        : loadTime < 3000
          ? "#fef3c7;color:#92400e"
          : "#fee2e2;color:#991b1b") +
      ';">' +
      loadTime +
      "ms</span></div>";
    metricsHTML +=
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">DOM Content Loaded:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' +
      (domContentLoaded < 800
        ? "#dcfce7;color:#166534"
        : domContentLoaded < 2000
          ? "#fef3c7;color:#92400e"
          : "#fee2e2;color:#991b1b") +
      ';">' +
      domContentLoaded +
      "ms</span></div>";

    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach(function (entry) {
      const time = Math.round(entry.startTime);
      if (entry.name === "first-paint") {
        metricsHTML +=
          '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">First Paint:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' +
          (time < 1000
            ? "#dcfce7;color:#166534"
            : time < 2500
              ? "#fef3c7;color:#92400e"
              : "#fee2e2;color:#991b1b") +
          ';">' +
          time +
          "ms</span></div>";
      }
      if (entry.name === "first-contentful-paint") {
        metricsHTML +=
          '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">First Contentful Paint:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' +
          (time < 1500
            ? "#dcfce7;color:#166534"
            : time < 3000
              ? "#fef3c7;color:#92400e"
              : "#fee2e2;color:#991b1b") +
          ';">' +
          time +
          "ms</span></div>";
      }
    });

    document.getElementById("load-metrics").innerHTML = metricsHTML;
  }

  window.toggleIssueDetails = function (idx) {
    const details = document.getElementById("issue-details-" + idx);
    if (details) {
      const isHidden = details.style.display === "none";
      details.style.display = isHidden ? "block" : "none";
      window.event.target.textContent = isHidden
        ? "▲ Згорнути"
        : "▼ Детальніше";
    }
  };
}

function updateTips(currentFPS) {
  const issues = [];

  if (currentFPS > 0 && currentFPS < 30) {
    issues.push({
      severity: "critical",
      title: "Критично низький FPS",
      desc:
        "Ваш додаток працює на " +
        currentFPS +
        " FPS, що значно нижче оптимального значення 60 FPS.",
      causes: [
        "Занадто багато DOM елементів",
        "Складні CSS анімації",
        "JavaScript блокує потік",
        "Часті re-renders",
      ],
      solutions: [
        "Використовуйте мемоізацію компонентів",
        "Віртуалізація для списків",
        "Web Workers для обчислень",
        "CSS transform замість top/left",
      ],
    });
  } else if (currentFPS > 0 && currentFPS < 55) {
    issues.push({
      severity: "warning",
      title: "Знижений FPS",
      desc:
        "FPS " + currentFPS + " є прийнятним, але є простір для покращення.",
      causes: ["Помірна кількість анімацій", "Неоптимізовані re-renders"],
      solutions: [
        "Профілюйте компоненти",
        "Використовуйте useMemo/useCallback",
      ],
    });
  }

  if (performance.memory) {
    const percent =
      (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) *
      100;
    const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
    const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);

    if (percent > 75) {
      issues.push({
        severity: "critical",
        title: "Критичне використання пам'яті",
        desc:
          "Використано " +
          percent.toFixed(1) +
          "% пам'яті (" +
          used +
          "MB з " +
          limit +
          "MB). Високий ризик memory leaks.",
        causes: [
          "Memory leaks через підписки",
          "Не очищені event listeners",
          "Великі масиви в state",
          "Циклічні посилання",
        ],
        solutions: [
          "Cleanup функції в useEffect",
          "Видаляйте event listeners",
          "Обмежуйте розмір кешу",
          "WeakMap для тимчасових даних",
        ],
      });
    } else if (percent > 50) {
      issues.push({
        severity: "warning",
        title: "Підвищене використання пам'яті",
        desc: "Використано " + percent.toFixed(1) + "% пам'яті.",
        causes: [
          "Багато даних в state",
          "Великі компоненти",
          "Кешування без очищення",
        ],
        solutions: [
          "Pagination для списків",
          "Очищайте старі дані",
          "IndexedDB для великих даних",
        ],
      });
    }
  }

  const tipsEl = document.getElementById("perf-tips");
  if (tipsEl) {
    if (issues.length === 0) {
      tipsEl.innerHTML =
        '<li style="color:#15803d;">✅ Відмінна продуктивність! Всі метрики в нормі.</li>';
    } else {
      let html = "";
      issues.forEach(function (issue, idx) {
        const bgColor = issue.severity === "critical" ? "#fee2e2" : "#fef3c7";
        const borderColor =
          issue.severity === "critical" ? "#fca5a5" : "#fcd34d";
        const badgeColor =
          issue.severity === "critical"
            ? "background:#dc2626;color:#fff"
            : "background:#d97706;color:#fff";
        const icon = issue.severity === "critical" ? "🚨" : "⚠️";

        html +=
          '<div style="background:' +
          bgColor +
          ";border:1px solid " +
          borderColor +
          ';border-radius:6px;padding:12px;margin-bottom:12px;">';
        html +=
          '<div style="display:flex;align-items:start;justify-content:space-between;gap:8px;">';
        html += '<div style="flex:1;">';
        html +=
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">';
        html +=
          '<span style="' +
          badgeColor +
          ';padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' +
          icon +
          " " +
          (issue.severity === "critical" ? "КРИТИЧНО" : "УВАГА") +
          "</span>";
        html +=
          '<span style="font-weight:bold;font-size:12px;">' +
          issue.title +
          "</span>";
        html += "</div>";
        html +=
          '<p style="margin:0 0 8px 0;font-size:11px;color:#374151;">' +
          issue.desc +
          "</p>";
        html += '<div id="issue-details-' + idx + '" style="display:none;">';
        html +=
          '<div style="margin-bottom:8px;"><p style="margin:0 0 4px 0;font-weight:bold;font-size:10px;">🔎 Можливі причини:</p><ul style="margin:0;padding-left:16px;font-size:10px;">';
        issue.causes.forEach(function (cause) {
          html += "<li>" + cause + "</li>";
        });
        html += "</ul></div>";
        html +=
          '<div><p style="margin:0 0 4px 0;font-weight:bold;font-size:10px;">✅ Рішення:</p><ul style="margin:0;padding-left:16px;font-size:10px;">';
        issue.solutions.forEach(function (sol) {
          html += "<li>" + sol + "</li>";
        });
        html += "</ul></div>";
        html += "</div>";
        html += "</div>";
        html +=
          '<button onclick="toggleIssueDetails(' +
          idx +
          ')" style="padding:4px 8px;background:#fff;border:1px solid #d1d5db;border-radius:4px;font-size:10px;cursor:pointer;white-space:nowrap;">▼ Детальніше</button>';
        html += "</div></div>";
      });
      tipsEl.innerHTML = html;
    }
  }
}
