const DB_NAME = "wavechat-crypto";
const STORE_NAME = "keys";

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStore(mode, callback) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = callback(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function saveItem(key, value) {
    return withStore("readwrite", (store) => store.put(value, key));
}

export function getItem(key) {
    return withStore("readonly", (store) => store.get(key));
}

export function deleteItem(key) {
    return withStore("readwrite", (store) => store.delete(key));
}
