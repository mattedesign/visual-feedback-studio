
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-v128-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-v128-soft hover:shadow-v128-medium font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-v128-soft",
        outline:
          "border-2 border-border bg-background hover:bg-secondary hover:text-secondary-foreground shadow-v128-soft hover:shadow-v128-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-v128-slate-200 shadow-v128-soft",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        goblin: "bg-gradient-goblin text-goblin-text hover:opacity-90 shadow-v128-goblin font-semibold border border-goblin-accent",
        "goblin-outline": "border-2 border-goblin-primary bg-transparent text-goblin-primary hover:bg-goblin-primary hover:text-goblin-text shadow-v128-soft hover:shadow-v128-goblin",
        "goblin-ghost": "text-goblin-primary hover:bg-goblin-primary/10 hover:text-goblin-accent",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
