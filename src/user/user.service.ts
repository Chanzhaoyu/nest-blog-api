import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as PrismaUser } from 'generated/prisma';
import * as argon2 from 'argon2';
import { PublicUser } from './types/user.types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<PrismaUser> {
    const hashedPassword = await argon2.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        address: true,
        phone: true,
        age: true,
        gender: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(username: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        address: true,
        phone: true,
        age: true,
        gender: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PrismaUser> {
    const data: any = {};

    // 处理基本字段
    if (updateUserDto.username) data.username = updateUserDto.username;
    if (updateUserDto.email) data.email = updateUserDto.email;
    if (updateUserDto.avatar) data.avatar = updateUserDto.avatar;
    if (updateUserDto.address) data.address = updateUserDto.address;
    if (updateUserDto.phone) data.phone = updateUserDto.phone;
    if (updateUserDto.age !== undefined) data.age = updateUserDto.age;
    if (updateUserDto.gender) data.gender = updateUserDto.gender;
    if (updateUserDto.bio) data.bio = updateUserDto.bio;

    // 处理密码（需要哈希）
    if (updateUserDto.password) {
      data.password = await argon2.hash(updateUserDto.password);
    }

    return this.prisma.user.update({
      where: {
        username,
      },
      data,
    });
  }

  remove(username: string): Promise<PrismaUser> {
    return this.prisma.user.delete({
      where: {
        username,
      },
    });
  }
}
