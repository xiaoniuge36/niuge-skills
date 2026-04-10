# 页面代码生成

本文件为 **fe-codegen-workbench** 流程第 4 步的详细说明。

详细规范见 [code-standards.md](./code-standards.md)。

## 生成原则

1. **hooks 优先**：先生成数据处理层，再生成 UI 层
2. **类型安全**：全局类型不 import，局部类型必须定义
3. **禁止 mock**：不生成任何假数据或示例数据（含 localStorage/内存数组模拟接口）
4. **Service 层必备**：当用户未提供现成接口文件时，必须生成 API 调用骨架
5. **规范内置**：符合 code-standards
6. **知识库驱动**：React 项目参考 [react-antdpro-knowledge.md](./react-antdpro-knowledge.md)；Vue 项目参考 [vue-knowledge.md](./vue-knowledge.md)
7. **严禁过度设计**：不得添加用户未要求的功能模块、装饰元素、自定义视觉风格

## 文件生成顺序（强制）

```
1. types.ts
2. services/*.ts（仅当用户未提供接口文件时）
3. hooks/*.ts 或 composables
4. components/*.tsx
5. index.tsx / index.vue
6. index.less（仅写必要的业务样式覆盖）
```

**禁止先生成组件再补 hooks。**

### Service 层生成规则

| 场景 | 动作 |
|------|------|
| 用户提供接口文件引用（`接口：xxxApi`） | 直接 import 已有接口，**不生成** service 文件 |
| 用户提供 JSON 数据结构（无现成接口） | **必须生成** `services/[模块名].ts`，使用真实 API 调用骨架 |
| 新项目无 request 工具 | 额外生成 `src/utils/request.ts`（基于 axios） |

Service 文件示例见 [code-standards.md](./code-standards.md) 的 Service 层生成规范。

## 目录结构

### 标准弹窗模式

```
src/pages/[业务模块]/[功能名]/
├── components/
│   └── EditModal.tsx
├── hooks/
│   ├── index.ts
│   └── useTableData.ts
├── types.ts
├── index.less               # 仅写必要覆盖，不得自定义页面背景/字体/阴影
└── index.tsx
```

> **新增**：如用户未提供接口文件，还需在 `src/services/` 下生成对应的 API 调用文件。

### 非标独立页面模式

详情/编辑为独立路由时，在 `components/detail/`、`components/edit/` 下各自包含 hooks → 组件 → 样式。

### 识别规则

| 场景 | 使用模式 |
|------|----------|
| 弹窗/对话框 | 弹窗模式 |
| 跳转新页面/独立 URL | 独立页面模式 |
| 字段数 > 10 | 倾向独立页面 |
| 审批流程/附件预览 | 独立页面模式 |

## TypeScript 类型引入

| 类型来源 | 是否 import |
|----------|-------------|
| global.d.ts 全局声明 | 不可 import |
| 当前模块 types.ts | 必须 import |
| 第三方库类型 | 必须 import |

## React ProTable 强制规则

- **必须使用 `request` 模式**，严禁 `dataSource` + 手动 loading
- **搜索栏必须使用 ProTable 内置 `search`**，严禁手动拼 `<Form>`
- **状态/枚举列必须使用 `valueEnum`**，严禁手写 `<Tag>` 渲染
- **样式使用 Ant Design 默认**，严禁自定义渐变/阴影/字体

详见 [react-antdpro-knowledge.md](./react-antdpro-knowledge.md) ProTable 最佳实践。

## 代码自检清单

见主 SKILL 第 5 步；细则见 code-standards.md。

## 路由提醒

生成独立页面后提醒用户补充路由，例如：

```typescript
// React Router
{
  path: '/module/feature',
  children: [
    { path: '', element: <ListPage /> },
    { path: 'detail/:id', element: <DetailPage /> },
    { path: 'edit/:id?', element: <EditPage /> },
  ],
}
```

```javascript
// Vue Router
{
  path: '/module/feature',
  children: [
    { path: '', component: () => import('./views/list/index.vue') },
    { path: 'detail/:id', component: () => import('./views/detail/index.vue') },
    { path: 'edit/:id?', component: () => import('./views/edit/index.vue') },
  ],
}
```

## 模板匹配

根据需求在 [component-registry.json](./component-registry.json) 中匹配对应模板（按当前 techStack 过滤 `react-*` / `vue3-*` / `vue2-*`），读取 `components/` 目录下对应的组件定义文件，按模板的目录结构和核心代码模式生成文件。
