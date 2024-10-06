import express, { Request, Response } from "express";
import { ErrorHandler } from "./src/Handler";
import { HttpBadRequest } from "./src/errors/HttpBadRequest";

ErrorHandler.initializeSync({
  showStackTrace: true, // process.env.NODE_ENV !== 'production',
  logRequestDetails: true, // process.env.DEBUG === 'true',
  ErrortyResponseType: "json",
});

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/error", (_req: Request, _res: Response) => {
  throw new HttpBadRequest();
});

app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleError);

app.listen(3000, () => console.log("Server started on port 3000"));
