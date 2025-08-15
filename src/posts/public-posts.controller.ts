import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { ResponseUtil } from '../common';

/**
 * 公共文章接口 - 不需要认证
 */
@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 获取公开文章列表
   */
  @Get()
  async findAll(@Query() query: GetPostsQueryDto) {
    const result = await this.postsService.findAll(query);
    return ResponseUtil.paginated(
      result.posts,
      result.total,
      result.page,
      result.limit,
      '获取公开文章列表成功',
    );
  }

  /**
   * 获取单个公开文章
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.postsService.findOne(id, true); // 增加浏览量
    return ResponseUtil.success(data, '获取文章详情成功');
  }

  /**
   * 点赞文章（公开接口）
   */
  @Get(':id/like')
  async toggleLike(@Param('id') postId: string) {
    const data = await this.postsService.toggleLike(postId);
    return ResponseUtil.success(data, '点赞操作成功');
  }
}
