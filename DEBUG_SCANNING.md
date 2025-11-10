# 🐛 Дебаг: Сканування не показує результати

## Що я додав:

Детальне логування на кожному кроці аналізу, щоб знайти проблему.

## Як дебажити:

### 1. Відкрийте консоль браузера (F12)

### 2. Перейдіть на таб Code Analysis

### 3. Натисніть "🔍 Почати аналіз"

### 4. Подивіться що виводиться в консоль:

#### ✅ Якщо все працює, побачите:

```
Code Analysis button found and handler attached
Analyze button clicked!
Starting CSS analysis...
Found 3 stylesheets
Stylesheet 0 : http://localhost:3000/styles.css - Rules: 45
Stylesheet 1 : inline - Rules: 12
Stylesheet 2 : http://localhost:3000/components.css - Rules: 28
Found 15 unused CSS selectors
Generated HTML length: 5432
Results element: <div id="code-analysis-results">
Results displayed successfully
Analysis complete. Found 15 unused CSS classes
Button re-enabled
```

#### ❌ Проблема 1: "Results element not found!"

```
Причина: Елемент code-analysis-results не існує
Рішення: Перевірити чи правильно створюється HTML
```

**Що перевірити:**

```javascript
// В консолі виконайте:
document.getElementById("code-analysis-results");
// Повинно повернути елемент, а не null
```

#### ❌ Проблема 2: "Cannot access stylesheet"

```
Причина: CORS блокує доступ до зовнішніх CSS
Рішення: Це нормально для зовнішніх доменів
```

**Приклад:**

```
Cannot access stylesheet: https://fonts.googleapis.com/css2?family=...
```

Це нормально - Google Fonts блокує доступ через CORS.

#### ❌ Проблема 3: "Found 0 stylesheets"

```
Причина: На сторінці немає CSS або всі заблоковані CORS
Рішення: Перевірити чи є CSS на сторінці
```

**Що перевірити:**

```javascript
// В консолі виконайте:
document.styleSheets.length;
// Повинно бути > 0
```

#### ❌ Проблема 4: "Found 0 unused CSS selectors"

```
Причина: Всі CSS класи використовуються (або фільтр занадто строгий)
Рішення: Це може бути нормально
```

**Пояснення:**

- Якщо на сторінці всі класи використовуються - це добре!
- Фільтр пропускає `:hover`, `[data-*]` тощо

### 5. Перевірте чи відображаються результати:

**Якщо в консолі "Results displayed successfully", але нічого не видно:**

```javascript
// В консолі виконайте:
const el = document.getElementById("code-analysis-results");
console.log("Element:", el);
console.log("HTML:", el.innerHTML);
console.log("Visible:", el.offsetHeight > 0);
```

**Можливі причини:**

- CSS приховує елемент (`display: none`)
- Елемент за межами видимої області
- Z-index проблеми

## Типові сценарії:

### Сценарій 1: Все працює ✅

```
Found 3 stylesheets
Found 15 unused CSS selectors
Results displayed successfully
```

**Результат:** Бачите список невикористаних класів

### Сценарій 2: CORS блокує CSS ⚠️

```
Found 5 stylesheets
Cannot access stylesheet: https://cdn.example.com/styles.css (CORS)
Cannot access stylesheet: https://fonts.googleapis.com/... (CORS)
Found 8 unused CSS selectors (тільки з доступних файлів)
Results displayed successfully
```

**Результат:** Бачите результати, але тільки з локальних CSS

### Сценарій 3: Немає невикористаних класів ✅

```
Found 2 stylesheets
Found 0 unused CSS selectors
Results displayed successfully
```

**Результат:** Бачите "Невикористаний CSS: 0"

### Сценарій 4: Елемент не знайдено ❌

```
Found 3 stylesheets
Found 15 unused CSS selectors
Results element: null
Results element not found!
```

**Результат:** Нічого не відображається

**Рішення:**

```javascript
// Перевірити чи елемент існує:
document.getElementById("code-analysis-results");

// Якщо null - перевірити HTML:
document.body.innerHTML.includes("code-analysis-results");
```

## Швидкий тест:

Виконайте в консолі:

```javascript
// Тест 1: Чи є CSS?
console.log("Stylesheets:", document.styleSheets.length);

// Тест 2: Чи є елемент для результатів?
console.log(
  "Results element:",
  document.getElementById("code-analysis-results")
);

// Тест 3: Чи є кнопка?
console.log("Button:", document.getElementById("analyze-code-btn"));

// Тест 4: Ручний аналіз
const unusedCSS = [];
Array.from(document.styleSheets).forEach((sheet) => {
  try {
    Array.from(sheet.cssRules || []).forEach((rule) => {
      if (rule.selectorText) {
        const selector = rule.selectorText;
        if (!selector.includes(":") && !selector.includes("[")) {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 0) {
            unusedCSS.push(selector);
          }
        }
      }
    });
  } catch (e) {}
});
console.log("Unused CSS:", unusedCSS);
```

## Що робити далі:

### Якщо бачите логи але не бачите результати:

1. Перевірте чи елемент `code-analysis-results` існує
2. Перевірте чи HTML додається (`el.innerHTML`)
3. Перевірте чи елемент видимий (`el.offsetHeight`)

### Якщо не бачите логів взагалі:

1. Перевірте чи кнопка має обробник
2. Перевірте чи немає JavaScript помилок
3. Спробуйте перезавантажити сторінку

### Якщо бачите "Found 0 stylesheets":

1. Перевірте чи на сторінці є CSS
2. Перевірте чи не всі CSS заблоковані CORS
3. Спробуйте на іншій сторінці

---

Після додавання логування, запустіть аналіз знову та надішліть мені що показує консоль - я допоможу знайти проблему! 🔍
