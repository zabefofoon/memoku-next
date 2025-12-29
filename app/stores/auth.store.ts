import { create } from 'zustand'
import { MemberInfo } from '../models/Member'

interface AuthStore {
  memberInfo?: MemberInfo
  allowedPushNotification?: boolean
  setMemberInfo: (memberInfo?: MemberInfo) => void
  setAllowedPushNotification: (allowedPushNotification?: boolean) => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  memberInfo: undefined,
  allowedPushNotification: false,
  setMemberInfo: (memberInfo?: MemberInfo): void => set({ memberInfo }),
  setAllowedPushNotification: (allowedPushNotification?: boolean): void => {
    set({ allowedPushNotification })
  },
}))
