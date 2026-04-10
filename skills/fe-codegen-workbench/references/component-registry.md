# 组件注册表

> **本文件为注册表说明文档。实际注册数据在 [`component-registry.json`](./component-registry.json)，组件定义在 [`components/`](./components/) 目录下。**

## 架构说明

组件注册采用「JSON 索引 + 独立文件」模式，参考 `codegen-engine-mcp/templates/` 结构：

```
references/
├── component-registry.json    ← 中央索引（元数据 + 来源路径）
└── components/                ← 一个文件一个组件
    ├── react-*.md
    ├── vue3-*.md
    └── vue2-*.md
```

### 来源类型（source.type）

| 类型 | 说明 | 状态 |
|------|------|------|
| `local` | 本地 `.md` 文件 | ✅ 已支持 |
| `npm` | npm 包（安装后按 export 引入） | 🔜 规划中 |
| `remote` | 远程 URL（运行时拉取） | 🔜 规划中 |

### 注册表 JSON 字段

```json
{
  "id": "react-standard-list-crud",
  "name": "React 标准列表页",
  "description": "适用于搜索+表格+新增/编辑/删除",
  "source": {
    "type": "local",
    "path": "components/react-standard-list-crud.md"
  },
  "techStack": "react",
  "scenes": ["list", "standard", "crud"],
  "componentScope": "page",
  "keywords": ["列表", "表格", "CRUD"],
  "antiKeywords": ["导入", "excel"]
}
```

### npm 来源字段（未来扩展）

```json
{
  "source": {
    "type": "npm",
    "package": "@niuge/ui-blocks",
    "version": "^1.0.0",
    "export": "StandardListCrud",
    "docPath": "docs/standard-list-crud.md"
  }
}
```

### remote 来源字段（未来扩展）

```json
{
  "source": {
    "type": "remote",
    "url": "https://registry.example.com/components/react-standard-list-crud",
    "format": "markdown",
    "cacheTTL": 86400
  }
}
```

## 当前已注册组件

### React 模板（10 个）

| ID | 名称 | 类型 |
|----|------|------|
| react-standard-list-crud | 标准列表页（ProTable + CRUD） | page |
| react-standard-modal-form | 弹窗表单（ModalForm） | component |
| react-drawer-form | 抽屉编辑表单（DrawerForm） | component |
| react-drawer-detail | 抽屉详情（Drawer Detail） | component |
| react-batch-schema-form | 批量 Schema 表单 | component |
| react-nonstandard-detail | 非标独立详情页 | page |
| react-standard-form-page | 标准表单页（独立路由） | page |
| react-import-list-modal | 导入弹窗（Excel Import） | component |
| react-pc-file-upload | PC 文件上传 | common |
| react-virtual-paginated-select | 大数据渲染下拉 | common |

### Vue 3 模板（2 个）

| ID | 名称 | 类型 |
|----|------|------|
| vue3-standard-list-crud | 标准列表页（Element Plus） | page |
| vue3-virtual-paginated-select | 大数据渲染下拉 | common |

### Vue 2 模板（4 个）

| ID | 名称 | 类型 |
|----|------|------|
| vue2-standard-list-crud | 标准列表页（Element UI） | page |
| vue2-virtual-paginated-select | 大数据渲染下拉 | common |
| vue2-h5-file-upload | H5 文件上传（Vant + 水印） | common |
| vue2-pc-file-upload | PC 文件上传（Element Upload） | common |

## 维护指南

### 新增组件

1. 在 `components/` 目录下创建 `{component-id}.md`
2. 在 `component-registry.json` 的 `components` 数组中添加注册条目
3. 确保 `source.path` 指向正确的文件

### 修改组件

直接编辑 `components/{component-id}.md`，元数据变更同步更新 `component-registry.json`。

### 删除组件

1. 从 `component-registry.json` 中移除条目
2. 删除 `components/{component-id}.md` 文件
