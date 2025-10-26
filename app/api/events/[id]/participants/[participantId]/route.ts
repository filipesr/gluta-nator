import { NextRequest, NextResponse } from 'next/server';
import { updateParticipantCount } from '@/lib/kv';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const { delta } = await request.json();

    if (typeof delta !== 'number') {
      return NextResponse.json(
        { error: 'Delta must be a number' },
        { status: 400 }
      );
    }

    const event = await updateParticipantCount(
      params.id,
      params.participantId,
      delta
    );

    if (!event) {
      return NextResponse.json(
        { error: 'Event or participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating participant count:', error);
    return NextResponse.json(
      { error: 'Failed to update count' },
      { status: 500 }
    );
  }
}
