import { Get, Post } from '../utils/request'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface IgitList {
  git_id: number
  git_name: string
  git_url: string
  status: number
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const getGitList = <T = IgitList[]>(): ApiResponse<T> => {
  return Post<T>('/api/task/gitList', {})
}
