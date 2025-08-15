import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = new Logger(AppLogger.name);
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.debug(message, context);
    }
  }

  verbose(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.verbose(message, context);
    }
  }

  logUserAction(userId: string, action: string, details?: any) {
    const message = `User ${userId} performed action: ${action}`;
    const context = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    this.log(`${message} - ${JSON.stringify(context)}`, 'UserAction');
  }

  logDatabaseQuery(query: string, executionTime: number) {
    if (!this.isProduction) {
      this.debug(`Query executed in ${executionTime}ms: ${query}`, 'Database');
    }
  }

  logSecurityEvent(event: string, userId?: string, details?: any) {
    const message = `Security event: ${event}`;
    const context = {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    };

    this.warn(`${message} - ${JSON.stringify(context)}`, 'Security');
  }
}
