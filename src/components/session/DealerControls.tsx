'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, RotateCcw, ArrowRight, XCircle } from 'lucide-react';

interface DealerControlsProps {
  onReveal: () => void;
  onReset: () => void;
  onNextIssue: () => void;
  onEndSession: () => void;
  sessionStatus: 'waiting' | 'voting' | 'revealed' | 'completed';
  hasVotes: boolean;
  disabled?: boolean;
}

export function DealerControls({
  onReveal,
  onReset,
  onNextIssue,
  onEndSession,
  sessionStatus,
  hasVotes,
  disabled,
}: DealerControlsProps) {
  const canReveal = sessionStatus === 'voting' && hasVotes;
  const canReset = sessionStatus === 'revealed';
  const canNextIssue = sessionStatus === 'revealed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dealer Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onReveal}
          disabled={!canReveal || disabled}
          className="w-full"
          size="lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Reveal Votes
        </Button>

        <Button
          onClick={onReset}
          disabled={!canReset || disabled}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Votes
        </Button>

        <Button
          onClick={onNextIssue}
          disabled={!canNextIssue || disabled}
          variant="outline"
          className="w-full"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Next Issue
        </Button>

        <div className="pt-4 border-t">
          <Button
            onClick={onEndSession}
            disabled={disabled}
            variant="destructive"
            className="w-full"
          >
            <XCircle className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>

        {/* Status indicator */}
        <div className="pt-2 text-sm text-muted-foreground text-center">
          Status:{' '}
          <span className="font-medium capitalize">{sessionStatus}</span>
        </div>
      </CardContent>
    </Card>
  );
}
