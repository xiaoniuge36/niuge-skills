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

### 2. 技术栈检测

读取 `package.json` 的 `dependencies` 和 `devDependencies`，按以下规则判断：

| 检测项 | 判断依据 | 结果 |
|--------|----------|------|
| React | 存在 `react` 依赖 | techStack: "react" |
| Vue 3 | 存在 `vue` >= 3.x | techStack: "vue3" |
| Vue 2 | 存在 `vue` < 3.x | techStack: "vue2" |
| TypeScript | 存在 `typescript` 依赖 | isTypeScript: true |
| UI 库 | antd/ant-design-pro/element-plus/element-ui | uiLibrary: "antd" 等 |
| 框架 | umi/next/nuxt/vite | framework: "umi" 等 |

#### 技术栈检测优先级

当同时存在多个框架依赖时：

1. 主框架优先（React > Vue）
2. 版本号优先（Vue 3 > Vue 2）
3. 用户确认兜底

### 3. 全局类型检查

按优先级检查以下文件是否存在，存在则读取所有 `declare interface/type` 声明：

```
types/global.d.ts
typings/index.d.ts
src/types/index.d.ts
src/types/global.d.ts
src/typings/global.d.ts
```

记录全局类型名称列表，生成代码时这些类型**不可 import**。

### 4. 项目结构扫描

检查以下目录是否存在，了解项目组织方式：

- `src/pages/` 或 `src/views/` → 页面目录
- `src/components/` → 公共组件目录
- `src/services/` 或 `src/api/` → API 接口目录
- `src/hooks/` 或 `src/composables/` → 公共 hooks 目录
- `src/utils/` → 工具函数目录

### 5. 依赖检测

#### React 项目

检查 `@ant-design/pro-components` 是否已安装：

- 已安装 → 生成代码使用 ProTable/ModalForm 等
- 未安装 → 提示用户安装：`npm install @ant-design/pro-components --save`

#### Vue 3 项目

检查 `element-plus` 是否已安装：

- 已安装 → 生成代码使用 el-table/el-form 等
- 未安装 → 提示用户安装：`npm install element-plus --save`

### 6. 知识库加载

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
- 技术栈: React + TypeScript
- UI 库: Ant Design Pro
- 框架: Umi
- 全局类型: UserInfo, TableItem, ProjectItem（不可 import）
- 页面目录: src/pages/
- 公共组件: src/components/（已有 FileUpload, SearchForm 等）
- 知识库已加载: react-antdpro-knowledge.md
```

## 与 MCP 的配合

若已配置 **codegen-engine** MCP，可优先调用 `detect_tech_stack`、`analyze_project`、`check_global_types`（参数见 [mcp-codegen-engine.md](./mcp-codegen-engine.md)），与上述手工检测结论交叉校验。
