'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VotingCards } from '@/components/session/VotingCards';
import { VotingResults } from '@/components/session/VotingResults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, LogOut, Loader2, Plus } from 'lucide-react';
import { calculateVotingResults } from '@/lib/utils/calculations';
import type { Session, Player, Vote } from '@/lib/session-store';

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Get playerId from localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player_${sessionId}`);
    setPlayerId(storedPlayerId);
  }, [sessionId]);

  // Fetch session data
  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error('Session not found');
      }

      const data = await response.json();
      setSession(data.session);
      setPlayers(data.players);
      setVotes(data.votes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for updates every 2 seconds
  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Handlers
  const handleAddIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const issueKey = formData.get('issueKey') as string;
    const issueTitle = formData.get('issueTitle') as string;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueKey, issueTitle }),
      });

      if (response.ok) {
        setShowIssueDialog(false);
        setSelectedCard(null);
        fetchSessionData();
      }
    } catch (err) {
      console.error('Failed to add issue:', err);
    }
  };

  const handleVote = async (value: string) => {
    if (!playerId) return;

    setSelectedCard(value);

    try {
      await fetch(`/api/sessions/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, value }),
      });

      fetchSessionData();
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  const handleReveal = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/reveal`, {
        method: 'POST',
      });

      fetchSessionData();
    } catch (err) {
      console.error('Failed to reveal votes:', err);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/reset`, {
        method: 'POST',
      });

      setSelectedCard(null);
      fetchSessionData();
    } catch (err) {
      console.error('Failed to reset votes:', err);
    }
  };

  const copySessionLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || 'Session not found'}</p>
            <Button onClick={() => router.push('/lobby')}>Return to Lobby</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = session.ownerId === playerId;
  const currentPlayer = players.find(p => p.id === playerId);
  const hasVoted = votes.some(v => v.playerId === playerId && v.value !== '?');
  const isRevealed = session.status === 'revealed';
  const results = isRevealed ? calculateVotingResults(votes.filter(v => v.value !== '?').map(v => ({
    ...v,
    sessionId,
    issueKey: session.currentIssue?.key || '',
    votedAt: new Date(),
    revealed: true,
  }))) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{session.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentPlayer?.name} {isOwner && '(Owner)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copySessionLink}>
                <Copy className="w-4 h-4 mr-2" />
                {isCopied ? 'Copied!' : 'Share Link'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Current Issue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Issue</CardTitle>
                {isOwner && session.status !== 'voting' && (
                  <Button size="sm" onClick={() => setShowIssueDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Issue
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {session.currentIssue ? (
                <div>
                  <p className="text-2xl font-bold font-mono mb-2">
                    {session.currentIssue.key}
                  </p>
                  <p className="text-muted-foreground">
                    {session.currentIssue.title}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {isOwner ? 'Click "Add Issue" to start voting' : 'Waiting for owner to add an issue...'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Players */}
          <Card>
            <CardHeader>
              <CardTitle>Players ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map(player => {
                  const playerVote = votes.find(v => v.playerId === player.id);
                  const voted = playerVote && playerVote.value !== '?';

                  return (
                    <div key={player.id} className="flex flex-col items-center p-4 border rounded-lg">
                      <Avatar className="h-12 w-12 mb-2">
                        <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm text-center">{player.name}</p>
                      {player.isOwner && (
                        <Badge variant="outline" className="mt-1 text-xs">Owner</Badge>
                      )}
                      {voted && !isRevealed && (
                        <Badge className="mt-2 bg-green-100 text-green-700">Ready</Badge>
                      )}
                      {isRevealed && playerVote && playerVote.value !== '?' && (
                        <div className="mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {playerVote.value}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Voting Cards */}
          {session.status === 'voting' && !hasVoted && (
            <Card>
              <CardHeader>
                <CardTitle>Your Vote</CardTitle>
              </CardHeader>
              <CardContent>
                <VotingCards
                  selectedValue={selectedCard}
                  onSelect={handleVote}
                  disabled={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Waiting Message */}
          {session.status === 'voting' && hasVoted && !isRevealed && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Waiting for {isOwner ? 'all players to vote' : 'owner to reveal votes'}...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Owner Controls */}
          {isOwner && session.status === 'voting' && (
            <div className="flex gap-4">
              <Button onClick={handleReveal} className="flex-1" size="lg">
                Reveal Votes
              </Button>
            </div>
          )}

          {/* Results */}
          {isRevealed && results && (
            <>
              <VotingResults
                votes={votes.filter(v => v.value !== '?').map(v => ({
                  ...v,
                  sessionId,
                  issueKey: session.currentIssue?.key || '',
                  votedAt: new Date(),
                  revealed: true,
                }))}
                results={results}
              />
              {isOwner && (
                <div className="flex gap-4">
                  <Button onClick={handleReset} variant="outline" className="flex-1" size="lg">
                    Reset Votes
                  </Button>
                  <Button onClick={() => setShowIssueDialog(true)} className="flex-1" size="lg">
                    Next Issue
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Issue Dialog */}
      {showIssueDialog && isOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Add Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddIssue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueKey">Issue Key</Label>
                  <Input
                    id="issueKey"
                    name="issueKey"
                    placeholder="PROJ-123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueTitle">Issue Title</Label>
                  <Input
                    id="issueTitle"
                    name="issueTitle"
                    placeholder="Implement user authentication"
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
                    onClick={() => setShowIssueDialog(false)}
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
