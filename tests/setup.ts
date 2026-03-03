import { afterEach, beforeEach } from 'vitest';

class MemoryStorage {
  private map = new Map<string, string>();

  clear() {
    this.map.clear();
  }

  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.map.delete(key);
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  get length() {
    return this.map.size;
  }
}

beforeEach(() => {
  if (!(globalThis as any).localStorage) {
    (globalThis as any).localStorage = new MemoryStorage();
  }
});

afterEach(() => {
  localStorage.clear();
});
