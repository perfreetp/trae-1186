export interface DrugInfo {
  id: string;
  name: string;
  genericName: string;
  specification: string;
  manufacturer: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  regulatoryCode: string;
  packageCode: string;
  dosageForm: string;
  approvalNumber: string;
  storageCondition: string;
  isColdChain: boolean;
  coldChainTemp?: string;
  status: 'verified' | 'warning' | 'error' | 'pending';
  imageUrl: string;
}

export interface TraceNode {
  id: string;
  drugId: string;
  type: 'production' | 'warehouse_out' | 'warehouse_in' | 'transport' | 'store_in' | 'store_out' | 'sold';
  location: string;
  operator: string;
  timestamp: string;
  temperature?: string;
  remark?: string;
}

export interface RecallNotice {
  id: string;
  drugName: string;
  batchNumber: string;
  manufacturer: string;
  reason: string;
  level: 'urgent' | 'normal' | 'low';
  publishDate: string;
  deadline: string;
  status: 'pending' | 'processing' | 'completed';
  affectedCount: number;
}

export interface ExceptionReport {
  id: string;
  drugId: string;
  drugName: string;
  batchNumber: string;
  type: 'damaged' | 'counterfeit' | 'expired' | 'temperature' | 'other';
  description: string;
  images: string[];
  reporter: string;
  reportTime: string;
  status: 'submitted' | 'reviewing' | 'resolved';
  storeName: string;
}

export interface ReceiveRecord {
  id: string;
  drugId: string;
  drugName: string;
  batchNumber: string;
  manufacturer: string;
  quantity: number;
  receiveDate: string;
  operator: string;
  coldChainOk: boolean;
  coldChainTemp?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  processedTime?: string;
  storeName: string;
}

export interface ScanRecord {
  id: string;
  drugId: string;
  drugName: string;
  batchNumber: string;
  scanTime: string;
  scanType: 'regulatory' | 'package';
  isOffline: boolean;
  result: 'verified' | 'warning' | 'error';
}

export interface FavoriteDrug {
  id: string;
  drugId: string;
  drugName: string;
  genericName: string;
  manufacturer: string;
  addedTime: string;
}

export interface VerificationCertificate {
  id: string;
  drugId: string;
  drugName: string;
  batchNumber: string;
  verificationTime: string;
  result: 'verified' | 'warning' | 'error';
  operator: string;
  storeName: string;
}
