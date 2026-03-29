"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  iconBgColor?: string
  iconColor?: string
  className?: string
}

export function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  iconBgColor = "bg-[#E0E7FF]",
  iconColor = "text-[#6B21A8]",
  className 
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "border-[3px] border-[#1A1A1A] bg-white p-4 rounded-lg",
        "shadow-[4px_4px_0px_#1A1A1A]",
        "flex flex-col gap-2",
        className
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBgColor)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="mt-1">
        <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#1A1A1A] mt-0.5">{value}</p>
      </div>
    </div>
  )
}
