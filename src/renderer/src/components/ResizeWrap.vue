<template>
  <div class="resizeWrapCom" :style="resizeStyle">
    <slot></slot>
    <div class="slideRightBar" @mousedown="resizeRight"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  defaultWidth: {
    type: String,
    default: 'auto'
  },
  defaultHeight: {
    type: String,
    default: 'auto'
  }
})

let width = ref<string>(props.defaultWidth)

const resizeStyle = computed(() => {
  return {
    width: width.value
  }
})

const resizeRight = (e: MouseEvent) => {
  const oldWidth = e.target.parentNode.clientWidth
  const startX = e.clientX
  document.onmousemove = (event: MouseEvent) => {
    const endX = event.clientX
    const distance = endX - startX
    width.value = `${oldWidth + distance}px`
  }
  document.onmouseup = () => {
    document.onmousemove = null
    document.onmouseup = null
  }
}
</script>

<style lang="less" scoped>
.resizeWrapCom {
  position: relative;

  .slideRightBar {
    position: absolute;
    right: -8px;
    top: 0;
    width: 8px;
    height: 100%;

    &:hover {
      cursor: col-resize;
      background: var(--el-color-primary-light-7);
    }
  }
}
</style>
