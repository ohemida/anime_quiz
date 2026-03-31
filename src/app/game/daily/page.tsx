'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface AnimeData {
  mal_id: number
  title: string
  title_english?: string
  images: { jpg: { image_url: string; large_image_url?: string } }
  genres?: Array<{ name: string }>
  year?: number
  type?: string
  episodes?: number
  score?: number
  status?: string
}

export default function DailyPage() {
  const { data: session } = useSession()
  const [anime, setAnime] = useState<AnimeData | null>(null)
  const [participation, setParticipation] = useState<{ completed: boolean; guesses: number; score: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [guess, setGuess] = useState('')
  const [guesses, setGuesses] = useState<Array<{ text: string; correct: boolean }>>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHints, setShowHints] = useState<number[]>([])

  useEffect(() => {
    fetch('/api/daily')
      .then(r => r.json())
      .then(data => {
        setAnime(data.anime)
        if (data.participation) {
          setParticipation(data.participation)
          setGameOver(true)
          setWon(data.participation.completed)
          setScore(data.participation.score)
        }
        setLoading(false)
      })
  }, [])

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  const calcScore = (guessCount: number, hints: number, solved: boolean) => {
    if (!solved) return 0
    const base = Math.max(0, 10000 - (guessCount - 1) * 400)
    const penalty = hints * 500
    return Math.max(0, base - penalty)
  }

  const handleGuess = async () => {
    if (!anime || gameOver || !guess.trim()) return
    const titles = [anime.title, anime.title_english].filter(Boolean).map(t => normalize(t!))
    const correct = titles.includes(normalize(guess))
    const newGuesses = [...guesses, { text: guess, correct }]
    setGuesses(newGuesses)
    setGuess('')

    if (correct || newGuesses.length >= 25) {
      const finalScore = calcScore(newGuesses.length, hintsUsed, correct)
      setScore(finalScore)
      setWon(correct)
      setGameOver(true)
      if (session) {
        await fetch('/api/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: finalScore, guesses: newGuesses.length, completed: correct }),
        })
      }
    }

    if (newGuesses.length === 13 || newGuesses.length === 18 || newGuesses.length === 22) {
      setShowHints(prev => [...prev, newGuesses.length])
      setHintsUsed(h => h + 1)
    }
  }

  const getHintContent = (triggerGuess: number) => {
    if (!anime) return null
    if (triggerGuess === 13) return `Genre: ${anime.genres?.map(g => g.name).join(', ') || 'Unknown'}`
    if (triggerGuess === 18) return `Type: ${anime.type || '?'} | Episodes: ${anime.episodes || '?'} | Year: ${anime.year || '?'}`
    if (triggerGuess === 22) return `First letter: ${(anime.title_english || anime.title)[0].toUpperCase()}`
    return null
  }

  if (loading) return <div className="text-center text-gray-400 py-12 animate-pulse">Loading daily challenge...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">📅 Daily Challenge</h1>
        <div className="text-right">
          <p className="text-gray-400 text-sm">{guesses.length}/25 guesses</p>
          {session && <p className="text-purple-400 text-sm">{score.toLocaleString()} pts</p>}
        </div>
      </div>

      {!session && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 text-yellow-300 text-sm">
          ⚠️ Sign in to save your progress and earn Golden Tickets!
        </div>
      )}

      {participation ? (
        <div className={`rounded-xl p-6 text-center ${participation.completed ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'}`}>
          <p className="text-xl font-bold text-white mb-2">
            {participation.completed ? '✅ Already completed today!' : '❌ Already played today'}
          </p>
          <p className="text-gray-400">Score: {participation.score.toLocaleString()} pts in {participation.guesses} guesses</p>
        </div>
      ) : gameOver ? (
        <div className={`rounded-xl p-6 text-center ${won ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'}`}>
          <p className="text-3xl font-bold text-white mb-2">{won ? '🎉 Correct!' : '💀 Game Over'}</p>
          <p className="text-gray-400 mb-2">The anime was: <span className="text-white font-bold">{anime?.title_english || anime?.title}</span></p>
          {won && (
            <>
              <p className="text-2xl text-purple-400 font-bold">{score.toLocaleString()} pts</p>
              {session && <p className="text-yellow-400 mt-2">🎟️ Golden Ticket earned!</p>}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="bg-gray-900 border border-purple-800 rounded-xl overflow-hidden">
            {showHints.length > 0 && anime && (
              <div className="relative h-40">
                <Image
                  src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                  alt="Hint image"
                  fill
                  style={{ objectFit: 'cover', filter: `blur(${Math.max(0, 20 - showHints.length * 5)}px)` }}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              {showHints.map(n => (
                <div key={n} className="bg-gray-800 rounded-lg p-3 text-sm text-yellow-300">
                  💡 Clue (after guess {n}): {getHintContent(n)}
                </div>
              ))}
              {showHints.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Clues unlock at guess 13, 18, and 22</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input type="text" value={guess} onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              className="input-field" placeholder="Enter anime title..." />
            <button onClick={handleGuess} className="btn-primary px-6">Guess</button>
          </div>

          {guesses.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...guesses].reverse().map((g, i) => (
                <div key={i} className={`p-2 rounded-lg text-sm flex items-center gap-2 ${g.correct ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
                  {g.correct ? '✅' : '❌'} {g.text}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
