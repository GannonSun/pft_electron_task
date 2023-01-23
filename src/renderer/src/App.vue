<template>
  <el-config-provider :z-index="zIndex">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'

const zIndex = 3000
</script>

<style lang="less">
html,
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background: #fff;
}

#app {
  width: 100%;
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
