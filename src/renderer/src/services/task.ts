import { Get, Post } from '../utils/request'
import { ItaskItem } from '@renderer/interface/task'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const getTaskList = <T = ItaskItem[]>(): ApiResponse<T> => {
  return Post<T>('/api/task/taskList', {})
}

export const addTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/api/task/addTask', params)
}

export const editTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/api/task/editTask', params)
}

export const getTaskDetailed = <T>(params): ApiResponse<T> => {
  return Post<T>('/api/task/taskDetailed', params)
}
