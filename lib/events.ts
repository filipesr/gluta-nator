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

const STORAGE_KEY = 'gluta-nator-events';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getAllEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getEvent(id: string): Event | null {
  const events = getAllEvents();
  return events.find(e => e.id === id) || null;
}

export function createEvent(name: string): Event {
  const event: Event = {
    id: generateId(),
    name,
    participants: [],
    createdAt: Date.now(),
  };

  const events = getAllEvents();
  events.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  return event;
}

export function addParticipant(eventId: string, participantName: string): Event | null {
  const events = getAllEvents();
  const event = events.find(e => e.id === eventId);

  if (!event) return null;

  const participant: Participant = {
    id: generateId(),
    name: participantName,
    count: 0,
  };

  event.participants.push(participant);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  return event;
}

export function updateParticipantCount(
  eventId: string,
  participantId: string,
  delta: number
): Event | null {
  const events = getAllEvents();
  const event = events.find(e => e.id === eventId);

  if (!event) return null;

  const participant = event.participants.find(p => p.id === participantId);
  if (!participant) return null;

  participant.count = Math.max(0, participant.count + delta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  return event;
}

export function getRanking(event: Event): Participant[] {
  return [...event.participants].sort((a, b) => b.count - a.count);
}
