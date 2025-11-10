import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const script = `
(function() {
  'use strict';
  
  window.DevHelper = {
    init: function(config) {
      if (!config.apiKey || !config.projectId) {
        console.error('DevHelper: apiKey and projectId are required');
        return;
      }

      const errors = [];
      const originalConsole = {
        error: console.error,
        warn: console.warn,
      };

      // Intercept console
      console.error = function(...args) {
        captureError('error', args);
        originalConsole.error.apply(console, args);
      };

      console.warn = function(...args) {
        captureError('warning', args);
        originalConsole.warn.apply(console, args);
      };

      // Intercept errors
      window.addEventListener('error', function(event) {
        captureError('error', [event.message], {
          stack: event.error?.stack,
          url: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', function(event) {
        captureError('error', [event.reason]);
      });

      function extractFileInfo(stack) {
        if (!stack) return {};
        
        const lines = stack.split('\\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Формати: "at functionName (file.js:10:5)" або "file.js:10:5"
          const match = line.match(/(?:at\\s+.*?\\()?([^()]+):(\\d+):(\\d+)\\)?/);
          if (match) {
            const url = match[1].trim();
            const lineNumber = parseInt(match[2], 10);
            const columnNumber = parseInt(match[3], 10);
            const fileName = url.split('/').pop().split('?')[0];
            return {
              url: url,
              lineNumber: lineNumber,
              columnNumber: columnNumber,
              fileName: fileName
            };
          }
        }
        return {};
      }

      function captureError(type, args, extra = {}) {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        // Створюємо stack trace якщо його немає
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

      // Dev mode widget
      if (config.devMode) {
        loadWidget();
      }

      function loadWidget() {
        const button = document.createElement('button');
        button.innerHTML = '🐛';
        button.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#000;color:#fff;border:none;font-size:24px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        
        const badge = document.createElement('span');
        badge.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:50%;width:24px;height:24px;font-size:12px;display:flex;align-items:center;justify-content:center;';
        button.appendChild(badge);

        button.onclick = function() {
          showModal();
        };

        document.body.appendChild(button);

        setInterval(function() {
          badge.textContent = errors.length;
          badge.style.display = errors.length > 0 ? 'flex' : 'none';
        }, 1000);
      }

      let currentTab = 'errors';
      let codeAnalysisResults = null; // Зберігаємо результати аналізу

      function updateModalContent() {
        // Просто перезавантажуємо модалку з новим табом
        const existingModal = document.querySelector('[style*="position:fixed"][style*="inset:0"]');
        if (existingModal) {
          existingModal.remove();
        }
        showModal();
      }

      function showModal() {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:#fff;border-radius:8px;max-width:800px;width:100%;max-height:80vh;display:flex;flex-direction:column;';
        
        const header = document.createElement('div');
        header.style.cssText = 'padding:20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = '<div><h2 style="margin:0;font-size:20px;font-weight:bold;">DevHelper Console</h2><p style="margin:4px 0 0;font-size:14px;color:#6b7280;">' + errors.length + ' проблем знайдено</p></div>';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'background:none;border:none;font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;';
        closeBtn.onclick = function() { modal.remove(); };
        header.appendChild(closeBtn);

        // Tabs
        const tabs = document.createElement('div');
        tabs.style.cssText = 'padding:20px;border-bottom:1px solid #e5e7eb;';
        
        const tabButtons = document.createElement('div');
        tabButtons.style.cssText = 'display:flex;gap:8px;';
        
        const errorsTab = document.createElement('button');
        errorsTab.textContent = 'Помилки (' + errors.length + ')';
        errorsTab.style.cssText = 'padding:8px 16px;border-radius:4px;border:none;cursor:pointer;' + (currentTab === 'errors' ? 'background:#000;color:#fff;' : 'background:#f3f4f6;');
        errorsTab.onclick = function() { 
          if (currentTab !== 'errors') {
            currentTab = 'errors'; 
            updateModalContent();
          }
        };
        
        const perfTab = document.createElement('button');
        perfTab.textContent = '� Perfornmance';
        perfTab.style.cssText = 'padding:8px 16px;border-radius:4px;border:none;cursor:pointer;' + (currentTab === 'performance' ? 'background:#000;color:#fff;' : 'background:#f3f4f6;');
        perfTab.onclick = function() { 
          if (currentTab !== 'performance') {
            currentTab = 'performance'; 
            updateModalContent();
          }
        };
        
        const codeTab = document.createElement('button');
        codeTab.textContent = '🔍 Code Analysis';
        codeTab.style.cssText = 'padding:8px 16px;border-radius:4px;border:none;cursor:pointer;' + (currentTab === 'code' ? 'background:#000;color:#fff;' : 'background:#f3f4f6;');
        codeTab.onclick = function() { 
          if (currentTab !== 'code') {
            currentTab = 'code'; 
            updateModalContent();
          }
        };
        
        const testTab = document.createElement('button');
        testTab.textContent = '🧪 Тестування';
        testTab.style.cssText = 'padding:8px 16px;border-radius:4px;border:none;cursor:pointer;' + (currentTab === 'test' ? 'background:#000;color:#fff;' : 'background:#f3f4f6;');
        testTab.onclick = function() { 
          if (currentTab !== 'test') {
            currentTab = 'test'; 
            updateModalContent();
          }
        };
        
        tabButtons.appendChild(errorsTab);
        tabButtons.appendChild(perfTab);
        tabButtons.appendChild(codeTab);
        tabButtons.appendChild(testTab);
        tabs.appendChild(tabButtons);
        
        const body = document.createElement('div');
        body.style.cssText = 'padding:20px;overflow-y:auto;flex:1;';
        
        if (currentTab === 'performance') {
          // Performance Monitor
          body.innerHTML = '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#374151;">📊 <strong>Performance Monitor</strong> - Відстежує продуктивність вашого додатку в реальному часі</p></div>';
          
          // FPS Monitor
          const fpsBlock = document.createElement('div');
          fpsBlock.style.cssText = 'border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;';
          fpsBlock.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h3 style="margin:0;font-size:14px;font-weight:bold;">🎮 FPS (Frames Per Second)</h3><span id="fps-value" style="font-size:24px;font-weight:bold;padding:4px 12px;border-radius:4px;background:#dcfce7;color:#166534;">0</span></div><div style="width:100%;background:#e5e7eb;border-radius:9999px;height:8px;"><div id="fps-bar" style="height:8px;border-radius:9999px;background:#22c55e;width:0%;transition:width 0.3s;"></div></div><p id="fps-status" style="margin:8px 0 0;font-size:11px;color:#6b7280;">Вимірювання...</p>';
          body.appendChild(fpsBlock);
          
          // Memory Monitor
          if (performance.memory) {
            const memBlock = document.createElement('div');
            memBlock.style.cssText = 'border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;';
            memBlock.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h3 style="margin:0;font-size:14px;font-weight:bold;">💾 Використання пам\\'яті</h3><span id="memory-value" style="font-size:12px;font-family:monospace;">0 MB / 0 MB</span></div><div style="width:100%;background:#e5e7eb;border-radius:9999px;height:8px;"><div id="memory-bar" style="height:8px;border-radius:9999px;background:#22c55e;width:0%;transition:width 0.3s;"></div></div><p id="memory-status" style="margin:8px 0 0;font-size:11px;color:#6b7280;">Ліміт: 0 MB</p>' +
              '<details style="margin-top:12px;"><summary style="font-size:11px;color:#2563eb;cursor:pointer;font-weight:bold;">ℹ️ Що таке використання пам\\'яті?</summary>' +
              '<div style="margin-top:8px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;">' +
              '<p style="margin:0 0 8px 0;color:#374151;"><strong>JavaScript Heap Memory</strong> - це область RAM, яку браузер виділяє для зберігання даних вашого коду:</p>' +
              '<ul style="margin:0 0 8px 0;padding-left:20px;color:#6b7280;"><li>Змінні та об\\'єкти</li><li>DOM елементи в пам\\'яті</li><li>React компоненти та state</li><li>Кеш та тимчасові дані</li></ul>' +
              '<div style="padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px;"><p style="margin:0 0 4px 0;font-weight:bold;color:#374151;">Показники:</p>' +
              '<p style="margin:0 0 2px 0;color:#6b7280;"><strong>Used</strong> - скільки пам\\'яті зараз використовується</p>' +
              '<p style="margin:0 0 2px 0;color:#6b7280;"><strong>Total</strong> - скільки браузер виділив</p>' +
              '<p style="margin:0;color:#6b7280;"><strong>Limit</strong> - максимум (~2GB)</p></div>' +
              '<div style="padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px;"><p style="margin:0 0 4px 0;font-weight:bold;color:#dc2626;">⚠️ Memory Leak (витік пам\\'яті):</p>' +
              '<p style="margin:0 0 4px 0;color:#6b7280;">Коли код створює дані, але не видаляє їх:</p>' +
              '<ul style="margin:0;padding-left:20px;color:#6b7280;"><li>Не очищені event listeners</li><li>Не закриті підписки</li><li>Не очищені таймери</li><li>Великі масиви без обмеження</li></ul></div>' +
              '<div style="padding-top:8px;border-top:1px solid #bfdbfe;margin-top:8px;"><p style="margin:0 0 4px 0;font-weight:bold;color:#15803d;">✅ Як уникнути:</p>' +
              '<pre style="margin:0;padding:8px;background:#1e293b;color:#4ade80;border-radius:4px;font-size:10px;overflow-x:auto;">// ✅ Правильно\\nuseEffect(() => {\\n  const listener = () => {};\\n  window.addEventListener(\\'scroll\\', listener);\\n  \\n  return () => {\\n    // Очищаємо!\\n    window.removeEventListener(\\'scroll\\', listener);\\n  };\\n}, []);</pre></div>' +
              '<div style="padding:8px;background:#fef3c7;border-radius:0 0 6px 6px;margin:-12px -12px 0 -12px;margin-top:8px;"><p style="margin:0;font-size:10px;color:#92400e;"><strong>💡 Порада:</strong> Якщо пам\\'ять постійно зростає - у вас memory leak! Використовуйте Chrome DevTools → Memory для пошуку.</p></div>' +
              '</div></details>';
            body.appendChild(memBlock);
          }
          
          // Load Metrics
          const loadBlock = document.createElement('div');
          loadBlock.style.cssText = 'border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;';
          loadBlock.innerHTML = '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;">⚡ Метрики завантаження</h3><div id="load-metrics"></div>';
          body.appendChild(loadBlock);
          
          // Metric Explanations
          const explainBlock = document.createElement('div');
          explainBlock.style.cssText = 'border:1px solid #bfdbfe;border-radius:8px;padding:16px;background:#eff6ff;margin-bottom:16px;';
          explainBlock.innerHTML = '<3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#1e40af;">�а Пояснення метрик</3>' +
            '<details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">🎮 FPS (Frames Per Second)</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Кількість кадрів за секунду. 60 FPS = ідеально плавна анімація. Нижче 30 FPS користувачі помічають затримки.</p></details>' +
            '<details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">💾 JavaScript Heap Memory</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Пам\\'ять для JavaScript коду. Якщо постійно зростає - можливий memory leak. Браузер має ліміт (~2GB).</p></details>' +
            '<details style="margin-bottom:8px;cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">⚡ Load Time</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Повний час завантаження сторінки. Рекомендовано: &lt;3с для мобільних, &lt;1с для desktop.</p></details>' +
            '<details style="cursor:pointer;"><summary style="font-weight:bold;font-size:12px;color:#1e40af;">🎨 First Contentful Paint (FCP)</summary><p style="margin:4px 0 0 16px;font-size:11px;color:#1e40af;">Час до появи першого контенту. Критична метрика UX. Рекомендовано: &lt;1.8с (добре), &lt;3с (потребує покращення).</p></details>';
          body.appendChild(explainBlock);
          
          // Tips
          const tipsBlock = document.createElement('div');
          tipsBlock.style.cssText = 'border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:#faf5ff;';
          tipsBlock.innerHTML = '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;color:#7c3aed;">🔍 Виявлені проблеми</h3><div id="perf-tips"></div>';
          body.appendChild(tipsBlock);
          
          // Start monitoring
          let frameCount = 0;
          let lastTime = performance.now();
          let currentFPS = 0;
          
          function measureFPS() {
            frameCount++;
            const now = performance.now();
            
            if (now >= lastTime + 1000) {
              currentFPS = frameCount;
              const fpsValue = document.getElementById('fps-value');
              const fpsBar = document.getElementById('fps-bar');
              const fpsStatus = document.getElementById('fps-status');
              
              if (fpsValue) {
                fpsValue.textContent = currentFPS;
                fpsValue.style.background = currentFPS >= 55 ? '#dcfce7' : currentFPS >= 30 ? '#fef3c7' : '#fee2e2';
                fpsValue.style.color = currentFPS >= 55 ? '#166534' : currentFPS >= 30 ? '#92400e' : '#991b1b';
              }
              if (fpsBar) {
                fpsBar.style.width = Math.min((currentFPS / 60) * 100, 100) + '%';
                fpsBar.style.background = currentFPS >= 55 ? '#22c55e' : currentFPS >= 30 ? '#eab308' : '#ef4444';
              }
              if (fpsStatus) {
                fpsStatus.textContent = currentFPS >= 55 ? '✅ Відмінно • Оптимально: 60 FPS' : currentFPS >= 30 ? '⚠️ Прийнятно • Оптимально: 60 FPS' : '❌ Погано • Оптимально: 60 FPS';
              }
              
              updateTips();
              frameCount = 0;
              lastTime = now;
            }
            
            if (document.body.contains(modal)) {
              requestAnimationFrame(measureFPS);
            }
          }
          
          requestAnimationFrame(measureFPS);
          
          // Memory monitoring
          if (performance.memory) {
            function updateMemory() {
              const mem = performance.memory;
              const used = Math.round(mem.usedJSHeapSize / 1048576);
              const total = Math.round(mem.totalJSHeapSize / 1048576);
              const limit = Math.round(mem.jsHeapSizeLimit / 1048576);
              const percent = (used / limit) * 100;
              
              const memValue = document.getElementById('memory-value');
              const memBar = document.getElementById('memory-bar');
              const memStatus = document.getElementById('memory-status');
              
              if (memValue) memValue.textContent = used + ' MB / ' + total + ' MB';
              if (memBar) {
                memBar.style.width = percent + '%';
                memBar.style.background = percent < 50 ? '#22c55e' : percent < 75 ? '#eab308' : '#ef4444';
              }
              if (memStatus) memStatus.textContent = 'Ліміт: ' + limit + ' MB • ' + percent.toFixed(1) + '% використано';
              
              updateTips();
              
              if (document.body.contains(modal)) {
                setTimeout(updateMemory, 1000);
              }
            }
            updateMemory();
          }
          
          // Load metrics
          if (performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            let metricsHTML = '';
            metricsHTML += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">Повне завантаження:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' + (loadTime < 1000 ? '#dcfce7;color:#166534' : loadTime < 3000 ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b') + ';">' + loadTime + 'ms</span></div>';
            metricsHTML += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">DOM Content Loaded:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' + (domContentLoaded < 800 ? '#dcfce7;color:#166534' : domContentLoaded < 2000 ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b') + ';">' + domContentLoaded + 'ms</span></div>';
            
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(function(entry) {
              const time = Math.round(entry.startTime);
              if (entry.name === 'first-paint') {
                metricsHTML += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">First Paint:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' + (time < 1000 ? '#dcfce7;color:#166534' : time < 2500 ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b') + ';">' + time + 'ms</span></div>';
              }
              if (entry.name === 'first-contentful-paint') {
                metricsHTML += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">First Contentful Paint:</span><span style="font-size:12px;font-family:monospace;padding:2px 8px;border-radius:4px;background:' + (time < 1500 ? '#dcfce7;color:#166534' : time < 3000 ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b') + ';">' + time + 'ms</span></div>';
              }
            });
            
            document.getElementById('load-metrics').innerHTML = metricsHTML;
          }
          
          function updateTips() {
            const issues = [];
            
            // FPS Analysis
            if (currentFPS > 0 && currentFPS < 30) {
              issues.push({
                severity: 'critical',
                title: 'Критично низький FPS',
                desc: 'Ваш додаток працює на ' + currentFPS + ' FPS, що значно нижче оптимального значення 60 FPS.',
                causes: ['Занадто багато DOM елементів', 'Складні CSS анімації', 'JavaScript блокує потік', 'Часті re-renders'],
                solutions: ['Використовуйте мемоізацію компонентів', 'Віртуалізація для списків', 'Web Workers для обчислень', 'CSS transform замість top/left']
              });
            } else if (currentFPS > 0 && currentFPS < 55) {
              issues.push({
                severity: 'warning',
                title: 'Знижений FPS',
                desc: 'FPS ' + currentFPS + ' є прийнятним, але є простір для покращення.',
                causes: ['Помірна кількість анімацій', 'Неоптимізовані re-renders'],
                solutions: ['Профілюйте компоненти', 'Використовуйте useMemo/useCallback']
              });
            }
            
            // Memory Analysis
            if (performance.memory) {
              const percent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
              const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
              const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
              
              if (percent > 75) {
                issues.push({
                  severity: 'critical',
                  title: 'Критичне використання пам\\'яті',
                  desc: 'Використано ' + percent.toFixed(1) + '% пам\\'яті (' + used + 'MB з ' + limit + 'MB). Високий ризик memory leaks.',
                  causes: ['Memory leaks через підписки', 'Не очищені event listeners', 'Великі масиви в state', 'Циклічні посилання'],
                  solutions: ['Cleanup функції в useEffect', 'Видаляйте event listeners', 'Обмежуйте розмір кешу', 'WeakMap для тимчасових даних']
                });
              } else if (percent > 50) {
                issues.push({
                  severity: 'warning',
                  title: 'Підвищене використання пам\\'яті',
                  desc: 'Використано ' + percent.toFixed(1) + '% пам\\'яті.',
                  causes: ['Багато даних в state', 'Великі компоненти', 'Кешування без очищення'],
                  solutions: ['Pagination для списків', 'Очищайте старі дані', 'IndexedDB для великих даних']
                });
              }
            }
            
            // Load Time Analysis
            if (performance.timing) {
              const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
              if (loadTime > 3000) {
                issues.push({
                  severity: 'critical',
                  title: 'Дуже повільне завантаження',
                  desc: 'Сторінка завантажується ' + (loadTime / 1000).toFixed(1) + 'с.',
                  causes: ['Великий bundle (>500KB)', 'Не оптимізовані зображення', 'Блокуючі скрипти', 'Відсутність code splitting'],
                  solutions: ['Dynamic imports', 'Lazy loading', 'Webpack-bundle-analyzer', 'CDN для ресурсів', 'Compression (gzip/brotli)']
                });
              } else if (loadTime > 1000) {
                issues.push({
                  severity: 'warning',
                  title: 'Повільне завантаження',
                  desc: 'Час завантаження ' + (loadTime / 1000).toFixed(1) + 'с можна покращити.',
                  causes: ['Середній bundle', 'Неоптимальне кешування'],
                  solutions: ['Preload для критичних ресурсів', 'Service Worker', 'HTTP/2 або HTTP/3']
                });
              }
            }
            
            // FCP Analysis
            const paintEntries = performance.getEntriesByType('paint');
            let fcp = 0;
            paintEntries.forEach(function(entry) {
              if (entry.name === 'first-contentful-paint') fcp = entry.startTime;
            });
            
            if (fcp > 3000) {
              issues.push({
                severity: 'critical',
                title: 'Повільний First Contentful Paint',
                desc: 'Перший контент з\\'являється через ' + (fcp / 1000).toFixed(1) + 'с.',
                causes: ['Блокуючий CSS', 'Великі шрифти', 'JavaScript блокує рендеринг', 'Відсутність SSR'],
                solutions: ['Critical CSS inline', 'font-display: swap', 'SSR або SSG', 'Preconnect для доменів']
              });
            } else if (fcp > 1500) {
              issues.push({
                severity: 'warning',
                title: 'Можна покращити FCP',
                desc: 'FCP ' + (fcp / 1000).toFixed(1) + 'с - є простір для оптимізації.',
                causes: ['Можна оптимізувати CSS', 'Шрифти завантажуються повільно'],
                solutions: ['System fonts як fallback', 'Resource hints', 'Оптимізуйте above-the-fold']
              });
            }
            
            // Display issues
            const tipsEl = document.getElementById('perf-tips');
            if (tipsEl) {
              if (issues.length === 0) {
                tipsEl.innerHTML = '<li style="color:#15803d;">✅ Відмінна продуктивність! Всі метрики в нормі.</li>';
              } else {
                let html = '';
                issues.forEach(function(issue, idx) {
                  const bgColor = issue.severity === 'critical' ? '#fee2e2' : '#fef3c7';
                  const borderColor = issue.severity === 'critical' ? '#fca5a5' : '#fcd34d';
                  const badgeColor = issue.severity === 'critical' ? 'background:#dc2626;color:#fff' : 'background:#d97706;color:#fff';
                  const icon = issue.severity === 'critical' ? '🚨' : '⚠️';
                  
                  html += '<div style="background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:6px;padding:12px;margin-bottom:12px;">';
                  html += '<div style="display:flex;align-items:start;justify-content:space-between;gap:8px;">';
                  html += '<div style="flex:1;">';
                  html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">';
                  html += '<span style="' + badgeColor + ';padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">' + icon + ' ' + (issue.severity === 'critical' ? 'КРИТИЧНО' : 'УВАГА') + '</span>';
                  html += '<span style="font-weight:bold;font-size:12px;">' + issue.title + '</span>';
                  html += '</div>';
                  html += '<p style="margin:0 0 8px 0;font-size:11px;color:#374151;">' + issue.desc + '</p>';
                  html += '<div id="issue-details-' + idx + '" style="display:none;">';
                  html += '<div style="margin-bottom:8px;"><p style="margin:0 0 4px 0;font-weight:bold;font-size:10px;">🔎 Можливі причини:</p><ul style="margin:0;padding-left:16px;font-size:10px;">';
                  issue.causes.forEach(function(cause) {
                    html += '<li>' + cause + '</li>';
                  });
                  html += '</ul></div>';
                  html += '<div><p style="margin:0 0 4px 0;font-weight:bold;font-size:10px;">✅ Рішення:</p><ul style="margin:0;padding-left:16px;font-size:10px;">';
                  issue.solutions.forEach(function(sol) {
                    html += '<li>' + sol + '</li>';
                  });
                  html += '</ul></div>';
                  html += '</div>';
                  html += '</div>';
                  html += '<button onclick="toggleIssueDetails(' + idx + ')" style="padding:4px 8px;background:#fff;border:1px solid #d1d5db;border-radius:4px;font-size:10px;cursor:pointer;white-space:nowrap;">▼ Детальніше</button>';
                  html += '</div></div>';
                });
                tipsEl.innerHTML = html;
              }
            }
          }
          
          window.toggleIssueDetails = function(idx) {
            const details = document.getElementById('issue-details-' + idx);
            if (details) {
              const isHidden = details.style.display === 'none';
              details.style.display = isHidden ? 'block' : 'none';
              event.target.textContent = isHidden ? '▲ Згорнути' : '▼ Детальніше';
            }
          };
        } else if (currentTab === 'code') {
          // Code Analysis
          body.innerHTML = '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#374151;">🔍 <strong>Unused Code Detector</strong> - Знаходить невикористаний код у вашому додатку</p></div>' +
            '<div style="text-align:center;margin-bottom:16px;">' +
            '<button id="analyze-current-project-btn" style="padding:12px 24px;background:#9333ea;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;">🚀 Сканувати проект</button>' +
            '<p style="margin:8px 0 0;font-size:11px;color:#6b7280;">Сканування проекту може зайняти до 30 секунд</p></div>' +
            '<div id="code-analysis-results">' + (codeAnalysisResults || '') + '</div>';
          
          // Використовуємо setTimeout щоб елемент встиг додатися до DOM
          setTimeout(function() {
            // Кнопка сканування проекту
            const analyzeProjectBtn = document.getElementById('analyze-current-project-btn');
            if (analyzeProjectBtn) {
              analyzeProjectBtn.onclick = function() {
                if (analyzeProjectBtn.disabled) return;
                
                analyzeProjectBtn.disabled = true;
                analyzeProjectBtn.textContent = '🔄 Сканування проекту...';
                
                fetch('${baseUrl}/api/devhelper/analyze-project', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config.apiKey,
                  },
                  body: JSON.stringify({ scanCurrentProject: true }),
                })
                .then(function(response) {
                  if (!response.ok) throw new Error('Failed to analyze project');
                  return response.json();
                })
                .then(function(data) {
                  if (!data.success) throw new Error(data.error || 'Analysis failed');
                  
                  const unusedCSS = data.unusedCSS || [];
                  const unusedFunctions = data.unusedFunctions || [];
                  const stats = data.stats || {};
                  
                  // Display results
                  let html = '<div style="border:1px solid #e9d5ff;border-radius:8px;padding:16px;background:linear-gradient(to right, #faf5ff, #fce7f3);margin-bottom:16px;">';
                  html += '<h3 style="margin:0 0 12px 0;font-size:16px;font-weight:bold;">📊 Результати аналізу проекту</h3>';
                  
                  if (stats.cssFilesAnalyzed || stats.jsFilesAnalyzed) {
                    html += '<div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:6px;font-size:11px;">';
                    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
                    html += '<div><span style="color:#6b7280;">CSS файлів:</span> <strong>' + (stats.cssFilesAnalyzed || 0) + '</strong></div>';
                    html += '<div><span style="color:#6b7280;">JS файлів:</span> <strong>' + (stats.jsFilesAnalyzed || 0) + '</strong></div>';
                    html += '<div><span style="color:#6b7280;">Всього CSS класів:</span> <strong>' + (stats.totalCSSClasses || 0) + '</strong></div>';
                    html += '<div><span style="color:#6b7280;">Всього функцій:</span> <strong>' + (stats.totalFunctions || 0) + '</strong></div>';
                    html += '</div></div>';
                  }
                  
                  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
                  html += '<div style="background:#fff;border-radius:6px;padding:12px;">';
                  html += '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористаний CSS</p>';
                  html += '<p style="margin:0;font-size:24px;font-weight:bold;color:#9333ea;">' + unusedCSS.length + '</p>';
                  if (stats.totalCSSClasses) {
                    html += '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' + ((unusedCSS.length / stats.totalCSSClasses) * 100).toFixed(1) + '% від всіх</p>';
                  }
                  html += '</div>';
                  html += '<div style="background:#fff;border-radius:6px;padding:12px;">';
                  html += '<p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;">Невикористані функції</p>';
                  html += '<p style="margin:0;font-size:24px;font-weight:bold;color:#3b82f6;">' + unusedFunctions.length + '</p>';
                  if (stats.totalFunctions) {
                    html += '<p style="margin:4px 0 0;font-size:10px;color:#6b7280;">' + ((unusedFunctions.length / stats.totalFunctions) * 100).toFixed(1) + '% від всіх</p>';
                  }
                  html += '</div>';
                  html += '</div></div>';
                  
                  // Unused CSS
                  if (unusedCSS.length > 0) {
                    html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
                    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
                    html += '<span style="color:#9333ea;">🎨 Невикористані CSS класи</span>';
                    html += '<span style="font-size:11px;background:#f3e8ff;color:#7c3aed;padding:4px 8px;border-radius:4px;">' + unusedCSS.length + '</span>';
                    html += '</h3>';
                    
                    if (unusedCSS.length > 50) {
                      html += '<div style="margin-bottom:12px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;font-size:11px;color:#92400e;">';
                      html += '⚠️ Показано перші 50 класів з ' + unusedCSS.length + '. Завантажте повний звіт для перегляду всіх.';
                      html += '</div>';
                    }
                    
                    html += '<div style="max-height:300px;overflow-y:auto;">';
                    unusedCSS.slice(0, 50).forEach(function(item) {
                      const className = item.name || item;
                      const location = item.location || '';
                      html += '<div style="padding:8px;background:#faf5ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
                      html += '<code style="font-family:monospace;color:#7c3aed;font-weight:bold;">' + className + '</code>';
                      if (location) {
                        html += '<p style="margin:4px 0 0;color:#6b7280;">📄 ' + location + '</p>';
                      }
                      html += '</div>';
                    });
                    html += '</div>';
                    
                    if (unusedCSS.length > 50) {
                      html += '<p style="margin:12px 0 0;font-size:11px;color:#6b7280;text-align:center;">... та ще ' + (unusedCSS.length - 50) + ' класів</p>';
                    }
                    html += '</div>';
                  }
                  
                  // Unused Functions
                  if (unusedFunctions.length > 0) {
                    html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">';
                    html += '<h3 style="margin:0 0 12px 0;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;">';
                    html += '<span style="color:#3b82f6;">⚡ Невикористані функції</span>';
                    html += '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;">' + unusedFunctions.length + '</span>';
                    html += '</h3>';
                    html += '<div style="max-height:200px;overflow-y:auto;">';
                    unusedFunctions.slice(0, 30).forEach(function(fn) {
                      html += '<div style="padding:8px;background:#eff6ff;border-radius:4px;margin-bottom:8px;font-size:11px;">';
                      html += '<code style="font-family:monospace;color:#1e40af;">' + fn + '()</code>';
                      html += '</div>';
                    });
                    if (unusedFunctions.length > 30) {
                      html += '<p style="margin:8px 0 0;font-size:11px;color:#6b7280;text-align:center;">... та ще ' + (unusedFunctions.length - 30) + ' функцій</p>';
                    }
                    html += '</div></div>';
                  }
                  
                  if (unusedCSS.length === 0 && unusedFunctions.length === 0) {
                    html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">';
                    html += '<p style="margin:0;color:#6b7280;font-size:13px;">✅ Не знайдено невикористаного коду в проекті</p>';
                    html += '</div>';
                  }
                  
                  // Recommendations
                  html += '<div style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fef3c7;margin-top:16px;">';
                  html += '<h3 style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#92400e;">💡 Рекомендації</h3>';
                  html += '<ul style="margin:0;padding-left:20px;font-size:11px;color:#92400e;">';
                  if (unusedCSS.length > 0) {
                    html += '<li>Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>';
                  }
                  if (unusedFunctions.length > 0) {
                    html += '<li>Видаліть невикористані функції або експорти</li>';
                  }
                  html += '<li>Використовуйте ESLint з правилом "no-unused-vars"</li>';
                  html += '<li>Налаштуйте tree-shaking для автоматичного видалення dead code</li>';
                  html += '</ul></div>';
                  
                  codeAnalysisResults = html;
                  document.getElementById('code-analysis-results').innerHTML = html;
                  analyzeProjectBtn.disabled = false;
                  analyzeProjectBtn.textContent = '🚀 Сканувати проект';
                })
                .catch(function(error) {
                  console.error('Project analysis failed:', error);
                  alert('❌ Помилка аналізу проекту: ' + error.message);
                  analyzeProjectBtn.disabled = false;
                  analyzeProjectBtn.textContent = '🚀 Сканувати проект';
                });
              };
            }
          }, 100);
        } else if (currentTab === 'test') {
          // Testing Tab
          body.innerHTML = '<p style="margin:0 0 16px 0;font-size:13px;color:#6b7280;">Натисніть на кнопки нижче, щоб згенерувати тестові помилки:</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
            '<button onclick="testConsoleError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Console Error</span></div>' +
            '</button>' +
            '<button onclick="testConsoleWarning()" style="background:#eab308;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚠️</span><span style="font-weight:bold;font-size:13px;">Console Warning</span></div>' +
            '</button>' +
            '<button onclick="testRuntimeError()" style="background:#9333ea;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚡</span><span style="font-weight:bold;font-size:13px;">Runtime Error</span></div>' +
            '</button>' +
            '<button onclick="testPromiseRejection()" style="background:#3b82f6;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">ℹ️</span><span style="font-weight:bold;font-size:13px;">Promise Rejection</span></div>' +
            '</button>' +
            '<button onclick="testUndefinedError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Undefined Error</span></div>' +
            '</button>' +
            '<button onclick="testTypeError()" style="background:#ef4444;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">❌</span><span style="font-weight:bold;font-size:13px;">Type Error</span></div>' +
            '</button>' +
            '<button onclick="testNetworkError()" style="background:#eab308;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">⚠️</span><span style="font-weight:bold;font-size:13px;">Network Error</span></div>' +
            '</button>' +
            '<button onclick="testMultipleErrors()" style="background:#3b82f6;color:#fff;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:left;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:20px;">ℹ️</span><span style="font-weight:bold;font-size:13px;">Multiple Errors</span></div>' +
            '</button>' +
            '</div>' +
            '<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">' +
            '<p style="margin:0;font-size:13px;color:#374151;">💡 <strong>Підказка:</strong> Після виклику помилок, перейдіть на вкладку "Помилки" та натисніть "🤖 AI" для отримання детального аналізу.</p>' +
            '</div>';
          
          // Define test functions
          window.testConsoleError = function() {
            console.error('Тестова помилка від DevHelper');
          };
          
          window.testConsoleWarning = function() {
            console.warn('Тестове попередження від DevHelper');
          };
          
          window.testRuntimeError = function() {
            try {
              throw new Error('Тестова runtime помилка');
            } catch (e) {
              console.error(e);
            }
          };
          
          window.testPromiseRejection = function() {
            Promise.reject('Тестове відхилення Promise').catch(function() {});
          };
          
          window.testUndefinedError = function() {
            try {
              var obj = undefined;
              console.log(obj.property);
            } catch (e) {
              console.error('Cannot read property of undefined');
            }
          };
          
          window.testTypeError = function() {
            try {
              var num = null;
              num.toFixed(2);
            } catch (e) {
              console.error('TypeError: Cannot read property toFixed');
            }
          };
          
          window.testNetworkError = function() {
            fetch('https://invalid-url-that-does-not-exist.com')
              .catch(function(error) {
                console.error('Network Error:', error.message);
              });
          };
          
          window.testMultipleErrors = function() {
            console.error('Помилка 1');
            console.warn('Попередження 1');
            console.error('Помилка 2');
            console.warn('Попередження 2');
          };
        } else if (errors.length === 0) {
          body.innerHTML = '<div style="text-align:center;color:#6b7280;padding:40px 20px;"><p style="margin:0 0 16px 0;">Немає помилок</p><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:left;"><p style="margin:0 0 8px 0;font-weight:bold;font-size:14px;color:#1e40af;">💡 Швидке тестування:</p><p style="margin:0;font-size:13px;color:#374151;">Відкрийте консоль (F12) та виконайте:</p><pre style="margin:8px 0 0 0;padding:8px;background:#1e293b;color:#e2e8f0;border-radius:4px;font-size:12px;overflow-x:auto;">console.error("Test error");\\nconsole.warn("Test warning");\\nthrow new Error("Test runtime error");</pre></div></div>';
        } else {
          errors.forEach(function(error, index) {
            const item = document.createElement('div');
            item.style.cssText = 'border:1px solid #e5e7eb;border-radius:4px;padding:12px;margin-bottom:8px;';
            
            const icon = error.type === 'error' ? '❌' : '⚠️';
            const color = error.type === 'error' ? '#ef4444' : '#f59e0b';
            
            let html = '<div style="display:flex;gap:8px;"><span style="font-size:16px;">' + icon + '</span><div style="flex:1;">';
            
            // Повідомлення помилки з кнопкою AI
            html += '<div style="display:flex;align-items:start;justify-content:space-between;gap:8px;">';
            html += '<p style="margin:0;font-family:monospace;font-size:13px;color:' + color + ';flex:1;">' + error.message + '</p>';
            
            // Кнопка AI (якщо ще немає аналізу)
            if (!error.aiAnalysis) {
              html += '<button onclick="analyzeError(' + index + ')" style="padding:4px 12px;background:#9333ea;color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;white-space:nowrap;" title="Аналізувати з AI">🤖 AI</button>';
            }
            
            html += '</div>';
            
            // AI Аналіз
            if (error.aiAnalysis) {
              const severityColors = {
                critical: 'background:#fee;border-color:#fcc;color:#c00',
                high: 'background:#fed;border-color:#fca;color:#c50',
                medium: 'background:#ffc;border-color:#fc6;color:#960',
                low: 'background:#efe;border-color:#cfc;color:#060'
              };
              const severityLabels = {
                critical: 'Критична',
                high: 'Висока',
                medium: 'Середня',
                low: 'Низька'
              };
              const severityStyle = severityColors[error.severity] || severityColors.medium;
              const severityLabel = severityLabels[error.severity] || 'Середня';
              
              html += '<div style="margin-top:12px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;">';
              html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
              html += '<span style="font-weight:bold;font-size:11px;color:#2563eb;">🤖 AI АНАЛІЗ</span>';
              html += '<span style="font-size:10px;padding:2px 8px;border-radius:3px;' + severityStyle + '">' + severityLabel + '</span>';
              html += '</div>';
              html += '<p style="margin:0;font-size:13px;color:#374151;">' + error.aiAnalysis + '</p>';
              html += '</div>';
            }
            
            // Рекомендації
            if (error.suggestions && error.suggestions.length > 0) {
              html += '<div style="margin-top:12px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;">';
              html += '<p style="margin:0 0 8px 0;font-weight:bold;font-size:11px;color:#15803d;">💡 РЕКОМЕНДАЦІЇ:</p>';
              html += '<ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;">';
              error.suggestions.forEach(function(suggestion) {
                html += '<li style="margin-bottom:4px;">' + suggestion + '</li>';
              });
              html += '</ul>';
              html += '</div>';
            }
            
            // Інформація про файл та рядок
            if (error.fileName || error.url || error.lineNumber) {
              html += '<div style="margin-top:8px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;">';
              html += '<p style="margin:0;font-size:11px;color:#92400e;">';
              
              if (error.fileName) {
                html += '<strong>📄 Файл:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;font-weight:bold;">' + error.fileName + '</code>';
              } else if (error.url) {
                const fileName = error.url.split('/').pop() || error.url;
                html += '<strong>📄 Файл:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;font-weight:bold;">' + fileName + '</code>';
              }
              
              if (error.lineNumber) {
                html += ' <strong>Рядок:</strong> <code style="background:#fef9e7;padding:2px 6px;border-radius:3px;color:#1e40af;">' + error.lineNumber + '</code>';
              }
              
              if (error.columnNumber) {
                html += '<strong>:</strong><code style="background:#fef9e7;padding:2px 6px;border-radius:3px;color:#1e40af;">' + error.columnNumber + '</code>';
              }
              
              html += '</p></div>';
            }
            
            if (error.stack) {
              html += '<details style="margin-top:8px;"><summary style="font-size:11px;color:#6b7280;cursor:pointer;">📋 Stack trace</summary>';
              html += '<pre style="margin:8px 0 0;font-size:11px;color:#6b7280;overflow-x:auto;background:#f9fafb;padding:8px;border-radius:4px;">' + error.stack + '</pre>';
              html += '</details>';
            }
            
            html += '<p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">🕐 ' + new Date(error.timestamp).toLocaleString('uk-UA') + '</p></div></div>';
            
            item.innerHTML = html;
            body.appendChild(item);
          });
        }
        
        const footer = document.createElement('div');
        footer.style.cssText = 'padding:20px;border-top:1px solid #e5e7eb;display:flex;gap:8px;justify-content:flex-end;';
        
        const aiBtn = document.createElement('button');
        aiBtn.innerHTML = '🤖 AI';
        aiBtn.style.cssText = 'padding:8px 16px;background:#9333ea;color:#fff;border:none;border-radius:4px;cursor:pointer;';
        aiBtn.onclick = function() {
          aiBtn.disabled = true;
          aiBtn.textContent = '⏳ Аналіз...';
          analyzeWithAI().finally(function() {
            aiBtn.disabled = false;
            aiBtn.innerHTML = '🤖 AI';
            modal.remove();
            showModal(); // Оновлюємо модальне вікно
          });
        };
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Завантажити звіт';
        downloadBtn.style.cssText = 'padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;';
        downloadBtn.onclick = function() { downloadReport(); };
        
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Очистити';
        clearBtn.style.cssText = 'padding:8px 16px;background:#e5e7eb;border:none;border-radius:4px;cursor:pointer;';
        clearBtn.onclick = function() { errors.length = 0; modal.remove(); };
        
        footer.appendChild(aiBtn);
        footer.appendChild(downloadBtn);
        footer.appendChild(clearBtn);
        
        content.appendChild(header);
        content.appendChild(tabs);
        content.appendChild(body);
        content.appendChild(footer);
        modal.appendChild(content);
        document.body.appendChild(modal);
      }

      function downloadReport() {
        let report = '# DevHelper Report\\n\\n';
        report += '**Date:** ' + new Date().toLocaleString('uk-UA') + '\\n\\n';
        report += '## Summary\\n\\n';
        report += '- Total Issues: ' + errors.length + '\\n\\n';
        
        errors.forEach(function(error, index) {
          report += '### ' + (index + 1) + '. ' + error.message + '\\n\\n';
          if (error.stack) {
            report += '\`\`\`\\n' + error.stack + '\\n\`\`\`\\n\\n';
          }
          report += '**Time:** ' + new Date(error.timestamp).toLocaleString('uk-UA') + '\\n\\n';
          report += '---\\n\\n';
        });
        
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'devhelper-report-' + Date.now() + '.md';
        a.click();
        URL.revokeObjectURL(url);
      }

      // Auto report
      if (config.autoReport) {
        setInterval(function() {
          if (errors.length > 0) {
            sendReport();
          }
        }, 60000);
      }

      function sendReport() {
        fetch('${baseUrl}/api/devhelper/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          body: JSON.stringify({
            projectId: config.projectId,
            errors: errors,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(function(error) {
          originalConsole.error('DevHelper: Failed to send report', error);
        });
      }

      // AI Analysis - всі помилки
      function analyzeWithAI() {
        if (errors.length === 0) {
          alert('Немає помилок для аналізу');
          return Promise.resolve();
        }

        return fetch('${baseUrl}/api/devhelper/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          body: JSON.stringify({ errors: errors }),
        })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to analyze errors');
          }
          return response.json();
        })
        .then(function(data) {
          if (data.success && data.analyzedErrors) {
            // Оновлюємо помилки з AI аналізом
            errors.length = 0;
            data.analyzedErrors.forEach(function(err) {
              errors.push(err);
            });
            alert('✅ Аналіз завершено! Перегляньте оновлені помилки.');
          }
        })
        .catch(function(error) {
          console.error('AI analysis failed:', error);
          alert('❌ Не вдалося проаналізувати помилки. Перевірте консоль.');
        });
      }

      // AI Analysis - окрема помилка
      window.analyzeError = function(errorIndex) {
        if (errorIndex < 0 || errorIndex >= errors.length) {
          alert('Помилка не знайдена');
          return;
        }

        const errorToAnalyze = errors[errorIndex];
        
        // Показуємо що аналізуємо
        const button = event.target;
        button.disabled = true;
        button.textContent = '⏳ Аналіз...';

        fetch('${baseUrl}/api/devhelper/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          body: JSON.stringify({ errors: [errorToAnalyze] }),
        })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to analyze error');
          }
          return response.json();
        })
        .then(function(data) {
          if (data.success && data.analyzedErrors && data.analyzedErrors[0]) {
            // Оновлюємо тільки цю помилку
            errors[errorIndex] = data.analyzedErrors[0];
            // Закриваємо і відкриваємо модальне вікно для оновлення
            document.querySelectorAll('[style*="position:fixed"][style*="inset:0"]').forEach(function(el) {
              el.remove();
            });
            showModal();
          }
        })
        .catch(function(error) {
          console.error('AI analysis failed:', error);
          alert('❌ Не вдалося проаналізувати помилку.');
          button.disabled = false;
          button.textContent = '🤖 AI';
        });
      };

      // Public API
      return {
        getErrors: function() { return errors; },
        clearErrors: function() { errors.length = 0; },
        sendReport: sendReport,
        downloadReport: downloadReport,
        analyzeWithAI: analyzeWithAI,
      };
    }
  };
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
