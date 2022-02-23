import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ElasticsearchHealthIndicator } from './indicators/elasticsearch-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private elasticsearchHealthIndicator: ElasticsearchHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () =>
        this.memoryHealthIndicator.checkHeap('memory heap', 300 * 1024 * 1024),
      () =>
        this.memoryHealthIndicator.checkRSS('memory RSS', 300 * 1024 * 1024),
      () =>
        this.diskHealthIndicator.checkStorage('disk', {
          thresholdPercent: 0.5,
          path: '/',
        }),
      () => this.elasticsearchHealthIndicator.isHealthy('elasticsearch'),
    ]);
  }
}
