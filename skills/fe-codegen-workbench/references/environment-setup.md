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

当目标路径无 `package.json` 时，**默认创建 React + TypeScript 项目**。创建前询问用户确认技术栈与脚手架。

### 脚手架选择决策表

| 场景 | 推荐脚手架 | 说明 |
|------|-----------|------|
| **企业管理后台 / admin / 后台管理 / 中后台 / 运营平台 / CRM / 工单系统** | ⭐ **`create-admin-platform`** | React 19 + Ant Design 6 + React Router 7 + Vite 8。内置登录、权限守卫、菜单路由、Token 持久化、主题切换、请求封装、Zustand、MSW 本地 mock，开箱即可登录跑通 |
| 标准 B 端列表/表单 demo（不需要登录与权限） | `create-admin-platform` 或裸 Vite | 默认仍优先 `create-admin-platform`；用户明确说"最小化 / 不要登录 / 只要一个空 Vite 工程"时改走裸 Vite |
| 营销页 / Landing / 官网 / 单页静态站 | 裸 Vite + React | 不需要权限、路由守卫、Mock 后端 |
| 需要其他视觉品牌（Linear / Stripe / 等） | `create-admin-platform` + `--theme <key>` | CLI 内置 8 个主题：`default` / `fintech` / `compact` / `dark` / `linear` / `stripe` / `apple` / `ibm` |
| Vue 3 / Vue 2 项目 | 裸 Vite + Vue + Element Plus / Element UI | `create-admin-platform` 仅支持 React |

> **判定关键词**：用户原话含「**管理后台 / 后台管理 / admin / 中后台 / 企业后台 / 运营平台 / 管理系统 / CRM / 工单 / 控制台**」中任意一个 → 默认走 `create-admin-platform`。仅当用户**显式**说"最小化 / 只要 Vite / 不要登录权限 / 不要 mock"时才退化到裸 Vite。

### React 企业管理后台项目（推荐：create-admin-platform）

`create-admin-platform` 是基于 [admin-platform-starter](https://www.npmjs.com/package/create-admin-platform) monorepo 的官方脚手架 CLI，生成项目内联运行时源码、不依赖私有包，独立可发布部署。

#### 用户终端环境要求

- Node.js **>= 20**
- 推荐 pnpm **>= 10**（npm / yarn 也支持）

#### 标准创建命令（不带 --thsk）

```bash
# 推荐：pnpm dlx（无需全局安装）
pnpm dlx create-admin-platform@latest my-admin
```

上面的简写命令等价于把所有默认 flag 显式写出：

```bash
pnpm dlx create-admin-platform@latest my-admin \
  --features=mock,admin,security,form-builder \
  --router-mode hash \
  --theme default
```

替代方式（npm / yarn）：

```bash
npm create admin-platform@latest my-admin
yarn create admin-platform my-admin
```

创建后启动开发服务器：

```bash
cd my-admin
pnpm install
pnpm dev   # 默认端口 8500，http://localhost:8500
```

#### CLI 关键 flag 说明（OSS 默认模式，**不带 `--thsk`**）

| Flag | 取值 | 默认 | 说明 |
|------|------|------|------|
| `--preset <name>` | `blank` / `chain-bill` | `blank` | OSS 脚手架默认 `blank`（空业务路由）；`chain-bill` 是更完整的业务示例 |
| `--features <list>` | `mock` / `admin` / `security` / `form-builder` 逗号组合 | 全开 | `mock`=MSW 本地后端；`admin`=运营控制台；`security`=登录与权限守卫；`form-builder`=表单设计器 |
| `--router-mode <mode>` | `hash` / `browser` | `hash` | `hash` 适用任意静态托管；`browser` 需要 host 对未知 URL 回退到 `index.html` |
| `--theme <key>` | `default` / `fintech` / `compact` / `dark` / `linear` / `stripe` / `apple` / `ibm` | `default` | 初始主题键 |
| `--registry <url>` | 任意 npm registry | 无 | 写入生成项目的 `.npmrc` |
| `--interactive` | flag | 不开 | 即便给了 `<project-name>` 也强制交互提示 |

> **本工作台暂不使用 `--thsk` 内部品牌模式**。后续如需启用，再单独评估开放。

#### 生成项目目录结构

```text
my-admin/
├── src/
│   ├── api/                  # 固定认证 API + 业务请求客户端
│   ├── components/           # 源码内联的通用业务组件
│   ├── config/               # 应用配置 / 菜单 / 业务路由 / feature flag / 主题
│   ├── layouts/              # BasicLayout 与布局样式
│   ├── lib/                  # request / auth / permission / query / branding / dictionary
│   ├── pages/                # 路由页面 + hooks + 页面私有组件
│   ├── router/               # 路由创建 / 权限守卫 / 业务路由装配
│   ├── stores/               # Zustand 全局状态
│   ├── styles/               # 全局 Less 样式
│   └── utils/                # 工具函数
├── types/                    # 项目级运行时类型
├── mock/                     # 本地 MSW handlers（features.mock 启用时保留）
├── public/                   # 静态资源
├── package.json
├── tsconfig.json
└── vite.config.ts
```

#### 生成项目自带脚本

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 8500） |
| `pnpm dev:test` / `pnpm dev:uat` | 用 `.env.test` / `.env.uat` 启动 |
| `pnpm check` | lint + typecheck + test + build 一条龙 |
| `pnpm build` | typecheck + 生产构建 |
| `pnpm test` | Vitest 单测 |
| `pnpm preview` | 本地预览生产产物 |

#### Agent 创建脚手架的标准动作

当判定走 `create-admin-platform` 时，Agent 必须按以下顺序操作：

1. **确认 Node 版本**：用户终端是否 Node >= 20；若不满足，提示用户升级再继续。
2. **选定包管理器**：默认 pnpm；若用户机器无 pnpm，询问后改用 npm / yarn 对应命令。
3. **拼装命令**：根据用户场景信号决定 flag：
   - 用户提到"想看个最小可跑示例" → 全默认（即 `pnpm dlx create-admin-platform@latest <name>`）
   - 用户提到"用 hash 路由 / 用 browser 路由" → 调整 `--router-mode`
   - 用户提到品牌风格（如"用 linear 风格"）→ 加 `--theme linear`
   - 用户提到"不需要 mock / 已有真后端" → `--features=admin,security,form-builder`
   - 用户提到"不需要登录权限" → `--features=mock,admin,form-builder`
4. **运行命令**：在用户授权后在目标目录运行；本地若已有同名目录需先确认是否覆盖。
5. **后置安装与冒烟**：`pnpm install` → `pnpm dev` 起本地预览，告知用户访问 `http://localhost:8500`。
6. **进入步骤 2 及之后**：脚手架创建完后，继续走需求分析 → 模板匹配 → 页面生成。**注意**：生成的项目已自带页面/路由约定（`src/pages/<feature>/index.tsx + hooks/index.ts + index.less`），后续新增页面必须遵循该约定。

#### 与本工作台模板的关系

- `create-admin-platform` 生成的是**项目骨架**（登录、布局、路由、权限、主题等基础设施）。
- 本工作台 `references/components/react-*` 内置的是**业务页面模板**（列表 / 表单 / 详情 / 导入 / 上传等）。
- 两者**互补不冲突**：脚手架解决"从 0 到 1 跑起来"，业务页面模板解决"在脚手架上快速产出标准 CRUD/详情/表单页"。
- 在 `create-admin-platform` 生成的项目里调用本工作台模板时，必须保留脚手架的 `lib/request` / `lib/auth` / `stores/*` 等基础设施，不要重新引入 axios 实例或独立的 auth 流程。

### React 项目创建（裸 Vite，备选）

仅当用户**显式**要求最小化、不需要登录权限/MSW/路由守卫时使用此路径。

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

创建前询问用户确认（按下面顺序逐项确认或合并为单次 `ask_question`）：

1. **技术栈**（默认 React，可选 Vue3 / Vue2）
2. **脚手架**（仅 React 路径有选项）：
   - ⭐ `create-admin-platform`（默认推荐，企业管理后台首选）
   - 裸 Vite + React + AntD（仅当用户明确要最小化时）
3. **CLI flag**（走 `create-admin-platform` 时）：
   - `--features`（默认 `mock,admin,security,form-builder` 全开；按用户场景裁剪）
   - `--router-mode`（默认 `hash`）
   - `--theme`（默认 `default`；用户指定品牌风格时改对应 key）
   - ⚠️ **暂不开放 `--thsk`**，统一走 OSS 默认模式
4. **UI 库**（裸 Vite 路径才需要确认；React 默认 Ant Design Pro，Vue3 默认 Element Plus）
5. **是否需要路由**（裸 Vite 路径才需要确认；`create-admin-platform` 已内置 React Router 7）
6. **包管理器**（默认 pnpm；如用户机器无 pnpm 退化到 npm / yarn）

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

新建项目时额外输出脚手架信息：

```
项目创建计划：
- 脚手架: create-admin-platform（OSS 默认模式，不带 --thsk）
- 命令: pnpm dlx create-admin-platform@latest my-admin --features=mock,admin,security,form-builder --router-mode hash --theme default
- 终端环境: Node 22.10.0 ✅（>= 20）/ pnpm 10.33.2 ✅（>= 10）
- 目标目录: D:/A-Project/my-admin（不存在，将自动创建）
- 后续动作: pnpm install → pnpm dev（端口 8500）→ 进入步骤 2 需求分析
```

## 与 MCP 的配合

当前仓库未内置可直接调用的 MCP 说明文件。若未来补齐统一的 MCP 接入文档，可将其作为可选增强；在此之前以本文档的手工检测流程为准，不要引用不存在的 `mcp-codegen-engine.md`。
