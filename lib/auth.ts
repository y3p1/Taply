import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'
import type { Role } from '@prisma/client/index'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const COOKIE_NAME = 'taply_token'

// ─── Password Utilities ─────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT Utilities ──────────────────────────────────────

export interface JWTPayload {
  userId: string
  email: string
  role: Role
}

export function signToken(payload: JWTPayload): string {
  // 7 days in seconds
  return jwt.sign(payload, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// ─── Cookie Utilities ───────────────────────────────────

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

// ─── Auth Helper ────────────────────────────────────────

export async function getCurrentUser() {
  const token = await getAuthToken()
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeNumber: true,
      position: true,
      department: true,
      phone: true,
      photoUrl: true,
      status: true,
      workCategory: true,
      workLocation: true,
      joinDate: true,
      supervisorId: true,
      organizationId: true,
      supervisor: {
        select: { id: true, name: true }
      }
    }
  })

  return user
}
