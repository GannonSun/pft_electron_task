<template>
  <div class="settingContainer">
    <p class="title">
      <el-icon><Setting /></el-icon>
      个人设置
    </p>
    <div class="mainContainer">
      <el-menu class="settingMenu" :default-active="activeMenuIndex">
        <el-menu-item
          class="settingMenuItem"
          v-for="item in settingMenu"
          :key="item.id"
          :index="item.id"
        >
          <span>{{ item.name }}</span>
          <el-icon v-if="activeMenuIndex == item.id"><ArrowRight /></el-icon>
        </el-menu-item>
      </el-menu>
      <div class="rightContainer">
        <div class="gitSetting">
          <p class="subTitle">Git设置</p>
          <div class="gitSettingItem" v-for="(item, index) in gitSettingList" :key="item.git_id">
            <p class="gitName">
              <el-link @click="handleOpenLink(item.git_url)">
                {{ item.git_name }}<el-icon><Link /></el-icon>
              </el-link>
            </p>
            <div class="gitContent">
              <el-input
                v-model="item.local_path"
                placeholder="可直接输入本地路径或通过右侧浏览按钮选择"
              ></el-input>
              <el-button type="primary" plain @click="handleOpenDirectory(index)">浏览</el-button>
            </div>
          </div>
        </div>
        <div class="btnContainer">
          <el-button type="primary" @click="handleSaveSetting">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, ArrowRight, Link } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/store/user'
import { IsettingMenu, IgitSetting } from '@renderer/interface/user'
import { getSetting, saveSetting } from '@renderer/services/user'

const router = useRouter()
const userStore = useUserStore()

let settingMenu = ref<IsettingMenu[]>([
  {
    id: '1',
    name: 'Git设置'
  }
])
let activeMenuIndex = ref<string>('')
let gitSettingList = ref<IgitSetting[]>([])

onMounted(() => {
  activeMenuIndex.value = settingMenu.value[0].id
  handleGetGitList()
})

const handleGetGitList = async () => {
  const [err, res] = await getSetting({
    user_id: userStore.userId
  })
  if (!err && res.code == 200) {
    gitSettingList.value = res.data
  }
}
const handleOpenLink = (url) => {
  window.electronAPI.openLink(url)
}
const handleOpenDirectory = async (index) => {
  const filePath = await window.electronAPI.openDirectory()
  console.log(filePath)
  gitSettingList.value[index].local_path = filePath
}
const handleSaveSetting = async () => {
  console.log(gitSettingList.value)
  const [err, res] = await saveSetting({
    user_id: userStore.userId,
    settings: gitSettingList.value
  })
  if (!err && res.code == 200) {
    ElMessage.success('保存成功')
    router.push({
      name: 'task'
    })
  }
}
const handleCancel = () => {
  router.push({
    name: 'task'
  })
}
</script>

<style lang="less" scoped>
div {
  box-sizing: border-box;
}
.settingContainer {
  background: #f5f5f5;
  padding: 24px;
  height: 100%;

  .title {
    display: flex;
    align-items: center;
    font-size: 24px;
    font-weight: bold;

    .el-icon {
      margin-right: 8px;
    }
  }
  .subTitle {
    position: relative;
    font-size: 18px;
    font-weight: 500;
    padding-left: 8px;
    border-left: 4px solid #409eff;
  }
  .mainContainer {
    height: calc(100% - 50px);
    margin-top: 16px;
    display: flex;
    align-items: flex-start;

    .settingMenu {
      width: 250px;
      margin-right: 24px;
      border: 0;
      border-radius: 8px;

      .settingMenuItem {
        display: flex;
        justify-content: space-between;
      }
    }
    .rightContainer {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      background: #fff;
      border-radius: 8px;
      padding: 24px;

      .gitSetting {
        .gitSettingItem {
          margin: 16px 0;

          .gitName {
            margin-bottom: 8px;

            .el-link {
              font-size: 14px;
            }
          }
          .gitContent {
            display: flex;
            align-items: center;
            gap: 16px;
          }
        }
      }
      .btnContainer {
        margin-top: 24px;
      }
    }
  }
}
</style>
