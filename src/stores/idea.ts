import { defineStore } from 'pinia';
import type { Idea, IdeaStatus, Priority } from './types';
import type { useTodoStore } from './todo';

const STORAGE_KEY = 'todo-plus:ideas';

const now = () => new Date().toISOString();
const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const lanes: IdeaStatus[] = ['idea', 'evaluate', 'execute'];

interface IdeaState {
  ideas: Idea[];
}

export const useIdeaStore = defineStore('idea', {
  state: (): IdeaState => ({ ideas: [] }),
  getters: {
    byStatus(state) {
      return {
        idea: state.ideas
          .filter((item) => item.status === 'idea')
          .sort((a, b) => a.order - b.order),
        evaluate: state.ideas
          .filter((item) => item.status === 'evaluate')
          .sort((a, b) => a.order - b.order),
        execute: state.ideas
          .filter((item) => item.status === 'execute')
          .sort((a, b) => a.order - b.order)
      };
    }
  },
  actions: {
    hydrate() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as IdeaState;
        this.ideas = parsed.ideas ?? [];
      } catch {
        this.$reset();
      }
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ideas: this.ideas }));
    },
    addIdea(payload: {
      title: string;
      description?: string;
      priority: Priority;
      tags: string[];
    }) {
      const order = this.byStatus.idea.length;
      const time = now();
      const idea: Idea = {
        id: id(),
        title: payload.title.trim(),
        description: payload.description?.trim() ?? '',
        status: 'idea',
        priority: payload.priority,
        tags: payload.tags,
        order,
        createdAt: time,
        updatedAt: time
      };
      this.ideas.push(idea);
      this.persist();
      return idea.id;
    },
    moveIdeaStep(ideaId: string, direction: 'next' | 'prev') {
      const target = this.ideas.find((item) => item.id === ideaId);
      if (!target) return;
      const currentIndex = lanes.indexOf(target.status);
      const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= lanes.length) return;

      target.status = lanes[nextIndex];
      target.order = this.ideas.filter((item) => item.status === target.status).length;
      target.updatedAt = now();
      this.recomputeOrder();
      this.persist();
    },
    moveIdeaDrag(ideaId: string, nextStatus: IdeaStatus, nextIndex: number) {
      const target = this.ideas.find((item) => item.id === ideaId);
      if (!target) return;

      const currentStatus = target.status;
      const sourceLane = this.ideas
        .filter((item) => item.status === currentStatus && item.id !== ideaId)
        .sort((a, b) => a.order - b.order);
      sourceLane.forEach((item, index) => {
        item.order = index;
      });

      const targetLane = this.ideas
        .filter((item) => item.status === nextStatus && item.id !== ideaId)
        .sort((a, b) => a.order - b.order);
      targetLane.splice(nextIndex, 0, target);
      targetLane.forEach((item, index) => {
        item.status = nextStatus;
        item.order = index;
      });
      target.updatedAt = now();
      this.persist();
    },
    recomputeOrder() {
      lanes.forEach((status) => {
        const lane = this.ideas
          .filter((item) => item.status === status)
          .sort((a, b) => a.order - b.order);
        lane.forEach((item, index) => {
          item.order = index;
        });
      });
    },
    convertToTodo(ideaId: string, todoStore: ReturnType<typeof useTodoStore>) {
      const target = this.ideas.find((item) => item.id === ideaId);
      if (!target || target.status !== 'execute' || target.convertedTodoId) {
        return null;
      }
      const todoId = todoStore.addTodoFromIdea({
        title: target.title,
        description: target.description,
        priority: target.priority,
        tags: target.tags
      });
      target.convertedTodoId = todoId;
      target.updatedAt = now();
      this.persist();
      return todoId;
    },
    removeIdea(ideaId: string) {
      this.ideas = this.ideas.filter((item) => item.id !== ideaId);
      this.recomputeOrder();
      this.persist();
    },
    updateIdea(ideaId: string, patch: Partial<Omit<Idea, 'id' | 'createdAt'>>) {
      const target = this.ideas.find((item) => item.id === ideaId);
      if (!target) return;
      Object.assign(target, patch, { updatedAt: now() });
      this.recomputeOrder();
      this.persist();
    }
  }
});
