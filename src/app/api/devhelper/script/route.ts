import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Читаємо всі модулі
  const modulesDir = join(
    process.cwd(),
    "src/app/api/devhelper/script/modules"
  );

  const coreModule = readFileSync(join(modulesDir, "core.js"), "utf-8");
  const errorsTabModule = readFileSync(
    join(modulesDir, "errors-tab.js"),
    "utf-8"
  );
  const performanceTabModule = readFileSync(
    join(modulesDir, "performance-tab.js"),
    "utf-8"
  );
  const codeAnalysisTabModule = readFileSync(
    join(modulesDir, "code-analysis-tab.js"),
    "utf-8"
  );
  const testingTabModule = readFileSync(
    join(modulesDir, "testing-tab.js"),
    "utf-8"
  );
  const modalModule = readFileSync(join(modulesDir, "modal.js"), "utf-8");

  // Видаляємо import/export statements для браузера
  const cleanModule = (code: string) => {
    return code
      .replace(/^export\s+/gm, "")
      .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
  };

  const script = `
(function() {
  'use strict';
  
  // ============================================
  // CORE MODULE - Базова логіка перехоплення помилок
  // ============================================
  ${cleanModule(coreModule)}
  
  // ============================================
  // ERRORS TAB MODULE - Відображення помилок
  // ============================================
  ${cleanModule(errorsTabModule)}
  
  // ============================================
  // PERFORMANCE TAB MODULE - Моніторинг продуктивності
  // ============================================
  ${cleanModule(performanceTabModule)}
  
  // ============================================
  // CODE ANALYSIS TAB MODULE - Аналіз коду
  // ============================================
  ${cleanModule(codeAnalysisTabModule)}
  
  // ============================================
  // TESTING TAB MODULE - Тестування помилок
  // ============================================
  ${cleanModule(testingTabModule)}
  
  // ============================================
  // MODAL MODULE - UI модального вікна
  // ============================================
  ${cleanModule(modalModule)}
  
  // ============================================
  // MAIN - Головна логіка ініціалізації
  // ============================================
  window.DevHelper = {
    init: function(config) {
      if (!config.apiKey || !config.projectId) {
        console.error('DevHelper: apiKey and projectId are required');
        return;
      }

      const baseUrl = '${baseUrl}';
      
      // Ініціалізуємо core
      const core = createDevHelperCore(config, baseUrl);
      
      // Dev mode widget
      if (config.devMode) {
        const modal = createModal(core, baseUrl, config);
        const floatingButton = createFloatingButton(modal);
        
        // Оновлюємо badge кожну секунду
        setInterval(function() {
          floatingButton.updateBadge(core.getErrors().length);
        }, 1000);
      }

      // Public API
      return {
        getErrors: core.getErrors,
        clearErrors: core.clearErrors,
        sendReport: core.sendReport,
        downloadReport: core.downloadReport,
        analyzeWithAI: core.analyzeWithAI,
      };
    }
  };
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
