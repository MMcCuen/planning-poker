import { z } from 'zod';

// Session validation
export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100, 'Session name too long'),
  issueKey: z.string().min(1, 'Issue key is required').max(50, 'Issue key too long'),
  issueSummary: z.string().min(1, 'Issue summary is required').max(500, 'Issue summary too long'),
  dealerName: z.string().min(1, 'Dealer name is required').max(50, 'Name too long'),
  autoReveal: z.boolean().optional().default(false),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// Join session validation
export const joinSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  playerName: z.string().min(1, 'Player name is required').max(50, 'Name too long'),
  role: z.enum(['voter', 'observer']).default('voter'),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;

// Vote validation
export const voteSchema = z.object({
  value: z.enum(['0', '1', '2', '3', '5', '?', '☕']),
});

export type VoteInput = z.infer<typeof voteSchema>;

// Next issue validation
export const nextIssueSchema = z.object({
  issueKey: z.string().min(1, 'Issue key is required').max(50, 'Issue key too long'),
  issueSummary: z.string().min(1, 'Issue summary is required').max(500, 'Issue summary too long'),
});

export type NextIssueInput = z.infer<typeof nextIssueSchema>;
