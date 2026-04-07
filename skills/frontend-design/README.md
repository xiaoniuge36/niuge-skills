# frontend-design

这是一个从 Anthropic 官方仓库同步到本仓库的前端设计 skill，用来帮助 Agent 生成更有设计感、更有辨识度的前端页面和组件，而不是常见的模板化 AI UI。

## 适用场景

- 从零搭建 landing page、活动页、官网页、后台页面
- 对现有页面做视觉升级或重构
- 生成更有明确风格方向的 React、HTML、CSS 前端代码

## 上游来源

- 仓库：`https://github.com/anthropics/skills`
- 分支：`main`
- 路径：`skills/frontend-design`

## 本地保留文件

下面这些文件由本仓库维护，不会在同步时被上游覆盖：

- `README.md`
- `agents/agent.yaml`
- `agents/openai.yaml`

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

- 上游托管文件主要是 `SKILL.md` 和 `LICENSE.txt`
- 本地中文说明只服务于仓库维护和阅读，不参与 skill 触发

