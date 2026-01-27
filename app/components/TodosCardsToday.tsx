import { COOKIE_DISPLAY } from '@/const'
import { useTranslations } from 'next-intl'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { useTransitionRouter } from '../hooks/useTransitionRouter'
import { tagsDB } from '../lib/tags.db'
import { useThemeStore } from '../stores/theme.store'
import { useTodosPageStore } from '../stores/todosPage.store'
import { useTutorialStore } from '../stores/tutorial.store'
import etcUtil from '../utils/etc.util'
import { TodoCard } from './TodosCard'
import UISpinner from './UISpinner'

export default function TodosCardsToday() {
  const t = useTranslations()
  const [cookies] = useCookies([COOKIE_DISPLAY])
  const screenSize = useThemeStore((s) => s.screenSize)
  const isTodosLoading = useTodosPageStore((state) => state.isTodayTodosLoading)
  const todos = useTodosPageStore((state) => state.todayTodos)
  const setTutorial = useTutorialStore((s) => s.setTutorialStep)
  const tutorialStep = useTutorialStore((s) => s.tutorialStep)
  const changeTag = useTodosPageStore((state) => state.changeTag)
  const router = useTransitionRouter()

  if (!todos?.length) return null

  return (
    <div>
      <p className='px-[16px] sm:p-0 mb-[16px] | text-[15px] text-gray-600 dark:text-zinc-400'>
        {t('Todo.TodayTodos')}({todos.length})
      </p>
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
                  <div
                    key={todo.id}
                    className={etcUtil.classNames([
                      { 'tutorial-dim relative z-[50]': [5, 6].includes(tutorialStep ?? -1) },
                    ])}
                    style={{
                      anchorName: '--todo-card',
                    }}
                    role='presentation'
                    onClick={async (event) => {
                      if ([5, 6].includes(tutorialStep ?? -1)) {
                        event.preventDefault()
                        event.stopPropagation()

                        if (tutorialStep === 5) {
                          const tags = await tagsDB.getAllTags()
                          changeTag(todo.id, tags[0])
                          setTutorial(6)
                        } else {
                          router.replace('/app', { scroll: true })
                          setTutorial(7)
                        }
                      }
                    }}>
                    <TodoCard
                      display={
                        screenSize === 'desktop' && cookies[COOKIE_DISPLAY] !== 'grid'
                          ? 'row'
                          : 'grid'
                      }
                      todo={todo}
                    />
                  </div>
                ))}
              </div>
            </Else>
          </If>
        </Else>
      </If>
    </div>
  )
}
