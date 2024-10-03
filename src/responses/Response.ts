import { IResponse } from "../interfaces/iResponse";

export class Response {
  // Constructor properties marked as readonly
  constructor(
    private readonly status: ResponseStatusType = "success",
    private readonly statusCode: number | null = 200,
    private readonly message: string | null = "Operation successful",
    private readonly data: string | object | null = null,
    private readonly error: object | string | null = null,
  ) {}

  // Method to format and return the response
  send(): IResponse {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      error: this.error,
    };
  }

  // Static method for successful responses
  static success(
    message: string = "Operation successful",
    statusCode: number = 200,
  ): IResponse {
    return new Response("success", statusCode, message).send();
  }

  // Static method for error responses
  static error(
    error: object | string,
    message: string = "Something went wrong",
    statusCode: number = 500,
  ): IResponse {
    return new Response("error", statusCode, message, null, error).send();
  }

  // Static method for successful responses with data
  static successWithData(
    data: object | string,
    message: string = "Operation successful",
    statusCode: number = 200,
  ): IResponse {
    return new Response("success", statusCode, message, data).send();
  }
}
