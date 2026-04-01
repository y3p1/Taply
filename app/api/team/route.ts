import { prisma } from '@/lib/db'
import { requireRole, successResponse, errorResponse } from '@/lib/api-utils'
import { TimeEntryType } from '@prisma/client/index'

// GET /api/team — Team member locations (MANAGER only)
export async function GET() {
  try {
    const { user, error } = await requireRole(['MANAGER'])
    if (error) return error

    const members = await prisma.user.findMany({
      where: { organizationId: user!.organizationId },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
        workLocation: true,
        status: true,
        timeEntries: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            type: true,
            timestamp: true,
            latitude: true,
            longitude: true,
            locationName: true,
          }
        }
      }
    })

    const teamData = members.map(member => {
      const lastEntry = member.timeEntries[0]
      const isActive = lastEntry?.type === TimeEntryType.CLOCK_IN
      const lastSeen = lastEntry ? getRelativeTime(lastEntry.timestamp) : null

      return {
        id: member.id,
        name: member.name,
        photoUrl: member.photoUrl,
        position: member.position,
        status: isActive ? 'active' : 'inactive',
        location: lastEntry?.locationName || member.workLocation || 'Unknown',
        coords: lastEntry
          ? { lat: lastEntry.latitude, lng: lastEntry.longitude }
          : null,
        lastSeen: isActive ? null : lastSeen,
      }
    })

    const activeCount = teamData.filter(m => m.status === 'active').length

    return successResponse({ members: teamData, activeCount, totalCount: teamData.length })
  } catch (error) {
    console.error('Team error:', error)
    return errorResponse('Internal server error', 500)
  }
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
