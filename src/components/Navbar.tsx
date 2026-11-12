import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import clsx from 'clsx';

import { ThemeSwitch } from '@/components/theme-switch';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Áreas', href: '/areas' },
  { label: 'Categorias', href: '/categories' },
  { label: 'Orçamentos', href: '/budgets' },
  { label: 'Transações', href: '/transactions' }
];

// O dashboard não está disponível em telas de celular.
const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== '/dashboard');

const PAGE_PREFETCH: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/transactions'),
  '/dashboard': () => import('@/pages/dashboard'),
  '/areas': () => import('@/pages/areas'),
  '/categories': () => import('@/pages/categories'),
  '/budgets': () => import('@/pages/budgets'),
  '/transactions': () => import('@/pages/transactions')
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-accent-soft font-semibold text-accent-soft-foreground'
      : 'text-muted hover:bg-default-soft hover:text-foreground'
  ].join(' ');
}

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function prefetchPage(href: string) {
    PAGE_PREFETCH[href]?.();
  }

  function handleLogout() {
    setIsMenuOpen(false);
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-default bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-[background-color,color,transform] duration-200 hover:bg-default hover:text-foreground active:scale-95 md:hidden"
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span
              aria-hidden="true"
              className="relative flex h-[18px] w-[22px] flex-col justify-between"
            >
              <span
                className={clsx(
                  'h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out',
                  isMenuOpen && 'translate-y-[8px] rotate-45'
                )}
              />
              <span
                className={clsx(
                  'h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-out',
                  isMenuOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
                )}
              />
              <span
                className={clsx(
                  'h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out',
                  isMenuOpen && '-translate-y-[8px] -rotate-45'
                )}
              />
            </span>
          </button>
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                className={navLinkClass}
                to={item.href}
                onFocus={() => prefetchPage(item.href)}
                onMouseEnter={() => prefetchPage(item.href)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitch />
          <Button size="sm" variant="tertiary" onPress={handleLogout}>
            Sair
          </Button>
        </div>
      </div>

      <div
        aria-hidden={!isMenuOpen}
        className={clsx(
          'grid overflow-hidden border-default transition-[grid-template-rows,border-width,opacity] duration-300 ease-out md:hidden',
          isMenuOpen
            ? 'grid-rows-[1fr] border-t opacity-100'
            : 'grid-rows-[0fr] border-t-0 opacity-0'
        )}
        id="mobile-navigation"
        inert={!isMenuOpen}
      >
        <nav aria-label="Navegação principal" className="min-h-0 overflow-hidden">
          <ul className="flex flex-col gap-1 px-4 py-2">
            {MOBILE_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  className={navLinkClass}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  onFocus={() => prefetchPage(item.href)}
                  onMouseEnter={() => prefetchPage(item.href)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
