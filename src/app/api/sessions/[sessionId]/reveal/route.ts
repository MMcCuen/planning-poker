import { NextRequest, NextResponse } from 'next/server';
import { revealVotes } from '@/lib/session-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const success = revealVotes(sessionId);

  if (!success) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
