'use client';

import { useState } from 'react';

interface UnusedItem {
  type: 'css' | 'function' | 'import' | 'variable';
  name: string;
  location?: string;
  size?: number;
}

interface AnalysisResult {
  unusedCSS: UnusedItem[];
  unusedFunctions: UnusedItem[];
  unusedImports: UnusedItem[];
  unusedVariables: UnusedItem[];
  totalWaste: number;
  stats?: {
    totalCSSClasses: number;
    totalFunctions: number;
    unusedCSSCount: number;
    unusedFunctionsCount: number;
    cssFilesAnalyzed: number;
    jsFilesAnalyzed: number;
  };
  note?: string;
}

export function UnusedCodeDetector() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showAllCSS, setShowAllCSS] = useState(false);
  const [showAllFunctions, setShowAllFunctions] = useState(false);



  const analyzeCurrentProject = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/devhelper/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scanCurrentProject: true }),
      });

      const data = await response.json();

      if (data.success) {
        const unusedCSS: UnusedItem[] = data.unusedCSS.map((item: any) => ({
          type: 'css' as const,
          name: item.name || item,
          location: item.location,
          size: 0,
        }));

        const unusedFunctions: UnusedItem[] = data.unusedFunctions.map((name: string) => ({
          type: 'function' as const,
          name: `${name}()`,
          size: 0,
        }));

        const totalWaste = 0;

        setResult({
          unusedCSS,
          unusedFunctions,
          unusedImports: [],
          unusedVariables: [],
          totalWaste,
          stats: data.stats,
          note: data.note,
        });
      } else {
        alert(data.error || 'Помилка аналізу проекту');
      }
    } catch (error) {
      console.error('Project analysis failed:', error);
      alert('Помилка аналізу проекту');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUnusedCSS = (): UnusedItem[] => {
    const unused: UnusedItem[] = [];
    const allStyleSheets = Array.from(document.styleSheets);

    allStyleSheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);

        rules.forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;

            // Пропускаємо псевдо-класи та складні селектори
            if (selector.includes(':') || selector.includes('[')) return;

            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length === 0) {
                const cssText = rule.cssText;
                unused.push({
                  type: 'css',
                  name: selector,
                  location: sheet.href || 'inline',
                  size: cssText.length,
                });
              }
            } catch (e) {
              // Ігноруємо помилки парсингу складних селекторів
            }
          }
        });
      } catch (e) {
        // CORS або інші помилки доступу до stylesheet
      }
    });

    return unused;
  };

  const analyzeUnusedFunctions = (): UnusedItem[] => {
    const unused: UnusedItem[] = [];

    // Це демо-версія. В реальності потрібен статичний аналіз коду
    // Тут показуємо приклади для демонстрації
    const exampleUnused = [
      { name: 'oldLegacyFunction()', location: 'utils.js', size: 250 },
      { name: 'deprecatedHelper()', location: 'helpers.js', size: 180 },
      { name: 'unusedValidator()', location: 'validators.js', size: 320 },
    ];

    exampleUnused.forEach(item => {
      unused.push({
        type: 'function',
        name: item.name,
        location: item.location,
        size: item.size,
      });
    });

    return unused;
  };

  const analyzeUnusedImports = (): UnusedItem[] => {
    const unused: UnusedItem[] = [];

    // Демо-версія
    const exampleUnused = [
      { name: 'import { unused } from "lib"', location: 'component.tsx', size: 150 },
      { name: 'import oldLib from "old"', location: 'utils.ts', size: 200 },
    ];

    exampleUnused.forEach(item => {
      unused.push({
        type: 'import',
        name: item.name,
        location: item.location,
        size: item.size,
      });
    });

    return unused;
  };

  const analyzeUnusedVariables = (): UnusedItem[] => {
    const unused: UnusedItem[] = [];

    // Демо-версія
    const exampleUnused = [
      { name: 'const unusedVar', location: 'app.tsx', size: 50 },
      { name: 'let oldData', location: 'store.ts', size: 80 },
    ];

    exampleUnused.forEach(item => {
      unused.push({
        type: 'variable',
        name: item.name,
        location: item.location,
        size: item.size,
      });
    });

    return unused;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-gray-700">
          🔍 <strong>Unused Code Detector</strong> - Знаходить невикористаний код у вашому додатку
        </p>
      </div>

      {/* Project Scan */}
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Сканування поточного проекту
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Повний аналіз CSS класів та JavaScript функцій
          </p>
        </div>

        <button
          onClick={analyzeCurrentProject}
          disabled={isAnalyzing}
          className="px-8 py-4 bg-purple-500 text-white rounded-lg text-base font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? '⏳ Сканування...' : '🚀 Почати сканування'}
        </button>

        {isAnalyzing && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm text-purple-700 font-medium">
                Аналіз проекту... Це може зайняти до 30 секунд
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Що сканується:</p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>Всі CSS файли в проекті (крім node_modules, .next, dist)</li>
            <li>Всі JS/TS/JSX/TSX файли для перевірки використання</li>
            <li>Автоматична фільтрація Tailwind utility класів</li>
            <li>Пошук невикористаних функцій та експортів</li>
          </ul>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="font-bold text-lg mb-2">📊 Результати аналізу</h3>

            {result.note && (
              <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
                ℹ️ {result.note}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Невикористаний CSS</p>
                <p className="text-2xl font-bold text-purple-600">{result.unusedCSS.length}</p>
                {result.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    з {result.stats.totalCSSClasses} класів
                  </p>
                )}
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Невикористані функції</p>
                <p className="text-2xl font-bold text-blue-600">{result.unusedFunctions.length}</p>
                {result.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    з {result.stats.totalFunctions} функцій
                  </p>
                )}
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">CSS файлів</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.stats?.cssFilesAnalyzed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">проаналізовано</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">JS файлів</p>
                <p className="text-2xl font-bold text-orange-600">
                  {result.stats?.jsFilesAnalyzed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">проаналізовано</p>
              </div>
            </div>

            {/* Export buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const data = {
                    timestamp: new Date().toISOString(),
                    stats: result.stats,
                    unusedCSS: result.unusedCSS.map(item => ({
                      name: item.name,
                      location: item.location,
                    })),
                    unusedFunctions: result.unusedFunctions.map(item => ({
                      name: item.name,
                      location: item.location,
                    })),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `unused-code-report-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 font-medium"
              >
                📥 Експорт JSON
              </button>
              <button
                onClick={() => {
                  const text = [
                    '=== ЗВІТ ПРО НЕВИКОРИСТАНИЙ КОД ===',
                    `Дата: ${new Date().toLocaleString('uk-UA')}`,
                    '',
                    '📊 СТАТИСТИКА:',
                    result.stats ? [
                      `CSS класів: ${result.stats.totalCSSClasses}`,
                      `Функцій: ${result.stats.totalFunctions}`,
                      `CSS файлів: ${result.stats.cssFilesAnalyzed}`,
                      `JS файлів: ${result.stats.jsFilesAnalyzed}`,
                    ].join('\n') : '',
                    '',
                    `🎨 НЕВИКОРИСТАНІ CSS КЛАСИ (${result.unusedCSS.length}):`,
                    ...result.unusedCSS.map(item => `  - ${item.name}${item.location ? ` (${item.location})` : ''}`),
                    '',
                    `⚡ НЕВИКОРИСТАНІ ФУНКЦІЇ (${result.unusedFunctions.length}):`,
                    ...result.unusedFunctions.map(item => `  - ${item.name}${item.location ? ` (${item.location})` : ''}`),
                  ].join('\n');
                  const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `unused-code-report-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 font-medium"
              >
                📄 Експорт TXT
              </button>
            </div>
          </div>

          {/* Unused CSS */}
          {result.unusedCSS.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-purple-600">🎨 Невикористані CSS класи</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {result.unusedCSS.length}
                </span>
              </h3>

              {result.unusedCSS.length > 50 && !showAllCSS && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ Показано перші 50 класів з {result.unusedCSS.length}.
                  <button
                    onClick={() => setShowAllCSS(true)}
                    className="ml-2 underline font-semibold hover:text-yellow-900"
                  >
                    Показати всі
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(showAllCSS ? result.unusedCSS : result.unusedCSS.slice(0, 50)).map((item, index) => (
                  <div key={index} className="p-2 bg-purple-50 rounded text-xs hover:bg-purple-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-purple-900 break-all">{item.name}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.name)}
                        className="ml-2 px-2 py-1 bg-white rounded text-xs hover:bg-purple-200 flex-shrink-0"
                        title="Копіювати"
                      >
                        📋
                      </button>
                    </div>
                    {item.location && (
                      <p className="text-gray-500 mt-1 truncate" title={item.location}>
                        📄 {item.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2 justify-center">
                {result.unusedCSS.length > 50 && !showAllCSS && (
                  <button
                    onClick={() => setShowAllCSS(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                  >
                    📋 Показати всі ({result.unusedCSS.length})
                  </button>
                )}
                {showAllCSS && (
                  <button
                    onClick={() => setShowAllCSS(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Згорнути
                  </button>
                )}
                <button
                  onClick={() => {
                    const text = result.unusedCSS.map(item => item.name).join('\n');
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'unused-css-classes.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  💾 Завантажити TXT
                </button>
              </div>
            </div>
          )}

          {/* Unused Functions */}
          {result.unusedFunctions.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-blue-600">⚡ Невикористані функції</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {result.unusedFunctions.length}
                </span>
              </h3>

              {result.unusedFunctions.length > 30 && !showAllFunctions && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ Показано перші 30 функцій з {result.unusedFunctions.length}.
                  <button
                    onClick={() => setShowAllFunctions(true)}
                    className="ml-2 underline font-semibold hover:text-yellow-900"
                  >
                    Показати всі
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(showAllFunctions ? result.unusedFunctions : result.unusedFunctions.slice(0, 30)).map((item, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-xs hover:bg-blue-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-blue-900">{item.name}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.name)}
                        className="ml-2 px-2 py-1 bg-white rounded text-xs hover:bg-blue-200"
                        title="Копіювати"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {result.unusedFunctions.length > 30 && (
                <div className="mt-3 flex gap-2 justify-center">
                  {!showAllFunctions && (
                    <button
                      onClick={() => setShowAllFunctions(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      📋 Показати всі ({result.unusedFunctions.length})
                    </button>
                  )}
                  {showAllFunctions && (
                    <button
                      onClick={() => setShowAllFunctions(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      Згорнути
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No unused code message */}
          {result.unusedCSS.length === 0 && result.unusedFunctions.length === 0 && (
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">✅ Не знайдено невикористаного коду в проекті</p>
            </div>
          )}

          {/* Recommendations */}
          <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-bold text-sm mb-2 text-yellow-900">💡 Рекомендації</h3>
            <ul className="text-xs text-yellow-800 space-y-1">
              {result.unusedCSS.length > 0 && (
                <>
                  <li>• Видаліть невикористані CSS класи або використайте PurgeCSS/Tailwind JIT</li>
                  <li>• Налаштуйте автоматичне очищення CSS при build</li>
                </>
              )}
              <li>• Для аналізу JavaScript використовуйте ESLint з правилом "no-unused-vars"</li>
              <li>• Для аналізу bundle використовуйте webpack-bundle-analyzer</li>
              <li>• Налаштуйте tree-shaking у webpack/vite для автоматичного видалення dead code</li>
            </ul>
          </div>

          {/* Note */}
          <div className="p-3 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700">
            <p className="font-semibold mb-1">ℹ️ Що сканується:</p>
            <ul className="ml-4 mt-1 space-y-0.5">
              <li>• <strong>CSS:</strong> Реальне сканування всіх stylesheets на сторінці ✅</li>
              <li>• <strong>JavaScript:</strong> Потребує статичний аналіз (використайте ESLint) ⚠️</li>
            </ul>
            <p className="mt-2">
              <strong>Обмеження:</strong> Аналізує тільки поточну сторінку. Класи які використовуються на інших сторінках можуть бути позначені як невикористані.
            </p>
            <p className="mt-2 font-semibold">Для повного аналізу використовуйте:</p>
            <ul className="ml-4 mt-1 space-y-0.5">
              <li>• <strong>webpack-bundle-analyzer</strong> - аналіз bundle</li>
              <li>• <strong>ESLint</strong> - статичний аналіз JavaScript</li>
              <li>• <strong>PurgeCSS</strong> - очищення CSS</li>
              <li>• <strong>Chrome Coverage</strong> - runtime аналіз покриття коду</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
