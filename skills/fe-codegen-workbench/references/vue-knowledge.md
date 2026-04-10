# Vue 3 + Element Plus 知识库

生成 Vue 3 代码时必须参考本文件，确保代码质量和最佳实践。

## 核心依赖

```json
{
  "vue": "^3.4+",
  "element-plus": "^2.x",
  "vue-router": "^4.x",
  "pinia": "^2.x",
  "typescript": "^5.x",
  "vite": "^5.x"
}
```

## 强制使用 Composition API

所有 Vue 3 代码必须使用 `<script setup lang="ts">` + Composition API。

```vue
<!-- ✅ 正确 -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
</script>

<!-- ❌ 禁止 Options API -->
<script lang="ts">
export default {
  data() { return {} },
  methods: {}
}
</script>
```

## 响应式最佳实践

### ref vs reactive

```typescript
// ✅ 基本类型用 ref
const loading = ref(false)
const count = ref(0)
const name = ref('')

// ✅ 对象类型也推荐 ref（更安全）
const userInfo = ref<UserInfo | null>(null)

// ✅ 表单数据可以用 reactive
const formData = reactive({
  name: '',
  type: '',
  status: 0,
})

// ❌ 避免解构 reactive（会丢失响应式）
const { name, type } = reactive({ name: '', type: '' }) // 响应式丢失！

// ✅ 使用 toRefs 解构
const state = reactive({ name: '', type: '' })
const { name, type } = toRefs(state)
```

### 大列表用 shallowRef

```typescript
// ✅ 大数据列表用 shallowRef 提升性能
const tableData = shallowRef<DataItem[]>([])

const fetchData = async () => {
  const res = await getList()
  tableData.value = res.data.list // 整体替换触发更新
}
```

### computed 缓存

```typescript
// ✅ 用 computed 缓存计算结果
const filteredList = computed(() =>
  tableData.value.filter(item => item.status === activeStatus.value)
)

// ❌ 避免在模板中写复杂表达式
// <div v-for="item in list.filter(i => i.status === status)">
```

## Composables 设计模式

### 命名规范

| Composable | 用途 | 文件 |
|------------|------|------|
| `useTableData` | 表格数据管理 | `composables/useTableData.ts` |
| `useDetailData` | 详情数据获取 | `composables/useDetailData.ts` |
| `useEditForm` | 编辑表单逻辑 | `composables/useEditForm.ts` |
| `usePagination` | 分页逻辑 | `composables/usePagination.ts` |

### 标准 Composable 模式

```typescript
export const useTableData = () => {
  const tableData = ref<DataItem[]>([])
  const loading = ref(false)
  const total = ref(0)
  const searchForm = reactive({ name: '', type: '' })
  const pagination = reactive({ page: 1, pageSize: 10 })

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getList({ ...searchForm, ...pagination })
      tableData.value = res.data.list
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.page = 1
    fetchData()
  }

  const handleReset = () => {
    Object.assign(searchForm, { name: '', type: '' })
    pagination.page = 1
    fetchData()
  }

  onMounted(fetchData)

  return { tableData, loading, total, searchForm, pagination, fetchData, handleSearch, handleReset }
}
```

## Element Plus 最佳实践

### 表格配置

```vue
<el-table :data="tableData" v-loading="loading" border stripe>
  <el-table-column type="selection" width="55" />
  <el-table-column type="index" label="序号" width="60" />
  <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
  <el-table-column prop="status" label="状态" width="100">
    <template #default="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </el-table-column>
  <el-table-column label="操作" width="180" fixed="right">
    <template #default="{ row }">
      <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
      <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
        <template #reference>
          <el-button link type="danger">删除</el-button>
        </template>
      </el-popconfirm>
    </template>
  </el-table-column>
</el-table>
```

### 表单校验

```vue
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const formData = reactive({ name: '', type: '' })

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  await saveData(formData)
  ElMessage.success('保存成功')
}
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入名称" />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-select v-model="formData.type" placeholder="请选择类型">
        <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
  </el-form>
</template>
```

### 弹窗组件

```vue
<script setup lang="ts">
const visible = defineModel<boolean>({ default: false })
const props = defineProps<{ editData?: DataItem }>()
const emit = defineEmits<{ success: [] }>()

watch(() => props.editData, (val) => {
  if (val) Object.assign(formData, val)
  else resetForm()
})
</script>

<template>
  <el-dialog v-model="visible" :title="props.editData ? '编辑' : '新增'" width="500" destroy-on-close>
    <!-- 表单内容 -->
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
```

## Pinia 状态管理

```typescript
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  const setUserInfo = (info: UserInfo) => { userInfo.value = info }
  const logout = () => { userInfo.value = null }

  return { userInfo, isLoggedIn, setUserInfo, logout }
}, {
  persist: true,
})
```

## Vue Router 规范

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/module',
      children: [
        { path: '', component: () => import('./views/list/index.vue') },
        { path: 'detail/:id', component: () => import('./views/detail/index.vue') },
        { path: 'edit/:id?', component: () => import('./views/edit/index.vue') },
      ],
    },
  ],
})
```

## Vue 2 兼容说明

Vue 2 项目使用 Element UI + Options API：

| Vue 3 | Vue 2 对应 |
|-------|-----------|
| `<script setup>` | Options API `export default {}` |
| `ref()` / `reactive()` | `data()` |
| `computed()` | `computed: {}` |
| `onMounted()` | `mounted()` |
| `watch()` | `watch: {}` |
| `v-model` | `.sync` 修饰符 |
| Composables | Mixins |
| Pinia | Vuex |
