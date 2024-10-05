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
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;
  
    private constructor() {
      this.logger = new Logger();
      this.showStackTrace = false;
      this.logRequestDetails = true;
      this.errorMap = new Map();
      this.ErrortyResponseType = 'json';
    }
  
    public static getInstance(): Config {
      if (!Config.instance) {
        Config.instance = new Config();
      }
      return Config.instance;
    }

    public async init(config: ErrortyConfig): Promise<void> {
      if (this.initialized) return;
      if (this.initPromise) return this.initPromise;

      this.initPromise = this.performInit(config);
      await this.initPromise;
      this.initialized = true;
    }

    public initSync(config: ErrortyConfig): void {
      if (this.initialized) return;
      this.applyConfig(config);
      this.initializeErrorMapSync();
      this.initialized = true;
    }

    private async performInit(config: ErrortyConfig): Promise<void> {
      this.applyConfig(config);
      await this.initializeErrorMap();
    }

    private applyConfig(config: ErrortyConfig): void {
      if (config.logger !== undefined) {
        this.logger = config.logger || new Logger();
      }
      if (config.showStackTrace !== undefined) {
        this.showStackTrace = config.showStackTrace;
      }
      if (config.logRequestDetails !== undefined) {
        this.logRequestDetails = config.logRequestDetails;
      }
      if (config.ErrortyResponseType) {
        this.ErrortyResponseType = config.ErrortyResponseType;
      }
      this.errorOverrides = config.errorOverrides;
    }
  
    private async initializeErrorMap(): Promise<void> {
      this.initializeDefaultErrors();

      if (this.errorOverrides) {
        if (this.errorOverrides.path) {
          await this.loadErrorsFromPath(this.errorOverrides.path);
        }
        if (this.errorOverrides.errors) {
          this.loadErrorsFromArray(this.errorOverrides.errors);
        }
      }
    }

    private initializeErrorMapSync(): void {
      this.initializeDefaultErrors();

      if (this.errorOverrides) {
        if (this.errorOverrides.errors) {
          this.loadErrorsFromArray(this.errorOverrides.errors);
        }
        // Note: We can't load errors from path synchronously
      }
    }

    private initializeDefaultErrors(): void {
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

    public isInitialized(): boolean {
      return this.initialized;
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