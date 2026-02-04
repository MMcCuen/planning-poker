export interface Vote {
  id: string;
  sessionId: string;
  playerId: string;
  issueKey: string;
  value: string; // "0", "1", "2", "3", "5", "?", "☕"
  votedAt: string; // ISO string
  revealed: boolean;
}

export interface VotingResults {
  average: number; // Numeric votes only
  median: number;
  min: number;
  max: number;
  mode?: string;
  distribution: Record<string, number>; // value -> count
  consensus?: string; // Final agreed value
}
