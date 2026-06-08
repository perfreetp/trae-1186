import React from 'react';
import { View, Text } from '@tarojs/components';
import type { TraceNode } from '@/types';
import { getTraceNodeTypeText } from '@/utils';
import styles from './index.module.scss';

interface TimelineNodeProps {
  node: TraceNode;
  isLast: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ node, isLast }) => {
  return (
    <View className={styles.nodeWrap}>
      <View className={styles.left}>
        <View className={styles.dot} />
        {!isLast && <View className={styles.line} />}
      </View>
      <View className={styles.right}>
        <View className={styles.header}>
          <Text className={styles.typeText}>{getTraceNodeTypeText(node.type)}</Text>
          <Text className={styles.timeText}>{node.timestamp}</Text>
        </View>
        <Text className={styles.locationText}>{node.location}</Text>
        <Text className={styles.operatorText}>{node.operator}</Text>
        {node.temperature && (
          <View className={styles.tempTag}>
            <Text className={styles.tempText}>{node.temperature}</Text>
          </View>
        )}
        {node.remark && <Text className={styles.remarkText}>{node.remark}</Text>}
      </View>
    </View>
  );
};

export default TimelineNode;
