import { useState } from "react"
import { areasApi } from "@/api"
import type { Area } from "@/types"
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

export default function AreasPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: areas, loading } = useFetch(() => areasApi.list(), [refreshKey])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Area | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingArea, setDeletingArea] = useState<Area | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setName("")
    setDialogOpen(true)
  }

  function openEdit(area: Area) {
    setEditing(area)
    setName(area.name)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Nome e obrigatorio")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await areasApi.update(editing.id, name.trim())
        toast.success("Area atualizada")
      } else {
        await areasApi.create(name.trim())
        toast.success("Area criada")
      }
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  function openDeleteConfirm(area: Area) {
    setDeletingArea(area)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deletingArea) return
    setDeleting(true)
    try {
      await areasApi.delete(deletingArea.id)
      toast.success("Area removida")
      setConfirmOpen(false)
      setDeletingArea(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setDeleting(false)
    }
  }

  const areaList = areas ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Areas</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Nova Area
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : areaList.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma area encontrada.</p>
      ) : (
        <>
          <div className="hidden rounded-md border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-24">Açoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areaList.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>{area.id}</TableCell>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(area)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteConfirm(area)}
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
            {areaList.map((area) => (
              <ListCard
                key={area.id}
                title={area.name}
                action={
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(area)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteConfirm(area)}
                    >
                      <Trash className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                }
              >
                <ListCardField label="ID">{area.id}</ListCardField>
              </ListCard>
            ))}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Area" : "Nova Area"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="area-name">Nome</Label>
              <Input
                id="area-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Moradia"
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
        title="Remover area"
        description={`Remover a area "${deletingArea?.name}"? Isso deletara todos os orcamentos e transacoes vinculados.`}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
