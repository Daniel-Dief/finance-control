import { AlertDialog, Button } from "@heroui/react";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleDelete: () => void;
  isDeleting: boolean;
  title: string;
  name: string;
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  handleDelete,
  isDeleting,
  title,
  name
}: DeleteDialogProps) {

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Tem certeza que deseja excluir <strong>{name}</strong>?
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
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}