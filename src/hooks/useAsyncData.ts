import { useEffect, useState } from "react";

interface AsyncDataState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
}

export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
  errorMessage: string,
): UseAsyncDataResult<T> {
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<AsyncDataState<T> | null>(null);
  const key = JSON.stringify([refreshIndex, ...deps]);

  useEffect(() => {
    let active = true;

    load()
      .then((data) => {
        if (active) {
          setState({ key, data, error: null });
        }
      })
      .catch(() => {
        if (active) {
          setState({ key, data: null, error: errorMessage });
        }
      });

    return () => {
      active = false;
    };
  }, [key]);

  return {
    data: state?.data ?? null,
    error: state?.error ?? null,
    isLoading: state?.key !== key,
    reload: () => setRefreshIndex((current) => current + 1),
  };
}
