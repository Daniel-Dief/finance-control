import type { ReactNode } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card"

type ListCardProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function ListCard({ title, action, children }: ListCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate">{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-xs">{children}</div>
      </CardContent>
    </Card>
  )
}

export function ListCardField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}:</span> {children}
    </div>
  )
}
