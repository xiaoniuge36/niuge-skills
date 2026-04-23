# 自检清单

用于未接入 `code-review-expert` 时的结构化 PASS/FAIL 复核。

## 使用方式

1. 逐项判断 PASS / FAIL
2. 对 FAIL 项给出具体文件与原因
3. 先修复 P0 / P1，再输出自检报告

## P0

- [ ] 全局类型未被重复 import
  - FAIL 条件：`global.d.ts` 中已声明的类型仍在页面、hooks、组件里显式 import
- [ ] hooks / composables 先于组件生成
  - FAIL 条件：组件内直接承担主要数据获取、提交或批量逻辑
- [ ] 禁止 mock 数据
  - FAIL 条件：存在 `localStorage`、`sessionStorage`、内存数组、伪接口、硬编码示例数据充当真实数据源
- [ ] 模板匹配已落到主模板
  - FAIL 条件：未说明 `primaryTemplateId`，或代码结构明显脱离命中的模板目录
- [ ] React 列表页使用 `ProTable.request`
  - FAIL 条件：出现 `dataSource` + 手动 `loading` 的列表主实现
- [ ] 搜索区使用内置能力
  - FAIL 条件：React 列表页手写 `<Form>` 替代 ProTable `search`
- [ ] 视觉未越界
  - FAIL 条件：私自加入统计卡片、hero、渐变、毛玻璃、大圆角、自定义品牌皮肤

## P1

- [ ] 生成了必要的 Service 层
  - FAIL 条件：用户未提供接口文件，但页面缺少 API 调用骨架
- [ ] 组合模板已正确叠加
  - FAIL 条件：需求包含导入/上传/批量编辑，但未接入对应组合模板
- [ ] 命名符合一致性锚点
  - FAIL 条件：与注册表 `consistencyAnchors` 冲突，且无项目内既有规范作为理由
- [ ] 未残留调试代码
  - FAIL 条件：存在 `console.log`、`debugger`、注释掉的临时代码
- [ ] 未滥用 `any`
  - FAIL 条件：可显式定义类型的地方仍使用 `any`
- [ ] **主题文件已生成**（仅当 `selectedBrandId` 非空）
  - FAIL 条件：缺少 `src/theme/token.ts`（React）/ `src/theme/vars.scss`（Vue3）/ `tailwind.config.ts` 扩展（Tailwind），或 `colorPrimary` 为空
- [ ] **ConfigProvider / main.ts 已接入主题**（仅当 `selectedBrandId` 非空）
  - FAIL 条件：React 项目未在 `ConfigProvider` 绑定主题 token；Vue 项目未 `import '@/theme/vars.scss'`
- [ ] **项目根 DESIGN.md 已生成**（仅当 `selectedBrandId` 非空）
  - FAIL 条件：项目根缺少 `DESIGN.md` 副本
- [ ] **业务代码未硬编码 DESIGN.md 色值/字体**（仅当 `selectedBrandId` 非空）
  - FAIL 条件：`src/pages/**/*.{tsx,vue,less,scss}` 中出现硬编码色值/字体，不通过主题 token 间接引用

## P2

- [ ] 目录结构与目标框架一致
  - FAIL 条件：Umi / Next / Vue 项目的页面目录、路由组织不符合框架惯例
- [ ] 差异修改范围受控
  - FAIL 条件：修改已有页面时重写了整个文件，而不是最小改动
- [ ] 参考页面已被对齐
  - FAIL 条件：用户提供 `参考页面`，但目录组织、命名、分层完全未参考
- [ ] 错误恢复路径清晰
  - FAIL 条件：模板误命中或生成不满意时，没有说明如何重走步骤

## 报告模板

```markdown
## 自检结果

### PASS
- ...

### FAIL
- [P0] src/pages/user/list/index.tsx: 使用了 dataSource 而不是 ProTable request
- [P1] src/pages/user/list/: 缺少导入弹窗组合模板

### 后续动作
- 先修复 P0 / P1，再重新执行本清单
```
