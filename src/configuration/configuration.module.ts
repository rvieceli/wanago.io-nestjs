import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { environmentVariableValidationSchema } from './environment-variables.validation-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validationSchema: environmentVariableValidationSchema,
    }),
  ],
})
export class ConfigurationModule {}
