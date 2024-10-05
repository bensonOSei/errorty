import { HttpError } from './errors/HttpError';

// Export all public parts of your library here
export { ErrorHandler } from './Handler';
export { Config } from './Config';
export { Logger } from './Logger';
export { SystemUtils } from './utils/SystemUtils';
export { Response } from './responses/Response';

// Export error classes
export { HttpError } from './errors/HttpError';
export { HttpBadRequest } from './errors/HttpBadRequest';
export { HttpConflict } from './errors/HttpConflict';
export { HttpForbidden } from './errors/HttpForbidden';
export { HttpInternalServerError } from './errors/HttpInternalServerError';
export { HttpNotFound } from './errors/HttpNotFound';
export { HttpTooManyRequests } from './errors/HttpTooManyRequest';
export { HttpUnauthorized } from './errors/HttpUnauthorized';
export { HttpUnprocessableEntity } from './errors/HttpUnprocessableEntity';

// Export enums
export { HttpStatusCodes } from './enums/HttpStatusCodes';
export { LogLevel } from './enums/LogLevel';

// Export interfaces
export { IResponse } from './interfaces/iResponse';
export { ExpressMiddleware, ErrorHandlerMiddleware } from './interfaces/globals';

// Export types and interfaces
export type ResponseStatusType = "success" | "error";

export type ErrortyResponseType = 'json' | 'text';

export interface ILogger {
  error(message: string | object): void;
  warn(message: string | object): void;
  info(message: string | object): void;
  debug(message: string | object): void;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface ErrorOverrideConfig {
  path?: string;
  errors?: Array<new (message?: string) => HttpError>;
}

export interface ErrortyConfig {
  logger?: ILogger | null;
  showStackTrace?: boolean;
  logRequestDetails?: boolean;
  customErrorMap?: Map<string, number>;
  errorOverrides?: ErrorOverrideConfig;
  ErrortyResponseType?: ErrortyErrorResponseType;
}

export type ErrortyLogMessage = string | Record<string, unknown>;

export type ErrortyErrorResponseType = 'json' | 'text';