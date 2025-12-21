import { COOKIE_DISPLAY } from '@/const'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { useThemeStore } from '../stores/theme.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

export default function TodosCardsToday() {
  const [cookies] = useCookies([COOKIE_DISPLAY])
  const screenSize = useThemeStore((s) => s.screenSize)
  const isTodosLoading = useTodosPageStore((state) => state.isTodayTodosLoading)
  const todos = useTodosPageStore((state) => state.todayTodos)

  if (!todos?.length) return null

  return (
    <div>
      <p className='px-[16px] mb-[16px] | text-[15px] text-gray-600'>오늘 할 일({todos.length})</p>
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
              <div
                className={etcUtil.classNames([
                  'grid | px-[16px]',
                  screenSize === 'desktop' && cookies[COOKIE_DISPLAY] !== 'grid'
                    ? 'grid-cols-1'
                    : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[12px]',
                ])}>
                {todos?.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                  />
                ))}
              </div>
            </Else>
          </If>
        </Else>
      </If>
    </div>
  )
}
