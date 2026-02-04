import { NextRequest, NextResponse } from 'next/server';
import { resetVotes } from '@/lib/session-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const success = resetVotes(sessionId);

  if (!success) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
