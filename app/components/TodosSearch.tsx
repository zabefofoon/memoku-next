'use client'

import debounce from 'lodash.debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

export default function TodosSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState<string>(() => searchParams.get('searchText') ?? '')

  const updateQuery = debounce((next: string) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    const trimmed = next.trim()
    if (trimmed) urlParams.set('searchText', trimmed)
    else urlParams.delete('searchText')

    const queryString = urlParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, 250)

  useEffect(() => {
    const urlValue = searchParams.get('searchText') ?? ''
    setValue(urlValue)
  }, [])

  return (
    <label className='search | w-full sm:w-fit flex items-center | border border-gray-300 dark:border-zinc-600 rounded-lg has-focus:border-indigo-500 | pr-[8px]'>
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
        className='min-w-[120px] w-full max-w-[200px] py-[4px] pl-[4px] outline-0'
        value={value}
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
          aria-label='검색어 지우기'>
          <Icon
            name='close'
            className='text-[20px]'
          />
        </button>
      )}
    </label>
  )
}
