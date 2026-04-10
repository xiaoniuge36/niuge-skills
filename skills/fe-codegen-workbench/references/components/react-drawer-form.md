# react-drawer-form

**抽屉编辑表单（DrawerForm）**

适用场景：10-20 字段的新增/编辑

关键词：抽屉、抽屉编辑、DrawerForm、侧边、新增、编辑、表单、提交

排除词：导入、excel、xlsx、详情页、独立页面、路由

## 目录结构

```
[page-name]/
├── components/
│   └── EditDrawerForm.tsx  # 抽屉表单组件
├── index.tsx               # 列表页（调用抽屉）
└── index.less
```

## 核心代码模式

```tsx
const EditDrawerForm: React.FC<DrawerFormProps> = ({ visible, editId, onClose, onSuccess }) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible && editId) {
      getDetail(editId).then((res) => form.setFieldsValue(res.data));
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editId, form]);

  return (
    <DrawerForm
      title={editId ? '编辑' : '新增'}
      open={visible}
      form={form}
      drawerProps={{
        onClose,
        destroyOnClose: true,
        maskClosable: false,
        width: 600,
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      onFinish={handleSubmit}
    >
      <ProFormText name="name" label="名称" rules={[{ required: true }]} />
      <ProFormSelect name="type" label="类型" options={typeOptions} rules={[{ required: true }]} />
      <ProFormDatePicker name="startDate" label="开始日期" />
      <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 4 }} />
    </DrawerForm>
  );
};
```

## 抽屉宽度建议

| 字段数量 | 推荐宽度 | 说明 |
|---------|---------|------|
| 5-10个 | 600px | 基础表单 |
| 10-15个 | 720px | 中等表单 |
| 15-20个 | 800px | 复杂表单 |
| 20+个 | 建议使用独立页面 | 字段过多 |
