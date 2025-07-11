
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "flex justify-center items-center gap-2 self-stretch rounded-[10px] px-5 py-3 text-center font-semibold text-sm leading-5 tracking-[-0.28px] text-[#FCFCFC] transition-all duration-200 enhanced-button-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground enhanced-button-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 enhanced-button-secondary",
        "secondary-auth":
          "flex h-[44px] px-5 py-2 justify-center items-center gap-2 self-stretch rounded-[10px] text-center font-medium text-sm leading-5 tracking-[-0.14px] text-[#121212] transition-all duration-200 enhanced-button-secondary-auth",
        "secondary-goblin":
          "inline-flex justify-center items-center gap-2 rounded-[12px] px-6 py-[10px] text-center font-semibold text-sm leading-5 tracking-[-0.28px] text-[#121212] transition-all duration-200 enhanced-button-secondary-goblin",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
