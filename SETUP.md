# Setup Guide - Planning Poker MVP

## Quick Start (5 minutes)

### 1. Set Up Upstash Redis (Required)

**Why Redis?** Planning Poker needs to store session data (players, votes) that multiple users access simultaneously. Redis provides instant access to this shared state.

1. Go to [https://console.upstash.com/redis](https://console.upstash.com/redis)
2. Sign up (free account)
3. Click "Create Database"
   - **Name**: `planning-poker-dev`
   - **Region**: Choose closest to you
   - **Type**: Regional (free tier)
4. Click "Details" tab
5. Copy the **REST URL** and **REST TOKEN**

### 2. Configure Environment Variables

Edit `.env.local` in the project root:

\`\`\`bash
# Replace these with your Upstash credentials
UPSTASH_REDIS_REST_URL=https://your-redis-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Keep these as-is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
SESSION_SECRET=change-this-to-a-random-32-char-string-for-production
\`\`\`

### 3. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 4. Start the Development Server

\`\`\`bash
pnpm dev
\`\`\`

You should see:
\`\`\`
> Ready on http://localhost:3000
[Socket.io] Server initialized
\`\`\`

### 5. Test the Application

**Tab 1 (Dealer):**
1. Open [http://localhost:3000/lobby](http://localhost:3000/lobby)
2. Create a session:
   - Session Name: "Test Sprint"
   - Your Name: "Alice (Dealer)"
   - Issue Key: "TEST-001"
   - Issue Summary: "Test story"
3. Click "Create Session"
4. **Copy the session link** from the top-right "Share Link" button

**Tab 2 (Player 1):**
1. Open the session link in an **incognito window** (or different browser)
2. You'll be asked to join - enter name "Bob"
3. Click any card to vote (e.g., "3")

**Tab 3 (Player 2):**
1. Open the session link in **another incognito window**
2. Enter name "Charlie"
3. Vote with a different card (e.g., "5")

**Back to Tab 1 (Dealer):**
1. You should see both players with "Ready" badges
2. Click "Reveal Votes"
3. See the results: Average, Median, Distribution chart

**Success!** 🎉 You now have a working Planning Poker app.

## Troubleshooting

### "Failed to create session"
❌ **Problem**: Redis not configured
✅ **Solution**:
1. Check `.env.local` has correct `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Restart dev server: `Ctrl+C` then `pnpm dev`

### "Socket.io] Not connecting"
❌ **Problem**: Custom server not running
✅ **Solution**:
- Make sure you're running `pnpm dev` (not `pnpm dev:next`)
- Check console for "[Socket.io] Server initialized" message

### Players not seeing each other
❌ **Problem**: Not in the same session
✅ **Solution**:
- Make sure all players use the exact same session link
- Check session ID matches in the URL

### Votes not revealing
❌ **Problem**: Permission or timing issue
✅ **Solution**:
- Only the dealer can click "Reveal Votes"
- Ensure at least one player has voted
- Check browser console for errors

## Next Steps

### Production Deployment (Vercel)

1. **Push to GitHub**:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit - Planning Poker MVP"
   git branch -M main
   git remote add origin <your-github-repo>
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `SESSION_SECRET`
     - `NEXT_PUBLIC_APP_URL` (your Vercel URL, e.g., `https://your-app.vercel.app`)
   - Deploy!

3. **Important**: Update Redis TTL for production:
   - Sessions expire after 24 hours by default
   - Adjust `SESSION_TTL` in `src/lib/redis/client.ts` if needed

### Phase 2: Jira Integration

Coming next:
- [ ] Jira OAuth 2.0 login
- [ ] Fetch issues from Jira boards/sprints
- [ ] Display full issue details
- [ ] Push estimates to Jira Story Points field

## Architecture Overview

\`\`\`
Browser (React)  ←→  Socket.io  ←→  Redis
     ↓                   ↓              ↓
  UI Components      Real-time      Session
  Voting Cards       Events         Storage
  Player Grid        Handlers       (24hr TTL)
\`\`\`

## Key Files

- `src/app/session/[sessionId]/page.tsx` - Main session page
- `src/lib/socket/server.ts` - Socket.io server
- `src/lib/socket/handlers/voting.ts` - Voting logic
- `src/lib/redis/session-store.ts` - Data persistence
- `src/components/session/VotingCards.tsx` - Card UI

## Support

For issues or questions, contact the development team or check the main README.md file.
