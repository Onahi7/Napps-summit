import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ValidationRecord {
  id: string;
  registrationId: string;
  mealSessionId: string;
  validatedAt: string;
  validatedBy: string;
  synced: boolean;
}

interface OfflineDB extends DBSchema {
  validations: {
    key: string;
    value: ValidationRecord;
    indexes: { 'by-synced': boolean };
  };
  registrations: {
    key: string;
    value: any;
    indexes: { 'by-phone': string };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private syncInProgress = false;

  async init() {
    this.db = await openDB<OfflineDB>('nces-offline', 1, {
      upgrade(db) {
        // Validations store
        const validationStore = db.createObjectStore('validations', {
          keyPath: 'id',
        });
        validationStore.createIndex('by-synced', 'synced');

        // Registrations store
        const registrationStore = db.createObjectStore('registrations', {
          keyPath: 'id',
        });
        registrationStore.createIndex('by-phone', 'phone');
      },
    });
  }

  async storeValidation(validation: Omit<ValidationRecord, 'synced'>) {
    if (!this.db) await this.init();
    
    const record: ValidationRecord = {
      ...validation,
      synced: false,
    };
    
    await this.db!.add('validations', record);
  }

  async storeRegistrations(registrations: any[]) {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('registrations', 'readwrite');
    await Promise.all([
      ...registrations.map(reg => tx.store.put(reg)),
      tx.done,
    ]);
  }

  async getUnsyncedValidations(): Promise<ValidationRecord[]> {
    if (!this.db) await this.init();
    
    return this.db!.getAllFromIndex('validations', 'by-synced', false);
  }

  async findRegistrationByPhone(phone: string) {
    if (!this.db) await this.init();
    
    return this.db!.getAllFromIndex('registrations', 'by-phone', phone);
  }

  async markValidationsSynced(ids: string[]) {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('validations', 'readwrite');
    await Promise.all([
      ...ids.map(async id => {
        const validation = await tx.store.get(id);
        if (validation) {
          validation.synced = true;
          await tx.store.put(validation);
        }
      }),
      tx.done,
    ]);
  }

  async syncWithServer(syncFunction: (validations: ValidationRecord[]) => Promise<string[]>) {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      
      // Get unsynced validations
      const unsynced = await this.getUnsyncedValidations();
      if (unsynced.length === 0) return;
      
      // Sync with server
      const syncedIds = await syncFunction(unsynced);
      
      // Mark as synced
      await this.markValidationsSynced(syncedIds);
      
    } finally {
      this.syncInProgress = false;
    }
  }

  async clearOldData(daysToKeep = 7) {
    if (!this.db) await this.init();
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    // Clear old validations
    const tx = this.db!.transaction('validations', 'readwrite');
    const validations = await tx.store.getAll();
    
    await Promise.all([
      ...validations
        .filter(v => new Date(v.validatedAt) < cutoff && v.synced)
        .map(v => tx.store.delete(v.id)),
      tx.done,
    ]);
  }
}

export const offlineStorage = new OfflineStorage();
