import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateDaysSchema = z.object({
  dayIds: z.array(z.string()),
  isApproved: z.boolean(),
})

// PATCH /api/reports/[id]/days — Approve/reject individual days
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['MANAGER'])
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const parsed = updateDaysSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return errorResponse('Report not found', 404)
    }

    await prisma.reportDay.updateMany({
      where: {
        reportId: id,
        id: { in: parsed.data.dayIds },
      },
      data: { isApproved: parsed.data.isApproved },
    })

    const updatedDays = await prisma.reportDay.findMany({
      where: { reportId: id },
      orderBy: { date: 'asc' },
    })

    return successResponse({ days: updatedDays })
  } catch (error) {
    console.error('Report days update error:', error)
    return errorResponse('Internal server error', 500)
  }
}
