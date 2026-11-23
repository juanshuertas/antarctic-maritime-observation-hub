/** PB124 original-photo vault: append-only, independent of network and upload receipts. */
import type { GuidedPhotoLabel } from './pb124-media';

const DB = 'amoh_pb124_photo_drafts_v8';
const STORE = 'photos';
const KEY = 'pb124_current_photo_draft_v8';

export function currentPB124PhotoDraftId(): string {
  let value = localStorage.getItem(KEY);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(KEY, value);
  }
  return value;
}
export function advancePB124PhotoDraft(): string {
  const next = crypto.randomUUID();
  localStorage.setItem(KEY, next);
  return next;
}

interface SavedPhoto {
  id: string;
  draftId: string;
  label: GuidedPhotoLabel;
  file: Blob;
  name: string;
  type: string;
  lastModified: number;
  savedAt: string;
}

export interface PB124PhotoDraftSummary {
  id: string;
  draftId: string;
  label: GuidedPhotoLabel;
  name: string;
  type: string;
  lastModified: number;
  savedAt: string;
  byteSize: number;
}

export interface PB124PhotoDraft extends PB124PhotoDraftSummary {
  file: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB unavailable'));
  });
}

export async function preservePB124Photo(label: GuidedPhotoLabel, file: File, draftId: string): Promise<void> {
  if (!file.size) throw new Error('Empty photo; select the original file again.');
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const record: SavedPhoto = {
        id: crypto.randomUUID(), draftId, label,
        file, name: file.name || `${label.toLowerCase()}.jpg`,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified || Date.now(),
        savedAt: new Date().toISOString(),
      };
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Photo preservation failed'));
      tx.onabort = () => reject(tx.error || new Error('Photo preservation aborted'));
    });
  } finally { db.close(); }
}

export async function recoverPB124PhotoDraft(draftId: string): Promise<Array<{ label: GuidedPhotoLabel; file: File }>> {
  const db = await openDB();
  try {
    const rows = await new Promise<SavedPhoto[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as SavedPhoto[]);
      req.onerror = () => reject(req.error || new Error('Photo recovery failed'));
    });
    const selected = new Map<GuidedPhotoLabel, SavedPhoto>();
    for (const item of rows.filter(x => x.draftId === draftId).sort((a, b) => a.savedAt.localeCompare(b.savedAt))) {
      if (item.file?.size) selected.set(item.label, item);
    }
    return Array.from(selected.values()).map(x => ({
      label: x.label,
      file: new File([x.file], x.name, { type: x.type, lastModified: x.lastModified }),
    }));
  } finally { db.close(); }
}

export async function listPB124PhotoDrafts(): Promise<PB124PhotoDraftSummary[]> {
  const db = await openDB();
  try {
    const rows = await new Promise<SavedPhoto[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as SavedPhoto[]);
      req.onerror = () => reject(req.error || new Error('Photo inventory failed'));
    });
    return rows
      .map(({ id, draftId, label, name, type, lastModified, savedAt, file }) => ({
        id, draftId, label, name, type, lastModified, savedAt, byteSize: file?.size || 0,
      }))
      .sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  } finally { db.close(); }
}

export async function getPB124PhotoDraft(id: string): Promise<PB124PhotoDraft | undefined> {
  const db = await openDB();
  try {
    const row = await new Promise<SavedPhoto | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as SavedPhoto | undefined);
      req.onerror = () => reject(req.error || new Error('Photo retrieval failed'));
    });
    if (!row) return undefined;
    return {
      id: row.id,
      draftId: row.draftId,
      label: row.label,
      name: row.name,
      type: row.type,
      lastModified: row.lastModified,
      savedAt: row.savedAt,
      byteSize: row.file?.size || 0,
      file: row.file,
    };
  } finally { db.close(); }
}
