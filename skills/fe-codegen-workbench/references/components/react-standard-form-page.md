# react-standard-form-page

**独立表单页（路由页面新增/编辑）**

适用场景：>20 字段的复杂表单

关键词：表单、表单页、新增页面、编辑页面、保存、提交、校验、路由参数、id

排除词：导入、excel、xlsx、列表、表格

## 目录结构

```
[page-name]/components/edit/
├── hooks/
│   ├── index.ts
│   └── useEditForm.ts       # 表单逻辑（必须先生成）
├── index.tsx
└── index.less
```
