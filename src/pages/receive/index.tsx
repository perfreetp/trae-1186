import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { getStatusText } from '@/utils';
import styles from './index.module.scss';

const ReceivePage: React.FC = () => {
  const receiveRecords = useAppStore((s) => s.receiveRecords);
  const updateReceiveRecord = useAppStore((s) => s.updateReceiveRecord);
  const addExceptionReport = useAppStore((s) => s.addExceptionReport);

  const pendingRecords = receiveRecords.filter((r) => r.status === 'pending');
  const otherRecords = receiveRecords.filter((r) => r.status !== 'pending');

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

  const progressSteps = [
    { name: '提交收货申请', time: '2025-06-08 09:00', done: true },
    { name: '质量验收检查', time: '2025-06-08 10:30', done: true },
    { name: '冷链温度核对', time: '2025-06-08 11:00', done: false, active: true },
    { name: '确认入库', time: '', done: false },
    { name: '上架陈列', time: '', done: false }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.scanEntry} onClick={handleScan}>
        <Text className={styles.scanEntryIcon}>📦</Text>
        <View className={styles.scanEntryInfo}>
          <Text className={styles.scanEntryTitle}>扫码收货</Text>
          <Text className={styles.scanEntryDesc}>扫描药品码核对信息并确认收货</Text>
        </View>
      </View>

      {pendingRecords.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>待处理</Text>
          <View className={styles.receiveList}>
            {pendingRecords.map((record) => (
              <View
                key={record.id}
                className={classnames(styles.receiveCard, styles.receiveCardPending)}
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
                      <Text className={styles.coldChainIcon}>
                        {record.coldChainOk ? '✅' : '❄️'}
                      </Text>
                      <Text className={classnames(styles.coldChainText, record.coldChainOk && styles.coldChainTextOk)}>
                        冷链温度: {record.coldChainTemp} {record.coldChainOk ? '(正常)' : '(异常)'}
                      </Text>
                    </View>
                  )}
                </View>
                <View className={styles.receiveFooter}>
                  <View
                    className={classnames(styles.actionBtn, styles.btnReject)}
                    onClick={() => handleReject(record.id)}
                  >
                    <Text className={styles.btnRejectText}>拒收上报</Text>
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.btnConfirm)}
                    onClick={() => handleConfirm(record.id)}
                  >
                    <Text className={styles.btnConfirmText}>确认收货</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {otherRecords.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>收货记录</Text>
          <View className={styles.receiveList}>
            {otherRecords.map((record) => (
              <View
                key={record.id}
                className={classnames(
                  styles.receiveCard,
                  record.status === 'confirmed' && styles.receiveCardConfirmed,
                  record.status === 'rejected' && styles.receiveCardRejected
                )}
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
                      <Text className={styles.receiveInfoLabel}>收货日期</Text>
                      <Text className={styles.receiveInfoValue}>{record.receiveDate}</Text>
                    </View>
                  </View>
                  {record.coldChainTemp && (
                    <View className={classnames(styles.coldChainCheck, record.coldChainOk && styles.coldChainCheckOk)}>
                      <Text className={styles.coldChainIcon}>
                        {record.coldChainOk ? '✅' : '⚠️'}
                      </Text>
                      <Text className={classnames(styles.coldChainText, record.coldChainOk && styles.coldChainTextOk)}>
                        冷链温度: {record.coldChainTemp} {record.coldChainOk ? '(正常)' : '(异常)'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Text className={styles.sectionTitle}>处理进度</Text>
      <View className={styles.progressSection}>
        <Text className={styles.progressTitle}>当前收货流程</Text>
        <View className={styles.progressSteps}>
          {progressSteps.map((step, idx) => (
            <View key={idx} className={styles.progressStep}>
              <View
                className={classnames(
                  styles.stepDot,
                  step.done && styles.stepDotDone,
                  step.active && styles.stepDotActive
                )}
              />
              <View className={styles.stepInfo}>
                <Text className={styles.stepName}>{step.name}</Text>
                {step.time && <Text className={styles.stepTime}>{step.time}</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ReceivePage;
