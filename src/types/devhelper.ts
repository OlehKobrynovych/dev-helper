export interface DevHelperConfig {
  apiKey: string;
  projectId: string;
  devMode?: boolean;
  autoReport?: boolean;
  reportEndpoint?: string;
  baseUrl?: string;
}

export interface ConsoleError {
  type: "error" | "warning" | "info";
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  fileName?: string;
  aiAnalysis?: string;
  suggestions?: string[];
  severity?: "critical" | "high" | "medium" | "low";
  category?: "syntax" | "runtime" | "network" | "type" | "logic";
}

export interface ErrorReport {
  projectId: string;
  errors: ConsoleError[];
  userAgent: string;
  url: string;
  timestamp: number;
}

export interface AnalysisResult {
  totalErrors: number;
  totalWarnings: number;
  errors: ConsoleError[];
  suggestions: string[];
}
