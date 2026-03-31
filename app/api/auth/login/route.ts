import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        employeeNumber: true,
        position: true,
        department: true,
        status: true,
        workCategory: true,
        workLocation: true,
        photoUrl: true,
      }
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return errorResponse('Invalid email or password', 401)
    }

    if (user.status === 'INACTIVE') {
      return errorResponse('Account is deactivated', 403)
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    await setAuthCookie(token)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user

    return successResponse({ user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
