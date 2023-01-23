import { defineStore } from 'pinia'

interface IuserState {
  userInfo: IuserInfo | null
}

interface IuserInfo {
  user_id: number
  user_name: string
  pass_word: string
  head_photo: string
  status: number
}

export const useUserStore = defineStore('userStore', {
  state: (): IuserState => {
    return {
      userInfo: null
    }
  },
  getters: {
    userId: (state: IuserState) => {
      if (!state.userInfo) return ''
      return state.userInfo.user_id
    }
  },
  actions: {
    setUserInfo(params) {
      this.userInfo = params
      sessionStorage.setItem('userInfo', JSON.stringify(params))
    }
  }
})
