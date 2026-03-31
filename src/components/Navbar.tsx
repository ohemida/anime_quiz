'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-purple-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold neon-text">⚔️ Animedle</Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/game/daily" className="text-gray-300 hover:text-purple-400 text-sm">Daily</Link>
            <Link href="/game/guess-anime" className="text-gray-300 hover:text-purple-400 text-sm">Guess Anime</Link>
            <Link href="/game/guess-characters" className="text-gray-300 hover:text-purple-400 text-sm">Characters</Link>
            <Link href="/game/guess-opening" className="text-gray-300 hover:text-purple-400 text-sm">Openings</Link>
            <Link href="/game/guess-ending" className="text-gray-300 hover:text-purple-400 text-sm">Endings</Link>
            <Link href="/game/infinite" className="text-gray-300 hover:text-purple-400 text-sm">Infinite</Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-purple-400 text-sm">Leaderboard</Link>
            {session ? (
              <>
                <Link href="/profile" className="text-gray-300 hover:text-purple-400 text-sm">👤 {session.user?.name}</Link>
                <button onClick={() => signOut()} className="btn-secondary text-sm py-1">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary text-sm py-1">Sign In</Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-1">Sign Up</Link>
              </>
            )}
          </div>
          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/game/daily" className="text-gray-300 hover:text-purple-400">Daily</Link>
            <Link href="/game/guess-anime" className="text-gray-300 hover:text-purple-400">Guess Anime</Link>
            <Link href="/game/guess-characters" className="text-gray-300 hover:text-purple-400">Characters</Link>
            <Link href="/game/guess-opening" className="text-gray-300 hover:text-purple-400">Openings</Link>
            <Link href="/game/guess-ending" className="text-gray-300 hover:text-purple-400">Endings</Link>
            <Link href="/game/infinite" className="text-gray-300 hover:text-purple-400">Infinite</Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-purple-400">Leaderboard</Link>
            {session ? (
              <>
                <Link href="/profile" className="text-gray-300 hover:text-purple-400">Profile</Link>
                <button onClick={() => signOut()} className="btn-secondary text-sm">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary text-sm">Sign In</Link>
                <Link href="/auth/signup" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
