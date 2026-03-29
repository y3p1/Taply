"use client"

import { useState } from "react"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { StatusBadge } from "@/components/brutalist/status-badge"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Calendar, ChevronDown, Download, Filter, MoreVertical } from "lucide-react"
import Link from "next/link"

interface AttendanceRecord {
  id: string
  employee: {
    name: string
    image?: string
  }
  time: string
  location: string
  locationType: "office" | "remote"
  status: "clock-in" | "clock-out"
}

const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    employee: { name: "Marcus Chen" },
    time: "08:02 AM",
    location: "New York, NY",
    locationType: "office",
    status: "clock-in"
  },
  {
    id: "2",
    employee: { name: "Sarah Jenkins" },
    time: "08:15 AM",
    location: "Los Angeles, CA",
    locationType: "office",
    status: "clock-in"
  },
  {
    id: "3",
    employee: { name: "David Kalu" },
    time: "04:45 PM",
    location: "Remote - Toronto, ON",
    locationType: "remote",
    status: "clock-out"
  },
  {
    id: "4",
    employee: { name: "Elena Rossi" },
    time: "09:12 AM",
    location: "Home - Boston, MA",
    locationType: "office",
    status: "clock-in"
  },
  {
    id: "5",
    employee: { name: "James Wilson" },
    time: "10:30 AM",
    location: "Seattle, WA",
    locationType: "office",
    status: "clock-in"
  },
  {
    id: "6",
    employee: { name: "Lisa Chen" },
    time: "12:00 PM",
    location: "San Francisco, CA",
    locationType: "office",
    status: "clock-in"
  },
]

export default function AttendanceLogsPage() {
  const [period, setPeriod] = useState("biweekly")

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
                84.5<span className="text-2xl ml-1">hrs</span>
              </p>
            </div>
            <StatusBadge status="biweekly" />
          </div>
          <div className="flex items-center gap-2 mt-4 text-white/80">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Oct 14 - Oct 27, 2023</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border-[2px] border-[#1A1A1A] rounded-lg px-4 py-2.5 bg-white hover:bg-[#F5F5F5] transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Export Excel</span>
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
        {attendanceRecords.map((record, index) => (
          <div 
            key={record.id}
            className={`flex items-center py-4 ${
              index !== attendanceRecords.length - 1 ? "border-b border-[#E5E7EB]" : ""
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <UserAvatar name={record.employee.name} size="md" />
              <div>
                <p className="font-semibold text-[#1A1A1A]">{record.employee.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{record.time}</p>
              </div>
            </div>
            <div className="w-24 flex justify-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                record.locationType === "office" 
                  ? "bg-[#40E0D0] text-[#1A1A1A]" 
                  : "bg-[#FEE2E2] text-[#991B1B]"
              }`}>
                {record.location}
              </span>
            </div>
            <div className="w-20 text-right">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                record.status === "clock-in" ? "text-[#6B21A8]" : "text-[#6B7280]"
              }`}>
                {record.status === "clock-in" ? "CLOCK IN" : "CLOCK OUT"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show More */}
      <div className="px-5 py-4">
        <button className="w-full text-center py-3 text-sm font-semibold text-[#6B7280] uppercase tracking-wider border-t border-b border-[#E5E7EB]">
          Show Older Records
        </button>
      </div>

      <BottomNav />
    </main>
  )
}
