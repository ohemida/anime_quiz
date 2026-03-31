'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { calcOpeningRoundScore } from '@/lib/scoring'

interface ThemeData {
  anime: { mal_id: number; title: string; title_english?: string; images: { jpg: { image_url: string } } }
  themes: string[]
  type: string
}

const ROUNDS = 3

export default function GuessOpeningPage() {
  const { data: session } = useSession()
  const [round, setRound] = useState(1)
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [guess, setGuess] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  const fetchTheme = useCallback(async () => {
    setLoading(true)
    setGuess('')
    setHintsUsed(0)
    setShowHint(false)
    setSubmitted(false)
    setFeedback('')
    try {
      const res = await fetch('/api/anime/themes?type=opening')
      const data = await res.json()
      setThemeData(data)
    } catch {
      setFeedback('Failed to load theme data.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTheme() }, [fetchTheme])

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  const handleSubmit = () => {
    if (!themeData || submitted) return
    const titles = [themeData.anime.title, themeData.anime.title_english].filter(Boolean).map(t => normalize(t!))
    const correct = titles.includes(normalize(guess))
    const score = correct ? calcOpeningRoundScore(hintsUsed) : 0
    setFeedback(correct ? `✅ Correct! +${score} pts` : `❌ Wrong! The anime was: ${themeData.anime.title_english || themeData.anime.title}`)
    setRoundScores(prev => [...prev, score])
    setTotalScore(prev => prev + score)
    setSubmitted(true)
  }

  const handleNext = async () => {
    if (round >= ROUNDS) {
      setGameOver(true)
      if (session) {
        const total = roundScores.reduce((a, b) => a + b, 0)
        await fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'guess-opening', score: total, maxScore: 15000, hintsUsed: roundScores.filter(s => s === 2500).length, rounds: ROUNDS }),
        })
      }
    } else {
      setRound(r => r + 1)
      fetchTheme()
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
        <button onClick={() => { setRound(1); setTotalScore(0); setRoundScores([]); setGameOver(false); fetchTheme() }} className="btn-primary px-8 py-3">Play Again</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">🎵 Guess the Opening</h1>
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
        <div className="text-center text-gray-400 animate-pulse py-12">Loading theme...</div>
      ) : themeData ? (
        <div className="bg-gray-900 border border-purple-800 rounded-xl p-6 space-y-4">
          <p className="text-gray-400 text-sm">Which anime does this opening theme belong to?</p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            {themeData.themes.slice(0, 2).map((theme, i) => (
              <p key={i} className="text-white font-mono text-lg">🎵 {theme}</p>
            ))}
          </div>
          {showHint && (
            <div className="relative h-40 rounded-lg overflow-hidden">
              <Image
                src={themeData.anime.images.jpg.image_url}
                alt="Anime hint"
                fill
                style={{ objectFit: 'cover', filter: 'blur(12px)' }}
                sizes="(max-width: 768px) 100vw, 672px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white bg-black/50 px-3 py-1 rounded text-sm">Blurred anime cover</p>
              </div>
            </div>
          )}
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
          {!showHint && (
            <button onClick={() => { setShowHint(true); setHintsUsed(1) }} className="btn-secondary text-sm">
              💡 Hint (max 2,500 pts)
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
        <button onClick={handleNext} className="btn-primary w-full py-3">
          {round >= ROUNDS ? 'See Results' : 'Next Round →'}
        </button>
      )}
    </div>
  )
}
