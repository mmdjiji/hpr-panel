// 创建一个简单的事件总线，用于组件间通信
import { ref } from 'vue'

class EventBus {
  constructor() {
    this.events = {}
  }

  // 注册事件监听器
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 移除事件监听器
  off(event, callback) {
    if (!this.events[event]) return
    if (!callback) {
      this.events[event] = []
      return
    }
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  // 触发事件
  emit(event, ...args) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => {
      callback(...args)
    })
  }
}

export const eventBus = new EventBus()

// 预定义的事件名称，便于维护
export const EventNames = {
  REFRESH_DATA: 'refresh-data'
}