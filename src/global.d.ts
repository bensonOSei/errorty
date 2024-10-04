type ResponseStatusType = "success" | "error";

type ErrortyResponseType = 'json' | 'text';

interface ILogger {
  error(message: string | object): void;
  warn(message: string | object): void;
  info(message: string | object): void;
  debug(message: string | object): void;
  fatal(message: string | object): void;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: Record<string, unknown>;
}

interface ErrorOverrideConfig {
  path?: string;
  errors?: Array<new (message?: string) => HttpError>;
}

interface ErrortyConfig {
  logger?: ILogger | null;
  showStackTrace?: boolean;
  logRequestDetails?: boolean;
  customErrorMap?: Map<string, number>;
  errorOverrides?: ErrorOverrideConfig;
  ErrortyResponseType?: ErrortyErrorResponseType;
}

type ErrortyLogMessage = string | Record<string, unknown>;

type ErrortyErrorResponseType = 'json' | 'text';
