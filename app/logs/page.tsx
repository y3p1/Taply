"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Calendar, Download, Filter, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TimeEntryWithUser {
  id: string
  type: string
  timestamp: string
  locationName: string
  user: { id: string; name: string; photoUrl: string | null }
}

export default function AttendanceLogsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntryWithUser[]>([])
  const [periodHours, setPeriodHours] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // Redirect employees away
    if (user && user.role !== 'MANAGER') {
      router.replace('/')
      return
    }
    if (!user) return

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs?page=${page}&limit=20`)
        if (res.ok) {
          const data = await res.json()
          setEntries(data.data.entries)
          setPeriodHours(data.data.periodHours)
          setTotalPages(data.data.pagination.totalPages)
        }
      } catch (error) {
        console.error('Logs fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user, router, page])

  if (!user || user.role !== 'MANAGER') return null

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </main>
    )
  }

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
            <h1 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">Attendance Logs</h1>
          </div>
          <button className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Period Summary Card */}
      <div className="px-5 py-2">
        <div className="bg-[#6B21A8] border-[3px] border-[#1A1A1A] rounded-lg p-5 shadow-[4px_4px_0px_#1A1A1A] text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Total Period Hours</p>
              <p className="text-5xl font-bold mt-2">
                {periodHours}<span className="text-2xl ml-1">hrs</span>
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-[#40E0D0] text-[#1A1A1A]">
              BIWEEKLY
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-white/80">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Current Biweekly Period</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border-[2px] border-[#1A1A1A] rounded-lg px-4 py-2.5 bg-white hover:bg-[#F5F5F5] transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Export CSV</span>
          </button>
          <button className="w-11 h-11 bg-[#40E0D0] border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
            <Filter className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-5">
        <div className="flex items-center text-[10px] font-bold text-[#6B7280] uppercase tracking-wider py-3 border-b border-[#E5E7EB]">
          <div className="flex-1">Employee / Time</div>
          <div className="w-24 text-center">Location</div>
          <div className="w-20 text-right">Status</div>
        </div>
      </div>

      {/* Records List */}
      <div className="px-5">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-[#6B7280]">No attendance records found</div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center py-4 ${
                index !== entries.length - 1 ? "border-b border-[#E5E7EB]" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <UserAvatar name={entry.user.name} size="md" />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{entry.user.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="w-24 flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#40E0D0] text-[#1A1A1A]">
                  {entry.locationName || 'Unknown'}
                </span>
              </div>
              <div className="w-20 text-right">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  entry.type === "CLOCK_IN" ? "text-[#6B21A8]" : "text-[#6B7280]"
                }`}>
                  {entry.type === "CLOCK_IN" ? "CLOCK IN" : "CLOCK OUT"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border-[2px] border-[#1A1A1A] rounded-lg text-sm font-semibold disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-[#6B7280]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border-[2px] border-[#1A1A1A] rounded-lg text-sm font-semibold disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
