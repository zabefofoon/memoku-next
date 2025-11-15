// db.ts
import type { Table } from 'dexie'
import Dexie from 'dexie'
import { Setting, Tag, Todo } from '../models/Todo'

export class MySubClassedDexie extends Dexie {
  todos!: Table<Todo>
  setting!: Table<Setting>
  images!: Table<{ id: string; image: Blob; todoId: string }> // 새로운 이미지 테이블 타입 정의
  tags!: Table<Tag>

  constructor() {
    super('SimpleTodo')

    // 스키마 정의
    this.version(2).stores({
      todos:
        'id, description, tagId, created, modified, parentId, childId, start, end, status, days, dirty, index',
      setting: '++id, tags, forms',
      images: 'id, image, todoId',
      tags: 'id, color, label',
    })

    this.version(2).upgrade(async (tx) => {
      const todos = await tx.table('todos').toArray()
      const imageTable = tx.table('images')

      // todos 테이블에서 images 데이터를 분리하여 새로운 테이블에 삽입
      for (const todo of todos) {
        if (todo.images) {
          for (const image of todo.images) {
            await imageTable.add({ image, todoId: todo.id }) // todoId로 연결
          }
        }
        delete todo.images // 기존 테이블에서 images 필드 제거
        todo.parentId = -1

        await tx.table('todos').put(todo)
      }

      const settings = await tx.table<Setting>('setting').toArray()
      if (settings.length > 0) {
        // 여러 row가 있을 수 있으니 전부 순회
        const allTags: Tag[] = []
        for (const setting of settings) {
          if (Array.isArray(setting.tags) && setting.tags.length > 0) {
            allTags.push(...setting.tags.map((tag) => ({ ...tag })))
            await tx.table<Setting>('setting').put(setting)
          }
        }
        if (allTags.length > 0) await tx.table<Tag>('tags').bulkAdd(allTags)
      }
    })

    this.version(3).upgrade(async (tx) => {
      const table = tx.table<Todo>('todos')
      const seen = new Set<number>()

      await table
        .where('parentId')
        .aboveOrEqual(0)
        .each(async (child) => {
          const pid = child.parentId
          if (typeof pid !== 'number') return
          if (seen.has(pid)) return

          const parent = await table.get(pid)
          if (!parent) return
          if (parent.id === child.id) return

          await table.update(pid, { childId: child.id })
          seen.add(pid)
        })
    })
  }
}

export const db = new MySubClassedDexie()
