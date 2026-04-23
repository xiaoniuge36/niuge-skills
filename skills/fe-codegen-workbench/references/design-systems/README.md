# design-systems 目录

本目录存放 **DESIGN.md 设计系统**的本地索引与按需缓存，供 `fe-codegen-workbench` 步骤 2.5（设计推荐）与步骤 3.5（DESIGN.md 加载）使用。

上游来源：[getdesign.md](https://getdesign.md/)

完整集成规则请阅读：[../design-md-integration.md](../design-md-integration.md)

---

## 目录结构

```
references/design-systems/
├── README.md                 ← 本文件
├── index.json                ← 薄索引（品牌列表，只存 name/tagline/previewColor/detailUrl）
├── <brand-id>/               ← 按需生成（用户选定某品牌后首次加载时）
│   └── DESIGN.md             ← 从 getdesign.md 抓取的完整设计规范
└── ...
```

## index.json 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `id` | ✅ | 品牌唯一标识，与 getdesign.md URL 路径一致（如 `linear.app` → id 为 `linear`） |
| `name` | ✅ | 品牌显示名 |
| `tagline` | ✅ | 一句话设计风格描述（来自 getdesign.md），Agent 推荐匹配的核心依据 |
| `detailUrl` | ✅ | 完整 DESIGN.md 的抓取地址 |
| `previewColor` | ✅ | 品牌主色（HEX），用于推荐展示时给用户直观预览 |

**刻意不存**：tags / category / industry / 颜色调色板 / 字体等。这些信息要么冗余、要么应该从 DESIGN.md 本身读取，不在索引层维护。

## 索引加载策略（远程优先 + 本地降级）

DESIGN.md 链路默认处于**有网环境**，索引和 DESIGN.md 均**优先从远程拉取**，保证用户拿到最新设计系统。本地文件只是断网 / 远程故障时的兜底缓存，**不是事实来源**。

| 状态 | 触发时机 | 动作 |
|------|---------|------|
| **远程优先** | 步骤 2.5 进入时 | 从 `https://getdesign.md/` 抓取最新品牌列表 → **覆盖** `index.json` |
| **本地降级 1** | 远程抓取失败（超时/不可达） + 本地 `index.json` 存在 | 读本地缓存使用，并向用户输出 warning _"远程设计库不可达，使用本地缓存（last updated: ...）"_ |
| **本地降级 2** | 远程抓取失败 + 本地缓存缺失 | 静默跳过步骤 2.5，等同默认 AntD |
| **任务内缓存命中** | 同一生成任务内已成功抓取过 | 直接复用当次抓取结果，不重复请求 |
| **跨任务** | 用户开启新的生成任务 | 重新从远程抓取（不沿用上次的任务内缓存） |
| **强制刷新** | 用户显式说 `刷新设计库` / `更新设计库` | 立即重抓远程覆盖 `index.json`（可用于主动更新） |
| **强制离线** | 用户说 `离线模式` / `强制使用缓存` | 跳过远程抓取，直接用本地缓存；本地缺失则跳过步骤 2.5 |

> **TTL 字段已不作为"是否使用远程"的判据**。保留 `updatedAt` / `ttlDays` 字段仅用于向用户展示 _"本地缓存 last updated: XXX"_ 信息，以及在断网降级时帮助判断缓存新旧程度。

## 单个 DESIGN.md 缓存策略（远程优先 + 本地降级）

| 状态 | 触发时机 | 动作 |
|------|---------|------|
| **远程优先** | 步骤 3.5 进入时，`selectedBrandId` 非空 | 从 `index.json[brandId].detailUrl` 抓取最新 DESIGN.md → **覆盖** `<brand-id>/DESIGN.md` |
| **本地降级 1** | 远程抓取失败 + 本地 `<brand-id>/DESIGN.md` 存在 | 使用本地缓存，并向用户输出 warning _"远程 <brand> 设计系统不可达，使用本地缓存"_ |
| **本地降级 2** | 远程抓取失败 + 本地缓存缺失 | 静默降级为默认 AntD，跳过主题层与主题审查 |
| **本地路径模式** | 用户提供 `designMdPath`（非品牌名） | 直接读本地文件，不走远程 |

- 抓取超时阈值 ≤ 10 秒；超时视为失败立即降级
- 抓取成功**必须同步覆盖**本地缓存（保持本地始终对应最后一次成功的远程抓取）
- 不预下载（不批量抓 69 个品牌的 DESIGN.md），仅在用户选定品牌时按需拉取

## 扩展/新增品牌

**场景一：getdesign.md 新增了品牌**

```
1. 用户说 "刷新设计库"
2. Agent 抓取 https://getdesign.md/ 首页
3. 解析品牌卡片（brand name + tagline + detail URL）
4. 新增 id、复用 previewColor 占位（可从 DESIGN.md 里回填）
5. 保留旧品牌条目，避免破坏已有项目引用
```

**场景二：手工新增（非 getdesign.md 来源）**

允许，但必须保持字段完整：`id` / `name` / `tagline` / `detailUrl` / `previewColor` 五个字段齐全。`detailUrl` 可指向自己维护的 DESIGN.md。

## 注意事项

- `index.json` 的 `tagline` **必须是英文**（Agent 匹配依赖的源语义层），展示时可由 Agent 自行翻译
- 不得在 `index.json` 里写色板、字体等详细规范，避免索引膨胀；详细规范一律去 `<brand-id>/DESIGN.md` 里读
- **远程优先**：索引和 DESIGN.md 都优先从 `https://getdesign.md/` 实时抓取；本地缓存仅用于断网/故障降级
- **任务内单次抓取**：同一个生成任务内同一资源只抓一次，不重复发起请求
- **跨任务总是重拉**：每次进入新的生成任务时，对索引和涉及的 DESIGN.md 重新抓取，保证与上游保持一致
- 所有抓取行为必须具有"失败即降级"语义，不得阻塞工作台主流程
- 对用户暴露的 warning 必须明确指出 _"使用本地缓存"_ 或 _"已降级为默认"_，避免用户误以为拿到的是最新设计
