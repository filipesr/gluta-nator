import {
  get,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
  update
} from 'firebase/database';

import { getFirebaseDatabase } from './firebase';

const EVENTS_PATH = 'events';
const PARTICIPANTS_PATH = 'eventParticipants';

export async function createEvent(name) {
  const db = getFirebaseDatabase();
  let attempts = 0;

  while (attempts < 5) {
    const slug = generateSlug(name, attempts);
    const eventRef = ref(db, `${EVENTS_PATH}/${slug}`);
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

  const fallbackSlug = Date.now().toString(36);
  await set(ref(db, `${EVENTS_PATH}/${fallbackSlug}`), {
    name,
    slug: fallbackSlug,
    createdAt: Date.now()
  });
  return fallbackSlug;
}

export async function fetchEvent(slug) {
  const db = getFirebaseDatabase();
  const snapshot = await get(ref(db, `${EVENTS_PATH}/${slug}`));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val();
}

export function subscribeToParticipants(slug, callback) {
  const db = getFirebaseDatabase();
  const participantsRef = ref(db, `${PARTICIPANTS_PATH}/${slug}`);
  const unsubscribe = onValue(participantsRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return () => unsubscribe();
}

export async function addParticipant(slug, name) {
  const db = getFirebaseDatabase();
  const participantsRef = ref(db, `${PARTICIPANTS_PATH}/${slug}`);
  const newRef = push(participantsRef);
  await set(newRef, {
    name,
    count: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newRef.key;
}

export async function incrementParticipant(slug, participantId) {
  const db = getFirebaseDatabase();
  const countRef = ref(db, `${PARTICIPANTS_PATH}/${slug}/${participantId}/count`);
  await runTransaction(countRef, (current) => (current || 0) + 1);
  await update(ref(db, `${PARTICIPANTS_PATH}/${slug}/${participantId}`), {
    updatedAt: serverTimestamp()
  });
}

export async function removeParticipant(slug, participantId) {
  const db = getFirebaseDatabase();
  await remove(ref(db, `${PARTICIPANTS_PATH}/${slug}/${participantId}`));
}

export function generateSlug(name, attempt = 0) {
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
