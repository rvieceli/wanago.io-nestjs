import * as Joi from '@hapi/joi';
import { EnvironmentVariables } from './environment-variables.interface';

export const environmentVariableValidationSchema =
  Joi.object<EnvironmentVariables>({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION_TIME: Joi.string().required(),
  });
