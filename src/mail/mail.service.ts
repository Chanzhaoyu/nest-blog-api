import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('CLIENT_URL');
      const verificationUrl = `${appUrl}/verify-email?token=${token}`;

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: email,
        subject: '验证您的邮箱',
        html: `
           <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333;">验证您的邮箱地址</h2>
            <p>感谢您的注册！请点击下方按钮验证您的邮箱地址：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                验证邮箱
              </a>
            </div>
            <p>如果按钮无法点击，请复制以下链接并粘贴到浏览器中：</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">此链接将在15分钟后过期。</p>
          </div>
        `,
      });

      this.logger.log(`验证邮件已发送至 ${email}`);
    } catch (error) {
      this.logger.error(`发送验证邮件至 ${email} 失败`, error);
      throw new InternalServerErrorException('发送验证邮件失败');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('CLIENT_URL');
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_USER'),
        to: email,
        subject: '重置您的密码',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333;">密码重置请求</h2>
            <p>您请求了密码重置。请点击下方按钮重置您的密码：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                重置密码
              </a>
            </div>
            <p>如果按钮无法点击，请复制以下链接并粘贴到浏览器中：</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px;">此链接将在15分钟后过期。</p>
            <p style="color: #666; font-size: 14px;">如果您没有请求此密码重置，请忽略此邮件。</p>
          </div>
        `,
      });

      this.logger.log(`密码重置邮件已发送至 ${email}`);
    } catch (error) {
      this.logger.error(`发送密码重置邮件至 ${email} 失败`, error);
      throw new InternalServerErrorException('发送密码重置邮件失败');
    }
  }
}
