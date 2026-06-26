# frontend-code-spec

前端代码规范 Skill：把阿里巴巴前端规约 [`alibaba/f2e-spec`](https://github.com/alibaba/f2e-spec) 整理成可执行的 Agent 工作流，覆盖 JS / TS / React / Node / CSS / HTML 编码规约，以及 Git、Changelog、Markdown、HTTP JSON API 等工程规约，并打通 `f2elint` 与各类 `*-config-ali` 工具链接入。

基于 SKILL.md 开放标准，兼容 Claude Code、Codex CLI、Cursor、ChatGPT 等所有 AI 编码工具。

> 命名说明：skill id 为通用的 `frontend-code-spec`，规则内容仍基于 `alibaba/f2e-spec`（MPL-2.0），来源标注保留在各文件中。

## 适用场景

- 接入或迁移 `f2elint`、`eslint-config-ali`、`stylelint-config-ali`、`prettier-config-ali`、`commitlint-config-ali`、`markdownlint-config-ali`
- 生成或审查 JS / TS / React / Node / CSS / HTML 代码时按前端代码规范做约束
- 审查 Commit Message、分支命名、CHANGELOG、Markdown 文档与 HTTP JSON API 结构
- 与 `fe-codegen-workbench` 搭配，在前端代码生成后补充规约合规检查

## 触发示例

```
@frontend-code-spec 给这个 React 项目接入前端代码规范
@frontend-code-spec 检查当前改动是否符合 f2e-spec
@frontend-code-spec 按规约审查这个组件和样式
@frontend-code-spec 生成一份 f2elint 接入方案
```

触发词包括：`前端代码规范`、`前端规范`、`代码规约`、`工程规约`、`统一 lint`、`阿里巴巴前端代码规范`、`阿里前端规约`、`f2e-spec`、`f2elint`、`eslint-config-ali`。

## 工作方式

1. 先识别项目形态与**既有约定基线**：包管理器、工作区布局、React / Node / 库 / 文档范围、现有 lint/format/commit 配置，以及 `.editorconfig` 和代码里已有的命名/缩进/引号风格——把它当成权威基线，规约只做叠加，不覆盖更严格的本地规则。
2. 按需**只加载最窄的那一份 reference**，不必每次全量读取：
   - 选规约领域 → [references/spec-index.md](references/spec-index.md)
   - 接入/迁移工具链 → [references/tool-adoption.md](references/tool-adoption.md)
   - 生成/审查代码 → [references/review-checklist.md](references/review-checklist.md)
3. 工具优先：能用 `f2elint` / ESLint / Stylelint / Prettier 自动校验的，先跑工具，再用人类可读规约补充判断与例外。
4. 生成/重构代码时，为非显而易见的意图（业务规则、边界情况、绕坑）**补上简短注释**，解释「为什么」而非复述「做了什么」。
5. **提交前过合规校验门**（见 SKILL.md「Compliance Gate」）：可用的校验器都真实跑过、`mandatory` 违规均已修复或记录为例外、findings 已 P0–P3 分级、缺失工具已点名并给出下一步命令——任一项不满足就显式说明，不假装全绿。

> ⚠️ **Vue 说明**：上游 f2e-spec **没有 Vue 专项编码规约**，`eslint-config-ali` 也**只提供 `base` / `react` 两个 flat preset**（无官方 Vue preset）。Vue 项目套用 Common + JavaScript / TypeScript 通用规则，并在 `base` 之上叠加项目自身的 Vue 插件——这是上游的规约盲区，而非有官方 Vue 方案。

## 与 fe-codegen-workbench 协作

本 skill 是规约**审查/合规**类，与代码**生成**类的 [`fe-codegen-workbench`](../fe-codegen-workbench/) 互补：

- 旗舰工作台在步骤 5 代码审查后，可调用本 skill 做一次规约合规 pass。
- 触发时机：用户明确要求前端代码规范 / f2elint，或项目已接入 `*-config-ali` 配置。
- 旗舰的 [references/external-skills.md](../fe-codegen-workbench/references/external-skills.md) 已将本 skill 登记为「规范合规参考」。

## 目录结构

```
frontend-code-spec/
├── SKILL.md                      # 主调度入口
├── README.md                     # 本文件
├── agents/
│   ├── agent.yaml                # 通用 Agent 接口配置
│   └── openai.yaml               # OpenAI 兼容入口（与 agent.yaml 保持一致）
└── references/
    ├── spec-index.md             # 规约索引：按任务挑最窄的规约领域
    ├── tool-adoption.md          # 工具接入：f2elint / *-config-ali 安装与迁移
    └── review-checklist.md       # 审查清单：P0–P3 分级 + 报告模板
```

## 安装

```bash
# 方式一：npx skills CLI（推荐）
npx skills add xiaoniuge36/niuge-skills --skill frontend-code-spec

# 方式二：本地同步脚本（同步到 Claude Code / Codex CLI / Cursor）
node scripts/install-local-skills.mjs --tool claude --skill frontend-code-spec
node scripts/install-local-skills.mjs --tool codex  --skill frontend-code-spec
node scripts/install-local-skills.mjs --tool cursor --skill frontend-code-spec

# 方式三：手动复制
cp -r skills/frontend-code-spec /path/to/your-project/.claude/skills/
```

## 上游快照与版本

本 skill 以本目录 `references/` 的**本地快照**执行，**不会在每次执行时自动拉取远程仓库**；需要最新规则文本时应显式查阅 [alibaba/f2e-spec](https://github.com/alibaba/f2e-spec) 或 [官方文档](https://alibaba.github.io/f2e-spec/)。表达方式参考了 [danchaofan869527/f2e-spec-skill](https://github.com/danchaofan869527/f2e-spec-skill) 的单文件 Skill 思路。

- 快照 commit：`beb1ac899ea6dab206331263bbcdcad8f8fe336e`（2026-05-06）
- License：MPL-2.0

| 包 | 快照版本 |
|---|---:|
| `f2elint` | `7.0.0` |
| `eslint-config-ali` | `16.6.0` |
| `stylelint-config-ali` | `3.0.0` |
| `prettier-config-ali` | `1.5.0` |
| `commitlint-config-ali` | `1.4.0` |
| `markdownlint-config-ali` | `0.1.2` |

> 运行 `npx f2elint@latest` 等命令可能拉到比本快照更新的包版本；推荐工具时应同时说明该差异。在用户项目中固定版本前，先核对 lockfile 与项目策略。

详见 [SKILL.md](SKILL.md)。
