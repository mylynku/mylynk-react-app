// src/components/ui/calendar.tsx
"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "../../lib/utils"
import "react-day-picker/dist/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      {...props}
    />
  )
}
