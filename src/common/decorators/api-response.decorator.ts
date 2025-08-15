import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

/**
 * API响应装饰器
 * 自动包装响应为统一格式
 */
export const ApiResponseWrapper = () => {
  return applyDecorators(UseInterceptors(ResponseInterceptor));
};

/**
 * 控制器级别的响应包装装饰器
 */
export const ApiController = () => {
  return applyDecorators(UseInterceptors(ResponseInterceptor));
};
