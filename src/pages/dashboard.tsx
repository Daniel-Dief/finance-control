import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { areasApi, budgetsApi, categoriesApi, transactionsApi } from "@/api"
import { format } from "date-fns"
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

export default function Dashboard() {
  const now = new Date()

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
