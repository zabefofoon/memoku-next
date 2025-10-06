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
  postDescription: (description: string, parentId?: number) => Promise<number>
  updateDescription: (id: number, description: string) => Promise<number>
  updateRange: (id: number, range: { start?: number; end?: number }) => Promise<number>
  getDescendantsFlat: (rootId: number) => Promise<Todo[]>
  getAncestorsFlat: (childId: number) => Promise<Todo[]>
  addNewTodo: (todo: Todo) => Promise<number>
}

export const useTodosStore = create<TodosStore>(() => {
  const getTodo = async (id: number): Promise<Todo> => {
    const [res] = await db.todos.where({ id }).toArray()
    return res
  }
  const getTodos = async (): Promise<Todo[]> => {
    return db.todos.where('parentId').equals(-1).toArray()
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

  const postDescription = (description: string, parentId = -1): Promise<number> => {
    return db.todos.add({ description, parentId, created: Date.now(), modified: Date.now() })
  }

  const addNewTodo = (todo: Todo): Promise<number> => {
    return db.todos.add({ ...todo, created: Date.now(), modified: Date.now() })
  }

  const updateDescription = (id: number, description: string): Promise<number> => {
    return db.todos.update(id, { description, modified: Date.now() })
  }

  const updateRange = (id: number, range: { start?: number; end?: number }): Promise<number> => {
    return db.todos.update(id, range)
  }

  const getDescendantsFlat = async (rootId: number) => {
    const result: Todo[] = []
    const queue: number[] = [rootId]
    const seen = new Set<number>([rootId]) // 사이클 방지

    while (queue.length) {
      const pid = queue.shift()!
      const children = await db.todos.where('parentId').equals(pid).toArray()
      for (const child of children) {
        if (!child.id || seen.has(child.id)) continue
        result.push(child)
        seen.add(child.id)
        queue.push(child.id)
      }
    }
    return result
  }

  const getAncestorsFlat = async (childId: number): Promise<Todo[]> => {
    const out: Todo[] = []
    const seen = new Set<number>()

    const cur = await db.todos.get(childId)
    if (!cur) return out

    let pid = cur.parentId ?? -1
    while (typeof pid === 'number' && pid !== -1 && !seen.has(pid)) {
      seen.add(pid)
      const parent = await db.todos.get(pid)
      if (!parent) break
      out.push(parent)
      pid = parent.parentId ?? -1
    }

    return out.reverse()
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
    updateRange,
    getDescendantsFlat,
    getAncestorsFlat,
    addNewTodo,
  }
})
