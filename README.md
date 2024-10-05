# Errorty

Errorty is a comprehensive error handling package designed specifically for Express.js applications. It simplifies error management, improves debugging, and provides a robust error handling solution for your Express-based projects.

## Features

- Seamless integration with Express.js middleware
- Custom error classes with automatic HTTP status code mapping
- Centralized error handling middleware for Express applications
- Configurable logging with multiple log levels
- Stack trace display (configurable for production/development environments)
- Support for custom error classes
- Unhandled exception and rejection handling for Express apps
- Flexible configuration options tailored for Express.js environments
- Async and sync configuration methods
- Default logging and easy integration with custom loggers

## Installation

Install Errorty using npm:

```bash
npm install errorty
```

## Quick Start

Here's a basic example of how to integrate Errorty into your Express.js application:

```javascript
import express, { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './src/utils/Handler';
import { Config } from './src/utils/Config';
import { HttpBadRequest } from './src/errors/HttpBadRequest';
import { HttpNotFound } from './src/errors/HttpNotFound';

async function setupAsyncApp() {
  const app = express();

  // Asynchronous initialization
  try {
    await Config.getInstance().init({
      showStackTrace: process.env.NODE_ENV !== 'production',
      logRequestDetails: true,
      ErrortyResponseType: 'json',
    });
    await ErrorHandler.initialize();
    console.log("Asynchronous initialization complete");
  } catch (error) {
    console.error("Async initialization failed:", error);
    process.exit(1);
  }


  app.get('/error', (req: Request, res: Response, next: NextFunction) => {
   throw new HttpBadRequest();
  });


  app.get('/not-found', async (req: Request, res: Response, next: NextFunction) => {
    next(new HttpNotFound('Resource not found'));
  });

  // Not Found Handler
  app.use(ErrorHandler.handleNotFound);

  // Error Handler
  app.use(ErrorHandler.handleError);

  // Initialize unhandled exception handlers
  ErrorHandler.initializeUnhandledExceptionHandlers();

  return app;
}


// Start the server
setupAsyncApp().then((app) => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Async Server started on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to start async server:', error);
  process.exit(1);
});

```

## Configuration

Errorty supports both asynchronous and synchronous configuration methods:

### Asynchronous Configuration

```javascript
import { Config } from "errorty";

await Config.init({
  showStackTrace: true,
  logRequestDetails: true,
  ErrortyResponseType: "json",
  // ... other options
});

await ErrorHandler.initialize();
```

### Synchronous Configuration

```javascript
import { Config, ErrorHandler } from "errorty";

Config.initSync({
  showStackTrace: true,
  logRequestDetails: true,
  ErrortyResponseType: "json",
  // ... other options
});

ErrorHandler.initializeSync();
```

Use the synchronous method if you need to configure Errorty without using async/await, for example in environments that don't support top-level await.

### Configuration Options

- `logger`: Custom logger implementation (optional)
- `showStackTrace`: Show stack traces in Express error responses (boolean)
- `logRequestDetails`: Log detailed Express request information on errors (boolean)
- `ErrortyResponseType`: 'json' or 'text' for Express responses
- `errorOverrides`: Custom error classes configuration

## Logging

### Default Logger

Errorty comes with a built-in logger that integrates seamlessly with Express.js:

```javascript
import { Logger, LogLevel } from "errorty";

const logger = new Logger(LogLevel.DEBUG);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.path}`);
  next();
});
```

### Custom Logger Integration

You can easily integrate your preferred logging library, such as Winston:

```javascript
import winston from 'winston';
import { Config } from 'errorty';

await Config.configure({
  logger:  winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ],
      })
  // ... other options
    });
```

This example shows how to integrate Winston, but you can use a similar approach with other logging libraries.

## Custom Error Classes for Express

Create custom error classes that integrate smoothly with Express.js:

```javascript
import { HttpError } from "errorty";
import { HttpStatusCodes } from "errorty/enums";

export class CustomNotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(message, HttpStatusCodes.NOT_FOUND);
    this.name = "CustomNotFoundError";
  }
}

// Usage in an Express route
app.get("/resource/:id", (req, res, next) => {
  if (!resourceExists(req.params.id)) {
    next(new CustomNotFoundError());
  } else {
    // ... handle the request
  }
});
```

## Contributing

Contributions to improve Errorty for Express.js applications are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License
