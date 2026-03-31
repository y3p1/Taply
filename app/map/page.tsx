"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Layers, MapPin, Search, Users, X, Maximize2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TeamMember {
  id: string
  name: string
  photoUrl: string | null
  status: string
  location: string
  coords: { lat: number; lng: number } | null
  lastSeen: string | null
  position: string
}

export default function TeamMapPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showList, setShowList] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'MANAGER') {
      router.replace('/')
      return
    }
    if (!user) return

    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/team')
        if (res.ok) {
          const data = await res.json()
          setTeamMembers(data.data.members)
          setActiveCount(data.data.activeCount)
        }
      } catch (error) {
        console.error('Team fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [user, router])

  if (!user || user.role !== 'MANAGER') return null

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </main>
    )
  }

  // Distribute markers across map
  const markerPositions = [
    { x: 25, y: 30 }, { x: 15, y: 45 }, { x: 35, y: 55 },
    { x: 70, y: 35 }, { x: 20, y: 70 }, { x: 12, y: 55 },
    { x: 30, y: 60 }, { x: 55, y: 25 }, { x: 65, y: 50 },
    { x: 45, y: 40 },
  ]

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
          
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-9xl font-bold text-[#1A1A1A]">WORLD</div>
          </div>
          
          {/* Map markers */}
          {teamMembers.map((member, index) => {
            const pos = markerPositions[index % markerPositions.length]
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
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <Search className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
          
          <div className="absolute top-4 right-4 space-y-2">
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <Layers className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <button className="w-10 h-10 bg-white border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <Maximize2 className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-2 bg-white border-[2px] border-[#1A1A1A] rounded-lg px-3 py-2 shadow-[2px_2px_0px_#1A1A1A]"
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
                  {selectedMember.status === "active" ? "CLOCKED IN" : `Last seen ${selectedMember.lastSeen || 'N/A'}`}
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
                  onClick={() => { setSelectedMember(member); setShowList(false) }}
                  className="flex items-center gap-3 w-full p-4 border-b border-[#E5E7EB] hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <UserAvatar name={member.name} size="md" showOnlineIndicator isOnline={member.status === "active"} />
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
