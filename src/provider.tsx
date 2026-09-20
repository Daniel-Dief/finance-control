import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";

import { authService, isTokenExpired } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/login", "/register", "/logout"];
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
        try {
          const { token, user } = await authService.login({
            login: state.user.login,
            password: state.password,
          });

          state.login(token, user, state.password);
        } catch {
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
        try {
          const { token, user } = await authService.login({
            login: state.user.login,
            password: state.password,
          });

          state.login(token, user, state.password);
        } catch {
          state.logout();
        }
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
      navigate("/login", { replace: true });
    } else if (isLoggedIn && isPublic) {
      navigate("/", { replace: true });
    }
  }, [isInitialized, isLoggedIn, location.pathname, navigate]);

  if (!isInitialized) {
    return <AuthLoading />;
  }

  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  if (!isLoggedIn && !isPublic) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}