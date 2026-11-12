import { lazy, Suspense } from 'react';
import { Spinner } from '@heroui/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useIsMobile } from '@/hooks/useIsMobile';
import LoginPage from '@/pages/login';

const AreasPage = lazy(() => import('@/pages/areas'));
const BudgetsPage = lazy(() => import('@/pages/budgets'));
const CategoriesPage = lazy(() => import('@/pages/categories'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const TransactionsPage = lazy(() => import('@/pages/transactions'));

function DashboardRoute() {
  const isMobile = useIsMobile();

  // Em telas de celular o dashboard não é exibido.
  if (isMobile) {
    return <Navigate replace to="/" />;
  }

  return <DashboardPage />;
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<AreasPage />} path="/areas" />
        <Route element={<CategoriesPage />} path="/categories" />
        <Route element={<BudgetsPage />} path="/budgets" />
        <Route element={<TransactionsPage />} path="/transactions" />
        <Route element={<DashboardRoute />} path="/dashboard" />
        <Route element={<TransactionsPage />} path="/" />
      </Routes>
    </Suspense>
  );
}

export default App;
