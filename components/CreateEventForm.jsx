'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createEvent } from '@/lib/events';
import { rememberEvent } from '@/lib/recentEvents';

export default function CreateEventForm({ onToast, onCreated }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState(null);

  const shareUrl = useMemo(() => {
    if (!slug || typeof window === 'undefined') return '';
    return `${window.location.origin}/event/${slug}`;
  }, [slug]);

  const showToast = useCallback(
    (message) => {
      if (typeof onToast === 'function') {
        onToast(message);
      }
    },
    [onToast]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Informe um nome para o evento.');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdSlug = await createEvent(trimmed);
      setSlug(createdSlug);
      rememberEvent({ slug: createdSlug, name: trimmed });
      if (typeof onCreated === 'function') {
        onCreated({ slug: createdSlug, name: trimmed });
      }
      showToast('Evento criado com sucesso!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível criar o evento agora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copiado!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível copiar o link.');
    }
  };

  return (
    <section className="card">
      <h2>Crie um novo evento</h2>
      <p className="muted">
        Gere um link compartilhável para que cada participante controle o próprio placar a partir do
        celular.
      </p>
      <form onSubmit={handleSubmit} className="grid">
        <label>
          Nome do evento
          <input
            type="text"
            placeholder="Ex.: Rodada de sushi da galera"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando…' : 'Criar evento'}
          </button>
        </div>
      </form>

      {slug && (
        <div className="grid" style={{ marginTop: '1.25rem' }}>
          <div>
            <label>
              Link de compartilhamento
              <input type="text" value={shareUrl} readOnly />
            </label>
            <div className="actions" style={{ marginTop: '0.75rem' }}>
              <button type="button" className="secondary" onClick={handleCopy}>
                Copiar link
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => router.push(`/event/${slug}`)}
              >
                Abrir painel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
