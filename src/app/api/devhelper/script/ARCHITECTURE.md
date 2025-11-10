# DevHelper Script Architecture

## 📐 Архітектура системи

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              DevHelper Script (IIFE)                  │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │           CORE MODULE                           │ │ │
│  │  │  • Перехоплення console.error/warn             │ │ │
│  │  │  • Обробка window.error                        │ │ │
│  │  │  • Обробка unhandledrejection                  │ │ │
│  │  │  • Витягування file info з stack trace         │ │ │
│  │  │  • Зберігання помилок в масиві                 │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                         ↓                             │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │           MODAL MODULE                          │ │ │
│  │  │  • Створення UI модального вікна               │ │ │
│  │  │  • Управління табами                           │ │ │
│  │  │  • Floating button з badge                     │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                         ↓                             │ │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐  │ │
│  │  │ ERRORS   │ PERF     │ CODE     │ TESTING      │  │ │
│  │  │ TAB      │ TAB      │ ANALYSIS │ TAB          │  │ │
│  │  │          │          │ TAB      │              │  │ │
│  │  │ • Список │ • FPS    │ • Unused │ • 8 типів    │  │ │
│  │  │ помилок  │ • Memory │ CSS      │ тестових     │  │ │
│  │  │ • AI     │ • Load   │ • Unused │ помилок      │  │ │
│  │  │ аналіз   │ Time     │ JS       │              │  │ │
│  │  │ • Stack  │ • FCP    │ • Stats  │              │  │ │
│  │  │ trace    │ • Tips   │          │              │  │ │
│  │  └──────────┴──────────┴──────────┴──────────────┘  │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
                    API Endpoints
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                           │
│                                                             │
│  /api/devhelper/script        → Генерує скрипт             │
│  /api/devhelper/analyze       → AI аналіз помилок          │
│  /api/devhelper/analyze-project → Сканування проекту       │
│  /api/devhelper/report        → Збереження звітів          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Потік даних

### 1. Ініціалізація

```
User включає скрипт
    ↓
<script src="/api/devhelper/script"></script>
    ↓
Next.js route.ts читає модулі
    ↓
Об'єднує в один скрипт
    ↓
Браузер виконує IIFE
    ↓
window.DevHelper.init(config)
    ↓
Core перехоплює помилки
    ↓
Modal створює UI (якщо devMode: true)
```

### 2. Перехоплення помилки

```
Помилка в коді
    ↓
console.error() або window.error
    ↓
Core.captureError()
    ↓
Витягує file info з stack
    ↓
Додає в масив errors[]
    ↓
Floating button оновлює badge
```

### 3. Відображення помилок

```
User клікає на floating button
    ↓
Modal.show()
    ↓
Рендерить поточний таб
    ↓
ErrorsTab.render(errors)
    ↓
Показує список з AI кнопками
```

### 4. AI Аналіз

```
User клікає "🤖 AI"
    ↓
analyzeError(index)
    ↓
POST /api/devhelper/analyze
    ↓
Server аналізує помилку
    ↓
Повертає aiAnalysis + suggestions
    ↓
Оновлює errors[index]
    ↓
Перерендерює modal
```

### 5. Performance Monitoring

```
User відкриває Performance таб
    ↓
renderPerformanceTab()
    ↓
startPerformanceMonitoring()
    ↓
requestAnimationFrame() для FPS
    ↓
setInterval() для Memory
    ↓
performance.timing для Load Time
    ↓
updateTips() аналізує метрики
    ↓
Показує проблеми та рішення
```

### 6. Code Analysis

```
User клікає "🚀 Сканувати проект"
    ↓
POST /api/devhelper/analyze-project
    ↓
Server сканує файли проекту
    ↓
Знаходить unused CSS/JS
    ↓
Повертає статистику
    ↓
Рендерить результати
```

## 🏗️ Модульна структура

### Принципи розділення:

1. **Separation of Concerns** - кожен модуль відповідає за одну річ
2. **Single Responsibility** - один модуль = одна відповідальність
3. **Loose Coupling** - модулі слабо зв'язані між собою
4. **High Cohesion** - код всередині модуля сильно пов'язаний

### Залежності між модулями:

```
route.ts (головний)
    ↓
    ├── core.js (незалежний)
    ├── errors-tab.js (незалежний)
    ├── performance-tab.js (незалежний)
    ├── code-analysis-tab.js (незалежний)
    ├── testing-tab.js (незалежний)
    └── modal.js
            ↓
            ├── використовує errors-tab.js
            ├── використовує performance-tab.js
            ├── використовує code-analysis-tab.js
            └── використовує testing-tab.js
```

## 🎯 Переваги архітектури

### 1. Модульність

- Кожен таб - окремий файл
- Легко додавати нові таби
- Можна видаляти непотрібні

### 2. Читабельність

- ~200 рядків на модуль замість 1000+ в одному файлі
- Зрозуміла структура
- Легко знайти потрібний код

### 3. Підтримка

- Зміни в одному табі не впливають на інші
- Легко виправляти баги
- Простіше code review

### 4. Тестування

- Можна тестувати модулі окремо
- Мокати залежності
- Unit тести для кожного модуля

### 5. Продуктивність

- Браузер отримує один скрипт (не 6 окремих)
- Мініфікація працює краще
- Кешування на рівні всього скрипта

## 🔐 Безпека

### 1. IIFE (Immediately Invoked Function Expression)

```javascript
(function () {
  "use strict";
  // Весь код ізольований
})();
```

- Не забруднює global scope
- Захист від конфліктів імен
- Strict mode для безпеки

### 2. Валідація конфігурації

```javascript
if (!config.apiKey || !config.projectId) {
  console.error("DevHelper: apiKey and projectId are required");
  return;
}
```

### 3. API Key в headers

```javascript
headers: {
  'X-API-Key': config.apiKey,
}
```

## 📊 Метрики

### Розмір коду:

- **До рефакторингу**: 1 файл, ~1000 рядків
- **Після рефакторингу**: 7 файлів, ~970 рядків
- **Середній розмір модуля**: ~140 рядків

### Складність:

- **До**: Cyclomatic Complexity ~50
- **Після**: Cyclomatic Complexity ~10 на модуль

### Підтримка:

- **До**: Важко знайти код для конкретного табу
- **Після**: Відкрив файл табу - знайшов код

## 🚀 Майбутні покращення

1. **TypeScript для модулів** - типізація для кращої безпеки
2. **Lazy loading табів** - завантажувати тільки активний таб
3. **Web Workers** - винести важкі обчислення в окремий потік
4. **Service Worker** - офлайн підтримка
5. **Compression** - gzip/brotli для зменшення розміру
6. **Source maps** - для debugging мініфікованого коду

## 📚 Додаткові ресурси

- [modules/README.md](./modules/README.md) - Детальний опис кожного модуля
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [IIFE Pattern](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
- [Module Pattern](https://www.patterns.dev/posts/module-pattern/)
