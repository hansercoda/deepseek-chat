# DeepSeek Chat Interface

一个模仿 DeepSeek 风格的 AI 聊天界面，基于 React 和 Material-UI 构建，支持深度思考模式和联网搜索功能。

## 功能特点

### 用户界面
- 美观的欢迎界面，支持动态过渡效果
- 自定义的 AI 和用户头像显示
- 打字机效果的消息显示
- 深色/浅色主题支持
- 响应式布局设计
- 消息气泡的优雅动画效果

### 交互功能
- 消息发送和接收
- 支持 Shift+Enter 换行
- 消息复制功能
- AI 回复重新生成
- 点赞/点踩反馈系统
- 新建对话功能
- 深度思考模式（R1）
  - 显示 AI 的推理过程
  - 可折叠的推理内容
  - 分步骤打字机效果显示
- 联网搜索模式
- 停止生成功能

### 深度思考模式特点
- 先显示推理过程，后显示最终答案
- 推理内容在独立的可折叠区域显示
- 优化的打字机效果，确保内容按正确顺序显示
- 清晰的视觉区分，帮助用户理解 AI 的思考过程

### 数据持久化
- 本地存储对话历史
- 保存用户偏好设置（深度思考、联网搜索状态）
- 页面刷新后保持状态

## 技术栈

- React 18
- Material-UI (MUI) v5
- Express.js
- DeepSeek API
- LocalStorage API
- CSS-in-JS
- Nginx (用于生产环境部署)
- PM2 (用于 Node.js 进程管理)

## 项目启动

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd deepseek-chat
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 .env 文件并添加：
```
DEEPSEEK_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=production
```

4. 启动后端服务
```bash
node server.js
```

5. 启动前端开发服务器（新终端）
```bash
npm start
```

### 项目结构

```
deepseek-chat/
├── src/
│   ├── components/
│   │   └── ChatInterface.js    # 主要聊天界面组件
│   ├── App.js
│   └── index.js
├── server/
│   └── server.js              # Express 后端服务
├── public/
│   ├── deepseek-color.png     # AI 头像
│   └── user-avatar.png        # 用户头像
├── .env                       # 环境变量配置
└── package.json
```

## 使用说明

1. 基本对话
   - 在输入框输入消息，按回车发送
   - 使用 Shift+Enter 可以在输入框中换行
   - 点击消息右侧的复制图标可以复制消息内容

2. 深度思考模式（R1）
   - 点击"深度思考 (R1)"按钮启用
   - AI 会先显示推理过程，再给出最终答案
   - 点击"已深度思考"可以展开/折叠推理内容

3. 联网搜索模式
   - 点击"联网搜索"按钮启用
   - AI 会结合网络搜索结果回答问题

4. 其他功能
   - 点击停止按钮可以中断当前生成
   - 使用重新生成按钮可以重新生成 AI 回复
   - 点击点赞/点踩按钮可以对回复进行评价
   - 使用新建对话按钮可以开始新的对话

## 注意事项

- 所有内容均由 AI 生成，请仔细甄别
- 建议使用现代浏览器访问以获得最佳体验
- 本地存储空间有限，过多的对话历史可能需要手动清理
- API 密钥请妥善保管，不要泄露

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。在提交之前，请确保：

1. 代码符合项目的编码规范
2. 新功能有适当的测试覆盖
3. 文档已经更新

## 许可证

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## 生产环境部署

### 服务器要求
- Linux 服务器（推荐 Ubuntu 20.04 或更高版本）
- Node.js 16.0.0 或更高版本
- Nginx
- PM2 (`npm install -g pm2`)

### 前端部署步骤

1. 修改前端 API 配置
编辑 `src/components/ChatInterface.js`，将 API 地址改为你的域名：
```javascript
// 将所有 http://localhost:3001 替换为
const API_BASE_URL = 'https://api.yourdomain.com';
```

2. 构建前端项目
```bash
npm run build
```

3. 配置 Nginx
创建 Nginx 配置文件 `/etc/nginx/sites-available/deepseek-chat`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;  # 替换为你的域名

    # SSL 配置（推荐）
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端静态文件
    location / {
        root /path/to/build;  # 替换为你的构建文件路径
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS 配置（如果需要）
        add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

4. 启用 Nginx 配置
```bash
sudo ln -s /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 后端部署步骤

1. 修改后端 CORS 配置
编辑 `server.js`，更新 CORS 配置：
```javascript
const corsOptions = {
    origin: 'https://yourdomain.com',  // 替换为你的域名
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
```

2. 配置环境变量
创建 `.env` 文件：
```
DEEPSEEK_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=production
```

3. 使用 PM2 启动后端服务
```bash
pm2 start server.js --name "deepseek-chat-api"
pm2 save
pm2 startup  # 设置开机自启
```

### 安全配置

1. 配置防火墙
```bash
# Ubuntu UFW
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable
```

2. SSL 证书（推荐使用 Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

3. 设置安全头
在 Nginx 配置中添加：
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 部署检查清单

- [ ] 前端构建成功
- [ ] 后端服务正常运行
- [ ] Nginx 配置正确
- [ ] SSL 证书已安装
- [ ] CORS 配置正确
- [ ] 环境变量设置完成
- [ ] 防火墙规则已配置
- [ ] PM2 进程管理正常
- [ ] 域名 DNS 解析正确

### 常见问题

1. 502 Bad Gateway
- 检查后端服务是否正常运行
- 检查 Nginx 配置中的代理地址是否正确
- 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

2. CORS 错误
- 确保 Nginx 和后端的 CORS 配置与实际域名匹配
- 检查请求头和响应头是否正确
- 使用浏览器开发者工具查看具体错误信息

3. SSL 证书问题
- 确保证书路径正确
- 检查证书是否过期
- 运行 `certbot renew --dry-run` 测试自动续期

4. 性能优化建议
- 启用 Nginx 缓存
- 配置 Gzip 压缩
- 使用 CDN 加速静态资源
- 优化前端构建包大小

## CentOS 服务器部署指南

### 1. 环境准备

```bash
# 更新系统包
sudo yum update -y

# 安装 EPEL 仓库
sudo yum install -y epel-release

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# 安装 Nginx
sudo yum install -y nginx

# 安装 PM2
sudo npm install -g pm2
```

### 2. 项目部署

```bash
# 创建项目目录
sudo mkdir -p /data/deepseek-chat
sudo chown -R $USER:$USER /data/deepseek-chat
cd /data/deepseek-chat

# 克隆项目
git clone [项目地址] .

# 安装依赖
npm install

# 构建前端项目
npm run build

# 创建环境配置文件
cat > .env << EOL
DEEPSEEK_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=production
EOL
```

### 3. Nginx 配置

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/deepseek-chat.conf
```

配置文件内容：
```nginx
server {
    listen 80;
    server_name yourdomain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /data/deepseek-chat/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS 配置
        add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
    }
}
```

### 4. 系统配置

```bash
# SELinux 配置（如果启用）
sudo semanage fcontext -a -t httpd_sys_content_t "/data/deepseek-chat/build(/.*)?"
sudo restorecon -Rv /data/deepseek-chat/build
sudo setsebool -P httpd_can_network_connect 1

# 配置防火墙
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 5. 启动服务

```bash
# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 启动后端服务
cd /data/deepseek-chat
pm2 start server.js --name "deepseek-chat-api"
pm2 save
pm2 startup
```

### 6. SSL 配置（可选）

```bash
# 安装 Certbot
sudo yum install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com
```

## 项目更新指南

### 1. 更新代码

```bash
# 进入项目目录
cd /data/deepseek-chat

# 保存当前 .env 文件
cp .env .env.backup

# 拉取最新代码
git pull

# 还原 .env 文件
cp .env.backup .env

# 安装新依赖
npm install

# 重新构建前端
npm run build
```

### 2. 重启服务

```bash
# 重启后端服务
pm2 restart deepseek-chat-api

# 检查服务状态
pm2 status

# 如果 Nginx 配置有更新，需要重新加载 Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 常见问题排查

1. **权限问题**
```bash
# 检查目录权限
ls -la /data/deepseek-chat

# 修复权限
sudo chown -R $USER:$USER /data/deepseek-chat
```

2. **服务状态检查**
```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 PM2 进程
pm2 status

# 查看后端日志
pm2 logs deepseek-chat-api

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

3. **SELinux 问题**
```bash
# 查看 SELinux 审计日志
sudo tail -f /var/log/audit/audit.log

# 临时禁用 SELinux（测试用）
sudo setenforce 0
```

4. **防火墙检查**
```bash
# 查看防火墙状态
sudo firewall-cmd --list-all

# 检查端口是否开放
sudo firewall-cmd --list-ports
```

### 备份建议

1. 定期备份以下文件：
   - `.env` 文件
   - Nginx 配置文件
   - SSL 证书（如果有）
   - 数据目录（如果有）

2. 建议使用 cron 任务自动备份：
```bash
# 创建备份脚本
0 2 * * * tar -czf /backup/deepseek-chat-$(date +\%Y\%m\%d).tar.gz /data/deepseek-chat/.env /etc/nginx/conf.d/deepseek-chat.conf
``` 