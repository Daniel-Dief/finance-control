import { apiClient } from "@/services/apiClient";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
} from "@/types/auth";

function decodeJwtPayload(value: string): Record<string, unknown> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  return JSON.parse(decodeURIComponent(escape(atob(base64))));
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token.split(".")[1] ?? "");

    return typeof payload.exp === "number" && Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", credentials);

    return data;
  },
  async register(data: RegisterData): Promise<User> {
    const { data: user } = await apiClient.post<User>("/auth/register", data);

    return user;
  },
};