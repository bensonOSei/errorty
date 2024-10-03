import { HttpStatusCodes } from "./enums/HttpStatusCodes";
import { ErrorHandlerMiddleware } from "./interfaces/globals";
import { Response } from "./responses/Response";
import { SystemUtils } from "./utils/SystemUtils";

export class ErrorHandler {
  public static handleError: ErrorHandlerMiddleware = (
    err,
    req,
    res,
  ): void => {
    const statusCode = err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      statusCode === HttpStatusCodes.INTERNAL_SERVER_ERROR &&
      SystemUtils.isProduction()
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
    err =
      statusCode === HttpStatusCodes.INTERNAL_SERVER_ERROR &&
      SystemUtils.isProduction()
        ? "Something went wrong"
        : err;
    // Log the error (you can use a logging library here)
    console.error(`Error: ${message} | Status Code: ${statusCode}`);

    // Send response to the client
    res.status(statusCode).json(Response.error(err, message, statusCode));
  };
}
