import { NextRequest, NextResponse } from 'next/server';
import { createEvent } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    const event = await createEvent(name.trim());
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
