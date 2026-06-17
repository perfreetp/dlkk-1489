import { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Download,
  MessageSquare,
  FileText,
  BarChart3,
  PieChart,
  PhoneCall,
  User,
  Clock,
  Send,
  CalendarRange,
  Building,
  AlertOctagon,
  Wrench,
  Target,
  Repeat,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  ArrowRight,
  ThumbsUp,
  Handshake,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useWarrantyStore } from '@/store/warrantyStore';
import { PageHeader } from '@/components/Layout';
import { StatCard, StatusBadge } from '@/components/Card';
import { Input } from '@/components/Form';
import type { FormOption, Warranty } from '@/types';

const CHART_COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#86909C'];

const TIME_OPTIONS: FormOption[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年' },
  { value: 'custom', label: '自定义' },
];

export default function Stats() {
  const { getStats, getExpiringWarranties, visits, warranties, getClosedLoopStats } = useWarrantyStore();
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [funnelDetailTab, setFunnelDetailTab] = useState<'warranties' | 'claims' | 'repairs' | 'visits'>('warranties');

  const stats = useMemo(() => getStats(), [getStats]);
  const closedLoopData = useMemo(() => getClosedLoopStats(startDate, endDate), [getClosedLoopStats, startDate, endDate]);

  const expiringWarranties = useMemo(() => {
    const expiring = getExpiringWarranties(30);
    return expiring
      .map((w) => ({
        ...w,
        remainingDays: dayjs(w.expireDate).diff(dayjs(), 'day'),
      }))
      .sort((a, b) => (a.remainingDays || 0) - (b.remainingDays || 0));
  }, [getExpiringWarranties]);

  const recentVisits = useMemo(() => {
    return [...visits]
      .sort((a, b) => dayjs(b.visitDate).valueOf() - dayjs(a.visitDate).valueOf())
      .slice(0, 6);
  }, [visits]);

  const expiredCount = useMemo(() => {
    return warranties.filter((w) => w.status === 'expired').length;
  }, [warranties]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const today = dayjs();
    switch (value) {
      case 'today':
        setStartDate(today.format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        setShowCustom(false);
        break;
      case 'week':
        setStartDate(today.startOf('week').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        setShowCustom(false);
        break;
      case 'month':
        setStartDate(today.startOf('month').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        setShowCustom(false);
        break;
      case 'quarter': {
        const quarter = Math.floor(today.month() / 3);
        const quarterStart = dayjs(`${today.year()}-${quarter * 3 + 1}-01`);
        setStartDate(quarterStart.format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        setShowCustom(false);
        break;
      }
      case 'year':
        setStartDate(today.startOf('year').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        setShowCustom(false);
        break;
      case 'custom':
        setShowCustom(true);
        break;
    }
  };

  const handleSendReminder = async (warranty: Warranty) => {
    setSendingId(warranty.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSendingId(null);
    alert(`已向 ${warranty.customerName} 发送提醒短信`);
  };

  const handleBatchReminder = () => {
    const count = expiringWarranties.length;
    alert(`已向 ${count} 位客户发送批量提醒短信`);
  };

  const handleExport = () => {
    alert('正在生成 Excel 报表，请稍候...');
  };

  const handleViewReport = () => {
    alert('正在加载详细报告...');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-base ${i < rating ? 'text-warning-400' : 'text-dark-600'}`}
      >
        ★
      </span>
    ));
  };

  const statCards = [
    {
      title: '质保卡总数',
      value: stats.totalWarranties,
      icon: Shield,
      color: 'primary' as const,
      trend: { value: 12.5, isUp: true },
    },
    {
      title: '有效质保卡',
      value: stats.activeWarranties,
      icon: ShieldCheck,
      color: 'success' as const,
      trend: { value: 8.3, isUp: true },
    },
    {
      title: '已过期质保卡',
      value: expiredCount,
      icon: ShieldAlert,
      color: 'danger' as const,
      trend: { value: 5.2, isUp: true },
    },
    {
      title: '总核销次数',
      value: stats.totalClaims,
      icon: CheckCircle,
      color: 'primary' as const,
      trend: { value: 15.6, isUp: true },
    },
    {
      title: '核销通过率',
      value: `${(stats.approvalRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'success' as const,
      trend: { value: 2.1, isUp: true },
    },
    {
      title: '平均返修成本',
      value: `¥${stats.avgRepairCost.toFixed(0)}`,
      icon: DollarSign,
      color: 'warning' as const,
      trend: { value: 3.8, isUp: false },
    },
    {
      title: '总返修成本',
      value: `¥${stats.totalRepairCost.toLocaleString()}`,
      icon: BarChart3,
      color: 'danger' as const,
      trend: { value: 8.7, isUp: true },
    },
    {
      title: '30天内到期',
      value: stats.expiringSoon,
      icon: AlertTriangle,
      color: 'warning' as const,
      trend: { value: 10.2, isUp: true },
    },
  ];

  const sortedStoreRanking = useMemo(() => {
    return [...stats.storeRanking].sort((a, b) => b.rate - a.rate);
  }, [stats.storeRanking]);

  const daysDistribution = useMemo(() => {
    const ranges = [
      { range: '0-7天', min: 0, max: 7 },
      { range: '8-15天', min: 8, max: 15 },
      { range: '16-30天', min: 16, max: 30 },
      { range: '31-90天', min: 31, max: 90 },
      { range: '90天以上', min: 91, max: Infinity },
    ];

    return ranges.map(({ range, min, max }) => {
      const active = warranties.filter((w) => {
        if (w.status !== 'active') return false;
        const remaining = dayjs(w.expireDate).diff(dayjs(), 'day');
        return remaining >= min && remaining <= max;
      }).length;

      const expired = warranties.filter((w) => {
        const remaining = dayjs(w.expireDate).diff(dayjs(), 'day');
        return remaining < 0 && remaining >= -max;
      }).length;

      return { range, active, expired };
    });
  }, [warranties]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="质保统计"
        subtitle="质保发放量、核销率、拒保原因、返修成本、门店排行和临期提醒"
        breadcrumb={[{ label: '首页' }, { label: '统计分析' }, { label: '质保统计' }]}
        action={
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出报表
            </button>
            <button className="btn-warning" onClick={handleBatchReminder}>
              <MessageSquare className="w-4 h-4 mr-2" />
              发送批量提醒
            </button>
            <button className="btn-primary" onClick={handleViewReport}>
              <FileText className="w-4 h-4 mr-2" />
              查看详细报告
            </button>
          </div>
        }
      />

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-primary-400" />
            <span className="text-dark-200 font-medium">时间范围：</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
                }`}
                onClick={() => handleTimeRangeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {showCustom && (
            <div className="flex items-center gap-3 ml-4">
              <div className="w-40">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <span className="text-dark-400">至</span>
              <div className="w-40">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="card-hover"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            月度趋势分析
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#165DFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B42A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00B42A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272E3B" />
              <XAxis dataKey="month" stroke="#86909C" tick={{ fill: '#86909C' }} />
              <YAxis stroke="#86909C" tick={{ fill: '#86909C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#86909C' }} />
              <Area
                type="monotone"
                dataKey="issued"
                name="质保签发量"
                stroke="#165DFF"
                fillOpacity={1}
                fill="url(#colorIssued)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="claimed"
                name="核销量"
                stroke="#00B42A"
                fillOpacity={1}
                fill="url(#colorClaimed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-warning-400" />
            返修成本趋势
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.repairCostTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7D00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF7D00" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272E3B" />
              <XAxis dataKey="month" stroke="#86909C" tick={{ fill: '#86909C' }} />
              <YAxis stroke="#86909C" tick={{ fill: '#86909C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '返修成本']}
              />
              <Bar dataKey="cost" name="返修成本" fill="url(#colorCost)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 mb-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary-400" />
            售后闭环看板
            <span className="text-sm font-normal text-dark-400 ml-2">
              {startDate} ~ {endDate}
            </span>
          </h3>
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary-400" /> 发卡
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4 text-warning-400" /> 核销
            </span>
            <span className="flex items-center gap-1">
              <Wrench className="w-4 h-4 text-success-400" /> 返修完成
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-danger-400" /> 争议
            </span>
            <span className="flex items-center gap-1">
              <AlertOctagon className="w-4 h-4 text-danger-400" /> 黑名单命中
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  门店
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  发卡量
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  核销量
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  核销率
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  返修完成
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  返修率
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  争议量
                </th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  黑名单命中
                </th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-dark-300 uppercase">
                  返修总成本
                </th>
              </tr>
            </thead>
            <tbody>
              {closedLoopData.map((store, index) => (
                <tr
                  key={store.storeId}
                  className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors"
                >
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{store.storeName}</p>
                        <p className="text-xs text-dark-400">{store.storeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-white font-semibold">{store.warrantyCount}</span>
                    <span className="text-dark-400 text-sm"> 张</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-warning-400 font-semibold">{store.claimCount}</span>
                    <span className="text-dark-400 text-sm"> 次</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-500 rounded-full"
                          style={{ width: `${Math.min(100, store.claimRate * 100)}%` }}
                        />
                      </div>
                      <span className="text-dark-300 text-sm">
                        {(store.claimRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-success-400 font-semibold">{store.repairCompletedCount}</span>
                    <span className="text-dark-400 text-sm"> 次</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-500 rounded-full"
                          style={{ width: `${Math.min(100, store.repairRate * 100)}%` }}
                        />
                      </div>
                      <span className="text-dark-300 text-sm">
                        {(store.repairRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className={store.disputeCount > 0 ? 'text-danger-400 font-semibold' : 'text-dark-400'}>
                      {store.disputeCount}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    {store.blacklistHit > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-danger-500/20 text-danger-400 text-xs font-medium">
                        <AlertOctagon className="w-3 h-3" />
                        {store.blacklistHit}
                      </span>
                    ) : (
                      <span className="text-dark-500">-</span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <span className="text-white font-semibold">
                      ¥{store.totalRepairCost.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-dark-700">
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary-400">
              {closedLoopData.reduce((sum, s) => sum + s.warrantyCount, 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">总发卡量</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-warning-400">
              {closedLoopData.reduce((sum, s) => sum + s.claimCount, 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">总核销量</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success-400">
              {closedLoopData.reduce((sum, s) => sum + s.repairCompletedCount, 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">总返修完成</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-danger-400">
              {closedLoopData.reduce((sum, s) => sum + s.disputeCount, 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">总争议量</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-danger-400">
              {closedLoopData.reduce((sum, s) => sum + s.blacklistHit, 0)}
            </p>
            <p className="text-sm text-dark-400 mt-1">黑名单命中</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-warning-400">
              ¥{closedLoopData.reduce((sum, s) => sum + s.totalRepairCost, 0).toLocaleString()}
            </p>
            <p className="text-sm text-dark-400 mt-1">总返修成本</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            门店售后漏斗
            <span className="text-sm font-normal text-dark-400 ml-2">
              {startDate} ~ {endDate}
            </span>
          </h3>
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary-400" /> 发卡
            </span>
            <ArrowRight className="w-4 h-4 text-dark-600" />
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-warning-400" /> 核销申请
            </span>
            <ArrowRight className="w-4 h-4 text-dark-600" />
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success-400" /> 检测通过
            </span>
            <ArrowRight className="w-4 h-4 text-dark-600" />
            <span className="flex items-center gap-1">
              <Wrench className="w-4 h-4 text-primary-400" /> 返修完成
            </span>
            <ArrowRight className="w-4 h-4 text-dark-600" />
            <span className="flex items-center gap-1">
              <Handshake className="w-4 h-4 text-success-400" /> 客户签收
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {closedLoopData.map((store, storeIndex) => {
            const isExpanded = expandedStoreId === store.storeId;
            const f = store.funnel;
            const maxWidth = Math.max(f.issue, 1);
            return (
              <div key={store.storeId} className="border border-dark-700 rounded-xl overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-dark-700/30 transition-colors"
                  onClick={() => setExpandedStoreId(isExpanded ? null : store.storeId)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                      {storeIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{store.storeName}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-dark-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-dark-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 h-12">
                    <div
                      className="h-full bg-primary-500/80 rounded-lg flex items-center justify-center px-3 text-white text-sm font-medium transition-all"
                      style={{ width: `${Math.max(8, (f.issue / maxWidth) * 100)}%` }}
                    >
                      <div className="text-center">
                        <p className="font-bold">{f.issue}</p>
                        <p className="text-xs opacity-80">发卡</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-600 flex-shrink-0" />
                    <div
                      className="h-full bg-warning-500/80 rounded-lg flex items-center justify-center px-3 text-white text-sm font-medium transition-all"
                      style={{ width: `${Math.max(8, (f.claim / maxWidth) * 100)}%` }}
                    >
                      <div className="text-center">
                        <p className="font-bold">{f.claim}</p>
                        <p className="text-xs opacity-80">申请 {(f.claimRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-600 flex-shrink-0" />
                    <div
                      className="h-full bg-success-500/80 rounded-lg flex items-center justify-center px-3 text-white text-sm font-medium transition-all"
                      style={{ width: `${Math.max(8, (f.approved / maxWidth) * 100)}%` }}
                    >
                      <div className="text-center">
                        <p className="font-bold">{f.approved}</p>
                        <p className="text-xs opacity-80">通过 {(f.approveRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-600 flex-shrink-0" />
                    <div
                      className="h-full bg-primary-500/80 rounded-lg flex items-center justify-center px-3 text-white text-sm font-medium transition-all"
                      style={{ width: `${Math.max(8, (f.repair / maxWidth) * 100)}%` }}
                    >
                      <div className="text-center">
                        <p className="font-bold">{f.repair}</p>
                        <p className="text-xs opacity-80">返修 {(f.repairRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-600 flex-shrink-0" />
                    <div
                      className="h-full bg-success-500/80 rounded-lg flex items-center justify-center px-3 text-white text-sm font-medium transition-all"
                      style={{ width: `${Math.max(8, (f.signed / maxWidth) * 100)}%` }}
                    >
                      <div className="text-center">
                        <p className="font-bold">{f.signed}</p>
                        <p className="text-xs opacity-80">签收 {(f.signRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-dark-700 bg-dark-800/50">
                    <div className="flex gap-2 p-3 border-b border-dark-700">
                      {(['warranties', 'claims', 'repairs', 'visits'] as const).map((tab) => (
                        <button
                          key={tab}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            funnelDetailTab === tab
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFunnelDetailTab(tab);
                          }}
                        >
                          {tab === 'warranties' && '发卡明细'}
                          {tab === 'claims' && '申请明细'}
                          {tab === 'repairs' && '返修明细'}
                          {tab === 'visits' && '回访明细'}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {funnelDetailTab === 'warranties' && (
                        <table className="w-full">
                          <thead className="bg-dark-700/50 sticky top-0">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">质保卡号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">客户</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">机型</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">发卡日期</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">到期日期</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">状态</th>
                            </tr>
                          </thead>
                          <tbody>
                            {store.details.warranties.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-dark-500">
                                  暂无数据
                                </td>
                              </tr>
                            ) : (
                              store.details.warranties.map((w) => (
                                <tr key={w.id} className="border-t border-dark-700 hover:bg-dark-700/20">
                                  <td className="py-2 px-3 text-sm text-primary-400 font-mono">{w.cardNo}</td>
                                  <td className="py-2 px-3 text-sm text-white">{w.customerName}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{w.phoneModel}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{w.issueDate}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{w.expireDate}</td>
                                  <td className="py-2 px-3">
                                    <span className={`text-xs px-2 py-1 rounded-md ${
                                      w.status === 'active' ? 'bg-success-500/20 text-success-400' : 'bg-dark-600 text-dark-400'
                                    }`}>
                                      {w.status === 'active' ? '有效' : '已过期'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {funnelDetailTab === 'claims' && (
                        <table className="w-full">
                          <thead className="bg-dark-700/50 sticky top-0">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">申请单号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">质保卡号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">客户</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">故障描述</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">申请时间</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">是否保修</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">状态</th>
                            </tr>
                          </thead>
                          <tbody>
                            {store.details.claims.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-dark-500">
                                  暂无数据
                                </td>
                              </tr>
                            ) : (
                              store.details.claims.map((c) => (
                                <tr key={c.id} className="border-t border-dark-700 hover:bg-dark-700/20">
                                  <td className="py-2 px-3 text-sm text-warning-400 font-mono">{c.id}</td>
                                  <td className="py-2 px-3 text-sm text-primary-400 font-mono">{c.cardNo}</td>
                                  <td className="py-2 px-3 text-sm text-white">{c.customerName}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300 max-w-[200px] truncate">{c.faultDescription}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{c.submitDate}</td>
                                  <td className="py-2 px-3">
                                    {c.isCovered === null ? (
                                      <span className="text-dark-500 text-xs">-</span>
                                    ) : c.isCovered ? (
                                      <span className="text-xs px-2 py-1 rounded-md bg-success-500/20 text-success-400">是</span>
                                    ) : (
                                      <span className="text-xs px-2 py-1 rounded-md bg-danger-500/20 text-danger-400">否</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className={`text-xs px-2 py-1 rounded-md ${
                                      c.status === 'approved' ? 'bg-success-500/20 text-success-400' :
                                      c.status === 'rejected' ? 'bg-danger-500/20 text-danger-400' :
                                      'bg-warning-500/20 text-warning-400'
                                    }`}>
                                      {c.status === 'approved' ? '已通过' : c.status === 'rejected' ? '已拒保' : '待审核'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {funnelDetailTab === 'repairs' && (
                        <table className="w-full">
                          <thead className="bg-dark-700/50 sticky top-0">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">返修单号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">质保卡号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">客户</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">处理方案</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">费用</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">完成时间</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">签收状态</th>
                            </tr>
                          </thead>
                          <tbody>
                            {store.details.repairs.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-dark-500">
                                  暂无数据
                                </td>
                              </tr>
                            ) : (
                              store.details.repairs.map((r) => (
                                <tr key={r.id} className="border-t border-dark-700 hover:bg-dark-700/20">
                                  <td className="py-2 px-3 text-sm text-primary-400 font-mono">{r.id}</td>
                                  <td className="py-2 px-3 text-sm text-warning-400 font-mono">{r.cardNo}</td>
                                  <td className="py-2 px-3 text-sm text-white">{r.customerName}</td>
                                  <td className="py-2 px-3">
                                    <span className={`text-xs px-2 py-1 rounded-md ${
                                      r.solutionType === 'free_repair' ? 'bg-success-500/20 text-success-400' :
                                      r.solutionType === 'discount_exchange' ? 'bg-warning-500/20 text-warning-400' :
                                      'bg-danger-500/20 text-danger-400'
                                    }`}>
                                      {r.solutionType === 'free_repair' ? '免费维修' :
                                       r.solutionType === 'discount_exchange' ? '折价更换' : '拒保'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white font-medium">¥{r.cost.toLocaleString()}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{r.completeDate}</td>
                                  <td className="py-2 px-3">
                                    {r.customerSigned ? (
                                      <span className="text-xs px-2 py-1 rounded-md bg-success-500/20 text-success-400">
                                        已签收 {r.signDate}
                                      </span>
                                    ) : (
                                      <span className="text-xs px-2 py-1 rounded-md bg-warning-500/20 text-warning-400">
                                        待签收
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {funnelDetailTab === 'visits' && (
                        <table className="w-full">
                          <thead className="bg-dark-700/50 sticky top-0">
                            <tr>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">回访单号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">质保卡号</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">客户</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">回访内容</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">满意度</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">回访时间</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-dark-300">回访人</th>
                            </tr>
                          </thead>
                          <tbody>
                            {store.details.visits.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-dark-500">
                                  暂无数据
                                </td>
                              </tr>
                            ) : (
                              store.details.visits.map((v) => (
                                <tr key={v.id} className="border-t border-dark-700 hover:bg-dark-700/20">
                                  <td className="py-2 px-3 text-sm text-primary-400 font-mono">{v.id}</td>
                                  <td className="py-2 px-3 text-sm text-warning-400 font-mono">{v.cardNo}</td>
                                  <td className="py-2 px-3 text-sm text-white">{v.customerName}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300 max-w-[200px] truncate">{v.content}</td>
                                  <td className="py-2 px-3">{renderStars(v.satisfaction)}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{v.visitDate}</td>
                                  <td className="py-2 px-3 text-sm text-dark-300">{v.operator}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-danger-400" />
            拒保原因分布
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RechartsPieChart>
              <Pie
                data={stats.rejectReasons}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#86909C', strokeWidth: 1 }}
              >
                {stats.rejectReasons.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, _name: string, props: { payload: { reason: string } }) => [
                  `${value}次`,
                  props.payload.reason,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: '#86909C', fontSize: '12px' }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-success-400" />
            门店排行（按通过率）
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={sortedStoreRanking}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#272E3B" />
              <XAxis type="number" stroke="#86909C" tick={{ fill: '#86909C' }} domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <YAxis
                dataKey="store"
                type="category"
                stroke="#86909C"
                tick={{ fill: '#86909C', fontSize: 12 }}
                width={75}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '通过率']}
              />
              <Bar dataKey="rate" name="通过率" fill="#00B42A" radius={[0, 4, 4, 0]}>
                {sortedStoreRanking.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#FF7D00' : index === 1 ? '#86909C' : index === 2 ? '#F53F3F' : '#00B42A'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            质保剩余天数分布
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={daysDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272E3B" />
              <XAxis dataKey="range" stroke="#86909C" tick={{ fill: '#86909C', fontSize: 11 }} />
              <YAxis stroke="#86909C" tick={{ fill: '#86909C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#86909C' }} />
              <Bar dataKey="active" name="有效质保" stackId="a" fill="#165DFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expired" name="已过期" stackId="a" fill="#F53F3F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-400" />
              临期提醒（30天内到期）
            </h3>
            <span className="text-sm text-dark-300">共 {expiringWarranties.length} 条</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-dark-300 uppercase">质保卡号</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-dark-300 uppercase">客户</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-dark-300 uppercase">机型</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">剩余天数</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">到期日期</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {expiringWarranties.slice(0, 8).map((item) => {
                  const remainingDays = item.remainingDays || 0;
                  const isUrgent = remainingDays <= 7;
                  return (
                    <tr key={item.id} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-mono text-primary-400">{item.cardNo}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary-400" />
                          </div>
                          <span className="text-white text-sm">{item.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-dark-200 text-sm">{item.phoneModel}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-mono font-bold ${isUrgent ? 'text-danger-400' : 'text-warning-400'}`}>
                          {remainingDays}天
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-dark-300 text-sm">
                        {dayjs(item.expireDate).format('YYYY-MM-DD')}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          className="btn-primary py-1.5 px-3 text-xs"
                          onClick={() => handleSendReminder(item)}
                          disabled={sendingId === item.id}
                        >
                          {sendingId === item.id ? (
                            <span className="flex items-center gap-1">
                              <span className="animate-spin">⏳</span>
                              发送中
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              发送提醒
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {expiringWarranties.length === 0 && (
            <div className="text-center py-8 text-dark-400">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无临期质保卡</p>
            </div>
          )}
        </div>

        <div className="card p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-primary-400" />
              售后回访记录
            </h3>
            <span className="text-sm text-dark-300">最近 {recentVisits.length} 条</span>
          </div>
          <div className="space-y-4">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{visit.customerName}</p>
                      <p className="text-sm text-dark-400 font-mono">{visit.cardNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(visit.satisfaction)}
                  </div>
                </div>
                <p className="text-dark-200 text-sm mb-2 line-clamp-2">{visit.content}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-dark-400">
                    <Calendar className="w-3 h-3" />
                    {dayjs(visit.visitDate).format('YYYY-MM-DD')}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-dark-400">操作人：{visit.operator}</span>
                    {visit.followUp && (
                      <StatusBadge status={visit.followUp === '已完成' ? 'approved' : 'pending'} type="claim" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {recentVisits.length === 0 && (
            <div className="text-center py-8 text-dark-400">
              <PhoneCall className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无回访记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
