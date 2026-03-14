<script setup lang="ts">
import { DialogContent, DialogOverlay, DialogPortal, type DialogContentProps, useForwardProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<DialogContentProps & { class?: string }>();
const forwarded = useForwardProps(props);
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-[--overlay]" />
    <DialogContent
      v-bind="forwarded"
      :class="cn('fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-elevated p-6 shadow-lg ring-offset-surface-card', props.class)"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
