# 页面代码生成

本文件为 **fe-codegen-workbench** 流程第 4 步的详细说明。

详细规范见 [code-standards.md](./code-standards.md)。

## 生成原则

1. **完整规则以 [code-standards.md](./code-standards.md) 为准**：本文件只描述步骤 4 特有的生成顺序与拼装要求
2. **模板优先**：根据步骤 3 命中的模板目录拼装，不直接自由生成
3. **Service 层必备**：当用户未提供现成接口文件时，必须生成 API 调用骨架
4. **知识库驱动**：React 项目参考 [react-antdpro-knowledge.md](./react-antdpro-knowledge.md)；Vue 项目参考 [vue-knowledge.md](./vue-knowledge.md)
5. **差异受控**：只允许替换字段、接口、业务规则和项目内集成点，不改模板骨架与默认风格

## 文件生成顺序（强制）

```
1. types.ts
2. services/*.ts（仅当用户未提供接口文件时）
3. hooks/*.ts 或 composables
4. components/*.tsx
5. index.tsx / index.vue
6. index.less（仅写必要的业务样式覆盖）
7. 主题层文件（仅当 selectedBrandId 非空且 3.5 加载成功）
   - React + AntD Pro → src/theme/token.ts
   - Vue 3 + Element Plus → src/theme/vars.scss
   - Tailwind 项目 → tailwind.config.ts 扩展
8. 项目根 DESIGN.md 副本（仅当 selectedBrandId 非空）
```

**禁止先生成组件再补 hooks。**
**主题层必须在业务代码生成完成后追加，不得穿插生成。** 详细主题文件模板见 [design-md-integration.md](./design-md-integration.md) 步骤 4 章节。

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

## 模板目录读取顺序

命中模板后按以下顺序读取目录：

1. `sample.md`
2. `index.example.*`
3. `hooks/`、`components/`、`types.example.*` 等辅助示例文件
4. 如注册表中存在 `consistencyAnchors`，按锚点校验结果结构

## 技术栈约束入口

- 类型引入、hooks 顺序、禁止 mock、视觉边界：见 [code-standards.md](./code-standards.md)
- React ProTable / ModalForm / DrawerForm 细则：见 [react-antdpro-knowledge.md](./react-antdpro-knowledge.md)
- Vue 组件与组合式约束：见 [vue-knowledge.md](./vue-knowledge.md)

## 代码自检清单

见主 SKILL 第 5 步；执行时使用 [self-review-checklist.md](./self-review-checklist.md)。

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

根据需求在 [component-registry.json](./component-registry.json) 中匹配对应模板（按当前 techStack 过滤 `react-*` / `vue3-*` / `vue2-*`）。当注册表返回主模板与组合模板时，先拼主模板，再按 `composableWith` 顺序叠加组合模板。
