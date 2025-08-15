import {
  ApiResponse,
  SuccessStatus,
  ErrorStatus,
} from '../interfaces/api-response.interface';

/**
 * 统一响应工具类
 */
export class ResponseUtil {
  /**
   * 创建成功响应
   */
  static success<T>(
    data: T,
    message: string = '成功',
    status: SuccessStatus = SuccessStatus.SUCCESS,
  ): ApiResponse<T> {
    return {
      code: 1,
      data,
      message,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建错误响应
   */
  static error<T = null>(
    message: string = '失败',
    status: ErrorStatus = ErrorStatus.INTERNAL_ERROR,
    data: T = null as T,
  ): ApiResponse<T> {
    return {
      code: 0,
      data,
      message,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建分页成功响应
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '获取成功',
  ): ApiResponse<{
    items: T[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    return this.success(
      {
        items,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      message,
    );
  }
}
