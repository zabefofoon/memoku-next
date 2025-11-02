import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { MemberInfo } from '../models/Member'

interface AuthStore {
  memberInfo?: MemberInfo
  setMemberInfo: (memberInfo?: MemberInfo) => void
}

export const createAuthStore = (initial?: MemberInfo) =>
  createStore<AuthStore>()((set) => {
    const memberInfo = initial

    const setMemberInfo = (memberInfo?: MemberInfo): void => set({ memberInfo })

    return {
      memberInfo,
      setMemberInfo,
    }
  })

export const AuthStoreContext = createContext<ReturnType<typeof createAuthStore> | null>(null)

export function useAuthStore<T>(selector: (s: AuthStore) => T) {
  const store = useContext(AuthStoreContext)
  if (!store) throw new Error('AuthStoreProvider가 필요합니다')
  return useStore(store, selector)
}
