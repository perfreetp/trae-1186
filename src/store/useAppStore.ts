import { create } from 'zustand';
import type { ScanRecord, FavoriteDrug, ReceiveRecord, ExceptionReport, VerificationCertificate } from '@/types';
import { mockScanRecords, mockFavorites, mockReceiveRecords, mockExceptionReports, mockCertificates } from '@/data/scanHistory';

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
}

export const useAppStore = create<AppState>((set) => ({
  scanRecords: mockScanRecords,
  favorites: mockFavorites,
  offlineQueue: [],
  receiveRecords: mockReceiveRecords,
  exceptionReports: mockExceptionReports,
  certificates: mockCertificates,

  addScanRecord: (record) =>
    set((state) => ({
      scanRecords: [record, ...state.scanRecords]
    })),

  removeScanRecord: (id) =>
    set((state) => ({
      scanRecords: state.scanRecords.filter((r) => r.id !== id)
    })),

  addFavorite: (drug) =>
    set((state) => ({
      favorites: [drug, ...state.favorites]
    })),

  removeFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((f) => f.id !== id)
    })),

  addToOfflineQueue: (record) =>
    set((state) => ({
      offlineQueue: [record, ...state.offlineQueue],
      scanRecords: [record, ...state.scanRecords]
    })),

  clearOfflineQueue: () =>
    set({ offlineQueue: [] }),

  syncOfflineRecords: () => {
    set((state) => {
      const updated = state.scanRecords.map((r) =>
        r.isOffline ? { ...r, isOffline: false } : r
      );
      return { scanRecords: updated, offlineQueue: [] };
    });
  },

  updateReceiveRecord: (id, updates) =>
    set((state) => ({
      receiveRecords: state.receiveRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    })),

  addExceptionReport: (report) =>
    set((state) => ({
      exceptionReports: [report, ...state.exceptionReports]
    })),

  addCertificate: (cert) =>
    set((state) => ({
      certificates: [cert, ...state.certificates]
    }))
}));
