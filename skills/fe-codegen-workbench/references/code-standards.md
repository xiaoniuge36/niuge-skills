# 前端代码生成规范

本文是 AI 代码生成的执行标准和约束规则，**严格遵循本规范生成代码**。

> 本文件是规则唯一完整定义处。其他文档只保留步骤特有说明，不再重复完整规则。

---

## 执行流程总览

**AI 生成代码时必须按以下流程执行**：

```
1️⃣ 解析用户输入
   ↓
2️⃣ 检查项目环境（技术栈、依赖包、全局类型文件）⚠️ 必须检查 types/global.d.ts
   ↓
3️⃣ 判断模式（标准弹窗 vs 非标独立页面）
   ↓
4️⃣ 生成代码（每个文件生成前都要检查类型）
   ↓
5️⃣ 代码自检（TypeScript、ESLint、规范、功能）
   ↓
6️⃣ 自动修复错误（P0/P1/P2 优先级）
   ↓
7️⃣ 生成自检报告（✅ 检查通过项、⚠️ 已修复问题、📋 文件清单）
```

**关键要求**：
- 第 2 步必须检查全局类型文件，避免重复引入
- 第 4 步生成 hooks 文件必须优先于组件文件
- 第 5-7 步自检修复流程**不得省略**

---

## 核心规则（必读）

### 1. hooks/composables 优先生成

- 所有业务逻辑（数据获取、表单提交、状态管理）必须在 hooks 中
- hooks 文件必须**第一个**生成，先于组件文件
- 即使只有一个 API 调用，也必须创建独立的 hooks 文件
- 组件中禁止直接出现 `useEffect` + API 调用的组合

### 2. TypeScript 类型安全

**强制执行流程**：
1. 检查项目中是否存在全局类型文件（`types/global.d.ts`、`typings/index.d.ts` 等）
2. 如果存在，读取文件内容，记录所有 `declare interface/type` 的名称
3. 生成代码时严格遵守：

| 类型来源 | 是否 import | 说明 |
|----------|-------------|------|
| `types/global.d.ts` 全局声明 | 不可 import | 直接使用 |
| 当前模块 `types.ts` | 必须 import | `import type { X } from './types'` |
| 第三方库类型 | 必须 import | `import type { ProColumns } from '@ant-design/pro-components'` |

```typescript
// ✅ 正确：全局类型直接使用
const [data, setData] = useState<ProjectItem>();

// ❌ 错误：重复引入全局类型
import type { ProjectItem } from './types';  // ProjectItem 在 global.d.ts 中！
```

### 3. 禁止项

- 禁止生成 mock 数据或假数据
- 禁止用 localStorage/sessionStorage/内存数组模拟接口（这与 mock 等价）
- 禁止残留 console.log / debugger
- 禁止使用 any 类型（应定义明确类型）
- 禁止在组件中直接调用 API
- 禁止先生成组件再补 hooks

### 4. 严禁过度设计（强制）

生成代码必须**严格按照用户需求**，不得自行发挥：

- **禁止添加用户未要求的功能模块**：如统计卡片、仪表盘、快捷入口、数据概览等
- **禁止添加装饰性文案**：如"面向中后台运营的统一台账..."等 AI 生成的描述段落
- **禁止添加装饰性标签**：如"IDENTITY CONTROL"、"DATA CENTER" 等英文 badge/eyebrow
- **禁止自定义主题风格**：不得使用渐变背景、毛玻璃效果、自定义配色方案、serif 装饰字体
- **禁止超出需求的统计聚合**：用户没要求统计数据，就不得添加 summary/statistics 区域
- **ProTable 标题区域只放工具栏按钮**：不得在 toolbar.title 中塞入额外的描述文字

违反此规则等同于 P0 错误。

### 5. 企业级视觉标准（强制）

所有生成代码的 UI 必须遵循**简洁、克制、数据密度优先**的企业级风格：

#### 样式基线

| 属性 | 标准值 | 禁止值 |
|------|--------|--------|
| 圆角 | Ant Design 默认（6px/8px） | 20px+、999px、pill 形状 |
| 背景色 | `#fff` 或 `#f5f5f5`（Ant Design 默认） | 渐变、半透明、radial-gradient |
| 字体 | 系统默认字体栈（不指定） | serif 字体、HarmonyOS Sans、clamp() |
| 阴影 | Ant Design 默认 box-shadow 或无 | 自定义大面积阴影（18px+） |
| 间距 | Ant Design token 标准（16px/24px） | 自定义大间距（32px+ padding） |
| 滤镜 | 无 | backdrop-filter、blur |

#### 布局标准

- **使用 Ant Design Pro 标准布局**：ProLayout + ProTable，不得自行用 Card + Row/Col 拼装搜索区域
- **搜索栏必须使用 ProTable 内置 search 功能**（`search={{ labelWidth: 'auto' }}`），严禁手动拼 Form
- **页面容器使用 PageContainer 或直接挂载**，不得自行包装 hero section
- **index.less 只写必要的业务样式覆盖**，不得重写页面整体布局和背景

#### 配色标准

- 状态标签使用 Ant Design 内置 `status` 枚举（`Success`/`Error`/`Default`/`Processing`/`Warning`）
- 不得自定义 Tag 颜色，通过 ProTable columns 的 `valueEnum` + `status` 自动渲染
- 不得使用品牌色覆盖 Ant Design 主题色

### 6. UI 设计图片 100% 还原

当用户提供 UI 设计图片时，必须 100% 还原视觉细节：
- **间距精确**：margin/padding 误差 ±2px 内
- **颜色精确**：使用设计稿 HEX 色值
- **字体匹配**：font-size、font-weight、line-height 精确
- **交互完整**：hover/active/disabled 状态全部实现
- **圆角/阴影**：border-radius、box-shadow 参数精确

---

## Service 层生成规范（强制）

### 生成原则

接口调用文件是生成代码的**必要组成部分**，不可省略。

#### 当用户提供接口文件引用时（`接口：xxxApi`）

- 直接 import 用户指定的接口函数，**不生成 service 文件**
- 示例：`import { getUserList, createUser } from '@/services/user'`

#### 当用户提供 JSON 数据结构时（无现成接口）

- **必须生成** `services/[模块名].ts` 文件
- 函数体为 API 调用骨架，使用项目中已有的 request 工具（如 `@/utils/request`）
- **严禁用 localStorage/内存数组/setTimeout 模拟接口**
- 接口路径使用合理的 RESTful 路径占位

```typescript
import request from '@/utils/request';

export const getUserList = (params: UserQueryParams) =>
  request.get<PageResult<UserRecord>>('/api/user/list', { params });

export const createUser = (data: UserFormValues) =>
  request.post<void>('/api/user', data);

export const updateUser = (id: string, data: UserFormValues) =>
  request.put<void>(`/api/user/${id}`, data);

export const deleteUser = (id: string) =>
  request.delete<void>(`/api/user/${id}`);

export const batchUpdateStatus = (data: { ids: string[]; status: string }) =>
  request.put<void>('/api/user/batch-status', data);
```

### 新项目无 request 工具时

生成简易 `src/utils/request.ts`（基于 axios）：

```typescript
import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    message.error(error?.response?.data?.message || '请求失败');
    return Promise.reject(error);
  },
);

export default request;
```

## 文件生成顺序（强制）

```
1. types.ts
2. services/*.ts（仅当用户未提供接口文件时）
3. hooks/*.ts 或 composables/*.ts
4. components/*.tsx 或 *.vue
5. index.tsx / index.vue
6. index.less（仅写必要的业务样式覆盖）
```

**禁止先生成组件再补 hooks。**

---

## 目录结构规范

### 目录创建规则

1. **目录位置**：`src/pages/[业务模块]/[文件夹名称]`（React）或 `src/views/[业务模块]/[文件夹名称]`（Vue）
2. **目录冲突**：若目录已存在，递增新建（如 `lists-v2`）
3. **命名规范**：使用 kebab-case

### 标准弹窗模式

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   └── EditModal.tsx        # 编辑弹窗
├── hooks/
│   ├── index.ts
│   └── useTableData.ts      # 表格数据管理
├── types.ts
├── index.less
└── index.tsx
```

### 非标独立页面模式

当详情/编辑为独立路由页面时：

```
src/pages/[业务模块]/[文件夹名称]/
├── components/
│   ├── detail/                # 详情独立页面
│   │   ├── hooks/
│   │   │   └── useDetailData.ts   # ⚠️ 必须生成
│   │   ├── index.tsx
│   │   └── index.less
│   └── edit/                  # 编辑独立页面
│       ├── hooks/
│       │   └── useEditForm.ts     # ⚠️ 必须生成
│       ├── index.tsx
│       └── index.less
├── hooks/
│   └── useTableData.ts
├── types.ts
├── index.less
└── index.tsx
```

### 模式判断规则

| 场景 | 使用模式 |
|------|----------|
| 弹窗/对话框/抽屉 | 弹窗模式 |
| 跳转新页面/独立 URL | 独立页面模式 |
| 字段数 > 10 | 倾向独立页面 |
| 审批流程/附件预览 | 独立页面模式 |
| 未明确说明 | 弹窗模式（默认） |

---

## 表单容器选择规则

根据字段数量自动选择：

| 字段数量 | 推荐组件 | 模板 ID | 说明 |
|---------|---------|---------|------|
| < 10 | ModalForm 弹窗 | `react-standard-modal-form` | 快速编辑 |
| 10-20 | DrawerForm 抽屉 | `react-drawer-form` | 中等表单 |
| > 20 | 独立表单页 | `react-standard-form-page` | 复杂表单 |

## 详情容器选择规则

| 信息复杂度 | 推荐组件 | 模板 ID | 说明 |
|-----------|---------|---------|------|
| 简单-中等 | Drawer 抽屉 | `react-drawer-detail` | 快速查看 |
| 中等-复杂 | 独立详情页 | `react-nonstandard-detail` | 审批流程/附件/需要分享 |

## 模板组合模式

| 模式 | 组合 | 适用场景 |
|------|------|----------|
| 简单 CRUD | list-crud + modal-form | 字段 < 10 |
| 中等复杂 | list-crud + drawer-detail + drawer-form | 字段 10-20 |
| 复杂场景 | list-crud + nonstandard-detail + form-page | 字段 > 20、审批流程 |
| 批量导入 | list-crud + import-list-modal | Excel 导入 |
| 带附件 | form-page + file-upload | 表单 + 文件上传 |

---

## 依赖引入规范

### React 项目依赖顺序

```typescript
// 1. React 核心库
import React, { useState, useEffect, useMemo } from 'react';
// 2. 第三方 UI 库
import { Button, Space, Table, Modal } from 'antd';
import { ProTable, ModalForm } from '@ant-design/pro-components';
// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
// 4. 项目内部模块
import { getUserList } from '@/services/user';
// 5. 当前目录模块
import { useTableData } from './hooks';
import EditModal from './components/EditModal';
import type { UserInfo } from './types';  // 仅当非全局类型
// 6. 样式文件
import './index.less';
```

### Vue 3 项目依赖顺序

```typescript
// 1. Vue 核心库
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 2. Element Plus
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
// 3. 第三方工具库
import { cloneDeep } from 'lodash-es';
// 4. 项目内部模块
import { getUserList } from '@/api/user';
// 5. 当前目录模块
import { useTableData } from './composables';
import EditDialog from './components/EditDialog.vue';
// 6. 样式文件
import './index.less';
```

---

## 支持的技术栈

- **React**: Ant Design Pro Components + TypeScript（统一使用 Pro）
- **Vue 3**: Element Plus + Composition API + TypeScript
- **Vue 2**: Element UI + Options API

### React Pro 组件库

所有 React 模板统一使用 `@ant-design/pro-components`：
- `ProTable` → 高级表格
- `ModalForm` / `DrawerForm` → 弹窗/抽屉表单
- `ProFormText` / `ProFormSelect` 等 → 表单控件
- `BetaSchemaForm` → 动态 Schema 表单

---

## React 规范

### ProTable 配置（强制 request 模式）

**严禁使用 `dataSource` + 手动 loading**，必须使用 ProTable 内置 `request` 模式。

```tsx
<ProTable<ItemType>
  columns={columns}
  actionRef={actionRef}
  request={async (params) => {
    const { current: pageNum, pageSize, ...rest } = params;
    const res = await fetchList({ pageNum, pageSize, ...rest });
    return { data: res.data.list, total: res.data.total, success: true };
  }}
  rowKey="id"
  search={{ labelWidth: 'auto', span: 8 }}
  pagination={{ defaultPageSize: 10 }}
  toolBarRender={() => [
    <Button type="primary" key="create" onClick={openCreateModal}>新增</Button>,
  ]}
/>
```

**ProTable 禁止清单**：

| 禁止写法 | 原因 | 正确方式 |
|----------|------|---------|
| `dataSource={data}` + `loading={loading}` | 退化为普通 Table | 使用 `request` |
| `search={false}` + 手动拼 `<Form>` | 破坏 ProTable 搜索能力 | 使用 `search={{ labelWidth: 'auto' }}` |
| `options={false}` | 移除内置工具栏 | 保留默认或配置 `options={{ reload: true }}` |
| `toolbar={{ title: <描述文字> }}` | 添加多余装饰 | toolbar 只放按钮 |

**columns 中 valueEnum 状态渲染**（替代手写 Tag）：

```tsx
{
  title: '状态',
  dataIndex: 'status',
  valueEnum: {
    enabled: { text: '启用', status: 'Success' },
    disabled: { text: '禁用', status: 'Default' },
  },
}
```
```

### ModalForm 配置

```tsx
<ModalForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  modalProps={{ destroyOnClose: true, maskClosable: false }}
  onFinish={async (values) => {
    await (editId ? updateItem(editId, values) : createItem(values));
    message.success('保存成功');
    onSuccess?.();
    return true;
  }}
/>
```

### DrawerForm 配置

```tsx
<DrawerForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  drawerProps={{ onClose, destroyOnClose: true, maskClosable: false, width: 600 }}
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 16 }}
  onFinish={handleSubmit}
/>
```

### Hooks 模式

```tsx
export const useTableData = () => {
  const actionRef = useRef<ActionType>();

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除？',
      onOk: async () => {
        await deleteItem(id);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  return { actionRef, handleDelete };
};
```

---

## Vue 3 规范

### Composables 模式

```typescript
export const useTableData = () => {
  const tableData = ref<ItemType[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const searchForm = reactive({ name: '', type: '' });
  const pagination = reactive({ page: 1, pageSize: 10 });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getList({ ...searchForm, ...pagination });
      tableData.value = res.data.list;
      total.value = res.data.total;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchData);
  return { tableData, loading, total, searchForm, pagination, fetchData };
};
```

### Element Plus 表单

```vue
<el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
  <el-form-item label="名称" prop="name">
    <el-input v-model="formData.name" placeholder="请输入" />
  </el-form-item>
</el-form>
```

---

## Vue 2 规范

### Options API 模式

```javascript
export default {
  data() {
    return {
      tableData: [],
      loading: false,
      total: 0,
      searchForm: { name: '', type: '' },
      pagination: { page: 1, pageSize: 10 },
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await getList({ ...this.searchForm, ...this.pagination });
        this.tableData = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
  },
};
```

---

## 字段类型 → 组件映射

| 字段类型 | 搜索组件 | 表单组件 | 表格展示 |
|----------|----------|----------|----------|
| 文本 | Input | Input | 直接展示 |
| 数字 | InputNumber | InputNumber | 数字格式化 |
| 枚举/状态 | Select | Select/Radio | Tag 标签 |
| 日期 | DateRangePicker | DatePicker | 日期格式化 |
| 布尔 | Select | Switch | Tag/文字 |
| 长文本 | - | TextArea | Tooltip |
| 关联 | 远程搜索 Select | 远程搜索 Select | 关联名称 |
| 文件 | - | Upload | 链接/预览 |

---

## 非标独立页面 hooks 强制规则

### React 项目必须文件

| 页面类型 | hooks 文件 | 说明 |
|---------|-----------|------|
| 详情页 | `components/detail/hooks/useDetailData.ts` | 数据获取逻辑 |
| 编辑页 | `components/edit/hooks/useEditForm.ts` | 表单逻辑 |

### Vue 3 项目必须文件

| 页面类型 | composables 文件 | 说明 |
|---------|-----------------|------|
| 详情页 | `components/detail/composables/useDetailData.ts` | 数据获取逻辑 |
| 编辑页 | `components/edit/composables/useEditForm.ts` | 表单逻辑 |

### Vue 2 项目必须文件

| 页面类型 | 逻辑文件 | 说明 |
|---------|---------|------|
| 详情页 | `components/detail/detail.js` | 详情逻辑 |
| 编辑页 | `components/edit/edit.js` | 编辑逻辑 |

**禁止行为**：
- 禁止因为"逻辑简单"而跳过 hooks 文件
- 禁止将数据获取直接写在组件中
- 禁止先生成组件再补 hooks
- 禁止合并 detail 和 edit 的 hooks

---

## 代码自检与修复流程（不可省略）

### 自检清单

结构化 PASS/FAIL 清单见 [self-review-checklist.md](./self-review-checklist.md)。

本文件保留规则定义，清单文件负责把这些规则转换成可逐项执行的检查项。

#### 自检范围

- 类型引入与全局类型
- hooks / composables 组织顺序
- 组件内是否直接调用 API
- ProTable / Element 关键约束
- 禁止 mock / 禁止调试代码
- Service 层是否补齐
- 模板拼装一致性与视觉边界

### 修复优先级

- **P0（必须立即修复）**：类型错误、语法错误、缺少 hooks
- **P1（应该修复）**：ESLint 警告、未使用的导入
- **P2（建议优化）**：代码可读性、性能优化

### 自检报告模板

```markdown
## 代码生成自检报告
### ✅ 检查通过项
- [x] TypeScript 类型检查通过
- [x] hooks 文件已生成且符合规范
- [x] 类型引入符合全局类型规则
### ⚠️ 已修复问题
- 修复了 N 处全局类型重复引入
- 删除了 N 个未使用的导入
### 📋 生成文件清单
1. hooks/useTableData.ts ✅
2. components/EditModal.tsx ✅
3. index.tsx ✅
### ✅ 代码质量确认
- 无语法错误、无类型错误、符合规范
```

---

## 错误处理规范

```typescript
try {
  await apiCall();
  message.success('操作成功');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : '操作失败';
  message.error(errorMessage);
}
```

## 空值处理

```typescript
// 详情页空值展示
<Descriptions.Item label="名称">{data?.name ?? '-'}</Descriptions.Item>

// 表格空值展示（ProTable 可直接省略 render，空值默认显示 '-'）
{ title: '名称', dataIndex: 'name', ellipsis: true }
```

## 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件名 | PascalCase | `UserList`, `EditModal` |
| 文件名（React 组件） | PascalCase | `EditModal.tsx` |
| 文件名（Vue 组件） | PascalCase 或 kebab-case | `EditDialog.vue` |
| 变量/函数 | camelCase | `userData`, `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` |
| 类型/接口 | PascalCase | `UserInfo` |
| CSS 类名 | kebab-case | `user-list` |
| 文件夹名 | kebab-case | `employee-list` |
