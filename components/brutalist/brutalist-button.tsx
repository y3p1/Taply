"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "accent" | "outline" | "destructive"
  size?: "sm" | "md" | "lg" | "xl"
  fullWidth?: boolean
}

export function BrutalistButton({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  fullWidth = false,
  ...props 
}: BrutalistButtonProps) {
  return (
    <button
      className={cn(
        "border-[3px] border-[#1A1A1A] font-semibold uppercase tracking-wide",
        "shadow-[4px_4px_0px_#1A1A1A]",
        "transition-all duration-100 ease-out",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#1A1A1A]",
        "flex items-center justify-center gap-2",
        // Variants
        variant === "primary" && "bg-[#6B21A8] text-white",
        variant === "accent" && "bg-[#40E0D0] text-[#1A1A1A]",
        variant === "outline" && "bg-white text-[#1A1A1A]",
        variant === "destructive" && "bg-[#EF4444] text-white",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-xs rounded-md",
        size === "md" && "px-4 py-2.5 text-sm rounded-lg",
        size === "lg" && "px-6 py-3.5 text-base rounded-lg",
        size === "xl" && "px-8 py-5 text-lg rounded-xl",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
