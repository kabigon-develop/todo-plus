import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTodoStore } from '../../src/stores/todo';

describe('todo store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds and updates a todo', () => {
    const store = useTodoStore();
    const id = store.addTodo({
      title: 'Write MVP',
      description: 'Add core flow',
      priority: 'high',
      dueDate: '2026-02-10',
      tags: ['mvp']
    });

    expect(store.todos).toHaveLength(1);
    expect(store.todos[0].title).toBe('Write MVP');

    store.updateTodo(id, { title: 'Write final MVP' });
    expect(store.todos[0].title).toBe('Write final MVP');
  });

  it('filters by status and search text', () => {
    const store = useTodoStore();
    store.addTodo({ title: 'Alpha task', priority: 'low', tags: [] });
    const id = store.addTodo({ title: 'Beta task', priority: 'medium', tags: [] });
    store.toggleTodo(id);

    store.setFilter('active');
    expect(store.filteredTodos.map((item) => item.title)).toEqual(['Alpha task']);

    store.setFilter('all');
    store.setSearch('beta');
    expect(store.filteredTodos.map((item) => item.title)).toEqual(['Beta task']);
  });

  it('handles bulk complete and bulk delete', () => {
    const store = useTodoStore();
    const first = store.addTodo({ title: 'A', priority: 'low', tags: [] });
    const second = store.addTodo({ title: 'B', priority: 'low', tags: [] });

    store.toggleSelection(first);
    store.toggleSelection(second);
    store.bulkCompleteSelected();
    expect(store.todos.every((item) => item.completed)).toBe(true);

    store.bulkDeleteSelected();
    expect(store.todos).toHaveLength(0);
  });
});
