import { ReactNode, useEffect, useRef } from "react";
import { Button, Drawer, useMediaQuery } from "@heroui/react";

interface FormDrawerProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isSaving: boolean;
  onSubmit?: () => void;
  children?: ReactNode;
}

export function FormDrawer({
  title,
  isOpen,
  onOpenChange,
  isSaving,
  onSubmit,
  children,
}: FormDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Aguarda a animação de abertura e o foco inicial do React Aria antes de
    // mover o foco para o primeiro campo do formulário.
    const timeout = window.setTimeout(() => {
      const container = bodyRef.current;

      if (!container) {
        return;
      }

      const firstInput = container.querySelector<HTMLElement>(
        [
          'input:not([type="hidden"]):not([disabled]):not([aria-disabled="true"])',
          'textarea:not([disabled]):not([aria-disabled="true"])',
          'select:not([disabled]):not([aria-disabled="true"])',
          '[role="combobox"]:not([disabled]):not([aria-disabled="true"])',
        ].join(", "),
      );

      firstInput?.focus();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{title}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body ref={bodyRef}>{children}</Drawer.Body>
          <Drawer.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button isPending={isSaving} variant="primary" onPress={onSubmit}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
