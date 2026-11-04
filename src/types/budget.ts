export type { PaginatedResult } from './pagination';

export interface Budget {
  id: number;
  amount: number;
  area_id: number;
  month: number;
  year: number;
  user_id: number;
}

export interface BudgetPayload {
  area_id: number;
  month: number;
  year: number;
  amount: number;
}

export type BudgetUpdatePayload = Partial<BudgetPayload>;
