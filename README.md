# Planning Poker - Jira Integration

Real-time planning poker application for agile teams with Jira integration.

## Features (MVP Phase 1)

✅ **Core Functionality:**
- Create and join planning poker sessions
- Real-time voting with Fibonacci scale (0, 1, 2, 3, 5, ?, ☕)
- Dealer controls (reveal, reset, next issue)
- Live player status and vote indicators
- Automatic statistics calculation (average, median, mode, distribution)
- Mobile-responsive design with dark mode support

🚧 **Coming in Phase 2:**
- Jira OAuth 2.0 authentication
- Fetch issues directly from Jira boards/sprints
- Push estimates back to Jira Story Points field
- View current issue details from Jira

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.io
- **State**: Redis (Upstash)
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Upstash Redis account (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
cd /Users/mmccuen/Code/Grubhub/home_poker
pnpm install
\`\`\`

### 2. Set Up Upstash Redis

1. Go to [https://upstash.com](https://upstash.com) and create a free account
2. Create a new Redis database
3. Copy your REST URL and REST TOKEN
4. Add them to `.env.local`:

\`\`\`bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
\`\`\`

### 3. Configure Environment Variables

Edit `.env.local` and set:
- `UPSTASH_REDIS_REST_URL` - Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis REST token
- `SESSION_SECRET` - Random 32-character string

### 4. Run the Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Session

1. Go to [http://localhost:3000/lobby](http://localhost:3000/lobby)
2. Fill out the "Create Session" form:
   - Session name (e.g., "Sprint 42 Planning")
   - Your name (you'll be the dealer)
   - First issue key (e.g., "PROJ-123")
   - Issue summary
3. Click "Create Session"
4. Share the session link with your team

### Joining a Session

1. Get the session link from the dealer
2. Or go to the lobby and enter the session ID
3. Enter your name
4. Click "Join Session"

### Voting Flow

**As a Player:**
1. Wait for the dealer to start voting
2. Select your estimate card (0, 1, 2, 3, 5, ?, ☕)
3. Your vote is hidden until dealer reveals
4. See results after reveal

**As a Dealer:**
1. Wait for players to vote
2. Click "Reveal Votes" when ready
3. View statistics (average, median, distribution)
4. Click "Reset Votes" to vote again
5. Click "Next Issue" to move to the next story
6. Click "End Session" when done

## Project Structure

\`\`\`
src/
├── app/                    # Next.js pages
│   ├── api/               # API routes
│   ├── lobby/             # Session creation/join
│   └── session/[id]/      # Real-time session page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── lobby/            # Lobby forms
│   └── session/          # Session components
├── lib/                   # Core business logic
│   ├── socket/           # Socket.io server & handlers
│   ├── redis/            # Redis session store
│   ├── utils/            # Utilities & calculations
│   └── constants/        # Voting scales & events
├── types/                 # TypeScript definitions
└── hooks/                 # React hooks
\`\`\`

## Key Components

- **EstimationTable**: Player grid with vote status and flip animations
- **VotingCards**: Interactive card selection UI
- **DealerControls**: Reveal, reset, next issue buttons
- **VotingResults**: Statistics and distribution chart
- **IssueSidebar**: Current issue details

## Socket.io Events

**Client → Server:**
- `session:join` - Join a session
- `vote:submit` - Submit a vote
- `vote:reveal` - Reveal all votes (dealer only)
- `vote:reset` - Clear votes (dealer only)
- `vote:next-issue` - Move to next issue (dealer only)

**Server → Client:**
- `session:updated` - Session state changed
- `player:joined` - New player joined
- `voting:submitted` - Player voted (value hidden)
- `voting:revealed` - Votes revealed with results
- `voting:reset` - Votes cleared

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Deploy!

**Note**: Socket.io works with Vercel's serverless functions, but requires the custom server setup.

## Troubleshooting

### "Failed to create session"
- Check that Redis environment variables are set correctly
- Verify Upstash Redis database is active

### "Not connecting to session"
- Ensure development server is running
- Check browser console for Socket.io errors
- Verify `.env.local` has correct `NEXT_PUBLIC_APP_URL`

### "Votes not revealing"
- Check that you're the dealer
- Ensure at least one player has voted
- Look for errors in server console

## Development

### Type Checking
\`\`\`bash
pnpm type-check
\`\`\`

### Linting
\`\`\`bash
pnpm lint
\`\`\`

### Format Code
\`\`\`bash
pnpm format
\`\`\`

## Contributing

This is an internal tool. For issues or features, contact the development team.

## License

ISC

## Roadmap

### Phase 2: Full Jira Integration (Weeks 3-4)
- [ ] Jira OAuth 2.0 authentication
- [ ] Fetch boards and sprints
- [ ] Search/select issues from backlog
- [ ] Display full issue details
- [ ] Push estimates to Jira Story Points field
- [ ] View current estimates from Jira

### Phase 3: Polish & Production (Weeks 5-6)
- [ ] Session persistence (rejoin after disconnect)
- [ ] Estimate history tracking
- [ ] Optional chat panel
- [ ] Optional voting time limits
- [ ] Performance optimizations
- [ ] Accessibility improvements (WCAG AA)
