import { NextRequest, NextResponse } from 'next/server';
import { setIssue } from '@/lib/session-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { issueKey, issueTitle } = body;

  if (!issueKey || !issueTitle) {
    return NextResponse.json(
      { error: 'Issue key and title are required' },
      { status: 400 }
    );
  }

  const success = setIssue(sessionId, issueKey, issueTitle);

  if (!success) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
