# 📚 Приклади використання DevHelper

## Базова інтеграція

### HTML + Vanilla JavaScript

```html
<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <title>Мій проект</title>
  </head>
  <body>
    <h1>Мій проект</h1>

    <!-- Ваш контент -->

    <!-- DevHelper -->
    <script src="https://your-devhelper.vercel.app/api/devhelper/script"></script>
    <script>
      const devHelper = window.DevHelper.init({
        apiKey: "your-api-key",
        projectId: "my-html-project",
        devMode: true,
        autoReport: false,
      });

      // Тестова помилка
      setTimeout(() => {
        console.error("Тестова помилка");
      }, 2000);
    </script>
  </body>
</html>
```

## React

### Next.js (App Router)

```typescript
// app/providers.tsx
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

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { DevHelperProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <DevHelperProvider>
          {children}
        </DevHelperProvider>
      </body>
    </html>
  );
}
```

```env
# .env.local
NEXT_PUBLIC_DEVHELPER_URL=https://your-devhelper.vercel.app
NEXT_PUBLIC_DEVHELPER_API_KEY=your-api-key
```

### Next.js (Pages Router)

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_DEVHELPER_URL + '/api/devhelper/script';
    script.async = true;

    script.onload = () => {
      if (window.DevHelper) {
        window.DevHelper.init({
          apiKey: process.env.NEXT_PUBLIC_DEVHELPER_API_KEY!,
          projectId: 'my-nextjs-pages-app',
          devMode: process.env.NODE_ENV === 'development',
          autoReport: true,
        });
      }
    };

    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}
```

### Create React App

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ініціалізація DevHelper
const initDevHelper = () => {
  const script = document.createElement('script');
  script.src = process.env.REACT_APP_DEVHELPER_URL + '/api/devhelper/script';
  script.async = true;

  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: process.env.REACT_APP_DEVHELPER_API_KEY,
        projectId: 'my-cra-app',
        devMode: process.env.NODE_ENV === 'development',
        autoReport: true,
      });
    }
  };

  document.body.appendChild(script);
};

initDevHelper();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```env
# .env
REACT_APP_DEVHELPER_URL=https://your-devhelper.vercel.app
REACT_APP_DEVHELPER_API_KEY=your-api-key
```

## Vue

### Vue 3 (Vite)

```typescript
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

// Ініціалізація DevHelper
const initDevHelper = () => {
  const script = document.createElement("script");
  script.src = import.meta.env.VITE_DEVHELPER_URL + "/api/devhelper/script";
  script.async = true;

  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: import.meta.env.VITE_DEVHELPER_API_KEY,
        projectId: "my-vue-app",
        devMode: import.meta.env.DEV,
        autoReport: !import.meta.env.DEV,
      });
    }
  };

  document.body.appendChild(script);
};

initDevHelper();

app.mount("#app");
```

```env
# .env
VITE_DEVHELPER_URL=https://your-devhelper.vercel.app
VITE_DEVHELPER_API_KEY=your-api-key
```

### Vue 3 (Composition API компонент)

```vue
<!-- components/DevHelper.vue -->
<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  const script = document.createElement("script");
  script.src = import.meta.env.VITE_DEVHELPER_URL + "/api/devhelper/script";
  script.async = true;

  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: import.meta.env.VITE_DEVHELPER_API_KEY,
        projectId: "my-vue-app",
        devMode: import.meta.env.DEV,
        autoReport: true,
      });
    }
  };

  document.body.appendChild(script);
});
</script>

<template>
  <div></div>
</template>
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import DevHelper from "./components/DevHelper.vue";
</script>

<template>
  <DevHelper />
  <!-- Ваш контент -->
</template>
```

## Angular

### Angular 15+

```typescript
// src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { environment } from "../environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.initDevHelper();
  }

  private initDevHelper() {
    const script = document.createElement("script");
    script.src = environment.devhelperUrl + "/api/devhelper/script";
    script.async = true;

    script.onload = () => {
      if ((window as any).DevHelper) {
        (window as any).DevHelper.init({
          apiKey: environment.devhelperApiKey,
          projectId: "my-angular-app",
          devMode: !environment.production,
          autoReport: environment.production,
        });
      }
    };

    document.body.appendChild(script);
  }
}
```

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  devhelperUrl: "https://your-devhelper.vercel.app",
  devhelperApiKey: "your-api-key",
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  devhelperUrl: "https://your-devhelper.vercel.app",
  devhelperApiKey: "your-production-api-key",
};
```

## Svelte

### SvelteKit

```typescript
// src/routes/+layout.svelte
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

<slot />
```

```env
# .env
PUBLIC_DEVHELPER_URL=https://your-devhelper.vercel.app
PUBLIC_DEVHELPER_API_KEY=your-api-key
```

## Nuxt

### Nuxt 3

```typescript
// plugins/devhelper.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const script = document.createElement("script");
  script.src = config.public.devhelperUrl + "/api/devhelper/script";
  script.async = true;

  script.onload = () => {
    if ((window as any).DevHelper) {
      (window as any).DevHelper.init({
        apiKey: config.public.devhelperApiKey,
        projectId: "my-nuxt-app",
        devMode: process.dev,
        autoReport: !process.dev,
      });
    }
  };

  document.body.appendChild(script);
});
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      devhelperUrl: process.env.NUXT_PUBLIC_DEVHELPER_URL,
      devhelperApiKey: process.env.NUXT_PUBLIC_DEVHELPER_API_KEY,
    },
  },
});
```

```env
# .env
NUXT_PUBLIC_DEVHELPER_URL=https://your-devhelper.vercel.app
NUXT_PUBLIC_DEVHELPER_API_KEY=your-api-key
```

## Розширене використання

### Програмний доступ до помилок

```javascript
const devHelper = window.DevHelper.init({
  apiKey: "your-api-key",
  projectId: "my-project",
  devMode: true,
});

// Отримати всі помилки
const allErrors = devHelper.getErrors();
console.log("Всього помилок:", allErrors.length);

// Фільтрувати помилки
const criticalErrors = allErrors.filter(
  (e) => e.type === "error" && e.message.includes("critical")
);

// Очистити помилки
devHelper.clearErrors();

// Відправити звіт вручну
devHelper.sendReport();

// Завантажити звіт
devHelper.downloadReport();
```

### Кастомна обробка помилок

```javascript
const devHelper = window.DevHelper.init({
  apiKey: "your-api-key",
  projectId: "my-project",
  devMode: true,
});

// Перевіряти помилки кожні 5 секунд
setInterval(() => {
  const errors = devHelper.getErrors();

  if (errors.length > 10) {
    // Відправити сповіщення
    alert("Виявлено багато помилок!");

    // Відправити звіт
    devHelper.sendReport();

    // Очистити
    devHelper.clearErrors();
  }
}, 5000);
```

### Інтеграція з аналітикою

```javascript
const devHelper = window.DevHelper.init({
  apiKey: "your-api-key",
  projectId: "my-project",
  devMode: false,
  autoReport: true,
});

// Відправляти помилки в Google Analytics
setInterval(() => {
  const errors = devHelper.getErrors();

  errors.forEach((error) => {
    if (typeof gtag !== "undefined") {
      gtag("event", "exception", {
        description: error.message,
        fatal: error.type === "error",
      });
    }
  });

  devHelper.clearErrors();
}, 60000);
```

### Умовна ініціалізація

```javascript
// Тільки для певних користувачів
if (user.role === "developer" || user.role === "admin") {
  window.DevHelper.init({
    apiKey: "your-api-key",
    projectId: "my-project",
    devMode: true,
    autoReport: false,
  });
}

// Тільки на певних сторінках
if (window.location.pathname.startsWith("/admin")) {
  window.DevHelper.init({
    apiKey: "your-api-key",
    projectId: "admin-panel",
    devMode: true,
    autoReport: true,
  });
}

// Тільки в певний час
const hour = new Date().getHours();
if (hour >= 9 && hour <= 18) {
  // Робочий час
  window.DevHelper.init({
    apiKey: "your-api-key",
    projectId: "my-project",
    devMode: true,
    autoReport: true,
  });
}
```

## TypeScript типізація

```typescript
// types/devhelper.d.ts
interface DevHelperConfig {
  apiKey: string;
  projectId: string;
  devMode?: boolean;
  autoReport?: boolean;
  reportEndpoint?: string;
}

interface ConsoleError {
  type: "error" | "warning" | "info";
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface DevHelperInstance {
  getErrors: () => ConsoleError[];
  clearErrors: () => void;
  sendReport: () => Promise<void>;
  downloadReport: () => void;
}

interface Window {
  DevHelper?: {
    init: (config: DevHelperConfig) => DevHelperInstance;
  };
}
```

## Тестування

```javascript
// Тестова функція
function testDevHelper() {
  console.log("=== DevHelper Test ===");

  // 1. Тестова помилка
  console.error("Test Error: This is a test error");

  // 2. Тестове попередження
  console.warn("Test Warning: This is a test warning");

  // 3. Runtime помилка
  setTimeout(() => {
    throw new Error("Test Runtime Error");
  }, 1000);

  // 4. Promise rejection
  setTimeout(() => {
    Promise.reject("Test Promise Rejection");
  }, 2000);

  // 5. Перевірка віджета
  setTimeout(() => {
    const errors = window.DevHelper?.init({
      apiKey: "test",
      projectId: "test",
    }).getErrors();

    console.log("Captured errors:", errors?.length);
  }, 3000);
}

// Запустити тест
testDevHelper();
```
