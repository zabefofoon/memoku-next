'use client'

import { Link } from '@/app/components/Link'
import etcUtil from '@/app/utils/etc.util'
import { usePathname } from 'next/navigation'
import { useCookies } from 'react-cookie'
import packageJson from '../../package.json'

import { AGE_1_YEAR, COOKIE_EXPAND, COOKIE_THEME } from '@/const'
import { useState } from 'react'
import { If, Then } from 'react-if'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth.store'
import { useSheetStore } from '../stores/sheet.store'
import { useThemeStore } from '../stores/theme.store'
import { Icon } from './Icon'

interface Props {
  isExpand: boolean
}

const menus = [
  {
    href: '/app',
    name: '홈',
    divided: false,
    icon: 'home',
    activeIcon: 'home-active',
    induce: false,
  },
  {
    href: '/app/todos',
    name: '할일',
    divided: false,
    icon: 'todos',
    activeIcon: 'todos-active',
    induce: false,
  },
  {
    href: '/app/calendar',
    name: '달력',
    divided: false,
    icon: 'calendar',
    activeIcon: 'calendar-active',
    induce: false,
  },
  {
    href: '/app/settings',
    name: '설정',
    divided: false,
    icon: 'setting',
    activeIcon: 'setting-active',
    induce: false,
  },
  {
    href: '/app/guides',
    name: '가이드',
    divided: true,
    icon: 'news',
    activeIcon: 'news-active',
    induce: true,
  },
  {
    href: '/',
    name: '소개',
    divided: false,
    icon: 'help',
    activeIcon: 'help-active',
    induce: false,
  },
]

export function AppAside(props: Props) {
  const setFileId = useSheetStore((state) => state.setFileId)
  const savedTodosQueries = useThemeStore((state) => state.savedTodosQueries)
  const pathname = usePathname()
  const [_, setCookie, removeCookie] = useCookies([COOKIE_THEME, COOKIE_EXPAND])

  const [isExpand, setIsExpand] = useState<boolean>(props.isExpand)

  const memberInfo = useAuthStore((s) => s.memberInfo)
  const setMemberInfo = useAuthStore((s) => s.setMemberInfo)

  const toggleExpandAside = (): void => {
    setIsExpand(!isExpand)
    if (isExpand) removeCookie(COOKIE_EXPAND, { path: '/' })
    else setCookie(COOKIE_EXPAND, 'true', { maxAge: AGE_1_YEAR, path: '/', sameSite: 'lax' })
  }

  const logout = async (): Promise<void> => {
    await api.postAuthGoogleLogout()
    setMemberInfo()
    setFileId('')
  }

  return (
    <aside
      className={etcUtil.classNames([
        'relative z-10 | hidden lg:flex flex-col | sticky top-[24px] | h-[calc(100dvh-48px)] | bg-white dark:bg-zinc-800 | shadow-lg rounded-l-2xl rounded-b-2xl | transition-[width]',
        isExpand ? 'w-[240px]' : 'w-[62px]',
      ])}>
      <button
        className='absolute right-0 top-0 translate-x-full | bg-white dark:bg-zinc-800 rounded-r-full | py-[12px]'
        type='button'
        onClick={toggleExpandAside}>
        <Icon name='expand' />
      </button>
      <Link
        href='/app'
        className='px-[20px] py-[12px] | flex items-center gap-[6px]'>
        <Icon
          name='logo'
          className='text-[24px] my-[8px]'
        />
        {isExpand && <span className='text-[18px] font-[700]'>MEMOKU</span>}
      </Link>
      <nav className='flex flex-col gap-[4px]'>
        {menus.map((menu) => (
          <div
            key={menu.href}
            className={etcUtil.classNames([
              'aside-item',
              {
                'border-t border-gray-100 dark:border-zinc-600 | mt-[12px] pt-[12px]': menu.divided,
              },
            ])}>
            <Link
              href={`${menu.href}${menu.href === '/app/todos' ? (savedTodosQueries ?? '') : ''}`}
              aria-current={pathname === menu.href ? 'page' : undefined}
              className={etcUtil.classNames([
                'relative | flex items-center gap-[6px] | py-[12px] px-[16px] mx-[4px] | rounded-full hover:bg-slate-50 hover:dark:bg-zinc-700/50',
                {
                  'text-white | bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-500 hover:dark:bg-indigo-600':
                    pathname === menu.href,
                },
              ])}>
              <Icon
                name={pathname === menu.href ? menu.activeIcon : menu.icon}
                className='text-[20px]'
              />
              {isExpand && (
                <span className='text-[14px] align-top whitespace-nowrap'>{menu.name}</span>
              )}
              {menu.induce && (
                <div className='absolute w-[4px] top-[10px] left-[16px] | aspect-square rounded-full | bg-red-500'></div>
              )}

              <If condition={!isExpand}>
                <Then>
                  <div className='hover-item | min-w-[40px] | absolute top-1/2 left-full -translate-y-1/2 translate-x-[12px]'>
                    <div className='bg-white dark:bg-zinc-700 | absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 | w-[8px] aspect-square rotate-[45deg] bg-red-100'></div>
                    <p className='py-[8px] px-[8px] | whitespace-nowrap bg-white dark:bg-zinc-700 rounded-lg shadow-lg | text-center text-[13px] text-gray-600 dark:text-zinc-200'>
                      {menu.name}
                    </p>
                  </div>
                </Then>
              </If>
            </Link>
          </div>
        ))}
      </nav>
      <div className='mt-auto'>
        <If condition={memberInfo != null}>
          <Then>
            {() => (
              <div className='flex items-center gap-[8px] | px-[12px]'>
                <img
                  className='rounded-full | w-[32px] aspect-square'
                  src={memberInfo?.picture ?? ''}
                  alt={memberInfo?.email}
                />
                <If condition={isExpand}>
                  <Then>
                    <div className='flex flex-col gap-[2px] | overflow-hidden | leading-[100%]'>
                      <p className='text-[13px] truncate'>{memberInfo?.email}</p>
                      <div className='flex'>
                        <Icon name='logout' />
                        <button
                          className='text-[12px]'
                          onClick={logout}>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </Then>
                </If>
              </div>
            )}
          </Then>
        </If>
        <div
          className={etcUtil.classNames([
            'flex items-center justify-between | px-[8px] py-[12px]',
            { 'flex-col': !isExpand },
          ])}>
          <div className='flex items-center gap-[6px] flex-wrap'>
            <If condition={!memberInfo}>
              <Then>
                <Link
                  href='/api/auth/google'
                  prefetch={false}
                  className='mx-auto | w-[32px] aspect-square | flex items-center justify-center | rounded-full bg-white dark:bg-zinc-700 shadow-sm shadow-black/30 dark:shadow-black/60'>
                  <Icon name='google' />
                </Link>
              </Then>
            </If>
          </div>
          <span className='text-[13px]'>v{packageJson.version}</span>
        </div>
      </div>
    </aside>
  )
}
