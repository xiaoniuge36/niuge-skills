# react-pc-file-upload

**PC 文件上传组件**

适用场景：React + Ant Design 的文件/图片上传

关键词：上传、文件上传、图片上传、附件、antd、ant-design、pc、进度条、upload、react、picture-card

排除词：h5、移动端、vant、导入、excel、vue、element

## 关键 Props

```tsx
<FileUpload
  uploadUrl="/api/upload"
  maxCount={5}
  maxSize={10}
  acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
  listType="picture-card"
  onSuccess={(file, response) => {}}
/>
```

## 暴露方法

- `getFileList()` — 获取当前文件列表
- `setFileList(list)` — 设置文件列表
- `clearFileList()` — 清空文件列表
