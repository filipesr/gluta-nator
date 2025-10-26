'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/lib/events'

export default function Home() {
  const [eventName, setEventName] = useState('')
  const [eventId, setEventId] = useState('')
  const router = useRouter()

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventName.trim()) return

    const event = createEvent(eventName)
    router.push(`/event/${event.id}`)
  }

  const handleJoinEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId.trim()) return

    router.push(`/event/${eventId}`)
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">🍕 Gluta-nator 🍣</h1>
        <p className="subtitle">
          Contador de pedaços em competições de rodízio!
        </p>

        <form onSubmit={handleCreateEvent}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#333' }}>
            Criar novo evento
          </h2>
          <input
            type="text"
            className="input"
            placeholder="Ex: Rodízio da galera"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <button type="submit" className="button button-primary">
            Criar Evento
          </button>
        </form>

        <div style={{ margin: '2rem 0', textAlign: 'center', color: '#999' }}>
          ou
        </div>

        <form onSubmit={handleJoinEvent}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#333' }}>
            Entrar em um evento
          </h2>
          <input
            type="text"
            className="input"
            placeholder="Digite o código do evento"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
          <button type="submit" className="button button-secondary">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
