import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { useIsMobile } from "@/hooks/use-mobile"
import { areasApi, budgetsApi, categoriesApi, transactionsApi } from "@/api"
import { format } from "date-fns"
import { BarChart } from "@mui/x-charts/BarChart"
import { LineChart } from "@mui/x-charts/LineChart"
import { PieChart } from "@mui/x-charts/PieChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/searchable-select"
import {
  ArrowDown,
  ArrowUp,
  CurrencyCircleDollar,
  CreditCard,
  Receipt,
  FunnelSimple,
  X,
} from "@phosphor-icons/react"

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const INCOME_COLOR = "#10b981"
const EXPENSE_COLOR = "#ef4444"
const BALANCE_COLOR = "#3b82f6"

const PIE_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#6366f1",
]

const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  })

const brlCompact = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  })

export default function Dashboard() {
  const now = new Date()
  const isMobile = useIsMobile()

  const [filterYear, setFilterYear] = useState<string>(
    String(now.getFullYear())
  )
  const [filterMonth, setFilterMonth] = useState<string>(
    String(now.getMonth() + 1)
  )
  const [filterAreaId, setFilterAreaId] = useState<string>("")
  const [filterCategoryId, setFilterCategoryId] = useState<string>("")

  const { data: areas, loading: loadingAreas } = useFetch(
    () => areasApi.list(),
    []
  )
  const { data: categories, loading: loadingCategories } = useFetch(
    () => categoriesApi.list(),
    []
  )
  const { data: budgets, loading: loadingBudgets } = useFetch(
    () =>
      budgetsApi.list({
        year: parseInt(filterYear),
        month: parseInt(filterMonth),
        ...(filterAreaId ? { areaId: parseInt(filterAreaId) } : {}),
      }),
    [filterYear, filterMonth, filterAreaId]
  )
  const { data: transactions, loading: loadingTx } = useFetch(
    () =>
      transactionsApi.list({
        from: format(
          new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1),
          "yyyy-MM-dd"
        ),
        to: format(
          new Date(
            parseInt(filterYear),
            parseInt(filterMonth),
            0
          ),
          "yyyy-MM-dd"
        ),
      }),
    [filterYear, filterMonth]
  )

  const loading =
    loadingAreas || loadingCategories || loadingBudgets || loadingTx

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  const areaList = areas ?? []
  const catList = categories ?? []
  const budgetList = budgets ?? []
  let txList = transactions ?? []

  if (filterAreaId) {
    txList = txList.filter((t) => t.areaId === parseInt(filterAreaId))
  }
  if (filterCategoryId) {
    txList = txList.filter(
      (t) => t.categoryId === parseInt(filterCategoryId)
    )
  }

  const totalIncome = txList
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = txList
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalBudget = budgetList.reduce((sum, b) => sum + b.amount, 0)

  const monthLabel = `${MONTHS[parseInt(filterMonth) - 1]} ${filterYear}`

  const getAreaName = (id: number) =>
    areaList.find((a) => a.id === id)?.name ?? "---"

  const daysInMonth = new Date(
    parseInt(filterYear),
    parseInt(filterMonth),
    0
  ).getDate()
  const dayLabels = Array.from(
    { length: daysInMonth },
    (_, i) => String(i + 1)
  )
  const dailyIncome = Array.from({ length: daysInMonth }, () => 0)
  const dailyExpense = Array.from({ length: daysInMonth }, () => 0)
  for (const t of txList) {
    const day = parseInt(t.date.slice(8, 10), 10)
    if (t.type === "income") {
      dailyIncome[day - 1] += t.amount
    } else {
      dailyExpense[day - 1] += t.amount
    }
  }
  let accIncome = 0
  const cumulativeIncome = dailyIncome.map((v) => {
    accIncome += v
    return accIncome
  })
  let accExpense = 0
  const cumulativeExpense = dailyExpense.map((v) => {
    accExpense += v
    return accExpense
  })
  let acc = 0
  const cumulativeBalance = dailyIncome.map((v, i) => {
    acc += v - dailyExpense[i]
    return acc
  })

  const weekCount = Math.ceil(daysInMonth / 7)
  const weeklyLabels: string[] = []
  const weeklyIncome: number[] = []
  const weeklyExpense: number[] = []
  const weeklyBalance: number[] = []
  for (let w = 0; w < weekCount; w++) {
    const startDay = w * 7 + 1
    const endDay = Math.min(startDay + 6, daysInMonth)
    weeklyLabels.push(`${startDay}-${endDay}`)
    const idx = endDay - 1
    weeklyIncome.push(cumulativeIncome[idx])
    weeklyExpense.push(cumulativeExpense[idx])
    weeklyBalance.push(cumulativeBalance[idx])
  }

  const axisTickLabelStyle = {
    fill: "var(--muted-foreground)",
    fontSize: isMobile ? 9 : 11,
  }

  const expensesByCategory = new Map<string, number>()
  for (const t of txList) {
    if (t.type !== "expense") continue
    const name =
      catList.find((c) => c.id === t.categoryId)?.name ?? "Sem categoria"
    expensesByCategory.set(
      name,
      (expensesByCategory.get(name) ?? 0) + t.amount
    )
  }
  const pieData = Array.from(expensesByCategory.entries())
    .map(([label, value], i) => ({
      id: label,
      label,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  const activeAreas = areaList.filter((a) =>
    txList.some((t) => t.areaId === a.id)
  )
  const incomePerArea = activeAreas.map((a) =>
    txList
      .filter((t) => t.areaId === a.id && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  )
  const expensePerArea = activeAreas.map((a) =>
    txList
      .filter((t) => t.areaId === a.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const areaOptions = areaList.map((a) => ({
    value: String(a.id),
    label: a.name,
  }))

  const categoryOptions = catList.map((c) => ({
    value: String(c.id),
    label: c.name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">{monthLabel}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-md border p-3">
        <FunnelSimple className="mb-1 h-4 w-4 text-muted-foreground" />
        <div className="min-w-36 space-y-1">
          <Label className="text-xs">Ano</Label>
          <SearchableSelect
            options={YEARS.map((y) => ({
              value: String(y),
              label: String(y),
            }))}
            value={filterYear}
            onValueChange={setFilterYear}
            placeholder="Ano"
          />
        </div>
        <div className="min-w-36 space-y-1">
          <Label className="text-xs">Mes</Label>
          <SearchableSelect
            options={MONTHS.map((m, i) => ({
              value: String(i + 1),
              label: m,
            }))}
            value={filterMonth}
            onValueChange={setFilterMonth}
            placeholder="Mes"
          />
        </div>
        <div className="min-w-36 space-y-1">
          <Label className="text-xs">Area</Label>
          <SearchableSelect
            options={areaOptions}
            value={filterAreaId}
            onValueChange={setFilterAreaId}
            placeholder="Todas"
          />
        </div>
        <div className="min-w-50 space-y-1">
          <Label className="text-xs">Categoria</Label>
          <SearchableSelect
            options={categoryOptions}
            value={filterCategoryId}
            onValueChange={setFilterCategoryId}
            placeholder="Todas"
          />
        </div>
        {(filterAreaId || filterCategoryId) && (
          <button
            type="button"
            onClick={() => {
              setFilterAreaId("")
              setFilterCategoryId("")
            }}
            className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalExpense.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              R$ {(totalIncome - totalExpense).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Orcamento Total
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalBudget.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolucao do Mes</CardTitle>
        </CardHeader>
        <CardContent>
          {txList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma transacao encontrada.
            </p>
          ) : (
            <LineChart
              height={isMobile ? 240 : 300}
              margin={{ left: isMobile ? 0 : 8, right: isMobile ? 0 : 8 }}
              colors={[INCOME_COLOR, EXPENSE_COLOR, BALANCE_COLOR]}
              xAxis={[
                {
                  scaleType: "point",
                  data: isMobile ? weeklyLabels : dayLabels,
                  tickLabelStyle: axisTickLabelStyle,
                  ...(isMobile
                    ? {}
                    : {
                        tickLabelInterval: (_, i) =>
                          !(i % 5 === 0 || i === dayLabels.length - 1),
                      }),
                },
              ]}
              yAxis={[
                {
                  valueFormatter: (value: number) =>
                    isMobile ? brlCompact(value) : brl(value),
                  tickLabelStyle: axisTickLabelStyle,
                },
              ]}
              series={[
                {
                  label: "Receitas Acumuladas",
                  data: isMobile ? weeklyIncome : cumulativeIncome,
                  curve: "linear",
                  showMark: false,
                  valueFormatter: (v) => brl(Number(v)),
                },
                {
                  label: "Despesas Acumuladas",
                  data: isMobile ? weeklyExpense : cumulativeExpense,
                  curve: "linear",
                  showMark: false,
                  valueFormatter: (v) => brl(Number(v)),
                },
                {
                  label: "Saldo",
                  data: isMobile ? weeklyBalance : cumulativeBalance,
                  curve: "linear",
                  showMark: false,
                  valueFormatter: (v) => brl(Number(v)),
                },
              ]}
              grid={{ horizontal: true }}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                  sx: {
                    color: "var(--muted-foreground)",
                    fontSize: isMobile ? 10 : 12,
                  },
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa registrada neste periodo.
              </p>
            ) : (
              <PieChart
                height={isMobile ? 260 : 300}
                margin={{ left: 16, right: 16 }}
                series={[
                  {
                    data: pieData,
                    innerRadius: isMobile ? 45 : 55,
                    outerRadius: isMobile ? 75 : 90,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: "horizontal",
                    position: { vertical: "bottom", horizontal: "center" },
                    sx: {
                      color: "var(--muted-foreground)",
                      fontSize: isMobile ? 10 : 12,
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Receitas x Despesas por Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma transacao encontrada.
              </p>
            ) : (
              <BarChart
                height={isMobile ? 240 : 300}
                margin={{ left: isMobile ? 0 : 8, right: isMobile ? 0 : 8 }}
                colors={[INCOME_COLOR, EXPENSE_COLOR]}
                xAxis={[
                  {
                    scaleType: "band",
                    data: activeAreas.map((a) => getAreaName(a.id)),
                    tickLabelStyle: axisTickLabelStyle,
                  },
                ]}
                yAxis={[
                  {
                    valueFormatter: (value: number) =>
                      isMobile ? brlCompact(value) : brl(value),
                    tickLabelStyle: axisTickLabelStyle,
                  },
                ]}
                series={[
                  {
                    label: "Receitas",
                    data: incomePerArea,
                    valueFormatter: (v) => brl(Number(v)),
                  },
                  {
                    label: "Despesas",
                    data: expensePerArea,
                    valueFormatter: (v) => brl(Number(v)),
                  },
                ]}
                grid={{ horizontal: true }}
                slotProps={{
                  legend: {
                    direction: "horizontal",
                    position: { vertical: "bottom", horizontal: "center" },
                    sx: {
                      color: "var(--muted-foreground)",
                      fontSize: isMobile ? 10 : 12,
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transacoes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {txList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma transacao encontrada.
              </p>
            ) : (
              <div className="space-y-3">
                {txList.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {t.type === "income" ? (
                        <ArrowUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <span className="font-medium">
                          {getAreaName(t.areaId)}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {format(new Date(t.date + "T00:00:00"), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={
                        t.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {t.type === "income" ? "+" : "-"} R$ {t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orcamentos do Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum orcamento encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {budgetList.map((b) => {
                  const spent = txList
                    .filter(
                      (t) => t.areaId === b.areaId && t.type === "expense"
                    )
                    .reduce((sum, t) => sum + t.amount, 0)
                  const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CurrencyCircleDollar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getAreaName(b.areaId)}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          R$ {spent.toFixed(2)} / R$ {b.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
