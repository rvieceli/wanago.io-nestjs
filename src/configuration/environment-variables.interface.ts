export interface EnvironmentVariables {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;

  JWT_SECRET: string;
  JWT_EXPIRATION_TIME: string;

  AWS_S3_REGION: string;
  AWS_S3_ACCESS_KEY: string;
  AWS_S3_SECRET_KEY: string;
  AWS_S3_BUCKET: string;

  ELASTICSEARCH_NODE: string;
  ELASTICSEARCH_USERNAME: string;
  ELASTICSEARCH_PASSWORD: string;
}
