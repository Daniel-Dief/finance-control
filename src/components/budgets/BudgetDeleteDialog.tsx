import type { Budget } from '@/types/budget';

import { useState } from 'react';
import { toast } from '@heroui/react';

import { DeleteDialog } from '../DeleteDialog';

import { budgetService } from '@/services/budgetService';
import { formatPeriod } from '@/utils/format';
import { deleteBudgetsValidate } from '@/utils/mapErros';

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
  onDeleted
}: BudgetDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!budget) {
      return;
    }

    setIsDeleting(true);

    try {
      await budgetService.remove(budget.id);
      toast.success('Orçamento excluído com sucesso.');
      onDeleted(budget);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = deleteBudgetsValidate(err);

      if (errorMessage) {
        toast.danger(errorMessage);
        onDeleted(budget);
        onOpenChange(false);

        return;
      }

      toast.danger('Não foi possível excluir o orçamento. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DeleteDialog
      handleDelete={handleDelete}
      isDeleting={isDeleting}
      isOpen={isOpen}
      name={`${areaName} - ${budget ? formatPeriod(budget.month, budget.year) : ''}`}
      title="Excluir orçamento?"
      onOpenChange={onOpenChange}
    />
  );
}
