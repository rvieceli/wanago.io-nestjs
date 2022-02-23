import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class ElasticsearchHealthIndicator extends HealthIndicator {
  constructor(private elasticsearchService: ElasticsearchService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.elasticsearchService.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        `${ElasticsearchHealthIndicator.name} failed`,
        this.getStatus(key, false),
      );
    }
  }
}
