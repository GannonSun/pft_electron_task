<template>
  <el-container class="taskContainer">
    <el-aside width="300px">
      <div class="filterCom">
        <div class="searchCom">
          <el-input v-model="keyWord" placeholder="输入任务关键词搜索" :prefix-icon="Search" />
          <el-button type="primary" plain>搜索</el-button>
        </div>
        <div class="switchCom">
          <el-switch v-model="onlyMe" size="small"></el-switch>
          <span :class="{ activeText: onlyMe }">仅显示我的任务</span>
        </div>
      </div>
      <div v-if="taskList.length" class="listContainer">
        <div
          class="taskItem"
          :class="{
            activeTaskItem: item.task_id === activeTaskId
          }"
          v-for="item in taskList"
          :key="item.task_id"
          @click="handleClickTask(item)"
        >
          <div class="lt">
            <p class="title">{{ item.task_name }}</p>
            <p class="subTitle">{{ item.user_name }}</p>
          </div>
          <div v-if="item.task_id === userStore.taskId" class="rt">
            <el-icon color="#e6a23c" size="20"><Flag /></el-icon>
          </div>
        </div>
      </div>
      <div v-else class="emptyContainer">暂无数据</div>
      <div class="actionCom">
        <el-button
          type="warning"
          :icon="Plus"
          circle
          size="small"
          title="添加任务"
          @click="handleAddTask"
        ></el-button>
      </div>
    </el-aside>
    <el-main class="mainContainer">
      <template v-if="activeTaskId">
        <div class="mainHeader">
          <div class="headerTitle">{{}}</div>
        </div>
      </template>
      <div v-else class="emptyMain">
        <el-empty description="暂无任务数据" />
      </div>
    </el-main>
  </el-container>
  <task-dialog
    v-model="taskDialogVisible"
    :action-type="actionType"
    @refresh="handleGetTaskList"
  ></task-dialog>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { ElSwitch } from 'element-plus'
import { Search, Flag, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/store/user'
import { ItaskItem } from '@renderer/interface/task'
import { getTaskList, getTaskDetailed } from '@renderer/services/task'
import TaskDialog from './components/taskDialog.vue'

const userStore = useUserStore()

onMounted(async () => {
  handleGetTaskList()
})

let keyWord = ref<string>('')
let onlyMe = ref<boolean>(false)
let taskList = ref<ItaskItem[]>([])
let activeTaskId = ref<number>()
let taskDetailed = ref(null)
let taskDialogVisible = ref<boolean>(false)
let actionType = ref<'add' | 'edit' | ''>('')
const logsArr = reactive([])

window.electronAPI.onUpdateSwitchLog((e, logVal) => {
  console.log('log', logVal)
  logsArr.push(logVal)
})

const handleGetTaskList = async () => {
  const [err, res] = await getTaskList()
  if (!err && res?.code == 200) {
    taskList.value = res.data
  }
}
const handleClickTask = async (task) => {
  activeTaskId.value = task.task_id
  const [err, res] = await getTaskDetailed({ id: task.task_id })
  if (!err && res?.code == 200) {
    taskDetailed.value = res.data
  }
}
const handleAddTask = () => {
  actionType.value = 'add'
  taskDialogVisible.value = true
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

<style lang="less" scoped>
.taskContainer {
  background: #fafafa;
  height: 100%;

  .el-aside {
    position: relative;
    background: #fff;
    margin-right: 16px;

    .filterCom {
      .searchCom {
        display: flex;
        align-items: center;
        padding: 16px;
        padding-bottom: 0;
        gap: 12px;
      }
      .switchCom {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        padding-top: 12px;
        font-size: 12px;
        color: #ccc;

        .activeText {
          color: #409eff;
        }
      }
    }
    .listContainer {
      .taskItem {
        padding: 12px 24px;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        &:hover {
          background: #eceef3;
        }
        .lt {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-right: 12px;

          .title {
            overflow: hidden;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
          }
          .subTitle {
            font-size: 14px;
            color: #969696;
          }
        }
      }
      .activeTaskItem {
        background: #e2ecff;

        &:hover {
          background: #e2ecff;
        }
      }
      .usingTaskItem {
      }
    }
    .actionCom {
      position: absolute;
      bottom: 0;
      display: flex;
      align-items: center;
      height: 40px;
      width: 100%;
      border-top: 2px solid #ccc;
      font-size: 16px;
      font-weight: bold;
      padding: 0px 12px;
    }
  }
  .mainContainer {
    background: #fff;

    .emptyMain {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
