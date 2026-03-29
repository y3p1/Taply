"use client"

import { useState } from "react"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Layers, MapPin, Search, Users, X, Maximize2 } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  id: string
  name: string
  image?: string
  status: "active" | "inactive"
  location: string
  coords: { lat: number; lng: number }
  lastSeen?: string
}

const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Rivera", status: "active", location: "New York, NY", coords: { lat: 40.7128, lng: -74.006 } },
  { id: "2", name: "Marcus Chen", status: "active", location: "San Francisco, CA", coords: { lat: 37.7749, lng: -122.4194 } },
  { id: "3", name: "Sarah Jenkins", status: "active", location: "Chicago, IL", coords: { lat: 41.8781, lng: -87.6298 } },
  { id: "4", name: "David Kalu", status: "inactive", location: "London, UK", coords: { lat: 51.5074, lng: -0.1278 }, lastSeen: "2h ago" },
  { id: "5", name: "Elena Rossi", status: "active", location: "Miami, FL", coords: { lat: 25.7617, lng: -80.1918 } },
  { id: "6", name: "Jordan Smith", status: "active", location: "Seattle, WA", coords: { lat: 47.6062, lng: -122.3321 } },
  { id: "7", name: "Casey Johnson", status: "active", location: "Austin, TX", coords: { lat: 30.2672, lng: -97.7431 } },
  { id: "8", name: "Morgan Lee", status: "inactive", location: "Toronto, CA", coords: { lat: 43.6532, lng: -79.3832 }, lastSeen: "5h ago" },
]

export default function TeamMapPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showList, setShowList] = useState(false)
  
  const activeCount = teamMembers.filter(m => m.status === "active").length

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="w-9 h-9 border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <h1 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">Team Map</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#D1FAE5] text-[#059669] px-2.5 py-1 rounded text-xs font-bold">
              {activeCount} ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="px-5">
        <div className="border-[3px] border-[#1A1A1A] rounded-xl bg-[#F5F5F5] shadow-[6px_6px_0px_#1A1A1A] overflow-hidden relative" style={{ height: "calc(100vh - 280px)" }}>
          {/* Map background with grid */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1A1A1A" strokeWidth="0.3" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
            </svg>
          </div>
          
          {/* Stylized world map shape */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-9xl font-bold text-[#1A1A1A]">WORLD</div>
          </div>
          
          {/* Map markers */}
          {teamMembers.map((member, index) => {
            // Distribute markers across the map area
            const positions = [
              { x: 25, y: 30 }, { x: 15, y: 45 }, { x: 35, y: 55 },
              { x: 70, y: 35 }, { x: 20, y: 70 }, { x: 12, y: 55 },
              { x: 30, y: 60 }, { x: 55, y: 25 }
            ]
            const pos = positions[index % positions.length]
            
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full border-[3px] border-[#1A1A1A] flex items-center justify-center ${
                    member.status === "active" ? "bg-[#40E0D0]" : "bg-[#E5E7EB]"
                  } shadow-[2px_2px_0px_#1A1A1A]`}>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  {member.status === "active" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] rounded-full border-2 border-white" />
                  )}
                </div>
              </button>
            )
          })}
          
          {/* Map controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
              <Search className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
          
          <div className="absolute top-4 right-4 space-y-2">
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
              <Layers className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
              <Maximize2 className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
          
          {/* Active members badge */}
          <div className="absolute bottom-4 left-4">
            <button 
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-2 bg-white border-[2px] border-[#1A1A1A] rounded-lg px-3 py-2 shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold text-[#1A1A1A]">{teamMembers.length} Team Members</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Member Card */}
      {selectedMember && (
        <div className="fixed bottom-28 left-5 right-5 bg-white border-[3px] border-[#1A1A1A] rounded-xl p-4 shadow-[6px_6px_0px_#1A1A1A] z-40">
          <button 
            onClick={() => setSelectedMember(null)}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center hover:bg-[#F5F5F5] rounded"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <UserAvatar 
              name={selectedMember.name} 
              size="lg" 
              showOnlineIndicator 
              isOnline={selectedMember.status === "active"} 
            />
            <div className="flex-1">
              <h3 className="font-bold text-[#1A1A1A]">{selectedMember.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#6B21A8]" />
                <span className="text-sm text-[#6B7280]">{selectedMember.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedMember.status === "active" 
                    ? "bg-[#D1FAE5] text-[#059669]" 
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}>
                  {selectedMember.status === "active" ? "CLOCKED IN" : `Last seen ${selectedMember.lastSeen}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team List Overlay */}
      {showList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl border-t-[3px] border-x-[3px] border-[#1A1A1A] max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <h2 className="font-bold text-[#1A1A1A] uppercase tracking-wide">Team Members</h2>
              <button onClick={() => setShowList(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member)
                    setShowList(false)
                  }}
                  className="flex items-center gap-3 w-full p-4 border-b border-[#E5E7EB] hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <UserAvatar 
                    name={member.name} 
                    size="md" 
                    showOnlineIndicator 
                    isOnline={member.status === "active"} 
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A]">{member.name}</p>
                    <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {member.location}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    member.status === "active" 
                      ? "bg-[#40E0D0] text-[#1A1A1A]" 
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}>
                    {member.status === "active" ? "ACTIVE" : "OFFLINE"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
