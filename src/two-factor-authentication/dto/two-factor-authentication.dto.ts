import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
