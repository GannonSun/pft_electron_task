import { Get, Post } from '../utils/request'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const taskList = <T = { name: string }>(): ApiResponse<T> => {
  return Post<T>('/api/task/taskList', {})
}
