export type SessionStatus = 'waiting' | 'voting' | 'revealed' | 'completed';

export interface Session {
  id: string; // nanoid
  name: string; // "Sprint 42 Planning"
  currentIssueKey: string; // Manual entry in Phase 1, from Jira in Phase 2
  currentIssueSummary?: string; // Issue title/summary
  dealerId: string; // Player ID of dealer/scrum master
  status: SessionStatus;
  autoReveal: boolean; // Auto-reveal when all votes submitted
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
