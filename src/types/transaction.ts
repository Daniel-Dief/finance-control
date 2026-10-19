export type { PaginatedResult } from "./pagination";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  area_id: number;
  category_id: number;
  date: string;
  user_id: number;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  area_id: number;
  category_id: number;
  date: string;
}

export type TransactionUpdatePayload = Partial<TransactionPayload>;
