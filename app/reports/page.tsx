"use client"

import { useState } from "react"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Calendar, Check, ChevronRight, Download, Flag, MessageSquare, Clock, Users, Building2 } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  employee: {
    name: string
    image?: string
    employeeNumber: string
    position: string
    supervisor: string
    category: "hybrid" | "remote" | "home-based" | "location"
  }
  period: string
  totalHours: number
  daysPresent: number
  status: "pending" | "approved" | "flagged"
  submittedAt: string
  workTags: string[]
  dailyBreakdown: Array<{
    day: string
    hours: number
    timeIn: string
    timeOut: string
    location: string
  }>
}

const reports: Report[] = [
  {
    id: "1",
    employee: { 
      name: "Marcus Chen",
      employeeNumber: "EMP-2024-001",
      position: "Field Coordinator",
      supervisor: "Sarah Wilson",
      category: "hybrid"
    },
    period: "Oct 14 - Oct 27",
    totalHours: 84.5,
    daysPresent: 10,
    status: "pending",
    submittedAt: "2 hours ago",
    workTags: ["fieldwork", "client-visit"],
    dailyBreakdown: [
      { day: "Mon", hours: 8.5, timeIn: "08:00 AM", timeOut: "05:15 PM", location: "New York, NY" },
      { day: "Tue", hours: 8.0, timeIn: "08:30 AM", timeOut: "04:45 PM", location: "Brooklyn, NY" },
      { day: "Wed", hours: 8.5, timeIn: "07:45 AM", timeOut: "05:00 PM", location: "Manhattan, NY" },
      { day: "Thu", hours: 8.0, timeIn: "08:15 AM", timeOut: "04:30 PM", location: "Queens, NY" },
      { day: "Fri", hours: 8.0, timeIn: "09:00 AM", timeOut: "05:15 PM", location: "Remote" },
    ]
  },
  {
    id: "2",
    employee: { 
      name: "Sarah Jenkins",
      employeeNumber: "EMP-2024-002",
      position: "Community Manager",
      supervisor: "David Torres",
      category: "location"
    },
    period: "Oct 14 - Oct 27",
    totalHours: 79.0,
    daysPresent: 9,
    status: "approved",
    submittedAt: "Yesterday",
    workTags: ["community-outreach", "training"],
    dailyBreakdown: [
      { day: "Mon", hours: 8.0, timeIn: "08:15 AM", timeOut: "04:45 PM", location: "Los Angeles, CA" },
      { day: "Tue", hours: 8.0, timeIn: "08:00 AM", timeOut: "04:30 PM", location: "Los Angeles, CA" },
      { day: "Wed", hours: 8.5, timeIn: "07:30 AM", timeOut: "05:15 PM", location: "Santa Monica, CA" },
      { day: "Thu", hours: 8.0, timeIn: "08:30 AM", timeOut: "05:00 PM", location: "Los Angeles, CA" },
      { day: "Fri", hours: 7.5, timeIn: "09:00 AM", timeOut: "04:45 PM", location: "Remote" },
    ]
  },
  {
    id: "3",
    employee: { 
      name: "David Kalu",
      employeeNumber: "EMP-2024-003",
      position: "Field Supervisor",
      supervisor: "Maria Garcia",
      category: "remote"
    },
    period: "Oct 14 - Oct 27",
    totalHours: 45.5,
    daysPresent: 6,
    status: "flagged",
    submittedAt: "3 days ago",
    workTags: ["remote-work", "management"],
    dailyBreakdown: [
      { day: "Mon", hours: 8.0, timeIn: "09:00 AM", timeOut: "05:30 PM", location: "Remote" },
      { day: "Tue", hours: 7.5, timeIn: "09:30 AM", timeOut: "05:00 PM", location: "Remote" },
      { day: "Wed", hours: 0, timeIn: "-", timeOut: "-", location: "N/A" },
      { day: "Thu", hours: 7.5, timeIn: "08:30 AM", timeOut: "04:30 PM", location: "Remote" },
      { day: "Fri", hours: 0, timeIn: "-", timeOut: "-", location: "N/A" },
    ]
  },
  {
    id: "4",
    employee: { 
      name: "Elena Rossi",
      employeeNumber: "EMP-2024-004",
      position: "Project Lead",
      supervisor: "James Mitchell",
      category: "home-based"
    },
    period: "Oct 14 - Oct 27",
    totalHours: 88.0,
    daysPresent: 10,
    status: "approved",
    submittedAt: "1 week ago",
    workTags: ["project-management", "home-office"],
    dailyBreakdown: [
      { day: "Mon", hours: 9.0, timeIn: "07:30 AM", timeOut: "05:15 PM", location: "Home - Toronto, ON" },
      { day: "Tue", hours: 8.5, timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Home - Toronto, ON" },
      { day: "Wed", hours: 9.0, timeIn: "07:45 AM", timeOut: "05:30 PM", location: "Home - Toronto, ON" },
      { day: "Thu", hours: 8.5, timeIn: "08:15 AM", timeOut: "05:00 PM", location: "Home - Toronto, ON" },
      { day: "Fri", hours: 9.0, timeIn: "07:30 AM", timeOut: "05:45 PM", location: "Home - Toronto, ON" },
    ]
  },
]

const summaryStats = [
  { label: "Total Employees", value: "24", icon: Users, color: "bg-[#E0E7FF]", iconColor: "text-[#6B21A8]" },
  { label: "Pending Reviews", value: "8", icon: Clock, color: "bg-[#FEF3C7]", iconColor: "text-[#92400E]" },
  { label: "Approved", value: "14", icon: Check, color: "bg-[#D1FAE5]", iconColor: "text-[#059669]" },
  { label: "Flagged", value: "2", icon: Flag, color: "bg-[#FEE2E2]", iconColor: "text-[#991B1B]" },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "flagged">("all")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter(r => r.status === filter)

  const getStatusStyles = (status: Report["status"]) => {
    switch (status) {
      case "approved":
        return "bg-[#D1FAE5] text-[#059669]"
      case "flagged":
        return "bg-[#FEE2E2] text-[#991B1B]"
      default:
        return "bg-[#FEF3C7] text-[#92400E]"
    }
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
            <h1 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">Biweekly Reports</h1>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-2 gap-3">
          {summaryStats.map((stat) => (
            <div 
              key={stat.label}
              className="border-[2px] border-[#1A1A1A] rounded-lg p-3 bg-white shadow-[2px_2px_0px_#1A1A1A]"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1A1A1A]">{stat.value}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(["all", "pending", "approved", "flagged"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-[2px] border-[#1A1A1A] whitespace-nowrap transition-all ${
                filter === status
                  ? "bg-[#6B21A8] text-white shadow-[2px_2px_0px_#1A1A1A]"
                  : "bg-white text-[#1A1A1A] hover:bg-[#F5F5F5]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="px-5 space-y-3">
        {filteredReports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="w-full border-[3px] border-[#1A1A1A] rounded-xl p-4 bg-white shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar name={report.employee.name} size="md" />
                <div>
                  <p className="font-bold text-[#1A1A1A]">{report.employee.name}</p>
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {report.period}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B7280]" />
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider">Hours</p>
                  <p className="font-bold text-[#1A1A1A]">{report.totalHours}h</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider">Category</p>
                  <p className="font-bold text-[#1A1A1A] capitalize text-sm">{report.employee.category}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${getStatusStyles(report.status)}`}>
                {report.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Export Button */}
      <div className="px-5 py-6">
        <BrutalistButton variant="outline" fullWidth>
          <Download className="w-4 h-4" />
          Export All Reports
        </BrutalistButton>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl border-t-[3px] border-x-[3px] border-[#1A1A1A] max-h-[85vh] overflow-hidden">
            <div className="p-5 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedReport.employee.name} size="lg" />
                  <div>
                    <h2 className="font-bold text-[#1A1A1A] text-lg">{selectedReport.employee.name}</h2>
                    <p className="text-sm text-[#6B7280]">{selectedReport.period}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-[#6B7280] hover:text-[#1A1A1A]"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Employee Profile */}
              <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5]">
                <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-3">Employee Profile</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Employee #:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.employee.employeeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Position:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.employee.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Supervisor:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.employee.supervisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Work Mode:</span>
                    <span className="font-bold text-[#1A1A1A] capitalize">{selectedReport.employee.category}</span>
                  </div>
                </div>
              </div>

              {/* Work Tags */}
              {selectedReport.workTags.length > 0 && (
                <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
                  <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-3">Work Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.workTags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-[#E0E7FF] border border-[#6B21A8] text-[#6B21A8] rounded text-xs font-semibold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5]">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider">Total Hours</p>
                  <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{selectedReport.totalHours}h</p>
                </div>
                <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4 bg-[#F5F5F5]">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider">Days Present</p>
                  <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{selectedReport.daysPresent}</p>
                </div>
              </div>
              
              {/* Daily breakdown with approval checkboxes */}
              <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm">Daily Breakdown</h3>
                  {selectedReport.status === "pending" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => {
                          setSelectAll(e.target.checked)
                          if (e.target.checked) {
                            setSelectedDays(selectedReport.dailyBreakdown.map((_, i) => i.toString()))
                          } else {
                            setSelectedDays([])
                          }
                        }}
                        className="w-4 h-4 rounded border-[2px] border-[#1A1A1A]"
                      />
                      <span className="text-xs font-semibold text-[#6B7280]">SELECT ALL</span>
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedReport.dailyBreakdown.map((day, i) => (
                    <div key={day.day} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                      <div className="flex items-center gap-3 flex-1">
                        {selectedReport.status === "pending" && (
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(i.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDays([...selectedDays, i.toString()])
                              } else {
                                setSelectedDays(selectedDays.filter(d => d !== i.toString()))
                              }
                            }}
                            className="w-4 h-4 rounded border-[2px] border-[#1A1A1A]"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{day.day}</p>
                          {day.hours > 0 ? (
                            <p className="text-xs text-[#6B7280]">{day.timeIn} - {day.timeOut}</p>
                          ) : (
                            <p className="text-xs text-[#6B7280] italic">No record</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A1A1A]">{day.hours}h</p>
                        <p className="text-xs text-[#6B7280]">{day.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-5 border-t border-[#E5E7EB] space-y-3">
              {selectedReport.status === "pending" && (
                <>
                  <div className="flex gap-3">
                    <BrutalistButton variant="destructive" className="flex-1">
                      <Flag className="w-4 h-4" />
                      Flag
                    </BrutalistButton>
                    <BrutalistButton variant="accent" className="flex-1">
                      <MessageSquare className="w-4 h-4" />
                      Edit
                    </BrutalistButton>
                  </div>
                  <div className="flex gap-3">
                    <BrutalistButton variant="primary" className="flex-1">
                      <Check className="w-4 h-4" />
                      Approve Selected
                    </BrutalistButton>
                    <BrutalistButton variant="primary" className="flex-1">
                      <Check className="w-4 h-4" />
                      Approve All
                    </BrutalistButton>
                  </div>
                </>
              )}
              {selectedReport.status === "approved" && (
                <button className="w-full border-[2px] border-[#6B21A8] text-[#6B21A8] py-2.5 rounded-lg font-bold uppercase tracking-wide text-sm hover:bg-[#F5F5F5] transition-colors">
                  Edit Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
