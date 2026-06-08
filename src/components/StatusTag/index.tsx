import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  text: string;
  size?: 'small' | 'normal';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, text, size = 'normal' }) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[`status_${status}`],
        size === 'small' && styles.small
      )}
    >
      <Text className={classnames(styles.tagText, size === 'small' && styles.smallText)}>
        {text}
      </Text>
    </View>
  );
};

export default StatusTag;
