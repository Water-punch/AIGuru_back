import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginRequestType } from './dtos/loginrequesttype .dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleRequest } from 'passport-google-oauth20';
import { LoginRequiredMiddleware } from './loginRequired.middleware';

import { Response } from 'express';

import * as config from 'config';
const jwtConfig = config.get('jwt');

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  private logger = new Logger('userController');

  @Post('/register')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(' user create 요청 실행 !');
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  @Post('/resign')
  @UsePipes(ValidationPipe)
  @UseGuards(LoginRequiredMiddleware)
  async deleteUser(): Promise<boolean> {
    this.logger.log(' user create 요청 실행 !');

    // 유저 탈퇴 처리
    // 유저 쿠키 삭제
    return true;
  }

  @Put('/edit')
  @UsePipes(ValidationPipe)
  @UseGuards(LoginRequiredMiddleware)
  async updateUser(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(' user put 요청 실행 !');
    const newUser = await this.userService.updateUser(updateUserDto);
    return newUser;
  }

  @Post('/login/email')
  async userLoginbyEmail(
    @Body() loginRequest: LoginRequestType,
    @Res() res: Response,
  ): Promise<User> {
    const { email, password } = loginRequest;
    this.logger.log(' user login 요청 실행 !');

    const { user, accessToken, refreshToken } =
      await this.userService.userLoginbyEmail(email, password);

    this.setCookies(res, accessToken, refreshToken);
    return user;
  }

  // @Get('/login/google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth(@Req() req: Request) {}

  // /* Get Google Auth Callback */
  // @Get('/auth/google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthCallback(
  //   @Req() req: GoogleRequest,
  //   @Res() res: Response, // : Promise<GoogleLoginAuthOutputDto>
  // ) {
  //   // return res.send(user);
  //   return this.userService.googleLogin(req, res);
  // }

  // @Post('/logout')
  // async userLogout(): Promise<boolean> {
  //   // 쿠키 삭제
  //   return true;
  // }
  setCookies(@Res() res: Response, accessToken, refreshToken): void {
    const accesscookieExpires = new Date();
    accesscookieExpires.setDate(
      accesscookieExpires.getDate() + +jwtConfig.refresh_expiresIn,
    );
    const refreshcookieExpires = new Date();
    refreshcookieExpires.setDate(
      refreshcookieExpires.getDate() + +jwtConfig.refresh_expiresIn,
    );
    //토큰 설정
    res.cookie('accessToken', accessToken, {
      expires: accesscookieExpires,
      httpOnly: true,
    });

    res.cookie('refreshToken', refreshToken, {
      expires: refreshcookieExpires,
      httpOnly: true,
    });
  }
}
