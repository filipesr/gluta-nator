import { kv } from '@vercel/kv';

export interface Participant {
  id: string;
  name: string;
  count: number;
}

export interface Event {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: number;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const EVENT_PREFIX = 'event:';

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const event = await kv.get<Event>(`${EVENT_PREFIX}${id}`);
    return event;
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
}

export async function createEvent(name: string): Promise<Event> {
  const event: Event = {
    id: generateId(),
    name,
    participants: [],
    createdAt: Date.now(),
  };

  await kv.set(`${EVENT_PREFIX}${event.id}`, event);
  // Set expiration to 7 days
  await kv.expire(`${EVENT_PREFIX}${event.id}`, 60 * 60 * 24 * 7);

  return event;
}

export async function addParticipant(eventId: string, participantName: string): Promise<Event | null> {
  const event = await getEvent(eventId);
  if (!event) return null;

  const participant: Participant = {
    id: generateId(),
    name: participantName,
    count: 0,
  };

  event.participants.push(participant);
  await kv.set(`${EVENT_PREFIX}${eventId}`, event);

  return event;
}

export async function updateParticipantCount(
  eventId: string,
  participantId: string,
  delta: number
): Promise<Event | null> {
  const event = await getEvent(eventId);
  if (!event) return null;

  const participant = event.participants.find(p => p.id === participantId);
  if (!participant) return null;

  participant.count = Math.max(0, participant.count + delta);
  await kv.set(`${EVENT_PREFIX}${eventId}`, event);

  return event;
}

export function getRanking(event: Event): Participant[] {
  return [...event.participants].sort((a, b) => b.count - a.count);
}
