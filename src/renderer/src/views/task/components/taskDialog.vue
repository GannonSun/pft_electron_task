<template>
  <el-dialog
    class="taskDialog"
    v-model="visible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    width="60%"
  >
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="125px" status-icon>
      <el-form-item label="任务名称" prop="task_name">
        <el-input class="formInput" v-model="ruleForm.task_name" />
      </el-form-item>
      <el-form-item label="关联仓库及分支" required>
        <div class="relatedItem" v-for="(item, index) in ruleForm.task_related" :key="item.git_id">
          <el-select
            v-model="item.git_id"
            filterable
            placeholder="输入关键词搜索"
            style="width: 160px"
          >
            <el-option
              v-for="item in gitList"
              :key="item.git_id"
              :label="item.git_name"
              :value="item.git_id"
            />
          </el-select>
          <el-input class="relatedInput" v-model="item.branch_name"></el-input>
          <div class="relatedAction">
            <el-button
              v-if="index === ruleForm.task_related.length - 1"
              type="primary"
              :icon="Plus"
              circle
              size="small"
              @click="handleAddRelated"
            ></el-button>
            <el-button
              v-if="ruleForm.task_related.length > 1"
              type="danger"
              :icon="Minus"
              circle
              size="small"
              @click="handleDelRelated(index)"
            ></el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          class="formInput"
          v-model="ruleForm.remark"
          type="textarea"
          :rows="3"
          placeholder="自定义备注，可填入Tapd链接"
        />
      </el-form-item>
      <el-form-item v-if="actionType === 'add'" label="是否自动创建分支" prop="auto_checkout">
        <el-radio-group v-model="ruleForm.auto_checkout" class="ml-4">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialogFooter">
        <el-button @click="handleCancel(false)">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
  <logs-dialog v-model="logsDialogVisible"></logs-dialog>
</template>

<script setup lang="ts">
import { computed, watch, reactive, ref, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/store/user'
import { getGitList } from '@renderer/services/git'
import { addTask, updateTask } from '@renderer/services/task'
import { IgitList } from '@renderer/interface/git'
import LogsDialog from './logsDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  actionType: {
    type: String,
    default: 'add'
  },
  taskInfo: Object
})
const emit = defineEmits(['update:modelValue', 'refresh'])

const userStore = useUserStore()

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  task_name: '',
  task_related: [
    {
      git_id: '',
      branch_name: ''
    }
  ],
  remark: '',
  auto_checkout: 0 // 1 是 0 否
})
const rules = reactive<FormRules>({
  task_name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
})
let logsDialogVisible = ref<boolean>(false)
let gitList = ref<IgitList[]>([])

const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
const dialogTitle = computed(() => {
  const typeMap = {
    add: '新增任务',
    edit: '编辑任务'
  }
  return typeMap[props.actionType]
})

watch(
  visible,
  (newVal, oldVal) => {
    if (newVal) {
      if (props.actionType === 'edit' && props.taskInfo) {
        ruleForm.task_name = props.taskInfo.task_name
        ruleForm.task_related = props.taskInfo.task_related
        ruleForm.remark = props.taskInfo.remark
      }
    } else {
      ruleFormRef && ruleFormRef.value.resetFields()
      ruleForm.task_related = [
        {
          git_id: '',
          branch_name: ''
        }
      ]
    }
  },
  { deep: true }
)

onMounted(() => {
  handleGetGitList()
})

const handleGetGitList = async () => {
  const [err, res] = await getGitList()
  if (!err && res.code == 200) {
    gitList.value = res.data
  }
}
const handleAddRelated = () => {
  ruleForm.task_related.push({
    git_id: '',
    branch_name: ''
  })
}
const handleDelRelated = (index) => {
  ruleForm.task_related.splice(index, 1)
}
const handleCancel = (needRefresh: boolean = false) => {
  visible.value = false
  needRefresh && emit('refresh')
}
const handleSave = () => {
  if (!ruleFormRef) return
  ruleFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      const { task_related } = ruleForm
      if (
        !task_related.length ||
        task_related.some((r) => r.git_id === '' || r.branch_name === '')
      ) {
        return ElMessage.warning('请填写关联配置')
      }
      if (props.actionType === 'add') {
        // 新增
        const [err, res] = await addTask({
          ...ruleForm,
          user_id: userStore.userId
        })
        if (!err && res.code == 200) {
          ElMessage.success('新增成功')
          handleCancel(true)
          if (ruleForm.auto_checkout) {
            logsDialogVisible.value = true
            window.electronAPI.operateGit(res.data, 'created')
          }
        }
      } else {
        // 编辑
        const [err, res] = await updateTask({
          ...ruleForm,
          user_id: userStore.userId,
          task_id: props.taskInfo?.task_id
        })
        if (!err && res?.code == 200) {
          ElMessage.success('更新成功')
          handleCancel(true)
        }
      }
    }
  })
}
</script>

<style lang="less">
.taskDialog {
  .el-dialog__body {
    padding: 32px;
  }
  .formInput {
    width: calc(100% - 80px - 12px);
  }
  .relatedItem {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
    .relatedInput {
      flex: 1;
    }
    .relatedAction {
      width: 80px;
    }
  }
}
</style>
