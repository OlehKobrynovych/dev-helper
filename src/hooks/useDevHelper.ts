"use client";

import { useEffect } from "react";
import type { DevHelperConfig } from "@/types/devhelper";

declare global {
  interface Window {
    DevHelper?: {
      init: (config: DevHelperConfig) => any;
    };
  }
}

export function useDevHelper(config: DevHelperConfig) {
  useEffect(() => {
    // Завантажуємо скрипт
    const script = document.createElement("script");
    script.src = "/api/devhelper/script";
    script.async = true;

    script.onload = () => {
      // Ініціалізуємо DevHelper після завантаження скрипта
      if (window.DevHelper) {
        // Додаємо baseUrl з поточного origin
        window.DevHelper.init({
          ...config,
          baseUrl: window.location.origin,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Очищаємо скрипт при unmount
      document.body.removeChild(script);
    };
  }, [config]);

  // Повертаємо порожній об'єкт, оскільки вся логіка тепер в скрипті
  return {};
}
