import '@testing-library/jest-dom/vitest';
import { createMemoryStorage, shouldMockStorage } from './storage-mock';

function ensureStorageMock(name: 'localStorage' | 'sessionStorage') {
  if (!shouldMockStorage(globalThis, name)) {
    return;
  }

  // Node 25 may expose a partial storage object that breaks jsdom-based tests.
  const storage = createMemoryStorage();

  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: storage,
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      configurable: true,
      value: storage,
    });
  }
}

ensureStorageMock('localStorage');
ensureStorageMock('sessionStorage');
