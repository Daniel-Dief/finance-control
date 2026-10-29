import type { BudgetProgress } from '@/types/report';

import { LinearProgress } from '@mui/material';
import { Spinner } from '@heroui/react';

import { formatCurrencyFromCents } from '@/utils/format';

export default function BudgetsPercent({
  budgets,
  isLoading,
  error
}: {
  budgets: BudgetProgress[];
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-sm text-danger">{error}</p>;
  }

  return (
    <div className="mt-5 grid gap-5 md:grid-cols-2">
      {budgets.map((budget) => (
        <div key={budget.id}>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">{budget.area_name}</span>
            <span className={budget.exceeded ? 'text-danger' : 'text-muted'}>
              {formatCurrencyFromCents(budget.spent)} de {formatCurrencyFromCents(budget.amount)}
            </span>
          </div>
          <LinearProgress
            color={budget.exceeded ? 'error' : 'success'}
            sx={{ height: 10, borderRadius: 999 }}
            value={Math.min(100, Math.max(0, budget.percentage))}
            variant="determinate"
          />
          <p className={`mt-1 text-xs ${budget.exceeded ? 'text-danger' : 'text-muted'}`}>
            {budget.exceeded
              ? `Orçamento excedido em ${formatCurrencyFromCents(Math.abs(budget.remaining))}`
              : `Restam ${formatCurrencyFromCents(budget.remaining)}`}
          </p>
        </div>
      ))}
      {budgets.length === 0 ? (
        <p className="text-sm text-muted">Nenhum orçamento cadastrado para este mês.</p>
      ) : null}
    </div>
  );
}
