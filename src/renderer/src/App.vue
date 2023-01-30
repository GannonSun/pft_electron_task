<template>
  <el-config-provider :z-index="3000" :locale="zhCn">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
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

p {
  margin: 0;
  padding: 0;
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

::-webkit-scrollbar {
  width: 4px;
  height: 8px;
  background-color: transparent; // #f5f5f5;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #c1c1c1;
}
</style>
