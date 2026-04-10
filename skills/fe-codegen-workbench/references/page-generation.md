# 页面代码生成

本文件为 **fe-codegen-workbench** 流程第 4 步的详细说明。

详细规范见 [code-standards.md](./code-standards.md)。

## 生成原则

1. **hooks 优先**：先生成数据处理层，再生成 UI 层
2. **类型安全**：全局类型不 import，局部类型必须定义
3. **禁止 mock**：不生成任何假数据或示例数据
4. **规范内置**：符合 code-standards
5. **知识库驱动**：React 项目参考 [react-antdpro-knowledge.md](./react-antdpro-knowledge.md)；Vue 项目参考 [vue-knowledge.md](./vue-knowledge.md)

## 文件生成顺序（强制）

```
1. types.ts
2. hooks/*.ts 或 composables
3. components/*.tsx
4. index.tsx / index.vue
5. index.less
```

**禁止先生成组件再补 hooks。**

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
├── index.less
└── index.tsx
```

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
