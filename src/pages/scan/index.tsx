import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { getStatusText } from '@/utils';
import styles from './index.module.scss';

const ScanPage: React.FC = () => {
  const scanRecords = useAppStore((s) => s.scanRecords);
  const offlineQueue = useAppStore((s) => s.offlineQueue);

  const navigateToDetail = (code: string, type: 'regulatory' | 'package') => {
    Taro.navigateTo({
      url: `/pages/detail/index?code=${encodeURIComponent(code)}&type=${type}`
    });
  };

  const handleScanRegulatory = () => {
    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.info('[Scan] 监管码扫描结果:', res.result);
        navigateToDetail(res.result, 'regulatory');
      },
      fail: (err) => {
        console.error('[Scan] 扫码失败:', err);
      }
    });
  };

  const handleScanPackage = () => {
    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.info('[Scan] 包装码扫描结果:', res.result);
        navigateToDetail(res.result, 'package');
      },
      fail: (err) => {
        console.error('[Scan] 扫码失败:', err);
      }
    });
  };

  const handleQuickAction = (action: string) => {
    const routes: Record<string, string> = {
      trace: '/pages/trace/index',
      receive: '/pages/receive/index',
      report: '/pages/report/index',
      recall: '/pages/recall/index'
    };
    if (action === 'trace' || action === 'recall') {
      Taro.switchTab({ url: routes[action] });
    } else if (routes[action]) {
      Taro.navigateTo({ url: routes[action] });
    }
  };

  const handleRecordClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?drugId=${drugId}`
    });
  };

  const recentRecords = scanRecords.slice(0, 5);

  return (
    <View className={styles.container}>
      <View className={styles.scanSection}>
        <View className={styles.scanIconWrap}>
          <Text className={styles.scanIcon}>🔍</Text>
        </View>
        <Text className={styles.scanTitle}>扫码核验药品</Text>
        <Text className={styles.scanSubtitle}>
          扫描药品监管码或包装码，即时核验药品来源与真伪
        </Text>
        <View className={styles.scanButtons}>
          <View className={classnames(styles.scanBtn, styles.scanBtnPrimary)} onClick={handleScanRegulatory}>
            <Text className={styles.scanBtnPrimaryText}>扫监管码</Text>
          </View>
          <View className={classnames(styles.scanBtn, styles.scanBtnSecondary)} onClick={handleScanPackage}>
            <Text className={styles.scanBtnSecondaryText}>扫包装码</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快捷功能</Text>
        </View>
        <View className={styles.quickGrid}>
          <View className={styles.quickItem} onClick={() => handleQuickAction('trace')}>
            <Text className={styles.quickIcon}>🔎</Text>
            <Text className={styles.quickLabel}>追溯查询</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('receive')}>
            <Text className={styles.quickIcon}>📦</Text>
            <Text className={styles.quickLabel}>门店收货</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('report')}>
            <Text className={styles.quickIcon}>⚠️</Text>
            <Text className={styles.quickLabel}>异常上报</Text>
          </View>
          <View className={styles.quickItem} onClick={() => handleQuickAction('recall')}>
            <Text className={styles.quickIcon}>🔔</Text>
            <Text className={styles.quickLabel}>召回提醒</Text>
          </View>
          <View className={styles.quickItem} onClick={() => Taro.navigateTo({ url: '/pages/timeline/index?drugId=drug_001' })}>
            <Text className={styles.quickIcon}>📋</Text>
            <Text className={styles.quickLabel}>批次时间线</Text>
          </View>
          <View className={styles.quickItem} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
            <Text className={styles.quickIcon}>📊</Text>
            <Text className={styles.quickLabel}>核验记录</Text>
          </View>
        </View>
      </View>

      {offlineQueue.length > 0 && (
        <View className={styles.coldChainCard}>
          <Text className={styles.coldChainIcon}>📴</Text>
          <View className={styles.coldChainInfo}>
            <Text className={styles.coldChainTitle}>
              {offlineQueue.length}条离线记录待同步
            </Text>
            <Text className={styles.coldChainDesc}>
              网络恢复后将自动上传
            </Text>
          </View>
        </View>
      )}

      <View className={styles.recentSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最近核验</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
            查看全部
          </Text>
        </View>
        <View className={styles.recentList}>
          {recentRecords.map((record) => (
            <View
              key={record.id}
              className={styles.recentCard}
              onClick={() => handleRecordClick(record.drugId)}
            >
              <StatusTag status={record.result} text={getStatusText(record.result)} size="small" />
              <View className={styles.recentInfo}>
                <Text className={styles.recentName}>{record.drugName}</Text>
                <Text className={styles.recentBatch}>批号: {record.batchNumber}</Text>
              </View>
              <View className={styles.recentRight}>
                {record.isOffline && (
                  <View className={styles.offlineTag}>
                    <Text className={styles.offlineTagText}>离线</Text>
                  </View>
                )}
                <Text className={styles.recentTime}>{record.scanTime.split(' ')[1]}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ScanPage;
