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

export function formatChartAmount(cents: number | null): string {
  return Math.round((cents ?? 0) / 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

export function formatPeriod(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] ?? `Mês ${month}`;

  return `${name} de ${year}`;
}

export function formatDateByString(date: string): string {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * Converte um Date para o formato aceito pela API (AAAA-MM-DD).
 */
export function formatDateToApi(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Retorna o primeiro e o último dia de um mês no formato aceito pela API.
 * Os filtros `from`/`to` da API trabalham com o ano corrente.
 */
export function getMonthRange(month: number): { from: string; to: string } {
  const year = new Date().getFullYear();
  const lastDay = new Date(year, month, 0).getDate();

  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

export function getCurrentMonth(): string {
  const month = new Date().getMonth();

  return String(MONTH_OPTIONS[month].value);
}
