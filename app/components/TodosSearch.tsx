'use client'

import debounce from 'lodash.debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'

export default function TodosSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchTextQuery = searchParams.get('searchText') ?? ''

  const [value, setValue] = useState<string>(() => searchTextQuery)

  const inputEl = useRef<HTMLInputElement>(null)

  const updateQuery = useMemo(
    () =>
      debounce((next: string) => {
        const urlParams = new URLSearchParams(searchParams.toString())

        const trimmed = next.trim()
        if (trimmed) urlParams.set('searchText', trimmed)
        else urlParams.delete('searchText')

        const queryString = urlParams.toString()
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
      }, 300),
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const urlValue = searchTextQuery
    setValue(urlValue)
  }, [searchTextQuery])

  useEffect(() => {
    if (inputEl.current) inputEl.current.value = searchTextQuery
  }, [inputEl, searchTextQuery])

  return (
    <label className='search | w-full sm:w-fit flex items-center | border-b border-gray-300 dark:border-zinc-600 has-focus:border-indigo-500 | pr-[8px]'>
      <span className='sr-only'>검색</span>
      <button
        type='button'
        className='pl-[8px]'
        aria-hidden>
        <Icon
          name='search'
          className='text-[20px]'
        />
      </button>

      <input
        ref={inputEl}
        type='text'
        placeholder='검색'
        className='min-w-[120px] w-full max-w-[200px] py-[4px] pl-[4px] outline-0'
        onChange={(event) => {
          setValue(event.target.value)
          updateQuery(event.target.value)
        }}
      />

      {value && (
        <button
          type='button'
          onClick={() => {
            setValue('')
            updateQuery('')
          }}
          aria-label='검색어 지우기'
          className='ml-auto'>
          <Icon
            name='close'
            className='text-[20px]'
          />
        </button>
      )}
    </label>
  )
}
