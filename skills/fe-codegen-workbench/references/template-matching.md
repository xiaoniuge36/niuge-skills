# 模板匹配与注册表说明

本文件统一说明步骤 3 的模板匹配规则、注册表结构、UI Profile 抽象与维护方式。

## 真源结构

本地模板采用「JSON 索引 + 模板目录」模式：

```text
references/
├── component-registry.json
├── template-matching.md
├── ui-profiles/
│   ├── react-antdpro.json
│   ├── vue3-element-plus.json
│   ├── vue2-element-ui.json
│   └── vue2-vant-h5.json
└── components/
    ├── react-standard-list-crud/
    │   ├── sample.md
    │   ├── index.example.tsx
    │   └── ...
    └── ...
```

约定：

- `component-registry.json` 只存匹配元数据与组合关系
- `components/<template-id>/` 是模板唯一真源
- `sample.md` 是模板说明入口
- 其余示例代码文件用于骨架拼装和一致性校验

## 注册表字段

每个模板至少包含以下字段：

| 字段 | 作用 |
|------|------|
| `id` | 模板唯一标识 |
| `techStack` | `react` / `vue3` / `vue2` |
| `profileId` | UI Profile 标识 |
| `source` | 模板来源，当前以 `local` 为主 |
| `keywords` | 直接命中词 |
| `synonyms` | 同义词、别名、口语表达 |
| `antiKeywords` | 排除词 |
| `priority` | 同时命中时的排序权重 |
| `composableWith` | 可与之组合的模板 ID |
| `consistencyAnchors` | 一致性锚点：文件名、hook 名、变量名等 |

本地来源约定：

```json
{
  "source": {
    "type": "local",
    "path": "components/react-standard-list-crud",
    "docFile": "sample.md"
  }
}
```

## 匹配流程

1. 先按 `techStack` 过滤模板集合。
2. 对用户需求做关键词归一化，优先匹配 `keywords`，再补充 `synonyms`。
3. 命中 `antiKeywords` 的模板降权或排除。
4. 选择 `priority` 最高的模板作为主模板。
5. 若需求包含导入、上传、批量编辑等增强能力，再按 `composableWith` 追加组合模板。

输出结果必须包含：

- `primaryTemplateId`
- `composedTemplateIds`
- `matchReason`
- `fallbackCandidates`

## 组合模板规则

常见组合：

| 主模板 | 组合模板 | 场景 |
|--------|---------|------|
| `*-standard-list-crud` | `react-import-list-modal` | 列表 + Excel 导入 |
| `*-standard-list-crud` | `react-batch-schema-form` | 列表 + 批量编辑 |
| `*-standard-form-page` / `*-drawer-form` | `react-pc-file-upload` / `vue2-h5-file-upload` | 表单 + 上传 |

约束：

- 主模板必须唯一
- 组合模板只能增强，不可替代主模板
- 若两个组合模板互斥，保留优先级更高者并提示用户确认

## 模板未命中

当没有模板明确命中时：

1. 返回最接近的 2-3 个候选模板
2. 说明未命中的原因
3. 要求用户选择：
   - 采用最近模板适配
   - 自由生成
   - 放弃生成

## UI Profile

UI Profile 用于抽离“组件库能力”与“模板匹配规则”的耦合关系。

| Profile | 用途 |
|---------|------|
| `react-antdpro` | React + Ant Design Pro |
| `vue3-element-plus` | Vue 3 + Element Plus |
| `vue2-element-ui` | Vue 2 + Element UI |
| `vue2-vant-h5` | Vue 2 H5 + Vant |

替换 UI 组件库时，优先新增 Profile 和模板目录，而不是直接改动核心流程文件。

## 一致性锚点

注册表中的 `consistencyAnchors` 用于保证同一需求重复生成时结果更稳定。

示例：

```json
{
  "requiredFiles": ["sample.md", "index.example.tsx"],
  "preferredHookNames": ["useTableData"],
  "preferredVariableNames": ["columns", "actionRef"]
}
```

生成结果应尽量与锚点保持一致，除非用户明确要求改名或项目已有既定规范冲突。

## 维护说明

### 新增模板

1. 新建 `components/<template-id>/`
2. 添加 `sample.md` 与示例代码
3. 在 `component-registry.json` 中登记元数据
4. 绑定 `profileId`
5. 补充 `synonyms`、`composableWith`、`consistencyAnchors`

### 修改模板

1. 优先修改模板目录中的 `sample.md` 和示例代码
2. 若命名、优先级、匹配词发生变化，再同步调整注册表

### 删除模板

1. 从 `component-registry.json` 删除注册项
2. 删除 `components/<template-id>/` 目录
3. 清理所有引用

## 关于 npm / remote / MCP

- `npm` 与 `remote` 来源当前仅保留数据结构，不作为默认执行路径
- 当前仓库未内置可直接调用的模板匹配 MCP 文档
- 若未来接入 MCP，应以本文件的字段结构为协议基础，而不是新增一套独立约定
