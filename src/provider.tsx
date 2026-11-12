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
      const hasSavedCredentials = Boolean(state.user?.login && state.password);
      const needsNewToken = !state.token || isTokenExpired(state.token);

      if (hasSavedCredentials && needsNewToken) {
        // Token expirado/ausente: reconecta usando login e senha persistidos,
        // sem passar pela tela de login.
        await refreshToken();
      } else if (!hasSavedCredentials && (state.token || state.isLoggedIn)) {
        // Sessão sem credenciais não pode ser renovada; exige novo login.
        state.logout();
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

      if (!state.isLoggedIn) {
        return;
      }

      if (!state.token || isTokenExpired(state.token)) {
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
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
