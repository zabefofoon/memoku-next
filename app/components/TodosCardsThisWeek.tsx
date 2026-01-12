import { COOKIE_DISPLAY } from '@/const'
import { useTranslations } from 'next-intl'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { useThemeStore } from '../stores/theme.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import etcUtil from '../utils/etc.util'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

export default function TodosCardsThisWeek() {
  const t = useTranslations()
  const [cookies] = useCookies([COOKIE_DISPLAY])
  const screenSize = useThemeStore((s) => s.screenSize)
  const isTodosLoading = useTodosPageStore((state) => state.isThisWeekTodosLoading)
  const todos = useTodosPageStore((state) => state.thisWeekTodos)

  if (!todos?.length) return null

  return (
    <div>
      <p className='px-[16px] sm:p-0 mb-[16px] | text-[15px] text-gray-600 dark:text-zinc-400'>
        {t('Todo.ThisWeekTodos')}({todos.length})
      </p>
      <If condition={todos?.length && isTodosLoading}>
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
                <p className='text-[13px] opacity-70'>{t('General.EmptyData')}</p>
              </div>
            </Then>
            <Else>
              <div
                className={etcUtil.classNames([
                  'grid | px-[16px] sm:pl-0',
                  screenSize === 'desktop' && cookies[COOKIE_DISPLAY] !== 'grid'
                    ? 'grid-cols-1'
                    : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[8px]',
                ])}>
                {todos?.map((todo) => (
                  <TodoCard
                    display={
                      screenSize === 'desktop' && cookies[COOKIE_DISPLAY] !== 'grid'
                        ? 'row'
                        : 'grid'
                    }
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
