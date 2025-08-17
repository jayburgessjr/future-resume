import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock window.print
Object.assign(window, {
  print: vi.fn(),
});

// Mock URL.createObjectURL and revokeObjectURL
Object.assign(window.URL, {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
});