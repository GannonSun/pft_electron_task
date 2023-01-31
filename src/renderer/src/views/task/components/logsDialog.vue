<template>
  <el-dialog
    class="logsDialog"
    v-model="visible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    width="60%"
    center
  >
    <el-progress
      :text-inside="true"
      :stroke-width="24"
      :percentage="precent"
      :status="progressStatus"
    />
    <div class="logsContainer">
      <p
        class="logItem"
        :class="{ successLog: item.code == 200, failedLog: item.code != 200 }"
        v-for="(item, index) in logsArr"
        :key="index"
        v-html="item.msg"
      ></p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])

let precent = ref<number>(0)
let logsArr = ref([])

const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
    precent.value = 0
    logsArr.value = []
  }
})
const dialogTitle = computed(() => {
  return precent.value === 100 ? '执行完成' : '执行命令中...'
})
const hasError = computed(() => {
  return logsArr.value.some((log) => log.code == 500)
})
const progressStatus = computed(() => {
  return hasError.value ? 'exception' : 'success'
})

window.electronAPI.onUpdateSwitchLog((e, logObj) => {
  console.log('log', logObj)
  if (logObj.code == 0) {
    precent.value = Math.round((logObj.current / logObj.total) * 100)
  } else {
    logsArr.value.push(logObj)
  }
})
</script>

<style lang="less" scoped>
.logsDialog {
  .logsContainer {
    margin: 16px 0;
    padding: 0 16px;
    max-height: 200px;
    overflow-y: auto;

    .logItem {
      white-space: pre-wrap;
    }
    .successLog {
      color: var(--el-color-success);
    }
    .failedLog {
      color: var(--el-color-danger);
    }
  }
}
</style>
