/**
 * 统一的API响应格式接口
 */
export interface ApiResponse<T = any> {
  /** 状态码：1 成功，0 失败 */
  code: number;
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  message: string;
  /** 状态描述 */
  status: string;
  /** 时间戳 */
  timestamp?: string;
}

/**
 * 成功响应状态
 */
export enum SuccessStatus {
  SUCCESS = 'Success',
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
}

/**
 * 错误响应状态
 */
export enum ErrorStatus {
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  EXPIRED_TOKEN = 'Expired Token',
  INVALID_TOKEN = 'Invalid Token',
  INTERNAL_ERROR = 'Internal Server Error',
  VALIDATION_ERROR = 'Validation Error',
}
