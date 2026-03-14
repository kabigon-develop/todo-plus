export { default as Tabs } from './Tabs.vue';
export { default as TabsList } from './TabsList.vue';
export { default as TabsTrigger } from './TabsTrigger.vue';
export { default as TabsContent } from './TabsContent.vue';

export function getTriggerClass() {
  return "relative inline-flex items-center justify-center whitespace-nowrap rounded-none px-3 py-1.5 text-sm font-medium text-muted ring-offset-surface-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:content-[''] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity after:duration-200 data-[state=active]:text-primary-text data-[state=active]:font-semibold data-[state=active]:after:opacity-100";
}
