export type { PaginatedResult } from "./pagination";

export interface Category {
  id: number;
  name: string;
  user_id: number;
}

export interface CategoryPayload {
  name: string;
}