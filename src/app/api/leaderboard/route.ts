import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { totalScore: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        totalScore: true,
        currentStreak: true,
        longestStreak: true,
        goldenTickets: true,
        _count: { select: { gameSessions: true } },
      },
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
