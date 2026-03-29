"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { Home, Clock, Users, Settings, Plus, Map, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: Home, label: "HOME", href: "/" },
  { icon: Clock, label: "LOGS", href: "/logs" },
  { icon: Map, label: "MAP", href: "/map" },
  { icon: FileText, label: "REPORTS", href: "/reports" },
]

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-[#1A1A1A] z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 relative">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive ? "text-[#6B21A8]" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-12 bg-[#40E0D0]" />
              )}
            </Link>
          )
        })}
        
        {/* Center FAB */}
        <div className="relative -top-6">
          <Link
            href="/clock"
            className={cn(
              "flex items-center justify-center w-14 h-14",
              "bg-[#40E0D0] border-[3px] border-[#1A1A1A] rounded-lg",
              "shadow-[4px_4px_0px_#1A1A1A]",
              "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A]",
              "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
              "transition-all duration-100"
            )}
          >
            <Plus className="w-7 h-7 text-[#1A1A1A]" strokeWidth={3} />
          </Link>
        </div>
        
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive ? "text-[#6B21A8]" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-12 bg-[#40E0D0]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
