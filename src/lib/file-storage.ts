// Client-side file storage using IndexedDB
// Files stored in browser, only metadata in database

interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: ArrayBuffer;
  uploadDate: Date;
}

class FileStorage {
  private dbName = 'canban-files';
  private version = 1;
  private storeName = 'files';

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async storeFile(file: File): Promise<string> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    
    const arrayBuffer = await file.arrayBuffer();
    const storedFile: StoredFile = {
      id,
      name: file.name,
      type: file.type,
      data: arrayBuffer,
      uploadDate: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.add(storedFile);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<StoredFile | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getFileURL(id: string): Promise<string | null> {
    const file = await this.getFile(id);
    if (!file) return null;
    
    const blob = new Blob([file.data], { type: file.type });
    return URL.createObjectURL(blob);
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFiles(): Promise<StoredFile[]> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const fileStorage = new FileStorage();