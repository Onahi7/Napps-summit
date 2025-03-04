import * as Sentry from '@sentry/nextjs';
import { config } from '@/config/production';

type LogLevel = 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isInitialized = false;

  private constructor() {
    if (config.sentryDsn) {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.nodeEnv,
        tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
      });
      this.isInitialized = true;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    // Console logging
    switch (level) {
      case 'info':
        console.log(JSON.stringify(logData));
        break;
      case 'warn':
        console.warn(JSON.stringify(logData));
        break;
      case 'error':
        console.error(JSON.stringify(logData));
        break;
    }

    // Sentry logging for errors in production
    if (
      this.isInitialized &&
      level === 'error' &&
      config.nodeEnv === 'production'
    ) {
      Sentry.captureException(new Error(message), {
        extra: metadata,
      });
    }
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }

  async flush(): Promise<void> {
    if (this.isInitialized) {
      await Sentry.flush();
    }
  }
}

export const logger = Logger.getInstance();
