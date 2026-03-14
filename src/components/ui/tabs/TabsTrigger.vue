<script setup lang="ts">
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue';
import { cn } from '@/lib/utils';
import { getTriggerClass } from './index';

const props = defineProps<TabsTriggerProps & { class?: string }>();
const forwarded = useForwardProps(props);
</script>

<template>
  <TabsTrigger
    v-bind="forwarded"
    :class="cn(getTriggerClass(), props.class)"
  >
    <slot />
  </TabsTrigger>
</template>
