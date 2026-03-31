import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-utils'
import { Role, ReportStatus } from '@prisma/client/index'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/reports/[id] — Single report detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            employeeNumber: true,
            position: true,
            workCategory: true,
            supervisor: { select: { id: true, name: true } },
          }
        },
        days: { orderBy: { date: 'asc' } },
        reviewedBy: { select: { id: true, name: true } },
      }
    })

    if (!report) {
      return errorResponse('Report not found', 404)
    }

    // Employees can only see their own reports
    if (user!.role === Role.EMPLOYEE && report.userId !== user!.id) {
      return errorResponse('Forbidden', 403)
    }

    return successResponse({ report })
  } catch (error) {
    console.error('Report detail error:', error)
    return errorResponse('Internal server error', 500)
  }
}

const updateSchema = z.object({
  status: z.enum(['APPROVED', 'FLAGGED', 'PENDING']).optional(),
})

// PATCH /api/reports/[id] — Update report status (MANAGER only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    if (user!.role !== Role.MANAGER) {
      return errorResponse('Only managers can update report status', 403)
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return errorResponse('Report not found', 404)
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status as ReportStatus } : {}),
        reviewedById: user!.id,
      },
      include: {
        user: { select: { id: true, name: true } },
        days: { orderBy: { date: 'asc' } },
      }
    })

    // If approving, mark all days as approved
    if (parsed.data.status === 'APPROVED') {
      await prisma.reportDay.updateMany({
        where: { reportId: id },
        data: { isApproved: true },
      })
    }

    return successResponse({ report: updated })
  } catch (error) {
    console.error('Report update error:', error)
    return errorResponse('Internal server error', 500)
  }
}
