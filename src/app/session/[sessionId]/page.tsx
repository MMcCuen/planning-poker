'use client';

import { use, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from '@/hooks/useSession';
import { VotingCards } from '@/components/session/VotingCards';
import { EstimationTable } from '@/components/session/EstimationTable';
import { DealerControls } from '@/components/session/DealerControls';
import { VotingResults } from '@/components/session/VotingResults';
import { IssueSidebar } from '@/components/session/IssueSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SOCKET_EVENTS } from '@/lib/constants/socket-events';
import { Copy, LogOut, Loader2 } from 'lucide-react';

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const playerName = searchParams.get('name') || 'Anonymous';
  const playerRole = (searchParams.get('role') as 'dealer' | 'voter') || 'voter';

  const { socket, isConnected } = useSocket();
  const { session, players, votes, results, currentPlayerId, error } = useSession({
    sessionId,
    playerName,
    playerRole,
    socket,
  });

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showNextIssueDialog, setShowNextIssueDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDealer = session?.dealerId === currentPlayerId;
  const hasVoted = votes.some((v) => v.playerId === currentPlayerId);
  const isRevealed = session?.status === 'revealed';

  // Vote handlers
  const handleVote = (value: string) => {
    if (!socket || !isConnected) return;

    setSelectedCard(value);
    socket.emit(SOCKET_EVENTS.VOTE_SUBMIT, value);
  };

  const handleReveal = () => {
    if (!socket || !isConnected) return;
    socket.emit(SOCKET_EVENTS.VOTE_REVEAL);
  };

  const handleReset = () => {
    if (!socket || !isConnected) return;
    socket.emit(SOCKET_EVENTS.VOTE_RESET);
    setSelectedCard(null);
  };

  const handleNextIssue = (issueKey: string, issueSummary: string) => {
    if (!socket || !isConnected) return;
    socket.emit(SOCKET_EVENTS.VOTE_NEXT_ISSUE, issueKey, issueSummary);
    setSelectedCard(null);
    setShowNextIssueDialog(false);
  };

  const handleEndSession = () => {
    if (!socket || !isConnected) return;
    socket.emit(SOCKET_EVENTS.SESSION_END);
    router.push('/');
  };

  const handleLeaveSession = () => {
    router.push('/');
  };

  const copySessionLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Loading state
  if (!isConnected || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Connecting to session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={handleLeaveSession}>Return to Lobby</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{session.name}</h1>
              <p className="text-sm text-muted-foreground">
                {isDealer ? 'You are the dealer' : 'Player'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copySessionLink}
              >
                <Copy className="w-4 h-4 mr-2" />
                {isCopied ? 'Copied!' : 'Share Link'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveSession}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-6">
            <IssueSidebar
              issueKey={session.currentIssueKey}
              issueSummary={session.currentIssueSummary}
            />

            {isDealer && (
              <DealerControls
                onReveal={handleReveal}
                onReset={handleReset}
                onNextIssue={() => setShowNextIssueDialog(true)}
                onEndSession={handleEndSession}
                sessionStatus={session.status}
                hasVotes={votes.length > 0}
                disabled={!isConnected}
              />
            )}
          </aside>

          {/* Main Area */}
          <main className="space-y-6">
            {/* Estimation Table */}
            <Card>
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <EstimationTable
                  players={players}
                  votes={votes}
                  revealed={isRevealed}
                  currentUserId={currentPlayerId || ''}
                />
              </CardContent>
            </Card>

            {/* Voting Cards (for non-dealer players or if not revealed) */}
            {!isRevealed && playerRole === 'voter' && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  <VotingCards
                    selectedValue={selectedCard}
                    onSelect={handleVote}
                    disabled={!isConnected || hasVoted}
                  />
                  {hasVoted && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Waiting for dealer to reveal votes...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results (after reveal) */}
            {isRevealed && results && (
              <VotingResults votes={votes} results={results} />
            )}
          </main>
        </div>
      </div>

      {/* Next Issue Dialog */}
      {showNextIssueDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Next Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const issueKey = formData.get('issueKey') as string;
                  const issueSummary = formData.get('issueSummary') as string;
                  handleNextIssue(issueKey, issueSummary);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="issueKey">Issue Key</Label>
                  <Input
                    id="issueKey"
                    name="issueKey"
                    placeholder="PROJ-124"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueSummary">Issue Summary</Label>
                  <Input
                    id="issueSummary"
                    name="issueSummary"
                    placeholder="Add password reset feature"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Start Voting
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNextIssueDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
