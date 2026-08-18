import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { RequestLoggingInterceptor } from '@/common/interceptors/request-logging.interceptor';
import { configuration } from '@/config/configuration';
import { envValidationSchema } from '@/config/env.validation';
import { HealthModule } from '@/v1/modules/health/health.module';
import { RoomsModule } from '@/v1/modules/rooms/rooms.module';
import { VisitorsModule } from '@/v1/modules/visitors/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    HealthModule,
    RoomsModule,
    VisitorsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
