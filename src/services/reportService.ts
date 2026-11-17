import type {
  AreaCategoryReport,
  BudgetReport,
  LineChartReport,
  RadarChartReport,
  ReportKPIs,
  ReportTransactionType
} from '@/types/report';

import { apiClient } from '@/services/apiClient';

interface ReportPeriod {
  year?: number;
  month?: number;
}

export const reportService = {
  async kpis(params: ReportPeriod = {}): Promise<ReportKPIs> {
    const { data } = await apiClient.get<ReportKPIs>('/reports/kpis', { params });

    return data;
  },

  async lineChart(
    params: ReportPeriod & { type: ReportTransactionType }
  ): Promise<LineChartReport> {
    const { data } = await apiClient.get<LineChartReport>('/reports/line-chart', { params });

    return data;
  },

  async radarChart(
    params: ReportPeriod & { type: ReportTransactionType; area_ids?: string }
  ): Promise<RadarChartReport> {
    const { data } = await apiClient.get<RadarChartReport>('/reports/radar-chart', { params });

    return data;
  },

  async areaCategories(
    areaId: number,
    params: ReportPeriod & { type?: ReportTransactionType } = {}
  ): Promise<AreaCategoryReport> {
    const { data } = await apiClient.get<AreaCategoryReport>(
      `/reports/areas/${areaId}/categories`,
      { params }
    );

    return data;
  },

  async budgets(params: ReportPeriod = {}): Promise<BudgetReport> {
    const { data } = await apiClient.get<BudgetReport>('/reports/budgets', { params });

    return data;
  }
};
