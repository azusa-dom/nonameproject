# 留学生家校通 - Student Home School Connect

> 🎓 一款智能解析留学生邮件，自动生成课表和作业提醒，支持家长实时了解孩子学业情况的 App

## 目录

- [📋 项目概述](#overview)
- [🚀 快速开始](#getting-started)
- [📱 应用界面预览](#app-screens)
- [🏗️ 项目架构](#architecture)
- [🤖 AI 解析引擎](#ai-engine)
- [📊 数据模型](#data-models)
- [🔧 API 接口](#api)
- [🔔 推送通知](#notifications)
- [🛡️ 隐私与安全](#privacy-security)
- [📈 部署指南](#deployment)
- [🧪 测试](#testing)
- [📝 开发规范](#code-style)
- [🤝 贡献指南](#contributing)
- [🐛 问题反馈](#issues)
- [📄 许可证](#license)
- [👥 开发团队](#team)
- [🙏 致谢](#thanks)
- [📞 联系我们](#contact)

<a id="overview"></a>

## 📋 项目概述

留学生家校通是一个专为留学生及其家长设计的智能家校沟通平台。通过 AI 技术自动解析学校邮件，提取课程信息、作业截止日期、系统通知等重要信息，帮助学生更好地管理学业，同时让家长能够适度了解孩子的学习状况。

### ✨ 核心功能

**学生端：**
- 🔐 **邮箱智能授权**：支持 Gmail/Outlook 只读授权
- 🤖 **AI 邮件解析**：自动识别课程、作业、通知等信息
- 📅 **智能课表生成**：自动生成个人课程表
- ⏰ **DDL 智能提醒**：作业截止日期倒计时提醒
- 🏠 **家长可见性控制**：灵活控制家长能看到的信息范围

**家长端：**
- 👨‍👩‍👧‍👦 **多孩子管理**：支持绑定多个孩子账户
- 📊 **学业概览**：查看孩子课程安排和作业完成情况
- 🔔 **智能摘要推送**：每周学业摘要通知
- 📞 **紧急联系**：一键联系孩子和学校
- 🛡️ **隐私保护**：严格遵循孩子设置的可见性规则

<a id="getting-started"></a>

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **React Native**: >= 0.72.0
- **Expo CLI**: >= 6.0.0
- **MongoDB**: >= 5.0
- **iOS**: >= 12.0 或 **Android**: >= 8.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/student-home-school-app.git
cd student-home-school-app

# 2. 安装前端依赖
cd frontend
npm install

# 3. 安装后端依赖
cd ../backend
npm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置信息

# 5. 启动 MongoDB
mongod

# 6. 启动后端服务
npm run dev

# 7. 启动前端应用（新终端）
cd ../frontend
expo start
```

### 环境配置

在 `backend/.env` 文件中配置以下环境变量：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/student-home-school

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth 配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=your-redirect-uri

# Microsoft Azure 配置
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_REDIRECT_URI=your-azure-redirect-uri

# 推送通知配置
EXPO_PUSH_TOKEN=your-expo-push-token

# 服务器配置
PORT=3000
NODE_ENV=development
```

<a id="app-screens"></a>

## 📱 应用界面预览

### 学生端界面

**主页 - 智能卡片流**
- 紫色渐变现代设计
- 实时时间显示（支持多时区）
- 按优先级排序的事件卡片
- 置信度提示和待确认标签

**功能特色：**
- 📚 课程卡片：显示课程时间、地点、教师信息
- 📝 作业卡片：DDL 倒计时、提交链接、完成标记
- 🔔 系统通知：维护公告、重要系统消息
- 🎯 活动推荐：讲座、招聘会、社团活动

### 家长端界面

**概览页 - 孩子状态监控**
- 多孩子账户切换
- 孩子当地时间显示
- 学业完成度统计
- 可见性级别说明

**隐私保护：**
- 🔒 **隐藏**：完全不可见
- 📄 **仅摘要**：只显示标题和时间
- 📋 **完整信息**：显示详细内容（不含邮件正文）

<a id="architecture"></a>

## 🏗️ 项目架构

```text
student-home-school-app/
├── frontend/                 # React Native 前端
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── screens/         # 页面组件
│   │   ├── navigation/      # 导航配置
│   │   ├── services/        # API 服务
│   │   └── utils/           # 工具函数
│   ├── App.js              # 主应用入口
│   └── package.json
│
├── backend/                  # Node.js 后端
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由配置
│   │   ├── services/        # 业务逻辑
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── server.js           # 服务器入口
│   └── package.json
│
├── docs/                    # 项目文档
│   ├── api/                # API 文档
│   ├── design/             # 设计稿和原型
│   └── deployment/         # 部署文档
│
└── README.md               # 项目说明
```

<a id="ai-engine"></a>

## 🤖 AI 解析引擎

### 邮件分类算法

```javascript
// 支持的邮件类型
const EMAIL_TYPES = {
  CLASS_EVENT: 'class_event',      // 课程安排
  ASSIGNMENT_DUE: 'assignment_due', // 作业截止
  SYSTEM_NOTICE: 'system_notice',   // 系统通知
  ACTIVITY: 'activity',             // 活动讲座
  RECRUITMENT: 'recruitment'        // 招聘信息
};

// 关键信息提取
const EXTRACTION_FIELDS = [
  'course_code',    // 课程代码 (如 STAT7001)
  'title',          // 事件标题
  'start_time',     // 开始时间
  'end_time',       // 结束时间
  'due_date',       // 截止日期
  'location',       // 地点
  'instructor',     // 教师
  'link'           // 相关链接
];
```

### 置信度计算

AI 解析引擎会为每个提取的事件计算置信度分数：

- **0.9-1.0**：高置信度，信息完整准确
- **0.7-0.9**：中等置信度，主要信息正确
- **0.5-0.7**：低置信度，需要用户确认
- **<0.5**：极低置信度，可能误判

<a id="data-models"></a>

## 📊 数据模型

### 用户模型 (User)

```javascript
{
  id: String,                    // 用户唯一标识
  email: String,                 // 邮箱地址
  name: String,                  // 用户姓名
  userType: 'student' | 'parent', // 用户类型
  emailProvider: 'gmail' | 'outlook', // 邮箱提供商
  timezone: String,              // 时区
  parentBindingCode: String,     // 家长绑定码（学生端）
  children: [String],            // 关联的孩子（家长端）
  parents: [String],             // 关联的家长（学生端）
  lastSyncAt: Date              // 最后同步时间
}
```

### 事件模型 (Event)

```javascript
{
  id: String,                    // 事件唯一标识
  userId: String,                // 所属用户ID
  type: EventType,               // 事件类型
  title: String,                 // 事件标题
  course: String,                // 关联课程
  start_at: Date,               // 开始时间
  end_at: Date,                 // 结束时间
  due_at: Date,                 // 截止时间
  location: String,             // 地点
  link: String,                 // 相关链接
  confidence: Number,           // AI 置信度 (0-1)
  visibility: {                 // 可见性设置
    parent: 'hidden' | 'summary_only' | 'full'
  },
  status: 'new' | 'confirmed' | 'completed' | 'dismissed',
  source: {                     // 邮件来源信息
    provider: String,
    message_id: String,
    subject: String
  }
}
```

<a id="api"></a>

## 🔧 API 接口

### 认证相关

```http
POST /api/auth/register          # 用户注册
POST /api/auth/login            # 用户登录
POST /api/auth/email            # 邮箱授权
POST /api/auth/refresh          # 刷新 Token
```

### 邮件同步

```http
POST /api/sync-emails           # 手动同步邮件
GET  /api/sync-status          # 获取同步状态
```

### 事件管理

```http
GET    /api/events             # 获取事件列表
GET    /api/events/:id         # 获取单个事件
PUT    /api/events/:id         # 更新事件
DELETE /api/events/:id         # 删除事件
POST   /api/events/:id/feedback # 提供反馈
```

### 家长功能

```http
POST /api/parent/bind          # 绑定孩子账户
GET  /api/parent/children      # 获取孩子列表
GET  /api/parent/data/:childId # 获取孩子数据（受可见性限制）
```

<a id="notifications"></a>

## 🔔 推送通知

### 通知类型

1. **DDL 提醒**：作业截止前 24h/2h 推送
2. **课程提醒**：上课前 30 分钟提醒
3. **系统通知**：重要公告和维护通知
4. **每日摘要**：每天 8:00 推送当日安排
5. **每周摘要**：家长端周日晚推送下周概览

### 静默时段

- 默认静默时间：23:00 - 08:00
- 紧急通知不受静默时段限制
- 用户可自定义静默时段

<a id="privacy-security"></a>

## 🛡️ 隐私与安全

### 数据保护

- ✅ **最小权限原则**：仅申请邮箱只读权限
- ✅ **不存储原文**：只保存结构化的提取结果
- ✅ **加密传输**：所有 API 请求使用 HTTPS
- ✅ **Token 过期**：JWT Token 定期过期刷新
- ✅ **GDPR 合规**：支持用户数据导出和删除

### 可见性控制

家长端严格遵循学生设置的可见性规则：

- **服务端验证**：所有家长端 API 都在服务端校验可见性
- **实时同步**：学生修改可见性后，家长端立即生效
- **透明提示**：明确告知家长哪些信息被隐藏

<a id="deployment"></a>

## 📈 部署指南

### 开发环境部署

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 或手动启动各服务
npm run dev:backend    # 启动后端服务
npm run dev:frontend   # 启动前端开发服务器
```

### 生产环境部署

**后端部署（推荐 AWS/Heroku）**

```bash
# 构建生产版本
npm run build

# 使用 PM2 进程管理
pm2 start ecosystem.config.js

# 或使用 Docker
docker build -t student-home-school-backend .
docker run -p 3000:3000 student-home-school-backend
```

**前端部署（推荐 Expo EAS）**

```bash
# 构建 iOS/Android 应用
expo build:ios
expo build:android

# 发布到应用商店
eas submit
```

### 环境变量配置

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | ✅ |
| `AZURE_CLIENT_ID` | Azure AD 客户端 ID | ✅ |
| `EXPO_PUSH_TOKEN` | Expo 推送通知 Token | ✅ |
| `REDIS_URL` | Redis 缓存连接字符串 | ❌ |

<a id="testing"></a>

## 🧪 测试

### 运行测试

```bash
# 后端单元测试
cd backend && npm test

# 前端组件测试
cd frontend && npm test

# 端到端测试
npm run test:e2e
```

### 测试覆盖率

- **后端 API**：> 80%
- **前端组件**：> 70%
- **集成测试**：核心流程 100% 覆盖

<a id="code-style"></a>

## 📝 开发规范

### 代码风格

- **JavaScript**: 使用 ESLint + Prettier
- **React Native**: 遵循 React Native 最佳实践
- **Git**: 使用 Conventional Commits 规范

### 提交规范

```bash
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建工具或依赖更新
```

<a id="contributing"></a>

## 🤝 贡献指南

1. **Fork 项目**到你的 GitHub 账户
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 开发流程

1. 在 Issues 中讨论新功能或 bug
2. 分配任务给对应开发者
3. 开发完成后提交 PR
4. Code Review 通过后合并到主分支
5. 自动部署到测试环境

<a id="issues"></a>

## 🐛 问题反馈

### 常见问题

**Q: 邮箱授权失败怎么办？**
A: 检查网络连接，确保使用的是学校邮箱，并允许第三方应用访问。

**Q: AI 解析结果不准确？**
A: 点击"待确认"标签手动修正，系统会学习你的反馈提升准确率。

**Q: 家长端看不到孩子信息？**
A: 检查绑定码是否正确，以及孩子是否将可见性设置为"隐藏"。

### 提交 Bug 报告

请通过 [GitHub Issues](https://github.com/yourusername/student-home-school-app/issues) 提交问题，并包含：

- 🔍 **详细描述**：问题的具体表现
- 📱 **设备信息**：操作系统、App 版本
- 🔄 **复现步骤**：如何重现这个问题
- 📸 **截图/日志**：相关的错误截图或日志

<a id="license"></a>

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

<a id="team"></a>

## 👥 开发团队

- **项目负责人**: [zczczqzh9@ucl.ac.uk](mailto:zczczqzh9@ucl.ac.uk)
- **后端开发**: [zczczqzh9@ucl.ac.uk](mailto:zczczqzh9@ucl.ac.uk)
- **前端开发**: [zczczqzh9@ucl.ac.uk](mailto:zczczqzh9@ucl.ac.uk)
- **UI/UX 设计**: [zczczqzh9@ucl.ac.uk](mailto:zczczqzh9@ucl.ac.uk)

<a id="thanks"></a>

## 🙏 致谢

感谢以下开源项目和服务：

- [React Native](https://reactnative.dev/) - 跨平台移动应用框架
- [Expo](https://expo.dev/) - React Native 开发平台
- [Node.js](https://nodejs.org/) - JavaScript 运行环境
- [MongoDB](https://www.mongodb.com/) - 文档数据库
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/) - Microsoft 365 数据访问
- [Google APIs](https://developers.google.com/apis-explorer) - Google 服务集成

---

<a id="contact"></a>

## 📞 联系我们

- **邮箱**: zczczqzh9@ucl.ac.uk
- **官网**: [student-home-school.com](https://student-home-school.com)
- **微信群**: 扫码加入开发者交流群

<p align="center">
  <img src="https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=WeChat+QR" alt="微信群二维码" width="200">
</p>

---

<p align="center">
  Made with ❤️ for international students and their families
</p>

<p align="center">
  <a href="#readme">⬆️ 回到顶部</a>
</p>