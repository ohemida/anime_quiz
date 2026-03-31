export interface AnimeData {
  mal_id: number
  title: string
  title_english?: string
  images: {
    jpg: {
      image_url: string
      large_image_url?: string
    }
  }
  score?: number
  genres?: Array<{ name: string }>
  year?: number
  type?: string
  episodes?: number
  synopsis?: string
  status?: string
}

export interface CharacterData {
  character: {
    mal_id: number
    name: string
    images: {
      jpg: {
        image_url: string
      }
    }
  }
  role: string
}

const JIKAN_BASE = 'https://api.jikan.moe/v4'

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      return res
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, 500))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function getTopAnime(page = 1): Promise<AnimeData[]> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/top/anime?page=${page}&limit=25`)
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export async function getRandomAnime(): Promise<AnimeData | null> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/random/anime`)
  if (!res.ok) return null
  const data = await res.json()
  return data.data || null
}

export async function getAnimeById(id: number): Promise<AnimeData | null> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/anime/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.data || null
}

export async function getAnimeCharacters(animeId: number): Promise<CharacterData[]> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/anime/${animeId}/characters`)
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export async function getAnimeThemes(animeId: number): Promise<{ openings: string[], endings: string[] }> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/anime/${animeId}/themes`)
  if (!res.ok) return { openings: [], endings: [] }
  const data = await res.json()
  return {
    openings: data.data?.openings || [],
    endings: data.data?.endings || []
  }
}

export async function searchAnime(query: string): Promise<AnimeData[]> {
  const res = await fetchWithRetry(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=10`)
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export async function getDailyAnime(): Promise<AnimeData | null> {
  // Deterministic daily based on date - use a fixed list of popular anime IDs
  const popularIds = [1, 5, 6, 16, 20, 21, 30, 32, 33, 38, 44, 74, 136, 199, 227, 235, 269, 328, 430, 431, 437, 457, 552, 849, 918, 1535, 1575, 2001, 2025, 2904, 3588, 5114, 6547, 7054, 9253, 10620, 10740, 11061, 11757, 13601, 14719, 15417, 16498, 19815, 19817, 24765, 31240, 37779, 40028, 48583]
  const today = new Date()
  const dateStr = `${today.getUTCFullYear()}${today.getUTCMonth()}${today.getUTCDate()}`
  const index = parseInt(dateStr) % popularIds.length
  return getAnimeById(popularIds[index])
}
