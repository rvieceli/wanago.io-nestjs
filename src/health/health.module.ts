import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SearchModule } from 'src/search/search.module';
import { HealthController } from './health.controller';
import { ElasticsearchHealthIndicator } from './indicators/elasticsearch-health.indicator';

@Module({
  imports: [TerminusModule, SearchModule],
  controllers: [HealthController],
  providers: [ElasticsearchHealthIndicator],
})
export class HealthModule {}
