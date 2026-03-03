<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Priority } from '@/stores/types';

defineProps<{
  form: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
    tags: string;
  };
  titleError?: string;
  priorityOptions: Array<{ label: string; value: string }>;
}>();
</script>

<template>
  <div class="grid gap-3">
    <div class="space-y-1">
      <Input v-model="form.title" placeholder="任务标题" />
      <p v-if="titleError" class="text-xs text-red-500">{{ titleError }}</p>
    </div>
    <Input v-model="form.description" placeholder="任务描述" />
    <div class="grid gap-3 md:grid-cols-2">
      <Select v-model="form.priority" :options="priorityOptions" />
      <Input v-model="form.dueDate" type="date" />
    </div>
    <Input v-model="form.tags" placeholder="标签（逗号分隔）" />
  </div>
</template>
