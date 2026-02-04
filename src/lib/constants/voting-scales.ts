export interface VotingCard {
  value: string;
  display: string;
  numeric: number | null;
}

// Fibonacci sequence capped at 5 (user requirement)
// 0, 1, 2, 3, 5 + special cards
export const FIBONACCI_SCALE: VotingCard[] = [
  { value: '0', display: '0', numeric: 0 },
  { value: '1', display: '1', numeric: 1 },
  { value: '2', display: '2', numeric: 2 },
  { value: '3', display: '3', numeric: 3 },
  { value: '5', display: '5', numeric: 5 },
  { value: '?', display: '?', numeric: null },
  { value: '☕', display: '☕', numeric: null },
];

// Helper to check if a value is numeric
export function isNumericVote(value: string): boolean {
  return !['?', '☕'].includes(value);
}

// Get all valid vote values
export function getValidVoteValues(): string[] {
  return FIBONACCI_SCALE.map((card) => card.value);
}

// Get numeric value from vote string
export function getNumericValue(value: string): number | null {
  const card = FIBONACCI_SCALE.find((c) => c.value === value);
  return card?.numeric ?? null;
}
