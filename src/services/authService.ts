import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
} from "@/types/auth";

import { apiClient } from "@/services/apiClient";

function decodeJwtPayload(value: string): Record<string, unknown> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  return JSON.parse(decodeURIComponent(escape(atob(base64))));
}

/**
 * Margem de segurança: renova o token um pouco antes de expirar para evitar
 * que uma requisição saia com um token prestes a vencer.
 */
const EXPIRY_SKEW_MS = 30_000;

export function isTokenExpired(
  token: string,
  skewMs = EXPIRY_SKEW_MS,
): boolean {
  try {
    const payload = decodeJwtPayload(token.split(".")[1] ?? "");

    if (typeof payload.exp !== "number") {
      // Sem `exp` não há como garantir validade — trata como expirado.
      return true;
    }

    return Date.now() >= payload.exp * 1000 - skewMs;
  } catch {
    // Token malformado é considerado inválido.
    return true;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    return data;
  },
  async register(data: RegisterData): Promise<User> {
    const { data: user } = await apiClient.post<User>("/auth/register", data);

    return user;
  },
};
