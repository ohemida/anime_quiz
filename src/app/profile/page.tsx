'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GameSession {
  id: string
  mode: string
  score: number
  maxScore: number
  rounds: number
  createdAt: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  totalScore: number
  goldenTickets: number
  currentStreak: number
  longestStreak: number
  lastDailyDate: string | null
  gameSessions: GameSession[]
  dailyParticipations: Array<{ date: string; score: number; completed: boolean }>
}

export default function ProfilePage() {
  const { status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
      return
    }
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => { setProfile(data); setLoading(false) })
    }
  }, [status])

  if (loading) return <div className="text-center text-gray-400 py-12 animate-pulse">Loading profile...</div>
  if (!profile) return null

  const modeLabels: Record<string, string> = {
    'guess-anime': '🎌 Guess Anime',
    'guess-characters': '👥 Characters',
    'guess-opening': '🎵 Opening',
    'guess-ending': '🎶 Ending',
    'infinite': '♾️ Infinite',
    'daily': '📅 Daily',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-purple-900 to-gray-900 border border-purple-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            <p className="text-gray-400 text-sm">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Score', value: profile.totalScore.toLocaleString(), icon: '🏆' },
          { label: 'Golden Tickets', value: profile.goldenTickets, icon: '🎟️' },
          { label: 'Current Streak', value: `${profile.currentStreak} days`, icon: '🔥' },
          { label: 'Best Streak', value: `${profile.longestStreak} days`, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Games</h2>
        {profile.gameSessions.length === 0 ? (
          <p className="text-gray-500">No games played yet. <Link href="/" className="text-purple-400">Start playing!</Link></p>
        ) : (
          <div className="space-y-2">
            {profile.gameSessions.map(gs => (
              <div key={gs.id} className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <p className="text-white text-sm">{modeLabels[gs.mode] || gs.mode}</p>
                  <p className="text-gray-500 text-xs">{new Date(gs.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">{gs.score.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">/ {gs.maxScore.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
