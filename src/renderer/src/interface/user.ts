export interface IuserState {
  userInfo: IuserInfo | null
}

export interface IuserInfo {
  user_id: number
  user_name: string
  pass_word: string
  head_photo: string
  task_id: number
  status: number
}

export interface IsettingMenu {
  id: string
  name: string
}

export interface IgitSetting {
  git_id: number
  git_name: string
  git_url: string
  local_path: string
}
