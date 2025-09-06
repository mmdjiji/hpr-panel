/**
 * 主题管理工具
 */

// 主题类型
export const ThemeType = {
  LIGHT: 'light',
  DARK: 'dark'
}

// 本地存储键名
const THEME_KEY = 'hpr-panel-theme'

/**
 * 获取当前主题
 * @returns {string} 当前主题类型
 */
export function getCurrentTheme() {
  // 优先从本地存储获取
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme && Object.values(ThemeType).includes(savedTheme)) {
    return savedTheme
  }
  
  // 如果没有保存过主题，则根据系统偏好设置
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return ThemeType.DARK
  }
  
  // 默认使用亮色主题
  return ThemeType.LIGHT
}

/**
 * 设置主题
 * @param {string} theme 主题类型
 */
export function setTheme(theme) {
  if (!Object.values(ThemeType).includes(theme)) {
    console.error(`Invalid theme: ${theme}`)
    return
  }
  
  // 保存到本地存储
  localStorage.setItem(THEME_KEY, theme)
  
  // 应用主题
  applyTheme(theme)
}

/**
 * 切换主题
 * @returns {string} 切换后的主题类型
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT
  
  setTheme(newTheme)
  return newTheme
}

/**
 * 应用主题
 * @param {string} theme 主题类型
 */
export function applyTheme(theme) {
  // 移除现有主题类
  document.documentElement.classList.remove(ThemeType.LIGHT, ThemeType.DARK)
  
  // 添加新主题类
  document.documentElement.classList.add(theme)
  
  // 设置Element Plus主题
  document.documentElement.setAttribute('data-theme', theme)
  
  // 设置meta主题色
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === ThemeType.DARK ? '#1a1a1a' : '#ffffff'
    )
  }
}

/**
 * 初始化主题
 */
export function initTheme() {
  const theme = getCurrentTheme()
  applyTheme(theme)
  
  // 监听系统主题变化
  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    colorSchemeQuery.addEventListener('change', (e) => {
      // 只有在用户没有手动设置过主题时，才跟随系统变化
      if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? ThemeType.DARK : ThemeType.LIGHT
        applyTheme(newTheme)
      }
    })
  }
}