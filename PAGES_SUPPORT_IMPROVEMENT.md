# 📄 Покращення підтримки сторінок

## Що було зроблено

Покращено функцію `analyzePages()` для кращого виявлення сторінок у різних типах проектів.

## Зміни

### ✅ Додано підтримку React проектів

#### 1. React Router структура

```
src/pages/Home.tsx          → React Page
src/pages/About.tsx         → React Page
src/views/Dashboard.tsx     → React Page
src/screens/Profile.tsx     → React Page
src/routes/Login.tsx        → React Page
```

#### 2. Популярні назви сторінок

Автоматично визначає компоненти які виглядають як сторінки:

```
Home.tsx, HomePage.tsx
About.tsx, AboutPage.tsx
Dashboard.tsx
Profile.tsx
Login.tsx, LoginPage.tsx
Register.tsx
Contact.tsx
Settings.tsx
Admin.tsx
User.tsx
Product.tsx
Cart.tsx
Checkout.tsx
Detail.tsx
List.tsx
Index.tsx
Main.tsx
```

#### 3. Vue підтримка

```
pages/**/*.vue              → Vue/Nuxt
views/**/*.vue              → Vue View
```

### ✅ Покращена фільтрація

#### Виключаються:

- `node_modules/` - залежності
- `.git/` - git файли
- `/.` - приховані файли (`.env`, `.gitignore`)
- `_app`, `_document`, `_error` - Next.js системні файли
- `api/` - API роути (не сторінки)

### ✅ Покращені regex

#### Було:

```javascript
file.name.match(/app\/.*\/page\.(jsx?|tsx?)$/i);
file.name.match(/pages\/.*\.(jsx?|tsx?)$/i);
```

#### Стало:

```javascript
file.name.match(/\/app\/.*\/page\.(jsx?|tsx?)$/i); // Додано /
file.name.match(/\/pages\/.*\.(jsx?|tsx?)$/i) && // Додано /
  !file.name.match(/\/((_app|_document|_error|api)\.(jsx?|tsx?)|api\/)/i); // Фільтр
```

## Підтримувані фреймворки

### Next.js

```
app/page.tsx                → Next.js App Router
app/about/page.tsx          → Next.js App Router
pages/index.tsx             → Next.js Pages Router
pages/about.tsx             → Next.js Pages Router
```

### React (CRA / Vite)

```
src/pages/Home.tsx          → React Page
src/views/Dashboard.tsx     → React Page
src/screens/Profile.tsx     → React Page
Home.tsx                    → React Component
Dashboard.tsx               → React Component
```

### Vue / Nuxt

```
pages/index.vue             → Vue/Nuxt
pages/about.vue             → Vue/Nuxt
views/Home.vue              → Vue View
views/Dashboard.vue         → Vue View
```

### Angular

```
home.component.ts           → Angular Component
dashboard.component.ts      → Angular Component
```

## Результат

### До змін:

- ✅ Next.js - працювало
- ❌ React - не показувалося
- ✅ Vue - працювало частково
- ✅ Angular - працювало

### Після змін:

- ✅ Next.js - працює краще (фільтрує системні файли)
- ✅ React - працює повністю
- ✅ Vue - працює повністю
- ✅ Angular - працює

## Приклад виводу

### React проект:

```
📄 Сторінки (8)

Home.tsx                    [React Page]
📁 src/pages

About.tsx                   [React Page]
📁 src/pages

Dashboard.tsx               [React Page]
📁 src/pages

Profile.tsx                 [React Page]
📁 src/views

Login.tsx                   [React Component]
📁 src/components

Settings.tsx                [React Component]
📁 src/components
```

### Next.js проект:

```
📄 Сторінки (6)

page.tsx                    [Next.js App Router]
📁 app

page.tsx                    [Next.js App Router]
📁 app/about

index.tsx                   [Next.js Pages Router]
📁 pages

about.tsx                   [Next.js Pages Router]
📁 pages
```

## Що НЕ змінювалося

- ✅ Блок API Роути залишився без змін (оригінальна версія)
- ✅ Всі інші блоки аналізу без змін
- ✅ Тільки покращено виявлення сторінок

## Тестування

Для перевірки:

1. Завантажте ZIP React проекту
2. Перейдіть на таб "🔍 Code Analysis"
3. Перевірте блок "📄 Сторінки"
4. Має показувати сторінки з `src/pages/`, `src/views/`, та популярні назви

## Переваги

1. **Універсальність** - працює для всіх популярних фреймворків
2. **Точність** - фільтрує системні файли та API роути
3. **Гнучкість** - знаходить сторінки за різними патернами
4. **Простота** - не потребує додаткової конфігурації
