import { lazy, Suspense } from 'react';
import { Spinner } from '@heroui/react';
import { Route, Routes } from 'react-router-dom';

import LoginPage from '@/pages/login';

const AreasPage = lazy(() => import('@/pages/areas'));
const BudgetsPage = lazy(() => import('@/pages/budgets'));
const CategoriesPage = lazy(() => import('@/pages/categories'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const TransactionsPage = lazy(() => import('@/pages/transactions'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
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
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<TransactionsPage />} path="/" />
      </Routes>
    </Suspense>
  );
}

export default App;
