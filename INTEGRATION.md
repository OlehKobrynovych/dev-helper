# 📚 Інструкція з інтеграції DevHelper

## Крок 1: Розгортання на Vercel

1. Форкніть цей репозиторій
2. Перейдіть на [vercel.com](https://vercel.com)
3. Натисніть "New Project"
4. Виберіть ваш форк
5. Додайте змінну оточення:
   - `NEXT_PUBLIC_BASE_URL` - URL вашого розгорнутого проекту (наприклад: `https://your-devhelper.vercel.app`)
6. Натисніть "Deploy"

## Крок 2: Отримання посилання на скрипт

Після розгортання ваш скрипт буде доступний за адресою:

```
https://your-devhelper.vercel.app/api/devhelper/script
```

## Крок 3: Інтеграція в проект

### Для HTML проектів

Додайте перед закриваючим тегом `</body>`:

```html
<script src="https://your-devhelper.vercel.app/api/devhelper/script"></script>
<script>
  const devHelper = window.DevHelper.init({
    apiKey: "your-api-key",
    projectId: "my-awesome-project",
    devMode: true,
    autoReport: true,
  });
</script>
```

### Для React проектів

Створіть компонент або додайте в `index.html`:

```jsx
// components/DevHelper.tsx
"use client"; // для Next.js

import { useEffect } from "react";

export function DevHelper() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://your-devhelper.vercel.app/api/devhelper/script";
    script.async = true;

    script.onload = () => {
      if (window.DevHelper) {
        window.DevHelper.init({
          apiKey: process.env.NEXT_PUBLIC_DEVHELPER_API_KEY,
          projectId: "my-project",
          devMode: process.env.NODE_ENV === "development",
          autoReport: true,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
```

Потім використовуйте в вашому додатку:

```jsx
// app/layout.tsx або pages/_app.tsx
import { DevHelper } from "@/components/DevHelper";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DevHelper />
      </body>
    </html>
  );
}
```

### Для Vue проектів

```javascript
// main.js або App.vue
export default {
  mounted() {
    const script = document.createElement("script");
    script.src = "https://your-devhelper.vercel.app/api/devhelper/script";
    script.async = true;

    script.onload = () => {
      if (window.DevHelper) {
        window.DevHelper.init({
          apiKey: import.meta.env.VITE_DEVHELPER_API_KEY,
          projectId: "my-vue-project",
          devMode: import.meta.env.DEV,
          autoReport: true,
        });
      }
    };

    document.body.appendChild(script);
  },
};
```

### Для Angular проектів

```typescript
// app.component.ts
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const script = document.createElement("script");
    script.src = "https://your-devhelper.vercel.app/api/devhelper/script";
    script.async = true;

    script.onload = () => {
      if ((window as any).DevHelper) {
        (window as any).DevHelper.init({
          apiKey: environment.devhelperApiKey,
          projectId: "my-angular-project",
          devMode: !environment.production,
          autoReport: true,
        });
      }
    };

    document.body.appendChild(script);
  }
}
```

## Крок 4: Налаштування

### Генерація API ключа

API ключ можна згенерувати будь-яким способом. Наприклад:

```javascript
// Node.js
const crypto = require("crypto");
const apiKey = crypto.randomBytes(32).toString("hex");
console.log(apiKey);
```

Або онлайн: https://www.uuidgenerator.net/

### Рекомендовані налаштування

#### Для розробки

```javascript
{
  apiKey: 'your-api-key',
  projectId: 'my-project-dev',
  devMode: true,        // показувати віджет
  autoReport: false     // не відправляти автоматично
}
```

#### Для production

```javascript
{
  apiKey: 'your-api-key',
  projectId: 'my-project-prod',
  devMode: false,       // приховати віджет
  autoReport: true      // відправляти автоматично
}
```

## Крок 5: Використання

### Відкриття віджета (dev mode)

Якщо `devMode: true`, у правому нижньому куті з'явиться кнопка 🐛. Натисніть на неї, щоб відкрити консоль з помилками.

### Програмний доступ

```javascript
// Отримати всі помилки
const errors = devHelper.getErrors();
console.log(errors);

// Очистити помилки
devHelper.clearErrors();

// Відправити звіт вручну
devHelper.sendReport();

// Завантажити звіт
devHelper.downloadReport();
```

### Тестування

Щоб перевірити чи працює DevHelper:

```javascript
// Викликати помилку
console.error("Test error from DevHelper");

// Викликати попередження
console.warn("Test warning from DevHelper");

// Викликати runtime помилку
throw new Error("Test runtime error");
```

## Крок 6: Перегляд звітів

### Локальне завантаження

Натисніть кнопку "Завантажити звіт" у віджеті або викличте:

```javascript
devHelper.downloadReport();
```

### Автоматичні звіти

Якщо `autoReport: true`, звіти автоматично відправляються на сервер кожну хвилину.

## Поширені проблеми

### Скрипт не завантажується

- Перевірте URL скрипта
- Перевірте CORS налаштування
- Перевірте чи проект розгорнутий на Vercel

### Віджет не з'являється

- Переконайтесь що `devMode: true`
- Перевірте консоль на помилки
- Перевірте чи скрипт завантажився

### Помилки не відстежуються

- Перевірте чи правильно ініціалізований DevHelper
- Перевірте чи є помилки в консолі
- Спробуйте викликати тестову помилку

## Додаткові можливості

### Кастомний endpoint

```javascript
window.DevHelper.init({
  apiKey: "your-api-key",
  projectId: "my-project",
  reportEndpoint: "https://your-custom-api.com/reports",
});
```

### Фільтрація помилок

```javascript
const devHelper = window.DevHelper.init({...});

// Отримати тільки помилки
const errors = devHelper.getErrors().filter(e => e.type === 'error');

// Отримати тільки попередження
const warnings = devHelper.getErrors().filter(e => e.type === 'warning');
```

## Підтримка

Якщо у вас виникли проблеми:

1. Перевірте документацію
2. Перегляньте приклади інтеграції
3. Створіть issue в репозиторії
