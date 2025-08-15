import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post as PrismaPost } from 'generated/prisma';
import { CurrentUserData } from 'src/auth/decorators/current-user.decorator';
import {
  NotFoundException,
  ForbiddenException,
  ValidationException,
  BusinessException,
} from '../common';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    authorId: string,
  ): Promise<PrismaPost> {
    try {
      // 验证作者是否存在
      const author = await this.prisma.user.findUnique({
        where: { id: authorId },
      });

      if (!author) {
        throw new ValidationException('作者不存在');
      }

      return await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          image: createPostDto.image,
          views: 0,
          likes: 0,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new BusinessException('创建文章失败');
    }
  }

  async findAll(query: GetPostsQueryDto = {}): Promise<{
    posts: PrismaPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        authorId,
      } = query;

      const skip = (page - 1) * limit;

      const where: {
        OR?: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
        authorId?: string;
      } = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (authorId) {
        where.authorId = authorId;
      }

      const total = await this.prisma.post.count({ where });

      const posts = await this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        posts,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Find all posts error:', error);
      throw new BusinessException('获取文章列表失败');
    }
  }

  async findOne(
    id: string,
    incrementViews: boolean = true,
  ): Promise<PrismaPost> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
          where: { id },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 50,
            },
          },
        });

        if (!post) {
          throw new NotFoundException('文章不存在');
        }

        if (incrementViews) {
          await tx.post.update({
            where: { id },
            data: { views: { increment: 1 } },
          });

          post.views += 1;
        }

        return post;
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Find one post error:', error);
      throw new BusinessException('获取文章详情失败');
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    currentUser: CurrentUserData,
  ): Promise<PrismaPost> {
    try {
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, username: true },
          },
        },
      });

      if (!existingPost) {
        throw new NotFoundException('文章不存在');
      }

      if (
        existingPost.authorId !== currentUser.id &&
        currentUser.role !== 'admin'
      ) {
        throw new ForbiddenException('只能编辑自己的文章');
      }

      // 构建更新数据，只包含允许更新的字段
      const updateData: {
        title?: string;
        content?: string;
        image?: string;
      } = {};

      if (updatePostDto.title) {
        updateData.title = updatePostDto.title;
      }

      if (updatePostDto.content) {
        updateData.content = updatePostDto.content;
      }

      if (updatePostDto.image !== undefined) {
        updateData.image = updatePostDto.image;
      }

      return await this.prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Update post error:', error);
      throw new BusinessException('更新文章失败');
    }
  }

  async remove(id: string, currentUser: CurrentUserData): Promise<PrismaPost> {
    try {
      // 首先检查文章是否存在
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, username: true },
          },
        },
      });

      if (!existingPost) {
        throw new NotFoundException('文章不存在');
      }

      // 权限验证：文章作者或管理员可以删除文章
      if (
        existingPost.authorId !== currentUser.id &&
        currentUser.role !== 'admin'
      ) {
        throw new ForbiddenException('只能删除自己的文章');
      }

      return await this.prisma.post.delete({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Delete post error:', error);
      throw new BusinessException('删除文章失败');
    }
  }

  // 新增：点赞功能
  async toggleLike(postId: string) {
    try {
      // 检查文章是否存在
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('文章不存在');
      }

      // 这里可以创建一个单独的 likes 表来记录用户点赞记录
      // 简化起见，这里只是增加/减少点赞数
      // 实际项目中建议创建 PostLike 表来记录用户点赞关系

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }, // 简化实现，实际应该根据用户是否已点赞来决定
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      return {
        message: '点赞成功',
        post: updatedPost,
        liked: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Toggle like error:', error);
      throw new BusinessException('点赞操作失败');
    }
  }
}
