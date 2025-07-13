
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "inline-flex py-2 px-5 justify-center items-center gap-2 rounded-xl bg-gradient-to-b from-[#323232] to-[#222] shadow-[0px_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333] text-[#FCFCFC] text-center font-['Instrument_Sans'] text-sm font-semibold leading-5 tracking-[-0.28px] hover:rounded-[10px] hover:bg-gradient-to-b hover:from-[#323232] hover:to-[#222] hover:shadow-[0px_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333] transition-all duration-200",
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
        tertiary:
          "inline-flex py-[10px] px-6 justify-center items-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F5F6F9] to-[#EAECF4] shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_#FFF_inset,0px_0px_0px_1px_#DEE0E3] text-[#121212] text-center font-['Instrument_Sans'] text-sm font-semibold leading-5 tracking-[-0.28px] hover:shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6] focus:bg-gradient-to-b focus:from-[#EAECF4] focus:to-[rgba(245,246,249,0.80)] focus:shadow-[0px_3px_4px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6] active:bg-gradient-to-b active:from-[#EAECF4] active:to-[rgba(245,246,249,0.80)] active:shadow-[0px_3px_4px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6] transition-all duration-200",
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
