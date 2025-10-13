import { useDateUtil } from '@/app/hooks/useDateUtil'
import { Todo } from '@/app/models/Todo'
import { useTodosStore } from '@/app/stores/todos.store'
import etcUtil from '@/app/utils/etc.util'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, ClipboardEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { useImagesStore } from '../stores/images.store'
import { Icon } from './Icon'
import TagBadge from './TagBadge'
import TodosDatePicker from './TodosDatePicker'
import TodosDeleteButton from './TodosDeleteButton'
import { TodosDeleteModal } from './TodosDeleteModal'
import TodosPeriodText from './TodosPeriodText'
import TodosStatus from './TodosStatus'
import UIDropdown from './UIDropdown'

interface Props {
  todo?: Todo
  updateText?: (text: string, todoId?: number) => void
  updateStatus?: (status: Todo['status'], todoId?: number) => void
}

export default function TodosEditor(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const todosStore = useTodosStore()
  const imagesStore = useImagesStore()

  const fileInputEl = useRef<HTMLInputElement>(null)
  const textareaEl = useRef<HTMLTextAreaElement>(null)

  const [open, setOpen] = useState(false)
  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false)

  const dateUtil = useDateUtil()

  const [textValue, setTextValue] = useState<string>('')

  const [images, setImages] = useState<{ id?: number; image: string; todoId: number }[]>()

  const handleTextareaInput = (event: FormEvent<HTMLTextAreaElement>): void => {
    setTextareaAutoHeight()
    props.updateText?.(event.currentTarget.value, props.todo?.id)
  }

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
    const files = Array.from(event.clipboardData.files ?? [])
    if (files.length > 0) {
      event.preventDefault()
      for (const index in files) await addImage(files[index])
    }
  }

  const setTextareaAutoHeight = (): void => {
    if (textareaEl.current == null) return

    textareaEl.current.style.height = '0'
    textareaEl.current.style.height = `${textareaEl.current.scrollHeight}px`
  }

  const setTodoRange = (range?: { start?: number; end?: number }): void => {
    if (range == null) return
    if (props.todo == null) return

    props.todo.start = range.start
    props.todo.end = range.end

    if (props.todo.id != null) todosStore.updateRange(props.todo.id, range)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? [])

    if (files.length > 5) {
      alert('이미지는 최대 5개까지만 등록 가능합니다.')
      event.target.value = ''
      return
    }

    for (const index in files) await addImage(files[index])
  }

  const addImage = async (file: Blob): Promise<void> => {
    if (!props.todo?.id) return

    const [blob, base64String] = await etcUtil.fileToWebp(file)
    const id = await imagesStore.postImage(props.todo.id, blob)

    let removedId: number | undefined

    setImages((prev) => {
      const items = prev ? [...prev] : []
      if (items.length >= 5) removedId = items.pop()?.id
      items.unshift({ id, image: base64String, todoId: props.todo!.id as number })
      return items
    })

    if (removedId) await imagesStore.deleteImage(removedId)
  }

  const deleteImage = async (): Promise<void> => {
    const image = searchParams.get('image') ?? ''
    if (!isNaN(+image)) await imagesStore.deleteImage(+image)
    await loadImages()
    router.back()
  }

  const loadImages = async (): Promise<void> => {
    if (props.todo?.id == null) return

    const res = await imagesStore.getImages(props.todo.id)

    const imageData: { id?: number; image: string; todoId: number }[] = []
    for (const key in res) {
      const data = {
        id: res[key].id,
        image: await await etcUtil.blobToBase64(res[key].image),
        todoId: res[key].todoId,
      }
      imageData.push(data)
    }

    setImages(imageData)
  }

  useEffect(() => {
    loadImages()
    setTextValue(props.todo?.description ?? '')
    setTimeout(() => setTextareaAutoHeight())
  }, [props.todo?.description])

  useEffect(() => {
    if (pathname.endsWith(`${props.todo?.id}`)) setIsShowDeleteModal(!!searchParams.get('image'))
  }, [searchParams])

  return (
    <div className='flex flex-col gap-[12px] | w-full | relative | bg-white dark:bg-zinc-800 shadow-md rounded-xl | p-[8px]'>
      <TodosDeleteModal
        isShow={isShowDeleteModal}
        close={() => router.back()}
        delete={deleteImage}
      />
      <input
        accept='image/*'
        ref={fileInputEl}
        type='file'
        multiple
        hidden
        onChange={handleFileChange}
      />
      <div className='absolute top-[16px] right-[16px] | flex gap-[4px] sm:gap-[8px]'>
        {
          <button
            type='button'
            className='w-fit | bg-slate-100 dark:bg-zinc-700 | mx-auto p-[4px] rounded-full | flex items-center justify-center | text-slate-500 dark:text-white | hover:underline'
            onClick={() => fileInputEl.current?.click()}>
            <Icon
              name='image'
              className='text-[16px] sm:text-[20px]'
            />
          </button>
        }
        {props.todo?.id && <TodosDeleteButton id={props.todo.id} />}
      </div>
      <div className='flex items-center gap-[6px] px-[8px]'>
        {props.todo && (
          <TagBadge
            id={props.todo?.tagId}
            click={() => router.push(`?todoTag=${props.todo?.id}`)}
          />
        )}
        <TodosStatus
          status={props.todo?.status ?? 'created'}
          select={(status) => props.updateStatus?.(status, props.todo?.id)}
        />
        <UIDropdown
          isOpen={open}
          onOpenChange={setOpen}
          fitOptionsParent={false}
          renderButton={({ toggle }) => (
            <button
              type='button'
              className='flex items-center gap-[4px]'
              onClick={() => toggle()}>
              <Icon
                name='alarm'
                className={etcUtil.classNames(
                  'w-[32px] aspect-square rounded-full | flex items-center justify-center | text-[20px]',
                  props.todo && props.todo.start && props.todo.end
                    ? 'bg-violet-500 text-white'
                    : 'opacity-70 | bg-slate-100 text-slate-600'
                )}
              />
              {props.todo && props.todo.status !== 'done' && props.todo.start && props.todo.end && (
                <span className='text-[12px] font-[700]'>
                  <TodosPeriodText todo={props.todo} />
                </span>
              )}
            </button>
          )}
          renderOptions={({ toggle }) => (
            <div className='w-full max-w-[328px] py-[12px]'>
              <TodosDatePicker
                value={{ start: props.todo?.start, end: props.todo?.end }}
                onChange={(range) => toggle(false, () => setTodoRange(range))}
                onCancel={() => toggle(false)}
              />
            </div>
          )}
        />
      </div>
      <textarea
        ref={textareaEl}
        name='postContent'
        className='w-full min-h-[80px] resize-none | rounded-xl p-[8px] | text-[15px]'
        value={textValue}
        onChange={(e) => setTextValue(e.currentTarget.value)}
        onInput={handleTextareaInput}
        onPaste={handlePaste}></textarea>
      <div className='w-full overflow-auto'>
        {images && (
          <div className='flex gap-[12px] | px-[4px] py-[6px]'>
            {images.map((image, index) => (
              <div
                key={index}
                className='relative'>
                <Link href={`?images=${props.todo?.id}`}>
                  <img
                    className='w-[160px] max-w-[160px] aspect-square object-contain | shadow-md rounded-lg bg-black'
                    src={image.image}
                    alt=''
                  />
                </Link>

                <Link
                  href={`?image=${image.id}`}
                  className='absolute right-[8px] top-[8px] | flex items-center justify-center | w-[20px] aspect-square | bg-slate-100 dark:bg-zinc-700 rounded-full shadow-md shadow-black/30'>
                  <Icon name='delete' />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className='flex gap-[8px] | opacity-70 | text-[12px] leading-[130%]'>
        <span>최근 수정일</span>
        <span>{dateUtil.parseDate(props.todo?.modified)}</span>
      </p>
    </div>
  )
}
