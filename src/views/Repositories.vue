<template>
  <div class="repositories">
        <!-- Header Actions -->
        <div class="page-header">
          <h2>仓库管理</h2>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索仓库..."
              style="width: 300px;"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              添加仓库
            </el-button>
            <el-dropdown v-if="multipleSelection.length > 0" @command="handleBatchCommand">
              <el-button type="primary">
                批量操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="update">更新选中仓库</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除选中仓库</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- Repositories Table -->
        <el-card>
          <el-table 
            :data="repositories" 
            style="width: 100%"
            v-loading="loading"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="仓库名称" min-width="200">
              <template #default="scope">
                <div class="repo-name">
                  <el-icon><FolderOpened /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="url" label="原始地址" min-width="300" show-overflow-tooltip />
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="getStatusType(scope.row.status)"
                  size="small"
                >
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="updated_at" label="最后更新" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.updated_at) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="scheduled_at" label="下次计划" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.scheduled_at) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="updateRepository(scope.row.name)"
                  :loading="updating[scope.row.name]"
                >
                  更新
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="confirmDelete(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div class="pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>

        <!-- Create Repository Dialog -->
        <el-dialog
          v-model="showCreateDialog"
          title="添加镜像仓库"
          width="600px"
        >
          <el-form
            ref="createForm"
            :model="createData"
            :rules="createRules"
            label-width="100px"
          >
            <el-form-item label="仓库地址" prop="url">
              <el-input
                v-model="createData.url"
                placeholder="https://github.com/user/repo.git"
              />
            </el-form-item>
            
            <el-form-item label="自定义名称" prop="name">
              <el-input
                v-model="createData.name"
                placeholder="留空将自动生成"
              />
            </el-form-item>
            
            <el-form-item label="创建项目">
              <el-switch
                v-model="createData.create"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
            
            <el-form-item label="立即克隆">
              <el-switch
                v-model="createData.clone"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-form>
          
          <template #footer>
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="createRepository"
              :loading="creating"
            >
              创建
            </el-button>
          </template>
        </el-dialog>

        <!-- Repository Detail Dialog -->
        <el-dialog
          v-model="showDetailDialog"
          title="仓库详情"
          width="700px"
        >
          <div v-if="selectedRepo" class="repo-detail">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="仓库名称">
                {{ selectedRepo.name }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(selectedRepo.status)">
                  {{ getStatusText(selectedRepo.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="原始地址" span="2">
                <el-link :href="selectedRepo.url" target="_blank">
                  {{ selectedRepo.url }}
                </el-link>
              </el-descriptions-item>
              <el-descriptions-item label="镜像地址" span="2">
                <el-link :href="selectedRepo.mirror_url" target="_blank">
                  {{ selectedRepo.mirror_url }}
                </el-link>
              </el-descriptions-item>
              <el-descriptions-item label="GitLab 项目 ID">
                {{ selectedRepo.gitlab_project_id }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(selectedRepo.created_at) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                {{ formatDate(selectedRepo.updated_at) }}
              </el-descriptions-item>
              <el-descriptions-item label="下次计划">
                {{ formatDate(selectedRepo.scheduled_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, FolderOpened, ArrowDown } from '@element-plus/icons-vue'
import { eventBus, EventNames } from '../utils/eventBus'
import { hprApi } from '../services/api'
import { formatDateTime, debounce } from '../utils/helpers'

export default {
  name: 'Repositories',
  components: {
    Search,
    Plus,
    FolderOpened,
    ArrowDown
  },
  setup() {
    const repositories = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const loading = ref(false)
    const searchQuery = ref('')
    const updating = ref({})
    const multipleSelection = ref([])
    const setGlobalLoading = inject('setGlobalLoading', null)
    
    // Create dialog
    const showCreateDialog = ref(false)
    const creating = ref(false)
    const createForm = ref(null)
    const createData = reactive({
      url: '',
      name: '',
      create: true,
      clone: true
    })
    
    const createRules = {
      url: [
        { required: true, message: '请输入仓库地址', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (!value || !value.trim()) {
              callback(new Error('仓库地址不能为空'))
            } else if (!/^https?:\/\/.*\.git$|^git@.*:.*\.git$/.test(value.trim())) {
              callback(new Error('请输入有效的 Git 仓库地址'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // Detail dialog
    const showDetailDialog = ref(false)
    const selectedRepo = ref(null)

    const loadRepositories = async () => {
      loading.value = true
      if (setGlobalLoading) setGlobalLoading(true)
      try {
        let response
        if (searchQuery.value.trim()) {
          response = await hprApi.searchRepositories(searchQuery.value.trim())
        } else {
          response = await hprApi.getRepositories(currentPage.value, pageSize.value)
        }
        
        repositories.value = response.data.data || []
        total.value = response.data.total || 0
      } catch (error) {
        ElMessage.error('加载仓库列表失败: ' + error.message)
      } finally {
        loading.value = false
        if (setGlobalLoading) setGlobalLoading(false)
      }
    }

    // 使用防抖函数优化搜索
    const handleSearch = debounce(() => {
      pagination.currentPage = 1
      loadRepositories()
    }, 500)

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadRepositories()
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadRepositories()
    }

    const createRepository = async () => {
      try {
        await createForm.value.validate()
        
        // 额外验证url字段
        if (!createData.url || !createData.url.trim()) {
          ElMessage.error('请输入仓库地址')
          return
        }
        
        creating.value = true
        if (setGlobalLoading) setGlobalLoading(true)

        const payload = {
          url: createData.url.trim(),
          create: createData.create ? 'true' : 'false',
          clone: createData.clone ? 'true' : 'false'
        }
        
        if (createData.name && createData.name.trim()) {
          payload.name = createData.name.trim()
        }

        const response = await hprApi.createRepository(payload)
        
        ElMessage.success(`创建任务已提交，任务ID: ${response.data.job_id}`)
        showCreateDialog.value = false
        
        // Reset form
        Object.assign(createData, {
          url: '',
          name: '',
          create: true,
          clone: true
        })
        
        // Reload repositories after a delay
        setTimeout(loadRepositories, 2000)
      } catch (error) {
        ElMessage.error('创建仓库失败: ' + error.message)
      } finally {
        creating.value = false
        if (setGlobalLoading) setGlobalLoading(false)
      }
    }

    const updateRepository = async (name) => {
      try {
        updating.value[name] = true
        const response = await hprApi.updateRepository(name)
        ElMessage.success(`更新任务已提交，任务ID: ${response.data.job_id}`)
        
        // Reload repositories after a delay
        setTimeout(loadRepositories, 2000)
      } catch (error) {
        ElMessage.error('更新仓库失败: ' + error.message)
      } finally {
        updating.value[name] = false
      }
    }

    const confirmDelete = async (repo) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除仓库 "${repo.name}" 吗？这将删除数据库记录、本地文件和 GitLab 项目。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        if (setGlobalLoading) setGlobalLoading(true)
        const response = await hprApi.deleteRepository(repo.name)
        ElMessage.success(`删除任务已提交，任务ID: ${response.data.job_id}`)
        
        // Reload repositories after a delay
        setTimeout(loadRepositories, 2000)
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除仓库失败: ' + error.message)
        }
      } finally {
        if (setGlobalLoading) setGlobalLoading(false)
      }
    }

    const handleRowClick = async (row) => {
      try {
        const response = await hprApi.getRepository(row.name)
        selectedRepo.value = response.data
        showDetailDialog.value = true
      } catch (error) {
        ElMessage.error('获取仓库详情失败: ' + error.message)
      }
    }

    const getStatusType = (status) => {
      const types = {
        idle: 'success',
        running: 'warning',
        failed: 'danger'
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        idle: '空闲',
        running: '运行中',
        failed: '失败'
      }
      return texts[status] || status
    }

    // 格式化日期函数
    const formatDate = (dateString) => {
      return formatDateTime(dateString)
    }

    // 监听刷新事件
    const handleRefresh = () => {
      loadRepositories()
    }
    
    onMounted(() => {
      loadRepositories()
      // 注册事件监听
      eventBus.on(EventNames.REFRESH_DATA, handleRefresh)
    })
    
    onUnmounted(() => {
      // 移除事件监听，防止内存泄漏
      eventBus.off(EventNames.REFRESH_DATA, handleRefresh)
    })

    // 处理表格选择变化
    const handleSelectionChange = (selection) => {
      multipleSelection.value = selection
    }

    // 处理批量操作命令
    const handleBatchCommand = async (command) => {
      if (multipleSelection.value.length === 0) {
        ElMessage.warning('请先选择要操作的仓库')
        return
      }

      if (command === 'update') {
        await batchUpdateRepositories()
      } else if (command === 'delete') {
        await batchDeleteRepositories()
      }
    }

    // 批量更新仓库
    const batchUpdateRepositories = async () => {
      try {
        const names = multipleSelection.value.map(repo => repo.name)
        
        await ElMessageBox.confirm(
          `确定要更新选中的 ${names.length} 个仓库吗？`,
          '批量更新',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        
        const promises = names.map(name => {
          updating.value[name] = true
          return hprApi.updateRepository(name)
            .then(response => {
              return { name, success: true, jobId: response.data.job_id }
            })
            .catch(error => {
              return { name, success: false, error: error.message }
            })
            .finally(() => {
              updating.value[name] = false
            })
        })
        
        const results = await Promise.all(promises)
        
        const successCount = results.filter(r => r.success).length
        const failCount = results.length - successCount
        
        if (successCount > 0) {
          ElMessage.success(`成功提交 ${successCount} 个更新任务`)
        }
        
        if (failCount > 0) {
          ElMessage.warning(`${failCount} 个更新任务提交失败`)
        }
        
        // 重新加载仓库列表
        setTimeout(loadRepositories, 2000)
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量更新操作失败: ' + error.message)
        }
      }
    }

    // 批量删除仓库
    const batchDeleteRepositories = async () => {
      try {
        const names = multipleSelection.value.map(repo => repo.name)
        
        await ElMessageBox.confirm(
          `确定要删除选中的 ${names.length} 个仓库吗？这将删除数据库记录、本地文件和 GitLab 项目。`,
          '批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const promises = names.map(name => {
          return hprApi.deleteRepository(name)
            .then(response => {
              return { name, success: true, jobId: response.data.job_id }
            })
            .catch(error => {
              return { name, success: false, error: error.message }
            })
        })
        
        const results = await Promise.all(promises)
        
        const successCount = results.filter(r => r.success).length
        const failCount = results.length - successCount
        
        if (successCount > 0) {
          ElMessage.success(`成功提交 ${successCount} 个删除任务`)
        }
        
        if (failCount > 0) {
          ElMessage.warning(`${failCount} 个删除任务提交失败`)
        }
        
        // 重新加载仓库列表
        setTimeout(loadRepositories, 2000)
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除操作失败: ' + error.message)
        }
      }
    }

    return {
      repositories,
      total,
      currentPage,
      pageSize,
      loading,
      searchQuery,
      updating,
      showCreateDialog,
      creating,
      createForm,
      createData,
      createRules,
      showDetailDialog,
      selectedRepo,
      multipleSelection,
      loadRepositories,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      createRepository,
      updateRepository,
      confirmDelete,
      handleRowClick,
      handleSelectionChange,
      handleBatchCommand,
      getStatusType,
      getStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
.repositories {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.repo-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.repo-detail {
  padding: 10px 0;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
