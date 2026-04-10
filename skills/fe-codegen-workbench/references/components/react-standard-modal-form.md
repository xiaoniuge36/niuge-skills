# react-standard-modal-form

**弹窗表单（ModalForm）**

适用场景：<10 字段的新增/编辑

关键词：弹窗、弹框、ModalForm、对话框、新增、编辑、表单、提交

排除词：导入、excel、xlsx、详情页、路由

## 核心代码模式

```tsx
<ModalForm
  title={editId ? '编辑' : '新增'}
  open={visible}
  form={form}
  modalProps={{
    onCancel,
    destroyOnClose: true,
    maskClosable: false,
  }}
  onFinish={async (values) => {
    await (editId ? updateItem(editId, values) : createItem(values));
    message.success('保存成功');
    onSuccess?.();
    return true;
  }}
>
  <ProFormText name="name" label="名称" rules={[{ required: true }]} />
  <ProFormSelect name="type" label="类型" options={typeOptions} />
</ModalForm>
```
