import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockRecalls } from '@/data/recalls';
import { getStatusText, getRecallLevelText } from '@/utils';
import styles from './index.module.scss';

const RecallPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'completed', label: '已完成' }
  ];

  const stats = useMemo(() => {
    const urgent = mockRecalls.filter((r) => r.level === 'urgent' && r.status !== 'completed').length;
    const normal = mockRecalls.filter((r) => r.level !== 'urgent' && r.status !== 'completed').length;
    const done = mockRecalls.filter((r) => r.status === 'completed').length;
    return { urgent, normal, done };
  }, []);

  const filteredRecalls = useMemo(() => {
    if (activeFilter === 'all') return mockRecalls;
    return mockRecalls.filter((r) => r.status === activeFilter);
  }, [activeFilter]);

  const handleAction = (recallId: string) => {
    Taro.navigateTo({
      url: `/pages/receive/index?recallId=${recallId}`
    });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberUrgent)}>
            {stats.urgent}
          </Text>
          <Text className={styles.statLabel}>紧急召回</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberNormal)}>
            {stats.normal}
          </Text>
          <Text className={styles.statLabel}>一般召回</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberDone)}>
            {stats.done}
          </Text>
          <Text className={styles.statLabel}>已处理</Text>
        </View>
      </View>

      <View className={styles.filterRow}>
        {filters.map((f) => (
          <View
            key={f.key}
            className={classnames(
              styles.filterTag,
              activeFilter === f.key && styles.filterTagActive
            )}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text
              className={classnames(
                styles.filterTagText,
                activeFilter === f.key && styles.filterTagActiveText
              )}
            >
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.recallList}>
        {filteredRecalls.map((recall) => (
          <View
            key={recall.id}
            className={classnames(
              styles.recallCard,
              recall.level === 'urgent' && styles.recallCardUrgent,
              recall.level === 'normal' && styles.recallCardNormal,
              recall.level === 'low' && styles.recallCardLow
            )}
          >
            <View className={styles.recallHeader}>
              <View className={styles.recallTitleWrap}>
                <Text className={styles.recallDrugName}>{recall.drugName}</Text>
                <Text className={styles.recallBatch}>批号: {recall.batchNumber}</Text>
              </View>
              <StatusTag
                status={recall.level}
                text={getRecallLevelText(recall.level)}
                size="small"
              />
            </View>
            <View className={styles.recallBody}>
              <Text className={styles.recallReason}>{recall.reason}</Text>
              <View className={styles.recallInfoRow}>
                <View className={styles.recallInfoItem}>
                  <Text className={styles.recallInfoLabel}>生产企业</Text>
                  <Text className={styles.recallInfoValue}>{recall.manufacturer}</Text>
                </View>
                <View className={styles.recallInfoItem}>
                  <Text className={styles.recallInfoLabel}>涉及数量</Text>
                  <Text className={styles.recallInfoValue}>{recall.affectedCount}件</Text>
                </View>
              </View>
            </View>
            <View className={styles.recallFooter}>
              <View>
                <Text className={styles.deadlineText}>
                  截止: {recall.deadline}
                </Text>
              </View>
              {recall.status !== 'completed' && (
                <View
                  className={classnames(
                    styles.actionBtn,
                    recall.level === 'urgent' && styles.actionBtnUrgent
                  )}
                  onClick={() => handleAction(recall.id)}
                >
                  <Text
                    className={classnames(
                      styles.actionBtnText,
                      recall.level === 'urgent' && styles.actionBtnUrgentText
                    )}
                  >
                    {recall.status === 'pending' ? '立即处理' : '查看进度'}
                  </Text>
                </View>
              )}
              {recall.status === 'completed' && (
                <StatusTag status="completed" text={getStatusText('completed')} size="small" />
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default RecallPage;
