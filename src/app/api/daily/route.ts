import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDailyAnime } from '@/lib/jikan'

// Returns the current date string in CEST (UTC+2).
// Note: This uses a fixed UTC+2 offset. During Central European Winter Time (CET, UTC+1),
// dates will be shifted by one hour. For production, consider using a timezone library
// (e.g. 'Intl.DateTimeFormat' with 'Europe/Berlin') for DST-aware handling.
function getCestDateString(): string {
  const now = new Date()
  const cestOffsetMs = 2 * 60 * 60 * 1000
  const mestTime = new Date(now.getTime() + cestOffsetMs)
  return mestTime.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const anime = await getDailyAnime()
    if (!anime) return NextResponse.json({ error: 'No daily anime' }, { status: 404 })

    const session = await getServerSession(authOptions)
    let participation = null

    if (session?.user) {
      const userId = (session.user as { id?: string }).id
      if (userId) {
        const today = getCestDateString()
        participation = await prisma.dailyParticipation.findUnique({
          where: { userId_date: { userId, date: today } },
        })
      }
    }

    return NextResponse.json({ anime, participation })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as { id?: string }).id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { score, guesses, completed } = await req.json()
    const today = getCestDateString()

    const existing = await prisma.dailyParticipation.findUnique({
      where: { userId_date: { userId, date: today } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already played today' }, { status: 409 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let newStreak = user.currentStreak
    let wonTicket = false

    if (completed) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const cestOffsetMs = 2 * 60 * 60 * 1000
      const mestYesterday = new Date(yesterday.getTime() + cestOffsetMs)
      const yesterdayStr = mestYesterday.toISOString().split('T')[0]

      if (user.lastDailyDate === yesterdayStr) {
        newStreak = user.currentStreak + 1
      } else {
        newStreak = 1
      }
      wonTicket = true
    }

    const participation = await prisma.dailyParticipation.create({
      data: { userId, date: today, score, guesses, completed, wonTicket },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalScore: { increment: score },
        goldenTickets: wonTicket ? { increment: 1 } : undefined,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastDailyDate: completed ? today : user.lastDailyDate,
      },
    })

    return NextResponse.json({ participation, streak: newStreak, wonTicket })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
