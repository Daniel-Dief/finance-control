import type { User } from '@/types/auth';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { decodeBasicAuthCredentials, encodeBasicAuthCredentials } from '@/utils/basicAuth';

interface AuthStore {
  token: string | null;
  user: User | null;
  password: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User, password: string) => void;
  logout: () => void;
}

interface PersistedAuthState {
  token: string | null;
  user: User | null;
  credentials: string | null;
  isLoggedIn: boolean;
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Partial<User>;

  return (
    typeof user.id === 'number' && typeof user.login === 'string' && typeof user.name === 'string'
  );
}

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore, [], [], PersistedAuthState>(
    (set) => ({
      token: null,
      user: null,
      password: null,
      isLoggedIn: false,
      login: (token, user, password) => set({ token, user, password, isLoggedIn: true }),
      logout: () => set({ token: null, user: null, password: null, isLoggedIn: false })
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        credentials:
          state.user?.login && state.password
            ? encodeBasicAuthCredentials(state.user.login, state.password)
            : null,
        isLoggedIn: state.isLoggedIn
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<AuthStore> & { credentials?: unknown };
        const user = isUser(state.user) ? state.user : null;
        const encodedCredentials =
          typeof state.credentials === 'string'
            ? state.credentials
            : user?.login && typeof state.password === 'string'
              ? encodeBasicAuthCredentials(user.login, state.password)
              : null;
        const decodedCredentials = encodedCredentials
          ? decodeBasicAuthCredentials(encodedCredentials)
          : null;

        return {
          token: typeof state.token === 'string' ? state.token : null,
          user,
          credentials: decodedCredentials?.login === user?.login ? encodedCredentials : null,
          isLoggedIn: state.isLoggedIn === true
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedAuthState>;
        const user = isUser(persisted.user) ? persisted.user : null;
        const decodedCredentials =
          typeof persisted.credentials === 'string'
            ? decodeBasicAuthCredentials(persisted.credentials)
            : null;

        return {
          ...currentState,
          token: typeof persisted.token === 'string' ? persisted.token : null,
          user,
          password:
            decodedCredentials && decodedCredentials.login === user?.login
              ? decodedCredentials.password
              : null,
          isLoggedIn: persisted.isLoggedIn === true
        };
      }
    }
  )
);
