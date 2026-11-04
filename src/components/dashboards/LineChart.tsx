import type { ReportTransactionType } from '@/types/report';

import { Label, ListBox, Select, Spinner } from '@heroui/react';
import { LineChart as MUILineChart } from '@mui/x-charts/LineChart';

import { formatChartAmount } from '@/utils/format';

export interface LineChartPoint {
  label: string;
  value: number;
  median: number;
}

export default function LineChart({
  points,
  type,
  granularity,
  historyMonths,
  isLoading,
  error,
  chartTextColor,
  chartSx,
  onTypeChange,
  onGranularityChange
}: {
  points: LineChartPoint[];
  type: ReportTransactionType;
  granularity: 'daily' | 'weekly';
  historyMonths: number;
  isLoading: boolean;
  error: string | null;
  chartTextColor: string;
  chartSx: Record<string, unknown>;
  onTypeChange: (value: ReportTransactionType) => void;
  onGranularityChange: (value: 'daily' | 'weekly') => void;
}) {
  const colors =
    type === 'expense'
      ? { primary: '#ef4444', secondary: '#fca5a5' }
      : { primary: '#22c55e', secondary: '#86efac' };

  const select = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (value: string) => void
  ) => (
    <Select
      className="min-w-36"
      value={value}
      onChange={(nextValue) => {
        if (nextValue !== null) onChange(String(nextValue));
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );

  return (
    <section className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Movimentação no mês</h2>
          <p className="text-sm text-muted">
            A linha tracejada representa a mediana dos últimos {historyMonths} meses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {select(
            'Tipo',
            type,
            [
              { value: 'expense', label: 'Saídas' },
              { value: 'income', label: 'Entradas' }
            ],
            (value) => onTypeChange(value as ReportTransactionType)
          )}
          {select(
            'Agrupamento',
            granularity,
            [
              { value: 'daily', label: 'Diário' },
              { value: 'weekly', label: 'Semanal' }
            ],
            (value) => onGranularityChange(value as 'daily' | 'weekly')
          )}
        </div>
      </div>
      <div className="mt-4 h-80 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="flex h-full items-center justify-center text-sm text-danger">{error}</p>
        ) : points.length > 0 ? (
          <MUILineChart
            grid={{ horizontal: true }}
            height={320}
            series={[
              {
                data: points.map((point) => point.value),
                label: 'Movimentação',
                color: colors.primary,
                valueFormatter: (value) => formatChartAmount(value)
              },
              {
                data: points.map((point) => point.median),
                label: 'Mediana',
                color: colors.secondary,
                curve: 'linear',
                valueFormatter: (value) => formatChartAmount(value)
              }
            ]}
            slotProps={{
              axisLabel: { style: { fill: chartTextColor, color: chartTextColor } },
              axisTick: { stroke: chartTextColor },
              axisTickLabel: { style: { fill: chartTextColor, color: chartTextColor } },
              legend: {
                sx: { color: chartTextColor, '& .MuiChartsLegend-label': { color: chartTextColor } }
              }
            }}
            sx={chartSx}
            xAxis={[{ scaleType: 'point', data: points.map((point) => point.label) }]}
            yAxis={[
              { tickMinStep: 5000, valueFormatter: (value: number) => formatChartAmount(value) }
            ]}
          />
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-muted">
            Ainda não há movimentações para exibir.
          </p>
        )}
      </div>
    </section>
  );
}
