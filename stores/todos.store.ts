import { db } from '@/lib/dexie.db'
import { Todo } from '@/models/Todo'
import { create } from 'zustand'

interface TodosStore {
  getRecentTodos: () => Promise<Todo[]>
  getTodosDateRange: (start: Date, end: Date) => Promise<Todo[]>
}

export const useTodosStore = create<TodosStore>(() => {
  const getRecentTodos = async (): Promise<Todo[]> => {
    return db.todos.orderBy('modified').limit(10).reverse().toArray()
  }

  const getTodosDateRange = (start: Date, end: Date): Promise<Todo[]> => {
    return db.todos.where('created').between(start.getTime(), end.getTime(), true, true).toArray()
  }

  return {
    getRecentTodos,
    getTodosDateRange,
  }
})
