'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Planning Poker
            </h1>
            <p className="text-xl text-muted-foreground">
              Collaborative estimation tool for agile teams
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Create or join a session to start estimating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                    1
                  </div>
                  <p className="text-sm">One person creates a session</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                    2
                  </div>
                  <p className="text-sm">Team members join via shared link</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                    3
                  </div>
                  <p className="text-sm">Everyone votes independently on issues</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                    4
                  </div>
                  <p className="text-sm">Owner reveals votes to see results</p>
                </div>
              </div>

              <Button
                onClick={() => router.push('/lobby')}
                className="w-full"
                size="lg"
              >
                Go to Lobby
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">Fibonacci Scale</h3>
              <p className="text-xs text-muted-foreground">
                Vote with 0, 1, 2, 3, 5, ?, ☕
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Instant Results</h3>
              <p className="text-xs text-muted-foreground">
                Average, median, and distribution
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Multi-User</h3>
              <p className="text-xs text-muted-foreground">
                Collaborative team estimation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
