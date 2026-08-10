import * as React from "react"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find((o) => o.value === value)?.label

  function openDropdown() {
    setSearch("")
    setHighlightedIndex(-1)
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightedIndex])

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  function select(val: string) {
    onValueChange(val)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((i) => (i + 1) % filtered.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          select(filtered[highlightedIndex].value)
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none select-none",
          "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
          !selectedLabel && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-none border bg-popover text-popover-foreground shadow-md">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setHighlightedIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar..."
            className="w-full border-b bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
          />
          <div ref={listRef} className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-muted-foreground">
                Nenhum resultado
              </div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={cn(
                    "cursor-default px-2.5 py-1.5 text-xs",
                    "hover:bg-accent hover:text-accent-foreground",
                    highlightedIndex === i &&
                      "bg-accent text-accent-foreground",
                    value === opt.value && "font-medium"
                  )}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
