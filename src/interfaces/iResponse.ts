export interface IResponse {
  status: string | null;
  statusCode: number | null;
  message: string | null;
  data: string | object | null;
  error: object | string | null;
}
