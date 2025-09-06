# HPR 管理面板

一个用于管理 [HPR (Git Hosts' Repositories)](https://github.com/icyleaf/hpr) 仓库镜像的现代化 Vue.js 前端面板。

> 注意：本项目仅用于学习和研究，不建议在生产环境中使用。

## 功能特性

- 🔐 用户认证（支持自定义用户名密码，存储在 localStorage）
- 📊 实时仪表板显示系统状态和统计信息
- 📦 仓库管理（创建、更新、删除、搜索镜像仓库）
- 🔍 仓库搜索和分页浏览
- 📋 仓库详细信息查看
- 🔄 实时任务状态监控
- 📱 响应式设计，支持移动端

## 快速开始

### 前置要求

- Node.js 16+ 
- 运行中的 HPR 服务 (默认在 http://127.0.0.1:8848)

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 (或自动分配的端口) 即可使用管理面板。

开发环境已配置反向代理，会将 `/api/*` 请求代理到 `http://127.0.0.1:8848`，解决跨域问题。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。生产环境需要配置 Nginx 反向代理。

## 生产环境部署

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8848/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 默认配置

项目通过环境变量进行配置：

### 开发环境 (.env.development)
- `VITE_API_BASE_URL=/api` - API基础路径
- `VITE_HPR_TARGET=http://127.0.0.1:8848` - HPR服务地址

### 生产环境 (.env.production)  
- `VITE_API_BASE_URL=/api` - API基础路径

### 本地覆盖 (.env.local)·
你可以创建 `.env.local` 文件来覆盖默认配置，例如：
```
VITE_API_BASE_URL=/api
VITE_HPR_TARGET=http://192.168.1.100:8848
```

开发环境已配置反向代理，会将前端的 `/api/*` 请求代理到 HPR 服务地址。

## 搭建

### GitLab

```bash
docker run -d --name gitlab -p 8080:80 -p 8022:22 --restart always -v gitlab_config:/etc/gitlab -v gitlab_logs:/var/log/gitlab -v gitlab_data:/var/opt/gitlab gitlab/gitlab-ce:latest
```

### hpr

```bash
mkdir hpr && cd hpr
curl -fsSL -o hpr.yml https://raw.githubusercontent.com/icyleaf/hpr/master/config/hpr.example.yml
docker run --name hpr --restart=unless-stopped -d \
             -p 8848:8848 \
             -v `pwd`/hpr.yml:/app/config/hpr.yml \
             -e HPR_SSH_HOST=<gitlab ssh host> \
             -e HPR_SSH_PORT=<gitlab ssh port> \
             icyleafcn/hpr
```

## 参考资料

- https://hpr.ews.im/
