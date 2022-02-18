import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Observable } from 'rxjs';

@Injectable()
export class CustomClassSerializerInterceptorInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo<GraphQLResolveInfo>();

      if (info.operation.operation === 'subscription') {
        return next.handle();
      }
    }

    return super.intercept(context, next);
  }
}
