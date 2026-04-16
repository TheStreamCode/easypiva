import '@testing-library/jest-dom/vitest';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
  };
}

function ensureStorageMock(name: 'localStorage' | 'sessionStorage') {
  const existing = globalThis[name];
  if (existing && typeof existing.clear === 'function') {
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
