"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface BrutalistCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "accent" | "muted"
}

export function BrutalistCard({ children, className, variant = "default" }: BrutalistCardProps) {
  return (
    <div
      className={cn(
        "border-[3px] border-[#1A1A1A] bg-white p-5 rounded-lg",
        "shadow-[4px_4px_0px_#1A1A1A]",
        variant === "accent" && "bg-[#40E0D0]",
        variant === "muted" && "bg-[#F5F5F5]",
        className
      )}
    >
      {children}
    </div>
  )
}
