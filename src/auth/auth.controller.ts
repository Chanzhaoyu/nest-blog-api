import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { ResponseUtil } from '../common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({
    default: {
      limit: 50,
      ttl: 60 * 5 * 1000,
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return ResponseUtil.success(result, '注册成功');
  }

  @Post('login')
  @Throttle({
    default: {
      limit: 50,
      ttl: 60 * 5 * 1000,
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseUtil.success(result, '登录成功');
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  googleLogin() {}

  @Get('callback/google')
  @UseGuards(PassportAuthGuard('google'))
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLoginCallback(req);
    const { accessToken, refreshToken } = result;

    const clientUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;

    return res.redirect(redirectUrl);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return ResponseUtil.success(result, '邮箱验证成功');
  }

  @Post('forgot-password')
  @Throttle({
    default: {
      limit: 1,
      ttl: 60 * 1000,
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return ResponseUtil.success(result, '重置密码邮件已发送');
  }

  @Get('verify-password')
  async verifyResetPasswordToken(@Query('token') token: string) {
    const result = await this.authService.verifyResetPasswordToken(token);
    return ResponseUtil.success(result, '重置密码令牌验证成功');
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const result = await this.authService.resetPassword(
      token,
      resetPasswordDto,
    );
    return ResponseUtil.success(result, '密码重置成功');
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    const result = await this.authService.refreshToken(req);
    return ResponseUtil.success(result, '令牌刷新成功');
  }

  @Post('verify-token')
  verifyToken(@Body() body: { token: string }) {
    const result = this.authService.verifyToken(body.token);

    if (result) {
      return ResponseUtil.success(
        { valid: true, userId: result },
        '令牌验证成功',
      );
    }
    return ResponseUtil.success({ valid: false, userId: null }, '令牌无效');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request) {
    const result = this.authService.getMe(req);
    return ResponseUtil.success(result, '获取用户信息成功');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout() {
    return ResponseUtil.success(null, '登出成功');
  }
}
