import { Global, Module } from '@nestjs/common';
import { LOGGER_PORT } from '@application/ports';
import { StderrLoggerService } from './stderr-logger.service';

@Global()
@Module({
  providers: [
    StderrLoggerService,
    {
      provide: LOGGER_PORT,
      useExisting: StderrLoggerService,
    },
  ],
  exports: [LOGGER_PORT],
})
export class LoggingModule {}
