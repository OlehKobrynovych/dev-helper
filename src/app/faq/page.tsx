'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Що таке DevHelper?',
      answer: 'DevHelper - це інструмент для моніторингу та аналізу помилок у веб-проектах. Він автоматично перехоплює помилки з консолі, runtime помилки та unhandled promise rejections, надаючи детальні звіти з рекомендаціями щодо виправлення.'
    },
    {
      question: 'Чи безкоштовний DevHelper?',
      answer: 'Так! DevHelper - це open source проект з MIT ліцензією. Ви можете використовувати його безкоштовно для будь-яких цілей, включаючи комерційні проекти.'
    },
    {
      question: 'Як інтегрувати DevHelper в мій проект?',
      answer: 'Інтеграція дуже проста - додайте один скрипт перед закриваючим тегом </body> та ініціалізуйте з вашими налаштуваннями. Детальні інструкції та приклади для різних фреймворків доступні на сторінці "Приклади".'
    },
    {
      question: 'Чи впливає DevHelper на продуктивність?',
      answer: 'Вплив мінімальний - менше 1%. Скрипт важить ~15KB (gzipped) та використовує ~2MB пам\'яті. Він працює асинхронно і не блокує основний потік виконання.'
    },
    {
      question: 'Чи можна використовувати в production?',
      answer: 'Так! Рекомендується використовувати devMode: false для production, щоб приховати віджет від користувачів, але продовжувати збирати помилки. Увімкніть autoReport: true для автоматичної відправки звітів.'
    },
    {
      question: 'Які дані збирає DevHelper?',
      answer: 'DevHelper збирає тільки технічну інформацію про помилки: повідомлення помилки, stack trace, URL сторінки, номер рядка, час виникнення. Персональні дані користувачів НЕ збираються.'
    },
    {
      question: 'Чи потрібна база даних?',
      answer: 'Ні, базова версія працює без бази даних. Помилки зберігаються в пам\'яті браузера та можуть бути експортовані у markdown. В майбутніх версіях планується додати опціональне збереження в базу даних.'
    },
    {
      question: 'Які браузери підтримуються?',
      answer: 'DevHelper працює в усіх сучасних браузерах: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Opera 76+. Підтримуються як desktop, так і mobile версії.'
    },
    {
      question: 'Чи можна використовувати з React/Vue/Angular?',
      answer: 'Так! DevHelper працює з будь-яким JavaScript фреймворком. На сторінці "Приклади" є готові інтеграції для React, Next.js, Vue, Nuxt, Angular, Svelte та інших.'
    },
    {
      question: 'Як згенерувати API ключ?',
      answer: 'API ключ можна згенерувати будь-яким способом. Наприклад, в консолі браузера: crypto.randomUUID() або Array.from({length: 32}, () => Math.random().toString(36)[2]).join(\'\'). Для production використовуйте складні ключі (мінімум 32 символи).'
    },
    {
      question: 'Що робити якщо віджет не з\'являється?',
      answer: 'Перевірте: 1) Чи devMode: true в конфігурації, 2) Чи скрипт завантажився (перевірте в Network tab), 3) Чи немає помилок в консолі, 4) Чи правильно ініціалізований DevHelper.'
    },
    {
      question: 'Чи можна налаштувати зовнішній вигляд віджета?',
      answer: 'В поточній версії віджет має фіксований дизайн. Кастомізація UI планується в майбутніх версіях. Ви можете створити власний UI використовуючи API методи getErrors(), clearErrors(), тощо.'
    },
    {
      question: 'Як відправити звіт на власний сервер?',
      answer: 'Використовуйте параметр reportEndpoint в конфігурації, щоб вказати власний URL для відправки звітів. Формат запиту описаний в документації API.'
    },
    {
      question: 'Чи можна фільтрувати помилки?',
      answer: 'Так! У віджеті є вбудовані фільтри (всі/помилки/попередження). Програмно можна використовувати getErrors() та фільтрувати за будь-якими критеріями.'
    },
    {
      question: 'Що означають рекомендації у звіті?',
      answer: 'DevHelper аналізує текст помилки та надає контекстні рекомендації щодо виправлення. Наприклад, для помилок з undefined пропонує використовувати optional chaining, для network помилок - додати retry логіку.'
    },
    {
      question: 'Чи можна інтегрувати з Slack/Discord?',
      answer: 'В поточній версії - ні, але це планується в майбутніх оновленнях. Зараз можна використовувати webhook інтеграції через власний reportEndpoint.'
    },
    {
      question: 'Як оновити DevHelper?',
      answer: 'Якщо ви використовуєте скрипт з Vercel, оновлення відбувається автоматично при кожному деплої. Для власного хостингу - просто оновіть код та передеплойте.'
    },
    {
      question: 'Чи є мобільний додаток?',
      answer: 'Поки що ні, але це в планах. Зараз можна використовувати веб-версію на мобільних пристроях - вона адаптивна.'
    },
    {
      question: 'Як допомогти проекту?',
      answer: 'Ви можете: 1) Створити issue з баг репортом або пропозицією, 2) Зробити pull request з покращеннями, 3) Поділитися проектом з іншими, 4) Написати статтю або туторіал. Детальніше в CONTRIBUTING.md.'
    },
    {
      question: 'Де зберігаються помилки?',
      answer: 'Помилки зберігаються в пам\'яті браузера (в масиві JavaScript). Вони не зберігаються між перезавантаженнями сторінки. Для постійного збереження використовуйте autoReport для відправки на сервер.'
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">❓ Часті питання (FAQ)</h1>
          <p className="text-lg text-gray-600">
            Відповіді на найпоширеніші питання про DevHelper
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-bold text-left">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">Не знайшли відповідь?</h3>
          <p className="text-gray-700 mb-4">
            Якщо у вас є інше питання, створіть issue на GitHub або напишіть в Discussions.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/your-username/devhelper/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Створити Issue
            </a>
            <a
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
            >
              На головну
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
