<template>
  <div class="global-notification-container">
    <!-- 通知组件由JS动态控制，不需要模板内容 -->
  </div>
</template>

<script>
import { defineComponent, ref, reactive, provide, onMounted } from 'vue'
import { ElNotification } from 'element-plus'

export default defineComponent({
  name: 'GlobalNotification',
  setup() {
    // 通知历史记录
    const notificationHistory = ref([])
    
    // 通知配置默认值
    const defaultOptions = reactive({
      duration: 4500,
      position: 'top-right',
      showClose: true
    })

    // 显示成功通知
    const showSuccess = (message, title = '成功', options = {}) => {
      return showNotification({
        type: 'success',
        title,
        message,
        ...options
      })
    }

    // 显示警告通知
    const showWarning = (message, title = '警告', options = {}) => {
      return showNotification({
        type: 'warning',
        title,
        message,
        ...options
      })
    }

    // 显示错误通知
    const showError = (message, title = '错误', options = {}) => {
      return showNotification({
        type: 'error',
        title,
        message,
        ...options
      })
    }

    // 显示信息通知
    const showInfo = (message, title = '信息', options = {}) => {
      return showNotification({
        type: 'info',
        title,
        message,
        ...options
      })
    }

    // 显示通知的核心方法
    const showNotification = (options) => {
      const notificationOptions = {
        ...defaultOptions,
        ...options
      }

      const notification = ElNotification(notificationOptions)
      
      // 记录通知历史
      notificationHistory.value.push({
        id: notification.id,
        type: options.type,
        title: options.title,
        message: options.message,
        timestamp: new Date()
      })

      // 限制历史记录长度
      if (notificationHistory.value.length > 50) {
        notificationHistory.value.shift()
      }

      return notification
    }

    // 关闭所有通知
    const closeAll = () => {
      ElNotification.closeAll()
    }

    // 提供全局通知方法
    provide('notification', {
      success: showSuccess,
      warning: showWarning,
      error: showError,
      info: showInfo,
      show: showNotification,
      closeAll
    })

    return {
      notificationHistory,
      showSuccess,
      showWarning,
      showError,
      showInfo,
      showNotification,
      closeAll
    }
  }
})
</script>

<style scoped>
.global-notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

/* 自定义通知样式 */
:deep(.el-notification) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left-width: 4px;
  padding: 14px 26px 14px 13px;
}

:deep(.el-notification__title) {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

:deep(.el-notification__content) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-notification__icon) {
  font-size: 24px;
  margin-right: 12px;
}

:deep(.el-notification__closeBtn) {
  font-size: 16px;
  top: 14px;
}
</style>