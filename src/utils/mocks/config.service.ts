import { EnvironmentVariables } from 'src/configuration/environment-variables.interface';

const environmentVariables = {
  JWT_SECRET: 'test',
  JWT_EXPIRATION_TIME: '1d',
} as EnvironmentVariables;

export const mockedConfigService = {
  get(key: keyof EnvironmentVariables) {
    return environmentVariables[key];
  },
};
