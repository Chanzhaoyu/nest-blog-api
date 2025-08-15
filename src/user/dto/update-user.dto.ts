import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsIn,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名至少需要3个字符' })
  @MaxLength(20, { message: '用户名最多只能20个字符' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: '请提供有效的邮箱地址' })
  email?: string;

  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  password?: string;

  @IsOptional()
  @IsUrl({}, { message: '头像必须是有效的URL地址' })
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '地址最多只能500个字符' })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '电话号码最多只能20个字符' })
  phone?: string;

  @IsOptional()
  @IsInt({ message: '年龄必须是整数' })
  @Min(1, { message: '年龄至少为1岁' })
  @Max(150, { message: '年龄最多为150岁' })
  age?: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other'], {
    message: '性别必须是男性、女性或其他',
  })
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '个人简介最多只能1000个字符' })
  bio?: string;
}
