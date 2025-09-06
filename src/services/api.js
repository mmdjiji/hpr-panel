import axios from 'axios'

// 从环境变量获取API基础URL，默认使用反向代理路径
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // 禁用一些不必要的默认行为
  withCredentials: false
})

// Add auth interceptor
api.interceptors.request.use((config) => {
  const credentials = localStorage.getItem('hpr-credentials')
  console.log('Request interceptor - credentials:', credentials)
  
  // 添加一个自定义头部，防止浏览器弹出Basic Auth对话框
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  
  if (credentials) {
    const { username, password } = JSON.parse(credentials)
    // 只有在用户名密码都不为空且不是匿名标记时才添加认证头
    if (username && password && username !== 'anonymous') {
      const basicAuth = btoa(`${username}:${password}`)
      config.headers.Authorization = `Basic ${basicAuth}`
      console.log('Added Authorization header:', `Basic ${basicAuth}`)
    } else {
      console.log('Credentials are empty or anonymous, sending request without auth')
    }
  } else {
    console.log('No credentials found, sending request without auth')
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response interceptor - error:', error)
    
    // 在非登录页面，如果是认证相关错误，自动跳转到登录页
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('hpr-credentials')
        window.location.href = '/login'
      }
    }
    
    // 直接返回原始错误，让业务逻辑处理
    return Promise.reject(error)
  }
)

// API methods
export const hprApi = {
  // Auth test
  async testAuth() {
    console.log('testAuth called, localStorage hpr-credentials:', localStorage.getItem('hpr-credentials'))
    try {
      const response = await api.get('/info')
      console.log('testAuth success:', response.status, response.data)
      return response
    } catch (error) {
      console.log('testAuth failed:', error.response?.status, error.message)
      throw error
    }
  },

  // Repositories
  async getRepositories(page = 1, perPage = 20) {
    return api.get('/repositories', {
      params: { page, per_page: perPage }
    })
  },

  async searchRepositories(query) {
    return api.get('/repositories/search', {
      params: { q: query }
    })
  },

  async getRepository(name) {
    return api.get(`/repositories/${name}`)
  },

  async createRepository(data) {
    // 使用表单数据格式而不是JSON
    const formData = new URLSearchParams()
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    
    return api.post('/repositories', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  async updateRepository(name) {
    return api.put(`/repositories/${name}`)
  },

  async deleteRepository(name) {
    return api.delete(`/repositories/${name}`)
  },

  // System info
  async getInfo() {
    return api.get('/info')
  },

  async getScheduledJobs() {
    return api.get('/info/scheduled')
  },

  async getBusyJobs() {
    return api.get('/info/busy')
  },

  async getJobs(type) {
    // 后端API只提供统计信息，没有具体的任务列表端点
    // 使用现有的统计端点
    if (type === 'scheduled') {
      return this.getScheduledJobs()
    } else if (type === 'busy') {
      return this.getBusyJobs()
    }
    throw new Error(`Unsupported job type: ${type}`)
  },

  async getConfig() {
    return api.get('/config')
  },
  
  async updateConfig(configData) {
    return api.put('/config', configData)
  }
}

export default api
