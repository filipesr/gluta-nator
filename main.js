import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue,
  runTransaction,
  serverTimestamp,
  remove
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';
import { firebaseConfig } from './config.js';

const homeScreen = document.getElementById('home-screen');
const eventScreen = document.getElementById('event-screen');
const toast = document.getElementById('toast');
const alertBox = document.getElementById('event-alert');

const PLACEHOLDER_FLAG = 'YOUR_FIREBASE_';
const configContainsPlaceholders = Object.values(firebaseConfig).some(
  (value) => typeof value === 'string' && value.includes(PLACEHOLDER_FLAG)
);

if (configContainsPlaceholders) {
  showConfigWarning();
} else {
  initialize();
}

function showConfigWarning() {
  document.body.classList.add('config-warning');
  const message = document.createElement('div');
  message.className = 'card';
  message.style.marginTop = '2rem';
  message.innerHTML = `
    <h2>Configuração do Firebase pendente</h2>
    <p>
      Preencha o arquivo <code>config.js</code> com as credenciais do seu projeto Firebase
      (Realtime Database) para que o sistema funcione. Veja o passo a passo no README.
    </p>
  `;
  document.querySelector('main').prepend(message);
  homeScreen.hidden = false;
}

function initialize() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const pathname = window.location.pathname.replace(/\/+$/, '');

  if (pathname.startsWith('/event/')) {
    const slug = decodeURIComponent(pathname.split('/')[2] || '');
    mountEventScreen(db, slug);
  } else {
    mountHomeScreen(db);
  }
}

function mountHomeScreen(db) {
  homeScreen.hidden = false;

  const form = document.getElementById('create-event-form');
  const nameInput = document.getElementById('event-name');
  const resultBox = document.getElementById('create-event-result');
  const shareLink = document.getElementById('share-link');
  const copyButton = document.getElementById('copy-share-link');
  const recentEventsSection = document.getElementById('recent-events');
  const recentEventsList = document.getElementById('recent-events-list');

  renderRecentEvents();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      showToast('Informe um nome para o evento.');
      return;
    }

    form.querySelector('button').disabled = true;
    try {
      const slug = await createEvent(db, name);
      const link = `${window.location.origin}/event/${slug}`;
      shareLink.value = link;
      resultBox.hidden = false;
      showToast('Evento criado com sucesso!');
      addRecentEvent({ slug, name });
      renderRecentEvents();
    } catch (error) {
      console.error(error);
      showToast('Não foi possível criar o evento. Tente novamente.');
    } finally {
      form.querySelector('button').disabled = false;
    }
  });

  copyButton.addEventListener('click', () => {
    if (!shareLink.value) return;
    navigator.clipboard
      .writeText(shareLink.value)
      .then(() => showToast('Link copiado!'))
      .catch(() => showToast('Não foi possível copiar.'));
  });

  function renderRecentEvents() {
    const events = getRecentEvents();
    if (!events.length) {
      recentEventsSection.hidden = true;
      return;
    }

    recentEventsList.innerHTML = '';
    events.forEach((item) => {
      const element = document.createElement('li');
      element.innerHTML = `
        <a href="/event/${item.slug}">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="muted"> – ${item.slug}</span>
        </a>
      `;
      recentEventsList.appendChild(element);
    });

    recentEventsSection.hidden = false;
  }
}

function mountEventScreen(db, slug) {
  eventScreen.hidden = false;
  const eventTitle = document.getElementById('event-title');
  const eventCreatedAt = document.getElementById('event-created-at');
  const shareLink = document.getElementById('event-share-link');
  const copyButton = document.getElementById('event-copy-link');
  const participantForm = document.getElementById('participant-form');
  const participantNameInput = document.getElementById('participant-name');
  const participantsTableBody = document.getElementById('participants-table-body');
  const totalCountEl = document.getElementById('stat-total-count');
  const totalParticipantsEl = document.getElementById('stat-total-participants');
  const selfActions = document.getElementById('self-actions');
  const selfName = document.getElementById('self-name');
  const changeParticipantButton = document.getElementById('change-participant');

  if (!slug) {
    showAlert('Código do evento inválido. Verifique o link.');
    participantForm.hidden = true;
    shareLink.value = window.location.href;
    return;
  }

  shareLink.value = `${window.location.origin}/event/${slug}`;

  copyButton.addEventListener('click', () => {
    navigator.clipboard
      .writeText(shareLink.value)
      .then(() => showToast('Link copiado!'))
      .catch(() => showToast('Não foi possível copiar.'));
  });

  const eventRef = ref(db, `events/${slug}`);
  get(eventRef).then((snapshot) => {
    if (!snapshot.exists()) {
      showAlert('Este evento não existe ou foi removido.');
      participantForm.hidden = true;
      return;
    }

    const data = snapshot.val();
    eventTitle.textContent = data.name;
    eventCreatedAt.textContent = data.createdAt
      ? `Criado em ${formatDateTime(data.createdAt)}`
      : '';
  });

  const participantStorageKey = getParticipantStorageKey(slug);
  let selfParticipantId = localStorage.getItem(participantStorageKey);

  if (selfParticipantId) {
    selfActions.hidden = false;
  }

  changeParticipantButton.addEventListener('click', () => {
    localStorage.removeItem(participantStorageKey);
    selfParticipantId = null;
    selfActions.hidden = true;
    participantNameInput.value = '';
    showToast('Você pode entrar novamente com outro nome.');
  });

  participantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = participantNameInput.value.trim();
    if (!name) {
      showToast('Informe um nome para participar.');
      return;
    }

    participantForm.querySelector('button').disabled = true;

    try {
      const participantId = await addParticipant(db, slug, name);
      selfParticipantId = participantId;
      localStorage.setItem(participantStorageKey, participantId);
      selfName.textContent = name;
      selfActions.hidden = false;
      participantNameInput.value = '';
      showToast('Você entrou no evento!');
    } catch (error) {
      console.error(error);
      showToast('Não foi possível entrar no evento.');
    } finally {
      participantForm.querySelector('button').disabled = false;
    }
  });

  const participantsRef = ref(db, `eventParticipants/${slug}`);
  onValue(participantsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const participants = Object.entries(data).map(([id, value]) => ({
      id,
      name: value.name || 'Sem nome',
      count: value.count || 0,
      createdAt: value.createdAt || null,
      updatedAt: value.updatedAt || null
    }));

    participants.sort((a, b) => {
      if (b.count === a.count) {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      return b.count - a.count;
    });

    const totalCount = participants.reduce((sum, item) => sum + item.count, 0);
    totalCountEl.textContent = totalCount.toString();
    totalParticipantsEl.textContent = participants.length.toString();

    participantsTableBody.innerHTML = '';
    let selfStillPresent = false;
    participants.forEach((participant, index) => {
      const row = document.createElement('tr');
      if (participant.id === selfParticipantId) {
        row.classList.add('highlight');
        selfName.textContent = participant.name;
        selfActions.hidden = false;
        selfStillPresent = true;
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <div class="participant-name">${escapeHtml(participant.name)}</div>
          <div class="muted small">Criado em ${formatDateTime(participant.createdAt)}</div>
        </td>
        <td>${participant.count}</td>
        <td>
          <div class="actions">
            <button type="button" class="secondary-button increment-button" data-id="${participant.id}" ${
              participant.id === selfParticipantId ? '' : 'disabled'
            }>+1</button>
            <button type="button" class="link-button danger remove-button" data-id="${participant.id}" ${
              participant.id === selfParticipantId ? '' : 'disabled'
            }>Remover</button>
          </div>
        </td>
      `;

      participantsTableBody.appendChild(row);
    });

    if (!selfStillPresent && selfParticipantId) {
      localStorage.removeItem(participantStorageKey);
      selfParticipantId = null;
      selfActions.hidden = true;
    }

    if (!participants.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4">Nenhum participante por enquanto.</td>';
      participantsTableBody.appendChild(row);
    }
  });

  participantsTableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const participantId = target.dataset.id;
    if (!participantId) return;

    if (target.classList.contains('increment-button')) {
      if (participantId !== selfParticipantId) return;
      await incrementParticipant(db, slug, participantId);
    } else if (target.classList.contains('remove-button')) {
      if (participantId !== selfParticipantId) return;
      if (confirm('Tem certeza que deseja sair do evento?')) {
        await removeParticipant(db, slug, participantId);
        localStorage.removeItem(participantStorageKey);
        selfParticipantId = null;
        selfActions.hidden = true;
      }
    }
  });
}

async function createEvent(db, name) {
  let attempts = 0;
  while (attempts < 5) {
    const slug = generateSlug(name, attempts);
    const eventRef = ref(db, `events/${slug}`);
    const snapshot = await get(eventRef);
    if (!snapshot.exists()) {
      await set(eventRef, {
        name,
        slug,
        createdAt: Date.now()
      });
      return slug;
    }
    attempts += 1;
  }

  const fallbackSlug = `${Date.now().toString(36)}`;
  await set(ref(db, `events/${fallbackSlug}`), {
    name,
    slug: fallbackSlug,
    createdAt: Date.now()
  });
  return fallbackSlug;
}

async function addParticipant(db, slug, name) {
  const participantsRef = ref(db, `eventParticipants/${slug}`);
  const newRef = push(participantsRef);
  await set(newRef, {
    name,
    count: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newRef.key;
}

async function incrementParticipant(db, slug, participantId) {
  const countRef = ref(db, `eventParticipants/${slug}/${participantId}/count`);
  try {
    await runTransaction(countRef, (current) => (current || 0) + 1);
    await set(ref(db, `eventParticipants/${slug}/${participantId}/updatedAt`), serverTimestamp());
    showToast('+1 registrado!');
  } catch (error) {
    console.error(error);
    showToast('Não foi possível atualizar agora.');
  }
}

async function removeParticipant(db, slug, participantId) {
  try {
    await remove(ref(db, `eventParticipants/${slug}/${participantId}`));
    showToast('Participante removido.');
  } catch (error) {
    console.error(error);
    showToast('Não foi possível remover.');
  }
}

function generateSlug(name, attempt = 0) {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .split('-')
    .filter(Boolean)
    .slice(0, 3)
    .join('-');
  const random = Math.random().toString(36).slice(2, 6 + attempt);
  return normalized ? `${normalized}-${random}` : `evento-${random}`;
}

function getParticipantStorageKey(slug) {
  return `gluta-nator:event:${slug}:participant`;
}

function getRecentEvents() {
  const raw = localStorage.getItem('gluta-nator:recent-events');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch (error) {
    console.warn('Erro ao ler eventos recentes', error);
    return [];
  }
}

function addRecentEvent(event) {
  const events = getRecentEvents().filter((item) => item.slug !== event.slug);
  events.unshift({ slug: event.slug, name: event.name });
  localStorage.setItem('gluta-nator:recent-events', JSON.stringify(events.slice(0, 10)));
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.hidden = false;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = typeof value === 'number' ? new Date(value) : new Date(Number(value));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}
