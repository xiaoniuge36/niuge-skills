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
| 3 | 匹配模板与组件 | [references/component-registry.json](references/component-registry.json)、[references/template-matching.md](references/template-matching.md) |
| 4 | 生成文件（含 Service 层） | [references/page-generation.md](references/page-generation.md)、[references/code-standards.md](references/code-standards.md) |
| 4+ | 技术栈知识库 | React → [references/react-antdpro-knowledge.md](references/react-antdpro-knowledge.md)；Vue → [references/vue-knowledge.md](references/vue-knowledge.md) |
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
2. **步骤 2 必须产出结构化需求清单**：含页面列表、字段、模板倾向。Agent 不得凭空猜测需求。需求模糊时触发 brainstorming 探索。**严格按用户需求生成，不得自行添加统计卡片、装饰标签、描述文案等用户未要求的内容。**
3. **步骤 3 必须匹配到具体模板 ID**：按当前技术栈过滤（`react-*` / `vue2-*` / `vue3-*`），从 `component-registry.json` 中读取注册表匹配。允许产出“1 个主模板 + 0-N 个可组合模板”的结果，但主模板必须唯一。**匹配成功后必须加载 `references/components/<template-id>/sample.md` 与同目录示例代码。** 不得跳过模板匹配直接生成。
   - **模板未命中时必须暂停确认**：当注册表中无匹配模板时，**禁止跳过步骤 3 自由发挥**，必须暂停并告知用户"当前需求无对应内置模板"，同时列出最接近的 2-3 个模板供参考，由用户决定：
     - a) 选择最近模板作为骨架进行适配
     - b) 进入自由生成模式（仍严格遵守 `code-standards.md` 全部约束，禁止过度设计）
     - c) 用户自行处理，Agent 不再生成
   - 未经用户确认不得进入步骤 4。
4. **步骤 4 必须加载技术栈知识库并按模板拼装**：React 项目加载 `react-antdpro-knowledge.md`，Vue 项目加载 `vue-knowledge.md`。完整约束以 `code-standards.md` 为唯一真源；步骤 4 文档只补充生成顺序、模板拼装和技术栈特有规则。生成页面时必须优先复用模板代码骨架和默认样式，不得随意换皮。
5. **步骤 5 必须执行审查**：优先使用 `code-review-expert` skill 进行深度审查（如已安装）；否则按 [references/self-review-checklist.md](references/self-review-checklist.md) 逐项验证并输出报告。

### 严禁过度设计（最高优先级）

此规则贯穿所有步骤，等同于 P0 错误：

- **禁止添加用户未要求的功能模块**：统计卡片、数据概览、快捷入口、仪表盘等
- **禁止添加装饰性元素**：hero section、英文 badge（如"IDENTITY CONTROL"）、描述段落
- **禁止自定义视觉风格**：渐变背景、毛玻璃、serif 字体、大圆角、自定义配色
- **禁止脱离模板默认样式自行重做页面外观**
- **必须使用 Ant Design 默认主题和标准布局**
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
| 视觉风格 | 是否使用 Ant Design 默认样式（无渐变、无自定义字体） |
| 模板拼装 | 是否基于命中的模板示例目录拼装，而不是自由重写页面结构/样式 |
| Service 层 | 是否生成 API 调用骨架（或正确引用已有接口） |
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
| `ui-ux-pro-max` | 可选增强 | 已安装且用户明确追求高保真 UI/UX 升级时补充参考 |
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
| 原型图 + 描述 | 步骤 2 加强，默认先按模板拼装分析；只有明确追求视觉升级时才额外加载 `frontend-design` |
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

## 注意事项

- 每步完成后向用户简报进度。
- 技术栈、模板、交互形式等决策点需用户确认时暂停询问。
- 规范以本 workbench 的 code-standards 为准。
- 新项目默认 React，但必须询问用户确认。
- 生成代码时必须加载对应技术栈的知识库文件。
- 标准企业级页面默认优先复用现有设计系统和模板示例代码；只有在视觉风格和体验质量是显性目标时，才调度设计类 Skills。
- 对同一需求重复生成时，应优先得到**同模板、同结构、同风格**的稳定结果；差异应主要体现在字段和业务逻辑，不应体现在页面换皮。
