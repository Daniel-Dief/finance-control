import type { Key } from '@heroui/react';
import type { Area } from '@/types/area';
import type { Budget } from '@/types/budget';

import { useState } from 'react';
import {
  Alert,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextField,
  toast
} from '@heroui/react';

import { FormDrawer } from '../FormDrawer';

import { budgetService } from '@/services/budgetService';
import { MONTH_OPTIONS, formatCurrencyFromCents } from '@/utils/format';
import { formsBudgetsValidate } from '@/utils/validation';
import { formsBudgestErrors } from '@/utils/mapErros';

interface BudgetFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  budget: Budget | null;
  areas: Area[];
  onSaved: () => void;
}

export default function BudgetFormDrawer({
  isOpen,
  onOpenChange,
  budget,
  areas,
  onSaved
}: BudgetFormDrawerProps) {
  const isEditing = Boolean(budget);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [areaId, setAreaId] = useState<Key | null>(budget ? String(budget.area_id) : null);
  const [month, setMonth] = useState<Key | null>(
    budget ? String(budget.month) : String(currentMonth)
  );
  const [year, setYear] = useState<number>(budget?.year ?? currentYear);
  const [amountCents, setAmountCents] = useState<number | null>(budget ? budget.amount : null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentFormKey = isOpen ? String(budget?.id ?? 'new') : null;
  const [formKey, setFormKey] = useState(currentFormKey);

  if (currentFormKey !== formKey) {
    setFormKey(currentFormKey);

    if (isOpen) {
      setAreaId(budget ? String(budget.area_id) : null);
      setMonth(budget ? String(budget.month) : String(currentMonth));
      setYear(budget?.year ?? currentYear);
      setAmountCents(budget ? budget.amount : null);
      setError(null);
    }
  }

  async function onSubmit() {
    const validated = formsBudgetsValidate({
      areaSize: areas.length,
      areaId,
      month,
      year,
      amountCents
    });

    if (!validated.isValid) {
      setError(validated.error);

      return;
    }

    const payload = {
      amount: Number(amountCents),
      area_id: Number(areaId),
      month: Number(month),
      year
    };

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && budget) {
        await budgetService.update(budget.id, payload);
        toast.success('Orçamento atualizado com sucesso.');
      } else {
        await budgetService.create(payload);
        toast.success('Orçamento criado com sucesso.');
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = formsBudgestErrors(err);

      if (errorMessage) {
        setError(errorMessage);

        return;
      }

      toast.danger('Não foi possível salvar o orçamento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleAmountChange(next: string) {
    const digits = next.replace(/\D/g, '');

    if (!digits) {
      setAmountCents(null);

      return;
    }

    const parsed = Number(digits);

    if (Number.isSafeInteger(parsed)) {
      setAmountCents(parsed);
    }
  }

  const amountText = amountCents === null ? '' : formatCurrencyFromCents(amountCents);

  return (
    <FormDrawer
      isOpen={isOpen}
      isSaving={isSaving}
      title={isEditing ? 'Editar orçamento' : 'Novo orçamento'}
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
        {areas.length === 0 ? (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Nenhuma área cadastrada</Alert.Title>
              <Alert.Description>Cadastre uma área antes de criar um orçamento.</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        {error ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <Select
          isRequired
          className="w-full"
          isDisabled={areas.length === 0}
          name="area_id"
          placeholder="Selecione uma área"
          value={areaId}
          onChange={setAreaId}
        >
          <Label>Área</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {areas.map((area) => (
                <ListBox.Item key={area.id} id={String(area.id)} textValue={area.name}>
                  {area.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          isRequired
          className="w-full"
          name="month"
          placeholder="Selecione o mês"
          value={month}
          onChange={setMonth}
        >
          <Label>Mês</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {MONTH_OPTIONS.map((option) => (
                <ListBox.Item key={option.value} id={String(option.value)} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <NumberField
          isRequired
          formatOptions={{ useGrouping: false }}
          minValue={1}
          name="year"
          value={year}
          onChange={setYear}
        >
          <Label>Ano</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input className="w-full" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        <TextField isRequired name="amount" value={amountText} onChange={handleAmountChange}>
          <Label>Valor previsto</Label>
          <Input inputMode="numeric" placeholder="R$ 0,00" variant="secondary" />
        </TextField>
      </Form>
    </FormDrawer>
  );
}
