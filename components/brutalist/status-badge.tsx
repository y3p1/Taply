"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "clock-in" | "clock-out" | "off-clock" | "remote" | "office" | "verified" | "pending" | "biweekly"
  className?: string
}

const statusStyles = {
  "clock-in": "bg-[#40E0D0] text-[#1A1A1A]",
  "clock-out": "bg-white text-[#1A1A1A] border-[2px] border-[#1A1A1A]",
  "off-clock": "bg-[#40E0D0] text-[#1A1A1A]",
  "remote": "bg-[#FEE2E2] text-[#991B1B]",
  "office": "bg-[#40E0D0] text-[#1A1A1A]",
  "verified": "bg-[#D1FAE5] text-[#065F46]",
  "pending": "bg-[#FEF3C7] text-[#92400E]",
  "biweekly": "bg-[#40E0D0] text-[#1A1A1A]"
}

const statusLabels = {
  "clock-in": "CLOCK IN",
  "clock-out": "CLOCK OUT",
  "off-clock": "OFF CLOCK",
  "remote": "REMOTE",
  "office": "HQ OFFICE",
  "verified": "VERIFIED",
  "pending": "PENDING",
  "biweekly": "BIWEEKLY"
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
