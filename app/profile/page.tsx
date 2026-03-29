"use client"

import { useState } from "react"
import { BottomNav } from "@/components/brutalist/bottom-nav"
import { BrutalistButton } from "@/components/brutalist/brutalist-button"
import { UserAvatar } from "@/components/brutalist/user-avatar"
import { ArrowLeft, Mail, Phone, MapPin, Badge, Edit2 } from "lucide-react"
import Link from "next/link"

interface EmployeeProfile {
  id: string
  name: string
  employeeNumber: string
  position: string
  department: string
  supervisor: string
  workCategory: "hybrid" | "remote" | "home-based" | "location"
  workLocation?: string
  email: string
  phone: string
  joinDate: string
  photoUrl?: string
  status: "active" | "on-leave" | "inactive"
  notificationStatus: "approved" | "pending" | "awaiting-approval"
}

const currentEmployee: EmployeeProfile = {
  id: "1",
  name: "Alex Rivera",
  employeeNumber: "EMP-2024-001",
  position: "Field Coordinator",
  department: "Operations",
  supervisor: "Sarah Wilson",
  workCategory: "hybrid",
  workLocation: "New York, NY",
  email: "alex.rivera@company.com",
  phone: "+1 (555) 123-4567",
  joinDate: "January 15, 2024",
  status: "active",
  notificationStatus: "approved"
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

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
            <h1 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">Profile</h1>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-9 h-9 border-[2px] border-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          >
            <Edit2 className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-5 py-4">
        <div className="border-[3px] border-[#1A1A1A] rounded-xl p-6 bg-white shadow-[4px_4px_0px_#1A1A1A]">
          <div className="flex items-center gap-4">
            <UserAvatar name={currentEmployee.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">{currentEmployee.name}</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">{currentEmployee.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                  currentEmployee.status === "active" 
                    ? "bg-[#D1FAE5] text-[#059669]" 
                    : "bg-[#FEE2E2] text-[#991B1B]"
                }`}>
                  {currentEmployee.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Status */}
      <div className="px-5 py-2">
        <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4 bg-[#FEF3C7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#92400E] rounded-lg flex items-center justify-center">
              <Badge className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#92400E] font-bold uppercase tracking-wider">Session Status</p>
              <p className="text-sm font-bold text-[#92400E] mt-0.5 capitalize">{currentEmployee.notificationStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="px-5 py-4 space-y-3">
        {/* Basic Info */}
        <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
          <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Employee Number</p>
              <p className="text-sm font-bold text-[#1A1A1A] mt-1">{currentEmployee.employeeNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Department</p>
              <p className="text-sm font-bold text-[#1A1A1A] mt-1">{currentEmployee.department}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Join Date</p>
              <p className="text-sm font-bold text-[#1A1A1A] mt-1">{currentEmployee.joinDate}</p>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
          <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-4">Work Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Work Mode</p>
              <p className="text-sm font-bold text-[#1A1A1A] mt-1 capitalize">{currentEmployee.workCategory}</p>
            </div>
            {currentEmployee.workLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#6B21A8] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Primary Location</p>
                  <p className="text-sm font-bold text-[#1A1A1A] mt-1">{currentEmployee.workLocation}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Supervisor</p>
              <p className="text-sm font-bold text-[#1A1A1A] mt-1">{currentEmployee.supervisor}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-[2px] border-[#1A1A1A] rounded-lg p-4">
          <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#6B21A8]" />
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Email</p>
                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{currentEmployee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#6B21A8]" />
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Phone</p>
                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{currentEmployee.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 space-y-3">
        <BrutalistButton variant="primary" fullWidth>
          Update Profile
        </BrutalistButton>
        <BrutalistButton variant="outline" fullWidth>
          View Work History
        </BrutalistButton>
      </div>

      <BottomNav />
    </main>
  )
}
