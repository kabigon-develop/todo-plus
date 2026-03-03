import { defineStore } from 'pinia';
import type { Priority, Todo, TodoFilter } from './types';

const STORAGE_KEY = 'todo-plus:todos';

const now = () => new Date().toISOString();
const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface TodoState {
  todos: Todo[];
  selectedIds: string[];
  filter: TodoFilter;
  search: string;
}

const defaultState = (): TodoState => ({
  todos: [],
  selectedIds: [],
  filter: 'all',
  search: ''
});

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => defaultState(),
  getters: {
    filteredTodos(state): Todo[] {
      const query = state.search.trim().toLowerCase();
      return state.todos.filter((item) => {
        if (state.filter === 'active' && item.completed) {
          return false;
        }
        if (state.filter === 'completed' && !item.completed) {
          return false;
        }
        if (!query) {
          return true;
        }
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      });
    }
  },
  actions: {
    hydrate() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as TodoState;
        this.todos = parsed.todos ?? [];
        this.selectedIds = parsed.selectedIds ?? [];
        this.filter = parsed.filter ?? 'all';
        this.search = parsed.search ?? '';
      } catch {
        this.$reset();
      }
    },
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          todos: this.todos,
          selectedIds: this.selectedIds,
          filter: this.filter,
          search: this.search
        })
      );
    },
    addTodo(payload: {
      title: string;
      description?: string;
      priority: Priority;
      dueDate?: string;
      tags: string[];
    }) {
      const time = now();
      const todo: Todo = {
        id: id(),
        title: payload.title.trim(),
        description: payload.description?.trim() ?? '',
        completed: false,
        priority: payload.priority,
        dueDate: payload.dueDate ?? '',
        tags: payload.tags,
        createdAt: time,
        updatedAt: time
      };
      this.todos.unshift(todo);
      this.persist();
      return todo.id;
    },
    updateTodo(todoId: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
      const target = this.todos.find((item) => item.id === todoId);
      if (!target) return;
      Object.assign(target, patch, { updatedAt: now() });
      this.persist();
    },
    removeTodo(todoId: string) {
      this.todos = this.todos.filter((item) => item.id !== todoId);
      this.selectedIds = this.selectedIds.filter((item) => item !== todoId);
      this.persist();
    },
    toggleTodo(todoId: string) {
      const target = this.todos.find((item) => item.id === todoId);
      if (!target) return;
      target.completed = !target.completed;
      target.updatedAt = now();
      this.persist();
    },
    toggleSelection(todoId: string) {
      if (this.selectedIds.includes(todoId)) {
        this.selectedIds = this.selectedIds.filter((item) => item !== todoId);
      } else {
        this.selectedIds.push(todoId);
      }
      this.persist();
    },
    bulkCompleteSelected() {
      const selected = new Set(this.selectedIds);
      const time = now();
      this.todos = this.todos.map((item) =>
        selected.has(item.id)
          ? { ...item, completed: true, updatedAt: time }
          : item
      );
      this.persist();
    },
    bulkDeleteSelected() {
      const selected = new Set(this.selectedIds);
      this.todos = this.todos.filter((item) => !selected.has(item.id));
      this.selectedIds = [];
      this.persist();
    },
    setFilter(filter: TodoFilter) {
      this.filter = filter;
      this.persist();
    },
    setSearch(search: string) {
      this.search = search;
      this.persist();
    },
    addTodoFromIdea(payload: {
      title: string;
      description?: string;
      priority: Priority;
      tags: string[];
    }) {
      return this.addTodo({
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        tags: payload.tags
      });
    }
  }
});
