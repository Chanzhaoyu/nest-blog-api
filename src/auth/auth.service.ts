import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';
import { GoogleUser } from './types/google.types';
import { JwtUserData } from './types/auth.types';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(
    id: string,
    username: string,
    role: string = 'user',
  ): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { id, username, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (existingUser.username === username) {
        throw new ConflictException('用户名已被占用');
      }
    }

    const hashedPassword = await argon2.hash(password);

    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 60 * 15 * 1000);

    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken,
    );

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isVerified: newUser.isVerified,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        isVerified: true,
        role: true,
      },
    });

    const authError = new UnauthorizedException(
      ERROR_MESSAGES.INVALID_CREDENTIALS,
    );
    if (!user || !user.password) throw authError;

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) throw authError;

    if (!user.isVerified)
      throw new UnauthorizedException(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.username,
      user.role,
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleLoginCallback(req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('Google未提供用户数据');
    }

    const { profile } = req.user as GoogleUser;
    const { id, name, emails, photos } = profile;

    if (!emails?.[0]?.value) {
      throw new BadRequestException('Google未提供邮箱信息');
    }

    const email = emails[0].value;
    const username = `${name?.givenName || 'user'}_${Math.random().toString(36).substring(2, 9)}`;
    const avatar = photos?.[0]?.value || null;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId: id }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        googleId: true,
        isVerified: true,
        avatar: true,
        role: true, // 包含角色信息
      } as const,
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username,
          email,
          avatar,
          googleId: id,
          isVerified: true,
          role: 'user', // 默认角色
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          isVerified: true,
          googleId: true,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: id,
          isVerified: true,
          ...(!user.avatar && { avatar }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          isVerified: true,
          googleId: true,
        },
      });
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.username,
      user.role,
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
    if (!user) throw new BadRequestException('无效的令牌');

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.username,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) throw new NotFoundException('用户不存在');

      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 15 * 1000);

      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      await this.mailService.sendPasswordResetEmail(email, resetToken);

      return null;
    } catch {
      throw new BadRequestException('处理密码重置时出错');
    }
  }

  async verifyResetPasswordToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('无效或已过期的重置令牌');
    }

    return { valid: true, email: user.email };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { password } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });
    if (!user) throw new BadRequestException('无效的令牌');

    const hashedPassword = await argon2.hash(password);

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return null;
  }

  async refreshToken(req: Request) {
    // Get refresh token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未找到授权头');
    }

    // Extract token from "Bearer <token>" format
    const refreshTokenSaved = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!refreshTokenSaved) {
      throw new UnauthorizedException('未找到刷新令牌');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new UnauthorizedException('JWT密钥未配置');
      }

      const decoded = this.jwtService.verify(refreshTokenSaved, { secret });
      if (!decoded) throw new UnauthorizedException('无效的刷新令牌');

      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });
      if (!user) throw new UnauthorizedException('用户不存在');

      const { accessToken, refreshToken } = this.generateTokens(
        user.id,
        user.username,
        user.role,
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('无效或已过期的刷新令牌');
    }
  }

  verifyToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        return null;
      }

      const decoded = this.jwtService.verify(token, { secret });
      if (decoded) return decoded.id as string;
      return null;
    } catch {
      return null;
    }
  }

  async getMe(req: Request) {
    const user = req.user as JwtUserData;
    if (!user) throw new UnauthorizedException('用户未认证');

    const userFromDb = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        avatar: true,
      },
    });

    if (!userFromDb) throw new UnauthorizedException('用户不存在');

    return {
      id: userFromDb.id,
      username: userFromDb.username,
      email: userFromDb.email,
      isVerified: userFromDb.isVerified,
      avatar: userFromDb.avatar,
    };
  }
}
