<template>
  <div>
    <button @click="handleSwitchTask">切换任务</button>
  </div>
</template>

<script setup lang="ts">
import { switchTask } from '../../services/task'

declare global {
  interface Window {
    electronAPI: any
  }
}

const handleSwitchTask = async () => {
  const [err, res] = await switchTask()
  console.log(err, res)
  if (!err && res.code == 200) {
    console.log(window)
    const filePath = await window.electronAPI.openDirectory()
    console.log(filePath)
  }
}
</script>
