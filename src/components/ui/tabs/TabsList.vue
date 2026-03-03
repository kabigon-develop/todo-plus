<script setup lang="ts">
import { TabsList, type TabsListProps, useForwardProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<TabsListProps & { class?: string }>();
const forwarded = useForwardProps(props);
</script>

<template>
  <TabsList
    v-bind="forwarded"
    :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500', props.class)"
  >
    <slot />
  </TabsList>
</template>
