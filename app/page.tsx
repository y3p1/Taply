"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { BrutalistCard } from "@/components/brutalist/brutalist-card"
import { MetricCard } from "@/components/brutalist/metric-card"
import { StatusBadge } from "@/components/brutalist/status-badge"
import { TeamMapPreview } from "@/components/brutalist/team-map-preview"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { NotificationBanner } from "@/components/brutalist/notification-banner"
import { Clock, MapPin, Timer, LogOut } from "lucide-react"
import Link from "next/link"

interface ClockStatus {
  isClockedIn: boolean
  lastEntry: { locationName: string; timestamp: string } | null
  todayHours: number
  weekHours: number
}

interface TeamMember {
  id: string
  name: string
  status: string
  coords: { lat: number; lng: number } | null
}

interface ReportStatus {
  id: string
  status: string
  periodStart: string
  periodEnd: string
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch clock status
        const clockRes = await fetch('/api/clock')
        if (clockRes.ok) {
          const clockData = await clockRes.json()
          setClockStatus(clockData.data)
        }

        // Fetch profile for report status
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setReportStatus(profileData.data.latestReportStatus)
        }

        // Manager: fetch team data
        if (user.role === 'MANAGER') {
          const teamRes = await fetch('/api/team')
          if (teamRes.ok) {
            const teamData = await teamRes.json()
            setTeamMembers(teamData.data.members.map((m: TeamMember) => ({
              id: m.id,
              name: m.name,
              image: '',
              position: m.coords ? { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 } : { x: 50, y: 50 },
              isOnline: m.status === 'active',
            })))
            setActiveCount(teamData.data.activeCount)
          }
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </main>
    )
  }

  const isManager = user.role === 'MANAGER'
  const isClockedIn = clockStatus?.isClockedIn ?? false

  const getNotificationType = (): "pending" | "approved" | "warning" => {
    if (!reportStatus) return "pending"
    if (reportStatus.status === "APPROVED") return "approved"
    if (reportStatus.status === "FLAGGED") return "warning"
    return "pending"
  }

  const getNotificationMessage = () => {
    if (!reportStatus) return "No biweekly report found"
    if (reportStatus.status === "APPROVED") return "Report Approved"
    if (reportStatus.status === "FLAGGED") return "Report Flagged — Action Required"
    return "Session Awaiting Approval"
  }

  const getNotificationDetails = () => {
    if (!reportStatus) return undefined
    const start = new Date(reportStatus.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = new Date(reportStatus.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Biweekly report (${start} - ${end}) is ${reportStatus.status.toLowerCase()}`
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Welcome Back</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mt-0.5">{user.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar name={user.name} size="lg" showOnlineIndicator isOnline={isClockedIn} />
            {!isManager && (
              <button
                onClick={() => logout()}
                className="w-9 h-9 border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-[#1A1A1A]" />
              </button>
            )}
          </div>
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
                <span className="text-[#6B21A8]">●</span>
                {clockStatus?.lastEntry?.locationName || user.workLocation || 'No location recorded'}
              </p>
              {clockStatus?.lastEntry?.timestamp && (
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {getRelativeTime(new Date(clockStatus.lastEntry.timestamp))}
                </p>
              )}
            </div>
          </div>
        </BrutalistCard>
      </div>

      {/* Report Status Notification */}
      <div className="px-5 py-2">
        <NotificationBanner
          type={getNotificationType()}
          message={getNotificationMessage()}
          details={getNotificationDetails()}
        />
      </div>

      {/* Team Map (Manager only) */}
      {isManager && teamMembers.length > 0 && (
        <div className="px-5 py-4">
          <TeamMapPreview members={teamMembers} activeCount={activeCount} />
        </div>
      )}

      {/* Metrics */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Clock}
            label="Week Hours"
            value={`${clockStatus?.weekHours ?? 0}h`}
            color="bg-[#E0E7FF]"
            iconColor="text-[#6B21A8]"
          />
          <MetricCard
            icon={MapPin}
            label="Current Location"
            value={clockStatus?.lastEntry?.locationName || user.workLocation || 'N/A'}
            color="bg-[#D1FAE5]"
            iconColor="text-[#059669]"
          />
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
