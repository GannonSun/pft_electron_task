<template>
  <div class="layoutContainer">
    <el-container>
      <el-header>
        <p class="title">任务管理</p>
        <div class="userMenu">
          <el-avatar style="margin-right: 12px">{{ firstLetter }}</el-avatar>
          <el-dropdown trigger="click">
            <div class="menuIcon">
              <el-icon color="#fff" size="18" style="cursor: pointer"><Operation /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <router-view></router-view>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Operation } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const firstLetter = computed(() => {
  if (!userStore.userInfo || !userStore.userInfo.user_name) return ''
  return userStore.userInfo.user_name.charAt(0)
})

const handleLogout = () => {
  userStore.$reset()
  sessionStorage.removeItem('userInfo')
  router.push({
    name: 'login'
  })
}
</script>

<style lang="less" scoped>
.layoutContainer {
  .el-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: linear-gradient(to right, #3ab5b0 0%, #3d99be 31%, #56317a 100%);

    .title {
      color: #fff;
      font-size: 24px;
      font-weight: bold;
    }
    .userMenu {
      display: flex;
      align-items: stretch;

      .menuIcon {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
