import { defineStore } from 'pinia'
import { ItaskState, ItaskLog } from '@renderer/interface/task'

export const useTaskStore = defineStore('taskStore', {
  state: (): ItaskState => {
    return {
      taskLogs: [],
      actionPrecent: 0
    }
  },
  actions: {
    pushTaskLogs(item: ItaskLog) {
      this.taskLogs.push(item)
    },
    setActionPrecent(num: number) {
      this.actionPrecent = num
    }
  }
})
