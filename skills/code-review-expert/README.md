# Code Review Expert

这是一个给人看的中文说明文件，用来帮助理解这个 skill 的结构、逻辑和使用方式。

## 会不会影响使用

不会。

这个 skill 真正影响触发和运行的核心文件是：

- `SKILL.md`
- `agents/openai.yaml`
- `agents/agent.yaml`
- `references/` 下按需加载的检查清单

`README.md` 主要是给人阅读和维护用的，不参与 skill 的自动触发判断。正常情况下，它不会影响安装、调用和使用。

## 这个 skill 是怎么工作的

可以把它理解成两层：

1. `SKILL.md` 是总控文件
2. `references/` 是按主题拆开的专项检查单

也就是说，`SKILL.md` 负责回答：

- 什么时候触发这个 skill
- 先看什么，后看什么
- 输出格式是什么
- 哪些 reference 需要优先加载

而 `references/` 负责回答：

- 安全要看什么
- 代码质量要看什么
- 测试缺口怎么判断
- 设计和 SOLID 问题怎么判断
- 死代码和废弃逻辑怎么给出删除建议

## 文件关系

### 1. `SKILL.md`

这是 skill 的主入口。

它主要负责：

- 定义触发描述
- 定义 review scope
- 规定 review workflow
- 规定 findings-first 的输出格式
- 指定 `review-flow.md` 必须最先加载

简单说，`SKILL.md` 决定“这次 review 怎么走流程”。

### 2. `references/review-flow.md`

这是第一个要读的 reference。

它是调度文件，负责：

- 确定 review 范围
- 根据 diff 大小决定 review 策略
- 指导如何补上下文
- 决定优先检查哪些高风险区域

简单说，它决定“先从哪里下手”。

### 3. `references/security-checklist.md`

这份文件专门处理安全和高风险稳定性问题，比如：

- 权限
- secrets
- 外部调用
- 注入风险
- 并发和数据一致性

当改动涉及登录、权限、支付、文件处理、外部请求时，这份文件很关键。

### 4. `references/code-quality-checklist.md`

这份文件负责更广义的代码质量判断，比如：

- 正确性
- 异常处理
- 边界条件
- 性能
- 兼容性
- 可观测性

它更像“通用质量检查单”。

### 5. `references/testing-checklist.md`

这份文件专门判断测试缺口。

它关心的不是“有没有测试”这么简单，而是：

- bug fix 有没有补回归测试
- 高风险路径是不是只测了 happy path
- 公共契约变更有没有对应的集成测试

它是一个横切模块，很多变更都应该顺手看它。

### 6. `references/solid-checklist.md`

这份文件偏设计和架构，主要看：

- 单一职责
- 抽象边界
- 接口是否过宽
- 依赖方向是否变差
- 当前改动是不是让后续演进更困难

它不一定直接找出线上 bug，但能发现设计退化。

### 7. `references/removal-plan.md`

这份文件不是每次都用。

只有在 review 过程中发现这些情况时才会用：

- 死代码
- 旧 feature flag
- 废弃逻辑
- 已被替代的实现

它的作用不是“找问题”，而是“组织删除建议”。

## 实际执行逻辑

这个 skill 的实际调用顺序大致是：

1. 先进入 `SKILL.md`
2. 根据用户请求确定 review 范围
3. 先加载 `references/review-flow.md`
4. 再按改动内容选择其他 reference
5. 把发现的问题按 `P0` 到 `P3` 分类
6. 按 `SKILL.md` 规定的格式输出 findings
7. 最后停下来，等待用户决定是否修复

## 一个简单例子

如果改动是“登录接口 + token 校验”：

- 先看 `review-flow.md`
- 再重点看 `security-checklist.md`
- 同时看 `code-quality-checklist.md`
- 如果行为变了，再看 `testing-checklist.md`

如果改动是“service 重构 + 抽象调整”：

- 先看 `review-flow.md`
- 再重点看 `solid-checklist.md`
- 同时看 `code-quality-checklist.md`
- 如果逻辑变了，再看 `testing-checklist.md`

## 为什么要这样拆

这样拆的好处是：

- `SKILL.md` 保持短，适合当作总控入口
- `references/` 分主题组织，不会把所有规则挤进一个文件
- 真正使用时只加载相关 reference，减少上下文噪音
- 后续维护时，可以单独优化某个检查维度，而不用重写整个 skill

## 什么时候改 README，什么时候改 SKILL

改 `README.md`：

- 想给人看说明
- 想帮助团队理解结构
- 想补充维护文档

改 `SKILL.md`：

- 想改变触发逻辑
- 想调整 review 流程
- 想改变输出格式
- 想改变 reference 的加载规则

改 `references/`：

- 想强化某类审查能力
- 想补充某个主题下的检查点
- 想提升某个专项维度的覆盖率

## 建议

如果这个仓库以后主要是你自己和团队一起维护，保留这个中文 `README.md` 是有价值的。

如果以后你希望这个 skill 更“纯粹”地作为机器可消费的 skill 包，也可以保留 `README.md`，只是把它视为人类维护文档，而不是 skill 运行逻辑的一部分。
