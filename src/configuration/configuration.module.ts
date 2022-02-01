import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as Joi from '@hapi/joi';
import { EnvironmentVariables } from './environment-variables.interface';

const environmentVariableValidationSchema = Joi.object<EnvironmentVariables>({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: environmentVariableValidationSchema,
    }),
  ],
})
export class ConfigurationModule {}
