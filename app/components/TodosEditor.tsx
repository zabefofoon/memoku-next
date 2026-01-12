import { STATUS_MAP, TAG_COLORS } from '@/const'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClipboardEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { If, Then } from 'react-if'
import { useTagsStore } from '../stores/tags.store'
import { useThemeStore } from '../stores/theme.store'
import { useTodosDetailStore } from '../stores/todosDetail.store'
import { Icon } from './Icon'
import TodoTimeText from './TodoTimeText'

export default function TodosEditor() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const todo = useTodosDetailStore((s) => s.todo)
  const saveText = useTodosDetailStore((s) => s.saveText)
  const addImages = useTodosDetailStore((s) => s.addImages)
  const isDarkMode = useThemeStore((s) => s.isDarkMode)

  const tag = getTagsById(todo?.tagId)

  const textareaEl = useRef<HTMLTextAreaElement>(null)

  const [textValue, setTextValue] = useState<string>('')

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
    const files = Array.from(event.clipboardData.files ?? [])
    if (files.length === 0) return

    event.preventDefault()
    addImages(files)
  }

  useEffect(() => {
    setTextValue(todo?.description ?? '')
  }, [todo?.description])

  return (
    <div className='flex flex-col gap-[12px] | flex-1 w-full overflow-auto | relative | p-[8px]'>
      <div className='absolute top-[8px] right-[8px] | flex gap-[8px]'>
        <If condition={todo?.id}>
          <Then>
            <button
              type='button'
              className='neu-button !p-[4px]'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search)
                urlParams.append('time', todo?.id ?? '')
                router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                  scroll: false,
                })
              }}>
              <Icon
                name='alarm'
                className='expand-hitbox | text-[16px]'
              />
            </button>
            <button
              type='button'
              className='neu-button !p-[4px]'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search)
                urlParams.append('deleteModal', todo?.id ?? '')
                router.push(`?${decodeURIComponent(urlParams.toString())}`, {
                  scroll: false,
                })
              }}>
              <Icon
                name='delete'
                className='expand-hitbox | text-[16px]'
              />
            </button>
          </Then>
        </If>
      </div>
      <div className='flex items-center gap-[6px]'>
        <If condition={todo != null}>
          <Then>
            <button
              type='button'
              className='neu-button'
              onClick={() => router.push(`?todoTag=${todo?.id}`)}>
              <Icon
                name='tag-active'
                className='text-[11px] translate-y-[1px]'
                style={{
                  color: tag
                    ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-500)'
                    : 'var(--color-slate-500)',
                }}
              />
              <p>{tag?.label ?? 'MEMO'}</p>
            </button>
          </Then>
        </If>

        <button
          type='button'
          className='neu-button'
          style={{
            color: isDarkMode
              ? STATUS_MAP[todo?.status ?? 'created']?.darkColor
              : STATUS_MAP[todo?.status ?? 'created']?.color,
          }}
          onClick={() => {
            const urlParams = new URLSearchParams(searchParams.toString())
            urlParams.append('todoStatus', todo?.id ?? '')
            router.push(`?${decodeURIComponent(urlParams.toString())}`, {
              scroll: false,
            })
          }}>
          <Icon name={STATUS_MAP[todo?.status ?? 'created']?.icon} />
          <p>{t(`General.${todo?.status ?? 'created'}`)}</p>
        </button>
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full flex-1 | resize-none outline-0 | rounded-xl | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={(event) => saveText(event.currentTarget.value)}
        onPaste={handlePaste}></textarea>
      {todo && (
        <TodoTimeText
          todo={todo}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()

            const urlParams = new URLSearchParams(searchParams.toString())
            urlParams.append('time', todo.id)
            router.push(`?${decodeURIComponent(urlParams.toString())}`, {
              scroll: false,
            })
          }}
        />
      )}
    </div>
  )
}
