export const MAX_SCORES = {
  GUESS_ANIME: 30000,
  GUESS_CHARACTERS: 30000,
  GUESS_OPENING: 15000,
  GUESS_ENDING: 15000,
  DAILY: 10000,
  TOTAL: 100000,
}

export const ROUND_SCORES = {
  GUESS_ANIME: 10000,
  GUESS_CHARACTERS: 10000,
  GUESS_OPENING: 5000,
  GUESS_ENDING: 5000,
}

export const HINT_SCORES = {
  NO_HINT: 10000,
  HINT_1: 7500,
  HINT_2: 5000,
  HINT_3: 2500,
  FAILED: 0,
}

export function calcAnimeRoundScore(hintsUsed: number): number {
  switch (hintsUsed) {
    case 0: return 10000
    case 1: return 7500
    case 2: return 5000
    case 3: return 2500
    default: return 0
  }
}

export function calcCharacterRoundScore(correctCount: number, totalCount: number = 8): number {
  return Math.round((correctCount / totalCount) * 10000)
}

export function calcOpeningRoundScore(hintsUsed: number): number {
  return hintsUsed === 0 ? 5000 : 2500
}

export function calcEndingRoundScore(hintsUsed: number): number {
  return hintsUsed === 0 ? 5000 : 2500
}

export function calcDailyScore(guessCount: number, hintsUsed: number, solved: boolean): number {
  if (!solved) return 0
  const baseScore = Math.max(0, 10000 - (guessCount - 1) * 400)
  const hintPenalty = hintsUsed * 500
  return Math.max(0, baseScore - hintPenalty)
}
