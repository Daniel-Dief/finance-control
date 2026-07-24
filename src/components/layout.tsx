import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  House,
  CreditCard,
  Tag,
  CurrencyCircleDollar,
  Receipt,
  Hamburger,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/areas", label: "Areas", icon: CurrencyCircleDollar },
  { href: "/categories", label: "Categorias", icon: Tag },
  { href: "/budgets", label: "Orcamentos", icon: CreditCard },
  { href: "/transactions", label: "Transacoes", icon: Receipt },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-semibold">Finance Control</span>
        </div>
        <div className="p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Hamburger className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-56 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <span className="text-lg font-semibold">Finance Control</span>
              </div>
              <div className="p-3">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold">Finance Control</span>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
