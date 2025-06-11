import { createStore, get, set, del, keys, clear } from 'idb-keyval';

// Две отдельные БД, чтобы не было конфликта object store
const stateStore    = createStore('markirovka-state-db',    'state');
const snapshotStore = createStore('markirovka-snapshots-db','snapshots');

export interface AppState {
  [key: string]: any;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  data: AppState;
}

const MAX_SNAPSHOTS = 50;

export const getAppState = async (): Promise<AppState | null> => {
  const s = await get<AppState>('state', stateStore);
  return s || null;
};

export const setAppState = async (state: AppState): Promise<void> => {
  await set('state', state, stateStore);
};

export const getSnapshots = async (): Promise<Snapshot[]> => {
  const allKeys = (await keys(snapshotStore)) as string[];
  const all: Snapshot[] = [];
  for (const key of allKeys) {
    const snap = await get<Snapshot>(key, snapshotStore);
    if (snap) all.push(snap);
  }
  all.sort((a, b) => a.timestamp - b.timestamp);
  return all;
};

export const saveSnapshot = async (snapshot: Snapshot): Promise<void> => {
  await set(snapshot.id, snapshot, snapshotStore);
  const all = await getSnapshots();
  if (all.length > MAX_SNAPSHOTS) {
    const toRemove = all.slice(0, all.length - MAX_SNAPSHOTS);
    for (const old of toRemove) {
      await del(old.id, snapshotStore);
    }
  }
};

export const deleteSnapshot = async (id: string): Promise<void> => {
  await del(id, snapshotStore);
};

export const clearSnapshots = async (): Promise<void> => {
  await clear(snapshotStore);
};
