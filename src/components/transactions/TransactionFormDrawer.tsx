import { useEffect, useMemo, useState } from "react";
import type { DateValue, Key } from "@heroui/react";
import {
  Alert,
  Calendar,
  DateField,
  DatePicker,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  toast,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";

import { transactionService } from "@/services/transactionService";
import type { Area } from "@/types/area";
import type { Category } from "@/types/category";
import type { Transaction, TransactionType } from "@/types/transaction";
import { formatCurrencyFromCents, formatDateToApi } from "@/utils/format";
import { FormDrawer } from "../FormDrawer";
import { formsTransactionsValidate } from "@/utils/validation";
import { formsTransactionsErrors } from "@/utils/mapErros";

interface TransactionFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transaction: Transaction | null;
  areas: Area[];
  categories: Category[];
  onSaved: () => void;
}

export default function TransactionFormDrawer({
  isOpen,
  onOpenChange,
  transaction,
  areas,
  categories,
  onSaved,
}: TransactionFormDrawerProps) {
  const isEditing = Boolean(transaction);

  const [type, setType] = useState<TransactionType>("expense");
  const [areaId, setAreaId] = useState<Key | null>(null);
  const [categoryId, setCategoryId] = useState<Key | null>(null);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [dateSelected, setDateSelected] = useState<DateValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedKeys = useMemo(() => new Set<Key>([type]), [type]);

  const isFormDisabled = areas.length === 0 || categories.length === 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setType(transaction?.type ?? "expense");
    setAreaId(transaction ? String(transaction.area_id) : null);
    setCategoryId(transaction ? String(transaction.category_id) : null);
    setAmountCents(transaction ? transaction.amount : null);
    setDateSelected(
      transaction ? parseDate(transaction.date.slice(0, 10)) : null,
    );
    setError(null);
  }, [isOpen, transaction]);

  async function onSubmit() {
    const validated = formsTransactionsValidate({
      areaSize: areas.length,
      categorySize: categories.length,
      areaId,
      categoryId,
      date: dateSelected,
      amountCents,
    });

    if (!validated.isValid) {
      setError(validated.error);

      return;
    }

    const payload = {
      type,
      amount: Number(amountCents),
      area_id: Number(areaId),
      category_id: Number(categoryId),
      date: formatDateToApi(
        (dateSelected as DateValue).toDate(getLocalTimeZone()),
      ),
    };

    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && transaction) {
        await transactionService.update(transaction.id, payload);
        toast.success("Transação atualizada com sucesso.");
      } else {
        await transactionService.create(payload);
        toast.success("Transação criada com sucesso.");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = formsTransactionsErrors(err);

      if (errorMessage) {
        setError(errorMessage);

        return;
      }

      toast.danger("Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

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

  const amountText = amountCents === null ? "" : formatCurrencyFromCents(amountCents);

  return (
    <FormDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar transação" : "Nova transação"}
      isSaving={isSaving}
      onSubmit={onSubmit}
    >
      <Form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {isFormDisabled ? (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Cadastros necessários</Alert.Title>
              <Alert.Description>
                {areas.length === 0
                  ? "Cadastre uma área"
                  : "Cadastre uma categoria"}{" "}
                antes de criar uma transação.
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

        <div className="flex flex-col gap-1">
          <Label>Tipo</Label>
          <ToggleButtonGroup
            aria-label="Tipo da transação"
            fullWidth
            selectedKeys={selectedKeys}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next) {
                setType(next as TransactionType);
              }
            }}
          >
            <ToggleButton id="expense">
              Despesa
            </ToggleButton>
            <ToggleButton id="income">
              <ToggleButtonGroup.Separator />
              Receita
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

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
          isDisabled={categories.length === 0}
          isRequired
          name="category_id"
          placeholder="Selecione uma categoria"
          value={categoryId}
          onChange={setCategoryId}
        >
          <Label>Categoria</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {categories.map((category) => (
                <ListBox.Item
                  key={category.id}
                  id={String(category.id)}
                  textValue={category.name}
                >
                  {category.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <DatePicker
          isRequired
          className="w-full"
          name="date"
          value={dateSelected}
          onChange={setDateSelected}
        >
          <Label>Data</Label>
          <DateField.Group fullWidth>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover>
            <Calendar aria-label="Data da transação">
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => <Calendar.Cell date={date} />}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>

        <TextField
          isRequired
          name="amount"
          value={amountText}
          onChange={handleAmountChange}
        >
          <Label>Valor</Label>
          <Input
            inputMode="numeric"
            placeholder="R$ 0,00"
            variant="secondary"
          />
        </TextField>
      </Form>
    </FormDrawer>
  );
}
