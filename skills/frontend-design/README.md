# frontend-design

这是一个基于 Anthropic 官方 `frontend-design` skill 做本地增强的前端设计 skill，用来帮助 Agent 生成更有设计感、更有辨识度的前端页面和组件，而不是常见的模板化 AI UI。

## 适用场景

- 从零搭建 landing page、活动页、官网页、后台页面
- 对现有页面做视觉升级或重构
- 生成更有明确风格方向的 React、HTML、CSS 前端代码

## 本地增强

当前版本额外吸收了 `Lucent-Snow/anti-default-output` 里“先识别默认输出，再主动偏离”的方法论，重点补了两类能力：

- 在开始设计前先做一次 `anti-default pass`，显式识别常见 AI 前端默认套路
- 增加前端场景下的默认输出陷阱清单，帮助在收尾前把“安全但没味道”的方案拉开

## 参考来源

- 基础版本：`https://github.com/anthropics/skills` -> `skills/frontend-design`
- 增强参考：`https://github.com/Lucent-Snow/anti-default-output`

## 本地保留文件

下面这些文件由本仓库维护，不会在同步时被上游覆盖：

- `README.md`
- `agents/agent.yaml`
- `agents/openai.yaml`
- `references/frontend-default-traps.md`

## 如何同步更新

在仓库根目录执行：

```bash
node scripts/sync-upstream-skills.mjs --skill frontend-design
```

如果要同步全部上游 skills：

```bash
node scripts/sync-upstream-skills.mjs
```

## 说明

- `LICENSE.txt` 仍来自上游 Anthropic skill
- `SKILL.md` 已加入本地增强，不建议无差别覆盖；后续同步 Anthropic 版本时应先对比再合并
- 本地中文说明与 `references/` 只服务于仓库维护和阅读，不参与 skill 触发

