import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    if (typeof received !== 'number') {
      return {
        pass: false,
        message: () => `Expected ${received} to be a number`,
      };
    }
    if (received < floor || received > ceiling) {
      return {
        pass: false,
        message: () => `Expected ${received} to be between ${floor} and ${ceiling}`,
      };
    }
    return {
      pass: true,
      message: () => `Expected ${received} to be between ${floor} and ${ceiling}`,
    };
  },
});