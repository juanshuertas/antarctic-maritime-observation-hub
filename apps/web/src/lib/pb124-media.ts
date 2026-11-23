export type MediaSyncStatus = 'LOCAL_SAVED' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_ERROR';

export type GuidedPhotoLabel = 'HORIZON' | 'SEA_SURFACE' | 'CONTEXT';

export interface PendingMediaRecord {
  id: string;
  observation_id: string;
  expedition_id: string;
  participant_id: string;
  capture_label: GuidedPhotoLabel;
  original_name: string;
  mime_type: string;
  original: Blob;
  preview?: Blob;
  thumbnail?: Blob;
  sha256_original: string;
  sha256_preview?: string;
  sha256_thumbnail?: string;
  app_metadata: Record<string, unknown>;
  sync_status: MediaSyncStatus;
  created_at: string;
  synced_at?: string;
  sync_destination?: 'CLOUD_RELAY' | 'LOCAL_API';
  receipt_id?: string;
  verified_sha256?: string;
  last_error?: string;
}

export type PendingMediaInventory = Pick<
  PendingMediaRecord,
  | 'id'
  | 'observation_id'
  | 'expedition_id'
  | 'participant_id'
  | 'capture_label'
  | 'original_name'
  | 'mime_type'
  | 'sha256_original'
  | 'sync_status'
  | 'created_at'
  | 'synced_at'
  | 'sync_destination'
  | 'receipt_id'
  | 'verified_sha256'
  | 'last_error'
> & { byte_size: number };

const DB_NAME = 'amoh_pb124_media_store';
const DB_VERSION = 1;
const STORE = 'media';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      const store = db.objectStoreNames.contains(STORE)
        ? req.transaction!.objectStore(STORE)
        : db.createObjectStore(STORE, { keyPath: 'id' });
      if (!store.indexNames.contains('observation_id')) {
        store.createIndex('observation_id', 'observation_id', { unique: false });
      }
      if (!store.indexNames.contains('expedition_id')) {
        store.createIndex('expedition_id', 'expedition_id', { unique: false });
      }
      if (!store.indexNames.contains('sync_status')) {
        store.createIndex('sync_status', 'sync_status', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function sha256(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function imageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    // The decoded image remains usable after revoking its source URL.
    URL.revokeObjectURL(url);
  }
}

async function resizedJpeg(blob: Blob, maxDimension: number, quality: number): Promise<Blob | undefined> {
  try {
    const image = await imageFromBlob(blob);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return undefined;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | undefined>((resolve) => {
      canvas.toBlob((out) => resolve(out || undefined), 'image/jpeg', quality);
    });
  } catch {
    return undefined;
  }
}

export async function prepareGuidedMedia(args: {
  file: File;
  observationId: string;
  expeditionId: string;
  participantId: string;
  label: GuidedPhotoLabel;
  appMetadata: Record<string, unknown>;
}): Promise<PendingMediaRecord> {
  const mediaId = crypto.randomUUID();
  const preview = await resizedJpeg(args.file, 1600, 0.86);
  const thumbnail = await resizedJpeg(args.file, 480, 0.78);

  return {
    id: mediaId,
    observation_id: args.observationId,
    expedition_id: args.expeditionId,
    participant_id: args.participantId,
    capture_label: args.label,
    original_name: args.file.name || `${args.label.toLowerCase()}.jpg`,
    mime_type: args.file.type || 'application/octet-stream',
    original: args.file,
    preview,
    thumbnail,
    sha256_original: await sha256(args.file),
    sha256_preview: preview ? await sha256(preview) : undefined,
    sha256_thumbnail: thumbnail ? await sha256(thumbnail) : undefined,
    app_metadata: args.appMetadata,
    sync_status: 'LOCAL_SAVED',
    created_at: new Date().toISOString(),
  };
}

async function getAll(): Promise<PendingMediaRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []) as PendingMediaRecord[]);
    req.onerror = () => reject(req.error);
  });
}

async function getOne(id: string): Promise<PendingMediaRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as PendingMediaRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function getInventory(expeditionId?: string): Promise<PendingMediaInventory[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).openCursor();
    const records: PendingMediaInventory[] = [];
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(records);
        return;
      }
      const media = cursor.value as PendingMediaRecord;
      if (!expeditionId || media.expedition_id === expeditionId) {
        const {
          id, observation_id, expedition_id, participant_id, capture_label,
          original_name, mime_type, sha256_original, sync_status, created_at,
          synced_at, sync_destination, receipt_id, verified_sha256, last_error,
          original,
        } = media;
        records.push({
          id, observation_id, expedition_id, participant_id, capture_label,
          original_name, mime_type, sha256_original, sync_status, created_at,
          synced_at, sync_destination, receipt_id, verified_sha256, last_error,
          byte_size: original?.size || 0,
        });
      }
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const mediaStore = {
  async save(record: PendingMediaRecord): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    await txDone(tx);
  },

  async getPending(expeditionId?: string): Promise<PendingMediaRecord[]> {
    const all = await getAll();
    return all.filter((m) => m.sync_status !== 'SYNCED' && (!expeditionId || m.expedition_id === expeditionId));
  },

  async getAllForObservation(observationId: string): Promise<PendingMediaRecord[]> {
    const all = await getAll();
    return all.filter((m) => m.observation_id === observationId);
  },

  async getPendingForObservation(observationId: string): Promise<PendingMediaRecord[]> {
    const all = await getAll();
    return all.filter((m) => m.observation_id === observationId && m.sync_status !== 'SYNCED');
  },

  async getById(id: string): Promise<PendingMediaRecord | undefined> {
    return getOne(id);
  },

  async getInventory(expeditionId?: string): Promise<PendingMediaInventory[]> {
    return getInventory(expeditionId);
  },

  async markStatus(
    id: string,
    status: MediaSyncStatus,
    lastError?: string,
    verification: {
      syncDestination?: PendingMediaRecord['sync_destination'];
      receiptId?: string;
      verifiedSha256?: string;
    } = {},
  ): Promise<void> {
    const current = await getOne(id);
    if (!current) return;
    const next: PendingMediaRecord = {
      ...current,
      sync_status: status,
      last_error: lastError,
      sync_destination: verification.syncDestination ?? current.sync_destination,
      receipt_id: verification.receiptId ?? current.receipt_id,
      verified_sha256: verification.verifiedSha256 ?? current.verified_sha256,
      synced_at: status === 'SYNCED' ? new Date().toISOString() : current.synced_at,
    };
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(next);
    await txDone(tx);
  },
};
