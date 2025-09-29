import { db } from '@/lib/dexie.db'
import { Todo } from '@/models/Todo'
import { create } from 'zustand'

interface TodosStore {
  recentTodos: Todo[]
  loadRecentTodos: () => Promise<void>
}

export const useTodosStore = create<TodosStore>((set) => {
  const recentTodos: Todo[] = []
  const loadRecentTodos = async (): Promise<void> => {
    const recentTodos = await db.todos.orderBy('modified').limit(10).reverse().toArray()
    set({ recentTodos })
  }

  return {
    recentTodos,
    loadRecentTodos,
  }
})
