import { produce } from 'immer'
import { create } from 'zustand'
import { api } from '../lib/api'
import { todosDB } from '../lib/todos.db'
import { GetTodosParams, Tag, TodoWithChildren } from '../models/Todo'
import etcUtil from '../utils/etc.util'
import { useSheetStore } from './sheet.store'

interface TodosPageStore {
  page: number
  isTodosLoading: boolean
  isTodosNextLoading: boolean
  isTodayTodosLoading: boolean
  isThisWeekTodosLoading: boolean
  isNextWeekTodosLoading: boolean
  total: number
  todos: TodoWithChildren[] | undefined
  todayTodos: TodoWithChildren[] | undefined
  thisWeekTodos: TodoWithChildren[] | undefined
  nextWeekTodos: TodoWithChildren[] | undefined
  children: TodoWithChildren[] | undefined
  childrenRoot: TodoWithChildren | undefined

  setPage: (page: number, cb?: (page: number) => void) => void

  setIsTodosLoading: (isTodosLoading: boolean) => void
  setIsTodosNextLoading: (isTodosNextLoading: boolean) => void
  setIsTodayTodosLoading: (isTodosLoading: boolean) => void
  setIsWeekTodosLoading: (isTodosLoading: boolean) => void

  setTotal: (total: number) => void

  setTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void
  setTodayTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void
  setThisWeekTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void
  setNextWeekTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void
  setChildren: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => void
  setChildrenRoot: (
    updater?: TodoWithChildren | ((prev?: TodoWithChildren) => TodoWithChildren | undefined)
  ) => void

  expandRow: (todo: TodoWithChildren) => Promise<void>
  updateStatus: (
    todoId: string,
    status: TodoWithChildren['status'],
    cb?: () => void
  ) => Promise<void>
  changeTag: (todoId: string, tag: Tag, cb?: () => void) => Promise<void>
  updateTime: (
    todo: TodoWithChildren,
    values: {
      start: TodoWithChildren['start']
      end: TodoWithChildren['end']
      days?: TodoWithChildren['days']
    },
    parentId?: string
  ) => Promise<void>
  createTodo: (parentId?: string) => Promise<TodoWithChildren>
  addChildren: (parent: TodoWithChildren) => Promise<TodoWithChildren>
  loadTodos: (params: GetTodosParams) => Promise<void>
  loadTodayTodos: (params: GetTodosParams) => Promise<void>
  loadThisWeekTodos: (params: GetTodosParams) => Promise<void>
  loadNextWeekTodos: (params: GetTodosParams) => Promise<void>
}

export const useTodosPageStore = create<TodosPageStore>((set, get) => ({
  page: 0,
  isTodosLoading: false,
  isTodosNextLoading: false,
  isTodayTodosLoading: false,
  isThisWeekTodosLoading: false,
  isNextWeekTodosLoading: false,
  total: 0,
  todos: undefined,
  todayTodos: undefined,
  thisWeekTodos: undefined,
  nextWeekTodos: undefined,
  children: undefined,
  childrenRoot: undefined,

  setPage: (page: number, cb?: (page: number) => void): void => {
    set({ page })
    cb?.(page)
  },

  setIsTodosLoading: (isTodosLoading: boolean): void => {
    set({ isTodosLoading })
  },

  setIsTodayTodosLoading: (isTodayTodosLoading: boolean): void => {
    set({ isTodayTodosLoading })
  },

  setIsWeekTodosLoading: (isThisWeekTodosLoading: boolean): void => {
    set({ isThisWeekTodosLoading })
  },

  setIsTodosNextLoading: (isTodosNextLoading: boolean): void => {
    set({ isTodosNextLoading })
  },

  setTotal: (total: number): void => {
    set({ total })
  },

  setTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) =>
    set((state) => ({
      todos: typeof updater === 'function' ? updater(state.todos) : updater,
    })),

  setChildren: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) =>
    set((state) => ({
      children: typeof updater === 'function' ? updater(state.children) : updater,
    })),

  setChildrenRoot: (
    updater?: TodoWithChildren | ((prev?: TodoWithChildren) => TodoWithChildren | undefined)
  ) =>
    set((state) => ({
      childrenRoot: typeof updater === 'function' ? updater(state.childrenRoot) : updater,
    })),

  setTodayTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) =>
    set((state) => ({
      todayTodos: typeof updater === 'function' ? updater(state.todayTodos) : updater,
    })),

  setThisWeekTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) => {
    set((state) => ({
      thisWeekTodos: typeof updater === 'function' ? updater(state.thisWeekTodos) : updater,
    }))
  },

  setNextWeekTodos: (
    updater?: TodoWithChildren[] | ((prev?: TodoWithChildren[]) => TodoWithChildren[] | undefined)
  ) =>
    set((state) => ({
      nextWeekTodos: typeof updater === 'function' ? updater(state.nextWeekTodos) : updater,
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
    todoId: string,
    status: TodoWithChildren['status'],
    cb?: () => void
  ): Promise<void> => {
    const todo = await todosDB.getTodo(todoId)
    const {
      setTodos,
      setTodayTodos,
      setThisWeekTodos,
      setNextWeekTodos,
      setChildren,
      setChildrenRoot,
    } = get()

    const modified = await todosDB.updateStatus(todo.id, status)

    const fileId = useSheetStore.getState().fileId
    if (fileId)
      api.patchSheetGoogleTodo(fileId, { index: todo?.index, status, modified }).then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    setChildrenRoot((prev) =>
      produce(prev, (draft) => {
        if (draft?.id === todo.id) draft.status = status
      })
    )

    setChildren((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )

    setTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.status = status
      })
    )

    cb?.()
  },

  changeTag: async (todoId: string, tag: Tag, cb?: () => void): Promise<void> => {
    const {
      setTodos,
      setTodayTodos,
      setThisWeekTodos,
      setNextWeekTodos,
      setChildren,
      setChildrenRoot,
    } = get()
    const todo = await todosDB.getTodo(todoId)
    const modified = await todosDB.updateTag(todo.id, tag.id)

    const fileId = useSheetStore.getState().fileId
    if (fileId)
      api.patchSheetGoogleTodo(fileId, { index: todo.index, tag: tag.id, modified }).then((res) => {
        if (res.ok) todosDB.updateDirties([todo.id], false)
      })

    setChildrenRoot((prev) =>
      produce(prev, (draft) => {
        if (draft?.id === todo.id) draft.tagId = tag.id
      })
    )

    setChildren((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.tagId = tag.id
      })
    )

    setTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.tagId = tag.id
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.tagId = tag.id
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.tagId = tag.id
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (draft) => {
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) target.tagId = tag.id
      })
    )

    cb?.()
  },

  updateTime: async (
    todo: TodoWithChildren,
    values: {
      start: TodoWithChildren['start']
      end: TodoWithChildren['end']
      days?: TodoWithChildren['days']
    }
  ): Promise<void> => {
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos } = get()

    const modified = await todosDB.updateTimes(todo.id, values)

    const fileId = useSheetStore.getState().fileId
    if (fileId)
      api
        .patchSheetGoogleTodo(fileId, {
          index: todo.index,
          modified,
          start: values.start,
          end: values.end,
          days: values.days?.join(',') ?? '',
        })
        .then((res) => {
          if (res.ok) todosDB.updateDirties([todo.id], false)
        })

    setTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) Object.assign(target, values)
      })
    )

    setTodayTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) Object.assign(target, values)
      })
    )

    setThisWeekTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) Object.assign(target, values)
      })
    )

    setNextWeekTodos((prev) =>
      produce(prev, (draft) => {
        if (!draft) return
        const target = draft?.find(({ id }) => id === todo.id)
        if (target) Object.assign(target, values)
      })
    )
  },

  createTodo: async (parentId?: string): Promise<TodoWithChildren> => {
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } = get()
    const todo = await todosDB.postDescription('', parentId)
    todosDB.updateDirties([todo.id], true)

    const fileId = useSheetStore.getState().fileId
    if (fileId) {
      api
        .postSheetGoogleTodo(fileId, {
          id: todo.id,
          created: todo.created,
          modified: todo.modified,
          parent: parentId,
        })
        .then((res) => {
          if (res.ok) {
            todosDB.updateDirties([todo.id], false)
            res.json().then((result) => todosDB.updateIndex(todo.id, result.index))
          }
        })
    }
    setTimeout(() => {
      setTodos(undefined)
      setTodayTodos(undefined)
      setThisWeekTodos(undefined)
      setNextWeekTodos(undefined)
      setChildren(undefined)
    }, 300)
    return todo
  },

  addChildren: async (parent: TodoWithChildren): Promise<TodoWithChildren> => {
    await todosDB.updateDirties([parent.id], true)
    const { setTodos, setTodayTodos, setThisWeekTodos, setNextWeekTodos, setChildren } = get()

    const newTodo = await todosDB.addNewTodo({
      id: etcUtil.generateUniqueId(),
      description: '',
      parentId: parent?.id,
      tagId: parent?.tagId,
      status: 'created',
    })

    const fileId = useSheetStore.getState().fileId

    api
      .patchSheetGoogleTodo(fileId, {
        index: parent.index,
        parent: parent.parentId,
        child: newTodo.id,
        modified: Date.now(),
      })
      .then((res) => {
        if (res.ok) todosDB.updateDirties([parent.id], false)
      })
    api
      .postSheetGoogleTodo(fileId, {
        id: newTodo.id,
        created: newTodo.created,
        modified: newTodo.modified,
        parent: parent.id,
      })
      .then((res) => {
        if (res.ok) {
          todosDB.updateDirties([newTodo.id], false)
          res.json().then((result) => todosDB.updateIndex(newTodo.id, result.index))
        }
      })

    setTimeout(() => {
      setTodos(undefined)
      setTodayTodos(undefined)
      setThisWeekTodos(undefined)
      setNextWeekTodos(undefined)
      setChildren(undefined)
    }, 300)

    return newTodo
  },

  loadTodos: async (params: GetTodosParams): Promise<void> => {
    const {
      isTodosLoading,
      isTodosNextLoading,
      setTotal,
      setTodos,
      setIsTodosLoading,
      setIsTodosNextLoading,
    } = get()
    if (isTodosLoading) return
    if (isTodosNextLoading) return

    if (params.page === 0) setIsTodosLoading(true)
    else setIsTodosNextLoading(true)

    const res = await todosDB.getTodos(params)
    setTotal(res.total)

    if (params.page === 0) setTodos(res.todos)
    else setTodos((prev) => [...(prev ?? []), ...res.todos])

    setIsTodosLoading(false)
    setIsTodosNextLoading(false)
  },

  async loadTodayTodos(params: GetTodosParams): Promise<void> {
    const { setTodayTodos, setIsTodayTodosLoading } = get()

    setIsTodayTodosLoading(true)
    const res = await todosDB.getTodayTodos(params)
    setTodayTodos(res.todos)
    setIsTodayTodosLoading(false)
  },

  async loadThisWeekTodos(params: GetTodosParams): Promise<void> {
    const { setThisWeekTodos, setIsWeekTodosLoading } = get()

    setIsWeekTodosLoading(true)
    const res = await todosDB.getThisWeekTodosWithoutToday(params)
    setThisWeekTodos(res.todos)
    setIsWeekTodosLoading(false)
  },

  async loadNextWeekTodos(params: GetTodosParams): Promise<void> {
    const { setNextWeekTodos, setIsWeekTodosLoading } = get()

    setIsWeekTodosLoading(true)
    const res = await todosDB.getNextWeekTodos(params)
    setNextWeekTodos(res.todos)
    setIsWeekTodosLoading(false)
  },
}))
