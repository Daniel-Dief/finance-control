import { useState } from "react";
import { AlertDialog, Button, toast } from "@heroui/react";
import axios from "axios";

import { budgetService } from "@/services/budgetService";
import type { Budget } from "@/types/budget";
import { formatPeriod } from "@/utils/format";

interface BudgetDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  budget: Budget | null;
  areaName: string;
  onDeleted: (budget: Budget) => void;
}

export default function BudgetDeleteDialog({
  isOpen,
  onOpenChange,
  budget,
  areaName,
  onDeleted,
}: BudgetDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!budget) {
      return;
    }

    setIsDeleting(true);

    try {
      await budgetService.remove(budget.id);
      toast.success("Orçamento excluído com sucesso.");
      onDeleted(budget);
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        toast.danger("Orçamento não encontrado. Ele pode já ter sido removido.");
        onDeleted(budget);
        onOpenChange(false);

        return;
      }

      toast.danger("Não foi possível excluir o orçamento. Tente novamente.");
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
            <AlertDialog.Heading>Excluir orçamento?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Tem certeza que deseja excluir o orçamento de{" "}
              <strong>{areaName}</strong> para{" "}
              <strong>
                {budget ? formatPeriod(budget.month, budget.year) : ""}
              </strong>
              ? Essa ação não pode ser desfeita.
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
