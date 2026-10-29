import type { Area } from '@/types/area';
import type { RadarArea, ReportTransactionType } from '@/types/report';

import { Button, Label, ListBox, Select, Spinner } from '@heroui/react';
import { RadarChart as MUIRadarChart } from '@mui/x-charts/RadarChart';

import { formatCurrencyFromCents } from '@/utils/format';

export default function RadarChart({
  areas,
  radarAreas,
  type,
  isLoading,
  error,
  selectedAreaIds,
  resolvedTheme,
  chartTextColor,
  chartSx,
  onTypeChange,
  onAreaToggle
}: {
  areas: Area[];
  radarAreas: RadarArea[];
  type: ReportTransactionType;
  isLoading: boolean;
  error: string | null;
  selectedAreaIds: number[];
  resolvedTheme: string | undefined;
  chartTextColor: string;
  chartSx: Record<string, unknown>;
  onTypeChange: (value: ReportTransactionType) => void;
  onAreaToggle: (areaId: number) => void;
}) {
  const colors =
    type === 'expense'
      ? { primary: '#ef4444', secondary: '#fca5a5' }
      : { primary: '#22c55e', secondary: '#86efac' };

  return (
    <section className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Movimentação por área</h2>
            <p className="text-sm text-muted">
              Compare o mês atual com a mediana histórica por área.
            </p>
          </div>
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
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-danger">{error}</p>
        ) : radarAreas.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <Button
                  key={area.id}
                  size="sm"
                  variant={
                    selectedAreaIds.length === 0 || selectedAreaIds.includes(area.id)
                      ? 'primary'
                      : 'tertiary'
                  }
                  onPress={() => onAreaToggle(area.id)}
                >
                  {area.name}
                </Button>
              ))}
            </div>
            <div className="h-96 w-full">
              <MUIRadarChart
                height={360}
                highlight="none"
                radar={{
                  metrics: radarAreas.map((area) => area.area_name),
                  max: Math.max(1, ...radarAreas.flatMap((area) => [area.value, area.median]))
                }}
                series={[
                  {
                    label: 'Movimentação',
                    data: radarAreas.map((area) => area.value),
                    color: colors.primary,
                    fillArea: true,
                    valueFormatter: (value) => formatCurrencyFromCents(value ?? 0)
                  },
                  {
                    label: 'Mediana',
                    data: radarAreas.map((area) => area.median),
                    color: colors.secondary,
                    valueFormatter: (value) => formatCurrencyFromCents(value ?? 0)
                  }
                ]}
                slotProps={{
                  legend: {
                    sx: {
                      color: chartTextColor,
                      '& .MuiChartsLegend-label': { color: chartTextColor }
                    }
                  }
                }}
                stripeColor={
                  resolvedTheme === 'dark'
                    ? (index: number) => (index % 2 === 0 ? '#151515' : '#252525')
                    : undefined
                }
                sx={chartSx}
              />
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-muted">
            Ainda não há dados por área para exibir.
          </p>
        )}
      </div>
    </section>
  );
}
