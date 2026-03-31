import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, successResponse, errorResponse, reverseGeocode } from '@/lib/api-utils'
import { TimeEntryType } from '@prisma/client/index'
import { z } from 'zod'

const clockSchema = z.object({
  type: z.enum(['CLOCK_IN', 'CLOCK_OUT']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  selfieUrl: z.string().optional(),
})

// POST /api/clock — Clock in or out
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const parsed = clockSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { type, latitude, longitude, selfieUrl } = parsed.data

    // Reverse geocode the location
    let locationName = ''
    if (latitude && longitude) {
      locationName = await reverseGeocode(latitude, longitude)
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId: user!.id,
        type: type as TimeEntryType,
        latitude,
        longitude,
        locationName,
        selfieUrl,
      }
    })

    return successResponse({ entry }, 201)
  } catch (error) {
    console.error('Clock error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// GET /api/clock — Get current clock-in status for the authenticated user
export async function GET() {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    // Get most recent time entry
    const lastEntry = await prisma.timeEntry.findFirst({
      where: { userId: user!.id },
      orderBy: { timestamp: 'desc' },
    })

    const isClockedIn = lastEntry?.type === TimeEntryType.CLOCK_IN

    // Get today's entries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = await prisma.timeEntry.findMany({
      where: {
        userId: user!.id,
        timestamp: { gte: today },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Calculate today's hours
    let todayHours = 0
    for (let i = 0; i < todayEntries.length - 1; i += 2) {
      if (todayEntries[i].type === TimeEntryType.CLOCK_IN && todayEntries[i + 1]?.type === TimeEntryType.CLOCK_OUT) {
        todayHours += (todayEntries[i + 1].timestamp.getTime() - todayEntries[i].timestamp.getTime()) / (1000 * 60 * 60)
      }
    }
    // If currently clocked in, add time since last clock in
    if (isClockedIn && lastEntry) {
      todayHours += (Date.now() - lastEntry.timestamp.getTime()) / (1000 * 60 * 60)
    }

    // Get this week's hours
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const weekEntries = await prisma.timeEntry.findMany({
      where: {
        userId: user!.id,
        timestamp: { gte: startOfWeek },
      },
      orderBy: { timestamp: 'asc' },
    })

    let weekHours = 0
    for (let i = 0; i < weekEntries.length - 1; i += 2) {
      if (weekEntries[i].type === TimeEntryType.CLOCK_IN && weekEntries[i + 1]?.type === TimeEntryType.CLOCK_OUT) {
        weekHours += (weekEntries[i + 1].timestamp.getTime() - weekEntries[i].timestamp.getTime()) / (1000 * 60 * 60)
      }
    }
    if (isClockedIn && lastEntry) {
      weekHours += (Date.now() - lastEntry.timestamp.getTime()) / (1000 * 60 * 60)
    }

    return successResponse({
      isClockedIn,
      lastEntry,
      todayHours: Math.round(todayHours * 10) / 10,
      weekHours: Math.round(weekHours * 10) / 10,
    })
  } catch (error) {
    console.error('Clock status error:', error)
    return errorResponse('Internal server error', 500)
  }
}
