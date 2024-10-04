import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";

export interface ExpressMiddleware {
  (req: Request, res: Response, next: NextFunction): void;
}

export interface ErrorHandlerMiddleware {
  (err: HttpError, req: Request, res: Response, next?: NextFunction): void;
}