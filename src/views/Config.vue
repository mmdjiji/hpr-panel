<template>
  <div class="config">
        <!-- Header Actions -->
        <div class="page-header">
          <h2>系统配置</h2>
          <div class="header-actions">
            <el-button type="primary" @click="openEditDialog" :disabled="loading">
              <el-icon><Edit /></el-icon>
              编辑配置
            </el-button>
            <el-button type="primary" @click="loadConfig" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <el-card v-loading="loading">
          <div v-if="config" class="config-content">
            <!-- Basic Auth Configuration -->
            <el-descriptions title="认证配置" :column="2" border>
              <el-descriptions-item label="启用状态">
                <el-tag :type="config.basic_auth?.enable ? 'success' : 'danger'">
                  {{ config.basic_auth?.enable ? '已启用' : '未启用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ config.basic_auth?.user || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="密码" span="2">
                {{ config.basic_auth?.password || 'N/A' }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- GitLab Configuration -->
            <el-descriptions title="GitLab 配置" :column="2" border style="margin-top: 20px;">
              <el-descriptions-item label="API 端点">
                <el-link :href="config.gitlab?.endpoint" target="_blank">
                  {{ config.gitlab?.endpoint || 'N/A' }}
                </el-link>
              </el-descriptions-item>
              <el-descriptions-item label="私有令牌">
                {{ config.gitlab?.private_token || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="组名称">
                {{ config.gitlab?.group_name || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="项目公开">
                <el-tag :type="config.gitlab?.project_public ? 'success' : 'info'">
                  {{ config.gitlab?.project_public ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="启用 Issue">
                <el-tag :type="config.gitlab?.project_issue ? 'success' : 'info'">
                  {{ config.gitlab?.project_issue ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="启用 Wiki">
                <el-tag :type="config.gitlab?.project_wiki ? 'success' : 'info'">
                  {{ config.gitlab?.project_wiki ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="启用合并请求">
                <el-tag :type="config.gitlab?.project_merge_request ? 'success' : 'info'">
                  {{ config.gitlab?.project_merge_request ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="启用代码片段">
                <el-tag :type="config.gitlab?.project_snippet ? 'success' : 'info'">
                  {{ config.gitlab?.project_snippet ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- Schedule Configuration -->
            <el-descriptions title="调度配置" :column="2" border style="margin-top: 20px;">
              <el-descriptions-item label="调度间隔">
                {{ config.schedule_in || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="仓库路径">
                <el-text type="info">{{ config.repository_path || 'N/A' }}</el-text>
              </el-descriptions-item>
            </el-descriptions>

            <!-- Sentry Configuration -->
            <el-descriptions title="错误监控" :column="2" border style="margin-top: 20px;">
              <el-descriptions-item label="启用状态">
                <el-tag :type="config.sentry?.report ? 'success' : 'danger'">
                  {{ config.sentry?.report ? '已启用' : '未启用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="DNS 地址">
                <el-text type="info" v-if="config.sentry?.dns">
                  {{ config.sentry.dns.substring(0, 50) }}...
                </el-text>
                <span v-else>N/A</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <el-empty v-else description="加载配置信息失败" />
        </el-card>
      </div>
      
      <!-- 编辑配置对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="编辑系统配置"
        width="60%"
        :close-on-click-modal="false"
      >
        <el-form :model="editForm" label-width="120px" v-loading="saving">
          <!-- 认证配置 -->
          <el-divider content-position="left">认证配置</el-divider>
          <el-form-item label="启用认证">
            <el-switch v-model="editForm.basic_auth.enable" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="editForm.basic_auth.user" :disabled="!editForm.basic_auth.enable" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="editForm.basic_auth.password" type="password" :disabled="!editForm.basic_auth.enable" show-password />
          </el-form-item>
          
          <!-- GitLab配置 -->
          <el-divider content-position="left">GitLab 配置</el-divider>
          <el-form-item label="API 端点">
            <el-input v-model="editForm.gitlab.endpoint" placeholder="例如: https://gitlab.com/api/v4" />
          </el-form-item>
          <el-form-item label="私有令牌">
            <el-input v-model="editForm.gitlab.private_token" show-password />
          </el-form-item>
          <el-form-item label="组名称">
            <el-input v-model="editForm.gitlab.group_name" />
          </el-form-item>
          <el-form-item label="项目公开">
            <el-switch v-model="editForm.gitlab.project_public" />
          </el-form-item>
          <el-form-item label="启用 Issue">
            <el-switch v-model="editForm.gitlab.project_issue" />
          </el-form-item>
          <el-form-item label="启用 Wiki">
            <el-switch v-model="editForm.gitlab.project_wiki" />
          </el-form-item>
          <el-form-item label="启用合并请求">
            <el-switch v-model="editForm.gitlab.project_merge_request" />
          </el-form-item>
          <el-form-item label="启用代码片段">
            <el-switch v-model="editForm.gitlab.project_snippet" />
          </el-form-item>
          
          <!-- 调度配置 -->
          <el-divider content-position="left">调度配置</el-divider>
          <el-form-item label="调度间隔">
            <el-input v-model="editForm.schedule_in" placeholder="例如: 1h, 30m" />
          </el-form-item>
          <el-form-item label="仓库路径">
            <el-input v-model="editForm.repository_path" placeholder="例如: /data/repositories" />
          </el-form-item>
          
          <!-- Sentry配置 -->
          <el-divider content-position="left">错误监控</el-divider>
          <el-form-item label="启用监控">
            <el-switch v-model="editForm.sentry.report" />
          </el-form-item>
          <el-form-item label="DNS 地址">
            <el-input v-model="editForm.sentry.dns" :disabled="!editForm.sentry.report" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveConfig" :loading="saving">
              保存
            </el-button>
          </span>
        </template>
      </el-dialog>
</template>

<script>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit } from '@element-plus/icons-vue'
import { eventBus, EventNames } from '../utils/eventBus'
import { hprApi } from '../services/api'

export default {
  name: 'Config',
  components: {
    Refresh,
    Edit
  },
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const config = ref(null)
    const dialogVisible = ref(false)
    const editForm = reactive({
      basic_auth: {
        enable: false,
        user: '',
        password: ''
      },
      gitlab: {
        endpoint: '',
        private_token: '',
        group_name: '',
        project_public: false,
        project_issue: false,
        project_wiki: false,
        project_merge_request: false,
        project_snippet: false
      },
      schedule_in: '',
      repository_path: '',
      sentry: {
        report: false,
        dns: ''
      }
    })

    const loadConfig = async () => {
      loading.value = true
      try {
        const response = await hprApi.getConfig()
        config.value = response.data
      } catch (error) {
        ElMessage.error('加载配置信息失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    const openEditDialog = () => {
      if (!config.value) {
        ElMessage.warning('请先加载配置信息')
        return
      }
      
      // 复制配置到编辑表单
      if (config.value.basic_auth) {
        editForm.basic_auth.enable = config.value.basic_auth.enable || false
        editForm.basic_auth.user = config.value.basic_auth.user || ''
        editForm.basic_auth.password = config.value.basic_auth.password || ''
      }
      
      if (config.value.gitlab) {
        editForm.gitlab.endpoint = config.value.gitlab.endpoint || ''
        editForm.gitlab.private_token = config.value.gitlab.private_token || ''
        editForm.gitlab.group_name = config.value.gitlab.group_name || ''
        editForm.gitlab.project_public = config.value.gitlab.project_public || false
        editForm.gitlab.project_issue = config.value.gitlab.project_issue || false
        editForm.gitlab.project_wiki = config.value.gitlab.project_wiki || false
        editForm.gitlab.project_merge_request = config.value.gitlab.project_merge_request || false
        editForm.gitlab.project_snippet = config.value.gitlab.project_snippet || false
      }
      
      editForm.schedule_in = config.value.schedule_in || ''
      editForm.repository_path = config.value.repository_path || ''
      
      if (config.value.sentry) {
        editForm.sentry.report = config.value.sentry.report || false
        editForm.sentry.dns = config.value.sentry.dns || ''
      }
      
      dialogVisible.value = true
    }
    
    const saveConfig = async () => {
      saving.value = true
      try {
        await hprApi.updateConfig(editForm)
        ElMessage.success('配置更新成功')
        dialogVisible.value = false
        // 重新加载配置
        await loadConfig()
      } catch (error) {
        ElMessage.error('更新配置失败: ' + error.message)
      } finally {
        saving.value = false
      }
    }

    // 监听刷新事件
    const handleRefresh = () => {
      loadConfig()
    }
    
    onMounted(() => {
      loadConfig()
      // 注册事件监听
      eventBus.on(EventNames.REFRESH_DATA, handleRefresh)
    })
    
    onUnmounted(() => {
      // 移除事件监听，防止内存泄漏
      eventBus.off(EventNames.REFRESH_DATA, handleRefresh)
    })

    return {
      loading,
      saving,
      config,
      dialogVisible,
      editForm,
      loadConfig,
      openEditDialog,
      saveConfig
    }
  }
}
</script>

<style scoped>
.config {
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

.config-content {
  padding: 10px 0;
}
</style>
