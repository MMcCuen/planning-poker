import { CreateSessionForm } from '@/components/lobby/CreateSessionForm';
import { JoinSessionForm } from '@/components/lobby/JoinSessionForm';

export default function LobbyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Planning Poker</h1>
          <p className="text-muted-foreground">
            Real-time estimation for agile teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CreateSessionForm />
          <JoinSessionForm />
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>MVP Phase 1: Core voting mechanics with manual issue entry</p>
        </div>
      </div>
    </main>
  );
}
