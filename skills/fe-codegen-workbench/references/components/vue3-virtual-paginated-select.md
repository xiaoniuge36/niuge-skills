# vue3-virtual-paginated-select

**Vue3 大数据渲染下拉组件（el-table-v2 + 分页下拉 + 编辑回显）**

适用场景：8000+ 条数据的高性能渲染（Vue 3 + Element Plus）

关键词：大数据、虚拟列表、虚拟滚动、分页下拉、远程搜索、编辑回显、el-table-v2、vue3、element-plus

排除词：react、vue2、标准列表、导入

## 目录结构

```
[page-name]/
├── components/
│   ├── PaginatedSelect.vue        # 分页下拉组件
│   └── SelectPagination.vue       # 下拉分页器
├── composables/
│   └── usePaginatedSelect.ts      # 分页下拉数据管理
├── types.ts
├── index.vue
└── index.less
```

## 核心代码模式

```vue
<!-- 虚拟表格：使用 el-table-v2 -->
<el-table-v2
  :columns="columns"
  :data="tableData"
  :width="tableWidth"
  :height="500"
  :row-height="60"
  row-key="rowKey"
/>

<!-- 分页下拉：#footer 插槽放分页器 -->
<el-select v-model="value" filterable remote :remote-method="handleSearch" reserve-keyword>
  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  <template #footer>
    <SelectPagination :total="total" :page="page" @change="handlePageChange" />
  </template>
</el-select>
```

## 关键点

- 虚拟列表必须使用 `el-table-v2`（Element Plus 2.3.0+）并设置固定行高
- 分页下拉必须实现选中项合并逻辑（编辑回显）
- 搜索必须防抖处理（300-500ms）
- 使用 Composition API + `<script setup>`
