import { NextRequest, NextResponse } from 'next/server';
import { submitVote } from '@/lib/session-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { playerId, value } = body;

  if (!playerId || !value) {
    return NextResponse.json(
      { error: 'Player ID and vote value are required' },
      { status: 400 }
    );
  }

  const success = submitVote(sessionId, playerId, value);

  if (!success) {
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
