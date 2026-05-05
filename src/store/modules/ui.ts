import { defineStore } from 'pinia';

export type MainTab = 'todo' | 'idea' | 'dashboard';
export type Theme = 'light' | 'dark';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeTab: 'todo' as MainTab,
    theme: 'light' as Theme
  }),
  actions: {
    setTab(tab: MainTab) {
      this.activeTab = tab;
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      const isDark = this.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      try {
        localStorage.setItem('theme', this.theme);
      } catch (e) {
        // localStorage may be unavailable
      }
    },
    hydrateTheme() {
      this.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
  }
});
