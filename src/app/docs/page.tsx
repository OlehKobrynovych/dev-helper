export default function DocsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6">📚 Документація API</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Endpoints</h2>

            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded font-mono text-sm">
                    GET
                  </span>
                  <code className="text-lg">/api/devhelper/script</code>
                </div>
                <p className="text-gray-600 mb-4">
                  Отримати JavaScript скрипт для інтеграції в ваш проект
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Приклад використання
<script src="https://your-devhelper.vercel.app/api/devhelper/script"></script>`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm">
                    POST
                  </span>
                  <code className="text-lg">/api/devhelper/report</code>
                </div>
                <p className="text-gray-600 mb-4">
                  Відправити звіт про помилки на сервер
                </p>

                <h4 className="font-bold mb-2">Headers:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mb-4">
                  <pre className="text-sm">
                    {`Content-Type: application/json
X-API-Key: your-api-key`}
                  </pre>
                </div>

                <h4 className="font-bold mb-2">Request Body:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mb-4">
                  <pre className="text-sm overflow-x-auto">
                    {`{
  "projectId": "my-project",
  "errors": [
    {
      "type": "error",
      "message": "TypeError: Cannot read property...",
      "stack": "Error: ...",
      "timestamp": 1699276800000,
      "url": "https://example.com/page",
      "lineNumber": 45,
      "columnNumber": 12
    }
  ],
  "userAgent": "Mozilla/5.0...",
  "url": "https://example.com/page",
  "timestamp": 1699276800000
}`}
                  </pre>
                </div>

                <h4 className="font-bold mb-2">Response:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded">
                  <pre className="text-sm">
                    {`{
  "success": true,
  "report": "# DevHelper Report...",
  "timestamp": 1699276800000
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Конфігурація</h2>

            <div className="bg-gray-900 text-gray-100 p-6 rounded">
              <pre className="text-sm overflow-x-auto">
                {`interface DevHelperConfig {
  // Обов'язкові параметри
  apiKey: string;        // Ваш API ключ
  projectId: string;     // ID проекту
  
  // Опціональні параметри
  devMode?: boolean;     // Показувати віджет (default: false)
  autoReport?: boolean;  // Автоматично відправляти звіти (default: false)
  reportEndpoint?: string; // Кастомний endpoint (default: '/api/devhelper/report')
}`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Типи помилок</h2>

            <div className="bg-gray-900 text-gray-100 p-6 rounded">
              <pre className="text-sm overflow-x-auto">
                {`interface ConsoleError {
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
}`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Методи API</h2>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <code className="text-lg font-bold text-blue-600">getErrors()</code>
                <p className="text-gray-600 mt-2">
                  Повертає масив всіх зареєстрованих помилок
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mt-3">
                  <pre className="text-sm">
                    {`const errors = devHelper.getErrors();
console.log(errors); // ConsoleError[]`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <code className="text-lg font-bold text-blue-600">clearErrors()</code>
                <p className="text-gray-600 mt-2">
                  Очищає список всіх помилок
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mt-3">
                  <pre className="text-sm">
                    {`devHelper.clearErrors();`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <code className="text-lg font-bold text-blue-600">sendReport()</code>
                <p className="text-gray-600 mt-2">
                  Відправляє звіт про помилки на сервер
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mt-3">
                  <pre className="text-sm">
                    {`await devHelper.sendReport();`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <code className="text-lg font-bold text-blue-600">downloadReport()</code>
                <p className="text-gray-600 mt-2">
                  Завантажує звіт у форматі markdown
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded mt-3">
                  <pre className="text-sm">
                    {`devHelper.downloadReport();`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Приклади</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Базова інтеграція</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`<script src="https://your-devhelper.vercel.app/api/devhelper/script"></script>
<script>
  const devHelper = window.DevHelper.init({
    apiKey: 'your-api-key',
    projectId: 'my-project',
    devMode: true,
    autoReport: true
  });
</script>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Програмний доступ</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Отримати помилки
const errors = devHelper.getErrors();

// Фільтрувати критичні помилки
const critical = errors.filter(e => 
  e.type === 'error' && e.message.includes('critical')
);

// Відправити звіт якщо багато помилок
if (errors.length > 10) {
  await devHelper.sendReport();
  devHelper.clearErrors();
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Умовна ініціалізація</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Тільки для розробників
if (user.role === 'developer') {
  window.DevHelper.init({
    apiKey: 'dev-api-key',
    projectId: 'my-project',
    devMode: true,
    autoReport: false
  });
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
