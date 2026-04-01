import { NextResponse } from 'next/server'
import { getCurrentUser } from './auth'
import type { Role } from '@prisma/client/index'

// ─── Standard API Response Helpers ──────────────────────

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ─── Auth Guard ─────────────────────────────────────────

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return { user: null, error: errorResponse('Unauthorized', 401) }
  }
  return { user, error: null }
}

// ─── Role Guard ─────────────────────────────────────────

export async function requireRole(allowedRoles: Role[]) {
  const { user, error } = await requireAuth()
  if (error) return { user: null, error }

  if (!allowedRoles.includes(user!.role)) {
    return { user: null, error: errorResponse('Forbidden — insufficient permissions', 403) }
  }
  return { user: user!, error: null }
}

// ─── Reverse Geocoding (OpenStreetMap Nominatim) ────────

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      {
        headers: { 'User-Agent': 'Taply-MVP/1.0 (contact@taply.app)' },
        next: { revalidate: 3600 } // cache for 1 hour
      }
    )
    if (!res.ok) return 'Unknown Location'
    const data = await res.json()
    const city = data.address?.city || data.address?.town || data.address?.village || ''
    const state = data.address?.state || ''
    const country = data.address?.country_code?.toUpperCase() || ''
    if (city && state) return `${city}, ${state}`
    if (city && country) return `${city}, ${country}`
    return data.display_name?.split(',').slice(0, 2).join(',').trim() || 'Unknown Location'
  } catch {
    return 'Unknown Location'
  }
}
