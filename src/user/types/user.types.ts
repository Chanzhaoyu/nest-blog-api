import { User } from 'generated/prisma';

/**
 * 公开的用户信息，不包含敏感字段
 */
export type PublicUser = Omit<
  User,
  | 'password'
  | 'verificationToken'
  | 'verificationTokenExpiry'
  | 'resetToken'
  | 'resetTokenExpiry'
  | 'googleId'
>;

/**
 * 用于认证的用户信息
 */
export type AuthUser = Pick<
  User,
  'id' | 'username' | 'email' | 'password' | 'isVerified' | 'role'
>;

/**
 * 用户创建时的数据类型
 */
export type CreateUserData = Pick<User, 'username' | 'email' | 'password'>;

/**
 * 用户更新时的数据类型
 */
export type UpdateUserData = Partial<
  Pick<
    User,
    | 'username'
    | 'email'
    | 'avatar'
    | 'address'
    | 'phone'
    | 'age'
    | 'gender'
    | 'bio'
  >
> & {
  password?: string;
};
