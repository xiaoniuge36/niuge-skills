# 我把反复教 AI 的那些规矩，整理成了一套 Skill

> 这个仓库叫 `niuge-skills`。名字只是仓库名，真正想分享的是里面这套 AI Agent Skill 合集：它把我平时反复提醒 AI 的工程规矩、工作流和模板沉淀下来，让 Agent 做事时少一点自由发挥，多一点稳定、克制、可复用。

- GitHub 仓库：[xiaoniuge36/niuge-skills](https://github.com/xiaoniuge36/niuge-skills)
- skills.sh 收录页：<https://www.skills.sh/xiaoniuge36/niuge-skills>

---

## 先说说我为什么要折腾这件事

用 AI Agent 做过项目的同学，应该都遇到过这些场景：

- 你让它做一个**订单列表**，它给你整出一个带渐变背景、毛玻璃、英文 badge 的“高级仪表盘”，还顺手加了三张你根本没要的统计卡片。
- 你让它对接接口，它转头写了一堆 `localStorage` 假数据，静态看着挺完整，一联调全是坑。
- 同一个需求，今天生成一个样，明天又变成另一个样，**结构、风格和流程都很难复用**。
- 聊到一半上下文变长了，它把前面定好的约束忘得一干二净，你又得从头复述一遍。
- 代码生成完以后，还要你自己补审查、补测试、补文档，甚至重新画架构图。

说白了，大模型不是不聪明，而是太容易“自由发挥”。但真正落到工程项目里，我们需要的是另一套东西：**稳定、克制、可复用、可交接、可验证**。

每次手动提醒它“不要 mock”“不要加没要的卡片”“按项目规范拆 hooks”“上下文快爆了先压缩”“生成完记得审查和测试”，实在太累。所以我干脆把这些规矩、流程、模板都沉淀成了 **Skill**——一种基于 `SKILL.md` 开放标准的能力包，Claude Code、Codex CLI、Cursor、ChatGPT 这类工具都能直接使用。

这就是这个仓库的由来。一行命令就能装：

```bash
npx skills add xiaoniuge36/niuge-skills
```

这个仓库目前已经收了一批 Skill，后面也会继续增加。前端代码生成是里面最重的核心能力，但它并不只服务前端：还覆盖上下文治理、代码审查、自动化测试、架构图生成和 Skill 发现。下面我挑重点聊。

---

## 最重的核心：fe-codegen-workbench（前端代码生成工作台）

如果你只想先装一个，装它就够了。

```bash
npx skills add xiaoniuge36/niuge-skills --skill fe-codegen-workbench
```

它不是那种“帮你写个组件”的小工具，而是把**从环境检测到代码审查的完整闭环**都包进去了。你扔一句需求进去，它会按一条固定流水线往下跑：

```text
用户需求
   ↓
[1] 环境检测 —— 自动识别 React / Vue 3 / Vue 2，加载对应知识库
   ↓
[2] 需求解析 —— 拆出页面类型、字段、业务规则、风格信号
   ↓
[2.5] 设计推荐 —— 主动给出 3 个设计风格 + “不使用品牌”选项
   ↓
[3] 模板匹配 —— 从内置 16 种模板里挑最合适的
   ↓
[4] 代码生成 —— types → services → hooks → 组件 → 页面 → 样式
   ↓
[5] 自审 —— P0~P3 分级体检，P0/P1 自动修
   ↓
交付
```

它支持三大常见技术栈：**React（Ant Design Pro）、Vue 3（Element Plus）、Vue 2（Element UI）**。内置 16 种组件模板，B 端中后台、C 端、H5 的常见页面都能覆盖。

### 最值钱的是几条“不许这样”的硬规矩

这个工作台真正有用的地方，不是“更会生成”，而是它会明确告诉 AI：有些东西不能做。

- **禁止 mock**：不准生成假数据，不准用 `localStorage` 或内存数组模拟接口。Service 层必须是真实 API 调用骨架。
- **严禁过度设计**：你没要的统计卡片、hero 区块、营销文案、装饰 badge，一个都不许加。**只做用户要求的功能**。
- **模板拼装优先**：命中模板后走“拼装模式”，优先复用模板的目录结构、组件拆分和 hooks 组织方式。同一需求重复生成，结果应该是**同模板、同结构、同风格**。
- **hooks/composables 优先**：先生成数据处理层，再生成 UI 层，避免把业务逻辑全塞进组件里。
- **ProTable 必须用 request 模式**：禁止 `dataSource` + 手动 loading 那套老写法。
- **视觉只走主题层**：业务代码 `.tsx` / `.vue` 里不硬编码色值和字体，视觉变化统一放到隔离的主题 token 文件里。

一句话：**它把大模型的“创造欲”关进了企业级前端规范的轨道里**。

### 还有两个我很喜欢的小设计

**1. 新建管理后台时，直接走脚手架。**

你说“创建一个后台管理项目”，它不会从零裸搭，而是默认走 [`create-admin-platform`](https://www.npmjs.com/package/create-admin-platform) CLI：React 19 + AntD 6 + React Router 7 + Vite，登录、权限、主题等基础能力都已经准备好。

```bash
pnpm dlx create-admin-platform@latest my-admin
```

**2. 想要设计感时，先让你选风格。**

第 2.5 步会基于你的需求主动推荐 3 个设计系统，比如 Linear、Notion、Stripe，再加一个永远存在的「不使用品牌」选项。

选了品牌，它会拉取对应的 `DESIGN.md`，生成独立主题文件；不想要品牌感，就选默认 AntD。重点是：**给你选择权，但不替你擅自美化**。

触发方式也很口语：

```text
@fe-codegen-workbench 做一个员工管理列表页，要筛选和导出
@fe-codegen-workbench 用 linear 风格做一个数据仪表盘
@fe-codegen-workbench 创建管理后台项目 my-admin，不要 mock
```

---

## 另外两个自研 Skill：工作流和工程规范

### context-compression：长对话不再“失忆”

这个是我自己最常用的工作流辅助 Skill，和前端没有强绑定，任何长对话、长任务、多文件修改都能用。

跟 AI 一起做稍微复杂一点的任务时，上下文很快就会膨胀：一堆决策、一堆日志、改了七八个文件。然后某一刻它开始“失忆”，把前面定好的约束忘了，你只能一遍遍补充背景。

`context-compression` 做的事就是：在上下文变长时，**主动**把当前状态压成一份可继续执行的简报。它优先保留这些高价值信息：

- 当前目标和成功标准
- 已经做过的关键决策，以及为什么这么做
- 约束、假设和“非目标”
- 关键文件、命令、验证状态、blocker
- **唯一一个最优下一步**

而那些重复解释、低信号日志、能从代码里恢复的样板内容，会被砍掉。它特别适合切换子任务、交接给下一个 agent，或者 token 预算紧张的时候用。

```bash
npx skills add xiaoniuge36/niuge-skills --skill context-compression
```

### frontend-code-spec：把阿里前端规约变成 Agent 能跑的流程

光会生成还不够，代码得合规。

这个 Skill 基于阿里巴巴的 [`alibaba/f2e-spec`](https://github.com/alibaba/f2e-spec)，把那套前端编码规约整理成了**可执行的 Agent 工作流**，覆盖 JS/TS/React/Node/CSS/HTML，也覆盖 Git commit、Changelog、Markdown、HTTP JSON API 这些工程规约。

它的思路很朴素：**先上自动化工具，再用规则兜底**。比如接入 `f2elint`、`eslint-config-ali`、`stylelint-config-ali` 这一套，然后按 checklist 做 P0~P3 分级审查。

它也会尊重项目自己的规则：如果当前项目已经有更严格的本地规范，它会保留本地规则，而不是拿 f2e-spec 默认值去覆盖你刻意定好的约束。

它和 `fe-codegen-workbench` 正好配套：前者负责生成，后者负责生成后的**规约合规体检**。

```text
@frontend-code-spec 给这个 React 项目接入前端代码规范
@frontend-code-spec 检查当前改动是否符合 f2e-spec
```

```bash
npx skills add xiaoniuge36/niuge-skills --skill frontend-code-spec
```

---

## 顺手集成的几个开源 Skill

除了自研的核心，我也把社区里几个成熟好用的 Skill 放进了这个仓库。它们不只是前端生成的配套能力，更像一套 Agent 开发时常用的工具箱：审查、设计、测试、出图、找技能。

| Skill | 干什么 | 来源 |
|-------|--------|------|
| **code-review-expert** | 结构化代码审查，P0~P3 分级，也是工作台第 5 步的审查引擎 | 社区 |
| **frontend-design** | 前端设计与视觉增强，有设计稿或品牌化需求时使用 | Anthropic |
| **webapp-testing** | Playwright 自动化 E2E 测试，生成完顺手验一遍 | Anthropic |
| **architecture-diagram-generator** | 系统架构图、网络拓扑图、技术关系图生成 | Cocoon AI |
| **find-skills** | 技能发现与推荐，不知道该用哪个 Skill 时问它 | 社区 |

把这些和自研核心搭在一起，基本就是一条完整的 Agent 工作链路：

```text
需求 → 生成 → 规范 → 审查 → 测试 → 出图 → 交接
```

---

## 怎么装、怎么用

**方式一：npx skills CLI（推荐）**

```bash
# 全装
npx skills add xiaoniuge36/niuge-skills

# 只装核心工作台
npx skills add xiaoniuge36/niuge-skills --skill fe-codegen-workbench
```

**方式二：本地同步脚本**

适合把某个 Skill 同步到 Cursor / Codex CLI / Claude Code 里：

```bash
node scripts/install-local-skills.mjs --tool cursor --skill fe-codegen-workbench
node scripts/install-local-skills.mjs --tool codex --skill fe-codegen-workbench
node scripts/install-local-skills.mjs --tool claude --skill fe-codegen-workbench
```

**方式三：手动复制**

```bash
cp -r skills/fe-codegen-workbench /path/to/your-project/.cursor/skills/
```

装好之后，在支持 `SKILL.md` 标准的工具里直接 `@` 它就行。它的重点是跨工具复用，不需要为每个工具重新写一套提示词。

项目地址也放这里，方便直接打开：

- GitHub：[xiaoniuge36/niuge-skills](https://github.com/xiaoniuge36/niuge-skills)
- skills.sh：<https://www.skills.sh/xiaoniuge36/niuge-skills>

---

## 最后

仓库名叫 `niuge-skills`，但它不是我想硬造的品牌。更准确地说，它是一个把“我每次都要重复教 AI 的工程规矩”打包起来的工作流仓库。

核心理念就一句话：

> **让 AI 在清晰的工程规范和工作流里干活：稳定、克制、可复用、可验证，而不是放飞自我。**

如果你也受够了 AI Agent 做事时的“自由发挥”，欢迎来试试：

- GitHub：[xiaoniuge36/niuge-skills](https://github.com/xiaoniuge36/niuge-skills)
- skills.sh：<https://www.skills.sh/xiaoniuge36/niuge-skills>

觉得有用的话，给个 star 就是对我最大的支持。有想法、有 bug，或者想要新的 Skill，也欢迎来仓库提 issue，一起把这套工具磨得更顺手。

下次见。
