import { useEffect, useState } from "react";
import type { Key } from "@heroui/react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextField,
  toast,
  useMediaQuery,
} from "@heroui/react";
import axios from "axios";

import { budgetService } from "@/services/budgetService";
import type { Area } from "@/types/area";
import type { Budget } from "@/types/budget";
import { MONTH_OPTIONS, formatCurrencyFromCents } from "@/utils/format";

interface BudgetFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  budget: Budget | null;
  areas: Area[];
  onSaved: (budget: Budget) => void;
}

export default function BudgetFormDrawer({
  isOpen,
  onOpenChange,
  budget,
  areas,
  onSaved,
}: BudgetFormDrawerProps) {
  const isEditing = Boolean(budget);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [areaId, setAreaId] = useState<Key | null>(null);
  const [month, setMonth] = useState<Key | null>(null);
  const [year, setYear] = useState<number>(currentYear);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAreaId(budget ? String(budget.area_id) : null);
    setMonth(budget ? String(budget.month) : String(currentMonth));
    setYear(budget?.year ?? currentYear);
    setAmountCents(budget ? budget.amount : null);
    setError(null);
  }, [isOpen, budget, currentMonth, currentYear]);

  async function submit() {
    if (areas.length === 0) {
      setError("Cadastre uma área antes de criar um orçamento.");

      return;
    }

    if (areaId === null) {
      setError("Selecione uma área.");

      return;
    }

    if (month === null) {
      setError("Selecione o mês.");

      return;
    }

    if (!Number.isFinite(year) || year < 1) {
      setError("Informe um ano válido.");

      return;
    }

    if (amountCents === null) {
      setError("Informe o valor do orçamento.");

      return;
    }

    const payload = {
      amount: amountCents,
      area_id: Number(areaId),
      month: Number(month),
      year,
    };

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && budget) {
        const updated = await budgetService.update(budget.id, payload);

        toast.success("Orçamento atualizado com sucesso.");
        onSaved(updated);
      } else {
        const created = await budgetService.create(payload);

        toast.success("Orçamento criado com sucesso.");
        onSaved(created);
      }

      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          setError("Já existe um orçamento para esta área neste período.");

          return;
        }

        if (status === 400) {
          setError("Dados inválidos. Verifique os campos informados.");

          return;
        }

        if (status === 404) {
          setError("Área não encontrada. Atualize a lista de áreas.");

          return;
        }
      }

      toast.danger("Não foi possível salvar o orçamento. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  // Máscara de moeda: o valor digitado é interpretado como centavos
  // (ex.: digitando 150000 o campo exibe R$ 1.500,00).
  function handleAmountChange(next: string) {
    const digits = next.replace(/\D/g, "");

    if (!digits) {
      setAmountCents(null);

      return;
    }

    const parsed = Number(digits);

    if (Number.isSafeInteger(parsed)) {
      setAmountCents(parsed);
    }
  }

  const amountText =
    amountCents === null ? "" : formatCurrencyFromCents(amountCents);

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>
              {isEditing ? "Editar orçamento" : "Novo orçamento"}
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
              {areas.length === 0 ? (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Nenhuma área cadastrada</Alert.Title>
                    <Alert.Description>
                      Cadastre uma área antes de criar um orçamento.
                    </Alert.Description>
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
                className="w-full"
                isDisabled={areas.length === 0}
                isRequired
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
                      <ListBox.Item
                        key={area.id}
                        id={String(area.id)}
                        textValue={area.name}
                      >
                        {area.name}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                className="w-full"
                isRequired
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
                      <ListBox.Item
                        key={option.value}
                        id={String(option.value)}
                        textValue={option.label}
                      >
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

              <TextField
                isRequired
                name="amount"
                value={amountText}
                onChange={handleAmountChange}
              >
                <Label>Valor previsto</Label>
                <Input
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  variant="secondary"
                />
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
            <Button
              isDisabled={areas.length === 0}
              isPending={isSaving}
              variant="primary"
              onPress={submit}
            >
              {({ isPending }) => (isPending ? "Salvando..." : "Salvar")}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
