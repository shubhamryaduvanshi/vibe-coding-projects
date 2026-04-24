import type { AuthResponse } from "@neo/types";
import { http } from "../lib/http";

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => (await http.post<AuthResponse>("/auth/register", payload)).data;

export const login = async (payload: { email: string; password: string }) =>
  (await http.post<AuthResponse>("/auth/login", payload)).data;

export const refreshSession = async () =>
  (await http.post<AuthResponse>("/auth/refresh")).data;

export const logout = async () => (await http.post("/auth/logout")).data;

