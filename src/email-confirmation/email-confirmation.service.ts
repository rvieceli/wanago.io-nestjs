import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { VerificationTokenPayload } from './interfaces/verification-token-payload.interface';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigurationService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async send(email: string, mode: 'link' | 'code' = 'link') {
    switch (mode) {
      case 'link':
        await this.sendVerificationLink(email);
        break;
      case 'code':
        await this.sendVerificationCode(email);
        break;
    }
  }

  sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
      expiresIn: this.configService.get(
        'JWT_EMAIL_VERIFICATION_EXPIRATION_TIME',
      ),
    });

    const template = this.configService.get('EMAIL_VERIFICATION_URL');
    const url = template.replace('{token}', token);

    const text = `Welcome, click in the link below to confirm your address \n\n${url}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }

  async sendVerificationCode(email: string) {
    const code = randomBytes(3).toString('hex').toUpperCase();

    const hashed = await bcrypt.hash(code, 2);

    this.usersService.saveVerificationCode(email, hashed);

    const text = `Welcome, you verification code is ${code}.`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }

  async decodeConfirmationToken(token: string) {
    try {
      const payload = this.jwtService.verify<VerificationTokenPayload>(token, {
        secret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
      });

      return payload.email;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async validateToken(token: string, hashedToken: string) {
    const isValid = await bcrypt.compare(token, hashedToken);

    if (!isValid) {
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async confirmEmail(email: string) {
    const user = await this.usersService.getByEmail(email);

    if (!user) {
      throw new BadRequestException('Bad confirmation token');
    }

    await this.usersService.markEmailAsConfirmed(email);
  }
}
