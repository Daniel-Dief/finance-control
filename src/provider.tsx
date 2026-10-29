import { useEffect, useState } from 'react';
import { Spinner, Toast } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ThemeProvider } from '@/components/theme-provider';
import { refreshToken } from '@/services/apiClient';
import { isTokenExpired } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const PUBLIC_PATHS = ['/login', '/register', '/logout'];
const REFRESH_INTERVAL_MS = 60_000;

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const initSession = async () => {
      const state = useAuthStore.getState();

      if (state.user && state.password) {
        // Reaproveita o fluxo de refresh (sessão única, sem corrida com o
        // interceptor de 401).
        const token = await refreshToken();

        if (!token) {
          state.logout();
        }
      }

      setIsInitialized(true);
    };

    initSession();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const timer = window.setInterval(async () => {
      const state = useAuthStore.getState();

      if (!state.token || !state.user || !state.password) {
        return;
      }

      if (isTokenExpired(state.token)) {
        await refreshToken();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const isPublic = PUBLIC_PATHS.includes(location.pathname);

    if (!isLoggedIn && !isPublic) {
      navigate('/login', { replace: true });
    } else if (isLoggedIn && isPublic) {
      navigate('/', { replace: true });
    }
  }, [isInitialized, isLoggedIn, location.pathname, navigate]);

  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  const content = !isInitialized || (!isLoggedIn && !isPublic) ? <AuthLoading /> : children;

  return (
    <ThemeProvider>
      <Toast.Provider />
      {content}
    </ThemeProvider>
  );
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
