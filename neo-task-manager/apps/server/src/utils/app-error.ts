import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = StatusCodes.BAD_REQUEST,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

