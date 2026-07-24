import { useState } from "react"
import { budgetsApi, areasApi } from "@/api"
import type { Budget } from "@/types"
import { useFetch } from "@/hooks/use-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ListCard, ListCardField } from "@/components/list-card"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Plus, Pencil, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"

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

export default function BudgetsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: budgets, loading } = useFetch(
    () => budgetsApi.list(),
    [refreshKey]
  )
  const { data: areas } = useFetch(() => areasApi.list(), [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [formYear, setFormYear] = useState<string>(String(currentYear))
  const [formMonth, setFormMonth] = useState<string>(
    String(new Date().getMonth() + 1)
  )
  const [formAreaId, setFormAreaId] = useState<string>("")
  const [formAmount, setFormAmount] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setFormYear(String(currentYear))
    setFormMonth(String(new Date().getMonth() + 1))
    setFormAreaId("")
    setFormAmount("")
    setDialogOpen(true)
  }

  function openEdit(b: Budget) {
    setEditing(b)
    setFormYear(String(b.year))
    setFormMonth(String(b.month))
    setFormAreaId(String(b.areaId))
    setFormAmount(String(b.amount))
    setDialogOpen(true)
  }

  async function handleSave() {
    const amount = parseFloat(formAmount)
    if (!formAreaId) {
      toast.error("Selecione uma area")
      return
    }
    if (isNaN(amount) || amount < 0) {
      toast.error("Valor invalido")
      return
    }

    setSaving(true)
    try {
      const data = {
        year: parseInt(formYear),
        month: parseInt(formMonth),
        areaId: parseInt(formAreaId),
        amount,
      }
      if (editing) {
        await budgetsApi.update(editing.id, data)
        toast.success("Orcamento atualizado")
      } else {
        await budgetsApi.create(data)
        toast.success("Orcamento criado")
      }
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  function openDeleteConfirm(b: Budget) {
    setDeletingBudget(b)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deletingBudget) return
    setDeleting(true)
    try {
      await budgetsApi.delete(deletingBudget.id)
      toast.success("Orcamento removido")
      setConfirmOpen(false)
      setDeletingBudget(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setDeleting(false)
    }
  }

  const areaList = areas ?? []
  const budgetList = budgets ?? []

  const getAreaName = (id: number) =>
    areaList.find((a) => a.id === id)?.name ?? "---"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orcamentos</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Novo Orcamento
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : budgetList.length === 0 ? (
        <p className="text-muted-foreground">Nenhum orcamento encontrado.</p>
      ) : (
        <>
          <div className="hidden rounded-md border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetList.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {MONTHS[b.month - 1]} / {b.year}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getAreaName(b.areaId)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {b.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(b)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteConfirm(b)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 lg:hidden">
            {budgetList.map((b) => (
              <ListCard
                key={b.id}
                title={getAreaName(b.areaId)}
                action={
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(b)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteConfirm(b)}
                    >
                      <Trash className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                }
              >
                <ListCardField label="Periodo">
                  {MONTHS[b.month - 1]} / {b.year}
                </ListCardField>
                <ListCardField label="Valor" className="text-right">
                  R$ {b.amount.toFixed(2)}
                </ListCardField>
              </ListCard>
            ))}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Orcamento" : "Novo Orcamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select
                  value={formYear}
                  onValueChange={(v) => setFormYear(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select
                  value={formMonth}
                  onValueChange={(v) => setFormMonth(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Area</Label>
              <Select
                value={formAreaId}
                onValueChange={(v) => setFormAreaId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma area" />
                </SelectTrigger>
                <SelectContent>
                  {areaList.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-amount">Valor (R$)</Label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover orcamento"
        description="Remover este orcamento?"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
