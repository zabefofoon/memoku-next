import { db } from '@/lib/dexie.db'
import { Todo } from '@/models/Todo'
import dayjs from 'dayjs'
import { create } from 'zustand'

export interface CreatedSeriesPoint {
  day: string
  created: number
}

interface TodosStore {
  getTodo: (id: number) => Promise<Todo | undefined>
  getTodos: () => Promise<Todo[]>
  getTodayTodos: () => Promise<Todo[]>
  getRecentTodos: () => Promise<Todo[]>
  getTodosDateRange: (start: Date, end: Date) => Promise<Todo[]>
  getTagsCount: () => Promise<Record<string, number>[]>
  getCreatedSeries30d: (date?: Date) => Promise<CreatedSeriesPoint[]>
  postDescription: (description: string) => Promise<number>
  updateDescription: (id: number, description: string) => Promise<number>
}

export const useTodosStore = create<TodosStore>(() => {
  const getTodo = async (id: number): Promise<Todo> => {
    const [res] = await db.todos.where({ id }).toArray()
    return res
  }
  const getTodos = async (): Promise<Todo[]> => {
    return db.todos.toArray()
  }

  const getTodayTodos = async (): Promise<Todo[]> => {
    const start = dayjs().startOf('day').valueOf()
    const end = dayjs().endOf('day').valueOf()

    return db.todos.where('modified').between(start, end, true, true).limit(5).reverse().toArray()
  }

  const getRecentTodos = (): Promise<Todo[]> => {
    return db.todos.orderBy('modified').limit(5).reverse().toArray()
  }

  const getTodosDateRange = (start: Date, end: Date): Promise<Todo[]> => {
    return db.todos.where('created').between(start.getTime(), end.getTime(), true, true).toArray()
  }

  const getTagsCount = async (): Promise<Record<string, number>[]> => {
    const todos = await db.todos.toArray()
    const map = todos.reduce<Record<string, number>>((acc, current) => {
      if (acc[current.tagId ?? 'undefined'] == null) acc[current.tagId ?? 'undefined'] = 1
      else acc[current.tagId ?? 'undefined']++
      return acc
    }, {})

    const result = []
    for (const key in map) {
      const item = { [key]: map[key] }
      result.push(item)
    }
    return result
  }

  const getCreatedSeries30d = async (date?: Date): Promise<CreatedSeriesPoint[]> => {
    const end = dayjs(date).startOf('day')
    const start = end.subtract(29, 'day') // 총 30칸
    const days: string[] = []
    for (let d = start; !d.isAfter(end); d = d.add(1, 'day')) {
      days.push(d.format('YYYY-MM-DD'))
    }

    const startMs = start.valueOf()
    const endMs = end.endOf('day').valueOf()

    // 사전 0 채우기
    const map = new Map<string, number>()
    for (const d of days) map.set(d, 0)

    // createdAt 인덱스가 있어야 빠릅니다: 'createdAt'
    const rows = await db.todos.where('created').between(startMs, endMs, true, true).toArray()

    for (const row of rows) {
      const key = dayjs(row.created ?? 0).format('YYYY-MM-DD')
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
    }

    return days.map((d) => ({ day: d, created: map.get(d) || 0 }))
  }

  const postDescription = (description: string): Promise<number> => {
    return db.todos.add({ description, created: Date.now(), modified: Date.now() })
  }

  const updateDescription = (id: number, description: string): Promise<number> => {
    return db.todos.update(id, { description, modified: Date.now() })
  }

  return {
    getTodo,
    getTodos,
    getTodayTodos,
    getRecentTodos,
    getTodosDateRange,
    getTagsCount,
    getCreatedSeries30d,
    postDescription,
    updateDescription,
  }
})
