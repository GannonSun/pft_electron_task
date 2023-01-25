import { Get, Post } from '../utils/request'
import { IgitList } from '@renderer/interface/git'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const getGitList = <T = IgitList[]>(): ApiResponse<T> => {
  return Post<T>('/api/task/gitList', {})
}
