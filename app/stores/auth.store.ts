import { create } from 'zustand'
import { MemberInfo } from '../models/Member'

interface AuthStore {
  memberInfo?: MemberInfo
  setMemberInfo: (memberInfo?: MemberInfo) => void
}

export const useAuthStore = create<AuthStore>()((set) => {
  const memberInfo: MemberInfo | undefined = undefined

  const setMemberInfo = (memberInfo?: MemberInfo): void => set({ memberInfo })

  return {
    memberInfo,
    setMemberInfo,
  }
})
