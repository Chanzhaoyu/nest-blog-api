# Blog API 文档

## 概述

这是一个基于 Nest.js + Prisma + PostgreSQL 的博客系统后端API，提供用户认证、文章管理、评论等功能。

## 基础信息

- **基础URL**: `http://localhost:3001/api`
- **认证方式**: JWT (Bearer Token)
- **数据格式**: JSON

## 通用响应格式

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

分页响应格式：
```json
{
  "success": true,
  "data": [],
  "message": "获取数据成功",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 认证接口 (Auth)

### 1. 用户注册
- **接口**: `POST /auth/register`
- **限流**: 50次/5分钟
- **描述**: 注册新用户账号

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "isVerified": false
  },
  "message": "注册成功"
}
```

### 2. 用户登录
- **接口**: `POST /auth/login`
- **限流**: 50次/5分钟
- **描述**: 用户登录获取访问令牌

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "isVerified": true,
      "role": "user"
    },
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "登录成功"
}
```

### 3. Google OAuth 登录
- **接口**: `GET /auth/google`
- **描述**: 重定向到Google OAuth认证页面

### 4. Google OAuth 回调
- **接口**: `GET /auth/callback/google`
- **描述**: Google OAuth认证回调处理

### 5. 邮箱验证
- **接口**: `GET /auth/verify-email?token={token}`
- **描述**: 验证用户邮箱

### 6. 忘记密码
- **接口**: `POST /auth/forgot-password`
- **限流**: 1次/分钟
- **描述**: 发送密码重置邮件

**请求体**:
```json
{
  "email": "string"
}
```

### 7. 重置密码
- **接口**: `POST /auth/reset-password?token={token}`
- **描述**: 使用重置令牌重置密码

**请求体**:
```json
{
  "password": "string"
}
```

### 8. 刷新令牌
- **接口**: `POST /auth/refresh-token`
- **认证**: 需要 Refresh Token (Cookie)
- **描述**: 刷新访问令牌

### 9. 验证令牌
- **接口**: `POST /auth/verify-token`
- **描述**: 验证访问令牌有效性

**请求体**:
```json
{
  "token": "string"
}
```

### 10. 获取当前用户信息
- **接口**: `GET /auth/me`
- **认证**: 需要 Bearer Token
- **描述**: 获取当前登录用户信息

### 11. 登出
- **接口**: `POST /auth/logout`
- **认证**: 需要 Bearer Token
- **描述**: 用户登出

## 文章接口 (Posts)

### 需认证的文章接口

#### 1. 创建文章
- **接口**: `POST /posts`
- **认证**: 需要 Bearer Token
- **权限**: admin 或 author
- **描述**: 创建新文章

**请求体**:
```json
{
  "title": "string",
  "content": "string",
  "image": "string (可选)"
}
```

#### 2. 获取文章列表
- **接口**: `GET /posts`
- **认证**: 需要 Bearer Token
- **描述**: 获取文章列表（支持分页和搜索）

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `search`: 搜索关键词 (可选)
- `authorId`: 按作者筛选 (可选)

#### 3. 获取单篇文章
- **接口**: `GET /posts/{id}`
- **认证**: 需要 Bearer Token
- **描述**: 获取单篇文章详情 (会增加浏览量)

#### 4. 更新文章
- **接口**: `PATCH /posts/{id}`
- **认证**: 需要 Bearer Token
- **权限**: admin 或文章作者
- **描述**: 更新文章内容

**请求体**:
```json
{
  "title": "string (可选)",
  "content": "string (可选)",
  "image": "string (可选)"
}
```

#### 5. 删除文章
- **接口**: `DELETE /posts/{id}`
- **认证**: 需要 Bearer Token
- **权限**: admin 或文章作者
- **描述**: 删除文章

#### 6. 点赞文章
- **接口**: `POST /posts/{id}/like`
- **认证**: 需要 Bearer Token
- **描述**: 切换文章点赞状态

#### 7. 获取文章预览
- **接口**: `GET /posts/{id}/preview`
- **认证**: 需要 Bearer Token
- **权限**: admin 或 author
- **描述**: 获取文章内容但不增加浏览量 (用于编辑)

### 公开文章接口

#### 1. 获取公开文章列表
- **接口**: `GET /public/posts`
- **认证**: 无需认证
- **描述**: 获取所有公开文章列表

#### 2. 获取公开文章详情
- **接口**: `GET /public/posts/{id}`
- **认证**: 无需认证
- **描述**: 获取单篇公开文章详情

#### 3. 点赞文章 (公开)
- **接口**: `GET /public/posts/{id}/like`
- **认证**: 无需认证
- **描述**: 点赞文章 (公开接口)

## 用户接口 (User)

### 1. 创建用户
- **接口**: `POST /user`
- **认证**: 需要 Bearer Token
- **描述**: 创建新用户

### 2. 获取用户列表
- **接口**: `GET /user`
- **认证**: 需要 Bearer Token
- **描述**: 获取所有用户列表

### 3. 获取用户详情
- **接口**: `GET /user/{username}`
- **认证**: 需要 Bearer Token
- **描述**: 根据用户名获取用户详情

### 4. 更新用户信息
- **接口**: `PATCH /user/{username}`
- **认证**: 需要 Bearer Token
- **描述**: 更新用户信息

### 5. 删除用户
- **接口**: `DELETE /user/{username}`
- **认证**: 需要 Bearer Token
- **描述**: 删除用户

## 示例接口 (Examples)

### 1. 成功响应示例
- **接口**: `GET /examples/success`
- **描述**: 返回成功响应格式示例

### 2. 错误响应示例
- **接口**: `GET /examples/error`
- **描述**: 返回错误响应格式示例

### 3. 分页数据示例
- **接口**: `GET /examples/pagination`
- **查询参数**: `page`, `pageSize`
- **描述**: 返回分页数据格式示例

## 错误码说明

| HTTP状态码 | 说明 |
|-----------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 常见错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 认证说明

1. **注册**: 用户注册后需要验证邮箱才能正常使用
2. **登录**: 登录成功后会返回 accessToken 和 refreshToken
3. **令牌使用**: 在请求头中添加 `Authorization: Bearer {accessToken}`
4. **令牌刷新**: accessToken 过期后使用 refreshToken 刷新
5. **Google登录**: 支持 Google OAuth 2.0 登录

## 权限系统

- **user**: 普通用户，可以查看文章、点赞等
- **author**: 作者，可以创建、编辑自己的文章
- **admin**: 管理员，可以管理所有文章和用户

## 安全特性

- 使用 Helmet 提供安全头部
- 使用 Argon2 进行密码哈希
- JWT 令牌认证
- 请求频率限制
- 跨域资源共享(CORS)配置
- 输入验证和过滤
