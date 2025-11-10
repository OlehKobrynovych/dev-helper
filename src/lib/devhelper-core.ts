import type {
  DevHelperConfig,
  ConsoleError,
  ErrorReport,
} from "@/types/devhelper";

export class DevHelperCore {
  private config: DevHelperConfig;
  private errors: ConsoleError[] = [];
  private originalConsole: {
    error: typeof console.error;
    warn: typeof console.warn;
    log: typeof console.log;
  };

  constructor(config: DevHelperConfig) {
    this.config = config;
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
    };
    this.init();
  }

  private init() {
    this.interceptConsole();
    this.interceptErrors();

    if (this.config.autoReport) {
      this.setupAutoReport();
    }
  }

  private interceptConsole() {
    console.error = (...args: any[]) => {
      this.captureError("error", args);
      this.originalConsole.error(...args);
    };

    console.warn = (...args: any[]) => {
      this.captureError("warning", args);
      this.originalConsole.warn(...args);
    };
  }

  private interceptErrors() {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.captureError("error", [event.message], {
          stack: event.error?.stack,
          url: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        });
      });

      window.addEventListener("unhandledrejection", (event) => {
        this.captureError("error", [event.reason]);
      });
    }
  }

  private extractFileInfo(stack?: string): {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
    fileName?: string;
  } {
    if (!stack) return {};

    // Шукаємо перший рядок з інформацією про файл
    const lines = stack.split("\n");
    for (const line of lines) {
      // Формати: "at functionName (file.js:10:5)" або "file.js:10:5"
      const match = line.match(/(?:at\s+.*?\()?([^()]+):(\d+):(\d+)\)?/);
      if (match) {
        const [, url, lineNumber, columnNumber] = match;
        const fileName = url.split("/").pop()?.split("?")[0];
        return {
          url: url.trim(),
          lineNumber: parseInt(lineNumber, 10),
          columnNumber: parseInt(columnNumber, 10),
          fileName,
        };
      }
    }
    return {};
  }

  private captureError(
    type: "error" | "warning" | "info",
    args: any[],
    extra?: Partial<ConsoleError>
  ) {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");

    // Створюємо stack trace якщо його немає
    const stack = extra?.stack || new Error().stack;
    const fileInfo = this.extractFileInfo(stack);

    const error: ConsoleError = {
      type,
      message,
      timestamp: Date.now(),
      stack,
      ...fileInfo,
      ...extra,
    };

    this.errors.push(error);
  }

  private setupAutoReport() {
    if (typeof window !== "undefined") {
      setInterval(() => {
        if (this.errors.length > 0) {
          this.sendReport();
        }
      }, 60000); // Кожну хвилину
    }
  }

  public getErrors(): ConsoleError[] {
    return [...this.errors];
  }

  public clearErrors() {
    this.errors = [];
  }

  public async sendReport(): Promise<void> {
    if (this.errors.length === 0) return;

    const report: ErrorReport = {
      projectId: this.config.projectId,
      errors: this.errors,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: Date.now(),
    };

    try {
      const endpoint = this.config.reportEndpoint || "/api/devhelper/report";
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      this.originalConsole.error("DevHelper: Failed to send report", error);
    }
  }

  public destroy() {
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.log = this.originalConsole.log;
  }
}
