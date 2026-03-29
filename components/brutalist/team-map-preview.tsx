"use client"

import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"
import { Layers } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  id: string
  name: string
  image?: string
  position: { x: number; y: number }
  isOnline: boolean
}

interface TeamMapPreviewProps {
  members: TeamMember[]
  activeCount: number
  className?: string
}

export function TeamMapPreview({ members, activeCount, className }: TeamMapPreviewProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Live Team Map</h2>
        <Link 
          href="/map" 
          className="text-sm font-semibold text-[#6B21A8] hover:underline"
        >
          View Full
        </Link>
      </div>
      
      <div className="border-[3px] border-[#1A1A1A] rounded-lg bg-[#F5F5F5] p-4 relative overflow-hidden min-h-[200px] shadow-[4px_4px_0px_#1A1A1A]">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A1A1A" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Map markers */}
        {members.slice(0, 4).map((member) => (
          <div
            key={member.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${member.position.x}%`, top: `${member.position.y}%` }}
          >
            <div className="relative">
              <UserAvatar 
                name={member.name} 
                image={member.image}
                size="sm" 
                showOnlineIndicator 
                isOnline={member.isOnline}
              />
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#40E0D0] rounded-full border-2 border-[#1A1A1A] flex items-center justify-center">
                  <span className="text-[8px] font-bold">{member.name[0]}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Active members badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white border-[2px] border-[#1A1A1A] rounded-lg px-3 py-2 shadow-[2px_2px_0px_#1A1A1A]">
            <span className="text-xs font-bold text-[#1A1A1A]">{activeCount} Active Members</span>
          </div>
        </div>
        
        {/* Map layers button */}
        <div className="absolute bottom-4 right-4">
          <button className="w-10 h-10 bg-[#40E0D0] border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
            <Layers className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>
    </div>
  )
}
