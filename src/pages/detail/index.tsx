import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockDrugs } from '@/data/drugs';
import { useAppStore } from '@/store/useAppStore';
import { getStatusText, generateId } from '@/utils';
import dayjs from 'dayjs';
import type { DrugInfo } from '@/types';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const addScanRecord = useAppStore((s) => s.addScanRecord);
  const addCertificate = useAppStore((s) => s.addCertificate);

  const [drug, setDrug] = useState<DrugInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanType, setScanType] = useState<'regulatory' | 'package'>('regulatory');

  useEffect(() => {
    const { drugId, code, type } = router.params;
    const searchType = (type as 'regulatory' | 'package') || 'regulatory';
    setScanType(searchType);

    if (drugId) {
      const found = mockDrugs.find((d) => d.id === drugId) || null;
      setDrug(found);
      setNotFound(!found);
      setScannedCode('');
    } else if (code) {
      const decodedCode = decodeURIComponent(code);
      setScannedCode(decodedCode);
      const found = mockDrugs.find(
        (d) => d.regulatoryCode === decodedCode || d.packageCode === decodedCode
      ) || null;
      setDrug(found);
      setNotFound(!found);
      if (found) {
        const now = dayjs().format('YYYY-MM-DD HH:mm');
        addScanRecord({
          id: generateId(),
          drugId: found.id,
          drugName: found.name,
          batchNumber: found.batchNumber,
          scanTime: now,
          scanType: searchType,
          isOffline: false,
          result: found.status === 'pending' ? 'warning' : found.status
        });
      }
    }
  }, [router.params]);

  const handleTimeline = () => {
    if (drug) {
      Taro.navigateTo({
        url: `/pages/timeline/index?drugId=${drug.id}`
      });
    }
  };

  const handleCertificate = () => {
    if (!drug) return;
    Taro.showModal({
      title: '生成查验凭证',
      content: `为"${drug.name}"(批号${drug.batchNumber})生成查验凭证？`,
      success: (res) => {
        if (res.confirm) {
          const now = dayjs().format('YYYY-MM-DD HH:mm');
          addCertificate({
            id: generateId(),
            drugId: drug.id,
            drugName: drug.name,
            batchNumber: drug.batchNumber,
            verificationTime: now,
            result: drug.status === 'pending' ? 'warning' : drug.status,
            operator: '张丽',
            storeName: '国大药房朝阳路店'
          });
          Taro.showToast({ title: '凭证已生成', icon: 'success' });
        }
      }
    });
  };

  const handleReport = () => {
    Taro.navigateTo({
      url: `/pages/report/index${scannedCode ? `?preCode=${encodeURIComponent(scannedCode)}&preType=${scanType}` : ''}`
    });
  };

  const statusIcons: Record<string, string> = {
    verified: '✅',
    warning: '⚠️',
    error: '❌',
    pending: '⏳'
  };

  const bannerClassMap: Record<string, string> = {
    verified: styles.bannerVerified,
    warning: styles.bannerWarning,
    error: styles.bannerError,
    pending: styles.bannerPending,
    notfound: styles.bannerError
  };

  const statusTextClassMap: Record<string, string> = {
    verified: styles.statusTextVerified,
    warning: styles.statusTextWarning,
    error: styles.statusTextError,
    pending: styles.statusTextPending,
    notfound: styles.statusTextError
  };

  if (notFound) {
    return (
      <View className={styles.container}>
        <View className={classnames(styles.statusBanner, styles.bannerError)}>
          <Text className={styles.statusIcon}>❌</Text>
          <View className={styles.statusInfo}>
            <Text className={classnames(styles.statusText, styles.statusTextError)}>
              核验失败
            </Text>
            <Text className={styles.statusDesc}>
              未查询到该码对应的药品信息，请核实码值或上报异常
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>扫描信息</Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>码类型</Text>
              <Text className={styles.infoValue}>
                {scanType === 'regulatory' ? '监管码' : '包装码'}
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>{scanType === 'regulatory' ? '监管码' : '包装码'}</Text>
              <Text className={styles.infoValue}>{scannedCode || '未知'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>失败原因</Text>
              <Text className={styles.infoValue}>该码未在追溯数据库中查到对应药品记录</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>扫描时间</Text>
              <Text className={styles.infoValue}>{dayjs().format('YYYY-MM-DD HH:mm')}</Text>
            </View>
          </View>
        </View>

        <View className={styles.bottomBar}>
          <View className={classnames(styles.bottomBtn, styles.btnSecondary)} onClick={() => Taro.navigateBack()}>
            <Text className={styles.btnSecondaryText}>返回重扫</Text>
          </View>
          <View className={classnames(styles.bottomBtn, styles.btnReport)} onClick={handleReport}>
            <Text className={styles.btnReportText}>异常上报</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!drug) {
    return (
      <View className={styles.container}>
        <View className={classnames(styles.statusBanner, styles.bannerPending)}>
          <Text className={styles.statusIcon}>⏳</Text>
          <View className={styles.statusInfo}>
            <Text className={classnames(styles.statusText, styles.statusTextPending)}>加载中</Text>
            <Text className={styles.statusDesc}>正在获取药品信息...</Text>
          </View>
        </View>
      </View>
    );
  }

  const infoItems = [
    { label: '通用名', value: drug.genericName },
    { label: '剂型', value: drug.dosageForm },
    { label: '规格', value: drug.specification },
    { label: '生产企业', value: drug.manufacturer },
    { label: '批号', value: drug.batchNumber },
    { label: '生产日期', value: drug.productionDate },
    { label: '有效期至', value: drug.expiryDate },
    { label: '批准文号', value: drug.approvalNumber },
    { label: '监管码', value: drug.regulatoryCode },
    { label: '包装码', value: drug.packageCode },
    { label: '储存条件', value: drug.storageCondition }
  ];

  return (
    <View className={styles.container}>
      <View
        className={classnames(
          styles.statusBanner,
          bannerClassMap[drug.status]
        )}
      >
        <Text className={styles.statusIcon}>{statusIcons[drug.status]}</Text>
        <View className={styles.statusInfo}>
          <Text className={classnames(styles.statusText, statusTextClassMap[drug.status])}>
            {getStatusText(drug.status)}
          </Text>
          <Text className={styles.statusDesc}>
            {drug.status === 'verified'
              ? '该药品来源可追溯，核验通过'
              : drug.status === 'warning'
              ? '该药品存在存疑项，请进一步核查'
              : drug.status === 'error'
              ? '该药品核验异常，请立即上报'
              : '该药品信息待核验'}
          </Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.drugHeader}>
          <Image
            className={styles.drugImage}
            src={drug.imageUrl}
            mode="aspectFill"
            onError={(e) => console.error('[Detail] 图片加载失败:', e)}
          />
          <View className={styles.drugHeaderInfo}>
            <Text className={styles.drugName}>{drug.name}</Text>
            <Text className={styles.drugGeneric}>{drug.genericName}</Text>
            <Text className={styles.drugSpec}>{drug.specification}</Text>
          </View>
        </View>
      </View>

      {drug.isColdChain && (
        <View className={styles.card}>
          <View className={styles.coldChainNotice}>
            <Text className={styles.coldChainIcon}>❄️</Text>
            <View>
              <Text className={styles.coldChainText}>冷链药品 {drug.coldChainTemp}</Text>
              <Text className={styles.coldChainDesc}>
                储存温度需保持在{drug.coldChainTemp}范围内
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.card}>
        <Text className={styles.cardTitle}>药品信息</Text>
        <View className={styles.infoGrid}>
          {infoItems.map((item) => (
            <View key={item.label} className={styles.infoItem}>
              <Text className={styles.infoLabel}>{item.label}</Text>
              <Text className={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.bottomBtn, styles.btnSecondary)} onClick={handleCertificate}>
          <Text className={styles.btnSecondaryText}>生成凭证</Text>
        </View>
        <View className={classnames(styles.bottomBtn, styles.btnPrimary)} onClick={handleTimeline}>
          <Text className={styles.btnPrimaryText}>查看追溯</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
