<script setup lang="ts">
import { TabsContent, type TabsContentProps, useForwardProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<TabsContentProps & { class?: string }>();
const forwarded = useForwardProps(props);
</script>

<template>
  <TabsContent
    v-bind="forwarded"
    :class="cn('mt-4 ring-offset-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2', props.class)"
  >
    <slot />
  </TabsContent>
</template>
