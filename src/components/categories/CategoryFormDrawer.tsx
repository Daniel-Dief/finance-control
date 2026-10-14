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

import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: Category | null;
  onSaved: (category: Category) => void;
}

export default function CategoryFormDrawer({
  isOpen,
  onOpenChange,
  category,
  onSaved,
}: CategoryFormDrawerProps) {
  const isEditing = Boolean(category);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? "");
      setError(null);
    }
  }, [isOpen, category]);

  async function submit() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Informe o nome da categoria.");

      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && category) {
        const updated = await categoryService.update(category.id, { name: trimmed });

        toast.success("Categoria atualizada com sucesso.");
        onSaved(updated);
      } else {
        const created = await categoryService.create({ name: trimmed });

        toast.success("Categoria criada com sucesso.");
        onSaved(created);
      }

      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          setError("Já existe uma categoria com esse nome.");

          return;
        }

        if (status === 400) {
          setError("Dados inválidos. Verifique o nome informado.");

          return;
        }
      }

      toast.danger("Não foi possível salvar a categoria. Tente novamente.");
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
              {isEditing ? "Editar categoria" : "Nova categoria"}
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