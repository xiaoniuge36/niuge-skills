# webapp-testing

这是一个从 Anthropic 官方仓库同步到本仓库的 Web 应用测试 skill，核心定位是通过 Playwright 驱动本地前端应用，完成自动化测试、交互排查、截图和日志采集。

## 适用场景

- 验证本地 Web 页面核心交互是否正常
- 跑一遍回归流程，快速发现 UI 或行为问题
- 采集浏览器截图、控制台日志、页面结构
- 联合本地启动脚本执行端到端测试

## 上游来源

- 仓库：`https://github.com/anthropics/skills`
- 分支：`main`
- 路径：`skills/webapp-testing`

## 本地保留文件

下面这些文件由本仓库维护，不会在同步时被上游覆盖：

- `README.md`
- `agents/agent.yaml`
- `agents/openai.yaml`

## 如何同步更新

在仓库根目录执行：

```bash
node scripts/sync-upstream-skills.mjs --skill webapp-testing
```

如果要同步全部上游 skills：

```bash
node scripts/sync-upstream-skills.mjs
```

## 说明

- 上游托管文件包括 `SKILL.md`、`LICENSE.txt`、`scripts/`、`examples/`
- 本地中文说明只服务于仓库维护和阅读，不参与 skill 触发

