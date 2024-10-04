import { HttpError } from "./errors/HttpError";
import { Logger } from "./Logger";
import { HttpStatusCodes } from "./enums/HttpStatusCodes";
import fs from "fs";
import path from "path";
import { HttpBadRequest } from "./errors/HttpBadRequest";
import { HttpConflict } from "./errors/HttpConflict";
import { HttpInternalServerError } from "./errors/HttpInternalServerError";

type ErrorConstructor = new (message?: string) => HttpError;

export class Config {
    private static instance: Config;
    private logger: ILogger;
    private showStackTrace: boolean;
    private logRequestDetails: boolean;
    private errorMap: Map<string, ErrorConstructor>;
    private errorOverrides: ErrorOverrideConfig | undefined;
    private ErrortyResponseType: ErrortyErrorResponseType;
  
    private constructor() {
      this.logger = new Logger();
      this.showStackTrace = false;
      this.logRequestDetails = true;
      this.errorMap = new Map();
      this.ErrortyResponseType = 'json';
    }
  
    private async initializeErrorMap(): Promise<void> {
      // Automatically map HTTP status codes to default HttpError class
      Object.values(HttpStatusCodes).forEach(statusCode => {
        if (typeof statusCode === 'number') {
          const errorName = `HTTP${HttpStatusCodes[statusCode]}Error`;
          this.errorMap.set(errorName, 
            class extends HttpError {
              constructor(message?: string) {
                super(message || HttpStatusCodes[statusCode as number], statusCode as number);
                this.name = errorName;
              }
            }
          );
        }
      });

      // Add default package errors
      this.addDefaultErrors();

      // Override with custom error classes
      if (this.errorOverrides) {
        if (this.errorOverrides.path) {
          await this.loadErrorsFromPath(this.errorOverrides.path);
        }
        if (this.errorOverrides.errors) {
          this.loadErrorsFromArray(this.errorOverrides.errors);
        }
      }
    }

    private addDefaultErrors(): void {
      const defaultErrors: Record<string, ErrorConstructor> = {
        HttpBadRequest,
        HttpConflict,
        HttpInternalServerError,
        // Add other default error classes here
      };

      Object.entries(defaultErrors).forEach(([name, ErrorClass]) => {
        this.errorMap.set(name, ErrorClass);
      });
    }
  
    private async loadErrorsFromPath(customPath: string): Promise<void> {
      const errorFiles = await this.getErrorFiles(customPath);
      for (const file of errorFiles) {
        const customError = await import(path.join(customPath, file));
        const errorClassName = path.basename(file, '.ts');
        if (customError[errorClassName] && customError[errorClassName].prototype instanceof HttpError) {
          this.errorMap.set(errorClassName, customError[errorClassName]);
        }
      }
    }
  
    private loadErrorsFromArray(errors: Array<new (message?: string) => HttpError>): void {
      errors.forEach(ErrorClass => {
        const errorInstance = new ErrorClass();
        this.errorMap.set(errorInstance.constructor.name, ErrorClass);
      });
    }
  
    private async getErrorFiles(dirPath: string): Promise<string[]> {
      return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
          if (err) reject(err);
          else resolve(files.filter(file => file.endsWith('.ts') || file.endsWith('.js')));
        });
      });
    }
  
    public static async getInstance(): Promise<Config> {
      if (!Config.instance) {
        Config.instance = new Config();
        await Config.instance.initializeErrorMap();
      }
      return Config.instance;
    }
  
    public static async configure(config: ErrortyConfig): Promise<void> {
      const instance = new Config();
      if (config.logger !== undefined) {
        instance.logger = config.logger || new Logger();
      }
      if (config.showStackTrace !== undefined) {
        instance.showStackTrace = config.showStackTrace;
      }
      if (config.logRequestDetails !== undefined) {
        instance.logRequestDetails = config.logRequestDetails;
      }
      if (config.customErrorMap) {
        config.customErrorMap.forEach((statusCode, errorName) => {
          instance.addCustomError(errorName, statusCode);
        });
      }
      if (config.errorOverrides) {
        instance.errorOverrides = config.errorOverrides;
      }
      if (config.ErrortyResponseType) {
        instance.ErrortyResponseType = config.ErrortyResponseType;
      }
      await instance.initializeErrorMap();
      Config.instance = instance;
    }
  
    public getLogger(): ILogger {
      return this.logger;
    }
  
    public shouldShowStackTrace(): boolean {
      return this.showStackTrace;
    }
  
    public shouldLogRequestDetails(): boolean {
      return this.logRequestDetails;
    }
  
    public getErrorClass(errorName: string): ErrorConstructor | undefined {
      return this.errorMap.get(errorName);
    }
  
    public addCustomError(errorName: string, statusCode: number): void {
      this.errorMap.set(errorName, 
        class extends HttpError {
          constructor(message?: string) {
            super(message || errorName, statusCode);
            this.name = errorName;
          }
        }
      );
    }
  
    public getErrortyResponseType(): ErrortyErrorResponseType {
      return this.ErrortyResponseType;
    }
  }
  
  // Usage example:
  // import { Config, ErrortyConfig } from './Config';
  // 
  // async function setupErrorHandling() {
  //   const customConfig: ErrortyConfig = {
  //     showStackTrace: process.env.NODE_ENV !== 'production',
  //     logRequestDetails: true,
  //     ErrortyResponseType: 'json',
  //     errorOverrides: {
  //       path: './customErrors',
  //       errors: [CustomError1, CustomError2]
  //     }
  //   };
  // 
  //   await Config.configure(customConfig);
  //   const config = await Config.getInstance();
  //   // Use config...
  // }