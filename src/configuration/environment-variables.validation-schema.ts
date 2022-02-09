import * as Joi from '@hapi/joi';
import { EnvironmentVariables } from './environment-variables.interface';

export const environmentVariableValidationSchema =
  Joi.object<EnvironmentVariables>({
    //POSTGRES
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    //JWT
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION_TIME: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
    //AWS_S3
    AWS_S3_REGION: Joi.string().required(),
    AWS_S3_ACCESS_KEY: Joi.string().required(),
    AWS_S3_SECRET_KEY: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().required(),
    //ELASTIC SEARCH
    ELASTICSEARCH_NODE: Joi.string().uri().required(),
    ELASTICSEARCH_USERNAME: Joi.string().required(),
    ELASTICSEARCH_PASSWORD: Joi.string().required(),
  });
