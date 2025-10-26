import { db } from '@/app/lib/dexie.db'
import { GetTodosParams, Todo, WeekDay } from '@/app/models/Todo'
import dayjs from 'dayjs'
import { Collection } from 'dexie'
import { create } from 'zustand'

export interface CreatedSeriesPoint {
  day: string
  created: number
}

export const useTodosStore = create(() => {
  const getTodo = async (id: number): Promise<Todo> => {
    const [res] = await db.todos.where({ id }).toArray()
    return res
  }
  const getTodos = async (params?: GetTodosParams): Promise<Todo[]> => {
    const isRoot = (t: Todo) => t.parentId == null || t.parentId === -1

    const tags = params?.tags?.filter(Boolean)
    const status = params?.status?.trim()
    const query = params?.searchText?.trim().toLowerCase()

    let coll: Collection<Todo, number>
    if (tags && tags.length > 0) coll = db.todos.where('tagId').anyOf(tags)
    else if (status) coll = db.todos.where('status').equals(status)
    else coll = db.todos.toCollection()

    coll = query?.length
      ? coll.and((t) => (t.description ?? '').toLowerCase().includes(query))
      : coll.and(isRoot)
    if (status) coll = coll.and((t) => t.status === status)

    return (await coll.sortBy('created')).reverse()
  }

  const getParentTodo = async (parentId: number): Promise<Todo> => {
    const [res] = await db.todos.where({ id: parentId }).toArray()
    return res
  }

  const getChildTodo = async (id: number): Promise<Todo> => {
    const [res] = await db.todos.where({ parentId: id }).toArray()
    return res
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
    const startTs = start.getTime()
    const endTs = end.getTime()

    return db.transaction('r', db.todos, async () => {
      const [byCreated, byOverlap, byDays] = await Promise.all([
        db.todos.where('created').between(startTs, endTs, true, true).toArray(),

        db.todos
          .where('start')
          .belowOrEqual(endTs)
          .and((t) => typeof t.end === 'number' && t.end >= startTs)
          .toArray(),

        db.todos.filter((t) => Array.isArray(t.days) && t.days.length > 0).toArray(),
      ])

      const map = new Map<number, Todo>()
      for (const arr of [byCreated, byOverlap, byDays]) {
        for (const t of arr) if (typeof t.id === 'number') map.set(t.id, t)
      }
      return [...map.values()]
    })
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
    return db.todos.add({
      description,
      parentId,
      status: 'created',
      created: Date.now(),
      modified: Date.now(),
    })
  }

  const addNewTodo = (todo: Todo): Promise<number> => {
    return db.transaction('rw', db.todos, async () => {
      const id = await db.todos.add({ ...todo, created: Date.now(), modified: Date.now() })
      if (todo.parentId) await db.todos.update(todo.parentId, { childId: id })

      return id
    })
  }

  const updateDescription = (id: number, description: string): Promise<number> => {
    return db.todos.update(id, { description, modified: Date.now() })
  }

  const updateTimes = (
    id: number,
    range: { start?: number; end?: number; days?: WeekDay[] }
  ): Promise<number> => {
    return db.todos.update(id, { ...range, modified: Date.now() })
  }

  const updateTag = (id: number, tagId: string): Promise<number> => {
    return db.todos.update(id, { tagId })
  }

  const updateStatus = (id: number, status: Todo['status']): Promise<number> => {
    return db.todos.update(id, { status, modified: Date.now() })
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

  const deleteTodo = async (id: number): Promise<number> => {
    await db.images.where('todoId').equals(id).delete()

    return db.transaction('rw', db.todos, async () => {
      const target = await db.todos.get(id)
      if (!target) return -1
      db.todos.where('parentId').equals(id).modify({ parentId: target.parentId })
      db.todos.where('childId').equals(id).modify({ childId: target.childId })

      return db.todos.where({ id }).delete()
    })
  }

  return {
    getTodo,
    getParentTodo,
    getChildTodo,
    getTodos,
    getTodayTodos,
    getRecentTodos,
    getTodosDateRange,
    getTagsCount,
    getCreatedSeries30d,
    postDescription,
    updateDescription,
    updateTimes,
    updateStatus,
    getDescendantsFlat,
    getAncestorsFlat,
    addNewTodo,
    deleteTodo,
    updateTag,
  }
})
