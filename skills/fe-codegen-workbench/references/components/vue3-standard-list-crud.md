# vue3-standard-list-crud

**标准列表页（Element Plus + Composition API）**

适用场景：Vue 3 标准 CRUD 列表页

关键词：列表、列表页、表格、搜索、查询、新增、编辑、删除、批量、el-table、vue3、composition

排除词：导入、xlsx、excel、详情页、单据详情、vue2

## 核心代码模式

```vue
<template>
  <div>
    <el-form :model="searchForm" inline>
      <el-form-item label="名称">
        <el-input v-model="searchForm.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading">
      <el-table-column type="selection" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination :total="total" v-model:current-page="page" @current-change="fetchData" />
    <EditDialog v-model="dialogVisible" :data="editData" @success="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { useTableData } from './composables';
const { tableData, loading, total, page, searchForm, fetchData, handleSearch, handleReset } = useTableData();
</script>
```
