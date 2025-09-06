import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_HPR_TARGET || 'http://127.0.0.1:8848',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api/, '')
            console.log(`Proxy rewrite: ${path} -> ${newPath}`)
            return newPath
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 清理一些不必要的头部
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              
              console.log('Sending Request to Target:', req.method, proxyReq.path);
              console.log('Authorization header:', proxyReq.getHeader('authorization'));
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from Target:', proxyRes.statusCode, req.url);
              
              // 如果是401/403错误，移除WWW-Authenticate头部以避免浏览器弹出Basic Auth对话框
              if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
                delete proxyRes.headers['www-authenticate'];
                console.log('Removed WWW-Authenticate header to prevent browser auth dialog');
              }
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  }
})
