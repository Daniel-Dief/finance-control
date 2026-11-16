import type { Area } from '@/types/area';
import type { AreaCategoryReportItem, ReportTransactionType } from '@/types/report';

import { Label, ListBox, Select, Spinner } from '@heroui/react';
import { PieChart as MUIPieChart } from '@mui/x-charts/PieChart';

import { formatCurrencyFromCents } from '@/utils/format';

const EXPENSE_COLORS = [
  '#b91c1c',
  '#dc2626',
  '#ef4444',
  '#f87171',
  '#e11d48',
  '#be123c',
  '#f43f5e',
  '#9f1239',
  '#fb7185',
  '#7f1d1d'
];

const INCOME_COLORS = [
  '#15803d',
  '#16a34a',
  '#22c55e',
  '#4ade80',
  '#10b981',
  '#059669',
  '#34d399',
  '#047857',
  '#86efac',
  '#065f46'
];

export default function CategoriesPieChart({
  areas,
  categories,
  areaId,
  areaName,
  type,
  isLoading,
  error,
  chartTextColor,
  chartSx,
  onAreaChange,
  onTypeChange
}: {
  areas: Area[];
  categories: AreaCategoryReportItem[];
  areaId: number | null;
  areaName: string | undefined;
  type: ReportTransactionType;
  isLoading: boolean;
  error: string | null;
  chartTextColor: string;
  chartSx: Record<string, unknown>;
  onAreaChange: (areaId: number) => void;
  onTypeChange: (value: ReportTransactionType) => void;
}) {
  const typeLabel = type === 'expense' ? 'saídas' : 'entradas';
  const palette = type === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;

  return (
    <section className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Movimentação por categoria</h2>
          <p className="text-sm text-muted">
            {areaName
              ? `Total de ${typeLabel} em ${areaName} por categoria.`
              : `Total de ${typeLabel} por categoria na área selecionada.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            className="min-w-40"
            value={areaId}
            onChange={(value) => value !== null && onAreaChange(Number(value))}
          >
            <Label>Área</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {areas.map((area) => (
                  <ListBox.Item key={area.id} id={area.id} textValue={area.name}>
                    {area.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            className="min-w-36"
            value={type}
            onChange={(value) =>
              value !== null && onTypeChange(String(value) as ReportTransactionType)
            }
          >
            <Label>Tipo</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="expense" textValue="Saídas">
                  Saídas
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="income" textValue="Entradas">
                  Entradas
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>
      {areas.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Cadastre uma área para visualizar a movimentação por categoria.
        </p>
      ) : isLoading && areaId !== null ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-danger">{error}</p>
      ) : categories.length > 0 ? (
        <div className="h-96 w-full">
          <MUIPieChart
            height={360}
            series={[
              {
                data: categories.map((category, index) => ({
                  id: category.category_id,
                  value: category.amount,
                  label: category.category_name,
                  color: palette[index % palette.length]
                })),
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { additionalRadius: -10, color: 'gray' },
                valueFormatter: (value) => formatCurrencyFromCents(value.value)
              }
            ]}
            slotProps={{
              legend: {
                sx: { color: chartTextColor, '& .MuiChartsLegend-label': { color: chartTextColor } }
              }
            }}
            sx={chartSx}
          />
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted">
          Ainda não há movimentações por categoria nesta área.
        </p>
      )}
    </section>
  );
}
