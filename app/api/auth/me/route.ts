import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }
    return successResponse({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return errorResponse('Internal server error', 500)
  }
}
