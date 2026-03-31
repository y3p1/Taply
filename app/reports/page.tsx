"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Calendar, Check, ChevronRight, Download, Flag, MessageSquare, Clock, Users, Building2 } from "lucide-react"
import Link from "next/link"

interface ReportDay {
  id: string
  dayLabel: string
  hours: number
  timeIn: string
  timeOut: string
  locationName: string
  isApproved: boolean
}

interface Report {
  id: string
  user: {
    id: string
    name: string
    photoUrl: string | null
    employeeNumber: string
    position: string
    workCategory: string
    supervisor: { id: string; name: string } | null
  }
  periodStart: string
  periodEnd: string
  totalHours: number
  daysPresent: number
  status: string
  submittedAt: string
  workTags: string[]
  days: ReportDay[]
}

interface Stats {
  totalEmployees: number
  pending: number
  approved: number
  flagged: number
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "FLAGGED">("all")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchReports = async () => {
      try {
        const statusParam = filter === "all" ? "" : `&status=${filter}`
        const res = await fetch(`/api/reports?page=1&limit=20${statusParam}`)
        if (res.ok) {
          const data = await res.json()
          setReports(data.data.reports)
          setStats(data.data.stats)
        }
      } catch (error) {
        console.error('Reports fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [user, filter])

  const handleStatusUpdate = async (reportId: string, status: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setReports(reports.map(r => r.id === reportId ? { ...r, status: data.data.report.status } : r))
        if (selectedReport?.id === reportId) {
          setSelectedReport({ ...selectedReport, status: data.data.report.status })
        }
      }
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  const isManager = user?.role === 'MANAGER'

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-[#D1FAE5] text-[#059669]"
      case "FLAGGED": return "bg-[#FEE2E2] text-[#991B1B]"
      default: return "bg-[#FEF3C7] text-[#92400E]"
    }
  }

  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${s} - ${e}`
  }

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </main>
    )
  }

  const summaryStats = stats ? [
    { label: "Total Employees", value: String(stats.totalEmployees), icon: Users, color: "bg-[#E0E7FF]", iconColor: "text-[#6B21A8]" },
    { label: "Pending Reviews", value: String(stats.pending), icon: Clock, color: "bg-[#FEF3C7]", iconColor: "text-[#92400E]" },
    { label: "Approved", value: String(stats.approved), icon: Check, color: "bg-[#D1FAE5]", iconColor: "text-[#059669]" },
    { label: "Flagged", value: String(stats.flagged), icon: Flag, color: "bg-[#FEE2E2]", iconColor: "text-[#991B1B]" },
  ] : []

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <h1 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">
              {isManager ? 'Biweekly Reports' : 'My Reports'}
            </h1>
          </div>
        </div>
      </div>

      {/* Summary Stats (Manager only) */}
      {isManager && stats && (
        <div className="px-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="border-[2px] border-[#1A1A1A] rounded-lg p-3 bg-white shadow-[2px_2px_0px_#1A1A1A]">
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
      )}

      {/* Filters */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(["all", "PENDING", "APPROVED", "FLAGGED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-[2px] border-[#1A1A1A] whitespace-nowrap transition-all ${
                filter === status
                  ? "bg-[#6B21A8] text-white shadow-[2px_2px_0px_#1A1A1A]"
                  : "bg-white text-[#1A1A1A] hover:bg-[#F5F5F5]"
              }`}
            >
              {status === "all" ? "ALL" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="px-5 space-y-3">
        {reports.length === 0 ? (
          <div className="py-8 text-center text-[#6B7280]">No reports found</div>
        ) : (
          reports.map((report) => (
            <button
              key={report.id}
              onClick={() => { setSelectedReport(report); setSelectedDays([]); setSelectAll(false) }}
              className="w-full border-[3px] border-[#1A1A1A] rounded-xl p-4 bg-white shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={report.user.name} size="md" />
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{report.user.name}</p>
                    <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatPeriod(report.periodStart, report.periodEnd)}
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
                    <p className="font-bold text-[#1A1A1A] capitalize text-sm">{report.user.workCategory.toLowerCase().replace('_', '-')}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${getStatusStyles(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Export Button */}
      <div className="px-5 py-6">
        <BrutalistButton variant="outline" fullWidth>
          <Download className="w-4 h-4" />
          Export {isManager ? 'All Reports' : 'My Report'}
        </BrutalistButton>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl border-t-[3px] border-x-[3px] border-[#1A1A1A] max-h-[85vh] overflow-hidden">
            <div className="p-5 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedReport.user.name} size="lg" />
                  <div>
                    <h2 className="font-bold text-[#1A1A1A] text-lg">{selectedReport.user.name}</h2>
                    <p className="text-sm text-[#6B7280]">{formatPeriod(selectedReport.periodStart, selectedReport.periodEnd)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-[#6B7280] hover:text-[#1A1A1A]">
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
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.user.employeeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Position:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.user.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Supervisor:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedReport.user.supervisor?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] font-medium">Work Mode:</span>
                    <span className="font-bold text-[#1A1A1A] capitalize">{selectedReport.user.workCategory.toLowerCase().replace('_', '-')}</span>
                  </div>
                </div>
              </div>

              {/* Work Tags */}
              {selectedReport.workTags.length > 0 && (
                <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
                  <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-3">Work Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.workTags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-[#E0E7FF] border border-[#6B21A8] text-[#6B21A8] rounded text-xs font-semibold uppercase tracking-wider">
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

              {/* Daily breakdown */}
              <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm">Daily Breakdown</h3>
                  {isManager && selectedReport.status === "PENDING" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => {
                          setSelectAll(e.target.checked)
                          setSelectedDays(e.target.checked ? selectedReport.days.map(d => d.id) : [])
                        }}
                        className="w-4 h-4 rounded border-[2px] border-[#1A1A1A]"
                      />
                      <span className="text-xs font-semibold text-[#6B7280]">SELECT ALL</span>
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedReport.days.map((day) => (
                    <div key={day.id} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                      <div className="flex items-center gap-3 flex-1">
                        {isManager && selectedReport.status === "PENDING" && (
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day.id)}
                            onChange={(e) => {
                              setSelectedDays(e.target.checked
                                ? [...selectedDays, day.id]
                                : selectedDays.filter(d => d !== day.id))
                            }}
                            className="w-4 h-4 rounded border-[2px] border-[#1A1A1A]"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{day.dayLabel}</p>
                          {day.hours > 0 ? (
                            <p className="text-xs text-[#6B7280]">{day.timeIn} - {day.timeOut}</p>
                          ) : (
                            <p className="text-xs text-[#6B7280] italic">No record</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A1A1A]">{day.hours}h</p>
                        <p className="text-xs text-[#6B7280]">{day.locationName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-[#E5E7EB] space-y-3">
              {isManager && selectedReport.status === "PENDING" && (
                <>
                  <div className="flex gap-3">
                    <BrutalistButton variant="destructive" className="flex-1" onClick={() => handleStatusUpdate(selectedReport.id, 'FLAGGED')}>
                      <Flag className="w-4 h-4" />
                      Flag
                    </BrutalistButton>
                    <BrutalistButton variant="accent" className="flex-1">
                      <MessageSquare className="w-4 h-4" />
                      Edit
                    </BrutalistButton>
                  </div>
                  <BrutalistButton variant="primary" fullWidth onClick={() => handleStatusUpdate(selectedReport.id, 'APPROVED')}>
                    <Check className="w-4 h-4" />
                    Approve Report
                  </BrutalistButton>
                </>
              )}
              {isManager && selectedReport.status === "APPROVED" && (
                <button className="w-full border-[2px] border-[#6B21A8] text-[#6B21A8] py-2.5 rounded-lg font-bold uppercase tracking-wide text-sm hover:bg-[#F5F5F5] transition-colors">
                  Edit Approval
                </button>
              )}
              {!isManager && (
                <BrutalistButton variant="outline" fullWidth>
                  <Download className="w-4 h-4" />
                  Export My Report
                </BrutalistButton>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
