import { Question } from './dataUniversity';

// Single, small in-memory store implementation. Short-lived and not persistent.
type StoredSimulation = {
  questions: Question[];
  expiresAt: number;
};

const STORE = new Map<string, StoredSimulation>();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function saveSimulation(questions: Question[], ttlMs = DEFAULT_TTL_MS) {
  const id = makeId();
  const expiresAt = Date.now() + ttlMs;
  STORE.set(id, { questions, expiresAt });
  // schedule cleanup
  setTimeout(() => STORE.delete(id), ttlMs + 1000);
  console.log(`simulationStore: saved id=${id} count=${questions.length}`);
  return id;
}

export function getSimulation(id: string): Question[] | null {
  const item = STORE.get(id);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    STORE.delete(id);
    return null;
  }
  return item.questions;
}

export function _storeSize() {
  return STORE.size;
}