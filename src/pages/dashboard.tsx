import type { LineChartPoint, ReportTransactionType } from "@/types/report";

import { Alert, Label, ListBox, Select, Spinner } from "@heroui/react";
import { useMemo, useState } from "react";

import BudgetsPercent from "@/components/dashboards/BudgetsPercent";
import KPIs from "@/components/dashboards/KPIs";
import LineChart from "@/components/dashboards/LineChart";
import RadarChart from "@/components/dashboards/RadarChart";
import { useThemeContext } from "@/components/theme-provider";
import DefaultLayout from "@/layouts/default";
import { useAsyncData } from "@/hooks/useAsyncData";
import { areaService } from "@/services/areaService";
import { reportService } from "@/services/reportService";
import { MONTH_OPTIONS, formatPeriod, getYearOptions } from "@/utils/format";

type Granularity = "daily" | "weekly";

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const YEAR_OPTIONS = getYearOptions();

function aggregatePoints(points: LineChartPoint[], granularity: Granularity) {
  if (granularity === "daily") {
    return points.map((point) => ({
      label: String(point.day),
      value: point.value,
      median: point.median,
    }));
  }

  const weeks = new Map<number, { value: number; median: number }>();

  points.forEach((point) => {
    const week = Math.floor((point.day - 1) / 7) + 1;
    const current = weeks.get(week) ?? { value: 0, median: 0 };

    weeks.set(week, {
      value: current.value + point.value,
      median: current.median + point.median,
    });
  });

  return Array.from(weeks.entries()).map(([week, values]) => ({
    label: `Sem ${week}`,
    ...values,
  }));
}

function PeriodFilters({
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        {
          label: "Mês",
          value: month,
          options: MONTH_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          })),
          onChange: onMonthChange,
        },
        {
          label: "Ano",
          value: year,
          options: YEAR_OPTIONS.map((option) => ({
            label: String(option),
            value: option,
          })),
          onChange: onYearChange,
        },
      ].map((filter) => (
        <Select
          key={filter.label}
          className="min-w-36"
          value={String(filter.value)}
          onChange={(value) => value !== null && filter.onChange(Number(value))}
        >
          <Label>{filter.label}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {filter.options.map((option) => (
                <ListBox.Item
                  key={option.value}
                  id={String(option.value)}
                  textValue={option.label}
                >
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { resolvedTheme } = useThemeContext();
  const [lineType, setLineType] = useState<ReportTransactionType>("expense");
  const [radarType, setRadarType] = useState<ReportTransactionType>("expense");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [period, setPeriod] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const {
    data: kpis,
    error: kpiError,
    isLoading: isKpiLoading,
  } = useAsyncData(
    () => reportService.kpis(period),
    [period.month, period.year],
    "Não foi possível carregar os indicadores.",
  );
  const {
    data: budgetReport,
    error: budgetError,
    isLoading: isBudgetLoading,
  } = useAsyncData(
    () => reportService.budgets(period),
    [period.month, period.year],
    "Não foi possível carregar os orçamentos.",
  );
  const { data: areasPage } = useAsyncData(
    () => areaService.list({ limit: 100 }),
    [],
    "Não foi possível carregar as áreas.",
  );
  const {
    data: lineReport,
    error: lineError,
    isLoading: isLineLoading,
  } = useAsyncData(
    () =>
      reportService.lineChart({
        year: period.year,
        month: period.month,
        type: lineType,
      }),
    [lineType, period.month, period.year],
    "Não foi possível carregar o gráfico de movimentação.",
  );
  const {
    data: radarReport,
    error: radarError,
    isLoading: isRadarLoading,
  } = useAsyncData(
    () =>
      reportService.radarChart({
        year: period.year,
        month: period.month,
        type: radarType,
        area_ids:
          selectedAreaIds.length > 0 ? selectedAreaIds.join(",") : undefined,
      }),
    [radarType, period.month, period.year, selectedAreaIds.join(",")],
    "Não foi possível carregar o gráfico por área.",
  );

  const linePoints = useMemo(
    () => aggregatePoints(lineReport?.points ?? [], granularity),
    [lineReport?.points, granularity],
  );
  const chartTextColor = resolvedTheme === "dark" ? "#fff" : "#1f2937";
  const chartSx = {
    color: chartTextColor,
    "& text": { fill: chartTextColor },
    "& .MuiChartsLegend-label, & .MuiChartsLegend-series": {
      color: chartTextColor,
      fill: chartTextColor,
    },
    "& .MuiChartsAxis-tickLabel, & .MuiChartsAxis-label": {
      fill: chartTextColor,
    },
    ...(resolvedTheme === "dark"
      ? {
          "& .MuiChartsGrid-line, & .MuiChartsAxis-tick, & .MuiChartsAxis-line":
            { stroke: "#777" },
          "& .MuiRadarChart-gridRadial, & .MuiRadarChart-gridDivider": {
            stroke: "#777",
            strokeOpacity: 1,
          },
          "& .MuiRadarChart-gridStripe": { fillOpacity: 1 },
        }
      : {}),
  };
  const error = kpiError ?? budgetError ?? lineError ?? radarError;
  const isInitialLoading =
    (isKpiLoading && !kpis) ||
    (isBudgetLoading && !budgetReport) ||
    (isLineLoading && !lineReport) ||
    (isRadarLoading && !radarReport);
  const toggleArea = (areaId: number) => {
    setSelectedAreaIds((current) =>
      current.includes(areaId)
        ? current.filter((id) => id !== areaId)
        : [...current, areaId],
    );
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Acompanhe sua movimentação financeira em{" "}
            {formatPeriod(period.month, period.year)}.
          </p>
        </div>
        {error ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Erro ao carregar</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        {isInitialLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <section aria-label="Indicadores do mês">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Indicadores do mês</h2>
                  <p className="text-sm text-muted">
                    Resumo financeiro de{" "}
                    {formatPeriod(period.month, period.year)}.
                  </p>
                </div>
                <PeriodFilters
                  month={period.month}
                  year={period.year}
                  onMonthChange={(month) =>
                    setPeriod((current) => ({ ...current, month }))
                  }
                  onYearChange={(year) =>
                    setPeriod((current) => ({ ...current, year }))
                  }
                />
              </div>
              <KPIs
                balance={kpis?.balance ?? 0}
                expense={kpis?.expense ?? 0}
                income={kpis?.income ?? 0}
                isLoading={isKpiLoading}
              />
            </section>
            <LineChart
              chartSx={chartSx}
              chartTextColor={chartTextColor}
              error={lineError}
              granularity={granularity}
              historyMonths={lineReport?.history_months ?? 6}
              isLoading={isLineLoading}
              points={linePoints}
              type={lineType}
              onGranularityChange={setGranularity}
              onTypeChange={setLineType}
            />
            <RadarChart
              areas={areasPage?.data ?? []}
              chartSx={chartSx}
              chartTextColor={chartTextColor}
              error={radarError}
              isLoading={isRadarLoading}
              radarAreas={radarReport?.areas ?? []}
              resolvedTheme={resolvedTheme}
              selectedAreaIds={selectedAreaIds}
              type={radarType}
              onAreaToggle={toggleArea}
              onTypeChange={setRadarType}
            />
            <section className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Progresso de orçamentos</h2>
              <p className="text-sm text-muted">
                Acompanhe o quanto já foi gasto e o limite de cada orçamento em{" "}
                {formatPeriod(period.month, period.year)}.
              </p>
              <BudgetsPercent
                budgets={budgetReport?.budgets ?? []}
                error={budgetError}
                isLoading={isBudgetLoading}
              />
            </section>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
