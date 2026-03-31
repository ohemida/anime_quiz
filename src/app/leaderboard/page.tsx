'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface LeaderboardUser {
  id: string
  username: string
  totalScore: number
  currentStreak: number
  longestStreak: number
  goldenTickets: number
  _count: { gameSessions: number }
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold neon-text text-center">🏆 Leaderboard</h1>
      {loading ? (
        <div className="text-center text-gray-400 animate-pulse">Loading...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-800 text-gray-400 text-xs font-semibold">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-right">Score</div>
            <div className="col-span-2 text-right">Streak</div>
            <div className="col-span-2 text-right">🎟️</div>
          </div>
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No players yet. Be the first!</div>
          ) : (
            users.map((user, i) => (
              <div key={user.id} className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${session?.user?.name === user.username ? 'bg-purple-900/20 border-purple-800' : ''}`}>
                <div className="col-span-1 font-bold text-gray-400">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div className="col-span-4 font-semibold text-white truncate">{user.username}</div>
                <div className="col-span-3 text-right text-purple-400 font-bold">{user.totalScore.toLocaleString()}</div>
                <div className="col-span-2 text-right text-orange-400">🔥{user.currentStreak}</div>
                <div className="col-span-2 text-right text-yellow-400">{user.goldenTickets}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
