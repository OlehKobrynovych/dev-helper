# 📁 Структура проекту DevHelper

## Огляд

```
devhelper/
├── 📄 Документація (13 файлів)
├── 🔧 Конфігурація (6 файлів)
├── 💻 Вихідний код (src/)
│   ├── 📱 Сторінки (4)
│   ├── 🧩 Компоненти (3)
│   ├── 🎣 Hooks (1)
│   ├── 📚 Бібліотеки (1)
│   └── 📝 Типи (2)
└── 🌐 API (2 endpoints)
```

---

## 📄 Документація

### Основні файли

```
├── README.md                    # Головна документація
├── START_HERE.md               # Швидкий старт
├── QUICKSTART.md               # 3-хвилинний гайд
├── INTEGRATION.md              # Детальна інтеграція
├── EXAMPLES.md                 # Приклади коду
├── DEPLOY.md                   # Інструкція з деплою
└── FEATURES.md                 # Опис можливостей
```

### Додаткові файли

```
├── CONTRIBUTING.md             # Гайд для контриб'юторів
├── CHANGELOG.md                # Історія змін
├── ROADMAP.md                  # План розвитку
├── SECURITY.md                 # Політика безпеки
├── PROJECT_SUMMARY.md          # Підсумок проекту
├── FINAL_SUMMARY.md            # Фінальний звіт
└── EXAMPLE_REPORT.md           # Приклад звіту
```

---

## 🔧 Конфігурація

```
├── package.json                # Залежності та скрипти
├── tsconfig.json               # TypeScript конфігурація
├── next.config.ts              # Next.js налаштування
├── tailwind.config.ts          # Tailwind CSS
├── vercel.json                 # Vercel конфігурація (CORS)
├── .env.example                # Приклад змінних оточення
├── .gitignore                  # Git ignore
└── LICENSE                     # MIT ліцензія
```

---

## 💻 Вихідний код

### Структура src/

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Головна сторінка
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Глобальні стилі
│   │
│   ├── docs/                  # Документація API
│   │   └── page.tsx
│   │
│   ├── examples/              # Приклади інтеграції
│   │   └── page.tsx
│   │
│   ├── faq/                   # Часті питання
│   │   └── page.tsx
│   │
│   └── api/                   # API Routes
│       └── devhelper/
│           ├── script/        # Генерація скрипта
│           │   └── route.ts
│           └── report/        # Прийом звітів
│               └── route.ts
│
├── components/                 # React компоненти
│   ├── DevHelperWidget.tsx    # Віджет з помилками
│   ├── ErrorTester.tsx        # Тестування помилок
│   └── Navigation.tsx         # Навігаційне меню
│
├── hooks/                      # Custom React Hooks
│   └── useDevHelper.ts        # Hook для DevHelper
│
├── lib/                        # Бібліотеки та утиліти
│   ├── devhelper-core.ts      # Core логіка
│   └── cn.ts                  # Utility функції
│
└── types/                      # TypeScript типи
    ├── devhelper.ts           # Основні типи
    └── window.d.ts            # Глобальні типи
```

---

## 📱 Сторінки

### 1. Головна сторінка (`/`)

**Файл:** `src/app/page.tsx`

**Включає:**

- Навігаційне меню
- Презентація можливостей
- Код для інтеграції
- Інтерактивне тестування (8 типів помилок)
- Налаштування та конфігурація
- API методи
- Живий віджет DevHelper

**Розмір:** ~6.95 KB

---

### 2. Документація API (`/docs`)

**Файл:** `src/app/docs/page.tsx`

**Включає:**

- GET /api/devhelper/script
- POST /api/devhelper/report
- Request/Response приклади
- TypeScript інтерфейси
- Методи API
- Приклади використання

**Розмір:** ~146 B (static)

---

### 3. Приклади (`/examples`)

**Файл:** `src/app/examples/page.tsx`

**Включає:**

- HTML + Vanilla JavaScript
- React (Next.js App Router)
- Vue 3 (Composition API)
- Angular
- Svelte / SvelteKit
- Nuxt 3
- Програмний доступ
- Умовна ініціалізація
- Копіювання коду

**Розмір:** ~3.81 KB

---

### 4. FAQ (`/faq`)

**Файл:** `src/app/faq/page.tsx`

**Включає:**

- 20 найпоширеніших питань
- Accordion UI
- Детальні відповіді
- Посилання на GitHub

**Розмір:** ~4.2 KB

---

## 🧩 Компоненти

### 1. DevHelperWidget

**Файл:** `src/components/DevHelperWidget.tsx`

**Функціонал:**

- Floating button (🐛)
- Error counter badge
- Modal window
- Filters (all/errors/warnings)
- Stack trace display
- Download report
- Clear errors

**Props:**

```typescript
interface Props {
  errors: ConsoleError[];
  onClear: () => void;
  onDownloadReport: () => void;
}
```

---

### 2. ErrorTester

**Файл:** `src/components/ErrorTester.tsx`

**Функціонал:**

- 8 типів тестових помилок
- Візуальний feedback
- Лог тестування
- Кольорове кодування

**Типи помилок:**

1. Console Error
2. Console Warning
3. Runtime Error
4. Promise Rejection
5. Undefined Error
6. Type Error
7. Network Error
8. Multiple Errors

---

### 3. Navigation

**Файл:** `src/components/Navigation.tsx`

**Функціонал:**

- Активний стан
- Responsive дизайн
- Next.js Link
- usePathname hook

---

## 🎣 Hooks

### useDevHelper

**Файл:** `src/hooks/useDevHelper.ts`

**Функціонал:**

- Ініціалізація DevHelperCore
- Отримання помилок (real-time)
- Очищення помилок
- Завантаження звіту
- Відправка звіту
- Cleanup при unmount

**Повертає:**

```typescript
{
  errors: ConsoleError[];
  clearErrors: () => void;
  downloadReport: () => void;
  sendReport: () => Promise<void>;
}
```

---

## 📚 Бібліотеки

### devhelper-core

**Файл:** `src/lib/devhelper-core.ts`

**Клас:** `DevHelperCore`

**Методи:**

- `constructor(config)` - Ініціалізація
- `init()` - Запуск перехоплення
- `interceptConsole()` - Перехоплення console
- `interceptErrors()` - Перехоплення runtime errors
- `captureError()` - Збереження помилки
- `setupAutoReport()` - Автоматичні звіти
- `getErrors()` - Отримання помилок
- `clearErrors()` - Очищення
- `sendReport()` - Відправка звіту
- `destroy()` - Cleanup

---

## 📝 Типи

### devhelper.ts

```typescript
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

interface ErrorReport {
  projectId: string;
  errors: ConsoleError[];
  userAgent: string;
  url: string;
  timestamp: number;
}
```

### window.d.ts

```typescript
interface Window {
  DevHelper?: {
    init: (config: DevHelperConfig) => DevHelperInstance;
  };
}
```

---

## 🌐 API Endpoints

### 1. GET /api/devhelper/script

**Файл:** `src/app/api/devhelper/script/route.ts`

**Функціонал:**

- Генерує JavaScript скрипт
- Самодостатній (не потребує залежностей)
- CORS headers
- Кешування (1 година)

**Response:**

- Content-Type: application/javascript
- Cache-Control: public, max-age=3600

---

### 2. POST /api/devhelper/report

**Файл:** `src/app/api/devhelper/report/route.ts`

**Функціонал:**

- Приймає звіти про помилки
- Валідація API key
- Генерація markdown звіту
- Error handling

**Headers:**

- Content-Type: application/json
- X-API-Key: your-api-key

**Response:**

```json
{
  "success": true,
  "report": "# DevHelper Report...",
  "timestamp": 1699276800000
}
```

---

## 📊 Статистика

### Розміри файлів

```
Total Size: ~112 KB (First Load JS)
├── Main bundle: 52.9 KB
├── Framework: 50.5 KB
└── Shared: 1.95 KB

Pages:
├── / (Home): 6.95 KB
├── /examples: 3.81 KB
├── /faq: 4.2 KB
└── /docs: 146 B
```

### Кількість файлів

```
Документація: 13 файлів
Конфігурація: 6 файлів
Компоненти: 3 файли
Hooks: 1 файл
Бібліотеки: 1 файл
Типи: 2 файли
Сторінки: 4 файли
API: 2 endpoints
```

### Рядки коду

```
TypeScript: ~2000 рядків
React: ~800 рядків
Документація: ~5000 рядків
Приклади: ~1000 рядків
Всього: ~8800 рядків
```

---

## 🚀 Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    6.95 kB         112 kB
├ ○ /_not-found                          146 B           106 kB
├ ƒ /api/devhelper/report                146 B           106 kB
├ ƒ /api/devhelper/script                146 B           106 kB
├ ○ /docs                                146 B           106 kB
├ ○ /examples                            3.81 kB         109 kB
└ ○ /faq                                 4.2 kB          110 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 📦 Залежності

### Production

```json
{
  "clsx": "^2.1.1",
  "framer-motion": "^12.5.0",
  "lucide-react": "^0.475.0",
  "next": "15.1.7",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Development

```json
{
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "postcss": "^8",
  "prettier": "^3.5.3",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

---

## 🎯 Ключові файли

### Для розробки

1. `src/lib/devhelper-core.ts` - Core логіка
2. `src/hooks/useDevHelper.ts` - React integration
3. `src/components/DevHelperWidget.tsx` - UI компонент

### Для інтеграції

1. `src/app/api/devhelper/script/route.ts` - Скрипт
2. `vercel.json` - CORS налаштування
3. `.env.example` - Змінні оточення

### Для документації

1. `README.md` - Основна документація
2. `INTEGRATION.md` - Інтеграція
3. `EXAMPLES.md` - Приклади

---

**Структура оптимізована для:**

- ✅ Швидкої розробки
- ✅ Легкої підтримки
- ✅ Простої інтеграції
- ✅ Масштабування

_Останнє оновлення: 06.11.2025_
