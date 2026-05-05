export type Priority = 'low' | 'medium' | 'high';
export type TodoFilter = 'all' | 'active' | 'completed';
export type IdeaStatus = 'idea' | 'evaluate' | 'execute';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  priority: Priority;
  tags: string[];
  order: number;
  convertedTodoId?: string;
  createdAt: string;
  updatedAt: string;
}
