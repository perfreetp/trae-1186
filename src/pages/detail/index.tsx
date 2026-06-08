import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockDrugs } from '@/data/drugs';
import { getStatusText } from '@/utils';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [drug, setDrug] = useState(mockDrugs[0]);

  useEffect(() => {
    const { drugId, code, type } = router.params;
    let found = mockDrugs[0];
    if (drugId) {
      found = mockDrugs.find((d) => d.id === drugId) || mockDrugs[0];
    } else if (code) {
      found = mockDrugs.find(
        (d) => d.regulatoryCode === code || d.packageCode === code
      ) || mockDrugs[0];
    }
    setDrug(found);
    console.info('[Detail] 药品详情:', found.name);
  }, [router.params]);

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
    pending: styles.bannerPending
  };

  const statusTextClassMap: Record<string, string> = {
    verified: styles.statusTextVerified,
    warning: styles.statusTextWarning,
    error: styles.statusTextError,
    pending: styles.statusTextPending
  };

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

  const handleTimeline = () => {
    Taro.navigateTo({
      url: `/pages/timeline/index?drugId=${drug.id}`
    });
  };

  const handleCertificate = () => {
    Taro.showModal({
      title: '生成查验凭证',
      content: `为"${drug.name}"(批号${drug.batchNumber})生成查验凭证？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '凭证已生成', icon: 'success' });
        }
      }
    });
  };

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
