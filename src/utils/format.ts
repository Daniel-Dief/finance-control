export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  label,
  value: index + 1,
}));

export function getYearOptions(span = 3): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];

  for (let year = current + 1; year >= current - span; year -= 1) {
    years.push(year);
  }

  return years;
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

/**
 * A API armazena o valor do orçamento em centavos (ex.: R$ 1.500,00 => 150000).
 */
export function formatCurrencyFromCents(cents: number): string {
  const value = Number.isFinite(cents) ? cents : 0;

  return brlFormatter.format(value / 100);
}

export function formatPeriod(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] ?? `Mês ${month}`;

  return `${name} de ${year}`;
}
