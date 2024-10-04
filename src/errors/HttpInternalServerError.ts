import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpInternalServerError extends HttpError {
    constructor(message = "Internal Server Error") {
        super(message, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        this.name = "HTTP_InternalServerError";
      }
}