# Planning Poker - Multi-User Collaborative Estimation

Simple, collaborative planning poker application for agile teams with Jira ticket estimation.

## Features

✅ **Multi-User Sessions:**
- Create sessions with shareable links
- Real-time player synchronization via polling
- Owner controls for managing voting rounds
- Independent voting for all team members

✅ **Voting Functionality:**
- Fibonacci scale: 0, 1, 2, 3, 5, ?, ☕
- Hidden votes until owner reveals
- Automatic statistics (average, median, distribution)
- Visual distribution chart

✅ **Issue Management:**
- Add Jira ticket IDs and titles
- Owner controls issue flow
- Reset votes for re-estimation
- Move to next issue seamlessly

✅ **User Experience:**
- Mobile-responsive design
- Dark mode support
- Real-time player status badges
- Clean, professional UI

🚧 **Coming Soon:**
- Jira OAuth integration for direct issue import
- Push estimates back to Jira
- Session persistence across restarts

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + shadcn/ui
- **Real-time**: HTTP Polling (2-second intervals)
- **Storage**: In-memory (no database needed for POC)
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

## Quick Start

### 1. Clone and Install

```bash
cd /Users/mmccuen/Code/Grubhub/home_poker
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**That's it!** No database setup, no environment variables needed for local development.

## Usage Guide

### Creating a Session

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click **"Go to Lobby"**
3. Fill out "Create Session" form:
   - **Session Name**: e.g., "Sprint 42 Planning"
   - **Your Name**: e.g., "Alice"
4. Click **"Create Session"**
5. Click **"Share Link"** and send to your team

### Joining a Session

**Option 1: Via Direct Link**
1. Click the session link from owner
2. Enter your name
3. Click "Join Session"

**Option 2: Via Lobby**
1. Go to [http://localhost:3000/lobby](http://localhost:3000/lobby)
2. Enter session ID in "Join Session" form
3. Enter your name
4. Click "Join Session"

### Voting Flow

**As Session Owner:**
1. Wait for team to join
2. Click **"Add Issue"**
3. Enter Jira ticket ID (e.g., "PROJ-123") and title
4. Click **"Start Voting"**
5. Wait for team to vote (see "Ready" badges)
6. Click **"Reveal Votes"**
7. Review statistics and discussion
8. Click **"Reset Votes"** to re-estimate or **"Next Issue"** to move on

**As Team Member:**
1. Wait for owner to add issue
2. Select your estimate card (0, 1, 2, 3, 5, ?, ☕)
3. Wait for owner to reveal votes
4. See results and statistics
5. Repeat for next issue

### Voting Scale

- **0** - Trivial task or already done
- **1** - Very simple, minimal effort
- **2** - Simple, straightforward
- **3** - Moderate complexity
- **5** - Complex, requires significant effort
- **?** - Unsure, need more information
- **☕** - Need a break

## Testing Multi-User Functionality

### Local Testing (Multiple Browser Tabs)

1. **Tab 1 (Owner):**
   - Create session as "Alice"
   - Copy session link

2. **Tab 2 (Player):**
   - Open **incognito/private window**
   - Paste session link
   - Join as "Bob"

3. **Tab 3 (Player):**
   - Open **another incognito window**
   - Paste session link
   - Join as "Charlie"

4. **Add Issue & Vote:**
   - Alice adds "PROJ-123: Add user auth"
   - All players vote independently
   - Alice reveals votes
   - See results with statistics

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── lobby/page.tsx              # Create/join session
│   ├── session/[sessionId]/        # Main session page with polling
│   └── api/sessions/               # API routes
│       ├── route.ts                # Create session
│       └── [sessionId]/
│           ├── route.ts            # Get session state
│           ├── join/route.ts       # Join session
│           ├── issue/route.ts      # Add issue
│           ├── vote/route.ts       # Submit vote
│           ├── reveal/route.ts     # Reveal votes
│           └── reset/route.ts      # Reset votes
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── lobby/                      # Create/join forms
│   └── session/                    # Voting cards, results
├── lib/
│   ├── session-store.ts            # In-memory session management
│   └── utils/calculations.ts       # Statistics calculations
└── types/                          # TypeScript definitions
```

## API Endpoints

### POST /api/sessions
Create a new session
```json
{
  "sessionName": "Sprint 42",
  "ownerName": "Alice"
}
```

### GET /api/sessions/[sessionId]
Get current session state (polled every 2 seconds)

### POST /api/sessions/[sessionId]/join
Join an existing session
```json
{
  "playerName": "Bob"
}
```

### POST /api/sessions/[sessionId]/issue
Add issue to estimate (owner only)
```json
{
  "issueKey": "PROJ-123",
  "issueTitle": "Add user authentication"
}
```

### POST /api/sessions/[sessionId]/vote
Submit a vote
```json
{
  "playerId": "player_id",
  "value": "3"
}
```

### POST /api/sessions/[sessionId]/reveal
Reveal all votes (owner only)

### POST /api/sessions/[sessionId]/reset
Reset votes for new round (owner only)

## How Real-Time Works

Instead of WebSockets, the app uses **HTTP polling**:
- Clients fetch session state every 2 seconds
- Simple, reliable, no complex WebSocket setup
- Works seamlessly with serverless deployments
- Slight delay (2s) is acceptable for planning poker

## Development Commands

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy (no environment variables needed!)

### Other Platforms

```bash
# Build
pnpm build

# Start production server
pnpm start
```

**Note:** Sessions are stored in-memory, so they'll be lost on server restart. This is fine for a POC but consider adding Redis or a database for production.

## Troubleshooting

### Players Not Seeing Each Other
- Ensure all players are in the same session (check URL)
- Wait 2-3 seconds for polling to sync
- Refresh the page if needed

### Votes Not Appearing
- Only owner can reveal votes
- Ensure you've actually voted (selected a card)
- Check browser console for errors

### Session Not Found
- Sessions are lost on server restart (in-memory storage)
- Create a new session if the old one is gone

## Limitations (POC)

⚠️ **In-Memory Storage**
- Sessions lost on server restart
- No persistence across deployments

⚠️ **Polling Delay**
- 2-second update interval
- Not instant, but acceptable for this use case

⚠️ **No Authentication**
- Anyone with link can join
- No user accounts or passwords

## Future Enhancements

### Phase 2: Jira Integration
- [ ] OAuth 2.0 authentication
- [ ] Import issues from Jira boards/sprints
- [ ] Push estimates to Jira Story Points field
- [ ] Display full issue details

### Phase 3: Production Features
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Session history and analytics
- [ ] WebSocket upgrade for instant updates
- [ ] Custom voting scales (T-shirt sizes, etc.)
- [ ] Observer mode
- [ ] In-session chat

## Contributing

This is an internal tool. For issues or features, open an issue on GitHub.

## License

ISC

---

**Built with ❤️ for agile teams**
