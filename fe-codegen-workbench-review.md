# fe-codegen-workbench Skill Review

> 审查范围：SKILL.md、README.md、使用指南.md、agents/*.yaml、references/ 全部文件  
> 审查目标：识别可优化点，核心流程不变，组件库随时可替换

---

## 总体评价

这是一个**设计非常成熟**的 Skill，架构清晰、约束明确、文档详尽。核心流程（意图解析 → 环境检测 → 模板匹配 → 代码生成 → 代码审查）闭环完整，「模板拼装优先 + 禁止过度设计」的理念在多处反复强调，有效约束了 AI 的自由发挥。

以下按优先级列出可优化项。

---

## P0 — 影响 Agent 执行准确性

### 1. 信息重复度极高，增加 Token 消耗和误读风险

**问题**：同一条规则在多个文件中反复出现，例如：

| 规则 | 出现位置 |
|------|---------|
| "hooks 优先 / 禁止先生成组件再补 hooks" | SKILL.md、code-standards.md（×3）、page-generation.md、react-antdpro-knowledge.md、normative-source.md |
| "ProTable 必须使用 request 模式" | SKILL.md、code-standards.md（×2）、page-generation.md、react-antdpro-knowledge.md、react-standard-list-crud.md |
| "禁止 mock + localStorage 模拟" | SKILL.md（×3）、code-standards.md（×3）、page-generation.md |
| "严禁过度设计" | SKILL.md（×5）、code-standards.md（×4）、page-generation.md、react-antdpro-knowledge.md |

**影响**：
- Agent 在多文件中反复加载相同规则，浪费 Context Window 的 Token
- 规则分散后维护成本高，一处修改需联动多文件
- 不同文件中的措辞微差容易让 Agent 产生"哪个优先级高"的困惑

**建议**：

```
当前：每个 reference 文件都完整重述核心规则
优化：采用 "单一真源 + 简短引用" 模式
```

- **code-standards.md** 作为规则的**唯一完整定义处**
- 其他文件用简短引用替代重复内容：

```markdown
<!-- page-generation.md 中 -->
> 代码规范详情见 [code-standards.md](./code-standards.md)，此处仅列本步骤特有约束。
```

- 预估可减少 **30-40%** 的总文本量，释放 Token 空间给更有价值的上下文

---

### 2. 模板匹配的"未命中"兜底策略缺失

**问题**：SKILL.md 第 116 行写道「步骤 3 必须匹配到具体模板 ID」，但**没有定义匹配失败时的行为**。

当用户需求不在 16 个模板覆盖范围内时（如：Dashboard 仪表盘、Kanban 看板、树形管理页、图表分析页），Agent 无明确指令，可能：
- 强行匹配到不合适的模板
- 跳过步骤 3 直接自由发挥
- 陷入死循环报错

**建议**：在 SKILL.md 的调度规则中增加 fallback 策略：

```markdown
### 3.1 模板未命中策略

当 component-registry.json 中无匹配模板时：
1. 告知用户"当前需求无对应内置模板"
2. 列出最接近的 2-3 个模板供参考
3. 由用户决定：
   a) 选择最近模板作为骨架进行适配
   b) 进入自由生成模式（仍遵守 code-standards.md）
   c) 放弃，由用户手动开发
4. 若进入自由生成模式，仍必须遵循 code-standards.md 的全部约束
```

---

### 3. component-registry.json 中关键词匹配能力有限

**问题**：当前采用 `keywords` / `antiKeywords` 做精确列表匹配，在以下场景易失败：

- **同义词**："增删改查" vs "CRUD" vs "管理页面" — 虽然 keywords 列了一些，但覆盖不全
- **语义相近但用词不同**："做个系统管理" → 无法匹配
- **组合需求**："做个列表页，带 Excel 导入功能" → 同时命中 `standard-list-crud` 和 `import-list-modal`，但注册表设计暗示只能单选

**建议**：

1. 在 component-registry.json 中为每个模板增加 `synonyms` 字段（或在 keywords 中更系统地补全中英文同义词）
2. 增加 `composable: true` 标记可组合模板，允许 `standard-list-crud + import-list-modal` 的组合匹配
3. 在 component-library.md 中补充**组合匹配规则**（目前 code-standards.md 中有"模板组合模式"表格，但 component-registry.json 中没有对应的数据结构支持）

```json
// 建议新增字段
{
  "id": "react-standard-list-crud",
  "composableWith": ["react-standard-modal-form", "react-drawer-form", "react-import-list-modal"],
  "priority": 1
}
```

---

## P1 — 影响生成质量和用户体验

### 4. 缺少版本锁定和依赖兼容矩阵

**问题**：`react-antdpro-knowledge.md` 中写了 `"@ant-design/pro-components": "^2.x"`，但没有说明：
- Pro Components v2 的哪些 API 在 antd v5.x 的不同小版本中有 Breaking Change
- Element Plus 在 Vue 3.3 vs 3.4 中哪些 API 变了
- 版本组合冲突时怎么办

**建议**：在 `environment-setup.md` 中增加**兼容矩阵**或最低版本约束：

```markdown
### 版本兼容矩阵

| 技术栈 | 最低版本要求 | 测试通过版本 |
|--------|------------|-------------|
| react + antd | react>=18.2, antd>=5.12 | react 18.3 + antd 5.21 |
| @ant-design/pro-components | >=2.6.0 | 2.7.x |
| vue 3 + element-plus | vue>=3.3, element-plus>=2.4 | vue 3.4 + element-plus 2.8 |
```

---

### 5. 技术栈检测逻辑不够健壮

**问题**：`environment-setup.md` 的检测逻辑没覆盖以下场景：

| 场景 | 当前行为 | 风险 |
|------|---------|------|
| monorepo（pnpm workspace / lerna） | 可能读到根 package.json | 检测到错误的技术栈 |
| Umi 项目（约定式路由） | 无特殊处理 | 页面目录结构可能冲突 |
| Next.js 项目 | 无特殊处理 | 混淆 pages/ vs app/ 目录 |
| package.json 同时存在 react 和 vue | 按优先级取 react | 可能是微前端，需要追问 |

**建议**：补充 monorepo 检测（查 `pnpm-workspace.yaml` / `lerna.json`）和框架特征签名（查 `.umirc.ts` / `next.config.js`）。

---

### 6. 使用指南的提示词模板缺少"引用已有页面代码风格"的结构化支持

**问题**：使用指南第 599 行提到「参考 xxx 页面的代码风格」，但提示词模板中没有对应的结构化字段。用户可能随意写在任何位置，Agent 不一定能正确捕获。

**建议**：在标准提示词模板中增加一个可选字段：

```markdown
参考页面（可选）：
[项目中已有的页面路径，AI 会学习其代码风格和模式]
例如：src/pages/user-manage/whitelist/
```

---

### 7. 代码审查步骤 5 对 code-review-expert 的依赖是"软约束"

**问题**：SKILL.md 写「优先使用 `code-review-expert` skill 进行深度审查（如已安装）」，但如果未安装，回退到「按 code-standards 自检清单逐项验证并输出报告」。这个自检清单分散在 code-standards.md 的多个位置，没有一个结构化的 checklist 格式方便 Agent 逐项执行。

**建议**：在 code-standards.md 末尾或独立创建 `references/self-review-checklist.md`，提供一个**可机器执行**的结构化清单：

```markdown
## 自检清单（Agent 需逐项判断 PASS/FAIL）

- [ ] 全局类型是否被 import（FAIL 条件：存在 import type { X } from，且 X 在 global.d.ts）
- [ ] hooks 是否先于 components 生成
- [ ] ProTable 是否使用 request 模式（FAIL 条件：存在 dataSource= prop）
- [ ] 是否存在 mock 数据（FAIL 条件：localStorage/sessionStorage/内存数组出现在 service 文件中）
- [ ] ...
```

给 Agent 明确的 PASS/FAIL 判断条件，比描述性文字更可靠。

---

### 8. Vue 3 / Vue 2 模板覆盖率远低于 React

**问题**：

| 技术栈 | 模板数量 | 覆盖页面类型 |
|--------|---------|------------|
| React | 10 | 列表、弹窗表单、抽屉、详情、导入、上传、批量、大数据下拉 |
| Vue 3 | 2 | 仅列表、大数据下拉 |
| Vue 2 | 4 | 列表、上传（×2）、大数据下拉 |

Vue 3 缺少：弹窗表单、抽屉表单、抽屉详情、独立详情页、独立表单页、导入弹窗、批量表单。这意味着 Vue 3 用户在大多数场景下都会触发"未命中"。

**建议**：
- 短期：在 README 和使用指南中明确标注 Vue 3/2 的模板覆盖现状和路线图
- 中期：优先补充 `vue3-standard-modal-form`、`vue3-drawer-form`、`vue3-nonstandard-detail` 三个高频模板

---

## P2 — 体验优化和可维护性

### 9. agent.yaml 和 openai.yaml 内容完全相同

**问题**：两个文件的 5 行内容一模一样。如果将来真的需要差异化（如 OpenAI 特有的 function calling schema），当前的全复制结构会导致同步负担。

**建议**：如果暂时没有差异化需求，保留一个即可，或在 README 中说明为何分两个文件（未来扩展预留）。

---

### 10. normative-source.md 信息量低，可合并

**问题**：`normative-source.md` 仅 46 行，内容基本是其他文件的索引和重复。它的定位是"规范真源说明"，但实际上 SKILL.md 本身已经充当了调度中枢。

**建议**：将 normative-source.md 的维护指南内容合并到 component-registry.md 的维护指南部分，然后删除该文件。减少 Agent 的文件加载量。

---

### 11. component-library.md 和 component-registry.md 存在职责重叠

**问题**：
- `component-library.md`：组件库管理与模板匹配，包含匹配规则、容器选择规则
- `component-registry.md`：注册表说明文档，包含架构说明、维护指南
- `component-registry.json`：实际数据

三个文件都在说"组件注册表怎么工作"，但角度略有不同。Agent 不清楚应该读哪个。

**建议**：合并 `component-registry.md` 和 `component-library.md` 为一个文件 `template-matching.md`，职责清晰：
- 数据在 `component-registry.json`
- 说明/规则/维护指南在 `template-matching.md`

---

### 12. SKILL.md 的 description（frontmatter）过长

**问题**：第 3 行 description 有 4 行中文描述，部分 Agent 工具可能截断 frontmatter。

```yaml
description: 前端代码生成统一工作台。当用户需要生成页面、创建组件、做列表页/表单页/详情页...
```

**建议**：缩短为 1 句话核心触发描述，详细说明放在正文开头：

```yaml
description: 前端代码生成统一工作台——覆盖环境检测、需求分析、模板匹配、页面生成与代码审查的完整链路。
```

---

### 13. 缺少 "增量更新 / 修改已有页面" 的流程定义

**问题**：当前流程完全面向"新页面生成"。但实际使用中常见场景是：
- "在 whitelist 列表页上加一个导出按钮"
- "修改编辑弹窗，增加三个字段"
- "把抽屉详情改成独立详情页"

这些"修改已有代码"的场景没有流程定义，Agent 可能错误地走完整的 1-5 步然后覆盖原文件。

**建议**：增加一个"增量修改模式"的调度分支：

```markdown
### 增量修改模式

当用户意图是修改已有页面时：
1. 环境检测（同标准流程）
2. 定位目标文件和代码块
3. 按 code-standards 的规范修改（仍遵守 hooks 优先等规则）
4. 差异审查（仅审查变更部分）

触发关键词：修改、调整、增加、删除（指功能）、改为、替换
```

---

### 14. 缺少错误恢复/重试指引

**问题**：如果 Agent 在步骤 3 匹配错误模板、或步骤 4 生成了有问题的代码，当前没有"回退重来"的指引。

**建议**：在 SKILL.md 中增加简短的错误恢复策略：

```markdown
### 错误恢复

- 步骤 3 匹配错误 → 允许用户指定正确模板 ID 后重新执行步骤 3-5
- 步骤 4 生成不满意 → 带用户反馈重新执行步骤 4-5，不需重走 1-3
- 步骤 5 发现 P0 问题 → 自动修复后重走步骤 5 审查
```

---

### 15. 使用指南中的示例存在 CRLF/LF 混合换行

**问题**：使用指南.md 文件中前半部分使用 `\n` 换行，后半部分使用 `\r\n`，混合换行在某些 Agent 解析器中可能导致格式异常。

**建议**：统一为 LF（`\n`）换行，在 `.gitattributes` 或 `.editorconfig` 中加入约束。

---

### 16. 组件库替换的"热插拔"能力尚未结构化

**问题**：你提到"组件库随时可能替换成别的"，但当前的 `component-registry.json` 和 `components/` 目录是紧密耦合的。如果要替换组件库（比如从 Ant Design Pro 换到 Arco Design），需要：
1. 重写所有 `react-*.md` 模板
2. 更新 `react-antdpro-knowledge.md`
3. 修改 `code-standards.md` 中的大量 ProTable 相关规则

**建议**：引入一层抽象——**UI 框架 Profile**：

```json
// references/ui-profiles/react-antdpro.json
{
  "profileId": "react-antdpro",
  "tableComponent": "ProTable",
  "modalFormComponent": "ModalForm",
  "searchMode": "built-in-search",
  "statusRendering": "valueEnum",
  "knowledgeBase": "react-antdpro-knowledge.md",
  "templatePrefix": "react-"
}
```

这样替换组件库时，只需创建新的 profile + 新模板，不需要改动核心流程文件。

---

### 17. 提示词模板中"接口数据结构"的两种模式可以更智能

**问题**：当前需要用户明确选择"引用接口文件"或"提供 JSON"。但很多时候用户会混合使用（比如引用接口文件但补充几个自定义字段），或者不确定接口是否存在。

**建议**：让 Agent 自动检测：
```markdown
接口数据结构（AI 自动判断模式）：
- 如提供了 `接口类型：xxx.d.ts` → 自动进入引用模式
- 如提供了 JSON 结构 → 自动进入生成模式
- 如两者都提供 → 以文件为主，JSON 作为补充字段
- 如都没提供 → 从原型图中提取字段，兜底生成骨架
```

---

### 18. 缺少生成结果的"一致性验证"机制

**问题**：SKILL.md 第 224 行写了「对同一需求重复生成时，应优先得到**同模板、同结构、同风格**的稳定结果」，但没有具体的保障机制。不同 Agent / 不同时刻生成的代码可能结构差异很大。

**建议**：在模板 `.md` 文件中增加 **必须出现的文件签名**（如固定的函数名、变量名模式），作为一致性锚点：

```markdown
## 一致性锚点（Agent 生成时必须保持）

- 主 hook 名称：`useTableData`
- 导出模式：`export default XxxPage`
- columns 变量名：`columns`
- actionRef 变量名：`actionRef`
```

---

### 19. MCP 相关内容分散且状态不明

**问题**：`environment-setup.md` 末尾提到「若已配置 codegen-engine MCP，可优先调用 detect_tech_stack...」，`component-library.md` 末尾提到 `smart_match_template`，但这些 MCP 功能的实现状态不明，且引用了不存在的文件 `mcp-codegen-engine.md`。

**建议**：
- 如果 MCP 尚未实现，移除或标注为 `🔜 规划中`
- 如果已实现，创建 `references/mcp-integration.md` 统一说明
- 不要在当前可用文件中引用不存在的链接

---

## 优化优先级速查

| 优先级 | 编号 | 标题 | 工作量 |
|--------|------|------|--------|
| **P0** | #1 | 去重 — 减少信息重复 | 中 |
| **P0** | #2 | 模板未命中兜底策略 | 小 |
| **P0** | #3 | 关键词匹配增强 + 组合匹配 | 中 |
| **P1** | #4 | 版本兼容矩阵 | 小 |
| **P1** | #5 | 技术栈检测健壮性 | 小 |
| **P1** | #6 | 提示词模板增加"参考页面"字段 | 小 |
| **P1** | #7 | 结构化自检 Checklist | 中 |
| **P1** | #8 | Vue 3/2 模板覆盖率 | 大 |
| **P2** | #9 | agent.yaml 去重 | 小 |
| **P2** | #10 | normative-source.md 合并 | 小 |
| **P2** | #11 | component-library + registry.md 合并 | 中 |
| **P2** | #12 | SKILL.md description 精简 | 小 |
| **P2** | #13 | 增量修改模式 | 中 |
| **P2** | #14 | 错误恢复策略 | 小 |
| **P2** | #15 | 换行符统一 | 小 |
| **P2** | #16 | UI 框架 Profile 抽象 | 大 |
| **P2** | #17 | 接口数据智能模式判断 | 小 |
| **P2** | #18 | 一致性锚点 | 小 |
| **P2** | #19 | MCP 引用清理 | 小 |

---

## 建议优先执行的 Top 5

1. **#1 去重**：投入产出比最高，直接减少 Token 浪费和维护成本
2. **#2 兜底策略**：避免 Agent 在未覆盖场景下出错
3. **#13 增量修改模式**：高频使用场景，当前完全缺失
4. **#7 结构化自检 Checklist**：提升审查步骤的可靠性
5. **#3 组合匹配**：让工具栏按钮等复合需求不再丢失模板
