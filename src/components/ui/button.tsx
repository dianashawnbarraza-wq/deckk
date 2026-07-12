import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--brand-accent),#000_8%)]",
        outline:
          "border-line bg-paper text-foreground hover:bg-paper-sunken",
        secondary:
          "bg-paper-sunken text-foreground hover:bg-[color-mix(in_srgb,var(--paper-sunken),var(--ink)_6%)]",
        ghost:
          "text-foreground hover:bg-paper-sunken",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15",
        link: "h-auto min-h-0 rounded-none px-0 text-brand-accent-strong underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "min-h-11 gap-2 px-6",
        sm: "min-h-9 gap-1.5 px-4 text-sm",
        lg: "min-h-12 gap-2 px-8 text-base",
        icon: "size-11 min-h-11 rounded-full p-0 active:scale-[0.92]",
        "icon-sm": "size-9 min-h-9 rounded-full p-0 active:scale-[0.92]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
