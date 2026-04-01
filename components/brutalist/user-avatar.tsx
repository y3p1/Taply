"use client"

import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  image?: string
  size?: "sm" | "md" | "lg" | "xl"
  showOnlineIndicator?: boolean
  isOnline?: boolean
  className?: string
}

export function UserAvatar({ 
  name, 
  image, 
  size = "md", 
  showOnlineIndicator = false,
  isOnline = false,
  className 
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl"
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "border-[3px] border-[#1A1A1A] rounded-full bg-[#F5F5F5] flex items-center justify-center font-bold text-[#1A1A1A] overflow-hidden",
          sizeClasses[size]
        )}
      >
        {image ? (
          <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showOnlineIndicator && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
            isOnline ? "bg-[#22C55E]" : "bg-[#6B7280]"
          )}
        />
      )}
    </div>
  )
}
