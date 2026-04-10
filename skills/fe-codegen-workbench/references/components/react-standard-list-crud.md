# react-standard-list-crud

**标准列表页（ProTable + 搜索 + CRUD 弹窗）**

适用场景：搜索+表格+新增/编辑/删除

关键词：列表、列表页、表格、搜索、查询、新增、编辑、删除、批量、ProTable、CRUD、增删改查

排除词：导入、xlsx、excel、详情页、单据详情

## 目录结构

```
[page-name]/
├── components/
│   └── EditModal.tsx        # 编辑弹窗
├── hooks/
│   ├── index.ts
│   └── useTableData.ts      # 表格数据管理
├── types.ts
├── index.less
└── index.tsx                 # ProTable 主页面
```

## 核心代码模式

```tsx
// hooks/useTableData.ts
export const useTableData = () => {
  const actionRef = useRef<ActionType>();

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除？',
      onOk: async () => {
        await deleteItem(id);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  return { actionRef, handleDelete };
};

// index.tsx
<ProTable<ItemType>
  columns={columns}
  actionRef={actionRef}
  request={async (params) => {
    const res = await fetchList(params);
    return { data: res.data.list, total: res.data.total, success: true };
  }}
  rowKey="id"
  search={{ labelWidth: 'auto', span: 8 }}
  toolBarRender={() => [
    <Button type="primary" onClick={() => setEditVisible(true)}>新增</Button>,
  ]}
/>
```
