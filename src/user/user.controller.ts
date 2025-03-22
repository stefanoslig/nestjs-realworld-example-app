import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './user.decorator';
import { IUserRO } from './user.interface';
import { UserService } from './user.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user')
  async findMe(@User('email') email: string): Promise<IUserRO> {
    return this.userService.findByEmail(email);
  }

  @Put('user')
  async update(
    @User('id') userId: number,
    @Body('user') userData: UpdateUserDto,
  ) {
    return this.userService.update(userId, userData);
  }

  @Post('users')
  async create(
    @Body('user') userData: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const newUser = await this.userService.create(userData);
    
    const token = await this.userService.generateJWT(newUser);
    
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    
    return newUser;
  }

  @Delete('users/:email')
  async delete(@Param() params: string): Promise<any> {
    return this.userService.delete(params);
  }

  @UsePipes(new ValidationPipe())
  @Post('users/login')
  async login(
    @Body('user') loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IUserRO> {
    const foundUser = await this.userService.findOne(loginUserDto);

    const errors = { message: 'User not found' };
    if (!foundUser) {
      throw new HttpException({ errors }, 401);
    }
    const token = await this.userService.generateJWT(foundUser);

    response.cookie('jwt', token, {
      httpOnly: true, // prevents client-side JavaScript from reading the cookie
      secure: true, // ensure cookie is sent only over HTTPS (set to false in dev if needed)
      sameSite: 'none', // helps mitigate CSRF attacks
    });

    const { email, username, bio, image } = foundUser;
    const user = { email, username, bio, image };
    return { user };
  }

  @Post('users/logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    response.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { message: 'Logged out successfully.' };
  }
}
