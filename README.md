# DeepSeek Chat Interface

一个模仿 DeepSeek 风格的 AI 聊天界面，基于 React 和 Material-UI 构建。

## 功能特点

### 用户界面
- 美观的欢迎界面，支持动态过渡效果
- 自定义的 AI 和用户头像显示
- 打字机效果的消息显示
- 深色/浅色主题支持
- 响应式布局设计

### 交互功能
- 消息发送和接收
- 支持 Shift+Enter 换行
- 消息复制功能
- AI 回复重新生成
- 点赞/点踩反馈系统
- 新建对话功能
- 深度思考模式切换
- 联网搜索模式切换

### 数据持久化
- 本地存储对话历史
- 保存用户偏好设置
- 页面刷新后保持状态

## 技术栈

- React
- Material-UI (MUI)
- LocalStorage API
- CSS-in-JS

## 项目启动

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd deepseek
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

5. 预览生产版本
```bash
npm run preview
```

### 项目结构

```
deepseek/
├── src/
│   ├── components/
│   │   └── ChatInterface.js    # 主要聊天界面组件
│   ├── App.js
│   └── main.js
├── public/
│   ├── deepseek-color.png      # AI 头像
│   └── user-avatar.png         # 用户头像
└── package.json
```

## 使用说明

1. 打开应用后，您会看到居中显示的欢迎界面
2. 在输入框中输入消息，按回车发送
3. 使用 Shift+Enter 可以在输入框中换行
4. 点击消息右侧的复制图标可以复制消息内容
5. 使用重新生成按钮可以重新生成 AI 回复
6. 点击点赞/点踩按钮可以对回复进行评价
7. 使用新建对话按钮可以开始新的对话
8. 所有对话内容和设置会自动保存，刷新页面后依然保持

## 注意事项

- 所有内容均由 AI 生成，请仔细甄别
- 建议使用现代浏览器访问以获得最佳体验
- 本地存储空间有限，过多的对话历史可能需要手动清理

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

[添加许可证信息] 