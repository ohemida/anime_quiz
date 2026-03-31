'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface AnimeData {
  mal_id: number
  title: string
  title_english?: string
  images: { jpg: { large_image_url?: string; image_url: string } }
}

export default function InfinitePage() {
  const { data: session } = useSession()
  const [round, setRound] = useState(1)
  const [anime, setAnime] = useState<AnimeData | null>(null)
  const [guess, setGuess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [revealPercent, setRevealPercent] = useState(10)
  const [gameActive, setGameActive] = useState(true)
  const [consecutive, setConsecutive] = useState(0)

  const getDifficultyReveal = useCallback(() => {
    if (round <= 5) return 30
    if (round <= 10) return 20
    if (round <= 20) return 15
    return 10
  }, [round])

  const fetchAnime = useCallback(async () => {
    setLoading(true)
    setGuess('')
    setHintsUsed(0)
    setRevealPercent(getDifficultyReveal())
    setSubmitted(false)
    setFeedback('')
    try {
      const res = await fetch('/api/anime/random')
      const data = await res.json()
      setAnime(data)
    } catch {
      // silently fail, user can retry by going to next round
    }
    setLoading(false)
  }, [getDifficultyReveal])

  useEffect(() => { fetchAnime() }, [fetchAnime])

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  const getMultiplier = () => {
    if (round <= 5) return 1
    if (round <= 10) return 1.5
    if (round <= 20) return 2
    return 3
  }

  const calcScore = () => {
    const base = hintsUsed === 0 ? 1000 : hintsUsed === 1 ? 750 : 500
    return Math.round(base * getMultiplier())
  }

  const handleSubmit = () => {
    if (!anime || submitted) return
    const titles = [anime.title, anime.title_english].filter(Boolean).map(t => normalize(t!))
    const correct = titles.includes(normalize(guess))
    if (correct) {
      const pts = calcScore()
      setTotalScore(prev => prev + pts)
      setStreak(prev => prev + 1)
      setConsecutive(prev => prev + 1)
      setFeedback(`✅ Correct! +${pts} pts (×${getMultiplier()} multiplier)`)
    } else {
      setStreak(0)
      setConsecutive(0)
      setFeedback(`❌ Wrong! The anime was: ${anime.title_english || anime.title}`)
    }
    setSubmitted(true)
  }

  const handleNext = () => {
    setRound(r => r + 1)
    fetchAnime()
  }

  const handleQuit = async () => {
    setGameActive(false)
    if (session && totalScore > 0) {
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'infinite', score: totalScore, maxScore: totalScore, hintsUsed, rounds: round - 1 }),
      })
    }
  }

  if (!gameActive) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold neon-text">Session Over!</h1>
        <div className="bg-gray-900 border border-purple-800 rounded-xl p-6">
          <p className="text-2xl font-bold text-white mb-2">{totalScore.toLocaleString()} pts</p>
          <p className="text-gray-400">Rounds: {round - 1} | Best streak: {streak}</p>
        </div>
        <button onClick={() => { setRound(1); setTotalScore(0); setStreak(0); setConsecutive(0); setGameActive(true); fetchAnime() }} className="btn-primary px-8 py-3">
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">♾️ Infinite Mode</h1>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Round {round} • ×{getMultiplier()}</p>
          <p className="text-purple-400 font-bold">{totalScore.toLocaleString()} pts</p>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="bg-gray-800 rounded-full px-3 py-1 text-yellow-300">🔥 Streak: {consecutive}</div>
        <div className="bg-gray-800 rounded-full px-3 py-1 text-green-300">Round: {round}</div>
        <div className="bg-gray-800 rounded-full px-3 py-1 text-blue-300">
          Difficulty: {round <= 5 ? 'Easy' : round <= 10 ? 'Medium' : round <= 20 ? 'Hard' : 'Expert'}
        </div>
      </div>
      {loading ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl h-64 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse">Loading...</div>
        </div>
      ) : anime ? (
        <div className="bg-gray-900 border border-purple-800 rounded-xl overflow-hidden">
          <div className="relative" style={{ height: '300px', overflow: 'hidden' }}>
            <div style={{ clipPath: `inset(0 0 ${100 - revealPercent}% 0)`, transition: 'clip-path 0.5s ease' }}>
              <Image
                src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                alt="Anime"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          </div>
        </div>
      ) : null}
      {!submitted && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={guess} onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="input-field" placeholder="Enter anime title..." />
            <button onClick={handleSubmit} className="btn-primary px-6">Submit</button>
          </div>
          {hintsUsed < 2 && (
            <button onClick={() => { setHintsUsed(h => h + 1); setRevealPercent(p => Math.min(p + 20, 80)) }} className="btn-secondary text-sm">
              💡 Hint ({hintsUsed + 1}/2) - Reveal more
            </button>
          )}
        </div>
      )}
      {feedback && (
        <div className={`rounded-xl p-4 text-center font-semibold ${feedback.startsWith('✅') ? 'bg-green-900/50 border border-green-600 text-green-300' : 'bg-red-900/50 border border-red-600 text-red-300'}`}>
          {feedback}
        </div>
      )}
      {submitted && (
        <div className="flex gap-3">
          <button onClick={handleNext} className="btn-primary flex-1 py-3">Next Round →</button>
          <button onClick={handleQuit} className="btn-secondary py-3 px-6">Quit & Save</button>
        </div>
      )}
    </div>
  )
}
