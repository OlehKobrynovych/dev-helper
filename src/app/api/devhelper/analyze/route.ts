import { NextRequest, NextResponse } from "next/server";
import type { ConsoleError } from "@/types/devhelper";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { errors } = (await request.json()) as { errors: ConsoleError[] };

    if (!errors || errors.length === 0) {
      return NextResponse.json(
        { error: "No errors provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Аналізуємо помилки з AI
    const analyzedErrors = await analyzeErrorsWithAI(errors);

    return NextResponse.json(
      {
        success: true,
        analyzedErrors,
        timestamp: Date.now(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error analyzing errors:", error);
    return NextResponse.json(
      { error: "Failed to analyze errors" },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function analyzeErrorsWithAI(errors: ConsoleError[]) {
  // Визначаємо який AI провайдер використовувати
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Якщо немає жодного ключа, використовуємо базовий аналіз
  if (!groqKey && !geminiKey && !openaiKey) {
    console.log("No AI provider configured, using basic analysis");
    return errors.map((error) => ({
      ...error,
      aiAnalysis: getBasicAnalysis(error),
      suggestions: getBasicSuggestions(error.message),
    }));
  }

  // Вибираємо провайдера (пріоритет: Groq > Gemini > OpenAI)
  let provider: "groq" | "gemini" | "openai" = "openai";
  let apiKey = openaiKey;

  if (groqKey) {
    provider = "groq";
    apiKey = groqKey;
  } else if (geminiKey) {
    provider = "gemini";
    apiKey = geminiKey;
  }

  console.log(`Using AI provider: ${provider}`);

  // Використовуємо AI для детального аналізу
  try {
    const analyzedErrors = await Promise.all(
      errors.map(async (error) => {
        let analysis;

        switch (provider) {
          case "groq":
            analysis = await analyzeWithGroq(error, apiKey!);
            break;
          case "gemini":
            analysis = await analyzeWithGemini(error, apiKey!);
            break;
          case "openai":
            analysis = await analyzeWithOpenAI(error, apiKey!);
            break;
        }

        return {
          ...error,
          aiAnalysis: analysis.explanation,
          suggestions: analysis.suggestions,
          severity: analysis.severity,
          category: analysis.category,
        };
      })
    );

    return analyzedErrors;
  } catch (error) {
    console.error(`${provider} analysis failed, using basic analysis:`, error);
    return errors.map((error) => ({
      ...error,
      aiAnalysis: getBasicAnalysis(error),
      suggestions: getBasicSuggestions(error.message),
    }));
  }
}

// ============================================
// GROQ (БЕЗКОШТОВНИЙ! Рекомендую)
// ============================================
async function analyzeWithGroq(error: ConsoleError, apiKey: string) {
  const prompt = createPrompt(error);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Безкоштовна модель!
        messages: [
          {
            role: "system",
            content:
              "Ти експерт з JavaScript/TypeScript, який аналізує помилки та надає практичні поради українською мовою. Відповідай тільки у форматі JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = await response.json();
  return parseAIResponse(data.choices[0]?.message?.content);
}

// ============================================
// GOOGLE GEMINI (БЕЗКОШТОВНИЙ ЛІМІТ)
// ============================================
async function analyzeWithGemini(error: ConsoleError, apiKey: string) {
  const prompt = createPrompt(error);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Ти експерт з JavaScript/TypeScript. ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseAIResponse(content);
}

// ============================================
// OPENAI (ПЛАТНИЙ)
// ============================================
async function analyzeWithOpenAI(error: ConsoleError, apiKey: string) {
  const prompt = createPrompt(error);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ти експерт з JavaScript/TypeScript, який аналізує помилки та надає практичні поради українською мовою. Відповідай тільки у форматі JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  return parseAIResponse(data.choices[0]?.message?.content);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createPrompt(error: ConsoleError): string {
  return `Проаналізуй цю JavaScript/TypeScript помилку та надай детальні рекомендації українською мовою:

Тип: ${error.type}
Повідомлення: ${error.message}
${error.stack ? `Stack trace: ${error.stack.slice(0, 500)}` : ""}
${error.url ? `URL: ${error.url}` : ""}
${error.lineNumber ? `Рядок: ${error.lineNumber}` : ""}

Надай відповідь у форматі JSON:
{
  "explanation": "Детальне пояснення причини помилки",
  "suggestions": ["Порада 1", "Порада 2", "Порада 3"],
  "severity": "critical|high|medium|low",
  "category": "syntax|runtime|network|type|logic"
}`;
}

function parseAIResponse(content: string | undefined) {
  if (!content) {
    throw new Error("No content in AI response");
  }

  // Парсимо JSON відповідь
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Invalid JSON in AI response");
}

function getBasicAnalysis(error: ConsoleError): string {
  const message = error.message.toLowerCase();

  if (message.includes("undefined") || message.includes("null")) {
    return "Помилка виникла через спробу доступу до властивості undefined або null значення. Це одна з найпоширеніших помилок у JavaScript.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("cors")
  ) {
    return "Помилка мережевого запиту. Можливо, сервер недоступний, або виникла проблема з CORS політикою.";
  }

  if (message.includes("syntax")) {
    return "Синтаксична помилка в коді. Перевірте правильність написання коду, закриття дужок та ком.";
  }

  if (message.includes("type")) {
    return "Помилка типу даних. Операція виконується над неправильним типом даних.";
  }

  if (message.includes("is not a function")) {
    return "Спроба викликати щось, що не є функцією. Перевірте чи змінна дійсно містить функцію.";
  }

  return "Виникла помилка під час виконання коду. Перегляньте stack trace для деталей.";
}

function getBasicSuggestions(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const suggestions: string[] = [];

  if (lowerMessage.includes("undefined") || lowerMessage.includes("null")) {
    suggestions.push(
      "Використовуйте optional chaining: obj?.property замість obj.property"
    );
    suggestions.push("Додайте перевірку: if (obj && obj.property) { ... }");
    suggestions.push("Ініціалізуйте змінні значеннями за замовчуванням");
    suggestions.push(
      "Використовуйте nullish coalescing: value ?? defaultValue"
    );
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    suggestions.push("Перевірте інтернет з'єднання");
    suggestions.push(
      "Додайте обробку помилок: try/catch для async/await або .catch() для promises"
    );
    suggestions.push("Перевірте CORS налаштування на сервері");
    suggestions.push("Додайте retry логіку для повторних спроб");
    suggestions.push("Перевірте правильність URL та endpoint");
  }

  if (lowerMessage.includes("syntax")) {
    suggestions.push("Перевірте чи всі дужки закриті: (), [], {}");
    suggestions.push("Перевірте коми між елементами масиву/об'єкта");
    suggestions.push("Перевірте крапки з комою в кінці виразів");
    suggestions.push(
      "Використовуйте linter (ESLint) для автоматичної перевірки"
    );
  }

  if (lowerMessage.includes("type")) {
    suggestions.push("Використовуйте TypeScript для кращої типізації");
    suggestions.push("Додайте валідацію вхідних даних");
    suggestions.push(
      "Перевірте типи даних перед операціями: typeof, instanceof"
    );
    suggestions.push("Використовуйте type guards для перевірки типів");
  }

  if (lowerMessage.includes("is not a function")) {
    suggestions.push(
      'Перевірте чи змінна дійсно містить функцію: typeof fn === "function"'
    );
    suggestions.push("Перевірте правильність імпорту функції");
    suggestions.push("Переконайтесь що функція визначена до її виклику");
    suggestions.push("Перевірте чи не перезаписали ви функцію іншим значенням");
  }

  if (suggestions.length === 0) {
    suggestions.push("Перегляньте stack trace для визначення місця помилки");
    suggestions.push("Додайте console.log для відстеження значень змінних");
    suggestions.push("Використовуйте debugger для покрокового виконання");
    suggestions.push("Перевірте документацію використовуваних бібліотек");
    suggestions.push("Пошукайте схожі помилки на Stack Overflow");
  }

  return suggestions;
}
