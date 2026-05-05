"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-black/25 shadow-none transition-shadow outline-none focus-visible:border-[#1976d2] focus-visible:ring-[2px] focus-visible:ring-[#1976d2]/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-[#1976d2] data-[state=checked]:bg-[#1976d2] data-[state=checked]:text-white dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-[#1976d2]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
