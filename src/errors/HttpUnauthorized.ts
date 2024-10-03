import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpUnauthorized extends HttpError {
  constructor(message = "Authorized") {
    super(message, HttpStatusCodes.UNAUTHORIZED);
    this.name = "HTTP_Unauthorized";
  }
}
