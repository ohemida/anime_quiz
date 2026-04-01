# ⚔️ Animedle

The ultimate competitive anime quiz experience. Test your anime knowledge across multiple game modes and climb the leaderboard!

## 🎮 Game Modes

| Mode | Path | Description | Max Score |
|------|------|-------------|-----------|
| 🎌 Guess the Anime | `/game/guess-anime` | Identify anime from cover images. 3 rounds. | 30,000 pts |
| 👥 Guess the Characters | `/game/guess-characters` | Name 4 characters per round including their anime. 3 rounds. | 30,000 pts |
| 🎵 Guess the Opening | `/game/guess-opening` | Identify anime from their opening theme titles. 3 rounds. | 15,000 pts |
| 🎶 Guess the Ending | `/game/guess-ending` | Identify anime from their ending theme titles. 3 rounds. | 15,000 pts |
| 📅 Daily Challenge | `/game/daily` | One anime puzzle per day. Build your streak! | 10,000 pts |
| ♾️ Infinite Mode | `/game/infinite` | Endless rounds with scaling difficulty. No score limit! | Unlimited |

> **Start playing:** Navigate to [http://localhost:3000](http://localhost:3000) to see all game modes on the home page.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (or another database supported by Prisma)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables by creating a `.env` file:

```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## 🏆 How It Works

1. **Choose a game mode** from the home page (`/`)
2. **Answer 3 rounds** of questions (or go infinite!)
3. **Use hints wisely** — they reduce your maximum score for that round
4. **Submit your score** and climb the leaderboard

## 🛠️ Built With

- [Next.js](https://nextjs.org) — React framework
- [Prisma](https://www.prisma.io) — Database ORM
- [NextAuth.js](https://next-auth.js.org) — Authentication
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Jikan API](https://jikan.moe) — Anime data
