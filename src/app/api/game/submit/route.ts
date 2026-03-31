import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = (session.user as { id?: string }).id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { mode, score, maxScore, hintsUsed, rounds } = await req.json()

    const gameSession = await prisma.gameSession.create({
      data: { userId, mode, score, maxScore, hintsUsed, rounds },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { totalScore: { increment: score } },
    })

    return NextResponse.json(gameSession)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
