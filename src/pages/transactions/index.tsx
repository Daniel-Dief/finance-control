import { useState } from "react"
import { transactionsApi, areasApi, categoriesApi } from "@/api"
import type { Transaction, TransactionType } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import { ListCard, ListCardField } from "@/components/list-card"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Plus, Pencil, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: transactions, loading } = useFetch(
    () => transactionsApi.list(),
    [refreshKey]
  )
  const { data: areas } = useFetch(() => areasApi.list(), [])
  const { data: categories } = useFetch(() => categoriesApi.list(), [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [formAmount, setFormAmount] = useState("")
  const [formType, setFormType] = useState<TransactionType>("expense")
  const [formAreaId, setFormAreaId] = useState<string>("")
  const [formCategoryId, setFormCategoryId] = useState<string>("none")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setFormDate(format(new Date(), "yyyy-MM-dd"))
    setFormAmount("")
    setFormType("expense")
    setFormAreaId("")
    setFormCategoryId("none")
    setDialogOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setFormDate(t.date)
    setFormAmount(String(t.amount))
    setFormType(t.type)
    setFormAreaId(String(t.areaId))
    setFormCategoryId(t.categoryId ? String(t.categoryId) : "none")
    setDialogOpen(true)
  }

  async function handleSave() {
    const amount = parseFloat(formAmount)
    if (!formAreaId) {
      toast.error("Selecione uma area")
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Valor invalido")
      return
    }

    setSaving(true)
    try {
      const data = {
        date: formDate,
        amount,
        type: formType,
        areaId: parseInt(formAreaId),
        categoryId: formCategoryId === "none" ? null : parseInt(formCategoryId),
      }
      if (editing) {
        await transactionsApi.update(editing.id, data)
        toast.success("Transacao atualizada")
      } else {
        await transactionsApi.create(data)
        toast.success("Transacao criada")
      }
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  function openDeleteConfirm(t: Transaction) {
    setDeletingTx(t)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deletingTx) return
    setDeleting(true)
    try {
      await transactionsApi.delete(deletingTx.id)
      toast.success("Transacao removida")
      setConfirmOpen(false)
      setDeletingTx(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setDeleting(false)
    }
  }

  const areaList = areas ?? []
  const catList = categories ?? []
  const txList = transactions ?? []

  const getAreaName = (id: number) =>
    areaList.find((a) => a.id === id)?.name ?? "---"
  const getCategoryName = (id: number | null) =>
    id ? (catList.find((c) => c.id === id)?.name ?? "---") : "---"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacoes</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Nova Transacao
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : txList.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma transacao encontrada.</p>
      ) : (
        <>
          <div className="hidden rounded-md border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24">Açoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txList.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {format(new Date(t.date + "T00:00:00"), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.type === "income" ? "default" : "destructive"
                        }
                      >
                        {t.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getAreaName(t.areaId)}</TableCell>
                    <TableCell>{getCategoryName(t.categoryId)}</TableCell>
                    <TableCell className="text-right">
                      R$ {t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteConfirm(t)}
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
            {txList.map((t) => (
              <ListCard
                key={t.id}
                title={getAreaName(t.areaId)}
                action={
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteConfirm(t)}
                    >
                      <Trash className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                }
              >
                <ListCardField label="Data">
                  {format(new Date(t.date + "T00:00:00"), "dd/MM/yyyy")}
                </ListCardField>
                <ListCardField label="Tipo">
                  <Badge
                    variant={t.type === "income" ? "default" : "destructive"}
                  >
                    {t.type === "income" ? "Receita" : "Despesa"}
                  </Badge>
                </ListCardField>
                <ListCardField label="Categoria">
                  {getCategoryName(t.categoryId)}
                </ListCardField>
                <ListCardField label="Valor" className="text-right">
                  R$ {t.amount.toFixed(2)}
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
              {editing ? "Editar Transacao" : "Nova Transacao"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as TransactionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-date">Data</Label>
                <Input
                  id="tx-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
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
              <Label>Categoria (opcional)</Label>
              <Select
                value={formCategoryId}
                onValueChange={(v) => setFormCategoryId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {catList.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Valor (R$)</Label>
              <Input
                id="tx-amount"
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
        title="Remover transacao"
        description="Remover esta transacao?"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
