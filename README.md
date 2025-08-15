# Blog 后端系统

一个功能完整的博客系统后端，基于 Nest.js + Prisma + PostgreSQL 构建，提供用户认证、文章管理、评论系统等核心功能。

## 🚀 项目特性

### 核心功能
- **用户系统**: 完整的用户注册、登录、邮箱验证功能
- **认证授权**: JWT + Refresh Token 双令牌认证机制
- **第三方登录**: 支持 Google OAuth 2.0 登录
- **文章管理**: 文章的增删改查、点赞、浏览量统计
- **权限控制**: 基于角色的权限管理(user/author/admin)
- **邮件服务**: 邮箱验证、密码重置邮件发送
- **密码安全**: 使用 Argon2 进行密码哈希

### 技术特性
- **安全防护**: Helmet 安全头部、CORS 跨域配置
- **请求限流**: 针对敏感接口的频率限制
- **数据验证**: 完整的输入验证和类型转换
- **错误处理**: 统一的异常过滤器和错误响应格式
- **响应拦截**: 统一的响应格式包装
- **环境配置**: 完整的环境变量验证

## 📋 技术栈

- **框架**: [Nest.js](https://nestjs.com/) - 企业级 Node.js 框架
- **数据库**: [PostgreSQL](https://www.postgresql.org/) - 关系型数据库
- **ORM**: [Prisma](https://www.prisma.io/) - 现代化数据库工具
- **认证**: [JWT](https://jwt.io/) + [Passport](http://www.passportjs.org/)
- **密码哈希**: [Argon2](https://github.com/ranisalt/node-argon2) - 安全的密码哈希算法
- **邮件服务**: [Nodemailer](https://nodemailer.com/) - 邮件发送
- **验证**: [class-validator](https://github.com/typestack/class-validator) - 数据验证
- **安全**: [Helmet](https://helmetjs.github.io/) - 安全头部中间件

## 🏗️ 系统架构

```
src/
├── auth/           # 认证模块 (注册、登录、JWT)
├── user/           # 用户管理模块
├── posts/          # 文章管理模块
├── mail/           # 邮件服务模块
├── prisma/         # 数据库服务模块
├── common/         # 通用组件 (拦截器、过滤器、工具)
├── config/         # 配置模块 (环境变量验证)
└── examples/       # 示例接口模块
```

## 🛠️ 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- pnpm

### 1. 克隆项目
```bash
git clone <repository-url>
cd nest-examples/backend/blog
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 环境配置
复制环境变量模板并配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键变量：
```bash
# 数据库连接
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog?schema=public"

# JWT 密钥
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/callback/google

# 邮件配置 (可选)
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USER=your_email
MAIL_PASSWORD=your_email_password
```

### 4. 数据库初始化
```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate dev --name init
```

### 5. 启动开发服务器
```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

服务器将在 `http://localhost:3001` 启动。

## 📖 API 文档

详细的 API 文档请查看: [API.md](./API.md)

### API 概览
- **基础URL**: `http://localhost:3001/api`
- **认证方式**: Bearer Token (JWT)
- **文档格式**: RESTful API

### 主要接口模块
- 🔐 **认证接口** (`/auth/*`): 注册、登录、OAuth
- 📝 **文章接口** (`/posts/*`): 文章管理、点赞
- 👤 **用户接口** (`/user/*`): 用户管理
- 🌍 **公开接口** (`/public/*`): 无需认证的公开内容

## 🔧 开发指南

### 数据库管理
```bash
# 查看数据库
pnpm prisma studio

# 重置数据库
pnpm prisma migrate reset

# 生成新迁移
pnpm prisma migrate dev --name your_migration_name
```

### 代码质量
```bash
# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 运行测试
pnpm run test

# 测试覆盖率
pnpm run test:cov
```

## 🔒 安全考虑

### 已实现的安全特性
- ✅ 密码使用 Argon2 哈希算法
- ✅ JWT 访问令牌 + Refresh Token 机制
- ✅ 请求频率限制 (防止暴力攻击)
- ✅ 输入验证和 SQL 注入防护
- ✅ CORS 跨域保护
- ✅ Helmet 安全头部
- ✅ 环境变量验证
- ✅ 邮箱验证机制

### 安全配置建议
1. **生产环境**:
   - 使用强密码的数据库连接
   - 配置合适的 CORS 域名白名单
   - 使用 HTTPS 协议
   - 设置复杂的 JWT 密钥

2. **监控日志**:
   - 监控异常登录尝试
   - 记录关键操作日志
   - 定期检查系统安全

## 🚀 部署指南

### Docker 部署 (推荐)
```bash
# 构建镜像
docker build -t blog-api .

# 运行容器
docker run -p 3001:3001 --env-file .env blog-api
```

### 传统部署
```bash
# 构建生产版本
pnpm run build

# 启动生产服务
pnpm run start:prod
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

[MIT](./license)

