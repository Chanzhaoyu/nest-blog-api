// 定义系统中的用户角色
export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [UserRole.USER]: ['read:posts', 'create:comments', 'like:posts'],
  [UserRole.AUTHOR]: [
    'read:posts',
    'create:posts',
    'update:own-posts',
    'delete:own-posts',
    'create:comments',
    'like:posts',
  ],
  [UserRole.ADMIN]: [
    'read:posts',
    'create:posts',
    'update:any-posts',
    'delete:any-posts',
    'create:comments',
    'like:posts',
    'manage:users',
    'manage:roles',
  ],
};

// 检查用户是否有特定权限
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// 检查角色层级（用于权限升级验证）
export function isRoleHigherOrEqual(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.AUTHOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
