export interface ExpressMiddleware {
  (req: any, res: any, next: any): void;
}

export interface ErrorHandlerMiddleware {
  (err: any, req: any, res: any, next: any): void;
}