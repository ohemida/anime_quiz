'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { calcAnimeRoundScore } from '@/lib/scoring'

interface AnimeData {
  mal_id: number
  title: string
  title_english?: string
  images: { jpg: { large_image_url?: string; image_url: string } }
}

const ROUNDS = 3
const HINTS = [
  { label: 'Show 25% of image', reveal: 25 },
  { label: 'Show 50% of image', reveal: 50 },
  { label: 'Show first letter of title', reveal: 75 },
]

export default function GuessAnimePage() {
  const { data: session } = useSession()
  const [round, setRound] = useState(1)
  const [anime, setAnime] = useState<AnimeData | null>(null)
  const [guess, setGuess] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [revealPercent, setRevealPercent] = useState(10)
  const [, setRoundScore] = useState<number | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const fetchAnime = useCallback(async () => {
    setLoading(true)
    setGuess('')
    setHintsUsed(0)
    setRevealPercent(10)
    setRoundScore(null)
    setFeedback('')
    setSubmitted(false)
    try {
      const res = await fetch('/api/anime/random')
      const data = await res.json()
      setAnime(data)
    } catch {
      setFeedback('Failed to load anime. Please try again.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAnime() }, [fetchAnime])

  const handleHint = () => {
    if (hintsUsed >= HINTS.length) return
    setHintsUsed(h => h + 1)
    setRevealPercent(prev => Math.min(prev + 30, 100))
  }

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  const handleSubmit = () => {
    if (!anime || submitted) return
    const titles = [anime.title, anime.title_english].filter(Boolean).map(t => normalize(t!))
    const correct = titles.includes(normalize(guess))
    const score = correct ? calcAnimeRoundScore(hintsUsed) : 0
    setRoundScore(score)
    setFeedback(correct ? `✅ Correct! +${score} points` : `❌ Wrong! The answer was: ${anime.title_english || anime.title}`)
    setRoundScores(prev => [...prev, score])
    setTotalScore(prev => prev + score)
    setSubmitted(true)
  }

  const handleSkip = () => {
    if (!anime || submitted) return
    setRoundScore(0)
    setFeedback(`⏭️ Skipped! The answer was: ${anime.title_english || anime.title}`)
    setRoundScores(prev => [...prev, 0])
    setSubmitted(true)
  }

  const handleNext = async () => {
    if (round >= ROUNDS) {
      setGameOver(true)
      if (session) {
        await fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'guess-anime', score: totalScore, maxScore: 30000, hintsUsed: roundScores.filter(s => s < 10000 && s > 0).length, rounds: ROUNDS }),
        })
      }
    } else {
      setRound(r => r + 1)
      fetchAnime()
    }
  }

  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold neon-text">Game Over!</h1>
        <div className="bg-gray-900 border border-purple-800 rounded-xl p-6">
          <p className="text-2xl font-bold text-white mb-4">Total Score: {totalScore.toLocaleString()}</p>
          {roundScores.map((s, i) => (
            <p key={i} className="text-gray-400">Round {i+1}: {s.toLocaleString()} pts</p>
          ))}
        </div>
        <button onClick={() => { setRound(1); setTotalScore(0); setRoundScores([]); setGameOver(false); fetchAnime() }} className="btn-primary px-8 py-3">
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">🎌 Guess the Anime</h1>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Round {round}/{ROUNDS}</p>
          <p className="text-purple-400 font-bold">{totalScore.toLocaleString()} pts</p>
        </div>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <div key={i} className={`h-1 flex-1 rounded ${i < round - 1 ? 'bg-purple-600' : i === round - 1 ? 'bg-purple-400' : 'bg-gray-700'}`} />
        ))}
      </div>

      {loading ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl h-64 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse">Loading anime...</div>
        </div>
      ) : anime ? (
        <div className="bg-gray-900 border border-purple-800 rounded-xl overflow-hidden">
          <div className="relative" style={{ height: '320px', overflow: 'hidden' }}>
            <div style={{ clipPath: `inset(0 0 ${100 - revealPercent}% 0)`, transition: 'clip-path 0.5s ease' }}>
              <Image
                src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                alt="Anime cover"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: `${revealPercent}%` }}>
              <div className="bg-gray-900/80 backdrop-blur px-4 py-2 rounded text-gray-400 text-sm">
                {revealPercent}% revealed
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!submitted && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="input-field"
              placeholder="Enter anime title..."
            />
            <button onClick={handleSubmit} className="btn-primary px-6">Submit</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {hintsUsed < HINTS.length && !submitted && (
              <button onClick={handleHint} className="btn-secondary text-sm">
                💡 Hint {hintsUsed + 1} ({[7500, 5000, 2500][hintsUsed]} pts max)
              </button>
            )}
            <button onClick={handleSkip} className="bg-red-900 hover:bg-red-800 text-white text-sm py-2 px-4 rounded-lg">
              Skip (0 pts)
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`rounded-xl p-4 text-center font-semibold ${feedback.startsWith('✅') ? 'bg-green-900/50 border border-green-600 text-green-300' : 'bg-red-900/50 border border-red-600 text-red-300'}`}>
          {feedback}
        </div>
      )}

      {submitted && (
        <button onClick={handleNext} className="btn-primary w-full py-3">
          {round >= ROUNDS ? 'See Results' : 'Next Round →'}
        </button>
      )}
    </div>
  )
}
