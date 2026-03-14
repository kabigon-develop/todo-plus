// Tests run in node environment (matching project convention)
// document.documentElement is mocked below for classList tests
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUiStore } from '../../src/stores/ui';

// Minimal classList mock for node environment
function makeClassList() {
  const classes = new Set<string>();
  return {
    add: (cls: string) => classes.add(cls),
    remove: (cls: string) => classes.delete(cls),
    contains: (cls: string) => classes.has(cls),
    toggle: (cls: string, force?: boolean) => {
      if (force === true) classes.add(cls);
      else if (force === false) classes.delete(cls);
      else if (classes.has(cls)) classes.delete(cls);
      else classes.add(cls);
      return classes.has(cls);
    }
  };
}

describe('useUiStore - theme', () => {
  let mockClassList: ReturnType<typeof makeClassList>;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockClassList = makeClassList();
    // Patch globalThis.document for the store
    (globalThis as any).document = {
      documentElement: { classList: mockClassList }
    };
  });

  it('初始 theme 为 light', () => {
    const store = useUiStore();
    expect(store.theme).toBe('light');
  });

  it('toggleTheme 切换为 dark', () => {
    const store = useUiStore();
    store.toggleTheme();
    expect(store.theme).toBe('dark');
    store.toggleTheme();
    expect(store.theme).toBe('light');
  });

  it('toggleTheme 写入 localStorage', () => {
    const store = useUiStore();
    store.toggleTheme();
    expect(localStorage.getItem('theme')).toBe('dark');
    store.toggleTheme();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggleTheme 更新 html classList', () => {
    const store = useUiStore();
    store.toggleTheme();
    expect(mockClassList.contains('dark')).toBe(true);
    store.toggleTheme();
    expect(mockClassList.contains('dark')).toBe(false);
  });

  it('hydrateTheme 从 classList 读取 dark 状态', () => {
    const store = useUiStore();
    mockClassList.add('dark');
    store.hydrateTheme();
    expect(store.theme).toBe('dark');

    mockClassList.remove('dark');
    store.hydrateTheme();
    expect(store.theme).toBe('light');
  });

  it('hydrateTheme 不修改 classList', () => {
    const store = useUiStore();
    // 当 html 有 dark class 时，hydrateTheme 不应修改它
    mockClassList.add('dark');
    store.hydrateTheme();
    expect(mockClassList.contains('dark')).toBe(true);

    // 当 html 无 dark class 时，hydrateTheme 不应添加它
    mockClassList.remove('dark');
    store.hydrateTheme();
    expect(mockClassList.contains('dark')).toBe(false);
  });
});
