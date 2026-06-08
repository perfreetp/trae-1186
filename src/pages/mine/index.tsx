import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { getStatusText } from '@/utils';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const scanRecords = useAppStore((s) => s.scanRecords);
  const favorites = useAppStore((s) => s.favorites);
  const offlineQueue = useAppStore((s) => s.offlineQueue);
  const certificates = useAppStore((s) => s.certificates);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const syncOfflineRecords = useAppStore((s) => s.syncOfflineRecords);

  const [showExport, setShowExport] = useState(false);
  const [showCerts, setShowCerts] = useState(false);

  const verifiedCount = scanRecords.filter((r) => r.result === 'verified').length;
  const warningCount = scanRecords.filter((r) => r.result === 'warning').length;
  const errorCount = scanRecords.filter((r) => r.result === 'error').length;

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
  };

  const handleSync = () => {
    syncOfflineRecords();
    Taro.showToast({ title: '同步成功', icon: 'success' });
  };

  const handleFavClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?drugId=${drugId}`
    });
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportCopy = () => {
    const content = scanRecords
      .map((r) => `${r.scanTime} | ${r.drugName} | 批号${r.batchNumber} | ${getStatusText(r.result)} | ${r.scanType === 'regulatory' ? '监管码' : '包装码'}${r.isOffline ? ' | 离线' : ''}`)
      .join('\n');
    Taro.setClipboardData({
      data: content,
      success: () => {
        Taro.showToast({ title: '核验记录已复制到剪贴板', icon: 'success' });
        setShowExport(false);
      }
    });
  };

  const handleCertificate = () => {
    setShowCerts(true);
  };

  const handleCertClick = (certId: string) => {
    const cert = certificates.find((c) => c.id === certId);
    if (cert) {
      Taro.showModal({
        title: '查验凭证详情',
        content: `药品: ${cert.drugName}\n批号: ${cert.batchNumber}\n核验时间: ${cert.verificationTime}\n核验结论: ${getStatusText(cert.result)}\n操作员: ${cert.operator}\n门店: ${cert.storeName}`,
        showCancel: false
      });
    }
  };

  const menuItems = [
    { icon: '📋', label: '核验记录', action: () => {} },
    { icon: '📜', label: '查验凭证', action: handleCertificate },
    { icon: '📤', label: '导出记录', action: handleExport },
    { icon: '📴', label: '离线暂存', badge: offlineQueue.length, action: handleSync },
    { icon: '⚙️', label: '设置', action: () => {} }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.profileSection}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>张丽</Text>
          <Text className={styles.profileRole}>门店营业员</Text>
          <Text className={styles.profileStore}>国大药房朝阳路店</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{verifiedCount}</Text>
          <Text className={styles.statLabel}>核验通过</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueWarning)}>{warningCount}</Text>
          <Text className={styles.statLabel}>存疑警告</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueError)}>{errorCount}</Text>
          <Text className={styles.statLabel}>核验异常</Text>
        </View>
      </View>

      {favorites.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>常用药收藏</Text>
          <View className={styles.favoritesWrap}>
            <View className={styles.favList}>
              {favorites.map((fav) => (
                <View key={fav.id} className={styles.favItem} onClick={() => handleFavClick(fav.drugId)}>
                  <View className={styles.favInfo}>
                    <Text className={styles.favName}>{fav.drugName}</Text>
                    <Text className={styles.favGeneric}>{fav.genericName} | {fav.manufacturer}</Text>
                  </View>
                  <View
                    className={styles.favRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(fav.id);
                    }}
                  >
                    <Text className={styles.favRemoveText}>✕</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {offlineQueue.length > 0 && (
        <View className={styles.offlineCard}>
          <Text className={styles.offlineIcon}>📴</Text>
          <View className={styles.offlineInfo}>
            <Text className={styles.offlineTitle}>
              {offlineQueue.length}条离线记录待同步
            </Text>
            <Text className={styles.offlineDesc}>网络恢复后可手动同步</Text>
          </View>
          <View className={styles.syncBtn} onClick={handleSync}>
            <Text className={styles.syncBtnText}>同步</Text>
          </View>
        </View>
      )}

      <View className={styles.menuList}>
        {menuItems.map((item, idx) => (
          <View key={idx} className={styles.menuItem} onClick={item.action}>
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuLabel}>{item.label}</Text>
            {item.badge > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      {showExport && (
        <View className={styles.modalOverlay} onClick={() => setShowExport(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>导出核验记录</Text>
            <Text className={styles.modalDesc}>
              共{scanRecords.length}条核验记录，点击"复制到剪贴板"可将全部记录导出为文本
            </Text>
            <ScrollView scrollY className={styles.exportPreview}>
              {scanRecords.slice(0, 5).map((r, idx) => (
                <View key={idx} className={styles.exportRow}>
                  <Text className={styles.exportText}>
                    {r.scanTime} | {r.drugName} | 批号{r.batchNumber} | {getStatusText(r.result)}
                  </Text>
                </View>
              ))}
              {scanRecords.length > 5 && (
                <Text className={styles.exportMore}>...还有{scanRecords.length - 5}条记录</Text>
              )}
            </ScrollView>
            <View className={styles.modalActions}>
              <View className={styles.modalCancelBtn} onClick={() => setShowExport(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleExportCopy}>
                <Text className={styles.modalConfirmText}>复制到剪贴板</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showCerts && (
        <View className={styles.modalOverlay} onClick={() => setShowCerts(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>查验凭证</Text>
            {certificates.length === 0 ? (
              <Text className={styles.modalDesc}>暂无查验凭证，核验药品后可生成凭证</Text>
            ) : (
              <ScrollView scrollY className={styles.certList}>
                {certificates.map((cert) => (
                  <View
                    key={cert.id}
                    className={styles.certCard}
                    onClick={() => handleCertClick(cert.id)}
                  >
                    <View className={styles.certHeader}>
                      <Text className={styles.certDrugName}>{cert.drugName}</Text>
                      <StatusTag status={cert.result} text={getStatusText(cert.result)} size="small" />
                    </View>
                    <Text className={styles.certBatch}>批号: {cert.batchNumber}</Text>
                    <Text className={styles.certTime}>核验时间: {cert.verificationTime}</Text>
                    <Text className={styles.certStore}>{cert.storeName} | {cert.operator}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <View className={styles.modalActions}>
              <View className={styles.modalCancelBtn} onClick={() => setShowCerts(false)}>
                <Text className={styles.modalCancelText}>关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MinePage;
