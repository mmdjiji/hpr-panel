<template>
  <el-container class="layout-container">
    <!-- Header -->
    <el-header class="header">
      <div class="header-left">
        <h2>HPR 管理面板</h2>
      </div>
      <div class="header-right">
        <el-button type="text" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            {{ credentials?.username }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
            <el-dropdown-item command="refresh">刷新数据</el-dropdown-item>
            <el-dropdown-item command="toggleTheme">
              <el-icon class="theme-icon">
                <Moon v-if="currentTheme === 'light'" />
                <Sunny v-else />
              </el-icon>
              {{ currentTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式' }}
            </el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- Sidebar -->
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/repositories">
            <el-icon><FolderOpened /></el-icon>
            <span>仓库管理</span>
          </el-menu-item>
          <el-menu-item index="/jobs">
            <el-icon><Loading /></el-icon>
            <span>任务队列</span>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon><Tools /></el-icon>
            <span>系统配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main content -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  ArrowDown, 
  DataBoard, 
  FolderOpened,
  Loading,
  Tools,
  Moon,
  Sunny
} from '@element-plus/icons-vue'
import { auth } from '../utils/auth'
import { getCurrentTheme, toggleTheme, initTheme, ThemeType } from '../utils/theme'
import { eventBus, EventNames } from '../utils/eventBus'

export default {
  name: 'Layout',
  components: {
    Refresh,
    ArrowDown,
    DataBoard,
    FolderOpened,
    Loading,
    Tools,
    Moon,
    Sunny
  },
  setup() {
    const router = useRouter()
    const credentials = ref(null)
    const currentTheme = ref(getCurrentTheme())

    const handleCommand = (command) => {
      if (command === 'logout') {
        auth.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } else if (command === 'refresh') {
        refreshData()
      } else if (command === 'toggleTheme') {
        currentTheme.value = toggleTheme()
      }
    }

    const refreshData = () => {
      eventBus.emit(EventNames.REFRESH_DATA)
    }

    onMounted(() => {
      credentials.value = auth.getCredentials()
      initTheme()
    })

    return {
      credentials,
      handleCommand,
      refreshData,
      currentTheme
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
}

.sidebar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background-color: var(--el-bg-color-page);
  padding: 20px;
}

.theme-icon {
  margin-right: 5px;
  vertical-align: middle;
}

/* 页面过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
