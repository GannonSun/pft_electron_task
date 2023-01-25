import { defineStore } from 'pinia'
import { IuserState } from '@renderer/interface/user'

export const useUserStore = defineStore('userStore', {
  persist: {
    storage: sessionStorage
  },
  state: (): IuserState => {
    return {
      userInfo: null
    }
  },
  getters: {
    userId: (state: IuserState) => {
      if (!state.userInfo) return ''
      return state.userInfo.user_id
    },
    taskId: (state: IuserState) => {
      if (!state.userInfo) return ''
      return state.userInfo.task_id
    }
  },
  actions: {
    setUserInfo(params) {
      this.userInfo = params
    }
  }
})
