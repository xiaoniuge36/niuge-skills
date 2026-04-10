# React + Ant Design Pro 知识库

生成 React 代码时必须参考本文件，确保代码质量和最佳实践。

## 核心依赖

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "antd": "^5.x",
  "@ant-design/pro-components": "^2.x",
  "@ant-design/icons": "^5.x",
  "react-router-dom": "^6.x",
  "typescript": "^5.x"
}
```

## 组件优先级

生成 React 代码时，优先使用 Pro Components，避免手写基础组件：

| 场景 | 优先使用 | 避免手写 |
|------|---------|---------|
| 数据表格 | `ProTable` | `Table` + 手动分页/搜索 |
| 弹窗表单 | `ModalForm` | `Modal` + `Form` 组合 |
| 抽屉表单 | `DrawerForm` | `Drawer` + `Form` 组合 |
| 表单控件 | `ProFormText/Select/Date` | `Form.Item` + `Input/Select` |
| 动态表单 | `BetaSchemaForm` | 手动拼接 |
| 描述列表 | `ProDescriptions` | `Descriptions` |

## React 性能最佳实践

### 消除异步瀑布流（CRITICAL）

```tsx
// ❌ 串行请求
const userList = await fetchUsers();
const roleList = await fetchRoles();

// ✅ 并行请求
const [userList, roleList] = await Promise.all([
  fetchUsers(),
  fetchRoles(),
]);
```

### 包体积优化（CRITICAL）

```tsx
// ❌ 全量导入
import { Button, Table, Form, Input, Select, Modal } from 'antd';

// ✅ 按需导入（antd v5 已支持 tree-shaking，但仍建议精确导入）
import { Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
```

### 重渲染优化（MEDIUM）

```tsx
// ❌ 内联对象导致子组件重渲染
<ProTable search={{ labelWidth: 'auto', span: 8 }} />

// ✅ 提取为常量或 useMemo
const searchConfig = useMemo(() => ({ labelWidth: 'auto', span: 8 }), []);
<ProTable search={searchConfig} />
```

### 状态管理

```tsx
// ❌ 状态提升过高
// 在顶层组件管理所有子组件状态

// ✅ 状态就近原则
// 弹窗内部管理自己的表单状态
// 列表页管理搜索和分页状态
```

## ProTable 最佳实践

### columns 配置模式

```tsx
const columns: ProColumns<DataItem>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
    formItemProps: { rules: [{ required: true }] },
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      0: { text: '禁用', status: 'Default' },
      1: { text: '启用', status: 'Success' },
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
    hideInSearch: true,
    sorter: true,
  },
  {
    title: '操作',
    valueType: 'option',
    width: 180,
    render: (_, record) => [
      <a key="edit" onClick={() => handleEdit(record)}>编辑</a>,
      <a key="delete" onClick={() => handleDelete(record.id)}>删除</a>,
    ],
  },
];
```

### request 标准模式

```tsx
request={async (params, sort, filter) => {
  const { current: pageNum, pageSize, ...searchParams } = params;
  const res = await fetchList({ pageNum, pageSize, ...searchParams });
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
}}
```

## Hooks 设计模式

### 自定义 Hook 命名规范

| Hook | 用途 | 文件 |
|------|------|------|
| `useTableData` | 表格数据管理 | `hooks/useTableData.ts` |
| `useDetailData` | 详情数据获取 | `hooks/useDetailData.ts` |
| `useEditForm` | 编辑表单逻辑 | `hooks/useEditForm.ts` |
| `useBatchForm` | 批量操作逻辑 | `hooks/useBatchForm.ts` |

### Hook 返回值规范

```tsx
export const useTableData = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<string>();

  const handleEdit = (record: DataItem) => {
    setEditId(record.id);
    setEditVisible(true);
  };

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

  const handleEditSuccess = () => {
    setEditVisible(false);
    setEditId(undefined);
    actionRef.current?.reload();
  };

  return {
    actionRef,
    editVisible,
    editId,
    handleEdit,
    handleDelete,
    handleEditSuccess,
    setEditVisible,
  };
};
```

## 错误边界

```tsx
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Result status="error" title="页面出错了" extra={<Button onClick={() => window.location.reload()}>刷新页面</Button>} />;
    }
    return this.props.children;
  }
}
```

## 路由规范

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const ListPage = lazy(() => import('./pages/list'));
const DetailPage = lazy(() => import('./pages/list/components/detail'));

const router = createBrowserRouter([
  {
    path: '/module',
    children: [
      { index: true, element: <Suspense fallback={<Spin />}><ListPage /></Suspense> },
      { path: 'detail/:id', element: <Suspense fallback={<Spin />}><DetailPage /></Suspense> },
    ],
  },
]);
```
