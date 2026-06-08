import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import EmptyState from '@/components/EmptyState';
import { mockDrugs } from '@/data/drugs';
import { getStatusText } from '@/utils';
import styles from './index.module.scss';

const TracePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState(mockDrugs);

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'verified', label: '已核验' },
    { key: 'warning', label: '存疑' },
    { key: 'cold', label: '冷链' }
  ];

  const handleSearch = () => {
    let filtered = mockDrugs;
    if (searchValue.trim()) {
      const kw = searchValue.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(kw) ||
          d.batchNumber.toLowerCase().includes(kw) ||
          d.regulatoryCode.includes(kw) ||
          d.packageCode.includes(kw)
      );
    }
    if (activeFilter === 'verified') {
      filtered = filtered.filter((d) => d.status === 'verified');
    } else if (activeFilter === 'warning') {
      filtered = filtered.filter((d) => d.status === 'warning' || d.status === 'error');
    } else if (activeFilter === 'cold') {
      filtered = filtered.filter((d) => d.isColdChain);
    }
    setResults(filtered);
    console.info('[Trace] 搜索结果:', filtered.length);
  };

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    let filtered = mockDrugs;
    if (searchValue.trim()) {
      const kw = searchValue.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(kw) ||
          d.batchNumber.toLowerCase().includes(kw) ||
          d.regulatoryCode.includes(kw) ||
          d.packageCode.includes(kw)
      );
    }
    if (key === 'verified') {
      filtered = filtered.filter((d) => d.status === 'verified');
    } else if (key === 'warning') {
      filtered = filtered.filter((d) => d.status === 'warning' || d.status === 'error');
    } else if (key === 'cold') {
      filtered = filtered.filter((d) => d.isColdChain);
    }
    setResults(filtered);
  };

  const handleDrugClick = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?drugId=${drugId}`
    });
  };

  const handleViewTimeline = (drugId: string) => {
    Taro.navigateTo({
      url: `/pages/timeline/index?drugId=${drugId}`
    });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.searchWrap}>
        <View className={styles.searchRow}>
          <Input
            className={styles.searchInput}
            placeholder="输入批号/监管码/药品名"
            value={searchValue}
            onInput={(e) => setSearchValue(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
          />
          <View className={styles.searchBtn} onClick={handleSearch}>
            <Text className={styles.searchBtnText}>搜索</Text>
          </View>
        </View>
        <Text className={styles.searchHint}>
          支持按批号、监管码、包装码、药品名称搜索
        </Text>
        <View className={styles.filterRow}>
          {filters.map((f) => (
            <View
              key={f.key}
              className={classnames(
                styles.filterTag,
                activeFilter === f.key && styles.filterTagActive
              )}
              onClick={() => handleFilterChange(f.key)}
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
      </View>

      <View className={styles.resultSection}>
        <View className={styles.resultHeader}>
          <Text className={styles.resultTitle}>查询结果</Text>
          <Text className={styles.resultCount}>共{results.length}条</Text>
        </View>

        {results.length === 0 ? (
          <View className={styles.emptyWrap}>
            <EmptyState title="未找到相关药品" description="请更换关键词或筛选条件后重试" />
          </View>
        ) : (
          <View className={styles.resultList}>
            {results.map((drug) => (
              <View
                key={drug.id}
                className={styles.drugCard}
                onClick={() => handleDrugClick(drug.id)}
              >
                <View className={styles.drugCardHeader}>
                  <View className={styles.drugNameWrap}>
                    <Text className={styles.drugName}>{drug.name}</Text>
                    <Text className={styles.drugGeneric}>{drug.genericName}</Text>
                  </View>
                  <StatusTag status={drug.status} text={getStatusText(drug.status)} size="small" />
                </View>
                <View className={styles.drugInfoGrid}>
                  <View className={styles.drugInfoItem}>
                    <Text className={styles.drugInfoLabel}>批号</Text>
                    <Text className={styles.drugInfoValue}>{drug.batchNumber}</Text>
                  </View>
                  <View className={styles.drugInfoItem}>
                    <Text className={styles.drugInfoLabel}>有效期至</Text>
                    <Text className={styles.drugInfoValue}>{drug.expiryDate}</Text>
                  </View>
                  <View className={styles.drugInfoItem}>
                    <Text className={styles.drugInfoLabel}>生产企业</Text>
                    <Text className={styles.drugInfoValue}>{drug.manufacturer}</Text>
                  </View>
                  <View className={styles.drugInfoItem}>
                    <Text className={styles.drugInfoLabel}>规格</Text>
                    <Text className={styles.drugInfoValue}>{drug.specification}</Text>
                  </View>
                </View>
                <View className={styles.drugCardFooter}>
                  {drug.isColdChain ? (
                    <View className={styles.coldChainTag}>
                      <Text className={styles.coldChainText}>❄ 冷链药品 {drug.coldChainTemp}</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <View
                    className={styles.viewDetailBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTimeline(drug.id);
                    }}
                  >
                    <Text className={styles.viewDetailBtnText}>查看追溯</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TracePage;
