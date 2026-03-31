'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BrutalistButton } from '@/components/brutalist/brutalist-button'
import { Mail, Lock, User, Hash, Briefcase, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeNumber: '',
    position: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await register(formData)
    if (!result.success) {
      setError(result.error || 'Registration failed')
    }
    setIsLoading(false)
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Alex Rivera', required: true },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'alex@habitat.org', required: true },
    { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Min. 6 characters', required: true },
    { name: 'employeeNumber', label: 'Employee Number', type: 'text', icon: Hash, placeholder: 'EMP-2024-001', required: true },
    { name: 'position', label: 'Position', type: 'text', icon: Briefcase, placeholder: 'Field Coordinator', required: false },
    { name: 'department', label: 'Department', type: 'text', icon: Building2, placeholder: 'Operations', required: false },
  ]

  return (
    <div className="w-full max-w-md">
      {/* Logo / Brand */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B21A8] border-[3px] border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_#1A1A1A] mb-4">
          <span className="text-2xl font-bold text-white">T</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] uppercase tracking-wide">Taply</h1>
      </div>

      {/* Register Form */}
      <div className="border-[3px] border-[#1A1A1A] rounded-xl p-6 bg-white shadow-[6px_6px_0px_#1A1A1A]">
        <h2 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide mb-6">Create Account</h2>

        {error && (
          <div className="bg-[#FEE2E2] border-[2px] border-[#991B1B] rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-[#991B1B]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map(({ name, label, type, icon: Icon, placeholder, required }) => (
            <div key={name}>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                {label} {required && <span className="text-[#EF4444]">*</span>}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type={type}
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={required}
                  className="w-full border-[2px] border-[#1A1A1A] rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-[#1A1A1A] bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>
          ))}

          <div className="pt-2">
            <BrutalistButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </BrutalistButton>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#6B21A8] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
