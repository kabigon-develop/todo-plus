import { defineStore } from 'pinia';

export type MainTab = 'todo' | 'idea';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeTab: 'todo' as MainTab
  }),
  actions: {
    setTab(tab: MainTab) {
      this.activeTab = tab;
    }
  }
});
