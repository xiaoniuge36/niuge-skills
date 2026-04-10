# react-standard-list-crud

**标准列表页（ProTable + 搜索 + CRUD 弹窗）**

适用场景：搜索+表格+新增/编辑/删除

关键词：列表、列表页、表格、搜索、查询、新增、编辑、删除、批量、ProTable、CRUD、增删改查

排除词：导入、xlsx、excel、详情页、单据详情

## 目录结构

```
[page-name]/
├── components/
│   └── EditModal.tsx        # 编辑弹窗（字段 < 10 时用 ModalForm）
├── hooks/
│   ├── index.ts             # 统一导出
│   └── useTableData.ts      # 表格数据管理
├── types.ts                 # 类型定义
├── index.less               # 仅写必要的业务样式覆盖
└── index.tsx                # ProTable 主页面
```

## 强制约束（生成时必须遵循）

1. **ProTable 必须使用 `request` 模式**，严禁 `dataSource` + 手动 loading
2. **搜索栏必须使用 ProTable 内置 `search`**，严禁手动拼 `<Form>`
3. **状态列必须用 `valueEnum`**，严禁手写 `<Tag>` 渲染
4. **index.less 只写必要覆盖**，不得自定义页面背景、字体、大面积阴影
5. **不得添加用户未要求的功能模块**（统计卡片、描述文案、装饰标签等）
6. **Service 调用使用真实 API 骨架**，严禁 localStorage/内存模拟

## 核心代码模式

### types.ts

```typescript
export interface UserRecord {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createTime: string;
}

export interface UserFormValues {
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}
```

### services/user.ts（仅当用户未提供接口文件时生成）

```typescript
import request from '@/utils/request';
import type { UserRecord, UserFormValues } from '../pages/user-manage/types';

export const getUserList = (params: {
  pageNum: number;
  pageSize: number;
  username?: string;
  role?: string;
  status?: string;
}) => request.get<{ list: UserRecord[]; total: number }>('/api/user/list', { params });

export const createUser = (data: UserFormValues) =>
  request.post<void>('/api/user', data);

export const updateUser = (id: string, data: UserFormValues) =>
  request.put<void>(`/api/user/${id}`, data);

export const deleteUser = (id: string) =>
  request.delete<void>(`/api/user/${id}`);

export const batchUpdateStatus = (data: { ids: string[]; status: string }) =>
  request.put<void>('/api/user/batch-status', data);
```

### hooks/useTableData.ts

```typescript
import { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { Modal, message } from 'antd';
import { deleteUser, batchUpdateStatus } from '@/services/user';
import type { UserRecord } from '../types';

export const useTableData = () => {
  const actionRef = useRef<ActionType>();
  const [editVisible, setEditVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<UserRecord>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const openCreateModal = () => {
    setEditRecord(undefined);
    setEditVisible(true);
  };

  const openEditModal = (record: UserRecord) => {
    setEditRecord(record);
    setEditVisible(true);
  };

  const handleEditSuccess = () => {
    setEditVisible(false);
    setEditRecord(undefined);
    actionRef.current?.reload();
  };

  const handleDelete = (record: UserRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除用户「${record.realName}」？删除后不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await deleteUser(record.id);
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleBatchStatus = (status: string) => {
    if (selectedRowKeys.length === 0) return;
    const statusText = status === 'enabled' ? '启用' : '禁用';
    Modal.confirm({
      title: `确认批量${statusText}`,
      content: `已选择 ${selectedRowKeys.length} 条记录，确认批量${statusText}？`,
      onOk: async () => {
        await batchUpdateStatus({ ids: selectedRowKeys.map(String), status });
        message.success(`批量${statusText}成功`);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return {
    actionRef,
    editVisible,
    editRecord,
    selectedRowKeys,
    setSelectedRowKeys,
    openCreateModal,
    openEditModal,
    handleEditSuccess,
    handleDelete,
    handleBatchStatus,
    setEditVisible,
  };
};
```

### hooks/index.ts

```typescript
export { useTableData } from './useTableData';
```

### components/EditModal.tsx

```tsx
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { message } from 'antd';
import { createUser, updateUser } from '@/services/user';
import type { UserRecord, UserFormValues } from '../types';

interface EditModalProps {
  open: boolean;
  record?: UserRecord;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ open, record, onCancel, onSuccess }) => {
  return (
    <ModalForm<UserFormValues>
      title={record ? '编辑用户' : '新增用户'}
      open={open}
      initialValues={record}
      modalProps={{ destroyOnClose: true, maskClosable: false, onCancel }}
      onFinish={async (values) => {
        await (record ? updateUser(record.id, values) : createUser(values));
        message.success('保存成功');
        onSuccess();
        return true;
      }}
    >
      <ProFormText name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
      <ProFormText name="realName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} />
      <ProFormText name="email" label="邮箱" rules={[{ required: true }, { type: 'email', message: '请输入有效邮箱' }]} />
      <ProFormText name="phone" label="手机号" rules={[{ required: true }, { pattern: /^\d{11}$/, message: '请输入11位手机号' }]} />
      <ProFormSelect name="role" label="角色" rules={[{ required: true }]} request={async () => [
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' },
      ]} />
      <ProFormSelect name="status" label="状态" rules={[{ required: true }]} valueEnum={{ enabled: '启用', disabled: '禁用' }} />
    </ModalForm>
  );
};

export default EditModal;
```

### index.tsx（主页面）

```tsx
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { getUserList } from '@/services/user';
import EditModal from './components/EditModal';
import { useTableData } from './hooks';
import type { UserRecord } from './types';

const UserManagePage = () => {
  const {
    actionRef,
    editVisible,
    editRecord,
    selectedRowKeys,
    setSelectedRowKeys,
    openCreateModal,
    openEditModal,
    handleEditSuccess,
    handleDelete,
    handleBatchStatus,
    setEditVisible,
  } = useTableData();

  const columns: ProColumns<UserRecord>[] = [
    { title: '用户名', dataIndex: 'username', ellipsis: true },
    { title: '姓名', dataIndex: 'realName', ellipsis: true, hideInSearch: true },
    { title: '邮箱', dataIndex: 'email', ellipsis: true, hideInSearch: true },
    { title: '手机号', dataIndex: 'phone', width: 140, hideInSearch: true },
    {
      title: '角色',
      dataIndex: 'role',
      valueEnum: {
        admin: { text: '管理员' },
        user: { text: '普通用户' },
      },
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
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => openEditModal(record)}>编辑</a>,
        <a key="delete" onClick={() => handleDelete(record)}>删除</a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<UserRecord>
        headerTitle="用户管理"
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        request={async (params) => {
          const { current: pageNum, pageSize, ...rest } = params;
          const res = await getUserList({ pageNum: pageNum!, pageSize: pageSize!, ...rest });
          return { data: res.data.list, total: res.data.total, success: true };
        }}
        search={{ labelWidth: 'auto', span: 8 }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        toolBarRender={() => [
          <Button type="primary" key="create" onClick={openCreateModal}>新增用户</Button>,
          <Button key="batch-enable" disabled={selectedRowKeys.length === 0} onClick={() => handleBatchStatus('enabled')}>批量启用</Button>,
          <Button key="batch-disable" disabled={selectedRowKeys.length === 0} onClick={() => handleBatchStatus('disabled')}>批量禁用</Button>,
        ]}
        tableAlertOptionRender={({ selectedRowKeys: keys, onCleanSelected }) => (
          <Space>
            <span>已选 {keys.length} 项</span>
            <a onClick={onCleanSelected}>取消选择</a>
          </Space>
        )}
      />
      <EditModal
        open={editVisible}
        record={editRecord}
        onCancel={() => setEditVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default UserManagePage;
```

### index.less（仅必要覆盖）

```less
// 仅在有特殊业务样式需求时添加
// 不得覆盖 Ant Design 默认样式、背景色、字体、圆角
```

## 生成要点回顾

| 要点 | 说明 |
|------|------|
| ProTable request | 必须使用 request，自动处理 loading/分页/搜索 |
| columns valueEnum | 状态/角色等枚举字段用 valueEnum 自动渲染搜索下拉和表格标签 |
| search 配置 | 使用 ProTable 内置 search，通过 columns 的 hideInSearch 控制搜索条件 |
| headerTitle | 简洁标题，不加描述文案 |
| toolBarRender | 只放操作按钮（新增、批量操作） |
| EditModal | 使用 ModalForm，destroyOnClose + maskClosable: false |
| Service 层 | API 调用骨架，RESTful 路径，真实 request 调用 |
