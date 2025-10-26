'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Event, getEvent, addParticipant, updateParticipantCount, getRanking } from '@/lib/events'

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNamePrompt, setShowNamePrompt] = useState(false)

  // Carregar evento e verificar se usuário já entrou
  useEffect(() => {
    loadEvent()
    checkParticipantId()
  }, [eventId])

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    if (!showNamePrompt && event) {
      const interval = setInterval(() => {
        loadEvent()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [showNamePrompt, event])

  const checkParticipantId = () => {
    const storageKey = `gluta-nator-participant-${eventId}`
    const savedId = localStorage.getItem(storageKey)

    if (savedId) {
      setMyParticipantId(savedId)
      setShowNamePrompt(false)
    } else {
      setShowNamePrompt(true)
    }
  }

  const loadEvent = async () => {
    const loadedEvent = await getEvent(eventId)
    if (loadedEvent) {
      setEvent(loadedEvent)
      setNotFound(false)
    } else {
      setNotFound(true)
    }
  }

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || loading) return

    setLoading(true)
    const updatedEvent = await addParticipant(eventId, userName.trim())
    setLoading(false)

    if (updatedEvent) {
      // Encontrar o participante recém-criado pelo nome
      const newParticipant = updatedEvent.participants.find(
        p => p.name === userName.trim() && p.count === 0
      )

      if (newParticipant) {
        // Salvar ID no localStorage
        const storageKey = `gluta-nator-participant-${eventId}`
        localStorage.setItem(storageKey, newParticipant.id)
        setMyParticipantId(newParticipant.id)
        setEvent(updatedEvent)
        setShowNamePrompt(false)
      }
    } else {
      alert('Erro ao entrar no evento. Tente novamente.')
    }
  }

  const handleUpdateCount = async (participantId: string, delta: number) => {
    // Só permite atualizar o próprio contador
    if (participantId !== myParticipantId) return

    const updatedEvent = await updateParticipantCount(eventId, participantId, delta)
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

  // Tela de entrada de nome
  if (showNamePrompt) {
    return (
      <div className="container">
        <div className="event-header">
          <h1 className="event-title">{event.name}</h1>
          <div className="event-id">Código: {event.id}</div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#333', textAlign: 'center' }}>
            Bem-vindo à competição!
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Digite seu nome para entrar e começar a contar
          </p>

          <form onSubmit={handleJoinEvent}>
            <input
              type="text"
              className="input"
              placeholder="Seu nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na competição'}
            </button>
          </form>

          {event.participants.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9ff', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Já estão competindo:
              </p>
              <p style={{ fontSize: '1rem', color: '#333' }}>
                {event.participants.map(p => p.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tela principal com ranking
  const ranking = getRanking(event)
  const myParticipant = event.participants.find(p => p.id === myParticipantId)

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
          style={{ marginBottom: '0' }}
        >
          📋 Copiar link para compartilhar
        </button>
      </div>

      {myParticipant && (
        <div className="card my-counter-card">
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textAlign: 'center' }}>
            Seu contador
          </h3>
          <div className="my-counter">
            <div className="my-counter-name">{myParticipant.name}</div>
            <div className="my-counter-value">
              {myParticipant.count} {myParticipant.count === 1 ? 'pedaço' : 'pedaços'}
            </div>
            <div className="my-counter-buttons">
              <button
                className="my-counter-button my-counter-button-minus"
                onClick={() => handleUpdateCount(myParticipant.id, -1)}
              >
                −
              </button>
              <button
                className="my-counter-button my-counter-button-plus"
                onClick={() => handleUpdateCount(myParticipant.id, 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {event.participants.length > 0 && (
        <div className="card">
          <div className="ranking-header">
            <span className="medal">🏆</span>
            <span>Ranking</span>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#999', marginBottom: '1.5rem' }}>
            Atualiza automaticamente a cada 10s
          </p>

          {ranking.map((participant, index) => {
            const rankClass =
              index === 0 ? 'rank-1' :
              index === 1 ? 'rank-2' :
              index === 2 ? 'rank-3' : 'rank-other'

            const isMe = participant.id === myParticipantId

            return (
              <div
                key={participant.id}
                className={`participant-item ${isMe ? 'participant-item-me' : ''}`}
              >
                <div className={`rank-badge ${rankClass}`}>
                  {index + 1}
                </div>
                <div className="participant-info">
                  <div className="participant-name">
                    {participant.name}
                    {isMe && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>👤</span>}
                  </div>
                  <div className="participant-count">
                    {participant.count} {participant.count === 1 ? 'pedaço' : 'pedaços'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
