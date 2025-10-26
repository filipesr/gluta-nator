'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import {
  addParticipant,
  fetchEvent,
  incrementParticipant,
  removeParticipant,
  subscribeToParticipants
} from '@/lib/events';
import { hasValidFirebaseConfig } from '@/lib/firebase';
import { clearParticipant, readParticipant, writeParticipant } from '@/lib/participantStorage';
import { formatTimestamp } from '@/lib/datetime';

import ConfigWarning from './ConfigWarning';
import Toast from './Toast';

export default function EventDashboard({ slug }) {
  const [toastMessage, setToastMessage] = useState(null);
  const [status, setStatus] = useState('loading');
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selfId, setSelfId] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const configReady = hasValidFirebaseConfig();

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  useEffect(() => {
    if (!configReady) return;
    setSelfId(readParticipant(slug));
  }, [configReady, slug]);

  useEffect(() => {
    if (!configReady) return;
    let active = true;
    setStatus('loading');
    fetchEvent(slug)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setStatus('missing');
        } else {
          setEventData(data);
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [configReady, slug]);

  useEffect(() => {
    if (!configReady || status !== 'ready') return undefined;
    const unsubscribe = subscribeToParticipants(slug, (raw) => {
      const entries = Object.entries(raw ?? {});
      const list = entries.map(([id, value]) => ({
        id,
        name: value?.name?.trim() || 'Sem nome',
        count: typeof value?.count === 'number' ? value.count : 0,
        createdAt: value?.createdAt ?? null,
        updatedAt: value?.updatedAt ?? null
      }));

      list.sort((a, b) => {
        if (b.count === a.count) {
          return (a.createdAt || 0) - (b.createdAt || 0);
        }
        return b.count - a.count;
      });

      setParticipants(list);

      if (selfId && !list.some((participant) => participant.id === selfId)) {
        clearParticipant(slug);
        setSelfId(null);
        showToast('Seu registro não está mais disponível. Entre novamente.');
      }
    });

    return () => unsubscribe();
  }, [configReady, status, slug, selfId, showToast]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/event/${slug}`;
  }, [slug]);

  const totalPieces = useMemo(
    () => participants.reduce((sum, participant) => sum + participant.count, 0),
    [participants]
  );

  const handleJoin = async (event) => {
    event.preventDefault();
    const trimmed = participantName.trim();
    if (!trimmed) {
      showToast('Digite seu nome para participar.');
      return;
    }

    try {
      setIsJoining(true);
      const id = await addParticipant(slug, trimmed);
      writeParticipant(slug, id);
      setSelfId(id);
      setParticipantName('');
      showToast('Você entrou no evento!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível entrar no evento agora.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!selfId) return;
    try {
      await removeParticipant(slug, selfId);
      clearParticipant(slug);
      setSelfId(null);
      showToast('Você saiu do evento.');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível remover sua participação.');
    }
  };

  const handleIncrement = async (participantId) => {
    const targetId = participantId ?? selfId;
    if (!targetId || targetId !== selfId) return;
    try {
      await incrementParticipant(slug, targetId);
      showToast('+1 registrado!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível registrar agora.');
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copiado!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível copiar o link.');
    }
  };

  if (!configReady) {
    return (
      <main>
        <div className="page">
          <header>
            <div>
              <h1>Gluta-nator</h1>
              <p className="muted">Conclua a configuração para acessar os eventos.</p>
            </div>
          </header>
          <ConfigWarning />
        </div>
        <Toast message={toastMessage} onDismiss={dismissToast} />
      </main>
    );
  }

  if (status === 'missing') {
    return (
      <main>
        <div className="page">
          <header>
            <div>
              <h1>Evento não encontrado</h1>
              <p className="muted">
                Verifique se o link está correto ou se o evento foi removido.
              </p>
              <div className="actions" style={{ marginTop: '1.5rem' }}>
                <Link href="/" className="secondary">
                  Voltar para a home
                </Link>
              </div>
            </div>
          </header>
        </div>
        <Toast message={toastMessage} onDismiss={dismissToast} />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main>
        <div className="page">
          <header>
            <div>
              <h1>Algo deu errado</h1>
              <p className="muted">Tente recarregar a página em instantes.</p>
            </div>
          </header>
        </div>
        <Toast message={toastMessage} onDismiss={dismissToast} />
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main>
        <div className="page">
          <header>
            <div>
              <h1>Carregando evento…</h1>
              <p className="muted">Buscando informações atualizadas.</p>
            </div>
          </header>
        </div>
        <Toast message={toastMessage} onDismiss={dismissToast} />
      </main>
    );
  }

  const createdAtLabel = eventData?.createdAt ? formatTimestamp(eventData.createdAt) : null;

  return (
    <main>
      <div className="page">
        <header>
          <div>
            <h1>{eventData?.name || slug}</h1>
            {createdAtLabel && <p className="muted">Criado em {createdAtLabel}</p>}
          </div>
          <div className="card" style={{ maxWidth: '320px' }}>
            <h2>Compartilhar</h2>
            <p className="muted">Envie o link para os participantes.</p>
            <label>
              Link do evento
              <input type="text" readOnly value={shareUrl} />
            </label>
            <div className="actions" style={{ marginTop: '0.75rem' }}>
              <button type="button" className="secondary" onClick={copyShareLink}>
                Copiar link
              </button>
            </div>
          </div>
        </header>

        <section className="grid two-columns">
          {!selfId ? (
            <div className="card">
              <h2>Participar do evento</h2>
              <p className="muted">Informe seu nome e comece a registrar seus pontos.</p>
              <form onSubmit={handleJoin} className="grid">
                <label>
                  Seu nome
                  <input
                    type="text"
                    value={participantName}
                    placeholder="Ex.: Ana, João, Equipe 1"
                    onChange={(event) => setParticipantName(event.target.value)}
                    required
                  />
                </label>
                <div className="actions">
                  <button type="submit" disabled={isJoining}>
                    {isJoining ? 'Entrando…' : 'Entrar no evento'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <h2>Suas ações</h2>
              <p className="muted">Registre seus pedaços ou saia do evento quando terminar.</p>
              <div className="actions" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={handleIncrement}>
                  +1 pedaço
                </button>
                <button type="button" className="secondary" onClick={handleLeave}>
                  Sair do evento
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h2>Estatísticas rápidas</h2>
            <div className="stats" style={{ marginTop: '1rem' }}>
              <div className="stat-card">
                <span className="muted">Total de pedaços</span>
                <strong>{totalPieces}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Participantes</span>
                <strong>{participants.length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Ranking do evento</h2>
            <Link href="/" className="muted">
              ← Criar outro evento
            </Link>
          </div>
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participante</th>
                  <th>Pedaços</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      Nenhum participante por enquanto.
                    </td>
                  </tr>
                )}
                {participants.map((participant, index) => {
                  const isSelf = participant.id === selfId;
                  const createdAt = formatTimestamp(participant.createdAt);
                  return (
                    <tr key={participant.id} style={isSelf ? { background: 'rgba(56,189,248,0.12)' } : undefined}>
                      <td className="rank">{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{participant.name}</div>
                        {createdAt && (
                          <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Entrou em {createdAt}
                          </div>
                        )}
                      </td>
                      <td>{participant.count}</td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            onClick={() => handleIncrement(participant.id)}
                            disabled={!isSelf}
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => handleRemove(participant.id)}
                            disabled={!isSelf}
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Toast message={toastMessage} onDismiss={dismissToast} />
    </main>
  );

  function handleRemove(participantId) {
    if (participantId !== selfId) return;
    handleLeave();
  }
}
