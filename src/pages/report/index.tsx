import React, { useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockExceptionReports } from '@/data/scanHistory';
import { getStatusText, getExceptionTypeText } from '@/utils';
import styles from './index.module.scss';

const exceptionTypes = [
  { key: 'damaged', label: '包装破损' },
  { key: 'counterfeit', label: '疑似假药' },
  { key: 'expired', label: '过期药品' },
  { key: 'temperature', label: '温度异常' },
  { key: 'other', label: '其他异常' }
];

const ReportPage: React.FC = () => {
  const [activeType, setActiveType] = useState('damaged');
  const [drugName, setDrugName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.info('[Report] 选择图片:', res.tempFilePaths.length);
        Taro.showToast({ title: `已选择${res.tempFilePaths.length}张图片`, icon: 'none' });
      },
      fail: (err) => {
        console.error('[Report] 选择图片失败:', err);
      }
    });
  };

  const handleSubmit = () => {
    if (!drugName.trim()) {
      Taro.showToast({ title: '请输入药品名称', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请描述异常情况', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认提交',
      content: `确认上报"${getExceptionTypeText(activeType)}"异常？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '上报成功', icon: 'success' });
          setDrugName('');
          setBatchNumber('');
          setDescription('');
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.formSection}>
        <Text className={styles.formTitle}>异常上报</Text>

        <Text className={styles.formLabel}>异常类型</Text>
        <View className={styles.typeGrid}>
          {exceptionTypes.map((t) => (
            <View
              key={t.key}
              className={classnames(
                styles.typeItem,
                activeType === t.key && styles.typeItemActive
              )}
              onClick={() => setActiveType(t.key)}
            >
              <Text
                className={classnames(
                  styles.typeItemText,
                  activeType === t.key && styles.typeItemActiveText
                )}
              >
                {t.label}
              </Text>
            </View>
          ))}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>药品名称</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入药品名称"
            value={drugName}
            onInput={(e) => setDrugName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>批号（选填）</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入批号"
            value={batchNumber}
            onInput={(e) => setBatchNumber(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>异常描述</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请详细描述异常情况..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        <View className={styles.photoSection}>
          <Text className={styles.photoLabel}>拍照取证</Text>
          <View className={styles.photoGrid}>
            <View className={styles.photoAddBtn} onClick={handleTakePhoto}>
              <Text className={styles.photoAddIcon}>📷</Text>
              <Text className={styles.photoAddText}>添加照片</Text>
            </View>
          </View>
        </View>

        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>提交上报</Text>
        </View>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>上报记录</Text>
        <View className={styles.historyList}>
          {mockExceptionReports.map((report) => (
            <View key={report.id} className={styles.historyCard}>
              <View className={styles.historyHeader}>
                <View className={styles.historyTitleWrap}>
                  <Text className={styles.historyDrugName}>{report.drugName}</Text>
                  <Text className={styles.historyBatch}>
                    {getExceptionTypeText(report.type)} | 批号: {report.batchNumber}
                  </Text>
                </View>
                <StatusTag status={report.status} text={getStatusText(report.status)} size="small" />
              </View>
              <Text className={styles.historyDesc}>{report.description}</Text>
              <View className={styles.historyFooter}>
                <Text className={styles.historyTime}>{report.reportTime}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
