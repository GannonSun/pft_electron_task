<template>
  <div class="mainContainer">
    <div class="banner"></div>
    <div class="loginContainer">
      <p class="title">用户注册</p>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="ruleForm" status-icon>
        <el-form-item prop="user_name">
          <el-input v-model="ruleForm.user_name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="pass_word">
          <el-input v-model="ruleForm.pass_word" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item prop="pass_word_valid">
          <el-input v-model="ruleForm.pass_word_valid" placeholder="请再次输入密码" />
        </el-form-item>
      </el-form>
      <el-button class="signupBtn" type="primary" round size="large" @click="handleSignup">
        注册
      </el-button>
      <el-button class="loginBtn" type="primary" link size="large" @click="handleLogin">
        已有账号?前往登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { signup } from '../../services/user'

const router = useRouter()
const ruleFormRef = ref<FormInstance>()

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (ruleForm.pass_word_valid !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('pass_word_valid', () => null)
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== ruleForm.pass_word) {
    callback(new Error('两次输入的密码不一致，请重新输入'))
  } else {
    callback()
  }
}
const ruleForm = reactive({
  user_name: '',
  pass_word: '',
  pass_word_valid: ''
})
const rules = reactive({
  pass_word: [{ validator: validatePass, trigger: 'blur' }],
  pass_word_valid: [{ validator: validatePass2, trigger: 'blur' }]
})

const handleSignup = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const [err, res] = await signup({
        user_name: ruleForm.user_name,
        pass_word: ruleForm.pass_word
      })
      if (!err && res.code == 200) {
        ElMessage({
          type: 'success',
          message: '注册成功，即将为您跳转到登录页...'
        })
        setTimeout(() => {
          handleLogin()
        }, 1000)
      }
    }
  })
}

const handleLogin = () => {
  router.push({
    name: 'login'
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
    .signupBtn {
      margin-top: 12px;
      width: 200px;
    }
    .loginBtn {
      margin-left: 0;
      margin-top: 12px;
    }
  }
}
</style>
