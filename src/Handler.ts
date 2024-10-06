import { Request, Response as ExpressResponse, NextFunction } from "express";
import { HttpStatusCodes } from "./enums/HttpStatusCodes";
import { HttpError } from "./errors/HttpError";
import { Config } from "./Config";
import { SystemUtils } from "./utils/SystemUtils";
import { Response } from "./responses/Response";

export class ErrorHandler {
  private static config: Config;
  private static initialized: boolean = false;
  private static initPromise: Promise<void> | null = null;

  public static async initialize(): Promise<void> {
    if (ErrorHandler.initialized) return;
    if (ErrorHandler.initPromise) return ErrorHandler.initPromise;

    ErrorHandler.initPromise = ErrorHandler.performInit();
    await ErrorHandler.initPromise;
    ErrorHandler.initialized = true;
  }

  public static initializeSync(errortyConfig?: ErrortyConfig): void {
    if (ErrorHandler.initialized) return;
    ErrorHandler.config = Config.getInstance();
    ErrorHandler.config.initSync(errortyConfig || {});
    ErrorHandler.initialized = true;
  }

  private static async performInit(
    errortyConfig?: ErrortyConfig
  ): Promise<void> {
    ErrorHandler.config = Config.getInstance();
    if (errortyConfig) {
      await ErrorHandler.config.init(errortyConfig);
    } else
      await ErrorHandler.config.init({
        // Add your async config options here
      });
  }

  public static isInitialized(): boolean {
    return ErrorHandler.initialized;
  }

  public static handleError = (
    err: Error,
    req: Request,
    res: ExpressResponse,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
  ): void => {
    if (!ErrorHandler.initialized) {
      console.error(
        "ErrorHandler not initialized. Initializing synchronously..."
      );
      ErrorHandler.initializeSync();
    }

    const logger = ErrorHandler.config.getLogger();
    const isProduction = SystemUtils.isProduction();

    let httpError: HttpError;
    if (err instanceof HttpError) {
      httpError = err;
    } else {
      const ErrorClass =
        ErrorHandler.config.getErrorClass(err.name) ||
        ErrorHandler.config.getErrorClass("HttpInternalServerError");

      if (ErrorClass) {
        httpError = new ErrorClass(err.message);
      } else {
        httpError = new HttpError(
          err.message,
          HttpStatusCodes.INTERNAL_SERVER_ERROR
        );
        logger.warn(
          `No error class found for "${err.name}". Using generic HttpError.`
        );
      }
    }

    const statusCode = httpError.statusCode;
    let message = httpError.message;

    if (isProduction && statusCode === HttpStatusCodes.INTERNAL_SERVER_ERROR) {
      message = "Internal Server Error";
    }

    if (ErrorHandler.config.shouldLogRequestDetails()) {
      logger.error({
        message: `Error: ${message}`,
        statusCode,
        name: httpError.name,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      });
    } else {
      logger.error(`Error: ${message} | Status Code: ${statusCode}`);
    }

    const errorResponse: Record<string, unknown> = { message };
    if (ErrorHandler.config.shouldShowStackTrace() && !isProduction) {
      errorResponse.stack = httpError.stack;
    }

    ErrorHandler.sendErrorResponse(res, errorResponse, message, statusCode);
  };

  private static sendErrorResponse(
    res: ExpressResponse,
    errorData: Record<string, unknown>,
    message: string,
    statusCode: number
  ): void {
    const ErrortyResponseType = ErrorHandler.config.getErrortyResponseType();
    const errorResponse = Response.error(errorData, message, statusCode);
    console.log({ errorResponse });
    if (ErrortyResponseType === "json") {
      res.status(statusCode).json(errorResponse);
    } else {
      res.status(statusCode).type("text/plain").send(`Error: ${message}`);
    }
  }

  public static handleNotFound = (req: Request, res: ExpressResponse): void => {
    if (!ErrorHandler.initialized) {
      console.error(
        "ErrorHandler not initialized. Initializing synchronously..."
      );
      ErrorHandler.initializeSync();
    }

    const message = `Cannot ${req.method} ${req.path}`;
    const logger = ErrorHandler.config.getLogger();
    logger.warn({
      message: `Route not found: ${message}`,
      path: req.path,
      method: req.method,
    });
    ErrorHandler.sendErrorResponse(
      res,
      { path: req.path },
      message,
      HttpStatusCodes.NOT_FOUND
    );
  };

  public static initializeUnhandledExceptionHandlers(): void {
    if (!ErrorHandler.initialized) {
      console.error(
        "ErrorHandler not initialized. Initializing synchronously..."
      );
      ErrorHandler.initializeSync();
    }

    const logger = ErrorHandler.config.getLogger();

    process.on("uncaughtException", (err: Error) => {
      logger.error({
        message: "Uncaught Exception",
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    });

    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        logger.error({
          message: "Unhandled Rejection",
          reason: ErrorHandler.formatRejectionReason(reason),
          promise: `Promise: ${promise}`,
        });
        process.exit(1);
      }
    );
  }

  private static formatRejectionReason(reason: unknown): string {
    if (reason instanceof Error) {
      return `${reason.message}\nStack: ${reason.stack}`;
    }
    return String(reason);
  }
}
