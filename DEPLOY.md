# 🚀 Інструкція з деплою DevHelper на Vercel

## Швидкий деплой (1 хвилина)

### Варіант 1: Через Vercel Dashboard

1. **Перейдіть на Vercel**
   - Відкрийте [vercel.com](https://vercel.com)
   - Увійдіть або зареєструйтесь

2. **Створіть новий проект**
   - Натисніть "Add New..." → "Project"
   - Виберіть "Import Git Repository"
   - Підключіть ваш GitHub/GitLab/Bitbucket

3. **Налаштуйте проект**
   - Framework Preset: Next.js (автоматично визначиться)
   - Root Directory: `./` (за замовчуванням)
   - Build Command: `npm run build` (за замовчуванням)
   - Output Directory: `.next` (за замовчуванням)

4. **Додайте змінні оточення**

   ```
   NEXT_PUBLIC_BASE_URL = https://your-project.vercel.app
   ```

   ⚠️ Важливо: Після першого деплою оновіть цю змінну на реальний URL

5. **Деплой**
   - Натисніть "Deploy"
   - Зачекайте 1-2 хвилини

6. **Оновіть змінну оточення**
   - Після деплою скопіюйте URL (наприклад: `https://devhelper-abc123.vercel.app`)
   - Перейдіть в Settings → Environment Variables
   - Оновіть `NEXT_PUBLIC_BASE_URL` на реальний URL
   - Зробіть редеплой (Settings → Deployments → ... → Redeploy)

### Варіант 2: Через Vercel CLI

```bash
# Встановіть Vercel CLI
npm i -g vercel

# Увійдіть
vercel login

# Деплой
vercel

# Додайте змінну оточення
vercel env add NEXT_PUBLIC_BASE_URL

# Введіть значення (ваш URL з Vercel)
# Виберіть: Production, Preview, Development

# Редеплой
vercel --prod
```

### Варіант 3: Через кнопку Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/devhelper)

## Після деплою

### 1. Отримайте URL скрипта

Ваш скрипт доступний за адресою:

```
https://your-project.vercel.app/api/devhelper/script
```

### 2. Перевірте роботу

Відкрийте у браузері:

```
https://your-project.vercel.app
```

Ви побачите головну сторінку DevHelper з інструкціями.

### 3. Протестуйте скрипт

Створіть тестовий HTML файл:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>DevHelper Test</title>
  </head>
  <body>
    <h1>DevHelper Test</h1>
    <button onclick="console.error('Test error')">Test Error</button>

    <script src="https://your-project.vercel.app/api/devhelper/script"></script>
    <script>
      const devHelper = window.DevHelper.init({
        apiKey: "test-key",
        projectId: "test-project",
        devMode: true,
        autoReport: false,
      });
    </script>
  </body>
</html>
```

Відкрийте файл у браузері та натисніть кнопку. У правому нижньому куті має з'явитись віджет 🐛.

## Налаштування домену (опціонально)

### Додати кастомний домен

1. Перейдіть в Settings → Domains
2. Додайте ваш домен (наприклад: `devhelper.yourdomain.com`)
3. Налаштуйте DNS записи згідно інструкцій Vercel
4. Оновіть `NEXT_PUBLIC_BASE_URL` на новий домен
5. Редеплойте проект

## Моніторинг та логи

### Перегляд логів

1. Перейдіть в Deployments
2. Виберіть деплой
3. Натисніть "View Function Logs"

### Аналітика

Vercel автоматично збирає аналітику:

- Кількість запитів
- Час відповіді
- Помилки

Перегляньте в розділі Analytics.

## Оновлення проекту

### Автоматичне оновлення

Vercel автоматично деплоїть при кожному push в main/master гілку.

### Ручне оновлення

```bash
# Через CLI
vercel --prod

# Або через Dashboard
# Deployments → ... → Redeploy
```

## Поширені проблеми

### Помилка: "NEXT_PUBLIC_BASE_URL is not defined"

**Рішення:**

1. Додайте змінну в Settings → Environment Variables
2. Редеплойте проект

### Скрипт не завантажується (CORS)

**Рішення:**
Файл `vercel.json` вже налаштований з правильними CORS заголовками.

### Помилка при білді

**Рішення:**

```bash
# Локально перевірте білд
npm run build

# Якщо є помилки, виправте їх
# Закомітьте та запуште
```

## Безпека

### API ключі

Для production використовуйте:

- Складні API ключі (мінімум 32 символи)
- Різні ключі для різних проектів
- Зберігайте ключі в безпечному місці

### Rate Limiting

Додайте rate limiting для API endpoints (опціонально):

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 хвилина
  const max = 100; // 100 запитів

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count++;
      if (data.count > max) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/devhelper/:path*",
};
```

## Підтримка

Якщо виникли проблеми:

1. Перевірте логи в Vercel Dashboard
2. Перегляньте документацію Vercel
3. Створіть issue в репозиторії
