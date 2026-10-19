import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/authStore";
import type { LoginResponse } from "@/types/auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1323";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

interface RetryQueueItem {
  config: InternalAxiosRequestConfig;
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;
let retryQueue: RetryQueueItem[] = [];

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function refreshToken(): Promise<string | null> {
  const { user, password } = useAuthStore.getState();

  if (!user || !password) {
    return null;
  }

  try {
    const { data } = await refreshClient.post<LoginResponse>("/auth/login", {
      login: user.login,
      password,
    });

    useAuthStore.getState().login(data.token, data.user, password);

    return data.token;
  } catch {
    useAuthStore.getState().logout();

    return null;
  }
}

/**
 * Garante que apenas um refresh aconteça por vez. Todas as requisições que
 * receberem 401 enquanto o refresh está em andamento compartilham a mesma
 * promise, evitando chamadas concorrentes a `/auth/login`.
 */
function getRefreshPromise(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function flushQueue(token: string | null, error: AxiosError) {
  const queue = retryQueue;

  retryQueue = [];

  queue.forEach(({ config, resolve, reject }) => {
    if (!token) {
      reject(error);

      return;
    }

    config.headers.Authorization = `Bearer ${token}`;
    resolve(apiClient(config));
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Se já existe um refresh em andamento, aguarda na fila e é reprocessada
    // assim que o novo token estiver disponível.
    if (refreshPromise) {
      return new Promise((resolve, reject) => {
        retryQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    const refresh = getRefreshPromise();

    // A requisição que disparou o refresh também entra na fila, para ser
    // reprocessada junto com as demais quando o token for renovado.
    const retried = new Promise((resolve, reject) => {
      retryQueue.push({ config: originalRequest, resolve, reject });
    });

    try {
      const newToken = await refresh;

      flushQueue(newToken, error);
    } catch (refreshError) {
      flushQueue(null, error);

      throw refreshError;
    }

    return retried;
  },
);