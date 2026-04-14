# 环境检测与项目初始化

本文件为 **fe-codegen-workbench** 流程第 1 步的详细说明（由主 SKILL 统一调度，无需单独 skill）。

## 检测流程

### 1. 项目存在性检查

检查目标路径下是否存在 `package.json`：

```
目标路径存在 package.json？
  ├─ 是 → 进入【技术栈检测】
  └─ 否 → 进入【项目创建】（默认 React）
```

### 2. 工作区与技术栈检测

先判断当前路径是否处于 monorepo / workspace，再决定读取哪个 `package.json`：

| 检查项 | 判断依据 | 处理方式 |
|--------|----------|---------|
| pnpm workspace | 存在 `pnpm-workspace.yaml` | 优先读取当前应用目录的 `package.json`，不要只读仓库根目录 |
| lerna | 存在 `lerna.json` | 结合当前子包路径判断技术栈 |
| npm/yarn workspaces | 根 `package.json` 含 `workspaces` | 继续向下查找离目标目录最近的应用包 |
| 单仓库 | 无 workspace 特征 | 直接读取当前目录 `package.json` |

在确定应用包后，读取 `dependencies` 和 `devDependencies`，按以下规则判断：

| 检测项 | 判断依据 | 结果 |
|--------|----------|------|
| React | 存在 `react` 依赖 | techStack: "react" |
| Vue 3 | 存在 `vue` >= 3.x | techStack: "vue3" |
| Vue 2 | 存在 `vue` < 3.x | techStack: "vue2" |
| TypeScript | 存在 `typescript` 依赖 | isTypeScript: true |
| UI 库 | antd/ant-design-pro/element-plus/element-ui | uiLibrary: "antd" 等 |
| 框架 | umi/next/nuxt/vite | framework: "umi" 等 |

#### 框架特征签名补充

除 `package.json` 依赖外，还需检查以下文件：

| 文件 | 说明 |
|------|------|
| `.umirc.ts` / `.umirc.js` / `config/config.ts` | Umi 项目特征，页面目录优先视为 `src/pages/` |
| `next.config.js` / `next.config.mjs` / `next.config.ts` | Next.js 项目特征，继续区分 `app/` 与 `pages/` |
| `vite.config.ts` / `vite.config.js` | Vite 项目特征 |
| `nuxt.config.ts` | Nuxt 项目特征 |

#### 技术栈冲突处理

出现以下冲突时不得自动拍板，必须提示用户确认：

| 冲突场景 | 处理方式 |
|---------|---------|
| `package.json` 同时存在 `react` 与 `vue` | 视为多应用或微前端嫌疑，暂停并要求用户确认目标子项目 |
| 同时存在多个框架配置文件 | 优先使用与目标目录最近的配置文件；仍冲突则询问用户 |
| 只读到仓库根包、未定位到应用包 | 不继续生成，先要求指定具体子包路径 |

### 3. 版本兼容矩阵

| 技术栈 | 最低版本要求 | 推荐验证版本 | 备注 |
|--------|-------------|-------------|------|
| React + antd | React >= 18.2，antd >= 5.12 | React 18.3 + antd 5.21 | React 页面默认按 Ant Design 5 语义生成 |
| `@ant-design/pro-components` | >= 2.6.0 | 2.7.x | 优先使用 `ProTable`、`ModalForm`、`DrawerForm` |
| Vue 3 + Element Plus | Vue >= 3.3，Element Plus >= 2.4 | Vue 3.4 + Element Plus 2.8 | 统一按 Composition API 约束 |
| Vue 2 + Element UI | Vue 2.6.x，Element UI 2.15.x | Vue 2.7 + Element UI 2.15 | 兼容老项目，不主动引入 Vue 3 写法 |

当检测到低于最低版本或存在明显冲突的依赖组合时，必须先提示风险，再决定是否继续。

### 4. 全局类型检查

按优先级检查以下文件是否存在，存在则读取所有 `declare interface/type` 声明：

```
types/global.d.ts
typings/index.d.ts
src/types/index.d.ts
src/types/global.d.ts
src/typings/global.d.ts
```

记录全局类型名称列表，生成代码时这些类型**不可 import**。

### 5. 项目结构扫描

检查以下目录是否存在，了解项目组织方式：

- `src/pages/` 或 `src/views/` → 页面目录
- `src/components/` → 公共组件目录
- `src/services/` 或 `src/api/` → API 接口目录
- `src/hooks/` 或 `src/composables/` → 公共 hooks 目录
- `src/utils/` → 工具函数目录
- `app/` 或 `pages/` → Next.js 目录

#### 目录推断补充

| 场景 | 页面目录优先级 |
|------|---------------|
| Umi | `src/pages/` |
| Next.js App Router | `app/` |
| Next.js Pages Router | `pages/` |
| Vue 3 / Vue 2 | `src/views/` |
| 普通 React + Vite | `src/pages/` |

### 6. 依赖检测

#### React 项目

检查 `@ant-design/pro-components` 是否已安装：

- 已安装 → 生成代码使用 ProTable/ModalForm 等
- 未安装 → 提示用户安装：`npm install @ant-design/pro-components --save`

#### Vue 3 项目

检查 `element-plus` 是否已安装：

- 已安装 → 生成代码使用 el-table/el-form 等
- 未安装 → 提示用户安装：`npm install element-plus --save`

### 7. 知识库加载

根据检测到的技术栈，加载对应知识库：

| 技术栈 | 加载文件 |
|--------|---------|
| React | `references/react-antdpro-knowledge.md` |
| Vue 3 / Vue 2 | `references/vue-knowledge.md` |

## 项目创建（无项目时）

当目标路径无 `package.json` 时，**默认创建 React + TypeScript 项目**。创建前询问用户确认技术栈。

### React 项目创建（默认）

```bash
# 1. 使用 Vite 创建 React + TypeScript 项目
npm create vite@latest . -- --template react-ts

# 2. 安装依赖
npm install

# 3. 安装 UI 库（默认 Ant Design）
npm install antd @ant-design/pro-components @ant-design/icons

# 4. 安装常用工具
npm install axios dayjs lodash-es
npm install -D @types/lodash-es

# 5. 安装路由
npm install react-router-dom
```

创建后的目录结构：

```
项目根/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   │   └── global.d.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Vue 3 项目创建（用户选择时）

```bash
# 1. 使用 Vite 创建 Vue 3 + TypeScript 项目
npm create vite@latest . -- --template vue-ts

# 2. 安装依赖
npm install

# 3. 安装 UI 库（默认 Element Plus）
npm install element-plus @element-plus/icons-vue

# 4. 安装常用工具
npm install axios dayjs lodash-es pinia
npm install -D @types/lodash-es unplugin-auto-import unplugin-vue-components

# 5. 安装路由
npm install vue-router@4
```

创建后的目录结构：

```
项目根/
├── src/
│   ├── views/
│   ├── components/
│   ├── api/
│   ├── composables/
│   ├── utils/
│   ├── store/
│   ├── types/
│   │   └── global.d.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 创建确认

创建前询问用户确认：

1. 技术栈（默认 React，可选 Vue3）
2. UI 库（React 默认 Ant Design Pro，Vue3 默认 Element Plus）
3. 是否需要路由
4. 包管理器（npm / pnpm / yarn）

## 输出格式

检测完成后输出结构化结果：

```
环境检测结果：
- 项目路径: D:/xxx/xxx
- 应用包路径: apps/admin
- 技术栈: React + TypeScript
- UI 库: Ant Design Pro
- 框架: Umi
- 全局类型: UserInfo, TableItem, ProjectItem（不可 import）
- 页面目录: src/pages/
- 公共组件: src/components/（已有 FileUpload, SearchForm 等）
- 知识库已加载: react-antdpro-knowledge.md
```

## 与 MCP 的配合

当前仓库未内置可直接调用的 MCP 说明文件。若未来补齐统一的 MCP 接入文档，可将其作为可选增强；在此之前以本文档的手工检测流程为准，不要引用不存在的 `mcp-codegen-engine.md`。
