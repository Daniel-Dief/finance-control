import type { Category } from "@/types/category";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Label,
  Pagination,
  SearchField,
  Spinner,
  Table,
} from "@heroui/react";

import {
  CategoryDeleteDialog,
  CategoryFormDrawer,
} from "@/components/categories";
import { useAsyncData } from "@/hooks/useAsyncData";
import DefaultLayout from "@/layouts/default";
import { categoryService } from "@/services/categoryService";
import { getPageItems } from "@/utils/pagination";

const PAGE_SIZE = 10;

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, error, isLoading, reload } = useAsyncData(
    () =>
      categoryService.list({
        name: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, page],
    "Não foi possível carregar as categorias. Tente novamente.",
  );

  const categories = data?.data ?? [];
  const totalPages = Math.max(1, data?.total_pages ?? 1);

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function openDelete(category: Category) {
    setDeletingCategory(category);
    setDeleteOpen(true);
  }

  function handleDeleted() {
    if (categories.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      reload();
    }
  }

  const pages = getPageItems(page, totalPages);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Categorias
            </h1>
            <p className="text-muted text-sm">
              Gerencie as categorias usadas para organizar seus lançamentos.
            </p>
          </div>
          <Button variant="primary" onPress={openCreate}>
            Nova categoria
          </Button>
        </div>

        <SearchField
          className="w-full sm:max-w-xs"
          name="search"
          value={search}
          onChange={setSearch}
        >
          <Label>Buscar</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Buscar por nome..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

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
              <Table.Content aria-label="Categorias" className="min-w-[600px]">
                <Table.Header>
                  <Table.Column isRowHeader>Nome</Table.Column>
                  <Table.Column>ID</Table.Column>
                  <Table.Column>Ações</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() => (
                    <div className="text-muted py-10 text-center">
                      Nenhuma categoria encontrada.
                    </div>
                  )}
                >
                  {categories.map((category) => (
                    <Table.Row key={category.id}>
                      <Table.Cell>{category.name}</Table.Cell>
                      <Table.Cell>{category.id}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => openEdit(category)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onPress={() => openDelete(category)}
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

      <CategoryFormDrawer
        category={editingCategory}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <CategoryDeleteDialog
        category={deletingCategory}
        isOpen={deleteOpen}
        onDeleted={handleDeleted}
        onOpenChange={setDeleteOpen}
      />
    </DefaultLayout>
  );
}
