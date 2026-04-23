---
name: fe-codegen-workbench
description: 前端代码生成统一工作台，用于前端页面、组件与项目脚手架的环境检测、模板匹配、代码生成和审查。
---

# 前端代码生成工作台（统一调度）

一个 **Skill** 覆盖完整闭环；子步骤说明拆在 `references/`，由本文件规定**顺序**并**强制执行**。

适用于所有前端场景：B 端管理系统、C 端应用、H5 移动端、中后台系统等。覆盖 React、Vue 3、Vue 2 三大技术栈。

`agents/agent.yaml` 与 `agents/openai.yaml` 保留双入口，仅用于兼容不同 Agent 接口；两者应保持同一默认提示。

## 跨工具兼容性

本工作台基于 SKILL.md 开放标准，兼容 Claude Code、Codex CLI、Cursor、ChatGPT 等所有支持该标准的工具。无需针对特定工具修改，任何 Agent 均可按本文件调度执行。

## 核心流程（强制顺序执行）

> **⚠️ 以下步骤为强制调度链路，Agent 必须按顺序执行，不可跳步或乱序。**

### 总览鸟瞰图

```
┌─────────────────────────────────────────────────────────────┐
│   用户需求                                                  │
│   例："做一个订单管理"  /  "做一个Linear风格的数据仪表盘"   │
└──────────────────────────┬──────────────────────────────────┘
                           │
      ┌────────────────────▼────────────────────┐
      │  [1] 环境检测                           │
      │   扫描 package.json/框架/组件库/目录    │
      │   输出: runtimeContext (React/Vue3/..)  │
      └────────────────────┬────────────────────┘
                           │
      ┌────────────────────▼────────────────────┐
      │  [2] 需求解析                           │
      │   提取: 业务意图 + 页面类型 + 字段      │
      │   额外提取: designSignal（风格信号）    │
      │      - 显式品牌 / 本地路径 / 风格词     │
      │      - 显式跳过 / 无信号                │
      └────────────────────┬────────────────────┘
                           │
           ┌───────────────▼────────────────────┐
           │   是否新建任务 + 未显式跳过?       │
           └───────────────┬────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
           是（默认进入）            否（增量修改/显式跳过）
              │                         │
              ▼                         ▼
  ┌─────────────────────┐      ┌──────────────────┐
  │  [2.5] 设计推荐     │      │  静默跳过        │
  │  🌐 远程优先拉 index │      │  selectedBrandId │
  │  🎯 基于需求+风格    │      │    = null        │
  │     主动推荐 3 个    │      └────────┬─────────┘
  │  📋 3+1 选项        │               │
  │     ├─ 推荐 1        │               │
  │     ├─ 推荐 2        │               │
  │     ├─ 推荐 3        │               │
  │     └─ 不使用品牌   │               │
  │  ⚡ 显式品牌时跳过   │               │
  │     推荐直接用       │               │
  └──────────┬──────────┘               │
             │                          │
        用户选择                         │
             │                          │
             ▼                          │
  ┌─────────────────────┐               │
  │  selectedBrandId ?  │               │
  └──────┬──────────────┘               │
         │                              │
    选了品牌               选"不使用"    │
         │                      │       │
         ▼                      ▼       ▼
  ┌─────────────────────┐     ┌─────────────────┐
  │  [3.5] DESIGN.md    │     │                 │
  │  🌐 远程优先拉 md   │     │                 │
  │  📖 解析 color/font │     │                 │
  │     等最小字段       │     │                 │
  └──────────┬──────────┘     │                 │
             │                │                 │
             ▼                ▼                 ▼
  ┌─────────────────────────────────────────────────┐
  │  [3] 模板匹配（不变）                           │
  │   根据 runtimeContext + 页面类型选模板          │
  └──────────────────┬──────────────────────────────┘
                     │
  ┌──────────────────▼──────────────────────────────┐
  │  [4] 代码生成                                   │
  │    业务代码：按模板 + hooks/api 生成            │
  │    若 selectedBrandId 非空：                    │
  │      └─ 额外生成主题层文件（仅一次）：          │
  │         React → src/theme/token.ts              │
  │         Vue3  → src/theme/vars.scss             │
  │         Tailwind → tailwind.config.ts           │
  │      └─ 复制 DESIGN.md 到项目根（上下文锚点）   │
  │      └─ 注入到 ConfigProvider / main.ts         │
  └──────────────────┬──────────────────────────────┘
                     │
  ┌──────────────────▼──────────────────────────────┐
  │  [5] 自审                                       │
  │   原 P0/P1/P2 全套检查                          │
  │   若 selectedBrandId 非空：追加主题合规审查     │
  │     ├─ 主题文件是否生成                         │
  │     ├─ 是否挂入 ConfigProvider/main.ts          │
  │     ├─ 项目根是否有 DESIGN.md                   │
  │     └─ 业务代码是否有硬编码色值                 │
  └──────────────────┬──────────────────────────────┘
                     │
                     ▼
              ✅ 交付给用户
```

### 四条主要使用路径

**🟢 路径 A：默认交互推荐（最常见，新建任务默认走此路径）**

```
用户: "帮我做一个订单管理列表，要有筛选和导出"
  ├─ [1]   检测到 React 19 + antd-pro
  ├─ [2]   识别 ListPage；designSignal 无风格词
  ├─ [2.5] 🌐 远程抓 index.json
  │        🎯 Agent 基于 "B端列表 + 数据密集" 主动推荐 3 个最合适品牌
  │        📋 ask_question：
  │           1. Linear (minimalist product design)
  │           2. Notion (productivity-first aesthetic)
  │           3. Stripe (confident developer-first)
  │           4. ⬜ 不使用品牌（使用默认 Ant Design 样式）
  ├─ 用户选第 4 项 → selectedBrandId = null → 走默认流程
  │   或选品牌 → 进入 3.5 → 生成主题层
  ├─ [3]   选 ProTable 模板
  ├─ [4]   生成代码
  └─ [5]   自审 ✅
```
→ **默认有交互**，给用户一次选择的机会；用户快速选"不使用"即可退出。

**🔵 路径 B：显式指定品牌（快速通道）**

```
用户: "用 Linear 风格做一个数据仪表盘"
  ├─ [1]   检测到 React 19 + antd-pro
  ├─ [2]   designSignal = { explicitBrand: "linear" }
  ├─ [2.5] 🌐 远程抓 index.json → ⚡ 跳过推荐对话，直接用 linear
  ├─ [3.5] 🌐 远程抓 linear DESIGN.md → 解析 token
  ├─ [3]   选 Dashboard 模板
  ├─ [4]   业务代码（100% 模板）+ src/theme/token.ts + 根 DESIGN.md
  └─ [5]   常规自审 + 主题合规审查 ✅
```

**🟡 路径 C：用户明确跳过（一句话关闭）**

```
用户: "做个列表页，按默认风格就行" / "B 端标准，不用设计系统"
  ├─ [1]   React + antd
  ├─ [2]   designSignal = { forceDefault: true }
  ├─ [2.5] ❌ 跳过（用户明确说不用）
  ├─ [3]   选 ProTable 模板
  ├─ [4]   生成代码
  └─ [5]   自审 ✅
```
→ 和原工作流 100% 等同。

**🟠 路径 D：增量修改任务（自动跳过）**

```
用户: "在订单列表页加一列'配送状态'"
  ├─ 进入增量修改模式
  ├─ [2.5] ❌ 默认跳过（非新建任务）
  └─ 直接定位文件并修改
```
→ 除非用户明说 _"换成 notion 风格"_，否则修改任务不触发推荐。

### 关键特性一句话

> **原 5 步主干不变；新建页面任务默认走 2.5 推荐给用户一次"选或不选品牌"的交互机会，用户选"不使用品牌"即走默认；显式品牌走快速通道跳过推荐；显式说"默认/B端"或增量修改任务自动跳过 2.5。业务代码 100% 走模板不受任何设计决策影响，视觉变化只通过生成一个隔离的主题层文件实现。**

### 线性调度链路（简版）

```
用户输入需求
    ↓
[1] 环境检测 → 项目是否存在？技术栈？全局类型？
    ↓ 无项目 → 默认创建 React 项目（见 environment-setup）
    ↓ 有项目 → 检测技术栈，加载对应知识库
[2] 需求分析 → 文本 + 原型图（如有）→ 结构化需求 + 设计风格信号
    ↓ 需求模糊时可触发 brainstorming
[2.5] 设计推荐（新建任务默认启用）→ 🌐 远程优先抓 index.json；主动推荐 3+1
    ↓ 显式品牌/路径 → 跳过推荐对话直接用
    ↓ 显式跳过或增量修改任务 → 跳过 2.5
    ↓ 用户选择默认 → selectedBrandId=null，跳过 3.5 / 4 主题层 / 5 主题审查
    ↓ 用户选择品牌 → 记录 selectedBrandId
[3] 组件/模板匹配 → 注册表匹配模板（按技术栈过滤）
    ↓
[3.5] DESIGN.md 加载（仅当 selectedBrandId 非空）→ 🌐 远程优先抓 detailUrl
    ↓
[4] 页面生成 → 加载技术栈知识库 → hooks 优先 → 组件 → 样式
    ↓ (selectedBrandId 非空时追加) 生成主题文件 + 项目根 DESIGN.md
[5] 代码审查 → code-review-expert 深度审查 / 自检清单
    ↓ (selectedBrandId 非空时追加) 主题遵从度审查
```

## 模板拼装原则（低代码优先）

命中模板后，默认进入**模板拼装模式**，而不是自由生成模式。

1. **模板真源有且只有一类**：`references/components/<template-id>/` 模板目录。
2. **每个模板目录必须至少包含**：
   - `sample.md`：模板说明、提示词和关键约束
   - 示例代码文件：`index.example.*`、`hooks/`、`components/`、`types.example.*` 等
3. **步骤 3 一旦匹配到模板 ID，必须先读取模板目录中的 `sample.md`，再按目录内示例代码拼装生成结果**；不得跳过目录说明直接自由发挥。
4. **生成代码时必须以模板目录中的代码骨架为主进行拼装**，优先复用其目录结构、组件拆分、hooks/composables 组织方式和默认样式层级。
5. **允许变化的范围仅限于**：字段、接口、业务文案、校验规则、权限控制、状态映射、与项目现有公共组件/路由/请求层的对接。
6. **默认不允许改变模板既有视觉风格**：不得自行增加 hero、运营标题卡、营销文案、渐变背景、毛玻璃、品牌色重绘、大圆角重做等。
7. **标准 B 端 CRUD / 表单 / 详情页，即使用户提供原型图，也优先按模板拼装**；原型图默认只用于校正字段、布局顺序、显隐逻辑和交互，不等于允许重新设计页面风格。
8. **只有在以下情况才允许脱离默认模板风格**：
   - 用户明确要求“重做视觉风格 / 高保真还原设计稿 / 品牌化页面”
   - 当前模板库没有覆盖对应页面结构
   - 用户提供的设计系统就是当前项目的强约束真源
9. **若模板说明和示例代码不完整或互相冲突，必须先报告模板缺口，再继续生成**；禁止用自由发挥掩盖模板缺失。

## 步骤与参考文档

| 步骤 | 动作 | 必须阅读 |
|------|------|----------|
| 1 | 检测/初始化项目 | [references/environment-setup.md](references/environment-setup.md) |
| 2 | 解析需求与模板类型 | [references/requirements-analysis.md](references/requirements-analysis.md) |
| 2.5 | 设计推荐（可选链路） | [references/design-md-integration.md](references/design-md-integration.md)、[references/design-systems/index.json](references/design-systems/index.json) |
| 3 | 匹配模板与组件 | [references/component-registry.json](references/component-registry.json)、[references/template-matching.md](references/template-matching.md) |
| 3.5 | DESIGN.md 加载（仅当用户选定品牌） | [references/design-md-integration.md](references/design-md-integration.md) |
| 4 | 生成文件（含 Service 层） | [references/page-generation.md](references/page-generation.md)、[references/code-standards.md](references/code-standards.md) |
| 4+ | 技术栈知识库 | React → [references/react-antdpro-knowledge.md](references/react-antdpro-knowledge.md)；Vue → [references/vue-knowledge.md](references/vue-knowledge.md) |
| 4++ | 主题层生成（仅当用户选定品牌） | [references/design-md-integration.md](references/design-md-integration.md) |
| 5 | 审查 | `code-review-expert` skill（强制集成）；或按 [references/self-review-checklist.md](references/self-review-checklist.md) |
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
| 所有 | `code-standards.md` | `frontend-design`（有设计稿/品牌化页面时）；`ui-ux-pro-max`（已安装且明确追求高保真 UX 时） |

### 设计类 Skills 调度策略

| 场景 | 调度策略 |
|------|---------|
| 标准 B 端 CRUD / 表单 / 列表页 | **默认不加载** 设计类 Skills，优先遵循现有设计系统、模板约束和 `code-standards.md` |
| 用户提供原型图、设计稿，但需求仍是标准 B 端页面 | **仍以模板拼装为主**，原型图只用于校正结构、字段和交互；**默认不加载** `frontend-design` |
| 用户明确要求“做得更高级”“重做体验”“高保真还原 UI/UX”“品牌化页面” | 可在模板骨架之外加载 `frontend-design`；若本地已安装可信来源的 `ui-ux-pro-max`，可作为补充参考 |
| 已有成熟设计系统/组件库约束 | 设计类 Skills 只能做增强参考，**不能覆盖** 业务组件约束、字段规范和现有设计系统 |

**结论**：`frontend-design` 只适合做显式视觉目标下的条件化增强；标准 B 端页面默认进入**模板拼装模式**，不建议把设计类 Skills 升级为默认链路。

## 调度规则（强制约束，不可跳步）

1. **步骤 1 必须先完成**：未检测环境不得生成业务代码；无项目须先确认再创建。**新项目默认 React + TypeScript + Ant Design Pro**。
2. **步骤 2 必须产出结构化需求清单**：含页面列表、字段、模板倾向、**设计风格信号**。Agent 不得凭空猜测需求。需求模糊时触发 brainstorming 探索。**严格按用户需求生成，不得自行添加统计卡片、装饰标签、描述文案等用户未要求的内容。** 设计风格信号抽取规则见 [references/requirements-analysis.md](references/requirements-analysis.md)。
3. **步骤 2.5 设计推荐（默认启用，交互式确认）**：位于需求分析后、模板匹配前。完整规则见 [references/design-md-integration.md](references/design-md-integration.md)。
   - **默认总是进入推荐节点**（新建页面 / 新建项目 / 新增页面任务），给用户一个主动选择设计风格的交互机会。
   - **加载方式**：
     - **远程优先**：首选从 `https://getdesign.md/` 实时抓取最新品牌列表并覆盖 `references/design-systems/index.json`（保证拿到最新设计系统）。
     - **本地降级**：远程抓取失败时回退读本地 `index.json`，并向用户输出 warning 提示使用本地缓存。
     - **远程与本地都失败**：静默跳过本节点，直接进入步骤 3（视同用户选了默认）。
   - **推荐产出**：Agent 基于步骤 2 抽取的风格信号（品牌名 / 本地路径 / 风格词 / 无信号 + 需求类型）从 `brands[]` 选出最匹配的 3 个品牌，加上 1 个"**不使用品牌（使用默认 Ant Design 样式）**"选项（**永远作为第 4 选项存在**），通过 `ask_question` 交由用户选择。
   - **强触发直跳**：
     - 用户显式指定品牌（_"用 linear 风格"_）→ **跳过推荐对话**，直接把该品牌作为 `selectedBrandId` 进入步骤 3.5。
     - 用户提供本地 DESIGN.md 路径 → **跳过推荐对话**，直接使用本地路径进入步骤 3.5。
   - **显式跳过**：
     - 用户明确说 _"B 端标准 / 按默认 / 按组件库风格 / 不用设计系统"_ → **跳过推荐对话**，直接进入步骤 3。
     - 增量修改任务（修改已有页面、调整字段等）→ **默认跳过推荐**，除非用户明确说换主题。
   - **用户选择处理**：
     - 用户选品牌 → `selectedBrandId = <id>`，进入步骤 3。
     - 用户选 "不使用品牌" → `selectedBrandId = null`，**跳过** 3.5 / 4 主题层 / 5 主题审查。
     - 用户没回应 / 选择超时 → 视同选默认（`selectedBrandId = null`）。
   - **禁止幻觉**：推荐的品牌 id **必须**来自当次加载到的 `brands[]`，不得推荐未在索引中的品牌。
   - **任何异常**（远程抓取失败、本地缓存缺失、解析错误）→ **静默降级到默认**，不阻塞主流程。
   - **任务内单次抓取**：同一生成任务内已成功抓过索引，则后续直接复用当次结果。
4. **步骤 3 必须匹配到具体模板 ID**：按当前技术栈过滤（`react-*` / `vue2-*` / `vue3-*`），从 `component-registry.json` 中读取注册表匹配。允许产出“1 个主模板 + 0-N 个可组合模板”的结果，但主模板必须唯一。**匹配成功后必须加载 `references/components/<template-id>/sample.md` 与同目录示例代码。** 不得跳过模板匹配直接生成。
   - **模板未命中时必须暂停确认**：当注册表中无匹配模板时，**禁止跳过步骤 3 自由发挥**，必须暂停并告知用户"当前需求无对应内置模板"，同时列出最接近的 2-3 个模板供参考，由用户决定：
     - a) 选择最近模板作为骨架进行适配
     - b) 进入自由生成模式（仍严格遵守 `code-standards.md` 全部约束，禁止过度设计）
     - c) 用户自行处理，Agent 不再生成
   - 未经用户确认不得进入步骤 4。
5. **步骤 3.5 DESIGN.md 加载（可选链路）**：仅当 `selectedBrandId` 非空时触发。
   - **远程优先**：首选从 `index.json` 的 `detailUrl` 实时抓取最新 DESIGN.md，并同步覆盖本地 `references/design-systems/<brandId>/DESIGN.md`。
   - **本地降级**：远程抓取失败时回退读本地缓存 DESIGN.md，并向用户输出 warning。
   - **远程与本地都失败** → **静默降级**，跳过步骤 4 主题层与步骤 5 主题审查，业务代码继续正常生成。
   - 若用户传入的是本地 `designMdPath`，则直接读本地路径，不走远程。
   - 抓取超时阈值 ≤ 10 秒；任务内单次抓取，不重复发起。
6. **步骤 4 必须加载技术栈知识库并按模板拼装**：React 项目加载 `react-antdpro-knowledge.md`，Vue 项目加载 `vue-knowledge.md`。完整约束以 `code-standards.md` 为唯一真源；步骤 4 文档只补充生成顺序、模板拼装和技术栈特有规则。生成页面时必须优先复用模板代码骨架和默认样式，不得随意换皮。
   - **主题层生成（仅当 DESIGN.md 加载成功）**：在业务代码生成完成后，**追加**生成主题文件（React → `src/theme/token.ts`；Vue3 → `src/theme/vars.scss`；Tailwind → `tailwind.config.ts` 扩展），并将 DESIGN.md 复制到项目根。**业务代码 `.tsx` / `.vue` 零硬编码色值/字体**，所有视觉通过 token 间接引用。详见 [references/design-md-integration.md](references/design-md-integration.md) 步骤 4 章节。
7. **步骤 5 必须执行审查**：优先使用 `code-review-expert` skill 进行深度审查（如已安装）；否则按 [references/self-review-checklist.md](references/self-review-checklist.md) 逐项验证并输出报告。
   - **主题遵从度审查（仅当 selectedBrandId 非空）**：追加检查主题文件是否生成、ConfigProvider 是否接入、业务代码是否硬编码色值等，详见 `design-md-integration.md` 步骤 5 章节。

### 严禁过度设计（最高优先级）

此规则贯穿所有步骤，等同于 P0 错误：

- **禁止添加用户未要求的功能模块**：统计卡片、数据概览、快捷入口、仪表盘等
- **禁止添加装饰性元素**：hero section、英文 badge（如"IDENTITY CONTROL"）、描述段落
- **禁止业务代码内自定义视觉风格**：渐变背景、毛玻璃、serif 字体、大圆角、自定义配色（视觉只能通过"主题层 token"间接生效，不得在 `.tsx` / `.vue` / 业务 `.less` 里硬编码色值/字体）
- **禁止脱离模板默认样式自行重做页面外观**
- **默认使用 Ant Design 默认主题和标准布局**；仅当用户通过步骤 2.5 选定设计系统时，视觉差异才来自主题层 token，业务代码结构与模板保持一致
- **Service 层必须使用真实 API 调用骨架**，严禁 localStorage/内存数组模拟

## 与 code-review-expert 的集成

`code-review-expert` 是本工作台步骤 5 的**强制集成** skill。

### 集成方式

1. 生成代码完成后，将生成的文件列表作为 review scope
2. 加载 `code-review-expert/SKILL.md`
3. 结合 [references/self-review-checklist.md](references/self-review-checklist.md) 进行结构化复核：
   - PASS/FAIL 条件
   - 模板拼装一致性
   - 技术栈特有约束
4. 输出 P0-P3 findings
5. 自动修复 P0/P1 问题，P2/P3 在自检报告中标注

### 前端专项审查补充

在 code-review-expert 标准审查基础上，额外检查：

| 检查项 | 说明 |
|--------|------|
| hooks 优先 | 是否先生成 hooks 再生成组件 |
| 全局类型 | 是否误 import 了 global.d.ts 中的类型 |
| 禁止 mock | 是否包含假数据（含 localStorage/内存数组模拟） |
| ProTable request | 是否使用 request 模式而非 dataSource |
| ProTable search | 是否使用内置 search 而非手动 Form |
| valueEnum | 状态/枚举列是否使用 valueEnum 渲染 |
| 过度设计 | 是否添加了用户未要求的模块（统计卡片、装饰标签等） |
| 视觉风格 | 默认使用 Ant Design 默认样式（无渐变、无自定义字体）；若 `selectedBrandId` 非空，则视觉差异只能来自主题层 token |
| 模板拼装 | 是否基于命中的模板示例目录拼装，而不是自由重写页面结构/样式 |
| Service 层 | 是否生成 API 调用骨架（或正确引用已有接口） |
| UI 还原度 | 是否与设计稿/原型图一致（如有） |
| 组件复用 | 是否可复用已有组件 |
| 主题遵从度 | `selectedBrandId` 非空时：主题文件已生成、ConfigProvider/main.ts 已接入、业务代码无硬编码色值、项目根 DESIGN.md 已复制 |

## 与其他 Skills 集成

| Skill | 集成等级 | 用途 |
|-------|---------|------|
| `code-review-expert` | 深度集成 | 步骤 5 代码审查 |
| `brainstorming` | 深度集成 | 步骤 2 需求模糊时探索 |
| `getdesign.md` 集成 | 深度集成（可选链路） | 步骤 2.5/3.5/4/5 的设计系统推荐与落地，见 [references/design-md-integration.md](references/design-md-integration.md) |
| `vercel-react-best-practices` | 知识库参考 | React 性能优化 58 条规则 |
| `vue-best-practices` | 知识库参考 | Vue 3 响应式/组件/状态管理 |
| `frontend-design` | 知识库参考 | 有设计稿时的 UI/UX 思维（不建议与 DESIGN.md 链路同时启用） |
| `ui-ux-pro-max` | 可选增强 | 已安装且用户明确追求高保真 UI/UX 升级时补充参考 |
| `webapp-testing` | 可选增强 | 生成后 E2E 测试 |
| `systematic-debugging` | 可选增强 | 生成出错时调试 |
| `verification-before-completion` | 可选增强 | 完成前最终验证 |

详见 [references/external-skills.md](references/external-skills.md)。

## 快速触发示例

| 用户输入 | 动作 |
|----------|------|
| 「做一个列表页」 / 「生成代码」 | 全流程 1–5，进入步骤 2.5 弹出 3+1 品牌推荐；用户选"不使用品牌"则走 AntD 默认，否则按选定品牌生成主题层 |
| 「做个列表页，按默认风格就行」 / 「B 端标准」 / 「不用设计系统」 | 显式跳过 2.5，直接走 AntD 默认 |
| 「创建 React 项目」 | 步骤 1（默认 React） |
| 「创建 Vue3 项目」 | 步骤 1（Vue3 模式） |
| 「有哪些组件能用」 | 步骤 3 + component-registry.json |
| 「有哪些设计风格可选」 / 「列出设计库」 | 远程优先加载 index.json 并展示 brands（带 previewColor 色块）；远程失败则用本地缓存 |
| 「刷新设计库」 / 「更新设计库」 | 强制重抓 `https://getdesign.md/` 首页 → 覆盖 `index.json` |
| 「离线模式」 / 「强制使用缓存」 | 跳过远程抓取，仅使用本地 `index.json` 和本地 DESIGN.md 缓存 |
| 「用 linear 风格做 XX」 / 「要 stripe 那种感觉」 | 强触发 2.5 → 跳过推荐对话 → 3.5 加载 DESIGN.md → 4 生成主题层 |
| 「做个 dashboard / AI 产品 / 年轻化页面」 | 弱触发 2.5 → 推荐 3 个品牌 + 默认选项 → 用户选择 |
| 「设计参考 ./my-design.md」 | 读本地 DESIGN.md，跳过 2.5 和 3.5 抓取 |
| 「换成 notion 风格」 / 「换主题」 | 进入换肤增量模式，只重写 `src/theme/*` 和项目根 DESIGN.md |
| 「回到默认」 / 「去掉主题」 | 删除 `src/theme/*` 和项目根 DESIGN.md，回落 AntD 默认 |
| 原型图 + 描述 | 步骤 2 加强，默认先按模板拼装分析；明确追求视觉升级时启用 `frontend-design` 或走 DESIGN.md 链路 |
| 「做一个 H5 上传页」 | 全流程 1–5（匹配 vue2-h5-file-upload 等模板） |

## 多页面策略

先完成 1–3，步骤 4 按依赖顺序：共享 `types` → 共享 hooks → 各页面；步骤 5 统一审查。

## 组件注册表

组件注册表采用「JSON 索引 + 模板目录」架构：

```
references/
├── component-registry.json    ← 中央索引（元数据 + 来源路径）
└── components/
    ├── react-*/               ← 模板目录（sample.md + 示例代码）
    ├── vue3-*/                ← 模板目录（sample.md + 示例代码）
    └── vue2-*/                ← 模板目录（sample.md + 示例代码）
```

支持三种来源类型：`local`（当前）、`npm`（未来）、`remote`（未来）。匹配规则、组合策略和维护说明详见 [references/template-matching.md](references/template-matching.md)。

## 增量修改模式

当用户意图是**修改已有页面**（而非新建），使用简化流程，不走完整 1-5 步：

### 触发关键词

修改、调整、增加（功能）、删除（功能）、改为、替换、重构、在 xxx 页面上

### 简化流程

```
用户输入（修改需求）
    ↓
[1] 环境检测（同标准流程，可复用上次结果）
    ↓
[2'] 定位目标文件和代码块（读取已有页面代码）
    ↓
[3'] 判断是否涉及新模板（通常不涉及）
    ↓
[4'] 按 code-standards 规范修改（仍遵守 hooks 优先等规则）
    ↓
[5'] 差异审查（仅审查变更部分）
```

### 约束

- 修改已有代码时**禁止重写整个文件**，只改动必要部分
- 新增功能仍需遵守 hooks 优先、全局类型不 import 等规则
- 如修改范围过大（如"把抽屉详情改成独立详情页"），退回标准流程

## 错误恢复策略

| 错误场景 | 恢复方式 |
|---------|---------|
| 步骤 3 匹配到错误模板 | 允许用户指定正确模板 ID，重新执行步骤 3-5 |
| 步骤 4 生成不满意 | 带用户反馈重新执行步骤 4-5，不需重走 1-3 |
| 步骤 5 发现 P0 问题 | 自动修复后重走步骤 5 审查 |
| 用户发现遗漏字段/规则 | 进入增量修改模式，补充修改 |
| 步骤 2.5 远程索引抓取失败 + 本地有缓存 | 使用本地 `index.json`，向用户输出 warning 提示"远程设计库不可达，使用本地缓存（last updated: ...）" |
| 步骤 2.5 远程索引抓取失败 + 本地无缓存 | 静默跳过本节点，进入步骤 3，提示用户联网后重试 |
| 步骤 3.5 远程 DESIGN.md 抓取失败 + 本地有缓存 | 使用本地缓存 DESIGN.md，向用户输出 warning |
| 步骤 3.5 远程 DESIGN.md 抓取失败 + 本地无缓存 | 静默降级到默认 AntD，跳过主题层与主题审查 |
| 步骤 4 主题文件生成失败 | 回退为默认 AntD；保留业务代码；提示用户换一个品牌或使用默认 |
| 用户对推荐品牌都不满意 | 允许选择"使用默认 Ant Design 样式"；或用 `刷新设计库` 强制重抓远程后重推 |
| 用户明确离线工作 | 用 `离线模式` / `强制使用缓存` 指令，跳过远程抓取全程使用本地缓存 |

## 注意事项

- 每步完成后向用户简报进度。
- 技术栈、模板、交互形式等决策点需用户确认时暂停询问。
- 规范以本 workbench 的 code-standards 为准。
- 新项目默认 React，但必须询问用户确认。
- 生成代码时必须加载对应技术栈的知识库文件。
- 标准企业级页面默认优先复用现有设计系统和模板示例代码；只有在视觉风格和体验质量是显性目标时，才调度设计类 Skills 或启用 DESIGN.md 链路。
- 对同一需求重复生成时，应优先得到**同模板、同结构、同风格**的稳定结果；差异应主要体现在字段和业务逻辑，不应体现在页面换皮。
- **DESIGN.md 链路默认在新建任务中启用**：新建页面 / 项目任务默认进入 2.5 推荐节点，主动给用户一次"选或不选品牌"的交互机会；但用户只需选第 4 项"不使用品牌"即可一键退出，等同原 AntD 默认。显式说"按默认/B端标准"、或增量修改任务则自动跳过 2.5。
- **视觉差异只能落在主题层**：一旦启用 DESIGN.md 链路，视觉差异只能通过 `src/theme/*` 主题文件的 token 生效，业务代码 `.tsx` / `.vue` 零硬编码色值/字体。
- **远程优先 + 本地降级**：DESIGN.md 链路一旦启用，索引和具体 DESIGN.md 都**优先从 getdesign.md 实时抓取**以保证拿到最新设计系统；远程失败时才回退本地缓存，缓存也缺失时静默降级到默认 AntD。任务内同一资源只抓取一次，跨任务总是重新拉取。
