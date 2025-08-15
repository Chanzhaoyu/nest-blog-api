export const ERROR_MESSAGES = {
  // 认证相关
  INVALID_CREDENTIALS: '邮箱或密码不正确',
  EMAIL_NOT_VERIFIED: '请先验证您的邮箱后再登录',
  UNAUTHORIZED: '需要身份验证',
  FORBIDDEN: '访问被拒绝',
  INVALID_TOKEN: '无效或已过期的令牌',

  // 用户管理
  USER_NOT_FOUND: '用户不存在',
  USER_ALREADY_EXISTS: '用户已存在',
  EMAIL_ALREADY_EXISTS: '邮箱已被使用',
  USERNAME_ALREADY_EXISTS: '用户名已被占用',

  // 文章相关
  POST_NOT_FOUND: '文章不存在',
  POST_CREATE_FAILED: '创建文章失败',
  POST_UPDATE_FAILED: '更新文章失败',
  POST_DELETE_FAILED: '删除文章失败',
  INSUFFICIENT_PERMISSIONS: '权限不足，无法执行此操作',

  // 验证相关
  VALIDATION_FAILED: '验证失败',
  INVALID_EMAIL: '请提供有效的邮箱地址',
  PASSWORD_TOO_SHORT: '密码至少需要8个字符',

  // 系统相关
  INTERNAL_ERROR: '服务器内部错误',
  SERVICE_UNAVAILABLE: '服务暂时不可用',

  // 邮件相关
  EMAIL_SEND_FAILED: '发送邮件失败',
  VERIFICATION_EMAIL_SENT: '验证邮件发送成功',
  PASSWORD_RESET_EMAIL_SENT: '密码重置邮件发送成功',

  // Google OAuth
  GOOGLE_AUTH_FAILED: 'Google身份验证失败',
  NO_GOOGLE_EMAIL: 'Google未提供邮箱信息',
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
