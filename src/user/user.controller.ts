import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseUtil } from '../common';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return ResponseUtil.success(data, '用户创建成功');
  }

  @Get()
  async findAll() {
    const data = await this.userService.findAll();
    return ResponseUtil.success(data, '获取用户列表成功');
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    const data = await this.userService.findOne(username);
    return ResponseUtil.success(data, '获取用户信息成功');
  }

  @Patch(':username')
  async update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.userService.update(username, updateUserDto);
    return ResponseUtil.success(data, '用户信息更新成功');
  }

  @Delete(':username')
  async remove(@Param('username') username: string) {
    const data = await this.userService.remove(username);
    return ResponseUtil.success(data, '用户删除成功');
  }
}
