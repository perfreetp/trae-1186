import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import TimelineNodeComponent from '@/components/TimelineNode';
import EmptyState from '@/components/EmptyState';
import { mockDrugs } from '@/data/drugs';
import { mockTraceNodes } from '@/data/traceRecords';
import styles from './index.module.scss';

const TimelinePage: React.FC = () => {
  const router = useRouter();
  const [drugId, setDrugId] = useState('');

  useEffect(() => {
    if (router.params.drugId) {
      setDrugId(router.params.drugId);
    }
  }, [router.params]);

  const drug = drugId ? (mockDrugs.find((d) => d.id === drugId) || null) : null;
  const nodes = drugId ? mockTraceNodes.filter((n) => n.drugId === drugId) : [];
  const routePath = nodes.map((n) => n.location.split('（')[0]).join(' → ');

  return (
    <ScrollView scrollY className={styles.container}>
      {drug && (
        <View className={styles.drugSummary}>
          <Image
            className={styles.drugImage}
            src={drug.imageUrl}
            mode="aspectFill"
            onError={(e) => console.error('[Timeline] 图片加载失败:', e)}
          />
          <View className={styles.drugInfo}>
            <Text className={styles.drugName}>{drug.name}</Text>
            <Text className={styles.drugBatch}>批号: {drug.batchNumber}</Text>
            <View className={styles.drugMeta}>
              {drug.isColdChain && (
                <View className={styles.coldTag}>
                  <Text className={styles.coldTagText}>❄ {drug.coldChainTemp}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {nodes.length > 0 && routePath && (
        <View className={styles.routeSummary}>
          <Text className={styles.routeTitle}>流通路径概览</Text>
          <Text className={styles.routePath}>{routePath}</Text>
        </View>
      )}

      <View className={styles.timelineSection}>
        <Text className={styles.sectionTitle}>追溯节点</Text>
        {nodes.length === 0 ? (
          <View className={styles.emptyWrap}>
            <EmptyState
              title="暂无追溯数据"
              description={drug ? `药品"${drug.name}"尚未录入追溯信息` : '该药品尚未录入追溯信息'}
            />
          </View>
        ) : (
          <View className={styles.timelineList}>
            {nodes.map((node, index) => (
              <TimelineNodeComponent
                key={node.id}
                node={node}
                isLast={index === nodes.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TimelinePage;
