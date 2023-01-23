import { Get, Post } from '../utils/request'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const signup = <T = { user_name: string; pass_word: string }>(params): ApiResponse<T> => {
  return Post<T>('/api/task/signup', params)
}

export const login = <T = { user_name: string; pass_word: string }>(params): ApiResponse<T> => {
  return Post<T>('/api/task/login', params)
}
