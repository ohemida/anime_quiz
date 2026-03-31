'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { calcCharacterRoundScore } from '@/lib/scoring'

interface Character {
  character: {
    mal_id: number
    name: string
    images: { jpg: { image_url: string } }
  }
  role: string
}

interface RoundData {
  anime: { mal_id: number; title: string; title_english?: string }
  characters: Character[]
}

const ROUNDS = 3

export default function GuessCharactersPage() {
  const { data: session } = useSession()
  const [round, setRound] = useState(1)
  const [roundData, setRoundData] = useState<RoundData | null>(null)
  const [inputs, setInputs] = useState<Array<{ charName: string; animeName: string }>>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Array<{ charCorrect: boolean; animeCorrect: boolean }>>([])
  const [roundScore, setRoundScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [allRoundScores, setAllRoundScores] = useState<number[]>([])
  const [gameOver, setGameOver] = useState(false)

  const fetchRound = useCallback(async () => {
    setLoading(true)
    setSubmitted(false)
    setResults([])
    setRoundScore(0)
    try {
      const res = await fetch('/api/anime/characters')
      const data = await res.json()
      const chars = (data.characters || []).filter((c: Character) => c.role === 'Main').slice(0, 4)
      setRoundData({ anime: data.anime, characters: chars })
      setInputs(chars.map(() => ({ charName: '', animeName: '' })))
    } catch {
      setLoading(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRound() }, [fetchRound])

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

  const handleSubmit = () => {
    if (!roundData) return
    const animeTitles = [roundData.anime.title, roundData.anime.title_english].filter(Boolean).map(t => normalize(t!))
    let correct = 0
    const newResults = inputs.map((input, i) => {
      const char = roundData.characters[i]
      const charCorrect = normalize(input.charName) === normalize(char.character.name)
      const animeCorrect = animeTitles.includes(normalize(input.animeName))
      if (charCorrect) correct++
      if (animeCorrect) correct++
      return { charCorrect, animeCorrect }
    })
    setResults(newResults)
    const score = calcCharacterRoundScore(correct, inputs.length * 2)
    setRoundScore(score)
    setTotalScore(prev => prev + score)
    setAllRoundScores(prev => [...prev, score])
    setSubmitted(true)
  }

  const handleNext = async () => {
    if (round >= ROUNDS) {
      setGameOver(true)
      if (session) {
        await fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'guess-characters', score: totalScore, maxScore: 30000, hintsUsed: 0, rounds: ROUNDS }),
        })
      }
    } else {
      setRound(r => r + 1)
      fetchRound()
    }
  }

  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold neon-text">Game Over!</h1>
        <div className="bg-gray-900 border border-purple-800 rounded-xl p-6">
          <p className="text-2xl font-bold text-white mb-4">Total Score: {totalScore.toLocaleString()}</p>
          {allRoundScores.map((s, i) => (
            <p key={i} className="text-gray-400">Round {i+1}: {s.toLocaleString()} pts</p>
          ))}
        </div>
        <button onClick={() => { setRound(1); setTotalScore(0); setAllRoundScores([]); setGameOver(false); fetchRound() }} className="btn-primary px-8 py-3">
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">👥 Guess the Characters</h1>
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

      <p className="text-gray-400 text-sm">For each character below, enter their name AND the anime they&apos;re from.</p>

      {loading ? (
        <div className="text-center text-gray-400 animate-pulse py-12">Loading characters...</div>
      ) : roundData ? (
        <div className="space-y-4">
          {roundData.characters.map((char, i) => (
            <div key={char.character.mal_id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex gap-4 items-start">
              <div className="relative w-24 h-32 flex-shrink-0 rounded overflow-hidden">
                <Image src={char.character.images.jpg.image_url} alt="Character" fill style={{ objectFit: 'cover' }} sizes="96px" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Character Name</label>
                  <input
                    type="text"
                    value={inputs[i]?.charName || ''}
                    onChange={e => {
                      const newInputs = [...inputs]
                      newInputs[i] = { ...newInputs[i], charName: e.target.value }
                      setInputs(newInputs)
                    }}
                    className={`input-field text-sm ${submitted ? (results[i]?.charCorrect ? 'border-green-500' : 'border-red-500') : ''}`}
                    placeholder="Character name..."
                    disabled={submitted}
                  />
                  {submitted && <p className="text-xs mt-1 text-gray-400">Answer: {char.character.name}</p>}
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Anime Title</label>
                  <input
                    type="text"
                    value={inputs[i]?.animeName || ''}
                    onChange={e => {
                      const newInputs = [...inputs]
                      newInputs[i] = { ...newInputs[i], animeName: e.target.value }
                      setInputs(newInputs)
                    }}
                    className={`input-field text-sm ${submitted ? (results[i]?.animeCorrect ? 'border-green-500' : 'border-red-500') : ''}`}
                    placeholder="Anime title..."
                    disabled={submitted}
                  />
                  {submitted && <p className="text-xs mt-1 text-gray-400">Answer: {roundData.anime.title_english || roundData.anime.title}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {submitted && (
        <div className="bg-purple-900/30 border border-purple-600 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-white">Round Score: {roundScore.toLocaleString()} pts</p>
        </div>
      )}

      {!submitted ? (
        <button onClick={handleSubmit} className="btn-primary w-full py-3">Submit Answers</button>
      ) : (
        <button onClick={handleNext} className="btn-primary w-full py-3">
          {round >= ROUNDS ? 'See Results' : 'Next Round →'}
        </button>
      )}
    </div>
  )
}
