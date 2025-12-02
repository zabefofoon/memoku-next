import { produce } from 'immer'
import { create } from 'zustand'
import { api } from '../lib/api'
import { todosDB } from '../lib/todos.db'
import { GetTodosParams, Tag, TodoWithChildren } from '../models/Todo'
import { useSheetStore } from './sheet.store'

interface TodosPageStore {
  page: number
  setPage: (page: number, cb?: (page: number) => void) => void

  isTodosLoading: boolean
  setIsTodosLoading: (isTodosLoading: boolean) => void

  isTodosNextLoading: boolean
  setIsTodosNextLoading: (isTodosNextLoading: boolean) => void

  total: number
  setTotal: (total: number) => void

  todos: TodoWithChildren[] | undefined
  setTodos: (
    updater: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void

  expandRow: (todo: TodoWithChildren) => Promise<void>
  updateStatus: (
    todo: TodoWithChildren,
    status: TodoWithChildren['status'],
    parentId?: string
  ) => Promise<void>

  changeTag: (todo: TodoWithChildren, tag: Tag) => Promise<void>
  updateTime: (
    todo: TodoWithChildren,
    values: {
      start: TodoWithChildren['start']
      end: TodoWithChildren['end']
      days?: TodoWithChildren['days']
    },
    parentId?: string
  ) => Promise<void>
  createTodo: () => Promise<TodoWithChildren>
  loadTodos: (params: GetTodosParams) => Promise<void>
}

export const useTodosPageStore = create<TodosPageStore>((set, get) => ({
  page: 0,
  isTodosLoading: false,
  isTodosNextLoading: false,
  total: 0,
  todos: undefined,

  setPage: (page: number, cb?: (page: number) => void): void => {
    set({ page })
    cb?.(page)
  },

  setIsTodosLoading: (isTodosLoading: boolean): void => {
    set({ isTodosLoading })
  },

  setIsTodosNextLoading: (isTodosNextLoading: boolean): void => {
    set({ isTodosNextLoading })
  },

  setTotal: (total: number): void => {
    set({ total })
  },

  setTodos: (
    updater: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) =>
    set((state) => ({
      todos: typeof updater === 'function' ? updater(state.todos) : updater,
    })),

  expandRow: async (todo: TodoWithChildren): Promise<void> => {
    let children = todo.children
    if (!todo.isExpanded && todo.childId && !todo.children) {
      children = await todosDB.getDescendantsFlat(todo.id)
    }

    get().setTodos((prev) =>
      prev?.map((item) =>
        item.id === todo.id ? { ...item, isExpanded: !todo.isExpanded, children } : item
      )
    )
  },
  updateStatus: async (
    todo: TodoWithChildren,
    status: TodoWithChildren['status'],
    parentId?: string
  ): Promise<void> => {
    if (get().todos == null) return

    const modified = await todosDB.updateStatus(todo.id, status)
    api
      .patchSheetGoogleTodo(useSheetStore.getState().fileId, {
        index: todo?.index,
        status,
        modified,
      })
      .then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    get().setTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const list = parentId ? draft.find(({ id }) => id === parentId)?.children : draft
        const target = list?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )
  },
  changeTag: async (todo: TodoWithChildren, tag: Tag): Promise<void> => {
    const modified = await todosDB.updateTag(todo.id, tag.id)

    api
      .patchSheetGoogleTodo(useSheetStore.getState().fileId, {
        index: todo.index,
        tag: tag.id,
        modified,
      })
      .then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    get().setTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const found = draft.find(({ id }) => id === todo.id)
        if (found) found.tagId = tag.id
      })
    )
  },
  updateTime: async (
    todo: TodoWithChildren,
    values: {
      start: TodoWithChildren['start']
      end: TodoWithChildren['end']
      days?: TodoWithChildren['days']
    },
    parentId?: string
  ): Promise<void> => {
    const modified = await todosDB.updateTimes(todo.id, values)

    api
      .patchSheetGoogleTodo(useSheetStore.getState().fileId, {
        index: todo.index,
        modified,
        start: values.start,
        end: values.end,
        days: values.days?.join(',') ?? '',
      })
      .then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    get().setTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return

        const list = parentId ? draft.find(({ id }) => id === parentId)?.children : draft
        const target = list?.find(({ id }) => id === todo.id)
        if (target) Object.assign(target, values)
      })
    )
  },
  createTodo: async (): Promise<TodoWithChildren> => {
    const todo = await todosDB.postDescription('')
    todosDB.updateDirties([todo.id], true)

    const fileId = useSheetStore.getState().fileId
    if (fileId) {
      api
        .postSheetGoogleTodo(fileId, {
          id: todo.id,
          created: todo.created,
          modified: todo.modified,
        })
        .then((res) => {
          if (res.ok) {
            todosDB.updateDirties([todo.id], false)
            res.json().then((result) => todosDB.updateIndex(todo.id, result.index))
          }
        })
    }
    return todo
  },
  loadTodos: async (params: GetTodosParams): Promise<void> => {
    if (get().isTodosLoading) return
    if (get().isTodosNextLoading) return

    if (params.page === 0) get().setIsTodosLoading(true)
    else get().setIsTodosNextLoading(true)

    const res = await todosDB.getTodos(params)
    get().setTotal(res.total)

    if (params.page === 0) get().setTodos(res.todos)
    else get().setTodos((prev) => [...(prev ?? []), ...res.todos])

    get().setIsTodosLoading(false)
    get().setIsTodosNextLoading(false)
  },
}))
