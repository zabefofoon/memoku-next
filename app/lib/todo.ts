'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './dexie.db'

export function useTodos() {
  const recentTodos = useLiveQuery(
    () => db.todos.orderBy('modified').limit(10).reverse().toArray(),
    [],
    [] // 초기값
  )

  return {
    recentTodos,
  }
}

export function useTags() {
  const tags = useLiveQuery(
    () => db.tags.toArray(),
    [],
    [] // 초기값
  )

  return tags
}
