<template>
  <div class="mainContainer">
    <div class="banner"></div>
    <div class="loginContainer">
      <p class="title">任务管理</p>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="ruleForm" status-icon>
        <el-form-item prop="user_name">
          <el-input v-model="ruleForm.user_name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="pass_word">
          <el-input v-model="ruleForm.pass_word" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <el-button class="loginBtn" type="primary" round size="large" @click="handleLogin">
        登录
      </el-button>
      <el-button class="signupBtn" type="primary" link size="large" @click="handleSignup">
        注册
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '../../store/user'
import { login } from '../../services/user'

const router = useRouter()
const userStore = useUserStore()
const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
  user_name: '',
  pass_word: ''
})
const rules = reactive({})

const handleLogin = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const [err, res] = await login({
        user_name: ruleForm.user_name,
        pass_word: ruleForm.pass_word
      })
      if (!err && res.code == 200) {
        ElMessage({
          type: 'success',
          message: '登录成功'
        })
        userStore.setUserInfo(res.data)
        setTimeout(() => {
          router.push({
            name: 'task'
          })
        }, 1000)
      }
    }
  })
}

const handleSignup = () => {
  router.push({
    name: 'signup'
  })
}
</script>

<style lang="less" scoped>
.mainContainer {
  width: 100%;
  height: 100%;

  .banner {
    width: 100%;
    height: 35vh;
    background: url('@renderer/assets/login_bg.jpg') 100% 100%;
  }
  .loginContainer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;

    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 24px;
    }
    .ruleForm {
      width: 300px;
    }
    .loginBtn {
      margin-top: 12px;
      width: 200px;
    }
    .signupBtn {
      margin-left: 0;
      margin-top: 12px;
    }
  }
}
</style>
