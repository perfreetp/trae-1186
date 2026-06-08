import type { TraceNode } from '@/types';

export const mockTraceNodes: TraceNode[] = [
  {
    id: 'tn_001',
    drugId: 'drug_001',
    type: 'production',
    location: '华北制药股份有限公司（石家庄）',
    operator: '生产车间A',
    timestamp: '2025-03-01 08:00',
    remark: '生产批次HB20250301'
  },
  {
    id: 'tn_002',
    drugId: 'drug_001',
    type: 'warehouse_in',
    location: '华北制药中心仓库',
    operator: '仓库管理员 李明',
    timestamp: '2025-03-01 14:30',
    temperature: '22°C',
    remark: '入库检验合格'
  },
  {
    id: 'tn_003',
    drugId: 'drug_001',
    type: 'warehouse_out',
    location: '华北制药中心仓库',
    operator: '仓库管理员 李明',
    timestamp: '2025-03-03 09:00',
    temperature: '21°C',
    remark: '出库至省代理'
  },
  {
    id: 'tn_004',
    drugId: 'drug_001',
    type: 'transport',
    location: '河北→北京运输途中',
    operator: '顺丰冷链物流',
    timestamp: '2025-03-03 15:00',
    temperature: '20°C',
    remark: '常温运输'
  },
  {
    id: 'tn_005',
    drugId: 'drug_001',
    type: 'warehouse_in',
    location: '北京国控药业仓库',
    operator: '仓库管理员 王芳',
    timestamp: '2025-03-04 10:00',
    temperature: '23°C',
    remark: '到货验收合格'
  },
  {
    id: 'tn_006',
    drugId: 'drug_001',
    type: 'warehouse_out',
    location: '北京国控药业仓库',
    operator: '仓库管理员 王芳',
    timestamp: '2025-03-05 08:30',
    remark: '配送至门店'
  },
  {
    id: 'tn_007',
    drugId: 'drug_001',
    type: 'store_in',
    location: '国大药房朝阳路店',
    operator: '店员 张丽',
    timestamp: '2025-03-05 14:00',
    temperature: '22°C',
    remark: '门店收货确认'
  },
  {
    id: 'tn_008',
    drugId: 'drug_003',
    type: 'production',
    location: '通化东宝药业股份有限公司',
    operator: '生产车间B',
    timestamp: '2025-01-20 07:00',
    remark: '生产批次DB20250120'
  },
  {
    id: 'tn_009',
    drugId: 'drug_003',
    type: 'warehouse_in',
    location: '通化东宝冷链仓库',
    operator: '仓库管理员 赵强',
    timestamp: '2025-01-20 12:00',
    temperature: '4°C',
    remark: '2-8°C冷藏入库'
  },
  {
    id: 'tn_010',
    drugId: 'drug_003',
    type: 'warehouse_out',
    location: '通化东宝冷链仓库',
    operator: '仓库管理员 赵强',
    timestamp: '2025-01-22 06:00',
    temperature: '3°C',
    remark: '冷藏运输出库'
  },
  {
    id: 'tn_011',
    drugId: 'drug_003',
    type: 'transport',
    location: '通化→北京冷链运输',
    operator: '京东冷链物流',
    timestamp: '2025-01-22 18:00',
    temperature: '5°C',
    remark: '全程2-8°C冷链运输'
  },
  {
    id: 'tn_012',
    drugId: 'drug_003',
    type: 'store_in',
    location: '国大药房朝阳路店',
    operator: '店员 张丽',
    timestamp: '2025-01-24 09:30',
    temperature: '4°C',
    remark: '冷藏到货验收合格'
  }
];
