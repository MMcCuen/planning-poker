import { Redis } from '@upstash/redis';

// Singleton Redis client for Upstash
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables'
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

// Redis key prefixes for organization
export const REDIS_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  players: (sessionId: string) => `session:${sessionId}:players`,
  player: (sessionId: string, playerId: string) => `session:${sessionId}:player:${playerId}`,
  votes: (sessionId: string) => `session:${sessionId}:votes`,
  vote: (sessionId: string, voteId: string) => `session:${sessionId}:vote:${voteId}`,
} as const;

// TTL for session data (24 hours)
export const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds
