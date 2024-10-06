
import { Request, Response } from "express";
import { Config } from "../src/Config";
import { ErrorHandler } from "../src/Handler";
import { HttpBadRequest } from "../src/errors/HttpBadRequest";
import { HttpInternalServerError } from "../src/errors/HttpInternalServerError";

jest.mock('../src/Config');
jest.mock('../src/Logger');

describe('ErrorHandler', () => {
  let mockConfig: jest.Mocked<Config>;

  beforeEach(() => {
    mockConfig = {
      getLogger: jest.fn().mockReturnValue({
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
      }),
      shouldShowStackTrace: jest.fn().mockReturnValue(false),
      shouldLogRequestDetails: jest.fn().mockReturnValue(false),
      getErrorClass: jest.fn(),
      getErrortyResponseType: jest.fn().mockReturnValue('json'),
      init: jest.fn(),
      initSync: jest.fn(),
    } as unknown as jest.Mocked<Config>;

    (Config.getInstance as jest.Mock).mockReturnValue(mockConfig);

    ErrorHandler['config'] = mockConfig;

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ErrorHandler initializes asynchronously and synchronously without errors
  it('should initialize asynchronously and synchronously without errors', async () => {
    await ErrorHandler.initialize();
    expect(ErrorHandler.isInitialized()).toBe(true);

    ErrorHandler.initializeSync();
    expect(ErrorHandler.isInitialized()).toBe(true);

  });

  // // ErrorHandler handles known HttpError instances correctly
  it('should handle known HttpError instances correctly', () => {
    const reqMock = { path: '/test', method: 'GET' } as Request;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const nextMock = jest.fn();
    const error = new HttpBadRequest(); 

    ErrorHandler.handleError(error, reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Request' }));
  });

  // ErrorHandler logs error details when configured to do so
  it('should log error details when configured to do so', () => {
    const reqMock = { 
      path: '/test', 
      method: 'GET', 
      body: {}, 
      params: {}, 
      query: {}, 
      headers: {} 
    } as Request;
    const resMock = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    } as unknown as Response;
    const nextMock = jest.fn();
    const error = new HttpInternalServerError('Internal Server Error');

    ErrorHandler.handleError(error, reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Internal Server Error'
    }));
  });

  // ErrorHandler sends JSON error responses by default
  it('should send JSON error responses by default', () => {
    const reqMock = { path: '/test', method: 'GET' } as Request;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const nextMock = jest.fn();
    const error = new Error('Test error');

    ErrorHandler.handleError(error, reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test error' }));
  });

  // ErrorHandler handles 404 Not Found errors gracefully
  it('should handle 404 Not Found errors gracefully', () => {
    const reqMock = { path: '/not-found', method: 'GET' } as Request;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    ErrorHandler.handleNotFound(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot GET /not-found' }));
  });

  // ErrorHandler initializes when already initialized
  it('should not reinitialize when already initialized', async () => {
    // Reset the initialized and initPromise properties
    ErrorHandler['initialized'] = false;
    ErrorHandler['initPromise'] = null;

    // Mock the config.init method
    const configInitSpy = jest.spyOn(mockConfig, 'init');

    // Call the initialize method twice to test the behavior
    await ErrorHandler.initialize();
    await ErrorHandler.initialize();

    expect(configInitSpy).toHaveBeenCalledTimes(1);

  });

  // ErrorHandler handles unknown error types by using a generic HttpError
  it('should handle unknown error types by using a generic HttpError', () => {
    const reqMock = { path: '/test', method: 'GET' } as Request;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const nextMock = jest.fn();
    const error = new Error('Unknown error');

    ErrorHandler.handleError(error, reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unknown error' }));
  });

  // ErrorHandler logs minimal error details when configured not to log request details
  it('should log minimal error details when configured not to log request details', () => {
    const loggerMock = mockConfig.getLogger();

    const reqMock = { path: '/test', method: 'GET' } as Request;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const nextMock = jest.fn();
    const error = new Error('Test error');

    ErrorHandler.handleError(error, reqMock, resMock, nextMock);

    expect(loggerMock.error).toHaveBeenCalledWith(`Error: Test error | Status Code: 500`);
  });
 
});
