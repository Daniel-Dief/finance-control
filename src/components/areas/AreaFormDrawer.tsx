import { useEffect, useState } from "react";
import {
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";

import { areaService } from "@/services/areaService";
import type { Area } from "@/types/area";
import { FormDrawer } from "../FormDrawer";
import { formsAreasValidate } from "@/utils/validation";
import { formsAreasErros } from "@/utils/mapErros";

interface AreaFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  area: Area | null;
  onSaved: () => void;
}

export default function AreaFormDrawer({
  isOpen,
  onOpenChange,
  area,
  onSaved,
}: AreaFormDrawerProps) {
  const isEditing = Boolean(area);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(area?.name ?? "");
      setError(null);
    }
  }, [isOpen, area]);

  async function onSubmit() {
    const validateResult = formsAreasValidate(name);

    if (!validateResult.isValid) {
      setError(validateResult.error);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && area) {
        await areaService.update(area.id, { name: name.trim() });
        toast.success("Área atualizada com sucesso.");
      } else {
        await areaService.create({ name: name.trim() });
        toast.success("Área criada com sucesso.");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = formsAreasErros(err);
      
      if (errorMessage) {
        setError(errorMessage);
        return;
      }

      toast.danger("Não foi possível salvar a área. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDrawer
      isOpen={isOpen}
      isSaving={isSaving}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      title={isEditing ? "Editar área" : "Nova área"}
    >    
      <Form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
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
      </Form>
    </FormDrawer>
  );
}
