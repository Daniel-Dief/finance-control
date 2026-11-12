import type { Area } from '@/types/area';

import { useEffect, useState } from 'react';
import { Alert, Button, Label, Pagination, SearchField, Spinner, Table } from '@heroui/react';

import { AreaDeleteDialog, AreaFormDrawer } from '@/components/areas';
import { useAsyncData } from '@/hooks/useAsyncData';
import DefaultLayout from '@/layouts/default';
import { areaService } from '@/services/areaService';
import { getPageItems } from '@/utils/pagination';

const PAGE_SIZE = 10;

export default function AreasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingArea, setDeletingArea] = useState<Area | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, error, isLoading, reload } = useAsyncData(
    () => areaService.list({ name: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    [debouncedSearch, page],
    'Não foi possível carregar as áreas. Tente novamente.'
  );

  const areas = data?.data ?? [];
  const totalPages = Math.max(1, data?.total_pages ?? 1);

  function openCreate() {
    setEditingArea(null);
    setFormOpen(true);
  }

  function openEdit(area: Area) {
    setEditingArea(area);
    setFormOpen(true);
  }

  function openDelete(area: Area) {
    setDeletingArea(area);
    setDeleteOpen(true);
  }

  function handleDeleted() {
    if (areas.length === 1 && page > 1) {
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
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Áreas</h1>
            <p className="text-muted text-sm">
              Gerencie as áreas usadas para organizar seus lançamentos.
            </p>
          </div>
          <Button className="w-full sm:w-auto" variant="primary" onPress={openCreate}>
            Nova área
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
          <>
            <div className="hidden md:block">
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="Áreas" className="min-w-[600px]">
                    <Table.Header>
                      <Table.Column isRowHeader>Nome</Table.Column>
                      <Table.Column>ID</Table.Column>
                      <Table.Column>Ações</Table.Column>
                    </Table.Header>
                    <Table.Body
                      renderEmptyState={() => (
                        <div className="text-muted py-10 text-center">Nenhuma área encontrada.</div>
                      )}
                    >
                      {areas.map((area) => (
                        <Table.Row key={area.id}>
                          <Table.Cell>{area.name}</Table.Cell>
                          <Table.Cell>{area.id}</Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="tertiary" onPress={() => openEdit(area)}>
                                Editar
                              </Button>
                              <Button size="sm" variant="danger" onPress={() => openDelete(area)}>
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
              {areas.length === 0 ? (
                <div className="text-muted rounded-xl border border-default bg-surface p-6 text-center text-sm">
                  Nenhuma área encontrada.
                </div>
              ) : (
                areas.map((area) => (
                  <article
                    key={area.id}
                    className="rounded-xl border border-default bg-surface p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{area.name}</p>
                      <p className="text-muted mt-1 text-xs">ID #{area.id}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="tertiary"
                        onPress={() => openEdit(area)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="danger"
                        onPress={() => openDelete(area)}
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

      <AreaFormDrawer
        area={editingArea}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />
      <AreaDeleteDialog
        area={deletingArea}
        isOpen={deleteOpen}
        onDeleted={handleDeleted}
        onOpenChange={setDeleteOpen}
      />
    </DefaultLayout>
  );
}
