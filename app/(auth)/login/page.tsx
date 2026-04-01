'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BrutalistButton } from '@/components/brutalist/brutalist-button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B21A8] border-[3px] border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_#1A1A1A] mb-4">
          <span className="text-2xl font-bold text-white">T</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] uppercase tracking-wide">Taply</h1>
        <p className="text-sm text-[#6B7280] mt-1">Employee Time & Location Monitor</p>
      </div>

      {/* Login Form */}
      <div className="border-[3px] border-[#1A1A1A] rounded-xl p-6 bg-white shadow-[6px_6px_0px_#1A1A1A]">
        <h2 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide mb-6">Sign In</h2>

        {error && (
          <div className="bg-[#FEE2E2] border-[2px] border-[#991B1B] rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-[#991B1B]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@habitat.org"
                required
                className="w-full border-[2px] border-[#1A1A1A] rounded-lg px-10 py-3 text-sm font-medium text-[#1A1A1A] bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full border-[2px] border-[#1A1A1A] rounded-lg px-10 py-3 text-sm font-medium text-[#1A1A1A] bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <BrutalistButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </BrutalistButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-[#6B21A8] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Demo credentials hint */}
      <div className="mt-6 border-[2px] border-dashed border-[#40E0D0] rounded-lg p-4 bg-[#F0FDFA]">
        <p className="text-xs font-bold text-[#0D9488] uppercase tracking-wider mb-2">Demo Accounts</p>
        <div className="space-y-1 text-xs text-[#0D9488]">
          <p><span className="font-semibold">Manager:</span> sarah.wilson@habitat.org / manager123</p>
          <p><span className="font-semibold">Employee:</span> alex.rivera@habitat.org / employee123</p>
        </div>
      </div>
    </div>
  )
}
