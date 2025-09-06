<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- 全局加载指示器 -->
    <div class="global-loading" v-if="isLoading">
      <div class="loading-spinner">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
    
    <!-- 全局组件 -->
    <GlobalNotification />
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import GlobalNotification from './components/GlobalNotification.vue'

export default {
  components: {
    Loading,
    GlobalNotification
  },
  setup() {
    const isLoading = ref(false)

    // 提供全局加载状态控制方法
    provide('setGlobalLoading', (status) => {
      isLoading.value = status
    })

    return {
      isLoading
    }
  }
}
</script>

<style>
@import 'element-plus/dist/index.css';
@import 'element-plus/theme-chalk/dark/css-vars.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
}

/* 暗黑模式变量 */
html.dark {
  --el-bg-color-page: #121212;
  --card-bg-color: #1e1e1e;
  --border-color: #333;
}

/* 全局加载指示器样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-spinner .el-icon {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
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
