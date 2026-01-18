'use client'

import { Icon } from '@/app/components/Icon'
import { Link } from '@/app/components/Link'
import { TodosDeleteModal } from '@/app/components/TodosDeleteModal'
import TodosEditor from '@/app/components/TodosEditor'
import { TodosImages } from '@/app/components/TodosImages'
import { TodosStatusModal } from '@/app/components/TodosStatusModal'
import { TodosTagModal } from '@/app/components/TodosTagModal'
import TodosTimeModal from '@/app/components/TodosTimeModal'
import UISpinner from '@/app/components/UISpinner'
import { useTodosDetailStore } from '@/app/stores/todosDetail.store'
import etcUtil from '@/app/utils/etc.util'
import { COOKIE_DEVICE_ID } from '@/const'
import { useTranslations } from 'next-intl'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useCookies } from 'react-cookie'
import { Else, If, Then } from 'react-if'
import { useTranstionsStore } from '../stores/transitions.store'

export default function TodosDetailClient() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [cookies] = useCookies()
  const t = useTranslations()

  const todo = useTodosDetailStore((s) => s.todo)
  const changeTagInStore = useTodosDetailStore((s) => s.changeTag)
  const updateStatus = useTodosDetailStore((s) => s.updateStatus)
  const updateTime = useTodosDetailStore((s) => s.updateTime)
  const isLoading = useTodosDetailStore((s) => s.isLoading)
  const setIsLoading = useTodosDetailStore((s) => s.setIsLoading)
  const text = useTodosDetailStore((s) => s.text)
  const addChildren = useTodosDetailStore((s) => s.addChildren)
  const parentTodo = useTodosDetailStore((s) => s.parentTodo)
  const childTodo = useTodosDetailStore((s) => s.childTodo)
  const loadImages = useTodosDetailStore((s) => s.loadImages)
  const deleteTodo = useTodosDetailStore((s) => s.deleteTodo)
  const loadTodo = useTodosDetailStore((s) => s.loadTodo)
  const setChildTodo = useTodosDetailStore((s) => s.setChildTodo)
  const setParentTodo = useTodosDetailStore((s) => s.setParentTodo)
  const setImages = useTodosDetailStore((s) => s.setImages)
  const setIsLoaded = useTranstionsStore((s) => s.setIsLoaded)
  const randomizeIndex = useRef<number>(0)
  const guideTexts = t.raw('Todo.Guide')

  useLayoutEffect(() => {
    setIsLoading(true)
    setIsLoaded(true)
  }, [setIsLoading, setIsLoaded])

  useEffect(() => {
    return () => {
      setChildTodo()
      setParentTodo()
      setImages([])
    }
  }, [setChildTodo, setParentTodo, setImages])

  useEffect(() => {
    randomizeIndex.current = Math.floor(Math.random() * guideTexts.length)

    loadTodo(params.id as string).then((todo) => {
      if (todo) loadImages(todo)
    })
  }, [guideTexts.length, loadImages, loadTodo, params.id])

  if (isLoading)
    return (
      <div className='flex-1 | flex items-center justify-center'>
        <UISpinner />
      </div>
    )
  else if (todo != null)
    return (
      <div className='flex-1 | flex flex-col | max-h-full | px-[16px] sm:px-0 mt-[12px] mb-[24px] sm:mt-0'>
        <TodosTimeModal
          isShow={!!searchParams.get('time')}
          todo={todo}
          updateTime={(_, values, device_id) => updateTime(values, device_id)}
          close={router.back}
        />
        <TodosDeleteModal
          isShow={!!searchParams.get('deleteModal')}
          close={router.back}
          done={() =>
            deleteTodo(cookies[COOKIE_DEVICE_ID], () => {
              router.back()
              etcUtil.sleep(250).then(router.back)
            })
          }
        />
        <TodosTagModal
          isShow={!!searchParams.get('todoTag')}
          close={router.back}
          select={(tag) => changeTagInStore(tag, router.back)}
        />
        <TodosStatusModal
          isShow={!!searchParams.get('todoStatus')}
          close={router.back}
          select={(status) => updateStatus(status, router.back)}
        />

        <div className='mb-[24px]'>
          <button
            type='button'
            className='opacity-80 | flex items-center | max-w-[300px]'
            onClick={() => router.back()}>
            <Icon
              name='chevron-left'
              className='text-[20px] sm:text-[24px]'
            />

            <p className='text-[18px] sm:text-[20px] truncate'>
              {text.split(/\n/)[0] || t('Todo.EditPlaceholder')}
            </p>
          </button>
          <p className='text-[13px] sm:text-[15px] opacity-50 | hidden sm:block'>
            {guideTexts[randomizeIndex.current]}
          </p>
        </div>
        <If condition={todo.parentId != null}>
          <Then>
            <div className='emboss-sheet | mb-[12px]'>
              <Link
                href={`/app/todos/${todo.parentId}`}
                replace
                className='px-[8px] py-[12px] | text-[13px] | flex gap-[12px]'>
                <p className='shrink-0 | flex items-center | opacity-70'>
                  <Icon
                    name='chevron-up'
                    className='text-[20px]'
                  />
                  {t('Todo.Upper')}
                </p>
                <p className='truncate'>{parentTodo?.description?.split(/\n/)[0]}</p>
              </Link>
            </div>
          </Then>
        </If>

        <div className='pb-[4px] | flex-1 overflow-hidden | flex gap-[16px] flex-col sm:flex-row'>
          <div className='emboss-sheet | p-[8px] | w-full h-full | flex flex-col | sm:overflow-auto'>
            <TodosEditor />
          </div>
          <TodosImages />
        </div>

        <If condition={childTodo != null}>
          <Then>
            <div className='emboss-sheet | mt-[12px]'>
              <Link
                href={`/app/todos/${childTodo?.id}`}
                replace
                className='px-[8px] py-[12px] | text-[13px] | flex gap-[12px]'>
                <p className='shrink-0 | flex items-center | opacity-70'>
                  <Icon
                    name='chevron-down'
                    className='text-[20px]'
                  />
                  {t('Todo.Lower')}
                </p>
                <p className='truncate'>{childTodo?.description?.split(/\n/)[0]}</p>
              </Link>
            </div>
          </Then>
          <Else>
            <button
              className='flex items-center justify-center | shadow-lg bg-indigo-500 | text-white | pl-[12px] pr-[20px] py-[12px] mt-[12px] mx-auto | w-full sm:w-fit | rounded-2xl'
              type='button'
              onClick={() => addChildren((id) => router.replace(`/app/todos/${id}`))}>
              <Icon
                name='chevron-down'
                className='text-[20px]'
              />
              <p className='text-[15px]'>{t('Todo.AddChildren')}</p>
            </button>
          </Else>
        </If>
      </div>
    )
}
