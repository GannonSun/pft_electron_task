<template>
  <div class="settingContainer">
    <p class="title">个人设置</p>
    <div class="gitSetting">
      <p class="subTitle">Git设置</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { IgitList, getGitList } from '../../services/git'

let gitList = ref<IgitList[]>([])

onMounted(() => {
  handleGetGitList()
})

const handleGetGitList = async () => {
  const [err, res] = await getGitList()
  if (!err && res.code == 200) {
    gitList.value = res.data
  }
}
</script>

<style lang="less" scoped></style>
