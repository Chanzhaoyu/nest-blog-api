import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseUtil } from '../utils/response.util';
import {
  ApiResponse,
  SuccessStatus,
} from '../interfaces/api-response.interface';

/**
 * 响应拦截器 - 统一包装成功响应格式
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        if (this.isApiResponse(data)) {
          return data;
        }

        const request = context.switchToHttp().getRequest();
        const isCreateOperation = request.method === 'POST';

        if (isCreateOperation) {
          return ResponseUtil.success(data, '创建成功', SuccessStatus.CREATED);
        }

        const isUpdateOperation = ['PUT', 'PATCH'].includes(request.method);
        if (isUpdateOperation) {
          return ResponseUtil.success(data, '更新成功', SuccessStatus.UPDATED);
        }

        const isDeleteOperation = request.method === 'DELETE';
        if (isDeleteOperation) {
          return ResponseUtil.success(data, '删除成功', SuccessStatus.DELETED);
        }

        return ResponseUtil.success(data);
      }),
    );
  }

  /**
   * 类型守卫：检查数据是否已经是 ApiResponse 格式
   */
  private isApiResponse<T>(data: T): data is T & ApiResponse<T> {
    return (
      data !== null &&
      data !== undefined &&
      typeof data === 'object' &&
      'code' in data &&
      'data' in data &&
      'message' in data &&
      'status' in data
    );
  }
}
