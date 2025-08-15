import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  CurrentUser,
  CurrentUserData,
} from 'src/auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common';

@UseGuards(AuthGuard, RolesGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles('admin', 'author')
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('id') authorId: string,
  ) {
    const data = await this.postsService.create(createPostDto, authorId);
    return ResponseUtil.success(data, '文章创建成功');
  }

  @Get()
  async findAll(@Query() query: GetPostsQueryDto) {
    const result = await this.postsService.findAll(query);
    return ResponseUtil.paginated(
      result.posts,
      result.total,
      result.page,
      result.limit,
      '获取文章列表成功',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.postsService.findOne(id, true); // 增加浏览量
    return ResponseUtil.success(data, '获取文章详情成功');
  }

  @Roles('admin', 'author')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    const data = await this.postsService.update(id, updatePostDto, currentUser);
    return ResponseUtil.success(data, '文章更新成功');
  }

  @Roles('admin', 'author')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    const data = await this.postsService.remove(id, currentUser);
    return ResponseUtil.success(data, '文章删除成功');
  }

  // 新增：点赞接口
  @Post(':id/like')
  async toggleLike(@Param('id') postId: string) {
    const data = await this.postsService.toggleLike(postId);
    return ResponseUtil.success(data, '点赞操作成功');
  }

  // 新增：获取文章但不增加浏览量（供编辑时使用）
  @Get(':id/preview')
  @Roles('admin', 'author')
  async getPostForEdit(@Param('id') id: string) {
    const data = await this.postsService.findOne(id, false); // 不增加浏览量
    return ResponseUtil.success(data, '获取文章预览成功');
  }
}
