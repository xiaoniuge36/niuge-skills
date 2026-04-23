# 外部 Skills 集成指南

本文件定义了 `fe-codegen-workbench` 与外部 Skills 生态的集成关系。这些 Skills 可在任何支持 SKILL.md 标准的工具中使用（Claude Code、Codex CLI、Cursor 等）。

## 集成等级

| 等级 | 说明 | 加载方式 |
|------|------|---------|
| **深度集成** | 作为工作台流程的一部分强制调用 | 流程步骤中直接引用 |
| **知识库参考** | 生成代码时作为最佳实践参考 | 按技术栈条件加载 |
| **可选增强** | 安装后自动增强工作台能力 | 检测到已安装时启用 |

## 深度集成 Skills

### 1. code-review-expert（步骤 5 代码审查）

**来源**：本地 `skills/code-review-expert/`

**集成点**：生成代码后的第 5 步审查。

**调用方式**：
1. 加载 `code-review-expert/SKILL.md`
2. 将生成的文件列表作为 review scope
3. 按 P0-P3 优先级输出 findings
4. 自动修复 P0/P1 问题

**审查清单引用**：
- `references/self-review-checklist.md` — 结构化 PASS/FAIL 清单
- `references/code-standards.md` — 规则真源

### 2. brainstorming（步骤 2 需求探索）

**来源**：`anthropics/skills` 或本地安装

**集成点**：当用户需求模糊时，在步骤 2 触发需求头脑风暴。

**触发条件**：
- 用户只说"做一个页面"但未描述具体需求
- 需求中有多种可能的实现方案
- 涉及架构决策（弹窗 vs 独立页面）

## 知识库参考 Skills

### 3. vercel-react-best-practices（React 项目）

**来源**：`vercel-labs/agent-skills`
**安装**：`npx skills add vercel-labs/agent-skills --skill react-best-practices`

**适用条件**：`techStack === "react"` 时自动参考。

**核心规则（58 条，按影响分级）**：
- **CRITICAL** — 消除异步瀑布流、包体积优化
- **HIGH** — 服务端性能优化
- **MEDIUM** — 客户端数据获取、重渲染优化、渲染性能
- **LOW** — JavaScript 性能、高级模式

**与工作台的协同**：
- 步骤 4 生成代码时，按上述规则检查 React 代码质量
- 步骤 5 审查时，作为 code-quality-checklist 的补充

### 4. vue-best-practices / vue（Vue 项目）

**来源**：`anthropics/skills` 或社区维护

**适用条件**：`techStack === "vue3"` 或 `techStack === "vue2"` 时自动参考。

**核心规则**：
- 强制 Composition API + `<script setup>`（Vue 3）
- 响应式管理：`ref` vs `reactive` vs `shallowRef` 正确使用
- Props/Emits 类型安全
- Vue Router / Pinia 行业标准实现
- 常见反模式识别（不当 Watcher、解构 reactive 丢失响应式）

### 5. frontend-design（UI/UX 设计思维）

**来源**：`anthropics/skills`
**安装**：`npx skills add anthropics/skills --skill frontend-design`

**适用条件**：用户提供原型图/设计稿时优先加载。

**核心能力**：
- 生成代码前进行设计思考
- 避免"AI 味"的通用设计（紫色渐变、通用字体）
- 选择独特的字体组合和配色方案
- 设计有意义的交互动效

**集成建议**：
- 适合作为 `fe-codegen-workbench` 的条件化设计增强层
- 仅在原型图、品牌页、营销页、视觉升级任务中优先加载
- 标准 B 端 CRUD / 表单页不建议默认强制调用，避免与现有设计系统冲突

## 可选增强 Skills

### 6. typescript-advanced-types

**来源**：社区
**用途**：生成复杂 TypeScript 类型定义时参考

### 7. webapp-testing

**来源**：`anthropics/skills`
**用途**：生成代码后可选的端到端测试

### 8. systematic-debugging

**来源**：`anthropics/skills`
**用途**：生成代码出错时的系统化调试

### 9. verification-before-completion

**来源**：`anthropics/skills`
**用途**：完成生成后的最终验证

### 10. ui-ux-pro-max

**来源**：社区
**用途**：更高级的 UI/UX 设计规范

**集成建议**：
- 保持为 **可选增强**，不建议升级为 `fe-codegen-workbench` 的默认强依赖
- 仅在已验证来源可信、且用户明确追求高保真体验升级时启用
- 推荐作为 `frontend-design` 的补充，而不是替代工作台主流程

## 设计类 Skill 选择建议

| 场景 | 推荐 |
|------|------|
| 标准 B 端列表、表单、详情、CRUD | 不默认加载设计类 Skill，优先复用现有设计系统与模板 |
| 用户显式要求某品牌风格（"linear 风"、"stripe 感"） | 走 **DESIGN.md 链路**（见 [design-md-integration.md](./design-md-integration.md)），**不** 同时加载 `frontend-design` |
| 用户提供自定义 DESIGN.md 文件 | 走 **DESIGN.md 链路**，本地读取，不抓取 getdesign.md |
| 用户自然语言描述风格（"年轻、赛博、冷淡克制"） | 步骤 2.5 触发设计推荐，从 `references/design-systems/index.json` 中推 3+1；**不** 同时加载 `frontend-design` |
| 有原型图 / 品牌视觉稿 / 营销页 / 视觉升级诉求 | 加载 `frontend-design`（不走 DESIGN.md 链路） |
| 需要进一步做高保真 UI/UX 升级，且本地已有可信社区 Skill | `frontend-design` + `ui-ux-pro-max` 叠加参考 |

### DESIGN.md 链路 vs frontend-design：如何取舍

| 对比项 | DESIGN.md 链路 | `frontend-design` |
|--------|---------------|-------------------|
| 视觉规范来源 | 现成品牌（getdesign.md 69 个）或用户自己的 DESIGN.md | AI 按原则自由设计 |
| 结果稳定性 | 高（规范驱动，可复现） | 中（AI 判断，略有随机） |
| 业务代码影响 | 零（只动主题层 token） | 中-高（可能影响组件样式写法） |
| 适用场景 | 用户想要"现成品牌风格"或"基于规范的视觉一致性" | 用户有原型图但没成型设计系统，或追求独特创意 |
| 推荐组合使用 | ❌ 不推荐同时启用（规则冲突） | — |

**默认优先级**：若用户风格诉求能被 DESIGN.md 链路覆盖（品牌/关键词），优先走 DESIGN.md；否则再考虑 `frontend-design`。

## 安装建议

### 最小化安装（推荐）

```bash
# 深度集成（必装）
# code-review-expert 已包含在 niuge-skills 中，无需额外安装

# 知识库参考（建议安装）
npx skills add vercel-labs/agent-skills --skill react-best-practices
npx skills add anthropics/skills --skill frontend-design
```

### 完整安装

```bash
npx skills add vercel-labs/agent-skills --skill react-best-practices
npx skills add anthropics/skills --skill frontend-design
npx skills add anthropics/skills --skill vue-best-practices
npx skills add anthropics/skills --skill webapp-testing
npx skills add anthropics/skills --skill systematic-debugging
npx skills add anthropics/skills --skill verification-before-completion
```

## 跨工具兼容性

本工作台及集成的 Skills 均基于 SKILL.md 开放标准，兼容：

| 工具 | Skills 目录 | 兼容性 |
|------|-----------|--------|
| Claude Code | `~/.claude/skills/` | ✅ 完全兼容 |
| OpenAI Codex CLI | `~/.codex/skills/` | ✅ 完全兼容 |
| Cursor | `.cursor/skills/` 或 `~/.cursor/skills/` | ✅ 完全兼容 |
| ChatGPT | 通过 Codex 集成 | ✅ 兼容 |

### 安装位置

```
# 个人级别（所有项目可用）
~/.claude/skills/fe-codegen-workbench/
~/.codex/skills/fe-codegen-workbench/
~/.cursor/skills-cursor/fe-codegen-workbench/

# 项目级别（仅当前项目可用）
.claude/skills/fe-codegen-workbench/
.codex/skills/fe-codegen-workbench/
.cursor/skills/fe-codegen-workbench/
```

## 技术栈检测与 Skill 加载策略

```
检测到 techStack
  ├─ "react"
  │   ├─ 加载 react-antdpro-knowledge.md（内置）
  │   ├─ 检测 vercel-react-best-practices 是否已安装 → 已装则加载
  │   └─ 组件匹配时过滤 react-* 模板
  ├─ "vue3"
  │   ├─ 加载 vue-knowledge.md（内置）
  │   ├─ 检测 vue-best-practices 是否已安装 → 已装则加载
  │   └─ 组件匹配时过滤 vue3-* 模板
  ├─ "vue2"
  │   ├─ 加载 vue-knowledge.md（内置，Vue 2 兼容部分）
  │   └─ 组件匹配时过滤 vue2-* 模板
  └─ 无项目（新建）
      ├─ 默认 techStack = "react"
      ├─ 加载 react-antdpro-knowledge.md
      └─ 按 environment-setup.md 创建 React 项目
```
