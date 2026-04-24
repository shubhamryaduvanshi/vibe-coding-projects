import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { COOKIE_NAMES } from "@neo/utils";
import { env } from "../config/env.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/token.js";
import { toAuthUser } from "../utils/mappers.js";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private setCookies(response: Response, userId: string, version: number) {
    const accessToken = signAccessToken({ sub: userId, version });
    const refreshToken = signRefreshToken({ sub: userId, version });
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: env.NODE_ENV === "production",
      path: "/"
    };

    response.cookie(COOKIE_NAMES.accessToken, accessToken, cookieOptions);
    response.cookie(COOKIE_NAMES.refreshToken, refreshToken, cookieOptions);
  }

  async register(input: { name: string; email: string; password: string }, response: Response) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email is already registered", StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    this.setCookies(response, user.id, user.refreshTokenVersion);
    return { user: toAuthUser(user) };
  }

  async login(input: { email: string; password: string }, response: Response) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    this.setCookies(response, user.id, user.refreshTokenVersion);
    return { user: toAuthUser(user) };
  }

  async refresh(refreshToken: string | undefined, response: Response) {
    if (!refreshToken) {
      throw new AppError("Refresh token missing", StatusCodes.UNAUTHORIZED);
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(payload.sub);

    if (!user || user.refreshTokenVersion !== payload.version) {
      throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
    }

    this.setCookies(response, user.id, user.refreshTokenVersion);
    return { user: toAuthUser(user) };
  }

  async logout(userId: string, response: Response) {
    await this.userRepository.incrementRefreshTokenVersion(userId);
    response.clearCookie(COOKIE_NAMES.accessToken);
    response.clearCookie(COOKIE_NAMES.refreshToken);
    return { success: true };
  }
}
