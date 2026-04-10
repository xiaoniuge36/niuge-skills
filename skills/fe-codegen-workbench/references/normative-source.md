# 规范真源说明

## 本 Skill 的定位

| 层级 | 是什么 | 路径 |
|------|--------|------|
| **本 Skill（fe-codegen-workbench）** | 调度说明 + 落地手册 + 模板注册表 + 编码规范 | `niuge-skills/skills/fe-codegen-workbench/` |

本 Skill 是**自包含**的前端代码生成工作台，所有生成规范、模板信息、编码标准均内置在 `references/` 目录中。

## 已内置的核心规则

以下规则在 `code-standards.md`、主 `SKILL.md`、`component-registry.json` 中均有体现：

- 模板匹配：Skill 步骤 3 + `component-registry.json` 注册表 + `components/` 独立组件文件
- 环境 / 全局类型：[environment-setup.md](./environment-setup.md)
- 技术栈知识库：React → [react-antdpro-knowledge.md](./react-antdpro-knowledge.md)；Vue → [vue-knowledge.md](./vue-knowledge.md)
- 标准弹窗 vs 非标独立页：先判模式再生成
- **hooks / composables 先于组件**：强制
- **全局类型禁止 import**：强制
- **禁止 mock**：强制
- 生成后自检：Skill 步骤 5（集成 code-review-expert）

## 执行依据

生成代码时以本 workbench 的以下文档为执行依据：

| 文档 | 覆盖范围 |
|------|----------|
| [code-standards.md](./code-standards.md) | 编码规范主干规则 |
| [component-registry.json](./component-registry.json) | 组件注册表索引（JSON） |
| [components/](./components/) | 独立组件定义文件（一文件一组件） |
| [react-antdpro-knowledge.md](./react-antdpro-knowledge.md) | React + Ant Design Pro 知识库 |
| [vue-knowledge.md](./vue-knowledge.md) | Vue 3 + Element Plus 知识库 |
| [page-generation.md](./page-generation.md) | 生成原则、文件顺序、目录结构 |
| [requirements-analysis.md](./requirements-analysis.md) | 需求分析与模板匹配 |
| [environment-setup.md](./environment-setup.md) | 环境检测与初始化 |
| [component-library.md](./component-library.md) | UI 组件库匹配规则 |
| [external-skills.md](./external-skills.md) | 外部 Skills 集成指南 |

## 维护建议

- 新增模板时：在 `components/` 下创建 `.md` 文件，同步更新 `component-registry.json`。
- 规范调整时：更新 `code-standards.md`。
- 知识库更新时：更新 `react-antdpro-knowledge.md` 或 `vue-knowledge.md`。
