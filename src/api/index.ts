import type {
  Area,
  Budget,
  BudgetFilters,
  Category,
  Transaction,
  TransactionFilters,
} from "@/types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Erro na requisição")
  }

  return data as T
}

// Categories
export const categoriesApi = {
  list: (name?: string) =>
    request<Category[]>(
      `/categories${name ? `?name=${encodeURIComponent(name)}` : ""}`
    ),

  getById: (id: number) => request<Category>(`/categories/${id}`),

  create: (name: string) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
    }),
}

// Areas
export const areasApi = {
  list: (name?: string) =>
    request<Area[]>(`/areas${name ? `?name=${encodeURIComponent(name)}` : ""}`),

  getById: (id: number) => request<Area>(`/areas/${id}`),

  create: (name: string) =>
    request<Area>("/areas", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    request<Area>(`/areas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/areas/${id}`, {
      method: "DELETE",
    }),
}

// Budgets
export const budgetsApi = {
  list: (filters?: BudgetFilters) => {
    const params = new URLSearchParams()
    if (filters?.year) params.set("year", String(filters.year))
    if (filters?.month) params.set("month", String(filters.month))
    if (filters?.areaId) params.set("areaId", String(filters.areaId))
    const qs = params.toString()
    return request<Budget[]>(`/budgets${qs ? `?${qs}` : ""}`)
  },

  getById: (id: number) => request<Budget>(`/budgets/${id}`),

  create: (data: {
    year: number
    month: number
    areaId: number
    amount: number
  }) =>
    request<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: Partial<{
      amount: number
      year: number
      month: number
      areaId: number
    }>
  ) =>
    request<Budget>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/budgets/${id}`, {
      method: "DELETE",
    }),
}

// Transactions
export const transactionsApi = {
  list: (filters?: TransactionFilters) => {
    const params = new URLSearchParams()
    if (filters?.type) params.set("type", filters.type)
    if (filters?.categoryId)
      params.set("categoryId", String(filters.categoryId))
    if (filters?.areaId) params.set("areaId", String(filters.areaId))
    if (filters?.from) params.set("from", filters.from)
    if (filters?.to) params.set("to", filters.to)
    const qs = params.toString()
    return request<Transaction[]>(`/transactions${qs ? `?${qs}` : ""}`)
  },

  getById: (id: number) => request<Transaction>(`/transactions/${id}`),

  create: (data: {
    date: string
    amount: number
    areaId: number
    categoryId?: number | null
    type: "income" | "expense"
  }) =>
    request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: Partial<{
      date: string
      amount: number
      areaId: number
      categoryId: number | null
      type: "income" | "expense"
    }>
  ) =>
    request<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/transactions/${id}`, {
      method: "DELETE",
    }),
}
