'use client';

import { useState } from 'react';
import { Bug, X, AlertTriangle, Info, Download } from 'lucide-react';
import type { ConsoleError } from '@/types/devhelper';
import { PerformanceMonitor } from './PerformanceMonitor';
import { UnusedCodeDetector } from './UnusedCodeDetector';

interface DevHelperWidgetProps {
  errors: ConsoleError[];
  onClear: () => void;
  onDownloadReport: () => void;
  onAnalyzeWithAI?: () => Promise<void>;
  onAnalyzeError?: (index: number) => Promise<void>;
}

export function DevHelperWidget({ errors, onClear, onDownloadReport, onAnalyzeWithAI, onAnalyzeError }: DevHelperWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'errors' | 'test' | 'performance' | 'code'>('errors');

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  const filteredErrors = errors.filter(e =>
    filter === 'all' || e.type === filter
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Тестові функції
  const testFunctions = [
    {
      name: 'Console Error',
      icon: '❌',
      color: 'bg-red-500',
      action: () => console.error('Тестова помилка від DevHelper')
    },
    {
      name: 'Console Warning',
      icon: '⚠️',
      color: 'bg-yellow-500',
      action: () => console.warn('Тестове попередження від DevHelper')
    },
    {
      name: 'Runtime Error',
      icon: '⚡',
      color: 'bg-purple-500',
      action: () => {
        try {
          throw new Error('Тестова runtime помилка');
        } catch (e) {
          console.error(e);
        }
      }
    },
    {
      name: 'Promise Rejection',
      icon: 'ℹ️',
      color: 'bg-blue-500',
      action: () => {
        Promise.reject('Тестове відхилення Promise').catch(() => { });
      }
    },
    {
      name: 'Undefined Error',
      icon: '❌',
      color: 'bg-red-500',
      action: () => {
        try {
          const obj: any = undefined;
          console.log(obj.property);
        } catch (e) {
          console.error('Cannot read property of undefined');
        }
      }
    },
    {
      name: 'Type Error',
      icon: '❌',
      color: 'bg-red-500',
      action: () => {
        try {
          const num: any = null;
          num.toFixed(2);
        } catch (e) {
          console.error('TypeError: Cannot read property toFixed');
        }
      }
    },
    {
      name: 'Network Error',
      icon: '⚠️',
      color: 'bg-yellow-500',
      action: () => {
        fetch('https://invalid-url-that-does-not-exist.com')
          .catch(error => console.error('Network Error:', error.message));
      }
    },
    {
      name: 'Multiple Errors',
      icon: 'ℹ️',
      color: 'bg-blue-500',
      action: () => {
        console.error('Помилка 1');
        console.warn('Попередження 1');
        console.error('Помилка 2');
        console.warn('Попередження 2');
      }
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all z-50 flex items-center gap-2"
        aria-label="Open DevHelper"
      >
        <Bug className="w-6 h-6" />
        {(errorCount > 0 || warningCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {errorCount + warningCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">DevHelper Console</h2>
                <p className="text-sm text-gray-600">
                  {errorCount} помилок, {warningCount} попереджень
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="p-4 border-b">
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`px-4 py-2 rounded ${activeTab === 'errors' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  Помилки ({errors.length})
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-4 py-2 rounded ${activeTab === 'performance' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  📊 Performance
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded ${activeTab === 'code' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  🔍 Code Analysis
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-4 py-2 rounded ${activeTab === 'test' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  🧪 Тестування
                </button>
              </div>

              {activeTab === 'errors' && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  >
                    Всі ({errors.length})
                  </button>
                  <button
                    onClick={() => setFilter('error')}
                    className={`px-3 py-1 text-sm rounded ${filter === 'error' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                  >
                    Помилки ({errorCount})
                  </button>
                  <button
                    onClick={() => setFilter('warning')}
                    className={`px-3 py-1 text-sm rounded ${filter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
                  >
                    Попередження ({warningCount})
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-2 flex-wrap">
                {onAnalyzeWithAI && (
                  <button
                    onClick={async () => {
                      setIsAnalyzing(true);
                      try {
                        await onAnalyzeWithAI();
                      } finally {
                        setIsAnalyzing(false);
                      }
                    }}
                    disabled={isAnalyzing || errors.length === 0}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Аналізувати помилки з AI"
                  >
                    <span className="text-lg">{isAnalyzing ? '⏳' : '🤖'}</span>
                    {isAnalyzing ? 'Аналіз...' : 'AI'}
                  </button>
                )}
                <button
                  onClick={onDownloadReport}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Звіт
                </button>
                <button
                  onClick={onClear}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Очистити
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'performance' ? (
                <PerformanceMonitor />
              ) : activeTab === 'code' ? (
                <UnusedCodeDetector />
              ) : activeTab === 'test' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Натисніть на кнопки нижче, щоб згенерувати тестові помилки:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {testFunctions.map((test, index) => (
                      <button
                        key={index}
                        onClick={test.action}
                        className={`${test.color} hover:opacity-90 text-white p-4 rounded-lg transition text-left`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{test.icon}</span>
                          <span className="font-bold text-sm">{test.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-gray-700">
                      💡 <strong>Підказка:</strong> Після виклику помилок, перейдіть на вкладку "Помилки"
                      та натисніть "🤖 AI" для отримання детального аналізу.
                    </p>
                  </div>
                </div>
              ) : filteredErrors.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Немає помилок для відображення
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredErrors.map((error, index) => (
                    <div
                      key={index}
                      className="border rounded p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-2">
                        {getIcon(error.type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-mono text-sm flex-1">{error.message}</p>
                            {onAnalyzeError && !error.aiAnalysis && (
                              <button
                                onClick={async () => {
                                  const originalIndex = errors.findIndex(e => e.timestamp === error.timestamp && e.message === error.message);
                                  setAnalyzingIndex(originalIndex);
                                  try {
                                    await onAnalyzeError(originalIndex);
                                  } finally {
                                    setAnalyzingIndex(null);
                                  }
                                }}
                                disabled={analyzingIndex === errors.findIndex(e => e.timestamp === error.timestamp && e.message === error.message)}
                                className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 flex-shrink-0"
                                title="Аналізувати з AI"
                              >
                                {analyzingIndex === errors.findIndex(e => e.timestamp === error.timestamp && e.message === error.message) ? (
                                  <>⏳ Аналіз...</>
                                ) : (
                                  <>🤖 AI</>
                                )}
                              </button>
                            )}
                          </div>

                          {/* AI Аналіз */}
                          {error.aiAnalysis && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600 font-bold text-xs">🤖 AI АНАЛІЗ</span>
                                {error.severity && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${error.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                    error.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                      error.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {error.severity === 'critical' ? 'Критична' :
                                      error.severity === 'high' ? 'Висока' :
                                        error.severity === 'medium' ? 'Середня' : 'Низька'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{error.aiAnalysis}</p>
                            </div>
                          )}

                          {/* Рекомендації */}
                          {error.suggestions && error.suggestions.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                              <p className="font-bold text-xs text-green-700 mb-2">💡 РЕКОМЕНДАЦІЇ:</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {error.suggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {error.stack && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                Stack trace
                              </summary>
                              <pre className="mt-2 text-xs text-gray-600 overflow-x-auto bg-gray-100 p-2 rounded">
                                {error.stack}
                              </pre>
                            </details>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(error.timestamp).toLocaleString('uk-UA')}</span>
                            {error.fileName && (
                              <button
                                onClick={() => {
                                  const location = `${error.fileName}${error.lineNumber ? `:${error.lineNumber}` : ''}${error.columnNumber ? `:${error.columnNumber}` : ''}`;
                                  navigator.clipboard.writeText(location);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                title="Копіювати розташування файлу"
                              >
                                📄 {error.fileName}
                                {error.lineNumber && (
                                  <span className="text-blue-600 font-mono">
                                    :{error.lineNumber}
                                    {error.columnNumber && `:${error.columnNumber}`}
                                  </span>
                                )}
                              </button>
                            )}
                            {error.url && !error.fileName && (
                              <span className="text-gray-400 truncate max-w-xs" title={error.url}>
                                {error.url}
                                {error.lineNumber && `:${error.lineNumber}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
