import { LogLevel } from "./enums/LogLevel";

export class Logger implements ILogger {
    private logLevel: LogLevel;
  
    constructor(logLevel: LogLevel = LogLevel.INFO) {
      this.logLevel = logLevel;
    }
  
    public setLogLevel(level: LogLevel): void {
      this.logLevel = level;
    }
  
    public error(message: ErrortyLogMessage): void {
      this.log(LogLevel.ERROR, message);
    }
  
    public warn(message: ErrortyLogMessage): void {
      this.log(LogLevel.WARN, message);
    }
  
    public info(message: ErrortyLogMessage): void {
      this.log(LogLevel.INFO, message);
    }
  
    public debug(message: ErrortyLogMessage): void {
      this.log(LogLevel.DEBUG, message);
    }

    private log(level: LogLevel, message: ErrortyLogMessage): void {
      if (level <= this.logLevel) {
        const logEntry = this.formatLogEntry(level, message);
        console.log(JSON.stringify(logEntry));
      }
    }
  
    private formatLogEntry(level: LogLevel, message: ErrortyLogMessage): LogEntry {
      const timestamp = new Date().toISOString();
      const logLevel = LogLevel[level];
  
      if (typeof message === 'string') {
        return {
          timestamp,
          level: logLevel,
          message,
        };
      } else {
        const { message: msg, ...meta } = message;
        return {
          timestamp,
          level: logLevel,
          message: typeof msg === 'string' ? msg : 'No message provided',
          meta,
        };
      }
    }
  }

// Usage example:
// const logger = new Logger(LogLevel.DEBUG);
// logger.info('This is an info message');
// logger.error({ message: 'An error occurred', code: 500, details: { ... } });
