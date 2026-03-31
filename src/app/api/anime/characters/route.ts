import { NextRequest, NextResponse } from 'next/server'
import { getTopAnime, getAnimeCharacters } from '@/lib/jikan'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const animeId = searchParams.get('animeId')
    if (!animeId) {
      const list = await getTopAnime(1)
      const anime = list[Math.floor(Math.random() * list.length)]
      const chars = await getAnimeCharacters(anime.mal_id)
      const mainChars = chars.filter(c => c.role === 'Main').slice(0, 4)
      return NextResponse.json({ anime, characters: mainChars })
    }
    const chars = await getAnimeCharacters(parseInt(animeId))
    return NextResponse.json({ characters: chars })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}
