"use client"

import { useState } from "react"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { BrutalistCard } from "@/components/brutalist/brutalist-card"
import { MetricCard } from "@/components/brutalist/metric-card"
import { StatusBadge } from "@/components/brutalist/status-badge"
import { TeamMapPreview } from "@/components/brutalist/team-map-preview"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { NotificationBanner } from "@/components/brutalist/notification-banner"
import { Clock, MapPin, Timer } from "lucide-react"
import Link from "next/link"

const teamMembers = [
  { id: "1", name: "Alex Rivera", image: "", position: { x: 35, y: 40 }, isOnline: true },
  { id: "2", name: "Jordan Smith", image: "", position: { x: 55, y: 60 }, isOnline: true },
  { id: "3", name: "Casey Johnson", image: "", position: { x: 75, y: 35 }, isOnline: true },
  { id: "4", name: "Morgan Lee", image: "", position: { x: 25, y: 70 }, isOnline: false },
]

export default function Dashboard() {
  const [isClockedIn, setIsClockedIn] = useState(false)

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Welcome Back</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mt-0.5">Alex Rivera</h1>
          </div>
          <UserAvatar name="Alex Rivera" size="lg" showOnlineIndicator isOnline={isClockedIn} />
        </div>
      </div>

      {/* Main Time Button */}
      <div className="px-5 py-4">
        <Link href="/clock">
          <BrutalistButton
            variant="primary"
            size="xl"
            fullWidth
            className="rounded-xl py-6"
          >
            <Timer className="w-6 h-6" />
            <span className="text-xl">{isClockedIn ? "Time Out" : "Time In"}</span>
            <div className="ml-auto w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
              <div className={`w-3 h-3 rounded-full ${isClockedIn ? "bg-[#22C55E]" : "bg-white/50"}`} />
            </div>
          </BrutalistButton>
        </Link>
      </div>

      {/* Status Card */}
      <div className="px-5 py-2">
        <BrutalistCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide">Current Status</h3>
            <StatusBadge status={isClockedIn ? "clock-in" : "off-clock"} />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[#F5F5F5] border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#6B21A8]" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Last Recorded Location</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-1 flex items-center gap-1">
                <span className="text-[#6B21A8]">●</span> 7th Ave, New York, NY
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">18 hours ago</p>
            </div>
          </div>
        </BrutalistCard>
      </div>

      {/* Session Approval Notification */}
      <div className="px-5 py-2">
        <NotificationBanner 
          type="pending"
          message="Session Awaiting Approval"
          details="Your biweekly report (Oct 14 - Oct 27) is pending supervisor approval"
        />
      </div>

      {/* Team Map */}
      <div className="px-5 py-4">
        <TeamMapPreview members={teamMembers} activeCount={8} />
      </div>

      {/* Metrics */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            icon={Clock}
            label="Week Hours"
            value="38.5h"
            color="bg-[#E0E7FF]"
            iconColor="text-[#6B21A8]"
          />
          <MetricCard 
            icon={MapPin}
            label="Current Location"
            value="New York, NY"
            color="bg-[#D1FAE5]"
            iconColor="text-[#059669]"
          />
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
