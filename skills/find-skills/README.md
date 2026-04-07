# find-skills

这是一个从 Vercel Labs 官方仓库同步到本仓库的技能搜索 skill，用来帮助 Agent 根据需求发现合适的 skills，并给出推荐理由、来源和安装命令。

## 适用场景

- 需要为某类任务查找现成的 Agent skill
- 想补充某个领域能力，但暂时不知道有哪些成熟 skill
- 希望快速对比不同 skill 的来源、安装方式和可靠性

## 上游来源

- 仓库：`https://github.com/vercel-labs/skills`
- 分支：`main`
- 路径：`skills/find-skills`

## 本地保留文件

下面这些文件由本仓库维护，不会在同步时被上游覆盖：

- `README.md`
- `agents/agent.yaml`
- `agents/openai.yaml`

## 如何同步更新

在仓库根目录执行：

```bash
node scripts/sync-upstream-skills.mjs --skill find-skills
```

如果要同步全部上游 skills：

```bash
node scripts/sync-upstream-skills.mjs
```

## 说明

- 上游托管文件主要是 `SKILL.md`
- 本地中文说明只服务于仓库维护和阅读，不参与 skill 触发

