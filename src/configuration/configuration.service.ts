import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './environment-variables.interface';

@Injectable()
export class ConfigurationService extends ConfigService<EnvironmentVariables> {}
