import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-utils'
import { Role, ReportStatus } from '@prisma/client/index'

// GET /api/reports — List reports
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ReportStatus | 'all' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Employees can only see their own reports
    const where = {
      ...(user!.role === Role.EMPLOYEE ? { userId: user!.id } : { user: { organizationId: user!.organizationId } }),
      ...(status && status !== 'all' ? { status: status as ReportStatus } : {}),
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
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
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ])

    // Summary stats (manager only)
    let stats = null
    if (user!.role === Role.MANAGER) {
      const orgWhere = { user: { organizationId: user!.organizationId } }
      const [totalEmployees, pending, approved, flagged] = await Promise.all([
        prisma.user.count({ where: { organizationId: user!.organizationId, role: Role.EMPLOYEE } }),
        prisma.report.count({ where: { ...orgWhere, status: ReportStatus.PENDING } }),
        prisma.report.count({ where: { ...orgWhere, status: ReportStatus.APPROVED } }),
        prisma.report.count({ where: { ...orgWhere, status: ReportStatus.FLAGGED } }),
      ])
      stats = { totalEmployees, pending, approved, flagged }
    }

    return successResponse({
      reports,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Reports error:', error)
    return errorResponse('Internal server error', 500)
  }
}
