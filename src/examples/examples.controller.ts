import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ResponseUtil,
  NotFoundException,
  ForbiddenException,
  ValidationException,
} from '../common';

/**
 * 示例控制器 - 展示统一响应格式的使用方法
 */
@Controller('examples')
export class ExamplesController {
  /**
   * 示例1: 返回成功数据（将被响应拦截器自动包装）
   */
  @Get('auto-wrap')
  getAutoWrapExample() {
    return [1, 2, 3];
  }

  /**
   * 示例2: 手动返回标准格式响应
   */
  @Get('manual-wrap')
  getManualWrapExample() {
    return ResponseUtil.success({ users: [], count: 0 }, '获取用户列表成功');
  }

  /**
   * 示例3: 返回分页数据
   */
  @Get('pagination')
  getPaginationExample(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    const mockData = Array.from({ length: size }, (_, i) => ({
      id: (pageNum - 1) * size + i + 1,
      title: `文章 ${(pageNum - 1) * size + i + 1}`,
      content: `这是第 ${(pageNum - 1) * size + i + 1} 篇文章的内容`,
    }));

    return ResponseUtil.paginated(
      mockData,
      100,
      pageNum,
      size,
      '获取分页数据成功',
    );
  }

  /**
   * 示例4: 模拟错误（会被异常过滤器处理）
   */
  @Get('error/:type')
  getErrorExample(@Param('type') type: string) {
    switch (type) {
      case 'not-found':
        throw new NotFoundException('请求的资源不存在');
      case 'forbidden':
        throw new ForbiddenException('没有权限访问该资源');
      case 'validation':
        throw new ValidationException('输入的数据格式不正确');
      default:
        throw new Error('未知错误类型');
    }
  }
}
