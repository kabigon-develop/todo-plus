<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ClipboardList, LayoutDashboard, Lightbulb, Minus, Moon, Plus, Search, Sun } from 'lucide-vue-next';
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
  type DashboardDailyRow,
  getDailyMetricMax,
  shiftMonth
} from '@/utils/dashboard';
import { useIdeaStore } from '@/store/modules/idea';
import { useTodoStore } from '@/store/modules/todo';
import type { Idea, IdeaStatus, Priority, Todo, TodoFilter } from '@/types/todo';
import { useUiStore, type MainTab } from '@/store/modules/ui';

type DialogType = 'todo-create' | 'todo-edit' | 'idea-create' | 'idea-edit' | null;

const todoStore = useTodoStore();
const ideaStore = useIdeaStore();
const uiStore = useUiStore();

onMounted(() => {
  uiStore.hydrateTheme();
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

const todoComposerOpen = ref(false);
const ideaComposerOpen = ref(false);
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
  todoComposerOpen.value = true;
};

const openTodoEdit = (item: Todo) => {
  todoComposerOpen.value = false;
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

const cancelTodoCreate = () => {
  todoComposerOpen.value = false;
  resetTodoForm();
};

const openIdeaCreate = () => {
  resetIdeaForm();
  ideaComposerOpen.value = true;
};

const openIdeaEdit = (item: Idea) => {
  ideaComposerOpen.value = false;
  resetIdeaForm();
  editingIdeaId.value = item.id;
  ideaForm.title = item.title;
  ideaForm.description = item.description;
  ideaForm.priority = item.priority;
  ideaForm.tags = item.tags.join(', ');
  dialogType.value = 'idea-edit';
  dialogOpen.value = true;
};

const cancelIdeaCreate = () => {
  ideaComposerOpen.value = false;
  resetIdeaForm();
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

  if (todoComposerOpen.value || dialogType.value === 'todo-create') {
    todoStore.addTodo(payload);
    if (todoComposerOpen.value) {
      cancelTodoCreate();
    } else {
      closeDialog();
    }
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

  if (ideaComposerOpen.value || dialogType.value === 'idea-create') {
    ideaStore.addIdea(payload);
    if (ideaComposerOpen.value) {
      cancelIdeaCreate();
    } else {
      closeDialog();
    }
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

const clearTodoFilters = () => {
  todoStore.setSearch('');
  todoStore.setFilter('all');
};

const todoEmptyTitle = computed(() =>
  todoStore.search.trim() || todoStore.filter !== 'all'
    ? '没有匹配的任务'
    : '先把下一件事写下来'
);

const todoEmptyDescription = computed(() =>
  todoStore.search.trim() || todoStore.filter !== 'all'
    ? '换个关键词，或清空筛选后再看全部任务。'
    : '任务会按优先级、截止日期和标签集中在这里，适合快速捕捉和日常收尾。'
);

const laneEmptyDescription = (status: IdeaStatus) => {
  if (status === 'idea') return '记录还没成形的念头，后面再评估。';
  if (status === 'evaluate') return '把值得继续看的想法拖到这里。';
  return '准备落地的想法会在这里转成任务。';
};

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

const dailyActivityTotal = (row: DashboardDailyRow) =>
  row.todoCreated + row.todoUpdated + row.ideaCreated + row.ideaUpdated;

const activeDashboardDays = computed(() =>
  dashboardData.value.dailyRows.filter((row) => dailyActivityTotal(row) > 0)
);

const dashboardActivityTotal = computed(() =>
  dashboardData.value.dailyRows.reduce((total, row) => total + dailyActivityTotal(row), 0)
);

const dashboardSummaryText = computed(() => {
  if (dashboardActivityTotal.value === 0) {
    return '本月还没有活动记录';
  }
  return `${activeDashboardDays.value.length} 天有记录，共 ${dashboardActivityTotal.value} 次变动`;
});

const dashboardMonthText = computed(() => {
  const monthKey = dashboardData.value.monthKey;
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return `${year}年${month}月`;
});

const dailyMetricMax = computed(() => getDailyMetricMax(dashboardData.value.dailyRows));
const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const dayText = (value: string) => value.slice(-2).replace(/^0/, '');
// Dashboard chart colors: semantically independent of theme tokens
// These are retained as-is until phase 3 PAGE-03
const barColorClass = {
  todoCreated: 'bg-emerald-300',
  todoUpdated: 'bg-emerald-700',
  ideaCreated: 'bg-orange-300',
  ideaUpdated: 'bg-orange-600'
};

const dashboardMetrics = computed(() => [
  {
    label: '任务新增',
    value: dashboardData.value.monthlyTotals.todoCreated,
    colorClass: barColorClass.todoCreated
  },
  {
    label: '任务活跃',
    value: dashboardData.value.monthlyTotals.todoUpdated,
    colorClass: barColorClass.todoUpdated
  },
  {
    label: '想法新增',
    value: dashboardData.value.monthlyTotals.ideaCreated,
    colorClass: barColorClass.ideaCreated
  },
  {
    label: '想法活跃',
    value: dashboardData.value.monthlyTotals.ideaUpdated,
    colorClass: barColorClass.ideaUpdated
  }
]);

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
    <header class="rounded-2xl border border-border bg-surface-elevated px-5 py-4 text-foreground shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Todo Plus</h1>
          <p class="mt-1 text-sm text-muted">任务与想法管理</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-card text-foreground shadow-sm transition hover:bg-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
          :title="uiStore.theme === 'dark' ? '切换到浅色' : '切换到深色'"
          @click="uiStore.toggleTheme()"
        >
          <Sun v-if="uiStore.theme === 'dark'" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
      </div>
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
        <section
          v-if="todoComposerOpen"
          class="rounded-xl border border-border bg-surface-card p-4 shadow-sm"
          aria-label="快速新增任务"
        >
          <form class="space-y-3" @submit.prevent="submitTodoForm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">快速新增任务</p>
                <p class="text-sm text-muted">先捕捉标题，需要时再补优先级、截止日期和标签。</p>
              </div>
              <Button type="button" variant="secondary" size="sm" @click="cancelTodoCreate">取消</Button>
            </div>
            <TodoFormFields
              :form="todoForm"
              :title-error="todoErrors.title"
              :priority-options="priorityOptions"
            />
            <div class="flex justify-end">
              <Button type="submit">保存任务</Button>
            </div>
          </form>
        </section>
        <div v-else class="flex justify-end">
          <Button class="gap-2" @click="openTodoCreate">
            <Plus class="h-4 w-4" />
            新增任务
          </Button>
        </div>

        <section class="todo-toolbar-v2" aria-label="任务筛选工具">
          <Input
            class="todo-toolbar-v2__search"
            :model-value="todoStore.search"
            placeholder="输入关键词筛选任务"
            @update:model-value="todoStore.setSearch($event)"
          />
          <div class="todo-toolbar-v2__chips" role="group" aria-label="任务状态筛选">
            <button type="button" :aria-pressed="todoStore.filter === 'all'" @click="todoStore.setFilter('all')">全部</button>
            <button type="button" :aria-pressed="todoStore.filter === 'active'" @click="todoStore.setFilter('active')">进行中</button>
            <button type="button" :aria-pressed="todoStore.filter === 'completed'" @click="todoStore.setFilter('completed')">已完成</button>
          </div>
          <div class="todo-toolbar-v2__batch">
            <span>{{ todoStore.selectedIds.length }} 已选</span>
            <Button size="sm" :disabled="!hasSelected" @click="todoStore.bulkCompleteSelected">完成</Button>
            <Button size="sm" variant="destructive" :disabled="!hasSelected" @click="todoStore.bulkDeleteSelected">删除</Button>
          </div>
        </section>

        <Card v-if="!todoComposerOpen && todoStore.filteredTodos.length === 0" class="p-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary-text">
                <Search v-if="todoStore.search.trim() || todoStore.filter !== 'all'" class="h-5 w-5" />
                <ClipboardList v-else class="h-5 w-5" />
              </div>
              <div>
                <p class="font-semibold">{{ todoEmptyTitle }}</p>
                <p class="mt-1 max-w-xl text-sm text-muted">{{ todoEmptyDescription }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="todoStore.search.trim() || todoStore.filter !== 'all'"
                variant="secondary"
                @click="clearTodoFilters"
              >
                清空筛选
              </Button>
              <Button class="gap-2" @click="openTodoCreate">
                <Plus class="h-4 w-4" />
                新增任务
              </Button>
            </div>
          </div>
        </Card>

        <ul v-if="todoStore.filteredTodos.length > 0" class="space-y-2">
          <li v-for="item in todoStore.filteredTodos" :key="item.id">
            <Card class="grid gap-2 p-4 md:grid-cols-12">
              <label class="flex items-center gap-2 md:col-span-1">
                <Checkbox
                  :checked="todoStore.selectedIds.includes(item.id)"
                  @update:checked="todoStore.toggleSelection(item.id)"
                />
              </label>
              <div class="md:col-span-7">
                <p class="font-semibold" :class="item.completed ? 'line-through text-subtle' : ''">{{ item.title }}</p>
                <p class="text-sm text-muted">{{ item.description || '无描述' }}</p>
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
        <section
          v-if="ideaComposerOpen"
          class="rounded-xl border border-border bg-surface-card p-4 shadow-sm"
          aria-label="快速新增想法"
        >
          <form class="space-y-3" @submit.prevent="submitIdeaForm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">快速新增想法</p>
                <p class="text-sm text-muted">把还没成形的念头先放进看板，后面再推进。</p>
              </div>
              <Button type="button" variant="secondary" size="sm" @click="cancelIdeaCreate">取消</Button>
            </div>
            <IdeaFormFields
              :form="ideaForm"
              :title-error="ideaErrors.title"
              :priority-options="priorityOptions"
            />
            <div class="flex justify-end">
              <Button type="submit">保存想法</Button>
            </div>
          </form>
        </section>
        <div v-else class="flex justify-end">
          <Button class="gap-2" @click="openIdeaCreate">
            <Plus class="h-4 w-4" />
            新增想法
          </Button>
        </div>

        <div class="grid gap-3 lg:grid-cols-3">
          <Card
            v-for="status in statuses"
            :key="status"
            class="p-3"
            @dragover.prevent
            @drop="onDropLane(status)"
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-sm font-bold text-muted">{{ statusLabel(status) }}</h2>
              <span class="rounded-full bg-surface-base px-2 py-0.5 text-xs text-muted">
                {{ ideaStore.byStatus[status].length }}
              </span>
            </div>
            <ul class="space-y-2">
              <li
                v-if="ideaStore.byStatus[status].length === 0"
                class="rounded-xl border border-dashed border-border bg-surface-base/80 p-3 text-sm text-muted"
              >
                <div class="flex gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary-text">
                    <Lightbulb class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="font-medium text-foreground">{{ statusLabel(status) }}为空</p>
                    <p class="mt-1">{{ laneEmptyDescription(status) }}</p>
                    <Button
                      v-if="status === 'idea' && !ideaComposerOpen"
                      class="mt-3 gap-2"
                      size="sm"
                      @click="openIdeaCreate"
                    >
                      <Plus class="h-4 w-4" />
                      记录想法
                    </Button>
                  </div>
                </div>
              </li>
              <li
                v-for="idea in ideaStore.byStatus[status]"
                :key="idea.id"
                class="rounded-xl border border-border bg-surface-base p-3"
                draggable="true"
                @dragstart="onDragStart(idea.id)"
              >
                <p class="font-semibold">{{ idea.title }}</p>
                <p class="text-sm text-muted">{{ idea.description || '无描述' }}</p>
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
            <p class="text-sm text-muted">{{ dashboardMonthText }}（按本地时区）</p>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="secondary" @click="goPrevMonth">上月</Button>
            <Button size="sm" variant="secondary" @click="goNextMonth">下月</Button>
          </div>
        </Card>

        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card v-for="metric in dashboardMetrics" :key="metric.label" class="p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">{{ metric.label }}</p>
              <span class="h-2.5 w-2.5 rounded-full" :class="metric.colorClass" />
            </div>
            <p class="mt-1 text-2xl font-bold">{{ metric.value }}</p>
          </Card>
        </div>

        <Card class="p-4 md:hidden">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary-text">
              <LayoutDashboard class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-semibold">本月活动</h3>
              <p class="mt-1 text-sm text-muted">{{ dashboardSummaryText }}</p>
            </div>
          </div>

          <div v-if="activeDashboardDays.length > 0" class="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
            <article
              v-for="row in activeDashboardDays"
              :key="row.day"
              class="rounded-lg border border-border bg-surface-base p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold">{{ dayText(row.day) }}日</p>
                  <p class="text-xs text-muted">{{ row.day }}</p>
                </div>
                <Badge variant="secondary">{{ dailyActivityTotal(row) }} 次</Badge>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-sm text-muted">
                <span>任务新增 {{ row.todoCreated }}</span>
                <span>任务活跃 {{ row.todoUpdated }}</span>
                <span>想法新增 {{ row.ideaCreated }}</span>
                <span>想法活跃 {{ row.ideaUpdated }}</span>
              </div>
            </article>
          </div>

          <div v-else class="mt-4 rounded-lg border border-dashed border-border bg-surface-base p-4 text-sm text-muted">
            <p class="font-medium text-foreground">本月还没有可回顾的活动</p>
            <p class="mt-1">新增一个任务或想法后，这里会显示按日期聚合的变化。</p>
          </div>
        </Card>

        <Card class="hidden p-4 md:block">
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted">
            <div v-for="label in weekdayLabels" :key="label">周{{ label }}</div>
          </div>
          <div class="mt-2 grid grid-cols-7 gap-2">
            <template v-for="(week, weekIndex) in calendarWeeks" :key="`week-${weekIndex}`">
              <div
                v-for="(cell, dayIndex) in week"
                :key="cell ? cell.day : `empty-${weekIndex}-${dayIndex}`"
                class="min-h-[140px] rounded-lg border p-2"
                :class="cell ? 'border-border bg-surface-card' : 'border-transparent bg-surface-base/80'"
              >
                <template v-if="cell">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold">{{ dayText(cell.day) }}</p>
                    <p class="text-[10px] text-subtle">{{ cell.day }}</p>
                  </div>
                  <div class="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted">
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

        <Card class="hidden p-3 md:block lg:hidden">
          <p class="text-xs font-semibold text-muted">迷你柱状图图例</p>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-muted">
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
        class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-card text-foreground shadow-md transition hover:bg-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
        :title="showFloatingLegend ? '收起图例' : '展开图例'"
        @click="showFloatingLegend = !showFloatingLegend"
      >
        <Minus v-if="showFloatingLegend" class="h-4 w-4" />
        <Plus v-else class="h-4 w-4" />
      </button>

      <div
        v-if="showFloatingLegend"
        class="w-36 rounded-xl border border-border bg-surface-elevated p-2.5 shadow-lg"
      >
        <p class="text-xs font-semibold text-foreground">迷你柱状图图例</p>
        <div class="mt-2 space-y-2 text-xs text-muted">
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

<style scoped>
.todo-toolbar-v2 {
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) auto minmax(13rem, auto);
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-default);
  border-radius: 0.875rem;
  background: var(--surface-card);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.todo-toolbar-v2__chips {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: color-mix(in oklch, var(--surface-base) 88%, var(--surface-elevated));
}

.todo-toolbar-v2__chips button {
  min-width: 4.25rem;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  transition:
    background-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
    color 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.todo-toolbar-v2__chips button[aria-pressed='true'] {
  background: var(--color-primary-muted);
  color: var(--color-primary-text);
  font-weight: 700;
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--color-primary) 55%, transparent);
}

.todo-toolbar-v2__batch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

@media (max-width: 900px) {
  .todo-toolbar-v2 {
    grid-template-columns: 1fr;
  }

  .todo-toolbar-v2__chips,
  .todo-toolbar-v2__batch {
    width: 100%;
  }
}
</style>
