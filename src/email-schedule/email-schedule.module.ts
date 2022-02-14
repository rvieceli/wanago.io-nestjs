import { Module } from '@nestjs/common';
import { EmailScheduleService } from './email-schedule.service';
import { EmailScheduleController } from './email-schedule.controller';
import { EmailModule } from 'src/email/email.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [EmailModule, AuthenticationModule],
  providers: [EmailScheduleService],
  controllers: [EmailScheduleController],
})
export class EmailScheduleModule {}
