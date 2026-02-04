'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function CreateSessionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('sessionName') as string,
      issueKey: formData.get('issueKey') as string,
      issueSummary: formData.get('issueSummary') as string,
      dealerName: formData.get('dealerName') as string,
      autoReveal: false,
    };

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const { session } = await response.json();

      // Redirect to session page with dealer role and name
      router.push(`/session/${session.id}?role=dealer&name=${encodeURIComponent(data.dealerName)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Session</CardTitle>
        <CardDescription>
          Start a new planning poker session and invite your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              name="sessionName"
              placeholder="Sprint 42 Planning"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealerName">Your Name (Dealer)</Label>
            <Input
              id="dealerName"
              name="dealerName"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueKey">First Issue Key</Label>
            <Input
              id="issueKey"
              name="issueKey"
              placeholder="PROJ-123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueSummary">Issue Summary</Label>
            <Input
              id="issueSummary"
              name="issueSummary"
              placeholder="Implement user authentication"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Session'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
