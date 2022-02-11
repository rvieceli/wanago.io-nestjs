import {
  CacheInterceptor,
  CACHE_KEY_METADATA,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string {
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (cacheKey) {
      const httpAdapter = this.httpAdapterHost.httpAdapter;
      const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;

      if (isHttpApp) {
        const request = context.switchToHttp().getRequest<Request>();
        const url = httpAdapter.getRequestUrl(request);
        return `${cacheKey}-${url}`;
      }
    }

    return super.trackBy(context);
  }
}
