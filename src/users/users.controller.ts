import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      request.user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Post('files')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addPrivateFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addPrivateFile(
      request.user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('/files/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getPrivateFile(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const file = await this.usersService.getPrivateFile(request.user.id, id);
    file.stream.pipe(response);
  }

  @Get('files')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPrivateFiles(@Req() request: Request) {
    return this.usersService.getAllPrivateFiles(request.user.id);
  }
}
