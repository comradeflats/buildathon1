import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'buildathon_ownership';
const DB_VERSION = 1;
const STORE_NAME = 'ownership';

interface OwnershipData {
  ownershipId: string;
  teamIds: string[];
  createdAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available on server'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'ownershipId' });
      }
    };
  });
}

export async function getOrCreateOwnershipToken(): Promise<string> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Get all records (we only expect one)
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result as OwnershipData[];

      if (records.length > 0) {
        // Return existing ownership token
        resolve(records[0].ownershipId);
      } else {
        // Create new ownership token
        const newOwnership: OwnershipData = {
          ownershipId: uuidv4(),
          teamIds: [],
          createdAt: new Date().toISOString(),
        };

        const addRequest = store.add(newOwnership);
        addRequest.onsuccess = () => resolve(newOwnership.ownershipId);
        addRequest.onerror = () => reject(addRequest.error);
      }
    };

    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}

export async function getOwnershipToken(): Promise<string | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result as OwnershipData[];
        resolve(records.length > 0 ? records[0].ownershipId : null);
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  } catch {
    return null;
  }
}

export async function addTeamToOwnership(teamId: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result as OwnershipData[];

      if (records.length > 0) {
        const ownership = records[0];
        if (!ownership.teamIds.includes(teamId)) {
          ownership.teamIds.push(teamId);
          const putRequest = store.put(ownership);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      } else {
        reject(new Error('No ownership record found'));
      }
    };

    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}

export async function getOwnedTeamIds(): Promise<string[]> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result as OwnershipData[];
        resolve(records.length > 0 ? records[0].teamIds : []);
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  } catch {
    return [];
  }
}
