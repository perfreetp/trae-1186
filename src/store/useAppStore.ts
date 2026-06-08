import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { ScanRecord, FavoriteDrug, ReceiveRecord, ExceptionReport, VerificationCertificate } from '@/types';
import { mockScanRecords, mockFavorites, mockReceiveRecords, mockExceptionReports, mockCertificates } from '@/data/scanHistory';

const STORAGE_KEYS = {
  receiveRecords: 'drug_trace_receive_records',
  exceptionReports: 'drug_trace_exception_reports',
  certificates: 'drug_trace_certificates',
  scanRecords: 'drug_trace_scan_records',
  favorites: 'drug_trace_favorites'
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = Taro.getStorageSync(key);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored as T[];
    }
  } catch (e) {
    console.error('[Storage] 读取失败:', key, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    Taro.setStorageSync(key, data);
  } catch (e) {
    console.error('[Storage] 写入失败:', key, e);
  }
}

interface AppState {
  scanRecords: ScanRecord[];
  favorites: FavoriteDrug[];
  offlineQueue: ScanRecord[];
  receiveRecords: ReceiveRecord[];
  exceptionReports: ExceptionReport[];
  certificates: VerificationCertificate[];
  addScanRecord: (record: ScanRecord) => void;
  removeScanRecord: (id: string) => void;
  addFavorite: (drug: FavoriteDrug) => void;
  removeFavorite: (id: string) => void;
  addToOfflineQueue: (record: ScanRecord) => void;
  clearOfflineQueue: () => void;
  syncOfflineRecords: () => void;
  updateReceiveRecord: (id: string, updates: Partial<ReceiveRecord>) => void;
  addExceptionReport: (report: ExceptionReport) => void;
  addCertificate: (cert: VerificationCertificate) => void;
  clearAllRecords: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  scanRecords: loadFromStorage<ScanRecord>(STORAGE_KEYS.scanRecords, mockScanRecords),
  favorites: loadFromStorage<FavoriteDrug>(STORAGE_KEYS.favorites, mockFavorites),
  offlineQueue: [],
  receiveRecords: loadFromStorage<ReceiveRecord>(STORAGE_KEYS.receiveRecords, mockReceiveRecords),
  exceptionReports: loadFromStorage<ExceptionReport>(STORAGE_KEYS.exceptionReports, mockExceptionReports),
  certificates: loadFromStorage<VerificationCertificate>(STORAGE_KEYS.certificates, mockCertificates),

  addScanRecord: (record) =>
    set((state) => {
      const updated = [record, ...state.scanRecords];
      saveToStorage(STORAGE_KEYS.scanRecords, updated);
      return { scanRecords: updated };
    }),

  removeScanRecord: (id) =>
    set((state) => {
      const updated = state.scanRecords.filter((r) => r.id !== id);
      saveToStorage(STORAGE_KEYS.scanRecords, updated);
      return { scanRecords: updated };
    }),

  addFavorite: (drug) =>
    set((state) => {
      const updated = [drug, ...state.favorites];
      saveToStorage(STORAGE_KEYS.favorites, updated);
      return { favorites: updated };
    }),

  removeFavorite: (id) =>
    set((state) => {
      const updated = state.favorites.filter((f) => f.id !== id);
      saveToStorage(STORAGE_KEYS.favorites, updated);
      return { favorites: updated };
    }),

  addToOfflineQueue: (record) =>
    set((state) => {
      const updated = [record, ...state.scanRecords];
      saveToStorage(STORAGE_KEYS.scanRecords, updated);
      return {
        offlineQueue: [record, ...state.offlineQueue],
        scanRecords: updated
      };
    }),

  clearOfflineQueue: () =>
    set({ offlineQueue: [] }),

  syncOfflineRecords: () => {
    set((state) => {
      const updated = state.scanRecords.map((r) =>
        r.isOffline ? { ...r, isOffline: false } : r
      );
      saveToStorage(STORAGE_KEYS.scanRecords, updated);
      return { scanRecords: updated, offlineQueue: [] };
    });
  },

  updateReceiveRecord: (id, updates) =>
    set((state) => {
      const updated = state.receiveRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      saveToStorage(STORAGE_KEYS.receiveRecords, updated);
      return { receiveRecords: updated };
    }),

  addExceptionReport: (report) =>
    set((state) => {
      const updated = [report, ...state.exceptionReports];
      saveToStorage(STORAGE_KEYS.exceptionReports, updated);
      return { exceptionReports: updated };
    }),

  addCertificate: (cert) =>
    set((state) => {
      const updated = [cert, ...state.certificates];
      saveToStorage(STORAGE_KEYS.certificates, updated);
      return { certificates: updated };
    }),

  clearAllRecords: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try { Taro.removeStorageSync(key); } catch (e) { console.error('[Storage] 清除失败:', key, e); }
    });
    set({
      scanRecords: mockScanRecords,
      favorites: mockFavorites,
      offlineQueue: [],
      receiveRecords: mockReceiveRecords,
      exceptionReports: mockExceptionReports,
      certificates: mockCertificates
    });
  }
}));
