import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { mockTraceNodes } from '@/data/traceRecords';
import { getTraceNodeTypeText, getStatusText } from '@/utils';
import styles from './index.module.scss';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'confirmed', label: '已确认' },
  { key: 'rejected', label: '已拒收' }
];

const ReceivePage: React.FC = () => {
  const receiveRecords = useAppStore((s) => s.receiveRecords);
  const exceptionReports = useAppStore((s) => s.exceptionReports);
  const updateReceiveRecord = useAppStore((s) => s.updateReceiveRecord);
  const addExceptionReport = useAppStore((s) => s.addExceptionReport);

  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    let records = receiveRecords;
    if (activeTab !== 'all') {
      records = records.filter((r) => r.status === activeTab);
    }
    if (searchValue.trim()) {
      const kw = searchValue.trim().toLowerCase();
      records = records.filter(
        (r) =>
          r.drugName.toLowerCase().includes(kw) ||
          r.batchNumber.toLowerCase().includes(kw)
      );
    }
    return records;
  }, [receiveRecords, activeTab, searchValue]);

  const detailRecord = detailId ? receiveRecords.find((r) => r.id === detailId) : null;
  const detailTraceNodes = detailRecord ? mockTraceNodes.filter((n) => n.drugId === detailRecord.drugId) : [];
  const detailExceptions = detailRecord ? exceptionReports.filter(
    (e) => e.drugId === detailRecord.drugId || e.drugName === detailRecord.drugName
  ) : [];

  const handleScan = () => {
    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.info('[Receive] 收货扫码结果:', res.result);
        Taro.showToast({ title: '扫码成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Receive] 扫码失败:', err);
        Taro.showToast({ title: '扫码失败', icon: 'none' });
      }
    });
  };

  const handleConfirm = (id: string) => {
    Taro.showModal({
      title: '确认收货',
      content: '确认该药品已验收合格并收货？',
      success: (res) => {
        if (res.confirm) {
          updateReceiveRecord(id, { status: 'confirmed' });
          Taro.showToast({ title: '收货确认成功', icon: 'success' });
        }
      }
    });
  };

  const handleReject = (id: string) => {
    const record = receiveRecords.find((r) => r.id === id);
    if (!record) return;
    Taro.showModal({
      title: '拒收上报',
      content: `确认拒收"${record.drugName}"并上报异常？`,
      success: (res) => {
        if (res.confirm) {
          updateReceiveRecord(id, { status: 'rejected' });
          addExceptionReport({
            id: `ex_${Date.now()}`,
            drugId: record.drugId,
            drugName: record.drugName,
            batchNumber: record.batchNumber,
            type: record.coldChainOk ? 'other' : 'temperature',
            description: record.coldChainOk
              ? `门店拒收药品"${record.drugName}"，批号${record.batchNumber}`
              : `门店拒收冷链药品"${record.drugName}"，到货温度${record.coldChainTemp || '异常'}超出规定范围`,
            images: [],
            reporter: '张丽',
            reportTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
            status: 'submitted',
            storeName: '国大药房朝阳路店'
          });
          Taro.showToast({ title: '已拒收并上报', icon: 'success' });
        }
      }
    });
  };

  if (detailRecord) {
    return (
      <ScrollView scrollY className={styles.container}>
        <View className={styles.detailHeader}>
          <View className={styles.detailBack} onClick={() => setDetailId(null)}>
            <Text className={styles.detailBackText}>‹ 返回</Text>
          </View>
          <Text className={styles.detailTitle}>收货详情</Text>
          <View style={{ width: 100 }} />
        </View>

        <View className={styles.card}>
          <View className={styles.detailDrugHeader}>
            <View style={{ flex: 1 }}>
              <Text className={styles.detailDrugName}>{detailRecord.drugName}</Text>
              <Text className={styles.detailDrugBatch}>批号: {detailRecord.batchNumber}</Text>
            </View>
            <StatusTag status={detailRecord.status} text={getStatusText(detailRecord.status)} />
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>生产企业</Text>
              <Text className={styles.infoValue}>{detailRecord.manufacturer}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>数量</Text>
              <Text className={styles.infoValue}>{detailRecord.quantity}件</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>操作员</Text>
              <Text className={styles.infoValue}>{detailRecord.operator}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>收货日期</Text>
              <Text className={styles.infoValue}>{detailRecord.receiveDate}</Text>
            </View>
          </View>
          {detailRecord.coldChainTemp && (
            <View className={classnames(styles.coldChainCheck, detailRecord.coldChainOk && styles.coldChainCheckOk)}>
              <Text className={styles.coldChainIcon}>{detailRecord.coldChainOk ? '✅' : '⚠️'}</Text>
              <Text className={classnames(styles.coldChainText, detailRecord.coldChainOk && styles.coldChainTextOk)}>
                冷链温度: {detailRecord.coldChainTemp} {detailRecord.coldChainOk ? '(正常)' : '(异常)'}
              </Text>
            </View>
          )}
        </View>

        {detailTraceNodes.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>追溯节点</Text>
            <View className={styles.traceList}>
              {detailTraceNodes.map((node, idx) => (
                <View key={node.id} className={styles.traceItem}>
                  <View className={styles.traceLeft}>
                    <View className={styles.traceDot} />
                    {idx < detailTraceNodes.length - 1 && <View className={styles.traceLine} />}
                  </View>
                  <View className={styles.traceRight}>
                    <View className={styles.traceRow}>
                      <Text className={styles.traceType}>{getTraceNodeTypeText(node.type)}</Text>
                      <Text className={styles.traceTime}>{node.timestamp}</Text>
                    </View>
                    <Text className={styles.traceLocation}>{node.location}</Text>
                    {node.temperature && (
                      <Text className={styles.traceTemp}>🌡 {node.temperature}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {detailExceptions.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>关联异常上报</Text>
            <View className={styles.exceptionList}>
              {detailExceptions.map((ex) => (
                <View key={ex.id} className={styles.exceptionItem}>
                  <View className={styles.exceptionRow}>
                    <Text className={styles.exceptionType}>{ex.type}</Text>
                    <StatusTag status={ex.status} text={getStatusText(ex.status)} size="small" />
                  </View>
                  <Text className={styles.exceptionDesc}>{ex.description}</Text>
                  <Text className={styles.exceptionTime}>{ex.reportTime}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {detailRecord.status === 'pending' && (
          <View className={styles.detailActions}>
            <View className={classnames(styles.actionBtn, styles.btnReject)} onClick={() => handleReject(detailRecord.id)}>
              <Text className={styles.btnRejectText}>拒收上报</Text>
            </View>
            <View className={classnames(styles.actionBtn, styles.btnConfirm)} onClick={() => handleConfirm(detailRecord.id)}>
              <Text className={styles.btnConfirmText}>确认收货</Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.scanEntry} onClick={handleScan}>
        <Text className={styles.scanEntryIcon}>📦</Text>
        <View className={styles.scanEntryInfo}>
          <Text className={styles.scanEntryTitle}>扫码收货</Text>
          <Text className={styles.scanEntryDesc}>扫描药品码核对信息并确认收货</Text>
        </View>
      </View>

      <View className={styles.searchWrap}>
        <Input
          className={styles.searchInput}
          placeholder="按批号或药品名筛选"
          value={searchValue}
          onInput={(e) => setSearchValue(e.detail.value)}
        />
      </View>

      <View className={styles.tabRow}>
        {statusTabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabItemActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(styles.tabText, activeTab === tab.key && styles.tabTextActive)}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View className={styles.tabIndicator} />}
          </View>
        ))}
      </View>

      {filteredRecords.length === 0 ? (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>📦</Text>
          <Text className={styles.emptyText}>暂无{statusTabs.find((t) => t.key === activeTab)?.label || ''}收货记录</Text>
        </View>
      ) : (
        <View className={styles.receiveList}>
          {filteredRecords.map((record) => (
            <View
              key={record.id}
              className={classnames(
                styles.receiveCard,
                record.status === 'pending' && styles.receiveCardPending,
                record.status === 'confirmed' && styles.receiveCardConfirmed,
                record.status === 'rejected' && styles.receiveCardRejected
              )}
              onClick={() => setDetailId(record.id)}
            >
              <View className={styles.receiveHeader}>
                <View className={styles.receiveTitleWrap}>
                  <Text className={styles.receiveName}>{record.drugName}</Text>
                  <Text className={styles.receiveBatch}>批号: {record.batchNumber}</Text>
                </View>
                <StatusTag status={record.status} text={getStatusText(record.status)} size="small" />
              </View>
              <View className={styles.receiveBody}>
                <View className={styles.receiveInfoRow}>
                  <View className={styles.receiveInfoItem}>
                    <Text className={styles.receiveInfoLabel}>数量</Text>
                    <Text className={styles.receiveInfoValue}>{record.quantity}件</Text>
                  </View>
                  <View className={styles.receiveInfoItem}>
                    <Text className={styles.receiveInfoLabel}>生产企业</Text>
                    <Text className={styles.receiveInfoValue}>{record.manufacturer}</Text>
                  </View>
                </View>
                {record.coldChainTemp && (
                  <View className={classnames(styles.coldChainCheck, record.coldChainOk && styles.coldChainCheckOk)}>
                    <Text className={styles.coldChainIcon}>{record.coldChainOk ? '✅' : '❄️'}</Text>
                    <Text className={classnames(styles.coldChainText, record.coldChainOk && styles.coldChainTextOk)}>
                      冷链温度: {record.coldChainTemp} {record.coldChainOk ? '(正常)' : '(异常)'}
                    </Text>
                  </View>
                )}
              </View>
              {record.status === 'pending' && (
                <View className={styles.receiveFooter} onClick={(e) => e.stopPropagation()}>
                  <View className={classnames(styles.actionBtn, styles.btnReject)} onClick={() => handleReject(record.id)}>
                    <Text className={styles.btnRejectText}>拒收上报</Text>
                  </View>
                  <View className={classnames(styles.actionBtn, styles.btnConfirm)} onClick={() => handleConfirm(record.id)}>
                    <Text className={styles.btnConfirmText}>确认收货</Text>
                  </View>
                </View>
              )}
              <View className={styles.cardArrow}>
                <Text className={styles.cardArrowText}>›</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default ReceivePage;
