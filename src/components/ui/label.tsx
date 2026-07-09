"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-base font-medium leading-none text-ink select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
