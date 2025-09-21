// Global type definitions for external APIs and libraries

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | object,
      config?: object
    ) => void;
  }

  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
      getTags(): Promise<string[]>;
    };
  }

  // Test globals
  declare var test: typeof import('vitest').test;
  declare var expect: typeof import('vitest').expect;
  declare var describe: typeof import('vitest').describe;
  declare var beforeEach: typeof import('vitest').beforeEach;
  declare var afterEach: typeof import('vitest').afterEach;
  declare var vi: typeof import('vitest').vi;
}

export {};