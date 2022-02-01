import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { PostNotFoundException } from 'src/posts/exceptions/post-not-found.exception';

@Catch(PostNotFoundException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: PostNotFoundException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    // const request = context.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json({
      message,
      statusCode: status,
      time: new Date().toISOString(),
    });
  }
}
