import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const scanRecords = useAppStore((s) => s.scanRecords);
  const favorites = useAppStore((s) => s.favorites);
  const offlineQueue = useAppStore((s) => s.offlineQueue);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const syncOfflineRecords = useAppStore((s) => s.syncOfflineRecords);

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
    Taro.showToast({ title: '导出功能开发中', icon: 'none' });
  };

  const handleCertificate = () => {
    Taro.showToast({ title: '凭证功能开发中', icon: 'none' });
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
    </ScrollView>
  );
};

export default MinePage;
