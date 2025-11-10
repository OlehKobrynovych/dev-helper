"use client";

import { useEffect, useState } from "react";
import { DevHelperCore } from "@/lib/devhelper-core";
import type { DevHelperConfig, ConsoleError } from "@/types/devhelper";

export function useDevHelper(config: DevHelperConfig) {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [helper, setHelper] = useState<DevHelperCore | null>(null);

  useEffect(() => {
    const devHelper = new DevHelperCore(config);
    setHelper(devHelper);

    const interval = setInterval(() => {
      setErrors(devHelper.getErrors());
    }, 1000);

    return () => {
      clearInterval(interval);
      devHelper.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ініціалізуємо тільки один раз

  const clearErrors = () => {
    helper?.clearErrors();
    setErrors([]);
  };

  const analyzeError = async (errorIndex: number) => {
    if (errorIndex < 0 || errorIndex >= errors.length) return;

    const errorToAnalyze = errors[errorIndex];

    try {
      const response = await fetch("/api/devhelper/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
        body: JSON.stringify({ errors: [errorToAnalyze] }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze error");
      }

      const data = await response.json();

      if (data.success && data.analyzedErrors && data.analyzedErrors[0]) {
        // Оновлюємо тільки цю помилку
        const updatedErrors = [...errors];
        updatedErrors[errorIndex] = data.analyzedErrors[0];
        setErrors(updatedErrors);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw error;
    }
  };

  const downloadReport = () => {
    const report = generateMarkdownReport(errors);
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devhelper-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analyzeWithAI = async () => {
    if (errors.length === 0) return;

    try {
      const response = await fetch("/api/devhelper/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
        body: JSON.stringify({ errors }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze errors");
      }

      const data = await response.json();

      if (data.success && data.analyzedErrors) {
        // Оновлюємо помилки з AI аналізом
        setErrors(data.analyzedErrors);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert(
        "Не вдалося проаналізувати помилки. Перевірте консоль для деталей."
      );
    }
  };

  return {
    errors,
    clearErrors,
    downloadReport,
    analyzeWithAI,
    analyzeError,
    sendReport: () => helper?.sendReport(),
  };
}

function generateMarkdownReport(errors: ConsoleError[]): string {
  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;

  let report = `# DevHelper Report\n\n`;
  report += `**Дата:** ${new Date().toLocaleString("uk-UA")}\n\n`;
  report += `## Статистика\n\n`;
  report += `- Всього проблем: ${errors.length}\n`;
  report += `- Помилок: ${errorCount}\n`;
  report += `- Попереджень: ${warningCount}\n\n`;

  if (errorCount > 0) {
    report += `## Помилки\n\n`;
    errors
      .filter((e) => e.type === "error")
      .forEach((error, index) => {
        report += `### ${index + 1}. ${error.message}\n\n`;
        if (error.stack) {
          report += `\`\`\`\n${error.stack}\n\`\`\`\n\n`;
        }
        report += `**Час:** ${new Date(error.timestamp).toLocaleString("uk-UA")}\n\n`;
        if (error.url) {
          report += `**Файл:** ${error.url}:${error.lineNumber || 0}\n\n`;
        }
        report += `**Рекомендації:**\n`;
        report += getSuggestions(error.message);
        report += `\n---\n\n`;
      });
  }

  if (warningCount > 0) {
    report += `## Попередження\n\n`;
    errors
      .filter((e) => e.type === "warning")
      .forEach((error, index) => {
        report += `### ${index + 1}. ${error.message}\n\n`;
        report += `**Час:** ${new Date(error.timestamp).toLocaleString("uk-UA")}\n\n`;
        report += `**Рекомендації:**\n`;
        report += getSuggestions(error.message);
        report += `\n---\n\n`;
      });
  }

  return report;
}

function getSuggestions(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("undefined") || lowerMessage.includes("null")) {
    return `- Перевірте чи змінна ініціалізована перед використанням\n- Використовуйте optional chaining (?.) для безпечного доступу\n- Додайте перевірку на null/undefined\n`;
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return `- Перевірте інтернет з'єднання\n- Додайте обробку помилок для мережевих запитів\n- Перевірте CORS налаштування\n- Додайте retry логіку для запитів\n`;
  }

  if (lowerMessage.includes("syntax")) {
    return `- Перевірте синтаксис коду\n- Переконайтесь що всі дужки закриті\n- Перевірте коми та крапки з комою\n`;
  }

  if (lowerMessage.includes("type")) {
    return `- Перевірте типи даних\n- Використовуйте TypeScript для кращої типізації\n- Додайте валідацію вхідних даних\n`;
  }

  return `- Перегляньте stack trace для деталей\n- Перевірте документацію\n- Додайте логування для відстеження проблеми\n`;
}
