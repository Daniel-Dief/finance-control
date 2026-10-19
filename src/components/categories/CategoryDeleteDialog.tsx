import type { Category } from "@/types/category";

import { useState } from "react";
import { toast } from "@heroui/react";

import { categoryService } from "@/services/categoryService";
import { DeleteDialog } from "@/components/DeleteDialog";
import { deleteCategoriesValidate } from "@/utils/mapErros";

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
      const errorMessage = deleteCategoriesValidate(err);

      if (errorMessage) {
        toast.danger(errorMessage);
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
    <DeleteDialog
      handleDelete={handleDelete}
      isDeleting={isDeleting}
      isOpen={isOpen}
      name={category?.name || ""}
      title="Excluir categoria?"
      onOpenChange={onOpenChange}
    />
  );
}
