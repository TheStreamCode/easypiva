export function createMemoryStorage(): Storage {
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

export function shouldMockStorage(
  target: object,
  name: 'localStorage' | 'sessionStorage',
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(target, name);

  if (!descriptor) {
    return true;
  }

  if ('value' in descriptor) {
    return typeof descriptor.value?.clear !== 'function';
  }

  return true;
}
