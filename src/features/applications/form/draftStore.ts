// Device-local drafts for the Advisor's application form.
//
// The API can't hold real drafts yet (is_draft exists, but required documents
// are validated even for drafts), so unfinished work is kept in this browser's
// IndexedDB: every field, the step, and the chosen files as Blobs. Nothing here
// ever throws: if storage is unavailable (private mode, quota, old browser)
// the form simply works without drafts.
//
// The storage layer is injectable so the store is unit-tested with an
// in-memory fake (see __tests__/draftStore.test.ts).

import type { DocumentItem, FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import type { ApplicationFormStepId } from "./applicationFormModel";

/** What the form hands in and gets back: the form exactly as it was. */
export interface ApplicationDraft {
  formData: FormDataType;
  step: ApplicationFormStepId;
  completed: ApplicationFormStepId[];
  /** Epoch ms. */
  savedAt: number;
}

/** A chosen file, kept as a Blob next to the serialisable form. */
interface StoredFile {
  document_type_id: string;
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
}

/** The record written to storage. Documents lose `raw`; files go in `files`. */
export interface StoredDraft {
  version: 1;
  formData: FormDataType;
  step: ApplicationFormStepId;
  completed: ApplicationFormStepId[];
  savedAt: number;
  files: StoredFile[];
}

/** Minimal key-value storage the draft store needs. */
export interface DraftStorage {
  get(key: string): Promise<StoredDraft | undefined>;
  put(key: string, value: StoredDraft): Promise<void>;
  delete(key: string): Promise<void>;
}

const DB_NAME = "unibexs-drafts";
const STORE = "application-drafts";

const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** IndexedDB-backed storage. Rejects (never throws synchronously) when IndexedDB is missing or blocked. */
export function indexedDbStorage(): DraftStorage {
  let db: Promise<IDBDatabase> | null = null;
  const open = () => {
    if (!db) {
      db = new Promise<IDBDatabase>((resolve, reject) => {
        if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB is unavailable"));
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("IndexedDB is blocked"));
      });
      db.catch(() => (db = null));
    }
    return db;
  };
  const run = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) => {
    const tx = (await open()).transaction(STORE, mode);
    const result = await request(fn(tx.objectStore(STORE)));
    if (mode === "readwrite")
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
      });
    return result;
  };
  return {
    get: (key) => run("readonly", (s) => s.get(key) as IDBRequest<StoredDraft | undefined>),
    put: async (key, value) => void (await run("readwrite", (s) => s.put(value, key))),
    delete: async (key) => void (await run("readwrite", (s) => s.delete(key))),
  };
}

/**
 * One draft per signed-in user and per form: "new" for New application, the
 * programme id for Apply for programme. Two Advisors on one browser never see
 * each other's drafts. Null until the user is known (no drafts then).
 */
export function draftKey(userId: string | null | undefined, form: { programId?: string } = {}): string | null {
  if (!userId) return null;
  return `application:${userId}:${form.programId ? `programme:${form.programId}` : "new"}`;
}

function toStored(draft: ApplicationDraft): StoredDraft {
  const files: StoredFile[] = [];
  const documents: DocumentItem[] = draft.formData.documents.map(({ raw, ...doc }) => {
    if (raw) files.push({ document_type_id: doc.document_type_id, blob: raw, name: raw.name, type: raw.type, lastModified: raw.lastModified });
    return { ...doc };
  });
  return { version: 1, formData: { ...draft.formData, documents }, step: draft.step, completed: [...draft.completed], savedAt: draft.savedAt, files };
}

function fromStored(stored: StoredDraft): ApplicationDraft {
  const documents = stored.formData.documents
    .map((doc) => {
      const f = stored.files.find((x) => x.document_type_id === doc.document_type_id);
      const raw = f ? (f.blob instanceof File ? f.blob : new File([f.blob], f.name, { type: f.type, lastModified: f.lastModified })) : undefined;
      return { ...doc, raw };
    })
    // A half-finished upload with no file to retry can't be recovered.
    .filter((doc) => doc.file_key || doc.raw);
  return { formData: { ...stored.formData, documents }, step: stored.step, completed: stored.completed ?? [], savedAt: stored.savedAt };
}

export interface DraftStore {
  /** True when written; false when storage failed. */
  save(key: string, draft: ApplicationDraft): Promise<boolean>;
  /** The draft, or null when none (or storage failed). */
  load(key: string): Promise<ApplicationDraft | null>;
  /** True when removed (or already gone); false when storage failed. */
  discard(key: string): Promise<boolean>;
}

export function createDraftStore(storage: DraftStorage | (() => DraftStorage) = indexedDbStorage): DraftStore {
  let resolved: DraftStorage | null = null;
  const get = () => (resolved ??= typeof storage === "function" ? storage() : storage);
  return {
    async save(key, draft) {
      try {
        await get().put(key, toStored(draft));
        return true;
      } catch {
        return false;
      }
    },
    async load(key) {
      try {
        const stored = await get().get(key);
        return stored && stored.version === 1 ? fromStored(stored) : null;
      } catch {
        return null;
      }
    },
    async discard(key) {
      try {
        await get().delete(key);
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** Shared IndexedDB store for the app. */
export const applicationDrafts = createDraftStore();
