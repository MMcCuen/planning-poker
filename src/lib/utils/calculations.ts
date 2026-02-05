import type { Vote, VotingResults } from '@/lib/session-store';
import { getNumericValue, isNumericVote } from '@/lib/constants/voting-scales';

/**
 * Calculate voting statistics from submitted votes
 * Handles numeric votes (0, 1, 2, 3, 5) and special cards (?, ☕)
 */
export function calculateVotingResults(votes: Vote[]): VotingResults {
  if (votes.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      distribution: {},
    };
  }

  // Separate numeric and non-numeric votes
  const numericVotes = votes
    .filter((v) => isNumericVote(v.value))
    .map((v) => getNumericValue(v.value))
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  // Calculate distribution (all votes, including special cards)
  const distribution: Record<string, number> = {};
  for (const vote of votes) {
    distribution[vote.value] = (distribution[vote.value] || 0) + 1;
  }

  // If no numeric votes, return minimal results
  if (numericVotes.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      mode: findMode(votes.map((v) => v.value)),
      distribution,
    };
  }

  // Calculate statistics
  const average = calculateAverage(numericVotes);
  const median = calculateMedian(numericVotes);
  const min = numericVotes[0];
  const max = numericVotes[numericVotes.length - 1];
  const mode = findMode(votes.map((v) => v.value));

  return {
    average,
    median,
    min,
    max,
    mode,
    distribution,
  };
}

/**
 * Calculate average (mean) of numeric values
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate median (middle value) of sorted numeric values
 */
export function calculateMedian(sortedValues: number[]): number {
  if (sortedValues.length === 0) return 0;

  const mid = Math.floor(sortedValues.length / 2);

  // If odd number of values, return middle value
  if (sortedValues.length % 2 === 1) {
    return sortedValues[mid];
  }

  // If even number of values, return average of two middle values
  return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

/**
 * Find the mode (most common value) in an array
 * Returns undefined if all values appear with equal frequency
 */
export function findMode(values: string[]): string | undefined {
  if (values.length === 0) return undefined;

  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mode: string | undefined;

  for (const value of values) {
    frequency[value] = (frequency[value] || 0) + 1;

    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  }

  // If all values appear only once, there's no mode
  if (maxFreq === 1) {
    return undefined;
  }

  return mode;
}

/**
 * Check if there's consensus in the votes
 * Consensus = all votes are the same value (excluding special cards)
 */
export function hasConsensus(votes: Vote[]): boolean {
  const numericVotes = votes.filter((v) => isNumericVote(v.value));

  if (numericVotes.length <= 1) return false;

  const firstValue = numericVotes[0].value;
  return numericVotes.every((v) => v.value === firstValue);
}

/**
 * Check if a vote is an outlier (significantly different from average)
 * Threshold: more than 50% away from average
 */
export function isOutlier(voteValue: string, average: number): boolean {
  const numericValue = getNumericValue(voteValue);

  if (numericValue === null) return false;

  const diff = Math.abs(numericValue - average);
  const threshold = average * 0.5;

  return diff > threshold;
}

/**
 * Get consensus recommendation based on voting results
 * Returns the value that the team should agree on
 */
export function getConsensusRecommendation(results: VotingResults): string {
  // If there's a clear mode with high frequency, recommend it
  if (results.mode) {
    return results.mode;
  }

  // Otherwise, recommend rounded average
  return Math.round(results.average).toString();
}
