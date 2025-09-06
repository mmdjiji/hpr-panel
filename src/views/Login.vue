<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>HPR 管理面板</h2>
          <p>请输入认证信息</p>
        </div>
      </template>

      <el-form
        ref="loginForm"
        :model="loginData"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginData.username"
            placeholder="无需认证时可留空"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginData.password"
            type="password"
            placeholder="无需认证时可留空"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%;"
            :loading="loading"
            @click="handleLogin"
          >
            连接
          </el-button>
        </el-form-item>
      </el-form>

      <div class="default-credentials">
        <el-alert
          title="使用说明"
          description="如果HPR服务未开启Basic Auth，请留空用户名和密码直接连接；如果开启了认证，请输入正确的用户名密码（默认: hpr/p@ssw0rd）"
          type="info"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { auth } from '../utils/auth'
import { hprApi } from '../services/api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const loginForm = ref(null)
    const loading = ref(false)

    const loginData = reactive({
      username: '',
      password: ''
    })

    const rules = {
      // 移除必填验证，允许用户名密码为空
      username: [],
      password: []
    }

    const handleLogin = async () => {
      try {
        loading.value = true

        // 如果用户名密码都为空，则尝试无认证访问
        if (!loginData.username.trim() && !loginData.password.trim()) {
          // 清除任何现有凭据
          auth.logout()
          console.log('Attempting anonymous access (no credentials)')
        } else {
          // 保存用户提供的凭据
          auth.saveCredentials(loginData.username, loginData.password)
          console.log('Attempting authenticated access with credentials')
        }

        // 测试API访问
        await hprApi.testAuth()

        // 如果成功
        if (!loginData.username.trim() && !loginData.password.trim()) {
          // 保存匿名标记
          auth.saveCredentials('anonymous', 'anonymous')
          ElMessage.success('连接成功（无需认证）')
        } else {
          ElMessage.success('登录成功')
        }
        
        router.push('/dashboard')
      } catch (error) {
        auth.logout() // Clear invalid credentials
        
        console.error('Login error details:', error)
        
        // 根据HTTP状态码显示不同的错误信息
        if (error.response) {
          const status = error.response.status
          switch (status) {
            case 401:
              if (!loginData.username.trim() && !loginData.password.trim()) {
                ElMessage.error('服务需要认证，请输入用户名和密码')
              } else {
                ElMessage.error('用户名或密码错误')
              }
              break
            case 403:
              if (!loginData.username.trim() && !loginData.password.trim()) {
                ElMessage.error('服务需要认证，请输入用户名和密码')
              } else {
                ElMessage.error('访问被拒绝，请检查用户名和密码')
              }
              break
            case 404:
              ElMessage.error('服务接口不存在，请检查HPR服务配置')
              break
            case 500:
              ElMessage.error('服务器内部错误')
              break
            default:
              ElMessage.error(`连接失败 (${status}): ${error.response.statusText || '未知错误'}`)
          }
        } else if (error.code === 'ECONNREFUSED') {
          ElMessage.error('无法连接到 HPR 服务，请确认服务是否启动')
        } else if (error.code === 'NETWORK_ERROR') {
          ElMessage.error('网络错误，请检查网络连接')
        } else {
          ElMessage.error('连接失败: ' + (error.message || '未知错误'))
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      // Check if already logged in
      if (auth.isLoggedIn()) {
        router.push('/dashboard')
      }
      
      // 不再预填默认凭据，让用户自己决定
      loginData.username = ''
      loginData.password = ''
    })

    return {
      loginForm,
      loginData,
      rules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 8px;
  color: #303133;
}

.card-header p {
  color: #909399;
  margin: 0;
}

.default-credentials {
  margin-top: 20px;
}
</style>
