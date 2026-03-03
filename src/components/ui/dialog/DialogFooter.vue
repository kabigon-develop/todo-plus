<script setup lang="ts">
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    class?: string;
  }>(),
  { class: '' }
);
</script>

<template>
  <div :class="cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', $props.class)">
    <slot />
  </div>
</template>
