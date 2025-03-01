# DeepSeek Chat Interface

基于 React 和 Material-UI 构建的现代化 AI 聊天界面。

## 功能特点

- 🎨 现代化的用户界面设计
- 💬 实时聊天功能
- 🤖 支持深度思考模式
- 🌐 支持联网搜索
- 📝 打字机效果的消息显示
- 💾 本地存储对话历史
- 📱 响应式设计，支持移动端

## 快速开始

### 克隆项目

```bash
git clone https://github.com/hansercoda/deepseek-chat.git
cd deepseek-chat
```

### 安装依赖

```bash
npm install
```

### 配置环境变量

1. 在项目根目录创建 `.env` 文件
2. 复制 `.env.example` 的内容到 `.env`
3. 配置必要的环境变量：

```bash
# .env
REACT_APP_API_BASE_URL=your_api_base_url
PORT=3000                    # 服务器端口
DEEPSEEK_API_KEY=your_key   # DeepSeek API密钥
```

### 开发环境运行

```bash
npm start
```

### 生产环境构建

```bash
npm run build
```

## 项目结构

```
deepseek-chat/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # React 组件
│   └── ...
├── server.js           # API服务器入口文件
├── .env               # 环境变量配置
├── .env.example       # 环境变量示例
└── ...
```

## 部署说明

### 前端部署

1. 构建项目
```bash
npm run build
```

2. 将 `build` 目录下的文件部署到 Web 服务器

### 后端部署

1. 确保已安装 PM2
```bash
npm install -g pm2
```

2. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
PORT=3333
DEEPSEEK_API_KEY=your_key
```

3. 使用 PM2 启动服务
```bash
# 启动服务
pm2 start server.js --name deepseek-chat

# 查看服务状态
pm2 status

# 查看日志
pm2 logs deepseek-chat

# 重启服务
pm2 restart deepseek-chat

# 停止服务
pm2 stop deepseek-chat
```

4. 配置 PM2 开机自启
```bash
pm2 startup
pm2 save
```

## 安全配置

- 确保所有 API 密钥和敏感信息都存储在 `.env` 文件中
- 将 `.env` 添加到 `.gitignore` 中
- 配置适当的 CORS 策略
- 使用 HTTPS 进行安全通信
- 定期更新依赖包以修复安全漏洞

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 React 最佳实践
- 保持组件的单一职责
- 编写清晰的注释

### 提交规范

```bash
feat: 添加新功能
fix: 修复问题
docs: 修改文档
style: 修改代码格式
refactor: 代码重构
test: 添加测试用例
chore: 修改构建流程或辅助工具
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目地址：[https://github.com/hansercoda/deepseek-chat](https://github.com/hansercoda/deepseek-chat)
- 问题反馈：通过 GitHub Issues 