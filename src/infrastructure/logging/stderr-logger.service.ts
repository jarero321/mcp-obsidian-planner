import { Injectable } from '@nestjs/common';
import { LoggerPort, LogContext } from '@application/ports';

@Injectable()
export class StderrLoggerService implements LoggerPort {
  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('ERROR', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  private log(level: string, message: string, context?: LogContext): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  }
}
