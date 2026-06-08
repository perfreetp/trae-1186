import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { getStatusText, getExceptionTypeText } from '@/utils';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const exceptionTypes = [
  { key: 'damaged', label: '包装破损' },
  { key: 'counterfeit', label: '疑似假药' },
  { key: 'expired', label: '过期药品' },
  { key: 'temperature', label: '温度异常' },
  { key: 'other', label: '其他异常' }
];

const ReportPage: React.FC = () => {
  const router = useRouter();
  const exceptionReports = useAppStore((s) => s.exceptionReports);
  const addExceptionReport = useAppStore((s) => s.addExceptionReport);

  const [activeType, setActiveType] = useState('damaged');
  const [drugName, setDrugName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sourceCode, setSourceCode] = useState('');
  const [sourceCodeType, setSourceCodeType] = useState<'regulatory' | 'package'>('regulatory');
  const [sourceNotFound, setSourceNotFound] = useState(false);

  useEffect(() => {
    const { preCode, preType, preDrugName, preBatch, notFound } = router.params;
    if (preCode) {
      setSourceCode(decodeURIComponent(preCode));
    }
    if (preType) {
      const codeType = preType as 'regulatory' | 'package';
      setSourceCodeType(codeType);
      setActiveType(codeType === 'regulatory' ? 'counterfeit' : 'damaged');
    }
    if (preDrugName) {
      setDrugName(decodeURIComponent(preDrugName));
    }
    if (preBatch) {
      setBatchNumber(decodeURIComponent(preBatch));
    }
    if (notFound === '1') {
      setSourceNotFound(true);
      setDescription(`扫码核验失败，${preType === 'regulatory' ? '监管码' : '包装码'} ${decodeURIComponent(preCode || '')} 未在追溯数据库中查到对应药品记录，疑似假冒或渠道异常。`);
    }
  }, [router.params]);

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 3 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.info('[Report] 选择图片:', res.tempFilePaths.length);
        setPhotos((prev) => [...prev, ...res.tempFilePaths]);
      },
      fail: (err) => {
        console.error('[Report] 选择图片失败:', err);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!drugName.trim() && !sourceCode) {
      Taro.showToast({ title: '请输入药品名称或扫码信息', icon: 'none' });
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
          const now = dayjs().format('YYYY-MM-DD HH:mm');
          addExceptionReport({
            id: `ex_${Date.now()}`,
            drugId: '',
            drugName: drugName.trim() || '未知药品',
            batchNumber: batchNumber.trim() || '未填写',
            type: activeType as 'damaged' | 'counterfeit' | 'expired' | 'temperature' | 'other',
            description: description.trim(),
            images: photos,
            reporter: '张丽',
            reportTime: now,
            status: 'submitted',
            storeName: '国大药房朝阳路店',
            sourceCode: sourceCode || undefined,
            sourceCodeType: sourceCode ? sourceCodeType : undefined
          } as any);
          setDrugName('');
          setBatchNumber('');
          setDescription('');
          setPhotos([]);
          setActiveType('damaged');
          setSourceCode('');
          setSourceNotFound(false);
          Taro.showToast({ title: '上报成功', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.formSection}>
        <Text className={styles.formTitle}>异常上报</Text>

        {sourceCode && (
          <View className={styles.sourceInfo}>
            <Text className={styles.sourceLabel}>来源码信息</Text>
            <View className={styles.sourceRow}>
              <Text className={styles.sourceType}>{sourceCodeType === 'regulatory' ? '监管码' : '包装码'}</Text>
              <Text className={styles.sourceCodeText}>{sourceCode}</Text>
            </View>
            {sourceNotFound && (
              <Text className={styles.sourceWarning}>⚠ 该码未查到对应药品</Text>
            )}
          </View>
        )}

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
            {photos.map((uri, idx) => (
              <View key={idx} className={styles.photoItem} onClick={() => handleRemovePhoto(idx)}>
                <Image className={styles.photoImage} src={uri} mode="aspectFill" />
                <View className={styles.photoRemove}>
                  <Text className={styles.photoRemoveText}>✕</Text>
                </View>
              </View>
            ))}
            {photos.length < 3 && (
              <View className={styles.photoAddBtn} onClick={handleTakePhoto}>
                <Text className={styles.photoAddIcon}>📷</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>提交上报</Text>
        </View>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>上报记录</Text>
        <View className={styles.historyList}>
          {exceptionReports.map((report) => (
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
              {(report as any).sourceCode && (
                <View className={styles.historySourceRow}>
                  <Text className={styles.historySourceType}>
                    {(report as any).sourceCodeType === 'regulatory' ? '监管码' : '包装码'}:
                  </Text>
                  <Text className={styles.historySourceCode}>{(report as any).sourceCode}</Text>
                </View>
              )}
              {report.images && report.images.length > 0 && (
                <View className={styles.historyPhotoRow}>
                  {report.images.map((img, idx) => (
                    <Image key={idx} className={styles.historyPhotoThumb} src={img} mode="aspectFill" />
                  ))}
                  <Text className={styles.historyPhotoCount}>{report.images.length}张照片</Text>
                </View>
              )}
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
