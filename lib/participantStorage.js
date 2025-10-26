const STORAGE_PREFIX = 'gluta-nator:event:';

function getKey(slug) {
  return `${STORAGE_PREFIX}${slug}:participant`;
}

export function readParticipant(slug) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(getKey(slug));
}

export function writeParticipant(slug, participantId) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getKey(slug), participantId);
}

export function clearParticipant(slug) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getKey(slug));
}
