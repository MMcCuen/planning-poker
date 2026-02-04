import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Planning Poker
        </h1>
        <p className="text-xl text-muted-foreground">
          Real-time estimation for agile teams with Jira integration
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Link
            href="/lobby"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="pt-12 text-sm text-muted-foreground">
          <p>MVP Phase 1: Core voting mechanics</p>
        </div>
      </div>
    </main>
  );
}
