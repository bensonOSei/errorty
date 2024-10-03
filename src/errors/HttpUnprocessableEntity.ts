import { HttpStatusCodes } from "../enums/HttpStatusCodes";
import { HttpError } from "./HttpError";

export class HttpUnprocessableEntity extends HttpError {
  constructor(message = "Unprocessable Entity") {
    super(message, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    this.name = "HTTP_Unprocessable_Entity";
  }
}
