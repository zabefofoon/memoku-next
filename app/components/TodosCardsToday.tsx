import { Fragment } from 'react'
import { Else, If, Then } from 'react-if'
import { useTodosPageStore } from '../stores/todosPage.store'
import { Icon } from './Icon'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

export default function TodosCardsToday() {
  const isTodosLoading = useTodosPageStore((state) => state.isTodayTodosLoading)
  const todos = useTodosPageStore((state) => state.todayTodos)

  if (!todos?.length) return null

  return (
    <div>
      <p className='px-[16px] mb-[16px] | text-[15px] text-gray-600'>오늘 할 일</p>
      <If condition={isTodosLoading}>
        <Then>
          {() => (
            <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
              <UISpinner />
            </div>
          )}
        </Then>
        <Else>
          <If condition={!todos?.length}>
            <Then>
              <div className='flex-1 h-full | py-[80px] px-[16px] | text-center'>
                <p className='text-[13px] opacity-70'>데이터가 없습니다.</p>
              </div>
            </Then>
            <Else>
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
            </Else>
          </If>
        </Else>
      </If>
    </div>
  )
}
