import { useState } from "react";
import { AlertDialog, Button, toast } from "@heroui/react";
import axios from "axios";

import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: Category | null;
  onDeleted: (category: Category) => void;
}

export default function CategoryDeleteDialog({
  isOpen,
  onOpenChange,
  category,
  onDeleted,
}: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!category) {
      return;
    }

    setIsDeleting(true);

    try {
      await categoryService.remove(category.id);
      toast.success("Categoria excluída com sucesso.");
      onDeleted(category);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.danger("Categoria não encontrada. Ela pode já ter sido removida.");
        onDeleted(category);
        onOpenChange(false);

        return;
      }

      toast.danger("Não foi possível excluir a categoria. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>Excluir categoria?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Tem certeza que deseja excluir <strong>{category?.name}</strong>?
              Essa ação não pode ser desfeita.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              isPending={isDeleting}
              variant="danger"
              onPress={handleDelete}
            >
              {({ isPending }) => (isPending ? "Excluindo..." : "Excluir")}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}