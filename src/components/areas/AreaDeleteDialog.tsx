import { useState } from "react";
import { AlertDialog, Button, toast } from "@heroui/react";
import axios from "axios";

import { areaService } from "@/services/areaService";
import type { Area } from "@/types/area";

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
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.danger("Área não encontrada. Ela pode já ter sido removida.");
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
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>Excluir área?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Tem certeza que deseja excluir <strong>{area?.name}</strong>?
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
