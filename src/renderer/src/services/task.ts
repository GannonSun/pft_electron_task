import { Get, Post } from '../utils/request'
import { ItaskItem } from '@renderer/interface/task'

export interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

export type ApiResponse<T> = Promise<[any, FcResponse<T> | undefined]>

export const getTaskList = <T = ItaskItem[]>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/taskList', params)
}

export const addTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/addTask', params)
}

export const updateTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/updateTask', params)
}

export const delTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/delTask', params)
}

export const getTaskDetailed = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/taskDetailed', params)
}

export const switchTask = <T>(params): ApiResponse<T> => {
  return Post<T>('/taskApi/task/switchTask', params)
}
