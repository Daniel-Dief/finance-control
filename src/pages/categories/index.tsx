import { useState } from "react"
import { categoriesApi } from "@/api"
import type { Category } from "@/types"
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

export default function CategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: categories, loading } = useFetch(
    () => categoriesApi.list(),
    [refreshKey]
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setName("")
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
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
        await categoriesApi.update(editing.id, name.trim())
        toast.success("Categoria atualizada")
      } else {
        await categoriesApi.create(name.trim())
        toast.success("Categoria criada")
      }
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  function openDeleteConfirm(cat: Category) {
    setDeletingCategory(cat)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deletingCategory) return
    setDeleting(true)
    try {
      await categoriesApi.delete(deletingCategory.id)
      toast.success("Categoria removida")
      setConfirmOpen(false)
      setDeletingCategory(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setDeleting(false)
    }
  }

  const catList = categories ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : catList.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
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
                {catList.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.id}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteConfirm(cat)}
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
            {catList.map((cat) => (
              <ListCard
                key={cat.id}
                title={cat.name}
                action={
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteConfirm(cat)}
                    >
                      <Trash className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                }
              >
                <ListCardField label="ID">{cat.id}</ListCardField>
              </ListCard>
            ))}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentacao"
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
        title="Remover categoria"
        description={`Remover a categoria "${deletingCategory?.name}"?`}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
