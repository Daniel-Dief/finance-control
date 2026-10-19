import type { Key } from "@heroui/react";
import type { Area } from "@/types/area";
import type { Budget } from "@/types/budget";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Label,
  ListBox,
  Pagination,
  Select,
  Spinner,
  Table,
} from "@heroui/react";

import { BudgetDeleteDialog, BudgetFormDrawer } from "@/components/budgets";
import { useAsyncData } from "@/hooks/useAsyncData";
import DefaultLayout from "@/layouts/default";
import { areaService } from "@/services/areaService";
import { budgetService } from "@/services/budgetService";
import {
  MONTH_OPTIONS,
  formatCurrencyFromCents,
  formatPeriod,
  getYearOptions,
} from "@/utils/format";
import { getPageItems } from "@/utils/pagination";

const PAGE_SIZE = 10;
const ALL = "all";

interface FilterOption {
  value: string;
  label: string;
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: Key | null;
  onChange: (value: Key | null) => void;
}) {
  return (
    <Select className="w-full" value={value} onChange={onChange}>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.value}
              id={option.value}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export default function BudgetsPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [page, setPage] = useState(1);
  const [areaFilter, setAreaFilter] = useState<Key | null>(ALL);
  const [monthFilter, setMonthFilter] = useState<Key | null>(ALL);
  const [yearFilter, setYearFilter] = useState<Key | null>(ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const areaNames = useMemo(() => {
    const map = new Map<number, string>();

    areas.forEach((area) => map.set(area.id, area.name));

    return map;
  }, [areas]);

  function areaLabel(areaId: number) {
    return areaNames.get(areaId) ?? `Área #${areaId}`;
  }

  useEffect(() => {
    let active = true;

    areaService
      .list({ limit: 100 })
      .then((result) => {
        if (active) {
          setAreas(result.data);
        }
      })
      .catch(() => {
        // Sem os nomes das áreas a tabela usa o identificador como fallback.
      });

    return () => {
      active = false;
    };
  }, []);

  const { data, error, isLoading, reload } = useAsyncData(
    () =>
      budgetService.list({
        area_id:
          areaFilter && areaFilter !== ALL ? Number(areaFilter) : undefined,
        month:
          monthFilter && monthFilter !== ALL ? Number(monthFilter) : undefined,
        year: yearFilter && yearFilter !== ALL ? Number(yearFilter) : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [areaFilter, monthFilter, yearFilter, page],
    "Não foi possível carregar os orçamentos. Tente novamente.",
  );

  const budgets = data?.data ?? [];
  const totalPages = Math.max(1, data?.total_pages ?? 1);

  function changeFilter(
    setter: (value: Key | null) => void,
    value: Key | null,
  ) {
    setter(value);
    setPage(1);
  }

  function openCreate() {
    setEditingBudget(null);
    setFormOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budget);
    setFormOpen(true);
  }

  function openDelete(budget: Budget) {
    setDeletingBudget(budget);
    setDeleteOpen(true);
  }

  function handleDeleted() {
    if (budgets.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      reload();
    }
  }

  const areaOptions: FilterOption[] = [
    { label: "Todas as áreas", value: ALL },
    ...areas.map((area) => ({ label: area.name, value: String(area.id) })),
  ];
  const monthOptions: FilterOption[] = [
    { label: "Todos os meses", value: ALL },
    ...MONTH_OPTIONS.map((option) => ({
      label: option.label,
      value: String(option.value),
    })),
  ];
  const yearOptions: FilterOption[] = [
    { label: "Todos os anos", value: ALL },
    ...getYearOptions().map((year) => ({
      label: String(year),
      value: String(year),
    })),
  ];

  const pages = getPageItems(page, totalPages);
  const deletingAreaName = deletingBudget
    ? areaLabel(deletingBudget.area_id)
    : "";

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Orçamentos
            </h1>
            <p className="text-muted text-sm">
              Defina quanto pretende gastar por área em cada período.
            </p>
          </div>
          <Button variant="primary" onPress={openCreate}>
            Novo orçamento
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FilterSelect
            label="Área"
            options={areaOptions}
            value={areaFilter}
            onChange={(value) => changeFilter(setAreaFilter, value)}
          />
          <FilterSelect
            label="Mês"
            options={monthOptions}
            value={monthFilter}
            onChange={(value) => changeFilter(setMonthFilter, value)}
          />
          <FilterSelect
            label="Ano"
            options={yearOptions}
            value={yearFilter}
            onChange={(value) => changeFilter(setYearFilter, value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-4">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Erro ao carregar</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
            <Button variant="secondary" onPress={reload}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Orçamentos" className="min-w-[640px]">
                <Table.Header>
                  <Table.Column isRowHeader>Área</Table.Column>
                  <Table.Column>Período</Table.Column>
                  <Table.Column>Valor</Table.Column>
                  <Table.Column>Ações</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <div className="text-muted py-10 text-center">
                      Nenhum orçamento encontrado.
                    </div>
                  )}
                >
                  {budgets.map((budget) => (
                    <Table.Row key={budget.id}>
                      <Table.Cell>{areaLabel(budget.area_id)}</Table.Cell>
                      <Table.Cell>
                        {formatPeriod(budget.month, budget.year)}
                      </Table.Cell>
                      <Table.Cell>
                        {formatCurrencyFromCents(budget.amount)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => openEdit(budget)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onPress={() => openDelete(budget)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}

        {!isLoading && !error && totalPages > 1 && (
          <Pagination className="justify-center">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((item, index) =>
                item === "ellipsis" ? (
                  <Pagination.Item key={`ellipsis-${index}`}>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                ) : (
                  <Pagination.Item key={item}>
                    <Pagination.Link
                      isActive={item === page}
                      onPress={() => setPage(item)}
                    >
                      {item}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}
      </div>

      <BudgetFormDrawer
        areas={areas}
        budget={editingBudget}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <BudgetDeleteDialog
        areaName={deletingAreaName}
        budget={deletingBudget}
        isOpen={deleteOpen}
        onDeleted={handleDeleted}
        onOpenChange={setDeleteOpen}
      />
    </DefaultLayout>
  );
}
