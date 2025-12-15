import { STATUS_MAP, TAG_COLORS } from '@/const'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClipboardEvent, useEffect, useRef, useState } from 'react'
import { If, Then } from 'react-if'
import { useTagsStore } from '../stores/tags.store'
import { useTodosDetailStore } from '../stores/todosDetail.store'
import { Icon } from './Icon'
import TodoTimeText from './TodoTimeText'

export default function TodosEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getTagsById = useTagsStore((s) => s.getTagsById)
  const todo = useTodosDetailStore((s) => s.todo)
  const saveText = useTodosDetailStore((s) => s.saveText)
  const addImages = useTodosDetailStore((s) => s.addImages)

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
      <div className='absolute top-[8px] right-[8px] | flex gap-[4px] sm:gap-[8px]'>
        <If condition={todo?.id}>
          <Then>
            <Link
              href={`?time=${todo?.id}}`}
              className='rounded-full | p-[6px] | border border-gray-100'
              type='button'
              style={{
                boxShadow: '1px 1px 0 var(--color-gray-300), -1px -1px 0 white',
              }}>
              <Icon
                name='alarm'
                className='expand-hitbox | text-[16px]'
              />
            </Link>
            <Link
              href={`?deleteModal=${todo?.id}`}
              className='rounded-full | p-[6px] | border border-gray-100'
              type='button'
              style={{
                boxShadow: '1px 1px 0 var(--color-gray-300), -1px -1px 0 white',
              }}>
              <Icon
                name='delete'
                className='expand-hitbox | text-[16px]'
              />
            </Link>
          </Then>
        </If>
      </div>
      <div className='flex items-center gap-[6px]'>
        <If condition={todo != null}>
          <Then>
            <div className='neu-button | rounded-full | h-[34px] | flex'>
              <button
                type='button'
                className='button'
                onClick={() => router.push(`?todoTag=${todo?.id}`)}>
                <div className='button-inner | flex items-center gap-[4px]'>
                  <span
                    className='w-[8px] aspect-square | rounded-full | bg-red-500'
                    style={{
                      background: tag
                        ? TAG_COLORS[tag.color]?.white || 'var(--color-slate-800)'
                        : 'var(--color-slate-800)',
                    }}></span>
                  <p className='text-[11px] text-gray-600 leading-[100%]'>{tag?.label ?? 'MEMO'}</p>
                </div>
              </button>
            </div>
          </Then>
        </If>

        <div className='neu-button | relative | rounded-full '>
          <button
            type='button'
            className='button'
            style={{
              color: STATUS_MAP[todo?.status ?? 'created']?.color,
            }}
            onClick={() => {
              const urlParams = new URLSearchParams(searchParams.toString())
              router.push(`?${decodeURIComponent(urlParams.toString())}&todoStatus=${todo?.id}`, {
                scroll: false,
              })
            }}>
            <div className='button-inner | flex items-center'>
              <Icon name={STATUS_MAP[todo?.status ?? 'created']?.icon} />
              <p className='text-[11px] leading-[100%] whitespace-nowrap'>
                {STATUS_MAP[todo?.status ?? 'created']?.label}
              </p>
            </div>
          </button>
        </div>
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full flex-1 | resize-none outline-0 | rounded-xl | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={(event) => saveText(event.currentTarget.value)}
        onPaste={handlePaste}></textarea>
      {todo && <TodoTimeText todo={todo} />}
    </div>
  )
}
