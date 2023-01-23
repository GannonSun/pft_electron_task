<template>
  <el-container>
    <el-aside width="200px">Aside</el-aside>
    <el-main>Main</el-main>
  </el-container>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGitList } from '../../services/git'
import { taskList } from '../../services/task'

declare global {
  interface Window {
    electronAPI: any
  }
}

const router = useRouter()

onMounted(async () => {
  const [err, res] = await getGitList()
  console.log(err, res)
})

const logsArr = reactive([])

window.electronAPI.onUpdateSwitchLog((e, logVal) => {
  console.log('log', logVal)
  logsArr.push(logVal)
})

const handleOpenDirectory = async () => {
  const filePath = await window.electronAPI.openDirectory()
  console.log(filePath)
}
const handleLogout = () => {
  router.push({
    name: 'login'
  })
}
// const handleSwitchTask = async () => {
//   const [err, res] = await switchTask()
//   console.log(err, res)
//   if (!err && res.code == 200) {
//     const data: any = res.data
//     const switchRes = await window.electronAPI.switchTask(data.gits)
//     console.log(switchRes)
//   }
// }
</script>
