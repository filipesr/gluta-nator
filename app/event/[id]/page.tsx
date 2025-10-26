'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Event, getEvent, addParticipant, updateParticipantCount, getRanking } from '@/lib/events'

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = () => {
    const loadedEvent = getEvent(eventId)
    if (loadedEvent) {
      setEvent(loadedEvent)
      setNotFound(false)
    } else {
      setNotFound(true)
    }
  }

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newParticipantName.trim()) return

    const updatedEvent = addParticipant(eventId, newParticipantName)
    if (updatedEvent) {
      setEvent(updatedEvent)
      setNewParticipantName('')
    }
  }

  const handleUpdateCount = (participantId: string, delta: number) => {
    const updatedEvent = updateParticipantCount(eventId, participantId, delta)
    if (updatedEvent) {
      setEvent(updatedEvent)
    }
  }

  const copyShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }

  if (notFound) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Evento não encontrado</h1>
          <p className="subtitle">
            Verifique se o código está correto
          </p>
          <button
            className="button button-primary"
            onClick={() => router.push('/')}
          >
            Voltar para o início
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container">
        <div className="card">
          <p style={{ textAlign: 'center' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const ranking = getRanking(event)

  return (
    <div className="container">
      <div className="event-header">
        <h1 className="event-title">{event.name}</h1>
        <div className="event-id">Código: {event.id}</div>
      </div>

      <div className="card">
        <button
          className="button button-secondary"
          onClick={copyShareLink}
          style={{ marginBottom: '1rem' }}
        >
          📋 Copiar link para compartilhar
        </button>

        <form onSubmit={handleAddParticipant} className="add-participant-form">
          <input
            type="text"
            className="input"
            placeholder="Seu nome"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
          />
          <button type="submit" className="button button-primary">
            Entrar
          </button>
        </form>
      </div>

      {event.participants.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</p>
            <p>Nenhum participante ainda</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Seja o primeiro a entrar!
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="ranking-header">
              <span className="medal">🏆</span>
              <span>Ranking</span>
            </div>

            {ranking.map((participant, index) => {
              const rankClass =
                index === 0 ? 'rank-1' :
                index === 1 ? 'rank-2' :
                index === 2 ? 'rank-3' : 'rank-other'

              return (
                <div key={participant.id} className="participant-item">
                  <div className={`rank-badge ${rankClass}`}>
                    {index + 1}
                  </div>
                  <div className="participant-info">
                    <div className="participant-name">{participant.name}</div>
                    <div className="participant-count">
                      {participant.count} {participant.count === 1 ? 'pedaço' : 'pedaços'}
                    </div>
                  </div>
                  <div className="counter-buttons">
                    <button
                      className="counter-button counter-button-minus"
                      onClick={() => handleUpdateCount(participant.id, -1)}
                    >
                      −
                    </button>
                    <button
                      className="counter-button counter-button-plus"
                      onClick={() => handleUpdateCount(participant.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
