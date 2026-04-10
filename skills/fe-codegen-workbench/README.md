# fe-codegen-workbench

前端代码生成统一工作台 Skill，覆盖从环境检测到代码审查的完整闭环。

基于 SKILL.md 开放标准，兼容 Claude Code、Codex CLI、Cursor、ChatGPT 等所有 AI 编码工具。

## 适用场景

- B 端管理系统（列表页、表单页、详情页、CRUD）
- C 端应用、H5 移动端（文件上传、水印等）
- 中后台系统、大数据渲染（虚拟列表、分页下拉）
- 批量操作（Schema 驱动表单）

## 支持的技术栈

| 技术栈 | UI 库 | 模板前缀 | 内置知识库 |
|--------|-------|----------|-----------|
| React | Ant Design / Ant Design Pro | `react-*` | `react-antdpro-knowledge.md` |
| Vue 3 | Element Plus | `vue3-*` | `vue-knowledge.md` |
| Vue 2 | Element UI / Vant | `vue2-*` | `vue-knowledge.md`（兼容部分） |

## 内置模板（16 个）

### React（10 个）

| 模板 ID | 名称 | 适用场景 |
|---------|------|---------|
| `react-standard-list-crud` | 标准列表页 | ProTable + 搜索 + CRUD |
| `react-standard-modal-form` | 弹窗表单 | <10 字段的新增/编辑 |
| `react-drawer-form` | 抽屉编辑表单 | 10-20 字段的编辑 |
| `react-drawer-detail` | 抽屉详情 | 快速查看详情 |
| `react-nonstandard-detail` | 独立详情页 | 审批流程/附件预览 |
| `react-standard-form-page` | 独立表单页 | >20 字段的复杂表单 |
| `react-import-list-modal` | 导入弹窗 | Excel 数据导入 |
| `react-pc-file-upload` | PC 文件上传 | 图片/文件上传 |
| `react-virtual-paginated-select` | 大数据渲染下拉 | 8000+ 条数据 |
| `react-batch-schema-form` | 批量 Schema 表单 | 动态批量编辑 |

### Vue 3（2 个）

| 模板 ID | 名称 | 适用场景 |
|---------|------|---------|
| `vue3-standard-list-crud` | 标准列表页 | Element Plus 列表页 |
| `vue3-virtual-paginated-select` | 大数据渲染下拉 | el-table-v2 |

### Vue 2（4 个）

| 模板 ID | 名称 | 适用场景 |
|---------|------|---------|
| `vue2-standard-list-crud` | 标准列表页 | Element UI 列表页 |
| `vue2-h5-file-upload` | H5 文件上传 | Vant + 水印 |
| `vue2-pc-file-upload` | PC 文件上传 | Element Upload |
| `vue2-virtual-paginated-select` | 大数据渲染下拉 | vue-virtual-scroller |

## 核心流程

```
[1] 环境检测 → [2] 需求分析 → [3] 模板匹配 → [4] 页面生成 → [5] 代码审查
```

步骤为强制顺序执行，不可跳步。

**技术栈策略**：现有项目自动检测技术栈并加载对应知识库；新项目默认 React + TypeScript + Ant Design Pro。

详见 [SKILL.md](SKILL.md) 和 [使用指南.md](使用指南.md)。

## 目录结构

```
fe-codegen-workbench/
├── SKILL.md                                  # 主调度文件（入口）
├── README.md                                 # 本文件
├── 使用指南.md                                # 使用指南（模板提示词 + 示例）
├── agents/
│   ├── agent.yaml                            # Agent 接口配置
│   └── openai.yaml                           # OpenAI Agent 接口配置
└── references/
    ├── environment-setup.md                  # 步骤 1：环境检测与初始化
    ├── requirements-analysis.md              # 步骤 2：需求分析
    ├── component-library.md                  # 步骤 3：UI 组件库匹配规则
    ├── component-registry.json               # 步骤 3：组件注册表索引（JSON）
    ├── component-registry.md                 # 步骤 3：注册表说明文档
    ├── components/                           # 步骤 3：独立组件定义（一文件一组件）
    │   ├── react-*.md                        #   React 模板（10 个）
    │   ├── vue3-*.md                         #   Vue 3 模板（2 个）
    │   └── vue2-*.md                         #   Vue 2 模板（4 个）
    ├── page-generation.md                    # 步骤 4：生成原则与文件顺序
    ├── code-standards.md                     # 步骤 4：编码规范
    ├── react-antdpro-knowledge.md            # 步骤 4：React + AntdPro 知识库
    ├── vue-knowledge.md                      # 步骤 4：Vue 3 + Element Plus 知识库
    ├── external-skills.md                    # 外部 Skills 集成指南
    └── normative-source.md                   # 规范真源说明
```

## 集成的 Skills

| Skill | 集成等级 | 用途 |
|-------|---------|------|
| `code-review-expert` | 深度集成 | 步骤 5 代码审查（P0-P3 findings） |
| `brainstorming` | 深度集成 | 步骤 2 需求模糊时探索 |
| `vercel-react-best-practices` | 知识库参考 | React 性能优化 58 条规则 |
| `vue-best-practices` | 知识库参考 | Vue 3 响应式/组件/状态管理 |
| `frontend-design` | 知识库参考 | 有设计稿时的 UI/UX 设计思维 |
| `ui-ux-pro-max` | 可选增强 | 已安装且明确追求高保真 UI/UX 升级时再启用 |

详见 [references/external-skills.md](references/external-skills.md)。

## 设计类 Skill 整合建议

- `frontend-design` 适合作为 `fe-codegen-workbench` 的条件化增强层：有原型图、品牌视觉稿、营销页或明确的视觉升级诉求时加载。
- `ui-ux-pro-max` 更适合作为可选补强，而不是默认强依赖：它更偏社区经验和高保真设计规范，容易与既有设计系统或 B 端模板约束冲突。
- 标准企业 CRUD、表单页、详情页场景下，优先遵循模板注册表、现有组件库和 `code-standards.md`，不要默认引入激进设计策略。

## 组件注册表架构

采用「JSON 索引 + 独立文件」模式，支持三种来源：

| source.type | 说明 | 状态 |
|-------------|------|------|
| `local` | 本地 `.md` 文件 | ✅ 已支持 |
| `npm` | npm 包组件 | 🔜 规划中 |
| `remote` | 远程 URL | 🔜 规划中 |

## 核心规则

- **hooks / composables 优先**：先生成数据处理层，再生成 UI 层
- **全局类型禁止 import**：`global.d.ts` 中的类型直接使用
- **禁止 mock**：不生成任何假数据
- **文件生成顺序**：`types.ts` → `hooks/` → `components/` → `index.tsx` → `index.less`
- **技术栈知识库驱动**：根据检测到的技术栈自动加载对应知识库

## 安装

```bash
# 个人级别（所有项目可用）
# Claude Code
cp -r fe-codegen-workbench ~/.claude/skills/

# Codex CLI
cp -r fe-codegen-workbench ~/.codex/skills/

# Cursor
cp -r fe-codegen-workbench ~/.cursor/skills-cursor/

# 项目级别（仅当前项目）
cp -r fe-codegen-workbench .claude/skills/
```

## 推荐搭配安装

```bash
npx skills add vercel-labs/agent-skills --skill react-best-practices
npx skills add anthropics/skills --skill frontend-design
```
