import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';

import { ThemeSwitch } from '@/components/theme-switch';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Áreas', href: '/areas' },
  { label: 'Categorias', href: '/categories' },
  { label: 'Orçamentos', href: '/budgets' },
  { label: 'Transações', href: '/transactions' }
];

const PAGE_PREFETCH: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/transactions'),
  '/dashboard': () => import('@/pages/dashboard'),
  '/areas': () => import('@/pages/areas'),
  '/categories': () => import('@/pages/categories'),
  '/budgets': () => import('@/pages/budgets'),
  '/transactions': () => import('@/pages/transactions')
};

export default function Navbar() {
  const navigate = useNavigate();

  function prefetchPage(href: string) {
    PAGE_PREFETCH[href]?.();
  }

  function handleLogout() {
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-default bg-surface">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-default text-foreground' : 'text-muted hover:text-foreground'
                ].join(' ')
              }
              to={item.href}
              onFocus={() => prefetchPage(item.href)}
              onMouseEnter={() => prefetchPage(item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Button size="sm" variant="tertiary" onPress={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
