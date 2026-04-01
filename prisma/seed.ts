import 'dotenv/config'
import { PrismaClient, Role, UserStatus, WorkCategory, TimeEntryType, ReportStatus } from '@prisma/client/index'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Create Organization ──────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: 'Habitat for Humanity',
    }
  })
  console.log('Organization created:', org.name)

  // ─── Create Manager ───────────────────────────────────
  const managerPassword = await bcrypt.hash('manager123', 12)
  const manager = await prisma.user.create({
    data: {
      email: 'sarah.wilson@habitat.org',
      passwordHash: managerPassword,
      name: 'Sarah Wilson',
      role: Role.MANAGER,
      employeeNumber: 'EMP-2024-000',
      position: 'Operations Manager',
      department: 'Operations',
      phone: '+1 (555) 000-0001',
      status: UserStatus.ACTIVE,
      workCategory: WorkCategory.HYBRID,
      workLocation: 'New York, NY',
      organizationId: org.id,
      joinDate: new Date('2023-06-01'),
    }
  })
  console.log('Manager created:', manager.email, '/ password: manager123')

  // ─── Create Employees ─────────────────────────────────
  const employeePassword = await bcrypt.hash('employee123', 12)

  const employeesData = [
    {
      email: 'alex.rivera@habitat.org',
      name: 'Alex Rivera',
      employeeNumber: 'EMP-2024-001',
      position: 'Field Coordinator',
      department: 'Operations',
      phone: '+1 (555) 123-4567',
      workCategory: WorkCategory.HYBRID,
      workLocation: 'New York, NY',
      joinDate: new Date('2024-01-15'),
    },
    {
      email: 'marcus.chen@habitat.org',
      name: 'Marcus Chen',
      employeeNumber: 'EMP-2024-002',
      position: 'Site Engineer',
      department: 'Construction',
      phone: '+1 (555) 234-5678',
      workCategory: WorkCategory.LOCATION,
      workLocation: 'San Francisco, CA',
      joinDate: new Date('2024-02-01'),
    },
    {
      email: 'jordan.smith@habitat.org',
      name: 'Jordan Smith',
      employeeNumber: 'EMP-2024-003',
      position: 'Community Manager',
      department: 'Outreach',
      phone: '+1 (555) 345-6789',
      workCategory: WorkCategory.LOCATION,
      workLocation: 'Seattle, WA',
      joinDate: new Date('2024-02-15'),
    },
    {
      email: 'david.kalu@habitat.org',
      name: 'David Kalu',
      employeeNumber: 'EMP-2024-004',
      position: 'Field Supervisor',
      department: 'Operations',
      phone: '+1 (416) 555-0123',
      workCategory: WorkCategory.REMOTE,
      workLocation: 'Toronto, ON',
      joinDate: new Date('2024-03-01'),
    },
    {
      email: 'elena.rossi@habitat.org',
      name: 'Elena Rossi',
      employeeNumber: 'EMP-2024-005',
      position: 'Project Lead',
      department: 'Construction',
      phone: '+1 (555) 456-7890',
      workCategory: WorkCategory.HOME_BASED,
      workLocation: 'Miami, FL',
      joinDate: new Date('2024-01-20'),
    },
    {
      email: 'casey.johnson@habitat.org',
      name: 'Casey Johnson',
      employeeNumber: 'EMP-2024-006',
      position: 'Volunteer Coordinator',
      department: 'Outreach',
      phone: '+1 (555) 567-8901',
      workCategory: WorkCategory.HYBRID,
      workLocation: 'Austin, TX',
      joinDate: new Date('2024-04-01'),
    },
    {
      email: 'morgan.lee@habitat.org',
      name: 'Morgan Lee',
      employeeNumber: 'EMP-2024-007',
      position: 'Materials Manager',
      department: 'Logistics',
      phone: '+1 (555) 678-9012',
      workCategory: WorkCategory.LOCATION,
      workLocation: 'Chicago, IL',
      joinDate: new Date('2024-03-15'),
    },
  ]

  const employees = []
  for (const data of employeesData) {
    const emp = await prisma.user.create({
      data: {
        ...data,
        passwordHash: employeePassword,
        role: Role.EMPLOYEE,
        status: UserStatus.ACTIVE,
        organizationId: org.id,
        supervisorId: manager.id,
      }
    })
    employees.push(emp)
    console.log(`Employee created: ${emp.email} / password: employee123`)
  }

  // ─── Create Time Entries (last 2 weeks) ───────────────
  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const locations = [
    { lat: 40.7128, lng: -74.006, name: 'New York, NY' },
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
    { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
    { lat: 43.6532, lng: -79.3832, name: 'Toronto, ON' },
    { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
    { lat: 30.2672, lng: -97.7431, name: 'Austin, TX' },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
  ]

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const loc = locations[i % locations.length]

    // Create entries for weekdays in the last 2 weeks
    for (let d = 0; d < 14; d++) {
      const date = new Date(twoWeeksAgo.getTime() + d * 24 * 60 * 60 * 1000)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends

      // Clock in: 8:00 AM + random offset
      const clockIn = new Date(date)
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0)

      // Clock out: 4:30 PM + random offset
      const clockOut = new Date(date)
      clockOut.setHours(16 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45), 0, 0)

      await prisma.timeEntry.createMany({
        data: [
          {
            userId: emp.id,
            type: TimeEntryType.CLOCK_IN,
            timestamp: clockIn,
            latitude: loc.lat + (Math.random() - 0.5) * 0.01,
            longitude: loc.lng + (Math.random() - 0.5) * 0.01,
            locationName: loc.name,
          },
          {
            userId: emp.id,
            type: TimeEntryType.CLOCK_OUT,
            timestamp: clockOut,
            latitude: loc.lat + (Math.random() - 0.5) * 0.01,
            longitude: loc.lng + (Math.random() - 0.5) * 0.01,
            locationName: loc.name,
          },
        ]
      })
    }
  }
  console.log('Time entries created for all employees (2 weeks)')

  // ─── Create Biweekly Reports ──────────────────────────
  const periodStart = new Date(twoWeeksAgo)
  periodStart.setHours(0, 0, 0, 0)
  const periodEnd = new Date(now)
  periodEnd.setHours(23, 59, 59, 999)

  const reportStatuses: ReportStatus[] = [
    ReportStatus.PENDING,
    ReportStatus.APPROVED,
    ReportStatus.FLAGGED,
    ReportStatus.APPROVED,
    ReportStatus.PENDING,
    ReportStatus.APPROVED,
    ReportStatus.PENDING,
  ]

  const workTagOptions = [
    ['fieldwork', 'client-visit'],
    ['construction', 'site-inspection'],
    ['community-outreach', 'training'],
    ['remote-work', 'management'],
    ['project-management', 'home-office'],
    ['volunteer-coordination', 'events'],
    ['logistics', 'inventory'],
  ]

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const status = reportStatuses[i]
    const tags = workTagOptions[i]

    // Calculate hours from time entries
    const entries = await prisma.timeEntry.findMany({
      where: { userId: emp.id },
      orderBy: { timestamp: 'asc' },
    })

    let totalHours = 0
    let daysPresent = 0
    const dailyData: { date: Date; hours: number; timeIn: string; timeOut: string; location: string }[] = []

    // Pair clock-in with clock-out
    for (let j = 0; j < entries.length - 1; j += 2) {
      const clockIn = entries[j]
      const clockOut = entries[j + 1]
      if (clockIn.type === TimeEntryType.CLOCK_IN && clockOut.type === TimeEntryType.CLOCK_OUT) {
        const hours = (clockOut.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60)
        totalHours += hours
        daysPresent++
        dailyData.push({
          date: clockIn.timestamp,
          hours: Math.round(hours * 10) / 10,
          timeIn: clockIn.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timeOut: clockOut.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          location: clockIn.locationName,
        })
      }
    }

    const report = await prisma.report.create({
      data: {
        userId: emp.id,
        periodStart,
        periodEnd,
        totalHours: Math.round(totalHours * 10) / 10,
        daysPresent,
        status,
        workTags: tags,
        reviewedById: status === ReportStatus.APPROVED ? manager.id : undefined,
        days: {
          create: dailyData.map((day, idx) => ({
            date: day.date,
            dayLabel: dayLabels[idx % dayLabels.length],
            hours: day.hours,
            timeIn: day.timeIn,
            timeOut: day.timeOut,
            locationName: day.location,
            isApproved: status === ReportStatus.APPROVED,
          }))
        }
      }
    })
    console.log(`✅ Report created for ${emp.name}: ${report.totalHours}h (${status})`)
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('  Manager:  sarah.wilson@habitat.org  / manager123')
  console.log('  Employee: alex.rivera@habitat.org   / employee123')
  console.log('  (All employees share password: employee123)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
