import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { JwtUserData } from '../types/auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedException(
        'Access token not found in Authorization header',
      );
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const decoded = jwt.verify(token, secret) as JwtUserData;

      request['user'] = {
        username: decoded.username,
        id: decoded.id,
        role: decoded.role || 'user',
      } as JwtUserData;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
