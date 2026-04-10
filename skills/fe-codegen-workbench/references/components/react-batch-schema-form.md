# react-batch-schema-form

**批量 Schema 表单（BetaSchemaForm）**

适用场景：批量编辑、批量审批、动态字段配置的批量操作

关键词：批量、批量编辑、批量更新、schema、动态表单、多选、批量操作、批量审批、批量修改

排除词：导入、excel、xlsx、详情页、单条、单个

## 目录结构

```
[page-name]/
├── components/
│   └── BatchSchemaForm.tsx   # 批量 Schema 表单组件
├── hooks/
│   └── useBatchForm.ts       # 批量表单逻辑（可选）
├── index.tsx                 # 列表页（调用弹窗）
└── index.less
```

## 核心代码模式

```tsx
import { BetaSchemaForm } from '@ant-design/pro-components';
import type { ProFormColumnsType } from '@ant-design/pro-components';

const BatchSchemaForm: React.FC<BatchSchemaFormProps> = ({
  visible, selectedIds, selectedRows, bizType, onCancel, onSuccess,
}) => {
  const [columns, setColumns] = useState<ProFormColumnsType<DataItem>[]>([]);

  useEffect(() => {
    if (visible && bizType) {
      getFieldSchema(bizType).then((res) => {
        const schemaColumns = (res.data || []).map((field: any) => ({
          title: field.label,
          dataIndex: field.name,
          valueType: field.type || 'text',
          valueEnum: field.options?.reduce((acc: any, opt: any) => ({
            ...acc, [opt.value]: { text: opt.label },
          }), {}),
          formItemProps: { rules: field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined },
          width: 'md',
        }));
        setColumns(schemaColumns);
      });
    }
  }, [visible, bizType]);

  return (
    <BetaSchemaForm<DataItem>
      layoutType="ModalForm"
      title={`批量编辑（已选 ${selectedIds.length} 条）`}
      open={visible}
      modalProps={{ onCancel, destroyOnClose: true, maskClosable: false }}
      onFinish={async (values) => {
        await batchUpdateItems({ ids: selectedIds, bizType, updateFields: values });
        message.success(`批量更新 ${selectedIds.length} 条记录成功`);
        onSuccess();
        return true;
      }}
      columns={columns}
    />
  );
};
```

## 常用 valueType 类型

| valueType | 说明 | 示例 |
|-----------|------|------|
| `text` | 文本输入框 | 名称、备注 |
| `select` | 下拉选择 | 状态、类型 |
| `date` / `dateTime` | 日期选择 | 生效日期 |
| `digit` / `money` | 数字/金额 | 数量、价格 |
| `textarea` | 多行文本 | 描述 |
| `group` | 字段分组 | 分组标题 |
| `dependency` | 字段联动 | 条件显示 |
