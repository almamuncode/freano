export type QueuedTransaction = {
  id: string;
  ownerId: string;
  endpoint: "/api/transactions" | "/api/transfers";
  body: Record<string, unknown> & { clientRequestId: string };
  label: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  occurredAt: string;
  queuedAt: string;
  lastError?: string;
};

const DB_NAME = "freano-offline";
const DB_VERSION = 1;
const STORE_NAME = "transactionQueue";
export const QUEUE_CHANGED_EVENT = "freano-offline-queue-changed";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open offline storage"));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Offline storage failed"));
  });
}

function announceQueueChange() {
  window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
}

export async function queueTransaction(item: Omit<QueuedTransaction, "id" | "queuedAt">) {
  const database = await openDatabase();
  const queued: QueuedTransaction = { ...item, id: item.body.clientRequestId, queuedAt: new Date().toISOString() };
  await requestResult(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(queued));
  database.close();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      const backgroundRegistration = registration as ServiceWorkerRegistration & { sync?: { register(tag: string): Promise<void> } };
      return backgroundRegistration.sync?.register("freano-transactions");
    }).catch(() => undefined);
  }
  announceQueueChange();
  return queued;
}

export async function getQueuedTransactions(ownerId: string): Promise<QueuedTransaction[]> {
  const database = await openDatabase();
  const records = await requestResult(
    database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("ownerId").getAll(ownerId),
  );
  database.close();
  return records.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}

async function removeQueuedTransaction(id: string) {
  const database = await openDatabase();
  await requestResult(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id));
  database.close();
}

async function saveQueueError(item: QueuedTransaction, message: string) {
  const database = await openDatabase();
  await requestResult(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ ...item, lastError: message }));
  database.close();
}

let activeSync: Promise<{ synced: number; remaining: number }> | null = null;

export function syncQueuedTransactions(ownerId: string) {
  if (activeSync) return activeSync;

  activeSync = (async () => {
    if (!navigator.onLine) return { synced: 0, remaining: (await getQueuedTransactions(ownerId)).length };
    const queued = await getQueuedTransactions(ownerId);
    let synced = 0;

    for (const item of queued) {
      try {
        const response = await fetch(item.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.body),
        });
        if (response.ok) {
          await removeQueuedTransaction(item.id);
          synced += 1;
          continue;
        }
        if (response.status === 401) break;
        const data = await response.json().catch(() => null);
        await saveQueueError(item, typeof data?.error === "string" ? data.error : "Could not sync this transaction");
      } catch {
        break;
      }
    }

    const remaining = (await getQueuedTransactions(ownerId)).length;
    announceQueueChange();
    return { synced, remaining };
  })().finally(() => {
    activeSync = null;
  });

  return activeSync;
}
