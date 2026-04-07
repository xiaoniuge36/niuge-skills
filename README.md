# niuge-skills

一个持续扩展中的 AI Agent Skills 仓库。

## Skills 列表

| Skill | 说明 |
|---|---|
| [Code Review Expert](./skills/code-review-expert/) | 用于审查 diff、PR、staged changes 和提交改动的结构化代码审查 Skill，重点覆盖合并风险、安全问题和测试缺口 |
| [Frontend Design](./skills/frontend-design/) | 从 Anthropic 同步的前端设计 Skill，用于生成更有设计感和辨识度的前端页面、组件与视觉重构方案 |
| [Webapp Testing](./skills/webapp-testing/) | 从 Anthropic 同步的前端测试 Skill，基于 Playwright 驱动本地 Web 应用并完成交互验证、截图和日志采集 |
| [Find Skills](./skills/find-skills/) | 从 Vercel Labs 同步的技能发现 Skill，用于根据任务场景搜索、评估并推荐可安装的 skills |

## 说明

- 当前仓库添加的第一个 Skill 是 `code-review-expert`。
- 这一版基于 `sanyuan-skills` 的实现做了增强，重点优化了触发覆盖、审查范围判定和测试缺口识别。
- `frontend-design`、`webapp-testing`、`find-skills` 为上游同步型 skills，本仓库额外补充了中文 README 和 `agents/` 元数据。

## 同步上游 Skills

同步全部已接入的上游 skills：

```bash
node scripts/sync-upstream-skills.mjs
```

只同步某一个 skill：

```bash
node scripts/sync-upstream-skills.mjs --skill frontend-design
node scripts/sync-upstream-skills.mjs --skill webapp-testing
node scripts/sync-upstream-skills.mjs --skill find-skills
```

