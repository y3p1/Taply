import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { Role } from '@prisma/client/index'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['MANAGER', 'EMPLOYEE']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { email, password, name, employeeNumber, position, department, role } = parsed.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { employeeNumber }] }
    })
    if (existingUser) {
      return errorResponse('User with this email or employee number already exists', 409)
    }

    // Get or create default organization
    let org = await prisma.organization.findFirst()
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Habitat for Humanity' }
      })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        employeeNumber,
        position: position || '',
        department: department || '',
        role: role === 'MANAGER' ? Role.MANAGER : Role.EMPLOYEE,
        organizationId: org.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeNumber: true,
        position: true,
        department: true,
      }
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    await setAuthCookie(token)

    return successResponse({ user }, 201)
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('Internal server error', 500)
  }
}
