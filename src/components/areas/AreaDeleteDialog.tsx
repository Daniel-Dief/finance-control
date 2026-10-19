import type { Area } from "@/types/area";

import { useState } from "react";
import { toast } from "@heroui/react";

import { DeleteDialog } from "../DeleteDialog";

import { areaService } from "@/services/areaService";
import { deleteAreasValidate } from "@/utils/mapErros";

interface AreaDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  area: Area | null;
  onDeleted: (area: Area) => void;
}

export default function AreaDeleteDialog({
  isOpen,
  onOpenChange,
  area,
  onDeleted,
}: AreaDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!area) {
      return;
    }

    setIsDeleting(true);

    try {
      await areaService.remove(area.id);
      toast.success("Área excluída com sucesso.");
      onDeleted(area);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = deleteAreasValidate(err);

      if (errorMessage) {
        toast.danger(errorMessage);
        onDeleted(area);
        onOpenChange(false);

        return;
      }

      toast.danger("Não foi possível excluir a área. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DeleteDialog
      handleDelete={handleDelete}
      isDeleting={isDeleting}
      isOpen={isOpen}
      name={area?.name ?? ""}
      title="Excluir área?"
      onOpenChange={onOpenChange}
    />
  );
}
