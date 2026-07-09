import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-line px-2.5 py-0.5 text-[0.8125rem] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-paper-sunken text-ink",
        secondary: "bg-paper-sunken text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "bg-paper text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
