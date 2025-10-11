'use client'

import debounce from 'lodash.debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'

export default function TodosSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState<string>(() => searchParams.get('searchText') ?? '')

  const updateQuery = useCallback(
    (next: string) => {
      const urlParams = new URLSearchParams(searchParams.toString())

      const trimmed = next.trim()
      if (trimmed) urlParams.set('searchText', trimmed)
      else urlParams.delete('searchText')

      const queryString = urlParams.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const debouncedUpdate = useMemo(() => debounce(updateQuery, 300), [updateQuery])

  useEffect(() => {
    return () => debouncedUpdate.cancel()
  }, [debouncedUpdate])

  useEffect(() => {
    const urlValue = searchParams.get('searchText') ?? ''
    setValue(urlValue)
  }, [searchParams])

  return (
    <label className='search | w-full sm:w-fit flex items-center | border border-gray-300 dark:border-zinc-600 rounded-lg has-focus:border-violet-500 | pr-[8px]'>
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
        type='text'
        placeholder='검색'
        className='w-[200px] py-[4px] pl-[4px] outline-0'
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          debouncedUpdate(event.target.value)
        }}
      />

      <button
        type='button'
        className='close'
        onClick={() => {
          setValue('')
          debouncedUpdate('')
        }}
        aria-label='검색어 지우기'>
        <Icon
          name='close'
          className='text-[20px]'
        />
      </button>
    </label>
  )
}
