import type { RecallNotice } from '@/types';

export const mockRecalls: RecallNotice[] = [
  {
    id: 'rc_001',
    drugName: '注射用头孢曲松钠',
    batchNumber: 'HB20240801',
    manufacturer: '某制药股份有限公司',
    reason: '该批次产品含量测定不符合规定，存在安全风险',
    level: 'urgent',
    publishDate: '2025-06-01',
    deadline: '2025-06-15',
    status: 'pending',
    affectedCount: 320
  },
  {
    id: 'rc_002',
    drugName: '复方甘草片',
    batchNumber: 'BY20240915',
    manufacturer: '某中药制药有限公司',
    reason: '包装密封性不达标，可能影响药品质量',
    level: 'normal',
    publishDate: '2025-05-28',
    deadline: '2025-06-28',
    status: 'processing',
    affectedCount: 156
  },
  {
    id: 'rc_003',
    drugName: '维生素C注射液',
    batchNumber: 'LS20241001',
    manufacturer: '某药业有限公司',
    reason: '澄明度不符合标准，暂停使用并召回',
    level: 'normal',
    publishDate: '2025-05-20',
    deadline: '2025-06-20',
    status: 'completed',
    affectedCount: 89
  },
  {
    id: 'rc_004',
    drugName: '双黄连口服液',
    batchNumber: 'YL20241101',
    manufacturer: '某中药股份有限公司',
    reason: '微生物限度超标，存在用药安全隐患',
    level: 'urgent',
    publishDate: '2025-06-05',
    deadline: '2025-06-10',
    status: 'pending',
    affectedCount: 450
  },
  {
    id: 'rc_005',
    drugName: '对乙酰氨基酚片',
    batchNumber: 'PF20241201',
    manufacturer: '某制药有限公司',
    reason: '标识信息错误，实际含量与标注不符',
    level: 'low',
    publishDate: '2025-05-15',
    deadline: '2025-07-15',
    status: 'processing',
    affectedCount: 200
  },
  {
    id: 'rc_006',
    drugName: '氨苄西林胶囊',
    batchNumber: 'WS20241101',
    manufacturer: '某生物制药有限公司',
    reason: '溶出度不符合规定标准',
    level: 'normal',
    publishDate: '2025-06-02',
    deadline: '2025-06-25',
    status: 'pending',
    affectedCount: 175
  },
  {
    id: 'rc_007',
    drugName: '板蓝根颗粒',
    batchNumber: 'IP20241015',
    manufacturer: '某药业集团有限公司',
    reason: '包装材料迁移量超标',
    level: 'low',
    publishDate: '2025-04-28',
    deadline: '2025-06-28',
    status: 'completed',
    affectedCount: 62
  },
  {
    id: 'rc_008',
    drugName: '利巴韦林注射液',
    batchNumber: 'ZH20240901',
    manufacturer: '某制药集团股份有限公司',
    reason: '可见异物检查不合格',
    level: 'urgent',
    publishDate: '2025-06-06',
    deadline: '2025-06-12',
    status: 'pending',
    affectedCount: 280
  }
];
