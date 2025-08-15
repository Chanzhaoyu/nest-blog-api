import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;

  @IsString()
  @IsOptional()
  image?: string;

  // 移除 views, likes, authorId - 这些应该由系统自动处理
  // views 和 likes 初始值为 0
  // authorId 从当前用户上下文中获取
}
