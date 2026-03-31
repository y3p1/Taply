import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'

// GET /api/profile — Get current user's profile
export async function GET() {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const profile = await prisma.user.findUnique({
      where: { id: user!.id },
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
        supervisor: { select: { id: true, name: true } },
      }
    })

    // Get latest report status for notification
    const latestReport = await prisma.report.findFirst({
      where: { userId: user!.id },
      orderBy: { submittedAt: 'desc' },
      select: { id: true, status: true, periodStart: true, periodEnd: true },
    })

    return successResponse({ profile, latestReportStatus: latestReport })
  } catch (error) {
    console.error('Profile error:', error)
    return errorResponse('Internal server error', 500)
  }
}

const updateSchema = z.object({
  phone: z.string().optional(),
  workLocation: z.string().optional(),
  photoUrl: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
})

// PATCH /api/profile — Update profile
export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    // Only include defined fields
    const data: Record<string, string> = {}
    if (parsed.data.phone !== undefined) data.phone = parsed.data.phone
    if (parsed.data.workLocation !== undefined) data.workLocation = parsed.data.workLocation
    if (parsed.data.photoUrl !== undefined) data.photoUrl = parsed.data.photoUrl
    if (parsed.data.position !== undefined) data.position = parsed.data.position
    if (parsed.data.department !== undefined) data.department = parsed.data.department

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data,
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
      }
    })

    return successResponse({ profile: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return errorResponse('Internal server error', 500)
  }
}
