import { createJSONStorage, type StateStorage } from 'zustand/middleware';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStorageItem(key: string): string | null {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): boolean {
  const storage = getLocalStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key: string): boolean {
  const storage = getLocalStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const safeStateStorage: StateStorage = {
  getItem: (name) => readStorageItem(name),
  setItem: (name, value) => {
    writeStorageItem(name, value);
  },
  removeItem: (name) => {
    removeStorageItem(name);
  },
};

export function createSafePersistStorage<T>() {
  return createJSONStorage<T>(() => safeStateStorage);
}
