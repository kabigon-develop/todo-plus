<script setup lang="ts">
import { DialogContent, DialogOverlay, DialogPortal, type DialogContentProps, useForwardProps } from 'radix-vue';
import { cn } from '@/utils';
import { getDialogContentClass, getDialogOverlayClass } from './index';

const props = defineProps<DialogContentProps & { class?: string }>();
const forwarded = useForwardProps(props);
</script>

<template>
  <DialogPortal>
    <DialogOverlay :class="getDialogOverlayClass()" />
    <DialogContent
      v-bind="forwarded"
      :class="cn(getDialogContentClass(), props.class)"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
