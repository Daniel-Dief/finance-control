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

let isRefreshing = false;
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        retryQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const newToken = await refreshToken();

    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      retryQueue.forEach(({ config, resolve, reject }) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        apiClient(config).then(resolve).catch(reject);
      });
    } else {
      retryQueue.forEach(({ reject }) => reject(error));
    }

    retryQueue = [];
    isRefreshing = false;

    if (newToken) {
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);