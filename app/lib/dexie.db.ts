import Dexie, { type Table } from 'dexie'
import type { ImageRow, Setting, Tag, Todo } from '../models/Todo'

export class MySubClassedDexie extends Dexie {
  todos!: Table<Todo>
  images!: Table<ImageRow>
  setting!: Table<Setting>
  tags!: Table<Tag>

  constructor() {
    super('SimpleTodo')

    this.version(1).stores({
      todos: '++id, date, description, tagId, time, created, upto, done, modified',
      setting: '++id, tags, forms',
      images: '++id, image, todoId',
    })

    this.version(2)
      .stores({
        // 기존 테이블들 (PK 그대로 유지)
        todos: '++id, date, description, tagId, time, created, upto, done, modified',
        images: '++id, image, todoId',
        setting: '++id, tags, forms',

        // 새 테이블들 – string id를 PK로 사용
        todos2:
          'id, description, tagId, created, modified, parentId, childId, start, end, status, days, dirty, index',
        images2: 'id, image, todoId',
        tags: 'id, color, label, dirty, modified, index',
      })
      .upgrade(async (tx) => {
        // 1) todos -> todos2 로 복사 (id를 string화)
        const oldTodos = await tx.table('todos').toArray()
        const todos2 = tx.table<Todo>('todos2')

        for (const old of oldTodos) {
          const newId = String(old.id) // number -> string

          const todo: Todo = {
            id: newId,
            description: old.description ?? '',
            tagId: old.tagId ?? undefined,
            created: old.created ?? Date.now(),
            modified: old.modified ?? Date.now(),
            // v1에 없던 필드는 기본값/undefined로
            parentId: old.parentId ?? undefined,
            childId: old.childId ?? undefined,
            start: old.start ?? undefined,
            end: old.end ?? undefined,
            status: old.status ?? undefined,
            days: old.days ?? undefined,
            dirty: old.dirty ?? true,
            index: old.index ?? undefined,
          }

          await todos2.add(todo)
        }

        // 2) images -> images2 로 복사 (todoId도 string으로 변환)
        const oldImages = await tx.table('images').toArray()
        const images2 = tx.table<ImageRow>('images2')

        for (const old of oldImages) {
          const row: ImageRow = {
            id: String(old.id),
            image: old.image,
            todoId: String(old.todoId),
          }
          await images2.add(row)
        }

        const settings = await tx.table<Setting>('setting').toArray()
        const tagsTable = tx.table<Tag>('tags')

        const allTags: Tag[] = []
        for (const setting of settings) {
          if (Array.isArray(setting.tags) && setting.tags.length > 0) {
            for (const tag of setting.tags) {
              allTags.push({ ...tag, id: String(tag.id), dirty: true })
            }
          }
        }

        if (allTags.length > 0) await tagsTable.bulkAdd(allTags)
      })

    /**
     * v3 – 더 이상 쓰지 않을 기존 테이블 제거
     *  - 테이블 이름에 null을 넣으면 삭제됨
     */
    this.version(3).stores({
      todos: null,
      images: null,
      setting: null,
      todos2:
        'id, description, tagId, created, modified, parentId, childId, start, end, status, days, dirty, index',
      images2: 'id, image, todoId',
      tags: 'id, color, label, dirty, modified, index',
    })

    // 최종적으로 앱 코드에서 쓸 alias를 잡아줌
    // 이제 db.todos → 실제로는 todos2 테이블을 가리키게 됨
    this.todos = this.table('todos2')
    this.images = this.table('images2')
    this.tags = this.table('tags')
  }
}

export const db = new MySubClassedDexie()
