import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { EmailConfirmationService } from './email-confirmation.service';

@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(private emailConfirmationService: EmailConfirmationService) {}

  @Post('link')
  async confirmWithLink(@Body() { token }: ConfirmEmailDto) {
    const email = await this.emailConfirmationService.decodeConfirmationToken(
      token,
    );
    await this.emailConfirmationService.confirmEmail(email);
  }

  @Post('code')
  @UseGuards(JwtAuthenticationGuard)
  async confirmWithCode(
    @Req() request: Request,
    @Body() { token }: ConfirmEmailDto,
  ) {
    await this.emailConfirmationService.validateToken(
      request.user.verification_code,
      token,
    );
    await this.emailConfirmationService.confirmEmail(request.user.email);

    return request.user;
  }

  @Post('resend')
  @UseGuards(JwtAuthenticationGuard)
  async resendConfirmation(
    @Req() request: Request,
    @Query('verification_mode') verification_mode?: 'link' | 'code',
  ) {
    await this.emailConfirmationService.send(
      request.user.email,
      verification_mode,
    );
  }
}
