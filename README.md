# niuge-skills

AI Agent Skills 集合，以**企业级前端代码生成**为核心能力，同时补充长会话协作、上下文治理与工程辅助类 skill。基于 SKILL.md 开放标准，兼容 Claude Code、Codex CLI、Cursor、ChatGPT 等 AI 编码工具。

## Skills 列表

### 核心 Skill

| Skill | 说明 | 入口 |
|-------|------|------|
| [fe-codegen-workbench](./skills/fe-codegen-workbench/) | 前端代码生成统一工作台，覆盖环境检测→需求分析→模板匹配→页面生成→代码审查完整闭环 | [SKILL.md](./skills/fe-codegen-workbench/SKILL.md) |

支持 React（Ant Design Pro）、Vue 3（Element Plus）、Vue 2（Element UI）三大技术栈，内置 16 种组件模板。

### 工作流 Skills

| Skill | 说明 | 入口 |
|-------|------|------|
| [context-compression](./skills/context-compression/) | 长对话/长实现线程的上下文压缩与 continuation brief 生成，适合切换任务、交接、恢复工作前使用 | [SKILL.md](./skills/context-compression/SKILL.md) |

### 集成 Skills

| Skill | 说明 | 来源 |
|-------|------|------|
| [code-review-expert](./skills/code-review-expert/) | 结构化代码审查（P0-P3 分级） | 社区 |
| [frontend-design](./skills/frontend-design/) | 前端设计与视觉增强 | Anthropic |
| [webapp-testing](./skills/webapp-testing/) | Playwright 自动化测试 | Anthropic |
| [find-skills](./skills/find-skills/) | 技能发现与推荐 | 社区 |

## 安装方式

### 方式一：npx skills CLI（推荐）

```bash
# 安装核心工作台
npx skills add xiaoniuge36/niuge-skills --skill fe-codegen-workbench

# 安装上下文压缩
npx skills add xiaoniuge36/niuge-skills --skill context-compression

# 安装代码审查
npx skills add xiaoniuge36/niuge-skills --skill code-review-expert
```

### 方式二：本地同步脚本

适用于本地开发场景，将 skill 同步到目标项目：

```bash
# 同步到 Cursor
node scripts/install-local-skills.mjs --tool cursor --skill fe-codegen-workbench

# 同步到 Codex CLI
node scripts/install-local-skills.mjs --tool codex --skill fe-codegen-workbench

# 同步到 Claude Code
node scripts/install-local-skills.mjs --tool claude --skill fe-codegen-workbench

# 指定目标项目路径
node scripts/install-local-skills.mjs --tool cursor --skill fe-codegen-workbench --target D:\your-project

# 查看可用 skills
node scripts/install-local-skills.mjs --list
```

### 方式三：手动复制

```bash
cp -r skills/fe-codegen-workbench /path/to/your-project/.cursor/skills/
```

## context-compression 适用场景

`context-compression` 是一个偏工作流治理的本地 skill，用于在上下文逐渐变长时，把当前状态压缩成可继续执行的短摘要，减少重复复述和信息丢失。

适合这些场景：

- 长对话或长实现线程中，已经积累了较多决策、日志和改动
- 多文件修改后准备切换子任务
- 会话即将结束，需要交接给下一个代理或稍后恢复
- token 预算紧张，希望保留高价值上下文

核心输出会优先保留：

- 当前目标与成功标准
- 已做决策、约束和非目标
- 关键文件、命令、验证状态与 blocker
- 单个最优下一步动作

详见 [README.md](./skills/context-compression/README.md) 和 [SKILL.md](./skills/context-compression/SKILL.md)。

## fe-codegen-workbench 工作流程

```
用户输入需求（文字 / 原型图 / 接口文件）
    ↓
[1] 环境检测 → 有项目：检测技术栈 / 无项目：默认创建 React
    ↓
[2] 需求分析 → 结构化需求清单（页面类型、字段、业务规则）
    ↓
[3] 模板匹配 → 从 component-registry.json 匹配最佳模板
    ↓
[4] 页面生成 → types → services → hooks → components → page → styles
    ↓
[5] 代码审查 → code-review-expert 审查 / 自检报告
```

### 核心规则

- **hooks/composables 优先**：先生成数据处理层，再生成 UI 层
- **全局类型禁止 import**：`global.d.ts` 中的类型直接使用
- **禁止 mock**：不生成假数据，不用 localStorage/内存模拟接口
- **ProTable request 模式**：必须使用 request，禁止 dataSource + 手动 loading
- **企业级视觉标准**：使用 Ant Design 默认主题，禁止自定义渐变/阴影/装饰
- **严禁过度设计**：只生成用户要求的功能，不自行添加统计卡片等额外模块

### 触发示例

```
@fe-codegen-workbench 做一个员工管理列表页
@fe-codegen-workbench 生成用户编辑表单
@fe-codegen-workbench 在空目录创建项目并生成商品列表页
```

详见 [使用指南](./skills/fe-codegen-workbench/使用指南.md) 和 [SKILL.md](./skills/fe-codegen-workbench/SKILL.md)。

## 同步上游 Skills

将外部仓库的成熟 skills 拉回当前仓库：

```bash
node scripts/sync-upstream-skills.mjs
node scripts/sync-upstream-skills.mjs --skill frontend-design
```

## 目录结构

```
niuge-skills/
├── skills/
│   ├── fe-codegen-workbench/       # 核心：前端代码生成工作台
│   │   ├── SKILL.md                # 主调度入口
│   │   ├── README.md               # Skill 说明
│   │   ├── 使用指南.md              # 提示词模板与示例
│   │   ├── agents/                 # Agent 接口配置
│   │   └── references/             # 子步骤文档 + 组件模板
│   ├── context-compression/        # 工作流：上下文压缩与继续执行摘要
│   ├── code-review-expert/         # 代码审查
│   ├── frontend-design/            # 前端设计
│   ├── webapp-testing/             # 自动化测试
│   └── find-skills/                # 技能发现
├── scripts/
│   ├── install-local-skills.mjs    # 本地同步脚本
│   └── sync-upstream-skills.mjs    # 上游同步脚本
└── README.md                       # 本文件
```
