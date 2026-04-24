import type { Request, Response } from "express";
import { COOKIE_NAMES } from "@neo/utils";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: Request, response: Response) => {
    const result = await this.authService.register(request.body, response);
    return response.status(201).json(result);
  };

  login = async (request: Request, response: Response) => {
    const result = await this.authService.login(request.body, response);
    return response.json(result);
  };

  refresh = async (request: Request, response: Response) => {
    const result = await this.authService.refresh(
      request.cookies[COOKIE_NAMES.refreshToken],
      response
    );
    return response.json(result);
  };

  logout = async (request: Request, response: Response) => {
    const result = await this.authService.logout(request.user!.id, response);
    return response.json(result);
  };

  me = async (request: Request, response: Response) =>
    response.json({ user: request.user });
}

