import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpConflict extends HttpError {
  constructor(message = "Conflict") {
    super(message, HttpStatusCodes.CONFLICT);
    this.name = "HTTP_Conflict";
  }
}
