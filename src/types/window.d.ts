import type { DevHelperConfig, ConsoleError } from "./devhelper";

declare global {
  interface Window {
    DevHelper?: {
      init: (config: DevHelperConfig) => {
        getErrors: () => ConsoleError[];
        clearErrors: () => void;
        sendReport: () => Promise<void>;
        downloadReport: () => void;
      };
    };
  }
}

export {};
