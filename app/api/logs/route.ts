import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, successResponse, errorResponse } from '@/lib/api-utils'

// GET /api/logs — Attendance logs (MANAGER only)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['MANAGER'])
    if (error) return error

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')

    const where = {
      ...(userId ? { userId } : {}),
      user: { organizationId: user!.organizationId },
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, photoUrl: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.timeEntry.count({ where }),
    ])

    // Calculate period hours for the current biweekly period
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const periodEntries = await prisma.timeEntry.findMany({
      where: {
        user: { organizationId: user!.organizationId },
        timestamp: { gte: twoWeeksAgo },
      },
      orderBy: { timestamp: 'asc' },
    })

    let periodHours = 0
    for (let i = 0; i < periodEntries.length - 1; i++) {
      if (periodEntries[i].type === 'CLOCK_IN' && periodEntries[i + 1].type === 'CLOCK_OUT' && periodEntries[i].userId === periodEntries[i + 1].userId) {
        periodHours += (periodEntries[i + 1].timestamp.getTime() - periodEntries[i].timestamp.getTime()) / (1000 * 60 * 60)
      }
    }

    return successResponse({
      entries,
      periodHours: Math.round(periodHours * 10) / 10,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Logs error:', error)
    return errorResponse('Internal server error', 500)
  }
}
