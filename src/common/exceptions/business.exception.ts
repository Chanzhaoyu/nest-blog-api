import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorStatus } from '../interfaces/api-response.interface';

/**
 * 业务异常基类
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorStatus: ErrorStatus = ErrorStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

/**
 * 认证异常
 */
export class AuthException extends BusinessException {
  constructor(message: string = '认证失败') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorStatus.UNAUTHORIZED);
  }
}

/**
 * Token过期异常
 */
export class TokenExpiredException extends BusinessException {
  constructor(message: string = 'Token已过期') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorStatus.EXPIRED_TOKEN);
  }
}

/**
 * Token无效异常
 */
export class InvalidTokenException extends BusinessException {
  constructor(message: string = 'Token无效') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorStatus.INVALID_TOKEN);
  }
}

/**
 * 权限不足异常
 */
export class ForbiddenException extends BusinessException {
  constructor(message: string = '权限不足') {
    super(message, HttpStatus.FORBIDDEN, ErrorStatus.FORBIDDEN);
  }
}

/**
 * 资源不存在异常
 */
export class NotFoundException extends BusinessException {
  constructor(message: string = '资源不存在') {
    super(message, HttpStatus.NOT_FOUND, ErrorStatus.NOT_FOUND);
  }
}

/**
 * 验证异常
 */
export class ValidationException extends BusinessException {
  constructor(message: string = '数据验证失败') {
    super(message, HttpStatus.BAD_REQUEST, ErrorStatus.VALIDATION_ERROR);
  }
}
