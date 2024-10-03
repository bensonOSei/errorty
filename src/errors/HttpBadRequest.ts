import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpBadRequest extends HttpError {
  constructor(message = "Bad Request") {
    super(message, HttpStatusCodes.BAD_REQUEST);
    this.name = "HTTP_Bad_Request";
  } 
}
