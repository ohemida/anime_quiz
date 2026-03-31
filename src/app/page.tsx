import Link from 'next/link'

const gameModes = [
  {
    title: '🎌 Guess the Anime',
    description: 'Identify anime from cover images. 3 rounds, up to 30,000 pts.',
    href: '/game/guess-anime',
    maxScore: 30000,
    color: 'from-purple-900 to-purple-700',
  },
  {
    title: '👥 Guess the Characters',
    description: 'Name 4 characters per round including their anime. 3 rounds, up to 30,000 pts.',
    href: '/game/guess-characters',
    maxScore: 30000,
    color: 'from-blue-900 to-blue-700',
  },
  {
    title: '🎵 Guess the Opening',
    description: 'Identify anime from their opening theme titles. 3 rounds, up to 15,000 pts.',
    href: '/game/guess-opening',
    maxScore: 15000,
    color: 'from-green-900 to-green-700',
  },
  {
    title: '🎶 Guess the Ending',
    description: 'Identify anime from their ending theme titles. 3 rounds, up to 15,000 pts.',
    href: '/game/guess-ending',
    maxScore: 15000,
    color: 'from-yellow-900 to-yellow-700',
  },
  {
    title: '📅 Daily Challenge',
    description: 'One anime puzzle per day. Build your streak! Up to 10,000 pts.',
    href: '/game/daily',
    maxScore: 10000,
    color: 'from-red-900 to-red-700',
    badge: 'DAILY',
  },
  {
    title: '♾️ Infinite Mode',
    description: 'Endless rounds with scaling difficulty. No limit on score!',
    href: '/game/infinite',
    maxScore: null,
    color: 'from-pink-900 to-pink-700',
  },
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold">
          <span className="neon-text">⚔️ Animedle</span>
        </h1>
        <p className="text-gray-400 text-xl">The ultimate competitive anime quiz experience</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="bg-gray-800 rounded-full px-4 py-2 text-sm text-purple-300">
            🏆 Perfect Score: 100,000
          </div>
          <div className="bg-gray-800 rounded-full px-4 py-2 text-sm text-yellow-300">
            🎟️ Earn Golden Tickets
          </div>
          <div className="bg-gray-800 rounded-full px-4 py-2 text-sm text-green-300">
            🔥 Build Your Streak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameModes.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <div className={`game-card relative overflow-hidden cursor-pointer bg-gradient-to-br ${mode.color} bg-opacity-20`}>
              {mode.badge && (
                <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  {mode.badge}
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{mode.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{mode.description}</p>
              {mode.maxScore && (
                <div className="text-purple-300 font-semibold text-sm">
                  Max: {mode.maxScore.toLocaleString()} pts
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-400">
          <div>
            <div className="text-3xl mb-2">1️⃣</div>
            <p>Choose a game mode</p>
          </div>
          <div>
            <div className="text-3xl mb-2">2️⃣</div>
            <p>Answer 3 rounds of questions</p>
          </div>
          <div>
            <div className="text-3xl mb-2">3️⃣</div>
            <p>Use hints wisely — they cost points</p>
          </div>
          <div>
            <div className="text-3xl mb-2">4️⃣</div>
            <p>Climb the leaderboard!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
