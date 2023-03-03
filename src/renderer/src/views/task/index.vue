<template>
  <el-container class="taskContainer">
    <resize-wrap class="resizeAside" default-width="300px">
      <el-aside>
        <div class="filterCom">
          <div class="searchCom">
            <el-input v-model="keyWord" placeholder="输入任务关键词搜索" :prefix-icon="Search" />
            <el-button type="primary" plain @click="handleSeachTask">搜索</el-button>
          </div>
          <div class="switchCom">
            <el-switch v-model="onlyMe" size="small" @change="handleShowMyTask"></el-switch>
            <span :class="{ activeText: onlyMe }">仅显示我的任务</span>
          </div>
        </div>
        <div
          class="listContainer"
          v-infinite-scroll="handleChangePage"
          :infinite-scroll-delay="500"
          :infinite-scroll-disabled="finished"
        >
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
          <div v-if="!taskList.length" class="emptyContainer">暂无数据</div>
        </div>
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
    </resize-wrap>
    <el-main class="mainContainer">
      <div v-if="taskDetailed" class="taskMain">
        <div class="taskAction">
          <el-button type="primary" @click="handleSwitchTask">切换</el-button>
          <el-button :disabled="!isOwner" @click="handleEditTask">编辑</el-button>
          <el-button :disabled="!isOwner" type="danger" @click="handleDelTask">删除</el-button>
        </div>
        <div class="taskHeader">
          <p class="taskTitle">
            <span>{{ taskDetailed.task_name }}</span>
            <el-icon class="copyIcon" title="复制任务分支信息" @click="handleCopyTaskInfo">
              <CopyDocument />
            </el-icon>
          </p>
          <p v-if="taskDetailed.remark" class="taskRemark">备注：{{ taskDetailed.remark }}</p>
        </div>
        <div class="taskRelated">
          <div class="relatedItem" v-for="item in taskDetailed.task_related" :key="item.git_id">
            <div class="relatedContent">
              <p>
                <span>仓库名：{{ item.git_name }}</span>
                <el-icon size="20" title="打开目录" @click="handleOpenFileDir(item.local_path)">
                  <FolderOpened />
                </el-icon>
              </p>
              <p>分支名：{{ item.branch_name }}</p>
            </div>
            <div class="imgContent">
              <img
                class="cmdImg"
                src="@renderer/assets/cmd.png"
                title="命令行模式"
                @click="handleOpenCMD(item.local_path)"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="emptyMain">
        <el-empty description="暂无任务数据" />
      </div>
    </el-main>
  </el-container>
  <task-dialog
    v-model="taskDialogVisible"
    :action-type="actionType"
    :task-info="taskDetailed"
    @refresh="handleRefreshTask"
  ></task-dialog>
  <logs-dialog v-model="logsDialogVisible"></logs-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElSwitch } from 'element-plus'
import { Search, Flag, Plus, CopyDocument, FolderOpened } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/store/user'
import { ItaskItem } from '@renderer/interface/task'
import { getTaskList, getTaskDetailed, delTask, switchTask } from '@renderer/services/task'
import TaskDialog from './components/taskDialog.vue'
import LogsDialog from './components/logsDialog.vue'

const userStore = useUserStore()

onMounted(async () => {
  handleGetTaskList()
})

let page = ref<number>(1)
let keyWord = ref<string>('')
let onlyMe = ref<boolean>(false)
let taskList = ref<ItaskItem[]>([])
let finished = ref<boolean>(false)
let activeTaskId = ref<number | null>(null)
let taskDetailed = ref(null)
let taskDialogVisible = ref<boolean>(false)
let logsDialogVisible = ref<boolean>(false)
let actionType = ref<'add' | 'edit' | ''>('')

const isOwner = computed(() => {
  return taskDetailed.value?.user_id == userStore.userId
})

const handleChangePage = () => {
  page.value += 1
  handleGetTaskList()
}
const handleGetTaskList = async (searchParams = {}) => {
  const [err, res] = await getTaskList({
    page: page.value,
    key_word: keyWord.value,
    ...searchParams
  })
  if (!err && res?.code == 200) {
    if (page.value === 1) {
      finished.value = false
      taskList.value = res.data
    } else {
      taskList.value.push(...res.data)
    }
    if (!res.data.length || res.data.length < 20) {
      finished.value = true
    }
  }
}
const handleGetTaskDetailed = async () => {
  const [err, res] = await getTaskDetailed({ id: activeTaskId.value })
  if (!err && res?.code == 200) {
    taskDetailed.value = res.data
  }
}
const handleRefreshTask = () => {
  page.value = 1
  handleGetTaskList()
  if (activeTaskId.value) {
    handleGetTaskDetailed()
  }
}
const handleSeachTask = () => {
  page.value = 1
  handleGetTaskList()
}
const handleShowMyTask = (val) => {
  page.value = 1
  if (val) {
    handleGetTaskList({
      user_id: userStore.userId
    })
  } else {
    handleGetTaskList()
  }
}
const handleClickTask = async (task) => {
  activeTaskId.value = task.task_id
  handleGetTaskDetailed()
}
const handleOpenFileDir = (path: string) => {
  if (!path) return ElMessage.warning('请先前往个人设置页面设置该仓库的本地路径')
  window.electronAPI.openFileDir(path)
}
const handleOpenCMD = (path: string) => {
  if (!path) return ElMessage.warning('请先前往个人设置页面设置该仓库的本地路径')
  window.electronAPI.openCMD(path)
}
const handleSwitchTask = () => {
  ElMessageBox.confirm('您确定要切换该任务？', '温馨提示', {
    type: 'warning',
    closeOnClickModal: false
  })
    .then(async () => {
      const [err, res] = await switchTask({
        user_id: userStore.userId,
        task_id: taskDetailed.value?.task_id
      })
      if (!err && res?.code == 200) {
        logsDialogVisible.value = true
        userStore.setUserInfo(res.data?.user_info ?? null)
        window.electronAPI.operateGit(res.data?.task_gits ?? [], 'switch')
      }
    })
    .catch((e) => e)
}
const handleAddTask = () => {
  actionType.value = 'add'
  taskDialogVisible.value = true
}
const handleEditTask = () => {
  actionType.value = 'edit'
  taskDialogVisible.value = true
}
const handleDelTask = () => {
  ElMessageBox.confirm('您确定要删除该任务？', '温馨提示', {
    type: 'warning',
    closeOnClickModal: false
  })
    .then(async () => {
      const [err, res] = await delTask({
        id: activeTaskId.value
      })
      if (!err && res?.code == 200) {
        ElMessage.success('删除成功')
        page.value = 1
        activeTaskId.value = null
        taskDetailed.value = null
        handleGetTaskList()
      }
    })
    .catch((e) => e)
}
const handleCopyTaskInfo = () => {
  const copyStr = taskDetailed.value.task_related
    .map((g) => `${g.git_name}：${g.branch_name}`)
    .join('\n')
  navigator.clipboard.writeText(copyStr)
  ElMessage.success('复制成功')
}
</script>

<style lang="less" scoped>
.taskContainer {
  background: #fafafa;
  height: 100%;

  .resizeAside {
    margin-right: 8px;
    min-width: 200px;
    max-width: 50%;
    flex-shrink: 0;
  }
  .el-aside {
    position: relative;
    background: #fff;
    width: 100%;
    height: 100%;

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
      height: calc(100% - 100px - 50px);
      overflow-y: auto;

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
            margin-bottom: 8px;
          }
          .subTitle {
            font-size: 14px;
            color: #969696;
          }
        }
      }
      .activeTaskItem {
        background: var(--el-color-primary-light-7);

        &:hover {
          background: var(--el-color-primary-light-7);
        }
      }
    }
    .emptyContainer {
      width: 100%;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);
    }
    .actionCom {
      position: absolute;
      bottom: 0;
      display: flex;
      align-items: center;
      height: 50px;
      width: calc(100% - 24px);
      box-shadow: 0px -3px 8px 0px #ccc;
      font-size: 16px;
      font-weight: bold;
      padding: 0px 12px;
    }
  }
  .mainContainer {
    background: #fff;

    .taskMain {
      .taskAction {
        text-align: right;
        margin-bottom: 12px;
      }
      .taskHeader {
        border-bottom: 2px solid #ccc;
        padding-bottom: 12px;
        margin-bottom: 24px;

        .taskTitle {
          font-size: 24px;
          font-weight: bold;

          .copyIcon {
            color: var(--el-color-primary);
            font-size: 18px;
            cursor: pointer;
            margin-left: 12px;
          }
        }
        .taskRemark {
          font-size: 14px;
          color: #969696;
          margin-top: 12px;
        }
      }
      .taskRelated {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .relatedItem {
          display: flex;
          align-items: center;
          // justify-content: space-between;
          width: 100%;
          // width: calc((100% - 32px * 2 - 12px) / 2);
          background: var(--el-color-success-light-9);
          padding: 16px;
          border-radius: 12px;

          .relatedContent {
            flex: 1;

            p {
              display: flex;
              align-items: center;

              & + p {
                margin-top: 8px;
              }
            }
            .el-icon {
              margin-left: 8px;
              cursor: pointer;
              color: var(--el-color-primary);
            }
          }
          .imgContent {
            .cmdImg {
              width: 32px;
              margin-right: 12px;
              cursor: pointer;
            }
          }
        }
      }
    }
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
