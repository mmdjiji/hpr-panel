<template>
  <div>
      <div class="dashboard">
        <!-- 顶部统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon repositories">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalRepositories || 0 }}</div>
              <div class="stat-label">镜像仓库</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon scheduled">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.scheduled || 0 }}</div>
              <div class="stat-label">定时任务</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon processing">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.enqueued || 0 }}</div>
              <div class="stat-label">队列中</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon busy">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.busy || 0 }}</div>
              <div class="stat-label">执行中</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon processed">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.processed || 0 }}</div>
              <div class="stat-label">已处理</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon failures">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.failed || 0 }}</div>
              <div class="stat-label">失败任务</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon retries">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemInfo?.jobs?.retries || 0 }}</div>
              <div class="stat-label">重试次数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon latency">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatLatency(systemInfo?.jobs?.default_latency) }}</div>
              <div class="stat-label">平均延迟</div>
            </div>
          </div>
        </div>

        <!-- 中间内容区域 -->
        <div class="content-grid">
          <!-- 仓库状态分布 -->
          <div class="grid-item large">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>仓库状态分布</span>
                  <el-button type="text" @click="$router.push('/repositories')">
                    管理仓库
                  </el-button>
                </div>
              </template>
              
              <div class="status-distribution">
                <div class="status-item">
                  <div class="status-dot idle"></div>
                  <span>空闲 ({{ getStatusCount('idle') }})</span>
                </div>
                <div class="status-item">
                  <div class="status-dot running"></div>
                  <span>运行中 ({{ getStatusCount('running') }})</span>
                </div>
                <div class="status-item">
                  <div class="status-dot failed"></div>
                  <span>失败 ({{ getStatusCount('failed') }})</span>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 系统版本信息 -->
          <div class="grid-item">
            <el-card class="info-card" v-loading="loading">
              <template #header>
                <span>系统信息</span>
              </template>
              
              <div class="system-info" v-if="systemInfo">
                <div class="info-row">
                  <span class="info-label">HPR 版本</span>
                  <el-tag type="primary">{{ systemInfo?.hpr?.version || 'N/A' }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="info-label">进程数</span>
                  <span class="info-value">{{ systemInfo?.jobs?.processes || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">死任务</span>
                  <span class="info-value">{{ systemInfo?.jobs?.dead || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">API状态</span>
                  <el-tag type="success" v-if="systemInfo">正常</el-tag>
                  <el-tag type="danger" v-else>异常</el-tag>
                </div>
                <div class="info-row" v-if="!systemInfo?.hpr">
                  <el-alert
                    title="API返回数据格式不符合预期"
                    type="warning"
                    :closable="false"
                    show-icon
                  >
                    请检查API返回的数据结构
                  </el-alert>
                </div>
              </div>
              <div v-else class="empty-info">
                <el-empty description="无法获取系统信息" />
                <el-button type="primary" size="small" @click="loadDashboardData" class="mt-3">
                  重试
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 最近仓库 -->
          <div class="grid-item large">
            <el-card class="table-card">
              <template #header>
                <div class="card-header">
                  <span>最近仓库</span>
                  <el-button type="text" @click="$router.push('/repositories')">
                    查看全部
                  </el-button>
                </div>
              </template>
              
              <el-table 
                :data="recentRepositories" 
                style="width: 100%"
                v-loading="loading"
                @row-click="handleRepoClick"
                size="small"
              >
                <el-table-column prop="name" label="仓库名称" min-width="200">
                  <template #default="scope">
                    <div class="repo-name">
                      <el-icon><FolderOpened /></el-icon>
                      <span>{{ scope.row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
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
                <el-table-column prop="updated_at" label="更新时间" width="160">
                  <template #default="scope">
                    {{ formatDate(scope.row.updated_at) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <!-- 队列详情 -->
          <div class="grid-item">
            <el-card class="queue-card">
              <template #header>
                <span>队列详情</span>
              </template>
              
              <div class="queue-list">
                <div class="queue-item">
                  <span class="queue-name">默认队列</span>
                  <el-tag :type="(systemInfo?.jobs?.enqueued || 0) > 0 ? 'warning' : 'success'" size="small">
                    {{ systemInfo?.jobs?.enqueued || 0 }}
                  </el-tag>
                </div>
                <div class="queue-item">
                  <span class="queue-name">处理中</span>
                  <el-tag :type="(systemInfo?.jobs?.busy || 0) > 0 ? 'warning' : 'success'" size="small">
                    {{ systemInfo?.jobs?.busy || 0 }}
                  </el-tag>
                </div>
                <div class="queue-item">
                  <span class="queue-name">已处理</span>
                  <el-tag type="info" size="small">
                    {{ systemInfo?.jobs?.processed || 0 }}
                  </el-tag>
                </div>
                <div class="queue-item">
                  <span class="queue-name">失败</span>
                  <el-tag :type="(systemInfo?.jobs?.failed || 0) > 0 ? 'danger' : 'success'" size="small">
                    {{ systemInfo?.jobs?.failed || 0 }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  FolderOpened, 
  Clock, 
  Loading, 
  Warning
} from '@element-plus/icons-vue'
import { hprApi } from '../services/api'
import { eventBus, EventNames } from '../utils/eventBus'

export default {
  name: 'Dashboard',
  components: {
    FolderOpened,
    Clock,
    Loading,
    Warning
  },
  setup() {
    const systemInfo = ref(null)
    const recentRepositories = ref([])
    const totalRepositories = ref(0)
    const loading = ref(false)
    const showDebug = ref(false)
    const rawApiResponse = ref(null)

    // 模拟数据，用于API不可用时显示
    const mockSystemInfo = {
      hpr: {
        version: '1.0.0',
        build_date: '2023-01-01',
        git_commit: 'abc123'
      },
      jobs: {
        processes: 4,
        scheduled: 10,
        enqueued: 2,
        busy: 1,
        processed: 150,
        failed: 3,
        retries: 5,
        dead: 0,
        default_latency: 250
      }
    }
    
    const mockRepositories = [
      { name: 'alpine', status: 'idle', updated_at: new Date().toISOString() },
      { name: 'ubuntu', status: 'running', updated_at: new Date().toISOString() },
      { name: 'debian', status: 'idle', updated_at: new Date().toISOString() },
      { name: 'centos', status: 'failed', updated_at: new Date().toISOString() },
      { name: 'fedora', status: 'idle', updated_at: new Date().toISOString() }
    ]
    
    const loadDashboardData = async () => {
      loading.value = true
      rawApiResponse.value = null
      
      try {
        // Load system info
        const infoResponse = await hprApi.getInfo()
        console.log('API返回的原始系统信息:', infoResponse)
        
        // 保存原始API响应用于调试
        rawApiResponse.value = infoResponse
        
        // 确保数据结构正确
        if (infoResponse && infoResponse.data) {
          systemInfo.value = infoResponse.data
          console.log('处理后的系统信息:', systemInfo.value)
        } else {
          console.error('API返回的系统信息格式不正确:', infoResponse)
          ElMessage.warning('系统信息格式不正确，使用模拟数据')
          // 使用模拟数据
          systemInfo.value = mockSystemInfo
          // 自动显示调试面板
          showDebug.value = true
        }

        // Load repositories
        const reposResponse = await hprApi.getRepositories(1, 5)
        console.log('API返回的原始仓库数据:', reposResponse)
        
        if (reposResponse && reposResponse.data) {
          recentRepositories.value = reposResponse.data.entry || []
          totalRepositories.value = reposResponse.data.total || 0
          console.log('处理后的仓库数据:', recentRepositories.value)
        } else {
          console.error('API返回的仓库数据格式不正确:', reposResponse)
          ElMessage.warning('仓库数据格式不正确，使用模拟数据')
          // 使用模拟数据
          recentRepositories.value = mockRepositories
          totalRepositories.value = mockRepositories.length
        }
        
      } catch (error) {
        ElMessage.error('加载仪表板数据失败: ' + error.message)
        console.error('Dashboard load error:', error)
        // 保存错误信息用于调试
        rawApiResponse.value = { error: error.message, stack: error.stack }
        // 使用模拟数据
        systemInfo.value = mockSystemInfo
        recentRepositories.value = mockRepositories
        totalRepositories.value = mockRepositories.length
        // 自动显示调试面板
        showDebug.value = true
        ElMessage.info('已加载模拟数据用于演示')
      } finally {
        loading.value = false
      }
    }
    
    const toggleDebug = () => {
      showDebug.value = !showDebug.value
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

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    const handleRepoClick = (row) => {
      // 跳转到仓库详情页面
      window.open(`/repositories`, '_blank')
    }

    const getStatusCount = (status) => {
      if (!recentRepositories.value) return 0
      return recentRepositories.value.filter(repo => repo.status === status).length
    }

    const formatLatency = (latency) => {
      if (!latency) return '0ms'
      if (latency < 1000) return `${latency}ms`
      return `${(latency / 1000).toFixed(1)}s`
    }

    // 监听刷新事件
    const handleRefresh = () => {
      loadDashboardData()
    }
    
    onMounted(() => {
      loadDashboardData()
      // 注册事件监听
      eventBus.on(EventNames.REFRESH_DATA, handleRefresh)
    })
    
    onUnmounted(() => {
      // 移除事件监听，防止内存泄漏
      eventBus.off(EventNames.REFRESH_DATA, handleRefresh)
    })

    return {
      systemInfo,
      recentRepositories,
      totalRepositories,
      loading,
      loadDashboardData,
      getStatusType,
      getStatusText,
      formatDate,
      handleRepoClick,
      getStatusCount,
      formatLatency,
      showDebug,
      toggleDebug,
      rawApiResponse
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 调试面板样式 */
.debug-panel {
  margin-bottom: 20px;
}

.debug-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-content {
  max-height: 400px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 10px;
  border-radius: 4px;
}

.debug-content pre {
  margin: 0;
  white-space: pre-wrap;
}

.debug-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  color: white;
}

.stat-icon.repositories {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.scheduled {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.processing {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.busy {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.stat-icon.processed {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.stat-icon.failures {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
}

.stat-icon.retries {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.stat-icon.latency {
  background: linear-gradient(135deg, #d299c2, #fef9d7);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.grid-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.grid-item.large {
  grid-column: span 2;
}

/* 卡片样式 */
.chart-card,
.table-card,
.info-card,
.queue-card {
  height: 100%;
  border: none;
  box-shadow: none;
}

.chart-card :deep(.el-card__body),
.table-card :deep(.el-card__body),
.info-card :deep(.el-card__body),
.queue-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

/* 状态分布 */
.status-distribution {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.idle {
  background: #67c23a;
}

.status-dot.running {
  background: #e6a23c;
}

.status-dot.failed {
  background: #f56c6c;
}

/* 系统信息 */
.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 600;
}

/* 队列列表 */
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.queue-item:last-child {
  border-bottom: none;
}

.queue-name {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.empty-queue {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
}

/* 表格样式 */
.repo-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: #fafafa;
  color: #606266;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-item.large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .status-distribution {
    flex-direction: column;
    gap: 16px;
  }
  
  .dashboard {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>