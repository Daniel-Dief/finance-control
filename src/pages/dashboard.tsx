import { useFetch } from "@/hooks/use-fetch"
import { areasApi, budgetsApi, transactionsApi } from "@/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowDown,
  ArrowUp,
  CurrencyCircleDollar,
  CreditCard,
  Receipt,
} from "@phosphor-icons/react"

export default function Dashboard() {
  const now = new Date()
  const monthLabel = format(now, "MMMM yyyy", { locale: ptBR })

  const { data: areas, loading: loadingAreas } = useFetch(
    () => areasApi.list(),
    []
  )
  const { data: budgets, loading: loadingBudgets } = useFetch(
    () =>
      budgetsApi.list({ year: now.getFullYear(), month: now.getMonth() + 1 }),
    []
  )
  const { data: transactions, loading: loadingTx } = useFetch(
    () =>
      transactionsApi.list({
        from: format(
          new Date(now.getFullYear(), now.getMonth(), 1),
          "yyyy-MM-dd"
        ),
        to: format(now, "yyyy-MM-dd"),
      }),
    []
  )

  const loading = loadingAreas || loadingBudgets || loadingTx

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  const areaList = areas ?? []
  const budgetList = budgets ?? []
  const txList = transactions ?? []

  const totalIncome = txList
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = txList
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalBudget = budgetList.reduce((sum, b) => sum + b.amount, 0)

  const getAreaName = (id: number) =>
    areaList.find((a) => a.id === id)?.name ?? "---"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">{monthLabel}</p>
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
                Nenhuma transacao este mes.
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
                Nenhum orcamento este mes.
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
