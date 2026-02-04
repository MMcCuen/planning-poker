# Quick Start - Planning Poker

## 🚀 To Resume This Project:

### 1. Set Up Redis (5 min)
```
Go to: https://console.upstash.com/redis
→ Create free database
→ Copy REST URL and REST TOKEN
```

### 2. Configure `.env.local`
```bash
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_actual_token_here
```

### 3. Start Server
```bash
cd /Users/mmccuen/Code/Grubhub/home_poker
pnpm dev
```

### 4. Test It
```
Open: http://localhost:3000/lobby
Create session → Join in 2 more tabs → Vote → Reveal
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `CURRENT_STATUS.md` | **Read this first** - Full status & next steps |
| `README.md` | Complete documentation |
| `SETUP.md` | Detailed setup guide |
| `.env.local` | Configure Redis here |
| `src/app/session/[sessionId]/page.tsx` | Main session page |
| `src/lib/socket/server.ts` | Socket.io server |

---

## 🎯 Current Status

- ✅ **Code:** 100% complete
- 🟡 **Redis:** Needs setup (5 min)
- 🟡 **Testing:** Ready after Redis
- 🔴 **Deployed:** Not yet

---

## ⚡ One-Command Test

After Redis setup:
```bash
pnpm dev && open http://localhost:3000
```

---

**For detailed instructions, see: `CURRENT_STATUS.md`**
