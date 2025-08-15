import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor, HttpExceptionFilter } from './common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 启用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用安全头部中间件
  app.use(helmet());

  // 启用 Cookie 解析器
  app.use(cookieParser());

  // 启用压缩中间件
  app.use(compression());

  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 启用跨域配置
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  app.enableCors({
    origin: allowedOrigins ? allowedOrigins.split(',') : true,
    credentials: true,
  });

  // 启动服务器
  await app.listen(
    configService.get<number>('PORT') ?? 3001,
    '0.0.0.0',
    async () => {
      logger.log(`Server is running on: ${await app.getUrl()}`);
    },
  );
}
void bootstrap();
