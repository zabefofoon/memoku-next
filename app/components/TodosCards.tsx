import { Fragment } from 'react'
import { Else, If, Then } from 'react-if'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

export default function TodosCards() {
  const isTodosLoading = useTodosPageStore((state) => state.isTodosLoading)
  const todos = useTodosPageStore((state) => state.todos)
  const todayTodos = useTodosPageStore((state) => state.todayTodos)
  const thisWeekTodos = useTodosPageStore((state) => state.thisWeekTodos)
  const nextWeekTodos = useTodosPageStore((state) => state.nextWeekTodos)

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
              </div>
            </div>
          </Else>
        </If>
      </Else>
    </If>
  )
}
