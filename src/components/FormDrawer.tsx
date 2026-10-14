import { ReactNode } from "react";
import {
  Button,
  Drawer,
  useMediaQuery,
} from "@heroui/react";

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
  children
}: FormDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>
              {title}
            </Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            {children}
          </Drawer.Body>
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