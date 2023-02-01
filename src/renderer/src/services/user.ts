import { Get, Post } from '../utils/request'
import { IgitSetting } from '../interface/user'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const signup = <T = { user_name: string; pass_word: string }>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/signup', params)
}

export const login = <T = { user_name: string; pass_word: string }>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/login', params)
}

export const getSetting = <T = IgitSetting[]>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/getSetting', params)
}

export const saveSetting = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/saveSetting', params)
}
