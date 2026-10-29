import { Spinner } from "@heroui/react";

import { formatCurrencyFromCents } from "@/utils/format";

export interface KPIsProps {
  income: number;
  expense: number;
  balance: number;
  isLoading: boolean;
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
}) {
  const toneClass = {
    income: "text-success",
    expense: "text-danger",
    balance: value >= 0 ? "text-primary" : "text-danger",
  }[tone];

  return (
    <div className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>
        {formatCurrencyFromCents(value)}
      </p>
    </div>
  );
}

export default function KPIs({
  income,
  expense,
  balance,
  isLoading,
}: KPIsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard label="Valor que entrou" tone="income" value={income} />
      <KpiCard label="Valor que saiu" tone="expense" value={expense} />
      <KpiCard label="Saldo do mês" tone="balance" value={balance} />
    </div>
  );
}
