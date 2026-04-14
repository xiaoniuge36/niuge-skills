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

## Profile 说明

React 模板默认对应 `ui-profiles/react-antdpro.json`。视觉边界、禁止过度设计、类型与生成顺序等通用规则统一以 [code-standards.md](./code-standards.md) 为准，本文件只补充 React + Ant Design Pro 的特有实践。

## 组件优先级

生成 React 代码时，**必须**使用 Pro Components，严禁手写基础组件：

| 场景 | 必须使用 | 严禁手写 |
|------|---------|---------|
| 数据表格 | `ProTable`（request 模式） | `Table` + 手动分页/搜索/loading |
| 弹窗表单 | `ModalForm` | `Modal` + `Form` 组合 |
| 抽屉表单 | `DrawerForm` | `Drawer` + `Form` 组合 |
| 表单控件 | `ProFormText/Select/Date` | `Form.Item` + `Input/Select` |
| 搜索栏 | ProTable 内置 `search` | 手动拼 `<Form>` + `<Row>` + `<Col>` |
| 动态表单 | `BetaSchemaForm` | 手动拼接 |
| 描述列表 | `ProDescriptions` | `Descriptions` |
| 状态渲染 | columns `valueEnum` + `status` | 手写 `<Tag>` + 自定义颜色 |

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

### 强制使用 request 模式

**严禁** `dataSource={data}` + `loading={loading}` 的写法。ProTable 必须通过 `request` 属性获取数据，内置自动管理 loading、分页、搜索参数。

```tsx
<ProTable<DataItem>
  headerTitle="数据管理"
  columns={columns}
  actionRef={actionRef}
  rowKey="id"
  request={async (params, sort, filter) => {
    const { current: pageNum, pageSize, ...searchParams } = params;
    const res = await fetchList({ pageNum, pageSize, ...searchParams });
    return {
      data: res.data.list,
      total: res.data.total,
      success: true,
    };
  }}
  search={{ labelWidth: 'auto', span: 8 }}
  pagination={{ defaultPageSize: 10, showSizeChanger: true }}
/>
```

### 禁止清单

| 禁止写法 | 原因 |
|----------|------|
| `dataSource={xxx}` | ProTable 退化为普通 Table，失去 request 能力 |
| `search={false}` + 手动 `<Form>` | 破坏 ProTable 内置搜索体系 |
| `options={false}` | 移除内置工具栏（刷新/密度/列设置） |
| `toolbar={{ title: <长段描述> }}` | 添加不必要的装饰文案 |
| 手写 `<Tag>` 渲染状态列 | 应使用 valueEnum + status |

### columns 配置模式

```tsx
const columns: ProColumns<DataItem>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      enabled: { text: '启用', status: 'Success' },
      disabled: { text: '禁用', status: 'Default' },
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
    width: 150,
    render: (_, record) => [
      <a key="edit" onClick={() => handleEdit(record)}>编辑</a>,
      <a key="delete" onClick={() => handleDelete(record.id)}>删除</a>,
    ],
  },
];
```

### columns 搜索控制

通过 columns 属性控制哪些字段出现在搜索栏，**不要手动拼 Form**：

| 属性 | 说明 |
|------|------|
| `hideInSearch: true` | 该列不出现在搜索栏 |
| `hideInTable: true` | 该列不出现在表格 |
| `valueType: 'select'` | 搜索栏自动渲染为下拉 |
| `valueEnum` | 同时控制搜索栏下拉和表格标签渲染 |
| `fieldProps` | 配置搜索栏控件属性（placeholder 等） |

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
