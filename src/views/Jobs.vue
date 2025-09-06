<template>
  <div class="jobs">
        <!-- Header Actions -->
        <div class="page-header">
          <h2>任务队列</h2>
          <div class="header-actions">
            <el-button type="primary" @click="loadJobs" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <!-- Tabs for different job types -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="定时任务" name="scheduled">
            <el-card>
              <div class="job-stats">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ scheduledStats?.total_scheduled || 0 }}</div>
                      <div class="stat-label">定时任务总数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ scheduledStats?.total_enqueued || 0 }}</div>
                      <div class="stat-label">队列中任务</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ scheduledStats?.total_failures || 0 }}</div>
                      <div class="stat-label">失败任务</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ scheduledStats?.total_processed || 0 }}</div>
                      <div class="stat-label">已处理任务</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 定时任务列表 -->
              <div class="job-list" v-if="scheduledJobs.length > 0">
                <h3>定时任务列表</h3>
                <el-table :data="scheduledJobs" style="width: 100%" v-loading="loadingScheduled">
                  <el-table-column prop="name" label="仓库名称" min-width="180">
                    <template #default="scope">
                      <div class="repo-name">
                        <el-icon><FolderOpened /></el-icon>
                        <span>{{ scope.row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="next_run" label="下次执行时间" width="180">
                    <template #default="scope">
                      {{ formatDate(scope.row.next_run) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="interval" label="执行间隔" width="120" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="scope">
                      <el-button
                        type="primary"
                        size="small"
                        @click="runScheduledJob(scope.row)"
                        :loading="runningJobs[scope.row.id]"
                      >
                        立即执行
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-empty v-else description="暂无定时任务数据" />
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="正在执行" name="busy">
            <el-card>
              <div class="job-stats">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ busyStats?.total_scheduled || 0 }}</div>
                      <div class="stat-label">定时任务总数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ busyStats?.total_enqueued || 0 }}</div>
                      <div class="stat-label">队列中任务</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ busyStats?.total_failures || 0 }}</div>
                      <div class="stat-label">失败任务</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ busyStats?.total_processed || 0 }}</div>
                      <div class="stat-label">已处理任务</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 正在执行任务列表 -->
              <div class="job-list" v-if="busyJobs.length > 0">
                <h3>正在执行任务列表</h3>
                <el-table :data="busyJobs" style="width: 100%" v-loading="loadingBusy">
                  <el-table-column prop="name" label="仓库名称" min-width="180">
                    <template #default="scope">
                      <div class="repo-name">
                        <el-icon><FolderOpened /></el-icon>
                        <span>{{ scope.row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="job_id" label="任务ID" width="180" show-overflow-tooltip />
                  <el-table-column prop="start_time" label="开始时间" width="180">
                    <template #default="scope">
                      {{ formatDate(scope.row.start_time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="duration" label="已运行时间" width="120">
                    <template #default="scope">
                      {{ formatDuration(scope.row.duration) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag type="warning">
                        运行中
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-empty v-else description="暂无正在执行的任务" />
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="队列详情" name="queues">
            <el-card>
              <div v-if="scheduledStats?.total_queues" class="queue-details">
                <h3>队列统计</h3>
                <el-table :data="queueData" style="width: 100%">
                  <el-table-column prop="name" label="队列名称" />
                  <el-table-column prop="count" label="任务数量">
                    <template #default="scope">
                      <el-tag :type="scope.row.count > 0 ? 'warning' : 'success'">
                        {{ scope.row.count }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-empty v-else description="暂无队列数据" />
            </el-card>
          </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, FolderOpened } from '@element-plus/icons-vue'
import { eventBus, EventNames } from '../utils/eventBus'
import { hprApi } from '../services/api'
import { formatDateTime, formatDuration } from '../utils/helpers'

export default {
  name: 'Jobs',
  components: {
    Refresh
  },
  setup() {
    const loading = ref(false)
    const loadingBusy = ref(false)
    const loadingScheduled = ref(false)
    const activeTab = ref('scheduled')
    const setGlobalLoading = inject('setGlobalLoading', null)
    const scheduledStats = ref(null)
    const busyStats = ref(null)
    const busyJobs = ref([])
    const scheduledJobs = ref([])
    const runningJobs = ref({})

    const queueData = computed(() => {
      if (!scheduledStats.value?.total_queues) return []
      return Object.entries(scheduledStats.value.total_queues).map(([name, count]) => ({
        name,
        count
      }))
    })

    const loadScheduledJobs = async () => {
      try {
        loadingScheduled.value = true
        const response = await hprApi.getScheduledJobs()
        scheduledStats.value = response.data.jobs
        
        // 后端API只提供统计信息，暂时设置空列表
        scheduledJobs.value = []
      } catch (error) {
        ElMessage.error('加载定时任务失败: ' + error.message)
      } finally {
        loadingScheduled.value = false
      }
    }
    
    // 获取状态类型
    const getStatusType = (status) => {
      switch (status) {
        case 'active':
          return 'success'
        case 'paused':
          return 'info'
        case 'failed':
          return 'danger'
        default:
          return 'warning'
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'active':
          return '活跃'
        case 'paused':
          return '暂停'
        case 'failed':
          return '失败'
        default:
          return '未知'
      }
    }
    
    // 立即执行定时任务
    const runScheduledJob = async (job) => {
      try {
        runningJobs.value[job.id] = true
        if (setGlobalLoading) setGlobalLoading(true)
        await hprApi.runJob(job.id)
        ElMessage.success(`已触发仓库 ${job.name} 的同步任务`)
        // 延迟刷新列表
        setTimeout(() => {
          loadJobs()
        }, 1000)
      } catch (error) {
        ElMessage.error(`触发任务失败: ${error.message}`)
      } finally {
        runningJobs.value[job.id] = false
        if (setGlobalLoading) setGlobalLoading(false)
      }
    }

    const loadBusyJobs = async () => {
      try {
        loadingBusy.value = true
        const response = await hprApi.getBusyJobs()
        busyStats.value = response.data.jobs
        
        // 后端API只提供统计信息，暂时设置空列表
        busyJobs.value = []
      } catch (error) {
        ElMessage.error('加载正在执行任务失败: ' + error.message)
      } finally {
        loadingBusy.value = false
      }
    }
    
    // 格式化日期 - 使用工具函数
    const formatDate = (dateString) => {
      return formatDateTime(dateString)
    }

    const loadJobs = async () => {
      loading.value = true
      if (setGlobalLoading) setGlobalLoading(true)
      try {
        await Promise.all([
          loadScheduledJobs(),
          loadBusyJobs()
        ])
      } finally {
        loading.value = false
        if (setGlobalLoading) setGlobalLoading(false)
      }
    }

    const handleTabChange = (tabName) => {
      activeTab.value = tabName
    }

    // 监听刷新事件
    const handleRefresh = () => {
      loadJobs()
    }
    
    onMounted(() => {
      loadJobs()
      // 注册事件监听
      eventBus.on(EventNames.REFRESH_DATA, handleRefresh)
    })
    
    onUnmounted(() => {
      // 移除事件监听，防止内存泄漏
      eventBus.off(EventNames.REFRESH_DATA, handleRefresh)
    })

    return {
      loading,
      loadingBusy,
      loadingScheduled,
      activeTab,
      scheduledStats,
      busyStats,
      busyJobs,
      scheduledJobs,
      runningJobs,
      queueData,
      loadJobs,
      handleTabChange,
      formatDate,
      formatDuration,
      getStatusType,
      getStatusText,
      runScheduledJob
    }
  }
}
</script>

<style scoped>
.jobs {
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

.job-stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.queue-details h3 {
  margin-bottom: 16px;
  color: #303133;
}
</style>
