import type { ScanRecord, FavoriteDrug, ReceiveRecord, ExceptionReport, VerificationCertificate } from '@/types';

export const mockScanRecords: ScanRecord[] = [
  {
    id: 'sr_001',
    drugId: 'drug_001',
    drugName: '阿莫西林胶囊',
    batchNumber: 'HB20250301',
    scanTime: '2025-06-08 09:15',
    scanType: 'regulatory',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_002',
    drugId: 'drug_003',
    drugName: '胰岛素注射液',
    batchNumber: 'DB20250120',
    scanTime: '2025-06-08 09:30',
    scanType: 'regulatory',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_003',
    drugId: 'drug_004',
    drugName: '布洛芬缓释胶囊',
    batchNumber: 'SK20250410',
    scanTime: '2025-06-07 16:20',
    scanType: 'package',
    isOffline: true,
    result: 'warning'
  },
  {
    id: 'sr_004',
    drugId: 'drug_005',
    drugName: '奥司他韦胶囊',
    batchNumber: 'YG20250305',
    scanTime: '2025-06-07 14:05',
    scanType: 'regulatory',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_005',
    drugId: 'drug_008',
    drugName: '阿托伐他汀钙片',
    batchNumber: 'PF20250315',
    scanTime: '2025-06-06 11:30',
    scanType: 'regulatory',
    isOffline: false,
    result: 'error'
  },
  {
    id: 'sr_006',
    drugId: 'drug_002',
    drugName: '头孢克肟分散片',
    batchNumber: 'BY20250215',
    scanTime: '2025-06-06 10:00',
    scanType: 'package',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_007',
    drugId: 'drug_006',
    drugName: '人血白蛋白',
    batchNumber: 'LS20250201',
    scanTime: '2025-06-05 15:45',
    scanType: 'regulatory',
    isOffline: true,
    result: 'verified'
  },
  {
    id: 'sr_008',
    drugId: 'drug_007',
    drugName: '连花清瘟胶囊',
    batchNumber: 'YL20250401',
    scanTime: '2025-06-05 09:20',
    scanType: 'package',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_009',
    drugId: 'drug_009',
    drugName: '破伤风抗毒素',
    batchNumber: 'WS20250115',
    scanTime: '2025-06-04 13:10',
    scanType: 'regulatory',
    isOffline: false,
    result: 'verified'
  },
  {
    id: 'sr_010',
    drugId: 'drug_010',
    drugName: '蒙脱石散',
    batchNumber: 'IP20250220',
    scanTime: '2025-06-04 08:55',
    scanType: 'package',
    isOffline: false,
    result: 'warning'
  }
];

export const mockFavorites: FavoriteDrug[] = [
  {
    id: 'fav_001',
    drugId: 'drug_001',
    drugName: '阿莫西林胶囊',
    genericName: '阿莫西林',
    manufacturer: '华北制药股份有限公司',
    addedTime: '2025-06-01'
  },
  {
    id: 'fav_002',
    drugId: 'drug_003',
    drugName: '胰岛素注射液',
    genericName: '重组人胰岛素',
    manufacturer: '通化东宝药业股份有限公司',
    addedTime: '2025-06-02'
  },
  {
    id: 'fav_003',
    drugId: 'drug_005',
    drugName: '奥司他韦胶囊',
    genericName: '磷酸奥司他韦',
    manufacturer: '宜昌东阳光长江药业股份有限公司',
    addedTime: '2025-06-03'
  },
  {
    id: 'fav_004',
    drugId: 'drug_007',
    drugName: '连花清瘟胶囊',
    genericName: '连翘、金银花等',
    manufacturer: '石家庄以岭药业股份有限公司',
    addedTime: '2025-05-28'
  }
];

export const mockReceiveRecords: ReceiveRecord[] = [
  {
    id: 'rcv_001',
    drugId: 'drug_001',
    drugName: '阿莫西林胶囊',
    batchNumber: 'HB20250301',
    manufacturer: '华北制药股份有限公司',
    quantity: 50,
    receiveDate: '2025-03-05',
    operator: '张丽',
    coldChainOk: true,
    status: 'confirmed',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'rcv_002',
    drugId: 'drug_003',
    drugName: '胰岛素注射液',
    batchNumber: 'DB20250120',
    manufacturer: '通化东宝药业股份有限公司',
    quantity: 20,
    receiveDate: '2025-01-24',
    operator: '张丽',
    coldChainOk: true,
    coldChainTemp: '4°C',
    status: 'confirmed',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'rcv_003',
    drugId: 'drug_005',
    drugName: '奥司他韦胶囊',
    batchNumber: 'YG20250305',
    manufacturer: '宜昌东阳光长江药业股份有限公司',
    quantity: 30,
    receiveDate: '2025-03-10',
    operator: '王刚',
    coldChainOk: true,
    status: 'confirmed',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'rcv_004',
    drugId: 'drug_006',
    drugName: '人血白蛋白',
    batchNumber: 'LS20250201',
    manufacturer: '上海莱士血液制品股份有限公司',
    quantity: 10,
    receiveDate: '2025-06-07',
    operator: '张丽',
    coldChainOk: false,
    coldChainTemp: '12°C',
    status: 'rejected',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'rcv_005',
    drugId: 'drug_009',
    drugName: '破伤风抗毒素',
    batchNumber: 'WS20250115',
    manufacturer: '武汉生物制品研究所有限责任公司',
    quantity: 15,
    receiveDate: '2025-06-08',
    operator: '王刚',
    coldChainOk: true,
    coldChainTemp: '3°C',
    status: 'pending',
    storeName: '国大药房朝阳路店'
  }
];

export const mockExceptionReports: ExceptionReport[] = [
  {
    id: 'ex_001',
    drugId: 'drug_008',
    drugName: '阿托伐他汀钙片',
    batchNumber: 'PF20250315',
    type: 'counterfeit',
    description: '包装印刷模糊，疑似假冒产品',
    images: ['https://picsum.photos/id/160/300/300'],
    reporter: '张丽',
    reportTime: '2025-06-06 11:35',
    status: 'reviewing',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'ex_002',
    drugId: 'drug_004',
    drugName: '布洛芬缓释胶囊',
    batchNumber: 'SK20250410',
    type: 'damaged',
    description: '外包装严重破损，胶囊板变形',
    images: ['https://picsum.photos/id/6/300/300'],
    reporter: '王刚',
    reportTime: '2025-06-07 16:25',
    status: 'submitted',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'ex_003',
    drugId: 'drug_006',
    drugName: '人血白蛋白',
    batchNumber: 'LS20250201',
    type: 'temperature',
    description: '冷链运输温度异常，到货温度12°C超出2-8°C范围',
    images: [],
    reporter: '张丽',
    reportTime: '2025-06-07 14:00',
    status: 'resolved',
    storeName: '国大药房朝阳路店'
  }
];

export const mockCertificates: VerificationCertificate[] = [
  {
    id: 'cert_001',
    drugId: 'drug_001',
    drugName: '阿莫西林胶囊',
    batchNumber: 'HB20250301',
    verificationTime: '2025-06-08 09:15',
    result: 'verified',
    operator: '张丽',
    storeName: '国大药房朝阳路店'
  },
  {
    id: 'cert_002',
    drugId: 'drug_003',
    drugName: '胰岛素注射液',
    batchNumber: 'DB20250120',
    verificationTime: '2025-06-08 09:30',
    result: 'verified',
    operator: '张丽',
    storeName: '国大药房朝阳路店'
  }
];
