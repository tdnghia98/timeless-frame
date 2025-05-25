import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
class GlobalExceptionLogger implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    // Log error with message only (workaround for Logger.error argument issue)
    let msg = `Unhandled error: ${exception?.message || exception}`;
    if (request?.method) msg += ` | ${request.method}`;
    if (request?.url) msg += ` ${request.url}`;
    Logger.error(msg);
    response.status(500).json({ error: 'Internal server error' });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalFilters(new GlobalExceptionLogger());
  await app.listen(4000);
}
bootstrap();
