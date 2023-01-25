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
          :row="3"
          placeholder="自定义备注，可填入Tapd链接"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialogFooter">
        <el-button @click="handleCancel(false)">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/store/user'
import { getGitList } from '@renderer/services/git'
import { addTask } from '@renderer/services/task'
import { IgitList } from '@renderer/interface/git'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  actionType: {
    type: String,
    default: 'add'
  }
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
  remark: ''
})
const rules = reactive<FormRules>({
  task_name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
})
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
  ruleFormRef && ruleFormRef.value.resetFields()
  ruleForm.task_related = [
    {
      git_id: '',
      branch_name: ''
    }
  ]
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
        }
      } else {
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
