import { Fragment, useEffect, useRef } from 'react'
import { Else, If, Then } from 'react-if'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

interface Props {
  loadTodos: (page: number) => void
}

export default function TodosCards(props: Props) {
  const isTodosNextLoading = useTodosPageStore((state) => state.isTodosNextLoading)
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const page = useTodosPageStore((state) => state.page)
  const setPage = useTodosPageStore((state) => state.setPage)
  const todos = useTodosPageStore((state) => state.todos)
  const total = useTodosPageStore((state) => state.total)
  const todayTodos = useTodosPageStore((state) => state.todayTodos)
  const thisWeekTodos = useTodosPageStore((state) => state.thisWeekTodos)
  const nextWeekTodos = useTodosPageStore((state) => state.nextWeekTodos)

  const nextLoaderEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isLoadable = entry.isIntersecting && !isTodosNextLoading && !isTodosLoading
      if (isLoadable) setPage(page + 1, props.loadTodos)
    })
    if (nextLoaderEl.current) observer.observe(nextLoaderEl.current)

    return () => observer.disconnect()
  }, [isTodosLoading, isTodosNextLoading, page, props.loadTodos, setPage])

  return (
    <If condition={isTodosLoading}>
      <Then>
        <div>
          <p className='px-[16px] mb-[16px] | text-[15px] text-gray-600'>전체</p>
          <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
            <UISpinner />
          </div>
        </div>
      </Then>
      <Else>
        <If condition={!todos?.length}>
          <Then>
            <If condition={!todayTodos?.length && !thisWeekTodos?.length && !nextWeekTodos?.length}>
              <Then>
                <div>
                  <p className='px-[16px] mb-[16px] | text-[15px] text-gray-600'>전체</p>
                  <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
                    <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
                  </div>
                </div>
              </Then>
              <Else>
                <div></div>
              </Else>
            </If>
          </Then>
          <Else>
            <div>
              <p className='px-[16px] mb-[16px] | text-[15px] text-gray-600'>전체</p>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[12px] | px-[16px]'>
                {todos?.map((todo) => (
                  <Fragment key={todo.id}>
                    <TodoCard todo={todo} />
                    <If condition={todo.isExpanded}>
                      <Then>
                        {todo.children?.map((child) => (
                          <div
                            key={child.id}
                            className='flex items-center gap-[4px]'>
                            <Icon
                              name='reply'
                              className='text-[16px]'
                            />
                            <TodoCard todo={child} />
                          </div>
                        ))}
                      </Then>
                    </If>
                  </Fragment>
                ))}
                <If condition={!isTodosLoading && todos && (total ?? 0) > todos.length}>
                  <Then>
                    <div
                      ref={nextLoaderEl}
                      className='text-center | py-[6px]'>
                      <UISpinner />
                    </div>
                  </Then>
                </If>
              </div>
            </div>
          </Else>
        </If>
      </Else>
    </If>
  )
}
