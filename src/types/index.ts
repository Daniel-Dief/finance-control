export interface Category {
  id: number
  name: string
}

export interface Area {
  id: number
  name: string
}

export interface Budget {
  id: number
  year: number
  month: number
  areaId: number
  amount: number
}

export interface Transaction {
  id: number
  date: string
  amount: number
  categoryId: number | null
  areaId: number
  type: "income" | "expense"
}

export type TransactionType = "income" | "expense"

export interface BudgetFilters {
  year?: number
  month?: number
  areaId?: number
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: number
  areaId?: number
  from?: string
  to?: string
}

export interface BudgetWithArea extends Budget {
  areaName?: string
}

export interface TransactionWithDetails extends Transaction {
  areaName?: string
  categoryName?: string
}
