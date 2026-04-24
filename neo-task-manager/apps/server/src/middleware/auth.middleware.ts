import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { COOKIE_NAMES } from "@neo/utils";
import { UserModel } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/token.js";
import { AppError } from "../utils/app-error.js";

export const requireAuth = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  const token = request.cookies[COOKIE_NAMES.accessToken];

  if (!token) {
    return next(new AppError("Authentication required", StatusCodes.UNAUTHORIZED));
  }

  const payload = verifyAccessToken(token);
  const user = await UserModel.findById(payload.sub);

  if (!user) {
    return next(new AppError("User not found", StatusCodes.UNAUTHORIZED));
  }

  request.user = user;
  return next();
};

