import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { environmentVariableValidationSchema } from './environment-variables.validation-schema';
import { ConfigurationService } from './configuration.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validationSchema: environmentVariableValidationSchema,
    }),
  ],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
class ConfigurationModule {}

export { ConfigurationModule, ConfigurationService };
