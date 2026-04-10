# react-nonstandard-detail

**独立详情页（Detail Page）**

适用场景：审批流程/附件预览/需要独立 URL 的详情展示

关键词：详情、详情页、单据详情、查看、审批、流程、节点、时间轴、出差申请单、单据号、附件预览、卡片布局、路由参数

排除词：导入、上传、excel、xlsx、模板下载、导入记录、列表、表格、搜索

## 目录结构

```
[page-name]/components/detail/
├── hooks/
│   ├── index.ts
│   └── useDetailData.ts     # 数据获取（必须先生成）
├── index.tsx
└── index.less
```

## 核心代码模式

```tsx
// hooks/useDetailData.ts（第一步生成）
export const useDetailData = (id?: string) => {
  const [data, setData] = useState<DetailType>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDetail(id).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
};

// index.tsx（第二步生成）
const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useDetailData(id);
  return (
    <Card title="详情" extra={<Button onClick={() => navigate(-1)}>返回</Button>}>
      <Descriptions column={2}>
        <Descriptions.Item label="名称">{data?.name || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```
