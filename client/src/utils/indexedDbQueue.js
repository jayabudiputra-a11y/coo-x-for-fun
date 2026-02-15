const DB_NAME = "coox_offline_db";
const STORE = "sync_queue";

export function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function queueAction(data) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add({
    payload: data,
    createdAt: Date.now()
  });
}

export async function flushQueue(handler) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const all = await new Promise(res => {
    const r = store.getAll();
    r.onsuccess = () => res(r.result);
  });

  for (const item of all) {
    try {
      await handler(item.payload);
      store.delete(item.id);
    } catch {}
  }
}
