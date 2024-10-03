export class HttpError extends Error {
  protected statusCode: number;

  constructor(message: string, status: number) {
    super(message);
    this.statusCode = status;
  }
}
