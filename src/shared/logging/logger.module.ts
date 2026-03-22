import { SeqLoggerModule } from '@jasonsoft/nestjs-seq';
import { Module } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  imports: [
    SeqLoggerModule.forRoot({
      /** Specifies the HTTP endpoint address of the Seq server for log transmission. */
      serverUrl: process.env.SEQ_SERVER_URL,
      /** Provides the API Key required for authenticating with the Seq server. */
      apiKey: process.env.SEQ_API_KEY,
      /** Optional additional metadata properties to enhance log categorization and filtering. */
      extendMetaProperties: {
        /** Custom service name for the logs to assist in their categorization and filtering within a multi-service environment. */
        serviceName: process.env.SEQ_SERVICE_NAME || 'nestjs-boilerplate',
      },
    }),
  ],
  providers: [LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class LoggerModule {}
