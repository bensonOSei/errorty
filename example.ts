import express, { Request, Response } from "express";
import { ErrorHandler } from "./src/Handler";
import { HttpBadRequest } from "./src/errors/HttpBadRequest";

ErrorHandler.initializeSync({
  showStackTrace: true,
  logRequestDetails: true,
  ErrortyResponseType: "json",
});

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.get("/error", (req: Request, res: Response) => {
  throw new HttpBadRequest();
});

app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleError);

app.listen(3000, () => console.log("Server started on port 3000"));