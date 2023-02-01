export interface ItaskItem {
  task_id: number
  task_name: string
  user_id: number
  user_name: string
  created_time: string
}

export interface ItaskState {
  taskLogs: ItaskLog[]
  actionPrecent: number
}

export interface ItaskLog {
  code: number
  msg: string
  current?: number
  total?: number
}
