"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Cast to accept `modal` — it exists at runtime but is absent from this
// version's types. Default to false so Select never triggers scroll-lock.
const SelectRoot = SelectPrimitive.Root as React.ComponentType<
  React.ComponentProps<typeof SelectPrimitive.Root> & { modal?: boolean }
>

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectRoot data-slot="select" modal={false} {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group relative flex w-full items-center justify-between gap-2 whitespace-nowrap",
        "rounded-xl border px-3.5 text-sm outline-none transition-all duration-200",
        "data-[size=default]:h-10 data-[size=sm]:h-8",
        "border-input bg-background text-foreground",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)]",
        "hover:border-primary/40 hover:shadow-[0_2px_8px_rgba(106,211,156,0.12)]",
        "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
        "data-[state=open]:shadow-[0_0_0_3px_rgba(106,211,156,0.12),_0_2px_8px_rgba(106,211,156,0.15)]",
        "data-[placeholder]:text-muted-foreground/60",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
            "group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary",
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-[1300] overflow-hidden",
          "min-w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]",
          "rounded-2xl border border-border/60 bg-popover",
          "shadow-[0_8px_30px_rgba(0,0,0,0.10),_0_2px_8px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.04)]",
          "origin-[var(--radix-select-content-transform-origin)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          position === "popper" && [
            "data-[side=bottom]:translate-y-1",
            "data-[side=top]:-translate-y-1",
            "data-[side=left]:-translate-x-1",
            "data-[side=right]:translate-x-1",
          ],
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "group relative flex w-full cursor-pointer select-none items-center gap-2.5 outline-none",
        "rounded-xl py-2 pl-3 pr-9 text-sm text-foreground",
        "transition-colors duration-100",
        "focus:bg-primary/[0.07] focus:text-foreground",
        "data-[state=checked]:bg-primary/[0.07] data-[state=checked]:font-medium",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2.5 flex size-5 items-center justify-center rounded-full transition-all duration-150 group-data-[state=checked]:bg-primary"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3 text-primary-foreground stroke-[3]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1.5 my-1.5 h-px bg-border/60", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1.5 text-muted-foreground/60 hover:text-foreground",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1.5 text-muted-foreground/60 hover:text-foreground",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
