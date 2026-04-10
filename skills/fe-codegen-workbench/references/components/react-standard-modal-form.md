# react-standard-modal-form

**弹窗表单（ModalForm）**

适用场景：<10 字段的新增/编辑

关键词：弹窗、弹框、ModalForm、对话框、新增、编辑、表单、提交

排除词：导入、excel、xlsx、详情页、路由

## 强制约束

1. **使用 ModalForm 而非 Modal + Form 组合**
2. **destroyOnClose: true**，防止表单数据残留
3. **maskClosable: false**，防止误关闭
4. **编辑时通过 initialValues 回填**，不要手动 setFieldsValue
5. **onFinish 返回 true 自动关闭**，不要手动控制 open

## 核心代码模式

### 完整组件示例

```tsx
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { message } from 'antd';
import { createItem, updateItem } from '@/services/xxx';
import type { ItemRecord, ItemFormValues } from '../types';

interface EditModalProps {
  open: boolean;
  record?: ItemRecord;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ open, record, onCancel, onSuccess }) => {
  return (
    <ModalForm<ItemFormValues>
      title={record ? '编辑' : '新增'}
      open={open}
      initialValues={record}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel,
      }}
      onFinish={async (values) => {
        await (record ? updateItem(record.id, values) : createItem(values));
        message.success('保存成功');
        onSuccess();
        return true;
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormText
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效邮箱' },
        ]}
      />
      <ProFormText
        name="phone"
        label="手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^\d{11}$/, message: '请输入11位手机号' },
        ]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        rules={[{ required: true }]}
        valueEnum={{ enabled: '启用', disabled: '禁用' }}
      />
    </ModalForm>
  );
};

export default EditModal;
```

### 在主页面中调用

```tsx
<EditModal
  open={editVisible}
  record={editRecord}
  onCancel={() => setEditVisible(false)}
  onSuccess={handleEditSuccess}
/>
```

### hooks 中的弹窗状态管理

```typescript
const [editVisible, setEditVisible] = useState(false);
const [editRecord, setEditRecord] = useState<ItemRecord>();

const openCreateModal = () => {
  setEditRecord(undefined);
  setEditVisible(true);
};

const openEditModal = (record: ItemRecord) => {
  setEditRecord(record);
  setEditVisible(true);
};

const handleEditSuccess = () => {
  setEditVisible(false);
  setEditRecord(undefined);
  actionRef.current?.reload();
};
```

## 表单控件映射

| 字段类型 | Pro 组件 | 说明 |
|----------|---------|------|
| 文本 | ProFormText | 输入框 |
| 长文本 | ProFormTextArea | 多行输入 |
| 数字 | ProFormDigit | 数字输入 |
| 枚举/下拉 | ProFormSelect | 下拉选择 |
| 开关 | ProFormSwitch | 布尔值 |
| 日期 | ProFormDatePicker | 日期选择 |
| 日期范围 | ProFormDateRangePicker | 日期范围 |
| 单选 | ProFormRadio.Group | 少量选项 |
