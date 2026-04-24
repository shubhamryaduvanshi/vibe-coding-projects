import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  sub: string;
  version: number;
}

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"]
  });

export const signRefreshToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as SignOptions["expiresIn"]
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
