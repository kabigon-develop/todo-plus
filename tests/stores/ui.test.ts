// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUiStore } from '../../src/stores/ui';

describe('useUiStore - theme', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.documentElement.classList.remove('dark');
    localStorage.clear();
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
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    store.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('hydrateTheme 从 classList 读取 dark 状态', () => {
    const store = useUiStore();
    document.documentElement.classList.add('dark');
    store.hydrateTheme();
    expect(store.theme).toBe('dark');

    document.documentElement.classList.remove('dark');
    store.hydrateTheme();
    expect(store.theme).toBe('light');
  });

  it('hydrateTheme 不修改 classList', () => {
    const store = useUiStore();
    // 当 html 有 dark class 时，hydrateTheme 不应修改它
    document.documentElement.classList.add('dark');
    store.hydrateTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // 当 html 无 dark class 时，hydrateTheme 不应添加它
    document.documentElement.classList.remove('dark');
    store.hydrateTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
