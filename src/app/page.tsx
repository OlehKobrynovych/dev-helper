'use client';

import { useState, useEffect } from 'react';
import { useDevHelper } from '@/hooks/useDevHelper';
import { ErrorTester } from '@/components/ErrorTester';
import { Copy, Check } from 'lucide-react';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://your-devhelper.netlify.app');

  // Оновлюємо baseUrl тільки на клієнті (один раз)
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Підключаємо DevHelper скрипт
  useDevHelper({
    apiKey: 'demo-key',
    projectId: 'devhelper-demo',
    devMode: true,
    autoReport: false,
  });

  const integrationCode = `<!-- Додайте перед закриваючим тегом </body> -->
<script src="${baseUrl}/api/devhelper/script"></script>
<script>
  const devHelper = window.DevHelper.init({
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    devMode: true,  // показувати віджет
    autoReport: true  // автоматично відправляти звіти
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🐛 DevHelper</h1>
          <p className="text-xl text-gray-600 mb-2">
            Інструмент для моніторингу та аналізу помилок у ваших проектах
          </p>
          <p className="text-gray-500">
            Інтегруйте один скрипт і отримуйте детальні звіти про всі помилки
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Моніторинг в реальному часі</h3>
            <p className="text-sm text-gray-600">
              Відстежуйте помилки та попередження в консолі в реальному часі
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold mb-2">Автоматичні звіти</h3>
            <p className="text-sm text-gray-600">
              Генеруйте детальні markdown звіти з рекомендаціями
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Dev режим</h3>
            <p className="text-sm text-gray-600">
              Зручний віджет для розробників прямо на сторінці
            </p>
          </div>
        </div>

        {/* Integration */}
        <div id="integration" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Швидка інтеграція</h2>
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <pre className="text-sm overflow-x-auto">
              <code>{integrationCode}</code>
            </pre>
          </div>
        </div>

        {/* Demo */}
        <div className="mb-12">
          <ErrorTester />
        </div>

        {/* Configuration */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Налаштування</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">apiKey (обов'язково)</h3>
              <p className="text-sm text-gray-600">
                Ваш унікальний API ключ для ідентифікації
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">projectId (обов'язково)</h3>
              <p className="text-sm text-gray-600">
                ID вашого проекту для групування звітів
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">devMode (опціонально)</h3>
              <p className="text-sm text-gray-600">
                Показувати віджет для розробників (за замовчуванням: false)
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">autoReport (опціонально)</h3>
              <p className="text-sm text-gray-600">
                Автоматично відправляти звіти кожну хвилину (за замовчуванням: false)
              </p>
            </div>
          </div>
        </div>

        {/* API */}
        <div>
          <h2 className="text-2xl font-bold mb-4">API методи</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4 font-mono text-sm">
              <div>
                <code className="text-blue-600">devHelper.getErrors()</code>
                <p className="text-gray-600 mt-1">Отримати всі помилки</p>
              </div>
              <div>
                <code className="text-blue-600">devHelper.clearErrors()</code>
                <p className="text-gray-600 mt-1">Очистити список помилок</p>
              </div>
              <div>
                <code className="text-blue-600">devHelper.sendReport()</code>
                <p className="text-gray-600 mt-1">Відправити звіт на сервер</p>
              </div>
              <div>
                <code className="text-blue-600">devHelper.downloadReport()</code>
                <p className="text-gray-600 mt-1">Завантажити звіт у форматі markdown</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
