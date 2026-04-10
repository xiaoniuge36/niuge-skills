# 组件库管理与模板匹配

本文件为 **fe-codegen-workbench** 流程第 3 步的详细说明。

## 核心能力

- 维护可复用组件和页面模板的注册表
- 根据需求关键词智能匹配最佳组件/模板
- 提供每个组件的使用示例和 API 文档
- 支持多技术栈（React/Vue3/Vue2）
- **支持多来源**：本地文件、npm 包、远程 URL（见注册表 `source.type`）

## 注册表架构

```
references/
├── component-registry.json        # 中央注册表（索引 + 元数据）
├── component-registry.md          # 注册表说明文档
└── components/                    # 独立组件定义（一个文件一个组件）
    ├── react-standard-list-crud.md
    ├── react-standard-modal-form.md
    ├── react-drawer-form.md
    ├── react-drawer-detail.md
    ├── react-batch-schema-form.md
    ├── react-nonstandard-detail.md
    ├── react-standard-form-page.md
    ├── react-import-list-modal.md
    ├── react-pc-file-upload.md
    ├── react-virtual-paginated-select.md
    ├── vue3-standard-list-crud.md
    ├── vue3-virtual-paginated-select.md
    ├── vue2-standard-list-crud.md
    ├── vue2-virtual-paginated-select.md
    ├── vue2-h5-file-upload.md
    └── vue2-pc-file-upload.md
```

### 组件来源类型

| source.type | 说明 | 当前状态 |
|-------------|------|----------|
| `local` | 本地 markdown 文件，路径相对于 `component-registry.json` | ✅ 已支持 |
| `npm` | npm 包组件，需安装后按 export 引入 | 🔜 规划中 |
| `remote` | 远程 URL，运行时拉取组件定义 | 🔜 规划中 |

### npm 来源示例（未来）

```json
{
  "id": "antd-pro-table-crud",
  "name": "Ant Design Pro 标准列表页",
  "source": {
    "type": "npm",
    "package": "@niuge/ui-blocks",
    "version": "^1.0.0",
    "export": "StandardListCrud",
    "docPath": "docs/standard-list-crud.md"
  },
  "techStack": "react",
  "keywords": ["列表", "ProTable", "CRUD"]
}
```

### remote 来源示例（未来）

```json
{
  "id": "community-kanban-board",
  "name": "社区看板组件",
  "source": {
    "type": "remote",
    "url": "https://registry.example.com/components/kanban-board",
    "format": "markdown",
    "cacheTTL": 86400
  },
  "techStack": "react",
  "keywords": ["看板", "拖拽", "任务管理"]
}
```

## 页面模板（摘要）

| 模板 ID | 名称 | 适用场景 | 技术栈 |
|---------|------|----------|--------|
| standard-list-crud | 标准列表页 | 搜索+表格+CRUD | React/Vue3/Vue2 |
| standard-modal-form | 弹窗表单 | <10 字段的新增/编辑 | React |
| standard-form-page | 独立表单页 | >20 字段的复杂表单 | React |
| drawer-form | 抽屉表单 | 10–20 字段的编辑 | React |
| drawer-detail | 抽屉详情 | 快速查看 | React |
| nonstandard-detail | 独立详情页 | 审批流程/附件预览 | React |
| import-list-modal | 导入弹窗 | Excel 导入 | React |
| pc-file-upload | PC 文件上传 | 图片/文件上传 | React/Vue2 |
| h5-file-upload | H5 文件上传 | 移动端上传+水印 | Vue2 |
| batch-schema-form | 批量 Schema 表单 | 动态批量编辑 | React |
| virtual-paginated-select | 大数据渲染 | 虚拟列表+分页下拉 | React/Vue3/Vue2 |

## 匹配规则

### Agent 匹配流程

1. 读取 `component-registry.json` 中的组件列表
2. 根据用户需求关键词与 `keywords` / `antiKeywords` 匹配
3. 按 `techStack` 过滤当前项目技术栈
4. 根据 `source.type` 加载组件定义：
   - `local`：读取 `source.path` 指向的 markdown 文件
   - `npm`：检查是否已安装，读取包内文档
   - `remote`：HTTP 拉取远程定义

### 关键词匹配

| 关键词 | 匹配模板 | 优先级 |
|--------|----------|--------|
| 列表/表格/搜索/CRUD/增删改查 | standard-list-crud | 高 |
| 弹窗/ModalForm/对话框 | standard-modal-form | 高 |
| 抽屉/侧边/DrawerForm | drawer-form | 高 |
| 详情/Descriptions | drawer-detail / nonstandard-detail | 中 |
| 导入/excel/xlsx | import-list-modal | 高 |
| 上传/附件/图片上传 | pc-file-upload / h5-file-upload | 高 |
| 虚拟列表/大数据/万级 | virtual-paginated-select | 高 |
| 独立表单页 | standard-form-page | 中 |
| 批量/Schema | batch-schema-form | 中 |

### 技术栈适配

| 技术栈 | UI 库 | 模板前缀 |
|--------|-------|----------|
| React | Ant Design / Ant Design Pro | react-* |
| Vue 3 | Element Plus | vue3-* |
| Vue 2 | Element UI | vue2-* |

### 容器选择规则

**编辑**：<10 字段 → Modal；10–20 → Drawer；>20 → 独立表单页。

**详情**：简单–中等 → Drawer；复杂（审批/附件）→ 独立详情页。

## 组件维护说明

### 新增本地组件

1. 在 `components/` 目录下创建 `{id}.md` 文件
2. 在 `component-registry.json` 的 `components` 数组中添加注册条目
3. 提供完整示例（hooks + 组件 + 样式）
4. 说明 Props/Events/API 与第三方依赖

### 引入 npm 包组件（未来）

1. 在 `component-registry.json` 中添加 `source.type: "npm"` 的条目
2. Agent 生成代码时改为包路径 `import`
3. 本 workbench 仅保留使用指南与 API

### 引入远程组件（未来）

1. 在 `component-registry.json` 中添加 `source.type: "remote"` 的条目
2. Agent 匹配时通过 HTTP 拉取定义
3. 支持 `cacheTTL` 控制缓存策略

## 与 MCP 的配合

- `smart_match_template` / `match_template`：自动对齐技术栈与模板 ID（带 `react-` / `vue2-` / `vue3-` 前缀）
- `get_component_knowledge`：组件库知识补充
- `find_similar_components`：项目内复用

## 组件知识库（UI 库参考）

### Ant Design Pro Components

React 项目优先使用 `@ant-design/pro-components`：

| 组件 | 用途 | 替代 |
|------|------|------|
| ProTable | 高级表格 | antd Table |
| ModalForm | 弹窗表单 | Modal + Form |
| DrawerForm | 抽屉表单 | Drawer + Form |
| ProFormText/Select/Date | 表单控件 | Form.Item + Input/Select |
| BetaSchemaForm | 动态 Schema 表单 | 手动拼接 |

### Element Plus

Vue 3 项目使用 Element Plus：

| 组件 | 用途 |
|------|------|
| el-table | 数据表格 |
| el-form + el-form-item | 表单 |
| el-dialog | 弹窗 |
| el-drawer | 抽屉 |
| el-pagination | 分页 |
| el-upload | 文件上传 |

### Element UI

Vue 2 项目使用 Element UI，API 与 Element Plus 基本一致，主要区别：
- `visible.sync` 代替 `v-model`
- 无 `<script setup>` 语法
