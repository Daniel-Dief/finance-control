import { useEffect, useReducer } from "react"

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

type Action<T> =
  | { type: "start" }
  | { type: "success"; data: T }
  | { type: "error"; error: string }

function reducer<T>(_state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "start":
      return { data: null, loading: true, error: null }
    case "success":
      return { data: action.data, loading: false, error: null }
    case "error":
      return { data: null, loading: false, error: action.error }
  }
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[]
) {
  const [state, dispatch] = useReducer(reducer<T>, {
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    dispatch({ type: "start" })
    fetcher()
      .then((data) => {
        if (!cancelled) dispatch({ type: "success", data })
      })
      .catch((err) => {
        if (!cancelled)
          dispatch({
            type: "error",
            error: err instanceof Error ? err.message : "Erro desconhecido",
          })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
