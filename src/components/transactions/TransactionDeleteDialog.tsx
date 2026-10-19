import { useState } from "react";
import { toast } from "@heroui/react";

import { transactionService } from "@/services/transactionService";
import type { Transaction } from "@/types/transaction";
import { formatCurrencyFromCents, formatDateByString } from "@/utils/format";
import { DeleteDialog } from "../DeleteDialog";
import { deleteTransactionsValidate } from "@/utils/mapErros";

interface TransactionDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transaction: Transaction | null;
  onDeleted: (transaction: Transaction) => void;
}

export default function TransactionDeleteDialog({
  isOpen,
  onOpenChange,
  transaction,
  onDeleted,
}: TransactionDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!transaction) {
      return;
    }

    setIsDeleting(true);

    try {
      await transactionService.remove(transaction.id);
      toast.success("Transação excluída com sucesso.");
      onDeleted(transaction);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = deleteTransactionsValidate(err);

      if (errorMessage) {
        toast.danger(errorMessage);
        onDeleted(transaction);
        onOpenChange(false);

        return;
      }

      toast.danger("Não foi possível excluir a transação. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  const name = transaction
    ? `${formatDateByString(transaction.date)} - ${formatCurrencyFromCents(
        transaction.amount,
      )}`
    : "";

  return (
    <DeleteDialog
      isOpen={isOpen}
      handleDelete={handleDelete}
      onOpenChange={onOpenChange}
      isDeleting={isDeleting}
      name={name}
      title="Excluir transação?"
    />
  );
}