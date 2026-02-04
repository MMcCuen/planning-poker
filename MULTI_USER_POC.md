# Multi-User Planning Poker POC

## Overview
Implemented collaborative planning poker with session sharing and polling-based updates (no WebSockets required).

## How It Works

### 1. **Session Creation**
- One person creates a session from the lobby
- Receives a shareable session link
- Becomes the session owner

### 2. **Joining Sessions**
- Team members join via:
  - Session link (direct)
  - Session ID in lobby
- Each player gets stored in the session

### 3. **Adding Issues**
- **Owner only** can add Jira issues
- Provides issue key (e.g., "PROJ-123") and title
- Starts the voting round automatically

### 4. **Voting**
- All players vote independently
- Votes are hidden until revealed
- Players see "Ready" badge when someone votes
- Fibonacci scale: 0, 1, 2, 3, 5, ?, ☕

### 5. **Revealing Results**
- **Owner only** can reveal votes
- Shows all player votes and statistics
- Displays average, median, and distribution

### 6. **Next Round**
- **Owner** can reset votes for same issue
- **Owner** can add next issue to estimate

## Technical Implementation

### Architecture
```
┌─────────────────────────────────────────┐
│         Client (Browser)                 │
│  - Polling every 2 seconds              │
│  - localStorage for playerId            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Next.js API Routes              │
│  POST /api/sessions                     │
│  GET  /api/sessions/[id]                │
│  POST /api/sessions/[id]/join           │
│  POST /api/sessions/[id]/issue          │
│  POST /api/sessions/[id]/vote           │
│  POST /api/sessions/[id]/reveal         │
│  POST /api/sessions/[id]/reset          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      In-Memory Session Store            │
│  - sessions: Map<id, Session>           │
│  - players: Map<sessionId, Player[]>    │
│  - votes: Map<sessionId, Vote[]>        │
└─────────────────────────────────────────┘
```

### Key Features

**No WebSockets:**
- Simple HTTP polling every 2 seconds
- No Socket.io server needed
- No Redis needed (in-memory for POC)

**Session Persistence:**
- Sessions stored in memory (lost on restart)
- Players stored in localStorage
- Automatic rejoin on refresh

**Real-Time Feel:**
- 2-second polling provides near real-time updates
- Optimistic UI updates for instant feedback
- Smooth polling doesn't block UI

## User Flows

### Flow 1: Create & Share
1. Alice goes to http://localhost:3000
2. Clicks "Go to Lobby"
3. Enters session name "Sprint 42" and her name
4. Clicks "Create Session"
5. Copies share link
6. Sends link to team

### Flow 2: Join & Vote
1. Bob receives link from Alice
2. Opens link in browser
3. Enters his name
4. Joins session
5. Sees Alice in player list
6. Waits for Alice to add issue

### Flow 3: Estimate Issue
1. Alice clicks "Add Issue"
2. Enters "PROJ-123" and "Add user auth"
3. Clicks "Start Voting"
4. All players see voting cards
5. Bob votes "3", Charlie votes "5", Alice votes "3"
6. Players see "Ready" badges appear
7. Alice clicks "Reveal Votes"
8. Everyone sees results: Average 3.7, Median 3

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
Get session state (polls every 2 seconds)
```json
{
  "session": { "id": "abc123", "name": "Sprint 42", ... },
  "players": [{ "id": "p1", "name": "Alice", ... }],
  "votes": [{ "playerId": "p1", "value": "?", ... }]
}
```

### POST /api/sessions/[sessionId]/join
Join a session
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
  "playerId": "p1",
  "value": "3"
}
```

### POST /api/sessions/[sessionId]/reveal
Reveal all votes (owner only)

### POST /api/sessions/[sessionId]/reset
Reset votes for new round (owner only)

## File Structure

```
src/
├── lib/
│   └── session-store.ts           # In-memory session management
│
├── app/
│   ├── page.tsx                   # Landing page
│   ├── lobby/page.tsx             # Create/join lobby
│   ├── session/[sessionId]/
│   │   └── page.tsx               # Main session with polling
│   └── api/sessions/
│       ├── route.ts               # Create session
│       └── [sessionId]/
│           ├── route.ts           # Get session
│           ├── join/route.ts      # Join session
│           ├── issue/route.ts     # Add issue
│           ├── vote/route.ts      # Submit vote
│           ├── reveal/route.ts    # Reveal votes
│           └── reset/route.ts     # Reset votes
│
└── components/
    ├── lobby/
    │   ├── CreateSessionForm.tsx  # Create session form
    │   └── JoinSessionForm.tsx    # Join session form
    └── session/
        ├── VotingCards.tsx        # Fibonacci voting cards
        └── VotingResults.tsx      # Statistics display
```

## Testing

### Test Multi-User Flow

1. **Tab 1 (Owner - Alice):**
   ```
   http://localhost:3000
   → Go to Lobby
   → Create Session: "Sprint 42", Name: "Alice"
   → Copy session link
   ```

2. **Tab 2 (Player - Bob):**
   ```
   Paste session link
   → Enter name: "Bob"
   → Wait for issue
   ```

3. **Tab 3 (Player - Charlie):**
   ```
   Paste session link
   → Enter name: "Charlie"
   → Wait for issue
   ```

4. **Back to Tab 1 (Alice):**
   ```
   → See Bob and Charlie in player list
   → Click "Add Issue"
   → Enter: "PROJ-123", "Add user authentication"
   → Click "Start Voting"
   ```

5. **All Tabs Vote:**
   ```
   Alice: Votes 3
   Bob: Votes 5
   Charlie: Votes 3
   → See "Ready" badges appear
   ```

6. **Tab 1 (Alice reveals):**
   ```
   → Click "Reveal Votes"
   → See results:
     - Average: 3.7
     - Median: 3
     - Distribution chart
   ```

## Advantages

✅ **No WebSocket Complexity** - Simple HTTP API
✅ **No Database Needed** - In-memory for POC
✅ **Easy to Test** - Just open multiple browser tabs
✅ **Reliable** - HTTP is more reliable than WebSockets
✅ **Simple Deployment** - No special server config needed

## Limitations

⚠️ **Sessions Lost on Restart** - In-memory storage only
⚠️ **2-Second Delay** - Not instant (but acceptable)
⚠️ **No Offline Support** - Requires active connection
⚠️ **Memory Usage** - All sessions in RAM

## Next Steps (Optional)

- [ ] Add Redis or database for persistence
- [ ] Reduce polling interval to 1 second
- [ ] Add session expiration (auto-delete after 24h)
- [ ] Add reconnection handling
- [ ] Add session history
- [ ] Export results to CSV

---

**Date:** February 4, 2026
**Status:** ✅ Complete and working
**URL:** http://localhost:3000
