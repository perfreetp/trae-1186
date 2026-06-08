import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockDrugs } from '@/data/drugs';
import { mockRecalls } from '@/data/recalls';
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
  const [verifyId, setVerifyId] = useState('');
  const [verifyTime, setVerifyTime] = useState('');

  useEffect(() => {
    const { drugId, code, type } = router.params;
    const searchType = (type as 'regulatory' | 'package') || 'regulatory';
    setScanType(searchType);
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    setVerifyTime(now);
    setVerifyId(`VF${dayjs().format('YYYYMMDDHHmmss')}`);

    if (drugId) {
      const found = mockDrugs.find((d) => d.id === drugId) || null;
      setDrug(found);
      setNotFound(!found);
      setScannedCode('');
    } else if (code) {
      const decodedCode = decodeURIComponent(code);
      setScannedCode(decodedCode);
      let found: DrugInfo | null = null;
      if (searchType === 'regulatory') {
        found = mockDrugs.find((d) => d.regulatoryCode === decodedCode) || null;
      } else {
        found = mockDrugs.find((d) => d.packageCode === decodedCode) || null;
      }
      setDrug(found);
      setNotFound(!found);
      if (found) {
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

  const isRecalledBatch = useMemo(() => {
    if (!drug) return false;
    return mockRecalls.some(
      (r) => r.drugName === drug.name && r.batchNumber === drug.batchNumber && r.status !== 'completed'
    );
  }, [drug]);

  const riskLevel = useMemo(() => {
    if (!drug) return 'none';
    if (drug.status === 'error') return 'high';
    if (isRecalledBatch) return 'high';
    if (drug.status === 'warning') return 'medium';
    if (drug.isColdChain) return 'medium';
    if (drug.status === 'pending') return 'low';
    return 'low';
  }, [drug, isRecalledBatch]);

  const nextSteps = useMemo(() => {
    if (!drug) return [];
    const steps: { text: string; action?: string; url?: string }[] = [];
    if (drug.status === 'error') {
      steps.push({ text: '核验异常，请立即上报异常', action: 'report' });
      steps.push({ text: '暂停该药品销售，等待上级指示', action: 'none' });
    }
    if (drug.status === 'warning') {
      steps.push({ text: '存疑药品，建议进一步核查', action: 'trace' });
      steps.push({ text: '如有异常可一键上报', action: 'report' });
    }
    if (isRecalledBatch) {
      steps.push({ text: '⚠ 该批次已被召回，请立即处理', action: 'recall' });
      steps.push({ text: '下架该批次药品并隔离', action: 'none' });
    }
    if (drug.isColdChain) {
      steps.push({ text: '冷链药品，请核对到货温度', action: 'receive' });
    }
    if (drug.status === 'verified' && !isRecalledBatch) {
      steps.push({ text: '核验通过，可正常收货入库', action: 'receive' });
      steps.push({ text: '生成查验凭证给顾客', action: 'certificate' });
    }
    return steps;
  }, [drug, isRecalledBatch]);

  const handleTimeline = () => {
    if (drug) {
      Taro.navigateTo({ url: `/pages/timeline/index?drugId=${drug.id}` });
    }
  };

  const handleCertificate = () => {
    if (!drug) return;
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
  };

  const handleReport = () => {
    Taro.navigateTo({
      url: `/pages/report/index?preCode=${encodeURIComponent(scannedCode || (drug ? (scanType === 'regulatory' ? drug.regulatoryCode : drug.packageCode) : ''))}&preType=${scanType}&preDrugName=${encodeURIComponent(drug?.name || '')}&preBatch=${encodeURIComponent(drug?.batchNumber || '')}&notFound=${notFound ? '1' : '0'}`
    });
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'report':
        handleReport();
        break;
      case 'trace':
        handleTimeline();
        break;
      case 'receive':
        Taro.navigateTo({ url: '/pages/receive/index' });
        break;
      case 'recall':
        Taro.switchTab({ url: '/pages/recall/index' });
        break;
      case 'certificate':
        handleCertificate();
        break;
      default:
        break;
    }
  };

  if (notFound) {
    return (
      <View className={styles.container}>
        <View className={classnames(styles.statusBanner, styles.bannerError)}>
          <Text className={styles.statusIcon}>❌</Text>
          <View className={styles.statusInfo}>
            <Text className={classnames(styles.statusText, styles.statusTextError)}>核验失败</Text>
            <Text className={styles.statusDesc}>未查询到该码对应的药品信息，请核实码值或上报异常</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>核验信息</Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>核验编号</Text>
              <Text className={styles.infoValue}>{verifyId}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>码类型</Text>
              <Text className={styles.infoValue}>{scanType === 'regulatory' ? '监管码' : '包装码'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>{scanType === 'regulatory' ? '监管码' : '包装码'}</Text>
              <Text className={styles.infoValue}>{scannedCode || '未知'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>核验时间</Text>
              <Text className={styles.infoValue}>{verifyTime}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>操作员</Text>
              <Text className={styles.infoValue}>张丽</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>门店</Text>
              <Text className={styles.infoValue}>国大药房朝阳路店</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>失败原因</Text>
              <Text className={styles.infoValue}>该码未在追溯数据库中查到对应药品记录</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>风险处置建议</Text>
          <View className={styles.riskList}>
            <View className={styles.riskItem}>
              <Text className={styles.riskBullet}>•</Text>
              <Text className={styles.riskText}>该码无法核实药品来源，疑似假冒或渠道异常</Text>
            </View>
            <View className={styles.riskItem}>
              <Text className={styles.riskBullet}>•</Text>
              <Text className={styles.riskText}>请勿上架该药品，立即上报异常</Text>
            </View>
            <View className={styles.riskItem}>
              <Text className={styles.riskBullet}>•</Text>
              <Text className={styles.riskText}>保留药品及包装，配合后续调查</Text>
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

  const riskLevelMap: Record<string, { text: string; color: string; bg: string }> = {
    high: { text: '高风险', color: '#ef4444', bg: '#fef2f2' },
    medium: { text: '中风险', color: '#f59e0b', bg: '#fffbeb' },
    low: { text: '低风险', color: '#10b981', bg: '#ecfdf5' }
  };
  const risk = riskLevelMap[riskLevel] || riskLevelMap['low'];

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
      <View className={classnames(styles.statusBanner, {
        [styles.bannerVerified]: drug.status === 'verified',
        [styles.bannerWarning]: drug.status === 'warning',
        [styles.bannerError]: drug.status === 'error',
        [styles.bannerPending]: drug.status === 'pending'
      })}>
        <Text className={styles.statusIcon}>
          {drug.status === 'verified' ? '✅' : drug.status === 'warning' ? '⚠️' : drug.status === 'error' ? '❌' : '⏳'}
        </Text>
        <View className={styles.statusInfo}>
          <Text className={classnames(styles.statusText, {
            [styles.statusTextVerified]: drug.status === 'verified',
            [styles.statusTextWarning]: drug.status === 'warning',
            [styles.statusTextError]: drug.status === 'error',
            [styles.statusTextPending]: drug.status === 'pending'
          })}>
            {getStatusText(drug.status)}
          </Text>
          <Text className={styles.statusDesc}>
            {drug.status === 'verified' ? '该药品来源可追溯，核验通过' : drug.status === 'warning' ? '该药品存在存疑项，请进一步核查' : drug.status === 'error' ? '该药品核验异常，请立即上报' : '该药品信息待核验'}
          </Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.drugHeader}>
          <Image className={styles.drugImage} src={drug.imageUrl} mode="aspectFill" onError={(e) => console.error('[Detail] 图片加载失败:', e)} />
          <View className={styles.drugHeaderInfo}>
            <Text className={styles.drugName}>{drug.name}</Text>
            <Text className={styles.drugGeneric}>{drug.genericName}</Text>
            <Text className={styles.drugSpec}>{drug.specification}</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>核验工作台</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>核验编号</Text>
            <Text className={styles.infoValue}>{verifyId}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>码类型</Text>
            <Text className={styles.infoValue}>{scanType === 'regulatory' ? '监管码' : '包装码'}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>门店</Text>
            <Text className={styles.infoValue}>国大药房朝阳路店</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>操作员</Text>
            <Text className={styles.infoValue}>张丽</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>核验时间</Text>
            <Text className={styles.infoValue}>{verifyTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>风险等级</Text>
            <View className={styles.riskBadge} style={{ backgroundColor: risk.bg }}>
              <Text className={styles.riskBadgeText} style={{ color: risk.color }}>{risk.text}</Text>
            </View>
          </View>
        </View>
      </View>

      {drug.isColdChain && (
        <View className={styles.card}>
          <View className={classnames(styles.coldChainNotice, styles.coldChainActionable)}>
            <Text className={styles.coldChainIcon}>❄️</Text>
            <View style={{ flex: 1 }}>
              <Text className={styles.coldChainText}>冷链药品 {drug.coldChainTemp}</Text>
              <Text className={styles.coldChainDesc}>储存温度需保持在{drug.coldChainTemp}范围内</Text>
            </View>
            <View className={styles.coldChainActionBtn} onClick={() => Taro.navigateTo({ url: '/pages/receive/index' })}>
              <Text className={styles.coldChainActionText}>去核对</Text>
            </View>
          </View>
        </View>
      )}

      {isRecalledBatch && (
        <View className={styles.card}>
          <View className={styles.recallAlert}>
            <Text className={styles.recallIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text className={styles.recallTitle}>召回批次警告</Text>
              <Text className={styles.recallDesc}>该药品批次已被发布召回通知，请立即处理</Text>
            </View>
            <View className={styles.recallActionBtn} onClick={() => Taro.switchTab({ url: '/pages/recall/index' })}>
              <Text className={styles.recallActionText}>查看召回</Text>
            </View>
          </View>
        </View>
      )}

      {drug.status === 'error' && (
        <View className={styles.card}>
          <View className={styles.errorAlert}>
            <Text className={styles.errorAlertIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text className={styles.errorAlertTitle}>核验异常</Text>
              <Text className={styles.errorAlertDesc}>该药品存在异常，请立即暂停销售并上报</Text>
            </View>
            <View className={styles.errorActionBtn} onClick={handleReport}>
              <Text className={styles.errorActionText}>去上报</Text>
            </View>
          </View>
        </View>
      )}

      {nextSteps.length > 0 && (
        <View className={styles.card}>
          <Text className={styles.cardTitle}>下一步建议</Text>
          <View className={styles.stepGuideList}>
            {nextSteps.map((step, idx) => (
              <View key={idx} className={styles.stepGuideItem}>
                <Text className={styles.stepGuideNum}>{idx + 1}</Text>
                <Text className={styles.stepGuideText}>{step.text}</Text>
                {step.action && step.action !== 'none' && (
                  <View className={styles.stepGuideBtn} onClick={() => handleAction(step.action!)}>
                    <Text className={styles.stepGuideBtnText}>
                      {step.action === 'report' ? '去上报' : step.action === 'trace' ? '查追溯' : step.action === 'receive' ? '去收货' : step.action === 'recall' ? '查看' : '去生成'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
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
