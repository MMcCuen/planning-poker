import { NextRequest, NextResponse } from 'next/server';
import { getSessionStore } from '@/lib/redis/session-store';
import { createSessionSchema } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createSessionSchema.parse(body);

    // Create session in Redis
    const sessionStore = getSessionStore();
    const session = await sessionStore.createSession(
      validatedData.name,
      'temp-dealer-id', // Will be replaced when dealer joins via Socket.io
      validatedData.issueKey,
      validatedData.issueSummary
    );

    // Return session with shareable link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionUrl = `${baseUrl}/session/${session.id}`;

    return NextResponse.json({
      session,
      sessionUrl,
    });
  } catch (error) {
    console.error('[API] Error creating session:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const sessionStore = getSessionStore();
    const session = await sessionStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('[API] Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
