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

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await fetch(`/api/events/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function createEvent(name: string): Promise<Event | null> {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

export async function addParticipant(
  eventId: string,
  participantName: string
): Promise<Event | null> {
  try {
    const response = await fetch(`/api/events/${eventId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: participantName }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error adding participant:', error);
    return null;
  }
}

export async function updateParticipantCount(
  eventId: string,
  participantId: string,
  delta: number
): Promise<Event | null> {
  try {
    const response = await fetch(
      `/api/events/${eventId}/participants/${participantId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error updating participant count:', error);
    return null;
  }
}

export function getRanking(event: Event): Participant[] {
  return [...event.participants].sort((a, b) => b.count - a.count);
}
