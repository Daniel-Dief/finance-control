export type ReportTransactionType = 'income' | 'expense';

export interface ReportKPIs {
  income: number;
  expense: number;
  balance: number;
  month: number;
  year: number;
}

export interface LineChartPoint {
  date: string;
  day: number;
  value: number;
  median: number;
}

export interface LineChartReport {
  points: LineChartPoint[];
  history_months: number;
  month: number;
  year: number;
  type: ReportTransactionType;
}

export interface RadarArea {
  area_id: number;
  area_name: string;
  value: number;
  median: number;
}

export interface RadarChartReport {
  areas: RadarArea[];
  history_months: number;
  month: number;
  year: number;
  type: ReportTransactionType;
}

export interface BudgetProgress {
  id: number;
  area_id: number;
  area_name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
}

export interface BudgetReport {
  budgets: BudgetProgress[];
  month: number;
  year: number;
}
