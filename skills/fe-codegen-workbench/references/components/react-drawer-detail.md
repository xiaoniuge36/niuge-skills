# react-drawer-detail

**抽屉详情（Drawer Detail）**

适用场景：列表页快速查看详情、不需要独立 URL 的详情展示

关键词：抽屉、抽屉详情、查看详情、侧边详情、Drawer、详情、查看

排除词：导入、excel、xlsx、编辑、表单、独立页面、路由

## 目录结构

```
[page-name]/
├── components/
│   └── DetailDrawer/
│       ├── hooks/
│       │   └── useDetailData.ts  # 详情数据获取逻辑
│       ├── index.tsx              # 抽屉详情组件
│       └── index.less
└── index.tsx                      # 列表页（调用抽屉）
```

## 核心代码模式

```tsx
// hooks/useDetailData.ts
export const useDetailData = (id?: string, visible?: boolean) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !visible) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        setData(res.data);
      } catch (error) {
        message.error('获取详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, visible]);

  return { data, loading };
};

// DetailDrawer/index.tsx
const DetailDrawer: React.FC<DetailDrawerProps> = ({ visible, id, onClose, onEdit, column = 2 }) => {
  const { data, loading } = useDetailData(id, visible);
  return (
    <Drawer
      title="详情"
      open={visible}
      onClose={onClose}
      width={600}
      extra={onEdit && <Button type="primary" onClick={() => onEdit(id!)}>编辑</Button>}
    >
      <Spin spinning={loading}>
        <Descriptions column={column} bordered>
          <Descriptions.Item label="名称">{data?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {data?.status ? <Tag color={data.status === 1 ? 'success' : 'default'}>{data.status === 1 ? '启用' : '禁用'}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={column}>{data?.description || '-'}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </Drawer>
  );
};
```

## 与独立详情页的区别

| 特性 | 抽屉详情 | 独立详情页 |
|------|---------|-----------|
| URL | 无独立 URL | 有独立 URL（如 `/detail/123`） |
| 场景 | 快速查看 | 复杂详情、需要分享链接 |
| 空间 | 侧边滑出 | 全屏展示 |
| 适用复杂度 | 简单-中等 | 中等-复杂 |
