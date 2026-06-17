import type { StatsData } from '../types';

export const stats: StatsData = {
  totalWarranties: 1850,
  activeWarranties: 1423,
  totalClaims: 493,
  approvedClaims: 376,
  rejectedClaims: 89,
  approvalRate: 0.763,
  avgRepairCost: 328,
  totalRepairCost: 123328,
  expiringSoon: 156,
  expiringToday: 8,

  monthlyTrend: [
    { month: '2026-01', issued: 280, claimed: 68 },
    { month: '2026-02', issued: 245, claimed: 72 },
    { month: '2026-03', issued: 312, claimed: 85 },
    { month: '2026-04', issued: 298, claimed: 78 },
    { month: '2026-05', issued: 356, claimed: 95 },
    { month: '2026-06', issued: 359, claimed: 95 },
  ],

  rejectReasons: [
    { reason: '人为损坏（进水/摔落）', count: 32 },
    { reason: '私自拆机/改装', count: 18 },
    { reason: '质保期已过', count: 15 },
    { reason: '非质量问题（正常损耗）', count: 12 },
    { reason: '提供虚假信息', count: 7 },
    { reason: '其他原因', count: 5 },
  ],

  storeRanking: [
    { store: '浦东中心店', warranties: 412, claims: 112, rate: 0.95 },
    { store: '南山科技园店', warranties: 367, claims: 95, rate: 0.93 },
    { store: '中关村旗舰店', warranties: 328, claims: 89, rate: 0.92 },
    { store: '天河城店', warranties: 289, claims: 78, rate: 0.90 },
    { store: '朝阳路店', warranties: 256, claims: 67, rate: 0.88 },
    { store: '西湖银泰店', warranties: 198, claims: 52, rate: 0.87 },
  ],

  repairCostTrend: [
    { month: '2026-01', cost: 18500 },
    { month: '2026-02', cost: 21200 },
    { month: '2026-03', cost: 24800 },
    { month: '2026-04', cost: 22500 },
    { month: '2026-05', cost: 27800 },
    { month: '2026-06', cost: 8528 },
  ],

  coverageDistribution: [
    { range: '0-30天', count: 245 },
    { range: '31-90天', count: 567 },
    { range: '91-180天', count: 412 },
    { range: '180天以上', count: 199 },
  ],
};

export const getApprovalRateText = (): string => {
  return (stats.approvalRate * 100).toFixed(1) + '%';
};

export const getAvgRepairCostText = (): string => {
  return '¥' + stats.avgRepairCost;
};

export const getTotalRepairCostText = (): string => {
  return '¥' + stats.totalRepairCost.toLocaleString();
};

export const getMonthlyGrowthRate = (): string => {
  const current = stats.monthlyTrend[stats.monthlyTrend.length - 1];
  const previous = stats.monthlyTrend[stats.monthlyTrend.length - 2];
  if (previous.issued === 0) return '0%';
  const rate = ((current.issued - previous.issued) / previous.issued) * 100;
  return (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%';
};

export const getTopRejectReason = (): { reason: string; count: number } => {
  return stats.rejectReasons.reduce((max, item) => 
    item.count > max.count ? item : max
  );
};

export const getTopStore = (): { store: string; warranties: number; claims: number; rate: number } => {
  return stats.storeRanking[0];
};

export const getTotalThisMonth = (): { issued: number; claimed: number } => {
  const current = stats.monthlyTrend[stats.monthlyTrend.length - 1];
  return { issued: current.issued, claimed: current.claimed };
};

export const getExpiringSummary = (): { soon: number; today: number } => {
  return { soon: stats.expiringSoon, today: stats.expiringToday };
};

export const getCoverageDistributionPercentages = () => {
  const total = stats.coverageDistribution.reduce((sum, item) => sum + item.count, 0);
  return stats.coverageDistribution.map(item => ({
    range: item.range,
    count: item.count,
    percentage: ((item.count / total) * 100).toFixed(1) + '%',
  }));
};
