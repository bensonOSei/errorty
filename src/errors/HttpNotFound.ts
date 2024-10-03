import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpNotFound extends HttpError {
  constructor(message = "Not Found") {
    super(message, HttpStatusCodes.NOT_FOUND);
    this.name = "HTTP_Not_Found";
  }
}
