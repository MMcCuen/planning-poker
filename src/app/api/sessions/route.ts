import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionName, ownerName } = body;

    if (!sessionName || !ownerName) {
      return NextResponse.json(
        { error: 'Session name and owner name are required' },
        { status: 400 }
      );
    }

    const { session, playerId } = createSession(sessionName, ownerName);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionUrl = `${baseUrl}/session/${session.id}`;

    return NextResponse.json({
      session,
      playerId,
      sessionUrl,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
