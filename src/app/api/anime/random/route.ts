import { NextResponse } from 'next/server'
import { getTopAnime } from '@/lib/jikan'

export async function GET() {
  try {
    const page = Math.floor(Math.random() * 4) + 1
    const list = await getTopAnime(page)
    if (!list.length) return NextResponse.json({ error: 'No anime found' }, { status: 404 })
    const anime = list[Math.floor(Math.random() * list.length)]
    return NextResponse.json(anime)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 })
  }
}
