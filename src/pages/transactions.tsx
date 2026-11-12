import type { Key } from '@heroui/react';
import type { Area } from '@/types/area';
import type { Category } from '@/types/category';
import type { Transaction } from '@/types/transaction';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Label,
  ListBox,
  Pagination,
  Select,
  Spinner,
  Table
} from '@heroui/react';

import { TransactionDeleteDialog, TransactionFormDrawer } from '@/components/transactions';
import { useAsyncData } from '@/hooks/useAsyncData';
import DefaultLayout from '@/layouts/default';
import { areaService } from '@/services/areaService';
import { categoryService } from '@/services/categoryService';
import { transactionService } from '@/services/transactionService';
import {
  MONTH_OPTIONS,
  formatCurrencyFromCents,
  formatDateByString,
  getCurrentMonth,
  getMonthRange
} from '@/utils/format';
import { getPageItems } from '@/utils/pagination';

const PAGE_SIZE = 10;
const ALL = 'all';

interface FilterOption {
  value: string;
  label: string;
}

function FilterSelect({
  label,
  options,
  value,
  onChange
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
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export default function TransactionsPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [areaFilter, setAreaFilter] = useState<Key | null>(ALL);
  const [categoryFilter, setCategoryFilter] = useState<Key | null>(ALL);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState<Key | null>(getCurrentMonth());

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const areaNames = useMemo(() => {
    const map = new Map<number, string>();

    areas.forEach((area) => map.set(area.id, area.name));

    return map;
  }, [areas]);

  function areaLabel(areaId: number) {
    return areaNames.get(areaId) ?? `Área #${areaId}`;
  }

  const categoryNames = useMemo(() => {
    const map = new Map<number, string>();

    categories.forEach((category) => map.set(category.id, category.name));

    return map;
  }, [categories]);

  function categoryLabel(categoryId: number) {
    return categoryNames.get(categoryId) ?? `Categoria #${categoryId}`;
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
      .catch(() => {});

    categoryService
      .list({ limit: 100 })
      .then((result) => {
        if (active) {
          setCategories(result.data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const { data, error, isLoading, reload } = useAsyncData(
    () => {
      const range =
        monthFilter && monthFilter !== ALL ? getMonthRange(Number(monthFilter)) : undefined;

      return transactionService.list({
        area_id: areaFilter && areaFilter !== ALL ? Number(areaFilter) : undefined,
        category_id: categoryFilter && categoryFilter !== ALL ? Number(categoryFilter) : undefined,
        from: range?.from,
        to: range?.to,
        page,
        limit: PAGE_SIZE
      });
    },
    [areaFilter, categoryFilter, monthFilter, page],
    'Não foi possível carregar as transações. Tente novamente.'
  );

  const transactions = data?.data ?? [];
  const totalPages = Math.max(1, data?.total_pages ?? 1);

  function changeFilter(setter: (value: Key | null) => void, value: Key | null) {
    setter(value);
    setPage(1);
  }

  function openCreate() {
    setEditingTransaction(null);
    setFormOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  function openDelete(transaction: Transaction) {
    setDeletingTransaction(transaction);
    setDeleteOpen(true);
  }

  function handleDeleted() {
    if (transactions.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      reload();
    }
  }

  const areaOptions: FilterOption[] = [
    { label: 'Todas as áreas', value: ALL },
    ...areas.map((area) => ({ label: area.name, value: String(area.id) }))
  ];
  const categoryOptions: FilterOption[] = [
    { label: 'Todas as categorias', value: ALL },
    ...categories.map((category) => ({ label: category.name, value: String(category.id) }))
  ];
  const monthOptions: FilterOption[] = [
    { label: 'Todos os meses', value: ALL },
    ...MONTH_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) }))
  ];

  const pages = getPageItems(page, totalPages);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Transações</h1>
            <p className="text-muted text-sm">Gerencie as transações financeiras da sua conta.</p>
          </div>
          <Button className="w-full sm:w-auto" variant="primary" onPress={openCreate}>
            Nova transação
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
            label="Categoria"
            options={categoryOptions}
            value={categoryFilter}
            onChange={(value) => changeFilter(setCategoryFilter, value)}
          />
          <FilterSelect
            label="Mês"
            options={monthOptions}
            value={monthFilter}
            onChange={(value) => changeFilter(setMonthFilter, value)}
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
          <>
            <div className="hidden md:block">
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="Transações" className="min-w-[720px]">
                    <Table.Header>
                      <Table.Column isRowHeader>Data</Table.Column>
                      <Table.Column>Tipo</Table.Column>
                      <Table.Column>Área</Table.Column>
                      <Table.Column>Categoria</Table.Column>
                      <Table.Column>Valor</Table.Column>
                      <Table.Column>Ações</Table.Column>
                    </Table.Header>
                    <Table.Body
                      renderEmptyState={() => (
                        <div className="text-muted py-10 text-center">
                          Nenhuma transação encontrada.
                        </div>
                      )}
                    >
                      {transactions.map((transaction) => (
                        <Table.Row key={transaction.id}>
                          <Table.Cell>{formatDateByString(transaction.date)}</Table.Cell>
                          <Table.Cell>
                            <Chip
                              color={transaction.type === 'income' ? 'success' : 'danger'}
                              size="sm"
                              variant="soft"
                            >
                              {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                            </Chip>
                          </Table.Cell>
                          <Table.Cell>{areaLabel(transaction.area_id)}</Table.Cell>
                          <Table.Cell>{categoryLabel(transaction.category_id)}</Table.Cell>
                          <Table.Cell>{formatCurrencyFromCents(transaction.amount)}</Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="tertiary"
                                onPress={() => openEdit(transaction)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onPress={() => openDelete(transaction)}
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
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {transactions.length === 0 ? (
                <div className="text-muted rounded-xl border border-default bg-surface p-6 text-center text-sm">
                  Nenhuma transação encontrada.
                </div>
              ) : (
                transactions.map((transaction) => (
                  <article
                    key={transaction.id}
                    className="rounded-xl border border-default bg-surface p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-muted text-xs">{formatDateByString(transaction.date)}</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight">
                          {formatCurrencyFromCents(transaction.amount)}
                        </p>
                      </div>
                      <Chip
                        color={transaction.type === 'income' ? 'success' : 'danger'}
                        size="sm"
                        variant="soft"
                      >
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Chip>
                    </div>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-muted">Área</dt>
                      <dd className="truncate text-right">{areaLabel(transaction.area_id)}</dd>
                      <dt className="text-muted">Categoria</dt>
                      <dd className="truncate text-right">
                        {categoryLabel(transaction.category_id)}
                      </dd>
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="tertiary"
                        onPress={() => openEdit(transaction)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="danger"
                        onPress={() => openDelete(transaction)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {!isLoading && !error && totalPages > 1 && (
          <Pagination className="justify-center">
            <Pagination.Content className="flex-wrap justify-center self-center">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((item, index) =>
                item === 'ellipsis' ? (
                  <Pagination.Item key={`ellipsis-${index}`}>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                ) : (
                  <Pagination.Item key={item}>
                    <Pagination.Link isActive={item === page} onPress={() => setPage(item)}>
                      {item}
                    </Pagination.Link>
                  </Pagination.Item>
                )
              )}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}
      </div>

      <TransactionFormDrawer
        areas={areas}
        categories={categories}
        isOpen={formOpen}
        transaction={editingTransaction}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <TransactionDeleteDialog
        isOpen={deleteOpen}
        transaction={deletingTransaction}
        onDeleted={handleDeleted}
        onOpenChange={setDeleteOpen}
      />
    </DefaultLayout>
  );
}
