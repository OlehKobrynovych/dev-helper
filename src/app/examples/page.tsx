'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import './test.css'

export default function ExamplesPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const examples = [
    {
      title: 'HTML + Vanilla JavaScript',
      language: 'html',
      code: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>Мій проект</title>
</head>
<body>
  <h1>Мій проект</h1>
  
  <script src="https://your-devhelper.vercel.app/api/devhelper/script"></script>
  <script>
    const devHelper = window.DevHelper.init({
      apiKey: 'your-api-key',
      projectId: 'my-html-project',
      devMode: true,
      autoReport: false
    });
  </script>
</body>
</html>`
    },
    {
      title: 'React (Next.js App Router)',
      language: 'typescript',
      code: `// app/providers.tsx
'use client';

import { useEffect } from 'react';

export function DevHelperProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_DEVHELPER_URL + '/api/devhelper/script';
    script.async = true;
    
    script.onload = () => {
      if (window.DevHelper) {
        window.DevHelper.init({
          apiKey: process.env.NEXT_PUBLIC_DEVHELPER_API_KEY!,
          projectId: 'my-nextjs-app',
          devMode: process.env.NODE_ENV === 'development',
          autoReport: process.env.NODE_ENV === 'production',
        });
      }
    };
    
    document.body.appendChild(script);
  }, []);
  
  return <>{children}</>;
}`
    },
    {
      title: 'Vue 3 (Composition API)',
      language: 'typescript',
      code: `// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

const initDevHelper = () => {
  const script = document.createElement('script');
  script.src = import.meta.env.VITE_DEVHELPER_URL + '/api/devhelper/script';
  script.async = true;
  
  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: import.meta.env.VITE_DEVHELPER_API_KEY,
        projectId: 'my-vue-app',
        devMode: import.meta.env.DEV,
        autoReport: !import.meta.env.DEV,
      });
    }
  };
  
  document.body.appendChild(script);
};

initDevHelper();
app.mount('#app');`
    },
    {
      title: 'Angular',
      language: 'typescript',
      code: `// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const script = document.createElement('script');
    script.src = environment.devhelperUrl + '/api/devhelper/script';
    script.async = true;
    
    script.onload = () => {
      if ((window as any).DevHelper) {
        (window as any).DevHelper.init({
          apiKey: environment.devhelperApiKey,
          projectId: 'my-angular-app',
          devMode: !environment.production,
          autoReport: environment.production,
        });
      }
    };
    
    document.body.appendChild(script);
  }
}`
    },
    {
      title: 'Svelte / SvelteKit',
      language: 'typescript',
      code: `// src/routes/+layout.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { PUBLIC_DEVHELPER_URL, PUBLIC_DEVHELPER_API_KEY } from '$env/static/public';
  
  onMount(() => {
    const script = document.createElement('script');
    script.src = PUBLIC_DEVHELPER_URL + '/api/devhelper/script';
    script.async = true;
    
    script.onload = () => {
      if ((window as any).DevHelper) {
        (window as any).DevHelper.init({
          apiKey: PUBLIC_DEVHELPER_API_KEY,
          projectId: 'my-sveltekit-app',
          devMode: dev,
          autoReport: !dev,
        });
      }
    };
    
    document.body.appendChild(script);
  });
</script>

<slot />`
    },
    {
      title: 'Nuxt 3',
      language: 'typescript',
      code: `// plugins/devhelper.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  const script = document.createElement('script');
  script.src = config.public.devhelperUrl + '/api/devhelper/script';
  script.async = true;
  
  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: config.public.devhelperApiKey,
        projectId: 'my-nuxt-app',
        devMode: process.dev,
        autoReport: !process.dev,
      });
    }
  };
  
  document.body.appendChild(script);
});`
    },
    {
      title: 'Програмний доступ',
      language: 'javascript',
      code: `const devHelper = window.DevHelper.init({
  apiKey: 'your-api-key',
  projectId: 'my-project',
  devMode: true
});

// Отримати всі помилки
const allErrors = devHelper.getErrors();
console.log('Всього помилок:', allErrors.length);

// Фільтрувати критичні помилки
const criticalErrors = allErrors.filter(e => 
  e.type === 'error' && e.message.includes('critical')
);

// Перевіряти помилки кожні 5 секунд
setInterval(() => {
  const errors = devHelper.getErrors();
  
  if (errors.length > 10) {
    alert('Виявлено багато помилок!');
    devHelper.sendReport();
    devHelper.clearErrors();
  }
}, 5000);

// Завантажити звіт
devHelper.downloadReport();`
    },
    {
      title: 'Умовна ініціалізація',
      language: 'javascript',
      code: `// Тільки для певних користувачів
if (user.role === 'developer' || user.role === 'admin') {
  window.DevHelper.init({
    apiKey: 'your-api-key',
    projectId: 'my-project',
    devMode: true,
    autoReport: false
  });
}

// Тільки на певних сторінках
if (window.location.pathname.startsWith('/admin')) {
  window.DevHelper.init({
    apiKey: 'your-api-key',
    projectId: 'admin-panel',
    devMode: true,
    autoReport: true
  });
}

// Тільки в робочий час
const hour = new Date().getHours();
if (hour >= 9 && hour <= 18) {
  window.DevHelper.init({
    apiKey: 'your-api-key',
    projectId: 'my-project',
    devMode: true,
    autoReport: true
  });
}`
    }
  ];

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">💡 Приклади інтеграції</h1>
          <p className="text-lg text-gray-600">
            Готові приклади для різних фреймворків та сценаріїв використання
          </p>
        </div>

        <div className="space-y-6">
          {examples.map((example, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{example.title}</h2>
                <button
                  onClick={() => copyToClipboard(example.code, index)}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Копіювати код"
                >
                  {copiedIndex === index ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 overflow-x-auto">
                <pre className="text-sm">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">💡 Корисні поради</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Використовуйте <code className="bg-blue-100 px-2 py-1 rounded">devMode: true</code> тільки для розробки</li>
            <li>• Увімкніть <code className="bg-blue-100 px-2 py-1 rounded">autoReport: true</code> для production</li>
            <li>• Зберігайте API ключі в змінних оточення</li>
            <li>• Використовуйте різні projectId для dev/staging/production</li>
            <li>• Регулярно перевіряйте та очищайте помилки</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            ← Повернутись на головну
          </a>
        </div>
      </div>
    </main>
  );
}
