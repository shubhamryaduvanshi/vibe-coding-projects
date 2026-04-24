import { StatusCodes } from "http-status-codes";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      errors: error.flatten().fieldErrors
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      errors: error.errors
    });
  }

  return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Unexpected server error"
  });
};

