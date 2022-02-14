import { Module } from '@nestjs/common';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigurationModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
