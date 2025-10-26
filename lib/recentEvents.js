const STORAGE_KEY = 'gluta-nator:recent-events';
const MAX_EVENTS = 10;

export function readRecentEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Não foi possível ler eventos recentes', error);
    return [];
  }
}

export function rememberEvent(event) {
  if (typeof window === 'undefined') return;
  const current = readRecentEvents().filter((item) => item.slug !== event.slug);
  current.unshift({ slug: event.slug, name: event.name });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, MAX_EVENTS)));
}
