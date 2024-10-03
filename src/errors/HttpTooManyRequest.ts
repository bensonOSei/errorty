import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpTooManyRequests extends HttpError {
  constructor(message = "Too Many Requests") {
    super(message, HttpStatusCodes.TOO_MANY_REQUESTS);
    this.name = "HTTP_Too_Many_Requests";
  }
}
