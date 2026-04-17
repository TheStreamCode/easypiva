import { describe, expect, it } from 'vitest';
import { createMemoryStorage, shouldMockStorage } from './storage-mock';

describe('shouldMockStorage', () => {
  it('treats getter-based storage descriptors as unsafe without invoking them', () => {
    const target = {};
    let getterCalls = 0;

    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      get() {
        getterCalls += 1;
        return createMemoryStorage();
      },
    });

    expect(shouldMockStorage(target, 'localStorage')).toBe(true);
    expect(getterCalls).toBe(0);
  });

  it('keeps value-based storage objects that already implement the Storage API', () => {
    const target = {};

    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });

    expect(shouldMockStorage(target, 'localStorage')).toBe(false);
  });

  it('mocks storage when no descriptor is present', () => {
    expect(shouldMockStorage({}, 'sessionStorage')).toBe(true);
  });
});
