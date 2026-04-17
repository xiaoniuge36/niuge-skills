# architecture-diagram-generator

这是一个从 `Cocoon-AI/architecture-diagram-generator` 接入到本仓库的架构图生成 skill，用来帮助 Agent 结合代码、文档和上下文生成系统架构图。

## 适用场景

- 需要快速梳理项目的模块关系、调用链或系统边界
- 想基于现有代码和说明材料产出架构图
- 需要给评审、文档或交接准备可视化的技术结构说明

## 本地增强

- 默认生成简体中文架构图
- 默认将标题、图例、卡片摘要、页脚等可见文案输出为中文
- 只有在用户明确要求英文或双语时，才切换输出语言

## 上游来源

- 仓库：`https://github.com/Cocoon-AI/architecture-diagram-generator`
- 分支：`main`
- 路径：`architecture-diagram`

## 本地保留文件

下面这些文件由本仓库维护，不会在同步时被上游覆盖：

- `README.md`
- `agents/agent.yaml`
- `agents/openai.yaml`

## 如何同步更新

在仓库根目录执行：

```bash
node scripts/sync-upstream-skills.mjs --skill architecture-diagram-generator
```

如果要同步全部上游 skills：

```bash
node scripts/sync-upstream-skills.mjs
```

## 说明

- 上游托管文件会同步到 `skills/architecture-diagram-generator/`
- 本地中文说明只服务于仓库维护和阅读，不参与 skill 触发
