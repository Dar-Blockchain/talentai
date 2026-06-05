import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // ── Base ──────────────────────────────────────────────────────────────────
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-md text-sm font-semibold font-[Poppins,sans-serif] whitespace-nowrap",
    "select-none cursor-pointer",
    "transition-all duration-150 ease-in-out",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:ring-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Primary (mint green — brand) ──
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ].join(" "),

        // ── Secondary (purple — AI badge) ──
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ].join(" "),

        // ── Outline ──
        outline: [
          "border-2 border-primary bg-transparent text-primary",
          "[&_svg]:text-primary",
          "hover:bg-primary/10 hover:text-primary hover:-translate-y-px",
          "active:translate-y-0",
        ].join(" "),

        // ── Ghost ──
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-muted hover:text-foreground",
        ].join(" "),

        // ── Destructive ──
        destructive: [
          "bg-destructive text-white",
          "shadow-sm",
          "hover:brightness-110 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0",
          "focus-visible:ring-destructive/30",
        ].join(" "),

        // ── Link ──
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
        ].join(" "),

        // ── Gradient (brand green) ──
        gradient: [
          "bg-gradient-to-r from-[#6AD39C] to-[#52E899] text-[#10453F]",
          "shadow-sm",
          "hover:brightness-105 hover:shadow-md hover:-translate-y-px",
          "active:translate-y-0",
        ].join(" "),
      },

      size: {
        default:   "h-9 px-4 py-2 has-[>svg]:px-3",
        xs:        "h-6 gap-1 rounded px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm:        "h-8 gap-1.5 rounded-md px-3 text-xs has-[>svg]:px-2.5",
        lg:        "h-11 rounded-md px-6 text-base has-[>svg]:px-4",
        xl:        "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        icon:      "size-9 rounded-md",
        "icon-xs": "size-6 rounded [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?:  boolean;
  loading?:  boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
        </svg>
      )}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
