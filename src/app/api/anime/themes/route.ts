import { NextRequest, NextResponse } from 'next/server'
import { getTopAnime, getAnimeThemes } from '@/lib/jikan'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'opening'
    const page = Math.floor(Math.random() * 3) + 1
    const list = await getTopAnime(page)

    for (const anime of list) {
      const themes = await getAnimeThemes(anime.mal_id)
      const themeList = type === 'opening' ? themes.openings : themes.endings
      if (themeList.length > 0) {
        return NextResponse.json({ anime, themes: themeList, type })
      }
    }
    return NextResponse.json({ error: 'No themes found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}
