import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useIdeaStore } from '../../src/stores/idea';
import { useTodoStore } from '../../src/stores/todo';

describe('idea store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('moves idea with next/prev buttons', () => {
    const store = useIdeaStore();
    const id = store.addIdea({ title: 'Idea A', priority: 'medium', tags: [] });

    store.moveIdeaStep(id, 'next');
    expect(store.ideas[0].status).toBe('evaluate');

    store.moveIdeaStep(id, 'next');
    expect(store.ideas[0].status).toBe('execute');

    store.moveIdeaStep(id, 'prev');
    expect(store.ideas[0].status).toBe('evaluate');
  });

  it('reorders and changes lane with drag move', () => {
    const store = useIdeaStore();
    const first = store.addIdea({ title: 'First', priority: 'low', tags: [] });
    const second = store.addIdea({ title: 'Second', priority: 'low', tags: [] });

    store.moveIdeaDrag(second, 'idea', 0);
    expect(store.byStatus.idea[0].id).toBe(second);
    expect(store.byStatus.idea[1].id).toBe(first);
  });

  it('converts execute idea into todo once', () => {
    const ideaStore = useIdeaStore();
    const todoStore = useTodoStore();
    const id = ideaStore.addIdea({ title: 'Ship v1', priority: 'high', tags: ['release'] });

    ideaStore.moveIdeaStep(id, 'next');
    ideaStore.moveIdeaStep(id, 'next');

    const createdTodoId = ideaStore.convertToTodo(id, todoStore);
    expect(createdTodoId).toBeTruthy();
    expect(todoStore.todos).toHaveLength(1);

    const secondTry = ideaStore.convertToTodo(id, todoStore);
    expect(secondTry).toBeNull();
    expect(todoStore.todos).toHaveLength(1);
  });
});
