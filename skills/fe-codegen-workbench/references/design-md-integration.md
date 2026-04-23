# DESIGN.md 设计系统集成（可选链路）

本文件规定 `fe-codegen-workbench` 与 [getdesign.md](https://getdesign.md/) 设计系统集合的集成方式，对应主 SKILL 的 **步骤 2.5（设计推荐）**、**步骤 3.5（DESIGN.md 加载）**、**步骤 4 主题层生成** 与 **步骤 5 主题遵从度审查**。

## 核心原则（不可破坏）

1. **交互式可选链路，用户始终可一键退出**：
   - 对**新建页面 / 新建项目任务**，默认进入 2.5 节点，主动推荐 3 个品牌 + 1 个"不使用品牌"兜底选项（3+1 ask_question），给用户选择的机会。
   - 用户选"不使用品牌" / 明确说"按默认" / 对话超时 → 完全走 AntD 默认，不抓取 DESIGN.md、不生成主题文件。
   - 对**增量修改任务** / 用户**显式说"按默认 / 不用设计系统"**，跳过 2.5 节点，保持现状。
   - 用户显式品牌（_"用 linear 风格"_）或本地路径 → 跳过推荐对话直接进入 3.5。
2. **远程优先 + 本地降级**：索引和 DESIGN.md 均**优先从 `https://getdesign.md/` 实时抓取**，保证用户拿到最新设计系统；抓取失败时再退回本地缓存；本地缓存也缺失时才静默降级到默认 AntD。默认假设用户处于有网环境，远程是"事实来源"，本地只是断网兜底。
3. **业务代码零感知**：所有视觉落地只发生在新生成的"主题层"文件里（单文件），不得修改 `.tsx` / `.vue` 业务组件的任何样式逻辑。
4. **失败即降级**：任何环节（远程抓取失败、本地缓存缺失、DESIGN.md 解析失败）→ 静默回落默认 AntD 主题，仅在控制台打印一行 warning，不阻塞步骤 3/4/5。
5. **禁止幻觉**：推荐给用户的品牌 id **必须**来自当次加载到的 `brands[]`（无论来源是远程最新还是本地缓存），不得推荐未在索引中的品牌。
6. **模型推荐而非算法匹配**：Agent 直接读索引的 tagline 列表做推荐，不引入标签库、不做关键词打分。
7. **任务内单次抓取**：在同一个生成任务内，索引和每个 DESIGN.md 只抓取一次（避免 2.5 与 3.5 各自重抓）；跨任务则重新从远程抓取，保证每次启用设计系统时都是最新数据。

---

## 步骤 2.5：设计推荐节点

**位置**：主 SKILL 步骤 2（需求分析）结束、步骤 3（模板匹配）开始之前。

**是否触发**：**默认启用（交互式推荐）**——对新建页面 / 新建项目任务，Agent 默认进入 2.5 节点，基于需求类型主动推荐 3 个候选品牌 + 1 个"不使用品牌"兜底选项（3+1），给用户一次**选或不选**的交互机会。以下场景会改变这个默认：

### 2.5.1 触发判定

Agent 按以下优先级判断（从上到下匹配即停止）：

| 信号 | 判定 | 动作 |
|------|------|------|
| 用户显式提及品牌名（如 _"linear 风"_、_"stripe 那种支付风"_） | **强触发·跳过推荐** | 直接记录 `preferredBrandId = <brand>`，跳过 3+1 对话框，进入 3.5 |
| 用户提供本地 DESIGN.md 路径（如 _"设计参考 ./my-design.md"_） | **强触发·跳过推荐** | 直接记录 `designMdPath`，跳过 3+1 对话框，进入 3.5 |
| 用户明确说 _"B 端标准 / 按默认 / 按组件库风格 / 不用设计系统 / 不要主题"_ | **显式跳过** | 记录 `selectedBrandId = null`，跳过 2.5 直接进入步骤 3 |
| **增量修改任务**（修改、调整、增加某字段等 @SKILL 增量修改模式） | **默认跳过** | 除非用户同时明说 _"顺便换成 xx 风格"_，否则跳过 2.5 沿用现有主题 |
| 用户提及自然语言风格词（_"赛博风 / 高级感 / 年轻化 / 冷淡克制 / 暗色风 / 极简感 / 高保真"_） | **主动推荐（强匹配）** | 进入 2.5.2，基于风格词在 `brands[]` 内做语义相似度打分选 3 个，理由紧扣风格词 |
| **新建页面 / 新建项目任务 + 无任何上述信号**（默认情况） | **主动推荐（通用匹配）** | 进入 2.5.2，Agent 基于需求类型（B端列表/表单/Dashboard/营销页/...）从 `brands[]` 选 3 个通用适配的品牌，理由紧扣需求类型 |

> **注意**：即使在"主动推荐"分支，**第 4 项 "不使用品牌（使用默认 Ant Design 样式）" 永远作为兜底选项存在**，用户一秒即可退出设计链路。

**设计风格信号词参考清单**（非穷举）：

```
暗色 / dark / 暗黑 / 黑色
简洁 / 极简 / minimal / 简约
高级 / 精致 / 质感 / premium
年轻 / 活泼 / 潮 / 炫酷 / playful
品牌化 / 品牌感 / 定制
编辑风 / editorial / 杂志感
数据密集 / dense / 仪表盘感
渐变 / 霓虹 / neon
赛博 / 朋克 / 未来感
冷淡 / 克制 / 冷峻
```

### 2.5.2 推荐流程（模型直接推荐）

**输入**：

- 步骤 2 产出的结构化需求
- 用户原始表述（保留风格词原文）
- `references/design-systems/index.json` 中的 `brands[]`（每条含 id/name/tagline/previewColor/detailUrl）

**Agent 行为规则**：

1. **加载索引（远程优先 + 本地降级）**：
   - **首选**：从 `https://getdesign.md/` 首页抓取最新品牌列表，解析为 `brands[]` 结构（字段：`id / name / tagline / detailUrl / previewColor`），并**同步覆盖本地 `references/design-systems/index.json`**（保持本地缓存与远程一致）。
   - **降级 1**：远程抓取失败（超时 / 网络不可达 / 解析异常）→ 回退读取本地 `index.json`；向用户输出一行 warning _"远程设计库不可达，已使用本地缓存（last updated: <updatedAt>）"_ 。
   - **降级 2**：远程抓取失败 **且** 本地 `index.json` 缺失 → 静默跳过本节点，直接进入步骤 3（等同于用户选择了"默认 AntD"）。
   - **任务内单次抓取**：同一个生成任务内已经抓过一次，则后续直接复用当次抓取结果，不重复发起请求。
2. **从 `brands[]` 中选出最匹配的 3 个品牌**：
   - **有风格词时**：基于 `tagline` 的语义与风格词做匹配，打分选 Top 3
   - **无风格词时（通用推荐）**：根据需求类型选出最普适、最稳妥的 3 个品牌（例如：B端列表 → `linear`/`notion`/`stripe` 类偏工具型；Dashboard → 偏数据密集型；营销页 → 偏品牌感型）；理由必须围绕"适合做什么类型的页面"而非用户未提到的风格
   - 要求：每个推荐必须给出 **不超过 30 字的中文推荐理由**，且理由必须显式引用 `tagline` 中的英文关键词（防止瞎推）
3. **组装 3+1 选项结构**（第 4 项固定为"使用默认 Ant Design 样式"）：

   ```json
   {
     "recommendations": [
       {
         "id": "<brand-id，必须来自 index.json>",
         "name": "<brand-name>",
         "previewColor": "<#HEX>",
         "reason": "<≤30 字中文推荐理由，引用 tagline 关键词>"
       }
     ],
     "defaultOption": {
       "label": "使用默认 Ant Design 样式",
       "hint": "B 端标准推荐 / 风格最稳定"
     }
   }
   ```

4. **通过 `ask_question`（Cursor）或工具等价 API 向用户展示**：
   - 若 Agent 判断需求是极标准 B 端（无风格词） → `defaultOption` 在呈现时**置顶**，引导用户快速选"不使用"
   - 否则 3 个品牌推荐在前，`defaultOption` 置底
   - 对话语气要**轻量、友好、可退出**，例如 _"我为你的需求推荐了 3 个设计风格，要用哪个？也可以选择第 4 项保持默认样式。"_
5. 用户选择后：
   - 选中品牌 id → 记录 `selectedBrandId = <id>`，进入步骤 3.5
   - 选择默认（第 4 项）→ 记录 `selectedBrandId = null`，直接进入步骤 3，后续不加载 DESIGN.md、不生成主题文件
   - 用户未回应 / 对话超时 / 用户口头说"算了" → 视同选第 4 项（`selectedBrandId = null`），继续流程不打扰

### 2.5.3 推荐输出展示模板

Agent 向用户呈现时使用以下样式（以 Cursor 问答为例）：

```
基于你的需求，为你推荐 3 套设计风格：

  [A] Linear  ▮ 极简 / 紫色点缀 / dev-tool 生产力调性
              主色 ■ #5E6AD2

  [B] Notion  ▮ 衬线暖色 / 温和极简 / 工作台感
              主色 ■ #191919

  [C] Stripe  ▮ 渐变紫 / 金融精致感 / 偏营销
              主色 ■ #635BFF

  [D] 使用默认 Ant Design 样式（B 端标准推荐，风格最稳定）
```

### 2.5.4 禁止行为（最高优先级）

- ❌ 推荐未在 `index.json` 中的品牌
- ❌ 推荐超过 3 个品牌
- ❌ 用户未选择时擅自"默认选最优"并继续
- ❌ 推荐理由空泛（_"风格不错"_、_"很适合"_ 等无信息量的话）
- ❌ 把用户的需求描述改写后作为推荐理由（必须引用 `tagline` 关键词）

---

## 步骤 3.5：DESIGN.md 加载节点

**位置**：主 SKILL 步骤 3（模板匹配）结束、步骤 4（页面生成）开始之前。

**触发条件**：`selectedBrandId` 不为 null 或 `designMdPath` 不为空。

### 3.5.1 加载规则（远程优先 + 本地降级）

```
若 designMdPath 不为空（用户指定了本地 DESIGN.md）：
  └─ 读取该路径 → 进入 3.5.3 解析（本地文件优先，不走远程）

否则若 selectedBrandId 不为 null：
  ├─ 首选：从 index.json 读取 detailUrl（通常是 https://getdesign.md/<brand>/design-md）
  │       → 远程抓取最新 DESIGN.md
  │           ├─ 成功 → 同步覆盖本地 references/design-systems/<brandId>/DESIGN.md → 进入 3.5.3 解析
  │           └─ 失败 → 进入降级
  │
  ├─ 降级 1：远程抓取失败 → 读本地 references/design-systems/<brandId>/DESIGN.md
  │           ├─ 本地存在 → 使用本地缓存进入 3.5.3 解析
  │           │              并向用户输出 warning:
  │           │              "远程 <brandName> 设计系统不可达，已使用本地缓存"
  │           └─ 本地缺失 → 进入降级 2
  │
  └─ 降级 2：远程失败 + 本地缺失 → 静默降级到默认 AntD
              跳过 3.5/4 主题层/5 主题审查
              向用户输出:
              "<brandName> 设计系统加载失败（远程不可达且无本地缓存），已回落为默认 Ant Design 样式"
```

### 3.5.2 抓取约束

- 抓取地址：**只允许** `https://getdesign.md/<brand>/design-md`（或 `index.json` 中对应品牌的 `detailUrl`）
- 抓取成功后**必须同步更新本地缓存**（落盘到 `references/design-systems/<brandId>/DESIGN.md`），自动创建子目录；保持本地缓存始终与最后一次成功的远程抓取一致
- 任务内单次抓取：同一生成任务内已成功抓取过该品牌，则不重复发起请求
- 远程抓取超时阈值建议 ≤ 10 秒；超时视为失败，立即进入降级流程
- 降级时的 warning 必须让用户看到，明确指出使用的是本地缓存或已降级为默认

### 3.5.3 DESIGN.md 解析

从 DESIGN.md 中提取以下最小字段集（用于生成主题文件）：

| 字段 | 含义 | 兜底策略 |
|------|------|---------|
| `color.primary` | 主色 | 用 index.json 的 `previewColor` 兜底 |
| `color.background` | 页面背景 | 默认白色 `#FFFFFF` |
| `color.text.primary` | 主文本色 | 默认 `rgba(0,0,0,0.88)` |
| `color.text.secondary` | 次文本色 | 默认 `rgba(0,0,0,0.65)` |
| `color.border` | 边框色 | 默认 `#D9D9D9` |
| `radius.md` | 标准圆角 | 默认 `6` |
| `radius.lg` | 大圆角 | 默认 `8` |
| `font.sans` | 无衬线字体 | 默认系统字体栈 |
| `font.mono` | 等宽字体 | 默认 `Menlo, Consolas, monospace` |
| `spacing.unit` | 间距基准 | 默认 `4` |
| `mode` | 深浅色模式 | `light` / `dark` / `both`，默认 `light` |

**解析失败兜底**：若 DESIGN.md 结构不规范，Agent 尽最大努力抽取 `color.primary` 和 `mode`，其余字段用默认值。

---

## 步骤 4：主题层生成（追加，不替代业务代码生成）

**触发条件**：`selectedBrandId` 不为 null 且 3.5 成功加载 DESIGN.md。

### 4.1 生成顺序（强制追加到现有顺序末尾）

现有顺序：types → services → hooks → components → index → less

**追加末尾**：

```
7. 主题文件（按技术栈）
8. 项目根 DESIGN.md 副本
```

### 4.2 主题文件模板（按技术栈）

#### React + Ant Design Pro

**目标**：`src/theme/token.ts`（若已存在，追加/合并，不整体覆盖）

```ts
// AUTO-GENERATED BY fe-codegen-workbench (DESIGN.md integration)
// Source: references/design-systems/<brandId>/DESIGN.md

import type { ThemeConfig } from 'antd';

export const designMdToken: ThemeConfig = {
  token: {
    colorPrimary: '<color.primary>',
    colorBgBase: '<color.background>',
    colorTextBase: '<color.text.primary>',
    colorBorder: '<color.border>',
    borderRadius: <radius.md>,
    borderRadiusLG: <radius.lg>,
    fontFamily: '<font.sans>',
    fontFamilyCode: '<font.mono>',
  },
  algorithm: '<mode === "dark" ? "darkAlgorithm" : "defaultAlgorithm">',
};
```

**接入方式**：在 `src/app.tsx` 或 `src/App.tsx` 的 `ConfigProvider` 上绑定：

```tsx
import { ConfigProvider } from 'antd';
import { designMdToken } from '@/theme/token';

<ConfigProvider theme={designMdToken}>
  {/* 现有业务代码零改动 */}
</ConfigProvider>
```

若项目已有 `ConfigProvider theme={...}`，**只合并 `token` 字段**，不覆盖其它配置。

#### Vue 3 + Element Plus

**目标**：`src/theme/vars.scss`

```scss
/* AUTO-GENERATED BY fe-codegen-workbench (DESIGN.md integration) */
:root {
  --el-color-primary: <color.primary>;
  --el-bg-color: <color.background>;
  --el-text-color-primary: <color.text.primary>;
  --el-text-color-regular: <color.text.secondary>;
  --el-border-color: <color.border>;
  --el-border-radius-base: <radius.md>px;
  --el-border-radius-lg: <radius.lg>px;
  --el-font-family: <font.sans>;
}
```

**接入方式**：在 `src/main.ts` 顶部 `import '@/theme/vars.scss'`。

#### Tailwind 项目（任何技术栈）

**目标**：`tailwind.config.ts` 的 `theme.extend`（追加，不覆盖）

```ts
// AUTO-MERGED BY fe-codegen-workbench (DESIGN.md integration)
theme: {
  extend: {
    colors: {
      primary: '<color.primary>',
      'text-primary': '<color.text.primary>',
      'text-secondary': '<color.text.secondary>',
    },
    borderRadius: {
      md: '<radius.md>px',
      lg: '<radius.lg>px',
    },
    fontFamily: {
      sans: ['<font.sans>'],
      mono: ['<font.mono>'],
    },
  },
},
```

### 4.3 项目根 DESIGN.md 副本

将 `references/design-systems/<brandId>/DESIGN.md` 完整复制到项目根 `DESIGN.md`（若存在则覆盖提示用户，并在文件头追加 `generated-by: fe-codegen-workbench, source: <brandId>, date: <YYYY-MM-DD>`）。

**作用**：
- 成为未来 Agent 再次打开项目时的**设计上下文锚点**
- 设计风格可审计：未来生成新页面时 Agent 会读它以维持风格一致

### 4.4 业务代码层约束（P0，不可破坏）

- ❌ 禁止在 `.tsx` / `.vue` 业务组件里新增硬编码色值（如 `color: '#5E6AD2'`）
- ❌ 禁止在业务组件 style 里引用 DESIGN.md 的色板字符串（应通过 token 变量间接引用）
- ❌ 禁止自行给 Button/Card/Modal 等组件加 `style={{ background: ... }}` 覆盖
- ✅ 业务代码视觉来源 = AntD / ElementPlus 的组件默认值 × token 主题文件
- ✅ 需要品牌化色块时，使用主题文件里预定义的 token（如 `token.colorPrimary`）

---

## 步骤 5：主题遵从度审查（追加）

**触发条件**：`selectedBrandId` 不为 null。

### 5.1 新增审查项（合并到 self-review-checklist.md P1 层）

- [ ] **主题文件已生成且内容完整**
  - FAIL 条件：缺少 `src/theme/token.ts`（React）/ `src/theme/vars.scss`（Vue）/ `tailwind.config.ts` 扩展（Tailwind），或 `colorPrimary` 为空
- [ ] **业务代码未硬编码色值**
  - FAIL 条件：`src/pages/**/*.{tsx,vue,less,scss}` 中出现与 DESIGN.md 色板冲突的硬编码色值（如 `#xxxxxx` 不落在调色板内）
- [ ] **ConfigProvider / main.ts 已接入主题**
  - FAIL 条件：React 项目未在 `ConfigProvider` 绑定 `designMdToken`；Vue 项目未 `import '@/theme/vars.scss'`
- [ ] **项目根 DESIGN.md 已生成**
  - FAIL 条件：项目根缺少 `DESIGN.md`

### 5.2 允许通过的灰色地带

- 业务代码中合理使用 AntD 内置 token CSS 变量（如 `var(--ant-color-primary)`）→ PASS
- 状态标签用 AntD Tag 默认色系（green/orange/red）→ PASS（不强制全部来自调色板）
- 图表组件（ECharts/AntV）使用自定义色板 → PASS（图表色板独立于 UI 色板）

---

## 用户交互提示语（标准话术）

Agent 在各节点的标准话术，保持简洁、不冗长：

| 场景 | 话术 |
|------|------|
| 进入 2.5（远程加载索引中） | _"正在从 getdesign.md 获取最新设计库..."_ |
| 索引远程成功 | 直接进入推荐，无额外提示 |
| 索引远程失败 + 本地有缓存 | _"远程设计库不可达，已使用本地缓存（last updated: YYYY-MM-DD）"_ |
| 索引远程失败 + 本地无缓存 | _"设计库当前无法加载，已跳过推荐。可联网后重试。"_（并跳过 2.5） |
| 推荐产出 | _"为你推荐 3 套设计风格，可选择或使用默认样式"_ |
| 用户选择 [D] 默认 | _"已采用 Ant Design 默认主题，开始生成业务代码"_ |
| 用户选择某品牌 | _"已选定 <品牌名>，正在获取最新设计规范..."_ |
| DESIGN.md 远程抓取中 | _"从 getdesign.md 拉取 <品牌> 最新设计规范..."_ |
| DESIGN.md 远程成功 | 直接继续，无额外提示 |
| DESIGN.md 远程失败 + 本地有缓存 | _"远程 <品牌> 设计系统不可达，已使用本地缓存"_ |
| DESIGN.md 远程失败 + 本地无缓存 | _"<品牌> 设计系统加载失败（远程不可达且无本地缓存），已回落为默认 Ant Design 样式"_ |
| 完成 | _"已生成 src/theme/<文件> 和项目根 DESIGN.md，业务代码视觉已接入 <品牌> 主题"_ |

---

## 增量修改模式下的设计系统处理

### 场景：已有主题，用户新增页面

- **不重新触发推荐**，沿用项目根 `DESIGN.md` 对应的品牌
- 步骤 4 生成新页面时，业务代码仍然零视觉硬编码，自动享用已接入的主题

### 场景：用户主动要求换肤

- 触发关键词：_"换主题 / 换风格 / 套用 XX 风格 / 换肤"_
- 跳转 2.5 节点重新推荐
- 步骤 4 只重写 `src/theme/<文件>` 和项目根 `DESIGN.md`，**业务代码不动**

### 场景：用户要求去掉设计系统

- 触发关键词：_"回到默认 / 去掉主题 / 取消设计系统"_
- 删除 `src/theme/<文件>` 和项目根 `DESIGN.md`
- 移除 `ConfigProvider theme` 绑定（React）或 `import` 引用（Vue）

---

## 指令速查

| 用户指令 | Agent 行为 |
|---------|-----------|
| `刷新设计库` / `更新设计库` | 强制重抓 `https://getdesign.md/` 首页 → 覆盖 `index.json`（用于非设计链路启用场景下的主动更新） |
| `查看可用设计风格` / `列出设计库` | 远程优先加载索引并展示 brands 列表（带 previewColor 色块）；远程失败时用本地缓存 |
| `用 <品牌> 风格做 <需求>` | 强触发：跳过 2.5 推荐对话，直接进入 3.5（远程优先抓 DESIGN.md） |
| `设计参考 <本地 DESIGN.md 路径>` | 强触发：使用本地 DESIGN.md，跳过 2.5 和 3.5 抓取 |
| `换成 <品牌> 风格` | 进入换肤流程（见增量修改），同样远程优先加载 |
| `回到默认` | 移除主题层和项目根 DESIGN.md |
| `强制使用缓存` / `离线模式` | 跳过远程抓取，仅使用本地 `index.json` 和本地 `<brand>/DESIGN.md` |

---

## 禁止行为总清单（跨步骤 P0）

1. ❌ 推荐 `index.json` 外的品牌
2. ❌ 在业务代码 `.tsx` / `.vue` / 业务 `.less` 里硬编码 DESIGN.md 的色值 / 字体 / 圆角
3. ❌ 在业务代码里新增超出 DESIGN.md 规定的 motion / 动画
4. ❌ 无 `selectedBrandId` 却生成主题文件
5. ❌ 抓取失败时继续以"脑补的" DESIGN.md 生成主题文件
6. ❌ 破坏现有 SKILL 的 P0 约束（禁止过度设计、禁止 mock、hooks 优先等）
