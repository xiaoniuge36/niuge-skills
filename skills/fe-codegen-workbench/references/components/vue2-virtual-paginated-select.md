# vue2-virtual-paginated-select

**Vue2 大数据渲染下拉组件（vue-virtual-scroller + 分页下拉 + 编辑回显）**

适用场景：8000+ 条数据的高性能渲染（Vue 2 + Element UI）

关键词：大数据、虚拟列表、虚拟滚动、分页下拉、远程搜索、编辑回显、vue-virtual-scroller、vue2、element-ui

排除词：react、vue3、标准列表、导入

## 目录结构

```
[page-name]/
├── components/
│   ├── VirtualTable.vue           # 虚拟列表表格
│   ├── PaginatedSelect.vue        # 分页下拉组件
│   └── SelectPagination.vue       # 下拉分页器
├── mixins/
│   └── paginatedSelectMixin.js    # 分页下拉数据管理
├── index.vue
└── index.less
```

## 核心代码模式

```vue
<!-- 虚拟表格：使用 vue-virtual-scroller -->
<RecycleScroller
  class="virtual-table-body"
  :items="tableData"
  :item-size="60"
  key-field="rowKey"
  v-slot="{ item, index }"
>
  <div class="virtual-table-row"><!-- 自定义行内容 --></div>
</RecycleScroller>

<!-- 分页下拉：自定义 option 插槽 -->
<el-select v-model="value" filterable remote :remote-method="handleSearch" reserve-keyword>
  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  <el-option disabled value="" class="select-pagination-option">
    <SelectPagination :total="total" :page="page" @change="handlePageChange" />
  </el-option>
</el-select>
```

## 关键点

- 虚拟列表使用 `vue-virtual-scroller@^1.1.2`（需安装依赖）
- 使用 Options API + Mixins
- Vue 2 的 `el-select` 无 `#footer` 插槽，需用 disabled option 方式放分页器
- 编辑回显逻辑与 Vue3/React 版本一致（合并选中项与分页数据）
