import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
  useMediaQuery,
} from "@heroui/react";
import axios from "axios";

import { areaService } from "@/services/areaService";
import type { Area } from "@/types/area";

interface AreaFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  area: Area | null;
  onSaved: (area: Area) => void;
}

export default function AreaFormDrawer({
  isOpen,
  onOpenChange,
  area,
  onSaved,
}: AreaFormDrawerProps) {
  const isEditing = Boolean(area);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(area?.name ?? "");
      setError(null);
    }
  }, [isOpen, area]);

  async function submit() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Informe o nome da área.");

      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && area) {
        const updated = await areaService.update(area.id, { name: trimmed });

        toast.success("Área atualizada com sucesso.");
        onSaved(updated);
      } else {
        const created = await areaService.create({ name: trimmed });

        toast.success("Área criada com sucesso.");
        onSaved(created);
      }

      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          setError("Já existe uma área com esse nome.");

          return;
        }

        if (status === 400) {
          setError("Dados inválidos. Verifique o nome informado.");

          return;
        }
      }

      toast.danger("Não foi possível salvar a área. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>
              {isEditing ? "Editar área" : "Nova área"}
            </Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <Form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <TextField
                autoFocus
                isRequired
                isInvalid={Boolean(error)}
                name="name"
                value={name}
                onChange={setName}
              >
                <Label>Nome</Label>
                <Input placeholder="Ex.: Alimentação" variant="secondary" />
                <FieldError>{error}</FieldError>
              </TextField>
              <Button style={{ display: "none" }} type="submit">
                Salvar
              </Button>
            </Form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button isPending={isSaving} variant="primary" onPress={submit}>
              {({ isPending }) => (isPending ? "Salvando..." : "Salvar")}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
