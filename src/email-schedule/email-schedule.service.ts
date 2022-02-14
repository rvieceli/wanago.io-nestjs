import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EmailService } from 'src/email/email.service';
import { EmailScheduleDto } from './dto/email-schedule.dto';

@Injectable()
export class EmailScheduleService {
  constructor(
    private emailService: EmailService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(data: EmailScheduleDto) {
    const date = new Date(data.date);

    const job = new CronJob(date, () => {
      this.emailService.sendMail({
        to: data.recipient,
        subject: data.subject,
        text: data.content,
      });
    });

    this.schedulerRegistry.addCronJob(`${Date.now()}-${data.subject}`, job);

    job.start();
  }

  cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }
}
