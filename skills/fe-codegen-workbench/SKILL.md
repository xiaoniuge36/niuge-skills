---
name: fe-codegen-workbench
description: 前端代码生成统一工作台。当用户需要生成页面、创建组件、做列表页/表单页/详情页、搭建前端项目、或描述任何前端开发需求时使用。即使用户只说「做一个页面」或给出原型图，也应触发本 skill。本 skill 内统一调度：环境检测 → 需求分析 → 组件/模板匹配 → 页面生成 → 审查。
---

# 前端代码生成工作台（统一调度）

一个 **Skill** 覆盖完整闭环；子步骤说明拆在 `references/`，由本文件规定**顺序**并**强制执行**。

适用于所有前端场景：B 端管理系统、C 端应用、H5 移动端、中后台系统等。覆盖 React、Vue 3、Vue 2 三大技术栈。

`agents/agent.yaml` 与 `agents/openai.yaml` 供支持 Agent 接口的工具加载默认提示（`$fe-codegen-workbench`）。

## 跨工具兼容性

本工作台基于 SKILL.md 开放标准，兼容 Claude Code、Codex CLI、Cursor、ChatGPT 等所有支持该标准的工具。无需针对特定工具修改，任何 Agent 均可按本文件调度执行。

## 核心流程（强制顺序执行）

> **⚠️ 以下步骤为强制调度链路，Agent 必须按顺序执行，不可跳步或乱序。**

```
用户输入需求
    ↓
[1] 环境检测 → 项目是否存在？技术栈？全局类型？
    ↓ 无项目 → 默认创建 React 项目（见 environment-setup）
    ↓ 有项目 → 检测技术栈，加载对应知识库
[2] 需求分析 → 文本 + 原型图（如有）→ 结构化需求
    ↓ 需求模糊时可触发 brainstorming
[3] 组件/模板匹配 → 注册表匹配模板（按技术栈过滤）
    ↓
[4] 页面生成 → 加载技术栈知识库 → hooks 优先 → 组件 → 样式
    ↓
[5] 代码审查 → code-review-expert 深度审查 / 自检清单
```

## 步骤与参考文档

| 步骤 | 动作 | 必须阅读 |
|------|------|----------|
| 1 | 检测/初始化项目 | [references/environment-setup.md](references/environment-setup.md) |
| 2 | 解析需求与模板类型 | [references/requirements-analysis.md](references/requirements-analysis.md) |
| 3 | 匹配模板与组件 | [references/component-registry.json](references/component-registry.json)、[references/component-library.md](references/component-library.md) |
| 4 | 生成文件 | [references/page-generation.md](references/page-generation.md)、[references/code-standards.md](references/code-standards.md) |
| 4+ | 技术栈知识库 | React → [references/react-antdpro-knowledge.md](references/react-antdpro-knowledge.md)；Vue → [references/vue-knowledge.md](references/vue-knowledge.md) |
| 5 | 审查 | `code-review-expert` skill（强制集成）；或按 code-standards 自检清单 |
| 参考 | 规范说明 | [references/normative-source.md](references/normative-source.md) |
| 参考 | 外部 Skills 集成 | [references/external-skills.md](references/external-skills.md) |

## 技术栈检测与知识库加载策略

### 检测逻辑

```
目标路径存在 package.json？
  ├─ 是 → 读取 dependencies
  │   ├─ 存在 react → techStack = "react"
  │   │   ├─ 加载 react-antdpro-knowledge.md
  │   │   ├─ 组件匹配时过滤 react-* 模板
  │   │   └─ 检查 @ant-design/pro-components 是否已安装
  │   ├─ 存在 vue >= 3.x → techStack = "vue3"
  │   │   ├─ 加载 vue-knowledge.md
  │   │   └─ 组件匹配时过滤 vue3-* 模板
  │   └─ 存在 vue < 3.x → techStack = "vue2"
  │       ├─ 加载 vue-knowledge.md（Vue 2 兼容部分）
  │       └─ 组件匹配时过滤 vue2-* 模板
  └─ 否 → 新项目
      ├─ 默认 techStack = "react"
      ├─ 加载 react-antdpro-knowledge.md
      ├─ 询问用户确认（默认 React，可选 Vue3）
      └─ 按 environment-setup.md 创建项目
```

### 知识库加载规则

| 技术栈 | 内置知识库 | 外部 Skill（如已安装） |
|--------|-----------|---------------------|
| React | `react-antdpro-knowledge.md` | `vercel-react-best-practices` |
| Vue 3 | `vue-knowledge.md` | `vue-best-practices` |
| Vue 2 | `vue-knowledge.md`（兼容部分） | — |
| 所有 | `code-standards.md` | `frontend-design`（有设计稿时） |

## 调度规则（强制约束，不可跳步）

1. **步骤 1 必须先完成**：未检测环境不得生成业务代码；无项目须先确认再创建。**新项目默认 React + TypeScript + Ant Design Pro**。
2. **步骤 2 必须产出结构化需求清单**：含页面列表、字段、模板倾向。Agent 不得凭空猜测需求。需求模糊时触发 brainstorming 探索。
3. **步骤 3 必须匹配到具体模板 ID**：按当前技术栈过滤（`react-*` / `vue2-*` / `vue3-*`），从 `component-registry.json` 中读取注册表匹配，不得跳过模板匹配直接生成。
4. **步骤 4 必须加载技术栈知识库**：React 项目加载 `react-antdpro-knowledge.md`，Vue 项目加载 `vue-knowledge.md`。严格遵守 `code-standards.md`：hooks 优先、全局类型不 import、禁止 mock、文件生成顺序不可乱。
5. **步骤 5 必须执行审查**：优先使用 `code-review-expert` skill 进行深度审查（如已安装）；否则按 code-standards 自检清单逐项验证并输出报告。

## 与 code-review-expert 的集成

`code-review-expert` 是本工作台步骤 5 的**强制集成** skill。

### 集成方式

1. 生成代码完成后，将生成的文件列表作为 review scope
2. 加载 `code-review-expert/SKILL.md` + `references/review-flow.md`
3. 按前端特定场景额外加载：
   - `references/code-quality-checklist.md` — 代码质量、边界条件
   - `references/security-checklist.md` — 输入校验、XSS 防护
   - `references/testing-checklist.md` — 测试覆盖
4. 输出 P0-P3 findings
5. 自动修复 P0/P1 问题，P2/P3 在自检报告中标注

### 前端专项审查补充

在 code-review-expert 标准审查基础上，额外检查：

| 检查项 | 说明 |
|--------|------|
| hooks 优先 | 是否先生成 hooks 再生成组件 |
| 全局类型 | 是否误 import 了 global.d.ts 中的类型 |
| 禁止 mock | 是否包含假数据 |
| UI 还原度 | 是否与设计稿/原型图一致（如有） |
| 组件复用 | 是否可复用已有组件 |

## 与其他 Skills 集成

| Skill | 集成等级 | 用途 |
|-------|---------|------|
| `code-review-expert` | 深度集成 | 步骤 5 代码审查 |
| `brainstorming` | 深度集成 | 步骤 2 需求模糊时探索 |
| `vercel-react-best-practices` | 知识库参考 | React 性能优化 58 条规则 |
| `vue-best-practices` | 知识库参考 | Vue 3 响应式/组件/状态管理 |
| `frontend-design` | 知识库参考 | 有设计稿时的 UI/UX 思维 |
| `webapp-testing` | 可选增强 | 生成后 E2E 测试 |
| `systematic-debugging` | 可选增强 | 生成出错时调试 |
| `verification-before-completion` | 可选增强 | 完成前最终验证 |

详见 [references/external-skills.md](references/external-skills.md)。

## 快速触发示例

| 用户输入 | 动作 |
|----------|------|
| 「做一个列表页」 / 「生成代码」 | 全流程 1–5 |
| 「创建 React 项目」 | 步骤 1（默认 React） |
| 「创建 Vue3 项目」 | 步骤 1（Vue3 模式） |
| 「有哪些组件能用」 | 步骤 3 + component-registry.json |
| 原型图 + 描述 | 步骤 2 加强（加载 frontend-design），再走 3–5 |
| 「做一个 H5 上传页」 | 全流程 1–5（匹配 vue2-h5-file-upload 等模板） |

## 多页面策略

先完成 1–3，步骤 4 按依赖顺序：共享 `types` → 共享 hooks → 各页面；步骤 5 统一审查。

## 组件注册表

组件注册表采用「JSON 索引 + 独立文件」架构：

```
references/
├── component-registry.json    ← 中央索引（元数据 + 来源路径）
└── components/                ← 一个文件一个组件
    ├── react-*.md             ← React 模板（10 个）
    ├── vue3-*.md              ← Vue 3 模板（2 个）
    └── vue2-*.md              ← Vue 2 模板（4 个）
```

支持三种来源类型：`local`（当前）、`npm`（未来）、`remote`（未来）。

详见 [references/component-registry.md](references/component-registry.md)。

## 注意事项

- 每步完成后向用户简报进度。
- 技术栈、模板、交互形式等决策点需用户确认时暂停询问。
- 规范以本 workbench 的 code-standards 为准。
- 新项目默认 React，但必须询问用户确认。
- 生成代码时必须加载对应技术栈的知识库文件。
