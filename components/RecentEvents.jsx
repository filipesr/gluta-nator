'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { readRecentEvents } from '@/lib/recentEvents';

export default function RecentEvents({ refreshKey }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(readRecentEvents());
  }, [refreshKey]);

  if (!events.length) {
    return null;
  }

  return (
    <section className="card">
      <h2>Últimos eventos abertos neste dispositivo</h2>
      <p className="muted">Acesse rapidamente os placares que você criou ou participou recentemente.</p>
      <ul style={{ listStyle: 'none', margin: '1rem 0 0', padding: 0 }}>
        {events.map((event) => (
          <li key={event.slug} style={{ marginBottom: '0.75rem' }}>
            <Link href={`/event/${event.slug}`}>
              <strong>{event.name}</strong>
              <span className="muted"> — {event.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
