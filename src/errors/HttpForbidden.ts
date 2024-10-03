import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpForbidden extends HttpError {
    constructor(message = "Forbidden") {
        super(message, HttpStatusCodes.FORBIDDEN);
        this.name = "HTTP_Forbidden";
      }
}