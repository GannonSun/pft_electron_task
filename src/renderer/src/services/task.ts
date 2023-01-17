import { Get, Post } from '../utils/request'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const switchTask = <T = { name: string }>(): ApiResponse<T> => {
  return Get<T>('/api/task/test', {})
}
