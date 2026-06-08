import dayjs from 'dayjs';

export const formatDate = (dateStr: string, format = 'YYYY-MM-DD') => {
  return dayjs(dateStr).format(format);
};

export const formatDateTime = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
};

export const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    verified: '核验通过',
    warning: '存疑警告',
    error: '核验异常',
    pending: '待核验',
    submitted: '已提交',
    reviewing: '审核中',
    resolved: '已处理',
    confirmed: '已确认',
    rejected: '已拒收',
    processing: '处理中',
    completed: '已完成'
  };
  return map[status] || status;
};

export const getTraceNodeTypeText = (type: string) => {
  const map: Record<string, string> = {
    production: '生产出厂',
    warehouse_out: '出库',
    warehouse_in: '入库',
    transport: '运输途中',
    store_in: '门店入库',
    store_out: '门店出库',
    sold: '已售出'
  };
  return map[type] || type;
};

export const getExceptionTypeText = (type: string) => {
  const map: Record<string, string> = {
    damaged: '包装破损',
    counterfeit: '疑似假药',
    expired: '过期药品',
    temperature: '温度异常',
    other: '其他异常'
  };
  return map[type] || type;
};

export const getRecallLevelText = (level: string) => {
  const map: Record<string, string> = {
    urgent: '紧急',
    normal: '一般',
    low: '低级'
  };
  return map[level] || level;
};

export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
