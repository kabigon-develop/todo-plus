<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    submitText?: string;
    cancelText?: string;
  }>(),
  {
    description: '',
    submitText: '保存',
    cancelText: '取消'
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [];
}>();
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <div class="mt-4">
        <slot />
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="emit('update:open', false)">{{ cancelText }}</Button>
        <Button @click="emit('submit')">{{ submitText }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
