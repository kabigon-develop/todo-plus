<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormDialog from '@/components/forms/FormDialog.vue';
import TodoFormFields from '@/components/forms/TodoFormFields.vue';
import IdeaFormFields from '@/components/forms/IdeaFormFields.vue';
import {
  buildCalendarWeeks,
  buildMonthlyDashboard,
  getDailyMetricMax,
  shiftMonth
} from '@/lib/dashboard';
import { useIdeaStore } from '@/stores/idea';
import { useTodoStore } from '@/stores/todo';
import type { Idea, IdeaStatus, Priority, Todo, TodoFilter } from '@/stores/types';
import { useUiStore, type MainTab } from '@/stores/ui';

type DialogType = 'todo-create' | 'todo-edit' | 'idea-create' | 'idea-edit' | null;

const todoStore = useTodoStore();
const ideaStore = useIdeaStore();
const uiStore = useUiStore();

onMounted(() => {
  todoStore.hydrate();
  ideaStore.hydrate();
});

const todoForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as Priority,
  dueDate: '',
  tags: ''
});

const ideaForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as Priority,
  tags: ''
});

const todoErrors = reactive({ title: '' });
const ideaErrors = reactive({ title: '' });

const dialogOpen = ref(false);
const dialogType = ref<DialogType>(null);
const editingTodoId = ref<string | null>(null);
const editingIdeaId = ref<string | null>(null);
const dashboardCursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const showFloatingLegend = ref(true);

const draggedIdeaId = ref<string | null>(null);
const hasSelected = computed(() => todoStore.selectedIds.length > 0);

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
];

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' }
];

const splitTags = (raw: string) => raw.split(',').map((item) => item.trim()).filter(Boolean);

const resetTodoForm = () => {
  todoForm.title = '';
  todoForm.description = '';
  todoForm.priority = 'medium';
  todoForm.dueDate = '';
  todoForm.tags = '';
  todoErrors.title = '';
};

const resetIdeaForm = () => {
  ideaForm.title = '';
  ideaForm.description = '';
  ideaForm.priority = 'medium';
  ideaForm.tags = '';
  ideaErrors.title = '';
};

const closeDialog = () => {
  dialogOpen.value = false;
  dialogType.value = null;
  editingTodoId.value = null;
  editingIdeaId.value = null;
  resetTodoForm();
  resetIdeaForm();
};

const openTodoCreate = () => {
  resetTodoForm();
  dialogType.value = 'todo-create';
  dialogOpen.value = true;
};

const openTodoEdit = (item: Todo) => {
  resetTodoForm();
  editingTodoId.value = item.id;
  todoForm.title = item.title;
  todoForm.description = item.description;
  todoForm.priority = item.priority;
  todoForm.dueDate = item.dueDate;
  todoForm.tags = item.tags.join(', ');
  dialogType.value = 'todo-edit';
  dialogOpen.value = true;
};

const openIdeaCreate = () => {
  resetIdeaForm();
  dialogType.value = 'idea-create';
  dialogOpen.value = true;
};

const openIdeaEdit = (item: Idea) => {
  resetIdeaForm();
  editingIdeaId.value = item.id;
  ideaForm.title = item.title;
  ideaForm.description = item.description;
  ideaForm.priority = item.priority;
  ideaForm.tags = item.tags.join(', ');
  dialogType.value = 'idea-edit';
  dialogOpen.value = true;
};

const validateTodoForm = () => {
  todoErrors.title = '';
  if (!todoForm.title.trim()) {
    todoErrors.title = '请输入任务标题';
    return false;
  }
  return true;
};

const validateIdeaForm = () => {
  ideaErrors.title = '';
  if (!ideaForm.title.trim()) {
    ideaErrors.title = '请输入想法标题';
    return false;
  }
  return true;
};

const submitTodoForm = () => {
  if (!validateTodoForm()) return;

  const payload = {
    title: todoForm.title.trim(),
    description: todoForm.description.trim(),
    priority: todoForm.priority,
    dueDate: todoForm.dueDate,
    tags: splitTags(todoForm.tags)
  };

  if (dialogType.value === 'todo-create') {
    todoStore.addTodo(payload);
    closeDialog();
    return;
  }

  if (dialogType.value === 'todo-edit' && editingTodoId.value) {
    todoStore.updateTodo(editingTodoId.value, payload);
    closeDialog();
  }
};

const submitIdeaForm = () => {
  if (!validateIdeaForm()) return;

  const payload = {
    title: ideaForm.title.trim(),
    description: ideaForm.description.trim(),
    priority: ideaForm.priority,
    tags: splitTags(ideaForm.tags)
  };

  if (dialogType.value === 'idea-create') {
    ideaStore.addIdea(payload);
    closeDialog();
    return;
  }

  if (dialogType.value === 'idea-edit' && editingIdeaId.value) {
    ideaStore.updateIdea(editingIdeaId.value, payload);
    closeDialog();
  }
};

const submitDialog = () => {
  if (dialogType.value === 'todo-create' || dialogType.value === 'todo-edit') {
    submitTodoForm();
    return;
  }
  submitIdeaForm();
};

const statusLabel = (status: IdeaStatus) => {
  if (status === 'idea') return '想法';
  if (status === 'evaluate') return '评估';
  return '执行';
};

const priorityVariant = (priority: Priority) => {
  if (priority === 'high') return 'destructive';
  if (priority === 'medium') return 'warning';
  return 'success';
};

const priorityText = (priority: Priority) => {
  if (priority === 'high') return '高';
  if (priority === 'medium') return '中';
  return '低';
};

const onDragStart = (ideaId: string) => {
  draggedIdeaId.value = ideaId;
};

const onDropLane = (status: IdeaStatus) => {
  if (!draggedIdeaId.value) return;
  const index = ideaStore.byStatus[status].length;
  ideaStore.moveIdeaDrag(draggedIdeaId.value, status, index);
  draggedIdeaId.value = null;
};

const convertIdea = (id: string) => {
  ideaStore.convertToTodo(id, todoStore);
};

const statuses: IdeaStatus[] = ['idea', 'evaluate', 'execute'];

const dialogTitle = computed(() => {
  if (dialogType.value === 'todo-create') return '新增任务';
  if (dialogType.value === 'todo-edit') return '编辑任务';
  if (dialogType.value === 'idea-create') return '新增想法';
  return '编辑想法';
});

const dialogDescription = computed(() => {
  if (dialogType.value?.startsWith('todo')) return '请填写任务信息';
  return '请填写想法信息';
});

const dashboardData = computed(() =>
  buildMonthlyDashboard(todoStore.todos, ideaStore.ideas, dashboardCursor.value)
);
const calendarWeeks = computed(() =>
  buildCalendarWeeks(dashboardData.value.dailyRows, dashboardCursor.value)
);

const dashboardMonthText = computed(() => {
  const monthKey = dashboardData.value.monthKey;
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return `${year}年${month}月`;
});

const dailyMetricMax = computed(() => getDailyMetricMax(dashboardData.value.dailyRows));
const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const dayText = (value: string) => value.slice(-2).replace(/^0/, '');
const barColorClass = {
  todoCreated: 'bg-emerald-300',
  todoUpdated: 'bg-emerald-700',
  ideaCreated: 'bg-orange-300',
  ideaUpdated: 'bg-orange-600'
};

const miniBarHeight = (value: number) =>
  value > 0
    ? `${Math.max((value / dailyMetricMax.value) * 100, 12)}%`
    : '0%';

const goPrevMonth = () => {
  dashboardCursor.value = shiftMonth(dashboardCursor.value, -1);
};

const goNextMonth = () => {
  dashboardCursor.value = shiftMonth(dashboardCursor.value, 1);
};
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-6">
    <header class="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 text-white shadow">
      <h1 class="text-2xl font-bold">Todo Plus</h1>
      <p class="mt-1 text-sm text-slate-200">任务与想法管理</p>
    </header>

    <Tabs
      :model-value="uiStore.activeTab"
      class="w-full"
      @update:model-value="uiStore.setTab($event as MainTab)"
    >
      <TabsList>
        <TabsTrigger value="todo">任务</TabsTrigger>
        <TabsTrigger value="idea">想法看板</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>

      <TabsContent value="todo" class="space-y-4">
        <div class="flex justify-end">
          <Button @click="openTodoCreate">新增任务</Button>
        </div>

        <Card class="grid gap-3 p-4 md:grid-cols-6">
          <Input
            class="md:col-span-3"
            :model-value="todoStore.search"
            placeholder="搜索任务标题或描述"
            @update:model-value="todoStore.setSearch($event)"
          />
          <Select
            :model-value="todoStore.filter"
            :options="filterOptions"
            @update:model-value="todoStore.setFilter($event as TodoFilter)"
          />
          <Button :disabled="!hasSelected" @click="todoStore.bulkCompleteSelected">批量完成</Button>
          <Button variant="destructive" :disabled="!hasSelected" @click="todoStore.bulkDeleteSelected">批量删除</Button>
        </Card>

        <ul class="space-y-2">
          <li v-for="item in todoStore.filteredTodos" :key="item.id">
            <Card class="grid gap-2 p-4 md:grid-cols-12">
              <label class="flex items-center gap-2 md:col-span-1">
                <Checkbox
                  :checked="todoStore.selectedIds.includes(item.id)"
                  @update:checked="todoStore.toggleSelection(item.id)"
                />
              </label>
              <div class="md:col-span-7">
                <p class="font-semibold" :class="item.completed ? 'line-through text-slate-400' : ''">{{ item.title }}</p>
                <p class="text-sm text-slate-500">{{ item.description || '无描述' }}</p>
                <div class="mt-1 flex flex-wrap gap-2 text-xs">
                  <Badge :variant="priorityVariant(item.priority)">{{ priorityText(item.priority) }}</Badge>
                  <Badge v-if="item.dueDate" variant="secondary">截止 {{ item.dueDate }}</Badge>
                  <Badge v-for="tag in item.tags" :key="tag" variant="info">{{ tag }}</Badge>
                </div>
              </div>
              <div class="flex gap-2 md:col-span-4 md:justify-end">
                <Button size="sm" @click="todoStore.toggleTodo(item.id)">{{ item.completed ? '取消完成' : '完成' }}</Button>
                <Button size="sm" variant="secondary" @click="openTodoEdit(item)">编辑</Button>
                <Button size="sm" variant="destructive" @click="todoStore.removeTodo(item.id)">删除</Button>
              </div>
            </Card>
          </li>
        </ul>
      </TabsContent>

      <TabsContent value="idea" class="space-y-4">
        <div class="flex justify-end">
          <Button @click="openIdeaCreate">新增想法</Button>
        </div>

        <div class="grid gap-3 lg:grid-cols-3">
          <Card
            v-for="status in statuses"
            :key="status"
            class="p-3"
            @dragover.prevent
            @drop="onDropLane(status)"
          >
            <h2 class="mb-2 text-sm font-bold text-slate-600">{{ statusLabel(status) }}</h2>
            <ul class="space-y-2">
              <li
                v-for="idea in ideaStore.byStatus[status]"
                :key="idea.id"
                class="rounded-xl border border-slate-200 bg-slate-50 p-3"
                draggable="true"
                @dragstart="onDragStart(idea.id)"
              >
                <p class="font-semibold">{{ idea.title }}</p>
                <p class="text-sm text-slate-500">{{ idea.description || '无描述' }}</p>
                <div class="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge :variant="priorityVariant(idea.priority)">{{ priorityText(idea.priority) }}</Badge>
                  <Badge v-for="tag in idea.tags" :key="tag" variant="info">{{ tag }}</Badge>
                  <Badge v-if="idea.convertedTodoId" variant="success">已转任务</Badge>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" @click="ideaStore.moveIdeaStep(idea.id, 'prev')">上一步</Button>
                  <Button size="sm" variant="secondary" @click="ideaStore.moveIdeaStep(idea.id, 'next')">下一步</Button>
                  <Button size="sm" variant="outline" @click="openIdeaEdit(idea)">编辑</Button>
                  <Button
                    v-if="idea.status === 'execute'"
                    size="sm"
                    :disabled="!!idea.convertedTodoId"
                    @click="convertIdea(idea.id)"
                  >
                    转为任务
                  </Button>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="dashboard" class="space-y-4">
        <Card class="flex items-center justify-between p-4">
          <div>
            <h2 class="text-lg font-semibold">月度统计</h2>
            <p class="text-sm text-slate-500">{{ dashboardMonthText }}（按本地时区）</p>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="secondary" @click="goPrevMonth">上月</Button>
            <Button size="sm" variant="secondary" @click="goNextMonth">下月</Button>
          </div>
        </Card>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card class="p-4">
            <p class="text-sm text-slate-500">任务新增</p>
            <p class="mt-1 text-2xl font-bold">{{ dashboardData.monthlyTotals.todoCreated }}</p>
          </Card>
          <Card class="p-4">
            <p class="text-sm text-slate-500">任务活跃</p>
            <p class="mt-1 text-2xl font-bold">{{ dashboardData.monthlyTotals.todoUpdated }}</p>
          </Card>
          <Card class="p-4">
            <p class="text-sm text-slate-500">想法新增</p>
            <p class="mt-1 text-2xl font-bold">{{ dashboardData.monthlyTotals.ideaCreated }}</p>
          </Card>
          <Card class="p-4">
            <p class="text-sm text-slate-500">想法活跃</p>
            <p class="mt-1 text-2xl font-bold">{{ dashboardData.monthlyTotals.ideaUpdated }}</p>
          </Card>
        </div>

        <Card class="p-4">
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
            <div v-for="label in weekdayLabels" :key="label">周{{ label }}</div>
          </div>
          <div class="mt-2 grid grid-cols-7 gap-2">
            <template v-for="(week, weekIndex) in calendarWeeks" :key="`week-${weekIndex}`">
              <div
                v-for="(cell, dayIndex) in week"
                :key="cell ? cell.day : `empty-${weekIndex}-${dayIndex}`"
                class="min-h-[140px] rounded-lg border p-2"
                :class="cell ? 'border-slate-200 bg-white' : 'border-transparent bg-slate-50/80'"
              >
                <template v-if="cell">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold">{{ dayText(cell.day) }}</p>
                    <p class="text-[10px] text-slate-400">{{ cell.day }}</p>
                  </div>
                  <div class="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                    <p>任新: {{ cell.todoCreated }}</p>
                    <p>任活: {{ cell.todoUpdated }}</p>
                    <p>想新: {{ cell.ideaCreated }}</p>
                    <p>想活: {{ cell.ideaUpdated }}</p>
                  </div>
                  <div class="mt-2 flex h-10 items-end gap-1">
                    <div
                      class="w-2 rounded-t"
                      :class="barColorClass.todoCreated"
                      :style="{ height: miniBarHeight(cell.todoCreated) }"
                      title="任务新增"
                    />
                    <div
                      class="w-2 rounded-t"
                      :class="barColorClass.todoUpdated"
                      :style="{ height: miniBarHeight(cell.todoUpdated) }"
                      title="任务活跃"
                    />
                    <div
                      class="w-2 rounded-t"
                      :class="barColorClass.ideaCreated"
                      :style="{ height: miniBarHeight(cell.ideaCreated) }"
                      title="想法新增"
                    />
                    <div
                      class="w-2 rounded-t"
                      :class="barColorClass.ideaUpdated"
                      :style="{ height: miniBarHeight(cell.ideaUpdated) }"
                      title="想法活跃"
                    />
                  </div>
                </template>
              </div>
            </template>
          </div>
        </Card>

        <Card class="lg:hidden p-3">
          <p class="text-xs font-semibold text-slate-600">迷你柱状图图例</p>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.todoCreated" />
              <span>任务新增</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.todoUpdated" />
              <span>任务活跃</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.ideaCreated" />
              <span>想法新增</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.ideaUpdated" />
              <span>想法活跃</span>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>

    <div
      v-if="uiStore.activeTab === 'dashboard'"
      class="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-2"
    >
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50"
        :title="showFloatingLegend ? '收起图例' : '展开图例'"
        @click="showFloatingLegend = !showFloatingLegend"
      >
        <Minus v-if="showFloatingLegend" class="h-4 w-4" />
        <Plus v-else class="h-4 w-4" />
      </button>

      <div
        v-if="showFloatingLegend"
        class="w-36 rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur"
      >
        <p class="text-xs font-semibold text-slate-700">迷你柱状图图例</p>
        <div class="mt-2 space-y-2 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.todoCreated" />
            <span>任务新增</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.todoUpdated" />
            <span>任务活跃</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.ideaCreated" />
            <span>想法新增</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm" :class="barColorClass.ideaUpdated" />
            <span>想法活跃</span>
          </div>
        </div>
      </div>
    </div>

    <FormDialog
      :open="dialogOpen"
      :title="dialogTitle"
      :description="dialogDescription"
      submit-text="保存"
      cancel-text="取消"
      @update:open="(value) => (value ? (dialogOpen = true) : closeDialog())"
      @submit="submitDialog"
    >
      <TodoFormFields
        v-if="dialogType === 'todo-create' || dialogType === 'todo-edit'"
        :form="todoForm"
        :title-error="todoErrors.title"
        :priority-options="priorityOptions"
      />
      <IdeaFormFields
        v-else
        :form="ideaForm"
        :title-error="ideaErrors.title"
        :priority-options="priorityOptions"
      />
    </FormDialog>
  </main>
</template>
