# niuge-skills

一个持续扩展中的 AI Agent Skills 仓库，以**企业级前端代码生成**为核心能力。

## 核心 Skill：统一工作台

前端代码生成由 **`fe-codegen-workbench`** 单一入口统一调度，不再拆成多个 `niuge-*` skill：

| 能力 | 说明 | 参考文档位置 |
|------|------|----------------|
| 统一调度 | 环境 → 需求 → 模板/组件 → 生成 → 审查 | [fe-codegen-workbench/SKILL.md](./skills/fe-codegen-workbench/SKILL.md) |
| 环境检测与建项 | 技术栈、全局类型、空目录建项目 | `skills/fe-codegen-workbench/references/environment-setup.md` |
| 需求分析 | 文本/原型图结构化 | `skills/fe-codegen-workbench/references/requirements-analysis.md` |
| 组件与模板 | 注册表 + 匹配规则 + MCP 配合 | `skills/fe-codegen-workbench/references/component-library.md` |
| 页面生成规范 | 目录、顺序、类型 | `skills/fe-codegen-workbench/references/page-generation.md` |
| 代码规范 | hooks、禁止 mock、全局类型 | `skills/fe-codegen-workbench/references/code-standards.md` |
| 组件注册表 | 模板与示例索引 | `skills/fe-codegen-workbench/references/component-registry.md` |
| **codegen-engine MCP** | 工具列表、调用顺序、本地路径 | `skills/fe-codegen-workbench/references/mcp-codegen-engine.md` |
| **规范真源对齐** | MCP `ai-fe-code-std.md` 与 Skill 精简版关系 | `skills/fe-codegen-workbench/references/normative-source.md` |
| **Agents** | 支持 `$fe-codegen-workbench` 的 agent 接口提示 | `skills/fe-codegen-workbench/agents/*.yaml` |

### 工作流程

```
用户描述需求
    ↓
[fe-codegen-workbench] 读 SKILL.md，按步骤打开 references/
    ↓
（若已配置 MCP）quick_generate → 生成 → check_code_compliance
    ↓
（可选）[code-review-expert] 审查
```

### 与 codegen-engine-mcp 的关系

- MCP 工程默认路径示例：`D:\A-Project\codegen-engine-mcp`（详见 workbench 内 `mcp-codegen-engine.md`）。
- 工作台文档已与 MCP 工具名、流程（如 `quick_generate`、`check_code_compliance`）对齐；无 MCP 时仍可按 references 手工生成。

## 集成 Skills（市场成熟 Skill）

| Skill | 说明 |
|-------|------|
| [Code Review Expert](./skills/code-review-expert/) | 结构化代码审查 |
| [Frontend Design](./skills/frontend-design/) | 前端设计与视觉 |
| [Webapp Testing](./skills/webapp-testing/) | Playwright 自动化测试 |
| [Find Skills](./skills/find-skills/) | 技能发现 |

## 使用方式

将所需 skill 目录复制到目标项目的 `.cursor/skills/`：

```bash
# 仅复制统一工作台（推荐）
cp -r skills/fe-codegen-workbench /path/to/your-project/.cursor/skills/

# 或复制全部 skills
cp -r skills/* /path/to/your-project/.cursor/skills/
```

### 触发示例

- 「做一个员工管理列表页」
- 「生成用户编辑表单」
- 「新建 React 项目」
- 原型图 + 文字需求

## 组件库说明

组件与模板维护在 **`fe-codegen-workbench/references/component-registry.md`**，覆盖 React / Vue3 / Vue2 等模板；可后续抽离为独立 npm 包，由 workbench 仅保留使用说明。

## 同步上游 Skills

```bash
node scripts/sync-upstream-skills.mjs
node scripts/sync-upstream-skills.mjs --skill frontend-design
```
