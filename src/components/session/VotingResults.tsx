'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { VotingResults, Vote } from '@/types';
import { cn } from '@/lib/utils/cn';

interface VotingResultsProps {
  votes: Vote[];
  results: VotingResults;
}

export function VotingResults({ votes, results }: VotingResultsProps) {
  if (votes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {results.average.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Average</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{results.median}</p>
            <p className="text-sm text-muted-foreground">Median</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {results.mode || '-'}
            </p>
            <p className="text-sm text-muted-foreground">Mode</p>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Distribution</h4>
          {Object.entries(results.distribution)
            .sort(([a], [b]) => {
              // Sort numeric values, then special cards
              const aNum = Number(a);
              const bNum = Number(b);
              if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
              }
              return a.localeCompare(b);
            })
            .map(([value, count]) => {
              const percentage = (count / votes.length) * 100;
              const isOutlier =
                !isNaN(Number(value)) &&
                Math.abs(Number(value) - results.average) > results.average * 0.5;

              return (
                <div key={value} className="flex items-center gap-3">
                  <span className="w-8 font-mono font-bold text-right">
                    {value}
                  </span>
                  <div className="flex-1 h-10 bg-secondary rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={cn(
                        'h-full flex items-center justify-end pr-2',
                        isOutlier
                          ? 'bg-yellow-500 dark:bg-yellow-600'
                          : 'bg-primary'
                      )}
                    >
                      <span className="text-sm font-medium text-white">
                        {count} {count === 1 ? 'vote' : 'votes'}
                      </span>
                    </motion.div>
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
        </div>

        {/* Range info */}
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>
            Range: {results.min} - {results.max}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
