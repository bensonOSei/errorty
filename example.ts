import express, { Request, Response } from "express";
import { ErrorHandler } from "./src/Handler";
import { HttpBadRequest } from "./src/errors/HttpBadRequest";
import { Config } from "./src/Config";
import { HttpInternalServerError } from "./src/errors/HttpInternalServerError";
import { HttpTooManyRequests } from "./src/errors/HttpTooManyRequest";

async function setupApp() {
  const customConfig: ErrortyConfig = {
    showStackTrace: true,
    logRequestDetails: true,
    ErrortyResponseType: "json",
    errorOverrides: {
    }
  };

  try {
    await Config.configure(customConfig);
    console.log("Config initialized successfully");
    
    await ErrorHandler.initialize();
    console.log("ErrorHandler initialized successfully");

    const app = express();

    // Add a middleware to log all requests
    app.use((req, res, next) => {
      console.log(`Received ${req.method} request to ${req.path}`);
      next();
    });

    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });

    app.get("/error", (req: Request, res: Response) => {
      console.log("Throwing HttpBadRequest in /error route");
      throw new HttpBadRequest("This is a test error");
    });

    // Add this route to test unhandled async errors
    app.get("/async-error", async (req, res, next) => {
      console.log("Throwing async error in /async-error route");
     next(new HttpTooManyRequests("This is an async error"));
    });

    // Not Found Handler
    app.use((req, res, next) => {
      console.log(`Route not found: ${req.method} ${req.path}`);
      next();
    });
    app.use(ErrorHandler.handleNotFound);

    // Error Handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log("Error caught in custom middleware:", err);
      next(err);
    });
    app.use(ErrorHandler.handleError);

    ErrorHandler.initializeUnhandledExceptionHandlers();

    return app;
  } catch (error) {
    console.error("Error during app setup:", error);
    throw error;
  }
}

setupApp()
  .then((app) => {
    app.listen(3000, () => console.log("Server started on port 3000"));
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });