<script setup lang="ts">
import { type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div
    :class="cn('rounded-xl border border-border bg-surface-card text-foreground shadow-sm', $props.class)"
  >
    <slot />
  </div>
</template>
