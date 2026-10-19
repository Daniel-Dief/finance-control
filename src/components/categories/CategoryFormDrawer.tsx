import type { Category } from "@/types/category";

import { useState } from "react";
import {
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";

import { formsCategoriesErrors } from "@/utils/mapErros";
import { FormDrawer } from "@/components/FormDrawer";
import { formsCategoriesValidate } from "@/utils/validation";
import { categoryService } from "@/services/categoryService";

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: Category | null;
  onSaved: () => void;
}

export default function CategoryFormDrawer({
  isOpen,
  onOpenChange,
  category,
  onSaved,
}: CategoryFormDrawerProps) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentFormKey = isOpen ? String(category?.id ?? "new") : null;
  const [formKey, setFormKey] = useState(currentFormKey);

  if (currentFormKey !== formKey) {
    setFormKey(currentFormKey);

    if (isOpen) {
      setName(category?.name ?? "");
      setError(null);
    }
  }

  async function onSubmit() {
    const validateResult = formsCategoriesValidate(name);

    if (!validateResult.isValid) {
      setError(validateResult.error);

      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && category) {
        await categoryService.update(category.id, { name: name.trim() });
        toast.success("Categoria atualizada com sucesso.");
      } else {
        await categoryService.create({ name: name.trim() });
        toast.success("Categoria criada com sucesso.");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = formsCategoriesErrors(err);

      if (errorMessage) {
        setError(errorMessage);

        return;
      }

      toast.danger("Não foi possível salvar a categoria. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDrawer
      isOpen={isOpen}
      isSaving={isSaving}
      title={isEditing ? "Editar categoria" : "Nova categoria"}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    >
      <Form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <TextField
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
