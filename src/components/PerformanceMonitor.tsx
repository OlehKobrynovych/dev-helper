'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

interface PerformanceIssue {
  type: 'fps' | 'memory' | 'load' | 'paint';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  possibleCauses: string[];
  solutions: string[];
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
  });
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    // FPS Monitor
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Memory Monitor
    const updateMemory = () => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: Math.round(mem.usedJSHeapSize / 1048576), // MB
            total: Math.round(mem.totalJSHeapSize / 1048576),
            limit: Math.round(mem.jsHeapSizeLimit / 1048576),
          },
        }));
      }
    };

    const memoryInterval = setInterval(updateMemory, 1000);
    updateMemory();

    // Page Load Metrics
    if (performance.timing) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;

      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime),
        domContentLoaded: Math.round(domContentLoaded),
      }));
    }

    // Paint Metrics
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          setMetrics(prev => ({ ...prev, firstPaint: Math.round(entry.startTime) }));
        }
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, firstContentfulPaint: Math.round(entry.startTime) }));
        }
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
    };
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600 bg-green-50';
    if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600 bg-green-50';
    if (fps >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const analyzePerformance = () => {
    const detectedIssues: PerformanceIssue[] = [];

    // FPS Analysis
    if (metrics.fps > 0 && metrics.fps < 30) {
      detectedIssues.push({
        type: 'fps',
        severity: 'critical',
        title: 'Критично низький FPS',
        description: `Ваш додаток працює на ${metrics.fps} FPS, що значно нижче оптимального значення 60 FPS. Це призводить до помітних затримок та "лагів" в інтерфейсі.`,
        possibleCauses: [
          'Занадто багато DOM елементів на сторінці (>1500)',
          'Складні CSS анімації або transitions',
          'JavaScript блокує головний потік',
          'Часті re-renders React компонентів',
          'Великі зображення без оптимізації',
          'Відсутність debounce/throttle для scroll/resize подій'
        ],
        solutions: [
          'Використовуйте React.memo() для мемоізації компонентів',
          'Застосуйте віртуалізацію для довгих списків (react-window)',
          'Перенесіть важкі обчислення в Web Workers',
          'Використовуйте CSS transform замість top/left для анімацій',
          'Додайте will-change для анімованих елементів',
          'Оптимізуйте зображення (WebP, lazy loading)'
        ]
      });
    } else if (metrics.fps > 0 && metrics.fps < 55) {
      detectedIssues.push({
        type: 'fps',
        severity: 'warning',
        title: 'Знижений FPS',
        description: `FPS ${metrics.fps} є прийнятним, але є простір для покращення до 60 FPS для ідеально плавної роботи.`,
        possibleCauses: [
          'Помірна кількість анімацій',
          'Неоптимізовані re-renders',
          'Середня складність DOM структури'
        ],
        solutions: [
          'Профілюйте компоненти через React DevTools',
          'Використовуйте useMemo/useCallback для оптимізації',
          'Перевірте CSS селектори на складність'
        ]
      });
    }

    // Memory Analysis
    if (metrics.memory) {
      const memoryPercent = (metrics.memory.used / metrics.memory.limit) * 100;

      if (memoryPercent > 75) {
        detectedIssues.push({
          type: 'memory',
          severity: 'critical',
          title: 'Критичне використання пам\'яті',
          description: `Використано ${memoryPercent.toFixed(1)}% доступної пам'яті (${metrics.memory.used}MB з ${metrics.memory.limit}MB). Високий ризик memory leaks та crashes.`,
          possibleCauses: [
            'Memory leaks через незакриті підписки (subscriptions)',
            'Не очищені event listeners',
            'Великі масиви/об\'єкти в state',
            'Кешування без обмежень розміру',
            'Циклічні посилання в об\'єктах',
            'Не очищені setInterval/setTimeout'
          ],
          solutions: [
            'Використовуйте useEffect cleanup функції',
            'Видаляйте event listeners в componentWillUnmount',
            'Обмежуйте розмір кешу (LRU cache)',
            'Використовуйте WeakMap/WeakSet для тимчасових даних',
            'Профілюйте пам\'ять через Chrome DevTools Memory',
            'Перевірте закриття всіх підписок (WebSocket, EventSource)'
          ]
        });
      } else if (memoryPercent > 50) {
        detectedIssues.push({
          type: 'memory',
          severity: 'warning',
          title: 'Підвищене використання пам\'яті',
          description: `Використано ${memoryPercent.toFixed(1)}% пам'яті. Рекомендується моніторити та оптимізувати.`,
          possibleCauses: [
            'Багато даних в state/store',
            'Великі компоненти в пам\'яті',
            'Кешування без очищення'
          ],
          solutions: [
            'Використовуйте pagination для великих списків',
            'Очищайте старі дані з state',
            'Розгляньте використання IndexedDB для великих даних'
          ]
        });
      }
    }

    // Load Time Analysis
    if (metrics.loadTime > 3000) {
      detectedIssues.push({
        type: 'load',
        severity: 'critical',
        title: 'Дуже повільне завантаження',
        description: `Сторінка завантажується ${(metrics.loadTime / 1000).toFixed(1)}с, що значно перевищує рекомендовані 3 секунди.`,
        possibleCauses: [
          'Великий розмір JavaScript bundle (>500KB)',
          'Не оптимізовані зображення',
          'Блокуючі скрипти в <head>',
          'Відсутність code splitting',
          'Повільний сервер або CDN',
          'Багато синхронних HTTP запитів'
        ],
        solutions: [
          'Використовуйте dynamic imports для code splitting',
          'Додайте lazy loading для компонентів',
          'Оптимізуйте bundle через webpack-bundle-analyzer',
          'Використовуйте CDN для статичних ресурсів',
          'Додайте compression (gzip/brotli)',
          'Використовуйте async/defer для скриптів'
        ]
      });
    } else if (metrics.loadTime > 1000) {
      detectedIssues.push({
        type: 'load',
        severity: 'warning',
        title: 'Повільне завантаження',
        description: `Час завантаження ${(metrics.loadTime / 1000).toFixed(1)}с можна покращити.`,
        possibleCauses: [
          'Середній розмір bundle',
          'Неоптимальне кешування',
          'Можна додати preload/prefetch'
        ],
        solutions: [
          'Додайте preload для критичних ресурсів',
          'Налаштуйте кешування через Service Worker',
          'Використовуйте HTTP/2 або HTTP/3'
        ]
      });
    }

    // First Contentful Paint Analysis
    if (metrics.firstContentfulPaint > 3000) {
      detectedIssues.push({
        type: 'paint',
        severity: 'critical',
        title: 'Повільний First Contentful Paint',
        description: `Перший контент з'являється через ${(metrics.firstContentfulPaint / 1000).toFixed(1)}с. Користувачі бачать білий екран занадто довго.`,
        possibleCauses: [
          'Блокуючий CSS в <head>',
          'Великі шрифти без font-display',
          'JavaScript блокує рендеринг',
          'Відсутність SSR/SSG',
          'Повільний Time To First Byte (TTFB)'
        ],
        solutions: [
          'Використовуйте critical CSS inline',
          'Додайте font-display: swap для шрифтів',
          'Використовуйте SSR або SSG (Next.js)',
          'Оптимізуйте сервер для швидшого TTFB',
          'Додайте preconnect для зовнішніх доменів',
          'Мінімізуйте CSS та видаліть невикористані стилі'
        ]
      });
    } else if (metrics.firstContentfulPaint > 1500) {
      detectedIssues.push({
        type: 'paint',
        severity: 'warning',
        title: 'Можна покращити FCP',
        description: `FCP ${(metrics.firstContentfulPaint / 1000).toFixed(1)}с - є простір для оптимізації.`,
        possibleCauses: [
          'Можна оптимізувати критичний CSS',
          'Шрифти завантажуються повільно'
        ],
        solutions: [
          'Використовуйте system fonts як fallback',
          'Додайте resource hints (preload, preconnect)',
          'Оптимізуйте above-the-fold контент'
        ]
      });
    }

    setIssues(detectedIssues);
  };

  useEffect(() => {
    analyzePerformance();
  }, [metrics]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-gray-700">
          📊 <strong>Performance Monitor</strong> - Відстежує продуктивність вашого додатку в реальному часі
        </p>
      </div>

      {/* FPS Monitor */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">🎮 FPS (Frames Per Second)</h3>
          <span className={`text-2xl font-bold px-3 py-1 rounded ${getFPSColor(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${metrics.fps >= 55 ? 'bg-green-500' : metrics.fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            style={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {metrics.fps >= 55 ? '✅ Відмінно' : metrics.fps >= 30 ? '⚠️ Прийнятно' : '❌ Погано'}
          {' • Оптимально: 60 FPS'}
        </p>
      </div>

      {/* Memory Usage */}
      {metrics.memory && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">💾 Використання пам'яті</h3>
            <span className="text-sm font-mono">
              {metrics.memory.used} MB / {metrics.memory.total} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${(metrics.memory.used / metrics.memory.limit) * 100 < 50
                ? 'bg-green-500'
                : (metrics.memory.used / metrics.memory.limit) * 100 < 75
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                }`}
              style={{ width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ліміт: {metrics.memory.limit} MB
            {' • '}
            {((metrics.memory.used / metrics.memory.limit) * 100).toFixed(1)}% використано
          </p>

          {/* Memory Explanation */}
          <details className="mt-3">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-semibold">
              ℹ️ Що таке використання пам'яті?
            </summary>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-2">
              <p className="text-gray-700">
                <strong>JavaScript Heap Memory</strong> - це область оперативної пам'яті (RAM), яку браузер виділяє для зберігання даних вашого коду:
              </p>
              <ul className="ml-4 space-y-1 text-gray-600">
                <li>• Змінні та об'єкти</li>
                <li>• DOM елементи в пам'яті</li>
                <li>• React компоненти та state</li>
                <li>• Кеш та тимчасові дані</li>
              </ul>

              <div className="pt-2 border-t border-blue-200">
                <p className="font-semibold text-gray-700 mb-1">Показники:</p>
                <div className="space-y-1 text-gray-600">
                  <p><strong>Used ({metrics.memory.used} MB)</strong> - скільки пам'яті зараз використовується</p>
                  <p><strong>Total ({metrics.memory.total} MB)</strong> - скільки браузер виділив</p>
                  <p><strong>Limit ({metrics.memory.limit} MB)</strong> - максимум (~2GB)</p>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200">
                <p className="font-semibold text-red-700 mb-1">⚠️ Memory Leak (витік пам'яті):</p>
                <p className="text-gray-600 mb-1">Коли код створює дані, але не видаляє їх після використання:</p>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Не очищені event listeners</li>
                  <li>• Не закриті підписки (subscriptions)</li>
                  <li>• Не очищені setInterval/setTimeout</li>
                  <li>• Великі масиви без обмеження розміру</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-blue-200">
                <p className="font-semibold text-green-700 mb-1">✅ Як уникнути:</p>
                <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
                  {`// ✅ Правильно
useEffect(() => {
  const listener = () => {};
  window.addEventListener('scroll', listener);
  
  return () => {
    // Очищаємо!
    window.removeEventListener('scroll', listener);
  };
}, []);`}
                </pre>
              </div>

              <div className="pt-2 border-t border-blue-200 bg-yellow-50 -mx-3 -mb-3 px-3 py-2 rounded-b">
                <p className="text-xs text-gray-700">
                  <strong>💡 Порада:</strong> Якщо пам'ять постійно зростає і не зменшується - у вас memory leak!
                  Використовуйте Chrome DevTools → Memory → Take heap snapshot для пошуку проблеми.
                </p>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Page Load Metrics */}
      <div className="border rounded-lg p-4">
        <h3 className="font-bold text-sm mb-3">⚡ Метрики завантаження</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Повне завантаження:</span>
            <span className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
              {metrics.loadTime}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">DOM Content Loaded:</span>
            <span className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(metrics.domContentLoaded, { good: 800, warning: 2000 })}`}>
              {metrics.domContentLoaded}ms
            </span>
          </div>
          {metrics.firstPaint > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">First Paint:</span>
              <span className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(metrics.firstPaint, { good: 1000, warning: 2500 })}`}>
                {metrics.firstPaint}ms
              </span>
            </div>
          )}
          {metrics.firstContentfulPaint > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">First Contentful Paint:</span>
              <span className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(metrics.firstContentfulPaint, { good: 1500, warning: 3000 })}`}>
                {metrics.firstContentfulPaint}ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Explanations */}
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-sm mb-2 text-blue-900">📖 Пояснення метрик</h3>
        <div className="space-y-2 text-xs text-blue-800">
          <details className="cursor-pointer">
            <summary className="font-semibold hover:text-blue-600">🎮 FPS (Frames Per Second)</summary>
            <p className="mt-1 ml-4 text-blue-700">
              Кількість кадрів, які браузер може відобразити за секунду. 60 FPS = ідеально плавна анімація.
              Нижче 30 FPS користувачі помічають затримки та "лаги".
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-semibold hover:text-blue-600">💾 JavaScript Heap Memory</summary>
            <p className="mt-1 ml-4 text-blue-700">
              Пам'ять, яку використовує JavaScript код. Якщо постійно зростає - можливий memory leak.
              Браузер має ліміт (~2GB), після якого може крашнутись.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-semibold hover:text-blue-600">⚡ Load Time</summary>
            <p className="mt-1 ml-4 text-blue-700">
              Повний час від початку завантаження до готовності сторінки. Включає HTML, CSS, JS, зображення.
              Рекомендовано: &lt;3с для мобільних, &lt;1с для desktop.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-semibold hover:text-blue-600">🎨 First Contentful Paint (FCP)</summary>
            <p className="mt-1 ml-4 text-blue-700">
              Час до появи першого контенту (текст, зображення). Критична метрика UX - користувачі бачать, що сторінка завантажується.
              Рекомендовано: &lt;1.8с (добре), &lt;3с (потребує покращення).
            </p>
          </details>
        </div>
      </div>

      {/* Performance Issues */}
      {issues.length > 0 && (
        <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
          <h3 className="font-bold text-sm mb-3 text-orange-900">🔍 Виявлені проблеми</h3>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className={`border rounded p-3 ${issue.severity === 'critical' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'
                        }`}>
                        {issue.severity === 'critical' ? '🚨 КРИТИЧНО' : '⚠️ УВАГА'}
                      </span>
                      <span className="font-bold text-sm">{issue.title}</span>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">{issue.description}</p>

                    {showDetails === `${index}` && (
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="font-semibold text-xs mb-1">🔎 Можливі причини:</p>
                          <ul className="text-xs text-gray-700 ml-4 space-y-0.5">
                            {issue.possibleCauses.map((cause, i) => (
                              <li key={i}>• {cause}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-xs mb-1">✅ Рішення:</p>
                          <ul className="text-xs text-gray-700 ml-4 space-y-0.5">
                            {issue.solutions.map((solution, i) => (
                              <li key={i}>• {solution}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetails(showDetails === `${index}` ? null : `${index}`)}
                    className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100 flex-shrink-0"
                  >
                    {showDetails === `${index}` ? '▲ Згорнути' : '▼ Детальніше'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {issues.length === 0 && metrics.fps > 0 && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <h3 className="font-bold text-sm mb-2 text-green-900">✅ Відмінна продуктивність!</h3>
          <p className="text-xs text-green-800">
            Всі метрики в нормі. Ваш додаток працює оптимально. Продовжуйте моніторити продуктивність при додаванні нових функцій.
          </p>
        </div>
      )}
    </div>
  );
}
