import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { EmailScheduleDto } from './dto/email-schedule.dto';
import { EmailScheduleService } from './email-schedule.service';

@Controller('email-scheduling')
export class EmailScheduleController {
  constructor(private emailScheduleService: EmailScheduleService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async scheduleEmail(@Body() data: EmailScheduleDto) {
    this.emailScheduleService.scheduleEmail(data);
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  async cancelAllScheduledEmails() {
    this.emailScheduleService.cancelAllScheduledEmails();
  }
}
