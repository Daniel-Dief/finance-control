import type { LoginResponse } from '@/types/auth';

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import { buildBasicAuthHeader } from '@/utils/basicAuth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1323';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
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
  const isAuthRequest = config.url?.includes('/auth/') ?? false;

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Tenta renovar a sessão usando o login e a senha persistidos no Zustand.
 * Retorna o novo token ou `null` quando não há credenciais salvas ou quando o
 * backend recusa a conexão. Nos dois casos a sessão é encerrada, o que leva o
 * usuário para a tela de login.
 */
export async function refreshToken(): Promise<string | null> {
  const state = useAuthStore.getState();
  const { user, password } = state;

  if (!user?.login || !password) {
    // Sem credenciais persistidas não há como renovar automaticamente.
    if (state.isLoggedIn || state.token) {
      state.logout();
    }

    return null;
  }

  try {
    const { data } = await refreshClient.post<LoginResponse>('/auth/login', undefined, {
      headers: { Authorization: buildBasicAuthHeader(user.login, password) }
    });

    // Mantém as credenciais salvas para as próximas renovações.
    useAuthStore.getState().login(data.token, data.user, password);

    return data.token;
  } catch {
    // Credenciais recusadas ou backend indisponível: limpa a sessão para que
    // o usuário informe login e senha novamente.
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
    // O próprio login/registro não deve disparar uma tentativa de renovação:
    // um 401 nesses endpoints significa credenciais inválidas.
    const isAuthRequest = originalRequest?.url?.includes('/auth/') ?? false;

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isAuthRequest) {
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
  }
);
