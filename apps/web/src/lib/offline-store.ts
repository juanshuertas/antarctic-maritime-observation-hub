/**
 * AMOH Field Connect — durable offline observation store.
 * The client observation UUID is the same ID used in IndexedDB and by the server.
 */
export type ObservationSyncStatus = 'LOCAL_SAVED' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_ERROR';

export interface PendingObservation {
  id: string;
  observation_id: string;
  expedition_id?: string;
  payload: any;
  timestamp: string;
  sync_status: ObservationSyncStatus;
  synced_at?: string;
  server_hash?: string;
  sync_destination?: 'CLOUD_RELAY' | 'LOCAL_API';
  receipt_id?: string;
  last_error?: string;
}

const DB_NAME = 'amoh_offline_store';
const STORE_NAME = 'observations';
const DB_VERSION = 2;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        store = request.transaction!.objectStore(STORE_NAME);
      }
      if (!store.indexNames.contains('sync_status')) {
        store.createIndex('sync_status', 'sync_status', { unique: false });
      }
      if (!store.indexNames.contains('expedition_id')) {
        store.createIndex('expedition_id', 'expedition_id', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function getRecord(id: string): Promise<PendingObservation | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as PendingObservation | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function getAllRecords(): Promise<PendingObservation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result || []) as PendingObservation[]);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStore = {
  async save(payload: any, observationId?: string, expeditionId?: string): Promise<string> {
    const id = observationId || payload?.observation_id || crypto.randomUUID();
    const record: PendingObservation = {
      id,
      observation_id: id,
      expedition_id: expeditionId || payload?.expedition_id,
      payload: { ...payload, observation_id: id },
      timestamp: new Date().toISOString(),
      sync_status: 'LOCAL_SAVED',
    };
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    await txDone(tx);
    return id;
  },

  async get(id: string): Promise<PendingObservation | undefined> {
    return getRecord(id);
  },

  async getAll(): Promise<PendingObservation[]> {
    return getAllRecords();
  },

  async getPending(expeditionId?: string): Promise<PendingObservation[]> {
    const all = await getAllRecords();
    return all.filter((item) => item.sync_status !== 'SYNCED' && (!expeditionId || item.expedition_id === expeditionId));
  },

  async markStatus(
    id: string,
    status: ObservationSyncStatus,
    extra: {
      serverHash?: string;
      lastError?: string;
      syncDestination?: PendingObservation['sync_destination'];
      receiptId?: string;
    } = {},
  ): Promise<void> {
    const current = await getRecord(id);
    if (!current) return;
    const next: PendingObservation = {
      ...current,
      sync_status: status,
      server_hash: extra.serverHash ?? current.server_hash,
      sync_destination: extra.syncDestination ?? current.sync_destination,
      receipt_id: extra.receiptId ?? current.receipt_id,
      last_error: extra.lastError,
      synced_at: status === 'SYNCED' ? new Date().toISOString() : current.synced_at,
    };
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(next);
    await txDone(tx);
  },

  async remove(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    await txDone(tx);
  },
};
